import { describe, it, expect } from 'vitest';

// T21: app/[locale]/projects/page.tsx generateMetadata — title, description,
// canonical, hreflang, x-default → /en (RNF-3)
// Done when: metadata includes canonical own URL, alternates with hreflang for
// both languages, and x-default points to /en.
describe('app/[locale]/projects/page — T21 (generateMetadata)', () => {
  it('returns title and description in Spanish for /es/projects', async () => {
    const mod = await import('./page');
    const metadata = await mod.generateMetadata({
      params: Promise.resolve({ locale: 'es' }),
    });
    expect(metadata.title).toContain('Proyectos');
    expect(metadata.description).toContain('proyectos');
  });

  it('returns title and description in English for /en/projects', async () => {
    const mod = await import('./page');
    const metadata = await mod.generateMetadata({
      params: Promise.resolve({ locale: 'en' }),
    });
    expect(metadata.title).toContain('Projects');
    expect(metadata.description).toContain('projects');
  });

  it('returns canonical own URL for English projects page', async () => {
    const mod = await import('./page');
    const metadata = await mod.generateMetadata({
      params: Promise.resolve({ locale: 'en' }),
    });
    expect(metadata.canonical).toBe('/en/projects');
  });

  it('returns canonical own URL for Spanish projects page', async () => {
    const mod = await import('./page');
    const metadata = await mod.generateMetadata({
      params: Promise.resolve({ locale: 'es' }),
    });
    expect(metadata.canonical).toBe('/es/projects');
  });

  it('returns alternates with hreflang for both languages', async () => {
    const mod = await import('./page');
    const metadata = await mod.generateMetadata({
      params: Promise.resolve({ locale: 'en' }),
    });
    const alternates = metadata.alternates as {
      languages: Record<string, string>;
    };
    expect(alternates.languages['en']).toBe('/en/projects');
    expect(alternates.languages['es']).toBe('/es/projects');
  });

  it('x-default points to /en/projects (canonical serves as x-default)', async () => {
    const mod = await import('./page');
    const metadata = await mod.generateMetadata({
      params: Promise.resolve({ locale: 'en' }),
    });
    expect(metadata.canonical).toBe('/en/projects');
  });

  it('renders a single translated h1', async () => {
    const { default: ProjectsPage } = await import('./page');
    const ui = await ProjectsPage({ params: Promise.resolve({ locale: 'es' }) });
    const { render, screen } = await import('@testing-library/react');
    await import('@testing-library/jest-dom/vitest');
    render(ui);

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Proyectos');
  });
});
