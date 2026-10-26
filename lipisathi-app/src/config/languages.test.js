import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { OCR_LANGUAGES, getLanguage, getLanguageName } from './languages';
import { getSupportedScripts } from '../services/transliterationService';
import { detectScript } from '../services/scriptDetectionService';

describe('OCR languages', () => {
  it('has unique codes and only two languages marked tested (the only ones measured in M8)', () => {
    const codes = OCR_LANGUAGES.map((l) => l.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(OCR_LANGUAGES.filter((l) => l.status === 'tested').map((l) => l.code)).toEqual(['hin', 'tel']);
    expect(OCR_LANGUAGES.filter((l) => l.status !== 'tested').every((l) => l.status === 'experimental')).toBe(true);
  });

  it('every language maps to a script the transliteration service can handle', () => {
    const supported = new Set([...getSupportedScripts(), 'Devanagari']);
    for (const lang of OCR_LANGUAGES) expect(supported.has(lang.script), lang.code).toBe(true);
  });

  it('script names match what script detection returns for that script', () => {
    const sample = {
      Devanagari: 'हिन्दी', Telugu: 'తెలుగు', Tamil: 'தமிழ்', Kannada: 'ಕನ್ನಡ', Malayalam: 'മലയാളം',
      Bengali: 'বাংলা', Gujarati: 'ગુજરાતી', Gurmukhi: 'ਪੰਜਾਬੀ', Odia: 'ଓଡ଼ିଆ',
    };
    for (const lang of OCR_LANGUAGES) expect(detectScript(sample[lang.script]), lang.code).toBe(lang.script);
  });

  it('every language has a bundled-model entry in the checksum manifest', () => {
    const manifest = JSON.parse(readFileSync(new URL('../../scripts/tessdata-manifest.json', import.meta.url), 'utf8'));
    for (const lang of OCR_LANGUAGES) {
      expect(manifest.models[lang.code], lang.code).toBeTruthy();
      expect(manifest.models[lang.code].sha256).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it('looks up names and falls back to the code', () => {
    expect(getLanguage('tel').script).toBe('Telugu');
    expect(getLanguageName('hin')).toBe('Hindi');
    expect(getLanguageName('zzz')).toBe('zzz');
  });
});
