/**
 * M8 Phase 4 - Preprocessing OCR capture (Playwright, real Chromium, existing app UI).
 *
 * Runs the EXISTING LipiSathi OCR flow (upload -> select language -> "Run OCR") on 8 variants of each
 * of the 12 validation images and records the raw OCR output. Metrics are computed separately by
 * calculate-preprocessing-cer-wer.js against ground-truth.json verified_text.
 *
 * Variants (fixed before any run):  region {full, sign_crop} x processing {original, grayscale,
 * contrast_stretch, upscale2x}.  Everything else (Tesseract.js 4.1.4, tessdata_fast, hin/tel,
 * ocrService.js) is the unmodified app. Preprocessing happens in the browser canvas (no new deps,
 * nothing written to disk).
 *
 * SAFETY: writes ONLY validation/results/M8-phase4-ocr-runs.json. Never touches the M7 result files.
 * Run:  npx playwright test validation/scripts/m8-preprocessing-ocr.spec.js
 */
import { test, expect } from '@playwright/test';
import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const validationDir = resolve(here, '..');
const metadata = JSON.parse(readFileSync(resolve(validationDir, 'metadata/dataset-index.json'), 'utf-8'));
const crops = JSON.parse(readFileSync(resolve(validationDir, 'metadata/sign-crop-regions.json'), 'utf-8')).regions;
const OUT = resolve(validationDir, 'results/M8-phase4-ocr-runs.json');

const REGIONS = ['full', 'sign_crop'];
const PROCESSINGS = ['original', 'grayscale', 'contrast_stretch', 'upscale2x'];
const VARIANTS = REGIONS.flatMap((region) =>
  PROCESSINGS.map((processing) => ({ id: `${region}__${processing}`, region, processing }))
);

/** Runs in the browser. Returns { b64, width, height } of a PNG. */
async function preprocessInBrowser(page, originalBytesB64, crop, processing) {
  return page.evaluate(
    async ({ b64, crop, processing }) => {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${b64}`;
      await img.decode();
      const [cx, cy, cw0, ch0] = crop || [0, 0, img.naturalWidth, img.naturalHeight];
      const cw = Math.min(cw0, img.naturalWidth - cx);
      const ch = Math.min(ch0, img.naturalHeight - cy);
      const scale = processing === 'upscale2x' ? 2 : 1;
      const canvas = document.createElement('canvas');
      canvas.width = cw * scale;
      canvas.height = ch * scale;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, cx, cy, cw, ch, 0, 0, canvas.width, canvas.height);

      if (processing === 'grayscale' || processing === 'contrast_stretch') {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const px = data.data;
        const gray = new Uint8ClampedArray(px.length / 4);
        for (let i = 0, g = 0; i < px.length; i += 4, g++) {
          gray[g] = Math.round(0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]);
        }
        let lo = 0, hi = 255;
        if (processing === 'contrast_stretch') {
          // Linear stretch between the 1st and 99th percentile of grayscale luminance.
          const hist = new Array(256).fill(0);
          for (let g = 0; g < gray.length; g++) hist[gray[g]]++;
          const n = gray.length;
          let acc = 0;
          for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= 0.01 * n) { lo = v; break; } }
          acc = 0;
          for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= 0.99 * n) { hi = v; break; } }
          if (hi <= lo) { lo = 0; hi = 255; }
        }
        for (let i = 0, g = 0; i < px.length; i += 4, g++) {
          let v = gray[g];
          if (processing === 'contrast_stretch') v = Math.max(0, Math.min(255, Math.round(((v - lo) * 255) / (hi - lo))));
          px[i] = px[i + 1] = px[i + 2] = v;
        }
        ctx.putImageData(data, 0, 0);
      }
      const url = canvas.toDataURL('image/png');
      return { b64: url.split(',')[1], width: canvas.width, height: canvas.height };
    },
    { b64: originalBytesB64, crop, processing }
  );
}

test.describe('M8 Phase 4: preprocessing OCR capture', () => {
  test('run 8 variants x 12 images through the existing OCR UI', async ({ page }) => {
    test.setTimeout(45 * 60 * 1000);
    const runs = [];
    const startedAt = new Date().toISOString();

    for (const variant of VARIANTS) {
      for (const img of metadata.images) {
        const run = {
          variant_id: variant.id,
          region: variant.region,
          processing: variant.processing,
          image_id: img.id,
          language: img.language,
          input_width: null,
          input_height: null,
          ocr_status: null,
          ocr_text: null,
          ocr_confidence: null,
          ocr_processing_time_seconds: null,
          detected_script: null,
          error: null,
        };
        try {
          const folder = img.language.toLowerCase();
          const imagePath = resolve(validationDir, `dataset/${folder}/${img.filename}`);
          const bytes = readFileSync(imagePath);

          await page.goto('/');
          await page.waitForLoadState('networkidle');
          const fileInput = page.locator('#imageInput');
          await expect(fileInput).toBeAttached();

          if (variant.region === 'full' && variant.processing === 'original') {
            // Identical to M7: upload the untouched dataset file.
            await fileInput.setInputFiles(imagePath);
            run.input_width = null; // untouched file; dimensions are in dataset-index.json
          } else {
            const crop = variant.region === 'sign_crop' ? crops[img.id].box : null;
            const out = await preprocessInBrowser(page, bytes.toString('base64'), crop, variant.processing);
            run.input_width = out.width;
            run.input_height = out.height;
            await fileInput.setInputFiles({
              name: `${img.id}__${variant.id}.png`,
              mimeType: 'image/png',
              buffer: Buffer.from(out.b64, 'base64'),
            });
          }
          await page.waitForSelector('img[alt="Selected"]', { timeout: 10000 });

          const code = img.language === 'Hindi' ? 'hin' : 'tel';
          await page.locator('#languageSelect').selectOption(code);
          const runButton = page.locator('button:has-text("Run OCR")');
          await expect(runButton).toBeEnabled();
          await runButton.click();
          await page.waitForSelector('text=Extracted Text:', { timeout: 120000 });

          const label = page.locator('span:has-text("Extracted Text:")').first();
          run.ocr_text = (await label.locator('../..').locator('div').nth(1).textContent()).trim();
          const num = async (name) => {
            const t = await page.locator(`span:has-text("${name}")`).first().locator('../span').nth(1).textContent();
            const m = t.match(/[\d.]+/);
            return m ? parseFloat(m[0]) : null;
          };
          run.ocr_confidence = await num('Confidence:');
          run.ocr_processing_time_seconds = await num('Processing Time:');
          run.detected_script = (
            await page.locator('span:has-text("Detected Script:")').first().locator('../span').nth(1).textContent()
          ).trim();
          if (run.ocr_text === '(No text detected)') run.ocr_text = '';
          run.ocr_status = 'success';
          console.log(`[${variant.id}] ${img.id} ok conf=${run.ocr_confidence} t=${run.ocr_processing_time_seconds}s chars=${run.ocr_text.length}`);
        } catch (e) {
          run.ocr_status = 'failed';
          run.error = e.message;
          console.error(`[${variant.id}] ${img.id} FAILED: ${e.message.split('\n')[0]}`);
        }
        runs.push(run);
      }
      // Persist after each variant so partial progress is never lost.
      writeFileSync(
        OUT,
        JSON.stringify(
          {
            phase: 'M8 Phase 4 - preprocessing OCR capture',
            started_at: startedAt,
            variants: VARIANTS,
            note: 'Raw OCR output only. Metrics: calculate-preprocessing-cer-wer.js. Preprocessing done in browser canvas; no files written.',
            runs,
          },
          null,
          2
        )
      );
    }
    expect(runs.length).toBe(VARIANTS.length * 12);
    expect(runs.filter((r) => r.ocr_status === 'success').length).toBeGreaterThan(0);
  });
});
