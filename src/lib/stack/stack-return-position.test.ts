import { expect, test } from 'vitest';
import {
  STACK_CARD_WIDTH,
  STACK_SLOT_WIDTH,
} from '@/lib/stack/stack-scene-layout';
import { findStackReturnPosition, type StackPoint } from '@/lib/stack/stack-return-position';

const touchingSlot = (STACK_SLOT_WIDTH + STACK_CARD_WIDTH) / 2;
const origin = { x: 4, y: 2 };
const spare = { x: -4, y: 2 };
const far = { x: -4, y: -2 };
const inView = ({ x, y }: StackPoint) => Math.abs(x) <= 5 && Math.abs(y) <= 3;

test.each([
  { name: 'previous position still free', start: origin, neighbors: [], expected: origin },
  { name: 'previous position occupied', start: origin, neighbors: [{ ...origin, scale: 1 }], expected: spare },
  { name: 'previous position offscreen', start: { x: 6, y: 2 }, neighbors: [], expected: spare },
  { name: 'previous position inside slot', start: { x: 0, y: 0 }, neighbors: [], expected: spare },
  { name: 'exact slot edge', start: { x: touchingSlot, y: 0 }, neighbors: [], expected: { x: touchingSlot, y: 0 } },
  { name: 'card larger than the available slot clearance', start: { x: touchingSlot, y: 0 }, neighbors: [], scale: 1.13, expected: spare },
])('finds a visible return position: $name', ({ start, neighbors, scale = 1, expected }) => {
  expect(findStackReturnPosition([start, spare, far], scale, neighbors, inView)).toEqual(expected);
});

test('chooses the least obstructed position if no wholly clear position fits', () => {
  const partlyObstructed = { x: spare.x + STACK_CARD_WIDTH / 2, y: spare.y };
  expect(findStackReturnPosition(
    [origin, partlyObstructed], 1, [{ ...origin, scale: 1 }, { ...spare, scale: 1 }], inView,
  )).toEqual(partlyObstructed);
});
