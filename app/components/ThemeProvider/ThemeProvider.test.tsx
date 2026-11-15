import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import ThemeProvider from './ThemeProvider';

// T19: ThemeProvider.tsx — reads the class set by the boot script, syncs tabs,
// never rewrites the initial theme and renders no visible control (RF-6).
describe('ThemeProvider — T19', () => {
  beforeEach(() => {
    document.documentElement.className = 'theme-dark';
  });

  afterEach(() => {
    document.documentElement.className = '';
  });

  it('does not override the class set by the inline boot script on mount', () => {
    render(<ThemeProvider />);
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
    expect(document.documentElement.classList.contains('theme-light')).toBe(
      false
    );
  });

  it('returns null (no visible control)', () => {
    const { container } = render(<ThemeProvider />);
    // eslint-disable-next-line testing-library/no-node-access
    expect(container.children).toHaveLength(0);
  });

  it('applies the theme from a storage event without reloading', () => {
    render(<ThemeProvider />);

    window.dispatchEvent(
      new StorageEvent('storage', { key: 'theme', newValue: 'light' })
    );

    expect(document.documentElement.classList.contains('theme-light')).toBe(
      true
    );
    expect(document.documentElement.classList.contains('theme-dark')).toBe(
      false
    );
  });

  it('treats a deleted theme key as system', () => {
    render(<ThemeProvider />);

    window.dispatchEvent(
      new StorageEvent('storage', { key: 'theme', newValue: null })
    );

    expect(document.documentElement.classList.contains('theme-system')).toBe(
      true
    );
  });
});
