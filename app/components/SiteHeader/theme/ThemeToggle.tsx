/**
 * ThemeToggle.tsx — T12 (RF-6, RF-8, RNF-7)
 * Single three-state theme button: light → dark → system → light, read from
 * the stored preference. Shows the visible text of the chosen option and a
 * full-sentence accessible name. Persists with saveTheme (never throws on
 * blocked storage) and never moves focus. Tab switches are handled by
 * ThemeProvider (storage listener); this button only advances its own state.
 *
 * All visible text comes from props (Constitution 3 / RF-8): the parent
 * resolves stateLabels and ariaLabels from the dictionary.
 */

'use client';

import {
  applyTheme,
  saveTheme,
  getThemeFromDocument,
} from '../../../theme/theme';
import type { ThemeValue } from '../../../theme/theme';

/** Advances the theme cycle: light → dark → system → light. */
const NEXT: Record<ThemeValue, ThemeValue> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

interface ThemeToggleProps {
  /** Visible text for each theme option, from the dictionary. */
  stateLabels: Record<ThemeValue, string>;
  /** Full-sentence accessible name for each theme option, from the dictionary. */
  ariaLabels: Record<ThemeValue, string>;
}

export function ThemeToggle({
  stateLabels,
  ariaLabels,
}: ThemeToggleProps) {
  // Read the effective theme from the document (set by the boot script), never
  // from storage. This keeps the label in sync with what is actually painted.
  const theme = getThemeFromDocument();
  const next = NEXT[theme];

  return (
    <button
      aria-label={ariaLabels[theme]}
      onClick={() => {
        try {
          saveTheme(next);
          // Apply the choice to <html> immediately so the change is visible in
          // the same tab without a page reload (storage events only fire in
          // other tabs). ThemeProvider keeps listening for cross-tab changes.
          applyTheme(next);
        } catch {
          // Storage blocked or full: the choice is not persisted, and the
          // document class is left unchanged. The button does not crash.
        }
      }}
    >
      {stateLabels[theme]}
    </button>
  );
}
