import { describe, it, expect } from 'vitest';
import en from './en.json';
import es from './es.json';
import { metadataRoutes } from '../config';

// T1 (004): Header dictionary contract — RF covered: RF-1, RF-6, RF-7, RF-8, RNF-9
// Done when: every header key exists in both dictionaries, nav.stack is identical
// in both languages, accessible names are complete sentences and the provisional
// themeSelect.* keys are still present (they are removed in T16).
const HEADER_KEY_PATHS = [
  'nav.home',
  'nav.experience',
  'nav.projects',
  'nav.stack',
  'nav.contact',
  'nav.label',
  'nav.menu',
  'header.label',
  'themeToggle.state.light',
  'themeToggle.state.dark',
  'themeToggle.state.system',
  'themeToggle.aria.light',
  'themeToggle.aria.dark',
  'themeToggle.aria.system',
  'languageMenu.label',
  'languageMenu.aria.en',
  'languageMenu.aria.es',
] as const;

// Accessible names carry option plus action in one sentence (RF-6, RF-7).
const ACCESSIBLE_NAME_PATHS = [
  'themeToggle.aria.light',
  'themeToggle.aria.dark',
  'themeToggle.aria.system',
  'languageMenu.aria.en',
  'languageMenu.aria.es',
] as const;

const SENTENCE_PATTERN = /^[A-ZÁÉÍÓÚÑ][^.]+\.\s+\S/;

function readPath(dictionary: unknown, path: string): unknown {
  let current: unknown = dictionary;
  for (const part of path.split('.')) {
    if (typeof current !== 'object' || current === null) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function findUnreadableTexts(dictionary: unknown): string[] {
  return HEADER_KEY_PATHS.filter((path) => {
    const value = readPath(dictionary, path);
    return typeof value !== 'string' || value.trim().length === 0;
  });
}

describe('header dictionary contract — T1', () => {
  it('declares every header text as a non-empty string in en.json', () => {
    expect(findUnreadableTexts(en)).toEqual([]);
  });

  it('declares every header text as a non-empty string in es.json', () => {
    expect(findUnreadableTexts(es)).toEqual([]);
  });

  it('keeps nav.stack identical in both languages (RF-1)', () => {
    expect(readPath(es, 'nav.stack')).toBe(readPath(en, 'nav.stack'));
    expect(readPath(en, 'nav.stack')).toBe('Stack');
  });

  it('writes every accessible name as a complete sentence (RF-6, RF-7)', () => {
    const fragments = ACCESSIBLE_NAME_PATHS.filter(
      (path) =>
        !SENTENCE_PATTERN.test(String(readPath(en, path))) ||
        !SENTENCE_PATTERN.test(String(readPath(es, path)))
    );
    expect(fragments).toEqual([]);
  });

  it('keeps es.json assignable to the shape of en.json (RNF-9)', () => {
    const typedEs: typeof en = es;
    expect(readPath(typedEs, 'nav.stack')).toBe(readPath(en, 'nav.stack'));
  });
});

// T1: Dictionary parity test — RF covered: RF-1, RNF-8, RNF-9
// Done when: `pnpm test` runs this test and fails if `es.json` has missing or
// extra keys compared to `en.json`, or if reserved keys are missing
// (`themeSelect.*`, `common.notFound`, `common.back`).
describe('dictionary parity — T1', () => {
  const RESERVED_KEYS = [
    'themeSelect',
    'common.notFound',
    'common.back',
  ] as const;

  it('no key in es.json is missing from en.json (recursive)', () => {
    function checkKeys(enObj: unknown, esObj: unknown, path: string) {
      if (
        typeof esObj === 'object' &&
        esObj !== null &&
        !Array.isArray(esObj)
      ) {
        const esRecord = esObj as Record<string, unknown>;
        const enRecord = enObj as Record<string, unknown>;
        for (const key of Object.keys(esRecord)) {
          const fullPath = `${path}${path ? '.' : ''}${key}`;
          expect(enRecord).toHaveProperty(key);
          checkKeys(enRecord[key], esRecord[key], fullPath);
        }
      }
    }
    checkKeys(en, es, '');
  });

  it('es.json has no extra keys compared to en.json (recursive)', () => {
    function checkKeys(enObj: unknown, esObj: unknown, path: string) {
      if (
        typeof enObj === 'object' &&
        enObj !== null &&
        !Array.isArray(enObj)
      ) {
        const enRecord = enObj as Record<string, unknown>;
        const esRecord = esObj as Record<string, unknown>;
        for (const key of Object.keys(enRecord)) {
          const fullPath = `${path}${path ? '.' : ''}${key}`;
          expect(esRecord).toHaveProperty(key);
          checkKeys(enRecord[key], esRecord[key], fullPath);
        }
      }
    }
    checkKeys(en, es, '');
  });

  it('en.json and es.json have the same top-level sections', () => {
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
  });

  it('reserved keys are present in en.json', () => {
    for (const key of RESERVED_KEYS) {
      const [top, nested] = key.split('.');
      expect(en).toHaveProperty(top);
      if (nested) {
        expect((en as Record<string, unknown>)[top]).toHaveProperty(nested);
      }
    }
  });

  it('reserved keys are present in es.json', () => {
    for (const key of RESERVED_KEYS) {
      const [top, nested] = key.split('.');
      expect(es).toHaveProperty(top);
      if (nested) {
        expect((es as Record<string, unknown>)[top]).toHaveProperty(nested);
      }
    }
  });

  it('each route in metadataRoutes has title and description in en', () => {
    for (const routeKey of Object.values(metadataRoutes)) {
      expect(en.metadata).toHaveProperty(routeKey);
      expect(
        en.metadata[routeKey as keyof typeof en.metadata]
      ).toHaveProperty('title');
      expect(
        en.metadata[routeKey as keyof typeof en.metadata]
      ).toHaveProperty('description');
    }
  });

  it('each route in metadataRoutes has title and description in es', () => {
    for (const routeKey of Object.values(metadataRoutes)) {
      expect(es.metadata).toHaveProperty(routeKey);
      expect(
        es.metadata[routeKey as keyof typeof es.metadata]
      ).toHaveProperty('title');
      expect(
        es.metadata[routeKey as keyof typeof es.metadata]
      ).toHaveProperty('description');
    }
  });

  it('deprecated key modalInfoJSDisabled is absent from en.json (RF-8)', () => {
    expect(en).not.toHaveProperty('modalInfoJSDisabled');
  });

  it('deprecated key modalInfoJSDisabled is absent from es.json (RF-8)', () => {
    expect(es).not.toHaveProperty('modalInfoJSDisabled');
  });
});
