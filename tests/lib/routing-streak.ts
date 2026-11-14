/**
 * routing-streak — T6 (RF-2, RF-5)
 *
 * Routing streak calculation algorithm (plan §3).
 * Counts how many consecutive cases in the matrix are resolved with a single
 * source of truth and with the expected result, with no duplicate mechanisms
 * or runtime fallbacks.
 *
 * Each case already carries its `observed` (what resolverCaso —proxy.ts +
 * resolve-locale.ts— would return) so this algorithm is purely about the
 * streak and does not depend on the routing implementation (Phase 2).
 */

export interface Observed {
  status: 200 | 308 | 404;
  locale: 'en' | 'es';
  location: string | null;
}

export interface RouteCase {
  id: string;
  url: string;
  cookieLang: string | null;
  legacyLang: string | null;
  acceptLanguage: string | null;
  expectedStatus: 200 | 308 | 404;
  expectedLocale: 'en' | 'es';
  expectedLocation: string | null;
  observed: Observed;
  uniqueResolver: boolean;
  uniqueWriter: boolean;
  noRuntimeFallback: boolean;
  noHardcodedText: boolean;
  keyParity: boolean;
}

export interface StreakResult {
  currentStreak: number;
  maxStreak: number;
  failedCases: string[];
}

export function calculateRoutingStreakDeterministic(
  cases: RouteCase[]
): StreakResult {
  let currentStreak = 0;
  let maxStreak = 0;
  const failedCases: string[] = [];

  for (const caseItem of cases) {
    let consistent = true;

    if (!caseItem.uniqueResolver) consistent = false;
    if (!caseItem.uniqueWriter) consistent = false;
    if (!caseItem.noRuntimeFallback) consistent = false;
    if (!caseItem.noHardcodedText) consistent = false;
    if (!caseItem.keyParity) consistent = false;

    if (caseItem.observed.status !== caseItem.expectedStatus) consistent = false;
    if (caseItem.observed.locale !== caseItem.expectedLocale) consistent = false;
    if (
      caseItem.expectedLocation !== null &&
      caseItem.observed.location !== caseItem.expectedLocation
    ) {
      consistent = false;
    }

    if (consistent) {
      currentStreak += 1;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      failedCases.push(caseItem.id);
      currentStreak = 0;
    }
  }

  return { currentStreak, maxStreak, failedCases };
}
