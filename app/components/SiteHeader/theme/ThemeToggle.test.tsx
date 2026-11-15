import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

vi.mock('../../../theme/theme', () => ({
  saveTheme: vi.fn(),
  applyTheme: vi.fn(),
  getThemeFromDocument: vi.fn(() => 'system'),
}));

import { ThemeToggle } from './ThemeToggle';
import { saveTheme, applyTheme, getThemeFromDocument } from '../../../theme/theme';
import type { ThemeValue } from '../../../theme/theme';

// T12 (004): ThemeToggle — RF-6, RF-8, RNF-7
// Done when: cycle light→dark→system→light read from the preference,
// visible text of the chosen option, full-sentence accessible name,
// blocked storage without errors, and tab switch without moving focus.
const STATE_LABELS: Record<ThemeValue, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

const ARIA_LABELS: Record<ThemeValue, string> = {
  light: 'Light theme. Switch to dark theme',
  dark: 'Dark theme. Switch to system theme',
  system: 'System theme. Switch to light theme',
};

function renderToggle() {
  return render(
    <ThemeToggle
      stateLabels={STATE_LABELS}
      ariaLabels={ARIA_LABELS}
    />
  );
}

describe('ThemeToggle — T12 (RF-6, RF-8, RNF-7)', () => {
  beforeEach(() => {
    vi.mocked(saveTheme).mockReset();
    vi.mocked(applyTheme).mockReset();
    vi.mocked(getThemeFromDocument).mockReset();
  });

  afterEach(() => {
  });

  it('shows the visible text of the chosen light option', () => {
    vi.mocked(getThemeFromDocument).mockReturnValue('light');
    renderToggle();
    expect(screen.getByRole('button')).toHaveTextContent('Light');
  });

  it('shows the visible text of the chosen dark option', () => {
    vi.mocked(getThemeFromDocument).mockReturnValue('dark');
    renderToggle();
    expect(screen.getByRole('button')).toHaveTextContent('Dark');
  });

  it('shows the visible text of the chosen system option', () => {
    vi.mocked(getThemeFromDocument).mockReturnValue('system');
    renderToggle();
    expect(screen.getByRole('button')).toHaveTextContent('System');
  });

  it('exposes a full-sentence accessible name for each option', () => {
    vi.mocked(getThemeFromDocument).mockReturnValue('light');
    const { unmount } = renderToggle();
    expect(screen.getAllByRole('button')[0]).toHaveAccessibleName(
      'Light theme. Switch to dark theme'
    );
    unmount();

    vi.mocked(getThemeFromDocument).mockReturnValue('dark');
    const { unmount: unmountDark } = renderToggle();
    expect(screen.getAllByRole('button')[0]).toHaveAccessibleName(
      'Dark theme. Switch to system theme'
    );
    unmountDark();

    vi.mocked(getThemeFromDocument).mockReturnValue('system');
    const { unmount: unmountSystem } = renderToggle();
    expect(screen.getAllByRole('button')[0]).toHaveAccessibleName(
      'System theme. Switch to light theme'
    );
    unmountSystem();
  });

  it('cycles light → dark on click', () => {
    vi.mocked(getThemeFromDocument).mockReturnValue('light');
    renderToggle();
    fireEvent.click(screen.getByRole('button'));
    expect(saveTheme).toHaveBeenCalledWith('dark');
    expect(applyTheme).toHaveBeenCalledWith('dark');
  });

  it('cycles dark → system on click', () => {
    vi.mocked(getThemeFromDocument).mockReturnValue('dark');
    renderToggle();
    fireEvent.click(screen.getByRole('button'));
    expect(saveTheme).toHaveBeenCalledWith('system');
    expect(applyTheme).toHaveBeenCalledWith('system');
  });

  it('cycles system → light on click', () => {
    vi.mocked(getThemeFromDocument).mockReturnValue('system');
    renderToggle();
    fireEvent.click(screen.getByRole('button'));
    expect(saveTheme).toHaveBeenCalledWith('light');
    expect(applyTheme).toHaveBeenCalledWith('light');
  });

  it('does not throw when storage is blocked', () => {
    vi.mocked(getThemeFromDocument).mockReturnValue('light');
    vi.mocked(saveTheme).mockImplementation(() => {
      throw new Error('blocked');
    });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderToggle();
    let threw = false;
    try {
      fireEvent.click(screen.getByRole('button'));
    } catch {
      threw = true;
    }
    expect(threw).toBe(false);
    spy.mockRestore();
  });

  it('does not move focus when the theme changes', () => {
    vi.mocked(getThemeFromDocument).mockReturnValue('light');
    renderToggle();
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();

    fireEvent.click(button);
    expect(button).toHaveFocus();
    expect(saveTheme).toHaveBeenCalledWith('dark');
    expect(applyTheme).toHaveBeenCalledWith('dark');
  });
});
