'use client'

import React, { ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { useParams } from 'next/navigation';
import i18n from '@/lib/i18n';
import { supportedLngs, defaultLng } from '@/lib/i18n';

interface I18nClientProviderProps {
  children: ReactNode;
}

export default function I18nClientProvider({ children }: I18nClientProviderProps) {
  const params = useParams();
  const locale = (params?.locale && typeof params.locale === 'string' && supportedLngs.includes(params.locale)) 
                 ? params.locale 
                 : defaultLng;

  useEffect(() => {
    if (i18n.language !== locale) {
      console.log(`[I18nClientProvider] Changing language from ${i18n.language} to ${locale}`);
      i18n.changeLanguage(locale).then(() => {
        console.log(`[I18nClientProvider] Successfully changed language to ${i18n.language}`);
      }).catch(err => {
        console.error(`[I18nClientProvider] Error changing language:`, err);
      });
    }
  }, [locale]);

  return (
    <I18nextProvider key={locale} i18n={i18n}>
      {children}
    </I18nextProvider>
  );
} 