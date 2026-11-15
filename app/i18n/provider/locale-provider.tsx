/**
 * locale-provider.tsx — T17 (RF-1, RF-3, RF-4)
 * "use client" component that provides the i18n context: receives `locale` and
 * the `dictionary` from the server and exposes `t` via Context.
 *
 * On mount it runs the one-time legacy migration of `localStorage.lang` into
 * the `lang` cookie (single source of truth). The URL still wins for the
 * current view, so the migration never changes what the user is reading.
 */

'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { createT } from '../translation/translate';
import { migrateLegacyLang } from '../storage/storage';
import { Locale, locales } from '../config';

interface LocaleContextType {
  locale: Locale;
  dictionary: Record<string, unknown>;
  t: (key: string) => string;
  setLocale: (next: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export { LocaleContext };

export default function LocaleProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Record<string, unknown>;
  children: ReactNode;
}) {
  const [currentLocale, setCurrentLocale] = useState<Locale>(locale);

  const t = createT(dictionary);

  const setLocale = useCallback((next: Locale) => {
    if (!locales.includes(next)) return;
    // Cookie write is the responsibility of use-locale.ts (unique writer, RF-4).
    // Here we only update the context; the cookie is written by use-locale.
    setCurrentLocale(next);
  }, []);

  useEffect(() => {
    // One-time legacy migration: reads localStorage.lang once, migrates it to
    // the cookie when there is no valid cookie yet, and deletes the legacy key.
    // The cookie is the single source of truth from then on (RF-3, RF-8).
    migrateLegacyLang();
  }, []);

  const value: LocaleContextType = {
    locale: currentLocale,
    dictionary,
    t,
    setLocale,
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}
