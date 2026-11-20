import { describe, expect, test } from 'vitest';
import { validateParity } from './i18n-parity';
import enMessages from '../../messages/en.json';
import esMessages from '../../messages/es.json';

describe('validateParity', () => {
  test('messages/en.json and messages/es.json have the same keys', () => {
    const result = validateParity(
      enMessages as Record<string, unknown>,
      esMessages as Record<string, unknown>
    );
    expect(result.valid).toBe(true);
    expect(result.missing).toEqual([]);
    expect(result.extra).toEqual([]);
  });

  test('About has matching content structure in both locales', () => {
    const aboutKeys = (messages: typeof enMessages) => ({
      fields: Object.keys(messages.about).sort(),
      paragraphs: Object.keys(messages.about.paragraphs).sort(),
      values: Object.keys(messages.about.values).sort(),
    });

    expect(aboutKeys(esMessages)).toEqual(aboutKeys(enMessages));
    expect(Object.keys(enMessages.about).sort()).toEqual([
      'intro',
      'paragraphs',
      'portraitAlt',
      'statement',
      'values',
    ]);
    expect(Object.keys(enMessages.about.paragraphs).sort()).toEqual([
      'approach',
      'background',
      'experience',
      'problem',
    ]);
    expect(Object.keys(enMessages.about.values).sort()).toEqual([
      'analytical',
      'autonomous',
      'continuousLearning',
      'detailOriented',
      'teamwork',
    ]);
  });

  test('fails when a key is missing in es', () => {
    const en = { shared: { nav: { home: 'Home' } }, extra: { only: 'in en' } };
    const es = { shared: { nav: { home: 'Inicio' } } };
    const result = validateParity(en, es);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('extra.only');
  });

  test('fails when a key is extra in es', () => {
    const en = { shared: { nav: { home: 'Home' } } };
    const es = { shared: { nav: { home: 'Inicio', extra: 'only in es' } } };
    const result = validateParity(en, es);
    expect(result.valid).toBe(false);
    expect(result.extra).toContain('shared.nav.extra');
  });
});
