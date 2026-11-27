import { expect, test } from 'vitest';
import { STACK_TECHNOLOGIES } from '@/content/stack';
import {
  connectStackCards,
  layoutStackCards,
  STACK_CARD_HEIGHT,
  STACK_CARD_WIDTH,
  STACK_SLOT_HEIGHT,
  STACK_SLOT_WIDTH,
} from '@/lib/stack/stack-scene-layout';

const technologies = STACK_TECHNOLOGIES.map((technology) => ({
  ...technology,
  name: technology.id,
  categoryLabel: technology.category,
}));

test.each([0.31, 0.59, 0.93, 1.05, 1.92])(
  'keeps all 25 modules in view without covering the central slot at aspect %s',
  (aspect) => {
    const { positions, viewHeight } = layoutStackCards(technologies, aspect);
    expect(positions.size).toBe(technologies.length);

    for (const { x, y, scale } of positions.values()) {
      const width = STACK_CARD_WIDTH * scale;
      const height = STACK_CARD_HEIGHT * scale;
      expect(Math.abs(x) + width / 2).toBeLessThan(viewHeight * aspect / 2);
      expect(Math.abs(y) + height / 2).toBeLessThan(viewHeight / 2);
      expect(
        Math.abs(x) > (width + STACK_SLOT_WIDTH) / 2 ||
        Math.abs(y) > (height + STACK_SLOT_HEIGHT) / 2,
      ).toBe(true);
    }
  },
);

test('connects cards by visual proximity within their own category', () => {
  const { positions } = layoutStackCards(technologies, 1.72);
  const connections = connectStackCards(technologies, positions);
  const categories = new Map(technologies.map(({ id, category }) => [id, category]));
  const frontend = connections.filter(([left]) => categories.get(left) === 'frontend');
  const maximumFrontendSpan = Math.max(...frontend.map(([left, right]) => {
    const a = positions.get(left);
    const b = positions.get(right);
    if (!a || !b) throw new Error('Expected every technology to have a position');
    return Math.hypot(a.x - b.x, a.y - b.y);
  }));

  expect(connections).toHaveLength(technologies.length - new Set(categories.values()).size);
  expect(connections.every(([left, right]) =>
    categories.get(left) === categories.get(right),
  )).toBe(true);
  expect(frontend.some(([left, right]) =>
    [left, right].includes('react') && [left, right].includes('nextJs'),
  )).toBe(false);
  expect(maximumFrontendSpan).toBeLessThan(3);
});
