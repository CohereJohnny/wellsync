import type { ReactNode } from 'react';
import "../globals.css"; // Correct path: Up one level from [locale]
import { Toaster } from "@/components/ui/toaster";
import { SupabaseProvider } from "@/context/supabase-context";
import { NextIntlClientProvider } from 'next-intl';
import { useMessages, useLocale } from 'next-intl';
import { MainToolbar } from "@/components/layout/main-toolbar";

// Params are passed to layouts in the app router
interface LocaleLayoutProps {
    children: ReactNode;
    params: { locale: string };
}

// This layout receives the locale param
export default function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  const messages = useMessages();
  const activeLocale = useLocale();

  return (
    // No <html> or <body> tags here
    <NextIntlClientProvider locale={activeLocale} messages={messages}>
      <SupabaseProvider>
        <MainToolbar />
        <main className="min-h-screen bg-background pt-16">
          {children}
        </main>
        <Toaster />
      </SupabaseProvider>
    </NextIntlClientProvider>
  );
} 