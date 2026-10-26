/**
 * M9 - one-shot evaluation of the automatic sign-area suggestion (src/utils/textRegionDetector.js).
 *
 * PRE-REGISTERED BEFORE RUNNING (detector parameters were fixed in the source file, no tuning rounds):
 *   Data   : the 31 Hindi sign photos (dataset-annotated boxes) + 14 Telugu photos (AI-estimated, overlay-checked boxes).
 *   Metric : IoU between the suggested box and the annotated sign box, both in the EXIF-corrected image frame.
 *            Also "coverage" = share of the annotated box area that lies inside the suggestion.
 *   Bar    : the UI exposes the suggestion button ONLY IF IoU >= 0.5 on at least 50% of the 45 images.
 *            Otherwise the detector stays in the codebase, unexposed, and the failure is reported.
 *
 * Runs the detector in the real browser on images decoded by the browser (EXIF applied), downscaled to 512 px wide.
 * Env: none required; images are read from ~/Downloads (external, not stored in the repo).
 */
import { test, expect } from '@playwright/test';
import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const validationDir = resolve(here, '..');
const SETS = [
  { name: 'hindi', meta: 'signboard-hindi-ground-truth.json', dir: resolve(homedir(), 'Downloads/indian-signboard-image-dataset') },
  { name: 'telugu', meta: 'telugu-signs-ground-truth.json', dir: resolve(homedir(), 'Downloads/telugu_signboard_images') },
];
const OUT = resolve(validationDir, 'results/M9-region-suggestion-runs.json');

test('region suggestion vs annotated sign boxes', async ({ page }) => {
  test.setTimeout(30 * 60 * 1000);
  await page.goto('/');
  const results = [];
  for (const set of SETS) {
    const meta = JSON.parse(readFileSync(resolve(validationDir, 'metadata', set.meta), 'utf-8'));
    for (const rec of meta.records) {
      const b64 = readFileSync(resolve(set.dir, rec.relative_path)).toString('base64');
      const out = await page.evaluate(async ({ b64 }) => {
        const { suggestTextRegion } = await import('/src/utils/textRegionDetector.js');
        const img = new Image();
        img.src = `data:image/jpeg;base64,${b64}`;
        await img.decode();
        const scale = 512 / img.naturalWidth;
        const w = 512, h = Math.max(16, Math.round(img.naturalHeight * scale));
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, w, h);
        const t0 = performance.now();
        const box = suggestTextRegion(ctx.getImageData(0, 0, w, h));
        return { box, ms: performance.now() - t0, nw: img.naturalWidth, nh: img.naturalHeight };
      }, { b64 });

      const [x0, y0, x1, y1] = rec.sign_box_xyxy;
      const gt = { x: x0 / out.nw, y: y0 / out.nh, width: (x1 - x0) / out.nw, height: (y1 - y0) / out.nh };
      let iouVal = 0, coverage = 0;
      if (out.box) {
        const s = out.box;
        const ix = Math.max(0, Math.min(s.x + s.width, gt.x + gt.width) - Math.max(s.x, gt.x));
        const iy = Math.max(0, Math.min(s.y + s.height, gt.y + gt.height) - Math.max(s.y, gt.y));
        const inter = ix * iy;
        const union = s.width * s.height + gt.width * gt.height - inter;
        iouVal = union > 0 ? inter / union : 0;
        coverage = gt.width * gt.height > 0 ? inter / (gt.width * gt.height) : 0;
      }
      results.push({ set: set.name, image_id: rec.image_id, found: !!out.box, suggestion: out.box, annotated: gt, iou: iouVal, coverage, ms: out.ms });
      console.log(`${set.name} ${rec.image_id} iou=${iouVal.toFixed(2)} cov=${coverage.toFixed(2)} ${out.box ? '' : '(no suggestion)'}`);
    }
  }
  writeFileSync(OUT, JSON.stringify({ phase: 'M9 region suggestion (pre-registered, one-shot)', results }, null, 2) + '\n');
  expect(results.length).toBe(45);
});
