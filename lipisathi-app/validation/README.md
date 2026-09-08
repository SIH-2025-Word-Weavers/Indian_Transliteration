# LipiSathi M6 Real-World Validation

**Milestone:** M6  
**Objective:** Representative real-world validation of the existing M1–M5 OCR → Script Detection → Transliteration pipeline  
**Scope:** Hindi and Telugu street-sign images

---

## Overview

This validation phase tests the existing LipiSathi rebuild (M1–M5) using real street-sign images under representative conditions. The goal is to observe actual behavior, identify limitations, and establish a baseline for future improvements.

**Important:** This is NOT a comprehensive evaluation, statistically significant benchmark, or production validation. It is a representative real-world validation to understand current system behavior.

---

## Current Validation Scope

### Supported OCR Languages (M6)

The current LipiSathi rebuild (M2) supports **2 OCR languages only**:

- **Hindi (हिन्दी)** — Language code: `hin` → Detects as **Devanagari**
- **Telugu (తెలుగు)** — Language code: `tel` → Detects as **Telugu**

**Note:** The historical recovered LipiSathi APK included 11 OCR language models (Hindi, Telugu, Tamil, Malayalam, Kannada, Bengali, Gujarati, Marathi, Punjabi, Odia, English). These are NOT currently implemented in the M1–M5 rebuild. M6 validates only Hindi and Telugu.

### Validation Pipeline

```
Street Sign Image
    ↓
Upload via UI
    ↓
Select OCR Language (Hindi or Telugu)
    ↓
Run OCR (Tesseract.js v4.1.4)
    ↓
Extract: text, confidence, processing time
    ↓
Script Detection (9 Indic scripts supported)
    ↓
Detected Script: Devanagari, Telugu, Tamil, Malayalam, etc.
    ↓
Select Target Script
    ↓
Transliterate (Hub-and-Spoke via Devanagari)
    ↓
View Transliterated Text
    ↓
Record Observations
```

---

## Validation Methodology

### How Validation is Performed

Validation is **manual** using the existing LipiSathi UI:

1. **Start the application:**
   ```bash
   cd lipisathi-app
   npm run dev
   ```
   Open browser to `http://localhost:5173`

2. **For each validation image:**
   - Upload the image
   - Select OCR language (Hindi or Telugu)
   - Click "Run OCR"
   - Observe and record:
     - Extracted text
     - Confidence score
     - Processing time
     - Detected script
   - Select a target script (e.g., Telugu if source is Hindi)
   - Click "Transliterate"
   - Observe and record:
     - Transliterated text
     - Any errors or issues

3. **Document observations** in `results/validation-results.md`

### Why Manual Validation?

- First validation cycle should be observational
- Human judgment required for quality assessment
- Automation can be added later (M7+) if needed
- Manual validation tests the actual user experience

---

## Dataset Organization

### Directory Structure

```
validation/
├── README.md                    # This file
├── dataset/
│   ├── hindi/                   # Hindi street-sign images (8 images, 2.8 MB)
│   │   ├── hindi_01.jpg         # Bilingual board, clear front-facing
│   │   ├── hindi_02.jpg         # Road sign with perspective
│   │   ├── hindi_03.jpg         # Railway station
│   │   ├── hindi_04.jpg         # Metro vertical sign
│   │   ├── hindi_05.jpg         # Railway wide-angle
│   │   ├── hindi_06.jpg         # Junction signboard
│   │   ├── hindi_07.jpg         # Metro indoor lighting
│   │   └── hindi_08.jpg         # Street sign natural
│   └── telugu/                  # Telugu street-sign images (4 images, 1.7 MB)
│       ├── telugu_01.jpg        # Highway sign clear
│       ├── telugu_02.jpg        # Metro warning notice
│       ├── telugu_03.jpg        # Metro information board
│       └── telugu_04.jpg        # Highway rural road
├── metadata/
│   └── dataset-index.json       # Complete metadata for all 12 images
└── results/
    └── validation-results.md    # Validation observations template
```

### Target Dataset Size

- **Total:** ~16 images
- **Hindi:** ~8 images
- **Telugu:** ~8 images

### Actual Dataset Acquired (M6 Phase 2)

**Status:** Partially Complete

- **Total Acquired:** 12 images (4.5 MB)
- **Hindi:** 8 images (2.8 MB) — ✅ Target achieved
- **Telugu:** 4 images (1.7 MB) — ⚠️ Partial (target was 8)

**Source:** Wikimedia Commons  
**Licensing:** All openly licensed (CC BY-SA, CC BY, GFDL, Public Domain)  
**File Naming:** `hindi_01.jpg` through `hindi_08.jpg`, `telugu_01.jpg` through `telugu_04.jpg`

**Missing:** 4 Telugu images could not be acquired due to Wikimedia Commons rate limiting after initial successful downloads.

### Image Conditions

Validation images should represent diverse real-world conditions:

#### Hindi Images (8 Acquired)
1. ✅ hindi_01.jpg — Clear front-facing bilingual board
2. ✅ hindi_02.jpg — Road sign with perspective angle
3. ✅ hindi_03.jpg — Railway station, clear
4. ✅ hindi_04.jpg — Metro vertical sign, smaller text
5. ✅ hindi_05.jpg — Railway wide-angle
6. ✅ hindi_06.jpg — Junction signboard
7. ✅ hindi_07.jpg — Metro indoor lighting
8. ✅ hindi_08.jpg — Street sign, natural conditions

**Sources:** 
- 4 railway station signs
- 3 metro station signs
- 1 road/street sign

**Conditions Covered:** Clear/front-facing, perspective, vertical layout, indoor lighting, wide-angle, natural outdoor

#### Telugu Images (4 Acquired, 4 Missing)
1. ✅ telugu_01.jpg — Highway sign, clear front-facing
2. ✅ telugu_02.jpg — Metro warning notice
3. ✅ telugu_03.jpg — Metro information board
4. ✅ telugu_04.jpg — Highway rural road sign
5. ❌ Missing — Additional metro/highway signs (rate limit)
6. ❌ Missing — Additional variations (rate limit)
7. ❌ Missing — Different lighting conditions (rate limit)
8. ❌ Missing — Different perspective angles (rate limit)

**Sources:**
- 2 highway signs
- 2 metro station signs

**Conditions Covered:** Clear/front-facing, warning format, information board, rural highway

**Limitation:** Fewer Telugu images reduces condition diversity for Telugu validation compared to Hindi.

---

## Dataset Acquisition Details

### Wikimedia Commons Sources

**Hindi Images (8):**
- Source Category: `Category:Bilingual English-Hindi signs in India`
- Total Available: 200+ files
- Selection Method: Manual curation for diversity
- Primary Sign Types:
  - Railway station name boards
  - Delhi Metro signage
  - Road and highway signs

**Telugu Images (4):**
- Source Categories:
  - `Category:Bilingual English-Telugu signs in Telangana`
  - `Category:Quadrilingual English-Hindi-Telugu-Urdu signs in Telangana`
- Total Available: 40+ (bilingual), 90+ (quadrilingual)
- Selection Method: Manual curation for diversity
- Primary Sign Types:
  - Telangana highway signs
  - Hyderabad Metro station signage

### Acquisition Method

1. **Identification:** Browsed Wikimedia Commons categories to identify suitable images
2. **Download:** Used `Special:FilePath` API to download full-resolution images
3. **Resize:** Resized to 1600px maximum dimension using `sips` (macOS) for consistent file sizes
4. **Verification:** Manually verified each image for:
   - Clear visibility of target script text
   - Proper JPEG format and non-corruption
   - Traceable source URL
   - Open licensing
5. **Metadata Creation:** Documented all images in `dataset-index.json`

### Licensing Compliance

- ✅ All 12 images have verified open licenses
- ✅ Commercial use allowed on all images
- ✅ Attribution requirements documented (6 require attribution, 6 do not)
- ✅ Source URLs recorded for every image
- ✅ No copyrighted or uncertain-license images included

### Rate Limiting Issue

**Problem:** After successfully downloading 8 Hindi and 4 Telugu images, subsequent download attempts for additional Telugu images consistently failed with Wikimedia Commons error pages (HTML instead of image files).

**Attempted Solutions:**
- Tried different categories (bilingual, trilingual, quadrilingual)
- Tried different URL formats (Special:FilePath, direct upload URLs)
- Added delays (10-30 seconds between requests)
- Changed user-agent headers
- Waited extended periods

**Outcome:** Unable to acquire the remaining 4 Telugu images. All attempts resulted in HTTP error responses indicating rate limiting or access restrictions.

**Impact:** The 12 acquired images still provide meaningful validation coverage, though Telugu has less condition diversity than Hindi.

---

## Metadata Requirements

Each image must have metadata recorded in `metadata/dataset-index.json`.

### Required Fields

- **id:** Unique identifier (e.g., "IMG001")
- **filename:** Image filename (e.g., "IMG001_clear.jpg")
- **language:** OCR language ("Hindi" or "Telugu")
- **script:** Expected script ("Devanagari" or "Telugu")
- **source:** Image source (e.g., "Team-created", "Wikimedia Commons", URL)
- **license:** License type (e.g., "CC0", "Public Domain", "Team-owned")
- **conditions:** Array of condition tags (e.g., ["clear", "horizontal", "good-lighting"])
- **reference_text:** Ground truth text in original script
- **notes:** Additional observations about the image

### Example Metadata Entry

```json
{
  "id": "IMG001",
  "filename": "IMG001_clear.jpg",
  "language": "Hindi",
  "script": "Devanagari",
  "source": "Team-created",
  "license": "CC0",
  "conditions": ["clear", "horizontal", "good-lighting"],
  "reference_text": "मुंबई रेलवे स्टेशन",
  "notes": "Clear railway station signboard"
}
```

---

## Result-Recording Procedure

### Recording Format

For each image, record observations in `results/validation-results.md` using the provided table format.

### Data to Record

1. **OCR Stage:**
   - Extracted text (what Tesseract.js returned)
   - Confidence score (0-100%)
   - Processing time (seconds)
   - Any OCR errors or failures

2. **Script Detection Stage:**
   - Detected script
   - Correctness (✓ if correct, ✗ if incorrect)
   - Any issues

3. **Transliteration Stage:**
   - Selected target script
   - Transliterated text
   - Quality judgment (manual assessment)
   - Any issues

4. **Observations:**
   - General notes about quality
   - Issues encountered
   - Unexpected behavior

---

## How to Add a New Validation Image

### Step 1: Acquire Image

**Preferred Sources:**
1. **Team-created photos** — Take photos of real street signs
2. **Public domain sources** — Wikimedia Commons, CC0 images
3. **Licensed images** — Clear CC-BY, CC0, or equivalent

**Requirements:**
- ✅ Street sign or similar public signage
- ✅ Contains Hindi or Telugu text
- ✅ Clear licensing (team-owned, CC0, Public Domain, or CC-BY)
- ✅ Reasonable quality (not extreme blur/damage)
- ✅ File size ~100-300 KB (resize if needed)

**Image Naming Convention:**
- Format: `IMG[XXX]_[condition].jpg`
- Examples: `IMG001_clear.jpg`, `IMG002_blur.jpg`, `IMG011_angle.jpg`

### Step 2: Add to Repository

1. **Place image** in appropriate folder:
   - Hindi images → `validation/dataset/hindi/`
   - Telugu images → `validation/dataset/telugu/`

2. **Add metadata** to `metadata/dataset-index.json`:
   - Copy the template entry
   - Fill in all required fields
   - Update `total_images` count

3. **Document source** and license clearly

### Step 3: Run Validation

1. Start LipiSathi application
2. Upload the image
3. Run OCR and record results
4. Test transliteration
5. Record observations in `results/validation-results.md`

---

## Licensing Requirements

### Image License Policy

All validation images MUST have clear licensing:

✅ **Allowed:**
- Team-created photos (team owns copyright)
- Public Domain images
- CC0 (Creative Commons Zero)
- CC-BY (with attribution)

❌ **NOT Allowed:**
- Copyrighted images without clear license
- Images from Google Images without verification
- "All rights reserved" images
- Uncertain licensing

### Attribution

If using CC-BY or similar:
- Document original source URL
- Credit original photographer/creator
- Include license information in metadata

---

## Honest Interpretation of Results

### What M6 Validation Can Tell Us

✅ M6 validation provides:
- Representative real-world behavior observations
- Identification of common failure patterns
- Baseline understanding of current capabilities
- Evidence-based recommendations for improvement

❌ M6 validation does NOT provide:
- Comprehensive accuracy percentages
- Statistically significant benchmarks
- Proof of production readiness
- Comparison against other systems
- Guarantees of performance on all street signs

### Reporting Guidelines

When documenting results:

✅ **Do say:**
- "OCR succeeded on X out of Y images"
- "Script detection was correct for X out of Y images"
- "Common failure pattern observed: [specific issue]"
- "Transliteration was reasonable for clear OCR text"

❌ **Don't say:**
- "OCR accuracy is 95%"
- "System is production-ready"
- "Better than previous version"
- "Works on all street signs"
- "Supports all Indian languages"

---

## Limitations

### Known Limitations of M6 Validation

1. **Small Sample Size:** ~16 images is NOT statistically representative of all street signs

2. **Limited Language Coverage:** Only Hindi and Telugu (2 languages)
   - Cannot test Tamil, Malayalam, Kannada, Bengali, Gujarati, Odia, Marathi, Punjabi, English
   - Historical LipiSathi APK's 11 OCR languages are NOT part of current rebuild

3. **Laboratory-Style Testing:** Validation uses pre-captured images, not live camera

4. **Manual Process:** Human judgment in recording observations

5. **No User Feedback:** Validation by development team only

6. **Static Images:** No video, real-time, or mobile device testing

7. **No Performance Benchmarking:** Processing time not systematically analyzed

8. **No Comparison:** No baseline comparison with other OCR/transliteration systems

### Future Validation (M7+)

Future milestones may include:
- Larger dataset (50-100+ images)
- Additional OCR languages (Tamil, Malayalam, Kannada, etc.)
- Automated batch processing
- Camera/mobile validation
- User testing with real travelers
- Statistical analysis of accuracy

---

## Questions?

For questions about M6 validation methodology or to contribute validation images, open an issue in the repository or contact the development team.

---

**Last Updated:** 2026-09-08  
**Validation Status:** M6 Phase 2 Complete (Dataset Acquisition) — 12 of 16 target images acquired  
**Next Step:** M6 Phase 3 (Manual Validation using acquired images)
