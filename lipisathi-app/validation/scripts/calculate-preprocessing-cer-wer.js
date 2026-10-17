#!/usr/bin/env node
/**
 * M8 Phase 4 - CER/WER per preprocessing variant (measurement only).
 *
 * Reference : ground-truth.json verified_text (user-attested human verification)
 * Hypothesis: M8-phase4-ocr-runs.json ocr_text (captured by m8-preprocessing-ocr.spec.js)
 * Uses the SAME normalization, tokenization, edit distance and corpus-level aggregation as
 * calculate-baseline-cer-wer.js (imported, not re-implemented).
 *
 * Also compares the full__original re-run against the stored M7 output (OCR re-run consistency control).
 *
 * Usage: node validation/scripts/calculate-preprocessing-cer-wer.js
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalize, tokenize, editOps } from './calculate-baseline-cer-wer.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const vdir = path.resolve(here, '..');
const GT = JSON.parse(fs.readFileSync(path.join(vdir, 'metadata/ground-truth.json'), 'utf8'));
const M7 = JSON.parse(fs.readFileSync(path.join(vdir, 'results/ocr-validation-results.json'), 'utf8'));
const RUNS = JSON.parse(fs.readFileSync(path.join(vdir, 'results/M8-phase4-ocr-runs.json'), 'utf8'));
const OUT = path.join(vdir, 'results/M8-phase4-preprocessing-results.json');

const round = (x) => (x === null ? null : Math.round(x * 1e6) / 1e6);
const mean = (a) => (a.length ? round(a.reduce((s, x) => s + x, 0) / a.length) : null);

if (GT.ground_truth.length !== 12 || GT.ground_truth.some((r) => !r.verified_text)) {
  console.error('Ground truth not fully verified; refusing to compute.');
  process.exit(1);
}
const ref = new Map(GT.ground_truth.map((r) => [r.image_id, r]));
const m7 = new Map(M7.results.map((r) => [r.image_id, r]));

function score(imageId, ocrText) {
  const nRef = normalize(ref.get(imageId).verified_text);
  const nOcr = normalize(ocrText);
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
    OCR_word_count: ow.length,
    word_edit_distance: w.distance,
    word_substitutions: w.substitutions,
    word_deletions: w.deletions,
    word_insertions: w.insertions,
    WER: round(w.distance / rw.length),
  };
}

function aggregate(rows) {
  const ok = rows.filter((r) => r.ocr_status === 'success');
  const sum = (k) => ok.reduce((s, r) => s + r[k], 0);
  const rC = sum('reference_character_count'), eC = sum('character_edit_distance');
  const rW = sum('reference_word_count'), eW = sum('word_edit_distance');
  return {
    image_count: rows.length,
    successful_runs: ok.length,
    total_reference_characters: rC,
    total_character_edit_distance: eC,
    corpus_CER: round(eC / rC),
    total_reference_words: rW,
    total_word_edit_distance: eW,
    corpus_WER: round(eW / rW),
    character_substitutions: sum('character_substitutions'),
    character_deletions: sum('character_deletions'),
    character_insertions: sum('character_insertions'),
    total_OCR_characters: sum('OCR_character_count'),
    mean_tesseract_confidence: mean(ok.map((r) => r.ocr_confidence).filter((x) => x !== null)),
    mean_processing_time_seconds: mean(ok.map((r) => r.ocr_processing_time_seconds).filter((x) => x !== null)),
  };
}

const scored = RUNS.runs.map((r) => ({
  ...r,
  ...(r.ocr_status === 'success' ? score(r.image_id, r.ocr_text) : {}),
}));

const baselineCorpus = (() => {
  const rows = M7.results.map((r) => ({ ocr_status: 'success', ocr_confidence: r.ocr_confidence, ocr_processing_time_seconds: r.ocr_processing_time_seconds, ...score(r.image_id, r.ocr_text) }));
  return aggregate(rows);
})();

const variants = RUNS.variants.map((v) => {
  const rows = scored.filter((r) => r.variant_id === v.id);
  const agg = aggregate(rows);
  const perImageCER = new Map(rows.map((r) => [r.image_id, r.CER]));
  const base = scored.filter((r) => r.variant_id === 'full__original');
  const baseCER = new Map(base.map((r) => [r.image_id, r.CER]));
  let better = 0, worse = 0, same = 0;
  for (const [id, cer] of perImageCER) {
    const b = baseCER.get(id);
    if (b === undefined || cer === undefined) continue;
    if (cer < b) better++; else if (cer > b) worse++; else same++;
  }
  return {
    ...v,
    overall: agg,
    Hindi: aggregate(rows.filter((r) => r.language === 'Hindi')),
    Telugu: aggregate(rows.filter((r) => r.language === 'Telugu')),
    vs_full_original_rerun: { images_lower_CER: better, images_higher_CER: worse, images_equal_CER: same },
  };
});

// Consistency control: re-run of untouched images vs stored M7 text.
const rerun = scored.filter((r) => r.variant_id === 'full__original');
const consistency = rerun.map((r) => ({
  image_id: r.image_id,
  identical_text_to_M7: r.ocr_text === m7.get(r.image_id).ocr_text,
  identical_after_normalization: normalize(r.ocr_text) === normalize(m7.get(r.image_id).ocr_text),
  m7_confidence: m7.get(r.image_id).ocr_confidence,
  rerun_confidence: r.ocr_confidence,
}));

const out = {
  phase: 'M8 Phase 4 - preprocessing CER/WER',
  note: 'Measurement only; deterministic given the captured runs (no timestamps).',
  reference_source: 'ground-truth.json verified_text (human verification attested by project owner; reviewer name/fluency not recorded)',
  hypothesis_source: 'validation/results/M8-phase4-ocr-runs.json',
  normalization_and_formulas: 'identical to calculate-baseline-cer-wer.js (NFC; whitespace runs -> single space; trim; Levenshtein over code points / whitespace tokens; corpus-level aggregation)',
  m7_stored_baseline_corpus: baselineCorpus,
  m7_rerun_consistency: {
    images_identical_to_M7_text: consistency.filter((c) => c.identical_text_to_M7).length,
    images_identical_after_normalization: consistency.filter((c) => c.identical_after_normalization).length,
    per_image: consistency,
  },
  variants,
  per_run: scored.map((r) => ({
    variant_id: r.variant_id,
    image_id: r.image_id,
    language: r.language,
    ocr_status: r.ocr_status,
    input_width: r.input_width,
    input_height: r.input_height,
    OCR_character_count: r.OCR_character_count,
    character_edit_distance: r.character_edit_distance,
    CER: r.CER,
    word_edit_distance: r.word_edit_distance,
    WER: r.WER,
    ocr_confidence: r.ocr_confidence,
    ocr_processing_time_seconds: r.ocr_processing_time_seconds,
    error: r.error,
  })),
};
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(`Wrote ${path.relative(process.cwd(), OUT)}`);
