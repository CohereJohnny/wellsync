import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './lib/i18n';

export default createMiddleware({
  locales,
  defaultLocale
});

export const config = {
  // Match only internationalized pathnames
  // Skip internal paths, API routes, and static assets
  matcher: [
    '/', // Match the root path
    '/(en|es|vi|pt)/:path*', // Match locale-prefixed paths (added pt for Portuguese)
    // Avoid matching internal Next.js paths, API routes, and static files
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)'
  ]
}; 