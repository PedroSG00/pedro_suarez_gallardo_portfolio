import {
  STACK_CARD_HEIGHT,
  STACK_CARD_WIDTH,
  STACK_SLOT_HEIGHT,
  STACK_SLOT_WIDTH,
} from '@/lib/stack/stack-scene-layout';

export type StackPoint = { x: number; y: number };
type Footprint = StackPoint & { width: number; height: number };

function footprint(point: StackPoint, scale: number): Footprint {
  return { ...point, width: STACK_CARD_WIDTH * scale, height: STACK_CARD_HEIGHT * scale };
}

function overlap(a: Footprint, b: Footprint): number {
  const span = (distance: number, sizeA: number, sizeB: number) =>
    Math.max(0, Math.min(sizeA, sizeB, (sizeA + sizeB) / 2 - Math.abs(distance)));
  return span(a.x - b.x, a.width, b.width) * span(a.y - b.y, a.height, b.height);
}

export function findStackReturnPosition(
  candidates: Iterable<StackPoint>,
  scale: number,
  neighbors: readonly (StackPoint & { scale: number })[],
  isVisible: (point: StackPoint) => boolean,
): StackPoint | undefined {
  const slot = { x: 0, y: 0, width: STACK_SLOT_WIDTH, height: STACK_SLOT_HEIGHT };
  const cards = neighbors.map((neighbor) => footprint(neighbor, neighbor.scale));
  let best: StackPoint | undefined;
  let leastOverlap = Infinity;
  for (const point of candidates) {
    const card = footprint(point, scale);
    if (overlap(card, slot) || !isVisible(point)) continue;
    const obstruction = cards.reduce((area, neighbor) => area + overlap(card, neighbor), 0);
    if (obstruction === 0) return point;
    if (obstruction < leastOverlap) {
      best = point;
      leastOverlap = obstruction;
    }
  }
  return best;
}
