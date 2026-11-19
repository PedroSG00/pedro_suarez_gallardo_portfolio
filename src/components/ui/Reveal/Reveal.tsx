'use client';

import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

function supportsScrollTimeline(): boolean {
  return typeof CSS !== 'undefined' && CSS.supports('animation-timeline', 'view()');
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function isPrinting(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('print').matches
  );
}

export default function Reveal({ children }: Props) {
  const isFallback =
    !supportsScrollTimeline() || prefersReducedMotion() || isPrinting();

  const viewportHeight = window.innerHeight;
  const scrollY = window.scrollY;

  const element = document.createElement('div');
  const rect = element.getBoundingClientRect();

  const style: React.CSSProperties = {};

  if (isFallback || viewportHeight === 0) {
    style.opacity = 1;
    style.transform = 'none';
  } else {
    const blockTop = rect.top + scrollY;
    const blockBottom = rect.bottom + scrollY;

    const entryThreshold = scrollY + viewportHeight * 0.75;
    const exitThreshold = scrollY + viewportHeight * 0.25;

    if (blockTop >= entryThreshold) {
      // Entrada: borde superior en el cuarto inferior de la pantalla
      const progress = Math.min(1, (blockTop - entryThreshold) / (viewportHeight * 0.25));
      style.opacity = String(1 - progress);
      style.transform = `translateY(${20 * (1 - progress)}px)`;
    } else if (blockBottom <= exitThreshold) {
      // Salida: borde inferior en el cuarto superior de la pantalla
      const progress = Math.min(1, (exitThreshold - blockBottom) / (viewportHeight * 0.25));
      style.opacity = String(1 - progress);
      style.transform = `translateY(${-20 * (1 - progress)}px)`;
    } else {
      // Estable
      style.opacity = 1;
      style.transform = 'none';
    }
  }

  return <div style={style}>{children}</div>;
}
