import { NextResponse, type NextRequest } from 'next/server';

const LOCALES = ['en', 'es'] as const;
type Locale = (typeof LOCALES)[number];

function isLocale(segment: string): segment is Locale {
  return LOCALES.includes(segment as Locale);
}

function normalizePathname(pathname: string): string {
  let normalized = pathname.toLowerCase();
  if (normalized !== '/' && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const normalized = normalizePathname(pathname);

  // Redirect if normalization changed the path (e.g. /EN → /en, /es/ → /es)
  if (normalized !== pathname) {
    return NextResponse.redirect(new URL(normalized, request.url));
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
      {
        status: 404,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      }
    );
  }

  // Root path → resolve locale (cookie > Accept-Language > English fallback)
  if (normalized === '/') {
    const cookieLocale = request.cookies.get('psg_locale')?.value;
    if (cookieLocale && isLocale(cookieLocale)) {
      return NextResponse.redirect(new URL(`/${cookieLocale}`, request.url));
    }

    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      const preferred = acceptLanguage
        .split(',')
        .map((part) => part.split(';')[0].trim().toLowerCase())
        .map((tag) => tag.split('-')[0])
        .find((tag) => isLocale(tag));

      if (preferred) {
        return NextResponse.redirect(new URL(`/${preferred}`, request.url));
      }
    }

    return NextResponse.redirect(new URL('/en', request.url));
  }

  // Valid locale prefix with extra segments (e.g. /en/unknown) → 404 localized
  if (segments.length > 1 && isLocale(segments[0])) {
    const locale = segments[0];
    const isSpanish = locale === 'es';
    return new NextResponse(
      `<html><body><h1>${isSpanish ? 'No encontrado' : 'Not found'}</h1><p>${isSpanish ? 'Esta página no existe.' : 'This page does not exist.'}</p></body></html>`,
      {
        status: 404,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      }
    );
  }

  // Valid locale prefix → let Next.js handle the route
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
