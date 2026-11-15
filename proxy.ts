/**
 * proxy.ts — T13 (RF-2, RF-5, RF-7)
 * Next.js 16 Proxy (the former middleware): single routing table that decides
 * between pass-through (200), permanent redirect (308), or a localized
 * not-found screen (404). Resolves the locale (cookie → Accept-Language → en)
 * and redirects unprefixed paths to /<locale>/....
 *
 * Invalid variants (double slashes, unsupported/uppercase locales, anomalous
 * encodings or lengths) are rewritten to the bilingual 404 screen so the
 * response never falls back to an empty framework 404. The resolved locale is
 * forwarded to the app through the `x-locale` request header.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { resolveLocale } from './app/i18n/resolution/resolve-locale';
import {
  defaultLocale,
  LOCALE_COOKIE,
  locales,
  type Locale,
} from './app/i18n/config';

const LOCALES: string[] = [...locales];

function resolveRequestLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const acceptLanguage = request.headers.get('accept-language') || '';
  return resolveLocale(cookie, acceptLanguage, LOCALES, defaultLocale);
}

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

/**
 * Invalid percent-encoding, control characters or NUL → 404 (RF-5 case 25).
 */
function hasAnomalousEncoding(pathname: string): boolean {
  return (
    /%(?![0-9A-Fa-f]{2})/.test(pathname) ||
    /[\u0000-\u001F\u007F]/.test(pathname)
  );
}

/**
 * Forwards the resolved locale to the app through a request header.
 */
function forwardLocale(request: NextRequest, locale: string): Headers {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', locale);
  return requestHeaders;
}

function passThrough(request: NextRequest, locale: string): NextResponse {
  return NextResponse.next({
    request: { headers: forwardLocale(request, locale) },
  });
}

function localizedNotFound(request: NextRequest, locale: string): NextResponse {
  const destination = new URL(`/${locale}/__not-found`, request.url);
  const response = NextResponse.rewrite(destination, {
    request: { headers: forwardLocale(request, locale) },
  });
  response.headers.set('Vary', 'Cookie, Accept-Language');
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Exclude technical assets (RF-5)
  if (isTechnicalAsset(pathname)) {
    return NextResponse.next();
  }

  const locale = resolveRequestLocale(request);

  // 2. Anomalous paths → 404 screen (RF-5): double slashes, invalid encodings,
  //    control characters/NUL or extreme length.
  if (
    pathname.includes('//') ||
    pathname.length > 2048 ||
    hasAnomalousEncoding(pathname)
  ) {
    return localizedNotFound(request, locale);
  }

  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  // 3. Any segment longer than 255 chars → 404
  if (segments.some((s) => s.length > 255)) {
    return localizedNotFound(request, locale);
  }

  // 4. Trailing slash → permanent redirect 308 to canonical form (RF-5)
  if (pathname.length > 1 && pathname.endsWith('/')) {
    const canonical = pathname.slice(0, -1);
    const redirectUrl = new URL(
      `${canonical}${request.nextUrl.search}`,
      request.url
    );
    return NextResponse.redirect(redirectUrl, 308);
  }

  // 5. No locale segment (root "/") → permanent redirect 308 to /{locale}/
  if (!firstSegment) {
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
    return passThrough(request, firstSegment);
  }

  // 7. Multiple segments where the first is not a valid locale → 404
  //    (e.g. /projects/en: locale not in first position)
  if (segments.length > 1) {
    return localizedNotFound(request, locale);
  }

  // 8. Single two-letter code that is not 'en'/'es' → 404 (unsupported locale,
  //    or uppercase variant such as /ES)
  if (/^[a-zA-Z]{2}$/.test(firstSegment)) {
    return localizedNotFound(request, locale);
  }

  // 9. No locale prefix → permanent redirect 308 to /{locale}{path}
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
