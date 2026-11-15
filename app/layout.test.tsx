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

// Captura el script inline de tema para inspeccionar su contenido.
const themeScriptHtml = vi.hoisted(() => ({ html: '' as string }));
vi.mock('next/script', () => ({
  default: function Script({
    id,
    strategy,
    dangerouslySetInnerHTML,
  }: {
    id: string;
    strategy: string;
    dangerouslySetInnerHTML?: { __html: string };
  }) {
    themeScriptHtml.html = dangerouslySetInnerHTML?.__html ?? '';
    return React.createElement('script', {
      id,
      'data-strategy': strategy,
      dangerouslySetInnerHTML: { __html: themeScriptHtml.html },
    });
  },
}));

import RootLayout from './layout';

async function renderRoot(locale: 'en' | 'es') {
  headersMock.mockResolvedValue(new Headers({ 'x-locale': locale }));
  const ui = await RootLayout({ children: <div>content</div> });
  render(ui);
}

// T14: app/layout.tsx — stable document shell shared by pages and the 404
// (RF-1, RF-4, RF-6, RF-7). Done when: <html lang> comes from the proxy
// header, the inline theme script runs before interactive, no theme class is
// hardcoded on <html> (classes come from data-theme attributes), and children
// render inside the body.
describe('app/layout — T14', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    themeScriptHtml.html = '';
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

  it('does not hardcode a theme class on <html>', async () => {
    await renderRoot('en');
    expect(document.documentElement.className).not.toContain('theme-');
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
    expect(themeScriptHtml.html).toContain('localStorage.getItem');
    expect(themeScriptHtml.html).toContain('setAttribute');
    expect(themeScriptHtml.html).toContain('matchMedia');
  });
});
