import { describe, it, expect } from 'vitest';
import { calculateHeaderStreak } from './header-streak';
import type { HeaderShiftEvent } from '../../app/components/SiteHeader/layout/header-shift';
import type { DestinationId } from '../../app/navigation/destinations';

type Section = { id: DestinationId; top: number };

type StreakCase = {
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

const EXPERIENCE: Section = { id: 'experience', top: 800 };
const PROJECTS: Section = { id: 'projects', top: 1600 };
const STACK: Section = { id: 'stack', top: 2400 };
const CONTACT: Section = { id: 'contact', top: 3200 };
const SECTIONS: readonly Section[] = [
  EXPERIENCE,
  PROJECTS,
  STACK,
  CONTACT,
];

function makeCase(
  id: string,
  events: HeaderShiftEvent[],
  headerHeight: number,
  sections: readonly Section[],
  expected: StreakCase['expected']
): StreakCase {
  return { id, events, headerHeight, sections, expected };
}

// T6 (004): Header continuity streak — RF covered: RF-2, RF-3, RF-4, RF-5,
// RF-8, RNF-4
// Done when: currentStreak = number of cases, maxStreak = currentStreak,
// failedCases empty, and a deliberately broken case resets the streak and
// names its id.
describe('header-streak — T6 (RF-2, RF-3, RF-4, RF-5, RF-8, RNF-4)', () => {
  it('currentStreak equals the number of cases and no case fails', () => {
    const cases: StreakCase[] = [
      makeCase(
        'at-top',
        [{ type: 'load' }, { type: 'scroll', top: 0 }],
        100,
        SECTIONS,
        { offset: 0, visible: true, activeId: 'home', contentShiftPx: 0 }
      ),
      makeCase(
        'past-first-section',
        [{ type: 'load' }, { type: 'scroll', top: 700 }],
        100,
        SECTIONS,
        { offset: -100, visible: false, activeId: 'experience', contentShiftPx: 0 }
      ),
    ];

    const result = calculateHeaderStreak(cases, 100);

    expect(result.currentStreak).toBe(2);
    expect(result.maxStreak).toBe(2);
    expect(result.failedCases).toEqual([]);
    expect(result.firstFailure).toBeNull();
  });

  it('a deliberately broken case resets the streak and names its id', () => {
    const cases: StreakCase[] = [
      makeCase(
        'at-top',
        [{ type: 'load' }, { type: 'scroll', top: 0 }],
        100,
        SECTIONS,
        { offset: 0, visible: true, activeId: 'home', contentShiftPx: 0 }
      ),
      makeCase(
        'broken-case',
        [{ type: 'load' }, { type: 'scroll', top: 0 }],
        100,
        SECTIONS,
        { offset: -999, visible: true, activeId: 'home', contentShiftPx: 0 }
      ),
      makeCase(
        'after-break',
        [{ type: 'load' }, { type: 'scroll', top: 0 }],
        100,
        SECTIONS,
        { offset: 0, visible: true, activeId: 'home', contentShiftPx: 0 }
      ),
    ];

    const result = calculateHeaderStreak(cases, 100);

    expect(result.currentStreak).toBe(1);
    expect(result.maxStreak).toBe(1);
    expect(result.failedCases).toEqual(['broken-case']);
    expect(result.firstFailure).toBe('broken-case');
  });
});
