# LipiSathi Web Application

**SIH Problem Statement:** SIH25155 — Transliteration Tool for Street Signs  
**Team:** Word Weavers

---

## Current Status

**Phase 1 — Milestone 2: OCR Integration** ✓

The application now supports:
* Image upload
* Hindi and Telugu OCR using Tesseract.js
* Extracted text display with confidence and processing time
* Copy to clipboard functionality

---

## Technology Stack

* **React 18** — UI library
* **Vite 5** — Build tool
* **Tesseract.js 4.1.4** — OCR engine
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
│   │   └── ocrService.js   # Tesseract.js wrapper
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

## OCR Testing

### Supported Languages

* **Hindi (हिन्दी)** — Language code: `hin`
* **Telugu (తెలుగు)** — Language code: `tel`

### How to Test

1. Upload an image containing Hindi or Telugu text
2. Select the appropriate language from the dropdown
3. Click "Run OCR"
4. View extracted text, confidence, and processing time
5. Use "Copy Text" to copy the result to clipboard

**Note:** OCR accuracy depends on image quality, text clarity, and script complexity. Real-world street-sign accuracy has not yet been systematically evaluated.

---

## Implementation Notes

* OCR models recovered from `feature/lipisathi-recovery` branch
* Tesseract.js v4.1.4 API verified during implementation
* Worker properly terminates after OCR completion or error
* Progress updates displayed during OCR processing
* Error handling for invalid images and processing failures

---

## Next Milestones

* **Milestone 3:** Script Detection
* **Milestone 4:** Transliteration
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
