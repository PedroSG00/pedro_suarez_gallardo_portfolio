'use client';

import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  href: string;
  target?: '_self' | '_blank';
  icon?: ReactNode;
  ariaLabel?: string;
  srLabel?: string;
};

export default function Link({
  children,
  href,
  target,
  icon,
  ariaLabel,
  srLabel,
}: Props) {
  if (!children || href === undefined) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.trim() === '') {
      e.preventDefault();
      return;
    }
  };

  return (
    <a
      href={href}
      target={target}
      rel={target === '_blank' ? 'noreferrer noopener' : undefined}
      onClick={handleClick}
      aria-label={ariaLabel}
      className={`
        inline-flex items-center gap-2
        bg-[var(--color-surface)] text-[var(--color-ink)]
        border [var(--line-width)] solid [var(--color-line)]
        px-4 py-2
        font-mono text-sm font-[var(--font-weight-regular)]
        transition-colors duration-[var(--duration-state)]
        hover:bg-[var(--color-ink)] hover:text-[var(--color-surface)]
      `}
    >
      {icon}
      {children} {target === '_blank' && srLabel ? (
        <span className="sr-only">{srLabel}</span>
      ) : null}
    </a>
  );
}
