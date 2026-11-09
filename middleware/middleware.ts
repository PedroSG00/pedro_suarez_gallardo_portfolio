/**
 * middleware.ts — T6 (RF1, RF5, RNF4, RNF8)
 * Next.js middleware que resuelve el idioma (cookie → Accept-Language → en)
 * y redirige rutas sin prefijo de idioma a /<locale>/...
 * No toca rutas que ya llevan prefijo válido.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { resolveLocale } from '../app/i18n/resolve-locale';
import { locales, defaultLocale, LOCALE_COOKIE } from '../app/i18n/config';

const LOCALES: string[] = [...locales];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Excluir /_next, /favicon.ico y ficheros con extensión (RNF8)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Si el primer segmento ya es un locale válido, la URL manda: pasar sin redirigir
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  if (firstSegment && LOCALES.includes(firstSegment)) {
    return NextResponse.next();
  }

  // Resolver idioma: cookie → Accept-Language → defaultLocale (RNF8)
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const acceptLanguage = request.headers.get('accept-language') || '';
  const locale = resolveLocale(cookie, acceptLanguage, LOCALES, defaultLocale);

  // Redirect 307 a /<locale><pathname> conservando query (RNF8)
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
