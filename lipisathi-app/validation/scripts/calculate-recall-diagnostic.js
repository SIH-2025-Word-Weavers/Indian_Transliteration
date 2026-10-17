#!/usr/bin/env node
/**
 * M8 Phase 6 - reference word-recall diagnostic (measurement only, no new OCR).
 *
 * CER/WER are dominated by insertions here, so they mostly measure how much extra text OCR emits.
 * This adds a measure that clutter does NOT inflate:
 *   word recall = fraction of reference words (multiset) that appear anywhere in the OCR output.
 * Caveat: recall rewards emitting more text (long output can match words by chance), so it must be read
 * together with the number of characters emitted, never alone. It is NOT accuracy.
 *
 * Output: validation/results/M8-phase4-recall-diagnostic.json (deterministic, no timestamps).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalize, tokenize } from './calculate-baseline-cer-wer.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const rdir = path.resolve(here, '../results');
const GT = JSON.parse(fs.readFileSync(path.resolve(here, '../metadata/ground-truth.json'), 'utf8'));
const RUNS = JSON.parse(fs.readFileSync(path.join(rdir, 'M8-phase4-ocr-runs.json'), 'utf8'));
const SCORES = JSON.parse(fs.readFileSync(path.join(rdir, 'M8-phase4-preprocessing-results.json'), 'utf8'));

const ref = new Map(GT.ground_truth.map((r) => [r.image_id, normalize(r.verified_text)]));
const lang = new Map(GT.ground_truth.map((r) => [r.image_id, r.language]));
const round = (x) => Math.round(x * 1e6) / 1e6;

function wordHits(refText, ocrText) {
  const pool = new Map();
  for (const w of tokenize(normalize(ocrText))) pool.set(w, (pool.get(w) || 0) + 1);
  const words = tokenize(refText);
  let hit = 0;
  for (const w of words) {
    if ((pool.get(w) || 0) > 0) { hit++; pool.set(w, pool.get(w) - 1); }
  }
  return { hit, total: words.length };
}

function recall(rows) {
  let hit = 0, total = 0;
  for (const r of rows) {
    const w = wordHits(ref.get(r.image_id), r.ocr_text);
    hit += w.hit; total += w.total;
  }
  return { reference_words: total, reference_words_found: hit, word_recall: round(hit / total) };
}

const out = {
  phase: 'M8 Phase 6 - word recall diagnostic',
  note: 'Multiset of reference words found anywhere in the OCR output. Rewards emitting more text; read with OCR chars emitted. Not accuracy.',
  variants: SCORES.variants.map((v) => {
    const rows = RUNS.runs.filter((r) => r.variant_id === v.id && r.ocr_status === 'success');
    return {
      id: v.id,
      overall: recall(rows),
      Hindi: recall(rows.filter((r) => lang.get(r.image_id) === 'Hindi')),
      Telugu: recall(rows.filter((r) => lang.get(r.image_id) === 'Telugu')),
      ocr_chars_emitted: v.overall.total_OCR_characters,
      corpus_CER: v.overall.corpus_CER,
    };
  }),
};
fs.writeFileSync(path.join(rdir, 'M8-phase4-recall-diagnostic.json'), JSON.stringify(out, null, 2) + '\n');
console.log('Wrote validation/results/M8-phase4-recall-diagnostic.json');
for (const v of out.variants) {
  console.log(v.id.padEnd(28), 'word recall', v.overall.word_recall.toFixed(3), `(${v.overall.reference_words_found}/${v.overall.reference_words})`, 'Hi', v.Hindi.word_recall.toFixed(3), 'Te', v.Telugu.word_recall.toFixed(3), 'emitted', v.ocr_chars_emitted);
}
