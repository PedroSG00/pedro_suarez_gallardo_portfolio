import { describe, it, expect } from 'vitest';
import { locales, defaultLocale, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, metadataRoutes } from './config';

type Locale = (typeof locales)[number];

// T11: config.ts — RF7
describe('config — T11', () => {
  it('locales is ["en", "es"] and Locale type derives correctly', () => {
    expect(locales).toEqual(['en', 'es']);
    const check: Locale = 'es';
    expect(check).toBe('es');
  });

  it('defaultLocale is "en"', () => {
    expect(defaultLocale).toBe('en');
    expect(locales.includes(defaultLocale)).toBe(true);
  });

  it('language cookie is "lang" with 1-year max-age', () => {
    expect(LOCALE_COOKIE).toBe('lang');
    expect(LOCALE_COOKIE_MAX_AGE).toBe(60 * 60 * 24 * 365);
  });

  it('metadataRoutes maps routes to metadata keys', () => {
    expect(metadataRoutes).toEqual({ '/': 'home', '/projects': 'projects' });
  });
});
