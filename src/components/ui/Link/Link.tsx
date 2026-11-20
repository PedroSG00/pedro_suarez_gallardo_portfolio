'use client';

import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  href: string;
  target?: '_self' | '_blank';
  icon?: ReactNode;
  ariaLabel?: string;
  srLabel?: string;
  tone?: 'primary' | 'default';
};

export default function Link({
  children,
  href,
  target,
  icon,
  ariaLabel,
  srLabel,
  tone = 'default',
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
        inline-flex min-h-11 items-center gap-2 border-(length:--line-width) border-line px-4 py-2
        font-mono text-meta transition-colors duration-(--duration-state)
        ${tone === 'primary'
          ? 'bg-ink font-emphasis text-surface hover:bg-surface hover:text-ink'
          : 'bg-surface text-ink hover:bg-ink hover:text-surface'}
      `}
    >
      {icon}
      {children} {target === '_blank' && srLabel ? (
        <span className="sr-only">{srLabel}</span>
      ) : null}
    </a>
  );
}
