import { describe, it, expect } from 'vitest';
import en from './en.json';

// T12: en.json dictionary (source of truth) — RF6, RNF1
describe('en.json — T12', () => {
  it('has nav section with home, projects, cv, contact, language', () => {
    expect(en.nav.home).toBe('Home');
    expect(en.nav.projects).toBe('Projects');
    expect(en.nav.cv).toBe('CV');
    expect(en.nav.contact).toBe('Contact');
    expect(en.nav.language).toBe('Language');
  });

  it('has languages section with names in their own language', () => {
    expect(en.languages.en).toBe('English');
    expect(en.languages.es).toBe('Español');
  });

  it('has sections section with hero and about', () => {
    expect(en.sections.hero.title).toBe('Pedro Suárez Gallardo');
    expect(en.sections.hero.role).toBe('Web Developer');
    expect(en.sections.about.title).toBe('About me');
  });

  it('has metadata section with home and projects (title + description)', () => {
    expect(en.metadata.home.title).toBeDefined();
    expect(en.metadata.home.description).toBeDefined();
    expect(en.metadata.projects.title).toBeDefined();
    expect(en.metadata.projects.description).toBeDefined();
  });

  it('has common section with notFound, back, copyright', () => {
    expect(en.common.notFound).toBe('Page not found');
    expect(en.common.back).toBe('Back');
    expect(en.common.copyright).toBe('© Pedro Suárez Gallardo');
  });

  it('keeps preexisting themeSelect and modalInfoJSDisabled sections', () => {
    expect(en.themeSelect.label).toBe('Theme');
    expect(en.modalInfoJSDisabled.title).toBe('JavaScript disabled');
  });
});
