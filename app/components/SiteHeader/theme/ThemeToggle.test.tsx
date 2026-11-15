import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { ThemeToggle } from './ThemeToggle';
import type { ThemeValue } from '../../../theme/constants';

// T12: ThemeToggle — RF-6, RF-8, RNF-7
// Usa el store real (useSyncExternalStore). window.matchMedia se mockea porque
// jsdom no lo define.
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

function setThemeChoice(choice: ThemeValue): void {
  document.documentElement.setAttribute('data-theme-choice', choice);
}

function renderToggle() {
  return render(<ThemeToggle stateLabels={STATE_LABELS} ariaLabels={ARIA_LABELS} />);
}

describe('ThemeToggle — T12 (RF-6, RF-8, RNF-7)', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme-choice');
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
    vi.restoreAllMocks();
    const w = window as unknown as {
      matchMedia: ((q: string) => MediaQueryList) | undefined;
    };
    w.matchMedia = vi.fn(() => {
      const listeners: Array<() => void> = [];
      return {
        matches: false,
        addEventListener: (type: string, listener: () => void) => {
          if (type === 'change') listeners.push(listener);
        },
        removeEventListener: (type: string, listener: () => void) => {
          if (type === 'change') {
            const i = listeners.indexOf(listener);
            if (i >= 0) listeners.splice(i, 1);
          }
        },
      } as unknown as MediaQueryList;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the visible text of the chosen light option', () => {
    setThemeChoice('light');
    renderToggle();
    expect(screen.getByRole('button')).toHaveTextContent('Light');
  });

  it('shows the visible text of the chosen dark option', () => {
    setThemeChoice('dark');
    renderToggle();
    expect(screen.getByRole('button')).toHaveTextContent('Dark');
  });

  it('shows the visible text of the chosen system option', () => {
    setThemeChoice('system');
    renderToggle();
    expect(screen.getByRole('button')).toHaveTextContent('System');
  });

  it('exposes a full-sentence accessible name for each option', () => {
    for (const [choice, expected] of Object.entries(ARIA_LABELS) as [
      ThemeValue,
      string
    ][]) {
      setThemeChoice(choice);
      const { unmount } = renderToggle();
      expect(screen.getByRole('button')).toHaveAccessibleName(expected);
      unmount();
    }
  });

  it('is a plain button that never moves focus', () => {
    setThemeChoice('light');
    renderToggle();
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
    button.focus();
    expect(button).toHaveFocus();
    fireEvent.click(button);
    expect(button).toHaveFocus();
  });

  it('cycles light → dark → system → light on every click', () => {
    setThemeChoice('light');
    renderToggle();
    expect(screen.getByRole('button')).toHaveTextContent('Light');

    fireEvent.click(screen.getByRole('button'));
    expect(document.documentElement.getAttribute('data-theme-choice')).toBe(
      'dark'
    );
    expect(screen.getByRole('button')).toHaveTextContent('Dark');

    fireEvent.click(screen.getByRole('button'));
    expect(document.documentElement.getAttribute('data-theme-choice')).toBe(
      'system'
    );
    expect(screen.getByRole('button')).toHaveTextContent('System');

    fireEvent.click(screen.getByRole('button'));
    expect(document.documentElement.getAttribute('data-theme-choice')).toBe(
      'light'
    );
    expect(screen.getByRole('button')).toHaveTextContent('Light');
  });

  it('does not crash when storage is blocked', () => {
    setThemeChoice('light');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    renderToggle();
    let threw = false;
    try {
      fireEvent.click(screen.getByRole('button'));
    } catch {
      threw = true;
    }
    expect(threw).toBe(false);
    // DOM is still updated even when storage is blocked.
    expect(document.documentElement.getAttribute('data-theme-choice')).toBe(
      'dark'
    );
  });
});
