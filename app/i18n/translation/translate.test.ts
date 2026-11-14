import { describe, it, expect } from 'vitest';
import { createT } from './translate';

// T11: translate.ts — createT resolves dotted keys and throws on missing key (RF-1)
// Done when: createT returns the value for existing dotted keys and throws an
// explicit error (never returns the key itself) when a key is missing or not a string.
describe('createT — T11', () => {
  it('returns the dictionary value for a dotted key', () => {
    const dict = { nav: { home: 'Home', language: 'Language' } };
    const t = createT(dict);
    expect(t('nav.home')).toBe('Home');
    expect(t('nav.language')).toBe('Language');
  });

  it('throws an explicit error when the key does not exist (never returns the key)', () => {
    const dict = { nav: {} };
    const t = createT(dict);
    expect(() => t('nav.home')).toThrow();
    expect(() => t('missing.key')).toThrow();
  });

  it('throws an explicit error when the value is not a string', () => {
    const dict = { nav: { home: { nested: 'x' } } };
    const t = createT(dict);
    expect(() => t('nav.home')).toThrow();
  });

  it('error message includes the missing key', () => {
    const dict = { nav: {} };
    const t = createT(dict);
    expect(() => t('nav.home')).toThrow(/nav\.home/);
  });
});
