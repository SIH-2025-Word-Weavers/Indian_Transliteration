/**
 * Transliteration Service
 * 
 * Hub-and-Spoke transliteration architecture with Devanagari as the central hub.
 * Ported from transliteration_algorithm.ipynb
 * 
 * Architecture:
 * Source Script → Devanagari (hub) → Target Script
 */

/**
 * Exception dictionary for loanwords and special cases
 * Keys are lowercase for case-insensitive matching
 * Source: transliteration_algorithm.ipynb EXCEPTION_DICTIONARY
 */
const EXCEPTION_DICTIONARY = {
  "lipisathi": {
    "Devanagari": "लिपिसाथी",
    "Telugu": "లిపిసాథి"
  },
  "google": {
    "Devanagari": "गूगल",
    "Telugu": "గూగుల్"
  }
};

/**
 * Character mappings from each script to Devanagari (hub)
 * Source: transliteration_algorithm.ipynb MAPPINGS_TO_DEVANAGARI
 */
const MAPPINGS_TO_DEVANAGARI = {
  Telugu: {
    // Vowels
    "అ": "अ", "ఆ": "आ", "ఇ": "इ", "ఈ": "ई", "ఉ": "उ", "ఊ": "ऊ", "ఋ": "ऋ", "ౠ": "ॠ",
    "ఎ": "ए", "ఏ": "ए", "ఐ": "ऐ", "ఒ": "ओ", "ఓ": "ओ", "ఔ": "औ",
    // Consonants
    "క": "क", "ఖ": "ख", "గ": "ग", "ఘ": "घ", "ఙ": "ङ",
    "చ": "च", "ఛ": "छ", "జ": "ज", "ఝ": "झ", "ఞ": "ञ",
    "ట": "ट", "ఠ": "ठ", "డ": "ड", "ఢ": "ढ", "ణ": "ण",
    "త": "त", "థ": "थ", "ద": "द", "ధ": "ध", "న": "न",
    "ప": "प", "ఫ": "फ", "బ": "ब", "భ": "भ", "మ": "म",
    "య": "य", "ర": "र", "ల": "ल", "వ": "व", "ళ": "ळ",
    "శ": "श", "ష": "ष", "స": "स", "హ": "ह",
    // Vowel signs (matras)
    "ా": "ा", "ి": "ि", "ీ": "ी", "ు": "ु", "ూ": "ू", "ృ": "ृ", "ౄ": "ॄ",
    "ெ": "े", "ే": "े", "ై": "ै", "ొ": "ो", "ో": "ो", "ౌ": "ौ",
    // Other marks
    "ం": "ं", "ః": "ः", "్": "्",
    // Numbers
    "౦": "०", "౧": "१", "౨": "२", "౩": "३", "౪": "४",
    "౫": "५", "౬": "६", "౭": "७", "౮": "८", "౯": "९"
  },

  Tamil: {
    // Vowels
    "அ": "अ", "ஆ": "आ", "இ": "इ", "ஈ": "ई", "உ": "उ", "ஊ": "ऊ",
    "எ": "ए", "ஏ": "ए", "ஐ": "ऐ", "ஒ": "ओ", "ஓ": "ओ", "ஔ": "औ",
    // Consonants
    "க": "क", "ங": "ङ", "ச": "च", "ஜ": "ज", "ஞ": "ञ",
    "ட": "ट", "ண": "ण", "த": "त", "ந": "न", "ன": "न",
    "ப": "प", "ம": "म", "ய": "य", "ர": "र", "ற": "र",
    "ல": "ल", "ள": "ळ", "வ": "व", "ழ": "ळ",
    "ஶ": "श", "ஷ": "ष", "ஸ": "स", "ஹ": "ह",
    // Vowel signs
    "ா": "ा", "ி": "ि", "ீ": "ी", "ு": "ु", "ூ": "ू",
    "ெ": "े", "ே": "े", "ை": "ै", "ொ": "ो", "ோ": "ो", "ௌ": "ौ",
    // Other marks
    "்": "्", "ஂ": "ं",
    // Numbers
    "௦": "०", "௧": "१", "௨": "२", "௩": "३", "௪": "४",
    "௫": "५", "௬": "६", "௭": "७", "௮": "८", "௯": "९"
  },

  Kannada: {
    // Vowels
    "ಅ": "अ", "ಆ": "आ", "ಇ": "इ", "ಈ": "ई", "ಉ": "उ", "ಊ": "ऊ", "ಋ": "ऋ", "ೠ": "ॠ",
    "ಎ": "ए", "ಏ": "ए", "ಐ": "ऐ", "ಒ": "ओ", "ಓ": "ओ", "ಔ": "औ",
    // Consonants
    "ಕ": "क", "ఖ": "ख", "ಗ": "ग", "ಘ": "घ", "ಙ": "ङ",
    "ಚ": "च", "ಛ": "छ", "ಜ": "ज", "ಝ": "झ", "ಞ": "ञ",
    "ಟ": "ट", "ಠ": "ठ", "ಡ": "ड", "ಢ": "ढ", "ಣ": "ण",
    "ತ": "त", "ಥ": "थ", "ದ": "द", "ಧ": "ध", "ನ": "न",
    "ಪ": "प", "ಫ": "फ", "ಬ": "ब", "ಭ": "भ", "ಮ": "म",
    "ಯ": "य", "ರ": "र", "ಲ": "ल", "ವ": "व",
    "ಶ": "श", "ಷ": "ष", "ಸ": "स", "ಹ": "ह", "ಳ": "ळ",
    // Vowel signs
    "ಾ": "ा", "ಿ": "ि", "ೀ": "ी", "ು": "ु", "ೂ": "ू", "ೃ": "ृ",
    "ೆ": "े", "ೇ": "े", "ೈ": "ै", "ೊ": "ो", "ೋ": "ो", "ೌ": "ौ",
    // Other marks
    "ಂ": "ं", "ಃ": "ः", "್": "्",
    // Numbers
    "೦": "०", "೧": "१", "೨": "२", "೩": "३", "೪": "४",
    "೫": "५", "೬": "६", "೭": "৭", "೮": "८", "೯": "९"
  },

  Malayalam: {
    // Vowels
    "അ": "अ", "ആ": "आ", "ഇ": "इ", "ഈ": "ई", "ഉ": "उ", "ഊ": "ऊ",
    "ഋ": "ऋ", "ൠ": "ॠ", "ഌ": "ऌ", "ൡ": "ॡ",
    "എ": "ए", "ഏ": "ए", "ഐ": "ऐ", "ഒ": "ओ", "ഓ": "ओ", "ഔ": "औ",
    // Consonants
    "ക": "क", "ഖ": "ख", "ഗ": "ग", "ഘ": "घ", "ങ": "ङ",
    "ച": "च", "ഛ": "छ", "ജ": "ज", "ഝ": "झ", "ഞ": "ञ",
    "ട": "ट", "ഠ": "ठ", "ഡ": "ड", "ഢ": "ढ", "ണ": "ण",
    "ത": "त", "ഥ": "थ", "ദ": "द", "ധ": "ध", "ന": "न",
    "പ": "प", "ഫ": "फ", "ബ": "ब", "ഭ": "भ", "മ": "म",
    "യ": "य", "ര": "र", "ല": "ല", "വ": "व",
    "ശ": "श", "ഷ": "ष", "സ": "स", "ഹ": "ह", "ള": "ळ", "ഴ": "ळ", "റ": "र",
    // Vowel signs
    "ാ": "ा", "ി": "ि", "ീ": "ी", "ു": "ु", "ൂ": "ू", "ൃ": "ृ",
    "െ": "े", "േ": "े", "ൈ": "ै", "ൊ": "ो", "ോ": "ो", "ൗ": "ौ",
    // Other marks
    "ം": "ं", "ഃ": "ः", "്": "्",
    // Numbers
    "൦": "०", "൧": "१", "൨": "२", "൩": "३", "൪": "४",
    "൫": "५", "൬": "६", "൭": "७", "൮": "८", "൯": "९"
  },

  Gurmukhi: {
    // Vowels
    "ਅ": "अ", "ਆ": "आ", "ਇ": "इ", "ਈ": "ई", "ਉ": "उ", "ਊ": "ऊ",
    "ਏ": "ए", "ਐ": "ऐ", "ਓ": "ओ", "ਔ": "औ",
    // Consonants
    "ਕ": "क", "ਖ": "ख", "ਗ": "ग", "ਘ": "घ", "ਙ": "ङ",
    "ਚ": "च", "ਛ": "छ", "ਜ": "ज", "ਝ": "झ", "ਞ": "ञ",
    "ਟ": "ट", "ਠ": "ठ", "ਡ": "ड", "ਢ": "ढ", "ਣ": "ण",
    "ਤ": "त", "ਥ": "थ", "ਦ": "द", "ਧ": "ध", "ਨ": "न",
    "ਪ": "प", "ਫ": "फ", "ਬ": "ब", "ਭ": "भ", "ਮ": "म",
    "ਯ": "य", "ਰ": "र", "ਲ": "ल", "ਵ": "వ", "ੜ": "ड़",
    "ਸ਼": "श", "ਸ": "स", "ਹ": "ह",
    // Vowel signs
    "ਾ": "ा", "ਿ": "ि", "ੀ": "ी", "ੁ": "ु", "ੂ": "ू",
    "ੇ": "े", "ੈ": "ै", "ੋ": "ो", "ੌ": "ौ",
    // Other marks
    "ਂ": "ं", "਼": "़", "੍": "्",
    // Numbers
    "੦": "०", "੧": "१", "੨": "२", "੩": "३", "੪": "४",
    "੫": "५", "੬": "६", "੭": "७", "੮": "८", "੯": "९"
  },

  Bengali: {
    // Vowels
    "অ": "अ", "আ": "आ", "ই": "इ", "ঈ": "ई", "উ": "उ", "ঊ": "ऊ", "ঋ": "ऋ", "ৠ": "ॠ",
    "এ": "ए", "ঐ": "ऐ", "ও": "ओ", "ঔ": "औ",
    // Consonants
    "ক": "क", "খ": "ख", "গ": "ग", "ঘ": "घ", "ঙ": "ङ",
    "চ": "च", "ছ": "छ", "জ": "ज", "ঝ": "झ", "ঞ": "ञ",
    "ট": "ट", "ঠ": "ठ", "ড": "ड", "ঢ": "ढ", "ণ": "ण",
    "ত": "त", "থ": "थ", "দ": "द", "ধ": "ध", "ন": "न",
    "প": "प", "ফ": "फ", "ব": "ब", "ভ": "भ", "ম": "म",
    "য": "य", "র": "र", "ল": "ल",
    "শ": "श", "ষ": "ष", "স": "स", "হ": "ह", "ড়": "ड़", "ঢ়": "ढ़", "য়": "य",
    // Vowel signs
    "া": "ा", "ি": "ि", "ী": "ी", "ু": "ु", "ূ": "ू", "ৃ": "ृ",
    "ে": "े", "ৈ": "ै", "ো": "ो", "ৌ": "ौ",
    // Other marks
    "ং": "ं", "ঃ": "ः", "্": "्", "ৎ": "त्",
    // Numbers
    "০": "०", "১": "१", "২": "२", "৩": "३", "৪": "৪",
    "৫": "५", "৬": "६", "৭": "৭", "৮": "৮", "৯": "९"
  },

  Odia: {
    // Vowels
    "ଅ": "अ", "ଆ": "आ", "ଇ": "इ", "ଈ": "ई", "ଉ": "उ", "ଊ": "ऊ", "ଋ": "ऋ", "ୠ": "ॠ",
    "ଏ": "ए", "ଐ": "ऐ", "ଓ": "ओ", "ଔ": "औ",
    // Consonants
    "କ": "क", "ଖ": "ख", "ଗ": "ग", "ଘ": "घ", "ଙ": "ङ",
    "ଚ": "च", "ଛ": "छ", "ଜ": "ज", "ଝ": "झ", "ଞ": "ञ",
    "ଟ": "ट", "ଠ": "ठ", "ଡ": "ड", "ଢ": "ढ", "ଣ": "ण",
    "ତ": "त", "ଥ": "थ", "ଦ": "द", "ଧ": "ध", "ନ": "न",
    "ପ": "प", "ଫ": "फ", "ବ": "ब", "ଭ": "भ", "ମ": "म",
    "ଯ": "य", "ର": "र", "ଲ": "ल", "ଳ": "ळ", "ଵ": "व",
    "ଶ": "श", "ଷ": "ष", "ସ": "स", "ହ": "ह", "ଡ଼": "ड़", "ଢ଼": "ढ़", "ୟ": "य",
    // Vowel signs
    "ା": "ा", "ି": "ि", "ୀ": "ी", "ୁ": "ु", "ୂ": "ू", "ୃ": "ृ",
    "େ": "े", "ୈ": "ै", "ୋ": "ो", "ୌ": "ौ",
    // Other marks
    "ଂ": "ं", "ଃ": "ः", "୍": "्",
    // Numbers
    "୦": "०", "୧": "१", "୨": "२", "୩": "३", "୪": "४",
    "୫": "५", "୬": "६", "୭": "७", "୮": "୮", "୯": "९"
  },

  Gujarati: {
    // Vowels
    "અ": "अ", "આ": "आ", "ઇ": "इ", "ઈ": "ई", "ઉ": "उ", "ઊ": "ऊ", "ઋ": "ऋ",
    "એ": "ए", "ઐ": "ऐ", "ઓ": "ओ", "ઔ": "औ",
    // Consonants
    "ક": "क", "ખ": "ख", "ગ": "ग", "ઘ": "घ", "ઙ": "ङ",
    "ચ": "च", "છ": "छ", "જ": "ज", "ઝ": "झ", "ઞ": "ञ",
    "ટ": "ट", "ઠ": "ठ", "ડ": "ड", "ઢ": "ढ", "ણ": "ण",
    "ત": "त", "થ": "थ", "દ": "द", "ધ": "ध", "ન": "न",
    "પ": "प", "ફ": "फ", "બ": "ब", "ભ": "भ", "મ": "म",
    "ય": "य", "ર": "र", "લ": "ल", "વ": "వ",
    "શ": "श", "ષ": "ष", "સ": "स", "હ": "ह", "ળ": "ळ",
    // Vowel signs
    "ા": "ा", "િ": "ि", "ી": "ी", "ુ": "ु", "ૂ": "ू", "ૃ": "ृ",
    "ે": "े", "ૈ": "ै", "ો": "ो", "ૌ": "ौ",
    // Other marks
    "ં": "ं", "ઃ": "ः", "્": "्",
    // Numbers
    "૦": "०", "૧": "१", "૨": "૨", "૩": "३", "૪": "૪",
    "૫": "૫", "૬": "૬", "૭": "૭", "૮": "૮", "૯": "९"
  }
};

/**
 * Character mappings from Devanagari to other scripts
 * Auto-generated from MAPPINGS_TO_DEVANAGARI with approximations for Tamil
 */
let MAPPINGS_FROM_DEVANAGARI = {};

/**
 * Generate reverse mappings from Devanagari to other scripts
 * Based on transliteration_algorithm.ipynb generate_reverse_mappings()
 */
function generateReverseMappings() {
  // Tamil approximations (Tamil lacks aspirated consonants)
  const tamilApproximations = {
    'ख': 'க', 'ग': 'க', 'घ': 'க',
    'छ': 'ச', 'झ': 'ஜ',
    'ठ': 'ட', 'ड': 'ட', 'ढ': 'ட',
    'थ': 'த', 'द': 'த', 'ध': 'த',
    'फ': 'ப', 'ब': 'ப', 'भ': 'ப',
    'श': 'ஸ', 'ळ': 'ள'
  };

  for (const script in MAPPINGS_TO_DEVANAGARI) {
    const mapping = MAPPINGS_TO_DEVANAGARI[script];
    const reverseMapping = {};
    
    // Create reverse mapping
    for (const sourceChar in mapping) {
      const devChar = mapping[sourceChar];
      reverseMapping[devChar] = sourceChar;
    }
    
    // Add approximations for Tamil
    if (script === 'Tamil') {
      for (const devChar in tamilApproximations) {
        if (!reverseMapping[devChar]) {
          reverseMapping[devChar] = tamilApproximations[devChar];
        }
      }
    }
    
    MAPPINGS_FROM_DEVANAGARI[script] = reverseMapping;
  }
}

// Generate reverse mappings on module load
generateReverseMappings();

/**
 * Apply language-specific orthographic rules to transliterated text
 * Based on transliteration_algorithm.ipynb apply_language_rules() function
 * 
 * NOTE: This is a simple heuristic from the notebook, not a complete linguistic model.
 * Only Hindi rules are currently implemented.
 * 
 * @param {string} text - Text to process
 * @param {string} language - Target language for rules (e.g., "Hindi")
 * @returns {string} Text with language-specific rules applied
 */
function applyLanguageRules(text, language) {
  if (language === 'Hindi') {
    // Rule 1: Schwa Deletion at the end of words
    // For each space-separated word, if it ends with a Devanagari consonant (U+0915-U+0939),
    // append virama (halant) '्'
    // Example: "राम" → "राम्"
    // NOTE: Only applies to words with more than one character
    const words = text.split(' ');
    const processedWords = words.map(word => {
      if (word && word.length > 1) {  // Changed from > 0 to > 1
        const lastCharCode = word.charCodeAt(word.length - 1);
        // Check if last character is a Devanagari consonant (U+0915-U+0939)
        if (lastCharCode >= 0x0915 && lastCharCode <= 0x0939) {
          return word + '्'; // Append virama
        }
      }
      return word;
    });
    text = processedWords.join(' ');

    // Rule 2: Heuristic for common character replacements
    // Prefer 'ल' over 'ळ' in standard Hindi
    text = text.replace(/ळ/g, 'ल');
  }

  // Other languages can be added here (e.g., if (language === 'Marathi') {...})
  // Currently only Hindi is implemented in the notebook
  
  return text;
}

/**
 * Transliterate text from source script to target script
 * Based on transliteration_algorithm.ipynb transliterate() function
 * 
 * @param {string} text - Text to transliterate
 * @param {string} targetScript - Target script name (e.g., "Telugu", "Tamil")
 * @param {string} sourceScript - Source script name (auto-detected if not provided)
 * @param {string} [targetLanguage] - Optional language for post-processing rules (e.g., "Hindi")
 * @returns {string} Transliterated text or error message
 */
export function transliterate(text, targetScript, sourceScript, targetLanguage = null) {
  // Validate input
  if (!text || typeof text !== 'string') {
    return '';
  }

  if (!targetScript || typeof targetScript !== 'string') {
    return '❌ Target script is required';
  }

  // Check exception dictionary (case-insensitive)
  const key = text.toLowerCase();
  if (EXCEPTION_DICTIONARY[key] && EXCEPTION_DICTIONARY[key][targetScript]) {
    return EXCEPTION_DICTIONARY[key][targetScript];
  }

  // Validate source script
  if (!sourceScript || sourceScript === 'Unknown') {
    return '❌ Could not detect script';
  }

  // If source and target are the same AND no language rules requested, return original text
  if (sourceScript === targetScript && !targetLanguage) {
    return text;
  }

  // Step A: Convert source text to Devanagari hub (if not already Devanagari)
  let devanagariText = text;
  if (sourceScript !== 'Devanagari') {
    if (!MAPPINGS_TO_DEVANAGARI[sourceScript]) {
      return `❌ No mapping for ${sourceScript} → Devanagari`;
    }
    
    const mapping = MAPPINGS_TO_DEVANAGARI[sourceScript];
    devanagariText = text.split('').map(char => mapping[char] || char).join('');
  }

  // Step B: Convert Devanagari hub to target script (if not Devanagari)
  let resultText = devanagariText;
  if (targetScript !== 'Devanagari') {
    if (!MAPPINGS_FROM_DEVANAGARI[targetScript]) {
      return `❌ No mapping for Devanagari → ${targetScript}`;
    }
    
    const mapping = MAPPINGS_FROM_DEVANAGARI[targetScript];
    resultText = devanagariText.split('').map(char => mapping[char] || char).join('');
  }

  // Step C: Apply language-specific post-processing rules (if targetLanguage provided)
  if (targetLanguage) {
    resultText = applyLanguageRules(resultText, targetLanguage);
  }

  return resultText;
}

/**
 * Get list of supported scripts for transliteration
 * @returns {string[]} Array of supported script names
 */
export function getSupportedScripts() {
  return Object.keys(MAPPINGS_TO_DEVANAGARI);
}
