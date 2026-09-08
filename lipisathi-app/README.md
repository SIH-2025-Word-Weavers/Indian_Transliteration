# LipiSathi Web Application

**SIH Problem Statement:** SIH25155 — Transliteration Tool for Street Signs  
**Team:** Word Weavers

---

## Current Status

**Phase 1 — Milestone 4: Transliteration** ✓

The application now supports:
* Image upload
* Hindi and Telugu OCR using Tesseract.js
* Script detection for 9 Indic scripts
* Transliteration between 9 Indic scripts using hub-and-spoke architecture
* Extracted text and transliteration display with copy to clipboard functionality

---

## Technology Stack

* **React 18** — UI library
* **Vite 5** — Build tool
* **Tesseract.js 4.1.4** — OCR engine
* **Script Detection** — Unicode-based Indic script detection (existing repository logic)
* **Transliteration** — Hub-and-spoke architecture via Devanagari (existing repository logic)
* **CSS Modules** — Styling

---

## Project Structure

```
lipisathi-app/
├── public/
│   └── tessdata/           # OCR language models
│       ├── hin.traineddata # Hindi (1.1MB)
│       └── tel.traineddata # Telugu (2.6MB)
├── src/
│   ├── components/
│   │   ├── ImageUploader.jsx
│   │   ├── ImageUploader.module.css
│   │   ├── OCRResult.jsx
│   │   └── OCRResult.module.css
│   ├── services/
│   │   ├── ocrService.js                 # Tesseract.js wrapper
│   │   ├── scriptDetectionService.js     # Script detection logic
│   │   └── transliterationService.js     # Transliteration engine
│   ├── App.jsx
│   ├── App.module.css
│   ├── main.jsx
│   └── styles/
│       └── global.css
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

### Transliteration Limitations

1. **Character-Level Mapping:** The algorithm performs character-by-character mapping and does not account for phonological or contextual rules.

2. **Tamil Approximations:** Tamil lacks aspirated consonants; approximations are used when transliterating to/from Tamil.

3. **No Linguistic Post-Processing:** The implementation does not include language-specific rules (e.g., Hindi schwa deletion) in this milestone.

4. **OCR Dependency:** Transliteration quality depends on OCR accuracy. Poor OCR results will produce poor transliterations.

5. **Not Production-Ready:** This is a character-mapping implementation based on existing repository logic. Linguistic accuracy has not been systematically evaluated.

6. **English Not Supported:** The algorithm does not support English as a source or target script.

---

## Implementation Notes

* OCR models recovered from `feature/lipisathi-recovery` branch
* Tesseract.js v4.1.4 API verified during implementation
* Worker properly terminates after OCR completion or error
* Progress updates displayed during OCR processing
* Error handling for invalid images and processing failures
* Script detection algorithm ported from `transliteration_algorithm.ipynb`
* Script detection runs automatically after successful OCR
* Supports 9 Indic scripts; returns "Unknown" for non-Indic text
* Transliteration algorithm ported from `transliteration_algorithm.ipynb`
* Hub-and-spoke architecture with Devanagari as central hub
* Character mappings for 8 scripts (Telugu, Tamil, Kannada, Malayalam, Gurmukhi, Bengali, Gujarati, Odia)
* Exception dictionary for handling loanwords and proper nouns
* Preserves whitespace, punctuation, and unmapped characters

---

## Next Milestones

* **Milestone 5:** Enhanced UI/UX and Language-Specific Post-Processing
* **Milestone 6:** Camera Integration and Real-Time Processing

Future enhancements:
* Additional OCR languages
* Camera integration
* Image preprocessing
* Batch processing
* PWA/offline support

---

## Important

This is a clean rebuild based on the recovered LipiSathi application, following the REBUILD BLUEPRINT prepared after forensic recovery.
