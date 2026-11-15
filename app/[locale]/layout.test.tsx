import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

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
      <div
        data-testid="locale-provider"
        data-locale={locale}
        data-has-dict={String(Object.keys(dictionary).length > 0)}
      >
        {children}
      </div>
    );
  },
}));

// T14: app/[locale]/layout.tsx — static params per locale, dictionary
// provider, no document shell and no visible controls (RF-1, RF-4, RF-6).
// Done when: generateStaticParams covers both locales, dynamicParams is false,
// and children render inside the locale provider.
describe('app/[locale]/layout — T14', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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

  it('passes the locale and dictionary to the provider', async () => {
    const mod = await import('./layout');
    const params = Promise.resolve({ locale: 'es' });
    const ui = await mod.default({ params, children: <div>content</div> });
    render(ui);

    const provider = screen.getByTestId('locale-provider');
    expect(provider).toHaveAttribute('data-locale', 'es');
    expect(provider).toHaveAttribute('data-has-dict', 'true');
  });

  it('wraps children through the provider', async () => {
    const mod = await import('./layout');
    const params = Promise.resolve({ locale: 'en' });
    const ui = await mod.default({ params, children: <div>content</div> });
    render(ui);

    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('does not render visible controls', async () => {
    const mod = await import('./layout');
    const params = Promise.resolve({ locale: 'en' });
    const ui = await mod.default({ params, children: <div>content</div> });
    render(ui);

    expect(screen.queryByTestId('language-selector')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('does not own the <html> document (root layout does)', async () => {
    const mod = await import('./layout');
    const params = Promise.resolve({ locale: 'en' });
    const ui = await mod.default({ params, children: <div>content</div> });
    render(ui);

    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelector('script#theme-init')).toBeNull();
  });
});
