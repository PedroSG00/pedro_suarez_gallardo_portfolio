/**
 * use-locale.ts — T18 (RF-4, RF-8)
 * Client hook that returns { locale, setLocale, t }.
 * setLocale validates that next is in locales, writes the lang cookie (never
 * localStorage), and navigates with router.push to the same route under the
 * new prefix (without a full page reload), preserving query and hash.
 * Storage errors are caught and do not interrupt the change.
 */

'use client';

import { useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LocaleContext } from './locale-provider';
import { writeCookie } from '../storage/storage';
import { Locale, locales, LOCALE_COOKIE } from '../config';

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  const { locale, setLocale: contextSetLocale, t } = context;
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      if (!locales.includes(next)) return;
      try {
        writeCookie(LOCALE_COOKIE, next);
      } catch {
        // Silently ignore cookie errors (RF-4, RNF-7)
      }
      contextSetLocale(next);
      // RF-4: navigate to the same route under the new prefix, without full reload,
      // preserving query string and hash.
      const pathname = window.location.pathname;
      const segments = pathname.split('/');
      const idx = segments.findIndex((s) => locales.includes(s as Locale));
      if (idx >= 0) {
        segments[idx] = next;
      } else {
        segments.splice(1, 0, next);
      }
      router.push(segments.join('/') + window.location.search + window.location.hash);
    },
    [router, contextSetLocale]
  );

  return { locale, setLocale, t };
}
