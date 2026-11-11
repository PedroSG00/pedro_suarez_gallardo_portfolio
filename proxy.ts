/**
 * proxy.ts — T6 (RF1, RF5, RNF4, RNF8)
 * Next.js 16 Proxy (the former middleware): resolves the locale
 * (cookie → Accept-Language → en) and redirects unprefixed paths to /<locale>/...
 * Paths that already carry a valid locale prefix are left untouched.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { resolveLocale } from './app/i18n/resolve-locale';
import { locales, defaultLocale, LOCALE_COOKIE } from './app/i18n/config';

const LOCALES: string[] = [...locales];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude /_next, /favicon.ico and files with an extension (RNF8)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // If the first segment is already a valid locale, the URL wins: pass through
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  if (firstSegment && LOCALES.includes(firstSegment)) {
    return NextResponse.next();
  }

  // Resolve locale: cookie → Accept-Language → defaultLocale (RNF8)
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const acceptLanguage = request.headers.get('accept-language') || '';
  const locale = resolveLocale(cookie, acceptLanguage, LOCALES, defaultLocale);

  // 307 redirect to /<locale><pathname>, preserving the query string (RNF8)
  const redirectUrl = new URL(
    `/${locale}${pathname}${request.nextUrl.search}`,
    request.url
  );
  const response = NextResponse.redirect(redirectUrl, 307);
  response.headers.set('Vary', 'Cookie, Accept-Language');
  return response;
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|.*\\..*).*)'],
};
