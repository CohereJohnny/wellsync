import { NextRequest, NextResponse } from 'next/server';
import { defaultLng, supportedLngs } from '@/lib/i18n'; // Import config

// Basic middleware for locale handling via path prefix
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = supportedLngs.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = defaultLng;

    // Prepend the default locale and redirect
    // e.g. incoming request is /dashboard -> /en/dashboard
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Skip all internal paths (_next, assets, api)
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)'
  ],
}; 