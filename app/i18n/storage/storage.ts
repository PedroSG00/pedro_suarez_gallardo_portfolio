/**
 * storage.ts — T9 (RF-3, RF-8)
 * Read/write localStorage and `lang` cookie. Never throws if storage is blocked.
 * Supports SSR (typeof document check).
 */

import { LOCALE_COOKIE_MAX_AGE } from '../config';

const hasDocument = typeof document !== 'undefined';

/**
 * Reads a value from localStorage. Returns null if missing or if storage is blocked.
 */
export function readStorage(key: string): string | null {
  if (!hasDocument) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Writes a value to localStorage. Never throws if storage is blocked.
 */
export function writeStorage(key: string, value: string): void {
  if (!hasDocument) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Silently ignore storage errors (RF4, RNF6)
  }
}

/**
 * Reads a cookie by name. Returns null if it does not exist.
 */
export function readCookie(key: string): string | null {
  if (!hasDocument) return null;
  try {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${key}=`));
    return match ? match.split('=').slice(1).join('=') : null;
  } catch {
    return null;
  }
}

/**
 * Writes a cookie. Default attributes: Path=/, Max-Age=1 year, SameSite=Lax, no HttpOnly.
 */
export function writeCookie(
  key: string,
  value: string,
  options: {
    path?: string;
    maxAge?: number;
    sameSite?: 'Lax' | 'Strict' | 'None';
    secure?: boolean;
  } = {}
) {
  if (!hasDocument) return;
  try {
    const {
      path = '/',
      maxAge = LOCALE_COOKIE_MAX_AGE,
      sameSite = 'Lax',
      secure = false,
    } = options;
    let cookie = `${key}=${encodeURIComponent(value)}; Path=${path}; Max-Age=${maxAge}; SameSite=${sameSite}`;
    if (secure) cookie += '; Secure';
    document.cookie = cookie;
  } catch {
    // Silently ignore cookie errors (RF4, RNF6)
  }
}

/**
 * Valid values for the `lang` cookie (RF-3): 'en' | 'es' exactly after trimming spaces.
 */
const VALID_LANGS = new Set(['en', 'es']);

function isValidLang(value: string | null): value is 'en' | 'es' {
  if (!value) return false;
  return VALID_LANGS.has(value.trim() as 'en' | 'es');
}

/**
 * One-time migration of legacy `localStorage.lang` → cookie `lang` (RF-3, RF-8).
 *
 * Rules:
 *  - If a valid `lang` cookie exists, it wins and is not overwritten.
 *  - `localStorage.lang` is read exactly once and deleted (one-time cleanup), with or without cookie.
 *  - Only when there is no valid cookie and `localStorage.lang` is valid, the cookie is written and the value returned.
 *  - Never throws if storage is blocked.
 */
export function migrateLegacyLang(): 'en' | 'es' | null {
  // 1. Valid cookie → wins (spec RF-3, case 29). Not overwritten.
  const cookieLang = readCookie('lang');
  if (isValidLang(cookieLang)) {
    // One-time legacy cleanup without re-reading localStorage.
    if (hasDocument) {
      try {
        localStorage.removeItem('lang');
      } catch {
        // Ignored if storage is blocked.
      }
    }
    return cookieLang;
  }

  // 2. No valid cookie: read localStorage.lang exactly once.
  let storageLang: string | null = null;
  if (hasDocument) {
    try {
      storageLang = localStorage.getItem('lang');
    } catch {
      storageLang = null;
    }
  }
  // One-time legacy cleanup (whether it exists or not).
  if (hasDocument) {
    try {
      localStorage.removeItem('lang');
    } catch {
      // Ignored if storage is blocked.
    }
  }

  // 3. Migrate only if the read value is valid.
  if (isValidLang(storageLang)) {
    writeCookie('lang', storageLang);
    return storageLang;
  }

  return null;
}
