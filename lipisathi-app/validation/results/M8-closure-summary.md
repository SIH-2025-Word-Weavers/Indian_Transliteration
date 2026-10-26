# M8 Closure Summary - OCR quality experiments (exploratory first round)

Date: 2026-10-26. Branch `feature/lipisathi-rebuild`. App code (`src/`), OCR configuration, dependencies and the M7 result files are unchanged. Everything here is measured through the existing app UI with Playwright (system Chrome). Datasets are small, external (license unknown, not stored in the repo), with owner-attested, AI-drafted references. CER/WER are error rates, **not accuracy**; values above 1 are valid because extra output counts as insertions.

Detail files: `M8-model-experiments-summary.md/.json` (model x upscale), `M8-model-<model>-<lang>-cer-wer.*` and `...-runs.json` (per-run data), `M8-exif-check-runs.json`, and the earlier `M8-*-analysis.md` files.

## 1. Correction: the model the app uses is not `tessdata_fast`

Every earlier M8 note (and the M7 documents) called the app's model `tessdata_fast`. That was copied from the M7 documentation and never verified. Observed in the browser, the app requests `https://tessdata.projectnaptha.com/4.0.0/<lang>.traineddata.gz`, and the response sizes match the plain `4.0.0` variant, not `4.0.0_fast` or `4.0.0_best`:

| Variant (path) | Telugu (gz) | Hindi (gz) |
|---|---:|---:|
| `4.0.0_fast` | 1,259,167 B | 922,758 B |
| **`4.0.0` (what the app loads)** | **1,744,266 B** | **1,401,691 B** |
| `4.0.0_best` | 7,337,061 B | 11,305,706 B |

M8 documents were corrected. The M7 files (`ocr-validation-results.md`, `browser-ocr-proof.md`) still say `tessdata_fast`; they were deliberately not edited (M7 results are frozen) and that label is inaccurate.

## 2. Experiments

Single-factor tests on the sign crop (sign box +5% padding, EXIF applied), all three models, both sets, two crop variants (as cropped, and 2x upscaled): 3 models x (14 Telugu + 31 Hindi) x 2 = 270 runs, 270 succeeded. Variants and models were fixed before running. The model was swapped inside the test by intercepting the model request (no change to `src/`); worker, core and models were served from local copies of the same versions so the run does not depend on CDN availability. **Control:** the default model with the as-cropped variant reproduced the earlier CDN-based results exactly on 45 of 45 images (the harness does not change OCR output).

### 2.1 Model: `tessdata_best` does not help, and is 4 to 8 times larger

Telugu (14 signs, 41 reference words, 295 filtered reference characters):

| Model | CER | Reading errors (sub+del) / ref chars | Reference words found | Chars emitted |
|---|---:|---:|---:|---:|
| fast | 2.72 | 135 / 295 | 2/41 | 944 |
| default (app) | 2.91 | 146 / 295 | 1/41 | 1001 |
| best | 2.95 | 145 / 295 | 1/41 | 1012 |

Hindi (31 signs, 194 reference words, 967 filtered reference characters):

| Model | CER | Reading errors / ref chars | Reference words found | Chars emitted | Mean time (local files) |
|---|---:|---:|---:|---:|---:|
| fast | 5.62 | 418 / 967 | 37/194 | 6534 | 0.68 s |
| default (app) | 5.42 | 379 / 967 | 49/194 | 6349 | 0.77 s |
| best | 5.23 | 377 / 967 | 44/194 | 6134 | 1.20 s |

- **Telugu: the three models are indistinguishable.** All read almost nothing, so the model is not what limits Telugu on these signs. (Paired per-image CER, best vs default: lower on 3, higher on 4, equal on 7.)
- **Hindi: `best` is not consistently better.** CER is 4% lower and `best` has a lower unfiltered CER on 19 of 31 images, but script-filtered CER is lower on 13 and higher on 14, and word recall is lower than the default (44 vs 49). That is within noise for 31 images and one run per cell.
- `fast` is slightly worse than the default for Hindi word recall (37 vs 49) but similar for CER.
- Cost of `best`: about 4x (Telugu) and 8x (Hindi) larger model downloads and about 1.6x slower recognition. **Not justified by this evidence.**

### 2.2 Upscaling the crop 2x: no benefit, more noise

| Set | CER as cropped (default model) | CER 2x upscaled | Chars emitted | Per-image CER: upscale lower / higher |
|---|---:|---:|---:|---|
| Telugu | 2.91 | 8.37 | 1001 -> 2807 | 0 / 11 (3 equal) |
| Hindi | 5.42 | 9.26 | 6349 -> 10425 | 10 / 19 (2 equal) |

Upscaling made the OCR emit about 1.6 to 2.8 times more text and the error rate rose on most images, for all three models. Reading errors (substitutions + deletions) barely moved. Telugu word recall went from 1/41 to 4/41, but that comes with 2.8 times more output and is exactly the case where recall rewards length, so it is not treated as a gain. **Do not add upscaling.**

### 2.3 EXIF orientation: the earlier hypothesis is withdrawn

The earlier suggestion (raw upload vs EXIF-corrected recovered 29 vs 46 words) was tested directly on 6 Hindi photos with EXIF orientation 6: (A) the original file, (B) the same file with only the EXIF segment removed (identical pixels, so the picture is sideways), and (C) the upright version from the earlier run.

| Input | Reference words found (of 40) | Chars emitted |
|---|---:|---:|
| A original (EXIF present) | 15 | 36,180 |
| B EXIF removed | 8 | 37,999 |
| C upright (canvas) | 15 | 36,258 |

- A reproduces the earlier raw-upload output exactly on 6/6 images (full-size OCR is deterministic), and A and B give **identical** text on 2 of 6 and different text on 4 of 6.
- The original upload behaves like the upright version, not like the sideways one. That is the **opposite** of the earlier hypothesis that the OCR path ignores EXIF.
- The earlier raw-vs-oriented gap is confounded: the "oriented" variant is re-encoded through a canvas to PNG, and images that need no rotation (orientation 1, n=5) also differ (0 vs 4 words found).
- n = 6, and word recall on 30,000+ characters of mostly noise is unreliable, so this does **not** establish that EXIF is handled. It only shows that the earlier claim has no support. Not actionable now. Practical rule for M9: if the app adds a crop step, draw the crop from the browser-decoded image (browsers apply EXIF), which makes orientation a non-issue.

## 3. What M8 supports, in order of strength

1. **Isolating the sign before OCR is by far the biggest effect** (Hindi: crop CER 5.4 vs 144 for the whole oriented photo, lower on 31 of 31 images and about 25x faster; Telugu: lower on 10 of 14). Replicated on two datasets (12 + 31 Hindi, 14 Telugu).
2. **Whole phone photos are unusable as OCR input** (about 5,000 characters of output for a few dozen reference characters).
3. **Hindi crops are readable only partly**: word recall about 25%, and only 6 of 31 crops have CER below 1.
4. **Telugu is unproven and, on these 14 signs, nearly nothing is read**, regardless of model (fast/default/best) or 2x upscale.
5. **Grayscale, contrast stretch, 2x upscale (whole image and crop), and `tessdata_best` showed no demonstrated reading gain.**

## 4. What M8 does not support

- Any accuracy claim, or any claim that the app works on street signs in general. The sets are small and not representative.
- That Telugu OCR cannot work. Untested levers: other Telugu models, `psm` modes, text-line segmentation, larger/cleaner photos, more verified data.
- That crops come from an automatic detector. Hindi boxes came from the dataset annotations and Telugu boxes were AI-estimated and overlay-checked; the app has no sign detection or crop UI yet.
- That the references are independently verified: they are AI drafts with owner attestation (fluency not recorded; 4 Telugu references flagged uncertain).
- That `tessdata_best` or upscaling are bad in general; only that they did not help here.

## 5. Limitations

14 Telugu and 31 Hindi signs, one run per cell, no confidence intervals. AI-drafted, owner-attested references. Timing measured with locally served model files (excludes download), so it is not comparable with the earlier runs that included the CDN fetch. System Chrome rather than bundled Chromium (the bundled browser cannot be downloaded here because of a TLS certificate error; certificate verification was not disabled). Exploratory results, not a benchmark.

## 6. Reproduction

Models are downloaded once with `curl` to a local folder (`M8_MODEL_DIR`, default `/tmp/m8models/{default,fast,best}/`, files `hin|tel.traineddata.gz` from `tessdata.projectnaptha.com/4.0.0`, `4.0.0_fast`, `4.0.0_best`). Then, per model and set: `SB_MODEL=<m> SB_META=<meta>.json SIGNBOARD_DATASET_DIR=<images> npx playwright test validation/scripts/m8-model-experiments.spec.js`, then `SB_META=... SB_RUNS=M8-model-<m>-<lang>-runs.json SB_OUT=M8-model-<m>-<lang>-cer-wer node validation/scripts/calculate-signboard-cer-wer.js`, then `node validation/scripts/summarize-model-experiments.js`. EXIF check: `m8-exif-check.spec.js`. A Playwright config that selects system Chrome is needed on machines where the bundled browser cannot be installed.
