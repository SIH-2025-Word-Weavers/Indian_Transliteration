import { describe, it, expect } from 'vitest';
import { transliterate, getSupportedScripts } from './transliterationService.js';

describe('transliterationService', () => {
  // Basic Hub-and-Spoke Tests
  describe('Devanagari → Other Scripts', () => {
    it('should transliterate Devanagari to Telugu', () => {
      const result = transliterate('नमस्ते', 'Telugu', 'Devanagari');
      expect(result).toBe('నమస్తే');
    });

    it('should transliterate Devanagari to Tamil', () => {
      const result = transliterate('नमस्', 'Tamil', 'Devanagari');
      expect(result).toContain('ன'); // Tamil approximations
    });

    it('should transliterate Devanagari to Kannada', () => {
      const result = transliterate('नमस्', 'Kannada', 'Devanagari');
      expect(result).toContain('ನ');
    });

    it('should transliterate Devanagari to Malayalam', () => {
      const result = transliterate('नमस्', 'Malayalam', 'Devanagari');
      expect(result).toContain('ന');
    });

    it('should transliterate Devanagari to Gurmukhi', () => {
      const result = transliterate('नमस्', 'Gurmukhi', 'Devanagari');
      expect(result).toContain('ਨ');
    });

    it('should transliterate Devanagari to Bengali', () => {
      const result = transliterate('नमस्', 'Bengali', 'Devanagari');
      expect(result).toContain('ন');
    });

    it('should transliterate Devanagari to Gujarati', () => {
      const result = transliterate('नमस्', 'Gujarati', 'Devanagari');
      expect(result).toContain('ન');
    });

    it('should transliterate Devanagari to Odia', () => {
      const result = transliterate('नमस्', 'Odia', 'Devanagari');
      expect(result).toContain('ନ');
    });
  });

  describe('Other Scripts → Devanagari', () => {
    it('should transliterate Telugu to Devanagari', () => {
      const result = transliterate('నమస్కారం', 'Devanagari', 'Telugu');
      expect(result).toBe('नमस्कारं');
    });

    it('should transliterate Tamil to Devanagari', () => {
      const result = transliterate('வணக்கம்', 'Devanagari', 'Tamil');
      expect(result).toContain('व');
    });

    it('should transliterate Kannada to Devanagari', () => {
      const result = transliterate('ನಮಸ್ಕಾರ', 'Devanagari', 'Kannada');
      expect(result).toContain('नम');
    });

    it('should transliterate Malayalam to Devanagari', () => {
      const result = transliterate('നമസ്കാരം', 'Devanagari', 'Malayalam');
      expect(result).toContain('नम');
    });

    it('should transliterate Gurmukhi to Devanagari', () => {
      const result = transliterate('ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ', 'Devanagari', 'Gurmukhi');
      expect(result).toContain('सति');
    });

    it('should transliterate Bengali to Devanagari', () => {
      const result = transliterate('নমস্কার', 'Devanagari', 'Bengali');
      expect(result).toContain('नमस');
    });

    it('should transliterate Gujarati to Devanagari', () => {
      const result = transliterate('નમસ્તે', 'Devanagari', 'Gujarati');
      expect(result).toContain('नमस');
    });

    it('should transliterate Odia to Devanagari', () => {
      const result = transliterate('ନମସ୍କାର', 'Devanagari', 'Odia');
      expect(result).toContain('नमस');
    });
  });

  describe('Cross-Script Transliteration', () => {
    it('should transliterate Telugu to Tamil', () => {
      const result = transliterate('నమస్కారం', 'Tamil', 'Telugu');
      expect(result).toContain('ன');
    });

    it('should transliterate Kannada to Telugu', () => {
      const result = transliterate('ನಮಸ್ಕಾರ', 'Telugu', 'Kannada');
      expect(result).toContain('న');
    });

    it('should transliterate Bengali to Tamil', () => {
      const result = transliterate('নমস্কার', 'Tamil', 'Bengali');
      expect(result).toContain('ன');
    });

    it('should transliterate Malayalam to Kannada', () => {
      const result = transliterate('നമസ്കാരം', 'Kannada', 'Malayalam');
      expect(result).toContain('ನ');
    });
  });

  describe('Same-Script Behavior', () => {
    it('should return original text for Telugu → Telugu', () => {
      const text = 'నమస్కారం';
      const result = transliterate(text, 'Telugu', 'Telugu');
      expect(result).toBe(text);
    });

    it('should return original text for Devanagari → Devanagari', () => {
      const text = 'नमस्ते';
      const result = transliterate(text, 'Devanagari', 'Devanagari');
      expect(result).toBe(text);
    });

    it('should return original text for Tamil → Tamil', () => {
      const text = 'வணக்கம்';
      const result = transliterate(text, 'Tamil', 'Tamil');
      expect(result).toBe(text);
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('should return empty string for empty input', () => {
      const result = transliterate('', 'Telugu', 'Devanagari');
      expect(result).toBe('');
    });

    it('should preserve whitespace', () => {
      const result = transliterate('   ', 'Telugu', 'Devanagari');
      expect(result).toBe('   ');
    });

    it('should preserve numbers', () => {
      const result = transliterate('123 456', 'Telugu', 'Devanagari');
      expect(result).toContain('123');
      expect(result).toContain('456');
    });

    it('should preserve punctuation', () => {
      const result = transliterate('.,!?', 'Telugu', 'Devanagari');
      expect(result).toBe('.,!?');
    });

    it('should preserve English text', () => {
      const result = transliterate('Hello World', 'Telugu', 'Devanagari');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('should handle mixed text (Indic + English)', () => {
      const result = transliterate('नमस्ते Hello', 'Telugu', 'Devanagari');
      expect(result).toContain('నమస');
      expect(result).toContain('Hello');
    });

    it('should preserve unmapped characters', () => {
      const result = transliterate('नमस्ते@#$', 'Telugu', 'Devanagari');
      expect(result).toContain('@');
      expect(result).toContain('#');
      expect(result).toContain('$');
    });
  });

  // Exception Dictionary Tests
  describe('Exception Dictionary', () => {
    it('should use exception dictionary for "lipisathi" (lowercase)', () => {
      const result = transliterate('lipisathi', 'Devanagari', 'Telugu');
      expect(result).toBe('लिपिसाथी');
    });

    it('should use exception dictionary for "LipiSathi" (mixed case)', () => {
      const result = transliterate('LipiSathi', 'Devanagari', 'Telugu');
      expect(result).toBe('लिपिसाथी');
    });

    it('should use exception dictionary for "LIPISATHI" (uppercase)', () => {
      const result = transliterate('LIPISATHI', 'Telugu', 'Devanagari');
      expect(result).toBe('లిపిసాథి');
    });

    it('should use exception dictionary for "google" (lowercase)', () => {
      const result = transliterate('google', 'Devanagari', 'Telugu');
      expect(result).toBe('गूगल');
    });

    it('should use exception dictionary for "Google" (capitalized)', () => {
      const result = transliterate('Google', 'Telugu', 'Devanagari');
      expect(result).toBe('గూగుల్');
    });

    it('should use exception dictionary for "GOOGLE" (uppercase)', () => {
      const result = transliterate('GOOGLE', 'Devanagari', 'Telugu');
      expect(result).toBe('गूगल');
    });
  });

  // Language-Specific Rules Tests
  describe('Hindi Language Rules', () => {
    it('should apply Schwa deletion for Hindi (consonant-ending word)', () => {
      // Telugu "రామ" → Devanagari "राम"
      // With Hindi rules: "राम" → "राम्" (halant added)
      const result = transliterate('రామ', 'Devanagari', 'Telugu', 'Hindi');
      expect(result).toBe('राम्');
    });

    it('should NOT apply Schwa deletion without targetLanguage', () => {
      // Telugu "రామ" → Devanagari "राम"
      // Without Hindi rules: remains "राम"
      const result = transliterate('రామ', 'Devanagari', 'Telugu');
      expect(result).toBe('राम');
    });

    it('should apply Schwa deletion to multi-word text', () => {
      // Test with space-separated words
      const result = transliterate('రామ నమస్కారం', 'Devanagari', 'Telugu', 'Hindi');
      expect(result).toContain('राम्');
      expect(result).toContain('नमस्कारं');
    });

    it('should replace ळ with ल in Hindi', () => {
      // Create text with ळ character
      const result = transliterate('ळ', 'Devanagari', 'Devanagari', 'Hindi');
      expect(result).toBe('ल');
    });

    it('should NOT apply ळ→ल replacement without targetLanguage', () => {
      const result = transliterate('ळ', 'Devanagari', 'Devanagari');
      expect(result).toBe('ळ');
    });

    it('should apply both Hindi rules together', () => {
      // Text with both consonant ending and ळ
      const text = 'ळनमस';
      const result = transliterate(text, 'Devanagari', 'Devanagari', 'Hindi');
      expect(result).toBe('लनमस्'); // ळ→ल, halant added to final स
    });

    it('should NOT apply Hindi rules to non-Hindi target language', () => {
      // When targetLanguage is not Hindi, rules should not be applied
      const result = transliterate('రామ', 'Devanagari', 'Telugu', 'Marathi');
      expect(result).toBe('राम'); // No halant, Marathi has no rules implemented
    });
  });

  // Error Handling
  describe('Error Handling', () => {
    it('should return error for Unknown source script', () => {
      const result = transliterate('text', 'Telugu', 'Unknown');
      expect(result).toContain('❌');
    });

    it('should return error for missing target script', () => {
      const result = transliterate('text', '', 'Devanagari');
      expect(result).toContain('❌');
    });

    it('should return error for invalid source script', () => {
      const result = transliterate('text', 'Telugu', 'InvalidScript');
      expect(result).toContain('❌');
    });
  });

  // getSupportedScripts Function
  describe('getSupportedScripts', () => {
    it('should return array of supported scripts', () => {
      const scripts = getSupportedScripts();
      expect(Array.isArray(scripts)).toBe(true);
      expect(scripts.length).toBeGreaterThan(0);
    });

    it('should include all 8 supported scripts', () => {
      const scripts = getSupportedScripts();
      expect(scripts).toContain('Telugu');
      expect(scripts).toContain('Tamil');
      expect(scripts).toContain('Kannada');
      expect(scripts).toContain('Malayalam');
      expect(scripts).toContain('Gurmukhi');
      expect(scripts).toContain('Bengali');
      expect(scripts).toContain('Gujarati');
      expect(scripts).toContain('Odia');
    });
  });
});
