/**
 * M8 closure - OCR model and crop-upscale experiments (Playwright, existing app UI, NO app changes).
 *
 * The app loads Tesseract.js models from the library's default host path (tessdata.projectnaptha.com/4.0.0).
 * This spec swaps the model by intercepting the *.traineddata.gz request inside the test only; src/ is untouched.
 *
 * Env:
 *   SB_MODEL     default | fast | best      (default: default = exactly what the app loads)
 *   SB_META      metadata file name under validation/metadata (signboard-hindi-ground-truth.json | telugu-signs-ground-truth.json)
 *   SIGNBOARD_DATASET_DIR  external image folder
 *   SB_OUT       output path
 *   SB_LIMIT     first N records (smoke tests)
 *
 * Variants (fixed before any run), both on the dataset/estimated sign box (+5% padding), EXIF applied:
 *   sign_box__oriented   - crop, scale 1
 *   sign_box__upscale2x  - same crop, 2x canvas upscale (high-quality smoothing)
 *
 * IMPORTANT: run ONE model per invocation. Tesseract.js caches models in the browser (IndexedDB) per context, so
 * mixing models inside one run could reuse a cached file. Records the traineddata URLs actually requested.
 * Only raw OCR output is written; metrics come from calculate-signboard-cer-wer.js.
 */
import { test, expect } from '@playwright/test';
import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const validationDir = resolve(here, '..');
const META_NAME = process.env.SB_META || 'signboard-hindi-ground-truth.json';
const META = JSON.parse(readFileSync(resolve(validationDir, 'metadata', META_NAME), 'utf-8'));
const DATA_DIR = process.env.SIGNBOARD_DATASET_DIR || resolve(homedir(), 'Downloads/indian-signboard-image-dataset');
const MODEL = process.env.SB_MODEL || 'default';
const OUT = process.env.SB_OUT || resolve(validationDir, `results/M8-model-${MODEL}-${META.records[0].language.toLowerCase()}-runs.json`);
const LIMIT = process.env.SB_LIMIT ? parseInt(process.env.SB_LIMIT, 10) : META.records.length;
const RECORDS = META.records.slice(0, LIMIT);
const LANG_CODE = { Hindi: 'hin', Telugu: 'tel' };
const VARIANTS = [
  { id: 'sign_box__oriented', scale: 1 },
  { id: 'sign_box__upscale2x', scale: 2 },
];
const MODEL_DIR = process.env.M8_MODEL_DIR || '/tmp/m8models';
const TARGET = { default: null, fast: 'https://tessdata.projectnaptha.com/4.0.0_fast', best: 'https://tessdata.projectnaptha.com/4.0.0_best' }[MODEL];

async function cropInBrowser(page, b64, box, scale) {
  return page.evaluate(
    async ({ b64, box, scale }) => {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${b64}`;
      await img.decode();
      const pw = (box[2] - box[0]) * 0.05, ph = (box[3] - box[1]) * 0.05;
      const x0 = Math.max(0, Math.floor(box[0] - pw)), y0 = Math.max(0, Math.floor(box[1] - ph));
      const x1 = Math.min(img.naturalWidth, Math.ceil(box[2] + pw)), y1 = Math.min(img.naturalHeight, Math.ceil(box[3] + ph));
      const w = x1 - x0, h = y1 - y0;
      const canvas = document.createElement('canvas');
      canvas.width = w * scale; canvas.height = h * scale;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, x0, y0, w, h, 0, 0, canvas.width, canvas.height);
      return { b64: canvas.toDataURL('image/png').split(',')[1], width: canvas.width, height: canvas.height };
    },
    { b64, box, scale }
  );
}

test.describe('M8 closure: model and upscale experiments', () => {
  test(`model=${MODEL}`, async ({ page }) => {
    test.setTimeout(3 * 60 * 60 * 1000);
    const requested = new Map(); // traineddata URL actually fetched -> response size
    const nonLocal = new Set();
    page.on('response', async (resp) => {
      const u = resp.url();
      if (!u.startsWith('http://localhost') && !u.startsWith('data:')) nonLocal.add(u.split('?')[0]);
      if (u.includes('.traineddata')) {
        try { requested.set(u, (await resp.body()).length); } catch { requested.set(u, null); }
      }
    });
    // Everything the OCR needs is served from local files so the run does not depend on CDN availability:
    //  - worker.min.js and tesseract-core*.wasm.js: from node_modules (same package versions the app requests:
    //    tesseract.js 4.1.4 and tesseract.js-core 4.0.4);
    //  - *.traineddata.gz: from M8_MODEL_DIR/<model>/, downloaded beforehand with curl from
    //    tessdata.projectnaptha.com/4.0.0 (default), 4.0.0_fast, 4.0.0_best. Node-side TLS fetch fails here and
    //    certificate verification is NOT disabled.
    // Any other external request is blocked (it could only stall page loads).
    const served = [];
    const nm = resolve(validationDir, '..', 'node_modules');
    await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
    await page.route(/tesseract\.js@[^/]+\/dist\/worker\.min\.js/, async (route) => {
      served.push(route.request().url());
      await route.fulfill({ status: 200, body: readFileSync(resolve(nm, 'tesseract.js/dist/worker.min.js')), headers: { 'content-type': 'application/javascript', 'access-control-allow-origin': '*' } });
    });
    await page.route(/tesseract\.js-core@[^/]+\/(tesseract-core[^/]*\.js)$/, async (route) => {
      const name = route.request().url().split('/').pop();
      served.push(route.request().url());
      await route.fulfill({ status: 200, body: readFileSync(resolve(nm, 'tesseract.js-core', name)), headers: { 'content-type': 'application/javascript', 'access-control-allow-origin': '*' } });
    });
    await page.route('**/*.traineddata.gz', async (route) => {
      const lang = route.request().url().match(/\/([a-z_]+)\.traineddata\.gz/)[1];
      served.push(route.request().url());
      await route.fulfill({ status: 200, body: readFileSync(resolve(MODEL_DIR, MODEL, `${lang}.traineddata.gz`)), headers: { 'content-type': 'application/gzip', 'access-control-allow-origin': '*' } });
    });

    const runs = [];
    for (const variant of VARIANTS) {
      for (const rec of RECORDS) {
        const run = { variant_id: variant.id, image_id: rec.image_id, split: rec.split, language: rec.language,
          input_width: null, input_height: null, ocr_status: null, ocr_text: null, ocr_confidence: null,
          ocr_processing_time_seconds: null, error: null };
        try {
          const bytes = readFileSync(resolve(DATA_DIR, rec.relative_path));
          await page.goto('/');
          await page.waitForLoadState('networkidle');
          const fileInput = page.locator('#imageInput');
          await expect(fileInput).toBeAttached();
          const out = await cropInBrowser(page, bytes.toString('base64'), rec.sign_box_xyxy, variant.scale);
          run.input_width = out.width; run.input_height = out.height;
          await fileInput.setInputFiles({ name: `${rec.image_id}__${variant.id}.png`, mimeType: 'image/png', buffer: Buffer.from(out.b64, 'base64') });
          await page.waitForSelector('img[alt="Selected"]', { timeout: 30000 });
          await page.locator('#languageSelect').selectOption(LANG_CODE[rec.language]);
          const runButton = page.locator('button:has-text("Run OCR")');
          await expect(runButton).toBeEnabled();
          await runButton.click();
          await page.waitForSelector('text=Extracted Text:', { timeout: 600000 });
          const label = page.locator('span:has-text("Extracted Text:")').first();
          run.ocr_text = (await label.locator('../..').locator('div').nth(1).textContent()).trim();
          const num = async (name) => {
            const t = await page.locator(`span:has-text("${name}")`).first().locator('../span').nth(1).textContent();
            const m = t.match(/[\d.]+/); return m ? parseFloat(m[0]) : null;
          };
          run.ocr_confidence = await num('Confidence:');
          run.ocr_processing_time_seconds = await num('Processing Time:');
          if (run.ocr_text === '(No text detected)') run.ocr_text = '';
          run.ocr_status = 'success';
          console.log(`[${MODEL}|${variant.id}] ${rec.image_id} ok conf=${run.ocr_confidence} t=${run.ocr_processing_time_seconds}s chars=${run.ocr_text.length}`);
        } catch (e) {
          run.ocr_status = 'failed'; run.error = e.message;
          console.error(`[${MODEL}|${variant.id}] ${rec.image_id} FAILED: ${e.message.split('\n')[0]}`);
        }
        runs.push(run);
        writeFileSync(OUT, JSON.stringify({
          phase: 'M8 closure - model and upscale experiments',
          model: MODEL,
          served_locally: { models: `${MODEL_DIR}/${MODEL}/ (curl-downloaded, same URLs the app requests)`, worker_and_core: 'node_modules copies of tesseract.js 4.1.4 and tesseract.js-core 4.0.4' },
          non_local_responses_seen: [...nonLocal],
          traineddata_requests: Object.fromEntries(requested),
          note: 'Raw OCR output only. Model swapped by request interception in the test; the app code is unchanged.',
          variants: VARIANTS, record_count: RECORDS.length, runs,
        }, null, 2) + '\n');
      }
    }
    expect(runs.length).toBe(VARIANTS.length * RECORDS.length);
  });
});
