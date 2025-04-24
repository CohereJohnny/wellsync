import type { ReactNode } from 'react';
import "../globals.css"; // Correct path: Up one level from [locale]
import { Toaster } from "@/components/ui/toaster";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import I18nClientProvider from "@/components/i18n-client-provider";
import { MainToolbar } from "@/components/layout/main-toolbar";
import { Providers } from './providers';

// Params are passed to layouts in the app router
interface LocaleLayoutProps {
    children: ReactNode;
    params: { locale: string };
}

// This layout receives the locale param
export default async function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  console.log(`[LocaleLayout] Rendering with locale: ${locale}`);
  const messages = await getMessages({ locale });

  return (
    // No <html> or <body> tags here
    <NextIntlClientProvider locale={locale} messages={messages}>
      <I18nClientProvider>
        <Providers>
          <MainToolbar />
          <main className="min-h-screen bg-background">
            {children}
          </main>
          <Toaster />
        </Providers>
      </I18nClientProvider>
    </NextIntlClientProvider>
  );
} 