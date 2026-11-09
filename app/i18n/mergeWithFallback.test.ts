import { describe, it, expect } from 'vitest';
import { mergeWithFallback, createT } from './translate';

// T3: Test unitario mergeWithFallback y createT — RF: RF6, RNF1
describe('mergeWithFallback — T3', () => {
  it('deep merge: locale values prevail, missing keys fall back to English', () => {
    const en = {
      nav: { home: 'Home', projects: 'Projects', language: 'Language' },
      common: { back: 'Back', notFound: 'Page not found' },
    };
    const es = {
      nav: { home: 'Inicio', projects: 'Proyectos' },
    };
    const merged = mergeWithFallback(en, es) as Record<string, Record<string, string>>;
    expect(merged.nav.home).toBe('Inicio');
    expect(merged.nav.projects).toBe('Proyectos');
    expect(merged.nav.language).toBe('Language'); // falls back to English
    expect(merged.common.back).toBe('Back'); // falls back to English
    expect(merged.common.notFound).toBe('Page not found'); // falls back to English
  });

  it('returns English dictionary when locale is empty', () => {
    const en = { nav: { home: 'Home' } };
    const es = {};
    const merged = mergeWithFallback(en, es) as Record<string, Record<string, string>>;
    expect(merged).toEqual(en);
  });

  it('returns merged dictionary with all keys when locale has all keys', () => {
    const en = { nav: { home: 'Home' } };
    const es = { nav: { home: 'Inicio' } };
    const merged = mergeWithFallback(en, es) as Record<string, Record<string, string>>;
    expect(merged.nav.home).toBe('Inicio');
  });
});

describe('createT — T3', () => {
  it('clave en es → español', () => {
    const dict = { nav: { home: 'Inicio' } };
    const t = createT(dict);
    expect(t('nav.home')).toBe('Inicio');
  });

  it('solo en en → inglés', () => {
    const dict = { nav: { home: 'Home', projects: 'Projects' } };
    const t = createT(dict);
    expect(t('nav.home')).toBe('Home');
    expect(t('nav.projects')).toBe('Projects');
  });

  it('en ninguno → la propia clave (nunca hueco vacío)', () => {
    const dict = { nav: {} };
    const t = createT(dict);
    expect(t('nav.home')).toBe('nav.home');
    expect(t('missing.key')).toBe('missing.key');
  });

  it('devuelve la clave si el valor no es string', () => {
    const dict = { nav: { home: { nested: 'x' } } };
    const t = createT(dict);
    expect(t('nav.home')).toBe('nav.home');
  });
});
