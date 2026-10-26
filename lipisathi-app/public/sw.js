/* LipiSathi service worker - makes the app (including OCR) work offline after the first load.
 *
 * - On install: pre-caches the app shell, the OCR engine and the Hindi + Telugu models.
 * - Same-origin GETs: cache-first (and cached after the first fetch, so other language models and the hashed
 *   JS/CSS bundles are available offline once they have been used online).
 * - Navigations: network-first, falling back to the cached app shell.
 * Bump CACHE_VERSION to invalidate old caches.
 */
const CACHE_VERSION = 'lipisathi-v1';
const PRECACHE = [
  './',
  'manifest.webmanifest',
  'icon.svg',
  'tesseract/worker.min.js',
  'tesseract/tesseract-core.wasm.js',
  'tesseract/tesseract-core-simd.wasm.js',
  'tessdata/hin.traineddata.gz',
  'tessdata/tel.traineddata.gz',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async (cache) => {
      // Tolerate a missing optional file (e.g. a language not bundled) without failing the whole install.
      await Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => undefined)));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never intercept other origins

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put('./', copy));
          return res;
        })
        .catch(() => caches.match('./'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
