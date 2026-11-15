import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildBootScript, THEME_BOOT_SCRIPT } from './boot-script';

// T7 (RF-6, RNF-4): theme boot script — chosen option and data-theme-choice
// before first paint, for stored / absent / invalid / blocked storage, under
// dark and light OS preferences.
describe('boot-script — T7 (RF-6, RNF-4)', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme-choice');
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
    vi.restoreAllMocks();
    window.matchMedia = originalMatchMedia;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.matchMedia = originalMatchMedia;
  });

  it('buildBootScript embeds the constants (no hand-duplicated literals)', () => {
    const script = buildBootScript();
    expect(script).toContain('localStorage.getItem(storageKey)');
    expect(script).toContain('data-theme-choice');
    expect(script).toContain('data-theme');
    expect(script).toContain('matchMedia(darkQuery)');
  });

  it('THEME_BOOT_SCRIPT is a non-empty generated script', () => {
    expect(typeof THEME_BOOT_SCRIPT).toBe('string');
    expect(THEME_BOOT_SCRIPT.length).toBeGreaterThan(0);
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
    new Function(THEME_BOOT_SCRIPT)();
  }

  function setOsDark(dark: boolean): void {
    window.matchMedia = vi.fn(() => ({ matches: dark } as unknown as MediaQueryList));
  }

  describe('data-theme-choice (the choice)', () => {
    it('stores light choice as data-theme-choice=light', () => {
      runBootScript('light');
      expect(document.documentElement.getAttribute('data-theme-choice')).toBe(
        'light'
      );
    });

    it('stores dark choice as data-theme-choice=dark', () => {
      runBootScript('dark');
      expect(document.documentElement.getAttribute('data-theme-choice')).toBe(
        'dark'
      );
    });

    it('stores system choice as data-theme-choice=system', () => {
      runBootScript('system');
      expect(document.documentElement.getAttribute('data-theme-choice')).toBe(
        'system'
      );
    });

    it('defaults to system when nothing is stored', () => {
      runBootScript(null);
      expect(document.documentElement.getAttribute('data-theme-choice')).toBe(
        'system'
      );
    });

    it('defaults to system for an invalid stored value', () => {
      localStorage.setItem('theme', 'purple');
      new Function(THEME_BOOT_SCRIPT)();
      expect(document.documentElement.getAttribute('data-theme-choice')).toBe(
        'system'
      );
    });

    it('does not throw and defaults to system when storage is blocked', () => {
      runBootScript(null, true);
      expect(document.documentElement.getAttribute('data-theme-choice')).toBe(
        'system'
      );
    });
  });

  describe('data-theme (the effective theme)', () => {
    it('light choice → data-theme=light even with dark OS', () => {
      setOsDark(true);
      runBootScript('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('dark choice → data-theme=dark even with light OS', () => {
      setOsDark(false);
      runBootScript('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('system choice + dark OS → data-theme=dark', () => {
      setOsDark(true);
      runBootScript('system');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('system choice + light OS → data-theme=light', () => {
      setOsDark(false);
      runBootScript('system');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('default (nothing stored) + dark OS → data-theme=dark', () => {
      setOsDark(true);
      runBootScript(null);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });
});
