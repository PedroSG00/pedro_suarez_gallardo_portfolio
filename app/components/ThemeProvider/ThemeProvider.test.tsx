import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

// T19: ThemeProvider.tsx — applies and syncs theme; listens to tab changes; no visible control (RF-6)
// Done when: theme class is applied to <html> on mount, storage events update the
// theme across tabs without reloading or moving focus, and the component renders no visible UI.
vi.mock('../../theme/theme', () => ({
  resolveActiveTheme: vi.fn(() => 'dark'),
  listenStorageChanges: vi.fn(() => vi.fn()),
}));

import {
  resolveActiveTheme,
  listenStorageChanges,
  type ThemeValue,
} from '../../theme/theme';
import ThemeProvider from './ThemeProvider';

const mockedResolveActiveTheme = vi.mocked(resolveActiveTheme);
const mockedListenStorageChanges = vi.mocked(listenStorageChanges);

describe('ThemeProvider — T19', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('applies the resolved theme class to <html> on mount', () => {
    mockedResolveActiveTheme.mockReturnValue('dark');
    act(() => {
      render(<ThemeProvider />);
    });
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
    expect(document.documentElement.classList.contains('theme-light')).toBe(false);
  });

  it('returns null (no visible control)', () => {
    const { container } = render(<ThemeProvider />);
    expect(container.children).toHaveLength(0);
  });

  it('listens to storage events for cross-tab sync', () => {
    render(<ThemeProvider />);
    expect(mockedListenStorageChanges).toHaveBeenCalled();
  });

  it('applies theme from storage event without reloading', () => {
    let storageCallback: ((val: ThemeValue) => void) | null = null;
    mockedListenStorageChanges.mockImplementation((callback) => {
      storageCallback = callback;
      return vi.fn();
    });
    act(() => {
      render(<ThemeProvider />);
    });
    // First, resolved theme 'dark' is applied
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
    // Then storage event arrives with 'light'
    act(() => {
      storageCallback!('light');
    });
    expect(document.documentElement.classList.contains('theme-light')).toBe(true);
    expect(document.documentElement.classList.contains('theme-dark')).toBe(false);
  });
});
