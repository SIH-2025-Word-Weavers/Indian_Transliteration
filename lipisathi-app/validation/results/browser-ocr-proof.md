# M7 Phase 1 Browser OCR Proof-of-Concept

## Overview

This document records the results of **M7 Phase 1**, a proof-of-concept validation demonstrating that the existing LipiSathi application can successfully execute its Tesseract.js OCR pipeline inside a real browser environment using a single validation image.

**Status:** ✓ PROOF-OF-CONCEPT SUCCESSFUL

## Methodology

### Test Environment

- **Browser:** Chromium (Playwright v1243 / Chrome for Testing 153.0.8010.12)
- **Automation:** Playwright (@playwright/test)
- **Application Server:** Vite dev server (localhost:5173)
- **Tesseract.js Version:** 4.1.4
- **OCR Engine:** WebAssembly-based Tesseract OCR
- **Traineddata Source:** CDN (tessdata_fast)

### Test Image

- **Image ID:** hindi_01
- **Filename:** `hindi_01.jpg`
- **Language:** Hindi
- **Script:** Devanagari
- **Source:** Wikimedia Commons (Public Domain)
- **Content:** Street sign with Hindi text "कृपया रेलिंग से दूरी बनाये रखें" and English text "PLEASE KEEP DISTANCE FROM RAILING"

### Test Flow

1. Open application in Chromium browser
2. Upload `validation/dataset/hindi/hindi_01.jpg`
3. Select Hindi (हिन्दी) as OCR language
4. Trigger "Run OCR" action
5. Wait for OCR completion (monitored by UI state, not arbitrary timeout)
6. Extract OCR results from rendered UI:
   - Extracted text
   - Confidence percentage
   - Processing time
   - Detected script

## Results

### Execution Status

**OCR Execution:** ✓ SUCCESS

The existing Tesseract.js OCR pipeline successfully executed in the browser and extracted text from the Hindi validation image.

### OCR Output

```
न कप स्नम्य रेलिंग से दूरी बनाये रखें * है
"| 009: ॥78000 00000 न
```

### Metrics

| Metric | Value |
|--------|-------|
| **OCR Status** | success |
| **Confidence** | 38.0% |
| **Processing Time** | 3.97s |
| **Detected Script** | Devanagari |
| **Timestamp** | 2026-09-08T16:51:48.128Z |

### Script Detection

The script detection service correctly identified the extracted text as **Devanagari**, which is the correct script for Hindi.

## Analysis

### OCR Quality

The OCR successfully identified several key Hindi words from the street sign:
- "रेलिंग" (railing) — correctly extracted
- "से" (from) — correctly extracted
- "दूरी" (distance) — correctly extracted
- "बनाये" (maintain) — correctly extracted
- "रखें" (keep) — correctly extracted

The OCR also captured some noise characters and numbers, likely from the image background or artifacts.

### Confidence Level

The 38.0% confidence is relatively low. Possible reasons:
- The image contains both Hindi and English text
- Mixed font styles and sizes
- Image complexity (background, weathering on sign)
- Tesseract.js `tessdata_fast` models prioritize speed over accuracy

### Processing Time

**3.97 seconds** is a reasonable processing time for browser-based OCR with a complex street sign image.

## Limitations

### Scope

This is a **proof-of-concept** for a **single image** only. This test does NOT:

- Validate OCR accuracy across the full 12-image dataset
- Provide ground-truth transcription comparisons
- Calculate OCR accuracy metrics
- Test all supported OCR languages (only Hindi tested)
- Validate transliteration functionality (not required for Phase 1)

### Methodological Constraints

- **No Ground Truth:** No manually verified correct transcription exists for `hindi_01.jpg`
- **No Accuracy Calculation:** Tesseract confidence ≠ OCR accuracy
- **Single-Image Sample:** Results may not generalize to other validation images

### Confidence vs. Accuracy

The **38.0% confidence** reported by Tesseract.js is an internal model confidence metric, NOT an accuracy measurement. True accuracy would require:
1. Manual ground-truth transcription of the image
2. Character-level or word-level comparison
3. Edit distance or other accuracy metrics

## Conclusion

### Proof-of-Concept Status: ✓ SUCCESSFUL

This M7 Phase 1 proof-of-concept successfully demonstrates that:

1. ✓ The existing LipiSathi application can execute OCR in a real browser
2. ✓ Tesseract.js v4.1.4 functions correctly in the browser environment
3. ✓ Hindi OCR using CDN-hosted traineddata works as expected
4. ✓ Script detection correctly identifies Devanagari script
5. ✓ The OCR → Script Detection pipeline executes successfully

### Next Steps

The successful completion of M7 Phase 1 provides the foundation for:

- **M7 Phase 2:** Extend browser validation to all 12 acquired images
- **M7 Phase 3:** (If required) Add ground-truth transcriptions for accuracy measurement
- **M7 Phase 4:** (If required) Test Telugu OCR language support

---

**Document Version:** 1.0  
**Created:** 2026-09-08  
**Test Execution Time:** ~5.3s  
**Automation:** Playwright (@playwright/test)
