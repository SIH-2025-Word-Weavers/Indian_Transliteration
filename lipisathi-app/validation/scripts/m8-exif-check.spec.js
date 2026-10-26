/**
 * M8 closure - direct EXIF check (existing app UI, no app changes).
 *
 * For images whose EXIF orientation is 6, upload:
 *   A = original JPEG as-is
 *   B = same JPEG with ONLY the EXIF (APP1) segment removed (identical pixel data)
 * If the OCR path applied EXIF rotation, A and B would differ; identical output means EXIF is ignored.
 * Dataset files on disk are never modified (strip happens in memory).
 *
 * Env: SIGNBOARD_DATASET_DIR, SB_EXIF_N (default 5), SB_OUT.
 */
import { test, expect } from '@playwright/test';
import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const validationDir = resolve(here, '..');
const META = JSON.parse(readFileSync(resolve(validationDir, 'metadata/signboard-hindi-ground-truth.json'), 'utf-8'));
const DATA_DIR = process.env.SIGNBOARD_DATASET_DIR || resolve(homedir(), 'Downloads/indian-signboard-image-dataset');
const N = parseInt(process.env.SB_EXIF_N || '5', 10);
const OUT = process.env.SB_OUT || resolve(validationDir, 'results/M8-exif-check-runs.json');

function exifOrientation(buf) {
  let i = 2;
  while (i < buf.length && buf[i] === 0xff) {
    const m = buf[i + 1], len = buf.readUInt16BE(i + 2);
    if (m === 0xe1 && buf.toString('latin1', i + 4, i + 8) === 'Exif') {
      const t = i + 10, le = buf.toString('latin1', t, t + 2) === 'II';
      const r16 = (o) => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
      const r32 = (o) => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
      const ifd = t + r32(t + 4), n = r16(ifd);
      for (let k = 0; k < n; k++) if (r16(ifd + 2 + 12 * k) === 0x0112) return r16(ifd + 2 + 12 * k + 8);
      return 1;
    }
    i += 2 + len;
  }
  return null;
}
function stripExif(buf) {
  let i = 2; const parts = [buf.subarray(0, 2)];
  while (i < buf.length && buf[i] === 0xff) {
    const m = buf[i + 1];
    if (m === 0xda) break; // start of scan: copy the rest unchanged
    const len = buf.readUInt16BE(i + 2);
    if (!(m === 0xe1 && buf.toString('latin1', i + 4, i + 8) === 'Exif')) parts.push(buf.subarray(i, i + 2 + len));
    i += 2 + len;
  }
  parts.push(buf.subarray(i));
  return Buffer.concat(parts);
}

test('EXIF: original vs EXIF-stripped (identical pixels)', async ({ page }) => {
  test.setTimeout(60 * 60 * 1000);
  const picks = META.records.filter((r) => exifOrientation(readFileSync(resolve(DATA_DIR, r.relative_path))) === 6).slice(0, N);
  // Self-contained, same as m8-model-experiments.spec.js: worker/core from node_modules (same versions the app requests),
  // app-default model (tessdata .../4.0.0/) from /tmp/m8models/default (curl-downloaded); other external requests blocked.
  const nm = resolve(validationDir, '..', 'node_modules');
  const CORS = { 'access-control-allow-origin': '*' };
  await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
  await page.route(/tesseract\.js@[^/]+\/dist\/worker\.min\.js/, (route) =>
    route.fulfill({ status: 200, body: readFileSync(resolve(nm, 'tesseract.js/dist/worker.min.js')), headers: { 'content-type': 'application/javascript', ...CORS } }));
  await page.route(/tesseract\.js-core@[^/]+\/(tesseract-core[^/]*\.js)$/, (route) =>
    route.fulfill({ status: 200, body: readFileSync(resolve(nm, 'tesseract.js-core', route.request().url().split('/').pop())), headers: { 'content-type': 'application/javascript', ...CORS } }));
  await page.route('**/*.traineddata.gz', (route) => {
    const lang = route.request().url().match(/\/([a-z_]+)\.traineddata\.gz/)[1];
    return route.fulfill({ status: 200, body: readFileSync(resolve(process.env.M8_MODEL_DIR || '/tmp/m8models', 'default', `${lang}.traineddata.gz`)), headers: { 'content-type': 'application/gzip', ...CORS } });
  });

  const runs = [];
  for (const rec of picks) {
    const orig = readFileSync(resolve(DATA_DIR, rec.relative_path));
    const stripped = stripExif(orig);
    for (const [variant, buffer] of [['A_original_exif6', orig], ['B_exif_stripped', stripped]]) {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.locator('#imageInput').setInputFiles({ name: `${rec.image_id}.jpg`, mimeType: 'image/jpeg', buffer });
      await page.waitForSelector('img[alt="Selected"]', { timeout: 30000 });
      await page.locator('#languageSelect').selectOption('hin');
      await page.locator('button:has-text("Run OCR")').click();
      await page.waitForSelector('text=Extracted Text:', { timeout: 600000 });
      const label = page.locator('span:has-text("Extracted Text:")').first();
      const text = (await label.locator('../..').locator('div').nth(1).textContent()).trim();
      const conf = await page.locator('span:has-text("Confidence:")').first().locator('../span').nth(1).textContent();
      runs.push({ image_id: rec.image_id, variant, bytes: buffer.length, confidence: conf.trim(), ocr_text: text });
      console.log(`${rec.image_id} ${variant} bytes=${buffer.length} conf=${conf.trim()} chars=${text.length}`);
      writeFileSync(OUT, JSON.stringify({ phase: 'M8 closure - EXIF check', runs }, null, 2) + '\n');
    }
  }
  expect(runs.length).toBe(picks.length * 2);
});
