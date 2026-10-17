# M8 Phase 6 - Analysis and Recommendations

Status: exploratory result on 12 images. Figures come from `M8-baseline-cer-wer.json`, `M8-phase4-preprocessing-results.json` and `M8-phase4-recall-diagnostic.json` (reproducible with the scripts in `validation/scripts/`).

## 1. Question

Does simple image preprocessing (grayscale, contrast stretch, 2x upscaling), with or without cropping to the sign, improve Tesseract.js OCR of street-sign photos (8 Hindi, 4 Telugu) in the existing LipiSathi pipeline?

## 2. Summary of findings

1. **Baseline OCR on whole photos is dominated by clutter.** Corpus CER 9.11 / WER 16.74. About 99% of character edits are insertions: Tesseract reads text from the whole scene (buildings, vehicles, English signage), not just the sign.
2. **Cropping to the sign lowers CER/WER a lot** (CER 9.11 -> 2.28 on the original pixels), because far less extra text is emitted. This is clutter removal, not better reading. The crops were drawn by hand.
3. **Grayscale / contrast stretch show no demonstrated recognition gain.**
   - Whole image: corpus CER fell (9.11 -> 7.45 / 6.47), but only 7 of 12 images improved and 5 got worse, and reference **word recall went down** (39/72 -> 35/72 and 33/72). Lower CER came with less emitted text, not with more of the sign being read.
   - Sign crop: grayscale gave the lowest CER of all variants (1.72), but word recall was 39/72 vs 40/72 for the unprocessed crop. That is no gain in words recovered.
4. **2x upscaling hurt** in both conditions: more emitted text, higher CER/WER, lower recall on whole images, slower.
5. **Tesseract confidence** moved by only a few points and did not track CER.
6. **Control passed:** an untouched re-run reproduced the stored M7 OCR text for 12/12 images, so the comparisons are not noise from the harness. They are still single runs per cell.

## 3. Key numbers

| Variant | Corpus CER | Corpus WER | Ref. word recall (of 72) | OCR chars emitted |
|---|---:|---:|---:|---:|
| full__original (baseline) | 9.110 | 16.736 | 39 (54%) | 4360 |
| full__grayscale | 7.454 | 13.819 | 35 (49%) | 3608 |
| full__contrast_stretch | 6.470 | 12.194 | 33 (46%) | 3174 |
| full__upscale2x | 21.087 | 39.736 | 27 (38%) | 9533 |
| sign_crop__original | 2.284 | 3.542 | 40 (56%) | 1363 |
| sign_crop__grayscale | 1.722 | 2.611 | 39 (54%) | 1104 |
| sign_crop__contrast_stretch | 1.931 | 3.278 | 40 (56%) | 1198 |
| sign_crop__upscale2x | 5.351 | 9.958 | 40 (56%) | 2699 |

Word recall = reference words found anywhere in the OCR output (multiset). It is clutter-insensitive but rewards emitting more text, so it is read together with chars emitted. It is not accuracy. By language, Hindi has 42 reference words and Telugu 30, so one word is about 2-3 points in a language subset.

Even the best variants find only about half of the reference words. Recognition quality itself is the limiting factor, and none of the tested preprocessing changed it measurably.

## 4. Best-performing method

- By **corpus CER/WER**: `sign_crop__grayscale` (1.72 / 2.61).
- By **recognition** (word recall): all four sign-crop variants and the unprocessed whole image are within 1 word of each other (39-40 of 72). **No method can be identified as better at reading the sign.**
- Therefore the best-performing label above applies to the error-rate metric only, and mostly reflects less clutter.

## 5. Recommendations

1. **Do not add grayscale, contrast stretch or upscaling to the production OCR path on this evidence.** There is no demonstrated recognition gain, upscaling is harmful, and the whole-image CER gains come from less emitted text.
2. **Treat sign isolation as the promising lever, as a hypothesis to test.** Candidates for a future milestone, in rough order of effort:
   - Let the user crop/select the sign region before OCR (small UI feature, no new model).
   - Automatic text-region detection (needs a dependency or model decision).
3. **Before the next experiment, fix the evaluation:**
   - Sign-only ground truth (exclude English and background text) so insertions stop dominating.
   - More images, with Hindi and Telugu balanced, and a held-out portion.
   - Repeated runs or a second engine/model configuration for context.
4. **Untested ideas** (not covered by this round): thresholding (Otsu/adaptive), denoising, deskew, sharpening, `tessdata_best`, page-segmentation modes, and restricting the script. Nothing here says they would or would not help.
5. Keep the reported metrics honest: say "CER/WER" (error rates), and state that this is a 12-image exploratory set.

## 6. Limitations and caveats

- **Tiny, non-representative set:** 12 images, 72 reference words. Differences of one or two words are within noise.
- **Single run per cell**, no confidence intervals, no significance testing.
- **Ground truth provenance:** `verified_text` rests on the project owner's attestation of human verification. Reviewer name, language fluency and per-record notes were not recorded. An AI visual review preceded it.
- **Metric limits:** CER/WER are inflated by insertions from non-target text; word recall is inflated by long outputs and uses exact word matches. Neither measures usefulness for a user.
- **Crops are manual**, were chosen with the images in view (before any OCR ran), and still include English text on the sign. They are not something the app can reproduce automatically yet.
- **Environment:** OCR ran in system Google Chrome (Playwright), not the bundled Chromium, because the browser download failed (TLS certificate error). The unprocessed re-run matched M7 for 12/12 images.
- **Scope:** only grayscale, a 1st-99th percentile linear contrast stretch, and 2x upscaling (high-quality canvas smoothing) were tried. Results do not generalise to other preprocessing parameters.

## 7. Reproduce

```
npx playwright test validation/scripts/m8-preprocessing-ocr.spec.js   # needs a Playwright-launchable browser; writes M8-phase4-ocr-runs.json
node validation/scripts/calculate-preprocessing-cer-wer.js
node validation/scripts/render-preprocessing-report.js
node validation/scripts/calculate-recall-diagnostic.js
```

Do not run `browser-ocr-proof.spec.js` for this: it overwrites the M7 result files.
