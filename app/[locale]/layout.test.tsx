import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React, { act } from 'react';

vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: '--font-geist-sans' }),
  Geist_Mono: () => ({ variable: '--font-geist-mono' }),
}));

vi.mock('../../app/components/LanguageSelector/LanguageSelector', () => ({
  default: () => <div data-testid="language-selector">selector</div>,
}));

import { default as Layout, generateStaticParams, dynamicParams } from './layout';

// T20: app/[locale]/layout.tsx — RF8, RNF4, RNF5
describe('app/[locale]/layout — T20', () => {
  beforeEach(() => {
    document.documentElement.className = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generateStaticParams returns parameters for all locales (SSG)', () => {
    const params = generateStaticParams();
    expect(params).toEqual([{ locale: 'en' }, { locale: 'es' }]);
  });

  it('dynamicParams is false to reject invalid locales (404)', () => {
    expect(dynamicParams).toBe(false);
  });

  it('sets <html lang={locale}>', async () => {
    const params = Promise.resolve({ locale: 'es' });
    await act(async () => {
      render(
        <React.Suspense fallback={null}>
          <Layout params={params}><div>content</div></Layout>
        </React.Suspense>
      );
    });
    await vi.waitFor(() =>
      expect(document.documentElement).toHaveAttribute('lang', 'es')
    );
  });

  it('wraps children in LocaleProvider (exposes language selector)', async () => {
    const params = Promise.resolve({ locale: 'en' });
    await act(async () => {
      render(
        <React.Suspense fallback={null}>
          <Layout params={params}><div>content</div></Layout>
        </React.Suspense>
      );
    });
    await vi.waitFor(() =>
      expect(screen.getByTestId('language-selector')).toBeInTheDocument()
    );
  });
});
