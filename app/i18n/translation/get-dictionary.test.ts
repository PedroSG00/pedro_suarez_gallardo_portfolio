import { describe, it, expect } from 'vitest';
import { getDictionary } from './get-dictionary';
import en from '../dictionaries/en.json';
import es from '../dictionaries/es.json';

type TestDict = {
  nav: { home: string; projects: string; cv: string; contact: string; language: string };
  common: { back: string; notFound: string; copyright: string };
  themeSelect: { label: string };
  metadata: { home: { title: string; description: string }; projects: { title: string; description: string } };
};

// T10: get-dictionary.ts — load dictionary without runtime merge or fallback (RF-1)
// Done when: getDictionary returns each locale's dictionary exactly as stored,
// no English keys leak into Spanish, and no module mixes languages at runtime.
describe('getDictionary — T10', () => {
  it('returns the English dictionary exactly as-is (no merge, no fallback)', () => {
    const dict = getDictionary('en') as TestDict;
    expect(dict).toEqual(en);
    expect(dict.nav.home).toBe('Home');
  });

  it('returns the Spanish dictionary exactly as-is (no English fallback)', () => {
    const dict = getDictionary('es') as TestDict;
    expect(dict).toEqual(es);
    expect(dict.nav.home).toBe('Inicio');
    expect(dict.nav.language).toBe('Idioma');
  });

  it('does not merge English over Spanish — each locale is self-contained', () => {
    const enDict = getDictionary('en') as TestDict;
    const esDict = getDictionary('es') as TestDict;
    expect(esDict).not.toEqual(enDict);
    expect(esDict.nav.home).not.toBe(enDict.nav.home);
  });

  it('works for each locale declared in config.ts', () => {
    const locales = ['en', 'es'] as const;
    for (const locale of locales) {
      const dict = getDictionary(locale) as TestDict;
      expect(dict.nav.home).toBeDefined();
      expect(dict.metadata.home.title).toBeDefined();
    }
  });
});
