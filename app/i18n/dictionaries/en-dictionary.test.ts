import { describe, it, expect } from 'vitest';
import en from './en.json';

// T12: en.json dictionary (source of truth) — RF1
describe('en.json — T12', () => {
  it('has languages section with names in their own language', () => {
    expect(en.languages.en).toBe('English');
    expect(en.languages.es).toBe('Español');
  });

  it('has sections with hero and projects titles', () => {
    expect(en.sections.hero.title).toBe('Pedro Suárez Gallardo');
    expect(en.sections.projects.title).toBe('Projects');
  });

  it('has metadata section with home and projects (title + description)', () => {
    expect(en.metadata.home.title).toBeDefined();
    expect(en.metadata.home.description).toBeDefined();
    expect(en.metadata.projects.title).toBeDefined();
    expect(en.metadata.projects.description).toBeDefined();
  });

  it('has common section with notFound, back and errorCode', () => {
    expect(en.common.notFound).toBe('Page not found');
    expect(en.common.back).toBe('Back');
    expect(en.common.errorCode).toBe('404');
  });

  it('keeps preexisting themeSelect section', () => {
    expect(en.themeSelect.label).toBe('Theme');
  });
});
