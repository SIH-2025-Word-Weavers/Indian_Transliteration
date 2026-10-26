import { createWorker } from 'tesseract.js';
import { getLanguageName as languageName } from '../config/languages';

/**
 * OCR with Tesseract.js 4.1.4, fully offline: the worker, the WASM core and the language models are served
 * from this app's own origin (public/tesseract, public/tessdata), not from a CDN. They are copied/downloaded by
 * `npm run setup:ocr` (also run automatically before `dev` and `build`).
 *
 * The models are the same `.../4.0.0/` files the app used to fetch from tessdata.projectnaptha.com
 * (verified by file size in validation/results/M8-closure-summary.md), so OCR output is unchanged.
 */

const DEBUG = typeof localStorage !== 'undefined' && localStorage.getItem('lipisathi:debug') === '1';
const log = (...args) => DEBUG && console.log('[LipiSathi OCR]', ...args);

/** Absolute URL of a bundled asset. Absolute because Tesseract.js starts its worker from a Blob URL. */
export function assetUrl(path) {
  const base = typeof document !== 'undefined' ? document.baseURI : 'http://localhost/';
  return new URL(path, base).href.replace(/\/$/, '');
}

export function getOcrPaths() {
  return {
    workerPath: assetUrl('tesseract/worker.min.js'),
    corePath: assetUrl('tesseract/'), // directory: Tesseract.js picks the SIMD or plain core
    langPath: assetUrl('tessdata'),
  };
}

/**
 * Run OCR on an image.
 *
 * @param {File|string} imageFile - Image file, Blob or data URL
 * @param {string} language - Tesseract language code ('hin', 'tel', ...) or a '+' combination ('hin+eng')
 * @param {function} onProgress - Progress callback (message: string)
 * @returns {Promise<{text: string, confidence: number, processingTime: number, lines: Array<{text: string, bbox: {x0:number,y0:number,x1:number,y1:number}}>}>}
 */
export async function runOCR(imageFile, language, onProgress = () => {}) {
  let worker = null;
  const startTime = performance.now();
  const name = language
    .split('+')
    .map((code) => languageName(code))
    .join(' + ');

  try {
    onProgress('Initializing OCR engine...');
    worker = await createWorker({
      ...getOcrPaths(),
      errorHandler: (err) => console.error('[Tesseract ERROR HANDLER]', err),
      logger: (m) => {
        log(m);
        if (m.status === 'loading tesseract core') onProgress('Loading OCR engine...');
        else if (m.status === 'initializing tesseract') onProgress('Initializing OCR engine...');
        else if (m.status === 'loading language traineddata') onProgress(`Loading ${name} model...`);
        else if (m.status === 'initializing api') onProgress('Initializing OCR API...');
        else if (m.status === 'recognizing text') onProgress(`Recognizing text... ${Math.round(m.progress * 100)}%`);
      },
    });

    onProgress(`Loading ${name} model...`);
    await worker.loadLanguage(language);
    await worker.initialize(language);

    onProgress('Starting OCR recognition...');
    const { data } = await worker.recognize(imageFile);
    const processingTime = (performance.now() - startTime) / 1000;
    await worker.terminate();
    worker = null;

    log('done', { chars: data?.text?.length || 0, confidence: data?.confidence, seconds: processingTime });

    return {
      text: data.text || '',
      confidence: data.confidence || 0,
      processingTime: parseFloat(processingTime.toFixed(2)),
      lines: (data.lines || [])
        .filter((l) => l.text && l.text.trim())
        .map((l) => ({ text: l.text.trim(), bbox: l.bbox })),
    };
  } catch (error) {
    console.error('[LipiSathi OCR] OCR failed:', error);
    if (worker) {
      try {
        await worker.terminate();
      } catch (terminateError) {
        console.error('[LipiSathi OCR] Worker cleanup failed:', terminateError);
      }
    }
    const message = error?.message || error?.toString?.() || String(error) || 'Unknown OCR error';
    throw new Error(`OCR failed: ${message}`);
  }
}

/** Kept for backward compatibility; see config/languages.js. */
export function getLanguageName(langCode) {
  return languageName(langCode);
}
