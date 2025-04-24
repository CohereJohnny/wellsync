// This file is required by next-intl and must be a .js file
import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // Validate locale is defined
  if (!locale) {
    console.error('Locale is undefined');
    locale = 'en'; // Default to English if locale is undefined
  }

  try {
    // Use absolute path from project root, not relative to i18n directory
    const messages = (await import(`../locales/${locale}/common.json`)).default;
    return {
      locale,
      messages
    };
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    // Fallback to English
    const fallbackMessages = (await import('../locales/en/common.json')).default;
    return {
      locale: 'en',
      messages: fallbackMessages
    };
  }
}); 