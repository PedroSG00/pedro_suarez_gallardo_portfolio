import { describe, it, expect } from 'vitest';
import en from './en.json';
import es from './es.json';

// T13: es.json dictionary (Spanish translations) — RF6
describe('es.json — T13', () => {
  it('has the same sections as en.json', () => {
    expect(Object.keys(es)).toEqual(expect.arrayContaining(Object.keys(en)));
  });

  it('has no keys that do not exist in en.json', () => {
    for (const key of Object.keys(es)) {
      expect(en).toHaveProperty(key);
    }
  });

  it('has nav section translated to Spanish', () => {
    expect(es.nav.home).toBe('Inicio');
    expect(es.nav.projects).toBe('Proyectos');
    expect(es.nav.cv).toBe('CV');
    expect(es.nav.contact).toBe('Contacto');
    expect(es.nav.language).toBe('Idioma');
  });

  it('has languages section with names in their own language', () => {
    expect(es.languages.en).toBe('English');
    expect(es.languages.es).toBe('Español');
  });

  it('has sections section translated', () => {
    expect(es.sections.hero.title).toBe('Pedro Suárez Gallardo');
    expect(es.sections.hero.role).toBe('Desarrollador web');
    expect(es.sections.about.title).toBe('Sobre mí');
  });

  it('has metadata section translated', () => {
    expect(es.metadata.home.title).toBe('Pedro Suárez Gallardo — Desarrollador web');
    expect(es.metadata.home.description).toBe('Portfolio y currículum de Pedro Suárez Gallardo, desarrollador web.');
    expect(es.metadata.projects.title).toBe('Proyectos — Pedro Suárez Gallardo');
    expect(es.metadata.projects.description).toBe('Selección de proyectos de desarrollo web de Pedro Suárez Gallardo.');
  });

  it('has common section translated', () => {
    expect(es.common.notFound).toBe('Página no encontrada');
    expect(es.common.back).toBe('Volver');
    expect(es.common.copyright).toBe('© Pedro Suárez Gallardo');
  });

  it('keeps preexisting themeSelect and modalInfoJSDisabled sections', () => {
    expect(es.themeSelect.label).toBe('Tema');
    expect(es.modalInfoJSDisabled.title).toBe('JavaScript desactivado');
  });
});
