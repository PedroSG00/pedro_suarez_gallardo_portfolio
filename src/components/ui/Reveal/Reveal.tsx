'use client';

import type { AriaRole, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import styles from './Reveal.module.css';

type RevealProps = {
  children: ReactNode;
  role?: AriaRole;
  'aria-label'?: string;
  isLastSection?: boolean;
  isExcluded?: boolean;
};

const FORCED_VISIBLE_STYLE: React.CSSProperties = {
  opacity: 1,
  transform: 'none',
};

export default function Reveal({
  children,
  role,
  'aria-label': ariaLabel,
  isLastSection = false,
  isExcluded = false,
}: RevealProps) {
  const revealRef = useRef<HTMLDivElement>(null);
  const [isShortPage, setIsShortPage] = useState(false);
  const [hasFixedOrStickyDescendant, setHasFixedOrStickyDescendant] = useState(false);
  const [geometry, setGeometry] = useState({ isInExitPhase: false, isAtPageEnd: false });

  useEffect(() => {
    if (isExcluded) {
      return;
    }

    const node = revealRef.current!;
    const hasFixedOrSticky = Array.from(node.querySelectorAll<HTMLElement>('*')).some(
      (descendant) => {
        const { position } = window.getComputedStyle(descendant);
        return position === 'fixed' || position === 'sticky';
      },
    );
    setHasFixedOrStickyDescendant(hasFixedOrSticky);

    const check = (): void => {
      const scrollHeight = document.documentElement.scrollHeight;
      const innerHeight = window.innerHeight;
      const scrollY = window.scrollY;

      setIsShortPage(scrollHeight <= innerHeight);

      const isAtPageEnd = scrollY + innerHeight >= scrollHeight - 1;

      // rect.bottom is viewport-relative, so the threshold must be too.
      const rect = revealRef.current!.getBoundingClientRect();
      const isInExitPhase = rect.bottom <= innerHeight * 0.25;

      setGeometry({ isInExitPhase, isAtPageEnd });
    };

    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('scrollend', check);
    window.addEventListener('resize', check, { passive: true });

    // Text zoom and reflow change the page size without a window resize, so the
    // overrides must follow the layout to avoid a permanently stuck state.
    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(check);
    resizeObserver?.observe(document.documentElement);

    return (): void => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('scrollend', check);
      window.removeEventListener('resize', check);
      resizeObserver?.disconnect();
    };
  }, [isExcluded, isLastSection]);

  const forceVisible =
    isExcluded ||
    hasFixedOrStickyDescendant ||
    isShortPage ||
    (isLastSection && (geometry.isInExitPhase || geometry.isAtPageEnd));

  const inlineStyle: React.CSSProperties = forceVisible ? FORCED_VISIBLE_STYLE : {};

  return (
    <div
      ref={revealRef}
      className={isExcluded ? styles.excluded : styles.reveal}
      data-reveal-root={isExcluded ? undefined : ''}
      role={role}
      aria-label={ariaLabel}
      style={inlineStyle}
    >
      {!isExcluded && (
        <>
          <span data-reveal-entry-marker aria-hidden="true" />
          <span data-reveal-exit-marker aria-hidden="true" />
        </>
      )}
      {children}
    </div>
  );
}
