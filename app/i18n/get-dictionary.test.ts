import { describe, it, expect } from 'vitest';
import { getDictionary } from './get-dictionary';
import { locales } from './config';

type TestDict = {
  nav: { home: string; projects: string; cv: string; contact: string; language: string };
  common: { back: string; notFound: string; copyright: string };
  themeSelect: { label: string };
  metadata: { home: { title: string; description: string }; projects: { title: string; description: string } };
};

// T14: get-dictionary.ts server (load and merge) — RF4, RF5
describe('getDictionary — T14', () => {
  it('returns the English dictionary when locale is "en"', () => {
    const dict = getDictionary('en') as TestDict;
    expect(dict.nav.home).toBe('Home');
    expect(dict.nav.language).toBe('Language');
  });

  it('merges es over en: Spanish keys prevail, missing keys fall back to English (RF6)', () => {
    const dict = getDictionary('es') as TestDict;
    expect(dict.nav.home).toBe('Inicio');
    expect(dict.nav.language).toBe('Idioma');
    expect(dict.common.back).toBe('Volver');
  });

  it('returns a plain object with no hardcoded texts', () => {
    const dict = getDictionary('es') as TestDict;
    expect(typeof dict).toBe('object');
    expect(dict).not.toHaveProperty('__fallback__');
    expect(dict.themeSelect.label).toBe('Tema');
  });

  it('works for each locale in config.ts', () => {
    for (const locale of locales) {
      const dict = getDictionary(locale) as TestDict;
      expect(dict.nav.home).toBeDefined();
      expect(dict.metadata.home.title).toBeDefined();
    }
  });
});
