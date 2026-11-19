'use client';

import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  ariaLabel?: string;
};

export default function Button({
  children,
  onClick,
  disabled = false,
  icon,
  ariaLabel,
}: Props) {
  if (!children || !onClick) {
    return null;
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      className={`
        inline-flex items-center justify-center gap-2
        bg-[var(--color-surface)] text-[var(--color-ink)]
        border [var(--line-width)] solid [var(--color-line)]
        px-4 py-2
        font-mono text-sm font-[var(--font-weight-regular)]
        transition-colors duration-[var(--duration-state)]
        hover:bg-[var(--color-ink)] hover:text-[var(--color-surface)]
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {icon}
      {children}
    </button>
  );
}
