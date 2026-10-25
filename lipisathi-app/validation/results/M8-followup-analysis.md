# M8 Follow-up - Script-Filtered Analysis and Next Data Needs

Companion to `M8-phase6-analysis.md`. Numbers come from `M8-script-filtered-cer-wer.json` (reproduce with `node validation/scripts/calculate-script-filtered-cer-wer.js`; no new OCR was run).

## 1. What was checked

The Phase 6 conclusion rested on unfiltered CER/WER, which is dominated by non-target text (English, digits, punctuation). The question here: **if only target-script characters are scored, does any preprocessing show a real reading improvement?**

Note on the ground truth: `verified_text` already contains only the target-script sign text (no English or background text). So a separate "sign-only ground truth" did not need to be created for these 12 images. What had to change was the *hypothesis side*: the filter removes non-target-script characters from the OCR output.

## 2. Result

Reference after filtering: 420 characters, 73 words (the filter splits some punctuation-joined tokens, so the word count differs by one from the unfiltered 72).

| Variant | Filtered CER | Filtered WER | Substitutions + deletions ("reading errors") | Insertions |
|---|---:|---:|---:|---:|
| full__original | 6.612 | 12.397 | 44 (10.5% of ref chars) | 2733 |
| full__grayscale | 5.498 | 10.658 | 77 (18.3%) | 2232 |
| full__contrast_stretch | 4.767 | 9.274 | 82 (19.5%) | 1920 |
| full__upscale2x | 15.983 | 30.548 | 94 (22.4%) | 6619 |
| sign_crop__original | 1.231 | 2.260 | 56 (13.3%) | 461 |
| sign_crop__grayscale | 0.962 | 1.644 | 82 (19.5%) | 322 |
| sign_crop__contrast_stretch | 1.114 | 2.164 | 72 (17.1%) | 396 |
| sign_crop__upscale2x | 3.710 | 7.123 | 60 (14.3%) | 1498 |

## 3. What it shows

1. **Filtering helps but does not change the picture.** Removing non-target-script characters cuts whole-image insertions by about 30% (3927 -> 2733 for the baseline), yet whole-image output is still mostly extra target-script text. That is text from other signs and posters, or glyphs Tesseract produces from textures. Filtering by script cannot fix this; isolating the sign can.
2. **The sign crop is again the dominant effect** (filtered CER 6.61 -> 1.23 on original pixels), consistent with Phase 6.
3. **Preprocessing lowers insertions but raises reading errors.** In every preprocessing variant, substitutions plus deletions are at or above the unprocessed counterpart in the same condition (whole image: 44 -> 77/82/94; crop: 56 -> 82/72/60). That agrees with the word-recall result, where no preprocessing found more reference words. So the lower CER of grayscale and contrast stretch comes from emitting less text, not from reading the sign better.
4. **Caveat on that comparison:** with very long outputs the alignment can match reference characters by chance, which lowers substitution/deletion counts for the longer (usually unprocessed) outputs. So the reading-error gap is probably overstated in favour of unprocessed images. The honest reading is: **no evidence preprocessing improves reading, and some hint that it may hurt it.** Neither is established with 12 images and single runs.
5. `sign_crop__grayscale` still has the lowest filtered CER (0.96), but the cause is fewer insertions (322 vs 461), paired with more reading errors (82 vs 56).

## 4. Recommendation (unchanged, now better supported)

- Do not add grayscale / contrast / upscale to production OCR on this evidence.
- Pursue **sign isolation** (user-selected crop first, because it needs no model). Evaluate it with the script-filtered metric **and** the unfiltered one.

## 5. What cannot be done from the current data

More images are needed before any further conclusion, and I can't create them: they must be real photos with transcriptions that a human has verified.

Suggested next dataset (needs the project owner to supply the photos):

- 30-50 street-sign photos, Hindi and Telugu roughly balanced, varied lighting, angle, distance and sign type.
- A held-out portion (for example 10-15 images) not used when choosing methods.
- For each image: the file under `validation/dataset/`, a record in `metadata/ground-truth.json` with `verified_text` (target-script sign text only) and a reviewer, and a crop box in `metadata/sign-crop-regions.json`.
- Then re-run `m8-preprocessing-ocr.spec.js` and the three calculate/render scripts. Note: the scripts currently check for exactly 12 records, so the count check must be updated when the dataset grows.

## 5b. Update: signboard Hindi extension (status: waiting for human verification)

A downloaded signboard dataset (200 photos with signboard bounding boxes, no transcriptions, no license file) was triaged visually. It contains **no Telugu**, roughly 60 images with Hindi and about a third Tamil. From it, 31 clean single-box Hindi signs were selected (one photo per physical sign; 21 dev, 10 held-out, split rule fixed before OCR).

- Metadata: `metadata/signboard-hindi-ground-truth.json`. Texts there are **AI drafts, not human verified** (`ai_draft_pending_human_verification`). The images are external and are not in the repo (license unknown).
- OCR capture is done: 3 variants x 31 signs = 93 runs, all successful (`results/M8-signboard-ocr-runs.json`). Variants: `full__raw` (file as uploaded), `full__oriented` (EXIF rotation applied), `sign_box__oriented` (dataset box crop).
- **No CER/WER has been computed.** `scripts/calculate-signboard-cer-wer.js` refuses to run until every record is human verified.
- Descriptive only, no reference needed: whole 12-megapixel photos produce about 5,000 characters of output each (mean 5,074 raw / 5,021 oriented) and take about 19-22 s, versus about 206 characters and 0.8 s for the box crop. Mean Tesseract confidence is 19 for whole photos and 31 for the crop. These are output-size and speed facts, not accuracy.

## 6. Limitations

Same as `M8-phase6-analysis.md`: 12 images, 73 reference words, one run per cell, attested (not independently recorded) human verification, hand-drawn crops, system Chrome instead of bundled Chromium. The filter only handles script; it does not distinguish the target sign from other target-script text.
