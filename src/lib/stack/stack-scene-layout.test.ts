import { expect, test } from 'vitest';
import { STACK_TECHNOLOGIES } from '@/content/stack';
import {
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
