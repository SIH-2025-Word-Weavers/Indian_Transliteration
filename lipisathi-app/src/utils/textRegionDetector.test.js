import { describe, it, expect } from 'vitest';
import { suggestTextRegion, iou } from './textRegionDetector';

// Synthetic RGBA image: white background with a dense striped "text" block.
function makeImage(width, height, block) {
  const data = new Uint8ClampedArray(width * height * 4).fill(255);
  // small deterministic "sensor noise" so the background is not perfectly flat (real photos never are)
  for (let p = 0; p < width * height; p++) {
    const v = 245 + ((p * 2654435761) >>> 0) % 10;
    data[p * 4] = data[p * 4 + 1] = data[p * 4 + 2] = v;
  }
  for (let y = block.y; y < block.y + block.h; y++) {
    for (let x = block.x; x < block.x + block.w; x++) {
      const dark = (x % 6 < 3) !== (y % 10 < 5); // checker-ish pattern -> many edges
      const v = dark ? 0 : 255;
      const i = (y * width + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = v;
    }
  }
  return { data, width, height };
}

describe('suggestTextRegion', () => {
  it('finds a dense text-like block on a plain background', () => {
    const block = { x: 120, y: 80, w: 200, h: 60 };
    const img = makeImage(480, 270, block);
    const r = suggestTextRegion(img);
    expect(r).not.toBeNull();
    const truth = { x: block.x / 480, y: block.y / 270, width: block.w / 480, height: block.h / 270 };
    expect(iou(r, truth)).toBeGreaterThan(0.6);
  });

  it('returns null for a flat image (nothing to find)', () => {
    const img = { data: new Uint8ClampedArray(200 * 100 * 4).fill(200), width: 200, height: 100 };
    expect(suggestTextRegion(img)).toBeNull();
  });

  it('returns null for degenerate input', () => {
    expect(suggestTextRegion({ data: new Uint8ClampedArray(4), width: 1, height: 1 })).toBeNull();
    expect(suggestTextRegion({})).toBeNull();
  });
});

describe('iou', () => {
  it('is 1 for identical boxes, 0 for disjoint boxes, and fractional otherwise', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    expect(iou(a, a)).toBe(1);
    expect(iou(a, { x: 20, y: 20, width: 5, height: 5 })).toBe(0);
    expect(iou(a, { x: 5, y: 0, width: 10, height: 10 })).toBeCloseTo(1 / 3, 5);
  });
});
