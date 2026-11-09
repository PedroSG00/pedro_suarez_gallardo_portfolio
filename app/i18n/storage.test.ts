import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readStorage, writeStorage, readCookie, writeCookie } from './storage';

type CookieStore = { value: string };

// T16: storage.ts — RF4, RNF6
describe('storage — T16', () => {
  let cookieStore: CookieStore;
  const originalCookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');

  beforeEach(() => {
    localStorage.clear();
    cookieStore = { value: '' };
    Object.defineProperty(document, 'cookie', {
      get() { return cookieStore.value; },
      set(val: string) { cookieStore.value = val; },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalCookie) {
      Object.defineProperty(document, 'cookie', originalCookie);
    }
  });

  describe('readStorage / writeStorage', () => {
    it('reads and writes to localStorage', () => {
      writeStorage('lang', 'es');
      expect(readStorage('lang')).toBe('es');
    });

    it('returns null if key does not exist', () => {
      expect(readStorage('nonexistent')).toBeNull();
    });

    it('returns null and does not throw if localStorage getItem is blocked', () => {
      vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      expect(readStorage('lang')).toBeNull();
    });

    it('does not throw if localStorage setItem is blocked', () => {
      vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      expect(() => writeStorage('lang', 'es')).not.toThrow();
    });
  });

  describe('readCookie / writeCookie', () => {
    it('reads and writes cookie', () => {
      writeCookie('lang', 'es');
      expect(readCookie('lang')).toBe('es');
    });

    it('returns null if cookie does not exist', () => {
      expect(readCookie('nonexistent')).toBeNull();
    });

    it('writes cookie with default attributes: Path=/, Max-Age=1 year, SameSite=Lax, no HttpOnly', () => {
      writeCookie('lang', 'es');
      expect(cookieStore.value).toContain('lang=');
      expect(cookieStore.value).toContain('Path=/');
      expect(cookieStore.value).toContain('Max-Age=');
      expect(cookieStore.value).toContain('SameSite=Lax');
      expect(cookieStore.value).not.toContain('HttpOnly');
    });
  });
});
