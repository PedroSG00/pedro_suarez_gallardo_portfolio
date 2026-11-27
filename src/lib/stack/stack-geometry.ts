export type StackBounds = { left: number; right: number; bottom: number; top: number };
type Point = { x: number; y: number };
export type StackBody = Point & { halfWidth: number; halfHeight: number; anchor?: Point };
export type StackGlide = { velocityX: number; velocityY: number; remaining: number };

const CONTACT_RATIO = 0.94;
const MAX_PASSES = 12;
const TOLERANCE = 0.0001;
const DEEP_OVERLAP_RATIO = 0.55;
const DRAG_RESPONSE_RATIO = 1.5;
const GLIDE_DISTANCE_RATIO = 0.35;
const MAX_GLIDE_DISTANCE = 0.24;
const GLIDE_IMPULSE_GAIN = 2;
const MAX_GLIDE_SPEED = 0.55;
const GLIDE_FRICTION = 4.5;
const MIN_GLIDE_SPEED = 0.02;
const MAX_GLIDE_FRAME_SECONDS = 1 / 30;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function createStackGlide(): StackGlide {
  return { velocityX: 0, velocityY: 0, remaining: 0 };
}

export function addStackGlideImpulse(glide: StackGlide, displacement: Point): StackGlide {
  const distance = Math.hypot(displacement.x, displacement.y);
  if (distance <= TOLERANCE) return glide;

  const velocityX = glide.velocityX + displacement.x * GLIDE_IMPULSE_GAIN;
  const velocityY = glide.velocityY + displacement.y * GLIDE_IMPULSE_GAIN;
  const speed = Math.hypot(velocityX, velocityY);
  const ratio = speed > MAX_GLIDE_SPEED ? MAX_GLIDE_SPEED / speed : 1;
  return {
    velocityX: velocityX * ratio,
    velocityY: velocityY * ratio,
    remaining: Math.min(MAX_GLIDE_DISTANCE, glide.remaining + distance * GLIDE_DISTANCE_RATIO),
  };
}

export function advanceStackGlide(glide: StackGlide, deltaSeconds: number) {
  if (deltaSeconds <= 0) return { dx: 0, dy: 0, glide };
  if (glide.remaining <= TOLERANCE) {
    return { dx: 0, dy: 0, glide: glide.remaining > 0 ? createStackGlide() : glide };
  }

  const elapsed = Math.min(deltaSeconds, MAX_GLIDE_FRAME_SECONDS);
  const decay = Math.exp(-GLIDE_FRICTION * elapsed);
  const travelScale = (1 - decay) / GLIDE_FRICTION;
  let dx = glide.velocityX * travelScale;
  let dy = glide.velocityY * travelScale;
  const distance = Math.hypot(dx, dy);
  const scale = distance > glide.remaining ? glide.remaining / distance : 1;
  dx *= scale;
  dy *= scale;

  const remaining = Math.max(0, glide.remaining - distance * scale);
  const velocityX = glide.velocityX * decay;
  const velocityY = glide.velocityY * decay;
  const nextGlide = remaining <= TOLERANCE ||
    Math.hypot(velocityX, velocityY) <= MIN_GLIDE_SPEED
    ? createStackGlide()
    : { velocityX, velocityY, remaining };

  return { dx, dy, glide: nextGlide };
}

export function constrainStackCard<T extends StackBody>(body: T, bounds: StackBounds, slot?: StackBody): T {
  const left = bounds.left + body.halfWidth;
  const right = bounds.right - body.halfWidth;
  const bottom = bounds.bottom + body.halfHeight;
  const top = bounds.top - body.halfHeight;
  const x = clamp(body.x, left, right);
  const y = clamp(body.y, bottom, top);
  const result = { ...body, x, y };
  if (!slot) return result;

  const halfWidth = slot.halfWidth + body.halfWidth;
  const halfHeight = slot.halfHeight + body.halfHeight;
  if (Math.abs(x - slot.x) >= halfWidth || Math.abs(y - slot.y) >= halfHeight) return result;

  // Use the nearest available side of the slot's expanded footprint.
  const candidates = [
    { x, y: slot.y + halfHeight },
    { x, y: slot.y - halfHeight },
    { x: slot.x + halfWidth, y },
    { x: slot.x - halfWidth, y },
  ].filter((point) => point.x >= left && point.x <= right && point.y >= bottom && point.y <= top);
  candidates.sort((a, b) => Math.abs(a.x - x) + Math.abs(a.y - y) - Math.abs(b.x - x) - Math.abs(b.y - y));
  return { ...result, ...candidates[0] };
}

type Axis = 'x' | 'y';

function deeplyOverlaps(a: StackBody, b: StackBody) {
  return Math.abs(a.x - b.x) < (a.halfWidth + b.halfWidth) * DEEP_OVERLAP_RATIO - TOLERANCE &&
    Math.abs(a.y - b.y) < (a.halfHeight + b.halfHeight) * DEEP_OVERLAP_RATIO - TOLERANCE;
}

function releaseCrowdedCards<T extends StackBody>(
  result: T[], bounds: StackBounds, slot: StackBody, heldIndex: number,
) {
  const indices = result.map((_, index) => index).filter((index) => index !== heldIndex);
  if (heldIndex >= 0) indices.unshift(heldIndex);
  const settled: T[] = [];
  for (const index of indices) {
    const body = result[index];
    if (settled.some((neighbor) => deeplyOverlaps(body, neighbor))) {
      // Test the edges of the occupied rectangles as well as the slot and rim.
      // Their intersections contain the nearest corners of the open pockets.
      const xs = [body.x, bounds.left + body.halfWidth, bounds.right - body.halfWidth];
      const ys = [body.y, bounds.bottom + body.halfHeight, bounds.top - body.halfHeight];
      for (const neighbor of [slot, ...settled]) {
        const gapWidth = body.halfWidth + neighbor.halfWidth;
        const gapHeight = body.halfHeight + neighbor.halfHeight;
        const clearance = neighbor === slot ? 1 : DEEP_OVERLAP_RATIO;
        xs.push(neighbor.x - gapWidth * clearance, neighbor.x + gapWidth * clearance);
        ys.push(neighbor.y - gapHeight * clearance, neighbor.y + gapHeight * clearance);
      }
      let closest = Infinity;
      for (const x of xs) {
        for (const y of ys) {
          const distance = (x - body.x) ** 2 + (y - body.y) ** 2;
          if (distance >= closest) continue;
          const candidate = constrainStackCard({ ...body, x, y }, bounds, slot);
          if (candidate.x !== x || candidate.y !== y ||
              settled.some((neighbor) => deeplyOverlaps(candidate, neighbor))) continue;
          result[index] = candidate;
          closest = distance;
        }
      }
    }
    settled.push(result[index]);
  }
}

export function resolveStackCollisions<T extends StackBody>(
  bodies: readonly T[],
  bounds: StackBounds,
  slot: StackBody,
  heldIndex = -1,
  recoverCrowded = true,
  maxDisplacement = Infinity,
): T[] {
  const origins = bodies.map(({ x, y }) => ({ x, y }));
  const constrain = (body: T) => constrainStackCard(body, bounds, slot);
  const result = bodies.map(constrain);

  for (let pass = 0; pass < MAX_PASSES; pass++) {
    let moved = false;
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const a = result[i];
        const b = result[j];
        const width = (a.halfWidth + b.halfWidth) * CONTACT_RATIO;
        const height = (a.halfHeight + b.halfHeight) * CONTACT_RATIO;
        const overlapX = width - Math.abs(a.x - b.x);
        const overlapY = height - Math.abs(a.y - b.y);
        if (overlapX <= TOLERANCE || overlapY <= TOLERANCE) continue;

        // Pick the smallest separation, trying the other axis when an obstacle
        // or a rim absorbs the push. Transfer an absorbed push to the other card.
        const preferredX = a.anchor && b.anchor
          ? Math.abs(a.anchor.x - b.anchor.x) / width > Math.abs(a.anchor.y - b.anchor.y) / height
          : overlapX < overlapY;
        const axes: Axis[] = preferredX ? ['x', 'y'] : ['y', 'x'];
        let best: { a: T; b: T; cost: number } | undefined;
        for (const axis of axes) {
          const sign = (a.anchor ?? a)[axis] <= (b.anchor ?? b)[axis] ? -1 : 1;
          const gap = axis === 'x' ? width : height;
          const push = (body: T, delta: number) => constrain({ ...body, [axis]: body[axis] + delta });
          const distance = gap - (a[axis] - b[axis]) * sign;
          const weight = i === heldIndex ? 0 : j === heldIndex ? 1 : 0.5;
          let nextA = push(a, sign * distance * weight);
          const nextB = push(b, -sign * (gap - (nextA[axis] - b[axis]) * sign));
          const remainder = gap - (nextA[axis] - nextB[axis]) * sign;
          if (remainder > TOLERANCE && i !== heldIndex) nextA = push(nextA, sign * remainder);
          if ((i === heldIndex && (nextA.x !== a.x || nextA.y !== a.y)) ||
              (j === heldIndex && (nextB.x !== b.x || nextB.y !== b.y))) continue;
          if ((nextA[axis] - nextB[axis]) * sign < gap - TOLERANCE) continue;
          const costA = Math.abs(nextA.x - a.x) + Math.abs(nextA.y - a.y);
          const costB = Math.abs(nextB.x - b.x) + Math.abs(nextB.y - b.y);
          const cost = costA * (i === heldIndex ? 2 : 1) + costB * (j === heldIndex ? 2 : 1);
          if (!best || cost < best.cost) best = { a: nextA, b: nextB, cost };
          if (a.anchor && b.anchor) break;
        }
        if (!best) continue;
        result[i] = best.a;
        result[j] = best.b;
        moved = true;
      }
    }
    if (!moved) break;
  }
  if (recoverCrowded) releaseCrowdedCards(result, bounds, slot, heldIndex);
  if (Number.isFinite(maxDisplacement)) {
    for (let index = 0; index < result.length; index++) {
      if (index === heldIndex) continue;
      const origin = origins[index];
      const body = result[index];
      const dx = body.x - origin.x;
      const dy = body.y - origin.y;
      const distance = Math.hypot(dx, dy);
      if (distance <= maxDisplacement || distance === 0) continue;
      const ratio = maxDisplacement / distance;
      const limited = constrain({
        ...body,
        x: origin.x + dx * ratio,
        y: origin.y + dy * ratio,
      });
      result[index] = Math.hypot(limited.x - origin.x, limited.y - origin.y) <= maxDisplacement + TOLERANCE
        ? limited
        : { ...body, ...origin };
    }
  }
  return result;
}

export function moveStackCard<T extends StackBody>(
  bodies: readonly T[],
  heldIndex: number,
  target: Point,
  bounds: StackBounds,
  slot: StackBody,
): T[] {
  const held = bodies[heldIndex];
  if (!held) return [...bodies];
  const destination = constrainStackCard({ ...held, ...target }, bounds, slot);
  // Sweep the path, not just its endpoint. A fast pointer must still push the
  // cards it passes, and each substep starts from the last resolved positions.
  const stride = Math.min(held.halfWidth, held.halfHeight) / 2;
  const distance = Math.hypot(destination.x - held.x, destination.y - held.y);
  const steps = Math.max(1, Math.min(128, Math.ceil(distance / Math.max(stride, TOLERANCE))));
  const stepDistance = distance / steps;
  let result = [...bodies];
  for (let step = 1; step <= steps; step++) {
    result[heldIndex] = {
      ...held,
      x: held.x + (destination.x - held.x) * step / steps,
      y: held.y + (destination.y - held.y) * step / steps,
    };
    result = resolveStackCollisions(
      result, bounds, slot, heldIndex, false, stepDistance * DRAG_RESPONSE_RATIO,
    );
  }
  return result;
}
