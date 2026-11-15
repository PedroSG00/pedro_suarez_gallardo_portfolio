/**
 * ThemeSelect.tsx — T20 (RF-6, RF-9)
 * Native <select> always visible (no reveal button). All visible texts arrive
 * as props from the server layout, so this component never reads a dictionary.
 * The selected value is read from the class set by the inline boot script
 * (never from storage); changes persist the choice and apply it immediately.
 * Meets the 24x24 touch target (WCAG 2.2).
 */

'use client';

import { useState } from 'react';
import {
  applyTheme,
  getThemeFromDocument,
  saveTheme,
  type ThemeValue,
} from '../../theme/theme';

export interface ThemeSelectLabels {
  label: string;
  light: string;
  dark: string;
  system: string;
}

interface ThemeSelectProps {
  labels: ThemeSelectLabels;
}

export default function ThemeSelect({ labels }: ThemeSelectProps) {
  // Read the class applied by the inline boot script (never storage). On the
  // server there is no document, so it defaults to system and reconciles on
  // hydration.
  const [value, setValue] = useState<ThemeValue>(() =>
    typeof document === 'undefined' ? 'system' : getThemeFromDocument()
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as ThemeValue;
    setValue(next);
    saveTheme(next);
    applyTheme(next);
  };

  return (
    <select
      role="combobox"
      aria-label={labels.label}
      value={value}
      onChange={handleChange}
      className="min-h-[24px] min-w-[24px]"
    >
      <option value="light">{labels.light}</option>
      <option value="dark">{labels.dark}</option>
      <option value="system">{labels.system}</option>
    </select>
  );
}
