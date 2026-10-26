/**
 * M8 closure - summary of the model x crop-upscale experiments.
 * Reads results/M8-model-<model>-<lang>-cer-wer.json (made by calculate-signboard-cer-wer.js, which refuses to run
 * unless all references are human_verified*), writes results/M8-model-experiments-summary.json/.md.
 * No new OCR and no new metric definitions: it only re-tabulates and pairs per-image values.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const rdir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'results');
const MODELS = ['default', 'fast', 'best'];
const LANGS = ['telugu', 'hindi'];
const VARS = ['sign_box__oriented', 'sign_box__upscale2x'];
const f = (x, d = 2) => (x == null ? '-' : Number(x).toFixed(d));
const load = (m, l) => JSON.parse(fs.readFileSync(path.join(rdir, `M8-model-${m}-${l}-cer-wer.json`), 'utf8'));

const out = { phase: 'M8 closure - model and crop-upscale experiments', note: 'Exploratory; references are owner-attested; n is small; CER/WER here are not accuracy.', languages: {} };
const L = ['# M8 closure: OCR model and crop-upscale experiments', '',
  'Exploratory, not a benchmark. References are owner-attested (see the ground-truth metadata). CER/WER are error rates, not accuracy; CER above 1 is valid because insertions dominate. Models: `default` is what the app loads (`.../4.0.0/`), `fast` = `4.0.0_fast`, `best` = `4.0.0_best`. Models were swapped inside the test by request interception; the app code is unchanged.', ''];

for (const lang of LANGS) {
  const data = Object.fromEntries(MODELS.map((m) => [m, load(m, lang)]));
  out.languages[lang] = { rows: [], paired: [] };
  L.push(`## ${lang[0].toUpperCase() + lang.slice(1)}`, '',
    '| Model | Crop | CER | filtered CER | reading errors (sub+del) / ref chars | word recall (found/ref) | chars emitted | mean conf | mean time s |',
    '|---|---|---:|---:|---:|---:|---:|---:|---:|');
  for (const m of MODELS) for (const v of VARS) {
    const vv = data[m].variants.find((x) => x.id === v); const u = vv.all.unfiltered, g = vv.all.filtered;
    const row = { model: m, variant: v, CER: u.corpus_CER, filtered_CER: g.corpus_CER, reading_errors: g.reading_errors_sub_plus_del, ref_chars_filtered: g.ref_chars,
      word_recall: u.word_recall, words_found: u.words_found, ref_words: u.ref_words, chars_emitted: u.ocr_chars_emitted, mean_conf: vv.mean_confidence, mean_time_s: vv.mean_time_s };
    out.languages[lang].rows.push(row);
    L.push(`| ${m} | ${v.replace('sign_box__', '')} | ${f(u.corpus_CER)} | ${f(g.corpus_CER)} | ${g.reading_errors_sub_plus_del} / ${g.ref_chars} | ${f(u.word_recall)} (${u.words_found}/${u.ref_words}) | ${u.ocr_chars_emitted} | ${f(vv.mean_confidence, 1)} | ${f(vv.mean_time_s, 2)} |`);
  }
  const per = (m, v) => Object.fromEntries(data[m].per_run.filter((p) => p.variant_id === v).map((p) => [p.image_id, p]));
  const pair = (label, A, B, key) => {
    let lower = 0, higher = 0, equal = 0;
    for (const id of Object.keys(A)) { const a = A[id][key].CER, b = B[id][key].CER; if (a < b) lower++; else if (a > b) higher++; else equal++; }
    out.languages[lang].paired.push({ comparison: label, metric: key, lower, higher, equal });
    return `| ${label} | ${key} | ${lower} | ${higher} | ${equal} |`;
  };
  L.push('', `Paired per-image CER (first lower = better): n = ${Object.keys(per('default', VARS[0])).length}`, '', '| Comparison | metric | first lower | first higher | equal |', '|---|---|---:|---:|---:|');
  for (const key of ['unfiltered', 'filtered']) {
    L.push(pair('best vs default (crop)', per('best', VARS[0]), per('default', VARS[0]), key));
    L.push(pair('best vs fast (crop)', per('best', VARS[0]), per('fast', VARS[0]), key));
    L.push(pair('default vs fast (crop)', per('default', VARS[0]), per('fast', VARS[0]), key));
    for (const m of MODELS) L.push(pair(`${m}: upscale2x vs crop`, per(m, VARS[1]), per(m, VARS[0]), key));
  }
  L.push('');
}
fs.writeFileSync(path.join(rdir, 'M8-model-experiments-summary.json'), JSON.stringify(out, null, 2) + '\n');
fs.writeFileSync(path.join(rdir, 'M8-model-experiments-summary.md'), L.join('\n') + '\n');
console.log(L.join('\n'));
