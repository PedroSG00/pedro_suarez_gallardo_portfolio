import { describe, it, expect } from 'vitest';
import { resolveLocale, parseAcceptLanguage } from './resolve-locale';

// T2: Unit test for resolveLocale — RF covered: RF-3
// Done when: this test covers valid/invalid/empty/duplicate cookies,
// Accept-Language with weights, wildcard, q=0, ties and malformed values,
// and the cookie → browser → English order; it is red before implementing
// resolve-locale.ts.
const locales: string[] = ['en', 'es'];
const defaultLocale = 'en';

describe('resolveLocale — T2', () => {
  describe('order: cookie → Accept-Language → English default', () => {
    it('valid cookie wins over Accept-Language', () => {
      expect(resolveLocale('es', 'en', locales, defaultLocale)).toBe('es');
    });

    it('valid cookie wins over defaultLocale', () => {
      expect(resolveLocale('es', undefined, locales, defaultLocale)).toBe('es');
    });

    it('Accept-Language is used when no cookie', () => {
      expect(resolveLocale(undefined, 'es', locales, defaultLocale)).toBe('es');
    });

    it('defaultLocale (English) when no cookie nor Accept-Language', () => {
      expect(resolveLocale(undefined, undefined, locales, defaultLocale)).toBe(
        'en'
      );
    });
  });

  describe('valid / invalid / empty / duplicate cookies', () => {
    it('valid cookie "en"', () => {
      expect(resolveLocale('en', 'es', locales, defaultLocale)).toBe('en');
    });

    it('valid cookie "es"', () => {
      expect(resolveLocale('es', 'en', locales, defaultLocale)).toBe('es');
    });

    it('invalid cookie (unsupported "fr") is ignored and uses Accept-Language', () => {
      expect(resolveLocale('fr', 'es', locales, defaultLocale)).toBe('es');
    });

    it('empty cookie is ignored and uses Accept-Language', () => {
      expect(resolveLocale('', 'es', locales, defaultLocale)).toBe('es');
    });

    it('null cookie is ignored and uses Accept-Language', () => {
      expect(resolveLocale(null, 'es', locales, defaultLocale)).toBe('es');
    });

    it('duplicate/malformed cookie ("en,es") does not match exactly and is ignored', () => {
      expect(resolveLocale('en,es', 'es', locales, defaultLocale)).toBe('es');
    });

    it('cookie with uppercase ("ES") does not match exactly and is ignored', () => {
      expect(resolveLocale('ES', 'es', locales, defaultLocale)).toBe('es');
    });
  });

  describe('Accept-Language with weights', () => {
    it('highest weight wins', () => {
      expect(resolveLocale(undefined, 'es;q=0.5,en;q=1', locales, defaultLocale)).toBe(
        'en'
      );
    });

    it('no weight assumes q=1', () => {
      expect(resolveLocale(undefined, 'es,en', locales, defaultLocale)).toBe('es');
    });

    it('mix with and without weight', () => {
      expect(resolveLocale(undefined, 'en;q=0.8,es', locales, defaultLocale)).toBe(
        'es'
      );
    });
  });

  describe('Accept-Language wildcard and q=0', () => {
    it('wildcard "*" is ignored', () => {
      expect(resolveLocale(undefined, '*,es', locales, defaultLocale)).toBe('es');
    });

    it('wildcard only → defaultLocale', () => {
      expect(resolveLocale(undefined, '*', locales, defaultLocale)).toBe(
        defaultLocale
      );
    });

    it('q=0 is ignored and moves to next', () => {
      expect(resolveLocale(undefined, 'es;q=0,en', locales, defaultLocale)).toBe(
        'en'
      );
    });

    it('all q=0 → defaultLocale', () => {
      expect(resolveLocale(undefined, 'es;q=0,en;q=0', locales, defaultLocale)).toBe(
        defaultLocale
      );
    });
  });

  describe('Accept-Language tie (same q)', () => {
    it('tie resolved by order of appearance (first supported)', () => {
      expect(resolveLocale(undefined, 'es,en', locales, defaultLocale)).toBe('es');
      expect(resolveLocale(undefined, 'en,es', locales, defaultLocale)).toBe('en');
    });
  });

  describe('Accept-Language malformed values', () => {
    it('garbage is ignored → defaultLocale', () => {
      expect(resolveLocale(undefined, ';;;', locales, defaultLocale)).toBe(
        defaultLocale
      );
    });

    it('unsupported language with high q → defaultLocale', () => {
      expect(resolveLocale(undefined, 'fr;q=1,de;q=0.9', locales, defaultLocale)).toBe(
        defaultLocale
      );
    });

    it('subtag "-ES" normalized to base "es"', () => {
      expect(resolveLocale(undefined, 'es-ES', locales, defaultLocale)).toBe('es');
    });

    it('extra parameters after q are ignored', () => {
      expect(resolveLocale(undefined, 'es;q=1;foo=bar', locales, defaultLocale)).toBe(
        defaultLocale
      );
    });

    it('negative q is ignored', () => {
      expect(resolveLocale(undefined, 'es;q=-1,en', locales, defaultLocale)).toBe(
        'en'
      );
    });

    it('q greater than 1 is ignored and the remaining entries are used', () => {
      expect(resolveLocale(undefined, 'es;q=2,en;q=1', locales, defaultLocale)).toBe(
        'en'
      );
    });

    it('q greater than 1 alone → defaultLocale', () => {
      expect(resolveLocale(undefined, 'es;q=2', locales, defaultLocale)).toBe(
        defaultLocale
      );
    });

    it('negative q alone → defaultLocale', () => {
      expect(resolveLocale(undefined, 'es;q=-1', locales, defaultLocale)).toBe(
        defaultLocale
      );
    });

    it('empty Accept-Language → defaultLocale', () => {
      expect(resolveLocale(undefined, '', locales, defaultLocale)).toBe(
        defaultLocale
      );
    });
  });

  describe('parseAcceptLanguage', () => {
    it('returns empty array for null/undefined/empty header', () => {
      expect(parseAcceptLanguage(undefined)).toEqual([]);
      expect(parseAcceptLanguage(null)).toEqual([]);
      expect(parseAcceptLanguage('')).toEqual([]);
    });

    it('sorts by q descending', () => {
      const result = parseAcceptLanguage('en;q=0.5,es;q=1,fr;q=0.8');
      expect(result.map((e: { base: string; q: number }) => e.base)).toEqual(['es', 'fr', 'en']);
    });
  });
});
