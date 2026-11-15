/**
 * PrimaryNav.tsx — T9 (RF-1, RF-5, RF-8)
 * Wide navigation: renders the destinations from DESTINATIONS as a list of
 * links, in menu order, marking the active destination without relying on
 * color alone.
 *
 * All visible text comes from props (Constitution 3 / RF-8): the parent
 * resolves labels from the dictionary. `pathname` is received as a prop so
 * the component stays pure and testable without mocking the router.
 *
 * Active rule: Projects is the only destination that can be active here,
 * and only when the route is `/projects` or `/projects/<slug>` (RF-5).
 */

import Link from 'next/link';
import { DESTINATIONS, type DestinationId } from '../../../navigation/destinations';

interface PrimaryNavProps {
  /** Accessible name of the navigation landmark. */
  navLabel: string;
  /** Visible label of each destination in the active language. */
  labels: Record<DestinationId, string>;
  /** Active locale, used to build the home link href. */
  locale: string;
  /** Current pathname (e.g. `/projects` or `/projects/slug`). */
  pathname: string;
  /** Non-chromatic mark shown on the active destination (default: block). */
  activeMark?: string;
}

const DEFAULT_ACTIVE_MARK = '▪';

/** Returns true when Projects is the current destination (RF-5). */
function isProjectsActive(pathname: string): boolean {
  return pathname === '/projects' || pathname.startsWith('/projects/');
}

export function PrimaryNav({
  navLabel,
  labels,
  locale,
  pathname,
  activeMark = DEFAULT_ACTIVE_MARK,
}: PrimaryNavProps) {
  const activeId: DestinationId | null = isProjectsActive(pathname)
    ? 'projects'
    : null;

  return (
    <nav aria-label={navLabel}>
      <ul>
        {DESTINATIONS.map((dest) => {
          const active = dest.id === activeId;
          const ariaCurrent = active ? true : undefined;
          const isHome = dest.id === 'home';
          const activeMarkEl = active ? (
            <span aria-hidden="true" data-testid="active-mark">
              {activeMark}
            </span>
          ) : null;

          if (isHome) {
            // Next.js <Link> for internal navigation: client-side, no reload.
            return (
              <li key={dest.id}>
                <Link href={`/${locale}`} prefetch={false} aria-current={ariaCurrent}>
                  {activeMarkEl}
                  {labels[dest.id]}
                </Link>
              </li>
            );
          }
          // Section anchors: native scroll, no page reload.
          return (
            <li key={dest.id}>
              <a href={`#${dest.sectionId}`} aria-current={ariaCurrent}>
                {activeMarkEl}
                {labels[dest.id]}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
