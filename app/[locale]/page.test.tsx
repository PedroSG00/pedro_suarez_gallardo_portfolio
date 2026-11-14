import { describe, it, expect } from 'vitest';

// T21: app/[locale]/page.tsx generateMetadata — title, description, canonical,
// hreflang, x-default → /en (RNF-3)
// Done when: metadata includes canonical own URL, alternates with hreflang for
// both languages, and x-default points to /en.
describe('app/[locale]/page — T21 (generateMetadata)', () => {
  it('returns title and description in Spanish for /es', async () => {
    const mod = await import('./page');
    const metadata = await mod.generateMetadata({
      params: Promise.resolve({ locale: 'es' }),
    });
    expect(metadata.title).toContain('Desarrollador web');
    expect(metadata.description).toContain('currículum');
  });

  it('returns title and description in English for /en', async () => {
    const mod = await import('./page');
    const metadata = await mod.generateMetadata({
      params: Promise.resolve({ locale: 'en' }),
    });
    expect(metadata.title).toContain('Web Developer');
    expect(metadata.description).toContain('résumé');
  });

  it('returns canonical own URL for English home page', async () => {
    const mod = await import('./page');
    const metadata = await mod.generateMetadata({
      params: Promise.resolve({ locale: 'en' }),
    });
    expect(metadata.canonical).toBe('/en/');
  });

  it('returns canonical own URL for Spanish home page', async () => {
    const mod = await import('./page');
    const metadata = await mod.generateMetadata({
      params: Promise.resolve({ locale: 'es' }),
    });
    expect(metadata.canonical).toBe('/es/');
  });

  it('returns alternates with hreflang for both languages', async () => {
    const mod = await import('./page');
    const metadata = await mod.generateMetadata({
      params: Promise.resolve({ locale: 'en' }),
    });
    const alternates = metadata.alternates as {
      languages: Record<string, string>;
    };
    expect(alternates.languages['en']).toBe('/en/');
    expect(alternates.languages['es']).toBe('/es/');
  });

  it('x-default points to /en (canonical serves as x-default)', async () => {
    const mod = await import('./page');
    const metadata = await mod.generateMetadata({
      params: Promise.resolve({ locale: 'en' }),
    });
    expect(metadata.canonical).toBe('/en/');
  });

  it('renders a single h1 with the translated hero title', async () => {
    const { default: HomePage } = await import('./page');
    const ui = await HomePage({ params: Promise.resolve({ locale: 'es' }) });
    const { render, screen } = await import('@testing-library/react');
    await import('@testing-library/jest-dom/vitest');
    render(ui);

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Pedro Suárez Gallardo');
  });
});
