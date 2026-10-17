# M8 Phase 3: Baseline CER/WER (M7 OCR vs. Verified Reference)

**Type:** Measurement only. No OCR was re-run, no preprocessing, no OCR/app changes.  
**Machine-readable results:** `M8-baseline-cer-wer.json`  
**Reproduce:** `node validation/scripts/calculate-baseline-cer-wer.js` (deterministic; verified by running twice and comparing hashes)

---

## Provenance caveat (read first)

The reference text comes from `verified_text` in `ground-truth.json`. That field was populated from the **project owner's chat attestation** (2026-10-17) that all 12 records were human-verified. Details:

- The assistant could not independently confirm the review.
- Reviewer name, Hindi/Telugu fluency and per-record notes were **not recorded**.
- No corrections were reported, so `verified_text` equals `final_ai_visual_review.reviewed_text`.
- The original transcription and both AI review layers are preserved in the JSON.

Treat these numbers as measured against a user-attested reference. If a reviewer name, fluency statement or later corrections become available, update `ground-truth.json` and re-run the script.

---

## 1. Dataset

12 images: 8 Hindi (Devanagari), 4 Telugu. Total reference size: **436 characters, 72 words**. This is a small **exploratory validation dataset**, not a statistically representative benchmark of Indian street signs.

## 2. Reference and hypothesis

- **Reference:** `verified_text` (target-language text only; English and numerals excluded).
- **Hypothesis:** the stored M7 `ocr_text` from `ocr-validation-results.json` (Tesseract.js 4.1.4, `hin`/`tel`, full image, no preprocessing). The file is unchanged (hash-checked).

## 3. Normalization (applied identically to both sides; files on disk are not altered)

1. Unicode NFC
2. CRLF/CR converted to LF
3. Every whitespace run (spaces, tabs, newlines) collapsed to one space
4. Leading/trailing whitespace trimmed

Nothing else is removed or changed: matras, virama, anusvara, chandrabindu and punctuation are kept. There is no transliteration, case folding or linguistic correction.

## 4. Formulas

- **CER** = (S + D + I) / reference character count, using Levenshtein distance over Unicode code points.
- **WER** = (S + D + I) / reference word count, using Levenshtein distance over tokens.
- **Tokenization:** split the normalized text on single spaces.
- **Aggregates are corpus-level:** sum of edit distances / sum of reference units. The per-image mean is stored in the JSON for reference only and is not the corpus figure.

## 5. Per-image results

| Image | Ref chars | OCR chars | Char edits | CER | Ref words | OCR words | Word edits | WER | M7 conf. | M7 time (s) |
|---|---|---|---|---|---|---|---|---|---|---|
| hindi_01 | 31 | 65 | 38 | 1.2258 | 6 | 15 | 10 | 1.6667 | 38 | 2.11 |
| hindi_02 | 30 | 707 | 681 | 22.7000 | 5 | 207 | 203 | 40.6000 | 22 | 2.57 |
| hindi_03 | 5 | 633 | 628 | 125.6000 | 1 | 190 | 190 | 190.0000 | 18 | 1.81 |
| hindi_04 | 12 | 30 | 18 | 1.5000 | 2 | 6 | 5 | 2.5000 | 48 | 0.24 |
| hindi_05 | 27 | 680 | 662 | 24.5185 | 5 | 211 | 210 | 42.0000 | 22 | 1.78 |
| hindi_06 | 13 | 293 | 283 | 21.7692 | 2 | 84 | 84 | 42.0000 | 20 | 0.81 |
| hindi_07 | 46 | 81 | 48 | 1.0435 | 11 | 22 | 14 | 1.2727 | 54 | 0.66 |
| hindi_08 | 53 | 103 | 54 | 1.0189 | 10 | 21 | 15 | 1.5000 | 50 | 0.69 |
| telugu_01 | 16 | 488 | 472 | 29.5000 | 2 | 143 | 143 | 71.5000 | 30 | 3.83 |
| telugu_02 | 166 | 408 | 251 | 1.5120 | 23 | 74 | 63 | 2.7391 | 48 | 0.80 |
| telugu_03 | 12 | 316 | 306 | 25.5000 | 2 | 93 | 93 | 46.5000 | 39 | 0.85 |
| telugu_04 | 25 | 556 | 531 | 21.2400 | 3 | 175 | 175 | 58.3333 | 33 | 1.60 |

Full reference text, OCR text, normalized strings and S/D/I counts for every image are in the JSON.

## 6. Aggregate results (corpus-level)

| Group | Images | Ref chars | Char edits | **Corpus CER** | Ref words | Word edits | **Corpus WER** | Mean M7 confidence | Mean M7 time (s) |
|---|---|---|---|---|---|---|---|---|---|
| Hindi | 8 | 217 | 2,412 | **11.1152** | 42 | 731 | **17.4048** | 34.0 | 1.334 |
| Telugu | 4 | 219 | 1,560 | **7.1233** | 30 | 474 | **15.8000** | 37.5 | 1.770 |
| Combined | 12 | 436 | 3,972 | **9.1101** | 72 | 1,205 | **16.7361** | 35.2 | 1.479 |

Error-type totals (all 12 images):

| Unit | Substitutions | Deletions | Insertions |
|---|---|---|---|
| Characters | 42 | 3 | 3,927 |
| Words | 34 | 1 | 1,170 |

## 7. Interpretation

- **CER/WER above 1.0 are valid here.** Each is (S+D+I) divided by the reference length, and the number of insertions can exceed that length. Insertions make up about 98.9% of character edits (3,927 of 3,972) and about 97.1% of word edits (1,170 of 1,205). This is the M7 OCR output being compared with a reference that deliberately contains only the target-language text.
- **What drives the insertions:** the M7 OCR ran on the whole image. It emitted English text, numerals and background clutter as pseudo-Devanagari or Telugu characters. Examples are `hindi_03` (a 5-character reference against 633 OCR characters) and `telugu_01`. The reference excludes all of that by design.
- **Where the target text was recovered:** in the images with a simple, clean layout (`hindi_01`, `hindi_04`, `hindi_07`, `hindi_08`), the OCR text contains most of the reference text. For example `द्वारका मोड़` appears intact in `hindi_04`, but trailing noise still produces CER above 1.0.
- **Substitutions and deletions are few** (45 character edits in total), but that figure comes from alignment against very long, noisy hypotheses. It should not be read as a clean estimate of recognition quality on the target text alone.
- **Not accuracy.** CER and WER are error rates. This report makes no accuracy claim, and these numbers do not measure how well the OCR reads the target text in isolation. Lower CER/WER means fewer errors on this dataset only.
- **Tesseract confidence is a separate metric.** It is shown only for context. No claim is made that it predicts CER/WER, and no statistical test of that relationship was done.
- **Script detection is separate too.** All 12 images detected the expected script in M7. That only says the dominant script was found, not that the text is correct.
- **Scope:** 12 images, 2 languages, one OCR configuration. Do not generalize beyond this exploratory dataset.

## 8. Suggested follow-up (not done here)

Because whole-image OCR clutter dominates the error, later experiments could additionally report a **region-of-interest or text-only evaluation** (for example cropping to the target-language line). That would be a deliberate change to the protocol and must be recorded as such. It was not done here, and M7 stays the unmodified baseline.
