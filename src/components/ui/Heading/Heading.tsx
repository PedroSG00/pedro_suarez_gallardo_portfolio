'use client';

import React from 'react';
import type { ReactNode } from 'react';

type Level = 1 | 2 | 3 | 4 | 5 | 6;

type Props = {
  children: ReactNode;
  level?: Level;
};

const SIZE_TOKENS: Record<Level, string> = {
  1: 'text-[var(--text-display)] leading-[var(--text-display--line-height)] tracking-[var(--text-display--letter-spacing)] font-[var(--text-display--font-weight)]',
  2: 'text-[var(--text-title-lg)] leading-[var(--text-title-lg--line-height)] tracking-[var(--text-title-lg--letter-spacing)] font-[var(--text-title-lg--font-weight)]',
  3: 'text-[var(--text-title)] leading-[var(--text-title--line-height)] tracking-[var(--text-title--letter-spacing)] font-[var(--text-title--font-weight)]',
  4: 'text-[var(--text-body)] leading-[var(--text-body--line-height)] tracking-[var(--text-body--letter-spacing)] font-[var(--text-body--font-weight)]',
  5: 'text-[var(--text-body)] leading-[var(--text-body--line-height)] tracking-[var(--text-body--letter-spacing)] font-[var(--text-body--font-weight)]',
  6: 'text-[var(--text-meta)] leading-[var(--text-meta--line-height)] tracking-[var(--text-meta--letter-spacing)] font-[var(--text-meta--font-weight)]',
};

export default function Heading({
  children,
  level = 2,
}: Props) {
  if (!children) {
    return null;
  }

  const Tag = `h${level}` as const;

  return React.createElement(Tag, {
    className: `font-mono ${SIZE_TOKENS[level]}`,
  }, children);
}
