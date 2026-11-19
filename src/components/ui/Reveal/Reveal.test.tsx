import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import Reveal from './Reveal';

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
