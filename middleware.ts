import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './lib/i18n';
import { NextRequest, NextResponse } from 'next/server';

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static assets and special routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') || // Any file with extension (favicon.ico, robots.txt, etc.)
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }
  
  // Use next-intl middleware for all other routes
  return intlMiddleware(request);
}

export const config = {
  // Simplified matcher - we handle exclusions in the middleware function
  matcher: [
    '/',
    '/(en|es|vi|pt)/:path*',
    '/((?!_next|api).*)'
  ]
}; 