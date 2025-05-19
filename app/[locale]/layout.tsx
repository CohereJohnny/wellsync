import { SupabaseProvider } from '@/context/supabase-context';
import { Toaster } from '@/components/ui/toaster';
import '@/app/globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { ThemeProvider } from '@/components/theme-provider';
import HeaderNav from '@/components/layout/header-nav';

export const metadata = {
  title: 'GridSync AI',
  description: 'Centerpoint Transformer Monitoring and Management Solution',
};

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }, { locale: 'pt' }];
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  const t = await getTranslations('common');
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'GridSync AI';

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <SupabaseProvider>
              <HeaderNav appName={appName} />
              <main>{children}</main>
              <Toaster />
              <footer className="border-t py-4 text-center text-sm text-gray-500">
                <div className="container mx-auto px-4">
                  © {new Date().getFullYear()} {appName}. {t('allRightsReserved')}
                </div>
              </footer>
            </SupabaseProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 