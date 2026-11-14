import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

vi.mock('../../theme/theme', () => ({
  getSavedTheme: vi.fn(() => 'system'),
  saveTheme: vi.fn(),
}));

vi.mock('../../i18n/provider/use-locale', () => ({
  useLocale: vi.fn(() => ({
    locale: 'en',
    t: (key: string) => {
      const dict: Record<string, string> = {
        'themeSelect.label': 'Theme',
        'themeSelect.option.light': 'Light',
        'themeSelect.option.dark': 'Dark',
        'themeSelect.option.system': 'System',
      };
      return dict[key] ?? key;
    },
  })),
}));

import { saveTheme } from '../../theme/theme';
import ThemeSelect from './ThemeSelect';

const mockedSaveTheme = vi.mocked(saveTheme);

describe('ThemeSelect — T20', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('select is always visible (no reveal button)', () => {
    render(<ThemeSelect />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /theme/i })).toBeNull();
  });

  it('uses dictionary labels for the control name and options', () => {
    render(<ThemeSelect />);
    expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Light' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Dark' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'System' })).toBeInTheDocument();
  });

  it('calls saveTheme with the selected value on change', () => {
    render(<ThemeSelect />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'dark' } });
    expect(mockedSaveTheme).toHaveBeenCalledWith('dark');
  });

  it('has an accessible name on the select', () => {
    render(<ThemeSelect />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-label', 'Theme');
  });

  it('renders light, dark, and system options', () => {
    render(<ThemeSelect />);
    const options = screen.getAllByRole('option');
    expect(options.map((o) => o.getAttribute('value'))).toEqual([
      'light',
      'dark',
      'system',
    ]);
  });

  it('does not render a dialog element', () => {
    render(<ThemeSelect />);
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.getElementById('theme-dialog')).toBeNull();
  });
});
