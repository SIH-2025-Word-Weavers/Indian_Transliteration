import { describe, it, expect } from 'vitest';
import { pickVoice, getSpeechLangForScript, speak, isSpeechSupported } from './speechService';
import { getSupportedScripts } from './transliterationService';

describe('pickVoice', () => {
  const voices = [
    { lang: 'en-US', name: 'English' },
    { lang: 'hi_IN', name: 'Hindi (underscore tag)' },
    { lang: 'te-IN', name: 'Telugu' },
    { lang: 'ta-LK', name: 'Tamil Sri Lanka' },
  ];
  it('prefers an exact language match', () => {
    expect(pickVoice(voices, 'te-IN').name).toBe('Telugu');
  });
  it('handles underscore tags', () => {
    expect(pickVoice(voices, 'hi-IN').name).toBe('Hindi (underscore tag)');
  });
  it('falls back to the same primary language', () => {
    expect(pickVoice(voices, 'ta-IN').name).toBe('Tamil Sri Lanka');
  });
  it('returns null when nothing matches', () => {
    expect(pickVoice(voices, 'ml-IN')).toBeNull();
    expect(pickVoice([], 'te-IN')).toBeNull();
    expect(pickVoice(voices, null)).toBeNull();
  });
});

describe('getSpeechLangForScript', () => {
  it('maps every script the transliteration service supports to a speech language', () => {
    for (const script of [...getSupportedScripts(), 'Devanagari']) {
      expect(getSpeechLangForScript(script), script).toMatch(/^[a-z]{2}-IN$/);
    }
  });
  it('returns null for unknown scripts', () => {
    expect(getSpeechLangForScript('Unknown')).toBeNull();
  });
});

describe('speak (outside a browser)', () => {
  it('reports that speech is unsupported instead of throwing', async () => {
    expect(isSpeechSupported()).toBe(false);
    const res = await speak('నమస్తే', 'te-IN');
    expect(res.ok).toBe(false);
    expect(res.reason).toMatch(/not supported/);
  });
});
