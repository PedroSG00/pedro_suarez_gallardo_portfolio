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

const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

function mockViewportDimensions(viewportHeight: number): void {
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: viewportHeight,
  });
}

function mockElementRect(top: number, bottom: number): void {
  Element.prototype.getBoundingClientRect = function () {
    return {
      ...originalGetBoundingClientRect.call(this),
      top,
      bottom,
      height: bottom - top,
      width: 100,
      left: 0,
      right: 100,
      x: 0,
      y: top,
      toJSON: () => ({}),
    } as unknown as DOMRect;
  };
}

function setupActiveReveal(viewportHeight = 900, top = 450, bottom = 550): void {
  vi.spyOn(CSS, 'supports').mockReturnValue(true);
  defineMatchMedia(() => makeMediaQueryList(false));
  mockViewportDimensions(viewportHeight);
  mockElementRect(top, bottom);
}

afterEach(() => {
  vi.restoreAllMocks();
  Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
});

describe('Reveal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    defineMatchMedia(() => makeMediaQueryList(false));
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

  test('opacidad menor que 1 cuando el borde superior está en el 15 % inferior de la pantalla (entrada)', () => {
    setupActiveReveal(900, 800, 850);

    render(<Reveal>Contenido de prueba</Reveal>);
    const element = screen.getByText('Contenido de prueba');
    const opacity = parseFloat(computedOpacity(element));
    expect(opacity).toBeLessThan(1);
  });

  test('opacidad igual a 1 cuando el borde superior < 70 % y el borde inferior > 30 % (estable)', () => {
    setupActiveReveal(900, 400, 500);

    render(<Reveal>Contenido de prueba</Reveal>);
    const element = screen.getByText('Contenido de prueba');
    expect(computedOpacity(element)).toBe('1');
  });

  test('opacidad menor que 1 cuando el borde inferior está en el 15 % superior de la pantalla (salida)', () => {
    setupActiveReveal(900, 50, 100);

    render(<Reveal>Contenido de prueba</Reveal>);
    const element = screen.getByText('Contenido de prueba');
    const opacity = parseFloat(computedOpacity(element));
    expect(opacity).toBeLessThan(1);
  });

  test('en franjas intermedias, la opacidad es mayor que 0 y menor que 1', () => {
    setupActiveReveal(900, 700, 750);

    render(<Reveal>Contenido de prueba</Reveal>);
    const element = screen.getByText('Contenido de prueba');
    const opacity = parseFloat(computedOpacity(element));
    expect(opacity).toBeGreaterThan(0);
    expect(opacity).toBeLessThan(1);
  });

  test('con viewportHeight 0, opacidad es 1 sin desplazamiento', () => {
    vi.spyOn(CSS, 'supports').mockReturnValue(true);
    defineMatchMedia(() => makeMediaQueryList(false));
    mockViewportDimensions(0);
    mockElementRect(450, 550);

    render(<Reveal>Contenido de prueba</Reveal>);
    const element = screen.getByText('Contenido de prueba');
    expect(computedOpacity(element)).toBe('1');
    expect(computedTransform(element)).toBe('none');
  });

  test('en entrada con progreso saturado (bloque muy abajo), opacidad es 0', () => {
    setupActiveReveal(900, 1000, 1050);

    render(<Reveal>Contenido de prueba</Reveal>);
    const element = screen.getByText('Contenido de prueba');
    const opacity = parseFloat(computedOpacity(element));
    expect(opacity).toBe(0);
  });

  test('en salida con progreso saturado (bloque muy arriba), opacidad es 0', () => {
    setupActiveReveal(900, -200, -150);

    render(<Reveal>Contenido de prueba</Reveal>);
    const element = screen.getByText('Contenido de prueba');
    const opacity = parseFloat(computedOpacity(element));
    expect(opacity).toBe(0);
  });

  test('con scroll timeline soportado y reduced-motion activo, opacidad es 1', () => {
    vi.spyOn(CSS, 'supports').mockReturnValue(true);
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

  test('con scroll timeline soportado, sin reduced-motion y en impresión, opacidad es 1', () => {
    vi.spyOn(CSS, 'supports').mockReturnValue(true);
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
});
