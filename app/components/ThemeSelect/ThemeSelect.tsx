/**
 * ThemeSelect.tsx — T20 (RF-6, RF-9)
 * Native <select> always visible (no reveal button). Labels come from the
 * dictionary via useLocale(). Change calls saveTheme to persist the choice.
 * Meets the 24x24 touch target (WCAG 2.2).
 */

'use client';

import { useState } from 'react';
import { getSavedTheme, saveTheme } from '../../theme/theme';
import { useLocale } from '../../i18n/provider/use-locale';

export default function ThemeSelect() {
  const { t } = useLocale();
  const [value, setValue] = useState(getSavedTheme());

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as 'light' | 'dark' | 'system';
    setValue(v);
    saveTheme(v);
  };

  return (
    <select
      role="combobox"
      aria-label={t('themeSelect.label')}
      value={value}
      onChange={handleChange}
      className="min-h-[24px] min-w-[24px]"
    >
      <option value="light">{t('themeSelect.option.light')}</option>
      <option value="dark">{t('themeSelect.option.dark')}</option>
      <option value="system">{t('themeSelect.option.system')}</option>
    </select>
  );
}
