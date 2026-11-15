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
