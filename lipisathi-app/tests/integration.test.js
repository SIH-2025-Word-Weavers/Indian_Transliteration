import { describe, it, expect } from 'vitest';
import { detectScript } from '../src/services/scriptDetectionService.js';
import { transliterate } from '../src/services/transliterationService.js';

/**
 * Integration Tests: OCR → Script Detection → Transliteration Pipeline
 * 
 * These tests verify the complete workflow:
 * 1. Extract text from image (mocked OCR text)
 * 2. Detect the script
 * 3. Transliterate to target script
 * 
 * NOTE: OCR models are NOT loaded in these tests. We use mocked OCR text.
 */

describe('Integration: OCR → Script Detection → Transliteration Pipeline', () => {
  describe('Hindi OCR → Detection → Transliteration', () => {
    it('should process Hindi OCR text → Telugu', () => {
      // Simulate OCR extracting Hindi text from a street sign
      const ocrText = 'मुंबई रेलवे स्टेशन';
      
      // Step 1: Detect script
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Devanagari');
      
      // Step 2: Transliterate to Telugu
      const transliteratedText = transliterate(ocrText, 'Telugu', detectedScript);
      expect(transliteratedText).toContain('ముం'); // Verify Telugu output
      expect(transliteratedText).not.toContain('❌'); // No errors
    });

    it('should process Hindi OCR text → Tamil', () => {
      const ocrText = 'दिल्ली';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Devanagari');
      
      const transliteratedText = transliterate(ocrText, 'Tamil', detectedScript);
      expect(transliteratedText).toContain('த'); // Tamil approximation
      expect(transliteratedText).not.toContain('❌');
    });

    it('should process Hindi OCR text → Kannada', () => {
      const ocrText = 'बंगलौर';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Devanagari');
      
      const transliteratedText = transliterate(ocrText, 'Kannada', detectedScript);
      expect(transliteratedText).toContain('ಬ'); // Kannada
      expect(transliteratedText).not.toContain('❌');
    });

    it('should process Hindi OCR text → Malayalam', () => {
      const ocrText = 'केरल';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Devanagari');
      
      const transliteratedText = transliterate(ocrText, 'Malayalam', detectedScript);
      expect(transliteratedText).toContain('ക'); // Malayalam
      expect(transliteratedText).not.toContain('❌');
    });

    it('should apply Hindi language rules in pipeline', () => {
      const ocrText = 'राम';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Devanagari');
      
      // Transliterate to same script with Hindi rules
      const transliteratedText = transliterate(ocrText, 'Devanagari', detectedScript, 'Hindi');
      expect(transliteratedText).toBe('राम्'); // Schwa deletion applied
    });
  });

  describe('Telugu OCR → Detection → Transliteration', () => {
    it('should process Telugu OCR text → Devanagari', () => {
      // Simulate OCR extracting Telugu text
      const ocrText = 'హైదరాబాద్ రైల్వే స్టేషన్';
      
      // Step 1: Detect script
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Telugu');
      
      // Step 2: Transliterate to Devanagari
      const transliteratedText = transliterate(ocrText, 'Devanagari', detectedScript);
      expect(transliteratedText).toContain('है'); // Verify Devanagari output
      expect(transliteratedText).not.toContain('❌');
    });

    it('should process Telugu OCR text → Tamil', () => {
      const ocrText = 'నమస్కారం';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Telugu');
      
      const transliteratedText = transliterate(ocrText, 'Tamil', detectedScript);
      expect(transliteratedText).toContain('ன'); // Tamil
      expect(transliteratedText).not.toContain('❌');
    });

    it('should process Telugu OCR text → Kannada', () => {
      const ocrText = 'విశాఖపట్నం';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Telugu');
      
      const transliteratedText = transliterate(ocrText, 'Kannada', detectedScript);
      expect(transliteratedText).toContain('ವ'); // Kannada
      expect(transliteratedText).not.toContain('❌');
    });

    it('should process Telugu OCR text → Bengali', () => {
      const ocrText = 'తెలుగు';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Telugu');
      
      const transliteratedText = transliterate(ocrText, 'Bengali', detectedScript);
      expect(transliteratedText).toContain('ত'); // Bengali
      expect(transliteratedText).not.toContain('❌');
    });

    it('should apply Hindi language rules when Telugu → Devanagari with Hindi target', () => {
      const ocrText = 'రామ';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Telugu');
      
      const transliteratedText = transliterate(ocrText, 'Devanagari', detectedScript, 'Hindi');
      expect(transliteratedText).toBe('राम्'); // Schwa deletion
    });
  });

  describe('Mixed Content Handling', () => {
    it('should handle OCR text with Hindi script and English text', () => {
      const ocrText = 'मुंबई Mumbai Station';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Devanagari'); // Dominant script
      
      const transliteratedText = transliterate(ocrText, 'Telugu', detectedScript);
      expect(transliteratedText).toContain('ముం'); // Telugu for Indic
      expect(transliteratedText).toContain('Mumbai'); // English preserved
    });

    it('should handle OCR text with Telugu script and numbers', () => {
      const ocrText = 'ప్లాట్ఫారం 5';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Telugu');
      
      const transliteratedText = transliterate(ocrText, 'Devanagari', detectedScript);
      expect(transliteratedText).toContain('प'); // Devanagari
      expect(transliteratedText).toContain('5'); // Number preserved
    });

    it('should handle OCR text with punctuation', () => {
      const ocrText = 'नमस्ते, स्वागतम्!';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Devanagari');
      
      const transliteratedText = transliterate(ocrText, 'Telugu', detectedScript);
      expect(transliteratedText).toContain('న'); // Telugu
      expect(transliteratedText).toContain(','); // Comma preserved
      expect(transliteratedText).toContain('!'); // Exclamation preserved
    });
  });

  describe('Real-World Street Sign Scenarios', () => {
    it('should handle typical street name (Hindi)', () => {
      // Typical Hindi street sign OCR output
      const ocrText = 'महात्मा गांधी मार्ग';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Devanagari');
      
      const transliteratedText = transliterate(ocrText, 'Telugu', detectedScript);
      expect(transliteratedText).toContain('మ'); // Telugu output
      expect(transliteratedText).not.toContain('❌');
    });

    it('should handle typical city name (Telugu)', () => {
      // Typical Telugu street sign OCR output
      const ocrText = 'హైదరాబాద్';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Telugu');
      
      const transliteratedText = transliterate(ocrText, 'Devanagari', detectedScript);
      expect(transliteratedText).toContain('है'); // Devanagari output
      expect(transliteratedText).not.toContain('❌');
    });

    it('should handle station/platform signage (Hindi + English)', () => {
      // Mixed signage common in Indian railway stations
      const ocrText = 'प्लेटफार्म Platform 3';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Devanagari');
      
      const transliteratedText = transliterate(ocrText, 'Tamil', detectedScript);
      expect(transliteratedText).toContain('ப'); // Tamil for Indic part
      expect(transliteratedText).toContain('Platform'); // English preserved
      expect(transliteratedText).toContain('3'); // Number preserved
    });

    it('should handle directional signage (Telugu + English)', () => {
      const ocrText = 'నిర్గమణ Exit';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Telugu');
      
      const transliteratedText = transliterate(ocrText, 'Kannada', detectedScript);
      expect(transliteratedText).toContain('ನ'); // Kannada
      expect(transliteratedText).toContain('Exit'); // English preserved
    });
  });

  describe('Exception Dictionary in Pipeline', () => {
    it('should apply exception dictionary for brand names in pipeline', () => {
      const ocrText = 'google मुख्यालय';
      
      const detectedScript = detectScript(ocrText);
      // "google" alone might be Unknown, but with Devanagari text it's Devanagari
      
      const transliteratedText = transliterate('google', 'Telugu', 'Telugu');
      expect(transliteratedText).toBe('గూగుల్'); // Exception dictionary used
    });

    it('should apply exception dictionary for "lipisathi"', () => {
      const transliteratedText = transliterate('lipisathi', 'Devanagari', 'Telugu');
      expect(transliteratedText).toBe('लिपिसाथी');
    });
  });

  describe('Error Scenarios in Pipeline', () => {
    it('should handle Unknown script gracefully', () => {
      const ocrText = 'Unknown Script Text 123';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Unknown');
      
      const transliteratedText = transliterate(ocrText, 'Telugu', detectedScript);
      expect(transliteratedText).toContain('❌'); // Error message
    });

    it('should handle empty OCR result', () => {
      const ocrText = '';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Unknown');
      
      const transliteratedText = transliterate(ocrText, 'Telugu', detectedScript);
      // Empty input returns either empty or error
      expect(typeof transliteratedText).toBe('string');
    });
  });

  describe('Cross-Script Pipeline', () => {
    it('should handle Tamil → Kannada pipeline', () => {
      const ocrText = 'சென்னை';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Tamil');
      
      const transliteratedText = transliterate(ocrText, 'Kannada', detectedScript);
      expect(transliteratedText).toContain('ಚ'); // Kannada
      expect(transliteratedText).not.toContain('❌');
    });

    it('should handle Bengali → Gujarati pipeline', () => {
      const ocrText = 'কলকাতা';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Bengali');
      
      const transliteratedText = transliterate(ocrText, 'Gujarati', detectedScript);
      expect(transliteratedText).toContain('ક'); // Gujarati
      expect(transliteratedText).not.toContain('❌');
    });

    it('should handle Malayalam → Odia pipeline', () => {
      const ocrText = 'തിരുവനന്തപുരം';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Malayalam');
      
      const transliteratedText = transliterate(ocrText, 'Odia', detectedScript);
      expect(transliteratedText).toContain('ତ'); // Odia
      expect(transliteratedText).not.toContain('❌');
    });

    it('should handle Gurmukhi → Bengali pipeline', () => {
      const ocrText = 'ਅੰਮ੍ਰਿਤਸਰ';
      
      const detectedScript = detectScript(ocrText);
      expect(detectedScript).toBe('Gurmukhi');
      
      const transliteratedText = transliterate(ocrText, 'Bengali', detectedScript);
      expect(transliteratedText).toContain('অ'); // Bengali
      expect(transliteratedText).not.toContain('❌');
    });
  });
});
