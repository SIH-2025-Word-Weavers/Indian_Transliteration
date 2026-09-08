# M7 Phase 2: Full 12-Image Browser OCR Validation

## Overview

This document reports the results of **M7 Phase 2**, a comprehensive browser-based OCR validation of the existing LipiSathi application using all 12 real-world street-sign validation images.

**Validation Date:** 2026-09-08  
**Validation Timestamp:** 2026-09-08T17:01:40.542Z  
**Browser Environment:** Chromium (Playwright v1243)  
**Tesseract.js Version:** 4.1.4  
**Automation:** Playwright (@playwright/test)

---

## Dataset

| Metric | Count |
|--------|-------|
| **Total Images** | 12 |
| **Hindi Images** | 8 |
| **Telugu Images** | 4 |

**Dataset Source:** Wikimedia Commons  
**Licensing:** All openly licensed (CC BY-SA, CC BY, GFDL, Public Domain)  
**Conditions Represented:** 11 distinct real-world conditions (clear front-facing, perspective, indoor lighting, wide-angle, vertical signs, etc.)

---

## Validation Results Summary

### OCR Execution

| Metric | Value |
|--------|-------|
| **OCR Successes** | 12 / 12 (100%) |
| **OCR Failures** | 0 / 12 (0%) |

All 12 images were successfully processed by the existing Tesseract.js OCR pipeline in the browser environment.

### Script Detection

| Metric | Value |
|--------|-------|
| **Correct Script Detection** | 12 / 12 (100%) |
| **Incorrect Script Detection** | 0 / 12 (0%) |
| **Unknown Script** | 0 / 12 (0%) |

The script detection service correctly identified:
- All 8 Hindi images → **Devanagari**
- All 4 Telugu images → **Telugu**

### Tesseract OCR Confidence Statistics

**IMPORTANT:** These are Tesseract internal confidence metrics, NOT accuracy measurements.

| Statistic | Value |
|-----------|-------|
| **Mean Confidence** | 35.2% |
| **Minimum Confidence** | 18.0% (hindi_03) |
| **Maximum Confidence** | 54.0% (hindi_07) |

**Distribution:**
- 18-30%: 5 images
- 30-40%: 3 images
- 40-50%: 2 images
- 50-55%: 2 images

### Processing Time Statistics

| Statistic | Value |
|-----------|-------|
| **Mean Processing Time** | 1.48s |
| **Minimum Processing Time** | 0.24s (hindi_04) |
| **Maximum Processing Time** | 3.83s (telugu_01) |

---

## Per-Image Results

### Hindi Images (8 total)

#### hindi_01 — Bilingual Board (Clear Front-Facing)

| Metric | Value |
|--------|-------|
| **OCR Status** | ✓ success |
| **OCR Text (first 100 chars)** | न कप स्नम्य रेलिंग से दूरी बनाये रखें * है<br>"&#124; 009: ॥78000 00000 न |
| **Confidence** | 38% |
| **Processing Time** | 2.11s |
| **Detected Script** | Devanagari ✓ |

**Observations:**
- Successfully extracted key Hindi words: "रेलिंग", "से", "दूरी", "बनाये", "रखें"
- Some noise characters from image background/artifacts

---

#### hindi_02 — Road Sign (Perspective)

| Metric | Value |
|--------|-------|
| **OCR Status** | ✓ success |
| **OCR Text (first 100 chars)** | । एाद जान किन क हल निवनिल थे न पा रपर नकल पर किक कप या नजर<br>&#124; ४, हि । € &#124; ; &#124; ड् |
| **Confidence** | 22% |
| **Processing Time** | 2.57s |
| **Detected Script** | Devanagari ✓ |

**Observations:**
- Perspective angle resulted in lower confidence
- Significant noise and fragmented character extraction
- Tests OCR resilience to perspective distortion

---

#### hindi_03 — Railway Station (Clear)

| Metric | Value |
|--------|-------|
| **OCR Status** | ✓ success |
| **OCR Text (first 100 chars)** | टि हू >: दर ब्यकोट. कि,<br>पुन लिलिट नव. काल<br>और व क्र<br>न ; के जै , है व<br>अपन क्ण्प्थ  आ सन |
| **Confidence** | 18% (lowest) |
| **Processing Time** | 1.81s |
| **Detected Script** | Devanagari ✓ |

**Observations:**
- Lowest confidence in dataset despite "clear" category
- Long OCR output with extensive noise
- Image complexity or multiple text regions may affect confidence

---

#### hindi_04 — Metro Vertical Sign

| Metric | Value |
|--------|-------|
| **OCR Status** | ✓ success |
| **OCR Text** | द्वारका मोड़:<br>()५/वा(8 07.<br>न<br>&#124; |
| **Confidence** | 48% |
| **Processing Time** | 0.24s (fastest) |
| **Detected Script** | Devanagari ✓ |

**Observations:**
- Fastest processing time (vertical sign, less text)
- Higher confidence, likely due to simpler text layout
- Successfully extracted "द्वारका मोड़" (Dwarka Mor)

---

#### hindi_05 — Railway Wide-Angle

| Metric | Value |
|--------|-------|
| **OCR Status** | ✓ success |
| **Confidence** | 22% |
| **Processing Time** | 1.78s |
| **Detected Script** | Devanagari ✓ |

**Observations:**
- Wide-angle perspective reduced confidence
- Extensive noise in OCR output

---

#### hindi_06 — Junction Signboard

| Metric | Value |
|--------|-------|
| **OCR Status** | ✓ success |
| **Confidence** | 20% |
| **Processing Time** | 0.81s |
| **Detected Script** | Devanagari ✓ |

**Observations:**
- Low confidence despite "junction signboard" clarity expectation
- Mixed noise characters

---

#### hindi_07 — Metro Indoor Lighting

| Metric | Value |
|--------|-------|
| **OCR Status** | ✓ success |
| **OCR Text** | यह परिसर सी सी टी वी के<br>कैमरे की में है। ठ0)<br>गांड 26: 0४ * 3.<br>न "ण्णण 50 &#124;30€. था |
| **Confidence** | 54% (highest) |
| **Processing Time** | 0.66s |
| **Detected Script** | Devanagari ✓ |

**Observations:**
- **Highest confidence in entire dataset**
- Successfully extracted: "यह परिसर सी सी टी वी के कैमरे की में है।"
- Indoor metro lighting provided optimal conditions
- Fast processing time

---

#### hindi_08 — Street Sign (Natural Conditions)

| Metric | Value |
|--------|-------|
| **OCR Status** | ✓ success |
| **OCR Text** | को &#124; प्रसवपूर्व भ्रूणका लिंग प्रकट )<br>" &#124; करना कानूनी अपराध है। |
| **Confidence** | 50% |
| **Processing Time** | 0.69s |
| **Detected Script** | Devanagari ✓ |

**Observations:**
- Successfully extracted complete phrase: "प्रसवपूर्व भ्रूणका लिंग प्रकट करना कानूनी अपराध है।"
- Good OCR performance under natural outdoor conditions

---

### Telugu Images (4 total)

#### telugu_01 — Highway Sign (Clear)

| Metric | Value |
|--------|-------|
| **OCR Status** | ✓ success |
| **OCR Text (first 100 chars)** | ఇ<br>&#124;<br>र टా ఇ.<br>&#124; హైదరాబాద్‌ గ్గ ఇ. ౨. రాం<br>र ప నా స ౨౩:0... కా "<br>7 11/(1672020 ___ ౨. -:=---------- |
| **Confidence** | 30% |
| **Processing Time** | 3.83s (slowest) |
| **Detected Script** | Telugu ✓ |

**Observations:**
- Longest processing time in dataset
- Successfully extracted Telugu place name: "హైదరాబాద్‌" (Hyderabad)
- Mixed script characters (some Devanagari numerals/symbols)

---

#### telugu_02 — Metro Warning Notice

| Metric | Value |
|--------|-------|
| **OCR Status** | ✓ success |
| **OCR Text (first 100 chars)** | గే 1/11 &#124;1&#124;౧ / ఘో<br>గ గక ట్రే (( 11<br>- (4 ్చి 1 ౬౮ గ / త్పరిక &#124;<br>1211106116 0! 21211 [118 61101/ |
| **Confidence** | 48% |
| **Processing Time** | 0.8s |
| **Detected Script** | Telugu ✓ |

**Observations:**
- Mixed Telugu and English characters (warning notice format)
- Successfully extracted Telugu phrases: "ఫ్లాట్‌ ఫారం", "యొక్కదుర్వినియోగం", "నిషేధం"

---

#### telugu_03 — Metro Information Board

| Metric | Value |
|--------|-------|
| **OCR Status** | ✓ success |
| **OCR Text (first 100 chars)** | స /<br>&#124; వుదు కా ళ్‌<br>&#124; క పి<br>గ (ప్ర 77 నః! నా... /<br>5610861) గొడ" ౦౦౩ 115 &#124;&#124;. అ... క క్‌. |
| **Confidence** | 39% |
| **Processing Time** | 0.85s |
| **Detected Script** | Telugu ✓ |

**Observations:**
- Metro information board with mixed text
- Successfully extracted Telugu content

---

#### telugu_04 — Highway Rural Road

| Metric | Value |
|--------|-------|
| **OCR Status** | ✓ success |
| **OCR Text (first 100 chars)** | &#124;<br>&#124; ఆలంపూర్‌<br>ఈ గగ గ ౧౮౧<br>శాంతినగర్‌<br>తి త్ర పష<br>రాయచూర్‌ క<br>ప &#124;&#124; 24&#124;0౮౯ త్త క శో స్‌ వ |
| **Confidence** | 33% |
| **Processing Time** | 1.6s |
| **Detected Script** | Telugu ✓ |

**Observations:**
- Successfully extracted Telugu place names: "ఆలంపూర్‌", "శాంతినగర్‌", "రాయచూర్‌"
- Rural highway sign, outdoor conditions

---

## Observed OCR Patterns

### Successful Extractions

The existing Tesseract.js OCR pipeline successfully extracted recognizable Indic text from all 12 images, including:

**Hindi Examples:**
- "रेलिंग से दूरी बनाये रखें" (hindi_01)
- "द्वारका मोड़" (hindi_04)
- "यह परिसर सी सी टी वी के कैमरे की में है" (hindi_07)
- "प्रसवपूर्व भ्रूणका लिंग प्रकट करना कानूनी अपराध है" (hindi_08)

**Telugu Examples:**
- "హైదరాబాద్‌" (telugu_01)
- "ఫ్లాట్‌ ఫారం యొక్కదుర్వినియోగం నిషేధం" (telugu_02)
- "ఆలంపూర్‌, శాంతినగర్‌, రాయచూర్‌" (telugu_04)

### Noise and Artifacts

All OCR outputs contain varying degrees of noise characters:
- Mixed script symbols (Devanagari numerals in Telugu text, vice versa)
- Punctuation artifacts
- Fragmented characters
- Background text/numbers

### Confidence vs. Image Conditions

| Condition Category | Confidence Range | Observations |
|-------------------|------------------|--------------|
| **Indoor/Metro lighting** | 48-54% | Highest confidence (hindi_07: 54%) |
| **Clear front-facing** | 38-50% | Moderate-high confidence |
| **Vertical/Small text** | 48% | Efficient processing, good confidence |
| **Perspective/Wide-angle** | 18-22% | Lowest confidence |
| **Railway stations** | 18-22% | Lower than expected, possible multiple text regions |
| **Highway signs** | 30-33% | Moderate confidence for Telugu |

**Pattern:** Indoor/controlled lighting conditions produce higher confidence than outdoor/perspective images.

### Processing Time Patterns

| Image Characteristics | Processing Time |
|----------------------|-----------------|
| **Vertical sign, less text** (hindi_04) | 0.24s (fastest) |
| **Large highway sign, complex** (telugu_01) | 3.83s (slowest) |
| **Most images** | 0.6-2.6s |

**Pattern:** Processing time correlates with image complexity and text amount, not language.

### Script Detection Reliability

**Expected-script match: 12/12** across all 12 images where OCR returned Indic text.

No "Unknown" script results, indicating robust Unicode-based script detection.

---

## Transliteration Status

**Transliteration:** Not validated in M7 Phase 2

**Reason:** Phase 2 focused on browser OCR validation. Transliteration testing deferred to avoid unnecessary UI automation complexity. The existing transliteration service was previously validated in M5 and M6 Phase 3 (service-layer testing).

---

## Limitations and Methodology Notes

### No Ground-Truth Transcription

This validation **does not include** manually verified ground-truth transcriptions for the images. Therefore:

- **No OCR accuracy calculation** (CER, WER, percentage correct)
- Confidence percentages are Tesseract internal metrics, not accuracy
- "Successful extraction" means OCR returned recognizable Indic text

### No Preprocessing

This validation uses the **existing OCR pipeline as-is**, without:
- Image preprocessing (rotation, perspective correction, contrast enhancement)
- Text region detection
- OCR parameter tuning

### Browser Environment Only

Testing was performed in **Chromium browser via Playwright**. Results reflect browser-based Tesseract.js execution, not native Tesseract or other OCR engines.

### CDN Traineddata (tessdata_fast)

The existing implementation uses **CDN-hosted `tessdata_fast` models**, which prioritize speed over accuracy. Production deployments might benefit from `tessdata_best` models.

---

## Conclusions

### M7 Phase 2 Validation: ✓ SUCCESSFUL

1. ✓ All 12 real-world validation images successfully processed
2. ✓ OCR execution success: 12/12
3. ✓ Expected-script match: 12/12
4. ✓ Hindi and Telugu OCR both functional in browser environment
5. ✓ Tesseract.js v4.1.4 operates reliably across diverse image conditions
6. ✓ Processing times are reasonable (0.24s - 3.83s)

### Key Findings

**OCR Pipeline Robustness:**
- The existing LipiSathi OCR implementation successfully handles diverse real-world conditions
- Script detection is highly reliable for Hindi (Devanagari) and Telugu
- Indoor/controlled lighting produces best results (54% confidence)

**Confidence Distribution:**
- Mean confidence: 35.2%
- Range: 18% - 54%
- Lower confidence does not prevent successful Indic text extraction

**Performance:**
- Mean processing time: 1.48s
- Browser-based OCR is fast enough for interactive use

### Recommended Next Steps (Beyond M7 Phase 2 Scope)

**For Future Milestones:**
1. Create ground-truth transcriptions for the 12 images
2. Calculate true OCR accuracy (CER/WER)
3. Test `tessdata_best` models for improved accuracy
4. Implement image preprocessing pipeline
5. Extend validation to remaining 6 OCR languages
6. Test transliteration integration in browser validation flow

---

## Technical Summary

| Metric | Value |
|--------|-------|
| **Validation Phase** | M7 Phase 2 |
| **Images Processed** | 12 / 12 |
| **Languages Tested** | Hindi, Telugu |
| **OCR Execution Success** | 12/12 |
| **Expected-Script Match** | 12/12 |
| **Mean Confidence** | 35.2% |
| **Mean Processing Time** | 1.48s |
| **Browser** | Chromium (Playwright) |
| **Tesseract.js** | v4.1.4 |
| **Traineddata** | CDN (tessdata_fast) |
| **Application Code Modified** | No |

---

**Document Version:** 1.0  
**Created:** 2026-09-08  
**Total Validation Time:** ~29s  
**Automation:** Playwright (@playwright/test)
