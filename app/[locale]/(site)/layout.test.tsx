import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

// T15: app/[locale]/(site)/layout.tsx — visible controls only on real pages
// (RF-1, RF-4, RF-6). Done when: resolves texts on the server, passes them to
// the controls as props, wraps children, and the 404 does not inherit it.
vi.mock('../../components/LanguageSelector/LanguageSelector', () => ({
  default: ({ labels }: { labels: Record<string, string> }) => (
    <div data-testid="language-selector">
      {labels.en}|{labels.es}
    </div>
  ),
}));

vi.mock('../../components/ThemeSelect/ThemeSelect', () => ({
  default: ({ labels }: { labels: Record<string, string> }) => (
    <div data-testid="theme-select">{labels.label}</div>
  ),
}));

import { default as SiteLayout } from './layout';

const params = Promise.resolve({ locale: 'en' });

describe('app/[locale]/(site)/layout — T15', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders LanguageSelector with dictionary labels', async () => {
    const ui = await SiteLayout({ children: <div>content</div>, params });
    render(ui);

    expect(screen.getByTestId('language-selector')).toHaveTextContent(
      'English|Español'
    );
  });

  it('renders ThemeSelect with dictionary labels', async () => {
    const ui = await SiteLayout({ children: <div>content</div>, params });
    render(ui);

    expect(screen.getByTestId('theme-select')).toHaveTextContent('Theme');
  });

  it('wraps children in a main landmark', async () => {
    const ui = await SiteLayout({ children: <div>content</div>, params });
    render(ui);

    expect(screen.getByText('content')).toBeInTheDocument();
    expect(screen.getByRole('main')).toContainElement(
      screen.getByText('content')
    );
  });
});
