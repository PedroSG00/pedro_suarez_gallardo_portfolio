import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readStorage, writeStorage, readCookie, writeCookie, migrateLegacyLang } from './storage';

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

    it('returns null and does not throw if document.cookie read is blocked', () => {
      const originalDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
      Object.defineProperty(document, 'cookie', {
        get() { throw new Error('blocked'); },
        configurable: true,
      });
      expect(readCookie('lang')).toBeNull();
      if (originalDescriptor) {
        Object.defineProperty(document, 'cookie', originalDescriptor);
      }
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

// Legacy localStorage.lang → cookie migration (RF-3, RF-8)
describe('legacy localStorage.lang → cookie migration (RF-3, RF-8)', () => {
  let cookieStore: { value: string };
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

  it('migrates localStorage.lang to cookie when no cookie lang exists', () => {
    localStorage.setItem('lang', 'es');
    const result = migrateLegacyLang();
    expect(result).toBe('es');
    expect(readCookie('lang')).toBe('es');
    expect(localStorage.getItem('lang')).toBeNull();
  });

  it('reads localStorage.lang exactly once when migrating', () => {
    localStorage.setItem('lang', 'es');
    const spy = vi.spyOn(Storage.prototype, 'getItem');
    migrateLegacyLang();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('lang');
  });

  it('does not migrate if localStorage.lang does not exist and no cookie', () => {
    const result = migrateLegacyLang();
    expect(result).toBeNull();
    expect(readCookie('lang')).toBeNull();
    expect(localStorage.getItem('lang')).toBeNull();
  });

  it('cookie wins over localStorage.lang and is not overwritten', () => {
    writeCookie('lang', 'en');
    localStorage.setItem('lang', 'es');
    const result = migrateLegacyLang();
    expect(result).toBe('en'); // cookie wins
    expect(readCookie('lang')).toBe('en'); // cookie not overwritten
    expect(localStorage.getItem('lang')).toBeNull(); // legacy cleaned once
  });

  it('does not write cookie if localStorage.lang has invalid value', () => {
    localStorage.setItem('lang', 'fr');
    const result = migrateLegacyLang();
    expect(result).toBeNull();
    expect(readCookie('lang')).toBeNull();
    expect(localStorage.getItem('lang')).toBeNull();
  });

  it('does not throw if localStorage read is blocked during migration', () => {
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = vi.fn(() => {
      throw new Error('blocked');
    });
    const result = migrateLegacyLang();
    expect(result).toBeNull();
    Storage.prototype.getItem = originalGetItem;
  });
});
