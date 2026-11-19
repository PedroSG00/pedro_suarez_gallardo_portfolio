'use client';

import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function Reveal({ children }: Props) {
  const supportsScrollTimeline =
    typeof CSS !== 'undefined' && CSS.supports('animation-timeline', 'view()');
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isPrinting =
    typeof window !== 'undefined' && window.matchMedia('print').matches;

  const isFallback = !supportsScrollTimeline || prefersReducedMotion || isPrinting;

  const style: React.CSSProperties = {};
  if (isFallback) {
    style.opacity = 1;
    style.transform = 'none';
  }

  return <div style={style}>{children}</div>;
}
