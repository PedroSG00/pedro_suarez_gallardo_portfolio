import { FEATURED_STACK_TECHNOLOGY_IDS, type StackTechnologyId } from '@/content/stack';
import type { StackSceneTechnology } from '@/lib/stack/stack-scene-types';

const FEATURED: ReadonlySet<StackTechnologyId> = new Set(FEATURED_STACK_TECHNOLOGY_IDS);
const DESKTOP_ROWS = [
  [-1.76, -0.5, 0.58, 1.7],
  [-2, -1, 0, 1, 2],
  [-2.1, -1.18, 1.18, 2.1],
  [-2, -1.14, 1.14, 2],
  [-2.05, -1, 0, 1, 2.05],
  [-1.22, -0.07, 1.1],
] as const;

export const STACK_CARD_WIDTH = 2.08;
export const STACK_CARD_HEIGHT = 1.03;
export const STACK_SLOT_WIDTH = 3.05;
export const STACK_SLOT_HEIGHT = 1.58;

type CardPosition = { x: number; y: number; z: number; scale: number };

export function layoutStackCards(
  technologies: readonly StackSceneTechnology[],
  aspect: number,
): { positions: Map<StackTechnologyId, CardPosition>; viewHeight: number } {
  const columns = aspect >= 1.05 ? 5 : aspect >= 0.59 ? 3 : 2;
  const isWide = columns === 5;
  const ordered = [...technologies].sort((left, right) =>
    Number(FEATURED.has(right.id)) - Number(FEATURED.has(left.id)) ||
    left.order - right.order,
  );
  const rows = isWide ? DESKTOP_ROWS.length : Math.ceil(ordered.length / columns) + 1;
  const middleRow = Math.floor(rows / 2);
  const positions = new Map<StackTechnologyId, CardPosition>();
  const pitchY = isWide ? 1.36 : 1.18;
  const minWidth = isWide ? 13.35 : columns === 3 ? 7.45 : 5.1;
  const viewHeight = Math.max((rows - 1) * pitchY + (isWide ? 2.65 : 4.1), minWidth / aspect);

  let index = 0;
  for (let row = 0; row < rows; row++) {
    if (!isWide && row === middleRow) continue;
    const offsets = isWide
      ? DESKTOP_ROWS[row]
      : Array.from({ length: columns }, (_, column) => column - (columns - 1) / 2);

    for (const offset of offsets) {
      const technology = ordered[index];
      if (!technology) break;
      positions.set(technology.id, {
        x: offset * (isWide ? 2.48 : 2.36),
        y: (isWide ? (rows - 1) / 2 : middleRow) * pitchY - row * pitchY +
          (isWide ? 0 : Math.sign(middleRow - row) * 0.18) +
          Math.sin(index * 2.3) * (isWide ? 0.11 : 0.045),
        z: Math.sin(index * 1.47) * (isWide ? 0.56 : 0.2),
        scale: FEATURED.has(technology.id) ? 1.13 : 1,
      });
      index++;
    }
  }

  return { positions, viewHeight };
}
