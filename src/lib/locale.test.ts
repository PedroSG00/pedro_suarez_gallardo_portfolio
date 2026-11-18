import { describe, expect, test } from 'vitest';
import type { Locale } from './locale';

describe('Locale type', () => {
  test('accepts "en" and "es" as valid locales', () => {
    const locales: Locale[] = ['en', 'es'];
    expect(locales).toHaveLength(2);
    expect(locales).toContain('en');
    expect(locales).toContain('es');
  });
});
