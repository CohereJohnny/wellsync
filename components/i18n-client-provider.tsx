'use client'

import React, { ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { useParams } from 'next/navigation'; // Import useParams
import i18n from '@/lib/i18n'; // Import the initialized i18next instance
import { supportedLngs, defaultLng } from '@/lib/i18n'; // Import language config

interface I18nClientProviderProps {
  children: ReactNode;
}

export default function I18nClientProvider({ children }: I18nClientProviderProps) {
  const params = useParams();
  // Get locale from params, default to defaultLng if invalid/missing
  const locale = (params?.locale && typeof params.locale === 'string' && supportedLngs.includes(params.locale)) 
                 ? params.locale 
                 : defaultLng;

  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale]); // Rerun effect if locale changes

  // The i18n instance's language is now managed by the effect
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
} 