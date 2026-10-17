#!/usr/bin/env node
/**
 * M8 Phase 3 - Baseline CER/WER (measurement only)
 *
 * Reference  : ground-truth.json -> verified_text (user-attested human verification)
 * Hypothesis : ocr-validation-results.json -> ocr_text (M7, stored; OCR is NOT re-run)
 *
 * Normalization (applied identically to reference and hypothesis; raw text is never modified on disk):
 *   1. Unicode NFC
 *   2. CRLF / CR -> LF
 *   3. Every run of whitespace (spaces, tabs, newlines) -> single space
 *   4. Trim leading/trailing whitespace
 * Nothing else is removed or altered (no matra/virama/anusvara/chandrabindu/punctuation changes,
 * no transliteration, no linguistic correction, no case folding).
 *
 * CER: Levenshtein distance over Unicode code points / reference code-point count.
 * WER: Levenshtein distance over whitespace-split tokens / reference token count.
 * Aggregates are corpus-level (sum of edits / sum of reference units).
 *
 * Usage: node validation/scripts/calculate-baseline-cer-wer.js
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const validationDir = path.resolve(here, '..');
const GT_PATH = path.join(validationDir, 'metadata', 'ground-truth.json');
const M7_PATH = path.join(validationDir, 'results', 'ocr-validation-results.json');
const OUT_JSON = path.join(validationDir, 'results', 'M8-baseline-cer-wer.json');

export function normalize(text) {
  return String(text ?? '')
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

export const tokenize = (s) => (s === '' ? [] : s.split(' '));

/** Levenshtein with S/D/I breakdown (reference -> hypothesis). */
export function editOps(ref, hyp) {
  const n = ref.length;
  const m = hyp.length;
  const d = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) d[i][0] = i;
  for (let j = 0; j <= m; j++) d[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = ref[i - 1] === hyp[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  // Deterministic backtrace (preference: match/sub, then deletion, then insertion)
  let i = n, j = m, S = 0, D = 0, I = 0;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (ref[i - 1] === hyp[j - 1] ? 0 : 1)) {
      if (ref[i - 1] !== hyp[j - 1]) S++;
      i--; j--;
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) { D++; i--; }
    else { I++; j--; }
  }
  return { distance: d[n][m], substitutions: S, deletions: D, insertions: I };
}

const round = (x) => Math.round(x * 1e6) / 1e6;
const mean = (a) => (a.length ? round(a.reduce((s, x) => s + x, 0) / a.length) : null);

function aggregate(rows) {
  const refC = rows.reduce((s, r) => s + r.reference_character_count, 0);
  const edC = rows.reduce((s, r) => s + r.character_edit_distance, 0);
  const refW = rows.reduce((s, r) => s + r.reference_word_count, 0);
  const edW = rows.reduce((s, r) => s + r.word_edit_distance, 0);
  return {
    image_count: rows.length,
    total_reference_characters: refC,
    total_character_edit_distance: edC,
    corpus_CER: round(edC / refC),
    total_reference_words: refW,
    total_word_edit_distance: edW,
    corpus_WER: round(edW / refW),
    mean_per_image_CER_for_reference_only: mean(rows.map((r) => r.CER)),
    mean_per_image_WER_for_reference_only: mean(rows.map((r) => r.WER)),
    mean_m7_tesseract_confidence: mean(rows.map((r) => r.m7_tesseract_confidence)),
    mean_m7_processing_time_seconds: mean(rows.map((r) => r.m7_processing_time_seconds)),
  };
}

function main() {
  const gt = JSON.parse(fs.readFileSync(GT_PATH, 'utf8'));
  const m7 = JSON.parse(fs.readFileSync(M7_PATH, 'utf8'));

  // Gate: all 12 records must carry a verified_text and a human-verification status.
  const pending = gt.ground_truth.filter(
    (r) => !r.verified_text || !String(r.verification_status).startsWith('human_verified')
  );
  if (gt.ground_truth.length !== 12 || pending.length) {
    console.error('Ground truth not fully verified. Pending:', pending.map((r) => r.image_id));
    process.exit(1);
  }

  const m7ById = new Map(m7.results.map((r) => [r.image_id, r]));
  const rows = gt.ground_truth.map((g) => {
    const o = m7ById.get(g.image_id);
    if (!o) throw new Error(`Missing M7 result for ${g.image_id}`);
    const nRef = normalize(g.verified_text);
    const nOcr = normalize(o.ocr_text);
    const refChars = Array.from(nRef);
    const ocrChars = Array.from(nOcr);
    const refWords = tokenize(nRef);
    const ocrWords = tokenize(nOcr);
    const c = editOps(refChars, ocrChars);
    const w = editOps(refWords, ocrWords);
    return {
      image_id: g.image_id,
      filename: g.filename,
      language: g.language,
      reference_text: g.verified_text,
      OCR_text: o.ocr_text,
      normalized_reference: nRef,
      normalized_ocr: nOcr,
      reference_character_count: refChars.length,
      OCR_character_count: ocrChars.length,
      character_edit_distance: c.distance,
      character_substitutions: c.substitutions,
      character_deletions: c.deletions,
      character_insertions: c.insertions,
      CER: round(c.distance / refChars.length),
      reference_word_count: refWords.length,
      OCR_word_count: ocrWords.length,
      word_edit_distance: w.distance,
      word_substitutions: w.substitutions,
      word_deletions: w.deletions,
      word_insertions: w.insertions,
      WER: round(w.distance / refWords.length),
      m7_tesseract_confidence: o.ocr_confidence,
      m7_processing_time_seconds: o.ocr_processing_time_seconds,
      m7_detected_script: o.detected_script,
    };
  });

  const out = {
    phase: 'M8 Phase 3 - Baseline CER/WER',
    note: 'Measurement only. No OCR re-run, no preprocessing. Deterministic: contains no timestamps.',
    reference_source: 'ground-truth.json verified_text (human verification attested by the project owner; reviewer name/fluency not recorded)',
    hypothesis_source: 'validation/results/ocr-validation-results.json ocr_text (M7, unchanged)',
    normalization: [
      'Unicode NFC',
      'CRLF/CR -> LF',
      'all whitespace runs (incl. newlines) -> single space',
      'trim leading/trailing whitespace',
      'no other characters removed or changed',
    ],
    tokenization: 'split normalized text on single space (whitespace-delimited)',
    formulas: {
      CER: '(S + D + I) / reference character count (Unicode code points, after normalization)',
      WER: '(S + D + I) / reference word count (whitespace tokens, after normalization)',
      aggregation: 'corpus-level: sum(edit distance) / sum(reference units)',
    },
    dataset_summary: {
      total_images: rows.length,
      hindi_images: rows.filter((r) => r.language === 'Hindi').length,
      telugu_images: rows.filter((r) => r.language === 'Telugu').length,
      total_reference_characters: rows.reduce((s, r) => s + r.reference_character_count, 0),
      total_reference_words: rows.reduce((s, r) => s + r.reference_word_count, 0),
    },
    per_image: rows,
    by_language: {
      Hindi: aggregate(rows.filter((r) => r.language === 'Hindi')),
      Telugu: aggregate(rows.filter((r) => r.language === 'Telugu')),
    },
    combined: aggregate(rows),
  };

  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2) + '\n');
  console.log(`Wrote ${path.relative(process.cwd(), OUT_JSON)}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
