'use client'

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supportedLngs } from '@/lib/i18n'; // Import supported languages
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';

// Map of language codes to names
const languageNames: Record<string, string> = {
  en: 'English',
  es: 'Español',
  vi: 'Tiếng Việt',
  pt: 'Português'
};

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Helper to generate the URL for a different locale
  const getLocalizedPath = (locale: string) => {
    if (!pathname) return '/';
    const segments = pathname.split('/');
    // Check if the first segment is a supported locale
    if (supportedLngs.includes(segments[1])) {
      segments[1] = locale;
      return segments.join('/');
    } else {
      // If no locale prefix is found (e.g., root path), prepend the new locale
      // This might be less common with the middleware redirecting
      return `/${locale}${pathname}`;
    }
  };

  // Determine current locale from pathname
  const currentLocale = supportedLngs.find(locale => pathname.startsWith(`/${locale}`)) || 'en';

  // Handle language change
  const handleLanguageChange = (newLocale: string) => {
    const newPath = getLocalizedPath(newLocale);
    router.push(newPath);
  };

  return (
    <div className="flex items-center">
      <Select value={currentLocale} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[130px] bg-[#1e3a8a] border-none focus:ring-0 focus:ring-offset-0 text-white">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>{languageNames[currentLocale] || currentLocale}</span>
          </div>
        </SelectTrigger>
        <SelectContent className="bg-[#1e3a8a] border-[#2d4999] text-white">
          {supportedLngs.map((locale) => (
            <SelectItem 
              key={locale} 
              value={locale} 
              className="hover:bg-[#2d4999] focus:bg-[#2d4999] focus:text-white"
            >
              {languageNames[locale] || locale}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 