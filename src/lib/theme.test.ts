import { describe, expect, test } from 'vitest';
import { isTheme, resolveTheme, THEME_STORAGE_KEY } from './theme';
import type { StoredTheme } from './theme';

describe('isTheme', () => {
  test.each([
    ['light', true],
    ['dark', true],
    ['Light', false],
    ['', false],
    ['auto', false],
    [null, false],
    [undefined, false],
    [0, false],
    [true, false],
    [{}, false],
    [[], false],
  ])('accepts only "light" and "dark": %s → %s', (value, expected) => {
    expect(isTheme(value)).toBe(expected);
  });
});

describe('resolveTheme', () => {
  test.each([
    ['light', false, 'light'],
    ['light', true, 'light'],
    ['dark', false, 'dark'],
    ['dark', true, 'dark'],
    [null, false, 'light'],
    [null, true, 'dark'],
  ])('stored=%s, systemPrefersDark=%s → %s', (stored, systemPrefersDark, expected) => {
    expect(resolveTheme(stored as StoredTheme, systemPrefersDark as boolean)).toBe(expected);
  });
});

describe('THEME_STORAGE_KEY', () => {
  test('is exactly "psg-theme"', () => {
    expect(THEME_STORAGE_KEY).toBe('psg-theme');
  });
});
