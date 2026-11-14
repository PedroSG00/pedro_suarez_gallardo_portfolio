/**
 * Pure language resolution (server-side, no Next.js).
 * RF covered: RF-3
 */

import { Locale } from '../config';

export function parseAcceptLanguage(
  header: string | undefined | null
): Array<{ base: string; q: number }> {
  if (!header) return [];

  const entries: Array<{ base: string; q: number }> = [];

  for (const part of header.split(',')) {
    const [tag, qPart] = part.split(';q=');
    const trimmedTag = tag.trim();

    if (trimmedTag === '*') continue;

    const q = qPart ? Number(qPart) : 1;
    if (q === 0 || Number.isNaN(q)) continue;

    const base = trimmedTag.toLowerCase().split('-')[0];
    entries.push({ base, q });
  }

  return entries.sort((a, b) => b.q - a.q);
}

export function resolveLocale(
  cookieValue: string | undefined | null,
  acceptLanguage: string | undefined | null,
  locales: string[],
  defaultLocale: string
): Locale {
  // 1. Cookie lang (saved preference, RF5)
  if (cookieValue && locales.includes(cookieValue)) {
    return cookieValue as Locale;
  }

  // 2. Accept-Language (RF1)
  for (const entry of parseAcceptLanguage(acceptLanguage)) {
    if (locales.includes(entry.base)) {
      return entry.base as Locale;
    }
  }

  // 3. Fallback to default language (English)
  return defaultLocale as Locale;
}
