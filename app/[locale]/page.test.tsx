import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// T21: app/[locale]/page.tsx generateMetadata — RF8, RNF4
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

  it('renders a single h1 with the translated hero title (RNF5)', async () => {
    const { default: HomePage } = await import('./page');
    const ui = await HomePage({ params: Promise.resolve({ locale: 'es' }) });
    render(ui);

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Pedro Suárez Gallardo');
  });
});
