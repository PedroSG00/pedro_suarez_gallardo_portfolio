import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

vi.mock('../../theme/theme', () => ({
  saveTheme: vi.fn(),
  getThemeFromDocument: vi.fn(() => 'system'),
}));

import { saveTheme } from '../../theme/theme';
import { ThemeToggle } from './ThemeToggle';
import type { ThemeValue } from '../../theme/theme';

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

function renderToggle(theme: ThemeValue) {
  return render(
    <ThemeToggle
      theme={theme}
      stateLabels={STATE_LABELS}
      ariaLabels={ARIA_LABELS}
    />
  );
}

describe('ThemeToggle — T12 (RF-6, RF-8, RNF-7)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(saveTheme).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the visible text of the chosen light option', () => {
    renderToggle('light');
    expect(screen.getByRole('button')).toHaveTextContent('Light');
  });

  it('shows the visible text of the chosen dark option', () => {
    renderToggle('dark');
    expect(screen.getByRole('button')).toHaveTextContent('Dark');
  });

  it('shows the visible text of the chosen system option', () => {
    renderToggle('system');
    expect(screen.getByRole('button')).toHaveTextContent('System');
  });

  it('exposes a full-sentence accessible name for each option', () => {
    const { unmount } = renderToggle('light');
    expect(screen.getAllByRole('button')[0]).toHaveAccessibleName(
      'Light theme. Switch to dark theme'
    );
    unmount();

    const { unmount: unmountDark } = renderToggle('dark');
    expect(screen.getAllByRole('button')[0]).toHaveAccessibleName(
      'Dark theme. Switch to system theme'
    );
    unmountDark();

    const { unmount: unmountSystem } = renderToggle('system');
    expect(screen.getAllByRole('button')[0]).toHaveAccessibleName(
      'System theme. Switch to light theme'
    );
    unmountSystem();
  });

  it('cycles light → dark on click', () => {
    renderToggle('light');
    fireEvent.click(screen.getByRole('button'));
    expect(saveTheme).toHaveBeenCalledWith('dark');
  });

  it('cycles dark → system on click', () => {
    renderToggle('dark');
    fireEvent.click(screen.getByRole('button'));
    expect(saveTheme).toHaveBeenCalledWith('system');
  });

  it('cycles system → light on click', () => {
    renderToggle('system');
    fireEvent.click(screen.getByRole('button'));
    expect(saveTheme).toHaveBeenCalledWith('light');
  });

  it('does not throw when storage is blocked', () => {
    vi.mocked(saveTheme).mockImplementation(() => {
      throw new Error('blocked');
    });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderToggle('light');
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
    renderToggle('light');
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();

    fireEvent.click(button);
    expect(button).toHaveFocus();
    expect(saveTheme).toHaveBeenCalledWith('dark');
  });
});
