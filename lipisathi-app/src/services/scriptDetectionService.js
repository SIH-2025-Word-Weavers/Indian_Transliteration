/**
 * Script Detection Service
 * 
 * Detects the dominant Indic script in text based on Unicode character ranges.
 * Algorithm ported from transliteration_algorithm.ipynb
 */

/**
 * Unicode ranges for supported Indic scripts
 * Source: transliteration_algorithm.ipynb SCRIPT_RANGES
 */
const SCRIPT_RANGES = {
  Telugu: [0x0C00, 0x0C7F],
  Devanagari: [0x0900, 0x097F],
  Tamil: [0x0B80, 0x0BFF],
  Malayalam: [0x0D00, 0x0D7F],
  Gurmukhi: [0x0A00, 0x0A7F],
  Kannada: [0x0C80, 0x0CFF],
  Bengali: [0x0980, 0x09FF],
  Gujarati: [0x0A80, 0x0AFF],
  Odia: [0x0B00, 0x0B7F]
};

/**
 * Detect the dominant script in the given text.
 * 
 * Algorithm:
 * 1. Count characters belonging to each supported script
 * 2. Ignore characters outside supported ranges (whitespace, punctuation, English, numbers)
 * 3. Return the script with the highest character count
 * 4. Return "Unknown" if no supported script characters are found
 * 
 * @param {string} text - Text to analyze
 * @returns {string} Script name ("Telugu", "Devanagari", etc.) or "Unknown"
 */
export function detectScript(text) {
  // Initialize character counts for each script
  const charCounts = {};
  Object.keys(SCRIPT_RANGES).forEach(script => {
    charCounts[script] = 0;
  });

  // Count characters in each script range
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    
    // Check which script this character belongs to
    for (const script in SCRIPT_RANGES) {
      const [start, end] = SCRIPT_RANGES[script];
      if (code >= start && code <= end) {
        charCounts[script]++;
        break; // Character found, no need to check other scripts
      }
    }
  }

  // Find the script with the maximum count
  let maxScript = null;
  let maxCount = 0;
  
  for (const script in charCounts) {
    if (charCounts[script] > maxCount) {
      maxCount = charCounts[script];
      maxScript = script;
    }
  }

  // Return the dominant script, or "Unknown" if no script characters found
  return maxCount > 0 ? maxScript : "Unknown";
}
