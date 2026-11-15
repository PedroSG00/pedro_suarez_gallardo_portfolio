import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { SectionAnchor } from './SectionAnchor';

// T17 (004): SectionAnchor — RF-3, RF-8
// Done when: an h2 with id, tabindex="-1", scroll-margin-top and no button
// or link added.
describe('SectionAnchor — T17 (RF-3, RF-8)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders an h2 whose id matches the anchor prop', () => {
    render(<SectionAnchor id="experiencia">Experiencia</SectionAnchor>);
    const heading = screen.getByRole('heading', { level: 2, name: 'Experiencia' });
    expect(heading).toHaveAttribute('id', 'experiencia');
  });

  it('makes the heading focusable with tabindex="-1"', () => {
    render(<SectionAnchor id="proyectos">Proyectos</SectionAnchor>);
    const heading = screen.getByRole('heading', { level: 2, name: 'Proyectos' });
    expect(heading).toHaveAttribute('tabindex', '-1');
  });

  it('applies a scroll-margin-top so the title stays under the header', () => {
    render(<SectionAnchor id="stack">Stack</SectionAnchor>);
    const heading = screen.getByRole('heading', { level: 2, name: 'Stack' });
    expect(heading).toHaveStyle('scroll-margin-top: var(--header-height, 64px)');
  });

  it('adds no button or link inside the anchor', () => {
    render(<SectionAnchor id="contacto">Contacto</SectionAnchor>);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders only the prop-provided title as visible text', () => {
    render(<SectionAnchor id="inicio">Título personalizado</SectionAnchor>);
    expect(screen.getByRole('heading', { level: 2, name: 'Título personalizado' })).toBeInTheDocument();
    expect(screen.queryByText('Sección')).not.toBeInTheDocument();
  });
});

// T21 (004): Foco en el titular al elegir un destino — RF-3, RF-5, RF-8
// Done when: al activar #experiencia por clic o hashchange, el titular queda
// como document.activeElement con focus({ preventScroll: true }),
// sin scrollIntoView, sin control visible y sin duplicar el desplazamiento del ancla.
describe('SectionAnchor — T21 (RF-3, RF-5, RF-8)', () => {
  const scrollIntoViewMock = vi.fn();
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    value: scrollIntoViewMock,
    writable: true,
    configurable: true,
  });

  function setHash(hash: string): void {
    window.location.hash = hash;
  }

  beforeEach(() => {
    scrollIntoViewMock.mockClear();
    setHash('');
  });

  afterEach(() => {
    scrollIntoViewMock.mockClear();
    setHash('');
  });

  it('focuses the heading with preventScroll when hash matches its id', () => {
    render(<SectionAnchor id="experiencia">Experiencia</SectionAnchor>);
    const heading = screen.getByRole('heading', { level: 2, name: 'Experiencia' });
    const focusSpy = vi.spyOn(heading, 'focus');

    setHash('#experiencia');
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('does not focus when hash does not match its id', () => {
    render(<SectionAnchor id="experiencia">Experiencia</SectionAnchor>);
    const heading = screen.getByRole('heading', { level: 2, name: 'Experiencia' });
    const focusSpy = vi.spyOn(heading, 'focus');

    setHash('#proyectos');
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('does not call scrollIntoView', () => {
    render(<SectionAnchor id="experiencia">Experiencia</SectionAnchor>);

    setHash('#experiencia');
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });

  it('adds no visible control inside the anchor', () => {
    render(<SectionAnchor id="experiencia">Experiencia</SectionAnchor>);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('cleans up the hashchange listener on unmount', () => {
    const { unmount } = render(<SectionAnchor id="experiencia">Experiencia</SectionAnchor>);
    const heading = screen.getByRole('heading', { level: 2, name: 'Experiencia' });
    const focusSpy = vi.spyOn(heading, 'focus');
    unmount();

    setHash('#experiencia');
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(focusSpy).not.toHaveBeenCalled();
  });
});
