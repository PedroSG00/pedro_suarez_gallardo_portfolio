import { describe, expect, test } from 'vitest';
import { routing } from './routing';

describe('routing', () => {
  test('defines supported locales', () => {
    expect(routing.locales).toEqual(['en', 'es']);
  });

  test('sets English as default locale', () => {
    expect(routing.defaultLocale).toBe('en');
  });

  test('uses always locale prefix', () => {
    expect(routing.localePrefix).toBe('always');
  });

  test('disables automatic locale detection', () => {
    expect(routing.localeDetection).toBe(false);
  });

  test('disables locale cookie', () => {
    expect(routing.localeCookie).toBe(false);
  });
});
