import type { Locale } from './locale';

export function buildLocalizedHref(
  currentUrl: URL,
  targetLocale: Locale
): string {
  const pathname = currentUrl.pathname;
  const hash = currentUrl.hash;
  const search = currentUrl.search;

  const segments = pathname.split('/').filter(Boolean);
  segments[0] = targetLocale;
  const newPathname = '/' + segments.join('/');

  return newPathname + search + hash;
}
