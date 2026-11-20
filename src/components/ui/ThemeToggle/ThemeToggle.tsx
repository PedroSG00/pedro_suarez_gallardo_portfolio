'use client';

import type { ReactNode } from 'react';

type Props = {
  onToggle: () => void;
  pressed: boolean;
  ariaLabel: string;
  icon?: ReactNode;
};

const SUN_ICON = (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="size-5"
  >
    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const MOON_ICON = (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="size-5"
  >
    <path
      d="M20.2 15.3A8.5 8.5 0 0 1 8.7 3.8 8.5 8.5 0 1 0 20.2 15.3Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
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
      data-theme-icon={pressed ? 'moon' : 'sun'}
      className={`
        inline-flex items-center justify-center
        size-11 border-(length:--line-width) border-line bg-surface text-ink
        hover:bg-ink hover:text-surface aria-pressed:bg-ink aria-pressed:text-surface
        transition-colors duration-(--duration-state)
      `}
    >
      {icon ?? (pressed ? MOON_ICON : SUN_ICON)}
    </button>
  );
}
