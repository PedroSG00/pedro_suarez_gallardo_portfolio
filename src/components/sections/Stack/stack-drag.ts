const DRAG_THRESHOLD = 6;

type DragActions<T> = {
  pick: (event: PointerEvent) => T | null;
  move: (target: T, event: PointerEvent) => void;
  drop: (target: T, event: PointerEvent) => void;
  select: (target: T) => void;
  reset: (target: T) => void;
};

export function bindStackDrag<T>(canvas: HTMLCanvasElement, actions: DragActions<T>) {
  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  let active: { target: T; start: PointerEvent; dragging: boolean } | null = null;

  function clear() {
    const gesture = active;
    if (!gesture) return null;
    active = null;
    canvas.dataset.stackDragging = 'false';
    const { pointerId } = gesture.start;
    if (canvas.hasPointerCapture?.(pointerId)) canvas.releasePointerCapture(pointerId);
    return gesture;
  }

  function cancel() {
    const gesture = clear();
    if (gesture?.dragging) actions.reset(gesture.target);
  }

  function track(event: PointerEvent) {
    if (!active || active.start.pointerId !== event.pointerId) return;
    const { start } = active;
    if (!active.dragging) {
      if (Math.hypot(event.clientX - start.clientX, event.clientY - start.clientY) < DRAG_THRESHOLD) return;
      active.dragging = true;
      canvas.dataset.stackDragging = 'true';
    }
    actions.move(active.target, event);
  }

  canvas.addEventListener('pointerdown', (event) => {
    if (active || !event.isPrimary || event.button !== 0) return;
    const target = actions.pick(event);
    if (!target) return;
    active = { target, start: event, dragging: false };
    canvas.setPointerCapture?.(event.pointerId);
  }, options);
  // Touch-action stays scrollable on the canvas. Only a touch that grabbed a
  // card suppresses native panning; changing touch-action mid-gesture is too late.
  canvas.addEventListener('touchstart', (event) => {
    if (active?.start.pointerType === 'touch' && event.cancelable) event.preventDefault();
  }, { ...options, passive: false });
  canvas.addEventListener('pointermove', track, options);
  canvas.addEventListener('pointerup', (event) => {
    if (active?.start.pointerId !== event.pointerId) return;
    track(event);
    const gesture = clear();
    if (!gesture) return;
    if (gesture.dragging) actions.drop(gesture.target, event);
    else actions.select(gesture.target);
  }, options);
  for (const type of ['pointercancel', 'lostpointercapture'] as const) {
    canvas.addEventListener(type, (event) => {
      if (active?.start.pointerId === event.pointerId) cancel();
    }, options);
  }

  return {
    target: () => active?.target,
    cancel,
    dispose: () => {
      listeners.abort();
      cancel();
    },
  };
}
