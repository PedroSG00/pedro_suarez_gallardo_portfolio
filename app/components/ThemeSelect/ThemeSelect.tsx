import React, { useState } from 'react';
import { getSavedTheme, saveTheme } from '../../lib/theme';

export default function ThemeSelect({ lang = 'en' }: { lang?: 'en' | 'es' }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(getSavedTheme());

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as 'light' | 'dark' | 'system';
    setValue(v);
    saveTheme(v);
  };

  const label = lang === 'es' ? 'Tema' : 'Theme';

  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)} aria-label={label}>
        {label}
      </button>
      {open && (
        <select
          role="combobox"
          aria-label={label}
          value={value}
          onChange={handleChange}
        >
          <option value="light">{lang === 'es' ? 'Claro' : 'Light'}</option>
          <option value="dark">{lang === 'es' ? 'Oscuro' : 'Dark'}</option>
          <option value="system">{lang === 'es' ? 'Sistema' : 'System'}</option>
        </select>
      )}
      <dialog id="theme-dialog" />
    </div>
  );
}
