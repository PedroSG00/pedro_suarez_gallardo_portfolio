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
 * T21: when a destination targets this heading, the title receives focus with
 * `focus({ preventScroll: true })` so it becomes `document.activeElement`
 * without duplicating the anchor's native scroll. Covered paths: a
 * `hashchange` (selecting the destination), a click on the fragment link
 * (including re-activating the current hash, which fires no `hashchange`),
 * and landing directly on the hash from a reload or another page.
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
    const heading = ref.current;
    if (!heading) return;

    const targetHash = `#${id}`;

    /** Focuses the title without scrolling: the browser already jumped (RF-3). */
    const focusHeading = () => heading.focus({ preventScroll: true });

    // A page loaded straight on the anchor has no `hashchange` to react to,
    // so the title is focused on mount (RF-3, RF-5).
    if (window.location.hash === targetHash) focusHeading();

    const handleHashChange = () => {
      if (window.location.hash === targetHash) focusHeading();
    };

    // Destinations are native fragment links, so their click sets the hash
    // natively. Observing the click also covers selecting the hash that is
    // already current (no `hashchange`) and never prevents the native
    // navigation, scroll or history (RF-3, RF-8).
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const clicked = event.target instanceof Element ? event.target : null;
      const link = clicked?.closest<HTMLAnchorElement>('a[href]');
      if (link?.getAttribute('href') === targetHash) focusHeading();
    };

    window.addEventListener('hashchange', handleHashChange);
    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      document.removeEventListener('click', handleClick);
    };
  }, [id]);

  return (
    <h2 ref={ref} id={id} tabIndex={-1} style={{ scrollMarginTop: 'var(--header-height, 64px)' }}>
      {children}
    </h2>
  );
}
