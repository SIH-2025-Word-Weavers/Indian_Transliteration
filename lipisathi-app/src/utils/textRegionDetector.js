/**
 * Suggests where the sign/text is in a photo: local edge-density clustering (no ML model, no dependency).
 *
 *   1. gray -> Sobel gradient magnitude -> mark the strongest 20% of pixels as "edges"
 *   2. split the image into a grid of cells (~40 columns); each cell's density = fraction of its pixels that are edges
 *   3. keep cells whose density is above (mean + 1.0 x standard deviation) of all cell densities
 *   4. connect kept cells (4-neighbour, plus one cell of horizontal bridging so letters/words of a line join up)
 *   5. score each connected group by the sum of its cell densities; return the best group's bounding box
 *      (normalised 0..1), ignoring groups that cover under 1% or over 85% of the image
 *
 * PRE-REGISTERED (fixed before any evaluation on sign images, no tuning afterwards): see DETECTOR_PARAMS.
 * (Revision note: a first version dilated the raw edge map; a synthetic test showed that merges all background texture
 * into one image-sized blob, so it was replaced by this cell-density version BEFORE any real image was evaluated.)
 * It is evaluated once against annotated sign boxes in validation/results/M9-region-suggestion.md; the UI only exposes
 * it if that evaluation meets the bar written there.
 *
 * Input: {data: Uint8ClampedArray RGBA, width, height} - callers should downscale to roughly 400-640 px wide first.
 */

export const DETECTOR_PARAMS = Object.freeze({
  EDGE_PERCENTILE: 0.8,
  GRID_COLUMNS: 40,
  STD_K: 1.0,
  MIN_AREA_FRACTION: 0.01,
  MAX_AREA_FRACTION: 0.85,
});

/** @returns {{x:number,y:number,width:number,height:number,score:number}|null} normalised box (0..1) or null */
export function suggestTextRegion({ data, width, height }, params = DETECTOR_PARAMS) {
  if (!data || width < 16 || height < 16) return null;
  const n = width * height;

  const gray = new Float32Array(n);
  for (let i = 0; i < n; i++) gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];

  const mag = new Float32Array(n);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const gx = gray[i - width + 1] + 2 * gray[i + 1] + gray[i + width + 1] - gray[i - width - 1] - 2 * gray[i - 1] - gray[i + width - 1];
      const gy = gray[i + width - 1] + 2 * gray[i + width] + gray[i + width + 1] - gray[i - width - 1] - 2 * gray[i - width] - gray[i - width + 1];
      mag[i] = Math.abs(gx) + Math.abs(gy);
    }
  }

  const sorted = Float32Array.from(mag).sort();
  const threshold = sorted[Math.floor(params.EDGE_PERCENTILE * (n - 1))];
  if (!(threshold > 0)) return null; // flat image: no edges to cluster

  // cell grid
  const cell = Math.max(4, Math.round(width / params.GRID_COLUMNS));
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const density = new Float32Array(cols * rows);
  const area = new Float32Array(cols * rows);
  for (let y = 0; y < height; y++) {
    const cy = (y / cell) | 0;
    for (let x = 0; x < width; x++) {
      const c = cy * cols + ((x / cell) | 0);
      area[c]++;
      if (mag[y * width + x] > threshold) density[c]++;
    }
  }
  let sum = 0;
  for (let c = 0; c < density.length; c++) {
    density[c] /= area[c];
    sum += density[c];
  }
  const mean = sum / density.length;
  let varSum = 0;
  for (let c = 0; c < density.length; c++) varSum += (density[c] - mean) ** 2;
  const cutoff = mean + params.STD_K * Math.sqrt(varSum / density.length);

  const active = new Uint8Array(density.length);
  for (let c = 0; c < density.length; c++) active[c] = density[c] > cutoff ? 1 : 0;

  // connected groups of active cells; horizontal neighbours bridge one empty cell
  const seen = new Uint8Array(density.length);
  const stack = [];
  let best = null;
  for (let start = 0; start < active.length; start++) {
    if (!active[start] || seen[start]) continue;
    seen[start] = 1;
    stack.push(start);
    let minC = cols, maxC = 0, minR = rows, maxR = 0, score = 0;
    while (stack.length) {
      const c = stack.pop();
      const cx = c % cols;
      const cy = (c / cols) | 0;
      if (cx < minC) minC = cx;
      if (cx > maxC) maxC = cx;
      if (cy < minR) minR = cy;
      if (cy > maxR) maxR = cy;
      score += density[c];
      const neighbours = [
        cx > 0 ? c - 1 : -1,
        cx < cols - 1 ? c + 1 : -1,
        cy > 0 ? c - cols : -1,
        cy < rows - 1 ? c + cols : -1,
        cx > 1 && !active[c - 1] ? c - 2 : -1, // bridge a one-cell horizontal gap
        cx < cols - 2 && !active[c + 1] ? c + 2 : -1,
      ];
      for (const nb of neighbours) {
        if (nb >= 0 && active[nb] && !seen[nb]) {
          seen[nb] = 1;
          stack.push(nb);
        }
      }
    }
    const areaFraction = ((maxC - minC + 1) * (maxR - minR + 1) * cell * cell) / n;
    if (areaFraction < params.MIN_AREA_FRACTION || areaFraction > params.MAX_AREA_FRACTION) continue;
    if (!best || score > best.score) best = { minC, maxC, minR, maxR, score };
  }
  if (!best) return null;

  const x0 = best.minC * cell;
  const y0 = best.minR * cell;
  const x1 = Math.min(width, (best.maxC + 1) * cell);
  const y1 = Math.min(height, (best.maxR + 1) * cell);
  return { x: x0 / width, y: y0 / height, width: (x1 - x0) / width, height: (y1 - y0) / height, score: best.score };
}

/** Intersection-over-union of two boxes {x,y,width,height} in the same units. */
export function iou(a, b) {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = a.width * a.height + b.width * b.height - inter;
  return union > 0 ? inter / union : 0;
}
