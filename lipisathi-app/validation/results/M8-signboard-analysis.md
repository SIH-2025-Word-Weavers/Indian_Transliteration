# M8 Follow-up - Signboard (Hindi) Analysis

Figures: `M8-signboard-cer-wer.md` / `.json` (reproduce: `node validation/scripts/calculate-signboard-cer-wer.js`). OCR text: `M8-signboard-ocr-runs.json`. Images are external (license unknown) and not stored in the repo.

## 1. Setup

- 31 Hindi signs (21 dev, 10 held-out) from an external signboard dataset; the split rule was fixed before any OCR ran. One photo per physical sign. Signboard boxes come from the dataset's own annotations.
- References: `verified_text`, which the project owner **attested** on 2026-10-25 by replying "all correct" to all 31 AI-drafted texts, with no corrections. Reviewer name, fluency and per-record notes were not recorded. The drafts were written by an AI from visual reading, including 2 flagged low-confidence and 11 medium-confidence ones, so reading errors in the references cannot be ruled out.
- Three pre-specified variants through the unmodified OCR pipeline (Tesseract.js 4.1.4, `hin`, tessdata_fast): `full__raw` (file as uploaded), `full__oriented` (EXIF rotation applied, otherwise untouched), `sign_box__oriented` (dataset box +5% padding).
- No preprocessing methods were compared here, and no variant was chosen using the held-out set.

## 2. Results (corpus-level error rates, lower is better; not accuracy)

| Variant | CER | WER | OCR chars emitted | Word recall | Mean time |
|---|---:|---:|---:|---:|---:|
| full__raw | 146.05 | 258.42 | 157,068 | 29/194 (15%) | 19.0 s |
| full__oriented | 144.40 | 250.42 | 155,316 | 46/194 (24%) | 22.4 s |
| sign_box__oriented | 5.42 | 9.87 | 6,349 | 49/194 (25%) | 0.85 s |

By split, CER for `sign_box__oriented` versus `full__oriented`: dev 6.12 vs 159.40, held-out 4.38 vs 122.12. The crop had a lower CER than the whole oriented photo for **31 of 31** images (and lower filtered CER for 31 of 31).

## 3. What this supports

1. **Isolating the sign is a very large effect, and it replicates on 31 new images and on the held-out subset.** The crop cuts CER by about 96% and is roughly 25 times faster. Combined with the earlier 12-image result, the evidence for sign isolation is consistent across two independent sets.
2. **Whole phone photos are unusable as OCR input here.** Each emits about 5,000 characters of output (mean) for a few dozen characters of reference.

## 4. What it does not support

- **The crop is not "solved".** Crop CER is still 5.4, and only 6 of 31 crops have CER below 1.0 (`sb_006`, `sb_021`, `sb_028`, `sb_058`, `sb_069`, `sb_103`). The `hin` model reads English text, borders and edges inside the box as Devanagari gibberish (for example `sb_125`, `sb_172`), so insertions remain high. The script filter cannot remove this, because the noise is in the target script.
- **Word recall is only 25% even for the crop** (23/79 = 29% on held-out). Most reference words are not recovered, so recognition quality itself remains weak.
- **Whole-photo recall (24%) is not a recognition result.** Those runs emit about 5,000 characters per image, so many words match by chance. The crop reaches the same recall with 25 times less output, which suggests the crop is the one actually reading words, but this was not tested directly.
- **"Reading errors" (substitutions + deletions) are misleading here:** 379/967 for the crop versus 79/967 for whole photos. Long garbage outputs offer many chance alignments that hide misses. Do not read this as the whole photo reading better.

## 5. EXIF orientation (hypothesis, not proven)

At nearly identical output length (157k vs 155k characters), `full__oriented` recovered more reference words than `full__raw` (46 vs 29 of 194), and 19 of 31 images had a lower CER. That is consistent with the OCR path not applying EXIF rotation to phone photos (180 of the 200 dataset files carry EXIF orientation 6). I did not inspect how the app or Tesseract.js handles EXIF, so this needs a direct check (for example uploading a rotated copy and comparing) before anyone acts on it. It would matter for real users, because phone photos usually carry EXIF rotation.

## 6. Recommendations

1. **Make sign isolation the next product-facing step**: prototype a user-selected crop before OCR (no new model needed), and evaluate it on this set. That changes `src/`, so it needs your go-ahead.
2. **Test inside the crop, where the remaining error lives**, with controlled single-factor comparisons: adding English to the language (`hin+eng`) so English lines stop becoming Devanagari noise; page-segmentation modes; `tessdata_best`; tighter crops. These need OCR configuration changes, so they are out of scope until you approve.
3. **Check EXIF handling directly** (section 5) and normalise orientation before OCR if confirmed.
4. **Still missing: Telugu.** The signboard dataset has none. About 15-20 Telugu photos with human-verified text are needed to say anything about Telugu.
5. Do not add grayscale/contrast/upscale preprocessing (unchanged from the earlier analysis).

## 7. Limitations

31 Hindi signs, one run per cell, no confidence intervals. References are AI-drafted and owner-attested without recorded fluency or corrections. Boxes were produced by the dataset authors, not by an automatic detector, so real-world performance depends on how the app would obtain a crop. Crops still contain English text and sign borders. Tesseract `tessdata_fast`, system Chrome (not bundled Chromium). Dataset license is unknown. Exploratory results, not a benchmark.
