# M9 Summary - from measurement to product (sign crop, offline, camera, speech, overlay, languages)

Date: 2026-10-26. Builds on `M8-closure-summary.md`. The approved plan was the M9-M15 roadmap in the README. This document records what was built, **how each part was verified, and what was not verified**. Nothing here is an OCR accuracy claim: OCR quality is unchanged from M8 (Hindi reads about a quarter of reference words on clean crops; Telugu almost nothing; the other 8 languages are untested).

## 1. What was built

| Area | Roadmap | What the app does now | Verified how |
|---|---|---|---|
| Sign isolation | M9 | Drag a rectangle on the shown image (mouse or touch); only that area is OCR'd. Crop is cut from the browser-decoded image (EXIF-correct) with the 5% padding M8 measured. "Use whole image" clears it. | e2e tests; **8 real EXIF-rotated phone photos**: the image sent to OCR matched the M8 harness crop of the same sign box to within 0.8% (about 1 px) on all 8 |
| Offline | M10 | OCR worker, WASM core and models are served from the app's own origin (`public/tesseract`, `public/tessdata`, created by `npm run setup:ocr`), plus a service worker and web manifest (installable PWA). | e2e: zero requests leave localhost during crop -> OCR -> transliteration; OCR works after the network is switched off and the page is reloaded |
| Camera | M11 | "Take Photo" button using the file input with `capture="environment"` (opens the camera on phones, a file picker on desktops). | e2e checks the input exists with the right attribute. **Not tested on a real phone** |
| Speech | M12 | "Speak" for the recognized text and for the transliteration, via the browser's Web Speech API; picks an installed voice for the script's language, and says clearly when none is installed. | Unit tests (voice selection, script -> language) and e2e with a stubbed speech engine. **Not tested with real Indian-language voices** (availability depends on the device) |
| Display overlay | (SIH "Display") | Each OCR line's transliteration is drawn over the line's region of the image. | e2e confirms it renders on the cropped image. Visual check only; placement quality depends on OCR line boxes and was not measured |
| Languages | M14 | 10 OCR languages bundled: Hindi, Telugu (tested in M8) and Tamil, Kannada, Malayalam, Bengali, Gujarati, Punjabi, Odia, Marathi (**not tested on real signs**; the UI says so). | Unit tests: each language's script is supported by detection/transliteration; model checksums in `scripts/tessdata-manifest.json` |
| Mobile layout | M15 | Wrapping rows, 360 px viewport check. A real bug was found and fixed (Speak/Transliterate buttons overlapped on a narrow screen). | e2e at 360 px: full flow clickable, no horizontal scroll |

Tests: 130 unit tests (previously 103) plus 8 end-to-end tests (`npm run e2e`), all passing.

### Control: the offline app reproduces the old OCR output

With the new local-asset app, the default model on the as-cropped variant gave **identical OCR text on 45 of 45 images** (14 Telugu + 31 Hindi) compared with the earlier M8 runs that loaded everything from CDNs (`M9-control-*-runs.json`). Moving the assets local did not change OCR behaviour.

## 2. English added to the language (`hin+eng`, `tel+eng`), same crops, default model

Tested because bilingual signs are common and M8 recommended it. Mixed result, so it was **not** made the default and the 10.9 MB English model is **not** bundled.

| | Hindi (31) hin | Hindi hin+eng | Telugu (14) tel | Telugu tel+eng |
|---|---:|---:|---:|---:|
| CER (references exclude English) | 5.42 | 4.98 | 2.91 | 2.66 |
| Script-filtered CER | 4.42 | 1.43 | 2.11 | 1.22 |
| Reading errors (sub+del) / ref chars | 379 / 967 | 527 / 967 | 146 / 295 | 167 / 295 |
| Reference words found | 49/194 | 46/194 | 1/41 | 2/41 |
| Mean time | 0.77 s | 1.16 s | 0.30 s | 0.50 s |

- Adding English removes much of the Devanagari/Telugu **junk** produced from Latin text (script-filtered CER drops sharply; lower on 25 of 31 Hindi images and 9 of 14 Telugu, higher on 1 and 0).
- But **more reference characters are missed** (reading errors up) and **word recall does not improve** (46 vs 49; 2 vs 1). So the real reading is not better; there is less noise.
- Unfiltered CER counts correctly read English as insertions (the references are Hindi/Telugu only), so it understates any benefit of reading the English text itself. That benefit was not measured (no English references).
- Costs: 10.9 MB more model, about 1.5x slower.

Decision: keep single-language OCR. An optional "+English" mode is a reasonable later addition if English reading is wanted; the measured trade-off is above.

## 3. Automatic sign-area suggestion: failed its pre-registered bar, not exposed

An edge-density clustering detector (`src/utils/textRegionDetector.js`, no model, no dependency) was evaluated **once**, with parameters and the pass bar written down in advance (`validation/scripts/m9-region-suggestion.spec.js`): expose the feature only if the suggested box overlaps the annotated sign box with IoU >= 0.5 on at least half of the 45 images. (One design revision happened before any real image was evaluated: raw-edge dilation merged all background texture into one blob in a synthetic test, so it was replaced by a cell-density version.)

| Set | IoU >= 0.5 | Median IoU | Suggestion contains >= 80% of the true box |
|---|---:|---:|---:|
| Hindi (31) | 0 / 31 | 0.07 | 17 / 31 |
| Telugu (14) | 3 / 14 | 0.16 | 5 / 14 |
| All (45) | **3 / 45** | 0.08 | 22 / 45 |

**Bar failed by a wide margin** (needed 23 of 45). The suggestions usually contain the sign but are far too large, so they would not isolate it. The detector stays in the code base, unit-tested but not wired into the UI, and the user crop remains the way to isolate a sign. Automatic detection (roadmap M13) is therefore **not delivered**. A real detector would need a trained text-detection model, which would add a dependency and model size; that is a separate decision.

## 4. What is NOT done or NOT verified

- **Native Android/iOS app**: not built. No Android SDK is installed here and no Capacitor dependency was added, because an unbuildable, untested wrapper would only look like progress. The delivered mobile path is the installable PWA (add to home screen); its installability was not tested on a real device, nor on iOS Safari.
- **Real-device checks**: camera capture, touch cropping on a phone, and speech with real Indian-language voices were not tested (tested with desktop Chrome, synthetic touch settings, and a stubbed speech engine).
- **Automatic sign detection** (section 3) and **live camera preview** (only capture via the file input) are not implemented.
- **OCR quality is unchanged**: Hindi partial, Telugu essentially unreadable on the test signs, 8 languages untested. A fluent Telugu reviewer for the 4 uncertain references and more verified photos are still needed.
- **Overlay**: its position/size quality was only eyeballed on synthetic and a few images; not measured.
- **Offline first run**: models are fetched once by `npm run setup:ocr` (needs the internet that one time, or a pre-downloaded folder via `LIPISATHI_MODEL_DIR`). After that the app needs no network. The service worker pre-caches the engine and the Hindi/Telugu models; other language models are cached after first use (or are served from the local origin when running the app locally).
- English model, `tessdata_best`, and upscaling are not part of the app (see M8 and section 2).

## 5. Reproduction

`npm run setup:ocr` (assets), `npm run test:run` (unit), `npm run e2e` (end to end; add `PW_CHANNEL=chrome` if the bundled Chromium cannot be installed). Experiment specs: `m8-model-experiments.spec.js` (with `SB_ONLY_VARIANT` / `SB_LANG_SUFFIX`), `m9-region-suggestion.spec.js`, `m9-ui-crop-check.spec.js`. Raw outputs: `M9-*.json`; metrics via `calculate-signboard-cer-wer.js` as in M8. The external images (license unknown) are not stored in the repo.
