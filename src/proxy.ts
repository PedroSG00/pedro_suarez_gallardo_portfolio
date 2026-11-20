import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import type { Locale } from '@/lib/locale';
import { COOKIE_NAME } from '@/lib/cookie-locale';
import { resolveLocaleForRoot } from '@/lib/resolve-locale';
import { routing } from '@/i18n/routing';
import enMessages from '../messages/en.json';

const handleI18nRouting = createMiddleware(routing);
const LOCALE_COOKIE_MAX_AGE = 31536000;

function isLocale(segment: string): segment is Locale {
  return (['en', 'es'] as Locale[]).includes(segment as Locale);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const lowercased = pathname.toLowerCase();
  const normalized = lowercased.replace(/\/$/, '') || '/';

  // Redirect only for case changes (e.g. /EN → /en). Trailing slashes are
  // handled by next-intl middleware internally (rewrite, not redirect) to
  // avoid redirect loops such as /es/ → /es → /es/.
  if (lowercased !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = normalized;
    return NextResponse.redirect(url);
  }

  const segments = normalized.split('/').filter(Boolean);

  // Double prefix locale (e.g. /en/es) → 404
  if (segments.length >= 2 && isLocale(segments[0]) && isLocale(segments[1])) {
    return new NextResponse(null, { status: 404 });
  }

  // Locale not admitted (e.g. /fr, /fr/about) → 404 with English message
  if (segments.length >= 1 && !isLocale(segments[0])) {
    const { title, message } = enMessages.shared.notFound;
    return new NextResponse(
      `<html lang="en"><body><h1>${title}</h1><p>${message}</p></body></html>`,
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
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }

  if (segments.length > 0 && isLocale(segments[0])) {
    const response = handleI18nRouting(request);
    response.cookies.set(COOKIE_NAME, segments[0], {
      httpOnly: true,
      maxAge: LOCALE_COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
