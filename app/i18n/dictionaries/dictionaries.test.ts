import { describe, it, expect } from 'vitest';
import en from './en.json';
import es from './es.json';

// T1 (004): Header key groups — RF covered: RF-1, RF-6, RF-7, RF-8
const HEADER_GROUPS = ['nav', 'header', 'themeToggle', 'languageMenu'] as const;

describe('i18n dictionaries — header key groups', () => {
  it('declares every header group in EN and ES', () => {
    const missing = HEADER_GROUPS.filter(
      (group) => !(group in en) || !(group in es)
    );
    expect(missing).toEqual([]);
  });
});

// Provisional: the 004 replaces this control (removed in T16).
describe('i18n dictionaries — theme selector keys', () => {
  it('contains themeSelect labels in EN', () => {
    expect(en.themeSelect.label).toBeDefined();
    expect(en.themeSelect.option.light).toBeDefined();
    expect(en.themeSelect.option.dark).toBeDefined();
    expect(en.themeSelect.option.system).toBeDefined();
  });

  it('contains themeSelect labels in ES', () => {
    expect(es.themeSelect.label).toBeDefined();
    expect(es.themeSelect.option.light).toBeDefined();
    expect(es.themeSelect.option.dark).toBeDefined();
    expect(es.themeSelect.option.system).toBeDefined();
  });

  it('has matching keys across EN and ES', () => {
    expect(Object.keys(en.themeSelect)).toEqual(Object.keys(es.themeSelect));
  });
});
