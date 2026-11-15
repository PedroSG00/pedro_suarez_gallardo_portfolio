import { describe, it, expect } from 'vitest';
import en from './en.json';
import es from './es.json';

// T13: es.json dictionary (Spanish translations) — RF1
describe('es.json — T13', () => {
  it('has the same sections as en.json', () => {
    expect(Object.keys(es)).toEqual(expect.arrayContaining(Object.keys(en)));
  });

  it('has no keys that do not exist in en.json', () => {
    for (const key of Object.keys(es)) {
      expect(en).toHaveProperty(key);
    }
  });

  it('has languages section with names in their own language', () => {
    expect(es.languages.en).toBe('English');
    expect(es.languages.es).toBe('Español');
  });

  it('has sections section translated', () => {
    expect(es.sections.hero.title).toBe('Pedro Suárez Gallardo');
    expect(es.sections.projects.title).toBe('Proyectos');
  });

  it('has metadata section translated', () => {
    expect(es.metadata.home.title).toBe(
      'Pedro Suárez Gallardo — Desarrollador web'
    );
    expect(es.metadata.home.description).toBe(
      'Portfolio y currículum de Pedro Suárez Gallardo, desarrollador web.'
    );
    expect(es.metadata.projects.title).toBe(
      'Proyectos — Pedro Suárez Gallardo'
    );
    expect(es.metadata.projects.description).toBe(
      'Selección de proyectos de desarrollo web de Pedro Suárez Gallardo.'
    );
  });

  it('has common section translated', () => {
    expect(es.common.notFound).toBe('Página no encontrada');
    expect(es.common.back).toBe('Volver');
    expect(es.common.errorCode).toBe('404');
  });

  it('has nav, header, themeToggle and languageMenu sections translated — T1 (RF-1, RF-6, RF-7)', () => {
    expect(es.nav).toEqual({
      home: 'Inicio',
      experience: 'Experiencia',
      projects: 'Proyectos',
      stack: 'Stack',
      contact: 'Contacto',
      label: 'Navegación principal',
      menu: 'Menú',
    });
    expect(es.header).toEqual({ label: 'Cabecera del sitio' });
    expect(es.themeToggle).toEqual({
      state: { light: 'Claro', dark: 'Oscuro', system: 'Sistema' },
      aria: {
        light: 'Tema claro. Cambiar a tema oscuro',
        dark: 'Tema oscuro. Cambiar a tema del sistema',
        system: 'Tema del sistema. Cambiar a tema claro',
      },
    });
    expect(es.languageMenu).toEqual({
      label: 'Idioma',
      aria: { en: 'English. Cambiar idioma', es: 'Español. Cambiar idioma' },
    });
  });

  it('keeps preexisting themeSelect section', () => {
    expect(es.themeSelect.label).toBe('Tema');
  });
});
