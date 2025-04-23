'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { supportedLngs } from '@/lib/i18n'; // Import supported languages
import { Button } from './ui/button'; // Assuming you use shadcn Button
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const pathname = usePathname();

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

  return (
    <div className="flex items-center space-x-1">
      {supportedLngs.map((locale) => (
        <Link href={getLocalizedPath(locale)} key={locale} legacyBehavior passHref>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-xs px-2 py-1 h-auto",
              currentLocale === locale ? "font-bold bg-muted" : "text-muted-foreground"
            )}
          >
            {locale.toUpperCase()} 
          </Button>
        </Link>
      ))}
    </div>
  );
} 