'use client';

import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  grid?: boolean;
};

export default function Section({ children, grid = true }: Props) {
  if (!children) {
    return null;
  }

  return (
    <section className="relative section">
      {grid && (
        <div
          data-testid="section-grid"
          className="absolute inset-0 pointer-events-none section-grid"
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
