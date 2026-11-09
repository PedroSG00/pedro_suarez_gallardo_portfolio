import { describe, it, expect } from 'vitest';
import en from './en.json';
import es from './es.json';
import { metadataRoutes } from '../config';

// T5: Test de paridad de diccionarios — RF: RF6, RNF1
describe('dictionary parity — T5', () => {
  it('no key in es.json is missing from en.json', () => {
    const esKeys = Object.keys(es);
    const enKeys = Object.keys(en);
    for (const key of esKeys) {
      expect(enKeys).toContain(key);
    }
  });

  it('en.json and es.json have the same top-level sections', () => {
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
  });

  it('every section in es.json has matching keys in en.json (recursive)', () => {
    function checkKeys(enObj: unknown, esObj: unknown, path: string) {
      if (typeof esObj === 'object' && esObj !== null && !Array.isArray(esObj)) {
        const esRecord = esObj as Record<string, unknown>;
        const enRecord = enObj as Record<string, unknown>;
        for (const key of Object.keys(esRecord)) {
          const fullPath = `${path}.${key}`;
          expect(enRecord).toHaveProperty(key);
          checkKeys(enRecord[key], esRecord[key], fullPath);
        }
      }
    }
    checkKeys(en, es, '');
  });

  it('each route in metadataRoutes has title and description in en', () => {
    for (const routeKey of Object.values(metadataRoutes)) {
      expect(en.metadata).toHaveProperty(routeKey);
      expect(en.metadata[routeKey as keyof typeof en.metadata]).toHaveProperty(
        'title'
      );
      expect(en.metadata[routeKey as keyof typeof en.metadata]).toHaveProperty(
        'description'
      );
    }
  });

  it('each route in metadataRoutes has title and description in es', () => {
    for (const routeKey of Object.values(metadataRoutes)) {
      expect(es.metadata).toHaveProperty(routeKey);
      expect(es.metadata[routeKey as keyof typeof es.metadata]).toHaveProperty(
        'title'
      );
      expect(es.metadata[routeKey as keyof typeof es.metadata]).toHaveProperty(
        'description'
      );
    }
  });
});
