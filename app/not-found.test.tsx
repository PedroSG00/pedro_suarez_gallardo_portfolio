import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// T17: app/not-found.tsx — bilingual 404 inside the root layout, no
// header/controls, exit links (RF-7, RF-9, RNF-3)
const { headersMock } = vi.hoisted(() => ({ headersMock: vi.fn() }));

vi.mock('next/headers', () => ({ headers: headersMock }));

import NotFound, { generateMetadata } from './not-found';

async function renderNotFound(locale: 'en' | 'es') {
  headersMock.mockResolvedValue(new Headers({ 'x-locale': locale }));
  render(await NotFound());
}

describe('app/not-found — T17', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the not-found message in Spanish', async () => {
    await renderNotFound('es');
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
  });

  it('renders the not-found message in English', async () => {
    await renderNotFound('en');
    expect(screen.getByText('Page not found')).toBeInTheDocument();
  });

  it('falls back to the default locale without a request header', async () => {
    headersMock.mockRejectedValue(new Error('no request scope'));
    render(await NotFound());
    expect(screen.getByText('Page not found')).toBeInTheDocument();
  });

  it('renders the error code at display scale as the visual moment', async () => {
    await renderNotFound('es');
    const code = screen.getByTestId('error-code');
    expect(code).toHaveTextContent('404');
    expect(code.className).toContain('text-display');
  });

  it('renders a back link to home in the active language', async () => {
    await renderNotFound('es');
    const backLink = screen.getByText('Volver');
    expect(backLink).toBeInTheDocument();
    expect((backLink as HTMLAnchorElement).href).toContain('/es');
  });

  it('renders a link to the other language labelled in that language', async () => {
    await renderNotFound('es');
    const other = screen.getByText('English');
    expect(other).toHaveAttribute('lang', 'en');
    expect((other as HTMLAnchorElement).href).toContain('/en');
  });

  it('does not render header or navigation controls', async () => {
    await renderNotFound('es');
    expect(screen.queryByTestId('language-selector')).not.toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelector('header')).toBeNull();
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelector('nav')).toBeNull();
  });

  it('does not repeat the requested path on screen', async () => {
    await renderNotFound('es');
    expect(screen.queryByText('/es/loquesea')).not.toBeInTheDocument();
  });

  it('uses a semantic heading for the error message', async () => {
    await renderNotFound('es');
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Página no encontrada');
  });

  it('uses the main landmark as the only content container', async () => {
    await renderNotFound('es');
    const main = screen.getByRole('main');
    expect(main).toContainElement(screen.getByTestId('error-code'));
  });

  it('leaves noindex to the not-found convention (no duplicate robots tag)', async () => {
    headersMock.mockResolvedValue(new Headers({ 'x-locale': 'es' }));
    const metadata = await generateMetadata();
    // Next emits `<meta name="robots" content="noindex">` for not-found routes;
    // declaring robots here as well would render a duplicate tag.
    expect(metadata.robots).toBeUndefined();
    expect(metadata.title).toBe('Página no encontrada');
  });

  it('metadata has no canonical or alternates', async () => {
    headersMock.mockResolvedValue(new Headers({ 'x-locale': 'es' }));
    const metadata = await generateMetadata();
    const record = metadata as Record<string, unknown>;
    expect(record.canonical).toBeUndefined();
    expect(record.alternates).toBeUndefined();
  });
});
