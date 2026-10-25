#!/usr/bin/env node
/**
 * M8 follow-up - signboard CER/WER (measurement only).
 *
 * GATE: refuses to run unless EVERY record in signboard-hindi-ground-truth.json has verified_text and a
 * verification_status that starts with "human_verified". AI drafts are never used as a reference.
 *
 * Reference : verified_text      Hypothesis: results/M8-signboard-ocr-runs.json (ocr_text)
 * Metrics   : unfiltered and Devanagari-script-filtered corpus CER/WER (same normalization and edit distance as
 *             calculate-baseline-cer-wer.js), reading errors (substitutions + deletions), word recall,
 *             overall and per split (dev / held_out).
 * Output    : results/M8-signboard-cer-wer.json and .md (deterministic, no timestamps).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalize, tokenize, editOps } from './calculate-baseline-cer-wer.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const vdir = path.resolve(here, '..');
const META = JSON.parse(fs.readFileSync(path.join(vdir, 'metadata/signboard-hindi-ground-truth.json'), 'utf8'));
const RUNS = JSON.parse(fs.readFileSync(path.join(vdir, 'results/M8-signboard-ocr-runs.json'), 'utf8'));

const unverified = META.records.filter((r) => !r.verified_text || !String(r.verification_status).startsWith('human_verified'));
if (unverified.length) {
  console.error(`HUMAN VERIFICATION IS STILL PENDING for ${unverified.length}/${META.records.length} records. Refusing to compute CER/WER.`);
  process.exit(1);
}

const round = (x) => Math.round(x * 1e6) / 1e6;
const ref = new Map(META.records.map((r) => [r.image_id, r]));

const scriptFilter = (text) => {
  let out = '';
  for (const ch of String(text ?? '').normalize('NFC')) {
    const cp = ch.codePointAt(0);
    if (cp === 0x200c || cp === 0x200d) continue;
    out += (cp >= 0x0900 && cp <= 0x097f) || /\s/.test(ch) ? ch : ' ';
  }
  return normalize(out);
};

function wordHits(refText, ocrText) {
  const pool = new Map();
  for (const w of tokenize(ocrText)) pool.set(w, (pool.get(w) || 0) + 1);
  let hit = 0;
  const words = tokenize(refText);
  for (const w of words) if ((pool.get(w) || 0) > 0) { hit++; pool.set(w, pool.get(w) - 1); }
  return { hit, total: words.length };
}

function scoreOne(nRef, nOcr) {
  const rc = Array.from(nRef), oc = Array.from(nOcr);
  const rw = tokenize(nRef), ow = tokenize(nOcr);
  const c = editOps(rc, oc), w = editOps(rw, ow);
  const wr = wordHits(nRef, nOcr);
  return {
    ref_chars: rc.length, ocr_chars: oc.length,
    char_edits: c.distance, sub: c.substitutions, del: c.deletions, ins: c.insertions,
    CER: round(c.distance / rc.length),
    ref_words: rw.length, word_edits: w.distance, WER: round(w.distance / rw.length),
    words_found: wr.hit,
  };
}

const perRun = RUNS.runs.filter((r) => r.ocr_status === 'success').map((r) => {
  const verified = ref.get(r.image_id).verified_text;
  return {
    variant_id: r.variant_id, image_id: r.image_id, split: r.split,
    ocr_confidence: r.ocr_confidence, time_s: r.ocr_processing_time_seconds,
    unfiltered: scoreOne(normalize(verified), normalize(r.ocr_text)),
    filtered: scoreOne(scriptFilter(verified), scriptFilter(r.ocr_text)),
  };
});

const mean = (a) => (a.length ? round(a.reduce((s, x) => s + x, 0) / a.length) : null);
function agg(rows, key) {
  const s = (k) => rows.reduce((t, r) => t + r[key][k], 0);
  const rc = s('ref_chars'), rw = s('ref_words');
  return {
    runs: rows.length,
    ref_chars: rc, ref_words: rw,
    corpus_CER: round(s('char_edits') / rc), corpus_WER: round(s('word_edits') / rw),
    insertions: s('ins'), deletions: s('del'), substitutions: s('sub'),
    reading_errors_sub_plus_del: s('sub') + s('del'),
    ocr_chars_emitted: s('ocr_chars'),
    word_recall: round(s('words_found') / rw), words_found: s('words_found'),
  };
}

const variants = RUNS.variants.map((v) => {
  const rows = perRun.filter((r) => r.variant_id === v.id);
  const sub = (f) => rows.filter(f);
  return {
    id: v.id,
    all: { unfiltered: agg(rows, 'unfiltered'), filtered: agg(rows, 'filtered') },
    dev: { unfiltered: agg(sub((r) => r.split === 'dev'), 'unfiltered'), filtered: agg(sub((r) => r.split === 'dev'), 'filtered') },
    held_out: { unfiltered: agg(sub((r) => r.split === 'held_out'), 'unfiltered'), filtered: agg(sub((r) => r.split === 'held_out'), 'filtered') },
    mean_confidence: mean(rows.map((r) => r.ocr_confidence).filter((x) => x !== null)),
    mean_time_s: mean(rows.map((r) => r.time_s).filter((x) => x !== null)),
  };
});

function pairCompare(a, b, key) {
  const A = new Map(perRun.filter((r) => r.variant_id === a).map((r) => [r.image_id, r[key].CER]));
  const B = new Map(perRun.filter((r) => r.variant_id === b).map((r) => [r.image_id, r[key].CER]));
  let lower = 0, higher = 0, equal = 0;
  for (const [id, c] of A) { const o = B.get(id); if (c < o) lower++; else if (c > o) higher++; else equal++; }
  return { variant: a, versus: b, images_lower_CER: lower, images_higher_CER: higher, images_equal_CER: equal };
}
const comparisons = [
  pairCompare('full__oriented', 'full__raw', 'unfiltered'),
  pairCompare('sign_box__oriented', 'full__oriented', 'unfiltered'),
  pairCompare('sign_box__oriented', 'full__raw', 'unfiltered'),
  pairCompare('sign_box__oriented', 'full__oriented', 'filtered'),
];

const out = {
  phase: 'M8 follow-up - signboard CER/WER',
  reference_source: 'signboard-hindi-ground-truth.json verified_text',
  verification_provenance: META.human_verification ?? null,
  variants, comparisons,
  per_run: perRun,
};
const rdir = path.join(vdir, 'results');
fs.writeFileSync(path.join(rdir, 'M8-signboard-cer-wer.json'), JSON.stringify(out, null, 2) + '\n');

const f = (x, d = 3) => (x === null || x === undefined ? 'n/a' : Number(x).toFixed(d));
const L = ['# M8 Follow-up - Signboard (Hindi) CER/WER', '',
  '> Generated by `validation/scripts/calculate-signboard-cer-wer.js`. Do not edit by hand.', '',
  `Records: ${META.records.length} Hindi signs (dev ${META.records.filter((r) => r.split === 'dev').length}, held-out ${META.records.filter((r) => r.split === 'held_out').length}). Images are external (license unknown) and not in the repo. Reference = verified_text (see provenance in the metadata file). CER/WER are error rates, not accuracy. Exploratory, not a benchmark.`, '',
  '## All records', '',
  '| Variant | CER | WER | Filtered CER | Filtered WER | Reading errors (sub+del, filtered) | Word recall | OCR chars emitted | Mean conf | Mean time (s) |',
  '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|'];
for (const v of variants) {
  const u = v.all.unfiltered, g = v.all.filtered;
  L.push(`| ${v.id} | ${f(u.corpus_CER)} | ${f(u.corpus_WER)} | ${f(g.corpus_CER)} | ${f(g.corpus_WER)} | ${g.reading_errors_sub_plus_del} / ${g.ref_chars} | ${f(u.word_recall)} (${u.words_found}/${u.ref_words}) | ${u.ocr_chars_emitted} | ${f(v.mean_confidence, 1)} | ${f(v.mean_time_s, 2)} |`);
}
for (const [name, key] of [['Dev split', 'dev'], ['Held-out split', 'held_out']]) {
  L.push('', `## ${name}`, '', '| Variant | CER | WER | Filtered CER | Reading errors (sub+del, filtered) | Word recall |', '|---|---:|---:|---:|---:|---:|');
  for (const v of variants) {
    const u = v[key].unfiltered, g = v[key].filtered;
    L.push(`| ${v.id} | ${f(u.corpus_CER)} | ${f(u.corpus_WER)} | ${f(g.corpus_CER)} | ${g.reading_errors_sub_plus_del} / ${g.ref_chars} | ${f(u.word_recall)} (${u.words_found}/${u.ref_words}) |`);
  }
}
L.push('', '## Paired per-image comparisons (unfiltered CER unless noted)', '', '| Variant | versus | lower CER | higher CER | equal |', '|---|---|---:|---:|---:|');
comparisons.forEach((c, i) => L.push(`| ${c.variant}${i === 3 ? ' (filtered)' : ''} | ${c.versus} | ${c.images_lower_CER} | ${c.images_higher_CER} | ${c.images_equal_CER} |`));
L.push('', '## Per-image CER (unfiltered)', '', '| Image | split | ' + variants.map((v) => v.id).join(' | ') + ' |', '|---|---|' + variants.map(() => '---:').join('|') + '|');
for (const r of META.records) {
  L.push(`| ${r.image_id} | ${r.split} | ` + variants.map((v) => f(perRun.find((p) => p.variant_id === v.id && p.image_id === r.image_id)?.unfiltered.CER, 2)).join(' | ') + ' |');
}
L.push('');
fs.writeFileSync(path.join(rdir, 'M8-signboard-cer-wer.md'), L.join('\n'));
console.log('Wrote results/M8-signboard-cer-wer.{json,md}');
