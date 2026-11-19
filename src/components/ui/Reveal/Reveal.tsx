'use client';

import type { AriaRole, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import styles from './Reveal.module.css';

type RevealProps = {
  children: ReactNode;
  role?: AriaRole;
  'aria-label'?: string;
  isLastSection?: boolean;
};

export default function Reveal({ children, role, 'aria-label': ariaLabel, isLastSection = false }: RevealProps) {
  const revealRef = useRef<HTMLDivElement>(null);
  const [isShortPage, setIsShortPage] = useState(false);
  const [geometry, setGeometry] = useState<{ isInExitPhase: boolean; isAtPageEnd: boolean }>({
    isInExitPhase: false,
    isAtPageEnd: false,
  });

  useEffect(() => {
    const check = (): void => {
      const scrollHeight = document.documentElement.scrollHeight;
      const innerHeight = window.innerHeight;
      const scrollY = window.scrollY;

      setIsShortPage(scrollHeight <= innerHeight);

      const isAtPageEnd = scrollY + innerHeight >= scrollHeight - 1;

      let isInExitPhase = false;
      const rect = revealRef.current!.getBoundingClientRect();
      // rect.bottom is viewport-relative, so the threshold must be too.
      const exitThreshold = innerHeight * 0.25;
      isInExitPhase = rect.bottom <= exitThreshold;

      setGeometry({ isInExitPhase, isAtPageEnd });
    };

    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('scrollend', check);
    window.addEventListener('resize', check, { passive: true });

    return (): void => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('scrollend', check);
      window.removeEventListener('resize', check);
    };
  }, [isLastSection]);

  const forceVisible = isShortPage || (isLastSection && (geometry.isInExitPhase || geometry.isAtPageEnd));

  const inlineStyle: React.CSSProperties = forceVisible
    ? { opacity: 1, transform: 'none' }
    : {};

  return (
    <div
      ref={revealRef}
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
