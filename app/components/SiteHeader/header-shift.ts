/**
 * header-shift.ts — T4 + T5 (RF-4, RNF-4, RNF-5)
 * Pure reducer for the progressive withdrawal of the header.
 *
 * Given a state and an event, returns the new state together with the
 * header offset. It never touches `window`, `document` nor the DOM: it is
 * fully testable without a browser.
 *
 * Withdrawal rules (plan §3):
 * - top ≤ 0 → offset 0 (full header at the top of the page).
 * - Scrolling up → offset 0: full return when scrolling up, even slightly.
 * - top > 64 px and scrolling down → progression
 *   min(1, (top − 64) / (2 × height)), capped at one height (offset = −height).
 * - contentShiftPx = 0 always: the header withdraws without shifting content
 *   (zero CLS).
 *
 * Guards (T5):
 * - Focus inside the header → offset 0 (no withdrawal).
 * - Navigation or language panel open → offset 0.
 * - Reduced motion enabled → offset 0 (withdrawal disabled).
 * - No JavaScript (no prior `load` event) → offset 0 always.
 * - 8 px reversal threshold: the last direction is kept until the direction
 *   change exceeds 8 px, avoiding flicker.
 * - resize → updates the height and resets offset to 0 without moving content.
 * - load → activates JavaScript and restores the initial state.
 */

export type ScrollDirection = 'down' | 'up';

export type ShiftState = {
  top: number;
  previousTop: number;
  direction: ScrollDirection;
  offset: number;
  headerHeight: number;
  focusInside: boolean;
  panelOpen: boolean;
  reducedMotion: boolean;
  jsActive: boolean;
};

export type ScrollEvent = {
  type: 'scroll';
  top: number;
};

export type FocusInEvent = { type: 'focusin' };
export type FocusOutEvent = { type: 'focusout' };
export type OpenPanelEvent = { type: 'openPanel' };
export type ClosePanelEvent = { type: 'closePanel' };
export type ReducedMotionChangeEvent = {
  type: 'reducedMotionChange';
  value: boolean;
};
export type ResizeEvent = {
  type: 'resize';
  height: number;
};
export type LoadEvent = { type: 'load' };

export type HeaderShiftEvent =
  | ScrollEvent
  | FocusInEvent
  | FocusOutEvent
  | OpenPanelEvent
  | ClosePanelEvent
  | ReducedMotionChangeEvent
  | ResizeEvent
  | LoadEvent;

/** Distance from the top before withdrawal starts (px). */
const SCROLL_START_THRESHOLD = 64;

/** Minimum direction change to reverse direction (px). */
const REVERSAL_THRESHOLD = 8;

/** Initial state: full header, no withdrawal, no JavaScript active. */
export function initialState(headerHeight: number): ShiftState {
  return {
    top: 0,
    previousTop: 0,
    direction: 'down',
    offset: 0,
    headerHeight,
    focusInside: false,
    panelOpen: false,
    reducedMotion: false,
    jsActive: false,
  };
}

/**
 * Applies an event over the state and returns the next state.
 * Pure function: same input always produces the same output.
 */
export function applyEvent(
  state: ShiftState,
  event: HeaderShiftEvent
): ShiftState {
  switch (event.type) {
    case 'load':
      // JavaScript active: restore the initial state with jsActive = true.
      return { ...initialState(state.headerHeight), jsActive: true };

    case 'focusin':
      return { ...state, focusInside: true, offset: 0 };

    case 'focusout':
      return { ...state, focusInside: false };

    case 'openPanel':
      return { ...state, panelOpen: true, offset: 0 };

    case 'closePanel':
      return { ...state, panelOpen: false };

    case 'reducedMotionChange':
      if (event.value) {
        // Reduced motion enabled: cancel withdrawal immediately.
        return { ...state, reducedMotion: true, offset: 0 };
      }
      return { ...state, reducedMotion: false };

    case 'resize':
      // New header height, withdrawal cancelled, no content movement.
      return { ...state, headerHeight: event.height, offset: 0 };

    case 'scroll': {
      const delta = event.top - state.top;

      // Direction is only re-evaluated when the change exceeds the reversal
      // threshold; a smaller delta keeps the last direction (avoids flicker).
      let direction = state.direction;
      if (Math.abs(delta) >= REVERSAL_THRESHOLD) {
        direction = delta > 0 ? 'down' : 'up';
      }

      const next: ShiftState = {
        ...state,
        previousTop: state.top,
        top: event.top,
        direction,
      };

      if (event.top <= 0) {
        // Top of the page: full header.
        next.offset = 0;
      } else if (
        !state.jsActive ||
        state.reducedMotion ||
        state.focusInside ||
        state.panelOpen
      ) {
        // Guards: no JS, reduced motion, focus inside or panel open.
        next.offset = 0;
      } else if (direction === 'up') {
        // Full return when scrolling up, even slightly (RF-4, case 7).
        next.offset = 0;
      } else if (event.top > SCROLL_START_THRESHOLD) {
        // Progressive withdrawal proportional to scroll, capped at one height.
        const distance = 2 * state.headerHeight;
        const progress = Math.min(
          1,
          (event.top - SCROLL_START_THRESHOLD) / distance
        );
        next.offset = -state.headerHeight * progress;
      } else {
        // Between 0 and 64 px scrolling down: no withdrawal.
        next.offset = 0;
      }

      return next;
    }
  }
}

/**
 * Observable reading of the state: offset, visibility and the invariant of
 * zero content shift.
 */
export function measure(state: ShiftState) {
  return {
    offset: state.offset,
    visible: state.offset === 0,
    contentShiftPx: 0,
  };
}
