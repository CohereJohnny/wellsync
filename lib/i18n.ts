import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enCommon from '../locales/en/common.json';
import esCommon from '../locales/es/common.json';

// Define resources
const resources = {
  en: {
    common: enCommon,
  },
  es: {
    common: esCommon,
  },
};

// Define supported languages
export const supportedLngs = ['en', 'es'];
export const defaultLng = 'en';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: defaultLng, // default language
    fallbackLng: defaultLng,
    supportedLngs: supportedLngs,
    ns: ['common'], // namespaces used
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    // Add debug: true for development logging
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n; 