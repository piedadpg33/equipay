import * as Localization from 'expo-localization';
import i18next from 'i18next';
import 'intl-pluralrules';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/translation.json';
import es from './locales/es/translation.json';

// language detector
const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: (callback) => {
    try {
      const locale = Localization.locale || 'en';
      const languageCode = locale.split('-')[0];
      console.log('[i18n] Detected locale:', locale, '->', languageCode);
      if (languageCode === 'es' || languageCode === 'en') {
        callback(languageCode);
      } else {
        callback('en');
      }
    } catch (e) {
      console.warn('[i18n] Language detection failed, defaulting to en', e);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18next
  .use(initReactI18next)
  .use(languageDetector)
  .init({
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      es: { translation: es }
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18next;