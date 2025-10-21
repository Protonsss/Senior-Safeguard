// Internationalization helper functions
import en from './locales/en.json';
import zh from './locales/zh.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';

export type Language = 'en' | 'zh' | 'hi' | 'ta';

export interface TranslationData {
  [key: string]: any;
}

const translations: Record<Language, TranslationData> = {
  en,
  zh,
  hi,
  ta,
};

/**
 * Get nested translation by dot-notation key
 * Example: t('en', 'greeting.welcome') => "Hello! I am here to help you..."
 */
export function t(language: Language, key: string, variables?: Record<string, string>): string {
  const keys = key.split('.');
  let value: any = translations[language];

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key} for language: ${language}`);
      return key;
    }
  }

  if (typeof value !== 'string') {
    console.warn(`Translation value is not a string: ${key} for language: ${language}`);
    return key;
  }

  // Replace variables in the string
  if (variables) {
    return value.replace(/\{(\w+)\}/g, (match, varName) => {
      return variables[varName] !== undefined ? variables[varName] : match;
    });
  }

  return value;
}

/**
 * Get all translations for a specific section
 * Example: getSection('en', 'greeting') => {...all greeting translations}
 */
export function getSection(language: Language, section: string): TranslationData | null {
  const value = translations[language]?.[section];
  return value || null;
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(lang: string): lang is Language {
  return ['en', 'zh', 'hi', 'ta'].includes(lang);
}

/**
 * Get language name in native script
 */
export function getLanguageName(language: Language): string {
  const names: Record<Language, string> = {
    en: 'English',
    zh: '中文',
    hi: 'हिंदी',
    ta: 'தமிழ்',
  };
  return names[language];
}

/**
 * Detect language from text using simple heuristics
 * This is a basic implementation - in production, use a proper language detection library
 */
export function detectLanguageFromText(text: string): Language {
  // Chinese characters
  if (/[\u4e00-\u9fa5]/.test(text)) return 'zh';
  
  // Hindi characters (Devanagari script)
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  
  // Tamil characters
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  
  // Default to English
  return 'en';
}

/**
 * Get voice speed multiplier based on preference
 */
export function getVoiceSpeed(speed: 'slow' | 'normal' | 'fast'): number {
  const speeds = {
    slow: 0.85,
    normal: 1.0,
    fast: 1.2,
  };
  return speeds[speed];
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Get language from Twilio language hint
 */
export function getTwilioLanguageCode(language: Language): string {
  const codes: Record<Language, string> = {
    en: 'en-US',
    zh: 'zh-CN',
    hi: 'hi-IN',
    ta: 'ta-IN',
  };
  return codes[language];
}

/**
 * Get Google Cloud TTS voice name for language
 */
export function getGoogleVoiceName(language: Language, gender: 'male' | 'female' = 'female'): string {
  const voices: Record<Language, { male: string; female: string }> = {
    en: { male: 'en-US-Neural2-J', female: 'en-US-Neural2-F' },
    zh: { male: 'cmn-CN-Wavenet-C', female: 'cmn-CN-Wavenet-A' },
    hi: { male: 'hi-IN-Wavenet-C', female: 'hi-IN-Wavenet-A' },
    ta: { male: 'ta-IN-Wavenet-B', female: 'ta-IN-Wavenet-A' },
  };
  return voices[language][gender];
}

export default {
  t,
  getSection,
  isLanguageSupported,
  getLanguageName,
  detectLanguageFromText,
  getVoiceSpeed,
  formatPhoneNumber,
  getTwilioLanguageCode,
  getGoogleVoiceName,
};

