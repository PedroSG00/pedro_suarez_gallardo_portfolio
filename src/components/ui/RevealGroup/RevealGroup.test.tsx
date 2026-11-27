import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import Reveal from '@/components/ui/Reveal/Reveal';
import RevealGroup from './RevealGroup';

// The entry animation always ends at 25% of the block journey, where the
// stable phase starts. Group offsets only move the entry start inside it.
const STABLE_PHASE_START = 25;

function readScrollOffset(element: HTMLElement): number {
  const rawValue = window
    .getComputedStyle(element)
    .getPropertyValue('--psg-reveal-entry-start')
    .trim();

  return rawValue === '' ? 0 : Number.parseFloat(rawValue);
}

function mountGroup(
  items: string[],
  props: { maxPoints?: number; maxElementsWithOffset?: number } = {},
): number[] {
  render(
    <RevealGroup {...props}>
      {items.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </RevealGroup>,
  );

  return items.map((item) => readScrollOffset(screen.getByText(item)));
}

describe('RevealGroup scroll staggering (RF-13)', () => {
  test('staggers scroll offsets between siblings of the same group', () => {
    const offsets = mountGroup(['First block', 'Second block', 'Third block']);

    expect(offsets[0]).toBe(0);
    expect(offsets[1]).toBeGreaterThan(offsets[0]);
    expect(offsets[2]).toBeGreaterThan(offsets[1]);
    expect(offsets[1] - offsets[0]).toBeCloseTo(offsets[2] - offsets[1], 5);
  });

  test('does not chain offsets between different groups', () => {
    render(
      <>
        <RevealGroup>
          <p>First group A</p>
          <p>First group B</p>
          <p>First group C</p>
        </RevealGroup>
        <RevealGroup>
          <p>Second group A</p>
          <p>Second group B</p>
        </RevealGroup>
      </>,
    );

    const secondGroupOffsets = [
      readScrollOffset(screen.getByText('Second group A')),
      readScrollOffset(screen.getByText('Second group B')),
    ];

    expect(secondGroupOffsets[0]).toBe(0);
    expect(secondGroupOffsets[1]).toBeGreaterThan(0);
    // Its step depends on its own size (2 siblings), not on the group above.
    expect(secondGroupOffsets[1]).toBeCloseTo(2.5, 5);
  });

  test('keeps a standalone block outside any group without offset', () => {
    render(
      <>
        <RevealGroup>
          <p>Grouped block A</p>
          <p>Grouped block B</p>
        </RevealGroup>
        <Reveal>
          <p>Standalone block</p>
        </Reveal>
      </>,
    );

    const standalone = screen.getByText('Standalone block');

    expect(readScrollOffset(standalone)).toBe(0);
    expect(standalone).not.toHaveAttribute('style');
  });

  test('keeps the group total offset within five travel points', () => {
    const offsets = mountGroup([
      'Block 1',
      'Block 2',
      'Block 3',
      'Block 4',
      'Block 5',
      'Block 6',
      'Block 7',
      'Block 8',
    ]);

    expect(Math.max(...offsets)).toBeLessThanOrEqual(5);
    // At most six elements get their own offset: the rest share the last one.
    expect(offsets[5]).toBeGreaterThan(offsets[4]);
    expect(offsets[6]).toBe(offsets[5]);
    expect(offsets[7]).toBe(offsets[5]);
  });

  test('finishes each element entry before its stable phase starts', () => {
    const offsets = mountGroup([
      'Entry 1',
      'Entry 2',
      'Entry 3',
      'Entry 4',
      'Entry 5',
      'Entry 6',
      'Entry 7',
    ]);

    for (const offset of offsets) {
      expect(offset).toBeLessThan(STABLE_PHASE_START);
    }
  });

  test('renders non-element children without a reveal offset', () => {
    render(<RevealGroup>Plain text child</RevealGroup>);

    const textChild = screen.getByText('Plain text child');

    expect(readScrollOffset(textChild)).toBe(0);
    expect(textChild).not.toHaveAttribute('style');
  });
});

describe('RevealGroup variants (RF-14)', () => {
  test('keeps every sibling visible when a group variant is supplied', () => {
    render(
      <RevealGroup variant="clip">
        <p>Clip block A</p>
        <p>Clip block B</p>
      </RevealGroup>,
    );

    for (const item of ['Clip block A', 'Clip block B']) {
      expect(screen.getByText(item)).toBeVisible();
    }
  });
});
