import { describe, it, expect } from 'vitest';
import { detectScript } from './scriptDetectionService.js';

describe('scriptDetectionService', () => {
  // Test all 9 supported scripts
  describe('Individual Script Detection', () => {
    it('should detect Telugu script', () => {
      const result = detectScript('నమస్కారం');
      expect(result).toBe('Telugu');
    });

    it('should detect Devanagari script', () => {
      const result = detectScript('नमस्ते');
      expect(result).toBe('Devanagari');
    });

    it('should detect Tamil script', () => {
      const result = detectScript('வணக்கம்');
      expect(result).toBe('Tamil');
    });

    it('should detect Malayalam script', () => {
      const result = detectScript('നമസ്കാരം');
      expect(result).toBe('Malayalam');
    });

    it('should detect Gurmukhi script', () => {
      const result = detectScript('ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ');
      expect(result).toBe('Gurmukhi');
    });

    it('should detect Kannada script', () => {
      const result = detectScript('ನಮಸ್ಕಾರ');
      expect(result).toBe('Kannada');
    });

    it('should detect Bengali script', () => {
      const result = detectScript('নমস্কার');
      expect(result).toBe('Bengali');
    });

    it('should detect Gujarati script', () => {
      const result = detectScript('નમસ્તે');
      expect(result).toBe('Gujarati');
    });

    it('should detect Odia script', () => {
      const result = detectScript('ନମସ୍କାର');
      expect(result).toBe('Odia');
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('should return "Unknown" for empty string', () => {
      const result = detectScript('');
      expect(result).toBe('Unknown');
    });

    it('should return "Unknown" for whitespace only', () => {
      const result = detectScript('   ');
      expect(result).toBe('Unknown');
    });

    it('should return "Unknown" for English text', () => {
      const result = detectScript('Hello World');
      expect(result).toBe('Unknown');
    });

    it('should return "Unknown" for numbers only', () => {
      const result = detectScript('123456');
      expect(result).toBe('Unknown');
    });

    it('should return "Unknown" for punctuation only', () => {
      const result = detectScript('.,!?');
      expect(result).toBe('Unknown');
    });

    it('should return "Unknown" for special characters', () => {
      const result = detectScript('@#$%^&*()');
      expect(result).toBe('Unknown');
    });
  });

  // Mixed input
  describe('Mixed Text', () => {
    it('should detect dominant script in mixed Hindi-English text', () => {
      const result = detectScript('नमस्ते Hello');
      expect(result).toBe('Devanagari');
    });

    it('should detect dominant script in mixed Telugu-English text', () => {
      const result = detectScript('నమస్కారం Welcome');
      expect(result).toBe('Telugu');
    });

    it('should detect dominant script in text with numbers', () => {
      const result = detectScript('నమస్కారం 123');
      expect(result).toBe('Telugu');
    });

    it('should detect dominant script in text with punctuation', () => {
      const result = detectScript('नमस्ते, Hello!');
      expect(result).toBe('Devanagari');
    });
  });

  // Multi-script input (should pick dominant)
  describe('Multi-Script Text', () => {
    it('should detect dominant script when Telugu has more characters', () => {
      const result = detectScript('నమస్కారం नमस्');
      expect(result).toBe('Telugu'); // Telugu has 8 chars, Devanagari has 4
    });

    it('should detect dominant script when Devanagari has more characters', () => {
      const result = detectScript('నమస్ नमस्ते');
      expect(result).toBe('Devanagari'); // Devanagari has 6 chars, Telugu has 4
    });

    it('should detect dominant script in Tamil-Kannada mixed text', () => {
      const result = detectScript('வணக்கம் ನಮಸ್');
      // Tamil: 7 chars, Kannada: 4 chars
      expect(result).toBe('Tamil');
    });
  });

  // Longer representative texts
  describe('Longer Text Detection', () => {
    it('should detect Telugu in a longer text', () => {
      const result = detectScript('నమస్కారం. మీరు ఎలా ఉన్నారు? నేను బాగున్నాను.');
      expect(result).toBe('Telugu');
    });

    it('should detect Devanagari in a longer text', () => {
      const result = detectScript('नमस्ते। आप कैसे हैं? मैं ठीक हूँ।');
      expect(result).toBe('Devanagari');
    });

    it('should detect Tamil in a longer text', () => {
      const result = detectScript('வணக்கம். நீங்கள் எப்படி இருக்கிறீர்கள்?');
      expect(result).toBe('Tamil');
    });

    it('should detect Malayalam in a longer text', () => {
      const result = detectScript('നമസ്കാരം. നിങ്ങൾ എങ്ങനെയുണ്ട്?');
      expect(result).toBe('Malayalam');
    });
  });

  // Unicode boundary tests
  describe('Unicode Range Validation', () => {
    it('should detect characters at start of Telugu range', () => {
      const result = detectScript('\u0C00'); // Start of Telugu block
      expect(result).toBe('Telugu');
    });

    it('should detect characters at end of Telugu range', () => {
      const result = detectScript('\u0C7F'); // End of Telugu block
      expect(result).toBe('Telugu');
    });

    it('should detect characters at start of Devanagari range', () => {
      const result = detectScript('\u0900'); // Start of Devanagari block
      expect(result).toBe('Devanagari');
    });

    it('should detect characters at end of Devanagari range', () => {
      const result = detectScript('\u097F'); // End of Devanagari block
      expect(result).toBe('Devanagari');
    });
  });
});
