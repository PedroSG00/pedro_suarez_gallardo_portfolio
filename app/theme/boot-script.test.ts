import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveThemeChoice, THEME_BOOT_SCRIPT } from './boot-script';

// T7 (RF-6, RNF-4): theme boot script — chosen option and data-theme-choice
// before first paint, for stored / absent / invalid / blocked storage.
describe('boot-script — T7 (RF-6, RNF-4)', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme-choice');
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('resolveThemeChoice', () => {
    it('resolves a stored light choice', () => {
      expect(resolveThemeChoice('light')).toBe('light');
    });

    it('resolves a stored dark choice', () => {
      expect(resolveThemeChoice('dark')).toBe('dark');
    });

    it('resolves a stored system choice', () => {
      expect(resolveThemeChoice('system')).toBe('system');
    });

    it('defaults to system when nothing is stored', () => {
      expect(resolveThemeChoice(null)).toBe('system');
    });

    it('defaults to system for an invalid stored value', () => {
      expect(resolveThemeChoice('purple')).toBe('system');
    });

    it('defaults to system for undefined', () => {
      expect(resolveThemeChoice(undefined as unknown as string | null)).toBe(
        'system'
      );
    });
  });

  function runBootScript(stored: string | null, blocked = false): void {
    localStorage.clear();
    if (blocked) {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked');
      });
    } else if (stored !== null) {
      localStorage.setItem('theme', stored);
    }
    eval(THEME_BOOT_SCRIPT);
  }

  describe('THEME_BOOT_SCRIPT', () => {
    it('sets data-theme-choice and class from a stored light choice', () => {
      runBootScript('light');
      expect(document.documentElement.getAttribute('data-theme-choice')).toBe(
        'light'
      );
      expect(document.documentElement.classList.contains('theme-light')).toBe(
        true
      );
    });

    it('sets data-theme-choice and class from a stored dark choice', () => {
      runBootScript('dark');
      expect(document.documentElement.getAttribute('data-theme-choice')).toBe(
        'dark'
      );
      expect(document.documentElement.classList.contains('theme-dark')).toBe(
        true
      );
    });

    it('sets data-theme-choice and class from a stored system choice', () => {
      runBootScript('system');
      expect(document.documentElement.getAttribute('data-theme-choice')).toBe(
        'system'
      );
      expect(
        document.documentElement.classList.contains('theme-system')
      ).toBe(true);
    });

    it('defaults to system when nothing is stored', () => {
      runBootScript(null);
      expect(document.documentElement.getAttribute('data-theme-choice')).toBe(
        'system'
      );
      expect(
        document.documentElement.classList.contains('theme-system')
      ).toBe(true);
    });

    it('defaults to system for an invalid stored value', () => {
      localStorage.clear();
      localStorage.setItem('theme', 'purple');
      eval(THEME_BOOT_SCRIPT);
      expect(document.documentElement.getAttribute('data-theme-choice')).toBe(
        'system'
      );
    });

    it('does not throw and defaults to system when storage is blocked', () => {
      runBootScript(null, true);
      expect(document.documentElement.getAttribute('data-theme-choice')).toBe(
        'system'
      );
      expect(
        document.documentElement.classList.contains('theme-system')
      ).toBe(true);
    });
  });
});
