/**
 * header-streak.ts — T6 (RF-2, RF-3, RF-4, RF-5, RF-8, RNF-4)
 * Header continuity streak: counts how many consecutive header-cases produce
 * exactly one header state and one active destination, without shifting
 * content and without skipping the guards (focus, open panel, reduced motion,
 * no JavaScript). A failure resets the streak and names the failing case.
 *
 * Consumes the same pure reducer (`applyEvent`) and the same pure active
 * destination function (`activeDestination`) used by the client, so the streak
 * tests the real behaviour, not a copy (Constitution 4).
 */

import { applyEvent, initialState, measure } from '../../app/components/SiteHeader/header-shift';
import { activeDestination } from '../../app/navigation/active-destination';
import type { HeaderShiftEvent } from '../../app/components/SiteHeader/header-shift';
import type { DestinationId } from '../../app/navigation/destinations';

export type Section = {
  id: DestinationId;
  /** Offset of the section heading from the start of the document (px). */
  top: number;
};

export type StreakCase = {
  id: string;
  events: HeaderShiftEvent[];
  headerHeight: number;
  sections: readonly Section[];
  expected: {
    offset: number;
    visible: boolean;
    activeId: DestinationId;
    contentShiftPx: number;
  };
};

export type StreakResult = {
  currentStreak: number;
  maxStreak: number;
  failedCases: string[];
  firstFailure: string | null;
};

/**
 * Calculates the header continuity streak over a list of cases.
 *
 * For each case, every event is applied through the pure `applyEvent`
 * reducer, then the observable state is measured and compared against the
 * expected values. The active destination is computed with `activeDestination`
 * using the final scroll position and header height.
 *
 * A case is consistent when:
 * - offset matches the expected offset
 * - visible matches the expected visibility
 * - activeId matches the expected active destination
 * - contentShiftPx is 0 (global invariant: no content displacement)
 *
 * @param cases - each case with id, events, headerHeight, sections, expected
 * @param headerHeight - fallback header height when a case omits its own
 * @returns { currentStreak, maxStreak, failedCases, firstFailure }
 */
export function calculateHeaderStreak(
  cases: readonly StreakCase[],
  headerHeight: number
): StreakResult {
  let currentStreak = 0;
  let maxStreak = 0;
  const failedCases: string[] = [];
  let firstFailure: string | null = null;

  for (const c of cases) {
    const height = c.headerHeight ?? headerHeight;
    let state = initialState(height);

    for (const event of c.events) {
      state = applyEvent(state, event);
    }

    const observed = measure(state);
    const activeId = activeDestination({
      top: state.top,
      headerHeight: state.headerHeight,
      sections: c.sections,
    });

    const consistent =
      observed.offset === c.expected.offset &&
      observed.visible === c.expected.visible &&
      activeId === c.expected.activeId &&
      observed.contentShiftPx === 0;

    if (consistent) {
      currentStreak += 1;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else {
      failedCases.push(c.id);
      if (firstFailure === null) {
        firstFailure = c.id;
      }
      currentStreak = 0;
    }
  }

  return { currentStreak, maxStreak, failedCases, firstFailure };
}
