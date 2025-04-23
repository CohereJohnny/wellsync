import type { ReactNode } from 'react';
import "../globals.css"; // Correct path: Up one level from [locale]
import { Toaster } from "@/components/ui/toaster";
import { SupabaseProvider } from "@/context/supabase-context";
import { MainToolbar } from "@/components/layout/main-toolbar";
import I18nClientProvider from "@/components/i18n-client-provider";

// NOTE: i18next language needs to be set based on locale param.
// This might require passing locale to I18nClientProvider or handling
// language change within the provider/toolbar based on URL.
// For now, the provider uses the default init language.

// Params are passed to layouts in the app router
interface LocaleLayoutProps {
    children: ReactNode;
    params: { locale: string };
}

// This layout receives the locale param
export default function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  // TODO: Set i18next language based on locale
  // e.g., use an effect in I18nClientProvider or call i18n.changeLanguage here?
  // For simplicity now, we rely on the LanguageSwitcher clicking links
  // which reloads the page and i18next *might* detect language, or 
  // we need explicit handling.

  return (
    // No <html> or <body> tags here
    <I18nClientProvider> 
      <SupabaseProvider>
        <MainToolbar /> 
        <main className="min-h-screen bg-background pt-16">
          {children}
        </main>
      </SupabaseProvider>
      <Toaster />
    </I18nClientProvider>
  );
} 