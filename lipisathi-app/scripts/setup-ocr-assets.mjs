#!/usr/bin/env node
/**
 * Prepares everything the OCR needs so the app runs without the internet:
 *   public/tesseract/{worker.min.js, tesseract-core.wasm.js, tesseract-core-simd.wasm.js}  <- copied from node_modules
 *   public/tessdata/<lang>.traineddata.gz                                                    <- downloaded once, SHA-256 verified
 *
 * Runs automatically before `npm run dev` and `npm run build`. Only missing/invalid files are fetched, so it is a no-op
 * afterwards. Needs the internet ONLY the first time the models are fetched.
 *
 * Env: LIPISATHI_LANGS=hin,tel,...   restrict the models (default: all OCR languages in config/languages.js, + extras below)
 *      LIPISATHI_MODEL_DIR=/path     use already-downloaded files from this folder instead of the network
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'fs';
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(resolve(root, 'scripts/tessdata-manifest.json'), 'utf8'));
const BASE_URL = 'https://tessdata.projectnaptha.com/4.0.0';
const DEFAULT_LANGS = ['hin', 'tel', 'tam', 'kan', 'mal', 'ben', 'guj', 'pan', 'ori', 'mar'];
const langs = (process.env.LIPISATHI_LANGS || DEFAULT_LANGS.join(',')).split(',').map((s) => s.trim()).filter(Boolean);

// 1. worker + core from node_modules (versions pinned by package-lock.json)
const tessDir = resolve(root, 'public/tesseract');
mkdirSync(tessDir, { recursive: true });
const copies = [
  ['node_modules/tesseract.js/dist/worker.min.js', 'worker.min.js'],
  ['node_modules/tesseract.js-core/tesseract-core.wasm.js', 'tesseract-core.wasm.js'],
  ['node_modules/tesseract.js-core/tesseract-core-simd.wasm.js', 'tesseract-core-simd.wasm.js'],
];
for (const [from, to] of copies) {
  const src = resolve(root, from);
  if (!existsSync(src)) {
    console.error(`setup-ocr: ${from} not found. Run "npm install" first.`);
    process.exit(1);
  }
  copyFileSync(src, resolve(tessDir, to));
}
console.log(`setup-ocr: copied ${copies.length} OCR engine files to public/tesseract/`);

// 2. models
const modelDir = resolve(root, 'public/tessdata');
mkdirSync(modelDir, { recursive: true });
const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const valid = (file, entry) => existsSync(file) && statSync(file).size === entry.bytes && sha256(file) === entry.sha256;

function download(url, dest) {
  try {
    const res = execFileSync('curl', ['-fsSL', '--retry', '3', '--max-time', '300', '-o', dest, url], { stdio: 'pipe' });
    return res !== null;
  } catch (e) {
    return false;
  }
}

let failed = 0;
for (const lang of langs) {
  const entry = manifest.models[lang];
  if (!entry) {
    console.error(`setup-ocr: no manifest entry for "${lang}"`);
    failed++;
    continue;
  }
  const dest = resolve(modelDir, `${lang}.traineddata.gz`);
  if (valid(dest, entry)) continue;
  const local = process.env.LIPISATHI_MODEL_DIR && resolve(process.env.LIPISATHI_MODEL_DIR, `${lang}.traineddata.gz`);
  if (local && existsSync(local)) copyFileSync(local, dest);
  else download(`${BASE_URL}/${lang}.traineddata.gz`, dest);
  if (valid(dest, entry)) console.log(`setup-ocr: ${lang}.traineddata.gz ok (${(entry.bytes / 1e6).toFixed(1)} MB)`);
  else {
    console.error(`setup-ocr: FAILED to obtain a valid ${lang}.traineddata.gz (needs the internet once, or set LIPISATHI_MODEL_DIR).`);
    failed++;
  }
}
if (failed) {
  console.error(`setup-ocr: ${failed} model(s) missing. The app still builds, but OCR for those languages will not work offline.`);
  // Soft-fail so a missing network does not block UI development; set LIPISATHI_STRICT=1 to fail hard (CI).
  if (process.env.LIPISATHI_STRICT === '1') process.exit(1);
}
