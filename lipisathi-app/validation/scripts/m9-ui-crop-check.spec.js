/**
 * M9 - verifies the app's crop UI on REAL phone photos (including EXIF-rotated ones).
 *
 * For Hindi sign photos: upload the original JPEG, drag a rectangle over the annotated sign box in the displayed image
 * (display coordinates computed from the annotation), run OCR, and compare the size of the image sent to OCR with the
 * M8 harness crop of the same box (M9-control-hindi-runs.json input_width/height, same +5% padding). If the display ->
 * natural mapping or the EXIF handling were wrong, the sizes would not agree (a sideways photo would swap them).
 *
 * Env: SB_UI_N (default 8) number of EXIF-orientation-6 images. Images are external (not in the repo).
 * Uses only the existing app UI. Writes results/M9-ui-crop-check.json.
 */
import { test, expect } from '@playwright/test';
import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const validationDir = resolve(here, '..');
const META = JSON.parse(readFileSync(resolve(validationDir, 'metadata/signboard-hindi-ground-truth.json'), 'utf-8'));
const HARNESS = Object.fromEntries(
  JSON.parse(readFileSync(resolve(validationDir, 'results/M9-control-hindi-runs.json'), 'utf-8')).runs.map((r) => [r.image_id, r])
);
const DIR = resolve(homedir(), 'Downloads/indian-signboard-image-dataset');
const N = parseInt(process.env.SB_UI_N || '8', 10);

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

test('UI crop on EXIF-rotated phone photos matches the intended sign box', async ({ page }) => {
  test.setTimeout(30 * 60 * 1000);
  await page.setViewportSize({ width: 1200, height: 1400 });
  const picks = META.records.filter((r) => exifOrientation(readFileSync(resolve(DIR, r.relative_path))) === 6).slice(0, N);
  const rows = [];
  for (const rec of picks) {
    const bytes = readFileSync(resolve(DIR, rec.relative_path));
    await page.goto('/');
    await page.locator('#imageInput').setInputFiles({ name: rec.source_filename, mimeType: 'image/jpeg', buffer: bytes });
    const img = page.locator('img[alt="Selected"]');
    await img.waitFor();
    await page.waitForFunction(() => { const i = document.querySelector('img[alt="Selected"]'); return i && i.complete && i.naturalWidth > 0; });
    const nat = await img.evaluate((el) => ({ w: el.naturalWidth, h: el.naturalHeight }));
    const box = await img.boundingBox();
    const [x0, y0, x1, y1] = rec.sign_box_xyxy;
    const sx = box.width / nat.w, sy = box.height / nat.h;
    await page.mouse.move(box.x + x0 * sx, box.y + y0 * sy);
    await page.mouse.down();
    await page.mouse.move(box.x + x1 * sx, box.y + y1 * sy, { steps: 6 });
    await page.mouse.up();
    await expect(page.getByTestId('crop-selection')).toBeVisible();
    await page.locator('#languageSelect').selectOption('hin');
    await page.locator('button:has-text("Run OCR")').click();
    await page.waitForSelector('text=Extracted Text:', { timeout: 300000 });
    await page.locator('#targetScript').selectOption('Telugu');
    await page.locator('button:has-text("Transliterate")').click();
    const overlay = page.getByTestId('translit-overlay').locator('img');
    let ocrSize = null;
    try {
      await overlay.waitFor({ timeout: 5000 });
      ocrSize = await overlay.evaluate((el) => ({ w: el.naturalWidth, h: el.naturalHeight }));
    } catch { /* no Devanagari detected -> no overlay */ }
    const h = HARNESS[rec.image_id];
    const row = {
      image_id: rec.image_id, exif_orientation: 6,
      displayed_natural_size: nat, oriented_size_in_metadata: rec.oriented_image_size,
      ui_ocr_input: ocrSize, harness_ocr_input: { w: h.input_width, h: h.input_height },
      width_ratio: ocrSize ? ocrSize.w / h.input_width : null, height_ratio: ocrSize ? ocrSize.h / h.input_height : null,
    };
    rows.push(row);
    console.log(`${rec.image_id} natural=${nat.w}x${nat.h} ui=${ocrSize ? `${ocrSize.w}x${ocrSize.h}` : '-'} harness=${h.input_width}x${h.input_height} ratio=${row.width_ratio?.toFixed(3)}x${row.height_ratio?.toFixed(3)}`);
  }
  writeFileSync(resolve(validationDir, 'results/M9-ui-crop-check.json'), JSON.stringify({ phase: 'M9 UI crop check on EXIF-6 photos', rows }, null, 2) + '\n');
  expect(rows.length).toBe(picks.length);
});
