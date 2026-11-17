import { describe, expect, test } from 'vitest';
import { getLocaleCookie, setLocaleCookie } from './cookie-locale';
import type { Locale } from './locale';

describe('getLocaleCookie', () => {
  test('returns "en" when cookie contains valid locale en', () => {
    const request = { cookies: { psg_locale: 'en' } };
    expect(getLocaleCookie(request)).toBe('en');
  });

  test('returns "es" when cookie contains valid locale es', () => {
    const request = { cookies: { psg_locale: 'es' } };
    expect(getLocaleCookie(request)).toBe('es');
  });

  test('returns null when no cookies object', () => {
    const request = {};
    expect(getLocaleCookie(request)).toBeNull();
  });

  test('returns null when cookie value is invalid', () => {
    const request = { cookies: { psg_locale: 'fr' } };
    expect(getLocaleCookie(request)).toBeNull();
  });

  test('returns null when cookie value is empty', () => {
    const request = { cookies: { psg_locale: '' } };
    expect(getLocaleCookie(request)).toBeNull();
  });

  test('reads from headers.cookie when cookies object is absent', () => {
    const request = { headers: { cookie: 'psg_locale=en' } };
    expect(getLocaleCookie(request)).toBe('en');
  });

  test('prefers cookies object over headers.cookie', () => {
    const request = {
      cookies: { psg_locale: 'es' },
      headers: { cookie: 'psg_locale=en' },
    };
    expect(getLocaleCookie(request)).toBe('es');
  });
});

describe('setLocaleCookie', () => {
  test('sets Set-Cookie header with locale, HttpOnly, SameSite=Lax, Path=/, Max-Age=1 year', () => {
    const response = { headers: {} as Record<string, string[]> };
    setLocaleCookie(response, 'es');
    const cookie = response.headers['set-cookie'][0];
    expect(cookie).toContain('psg_locale=es');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Path=/');
    expect(cookie).toContain('Max-Age=31536000');
  });

  test('sets Set-Cookie header for locale en', () => {
    const response = { headers: {} as Record<string, string[]> };
    setLocaleCookie(response, 'en');
    const cookie = response.headers['set-cookie'][0];
    expect(cookie).toContain('psg_locale=en');
  });

  test('appends to existing set-cookie headers', () => {
    const response = {
      headers: { 'set-cookie': ['other=cookie'] } as Record<string, string[]>,
    };
    setLocaleCookie(response, 'es');
    expect(response.headers['set-cookie']).toHaveLength(2);
    expect(response.headers['set-cookie'][0]).toBe('other=cookie');
    expect(response.headers['set-cookie'][1]).toContain('psg_locale=es');
  });

  test('does not throw when response has no headers', () => {
    const response = {};
    expect(() => setLocaleCookie(response, 'en')).not.toThrow();
  });
});
