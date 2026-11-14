import { describe, it, expect } from 'vitest';
import {
  calculateRoutingStreakDeterministic,
  type RouteCase,
} from './routing-streak';
import casesRaw from '../fixtures/routing-cases.json';

const cases = casesRaw as unknown as RouteCase[];

// T6: Routing streak test — RF covered: RF-2, RF-5
// Done when: this test feeds the routing-cases.json matrix and demands
// currentStreak = number of cases with failedCases empty; it is red before
// implementing proxy.ts.
describe('calculateRoutingStreakDeterministic — T6', () => {
  const consistentCase = (overrides: Partial<RouteCase> = {}): RouteCase =>
    ({
      ...cases[0],
      ...overrides,
    } as RouteCase);

  it('currentStreak = number of cases and failedCases empty when all consistent', () => {
    const { currentStreak, maxStreak, failedCases } =
      calculateRoutingStreakDeterministic(cases);
    expect(failedCases).toEqual([]);
    expect(currentStreak).toBe(cases.length);
    expect(maxStreak).toBe(cases.length);
  });

  it('an inconsistent case resets the streak and names the case', () => {
    const brokenCase = consistentCase({
      id: 'broken-case',
      observed: { status: 200, locale: 'en', location: '/en' },
    });
    const { currentStreak, maxStreak, failedCases } =
      calculateRoutingStreakDeterministic([cases[0], brokenCase, cases[1]]);
    expect(failedCases).toContain('broken-case');
    expect(currentStreak).toBe(1);
    expect(maxStreak).toBe(1);
  });

  it('a single inconsistent case leaves currentStreak = 0', () => {
    const brokenCase = consistentCase({
      id: 'only-broken',
      observed: { status: 404, locale: 'en', location: null },
    });
    const { currentStreak, maxStreak, failedCases } =
      calculateRoutingStreakDeterministic([brokenCase]);
    expect(failedCases).toEqual(['only-broken']);
    expect(currentStreak).toBe(0);
    expect(maxStreak).toBe(0);
  });

  it('acceptance criterion: currentStreak = n and failedCases empty', () => {
    const { currentStreak, maxStreak, failedCases } =
      calculateRoutingStreakDeterministic(cases);
    const acceptance =
      currentStreak === cases.length && failedCases.length === 0;
    expect(acceptance).toBe(true);
    expect(maxStreak).toBe(cases.length);
  });

  it('a consistency boolean false invalidates the case even if observed matches', () => {
    const caseNoBackup = consistentCase({
      id: 'no-backup',
      noRuntimeFallback: false,
    });
    const { currentStreak, failedCases } =
      calculateRoutingStreakDeterministic([caseNoBackup]);
    expect(failedCases).toContain('no-backup');
    expect(currentStreak).toBe(0);
  });
});
