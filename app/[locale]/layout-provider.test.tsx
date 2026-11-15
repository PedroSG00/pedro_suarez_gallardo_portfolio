import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

vi.mock('../i18n/provider/locale-provider', () => ({
  default: function LocaleProvider({
    children,
    locale,
  }: {
    children: React.ReactNode;
    locale: string;
  }) {
    return (
      <div data-testid="locale-provider" data-locale={locale}>
        {children}
      </div>
    );
  },
}));

import LayoutProvider from './layout-provider';

// T14: layout-provider.tsx — client wrapper that mounts LocaleProvider.
// ThemeProvider is global (root layout), so it is not duplicated here.
describe('LayoutProvider — T14', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('mounts LocaleProvider with locale and dictionary', () => {
    const dictionary = { nav: { home: 'Home' } };
    render(
      <LayoutProvider locale="es" dictionary={dictionary}>
        <span data-testid="child">child content</span>
      </LayoutProvider>
    );

    const localeProvider = screen.getByTestId('locale-provider');
    expect(localeProvider).toHaveAttribute('data-locale', 'es');
    expect(screen.getByTestId('child')).toHaveTextContent('child content');
  });

  it('does not mount a second ThemeProvider', () => {
    render(
      <LayoutProvider locale="en" dictionary={{}}>
        <p data-testid="inner">inner text</p>
      </LayoutProvider>
    );

    expect(screen.queryByTestId('theme-provider')).not.toBeInTheDocument();
  });

  it('renders children inside LocaleProvider', () => {
    render(
      <LayoutProvider locale="en" dictionary={{}}>
        <p data-testid="inner">inner text</p>
      </LayoutProvider>
    );

    expect(screen.getByTestId('inner')).toBeInTheDocument();
  });
});
