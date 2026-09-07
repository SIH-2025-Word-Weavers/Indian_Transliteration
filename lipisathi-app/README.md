# LipiSathi Web Application

**SIH Problem Statement:** SIH25155 — Transliteration Tool for Street Signs  
**Team:** Word Weavers

---

## Current Status

**Phase 1 — Milestone 3: Script Detection** ✓

The application now supports:
* Image upload
* Hindi and Telugu OCR using Tesseract.js
* Script detection for 9 Indic scripts
* Extracted text display with confidence, processing time, and detected script
* Copy to clipboard functionality

---

## Technology Stack

* **React 18** — UI library
* **Vite 5** — Build tool
* **Tesseract.js 4.1.4** — OCR engine
* **Script Detection** — Unicode-based Indic script detection (existing repository logic)
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
│   │   ├── ocrService.js              # Tesseract.js wrapper
│   │   └── scriptDetectionService.js  # Script detection logic
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

### How to Test

1. Upload an image containing Hindi or Telugu text
2. Select the appropriate language from the dropdown
3. Click "Run OCR"
4. View extracted text, confidence, processing time, and **detected script**
5. Use "Copy Text" to copy the result to clipboard

**Note:** OCR accuracy depends on image quality, text clarity, and script complexity. Real-world street-sign accuracy has not yet been systematically evaluated.

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

---

## Next Milestones

* **Milestone 4:** Transliteration (use detected script to drive transliteration)
* **Milestone 5:** End-to-end UI Integration

Future enhancements:
* Additional OCR languages
* Camera integration
* Image preprocessing
* Batch processing
* PWA/offline support

---

## Important

This is a clean rebuild based on the recovered LipiSathi application, following the REBUILD BLUEPRINT prepared after forensic recovery.
