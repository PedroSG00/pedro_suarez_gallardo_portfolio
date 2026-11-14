import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

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

vi.mock('./layout-provider', () => ({
  default: function LayoutProvider({
    children,
    locale,
    dictionary,
  }: {
    children: React.ReactNode;
    locale: string;
    dictionary: Record<string, unknown>;
  }) {
    return (
      <div data-testid="locale-provider" data-locale={locale}>
        {children}
      </div>
    );
  },
}));

vi.mock('../i18n/translation/get-dictionary', () => ({
  getDictionary: () => ({ common: { notFound: 'Page not found' } }),
}));

// T14: app/[locale]/layout.tsx — <html lang>, inline theme script, providers without visible controls (RF-1, RF-4, RF-6)
// Done when: <html lang={locale}>, generateStaticParams per locale,
// dynamicParams false (invalid locales → 404), inline synchronous theme script
// in <head>, LayoutProvider without visible controls, no LanguageSelector here.
describe('app/[locale]/layout — T14', () => {
  beforeEach(() => {
    document.documentElement.className = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generateStaticParams returns parameters for all locales (SSG)', async () => {
    const mod = await import('./layout');
    const params = mod.generateStaticParams();
    expect(params).toEqual([{ locale: 'en' }, { locale: 'es' }]);
  });

  it('dynamicParams is false to reject invalid locales (404)', async () => {
    const mod = await import('./layout');
    expect(mod.dynamicParams).toBe(false);
  });

  it('sets <html lang={locale}>', async () => {
    const mod = await import('./layout');
    const { default: Layout } = mod;
    const params = Promise.resolve({ locale: 'es' });
    const ui = await Layout({ params, children: <div>content</div> });
    render(ui);

    await vi.waitFor(() =>
      expect(document.documentElement).toHaveAttribute('lang', 'es')
    );
  });

  it('wraps children in LayoutProvider (locale provider)', async () => {
    const mod = await import('./layout');
    const { default: Layout } = mod;
    const params = Promise.resolve({ locale: 'en' });
    const ui = await Layout({ params, children: <div>content</div> });
    render(ui);

    await vi.waitFor(() =>
      expect(screen.getByTestId('locale-provider')).toBeInTheDocument()
    );
  });

  it('does not render LanguageSelector in the root layout', async () => {
    const mod = await import('./layout');
    const { default: Layout } = mod;
    const params = Promise.resolve({ locale: 'en' });
    const ui = await Layout({ params, children: <div>content</div> });
    render(ui);

    await vi.waitFor(() =>
      expect(screen.queryByTestId('language-selector')).not.toBeInTheDocument()
    );
  });

  it('mounts inline theme script in <head> before interactive', async () => {
    const mod = await import('./layout');
    const { default: Layout } = mod;
    const params = Promise.resolve({ locale: 'en' });
    const ui = await Layout({ params, children: <div>content</div> });
    render(ui);

    const script = document.querySelector('script#theme-init');
    expect(script).not.toBeNull();
    expect(script?.getAttribute('data-strategy')).toBe('beforeInteractive');
  });
});
