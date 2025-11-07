// Transliteration utilities for Marathi to English conversion
import Sanscript from '@indic-transliteration/sanscript';

/**
 * Transliterate Marathi (Devanagari) text to English (IAST/ISO)
 * @param {string} marathiText - Text in Devanagari script
 * @returns {string} - Transliterated English text
 */
export const transliterateToEnglish = (marathiText) => {
  if (!marathiText) return '';
  
  try {
    // Convert Devanagari to ISO romanization
    const transliterated = Sanscript.t(marathiText, 'devanagari', 'itrans');
    
    // Clean up and capitalize properly
    return cleanTransliteration(transliterated);
  } catch (error) {
    console.error('Transliteration error:', error);
    return marathiText; // Return original if error
  }
};

/**
 * Clean and format transliterated text
 * @param {string} text - Raw transliterated text
 * @returns {string} - Cleaned and formatted text
 */
const cleanTransliteration = (text) => {
  if (!text) return '';
  
  return text
    // Remove special characters used in transliteration
    .replace(/~/g, '')
    .replace(/\^/g, '')
    // Remove extra 'a' at end of words (common in Devanagari transliteration)
    .split(' ')
    .map(word => {
      // Remove trailing 'a' if word ends with consonant+a pattern
      let cleaned = word;
      if (cleaned.endsWith('a') && cleaned.length > 2) {
        const beforeA = cleaned.charAt(cleaned.length - 2);
        // Only remove if it's a consonant before 'a'
        if (!'aeiou'.includes(beforeA.toLowerCase())) {
          cleaned = cleaned.slice(0, -1);
        }
      }
      // Capitalize first letter
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
    })
    .join(' ')
    .trim();
};

/**
 * Gender mapping from Marathi to English
 */
const genderMap = {
  'पुरुष': 'Male',
  'पुरुष ': 'Male',
  'स्त्री': 'Female',
  'स्त्री ': 'Female',
  'इतर': 'Other',
  'इतर ': 'Other',
  'male': 'Male',
  'female': 'Female',
  'other': 'Other',
  'm': 'Male',
  'f': 'Female',
  'o': 'Other'
};

/**
 * Convert Marathi gender to English
 * @param {string} marathiGender - Gender in Marathi
 * @returns {string} - Gender in English
 */
export const translateGender = (marathiGender) => {
  if (!marathiGender) return '';
  
  const normalized = marathiGender.trim().toLowerCase();
  
  // Check direct mapping first
  for (const [key, value] of Object.entries(genderMap)) {
    if (key.toLowerCase() === normalized || marathiGender.trim() === key) {
      return value;
    }
  }
  
  // If already in English, capitalize properly
  if (!/[\u0900-\u097F]/.test(marathiGender)) {
    const lower = marathiGender.toLowerCase().trim();
    if (lower === 'male' || lower === 'm') return 'Male';
    if (lower === 'female' || lower === 'f') return 'Female';
    if (lower === 'other' || lower === 'o') return 'Other';
  }
  
  return marathiGender; // Return original if no match
};

/**
 * Check if text contains Marathi/Devanagari characters
 * @param {string} text - Text to check
 * @returns {boolean} - True if contains Devanagari
 */
export const isMarathiText = (text) => {
  if (!text) return false;
  const marathiPattern = /[\u0900-\u097F]/;
  return marathiPattern.test(text);
};

/**
 * Process voter name - if Marathi, transliterate to English
 * @param {string} name - Original name
 * @returns {object} - { nameEnglish, nameMarathi }
 */
export const processVoterName = (name) => {
  if (!name) {
    return { nameEnglish: '', nameMarathi: '' };
  }
  
  if (isMarathiText(name)) {
    return {
      nameEnglish: transliterateToEnglish(name),
      nameMarathi: name
    };
  } else {
    // Already in English
    return {
      nameEnglish: name,
      nameMarathi: '' // No Marathi version available
    };
  }
};

/**
 * Process gender - convert to both languages
 * @param {string} gender - Original gender
 * @returns {object} - { genderEnglish, genderMarathi }
 */
export const processGender = (gender) => {
  if (!gender) {
    return { genderEnglish: '', genderMarathi: '' };
  }
  
  if (isMarathiText(gender)) {
    return {
      genderEnglish: translateGender(gender),
      genderMarathi: gender
    };
  } else {
    // Already in English
    return {
      genderEnglish: translateGender(gender),
      genderMarathi: '' // No Marathi version
    };
  }
};

