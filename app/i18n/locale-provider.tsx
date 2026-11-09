/**
 * locale-provider.tsx — T17 (RF3, RF4, RF5)
 * "use client" component that provides the i18n context: receives `locale` and
 * the merged `dictionary` from the server, exposes `t` via Context.
 * Uses `useEffect` (not onMount). Extracts `syncOnMount` as a pure,
 * testable function.
 */

'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { createT } from './translate';
import {
  readStorage,
  writeStorage,
  readCookie,
  writeCookie,
} from './storage';
import { Locale, locales, LOCALE_COOKIE } from './config';

interface LocaleContextType {
  locale: Locale;
  dictionary: Record<string, unknown>;
  t: (key: string) => string;
  setLocale: (next: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export { LocaleContext };

/**
 * Synchronizes localStorage and cookie on hydration. Pure function (testable).
 * Never overwrites the preference with the URL language.
 */
export function syncOnMount(
  urlLocale: Locale,
  readStorageFn: (key: string) => string | null,
  writeStorageFn: (key: string, value: string) => void,
  readCookieFn: (key: string) => string | null,
  writeCookieFn: (key: string, value: string, options?: object) => void,
  localeList: ReadonlyArray<Locale>
): Locale {
  const cookie = readCookieFn(LOCALE_COOKIE);
  const stored = readStorageFn(LOCALE_COOKIE);

  const cookieValid =
    cookie !== null && localeList.includes(cookie as Locale);
  const storedValid =
    stored !== null && localeList.includes(stored as Locale);

  if (cookieValid && stored !== cookie) {
    writeStorageFn(LOCALE_COOKIE, cookie as Locale);
    return cookie as Locale;
  }

  if (!cookieValid && storedValid) {
    writeCookieFn(LOCALE_COOKIE, stored as Locale);
  }

  return urlLocale;
}

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
    writeStorage(LOCALE_COOKIE, next);
    writeCookie(LOCALE_COOKIE, next);
    setCurrentLocale(next);
  }, []);

  useEffect(() => {
    syncOnMount(
      locale,
      readStorage,
      writeStorage,
      readCookie,
      writeCookie,
      locales
    );
  }, [locale]);

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
