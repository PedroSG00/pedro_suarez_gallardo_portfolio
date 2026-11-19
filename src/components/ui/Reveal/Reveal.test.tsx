import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Reveal from './Reveal';

function defineMatchMedia(mockImpl: (query: string) => MediaQueryList): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn(mockImpl),
  });
}

function makeMediaQueryList(matches: boolean): MediaQueryList {
  return {
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;
}

function computedOpacity(element: Element): string {
  return window.getComputedStyle(element).opacity;
}

function computedTransform(element: Element): string {
  return window.getComputedStyle(element).transform;
}

describe('Reveal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    defineMatchMedia(() => makeMediaQueryList(false));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renderiza con opacidad computada 1 y sin desplazamiento cuando no hay soporte de scroll timeline', () => {
    vi.spyOn(CSS, 'supports').mockImplementation((property, value) => {
      if (property === 'animation-timeline' && value === 'view()') {
        return false;
      }
      return true;
    });

    render(<Reveal>Contenido de prueba</Reveal>);
    const element = screen.getByText('Contenido de prueba');
    expect(computedOpacity(element)).toBe('1');
    expect(computedTransform(element)).toBe('none');
  });

  test('renderiza con opacidad computada 1 y sin desplazamiento con prefers-reduced-motion: reduce', () => {
    defineMatchMedia((query) => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return makeMediaQueryList(true);
      }
      return makeMediaQueryList(false);
    });

    render(<Reveal>Contenido de prueba</Reveal>);
    const element = screen.getByText('Contenido de prueba');
    expect(computedOpacity(element)).toBe('1');
    expect(computedTransform(element)).toBe('none');
  });

  test('renderiza con opacidad computada 1 y sin desplazamiento en modo impresión', () => {
    defineMatchMedia((query) => {
      if (query === 'print') {
        return makeMediaQueryList(true);
      }
      return makeMediaQueryList(false);
    });

    render(<Reveal>Contenido de prueba</Reveal>);
    const element = screen.getByText('Contenido de prueba');
    expect(computedOpacity(element)).toBe('1');
    expect(computedTransform(element)).toBe('none');
  });

  test('renderiza los hijos visibles cuando el revelado está activo', () => {
    vi.spyOn(CSS, 'supports').mockReturnValue(true);
    defineMatchMedia(() => makeMediaQueryList(false));

    render(<Reveal>Contenido de prueba</Reveal>);
    const element = screen.getByText('Contenido de prueba');
    expect(computedOpacity(element)).toBe('1');
    expect(computedTransform(element)).toBe('none');
  });
});
