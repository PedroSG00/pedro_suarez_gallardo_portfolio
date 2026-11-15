import { describe, it, expect } from 'vitest';
import { DESTINATIONS } from './destinations';
import { createT } from '../i18n/translation/translate';
import { getDictionary } from '../i18n/translation/get-dictionary';
import { locales } from '../i18n/config';

// T2 (004): Single destination list — RF covered: RF-1, RF-3, RNF-8, RNF-9
// Done when: five destinations in home → contact order, unique ids and section
// ids, projects points at its page and every labelKey resolves in both
// dictionaries.
const EXPECTED_IDS = ['home', 'experience', 'projects', 'stack', 'contact'];
// The array order is also the section order on the home page (RF-3).
const EXPECTED_SECTION_IDS = [
  'inicio',
  'experiencia',
  'proyectos',
  'stack',
  'contacto',
];

describe('DESTINATIONS — T2', () => {
  it('declares the five destinations in menu and page order (RF-3)', () => {
    expect(DESTINATIONS.map((destination) => destination.id)).toEqual(
      EXPECTED_IDS
    );
    expect(DESTINATIONS.map((destination) => destination.sectionId)).toEqual(
      EXPECTED_SECTION_IDS
    );
  });

  it('keeps ids and section ids unique (RF-1, RF-3)', () => {
    const ids = DESTINATIONS.map((destination) => destination.id);
    const sectionIds = DESTINATIONS.map((destination) => destination.sectionId);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(sectionIds).size).toBe(sectionIds.length);
  });

  it('derives each labelKey from its own id, so a destination is one row (RNF-8)', () => {
    const mismatched = DESTINATIONS.filter(
      (destination) => destination.labelKey !== `nav.${destination.id}`
    );

    expect(mismatched).toEqual([]);
  });

  it('gives a page only to the projects destination (RF-1)', () => {
    const projects = DESTINATIONS.find(
      (destination) => destination.id === 'projects'
    );
    const withPage = DESTINATIONS.filter(
      (destination) => destination.page !== null
    ).map((destination) => destination.id);

    expect(projects?.page).toBe('projects');
    expect(withPage).toEqual(['projects']);
  });

  it('resolves every labelKey in both dictionaries (RF-1, RNF-9)', () => {
    const unresolved: string[] = [];

    for (const locale of locales) {
      const t = createT(getDictionary(locale));
      for (const destination of DESTINATIONS) {
        try {
          if (t(destination.labelKey).trim().length === 0) {
            unresolved.push(`${locale}:${destination.labelKey}`);
          }
        } catch {
          unresolved.push(`${locale}:${destination.labelKey}`);
        }
      }
    }

    expect(unresolved).toEqual([]);
  });

  it('resolves the stack label identically in both languages (RF-1)', () => {
    const stack = DESTINATIONS.find(
      (destination) => destination.id === 'stack'
    );
    const labels = locales.map((locale) =>
      createT(getDictionary(locale))(stack?.labelKey ?? '')
    );

    expect(labels).toHaveLength(2);
    expect(labels[0]).toBe(labels[1]);
  });
});
