/**
 * boot-script.ts — T7 (RF-6, RNF-4)
 * Theme bootstrap: fixes the effective theme, the chosen option and its label
 * before the first paint, so there is no flash of the wrong theme.
 *
 * The inline script runs synchronously in <head> (beforeInteractive). It reads
 * the stored theme choice, validates it, sets `data-theme-choice` (the choice,
 * not the effective theme) and the `theme-*` class on <html>, and never throws
 * when storage is blocked.
 *
 * `resolveThemeChoice` is pure and shared with the client so the same decision
 * is made everywhere (Constitution 4).
 */

import { isThemeValue, type ThemeValue } from './theme';

/** Theme choice default when nothing valid is stored. */
const DEFAULT_THEME: ThemeValue = 'system';

/**
 * Resolves the theme choice from a stored value. Any absent or invalid value
 * falls back to `system`. Never throws.
 */
export function resolveThemeChoice(stored: string | null): ThemeValue {
  return isThemeValue(stored) ? stored : DEFAULT_THEME;
}

/**
 * Inline theme bootstrap script. Runs in <head> before the body is painted.
 *
 * Sets `data-theme-choice` to the validated stored choice and applies the
 * matching `theme-*` class. Invalid, absent or unreadable values default to
 * `system` without throwing, so blocked storage never breaks the page.
 */
export const THEME_BOOT_SCRIPT = `(function(){
  var choice = 'system';
  try {
    var stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      choice = stored;
    }
  } catch (e) {
    // Storage blocked or full: keep the default 'system' choice.
  }
  try {
    document.documentElement.dataset.themeChoice = choice;
    document.documentElement.classList.remove(
      'theme-light', 'theme-dark', 'theme-system'
    );
    document.documentElement.classList.add('theme-' + choice);
  } catch (e) {}
})();`;
