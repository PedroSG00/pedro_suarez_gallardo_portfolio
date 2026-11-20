import { describe, expect, test } from 'vitest';
import { SECTION_DEFINITIONS, buildSectionDestinations } from './sections';

describe('SECTION_DEFINITIONS', () => {
  test('defines exactly the four destinations', () => {
    expect(SECTION_DEFINITIONS).toHaveLength(4);
  });

  test('keeps the section ids in the order fixed by the spec', () => {
    expect(SECTION_DEFINITIONS.map((definition) => definition.id)).toEqual([
      'about',
      'work',
      'stack',
      'contact',
    ]);
  });

  test('numbers the destinations from 01 to 04', () => {
    expect(SECTION_DEFINITIONS.map((definition) => definition.index)).toEqual([
      '01',
      '02',
      '03',
      '04',
    ]);
  });
});

describe('buildSectionDestinations', () => {
  test('applies the received labels in the same order as the definitions', () => {
    const destinations = buildSectionDestinations({
      about: 'Sobre mí',
      work: 'Trabajo',
      stack: 'Stack',
      contact: 'Contacto',
    });

    expect(destinations).toEqual([
      { id: 'about', index: '01', label: 'Sobre mí' },
      { id: 'work', index: '02', label: 'Trabajo' },
      { id: 'stack', index: '03', label: 'Stack' },
      { id: 'contact', index: '04', label: 'Contacto' },
    ]);
  });

  test('does not mutate the section definitions', () => {
    const snapshot = SECTION_DEFINITIONS.map((definition) => ({
      ...definition,
    }));

    const destinations = buildSectionDestinations({
      about: 'About',
      work: 'Work',
      stack: 'Stack',
      contact: 'Contact',
    });

    expect(SECTION_DEFINITIONS).toEqual(snapshot);
    expect(destinations[0]).not.toBe(SECTION_DEFINITIONS[0]);
    expect('label' in SECTION_DEFINITIONS[0]).toBe(false);
  });
});
