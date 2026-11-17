import { describe, expect, test } from 'vitest';
import { resolveLocaleForRoot } from './resolve-locale';

describe('resolveLocaleForRoot', () => {
  const request = (acceptLanguage?: string) => ({
    headers: acceptLanguage ? { 'accept-language': acceptLanguage } : {},
  });

  test('returns the cookie locale with priority over the browser', () => {
    const cookieStore = { cookies: { psg_locale: 'es' } };
    const result = resolveLocaleForRoot(request('en'), cookieStore);
    expect(result).toBe('es');
  });

  test('returns cookie locale "en" with priority over the browser', () => {
    const cookieStore = { cookies: { psg_locale: 'en' } };
    const result = resolveLocaleForRoot(request('es'), cookieStore);
    expect(result).toBe('en');
  });

  test('without cookie returns the first compatible language from Accept-Language in order', () => {
    const result = resolveLocaleForRoot(request('es,en;q=0.9'));
    expect(result).toBe('es');
  });

  test('without cookie returns "en" when it is the first in Accept-Language', () => {
    const result = resolveLocaleForRoot(request('en,es;q=0.9'));
    expect(result).toBe('en');
  });

  test('normalizes regional subtag es-ES to es', () => {
    const result = resolveLocaleForRoot(request('es-ES'));
    expect(result).toBe('es');
  });

  test('normalizes regional subtag en-US to en', () => {
    const result = resolveLocaleForRoot(request('en-US'));
    expect(result).toBe('en');
  });

  test('returns "en" when the browser does not indicate a compatible language', () => {
    const result = resolveLocaleForRoot(request('fr,de;q=0.8'));
    expect(result).toBe('en');
  });

  test('returns "en" when there is no Accept-Language nor cookie', () => {
    const result = resolveLocaleForRoot(request());
    expect(result).toBe('en');
  });

  test('ignores invalid cookie and uses the browser', () => {
    const cookieStore = { cookies: { psg_locale: 'fr' } };
    const result = resolveLocaleForRoot(request('es'), cookieStore);
    expect(result).toBe('es');
  });

  test('ignores empty cookie and uses the browser', () => {
    const cookieStore = { cookies: { psg_locale: '' } };
    const result = resolveLocaleForRoot(request('es'), cookieStore);
    expect(result).toBe('es');
  });

  test('without cookieStore uses the browser and fallback to English', () => {
    const result = resolveLocaleForRoot(request('fr'));
    expect(result).toBe('en');
  });
});
