import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// T22: app/[locale]/projects/page.tsx generateMetadata — RF8
describe('app/[locale]/projects/page — T22 (generateMetadata)', () => {
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

  it('renders a single translated h1 (RNF5)', async () => {
    const { default: ProjectsPage } = await import('./page');
    const ui = await ProjectsPage({ params: Promise.resolve({ locale: 'es' }) });
    render(ui);

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Proyectos');
  });
});
