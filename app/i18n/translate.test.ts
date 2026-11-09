import { describe, it, expect } from 'vitest';
import { createT } from './translate';

// translate.ts — createT (needed by T17, plan §3.4)
describe('createT — translate', () => {
  it('returns the dictionary value for a dotted key', () => {
    const dict = { nav: { home: 'Home', language: 'Language' } };
    const t = createT(dict);
    expect(t('nav.home')).toBe('Home');
    expect(t('nav.language')).toBe('Language');
  });

  it('returns the key when it does not exist in the dictionary (never an empty hole)', () => {
    const dict = { nav: {} };
    const t = createT(dict);
    expect(t('nav.home')).toBe('nav.home');
    expect(t('missing.key')).toBe('missing.key');
  });

  it('returns the key when the value is not a string', () => {
    const dict = { nav: { home: { nested: 'x' } } };
    const t = createT(dict);
    expect(t('nav.home')).toBe('nav.home');
  });
});
