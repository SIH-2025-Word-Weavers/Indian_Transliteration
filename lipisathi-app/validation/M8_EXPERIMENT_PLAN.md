# M8: OCR Quality Improvement Experiments

**Milestone:** M8  
**Objective:** Design and execute controlled preprocessing experiments to improve OCR quality  
**Foundation:** M7 browser validation baseline (12 real street-sign images)

---

## Overview

M7 established a browser-based OCR validation baseline using the existing Tesseract.js v4.1.4 implementation on 12 real street-sign images. M8 builds on this foundation to systematically explore OCR preprocessing techniques and measure their impact using ground-truth evaluation.

**M8 Goal:** Move from execution success metrics toward measurable OCR quality using Character Error Rate (CER) and Word Error Rate (WER).

---

## M7 Baseline Summary

### M7 Results (Unpreprocessed Images)

| Metric | Value |
|--------|-------|
| **Images Processed** | 12/12 (100% execution success) |
| **Hindi Images** | 8/8 |
| **Telugu Images** | 4/4 |
| **Expected-Script Match** | 12/12 |
| **Tesseract Confidence (Mean)** | 35.2% |
| **Tesseract Confidence (Range)** | 18% - 54% |
| **Processing Time (Mean)** | 1.48s |
| **Processing Time (Range)** | 0.24s - 3.83s |

**Environment:**
- Browser: Chromium (Playwright)
- Tesseract.js: v4.1.4
- Traineddata: CDN-hosted, the library default path `tessdata.projectnaptha.com/4.0.0/` (**correction, 2026-10-26:** earlier labelled `tessdata_fast`; that was wrong, the default is neither `_fast` nor `_best`, verified by file size in `results/M8-closure-summary.md`)
- Languages: Hindi (`hin`), Telugu (`tel`)

**Limitation:** M7 reported Tesseract confidence but did not calculate OCR accuracy (CER/WER) due to lack of ground truth.

---

## M8 Phase 1: Ground-Truth Preparation

### Objective

Manually establish verified ground truth for all 12 validation images to enable accurate CER/WER calculation.

### Ground-Truth Definition

**Ground truth** = The actual visible target-language text in the image, transcribed character-for-character by a human expert.

**Rules:**
1. ✅ Transcribe only the **target-language** script text (Hindi/Telugu)
2. ✅ Use the **original script** (Devanagari for Hindi, Telugu script for Telugu)
3. ✅ Transcribe **character-for-character**, preserving:
   - Whitespace (spaces, line breaks where meaningful)
   - Punctuation visible in the image
   - Numerals if part of the text
4. ❌ **Do NOT** transcribe:
   - English text (unless it's the OCR target)
   - Background noise, symbols, or decorative elements
   - Text that is genuinely illegible or ambiguous
5. ❌ **Do NOT** infer or guess unreadable text
6. ❌ **Do NOT** use OCR output as ground truth

### Ground-Truth Status

**Current Status:** ✅ Established (2026-10-17) via project-owner attestation of human verification; see `metadata/ground-truth.json` and `M8_HUMAN_VERIFICATION.md`. Reviewer name/fluency not recorded.

Ground-truth transcription must be performed manually by a human who can read Hindi (Devanagari) and Telugu scripts fluently.

**Next Step:** Create ground-truth transcriptions for all 12 images in `validation/metadata/ground-truth.json`.

---

## M8 Phase 2: OCR Quality Metrics

### Character Error Rate (CER)

**Definition:**

```
CER = (Substitutions + Deletions + Insertions) / Total characters in ground truth
```

**Explanation:**
- **Substitutions:** OCR replaced character A with character B
- **Deletions:** OCR missed a character
- **Insertions:** OCR added an extra character
- **Total characters:** Length of ground-truth transcription

**Range:** 0.0 (perfect) to 1.0+ (poor)

**Interpretation:**
- CER = 0.00 → Perfect OCR (no errors)
- CER = 0.10 → 10% character error rate (good)
- CER = 0.30 → 30% character error rate (poor)
- CER > 1.00 → More errors than characters (very poor, OCR inserted many extra characters)

**Calculation Tool:** Levenshtein edit distance

---

### Word Error Rate (WER)

**Definition:**

```
WER = (Substitutions + Deletions + Insertions) / Total words in ground truth
```

**Explanation:**
- Same operations as CER, but applied to **words** instead of characters
- Word boundary: whitespace-separated tokens

**Range:** 0.0 (perfect) to 1.0+ (poor)

**Interpretation:**
- WER = 0.00 → Perfect OCR (no word errors)
- WER = 0.20 → 20% word error rate (reasonable)
- WER = 0.50 → 50% word error rate (poor)
- WER > 1.00 → More word errors than words

---

### Important Distinctions

#### Tesseract Confidence ≠ OCR Accuracy

| Metric | Source | Meaning | Range |
|--------|--------|---------|-------|
| **Tesseract Confidence** | Tesseract internal model | Model's self-assessed confidence | 0-100% |
| **CER** | Ground-truth comparison | Actual character-level error rate | 0.0-1.0+ |
| **WER** | Ground-truth comparison | Actual word-level error rate | 0.0-1.0+ |

**Key Point:** A Tesseract confidence of 35% does **NOT** mean 35% OCR accuracy. Confidence and accuracy are independent metrics.

#### M7 vs M8 Metrics

| Phase | Metrics Available |
|-------|------------------|
| **M7** | Tesseract confidence, execution success, expected-script match |
| **M8** | All M7 metrics + CER + WER (once ground truth is established) |

**Why M7 couldn't calculate CER/WER:** No ground-truth transcriptions existed.

---

## M8 Phase 3: Preprocessing Experiments

### Objective

Test candidate preprocessing techniques to determine which improve OCR quality (measured by CER/WER) on the 12-image validation dataset.

### Candidate Preprocessing Methods

#### 1. Baseline (Control)

- **Method:** Original image, no preprocessing
- **Purpose:** Control condition for comparison
- **Result:** M7 baseline OCR output

#### 2. Upscaling/Resizing

- **Method:** Resize image to larger dimensions (e.g., 2x, 3x)
- **Rationale:** Tesseract may perform better on larger text
- **Parameters to test:**
  - 2x scale
  - 3x scale
  - Fixed width (e.g., 3200px)

#### 3. Grayscale Conversion

- **Method:** Convert to grayscale before OCR
- **Rationale:** Remove color information, may reduce noise
- **Implementation:** Standard RGB → grayscale conversion

#### 4. Contrast Enhancement

- **Method:** Increase contrast between text and background
- **Rationale:** Make text more distinct
- **Parameters to test:**
  - Histogram equalization
  - Adaptive histogram equalization (CLAHE)
  - Gamma correction

#### 5. Sharpening

- **Method:** Apply sharpening filter
- **Rationale:** Enhance text edges
- **Parameters to test:**
  - Unsharp mask
  - Different sharpening strengths

#### 6. Thresholding/Binarization

- **Method:** Convert to binary (black/white) image
- **Rationale:** Simplify for OCR, remove noise
- **Parameters to test:**
  - Otsu's method (automatic threshold)
  - Adaptive thresholding
  - Manual threshold values

#### 7. Combined Preprocessing

- **Method:** Apply multiple preprocessing steps in sequence
- **Rationale:** Synergistic improvements
- **Example combinations:**
  - Grayscale → Contrast → Binarization
  - Upscale → Sharpen → Threshold
  - Grayscale → CLAHE → Adaptive Threshold

### Preprocessing Implementation

**Library:** OpenCV.js or similar image processing library

**Constraints:**
- Run in browser where possible (consistent with M7)
- If browser-based preprocessing is impractical, run in Node.js with same Tesseract.js v4.1.4
- Keep OCR engine/language/configuration constant
- Only change: image preprocessing method

---

## M8 Phase 4: Experimental Design

### Experimental Methodology

#### Control Variables (Held Constant)

✅ **Keep constant across all experiments:**
- Same 12-image validation dataset
- Same OCR engine: Tesseract.js v4.1.4
- Same traineddata: CDN-hosted default path `.../4.0.0/` (earlier mislabelled `tessdata_fast`; see the correction above)
- Same OCR languages: `hin` (Hindi), `tel` (Telugu)
- Same ground-truth transcriptions
- Same CER/WER calculation method
- Same browser/environment (Chromium via Playwright)

#### Independent Variable (Changed)

🔬 **Experimental variable:**
- Image preprocessing method

#### Dependent Variables (Measured)

📊 **Measured outcomes:**
1. **Primary:**
   - Character Error Rate (CER)
   - Word Error Rate (WER)
2. **Secondary:**
   - OCR execution success/failure
   - Tesseract confidence
   - Processing time
   - Detected script correctness

---

### Result Recording Structure

For each experiment run:

| Image ID | Preprocessing | OCR Text | CER | WER | Confidence | Time (s) | Script | Notes |
|----------|--------------|----------|-----|-----|------------|----------|--------|-------|
| hindi_01 | baseline | ... | 0.15 | 0.25 | 38% | 2.11 | ✓ Devanagari | ... |
| hindi_01 | grayscale | ... | 0.12 | 0.20 | 42% | 2.05 | ✓ Devanagari | Improved |
| hindi_01 | threshold | ... | 0.20 | 0.35 | 30% | 1.98 | ✓ Devanagari | Worse |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

**Storage Format:** JSON for structured data, Markdown for human-readable reports

---

### Comparison Analysis

#### Per-Image Comparison

For each image, compare all preprocessing methods:

**Best Method:** Method with **lowest CER**

**Metrics:**
- CER improvement vs. baseline
- WER improvement vs. baseline
- Processing time overhead

#### Aggregate Comparison

Across all 12 images:

**Metrics:**
- Mean CER per preprocessing method
- Mean WER per preprocessing method
- Success rate (images where method improved CER)
- Failure rate (images where method worsened CER)

**Best Overall Method:** Method with lowest mean CER across all 12 images

---

## Experimental Rules

### Scientific Integrity

✅ **Required practices:**
1. Record **all** results, including failures
2. Use the **same ground truth** for all methods
3. Report **actual measured** CER/WER, not estimates
4. Do NOT cherry-pick only successful images
5. Do NOT exclude "bad" results
6. Do NOT claim improvement unless supported by CER/WER data
7. Record preprocessing failures (e.g., image corruption, OCR crashes)
8. Document unexpected behavior

❌ **Prohibited practices:**
1. Fabricating CER/WER values
2. Changing ground truth between experiments
3. Excluding images that perform poorly
4. Claiming accuracy without ground truth
5. Reporting only best-case results

---

### Dataset Limitations

#### Sample Size

**12 images = exploratory validation, NOT statistically representative**

**Implications:**
- Results may not generalize to all street signs
- Small improvements (<5% CER) may be due to random variation
- Cannot claim "best preprocessing method for all Hindi/Telugu OCR"
- Results guide further investigation, not final conclusions

**Honest Reporting:**
- ✅ Say: "On this 12-image dataset, grayscale preprocessing reduced mean CER from 0.25 to 0.20"
- ❌ Don't say: "Grayscale preprocessing improves Hindi OCR accuracy by 20%"

#### Language Coverage

**2 languages (Hindi, Telugu) only**

Results may not apply to:
- Tamil, Malayalam, Kannada, Bengali, Gujarati, Punjabi, Odia, Marathi, English (not tested)

#### Condition Coverage

**Limited diversity:**
- 11 distinct condition categories (clear, perspective, lighting, etc.)
- Missing: extreme blur, night images, damaged signs, handwritten text, etc.

---

## Success Criteria

### Phase 1: Ground Truth

✅ **Complete when:**
- All 12 images have verified ground-truth transcriptions
- Ground truth documented in `validation/metadata/ground-truth.json`
- Transcriptions reviewed by Hindi/Telugu fluent speaker

### Phase 2: Baseline CER/WER

✅ **Complete when:**
- M7 baseline OCR output evaluated against ground truth
- Baseline CER and WER calculated for all 12 images
- Baseline results documented

### Phase 3: Preprocessing Experiments

✅ **Complete when:**
- At least 3 preprocessing methods tested
- CER/WER calculated for each method on all 12 images
- Results compared to baseline
- Best-performing method(s) identified

### Phase 4: Analysis & Recommendation

✅ **Complete when:**
- Aggregate analysis complete
- Per-image and overall comparisons documented
- Recommendations provided based on measured results
- Limitations and caveats documented

---

## Implementation Phases

### Recommended M8 Execution Order

#### M8 Phase 1: Ground-Truth Preparation (This Phase)
- **Status:** ✅ Complete
- **Deliverables:**
  - Experiment plan document (this file)
  - Ground-truth template
  - CER/WER calculation methodology

#### M8 Phase 2: Ground-Truth Transcription
- **Status:** ✅ Complete (transcription, AI reviews, user-attested human verification)
- **Deliverables:**
  - Completed `ground-truth.json` with all 12 transcriptions
  - Manual verification by Hindi/Telugu fluent speaker

#### M8 Phase 3: Baseline CER/WER Evaluation
- **Status:** ✅ Complete (see `results/M8-baseline-cer-wer.md`)
- **Deliverables:**
  - M7 baseline OCR evaluated against ground truth
  - Baseline CER/WER for all 12 images
  - Updated validation results

#### M8 Phase 4: Preprocessing Implementation
- **Status:** 🟡 Partially complete (first round: grayscale, contrast stretch, 2x upscale)
- **Done:** Browser-canvas preprocessing inside the Playwright spec (`scripts/m8-preprocessing-ocr.spec.js`), no new dependencies and no app changes. Two conditions: whole image and manual sign crop (`metadata/sign-crop-regions.json`).
- **Not done:** thresholding (Otsu/adaptive), denoising, deskew, sharpening, and any production preprocessing code in `src/`.

#### M8 Phase 5: Preprocessing Experiments
- **Status:** 🟡 First round complete (8 variants x 12 images = 96 runs); see `results/M8-phase4-preprocessing-results.md`
- **Deliverables done:**
  - OCR text for every variant x image (`results/M8-phase4-ocr-runs.json`)
  - CER/WER per variant, per image, per language (`results/M8-phase4-preprocessing-results.json` and `.md`)
  - Control: untouched re-run reproduces stored M7 OCR text for 12/12 images
- **Open:** remaining methods above; sign-only ground truth; automatic text-region detection (the crop here is manual).

#### M8 Phase 6: Analysis & Recommendations
- **Status:** Complete for the first round (see `results/M8-phase6-analysis.md`)
- **Outcome:** No tested preprocessing (grayscale, contrast stretch, 2x upscale) showed a demonstrated recognition gain on this 12-image set. Cropping to the sign lowers CER/WER mainly by removing clutter. Recommendation: no production preprocessing change on this evidence; investigate sign isolation next with sign-only ground truth and more images.
- **Deliverables:**
  - Comparative analysis report (done)
  - Best-performing method identification (done, with the caveat that CER/WER and word recall disagree)
  - Recommendations for production OCR configuration (done)
  - Documented limitations and caveats (done)

---

## Technical Constraints

### No Changes to Application Source

**M8 experiments must NOT modify:**
- `lipisathi-app/src/services/ocrService.js`
- `lipisathi-app/src/App.jsx`
- `lipisathi-app/src/components/*`
- `lipisathi-app/src/services/transliterationService.js`
- `lipisathi-app/src/services/scriptDetectionService.js`

**Rationale:** M8 is an experimental evaluation phase, not a production feature implementation. Preprocessing code should remain separate in `validation/` or experimental scripts.

**Future Integration:** If preprocessing proves beneficial, integrate into application in a later milestone (M9+).

---

### Tesseract.js Configuration

**Keep constant:**
- Version: 4.1.4
- Traineddata source: CDN-hosted default path `.../4.0.0/` (earlier mislabelled `tessdata_fast`; see the correction above)
- Language codes: `hin`, `tel`
- Worker initialization: existing `createWorker()` configuration

**Do NOT change:**
- Tesseract version
- Traineddata models (no `tessdata_best` yet)
- OCR parameters/settings
- Worker configuration

**Rationale:** Isolate preprocessing as the experimental variable.

---

## Expected Outcomes

### Likely Findings

Based on OCR literature and M7 baseline confidence (18-54%):

**Hypothesis:** Some preprocessing will improve CER/WER for certain image conditions.

**Expected:**
- **Grayscale:** Minimal impact (images already decent quality)
- **Contrast:** Moderate improvement for low-contrast images
- **Threshold:** Significant improvement for clear text, degradation for complex backgrounds
- **Upscaling:** Moderate improvement for small text
- **Combined:** Best results, but increased processing time

**Not Expected:**
- Preprocessing to "fix" genuinely illegible text
- Universal improvement across all images
- Dramatic CER reduction (e.g., 0.30 → 0.05) for all images

---

### Honest Reporting Template

**If preprocessing improves CER:**
> "Grayscale + contrast enhancement reduced mean CER from 0.25 to 0.20 (20% relative improvement) on 8 out of 12 images in this validation dataset. Results were mixed: 4 images showed significant improvement (>30% CER reduction), 4 showed moderate improvement (10-30%), and 4 showed no improvement or degradation."

**If preprocessing does not improve CER:**
> "Tested preprocessing methods (grayscale, contrast, threshold) showed no consistent CER improvement on this 12-image dataset. Mean CER remained between 0.24-0.27 across all methods. Thresholding degraded CER on 7 out of 12 images due to background complexity. Recommendation: Use original images without preprocessing for this dataset."

---

## Open Questions

### Questions for Future Resolution

1. **Ground-Truth Transcription:**
   - Who will perform Hindi/Telugu transcription?
   - What transcription conventions for ambiguous text?
   - How to handle mixed-script text (Hindi + English)?

2. **CER/WER Calculation:**
   - Which edit distance library/implementation to use?
   - How to handle whitespace normalization?
   - Unicode normalization strategy?

3. **Preprocessing Library:**
   - OpenCV.js in browser, or OpenCV in Node.js?
   - Canvas API for simple preprocessing?
   - Sharp library for Node.js?

4. **Batch Processing:**
   - Extend existing Playwright script, or create separate preprocessing script?
   - How to store preprocessed images (temporary, or persist for review)?

5. **Integration:**
   - If preprocessing improves CER, when to integrate into application?
   - Real-time preprocessing in production, or pre-process validation images only?

---

## References

### Tesseract.js

- **Repository:** https://github.com/naptha/tesseract.js
- **Version:** 4.1.4 (used in LipiSathi)
- **Traineddata:** default CDN path `.../4.0.0/` (earlier mislabelled `tessdata_fast`; see the correction above)

### OCR Quality Metrics

- **Levenshtein Distance:** Standard edit distance for CER/WER
- **Character Error Rate (CER):** Standard OCR evaluation metric
- **Word Error Rate (WER):** Standard speech/OCR evaluation metric

### Image Preprocessing for OCR

- **OpenCV Documentation:** Common preprocessing techniques
- **Tesseract Guidelines:** Recommended image preparation

---

## Document Status

**Version:** 1.0  
**Created:** 2026-09-08  
**Status:** M8 first round complete (Phases 1-6): ground truth, baseline, grayscale/contrast/2x upscale on whole image vs manual sign crop, analysis  
**Follow-up done:** script-filtered CER/WER on existing OCR output (`results/M8-followup-analysis.md`). The ground truth was already target-script-only, so no new ground truth was needed for the 12 images.  
**Signboard Hindi extension done (31 signs, owner-attested):** see `results/M8-signboard-analysis.md`. Sign crop lowered CER on 31/31 images; crop CER is still above 1 and word recall about 25%.  
**Telugu signs done (14 signs, owner-attested):** see `results/M8-telugu-signs-analysis.md`. Telugu OCR read almost nothing (1-2 of 41 reference words; 3 crops returned no text); crop still lowers CER.  
**Closure experiments done (2026-10-26):** `tessdata_best`/`_fast`/default models and crop upscaling on both sets (270 runs), and a direct EXIF check. Neither a heavier model nor upscaling helped; the EXIF hypothesis is withdrawn; the model label `tessdata_fast` used earlier was wrong. See `results/M8-closure-summary.md`.  
**M8 status: CLOSED (exploratory first round).** Output: a measurement harness plus evidence that sign isolation is the dominant lever and that Telugu is unproven.  
**Next Step (M9): done on 2026-10-26**, see `results/M9-summary.md` (user crop, offline, camera, speech, overlay, 10 languages; `hin+eng` tested and not adopted; automatic region suggestion failed its bar). Still open: a fluent Telugu reviewer for the 4 uncertain references, more Telugu photos, and page-segmentation-mode tests. Do not add whole-image grayscale/contrast/upscale preprocessing, and do not switch to `tessdata_best` on this evidence.

**Last Updated:** 2026-10-26
