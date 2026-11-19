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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Reveal safe baseline', () => {
  describe('al cargar sin scroll previo (RF-03)', () => {
    test('muestra opacidad computada igual a 1 desde el primer fotograma para un bloque inicialmente visible', () => {
      setMotionPreferences({
        supportsScrollTimeline: true,
        reducedMotion: false,
        printing: false,
      });

      const revealRegion = getRevealRegion();
      const styles = window.getComputedStyle(revealRegion);

      expect(styles.opacity).toBe('1');
      expect(styles.transform).toBe('none');
    });

    test('no aplica una transición de entrada visible para bloques ya en pantalla al cargar', () => {
      setMotionPreferences({
        supportsScrollTimeline: true,
        reducedMotion: false,
        printing: false,
      });

      const revealRegion = getRevealRegion();
      const styles = window.getComputedStyle(revealRegion);

      expect(styles.opacity).toBe('1');
      expect(styles.transform).toBe('none');
      expect(styles.animation).toBe('');
      expect(styles.transition).toBe('');
    });
  });

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
