import { NextResponse, type NextRequest } from 'next/server';
import type { Locale } from '@/lib/locale';
import { normalizePath } from '@/lib/normalize-path';
import { COOKIE_NAME } from '@/lib/cookie-locale';
import { resolveLocaleForRoot } from '@/lib/resolve-locale';

function isLocale(segment: string): segment is Locale {
  return (['en', 'es'] as Locale[]).includes(segment as Locale);
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const normalized = normalizePath(pathname);

  // Redirect if normalization changed the path (e.g. /EN → /en, /es/ → /es)
  if (normalized !== pathname) {
    const url = new URL(normalized, request.url);
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }

  const segments = normalized.split('/').filter(Boolean);

  // Double prefix locale (e.g. /en/es) → 404
  if (segments.length >= 2 && isLocale(segments[0]) && isLocale(segments[1])) {
    return new NextResponse(null, { status: 404 });
  }

  // Locale not admitted (e.g. /fr, /fr/about) → 404 with English message
  if (segments.length >= 1 && !isLocale(segments[0])) {
    return new NextResponse(
      '<html><body><h1>Not found</h1><p>This page does not exist.</p></body></html>',
      { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } }
    );
  }

  // Root path → resolve locale (cookie > Accept-Language > English fallback)
  if (normalized === '/') {
    const cookieValue = request.cookies.get(COOKIE_NAME)?.value;
    const cookieStore = cookieValue ? { cookies: { [COOKIE_NAME]: cookieValue } } : undefined;
    const locale = resolveLocaleForRoot(
      { headers: { 'accept-language': request.headers.get('accept-language') ?? undefined } },
      cookieStore
    );
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Valid locale prefix → let Next.js handle the route
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
