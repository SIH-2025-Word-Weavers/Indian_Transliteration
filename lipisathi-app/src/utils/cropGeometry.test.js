import { describe, it, expect } from 'vitest';
import {
  rectFromPoints,
  displayRectToNatural,
  padRect,
  isUsableCrop,
  bboxToPercent,
  MIN_CROP_DISPLAY_PX,
} from './cropGeometry';

describe('rectFromPoints', () => {
  it('orders the corners regardless of drag direction', () => {
    expect(rectFromPoints({ x: 50, y: 40 }, { x: 10, y: 10 }, 100, 100)).toEqual({ x: 10, y: 10, width: 40, height: 30 });
  });
  it('clamps to the displayed image', () => {
    expect(rectFromPoints({ x: -20, y: -5 }, { x: 150, y: 120 }, 100, 80)).toEqual({ x: 0, y: 0, width: 100, height: 80 });
  });
});

describe('displayRectToNatural', () => {
  it('scales display pixels to natural pixels', () => {
    const r = displayRectToNatural({ x: 10, y: 20, width: 50, height: 25 }, { width: 200, height: 100 }, { width: 2000, height: 1000 });
    expect(r).toEqual({ x: 100, y: 200, width: 500, height: 250 });
  });
  it('never leaves the natural image', () => {
    const r = displayRectToNatural({ x: 150, y: 80, width: 100, height: 100 }, { width: 200, height: 100 }, { width: 400, height: 200 });
    expect(r.x + r.width).toBeLessThanOrEqual(400);
    expect(r.y + r.height).toBeLessThanOrEqual(200);
  });
});

describe('padRect', () => {
  it('adds the fraction on every side (M8 used 5%)', () => {
    expect(padRect({ x: 100, y: 100, width: 200, height: 100 }, 0.05, { width: 1000, height: 1000 })).toEqual({
      x: 90, y: 95, width: 220, height: 110,
    });
  });
  it('stays inside the image near the edges', () => {
    const r = padRect({ x: 0, y: 0, width: 100, height: 100 }, 0.05, { width: 100, height: 100 });
    expect(r).toEqual({ x: 0, y: 0, width: 100, height: 100 });
  });
});

describe('isUsableCrop', () => {
  it('rejects accidental clicks and null', () => {
    expect(isUsableCrop(null)).toBe(false);
    expect(isUsableCrop({ x: 0, y: 0, width: 3, height: 3 })).toBe(false);
    expect(isUsableCrop({ x: 0, y: 0, width: MIN_CROP_DISPLAY_PX, height: 200 })).toBe(true);
  });
});

describe('bboxToPercent', () => {
  it('converts an OCR box to percentages of the image', () => {
    expect(bboxToPercent({ x0: 100, y0: 50, x1: 300, y1: 100 }, 1000, 500)).toEqual({ left: 10, top: 10, width: 20, height: 10 });
  });
});
