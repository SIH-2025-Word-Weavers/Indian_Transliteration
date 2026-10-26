import { test, expect } from '@playwright/test';

// Small phone viewport with touch: the whole flow must be usable and the page must not scroll sideways.
test.use({ viewport: { width: 360, height: 800 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });

test('360px phone: full flow is usable and the page has no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  const b64 = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 1000;
    c.height = 500;
    const x = c.getContext('2d');
    x.fillStyle = '#fff';
    x.fillRect(0, 0, 1000, 500);
    x.fillStyle = '#000';
    x.font = 'bold 150px "Kohinoor Devanagari", "Noto Sans Devanagari", sans-serif';
    x.fillText('भारत नगर', 60, 200);
    return c.toDataURL('image/png').split(',')[1];
  });
  await page.locator('#imageInput').setInputFiles({ name: 's.png', mimeType: 'image/png', buffer: Buffer.from(b64, 'base64') });
  await page.waitForSelector('img[alt="Selected"]');
  await page.locator('button:has-text("Run OCR")').click();
  await page.waitForSelector('text=Extracted Text:', { timeout: 60000 });
  await page.locator('#targetScript').selectOption('Telugu');
  await page.locator('button:has-text("Transliterate")').click(); // fails if another element overlaps the button
  await page.waitForSelector('text=Transliterated Text (Telugu):');

  const m = await page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth }));
  expect(m.scrollW).toBeLessThanOrEqual(m.clientW + 1);
});
