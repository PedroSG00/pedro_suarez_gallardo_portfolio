'use client';

import type { AriaRole, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import styles from './Reveal.module.css';

type RevealProps = {
  children: ReactNode;
  role?: AriaRole;
  'aria-label'?: string;
};

export default function Reveal({ children, role, 'aria-label': ariaLabel }: RevealProps) {
  const [isShortPage, setIsShortPage] = useState(false);

  useEffect(() => {
    const checkShortPage = (): void => {
      setIsShortPage(document.documentElement.scrollHeight <= window.innerHeight);
    };

    checkShortPage();
    window.addEventListener('resize', checkShortPage);

    return (): void => {
      window.removeEventListener('resize', checkShortPage);
    };
  }, []);

  const inlineStyle: React.CSSProperties = isShortPage
    ? { opacity: 1, transform: 'none' }
    : {};

  return (
    <div
      className={styles.reveal}
      data-reveal-root
      role={role}
      aria-label={ariaLabel}
      style={inlineStyle}
    >
      <span data-reveal-entry-marker aria-hidden="true" />
      <span data-reveal-exit-marker aria-hidden="true" />
      {children}
    </div>
  );
}
