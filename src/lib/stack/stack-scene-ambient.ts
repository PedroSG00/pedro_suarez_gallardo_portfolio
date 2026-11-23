type AmbientMotionHandle = {
  dispose: () => void;
};

const AMBIENT_FRAME_INTERVAL = 1000 / 30;

export function observeStackSceneMotion(
  host: HTMLElement,
  render: () => void,
  animate: (time: number) => void,
): AmbientMotionHandle {
  const motionQuery =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
  let isReducedMotion = motionQuery?.matches ?? false;
  let isInViewport = true;
  let isPageVisible = document.visibilityState === 'visible';
  let isDisposed = false;
  let frameId: number | null = null;
  let lastFrameAt = 0;

  const canAnimate = () =>
    !isDisposed && !isReducedMotion && isInViewport && isPageVisible;
  const stopAmbientLoop = () => {
    if (frameId === null) return;
    window.cancelAnimationFrame(frameId);
    frameId = null;
  };
  const requestAmbientFrame = () => {
    if (!canAnimate() || frameId !== null) return;
    frameId = window.requestAnimationFrame((time) => {
      frameId = null;
      if (!canAnimate()) return;
      if (time - lastFrameAt >= AMBIENT_FRAME_INTERVAL) {
        animate(time);
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
    render();
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  const handleMotionChange = (event: MediaQueryListEvent) => {
    isReducedMotion = event.matches;
    syncAmbientLoop();
    render();
  };
  if (motionQuery?.addEventListener) {
    motionQuery.addEventListener('change', handleMotionChange);
  } else {
    motionQuery?.addListener(handleMotionChange);
  }

  let intersectionObserver: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== 'undefined') {
    intersectionObserver = new IntersectionObserver((entries) => {
      isInViewport = entries[0]?.isIntersecting ?? isInViewport;
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
