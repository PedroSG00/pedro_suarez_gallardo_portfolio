'use client';

import type { ReactNode } from 'react';

type Props = {
  onToggle: () => void;
  pressed: boolean;
  ariaLabel: string;
  icon?: ReactNode;
};

const DEFAULT_ICON = (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    style={{ color: 'currentColor' }}
  >
    <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" />
  </svg>
);

export default function ThemeToggle({
  onToggle,
  pressed,
  ariaLabel,
  icon,
}: Props) {
  if (!onToggle || pressed === undefined || !ariaLabel) {
    return null;
  }

  const handleClick = () => {
    onToggle();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-pressed={pressed}
      aria-label={ariaLabel}
      className={`
        inline-flex items-center justify-center
        bg-[var(--color-surface)] text-[var(--color-ink)]
        border [var(--line-width)] solid [var(--color-line)]
        w-10 h-10 rounded-full
        transition-colors duration-[var(--duration-state)]
        focus-visible:outline-none
      `}
    >
      {icon ?? DEFAULT_ICON}
    </button>
  );
}
