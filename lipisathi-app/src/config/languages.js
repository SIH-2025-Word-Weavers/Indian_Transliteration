/**
 * OCR languages offered by the app.
 *
 * `status` is deliberately honest:
 *   - 'tested'       : run on real sign photos in the M8 experiments (small datasets, results are weak; see
 *                      validation/results/M8-closure-summary.md). Hindi reads partly, Telugu almost nothing.
 *   - 'experimental' : the Tesseract model is bundled and loads, but NO accuracy testing was done for it.
 *
 * `ttsLang` is the BCP-47 tag used to look up a speech voice for the language's script.
 */
export const OCR_LANGUAGES = [
  { code: 'hin', label: 'Hindi (हिन्दी)', script: 'Devanagari', ttsLang: 'hi-IN', status: 'tested' },
  { code: 'tel', label: 'Telugu (తెలుగు)', script: 'Telugu', ttsLang: 'te-IN', status: 'tested' },
  { code: 'tam', label: 'Tamil (தமிழ்)', script: 'Tamil', ttsLang: 'ta-IN', status: 'experimental' },
  { code: 'kan', label: 'Kannada (ಕನ್ನಡ)', script: 'Kannada', ttsLang: 'kn-IN', status: 'experimental' },
  { code: 'mal', label: 'Malayalam (മലയാളം)', script: 'Malayalam', ttsLang: 'ml-IN', status: 'experimental' },
  { code: 'ben', label: 'Bengali (বাংলা)', script: 'Bengali', ttsLang: 'bn-IN', status: 'experimental' },
  { code: 'guj', label: 'Gujarati (ગુજરાતી)', script: 'Gujarati', ttsLang: 'gu-IN', status: 'experimental' },
  { code: 'pan', label: 'Punjabi (ਪੰਜਾਬੀ)', script: 'Gurmukhi', ttsLang: 'pa-IN', status: 'experimental' },
  { code: 'ori', label: 'Odia (ଓଡ଼ିଆ)', script: 'Odia', ttsLang: 'or-IN', status: 'experimental' },
  { code: 'mar', label: 'Marathi (मराठी)', script: 'Devanagari', ttsLang: 'mr-IN', status: 'experimental' },
];

/** Speech language for each script the transliteration service supports. */
export const SCRIPT_TTS_LANG = {
  Devanagari: 'hi-IN',
  Telugu: 'te-IN',
  Tamil: 'ta-IN',
  Kannada: 'kn-IN',
  Malayalam: 'ml-IN',
  Bengali: 'bn-IN',
  Gujarati: 'gu-IN',
  Gurmukhi: 'pa-IN',
  Odia: 'or-IN',
};

export function getLanguage(code) {
  return OCR_LANGUAGES.find((l) => l.code === code) || null;
}

/** Display name for an OCR language code; falls back to the code itself. */
export function getLanguageName(code) {
  const lang = getLanguage(code);
  return lang ? lang.label.split(' (')[0] : code;
}
