/**
 * storage.ts — T16 (RF4, RNF6)
 * Read/write localStorage and `lang` cookie. Never throws if storage is blocked.
 * Supports SSR (typeof document check).
 */

import { LOCALE_COOKIE_MAX_AGE } from './config';

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
