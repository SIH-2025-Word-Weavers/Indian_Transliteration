import { describe, it, expect, vi } from 'vitest';

// The real engine is a browser-only worker; these tests only check the path configuration.
vi.mock('tesseract.js', () => ({ createWorker: vi.fn() }));

import { assetUrl, getOcrPaths } from './ocrService';

describe('offline OCR asset paths', () => {
  it('builds absolute URLs (the Tesseract worker starts from a Blob URL, so relative paths would break)', () => {
    const { workerPath, corePath, langPath } = getOcrPaths();
    for (const p of [workerPath, corePath, langPath]) expect(p).toMatch(/^https?:\/\//);
  });

  it('points at the app\'s own files, never at a CDN', () => {
    const { workerPath, corePath, langPath } = getOcrPaths();
    expect(workerPath).toMatch(/\/tesseract\/worker\.min\.js$/);
    expect(corePath).toMatch(/\/tesseract$/);
    expect(langPath).toMatch(/\/tessdata$/);
    for (const p of [workerPath, corePath, langPath]) {
      expect(p).not.toMatch(/jsdelivr|unpkg|projectnaptha/);
    }
  });

  it('strips a trailing slash so Tesseract.js can append file names', () => {
    expect(assetUrl('tessdata/')).toMatch(/tessdata$/);
  });
});
