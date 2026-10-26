# M8 Follow-up - Telugu Signs Analysis

Figures: `M8-telugu-signs-cer-wer.md` / `.json` (reproduce: `SB_META=telugu-signs-ground-truth.json SB_RUNS=M8-telugu-signs-ocr-runs.json SB_OUT=M8-telugu-signs-cer-wer node validation/scripts/calculate-signboard-cer-wer.js`). OCR text: `M8-telugu-signs-ocr-runs.json`. The images (an owner-provided folder, license and source unknown) are not stored in the repo.

## 1. Setup

- 14 clean Telugu signs selected from a 50-image folder (the rest were book covers, newspaper pages, a map, etc., or had dense or illegible text). 10 dev, 4 held-out; the split rule was fixed before OCR. No repeat photos of the same sign.
- References: the project owner **attested** all 14 AI-drafted texts as correct on 2026-10-25 ("all are correct"), with no corrections. Name, **Telugu fluency (asked, not stated)** and per-record notes were not recorded. The drafts were written by an AI reading the images, including 3 medium-confidence and 1 low-confidence ones (`te_013`, `te_030`, `te_048`, `te_044`), so reading errors in the references cannot be ruled out.
- Two variants through the unmodified OCR pipeline (Tesseract.js 4.1.4, `tel`, the app's default model, the CDN `.../4.0.0/` path; earlier labelled "tessdata_fast", which was wrong, see `M8-closure-summary.md`): whole image as uploaded, and sign box. **The boxes are AI-estimated** (no annotations came with these images) and were checked by overlaying on each image. No EXIF rotation applies to these files.
- The images are small (mostly 1280 px wide), so the sign crops are small too (for example 1101x132 for a one-line board).

## 2. Results (corpus-level error rates, lower is better; not accuracy)

| Variant | CER | WER | Filtered CER | Reference words found | OCR chars emitted | Mean time |
|---|---:|---:|---:|---:|---:|---:|
| whole image | 15.12 | 36.98 | 11.21 | 2/41 | 4,981 | 1.54 s |
| sign box | 2.91 | 6.02 | 2.11 | 1/41 | 1,001 | 0.27 s |

Held-out (4 signs): CER 15.00 (whole) vs 4.16 (box); 0 of 6 reference words found by either variant. The box had a lower CER than the whole image for 10 of 14 signs, higher for 3 (`te_013`, `te_030`, `te_046`), and equal for 1.

## 3. What this shows

1. **Telugu OCR essentially fails on these signs.** Exact word recall is 2/41 (whole) and 1/41 (box). Three crops returned **no text at all** (`te_002`, `te_032`, `te_040`), including clean, high-contrast station and train boards. Only 1 of 14 crops has CER below 1.0 (`te_013`, 0.71).
2. **Part of the failure is near-misses that exact matching cannot credit.** Examples: `te_010` read as "కంళర్థపాలెం" (reference "కంచర్లపాలెం"), and `te_013` read as "శ్రీనివాసనగశ్‌ బ్లాంక్‌కాలనీ రోడ్‌.1" (reference "శ్రీనివాసనగర్. బ్యాంక్ కాలనీ. రోడ్-1"). Several characters are right, a few are wrong, and Tesseract adds virama/zero-width joiner characters that the references do not have. Exact-word recall is therefore harsh for Telugu; this does not mean no characters are read. The edit-based numbers capture partial credit, but the long gibberish outputs make "reading errors" unreliable here.
3. **Cropping lowers CER again** (15.1 to 2.9), consistent with Hindi, mostly by removing clutter output. With a reference this small (295 filtered characters) and outputs that are mostly noise, no stronger claim is supportable.
4. **Combined with the first 12-image study**, whose 4 Telugu images already had crop CER of about 1.2-1.4, the picture is consistent: the Telugu model read little of what was on the signs.

## 4. What this does not show

- It does not show Tesseract can never read Telugu signs. Possible contributing factors (the model size and 2x upscale were tested afterwards, see `M8-closure-summary.md`: neither helped): the model; small low-resolution crops; no upscaling or other image preparation; Telugu conjunct characters; the web-sourced, compressed images.
- The 14 signs are mostly station and place-name boards, not a representative sample of Telugu signage. No confidence intervals, one run per cell.
- AI-drafted references with owner attestation and no recorded fluency (section 1).

## 5. Recommendations

1. **Do not claim the app reads Telugu signs reliably.** On this evidence it does not, and the app's Telugu capability should be described as unproven, with this limitation stated.
2. **Test the OCR model next, not preprocessing**, for Telugu: `tessdata_best` (or another Telugu model) versus the default, on this same set. **Done afterwards in the closure experiments: `tessdata_best` did not help (see `M8-closure-summary.md`).**
3. **A small, cheap test on these same crops: upscaling the crop** (small inputs may be the problem). Earlier Hindi whole-image tests showed upscaling hurt, but small crops differ, so test it separately and do not assume.
4. Add a **character-level partial-credit measure** for Telugu (for example, per-sign character match rate after removing joiners) in addition to exact word recall, so near-misses are visible.
5. Get a **fluent Telugu reviewer** to re-check the 4 medium/low-confidence references and record their name and fluency.
