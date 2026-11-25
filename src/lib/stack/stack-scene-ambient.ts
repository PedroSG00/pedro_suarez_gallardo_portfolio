export type AmbientMotionHandle = {
  dispose: () => void;
};

const AMBIENT_FRAME_INTERVAL = 1000 / 60;

export function observeStackSceneMotion(
  host: HTMLElement,
  restoreRest: () => void,
  animate: (time: number) => void,
): AmbientMotionHandle {
  const motionQuery =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
  let isReducedMotion = motionQuery?.matches ?? false;
  let isInViewport = typeof IntersectionObserver === 'undefined';
  let isPageVisible = document.visibilityState === 'visible';
  let isDisposed = false;
  let frameId: number | null = null;
  let lastFrameAt: number | null = null;
  let elapsed = 0;

  const canAnimate = () =>
    !isDisposed && !isReducedMotion && isInViewport && isPageVisible;
  const stopAmbientLoop = () => {
    lastFrameAt = null;
    if (frameId === null) return;
    window.cancelAnimationFrame(frameId);
    frameId = null;
  };
  const requestAmbientFrame = () => {
    if (!canAnimate() || frameId !== null) return;
    frameId = window.requestAnimationFrame((time) => {
      frameId = null;
      if (!canAnimate()) return;
      if (lastFrameAt === null) {
        lastFrameAt = time;
      } else if (time - lastFrameAt >= AMBIENT_FRAME_INTERVAL) {
        elapsed += Math.min(time - lastFrameAt, 2 * AMBIENT_FRAME_INTERVAL);
        animate(elapsed);
        lastFrameAt = time;
      }
      requestAmbientFrame();
    });
  };
  const syncAmbientLoop = () => {
    if (canAnimate()) requestAmbientFrame();
    else stopAmbientLoop();
  };

  const handleVisibilityChange = () => {
    isPageVisible = document.visibilityState === 'visible';
    syncAmbientLoop();
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  const handleMotionChange = (event: MediaQueryListEvent) => {
    isReducedMotion = event.matches;
    syncAmbientLoop();
    if (isReducedMotion) {
      elapsed = 0;
      restoreRest();
    }
  };
  if (motionQuery?.addEventListener) {
    motionQuery.addEventListener('change', handleMotionChange);
  } else {
    motionQuery?.addListener(handleMotionChange);
  }

  let intersectionObserver: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== 'undefined') {
    intersectionObserver = new IntersectionObserver((entries) => {
      if (entries.length) isInViewport = entries.some((entry) => entry.isIntersecting);
      syncAmbientLoop();
    });
    intersectionObserver.observe(host);
  }
  syncAmbientLoop();

  return {
    dispose: () => {
      if (isDisposed) return;
      isDisposed = true;
      stopAmbientLoop();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (motionQuery?.removeEventListener) {
        motionQuery.removeEventListener('change', handleMotionChange);
      } else {
        motionQuery?.removeListener(handleMotionChange);
      }
      intersectionObserver?.disconnect();
    },
  };
}
