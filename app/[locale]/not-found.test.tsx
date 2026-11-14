import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

// T17: app/[locale]/not-found.tsx — bilingual 404, no header/controls, exit
// links (RF-7, RF-9, RNF-3)
// Done when: renders common.notFound + common.back + link to other language;
// no header or navigation; does not repeat requested path; noindex; no
// canonical/alternatives.
vi.mock('../../i18n/provider/locale-provider', () => ({
  default: function LocaleProvider({
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

vi.mock('../../i18n/translation/get-dictionary', () => ({
  getDictionary: (locale: string) =>
    locale === 'es'
      ? {
          common: { notFound: 'Página no encontrada', back: 'Volver' },
          languages: { en: 'English', es: 'Español' },
        }
      : {
          common: { notFound: 'Page not found', back: 'Back' },
          languages: { en: 'English', es: 'Español' },
        },
}));

import { default as NotFound } from './not-found';

describe('app/[locale]/not-found — T17', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders notFound message in Spanish', async () => {
    const params = Promise.resolve({ locale: 'es' });
    const { default: NotFoundES } = await import('./not-found');
    const ui = await NotFoundES({ params });
    render(ui);

    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
  });

  it('renders notFound message in English', async () => {
    const params = Promise.resolve({ locale: 'en' });
    const { default: NotFoundEN } = await import('./not-found');
    const ui = await NotFoundEN({ params });
    render(ui);

    expect(screen.getByText('Page not found')).toBeInTheDocument();
  });

  it('renders back link to home in the active language', async () => {
    const params = Promise.resolve({ locale: 'es' });
    const { default: NotFoundES } = await import('./not-found');
    const ui = await NotFoundES({ params });
    render(ui);

    const backLink = screen.getByText('Volver');
    expect(backLink).toBeInTheDocument();
    expect((backLink as HTMLAnchorElement).href).toContain('/es');
  });

  it('renders link to the other language labelled in that language', async () => {
    const params = Promise.resolve({ locale: 'es' });
    const { default: NotFoundES } = await import('./not-found');
    const ui = await NotFoundES({ params });
    render(ui);

    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('does not render header or navigation controls', async () => {
    const params = Promise.resolve({ locale: 'es' });
    const { default: NotFoundES } = await import('./not-found');
    const ui = await NotFoundES({ params });
    render(ui);

    expect(screen.queryByTestId('language-selector')).not.toBeInTheDocument();
  });

  it('does not repeat the requested path on screen', async () => {
    const params = Promise.resolve({ locale: 'es' });
    const { default: NotFoundES } = await import('./not-found');
    const ui = await NotFoundES({ params });
    render(ui);

    expect(screen.queryByText('/es/loquesea')).not.toBeInTheDocument();
  });

  it('uses a semantic heading for the error message', async () => {
    const params = Promise.resolve({ locale: 'es' });
    const { default: NotFoundES } = await import('./not-found');
    const ui = await NotFoundES({ params });
    render(ui);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Página no encontrada');
  });

  it('declares noindex in metadata', async () => {
    const mod = await import('./not-found');
    expect(mod.metadata).toEqual({ noindex: true });
  });

  it('metadata has no canonical or alternates', async () => {
    const mod = await import('./not-found');
    const metadata = mod.metadata as Record<string, unknown>;
    expect(metadata.canonical).toBeUndefined();
    expect(metadata.alternates).toBeUndefined();
  });
});
