type ProjectionTarget = 0 | 1;

export function stackProjectionDuration(token: string): number {
  const match = /^([\d.]+)(ms|s)$/.exec(token.trim());
  if (!match) return 0;
  const duration = Number(match[1]) * (match[2] === 's' ? 1_000 : 1);
  return Number.isFinite(duration) ? duration : 0;
}

export function observeStackProjection(
  duration: () => number,
  draw: (progress: number) => void,
  initial: ProjectionTarget = 0,
) {
  const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let current: number = initial;
  let target = initial;
  let pending: number | null = null;

  function cancel() {
    if (pending !== null) window.cancelAnimationFrame(pending);
    pending = null;
  }

  function present(progress: number) {
    if (current === progress) return;
    current = progress;
    draw(progress);
  }

  function goTo(next: ProjectionTarget) {
    cancel();
    target = next;
    const from = current;
    const time = duration() * Math.abs(next - from);
    if (!time || preference?.matches || document.visibilityState !== 'visible') {
      present(next);
      return;
    }

    let start: number | undefined;
    function step(now: number) {
      pending = null;
      start ??= now;
      const elapsed = Math.min(1, (now - start) / time);
      const eased = elapsed * elapsed * (3 - 2 * elapsed);
      present(elapsed === 1 ? next : from + (next - from) * eased);
      if (elapsed < 1) pending = window.requestAnimationFrame(step);
    }
    pending = window.requestAnimationFrame(step);
  }

  function handleEnvironmentChange() {
    if (preference?.matches || document.visibilityState !== 'visible') {
      cancel();
      present(target);
    }
  }

  preference?.addEventListener('change', handleEnvironmentChange);
  document.addEventListener('visibilitychange', handleEnvironmentChange);
  return {
    goTo,
    dispose() {
      cancel();
      preference?.removeEventListener('change', handleEnvironmentChange);
      document.removeEventListener('visibilitychange', handleEnvironmentChange);
    },
  };
}
