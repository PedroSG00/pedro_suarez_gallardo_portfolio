'use client';

import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  grid?: boolean;
  id?: string;
  labelledBy?: string;
};

export default function Section({ children, grid = true, id, labelledBy }: Props) {
  if (!children) {
    return null;
  }

  return (
    <section id={id} aria-labelledby={labelledBy} className="section relative border-t-(length:--line-width) border-line">
      {grid && (
        <div
          data-testid="section-grid"
          aria-hidden="true"
          className="section-grid pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)`,
            backgroundSize: '2rem 2rem',
          }}
        />
      )}
      {children}
    </section>
  );
}
