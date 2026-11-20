'use client';

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

import styles from './SkipLink.module.css';

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
      className={styles.link}
    >
      {text}
    </a>
  );
}
