import { expect, test } from 'vitest';
import {
  constrainStackCard,
  moveStackCard,
  resolveStackCollisions,
  type StackBody,
} from '@/lib/stack/stack-geometry';

const bounds = { left: -6, right: 6, bottom: -5, top: 5 };
const slot = { x: 0, y: 0, halfWidth: 1.5, halfHeight: 0.8 };
const card = (x: number, y: number): StackBody => ({ x, y, halfWidth: 1, halfHeight: 0.5 });

test.each([
  [-20, 2, -5, 2],
  [20, 2, 5, 2],
  [3, -20, 3, -4.5],
  [3, 20, 3, 4.5],
  [20, 20, 5, 4.5],
  [5, -4.5, 5, -4.5],
] as const)('contains the entire footprint when moved to (%s, %s)', (x, y, expectedX, expectedY) => {
  expect(constrainStackCard(card(x, y), bounds, slot)).toEqual(card(expectedX, expectedY));
});

test('reopens a crowded pocket rather than leaving cards stacked completely', () => {
  const pile = Array.from({ length: 25 }, () => card(0, 1.35));
  const settled = resolveStackCollisions(pile, bounds, slot);
  for (const [index, body] of settled.entries()) {
    expect(constrainStackCard(body, bounds, slot)).toEqual(body);
    for (const neighbor of settled.slice(index + 1)) {
      expect(Math.abs(body.x - neighbor.x) >= 1 || Math.abs(body.y - neighbor.y) >= 0.5).toBe(true);
    }
  }
});

test('reserves the slot for a held card without letting free cards cross it', () => {
  expect(constrainStackCard(card(0, 0), bounds, slot)).toEqual(card(0, 1.3));
  expect(constrainStackCard(card(0, 0), bounds, undefined)).toEqual(card(0, 0));
});

test('deterministically separates coincident centers while allowing partial overlap', () => {
  const cards = [card(3, 0), card(3, 0)];
  const first = resolveStackCollisions(cards, bounds, slot);
  expect(first).toEqual(resolveStackCollisions(cards, bounds, slot));
  expect(cards).toEqual([card(3, 0), card(3, 0)]);
  const distance = Math.abs(first[0].y - first[1].y);
  expect(distance).toBeGreaterThan(0.5);
  expect(distance).toBeLessThan(1);
  expect(resolveStackCollisions(first, bounds, slot)).toEqual(first);
});

test('a held card repels its neighbor without drifting away from the pointer', () => {
  const [held, neighbor] = resolveStackCollisions([card(3, 0), card(3, 0.3)], bounds, slot, 0);
  expect(held).toEqual(card(3, 0));
  expect(neighbor.y).toBeGreaterThan(0.65);
});

test('a fast drag pushes intermediate neighbors instead of tunneling through them', () => {
  const initial = [card(-4, 3), card(0, 3), card(3, 3)];
  const result = moveStackCard(initial, 0, { x: 4, y: 3 }, bounds, slot);
  expect(result[0]).toEqual(card(4, 3));
  expect(result[1]).not.toEqual(initial[1]);
  expect(initial).toEqual([card(-4, 3), card(0, 3), card(3, 3)]);
  for (const body of result) {
    expect(constrainStackCard(body, bounds, slot)).toEqual(body);
  }
});

test('successive drag updates preserve the displacement of neighbors already passed', () => {
  const initial = [card(-4, 3), card(0, 3)];
  const first = moveStackCard(initial, 0, { x: 0, y: 3 }, bounds, slot);
  const second = moveStackCard(first, 0, { x: -4, y: 3 }, bounds, slot);
  expect(second[1]).toEqual(first[1]);
  expect(second[1]).not.toEqual(initial[1]);
});

test('a dragged card does not teleport crowded neighbors between pointer samples', () => {
  let bodies = [card(3, 3), card(3.1, 3), card(3.2, 3)];
  let maximumNeighborStep = 0;
  for (let x = 3.1; x <= 4; x += 0.1) {
    const next = moveStackCard(bodies, 0, { x, y: 3 }, bounds, slot);
    for (let index = 1; index < bodies.length; index++) {
      const distance = Math.hypot(next[index].x - bodies[index].x, next[index].y - bodies[index].y);
      maximumNeighborStep = Math.max(maximumNeighborStep, distance);
    }
    bodies = next;
  }
  expect(maximumNeighborStep).toBeLessThan(0.75);
});

test('a held card at the rim keeps its target while neighbors move along a free axis', () => {
  const [held, neighbor] = resolveStackCollisions(
    [card(5, 3), card(5, 3)], bounds, slot, 0,
  );
  expect(held).toEqual(card(5, 3));
  expect(neighbor).not.toEqual(held);
});

test.each([-1, 10])('ignores movement with an unavailable held index (%s)', (index) => {
  const bodies = [card(3, 3)];
  expect(moveStackCard(bodies, index, { x: 0, y: 0 }, bounds, slot)).toEqual(bodies);
});

test.each([
  [card(5, 4.5), card(5, 4.43), card(5, 4.4)],
  [card(0, 1.3), card(0, 1.4), card(0, 1.45)],
])('resolves three crowded cards without forcing one through the rim or slot', (...cards) => {
  const settled = resolveStackCollisions(cards, bounds, slot);
  for (const [index, body] of settled.entries()) {
    expect(constrainStackCard(body, bounds, slot)).toEqual(body);
    for (const neighbor of settled.slice(index + 1)) {
      expect(Math.abs(body.x - neighbor.x) >= 1 || Math.abs(body.y - neighbor.y) >= 0.5).toBe(true);
    }
  }
});
