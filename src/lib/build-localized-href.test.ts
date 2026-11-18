import { describe, expect, test } from 'vitest';
import { buildLocalizedHref } from './build-localized-href';

describe('buildLocalizedHref', () => {
  test('preserves fragment when changing from /es#contact to English', () => {
    const url = new URL('https://example.com/es#contact');
    const result = buildLocalizedHref(url, 'en');
    expect(result).toBe('/en#contact');
  });

  test('preserves query string when changing from /en?utm_source=linkedin to Spanish', () => {
    const url = new URL('https://example.com/en?utm_source=linkedin');
    const result = buildLocalizedHref(url, 'es');
    expect(result).toBe('/es?utm_source=linkedin');
  });

  test('preserves path when changing from an inexistent route /en/unknown to Spanish', () => {
    const url = new URL('https://example.com/en/unknown');
    const result = buildLocalizedHref(url, 'es');
    expect(result).toBe('/es/unknown');
  });

  test('changes only the first path segment, not mixing languages', () => {
    const url = new URL('https://example.com/es/about/team');
    const result = buildLocalizedHref(url, 'en');
    expect(result).toBe('/en/about/team');
  });

  test('changes only the first segment when path is just /es', () => {
    const url = new URL('https://example.com/es');
    const result = buildLocalizedHref(url, 'en');
    expect(result).toBe('/en');
  });

  test('preserves both hash and query together', () => {
    const url = new URL('https://example.com/es/contact?utm_source=linkedin#contact');
    const result = buildLocalizedHref(url, 'en');
    expect(result).toBe('/en/contact?utm_source=linkedin#contact');
  });
});
