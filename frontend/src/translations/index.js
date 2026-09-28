import en from './en.js';
import hi from './hi.js';
import kn from './kn.js';

export const translations = {
  en,
  hi,
  kn
};

export const normalizeLanguage = (lang) => {
  if (!lang) return 'en';
  const str = String(lang).toLowerCase().trim();
  if (str === 'hi' || str === 'hindi') return 'hi';
  if (str === 'kn' || str === 'kannada') return 'kn';
  if (str === 'en' || str === 'english') return 'en';
  return 'en';
};

const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;
  const keys = path.split('.');
  let current = obj;
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return undefined;
    }
  }
  return current;
};

export const getTranslation = (lang, keyPath, params = {}) => {
  const normLang = normalizeLanguage(lang);
  let val = getNestedValue(translations[normLang], keyPath);
  
  if (val === undefined && normLang !== 'en') {
    val = getNestedValue(translations.en, keyPath);
  }
  
  if (val === undefined) {
    return keyPath;
  }
  
  if (typeof val === 'string' && params && Object.keys(params).length > 0) {
    let result = val;
    Object.entries(params).forEach(([paramKey, paramVal]) => {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramVal !== undefined && paramVal !== null ? paramVal : '');
    });
    return result;
  }
  
  return val;
};
