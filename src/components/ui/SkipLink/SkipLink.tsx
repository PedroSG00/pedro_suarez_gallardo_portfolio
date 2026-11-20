'use client';

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

type Props = {
  label?: string;
  href?: string;
};

export default function SkipLink({ label, href = '#main' }: Props) {
  const t = useTranslations('shared');
  const text = label ?? t('skipToContent');

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const targetId = href.slice(1);
      const target = document.getElementById(targetId);
      target?.focus();
    },
    [href],
  );

  if (!text) {
    return null;
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[calc(var(--nav-z)+1)] focus:bg-ink focus:px-4 focus:py-3 focus:text-surface"
    >
      {text}
    </a>
  );
}
