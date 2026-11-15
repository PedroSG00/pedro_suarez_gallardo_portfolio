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

import { saveTheme } from '../../../theme/theme';
import type { ThemeValue } from '../../../theme/theme';

/** Advances the theme cycle: light → dark → system → light. */
const NEXT: Record<ThemeValue, ThemeValue> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

interface ThemeToggleProps {
  /** Current theme value (read from the document by the parent). */
  theme: ThemeValue;
  /** Visible text for each theme option, from the dictionary. */
  stateLabels: Record<ThemeValue, string>;
  /** Full-sentence accessible name for each theme option, from the dictionary. */
  ariaLabels: Record<ThemeValue, string>;
}

export function ThemeToggle({
  theme,
  stateLabels,
  ariaLabels,
}: ThemeToggleProps) {
  const next = NEXT[theme];

  return (
    <button
      aria-label={ariaLabels[theme]}
      onClick={() => {
        try {
          saveTheme(next);
        } catch {
          // Storage blocked or full: the choice is not persisted, but the
          // button does not crash. The parent re-syncs the theme from the
          // document on the next render.
        }
      }}
    >
      {stateLabels[theme]}
    </button>
  );
}
