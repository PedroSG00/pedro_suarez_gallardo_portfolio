import { describe, it, expect } from 'vitest';
import { parseAcceptLanguage } from './resolve-locale';

// T1: Test unitario parseAcceptLanguage — RF: RF1
describe('parseAcceptLanguage — T1 (red first)', () => {
  it('es-ES,es;q=0.9,en;q=0.8 → entries sorted by q desc', () => {
    const result = parseAcceptLanguage('es-ES,es;q=0.9,en;q=0.8');
    expect(result).toEqual([
      { base: 'es', q: 1 },
      { base: 'es', q: 0.9 },
      { base: 'en', q: 0.8 },
    ]);
  });

  it('ignores * and q=0', () => {
    const result = parseAcceptLanguage('*, fr;q=0, en;q=1');
    expect(result).toEqual([{ base: 'en', q: 1 }]);
  });

  it('empty header returns empty array', () => {
    expect(parseAcceptLanguage('')).toEqual([]);
    expect(parseAcceptLanguage(undefined)).toEqual([]);
    expect(parseAcceptLanguage(null)).toEqual([]);
  });

  it('sorts by q descending (stable)', () => {
    const result = parseAcceptLanguage('en;q=0.5, es;q=1, fr;q=0.7');
    expect(result).toEqual([
      { base: 'es', q: 1 },
      { base: 'fr', q: 0.7 },
      { base: 'en', q: 0.5 },
    ]);
  });

  it('extracts base language from tag with region', () => {
    const result = parseAcceptLanguage('pt-BR;q=0.9');
    expect(result).toEqual([{ base: 'pt', q: 0.9 }]);
  });
});
