/**
 * SectionAnchor.tsx — T17, T21 (RF-3, RF-5, RF-8)
 *
 * Section heading that doubles as a scroll anchor. Receives its content by
 * props (Constitution 3): no visible text or data is written in the
 * component. Renders an `<h2>` with an `id` so it can be linked to, made
 * focusable with `tabindex="-1"` so the title can receive focus after an
 * anchor jump, and `scroll-margin-top` so the title lands below the header.
 * No button or link is added inside.
 *
 * T21: listens for hashchange events; when the hash matches its id, focuses
 * the heading with `focus({ preventScroll: true })` so the title becomes
 * `document.activeElement` without duplicating the anchor's scroll.
 */

'use client';

import { useEffect, useRef } from 'react';

export function SectionAnchor({
  id,
  children,
}: {
  /** Anchor id used by in-page links and hash navigation. */
  id: string;
  /** Heading text, provided by the parent (dictionary resolved). */
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === `#${id}`) {
        ref.current?.focus({ preventScroll: true });
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [id]);

  return (
    <h2 ref={ref} id={id} tabIndex={-1} style={{ scrollMarginTop: 'var(--header-height, 64px)' }}>
      {children}
    </h2>
  );
}
