import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

vi.mock('../../components/SectionAnchor/SectionAnchor', () => ({
  SectionAnchor: function SectionAnchor({
    id,
    children,
  }: {
    id: string;
    children: React.ReactNode;
  }) {
    return (
      <h2 data-testid="section-anchor" id={id} tabIndex={-1}>
        {children}
      </h2>
    );
  },
}));

vi.mock('../../components/SiteHeader/SiteHeader', () => ({
  default: function SiteHeader(props: Record<string, unknown>) {
    return <header data-testid="site-header">{String(props.children)}</header>;
  },
}));

import { default as HomePage } from './page';

// T18 (004): Home page shells — RF-3, RF-5, RNF-10
// Done when: the anchor `inicio` and the four sections experiencia,
// proyectos, stack and contacto render in DESTINATIONS order, each with a
// SectionAnchor, a bilingual title, and min-height enough for its title to
// cross the bottom edge of the header, without CV content.
describe('app/[locale]/(site)/page — T18 (RF-3, RF-5, RNF-10)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function renderPage(locale: 'en' | 'es') {
    const ui = await HomePage({ params: Promise.resolve({ locale }) });
    return render(ui);
  }

  it('renders the inicio anchor plus four sections in DESTINATIONS order (en)', async () => {
    await renderPage('en');
    const anchors = screen.getAllByTestId('section-anchor');
    expect(anchors.map((a) => a.id)).toEqual([
      'inicio',
      'experiencia',
      'proyectos',
      'stack',
      'contacto',
    ]);
  });

  it('renders the inicio anchor plus four sections in DESTINATIONS order (es)', async () => {
    await renderPage('es');
    const anchors = screen.getAllByTestId('section-anchor');
    expect(anchors.map((a) => a.id)).toEqual([
      'inicio',
      'experiencia',
      'proyectos',
      'stack',
      'contacto',
    ]);
  });

  it('renders each section anchor with a bilingual title', async () => {
    await renderPage('en');
    expect(screen.getAllByTestId('section-anchor')).toHaveLength(5);
    expect(
      screen.getByRole('heading', { name: 'Experience', level: 2 })
    ).toBeInTheDocument();
    await renderPage('es');
    expect(
      screen.getByRole('heading', { name: 'Experiencia', level: 2 })
    ).toBeInTheDocument();
  });

  it('gives each section a min-height so its title crosses the header bottom edge', async () => {
    await renderPage('en');
    for (const shell of screen.getAllByTestId('section-shell')) {
      expect(shell.getAttribute('style')).toContain('min-height: 70vh');
    }
  });

  it('renders no CV content inside the shells', async () => {
    await renderPage('en');
    expect(
      screen.queryByText(/currículum|résumé|resume|cv|historial laboral/i)
    ).not.toBeInTheDocument();
  });
});
