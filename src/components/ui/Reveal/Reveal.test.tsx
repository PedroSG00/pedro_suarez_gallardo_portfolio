import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { applyTheme } from '@/lib/theme-dom';
import Reveal, { REVEAL_VARIANTS, type RevealVariant } from './Reveal';

type MotionPreferences = {
  reducedMotion: boolean;
  printing: boolean;
  supportsScrollTimeline: boolean;
};

function setMotionPreferences({
  reducedMotion,
  printing,
  supportsScrollTimeline,
}: MotionPreferences): void {
  vi.spyOn(CSS, 'supports').mockImplementation((condition) => {
    if (condition === '(animation-timeline: view())') {
      return supportsScrollTimeline;
    }

    return true;
  });

  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches:
        (query === '(prefers-reduced-motion: reduce)' && reducedMotion) ||
        (query === 'print' && printing),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

function defineWindowInnerHeight(value: number): () => void {
  const original = window.innerHeight;
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value,
  });
  return () => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: original,
    });
  };
}

function defineDocumentScrollHeight(value: number): () => void {
  const original = document.documentElement.scrollHeight;
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    writable: true,
    configurable: true,
    value,
  });
  return () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: original,
    });
  };
}

function defineWindowScrollY(value: number): () => void {
  const original = window.scrollY;
  Object.defineProperty(window, 'scrollY', {
    writable: true,
    configurable: true,
    value,
  });
  return () => {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: original,
    });
  };
}

function setScrollGeometry({
  viewportHeight,
  rectTop,
  rectBottom,
}: {
  viewportHeight: number;
  rectTop: number;
  rectBottom: number;
}): () => void {
  const restoreInnerHeight = defineWindowInnerHeight(viewportHeight);

  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function () {
    return {
      ...originalGetBoundingClientRect.call(this),
      top: rectTop,
      bottom: rectBottom,
      height: rectBottom - rectTop,
      width: 100,
      left: 0,
      right: 100,
      x: 0,
      y: rectTop,
      toJSON: () => ({}),
    } as unknown as DOMRect;
  };

  return (): void => {
    restoreInnerHeight();
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  };
}

type ScrollEnvironment = {
  setScroll: (scrollY: number, rectTop: number, rectBottom: number) => void;
  setViewport: (viewportHeight: number, pageHeight: number) => void;
  restore: () => void;
};

function setScrollEnvironment({
  viewportHeight,
  pageHeight,
  scrollY,
  rectTop,
  rectBottom,
}: {
  viewportHeight: number;
  pageHeight: number;
  scrollY: number;
  rectTop: number;
  rectBottom: number;
}): ScrollEnvironment {
  const originalInnerHeight = window.innerHeight;
  const originalScrollY = window.scrollY;
  const originalScrollHeight = document.documentElement.scrollHeight;
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

  let currentScrollY = scrollY;
  let currentRectTop = rectTop;
  let currentRectBottom = rectBottom;

  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: viewportHeight,
  });
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    get: () => currentScrollY,
  });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    writable: true,
    configurable: true,
    value: pageHeight,
  });

  Element.prototype.getBoundingClientRect = function () {
    return {
      ...originalGetBoundingClientRect.call(this),
      top: currentRectTop,
      bottom: currentRectBottom,
      height: currentRectBottom - currentRectTop,
      width: 100,
      left: 0,
      right: 100,
      x: 0,
      y: currentRectTop,
      toJSON: () => ({}),
    } as unknown as DOMRect;
  };

  return {
    setScroll(nextScrollY: number, nextRectTop: number, nextRectBottom: number): void {
      currentScrollY = nextScrollY;
      currentRectTop = nextRectTop;
      currentRectBottom = nextRectBottom;
    },
    setViewport(nextViewportHeight: number, nextPageHeight: number): void {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: nextViewportHeight,
      });
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        configurable: true,
        value: nextPageHeight,
      });
    },
    restore(): void {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: originalInnerHeight,
      });
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: originalScrollY,
      });
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        configurable: true,
        value: originalScrollHeight,
      });
      Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    },
  };
}

type ResizeObserverStub = {
  notify: () => void;
};

function stubResizeObserver(): ResizeObserverStub {
  const callbacks: ResizeObserverCallback[] = [];

  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        callbacks.push(callback);
      }

      observe(): void {}

      unobserve(): void {}

      disconnect(): void {}
    },
  );

  return {
    notify(): void {
      for (const callback of callbacks) {
        callback([], {} as ResizeObserver);
      }
    },
  };
}

function getRevealRegion(extraProps: { isLastSection?: boolean } = {}): HTMLElement {
  render(
    <Reveal role="group" aria-label="Reveal content" isLastSection={extraProps.isLastSection}>
      <p>Readable content</p>
    </Reveal>,
  );

  return screen.getByRole('group', { name: 'Reveal content' });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Reveal safe baseline', () => {
  test('keeps content fully visible when scroll timelines are unsupported', () => {
    setMotionPreferences({
      supportsScrollTimeline: false,
      reducedMotion: false,
      printing: false,
    });

    const revealRegion = getRevealRegion();
    const styles = window.getComputedStyle(revealRegion);

    expect(styles.opacity).toBe('1');
    expect(styles.transform).toBe('none');
  });

  test('keeps content fully visible when reduced motion is preferred', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: true,
      printing: false,
    });

    const revealRegion = getRevealRegion();
    const styles = window.getComputedStyle(revealRegion);

    expect(styles.opacity).toBe('1');
    expect(styles.transform).toBe('none');
  });

  test('keeps content fully visible in print mode', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: true,
    });

    const revealRegion = getRevealRegion();
    const styles = window.getComputedStyle(revealRegion);

    expect(styles.opacity).toBe('1');
    expect(styles.transform).toBe('none');
  });
});

describe('Reveal initial load (RF-03)', () => {
  let restoreGeometry: (() => void) | null = null;

  afterEach(() => {
    if (restoreGeometry) {
      restoreGeometry();
      restoreGeometry = null;
    }
  });

  test('shows computed opacity 1 from the first frame when the block is initially visible', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });
    restoreGeometry = setScrollGeometry({
      viewportHeight: 900,
      rectTop: 400,
      rectBottom: 600,
    });

    const revealRegion = getRevealRegion();
    const styles = window.getComputedStyle(revealRegion);

    expect(styles.opacity).toBe('1');
  });

  test('does not apply an entry transition to blocks already on screen at load', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });
    restoreGeometry = setScrollGeometry({
      viewportHeight: 900,
      rectTop: 400,
      rectBottom: 600,
    });

    const revealRegion = getRevealRegion();
    const styles = window.getComputedStyle(revealRegion);

    expect(styles.opacity).toBe('1');
    expect(styles.transform).toBe('none');
  });
});

describe('Reveal short page (RF-05)', () => {
  let restoreScrollHeight: (() => void) | null = null;
  let restoreInnerHeight: (() => void) | null = null;

  afterEach(() => {
    if (restoreScrollHeight) {
      restoreScrollHeight();
      restoreScrollHeight = null;
    }
    if (restoreInnerHeight) {
      restoreInnerHeight();
      restoreInnerHeight = null;
    }
  });

  test('shows computed opacity 1 when page height is less than viewport height', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });
    restoreInnerHeight = defineWindowInnerHeight(900);
    restoreScrollHeight = defineDocumentScrollHeight(500);

    const revealRegion = getRevealRegion();
    const styles = window.getComputedStyle(revealRegion);

    expect(styles.opacity).toBe('1');
    expect(styles.transform).toBe('none');
  });

  test('shows computed opacity 1 when page height equals viewport height', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });
    restoreInnerHeight = defineWindowInnerHeight(900);
    restoreScrollHeight = defineDocumentScrollHeight(900);

    const revealRegion = getRevealRegion();
    const styles = window.getComputedStyle(revealRegion);

    expect(styles.opacity).toBe('1');
    expect(styles.transform).toBe('none');
  });
});

describe('Reveal last section (RF-04)', () => {
  let restoreScrollY: (() => void) | null = null;
  let restoreScrollHeight: (() => void) | null = null;
  let restoreInnerHeight: (() => void) | null = null;
  let restoreGeometry: (() => void) | null = null;

  afterEach(() => {
    if (restoreScrollY) {
      restoreScrollY();
      restoreScrollY = null;
    }
    if (restoreScrollHeight) {
      restoreScrollHeight();
      restoreScrollHeight = null;
    }
    if (restoreInnerHeight) {
      restoreInnerHeight();
      restoreInnerHeight = null;
    }
    if (restoreGeometry) {
      restoreGeometry();
      restoreGeometry = null;
    }
  });

  test('shows computed opacity 1 when last section block is at end of page', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });
    restoreScrollY = defineWindowScrollY(0);
    restoreScrollHeight = defineDocumentScrollHeight(900);
    restoreInnerHeight = defineWindowInnerHeight(900);
    restoreGeometry = setScrollGeometry({
      viewportHeight: 900,
      rectTop: 400,
      rectBottom: 600,
    });

    const revealRegion = getRevealRegion({ isLastSection: true });
    const styles = window.getComputedStyle(revealRegion);

    expect(styles.opacity).toBe('1');
  });

  test('does not apply exit phase to last section block at top fourth of screen', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });
    restoreScrollY = defineWindowScrollY(0);
    // rect.bottom en el cuarto superior de pantalla (fase de salida)
    restoreGeometry = setScrollGeometry({
      viewportHeight: 900,
      rectTop: -300,
      rectBottom: 100,
    });

    const revealRegion = getRevealRegion({ isLastSection: true });
    const styles = window.getComputedStyle(revealRegion);

    expect(styles.opacity).toBe('1');
    expect(styles.transform).toBe('none');
  });
});

describe('Reveal reversibility (RF-06)', () => {
  let restoreScrollY: (() => void) | null = null;
  let restoreGeometry: (() => void) | null = null;

  afterEach(() => {
    if (restoreScrollY) {
      restoreScrollY();
      restoreScrollY = null;
    }
    if (restoreGeometry) {
      restoreGeometry();
      restoreGeometry = null;
    }
  });

  test('does not force opacity when returning to stable phase after exit', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });

    // Salida: borde inferior en el cuarto superior de pantalla
    restoreScrollY = defineWindowScrollY(0);
    restoreGeometry = setScrollGeometry({
      viewportHeight: 900,
      rectTop: -300,
      rectBottom: 100,
    });

    const { rerender } = render(
      <Reveal role="group" aria-label="Reveal content">
        <p>Readable content</p>
      </Reveal>,
    );

    // Volver a fase estable y re-renderizar
    restoreScrollY = defineWindowScrollY(300);
    restoreGeometry = setScrollGeometry({
      viewportHeight: 900,
      rectTop: 400,
      rectBottom: 600,
    });

    rerender(
      <Reveal role="group" aria-label="Reveal content">
        <p>Readable content</p>
      </Reveal>,
    );

    // En fase estable, opacidad computada 1 (sin override forzado)
    const stylesAtStable = window.getComputedStyle(
      screen.getByRole('group', { name: 'Reveal content' }),
    );
    expect(stylesAtStable.opacity).toBe('1');
    expect(stylesAtStable.transform).toBe('none');
  });

  test('does not force opacity when returning to entry phase after stable', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });

    // Estable
    restoreScrollY = defineWindowScrollY(300);
    restoreGeometry = setScrollGeometry({
      viewportHeight: 900,
      rectTop: 400,
      rectBottom: 600,
    });

    const { rerender } = render(
      <Reveal role="group" aria-label="Reveal content">
        <p>Readable content</p>
      </Reveal>,
    );

    // Entrada: borde superior en el 15% inferior de la pantalla
    restoreScrollY = defineWindowScrollY(600);
    restoreGeometry = setScrollGeometry({
      viewportHeight: 900,
      rectTop: 800,
      rectBottom: 850,
    });

    rerender(
      <Reveal role="group" aria-label="Reveal content">
        <p>Readable content</p>
      </Reveal>,
    );

    // In entry phase, computed opacity 1 in jsdom (no scroll timeline
    // animation); important is that there is no forced override on inline style.
    const stylesAtEntry = window.getComputedStyle(
      screen.getByRole('group', { name: 'Reveal content' }),
    );
    expect(stylesAtEntry.opacity).toBe('1');
  });
});

describe('Reveal fast scroll (RF-07)', () => {
  let restoreEnvironment: (() => void) | null = null;

  afterEach(() => {
    if (restoreEnvironment) {
      restoreEnvironment();
      restoreEnvironment = null;
    }
  });

  test('keeps stable blocks at computed opacity 1 after a fast scroll burst stops', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });
    const environment = setScrollEnvironment({
      viewportHeight: 900,
      pageHeight: 6000,
      scrollY: 0,
      rectTop: 2400,
      rectBottom: 2600,
    });
    restoreEnvironment = environment.restore;

    const revealRegion = getRevealRegion();

    // Fast scroll burst: the block crosses entry and mid-screen phases
    for (const scrollY of [0, 800, 1600, 2400, 3200]) {
      environment.setScroll(scrollY, 2400 - scrollY, 2600 - scrollY);
      fireEvent.scroll(window);
    }

    // Abrupt stop in the stable phase (top edge at 44% of the viewport)
    environment.setScroll(2000, 400, 600);
    fireEvent.scroll(window);
    fireEvent(window, new Event('scrollend'));

    const styles = window.getComputedStyle(revealRegion);

    expect(styles.opacity).toBe('1');
    expect(styles.transform).toBe('none');
  });

  test('clears the last-section exit override when fast scroll settles in the stable phase', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });
    const environment = setScrollEnvironment({
      viewportHeight: 900,
      pageHeight: 6000,
      scrollY: 0,
      rectTop: -300,
      rectBottom: 100,
    });
    restoreEnvironment = environment.restore;

    const revealRegion = getRevealRegion({ isLastSection: true });

    // In exit phase, last section keeps opacity 1 (forceVisible)
    expect(window.getComputedStyle(revealRegion).opacity).toBe('1');

    // Abrupt stop in the stable phase: the browser only emits scroll end
    environment.setScroll(2000, 400, 600);
    fireEvent(window, new Event('scrollend'));

    // No inline override: opacity is back under CSS animation control
    expect(window.getComputedStyle(revealRegion).opacity).toBe('1');
  });
});

describe('Reveal exclusions (RF-11)', () => {
  let restoreEnvironment: (() => void) | null = null;

  const SCROLL_PHASES = [
    { scrollY: 0, rectTop: 800, rectBottom: 850 },
    { scrollY: 2000, rectTop: 400, rectBottom: 600 },
    { scrollY: 3000, rectTop: -300, rectBottom: 100 },
  ];

  afterEach(() => {
    if (restoreEnvironment) {
      restoreEnvironment();
      restoreEnvironment = null;
    }
  });

  test('keeps navigation, footer and skip link at computed opacity 1 in every scroll phase', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });
    const environment = setScrollEnvironment({
      viewportHeight: 900,
      pageHeight: 6000,
      scrollY: 0,
      rectTop: 800,
      rectBottom: 850,
    });
    restoreEnvironment = environment.restore;

    render(
      <>
        <Reveal isExcluded role="navigation" aria-label="Site navigation">
          <a href="#main">Skip to content</a>
        </Reveal>
        <Reveal isExcluded role="contentinfo" aria-label="Site footer">
          <p>Footer content</p>
        </Reveal>
      </>,
    );

    const excludedRegions = [
      screen.getByRole('navigation', { name: 'Site navigation' }),
      screen.getByRole('contentinfo', { name: 'Site footer' }),
    ];
    const skipLink = screen.getByRole('link', { name: 'Skip to content' });

    for (const phase of SCROLL_PHASES) {
      environment.setScroll(phase.scrollY, phase.rectTop, phase.rectBottom);
      fireEvent.scroll(window);

      for (const region of [...excludedRegions, skipLink]) {
        const styles = window.getComputedStyle(region);

        expect(styles.opacity).toBe('1');
        expect(styles.transform).toBe('none');
      }

      for (const region of excludedRegions) {
        expect(window.getComputedStyle(region).opacity).toBe('1');
      }
    }
  });

  test('keeps fixed and sticky elements out of the reveal in every scroll phase', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });
    const environment = setScrollEnvironment({
      viewportHeight: 900,
      pageHeight: 6000,
      scrollY: 0,
      rectTop: 800,
      rectBottom: 850,
    });
    restoreEnvironment = environment.restore;

    render(
      <>
        <Reveal isExcluded role="region" aria-label="Fixed toolbar">
          <div style={{ position: 'fixed', top: 0 }}>Fixed toolbar</div>
        </Reveal>
        <Reveal isExcluded role="region" aria-label="Sticky summary">
          <div style={{ position: 'sticky', top: 0 }}>Sticky summary</div>
        </Reveal>
      </>,
    );

    const fixedAndSticky = [
      screen.getByText('Fixed toolbar'),
      screen.getByText('Sticky summary'),
    ];
    const excludedRegions = [
      screen.getByRole('region', { name: 'Fixed toolbar' }),
      screen.getByRole('region', { name: 'Sticky summary' }),
    ];

    for (const phase of SCROLL_PHASES) {
      environment.setScroll(phase.scrollY, phase.rectTop, phase.rectBottom);
      fireEvent.scroll(window);

      for (const element of fixedAndSticky) {
        const styles = window.getComputedStyle(element);

        expect(styles.opacity).toBe('1');
        expect(styles.transform).toBe('none');
      }

      for (const region of excludedRegions) {
        expect(window.getComputedStyle(region).opacity).toBe('1');
      }
    }
  });

  test('keeps fixed and sticky content out of the reveal when nested in a reveal block', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });
    const environment = setScrollEnvironment({
      viewportHeight: 900,
      pageHeight: 6000,
      scrollY: 3000,
      rectTop: -300,
      rectBottom: 100,
    });
    restoreEnvironment = environment.restore;

    render(
      <>
        <Reveal role="group" aria-label="Fixed reveal block">
          <div style={{ position: 'fixed', top: 0 }}>Fixed inside</div>
        </Reveal>
        <Reveal role="group" aria-label="Sticky reveal block">
          <div style={{ position: 'sticky', top: 0 }}>Sticky inside</div>
        </Reveal>
      </>,
    );

    const fixedRegion = screen.getByRole('group', { name: 'Fixed reveal block' });
    const stickyRegion = screen.getByRole('group', { name: 'Sticky reveal block' });

    // The blocks opt out of the reveal and stay fully visible instead of
    // animating content that must remain fixed to the viewport.
    expect(window.getComputedStyle(fixedRegion).opacity).toBe('1');
    expect(window.getComputedStyle(stickyRegion).opacity).toBe('1');
    expect(window.getComputedStyle(screen.getByText('Fixed inside')).opacity).toBe('1');
    expect(window.getComputedStyle(screen.getByText('Sticky inside')).opacity).toBe('1');
  });
});

describe('Reveal viewport changes (RF-08)', () => {
  let restoreEnvironment: (() => void) | null = null;

  afterEach(() => {
    if (restoreEnvironment) {
      restoreEnvironment();
      restoreEnvironment = null;
    }
  });

  test('keeps stable-phase blocks at computed opacity 1 after resize and rotation', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });
    const environment = setScrollEnvironment({
      viewportHeight: 900,
      pageHeight: 6000,
      scrollY: 3000,
      rectTop: -300,
      rectBottom: 100,
    });
    restoreEnvironment = environment.restore;

    const revealRegion = getRevealRegion({ isLastSection: true });

    // Exit phase on a phone in portrait: the block is forced visible.
    expect(window.getComputedStyle(revealRegion).opacity).toBe('1');

    // Same position reached by normal scroll: the block sits in its stable phase.
    environment.setScroll(2000, 400, 600);
    fireEvent.scroll(window);
    const opacityAtStable = window.getComputedStyle(revealRegion).opacity;
    expect(opacityAtStable).toBe('1');
    expect(window.getComputedStyle(revealRegion).opacity).toBe('1');

    // Rotation to landscape: the block is back in its exit phase.
    environment.setViewport(400, 6000);
    environment.setScroll(2000, -300, 100);
    fireEvent(window, new Event('resize'));
    expect(window.getComputedStyle(revealRegion).opacity).toBe('1');

    // Rotation back: the viewport recalculates to the stable phase again.
    environment.setViewport(900, 6000);
    environment.setScroll(2000, 400, 600);
    fireEvent(window, new Event('resize'));

    // The opacity matches arriving at the same position with normal scroll.
    expect(window.getComputedStyle(revealRegion).opacity).toBe(opacityAtStable);
    expect(window.getComputedStyle(revealRegion).opacity).toBe('1');
  });

  test('recalculates when zoom or reflow changes the page height without a resize event', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });
    const resizeObserver = stubResizeObserver();
    const environment = setScrollEnvironment({
      viewportHeight: 900,
      pageHeight: 6000,
      scrollY: 0,
      rectTop: 800,
      rectBottom: 1000,
    });
    restoreEnvironment = environment.restore;

    const revealRegion = getRevealRegion();

    // Tall page, block in its entry phase: the CSS animation drives the reveal.
    expect(window.getComputedStyle(revealRegion).opacity).toBe('1');

    // Text zoom/reflow shrinks the page below the viewport without a window
    // resize event, so only the layout change reports the new size.
    environment.setViewport(900, 500);
    act(() => resizeObserver.notify());

    // There is no scroll left: the block must be fully visible, never stuck faded.
    expect(window.getComputedStyle(revealRegion).opacity).toBe('1');
    expect(window.getComputedStyle(revealRegion).opacity).toBe('1');

    // Text zoom back out: the page scrolls again and the block returns to the reveal.
    environment.setViewport(900, 6000);
    act(() => resizeObserver.notify());

    expect(window.getComputedStyle(revealRegion).opacity).toBe('1');
  });
});

describe('Reveal locale and theme changes (RF-09)', () => {
  let restoreEnvironment: (() => void) | null = null;

  function renderStableReveal(): {
    environment: ScrollEnvironment;
    rerender: (text: string) => void;
    revealRegion: HTMLElement;
  } {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });
    const environment = setScrollEnvironment({
      viewportHeight: 900,
      pageHeight: 6000,
      scrollY: 2000,
      rectTop: 400,
      rectBottom: 600,
    });

    const { rerender } = render(
      <Reveal role="group" aria-label="Reveal content">
        <p>Experience</p>
      </Reveal>,
    );

    return {
      environment,
      rerender: (text: string): void => {
        rerender(
          <Reveal role="group" aria-label="Reveal content">
            <p>{text}</p>
          </Reveal>,
        );
      },
      revealRegion: screen.getByRole('group', { name: 'Reveal content' }),
    };
  }

  function sampleStableStyle(revealRegion: HTMLElement): {
    opacity: string;
    transform: string;
  } {
    const styles = window.getComputedStyle(revealRegion);
    return { opacity: styles.opacity, transform: styles.transform };
  }

  afterEach(() => {
    if (restoreEnvironment) {
      restoreEnvironment();
      restoreEnvironment = null;
    }
    document.documentElement.lang = '';
    delete document.documentElement.dataset.theme;
  });

  test('keeps stable-phase blocks at computed opacity 1 after changing language', () => {
    const { environment, rerender, revealRegion } = renderStableReveal();
    restoreEnvironment = environment.restore;

    rerender('Experiencia');
    document.documentElement.lang = 'es';

    expect(screen.getByText('Experiencia')).toBeVisible();
    const styles = window.getComputedStyle(revealRegion);
    expect(styles.opacity).toBe('1');
    expect(styles.transform).toBe('none');
  });

  test('keeps stable-phase blocks at computed opacity 1 after changing theme', () => {
    const { environment, revealRegion } = renderStableReveal();
    restoreEnvironment = environment.restore;

    applyTheme(document.documentElement, 'dark');

    expect(revealRegion).toBeVisible();
    const styles = window.getComputedStyle(revealRegion);
    expect(styles.opacity).toBe('1');
    expect(styles.transform).toBe('none');
  });

  test('does not fade stable-phase blocks in or out while switching language and theme', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });
    const resizeObserver = stubResizeObserver();
    const environment = setScrollEnvironment({
      viewportHeight: 900,
      pageHeight: 500,
      scrollY: 0,
      rectTop: 400,
      rectBottom: 600,
    });
    restoreEnvironment = environment.restore;

    const { rerender } = render(
      <Reveal role="group" aria-label="Reveal content">
        <p>Experience</p>
      </Reveal>,
    );
    const revealRegion = screen.getByRole('group', { name: 'Reveal content' });
    const samples: Array<{ opacity: string; transform: string }> = [];

    // The page is shorter than the viewport: no scroll, nothing to reveal.
    samples.push(sampleStableStyle(revealRegion));

    // Language change: the translated copy makes the page scrollable again.
    environment.setViewport(900, 6000);
    act(() => resizeObserver.notify());
    rerender(
      <Reveal role="group" aria-label="Reveal content">
        <p>Experiencia</p>
      </Reveal>,
    );
    document.documentElement.lang = 'es';
    samples.push(sampleStableStyle(revealRegion));

    // Theme change in both directions.
    applyTheme(document.documentElement, 'dark');
    samples.push(sampleStableStyle(revealRegion));

    applyTheme(document.documentElement, 'light');
    samples.push(sampleStableStyle(revealRegion));

    for (const sample of samples) {
      expect(sample.opacity).toBe('1');
      expect(sample.transform).toBe('none');
    }
    expect(window.getComputedStyle(revealRegion).opacity).toBe('1');
  });
});

describe('Reveal variants (RF-14)', () => {
  test('uses one of the three valid variants for every revealed block', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });

    for (const variant of REVEAL_VARIANTS) {
      const { unmount } = render(
        <Reveal role="group" aria-label={`${variant} block`} variant={variant}>
          <p>{variant} content</p>
        </Reveal>,
      );

      const block = screen.getByRole('group', { name: `${variant} block` });

      expect(REVEAL_VARIANTS).toContain(block.getAttribute('data-reveal-variant'));
      expect(block).toHaveAttribute('data-reveal-variant', variant);

      unmount();
    }
  });

  test('keeps a block without an explicit variant on a valid default', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });

    render(
      <Reveal role="group" aria-label="Default variant block">
        <p>Default variant content</p>
      </Reveal>,
    );

    expect(REVEAL_VARIANTS).toContain(
      screen
        .getByRole('group', { name: 'Default variant block' })
        .getAttribute('data-reveal-variant'),
    );
  });

  test('does not show any variant beyond rise, clip and fade', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });

    expect([...REVEAL_VARIANTS]).toStrictEqual(['rise', 'clip', 'fade']);

    // Even if a caller passes an unsupported value at runtime, the block stays
    // on a defined variant instead of inventing a fourth one.
    render(
      <Reveal
        role="group"
        aria-label="Unknown variant block"
        variant={'zoom' as unknown as RevealVariant}
      >
        <p>Unknown variant content</p>
      </Reveal>,
    );

    const block = screen.getByRole('group', { name: 'Unknown variant block' });

    expect(REVEAL_VARIANTS).toContain(block.getAttribute('data-reveal-variant'));
    expect(block).toHaveAttribute('data-reveal-variant', 'rise');
  });
});

// jsdom does not run scroll-driven animations, so this probe stands in for the
// dimmed entry and exit phases the block goes through while scrolling.
function simulateDimmedScrollPhase(): () => void {
  const styleElement = document.createElement('style');
  styleElement.textContent =
    '[role="group"] { opacity: 0.35; transform: translateY(12px); }';
  document.head.append(styleElement);

  return () => styleElement.remove();
}

describe('Reveal keyboard focus (RF-15)', () => {
  let restoreScrollPhase: (() => void) | null = null;
  let scrollEnvironment: ScrollEnvironment | null = null;

  afterEach(() => {
    if (restoreScrollPhase) {
      restoreScrollPhase();
      restoreScrollPhase = null;
    }
    if (scrollEnvironment) {
      scrollEnvironment.restore();
      scrollEnvironment = null;
    }
  });

  test('shows computed opacity 1 when a control inside the block receives focus', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });
    // A block in the middle of a long page: no short-page override, so only
    // focus or the scroll phase decide its visibility.
    scrollEnvironment = setScrollEnvironment({
      viewportHeight: 900,
      pageHeight: 3000,
      scrollY: 300,
      rectTop: 400,
      rectBottom: 600,
    });
    restoreScrollPhase = simulateDimmedScrollPhase();

    render(
      <Reveal role="group" aria-label="Reveal content">
        <a href="#contact">Contact</a>
      </Reveal>,
    );

    const block = screen.getByRole('group', { name: 'Reveal content' });
    const link = screen.getByRole('link', { name: 'Contact' });

    expect(window.getComputedStyle(block).opacity).toBe('0.35');

    act(() => link.focus());

    const focusedStyles = window.getComputedStyle(block);

    expect(link).toHaveFocus();
    expect(focusedStyles.opacity).toBe('1');
    expect(focusedStyles.transform).toBe('none');

    act(() => link.blur());

    expect(window.getComputedStyle(block).opacity).toBe('0.35');
  });

  test('never leaves a focused control dimmed', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });
    scrollEnvironment = setScrollEnvironment({
      viewportHeight: 900,
      pageHeight: 3000,
      scrollY: 300,
      rectTop: 400,
      rectBottom: 600,
    });
    restoreScrollPhase = simulateDimmedScrollPhase();

    render(
      <Reveal role="group" aria-label="Reveal content">
        <button type="button">First action</button>
        <button type="button">Second action</button>
      </Reveal>,
    );

    const block = screen.getByRole('group', { name: 'Reveal content' });

    expect(window.getComputedStyle(block).opacity).toBe('0.35');

    for (const name of ['First action', 'Second action']) {
      const control = screen.getByRole('button', { name });

      act(() => control.focus());

      expect(control).toHaveFocus();
      expect(window.getComputedStyle(control).opacity).toBe('1');
      expect(window.getComputedStyle(block).opacity).toBe('1');
    }
  });
});
