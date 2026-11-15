/**
 * NavDisclosure.tsx — T11 (RF-2, RF-8)
 * Narrow navigation grouped in a native <details>/<summary> without expelling
 * the brand or the controls. JavaScript only adds closing behavior through
 * use-disclosure (Escape, click outside, selection); it never opens, never
 * traps focus, and never moves focus.
 *
 * All visible text comes from props (Constitution 3 / RF-8): the parent
 * resolves labels from the dictionary. The same single DOM renders the links
 * in wide and narrow; CSS forces <details> open at >=1024 px.
 */

'use client';

import { useDisclosure } from '../hooks/use-disclosure';
import { PrimaryNav } from './PrimaryNav';
import type { DestinationId } from '../../../navigation/destinations';

interface NavDisclosureProps {
  /** Accessible name of the navigation landmark. */
  navLabel: string;
  /** Visible label of each destination in the active language. */
  labels: Record<DestinationId, string>;
  /** Active locale, used to build the home link href. */
  locale: string;
  /** Current pathname (e.g. `/projects` or `/projects/<slug>`). */
  pathname: string;
  /** Visible label of the summary / menu trigger. */
  menuLabel: string;
}

export function NavDisclosure({
  navLabel,
  labels,
  locale,
  pathname,
  menuLabel,
}: NavDisclosureProps) {
  const { open, openIt, close, containerRef } = useDisclosure();

  return (
    <details
      ref={containerRef}
      data-testid="nav-disclosure"
      open={open}
    >
      <summary onClick={openIt}>{menuLabel}</summary>
      <div onClick={close}>
        <PrimaryNav
          navLabel={navLabel}
          labels={labels}
          locale={locale}
          pathname={pathname}
          activeMark="▪"
        />
      </div>
    </details>
  );
}
