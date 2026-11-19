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

function getRevealRegion(): HTMLElement {
  render(
    <Reveal role="group" aria-label="Reveal content">
      <p>Readable content</p>
    </Reveal>,
  );

  return screen.getByRole('group', { name: 'Reveal content' });
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
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: viewportHeight,
  });

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

  return () => {
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
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

  function setPageGeometry({
    viewportHeight,
    pageHeight,
  }: {
    viewportHeight: number;
    pageHeight: number;
  }): void {
    restoreInnerHeight = defineWindowInnerHeight(viewportHeight);
    restoreScrollHeight = defineDocumentScrollHeight(pageHeight);
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

  test('shows computed opacity 1 when page height is less than viewport height', () => {
    setMotionPreferences({
      supportsScrollTimeline: true,
      reducedMotion: false,
      printing: false,
    });
    setPageGeometry({ viewportHeight: 900, pageHeight: 500 });

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
    setPageGeometry({ viewportHeight: 900, pageHeight: 900 });

    const revealRegion = getRevealRegion();
    const styles = window.getComputedStyle(revealRegion);

    expect(styles.opacity).toBe('1');
    expect(styles.transform).toBe('none');
  });
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
