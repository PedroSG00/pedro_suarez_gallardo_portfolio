import { describe, it, expect } from 'vitest';
import { applyEvent, initialState, measure } from './header-shift';
import casesRaw from '../../../tests/fixtures/header-cases.json';

type HeaderEvent =
  | { type: 'scroll'; top: number }
  | { type: 'focusin' }
  | { type: 'focusout' }
  | { type: 'openPanel' }
  | { type: 'closePanel' }
  | { type: 'reducedMotionChange'; value: boolean }
  | { type: 'resize'; height: number }
  | { type: 'load' };

type HeaderCaseT5 = {
  id: string;
  events: HeaderEvent[];
  headerHeight: number;
  expected: { offset: number; visible: boolean; contentShiftPx: number };
};

// T4 format (existing fixtures): only `tops`, with implicit `load`.
type HeaderCaseT4 = {
  id: string;
  tops: number[];
  headerHeight: number;
  expected: { offset: number; visible: boolean; contentShiftPx: number };
};

type HeaderCase = HeaderCaseT5 | HeaderCaseT4;

const cases = casesRaw as unknown as HeaderCase[];

function applyEvents(events: HeaderEvent[], headerHeight: number) {
  return events.reduce(
    (state, ev) => applyEvent(state, ev),
    initialState(headerHeight)
  );
}

// T4 helper: sequence of scrolls with JavaScript active (prior `load`).
function scrollTo(tops: number[], headerHeight: number) {
  return applyEvents(
    [
      { type: 'load' },
      ...tops.map((top): HeaderEvent => ({ type: 'scroll', top })),
    ],
    headerHeight
  );
}

// T5 (004): Header withdrawal reducer guards — RF covered: RF-4, RNF-4, RNF-5
// Done when: focus inside, panel open, reducedMotionChange (also late), resize,
// load without JavaScript and reversal smaller than 8 px, keeping the last
// direction and contentShiftPx = 0.
describe('header-shift — T5 (RF-4, RNF-4, RNF-5)', () => {
  const HEIGHT = 100;

  it('without JavaScript (no load) does not withdraw the header: offset 0 always', () => {
    const state = applyEvents([{ type: 'scroll', top: 500 }], HEIGHT);
    expect(measure(state).offset).toBe(0);
    expect(measure(state).visible).toBe(true);
    expect(measure(state).contentShiftPx).toBe(0);
  });

  it('with JavaScript active (load) withdraws when scrolling past 64 px', () => {
    const state = scrollTo([500], HEIGHT);
    expect(measure(state).offset).toBe(-HEIGHT);
    expect(measure(state).visible).toBe(false);
  });

  it('focus inside prevents withdrawal even while scrolling', () => {
    const state = applyEvents(
      [
        { type: 'load' },
        { type: 'focusin' },
        { type: 'scroll', top: 500 },
      ],
      HEIGHT
    );
    expect(measure(state).offset).toBe(0);
    expect(measure(state).visible).toBe(true);
    expect(measure(state).contentShiftPx).toBe(0);
  });

  it('focus outside allows withdrawal again', () => {
    const state = applyEvents(
      [
        { type: 'load' },
        { type: 'focusin' },
        { type: 'focusout' },
        { type: 'scroll', top: 500 },
      ],
      HEIGHT
    );
    expect(measure(state).offset).toBe(-HEIGHT);
    expect(measure(state).visible).toBe(false);
  });

  it('panel open prevents withdrawal even while scrolling', () => {
    const state = applyEvents(
      [
        { type: 'load' },
        { type: 'openPanel' },
        { type: 'scroll', top: 500 },
      ],
      HEIGHT
    );
    expect(measure(state).offset).toBe(0);
    expect(measure(state).visible).toBe(true);
  });

  it('panel closed allows withdrawal again', () => {
    const state = applyEvents(
      [
        { type: 'load' },
        { type: 'openPanel' },
        { type: 'closePanel' },
        { type: 'scroll', top: 500 },
      ],
      HEIGHT
    );
    expect(measure(state).offset).toBe(-HEIGHT);
    expect(measure(state).visible).toBe(false);
  });

  it('late reducedMotionChange returns the header to offset 0', () => {
    const state = applyEvents(
      [
        { type: 'load' },
        { type: 'scroll', top: 500 },
        { type: 'reducedMotionChange', value: true },
      ],
      HEIGHT
    );
    expect(measure(state).offset).toBe(0);
    expect(measure(state).visible).toBe(true);
  });

  it('reducedMotionChange to false after reducing allows withdrawal again', () => {
    const state = applyEvents(
      [
        { type: 'load' },
        { type: 'scroll', top: 500 },
        { type: 'reducedMotionChange', value: true },
        { type: 'reducedMotionChange', value: false },
        { type: 'scroll', top: 500 },
      ],
      HEIGHT
    );
    expect(measure(state).offset).toBe(-HEIGHT);
    expect(measure(state).visible).toBe(false);
  });

  it('resize updates the height and returns the header to offset 0', () => {
    const state = applyEvents(
      [
        { type: 'load' },
        { type: 'scroll', top: 500 },
        { type: 'resize', height: 120 },
      ],
      HEIGHT
    );
    expect(measure(state).offset).toBe(0);
    expect(measure(state).visible).toBe(true);
  });

  it('reversal smaller than 8 px keeps the last direction (does not return)', () => {
    const state = applyEvents(
      [
        { type: 'load' },
        { type: 'scroll', top: 500 },
        { type: 'scroll', top: 495 },
      ],
      HEIGHT
    );
    expect(measure(state).offset).toBeLessThan(0);
    expect(measure(state).visible).toBe(false);
  });

  it('reversal greater than or equal to 8 px changes direction and returns fully', () => {
    const state = applyEvents(
      [
        { type: 'load' },
        { type: 'scroll', top: 500 },
        { type: 'scroll', top: 400 },
      ],
      HEIGHT
    );
    expect(measure(state).offset).toBe(0);
    expect(measure(state).visible).toBe(true);
  });

  it('contentShiftPx = 0 always (no content displacement)', () => {
    const state = applyEvents(
      [
        { type: 'load' },
        { type: 'focusin' },
        { type: 'scroll', top: 264 },
        { type: 'focusout' },
        { type: 'openPanel' },
        { type: 'scroll', top: 100 },
        { type: 'closePanel' },
        { type: 'reducedMotionChange', value: true },
        { type: 'scroll', top: 500 },
        { type: 'reducedMotionChange', value: false },
        { type: 'resize', height: 110 },
        { type: 'scroll', top: 0 },
      ],
      HEIGHT
    );
    expect(measure(state).contentShiftPx).toBe(0);
  });

  // --- T4 backwards compatibility: the original tests still pass ---

  it('offset = 0 up to 64 px of scrolling down', () => {
    for (const top of [0, 1, 32, 63, 64]) {
      const state = scrollTo([top], HEIGHT);
      expect(measure(state).offset).toBe(0);
      expect(measure(state).visible).toBe(true);
      expect(measure(state).contentShiftPx).toBe(0);
    }
  });

  it('progression min(1, (top − 64) / (2 × height)) when scrolling past 64 px', () => {
    const mid = scrollTo([64 + 100], HEIGHT);
    expect(measure(mid).offset).toBe(-50);
    expect(measure(mid).visible).toBe(false);

    const cap = scrollTo([64 + 200], HEIGHT);
    expect(measure(cap).offset).toBe(-HEIGHT);
    expect(measure(cap).visible).toBe(false);
  });

  it('cap at one height: offset never exceeds -height', () => {
    const past = scrollTo([64 + 500], HEIGHT); // progression > 1, capped
    expect(measure(past).offset).toBe(-HEIGHT);
    expect(measure(past).contentShiftPx).toBe(0);
  });

  it('full return when scrolling up: offset returns to 0 even slightly', () => {
    const state = scrollTo([64 + 200, 200], HEIGHT); // goes down to cap, then up a little
    expect(measure(state).offset).toBe(0);
    expect(measure(state).visible).toBe(true);
    expect(measure(state).contentShiftPx).toBe(0);
  });

  it('the fixtures matrix produces exactly the expected state', () => {
    for (const c of cases) {
      // New format (events) or T4 format (tops, with implicit load).
      const events: HeaderEvent[] = 'events' in c
        ? c.events
        : [
            { type: 'load' },
            ...c.tops.map((top): HeaderEvent => ({ type: 'scroll', top })),
          ];
      const state = applyEvents(events, c.headerHeight);
      const observed = measure(state);
      expect(observed.offset).toBe(c.expected.offset);
      expect(observed.visible).toBe(c.expected.visible);
      expect(observed.contentShiftPx).toBe(c.expected.contentShiftPx);
    }
  });
});
