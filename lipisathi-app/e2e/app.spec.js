import { test, expect } from '@playwright/test';

/**
 * End-to-end checks of the real app in a real browser.
 * The test image is rendered in the page (large Devanagari text on white), so no external image is needed.
 * These prove the pipeline works end to end (crop -> OCR -> transliterate -> overlay -> speak, offline).
 * They do NOT measure OCR accuracy (see validation/results/M8-closure-summary.md for that).
 */

const SIGN_TEXT = 'भारत नगर';

async function makeSignPng(page) {
  const b64 = await page.evaluate(async (text) => {
    await document.fonts.ready;
    const c = document.createElement('canvas');
    c.width = 1000;
    c.height = 500;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    // decoy block outside the sign area
    ctx.fillStyle = '#888';
    ctx.fillRect(0, 380, 1000, 120);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 170px "Kohinoor Devanagari", "Devanagari Sangam MN", "Noto Sans Devanagari", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 60, 190);
    return c.toDataURL('image/png').split(',')[1];
  }, SIGN_TEXT);
  return Buffer.from(b64, 'base64');
}

async function upload(page, buffer) {
  await page.locator('#imageInput').setInputFiles({ name: 'sign.png', mimeType: 'image/png', buffer });
  await page.waitForSelector('img[alt="Selected"]');
}

async function runOcr(page) {
  await page.locator('button:has-text("Run OCR")').click();
  await page.waitForSelector('text=Extracted Text:', { timeout: 120000 });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('offers 10 OCR languages, a camera input, and honest notices', async ({ page }) => {
  await expect(page.locator('#languageSelect option')).toHaveCount(10);
  const camera = page.locator('#cameraInput');
  await expect(camera).toHaveAttribute('capture', 'environment');
  await page.locator('#languageSelect').selectOption('tel');
  await expect(page.getByText('Telugu sign reading is unproven')).toBeVisible();
  await page.locator('#languageSelect').selectOption('tam');
  await expect(page.getByText('was not tested on real signs')).toBeVisible();
});

test('crop -> OCR -> transliterate -> overlay, with no request leaving localhost', async ({ page }) => {
  const external = [];
  page.on('request', (r) => {
    const u = r.url();
    if (!u.startsWith('http://localhost') && !u.startsWith('data:') && !u.startsWith('blob:')) external.push(u);
  });

  await upload(page, await makeSignPng(page));

  // Drag a rectangle around the text (top-left area of the displayed image)
  const img = page.locator('img[alt="Selected"]');
  const box = await img.boundingBox();
  await page.mouse.move(box.x + box.width * 0.02, box.y + box.height * 0.08);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.62, box.y + box.height * 0.62, { steps: 5 });
  await page.mouse.up();
  await expect(page.getByTestId('crop-selection')).toBeVisible();
  await expect(page.getByText('Only the selected area will be read')).toBeVisible();

  await runOcr(page);
  await expect(page.getByText('Detected Script:').locator('..').locator('span').nth(1)).toHaveText('Devanagari');

  await page.locator('#targetScript').selectOption('Telugu');
  await page.locator('button:has-text("Transliterate")').click();
  await page.waitForSelector('text=Transliterated Text (Telugu):');
  const translit = await page.locator('text=Transliterated Text (Telugu):').locator('../..').innerText();
  expect(translit).toMatch(/[\u0C00-\u0C7F]/); // Telugu characters were produced

  // Overlay shows the *cropped* image that was sent to OCR (smaller than the 1000x500 original)
  const overlay = page.getByTestId('translit-overlay').locator('img');
  await expect(overlay).toBeVisible();
  const natural = await overlay.evaluate((el) => ({ w: el.naturalWidth, h: el.naturalHeight }));
  expect(natural.w).toBeLessThan(1000);
  expect(natural.h).toBeLessThan(500);

  expect(external, `unexpected external requests: ${external.join(', ')}`).toEqual([]);
});

test('whole image works without a crop and "Use whole image" clears the selection', async ({ page }) => {
  await upload(page, await makeSignPng(page));
  const box = await page.locator('img[alt="Selected"]').boundingBox();
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 200, box.y + 120, { steps: 3 });
  await page.mouse.up();
  await expect(page.getByTestId('crop-selection')).toBeVisible();
  await page.getByText('Use whole image').click();
  await expect(page.getByTestId('crop-selection')).toHaveCount(0);
  await runOcr(page);
  await expect(page.getByText('Detected Script:')).toBeVisible();
});

test('a tiny accidental drag does not create a crop', async ({ page }) => {
  await upload(page, await makeSignPng(page));
  const box = await page.locator('img[alt="Selected"]').boundingBox();
  await page.mouse.move(box.x + 30, box.y + 30);
  await page.mouse.down();
  await page.mouse.move(box.x + 33, box.y + 33);
  await page.mouse.up();
  await expect(page.getByTestId('crop-selection')).toHaveCount(0);
});

test('speech: speaks the transliteration with a matching voice (browser speech stubbed)', async ({ page }) => {
  await page.addInitScript(() => {
    window.__spoken = [];
    const voices = [{ lang: 'te-IN', name: 'Test Telugu', default: false, localService: true, voiceURI: 'te' }];
    window.SpeechSynthesisUtterance = function (text) { this.text = text; };
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => voices,
        addEventListener: () => {},
        cancel: () => {},
        speak: (u) => window.__spoken.push({ text: u.text, lang: u.lang, voice: u.voice && u.voice.name }),
      },
    });
  });
  await page.goto('/');
  await upload(page, await makeSignPng(page));
  await runOcr(page);
  await page.locator('#targetScript').selectOption('Telugu');
  await page.locator('button:has-text("Transliterate")').click();
  await page.waitForSelector('text=Transliterated Text (Telugu):');
  await page.getByText('🔊 Speak').last().click();
  await expect.poll(() => page.evaluate(() => window.__spoken.length)).toBe(1);
  const spoken = await page.evaluate(() => window.__spoken[0]);
  expect(spoken.lang).toBe('te-IN');
  expect(spoken.text).toMatch(/[\u0C00-\u0C7F]/);
});

test('speech: explains when no voice is installed', async ({ page }) => {
  await page.addInitScript(() => {
    window.SpeechSynthesisUtterance = function (text) { this.text = text; };
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { getVoices: () => [], addEventListener: () => {}, cancel: () => {}, speak: () => {} },
    });
  });
  await page.goto('/');
  await upload(page, await makeSignPng(page));
  await runOcr(page);
  await page.locator('#targetScript').selectOption('Telugu');
  await page.locator('button:has-text("Transliterate")').click();
  await page.waitForSelector('text=Transliterated Text (Telugu):');
  await page.getByText('🔊 Speak').last().click();
  await expect(page.getByText('No te-IN voice is installed')).toBeVisible({ timeout: 10000 });
});

test('works with the network switched off (service worker + local OCR engine and models)', async ({ page, context }) => {
  // 1. first visit online: let the service worker install and take control
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  // warm the cache with one OCR run (loads worker, core and the Hindi model through the page)
  await upload(page, await makeSignPng(page));
  await runOcr(page);

  // 2. offline: reload the app shell and run OCR again
  await context.setOffline(true);
  await page.reload();
  await upload(page, await makeSignPng(page));
  await runOcr(page);
  await expect(page.getByText('Detected Script:').locator('..').locator('span').nth(1)).toHaveText('Devanagari');
  await context.setOffline(false);
});
