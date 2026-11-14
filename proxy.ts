/**
 * proxy.ts — T13 (RF-2, RF-5)
 * Next.js 16 Proxy (the former middleware): single routing table that decides
 * between pass-through (200), permanent redirect (308), or not found (404).
 * Resolves the locale (cookie → Accept-Language → en) and redirects unprefixed
 * paths to /<locale>/.... Paths that already carry a valid locale prefix are
 * passed through. Technical assets are excluded.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { resolveLocale } from './app/i18n/resolution/resolve-locale';
import { locales, defaultLocale, LOCALE_COOKIE } from './app/i18n/config';

const LOCALES: string[] = [...locales];

/**
 * Returns true for technical assets that must pass through untouched.
 */
function isTechnicalAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') // covers /robots.txt, /sitemap.xml, .well-known/*, files with extensions
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Exclude technical assets (RF-5)
  if (isTechnicalAsset(pathname)) {
    return NextResponse.next();
  }

  // 2. Trailing slash → permanent redirect 308 to canonical form (without trailing slash)
  if (pathname.length > 1 && pathname.endsWith('/')) {
    const canonical = pathname.slice(0, -1);
    const redirectUrl = new URL(
      `${canonical}${request.nextUrl.search}`,
      request.url
    );
    return NextResponse.redirect(redirectUrl, 308);
  }

  // 3. Double slash anywhere → 404 (RF-5)
  if (pathname.includes('//')) {
    return new NextResponse(null, { status: 404 });
  }

  // 4. Parse first segment
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  // 5. No locale segment (root "/") → permanent redirect 308 to /{resolvedLocale}/
  if (!firstSegment) {
    const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
    const acceptLanguage = request.headers.get('accept-language') || '';
    const locale = resolveLocale(cookie, acceptLanguage, LOCALES, defaultLocale);
    const redirectUrl = new URL(
      `/${locale}${pathname}${request.nextUrl.search}`,
      request.url
    );
    const response = NextResponse.redirect(redirectUrl, 308);
    response.headers.set('Vary', 'Cookie, Accept-Language');
    return response;
  }

  // 6. First segment is exactly a supported locale → pass through (200)
  if (LOCALES.includes(firstSegment)) {
    return NextResponse.next();
  }

  // 7. Multiple segments where the first is not a valid locale → 404
  //    (e.g. /projects/en: locale not in first position)
  if (segments.length > 1) {
    return new NextResponse(null, { status: 404 });
  }

  // 8. Single segment that is a two-letter code but not 'en'/'es' → 404
  //    (unsupported locale, or uppercase variant like /ES)
  const isTwoLetterCode = /^[a-zA-Z]{2}$/.test(firstSegment);
  if (isTwoLetterCode) {
    return new NextResponse(null, { status: 404 });
  }

  // 9. Single segment that is not a language code → no locale prefix, redirect 308
  //    (e.g. /projects → /en/projects)
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const acceptLanguage = request.headers.get('accept-language') || '';
  const locale = resolveLocale(cookie, acceptLanguage, LOCALES, defaultLocale);
  const redirectUrl = new URL(
    `/${locale}${pathname}${request.nextUrl.search}`,
    request.url
  );
  const response = NextResponse.redirect(redirectUrl, 308);
  response.headers.set('Vary', 'Cookie, Accept-Language');
  return response;
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|.*\\..*).*)'],
};
