import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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

// T21 (004): Focus the section title when a destination is chosen — RF-3,
// RF-5, RF-8.
// Done when: activating #experiencia by click or hashchange leaves the title
// as document.activeElement through focus({ preventScroll: true }), without
// scrollIntoView, without a visible control and without duplicating the
// anchor's native scroll.
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

  function clearHash(): void {
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search
    );
  }

  function mountAnchor(): HTMLHeadingElement {
    render(<SectionAnchor id="experiencia">Experiencia</SectionAnchor>);
    return screen.getByRole('heading', { level: 2, name: 'Experiencia' });
  }

  beforeEach(() => {
    scrollIntoViewMock.mockClear();
    clearHash();
  });

  afterEach(() => {
    scrollIntoViewMock.mockClear();
    clearHash();
    vi.restoreAllMocks();
  });

  it('focuses the heading with preventScroll when the hash targets it', () => {
    const heading = mountAnchor();
    const focusSpy = vi.spyOn(heading, 'focus');

    setHash('#experiencia');
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('leaves the heading as document.activeElement after hashchange', () => {
    const heading = mountAnchor();

    setHash('#experiencia');
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(heading).toHaveFocus();
  });

  it('focuses the heading on mount when the URL already targets it', () => {
    setHash('#experiencia');
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus');

    const heading = mountAnchor();

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    expect(heading).toHaveFocus();
  });

  it('focuses the heading when a destination link is clicked', () => {
    render(
      <>
        <a href="#experiencia">Experiencia</a>
        <SectionAnchor id="experiencia">Experiencia</SectionAnchor>
      </>
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'Experiencia' });
    const link = screen.getByRole('link', { name: 'Experiencia' });

    fireEvent.click(link);

    expect(heading).toHaveFocus();
  });

  it('keeps the native link navigation intact while focusing the heading', () => {
    render(
      <>
        <a href="#experiencia">Experiencia</a>
        <SectionAnchor id="experiencia">Experiencia</SectionAnchor>
      </>
    );
    const link = screen.getByRole('link', { name: 'Experiencia' });

    const defaultNotPrevented = fireEvent.click(link);

    expect(defaultNotPrevented).toBe(true);
    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });

  it('does not focus when the hash targets another section', () => {
    const heading = mountAnchor();
    const focusSpy = vi.spyOn(heading, 'focus');

    setHash('#proyectos');
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(focusSpy).not.toHaveBeenCalled();
    expect(heading).not.toHaveFocus();
  });

  it('does not focus when a link targets another section', () => {
    render(
      <>
        <a href="#proyectos">Proyectos</a>
        <SectionAnchor id="experiencia">Experiencia</SectionAnchor>
      </>
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'Experiencia' });
    const link = screen.getByRole('link', { name: 'Proyectos' });

    fireEvent.click(link);

    expect(heading).not.toHaveFocus();
  });

  it('never calls scrollIntoView, so the anchor scroll is not duplicated', () => {
    const heading = mountAnchor();

    setHash('#experiencia');
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(heading).toHaveFocus();
    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });

  it('adds no visible control inside the anchor', () => {
    mountAnchor();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('cleans up the hashchange and click listeners on unmount', () => {
    render(<a href="#experiencia">Experiencia</a>);
    const link = screen.getByRole('link', { name: 'Experiencia' });
    const { unmount } = render(<SectionAnchor id="experiencia">Experiencia</SectionAnchor>);
    const heading = screen.getByRole('heading', { level: 2, name: 'Experiencia' });
    const focusSpy = vi.spyOn(heading, 'focus');
    unmount();

    setHash('#experiencia');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    fireEvent.click(link);

    expect(focusSpy).not.toHaveBeenCalled();
  });
});
