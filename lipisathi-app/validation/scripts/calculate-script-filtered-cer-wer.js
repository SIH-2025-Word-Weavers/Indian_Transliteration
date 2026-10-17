#!/usr/bin/env node
/**
 * M8 follow-up - script-filtered CER/WER (measurement only, no new OCR).
 *
 * Why: unfiltered CER/WER is dominated by insertions of text that is not the target script (Latin letters,
 * digits, punctuation, symbols). This metric asks a narrower question: among the TARGET-SCRIPT characters only,
 * how close is the OCR output to the verified reference?
 *
 * Filter (applied identically to reference and OCR text, per image language):
 *   Hindi  -> keep Devanagari U+0900-097F
 *   Telugu -> keep Telugu     U+0C00-0C7F
 *   U+200C / U+200D (ZWNJ/ZWJ) are deleted; every other non-kept, non-whitespace character becomes a space;
 *   then the normal normalization (NFC, whitespace collapse, trim) from calculate-baseline-cer-wer.js applies.
 *
 * What it does NOT remove: target-script text from the background/other signs, and misread characters. Those
 * still count as errors. It is NOT accuracy and NOT a replacement for the unfiltered numbers - report both.
 *
 * Output: validation/results/M8-script-filtered-cer-wer.json and .md (deterministic, no timestamps).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalize, tokenize, editOps } from './calculate-baseline-cer-wer.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const vdir = path.resolve(here, '..');
const GT = JSON.parse(fs.readFileSync(path.join(vdir, 'metadata/ground-truth.json'), 'utf8'));
const RUNS = JSON.parse(fs.readFileSync(path.join(vdir, 'results/M8-phase4-ocr-runs.json'), 'utf8'));
const UNF = JSON.parse(fs.readFileSync(path.join(vdir, 'results/M8-phase4-preprocessing-results.json'), 'utf8'));

if (GT.ground_truth.length !== 12 || GT.ground_truth.some((r) => !r.verified_text)) {
  console.error('Ground truth not fully verified; refusing to compute.');
  process.exit(1);
}

const RANGE = { Hindi: [0x0900, 0x097f], Telugu: [0x0c00, 0x0c7f] };
const round = (x) => Math.round(x * 1e6) / 1e6;
const mean = (a) => (a.length ? round(a.reduce((s, x) => s + x, 0) / a.length) : null);

export function scriptFilter(text, language) {
  const [lo, hi] = RANGE[language];
  let out = '';
  for (const ch of String(text ?? '').normalize('NFC')) {
    const cp = ch.codePointAt(0);
    if (cp === 0x200c || cp === 0x200d) continue;
    out += (cp >= lo && cp <= hi) || /\s/.test(ch) ? ch : ' ';
  }
  return normalize(out);
}

const ref = new Map(GT.ground_truth.map((r) => [r.image_id, r]));

function score(imageId, language, ocrText) {
  const nRef = scriptFilter(ref.get(imageId).verified_text, language);
  const nOcr = scriptFilter(ocrText, language);
  const rc = Array.from(nRef), oc = Array.from(nOcr);
  const rw = tokenize(nRef), ow = tokenize(nOcr);
  const c = editOps(rc, oc), w = editOps(rw, ow);
  return {
    reference_character_count: rc.length,
    OCR_character_count: oc.length,
    character_edit_distance: c.distance,
    character_substitutions: c.substitutions,
    character_deletions: c.deletions,
    character_insertions: c.insertions,
    CER: round(c.distance / rc.length),
    reference_word_count: rw.length,
    word_edit_distance: w.distance,
    WER: round(w.distance / rw.length),
  };
}

function aggregate(rows) {
  const sum = (k) => rows.reduce((s, r) => s + r[k], 0);
  const rC = sum('reference_character_count'), eC = sum('character_edit_distance');
  const rW = sum('reference_word_count'), eW = sum('word_edit_distance');
  return {
    runs: rows.length,
    total_reference_characters: rC,
    total_character_edit_distance: eC,
    corpus_CER: round(eC / rC),
    total_reference_words: rW,
    total_word_edit_distance: eW,
    corpus_WER: round(eW / rW),
    character_substitutions: sum('character_substitutions'),
    character_deletions: sum('character_deletions'),
    character_insertions: sum('character_insertions'),
    total_OCR_target_script_characters: sum('OCR_character_count'),
  };
}

const scored = RUNS.runs
  .filter((r) => r.ocr_status === 'success')
  .map((r) => ({ variant_id: r.variant_id, image_id: r.image_id, language: r.language, ...score(r.image_id, r.language, r.ocr_text) }));

const variants = RUNS.variants.map((v) => {
  const rows = scored.filter((r) => r.variant_id === v.id);
  const unf = UNF.variants.find((x) => x.id === v.id).overall;
  const base = new Map(scored.filter((r) => r.variant_id === 'full__original').map((r) => [r.image_id, r.CER]));
  let better = 0, worse = 0, same = 0;
  for (const r of rows) {
    const b = base.get(r.image_id);
    if (r.CER < b) better++; else if (r.CER > b) worse++; else same++;
  }
  return {
    id: v.id,
    filtered: aggregate(rows),
    filtered_Hindi: aggregate(rows.filter((r) => r.language === 'Hindi')),
    filtered_Telugu: aggregate(rows.filter((r) => r.language === 'Telugu')),
    unfiltered_corpus_CER: unf.corpus_CER,
    unfiltered_corpus_WER: unf.corpus_WER,
    images_lower_CER_than_full_original: better,
    images_higher_CER_than_full_original: worse,
    images_equal_CER_to_full_original: same,
  };
});

const out = {
  phase: 'M8 follow-up - script-filtered CER/WER',
  note: 'Target-script characters only, same filter on reference and OCR. Measurement only; not accuracy. Report together with the unfiltered numbers.',
  filter: 'Hindi: Devanagari U+0900-097F; Telugu: U+0C00-0C7F; ZWNJ/ZWJ deleted; other chars -> space; then NFC + whitespace collapse + trim',
  variants,
  per_run: scored,
};
const rdir = path.join(vdir, 'results');
fs.writeFileSync(path.join(rdir, 'M8-script-filtered-cer-wer.json'), JSON.stringify(out, null, 2) + '\n');

// markdown
const f = (x, d = 3) => Number(x).toFixed(d);
const L = [];
L.push('# M8 Follow-up - Script-Filtered CER/WER');
L.push('');
L.push('> Generated by `validation/scripts/calculate-script-filtered-cer-wer.js` from existing OCR output (no new OCR). Do not edit by hand.');
L.push('');
L.push('## What this measures');
L.push('');
L.push('Unfiltered CER/WER is dominated by insertions of non-target text (Latin letters, digits, punctuation, symbols). This version keeps **only target-script characters** (Devanagari for Hindi, Telugu for Telugu) in both the reference and the OCR text, then computes the usual corpus-level CER/WER.');
L.push('');
L.push('- It removes noise such as English text and digits. It does **not** remove target-script text from the scene (other signs, posters) or misread characters. Those still count as errors.');
L.push('- It is an error rate, not accuracy, on an exploratory 12-image set (reference text is user-attested as human verified). Read it alongside the unfiltered numbers and the word-recall diagnostic.');
L.push('');
L.push('## Corpus results by variant');
L.push('');
L.push('| Variant | Filtered CER | Filtered WER | Hindi CER | Telugu CER | Ins / del / sub | Target-script chars emitted | Unfiltered CER | Images lower CER than full__original |');
L.push('|---|---:|---:|---:|---:|---:|---:|---:|---:|');
for (const v of variants) {
  const a = v.filtered;
  L.push(`| ${v.id} | ${f(a.corpus_CER)} | ${f(a.corpus_WER)} | ${f(v.filtered_Hindi.corpus_CER)} | ${f(v.filtered_Telugu.corpus_CER)} | ${a.character_insertions} / ${a.character_deletions} / ${a.character_substitutions} | ${a.total_OCR_target_script_characters} | ${f(v.unfiltered_corpus_CER)} | ${v.images_lower_CER_than_full_original}/12 |`);
}
L.push('');
L.push(`Reference size after filtering: ${variants[0].filtered.total_reference_characters} characters, ${variants[0].filtered.total_reference_words} words.`);
L.push('');
L.push('## Per-image filtered CER');
L.push('');
L.push('| Image | ' + variants.map((v) => v.id).join(' | ') + ' |');
L.push('|---|' + variants.map(() => '---:').join('|') + '|');
for (const id of [...ref.keys()]) {
  L.push(`| ${id} | ` + variants.map((v) => f(scored.find((r) => r.variant_id === v.id && r.image_id === id).CER, 2)).join(' | ') + ' |');
}
L.push('');
fs.writeFileSync(path.join(rdir, 'M8-script-filtered-cer-wer.md'), L.join('\n'));
console.log('Wrote validation/results/M8-script-filtered-cer-wer.{json,md}');
for (const v of variants) {
  console.log(v.id.padEnd(28), 'filtered CER', f(v.filtered.corpus_CER), 'WER', f(v.filtered.corpus_WER), '| ins/del/sub', v.filtered.character_insertions, v.filtered.character_deletions, v.filtered.character_substitutions, '| emitted', v.filtered.total_OCR_target_script_characters, '| unfilt CER', f(v.unfiltered_corpus_CER), '| Hi', f(v.filtered_Hindi.corpus_CER), 'Te', f(v.filtered_Telugu.corpus_CER), '| lower', v.images_lower_CER_than_full_original);
}
