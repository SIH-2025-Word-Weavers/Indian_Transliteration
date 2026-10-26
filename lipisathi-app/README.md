# LipiSathi Web Application

**SIH Problem Statement:** SIH25155 — Transliteration Tool for Street Signs  
**Team:** Word Weavers

---

## Current Status

| Milestone | Scope | Status |
|---|---|---|
| M1 | React/Vite app, image upload | ✅ |
| M2 | Hindi + Telugu OCR (Tesseract.js) | ✅ |
| M3 | Script detection (9 Indic scripts) | ✅ |
| M4 | Transliteration (9 scripts, hub-and-spoke) | ✅ |
| M5 | Hindi rules, automated tests, notebook parity | ✅ |
| M6 | Real-world validation dataset and structure | ✅ |
| M7 | Browser OCR validation (OCR runs end to end; no accuracy measured) | ✅ |
| M8 | OCR quality experiments: CER/WER with human-attested references, preprocessing, crop, model and EXIF tests | ✅ first round closed (exploratory) |
| M9+ | See "Next Milestones" | planned |

The application now supports:
* Image upload
* Hindi and Telugu OCR using Tesseract.js
* Script detection for 9 Indic scripts
* Transliteration between 9 Indic scripts using hub-and-spoke architecture
* Hindi language-specific post-processing rules (Schwa deletion, ळ→ल)
* Comprehensive automated testing (Vitest)
* Extracted text and transliteration display with copy to clipboard functionality

**What the OCR measurements say so far (M8, exploratory, small datasets, not accuracy):**

* Running OCR on a whole phone photo is unusable (thousands of garbage characters). **Isolating the sign first is by far the biggest lever**: on 31 Hindi signs the sign crop had a much lower error rate than the whole photo on 31 of 31 images and ran about 25x faster. The app currently has **no sign isolation step**, so users should upload a tightly cropped sign.
* Even on a clean crop, Hindi OCR recovers only about a quarter of the reference words, and **Telugu OCR read almost nothing on 14 test signs**. Telugu street-sign support is unproven.
* A heavier model (`tessdata_best`), grayscale/contrast, and 2x upscaling did **not** help in these tests.
* Details and caveats: [`validation/results/M8-closure-summary.md`](validation/results/M8-closure-summary.md).

---

## Technology Stack

* **React 18** — UI library
* **Vite 5** — Build tool
* **Tesseract.js 4.1.4** — OCR engine
* **Script Detection** — Unicode-based Indic script detection (ported from `transliteration_algorithm.ipynb`)
* **Transliteration** — Hub-and-spoke architecture via Devanagari (ported from `transliteration_algorithm.ipynb`)
* **Language Rules** — Hindi-specific post-processing (ported from `transliteration_algorithm.ipynb`)
* **Vitest** — Testing framework
* **CSS Modules** — Styling

---

## Project Structure

```
lipisathi-app/
├── public/
│   └── tessdata/           # OCR language models (currently CDN-hosted)
├── src/
│   ├── components/
│   │   ├── ImageUploader.jsx
│   │   ├── ImageUploader.module.css
│   │   ├── OCRResult.jsx
│   │   └── OCRResult.module.css
│   ├── services/
│   │   ├── ocrService.js                   # Tesseract.js wrapper
│   │   ├── scriptDetectionService.js       # Script detection logic
│   │   ├── scriptDetectionService.test.js  # Script detection tests
│   │   ├── transliterationService.js       # Transliteration engine
│   │   └── transliterationService.test.js  # Transliteration tests
│   ├── App.jsx
│   ├── App.module.css
│   ├── main.jsx
│   └── styles/
│       └── global.css
├── tests/
│   ├── integration.test.js      # OCR → Script → Transliteration pipeline tests
│   └── notebook-parity.md       # Notebook parity test case documentation
├── vitest.config.js
└── ...
```

---

## Development Setup

### Install Dependencies

```bash
cd lipisathi-app
npm install
```

### Run Development Server

```bash
npm run dev
```

Open browser to `http://localhost:5173`

### Run Tests

```bash
npm test           # Run tests in watch mode
npm run test:run   # Run tests once
```

### Build for Production

```bash
npm run build
```

Production build will be in `dist/`.

### Preview Production Build

```bash
npm run preview
```

---

## OCR and Script Detection Testing

### Supported OCR Languages

* **Hindi (हिन्दी)** — Language code: `hin` → Detects as **Devanagari**
* **Telugu (తెలుగు)** — Language code: `tel` → Detects as **Telugu**

### Supported Script Detection (9 Indic Scripts)

The script detection service can identify the following scripts based on Unicode character ranges:

| Script       | Unicode Range      | Example Text      |
|--------------|--------------------|-------------------|
| Telugu       | U+0C00 – U+0C7F    | తెలుగు            |
| Devanagari   | U+0900 – U+097F    | देवनागरी           |
| Tamil        | U+0B80 – U+0BFF    | தமிழ்             |
| Malayalam    | U+0D00 – U+0D7F    | മലയാളം            |
| Gurmukhi     | U+0A00 – U+0A7F    | ਗੁਰਮੁਖੀ          |
| Kannada      | U+0C80 – U+0CFF    | ಕನ್ನಡ             |
| Bengali      | U+0980 – U+09FF    | বাংলা             |
| Gujarati     | U+0A80 – U+0AFF    | ગુજરાતી           |
| Odia         | U+0B00 – U+0B7F    | ଓଡ଼ିଆ              |

### How Script Detection Works

1. **Character Counting:** The algorithm counts characters belonging to each supported script based on Unicode ranges
2. **Dominant Script:** Returns the script with the highest character count
3. **Unknown Result:** If no Indic script characters are found (e.g., empty text, English, numbers, punctuation), returns "Unknown"
4. **Mixed Scripts:** For text containing multiple scripts, returns the script with more characters

**Note:** Script detection is based on the existing repository logic reproduced and verified in the React implementation. It analyzes the OCR-extracted text, so detection accuracy depends on OCR quality.

### How to Test OCR and Script Detection

1. Upload an image containing Hindi or Telugu text
2. Select the appropriate language from the dropdown
3. Click "Run OCR"
4. View extracted text, confidence, processing time, and **detected script**
5. Use "Copy Text" to copy the result to clipboard

**Note:** OCR accuracy depends on image quality, text clarity, and script complexity. Real-world street-sign accuracy has not yet been systematically evaluated.

---

## Transliteration Testing

### How Transliteration Works

LipiSathi uses a **hub-and-spoke architecture** for transliteration:

```
Source Script → Devanagari (Hub) → Target Script
```

This allows any-to-any transliteration between supported scripts. All transliterations pass through Devanagari as the central hub.

**Algorithm Source:** `transliteration_algorithm.ipynb` (existing repository logic)

### Supported Transliteration Scripts

9 scripts total (8 scripts + Devanagari as hub) support bidirectional transliteration:

| Script       | Direction                  | Notes                           |
|--------------|----------------------------|---------------------------------|
| Telugu       | ↔ Devanagari, all others   | Full support                    |
| Devanagari   | ↔ All 8 scripts            | Hub script; also a valid target |
| Tamil        | ↔ Devanagari, all others   | Uses approximations¹            |
| Kannada      | ↔ Devanagari, all others   | Full support                    |
| Malayalam    | ↔ Devanagari, all others   | Full support                    |
| Gurmukhi     | ↔ Devanagari, all others   | Full support                    |
| Bengali      | ↔ Devanagari, all others   | Full support                    |
| Gujarati     | ↔ Devanagari, all others   | Full support                    |
| Odia         | ↔ Devanagari, all others   | Full support                    |

**¹ Tamil Approximations:** Tamil script lacks aspirated consonants. The algorithm uses phonetic approximations (e.g., 'ख', 'ग', 'घ' → 'க').

### How to Test Transliteration

#### End-to-End OCR + Transliteration:

1. Upload a Hindi or Telugu street sign image
2. Run OCR (M2)
3. Script is automatically detected (M3)
4. Select target script from dropdown
5. Click "Transliterate" (M4)
6. View transliterated text
7. Use "Copy Text" to copy the transliteration

#### Direct Text Transliteration:

Since OCR is currently available only for Hindi (Devanagari) and Telugu, other scripts can be tested by:
- Manual input (future enhancement)
- Modifying test data

### Exception Dictionary

The transliteration service includes an exception dictionary for handling loanwords and proper nouns:

| Word        | Target: Devanagari | Target: Telugu    |
|-------------|--------------------|-------------------|
| LipiSathi   | लिपिसाथी            | లిపిసాథి          |
| Google      | गूगल               | గూగుల్            |

Additional exceptions can be added to the transliteration service as needed.

### Language-Specific Post-Processing Rules

The transliteration service includes optional language-specific rules for improved orthographic accuracy:

#### Hindi Rules

1. **Schwa Deletion:** For words ending in Devanagari consonants (U+0915–U+0939), appends virama `्` (halant). Example: `राम` → `राम्`
2. **Character Standardization:** Replaces `ळ` with `ल` for standard Hindi orthography.

**Note:** These are simple heuristics ported from the reference notebook, not a complete linguistic model.

To apply Hindi rules, the transliteration service must be called with `targetLanguage="Hindi"`. The UI does not currently expose language selection; rules are applied at the service level and verified by automated tests.

#### Other Languages

Rules for other languages (Marathi, Tamil, etc.) are not currently implemented. Additional rules can be added following the same pattern as Hindi.

---

### Transliteration Limitations

1. **Character-Level Mapping:** The algorithm performs character-by-character mapping and does not account for complex phonological or contextual rules.

2. **Tamil Approximations:** Tamil lacks aspirated consonants; approximations are used when transliterating to/from Tamil.

3. **Limited Linguistic Post-Processing:** Only Hindi rules are currently implemented. Language-specific rules for other scripts are not yet included.

4. **OCR Dependency:** Transliteration quality depends on OCR accuracy. Poor OCR results will produce poor transliterations.

5. **Not Production-Ready:** This is a character-mapping implementation based on the reference notebook logic. Real-world linguistic accuracy has not been systematically evaluated.

6. **English Not Supported:** The algorithm does not support English as a source or target script.

---

## Testing

The LipiSathi rebuild includes comprehensive automated testing to verify functional correctness:

### Test Coverage

* **Transliteration Service Tests:** 70+ test cases covering basic transliteration, edge cases, exception dictionary, and Hindi language rules
* **Script Detection Tests:** 30+ test cases covering all 9 supported scripts, edge cases, mixed text, and Unicode boundaries
* **Integration Tests:** 30+ test cases verifying the complete OCR → Script Detection → Transliteration pipeline
* **Notebook Parity:** Documented test cases verifying JavaScript behavior matches the reference notebook (`transliteration_algorithm.ipynb`)

### Running Tests

```bash
npm test           # Watch mode (interactive)
npm run test:run   # Run once and exit
```

### Test Philosophy

Tests prioritize **meaningful behavior coverage** over arbitrary coverage metrics. All tests verify actual functionality against the reference notebook implementation.

**What is tested:**
- Core transliteration logic (hub-and-spoke)
- Script detection accuracy
- Hindi language-specific rules
- Exception dictionary
- Edge cases (empty input, whitespace, numbers, punctuation, mixed text)
- Integration pipeline (mocked OCR text)

**What is NOT tested:**
- Actual OCR model accuracy (requires real-world images)
- Browser-specific rendering
- End-to-end browser automation

---

## Real-World Validation

**M6 (validation structure), M7 (browser OCR validation) and M8 (OCR quality experiments)** use real street-sign photos. The photos are external with unknown licenses and are **not stored in this repository**; only metadata, reference texts and OCR output are committed.

### Validation Scope

- **OCR Languages:** Hindi and Telugu (currently supported in M2)
- **M7:** browser OCR run on a small image set; confirms the pipeline runs, no accuracy.
- **M8:** 12 Hindi/Telugu images (manual crops), 31 Hindi signs, 14 Telugu signs; CER/WER against owner-attested, AI-drafted references; preprocessing, crop, OCR-model and EXIF experiments (270 runs for the model/upscale tests).
- **Purpose:** Observe actual behavior, identify limitations, find which levers matter. Not a benchmark.

### Validation Documentation

See [`validation/README.md`](validation/README.md) for:
- Complete validation methodology
- Dataset organization and metadata requirements
- Result-recording procedures
- Image licensing requirements
- Honest interpretation guidelines

### Current Status

**M6:** ✅ validation structure and documentation  
**M7:** ✅ browser OCR validation (results in `validation/results/browser-ocr-proof.md`; its "tessdata_fast" label is inaccurate, see the M8 closure summary)  
**M8:** ✅ first round closed. Start at [`validation/results/M8-closure-summary.md`](validation/results/M8-closure-summary.md); the plan and status are in [`validation/M8_EXPERIMENT_PLAN.md`](validation/M8_EXPERIMENT_PLAN.md).

**Important:** the results are exploratory measurements on small, non-representative datasets with AI-drafted, owner-attested references (not independently verified). CER/WER are error rates, not accuracy. Do not quote them as accuracy figures.

---

## Implementation Notes

### Current Rebuild (M1–M5)

* **OCR:** Tesseract.js v4.1.4 with Hindi and Telugu language models (CDN-hosted)
* **Script Detection:** Ported from `transliteration_algorithm.ipynb`, supports 9 Indic scripts
* **Transliteration:** Hub-and-spoke architecture (Devanagari as hub), ported from `transliteration_algorithm.ipynb`
* **Language Rules:** Hindi-specific post-processing (Schwa deletion, ळ→ल), ported from `transliteration_algorithm.ipynb`
* **Testing:** Vitest with comprehensive unit, integration, and notebook parity tests
* **UI:** React-based with image upload, OCR, script detection, and transliteration display
* Worker termination, progress updates, error handling for OCR
* Exception dictionary for loanwords (lipisathi, google)
* Preserves whitespace, punctuation, and unmapped characters

### Historical LipiSathi (Recovered APK)

The original LipiSathi application (recovered from `feature/lipisathi-recovery` branch) included:
* 11 OCR language models (Hindi, Telugu, Tamil, Malayalam, Kannada, Bengali, Gujarati, Marathi, Punjabi, Odia, English)
* Capacitor-based hybrid mobile app
* Camera integration
* Google TTS integration
* Sanscript.js for transliteration

**These features are NOT yet integrated into the current rebuild.** The current rebuild focuses on core transliteration correctness and automated testing first.

---

## Next Milestones

M1–M8 are done (see "Current Status"). The proposed roadmap below is **a plan, not a commitment**; each item that changes `src/` needs a go-ahead. It follows the SIH idea steps: Capture → Recognize → Transliterate → Display → Speak.

| Milestone | Proposed scope | SIH step | Why |
|---|---|---|---|
| M9 | Sign isolation in the app (user-selected crop before OCR), then `hin+eng` and page-segmentation tests inside the crop; collect more verified Telugu photos | Recognize | Biggest measured lever (M8); the app has no sign isolation |
| M10 | Offline/PWA: bundle the OCR worker, core and models locally | all | The SIH idea promises "internet free"; today everything loads from a CDN |
| M11 | Camera capture | Capture | |
| M12 | Text-to-speech | Speak | |
| M13 | Automatic text/sign detection (replaces the manual crop) | Recognize | |
| M14 | More OCR languages (Tamil first) | Recognize | |
| M15 | Mobile packaging (Capacitor), final testing, demo | all | |

Not yet true of the current app, whatever the pitch says: no camera, no automatic sign detection, no speech, not offline, no mobile build, and Telugu street-sign OCR is unproven (see the M8 closure summary).

---

## Important

This is a clean rebuild based on the recovered LipiSathi application, following the REBUILD BLUEPRINT prepared after forensic recovery.
