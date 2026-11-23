import { expect, test, vi } from 'vitest';
import { bindStackDrag } from '@/components/sections/Stack/stack-drag';

function createGesture() {
  const canvas = document.createElement('canvas');
  const actions = {
    pick: vi.fn(() => 'React'),
    move: vi.fn(),
    drop: vi.fn(),
    select: vi.fn(),
    reset: vi.fn(),
  };
  const binding = bindStackDrag(canvas, actions);
  const send = (type: string, options: PointerEventInit = {}) => canvas.dispatchEvent(
    new PointerEvent(type, { pointerId: 1, isPrimary: true, ...options }),
  );
  return { actions, binding, send };
}

test.each([
  { movement: 5, action: 'select', not: 'drop' },
  { movement: 6, action: 'drop', not: 'select' },
] as const)('at $movement CSS pixels the gesture ends with $action', ({ movement, action, not }) => {
  const { actions, binding, send } = createGesture();
  send('pointerdown');
  send('pointerup', { clientX: movement });
  expect(actions[action]).toHaveBeenCalledOnce();
  expect(actions[not]).not.toHaveBeenCalled();
  binding.dispose();
});

test('ignores secondary input, and capture loss restores the card without selection or drop', () => {
  const { actions, binding, send } = createGesture();
  send('pointerdown', { button: 2 });
  send('pointerdown', { pointerId: 2, isPrimary: false });
  expect(actions.pick).not.toHaveBeenCalled();

  send('pointerdown');
  send('pointermove', { pointerId: 2, clientX: 50 });
  expect(actions.move).not.toHaveBeenCalled();
  send('pointermove', { clientX: 10 });
  expect(actions.move).toHaveBeenCalledOnce();
  send('lostpointercapture');
  send('pointerup', { clientX: 10 });
  expect(actions.reset).toHaveBeenCalledWith('React');
  expect(actions.drop).not.toHaveBeenCalled();
  expect(actions.select).not.toHaveBeenCalled();

  binding.dispose();
  send('pointerdown');
  expect(actions.pick).toHaveBeenCalledOnce();
});
