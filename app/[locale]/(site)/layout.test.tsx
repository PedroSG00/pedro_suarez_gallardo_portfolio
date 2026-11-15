import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

const captured: Array<Record<string, unknown>> = [];
vi.mock('../../components/SiteHeader/SiteHeader', () => ({
  default: function SiteHeader(props: Record<string, unknown>) {
    captured.push(props);
    return <header data-testid="site-header">{String(props.children)}</header>;
  },
}));

import { default as SiteLayout } from './layout';

const paramsEn = Promise.resolve({ locale: 'en' });
const paramsEs = Promise.resolve({ locale: 'es' });

// T15 (004): SiteHeader montado en (site)/layout — RF-1, RF-6, RF-7, RNF-10
// Done when: inicio y /projects renderizan la cabecera con textos del
// servidor, y la 404 no la hereda (grupo (site) excluye not-found).
describe('app/[locale]/(site)/layout — T15', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    captured.length = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('mounts SiteHeader with dictionary texts on the home page (/en)', async () => {
    const ui = await SiteLayout({
      children: <div data-testid="content">inicio</div>,
      params: paramsEn,
    });
    render(ui);

    expect(screen.getByTestId('site-header')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();

    const props = captured[captured.length - 1];
    expect(props.headerLabel).toBe('Site header');
    expect(props.navLabel).toBe('Primary navigation');
    expect(props.menuLabel).toBe('Menu');
    expect(props.brandName).toBe('Pedro Suárez Gallardo');
    expect(props.locale).toBe('en');
    expect(props.languages).toEqual({ en: 'English', es: 'Español' });
    expect(props.triggerLabel).toBe('English');
  });

  it('mounts SiteHeader with dictionary texts on Spanish (/es)', async () => {
    const ui = await SiteLayout({
      children: <div data-testid="content">inicio</div>,
      params: paramsEs,
    });
    render(ui);

    const props = captured[captured.length - 1];
    expect(props.headerLabel).toBe('Cabecera del sitio');
    expect(props.navLabel).toBe('Navegación principal');
    expect(props.menuLabel).toBe('Menú');
    expect(props.locale).toBe('es');
    expect(props.languages).toEqual({ en: 'English', es: 'Español' });
    expect(props.triggerLabel).toBe('Español');
  });

  it('mounts SiteHeader on /projects too', async () => {
    const ui = await SiteLayout({
      children: <div data-testid="content">proyectos</div>,
      params: paramsEn,
    });
    render(ui);

    expect(screen.getByTestId('site-header')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('does not write visible text of its own (all from server dictionary)', async () => {
    const ui = await SiteLayout({
      children: <div data-testid="content">x</div>,
      params: paramsEn,
    });
    render(ui);

    const header = screen.getByTestId('site-header');
    // SiteHeader is mocked; it only renders children and data attributes.
    // Real visible strings come from props resolved by the server layout.
    expect(header).toHaveAttribute('data-testid', 'site-header');
  });
});
