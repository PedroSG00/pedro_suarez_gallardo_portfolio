import { describe, expect, test } from 'vitest';
import { normalizePath } from './normalize-path';

describe('normalizePath', () => {
  test('/EN converts to /en', () => {
    expect(normalizePath('/EN')).toBe('/en');
  });

  test('/es/ removes trailing slash to /es', () => {
    expect(normalizePath('/es/')).toBe('/es');
  });

  test('/ stays as /', () => {
    expect(normalizePath('/')).toBe('/');
  });

  test('/ES/About converts to lowercase /es/about', () => {
    expect(normalizePath('/ES/About')).toBe('/es/about');
  });
});
