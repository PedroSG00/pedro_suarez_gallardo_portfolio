'use client';

type Props = {
  children: string;
};

export default function Tag({ children }: Props) {
  if (!children) {
    return null;
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1
        font-mono text-[var(--text-meta)] leading-[var(--text-meta--line-height)]
        tracking-[var(--text-meta--letter-spacing)] font-[var(--text-meta--font-weight)]
        border [var(--line-width)] solid [var(--color-line)]
        px-2 py-1
        bg-[var(--color-surface)] text-[var(--color-ink)]
        rounded-sm
      `}
    >
      {children}
    </span>
  );
}
