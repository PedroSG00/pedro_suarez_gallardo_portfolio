'use client';

import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  href: string;
  target?: '_self' | '_blank';
  icon?: ReactNode;
  ariaLabel?: string;
};

export default function Link({
  children,
  href,
  target,
  icon,
  ariaLabel,
}: Props) {
  if (!children || href === undefined) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.trim() === '') {
      e.preventDefault();
      return;
    }
    if (target === '_blank') {
      e.preventDefault();
      window.open(href, '_blank');
    }
  };

  return (
    <a
      href={href}
      target={target}
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
      {children}
    </a>
  );
}
