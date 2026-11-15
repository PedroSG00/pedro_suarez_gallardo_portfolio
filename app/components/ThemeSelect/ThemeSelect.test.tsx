import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

vi.mock('../../theme/theme', () => ({
  getThemeFromDocument: vi.fn(() => 'system'),
  saveTheme: vi.fn(),
  applyTheme: vi.fn(),
}));

import { applyTheme, getThemeFromDocument, saveTheme } from '../../theme/theme';
import ThemeSelect, { type ThemeSelectLabels } from './ThemeSelect';

const mockedSaveTheme = vi.mocked(saveTheme);
const mockedApplyTheme = vi.mocked(applyTheme);
const mockedGetThemeFromDocument = vi.mocked(getThemeFromDocument);

const LABELS: ThemeSelectLabels = {
  label: 'Theme',
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

describe('ThemeSelect — T20', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetThemeFromDocument.mockReturnValue('system');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('select is always visible (no reveal button)', () => {
    render(<ThemeSelect labels={LABELS} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /theme/i })).toBeNull();
  });

  it('uses the labels received as props for the control name and options', () => {
    render(<ThemeSelect labels={LABELS} />);
    expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Light' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Dark' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'System' })).toBeInTheDocument();
  });

  it('reflects the class applied by the inline boot script', () => {
    mockedGetThemeFromDocument.mockReturnValue('dark');
    render(<ThemeSelect labels={LABELS} />);

    expect(screen.getByRole('combobox')).toHaveValue('dark');
  });

  it('persists and applies the selected value on change', () => {
    render(<ThemeSelect labels={LABELS} />);
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'dark' },
    });
    expect(mockedSaveTheme).toHaveBeenCalledWith('dark');
    expect(mockedApplyTheme).toHaveBeenCalledWith('dark');
  });

  it('has an accessible name on the select', () => {
    render(<ThemeSelect labels={LABELS} />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-label', 'Theme');
  });

  it('renders light, dark, and system options', () => {
    render(<ThemeSelect labels={LABELS} />);
    const options = screen.getAllByRole('option');
    expect(options.map((o) => o.getAttribute('value'))).toEqual([
      'light',
      'dark',
      'system',
    ]);
  });

  it('does not render a dialog element', () => {
    render(<ThemeSelect labels={LABELS} />);
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.getElementById('theme-dialog')).toBeNull();
  });
});
