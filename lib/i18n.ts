import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enCommon from '../locales/en/common.json';
import esCommon from '../locales/es/common.json';
import viCommon from '../locales/vi/common.json';
import ptCommon from '../locales/pt/common.json';

// Define resources
const resources = {
  en: {
    common: enCommon,
  },
  es: {
    common: esCommon,
  },
  vi: {
    common: viCommon,
  },
  pt: {
    common: ptCommon,
  },
};

// Define supported languages
export const supportedLngs = ['en', 'es', 'vi', 'pt'];
export const defaultLng = 'en';
export const locales = supportedLngs;
export const defaultLocale = defaultLng;

// Add this type and function for next-intl static rendering
export type Locale = typeof locales[number];

export function getRequestConfig({ locale }: { locale: string }) {
  // Validate and cast locale to the correct type
  const currentLocale = locales.includes(locale as Locale) 
    ? locale as Locale 
    : defaultLocale;
  
  return {
    locale: currentLocale,
    messages: async () => {
      try {
        return (await import(`../locales/${currentLocale}/common.json`)).default;
      } catch (error) {
        console.error(`Error loading messages for locale ${currentLocale}:`, error);
        return (await import(`../locales/${defaultLocale}/common.json`)).default;
      }
    }
  };
}

i18n
  .use(initReactI18next) // Ensure React integration is initialized
  .init({
    resources,
    // Start with default language, will be changed by provider
    lng: defaultLng,
    fallbackLng: defaultLng,
    supportedLngs: supportedLngs,
    ns: ['common'], // namespaces used
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    // Add debug: true for development logging
    debug: true,
    initAsync: true,
  });

// Log initial configuration
console.log(`[i18n] Initialized with:
- Default language: ${defaultLng}
- Supported languages: ${supportedLngs.join(', ')}
- Current language: ${i18n.language}
- Resources loaded: ${Object.keys(resources).join(', ')}
`);

export default i18n; 