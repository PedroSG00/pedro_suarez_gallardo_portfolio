import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

const { headersMock } = vi.hoisted(() => ({ headersMock: vi.fn() }));

vi.mock('next/headers', () => ({ headers: headersMock }));

vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: '--font-geist-sans' }),
  Geist_Mono: () => ({ variable: '--font-geist-mono' }),
}));

vi.mock('next/script', () => ({
  default: function Script({
    id,
    children,
    strategy,
  }: {
    id: string;
    children: string;
    strategy: string;
  }) {
    return React.createElement('script', {
      id,
      'data-strategy': strategy,
      dangerouslySetInnerHTML: { __html: children },
    });
  },
}));

vi.mock('./components/ThemeProvider/ThemeProvider', () => ({
  default: () => <div data-testid="theme-provider" />,
}));

import RootLayout from './layout';

async function renderRoot(locale: 'en' | 'es') {
  headersMock.mockResolvedValue(new Headers({ 'x-locale': locale }));
  const ui = await RootLayout({ children: <div>content</div> });
  render(ui);
}

// T14: app/layout.tsx — stable document shell shared by pages and the 404
// (RF-1, RF-4, RF-6, RF-7). Done when: <html lang> comes from the proxy
// header, the inline theme script runs before interactive, ThemeProvider is
// mounted once and children render inside the body.
describe('app/layout — T14', () => {
  beforeEach(() => {
    document.documentElement.className = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sets <html lang> from the x-locale header', async () => {
    await renderRoot('es');
    expect(document.documentElement).toHaveAttribute('lang', 'es');
  });

  it('falls back to the default locale without a proxy header', async () => {
    headersMock.mockRejectedValue(new Error('no request scope'));
    const ui = await RootLayout({ children: <div>content</div> });
    render(ui);
    expect(document.documentElement).toHaveAttribute('lang', 'en');
  });

  it('mounts the global ThemeProvider exactly once', async () => {
    await renderRoot('en');
    expect(screen.getAllByTestId('theme-provider')).toHaveLength(1);
  });

  it('renders children inside the body', async () => {
    await renderRoot('en');
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('mounts the inline theme script in <head> before interactive', async () => {
    await renderRoot('en');
    // eslint-disable-next-line testing-library/no-node-access
    const script = document.querySelector('script#theme-init');
    expect(script).not.toBeNull();
    expect(script?.getAttribute('data-strategy')).toBe('beforeInteractive');
    expect(script?.textContent).toContain("localStorage.getItem('theme')");
  });
});
