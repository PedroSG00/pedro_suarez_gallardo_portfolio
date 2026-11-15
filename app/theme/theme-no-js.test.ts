import { describe, it, expect, vi, afterEach } from 'vitest';
import { applyTheme, getThemeFromDocument } from './theme';

// RF-6 — Sin JavaScript: the inline boot script is never the only path for the
// document theme. With no script and no stored preference, <html> keeps its
// `theme-system` default and CSS follows the OS via prefers-color-scheme.
describe('RF-6 — Tema sin JavaScript', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.className = '';
  });

  it('defaults to system when no boot class was applied', () => {
    document.documentElement.className = '';
    expect(getThemeFromDocument()).toBe('system');
  });

  it('reads the class applied by the inline boot script', () => {
    document.documentElement.className = 'theme-dark';
    expect(getThemeFromDocument()).toBe('dark');
  });

  it('applying a theme never touches storage', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    document.documentElement.className = 'theme-system';
    applyTheme('dark');
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
    expect(setItem).not.toHaveBeenCalled();
  });
});
