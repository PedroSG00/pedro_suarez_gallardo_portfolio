'use client';

import { useEffect } from 'react';
import type { SectionId } from '@/content/sections';
import { resolveAnchorTarget } from '@/lib/anchor-target';

type Props = {
  sectionIds: SectionId[];
};

/**
 * Moves the focus to the heading of the section targeted by the hash when the
 * component mounts and on every `hashchange` (RF-13).
 *
 * It renders no visible markup. When the resolution is `valid` it focuses the
 * `[data-section-heading]` inside the destination section with
 * `preventScroll: true`, so the browser's `scroll-padding-top` performs the
 * scroll and the focus does not scroll again. Empty, unknown or heading-less
 * targets do nothing and never throw.
 */
export default function AnchorFocus({ sectionIds }: Props) {
  useEffect(() => {
    const focusAnchoredHeading = () => {
      const { targetId, reason } = resolveAnchorTarget(
        window.location.hash,
        sectionIds
      );

      if (reason !== 'valid' || !targetId) {
        return;
      }

      const section = document.getElementById(targetId);
      if (!section) {
        return;
      }

      const heading = section.querySelector(
        '[data-section-heading]'
      ) as HTMLElement | null;
      if (!heading) {
        return;
      }

      heading.focus({ preventScroll: true });
    };

    focusAnchoredHeading();
    window.addEventListener('hashchange', focusAnchoredHeading);
    return () => window.removeEventListener('hashchange', focusAnchoredHeading);
  }, [sectionIds]);

  return null;
}
