import { describe, it, expect } from 'vitest';
import { resolveLocale } from './resolve-locale';

// T2: Test unitario resolveLocale — RF covered: RF5, RNF8
describe('resolveLocale — T2 (red first)', () => {
  const locales = ['en', 'es'];

  describe('priority cookie → Accept-Language → defaultLocale', () => {
    it('valid cookie wins over Accept-Language', () => {
      const result = resolveLocale('es', 'en', locales, 'en');
      expect(result).toBe('es');
    });

    it('invalid cookie (fr) is ignored, Accept-Language is used', () => {
      const result = resolveLocale('fr', 'es', locales, 'en');
      expect(result).toBe('es');
    });

    it('Accept-Language: fr → en (fallback, unsupported language)', () => {
      const result = resolveLocale(undefined, 'fr', locales, 'en');
      expect(result).toBe('en');
    });

    it('no cookie nor header → defaultLocale (en)', () => {
      const result = resolveLocale(undefined, undefined, locales, 'en');
      expect(result).toBe('en');
    });

    it('cookieValue accepts string | undefined | null', () => {
      expect(resolveLocale(null, 'es', locales, 'en')).toBe('es');
      expect(resolveLocale(undefined, 'es', locales, 'en')).toBe('es');
      expect(resolveLocale('en', undefined, locales, 'en')).toBe('en');
    });
  });
});
