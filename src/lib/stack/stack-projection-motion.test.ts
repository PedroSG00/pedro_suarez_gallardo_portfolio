import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { observeStackProjection, stackProjectionDuration } from '@/lib/stack/stack-projection-motion';

let frames: Map<number, FrameRequestCallback>;
let preference: EventTarget & { matches: boolean };
let id: number;

beforeEach(() => {
  frames = new Map();
  id = 0;
  preference = Object.assign(new EventTarget(), { matches: false });
  vi.stubGlobal('matchMedia', () => preference);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++id, callback);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function frame(time: number) {
  const pending = [...frames.values()];
  frames.clear();
  pending.forEach((callback) => callback(time));
}

test.each([['400ms', 400], ['0.4s', 400], ['0ms', 0], ['', 0]])(
  'reads the local duration token %j as %s ms',
  (token, milliseconds) => expect(stackProjectionDuration(token)).toBe(milliseconds),
);

test('passes through intermediate views and reverses from the current frame', () => {
  const render = vi.fn();
  const transition = observeStackProjection(() => 400, render);
  transition.goTo(1);
  expect(render).not.toHaveBeenCalled();
  frame(100);
  frame(300);
  expect(render).toHaveBeenLastCalledWith(0.5);
  transition.goTo(0);
  frame(340);
  expect(render).toHaveBeenLastCalledWith(0.5);
  frame(440);
  expect(render).toHaveBeenLastCalledWith(0.25);
  frame(540);
  expect(render).toHaveBeenLastCalledWith(0);
  expect(frames.size).toBe(0);
  transition.dispose();
});

test('skips frames under reduced motion, including a preference change in flight', () => {
  const render = vi.fn();
  const transition = observeStackProjection(() => 400, render);
  transition.goTo(1);
  frame(100);
  frame(200);
  preference.matches = true;
  preference.dispatchEvent(new Event('change'));
  expect(render).toHaveBeenLastCalledWith(1);
  expect(frames.size).toBe(0);
  transition.goTo(0);
  expect(render).toHaveBeenLastCalledWith(0);
  expect(frames.size).toBe(0);
  transition.dispose();
});

test('clears pending frames on dispose and settles immediately when the tab is hidden', () => {
  const render = vi.fn();
  const transition = observeStackProjection(() => 400, render);
  transition.goTo(1);
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
  document.dispatchEvent(new Event('visibilitychange'));
  expect(render).toHaveBeenLastCalledWith(1);
  expect(frames.size).toBe(0);
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  transition.goTo(0);
  expect(frames.size).toBe(1);
  transition.dispose();
  expect(frames.size).toBe(0);
  expect(render).toHaveBeenCalledOnce();
});
