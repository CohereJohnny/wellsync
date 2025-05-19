// This file is required by next-intl
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Default to 'en' if no locale is provided
  const resolvedLocale = locale || 'en';
  
  // Load messages for the requested locale
  let messages;
  try {
    // First try to load common messages
    const commonMessages = await import(`../locales/${resolvedLocale}/common.json`)
      .then(module => module.default)
      .catch(() => {
        console.warn(`Missing common messages for locale: ${resolvedLocale}`);
        return {};
      });
    
    // Try to load nav messages
    const navMessages = await import(`../locales/${resolvedLocale}/nav.json`)
      .then(module => module.default)
      .catch(() => {
        console.warn(`Missing nav messages for locale: ${resolvedLocale}`);
        return {};
      });
    
    // Combine all messages
    messages = {
      ...commonMessages,
      ...navMessages
    };
  } catch (error) {
    console.error(`Failed to load messages for locale: ${resolvedLocale}`, error);
    
    // Fallback to English when there's an error
    try {
      messages = {
        ...(await import('../locales/en/common.json')).default,
        ...(await import('../locales/en/nav.json')).default
      };
    } catch (e) {
      console.error('Failed to load fallback messages:', e);
      messages = { allRightsReserved: 'All Rights Reserved' };
    }
  }
  
  return {
    locale: resolvedLocale,
    messages,
    timeZone: 'America/Chicago',
    now: new Date(),
  };
}); 