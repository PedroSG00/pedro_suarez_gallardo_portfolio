import type { Locale } from './locale';

const COOKIE_NAME = 'psg_locale';
const VALID_LOCALES: Locale[] = ['en', 'es'];

function parseAcceptLanguage(header?: string): Locale[] {
  if (!header) return [];
  return header
    .split(',')
    .map((part) => part.split(';')[0].trim().toLowerCase())
    .map((tag) => tag.split('-')[0])
    .filter((tag): tag is Locale => VALID_LOCALES.includes(tag as Locale));
}

export function resolveLocaleForRoot(
  request: { headers?: { 'accept-language'?: string } },
  cookieStore?: { cookies?: Record<string, string> } | null
): Locale {
  // 1. Elección explícita previa (cookie) tiene prioridad
  const cookieLocale = cookieStore?.cookies?.[COOKIE_NAME];
  if (cookieLocale === 'en' || cookieLocale === 'es') {
    return cookieLocale;
  }

  // 2. Preferencia del navegador (Accept-Language)
  const preferred = parseAcceptLanguage(request.headers?.['accept-language']);
  if (preferred.length > 0) {
    return preferred[0];
  }

  // 3. Fallback a inglés
  return 'en';
}
