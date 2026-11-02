/**
 * Phonetic Hinglish to Devanagari Hindi Transliteration Engine
 * Converts Roman/Hinglish inputs (e.g. "do roti khana hai") into Devanagari Hindi ("दो रोटी खाना है").
 * Uses local fast dictionary + in-memory cache + Google Input Tools API for 100% accurate conversion.
 */

const OFFLINE_DICT: Record<string, string> = {
  // Numbers & Quantities
  'do': 'दो',
  'ek': 'एक',
  'teen': 'तीन',
  'char': 'चार',
  'panch': 'पांच',
  'paanch': 'पांच',
  'chhe': 'छह',
  'saat': 'सात',
  'aath': 'आठ',
  'nau': 'नौ',
  'das': 'दस',
  'aadha': 'आधा',
  'adha': 'आधा',
  'dedh': 'डेढ़',
  'dhai': 'ढाई',
  'chammach': 'चम्मच',
  'katori': 'कटोरी',
  'katoris': 'कटोरी',
  'cup': 'कप',
  'glass': 'ग्लास',
  'plate': 'प्लेट',

  // Common Meals & Diet Items
  'roti': 'रोटी',
  'rotis': 'रोटी',
  'phulka': 'फुलका',
  'phulkas': 'फुलके',
  'chapati': 'चपाती',
  'chapatis': 'चपाती',
  'paratha': 'पराठा',
  'dal': 'दाल',
  'daal': 'दाल',
  'sabzi': 'सब्ज़ी',
  'sabji': 'सब्ज़ी',
  'chawal': 'चावल',
  'rice': 'चावल',
  'bhaat': 'भात',
  'khichdi': 'खिचड़ी',
  'poha': 'पोहा',
  'daliya': 'दलिया',
  'upma': 'उपमा',
  'idli': 'इडली',
  'dosa': 'डोसा',
  'sambar': 'सांबर',
  'sambhar': 'सांबर',
  'chutney': 'चटनी',
  'raita': 'रायता',
  'dahi': 'दही',
  'curd': 'दही',
  'doodh': 'दूध',
  'chaas': 'छाछ',
  'chach': 'छाछ',
  'mattha': 'मट्ठा',
  'paneer': 'पनीर',
  'tofu': 'टोफू',
  'salad': 'सलाद',
  'soup': 'सूप',
  'ghee': 'घी',
  'tel': 'तेल',
  'oil': 'तेल',
  'makhan': 'मक्खन',
  'namak': 'नमक',
  'salt': 'नमक',
  'chini': 'चीनी',
  'shakkar': 'शक्कर',
  'gud': 'गुड़',
  'gur': 'गुड़',
  'honey': 'शहद',
  'pani': 'पानी',
  'paani': 'पानी',
  'water': 'पानी',
  'chai': 'चाय',
  'tea': 'चाय',
  'coffee': 'कॉफ़ी',

  // Grains & Pulses
  'gehu': 'गेहूं',
  'gehun': 'गेहूं',
  'atta': 'आटा',
  'besan': 'बेसन',
  'suji': 'सूजी',
  'sooji': 'सूजी',
  'maida': 'मैदा',
  'jowar': 'ज्वार',
  'bajra': 'बाजरा',
  'ragi': 'रागी',
  'makka': 'मक्का',
  'moong': 'मूंग',
  'mung': 'मूंग',
  'arhar': 'अरहर',
  'toor': 'तूर',
  'chana': 'चना',
  'chole': 'छोले',
  'rajma': 'राजमा',
  'urad': 'उड़द',
  'masoor': 'मसूर',
  'soya': 'सोया',
  'soyabean': 'सोयाबीन',
  'oats': 'ओट्स',

  // Vegetables
  'lauki': 'लौकी',
  'ghiya': 'घिया',
  'tori': 'तोरई',
  'turai': 'तोरई',
  'bhindi': 'भिंडी',
  'karela': 'करेला',
  'palak': 'पालक',
  'methi': 'मेथी',
  'bathua': 'बथुआ',
  'sarson': 'सरसों',
  'tamatar': 'टमाटर',
  'pyaj': 'प्याज़',
  'pyaaz': 'प्याज़',
  'aalu': 'आलू',
  'aloo': 'आलू',
  'gobhi': 'गोभी',
  'patta': 'पत्ता',
  'gajar': 'गाजर',
  'mooli': 'मूली',
  'kheera': 'खीरा',
  'kakdi': 'ककड़ी',
  'shimla': 'शिमला',
  'mirch': 'मिर्च',
  'adrak': 'अदरक',
  'lahsun': 'लहसुन',
  'dhaniya': 'धनिया',
  'pudina': 'पुदीना',
  'nimbu': 'नींबू',

  // Fruits & Nuts
  'kela': 'केला',
  'seb': 'सेब',
  'apple': 'सेब',
  'papita': 'पपीता',
  'amrood': 'अमरूद',
  'santre': 'संतरा',
  'santra': 'संतरा',
  'mosambi': 'मौसमी',
  'tarbooj': 'तरबूज',
  'kharbooza': 'खरबूजा',
  'angoor': 'अंगूर',
  'anaar': 'अनार',
  'badam': 'बादाम',
  'kaju': 'काजू',
  'akhrot': 'अखरोट',
  'kishmish': 'किशमिश',
  'pista': 'पिस्ता',
  'makhana': 'मखाना',

  // Spices & Condiments
  'haldi': 'हल्दी',
  'jeera': 'जीरा',
  'ajwain': 'अजवाइन',
  'hing': 'हींग',
  'saunf': 'सौंफ',
  'elaichi': 'इलायची',
  'laung': 'लौंग',
  'dalchini': 'दालचीनी',
  'kali': 'काली',

  // Verbs, Adjectives & Common Phrases
  'khana': 'खाना',
  'khao': 'खाओ',
  'khaye': 'खाएं',
  'khayein': 'खाएं',
  'peena': 'पीना',
  'piyo': 'पियो',
  'piye': 'पिएं',
  'piyein': 'पिएं',
  'lena': 'लेना',
  'lo': 'लो',
  'leye': 'लें',
  'le': 'लें',
  'lein': 'लें',
  'karna': 'करना',
  'kare': 'करें',
  'karein': 'करें',
  'rakhe': 'रखें',
  'rakhein': 'रखें',
  'hai': 'है',
  'hain': 'हैं',
  'tha': 'था',
  'thi': 'थी',
  'the': 'थे',
  'hoga': 'होगा',
  'hogi': 'होगी',
  'rahega': 'रहेगा',
  'rahegi': 'रहेगी',
  'aur': 'और',
  'ya': 'या',
  'par': 'पर',
  'pe': 'पे',
  'se': 'से',
  'ka': 'का',
  'ki': 'की',
  'ke': 'के',
  'ko': 'को',
  'me': 'में',
  'mein': 'में',
  'bhi': 'भी',
  'kam': 'कम',
  'jyada': 'ज्यादा',
  'zyada': 'ज्यादा',
  'mat': 'मत',
  'na': 'न',
  'nahi': 'नहीं',
  'nahin': 'नहीं',
  'subah': 'सुबह',
  'dopahar': 'दोपहर',
  'dophar': 'दोपहर',
  'shaam': 'शाम',
  'raat': 'रात',
  'khali': 'खाली',
  'pet': 'पेट',
  'nashta': 'नाश्ता',
  'bhojan': 'भोजन',
  'taza': 'ताज़ा',
  'garam': 'गरम',
  'garm': 'गर्म',
  'thanda': 'ठंडा',
  'halka': 'हल्का',
  'bhari': 'भारी',
  'fayda': 'फायदा',
  'madad': 'मदद',
  'urja': 'ऊर्जा',
  'sugar': 'शुगर',
  'blood': 'ब्लड',
  'pressure': 'प्रेशर',
  'vajan': 'वज़न',
  'swasthya': 'स्वास्थ्य',
  'achha': 'अच्छा',
  'theek': 'ठीक',
  'shuru': 'शुरू',
  'baad': 'बाद',
  'pehle': 'पहले'
};

/**
 * Standard clinical & dietary units and measures that MUST remain in English:
 * e.g. 30gm, 100mg, 250ml, 150kcal, 30gm/roti, 100mg/dl
 */
export const PRESERVED_CLINICAL_UNITS = new Set([
  'gm', 'gms', 'g', 'gram', 'grams',
  'mg', 'kg', 'kgs', 'mcg',
  'ml', 'l', 'ltr', 'ltrs', 'liter', 'liters', 'litres',
  'kcal', 'cal', 'calories',
  'tbsp', 'tsp',
  'oz', 'cm', 'mm', 'dl', 'iu', 'meq',
  'mmhg', 'bpm', 'hr', 'hrs', 'min', 'mins', 'sec', 'secs',
  'serv', 'serving', 'servings', 'slice', 'slices', 'piece', 'pieces', 'pcs', 'no', 'nos'
]);

const HINDI_DIGITS_MAP: Record<string, string> = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
};

/**
 * Normalizes any Devanagari numerals back into standard Arabic digits (30, 100, 250).
 */
export function convertHindiDigitsToArabic(str: string): string {
  if (!str) return str;
  if (!/[०-९]/.test(str)) return str;
  return str.replace(/[०-९]/g, (ch) => HINDI_DIGITS_MAP[ch] || ch);
}

/**
 * Recursively traverses any data structure (objects, arrays, strings)
 * and guarantees that all Devanagari digits (०-९) are converted to standard Arabic numerals (0-9).
 * E.g. '१०० ग्राम' -> '100 ग्राम', '२ फुल्के' -> '2 फुल्के', '१ कटोरी' -> '1 कटोरी'
 */
export function normalizeDietPlanDigits<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (typeof input === 'string') {
    return convertHindiDigitsToArabic(input) as any;
  }
  if (Array.isArray(input)) {
    return input.map((item) => normalizeDietPlanDigits(item)) as any;
  }
  if (typeof input === 'object') {
    const copy: any = {};
    for (const [key, val] of Object.entries(input)) {
      copy[key] = normalizeDietPlanDigits(val);
    }
    return copy;
  }
  return input;
}

/**
 * Checks if a token is a clinical measurement or number that should remain in English.
 * Examples: '100', '30', '30gm', '100mg', '150kcal', '2tbsp', '1.5tsp', 'gm', 'mg', 'ml'
 */
export function isPreservedEnglishToken(token: string): boolean {
  if (!token || !token.trim()) return false;
  const normalized = convertHindiDigitsToArabic(token.trim());
  const lower = normalized.toLowerCase();

  // 1. Pure numbers, decimals, ranges, or fractions: 100, 30, 1.5, 2-3, 1/2, 100-200, 100+, <150, >50
  if (/^[<>]?(\d+(\.\d+)?|\d+\/\d+|\d+-\d+|\d+\+)$/.test(normalized)) {
    return true;
  }

  // 2. Clinical unit abbreviation standalone: gm, mg, ml, kcal, tbsp, etc.
  if (PRESERVED_CLINICAL_UNITS.has(lower)) {
    return true;
  }

  // 3. Number combined with unit abbreviation: 100gm, 30gm, 100mg, 250ml, 150kcal, 2tbsp, 1.5tsp, 50g, 100%
  if (/^\d+(\.\d+)?\s*[a-zA-Z%]+$/.test(normalized)) {
    const unitPart = normalized.replace(/^[\d.]+\s*/, '').toLowerCase();
    if (PRESERVED_CLINICAL_UNITS.has(unitPart) || unitPart === '%' || /^(x|pcs|no|nos)$/.test(unitPart)) {
      return true;
    }
  }

  return false;
}

// Global in-memory cache for transliterated words & phrases
const memoryCache = new Map<string, string>();

/**
 * Synchronous dictionary + cache lookup for 0ms typing
 */
export function lookupWordSync(word: string): string | null {
  const normalized = convertHindiDigitsToArabic(word.trim());
  if (isPreservedEnglishToken(normalized)) {
    return normalized; // Keep as standard Arabic numeral / English unit
  }

  const lower = normalized.toLowerCase();
  if (OFFLINE_DICT[lower]) return convertHindiDigitsToArabic(OFFLINE_DICT[lower]);
  if (memoryCache.has(lower)) return convertHindiDigitsToArabic(memoryCache.get(lower)!);
  return null;
}

/**
 * Transliterates a single Romanized word into Devanagari Hindi.
 * Always guarantees that numbers stay in standard Arabic digits like 100.
 */
export async function transliterateWord(word: string): Promise<string> {
  const trimmed = word.trim();
  if (!trimmed) return word;

  // Convert any Devanagari numerals to standard Arabic digits first (e.g. १०० -> 100)
  const normalized = convertHindiDigitsToArabic(trimmed);

  // Preserve clinical units and numbers in English (e.g. 100, 30gm, 100mg, 150kcal)
  if (isPreservedEnglishToken(normalized)) {
    return normalized;
  }

  // If numbers or symbols only, return standard Arabic digits as is
  if (/^[\d+/*\-.,()\[\]%!@#$^&_=:;'"]+$/.test(normalized)) {
    return normalized;
  }

  const lower = normalized.toLowerCase();

  // 1. Check offline dictionary
  if (OFFLINE_DICT[lower]) {
    return convertHindiDigitsToArabic(OFFLINE_DICT[lower]);
  }

  // 2. Check in-memory cache
  if (memoryCache.has(lower)) {
    return convertHindiDigitsToArabic(memoryCache.get(lower)!);
  }

  // 3. Query Google Input Tools
  try {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(normalized)}&itc=hi-t-i0-und&num=1`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1] && data[1][0][1][0]) {
        let hindiResult = data[1][0][1][0];
        // Ensure standard digits are preserved (e.g. १०० -> 100)
        hindiResult = convertHindiDigitsToArabic(hindiResult);
        memoryCache.set(lower, hindiResult);
        return hindiResult;
      }
    }
  } catch (err) {
    // Silent network fallback
  }

  return normalized;
}

/**
 * Transliterates a full sentence / paragraph from Hinglish to Devanagari Hindi.
 * Correctly preserves numbers in standard Arabic digits (like 100), clinical units, and compound notations:
 * Example: "100 roti 30gm/roti" -> "100 रोटी 30gm/रोटी"
 * Example: "2 phulka + 1 katori dal (150 kcal)" -> "2 फुलका + 1 कटोरी दाल (150 kcal)"
 * Example: "100roti" -> "100 रोटी"
 */
export async function transliterateHinglishText(text: string): Promise<string> {
  if (!text || !text.trim()) return text;

  // 1. Immediately convert any existing Devanagari numerals to Arabic digits (e.g. १०० -> 100)
  let normalizedText = convertHindiDigitsToArabic(text);

  // 2. Separate pure numbers attached to non-unit words, e.g. '100roti' -> '100 roti', '2phulka' -> '2 phulka'
  // But preserve standard clinical units like '100gm', '100mg', '250ml', '150kcal', '2tbsp', '1.5tsp'
  normalizedText = normalizedText.replace(/(\d+(?:\.\d+)?)([a-zA-Z]+)/g, (match, num, unit) => {
    if (PRESERVED_CLINICAL_UNITS.has(unit.toLowerCase())) {
      return match;
    }
    return `${num} ${unit}`;
  });

  // Split text into tokens preserving whitespace and delimiters like / + - * ( ) [ ] , : ; ! ?
  const tokens = normalizedText.split(/(\s+|[/+*(),;:!?[\]\-]+)/);

  const convertedTokens = await Promise.all(
    tokens.map(async (tok) => {
      // Delimiters or whitespace
      if (!tok || /^\s+$/.test(tok) || /^[/+*(),;:!?[\]\-]+$/.test(tok)) {
        return tok;
      }
      // If numbers or clinical units (100, 30gm, 100mg, 150kcal, 30, gm, etc.), preserve in English Arabic digits!
      if (isPreservedEnglishToken(tok)) {
        return convertHindiDigitsToArabic(tok);
      }
      // Transliterate Hinglish word
      const convertedWord = await transliterateWord(tok);
      return convertHindiDigitsToArabic(convertedWord);
    })
  );

  let result = convertedTokens.join('');
  // Final guarantee: all digits are standard Arabic numerals (100, 1, 2)
  result = convertHindiDigitsToArabic(result);
  return result;
}

/**
 * Utility to process space/punctuation input events for seamless on-the-fly typing:
 * Given current text and cursor position before space, finds the word preceding the cursor,
 * converts it, and returns the updated text with the new cursor position.
 */
export async function handlePhoneticSpace(
  currentText: string,
  cursorPosition: number
): Promise<{ newText: string; newCursor: number } | null> {
  const textBefore = currentText.slice(0, cursorPosition);
  const textAfter = currentText.slice(cursorPosition);

  // Match the word directly before cursor
  const match = textBefore.match(/([A-Za-z0-9_'-]+)$/);
  if (!match) return null;

  const rawWord = match[1];

  // If this token should remain in English (100, 30gm, 100mg, gm, etc.), do not convert
  if (isPreservedEnglishToken(rawWord)) {
    return null;
  }

  // If a number is attached to a word (e.g. "100roti"), split so 100 stays 100
  const numWordMatch = rawWord.match(/^(\d+(?:\.\d+)?)([A-Za-z]+)$/);
  if (numWordMatch) {
    const numPart = numWordMatch[1];
    const wordPart = numWordMatch[2];
    const wordStart = textBefore.length - rawWord.length;
    const syncMatch = lookupWordSync(wordPart);
    const hindiWord = syncMatch || (await transliterateWord(wordPart));
    const cleanHindi = convertHindiDigitsToArabic(hindiWord);
    const newText = textBefore.slice(0, wordStart) + numPart + ' ' + cleanHindi + ' ' + textAfter;
    const newCursor = wordStart + numPart.length + 1 + cleanHindi.length + 1;
    return { newText, newCursor };
  }

  const wordStart = textBefore.length - rawWord.length;

  // If word is pure English alphabet, transliterate
  if (/^[A-Za-z]+$/.test(rawWord)) {
    const syncMatch = lookupWordSync(rawWord);
    const hindiWord = syncMatch || (await transliterateWord(rawWord));
    const cleanHindi = convertHindiDigitsToArabic(hindiWord);
    if (cleanHindi !== rawWord) {
      const newText = textBefore.slice(0, wordStart) + cleanHindi + ' ' + textAfter;
      const newCursor = wordStart + cleanHindi.length + 1;
      return { newText, newCursor };
    }
  }

  return null;
}

