/**
 * M8 follow-up - Signboard dataset OCR capture (Playwright, existing app UI, unmodified OCR pipeline).
 *
 * Images are NOT in this repo (license unknown). They are read from SIGNBOARD_DATASET_DIR
 * (default ~/Downloads/indian-signboard-image-dataset). Metadata: metadata/signboard-hindi-ground-truth.json.
 *
 * Variants (fixed before any run):
 *   full__raw          - the original JPEG uploaded exactly as the app would receive it (EXIF orientation untouched)
 *   full__oriented     - same photo, EXIF orientation applied via browser canvas, otherwise unchanged (lossless PNG)
 *   sign_box__oriented - the dataset's annotated signboard box (5% padding), cropped from the oriented photo
 *
 * Only raw OCR output is recorded. NO CER/WER here: the reference texts are AI drafts until a human verifies them.
 *
 * Env: SIGNBOARD_DATASET_DIR, SB_LIMIT (first N records), SB_OUT (output path override; default writes
 *      validation/results/M8-signboard-ocr-runs.json). Never touches the M7 result files.
 */
import { test, expect } from '@playwright/test';
import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const validationDir = resolve(here, '..');
// Extra env (defaults reproduce the Hindi signboard run exactly):
//   SB_META      metadata file name under validation/metadata (default signboard-hindi-ground-truth.json)
//   SB_VARIANTS  comma-separated variant ids to run (default: all three)
const META_NAME = process.env.SB_META || 'signboard-hindi-ground-truth.json';
const META = JSON.parse(readFileSync(resolve(validationDir, 'metadata', META_NAME), 'utf-8'));
const DATA_DIR = process.env.SIGNBOARD_DATASET_DIR || resolve(homedir(), 'Downloads/indian-signboard-image-dataset');
const DEFAULT_OUT = META_NAME === 'signboard-hindi-ground-truth.json' ? 'results/M8-signboard-ocr-runs.json' : 'results/M8-telugu-signs-ocr-runs.json';
const OUT = process.env.SB_OUT || resolve(validationDir, DEFAULT_OUT);
const LIMIT = process.env.SB_LIMIT ? parseInt(process.env.SB_LIMIT, 10) : META.records.length;
const RECORDS = META.records.slice(0, LIMIT);

const ALL_VARIANTS = [
  { id: 'full__raw', region: 'full', oriented: false },
  { id: 'full__oriented', region: 'full', oriented: true },
  { id: 'sign_box__oriented', region: 'sign_box', oriented: true },
];
const WANTED = process.env.SB_VARIANTS ? process.env.SB_VARIANTS.split(',') : null;
const VARIANTS = WANTED ? ALL_VARIANTS.filter((v) => WANTED.includes(v.id)) : ALL_VARIANTS;
const LANG_CODE = { Hindi: 'hin', Telugu: 'tel' };

/** Runs in the browser: decode (EXIF applied by the browser), optional crop, return lossless PNG. */
async function orientAndCrop(page, b64, box) {
  return page.evaluate(
    async ({ b64, box }) => {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${b64}`;
      await img.decode();
      let [x0, y0, x1, y1] = box || [0, 0, img.naturalWidth, img.naturalHeight];
      if (box) {
        const pw = (x1 - x0) * 0.05, ph = (y1 - y0) * 0.05;
        x0 = Math.max(0, Math.floor(x0 - pw)); y0 = Math.max(0, Math.floor(y0 - ph));
        x1 = Math.min(img.naturalWidth, Math.ceil(x1 + pw)); y1 = Math.min(img.naturalHeight, Math.ceil(y1 + ph));
      }
      const w = x1 - x0, h = y1 - y0;
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, x0, y0, w, h, 0, 0, w, h);
      return { b64: canvas.toDataURL('image/png').split(',')[1], width: w, height: h, natural: [img.naturalWidth, img.naturalHeight] };
    },
    { b64, box }
  );
}

test.describe('M8 follow-up: signboard OCR capture', () => {
  test('run 3 variants through the existing OCR UI', async ({ page }) => {
    test.setTimeout(4 * 60 * 60 * 1000);
    const runs = [];

    for (const variant of VARIANTS) {
      for (const rec of RECORDS) {
        const run = {
          variant_id: variant.id,
          image_id: rec.image_id,
          split: rec.split,
          language: rec.language,
          input_width: null,
          input_height: null,
          browser_natural_size: null,
          ocr_status: null,
          ocr_text: null,
          ocr_confidence: null,
          ocr_processing_time_seconds: null,
          detected_script: null,
          error: null,
        };
        try {
          const imagePath = resolve(DATA_DIR, rec.relative_path);
          await page.goto('/');
          await page.waitForLoadState('networkidle');
          const fileInput = page.locator('#imageInput');
          await expect(fileInput).toBeAttached();

          if (!variant.oriented) {
            await fileInput.setInputFiles(imagePath);
          } else {
            const bytes = readFileSync(imagePath);
            const out = await orientAndCrop(page, bytes.toString('base64'), variant.region === 'sign_box' ? rec.sign_box_xyxy : null);
            run.input_width = out.width;
            run.input_height = out.height;
            run.browser_natural_size = out.natural;
            await fileInput.setInputFiles({
              name: `${rec.image_id}__${variant.id}.png`,
              mimeType: 'image/png',
              buffer: Buffer.from(out.b64, 'base64'),
            });
          }
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
          console.log(`[${variant.id}] ${rec.image_id} ok conf=${run.ocr_confidence} t=${run.ocr_processing_time_seconds}s chars=${run.ocr_text.length} dims=${run.input_width ?? '-'}x${run.input_height ?? '-'}`);
        } catch (e) {
          run.ocr_status = 'failed';
          run.error = e.message;
          console.error(`[${variant.id}] ${rec.image_id} FAILED: ${e.message.split('\n')[0]}`);
        }
        runs.push(run);
        // Persist after every run so partial progress is never lost.
        writeFileSync(
          OUT,
          JSON.stringify(
            {
              phase: 'M8 follow-up - signboard OCR capture',
              note: 'Raw OCR output only. References are AI drafts pending human verification; no CER/WER computed.',
              dataset_root: 'external (SIGNBOARD_DATASET_DIR); images not stored in the repo',
              variants: VARIANTS,
              record_count: RECORDS.length,
              runs,
            },
            null,
            2
          ) + '\n'
        );
      }
    }
    expect(runs.length).toBe(VARIANTS.length * RECORDS.length);
    expect(runs.filter((r) => r.ocr_status === 'success').length).toBeGreaterThan(0);
  });
});
