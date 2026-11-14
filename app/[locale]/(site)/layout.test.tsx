import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

// T15: app/[locale]/(site)/layout.tsx — visible controls only on real pages (RF-4, RF-6)
// Done when: renders LanguageSelector and ThemeSelect; wraps children;
// 404 does not inherit this layout.
vi.mock('../../components/LanguageSelector/LanguageSelector', () => ({
  default: () => <div data-testid="language-selector">selector</div>,
}));

vi.mock('../../components/ThemeProvider/ThemeProvider', () => ({
  default: () => <div data-testid="theme-provider">theme</div>,
}));

vi.mock('../../i18n/provider/use-locale', () => ({
  useLocale: vi.fn(() => ({
    locale: 'en',
    setLocale: vi.fn(),
    t: (key: string) => key,
  })),
}));

import { default as SiteLayout } from './layout';

describe('app/[locale]/(site)/layout — T15', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders LanguageSelector', async () => {
    const ui = await SiteLayout({ children: <div>content</div> });
    render(ui);

    expect(screen.getByTestId('language-selector')).toBeInTheDocument();
  });

  it('renders ThemeSelect (theme control)', async () => {
    const ui = await SiteLayout({ children: <div>content</div> });
    render(ui);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('wraps children', async () => {
    const ui = await SiteLayout({ children: <div>content</div> });
    render(ui);

    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
