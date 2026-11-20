export type NavbarVisibility = "visible" | "hidden";

export interface NavbarVisibilityInput {
  scrollY: number;
  previousScrollY: number;
  currentVisibility: NavbarVisibility;
  menuOpen: boolean;
  focusWithin: boolean;
  reducedMotion: boolean;
  supportsScrollTimeline: boolean;
}

/**
 * Scroll position (in px) above which the bar may hide. Must stay equal to
 * `--nav-hide-threshold` in `src/styles/globals.css` (RF-3); the test fails
 * if both values diverge.
 */
export const NAV_HIDE_THRESHOLD = 80;

/** Scroll deltas under 2px are treated as "no direction change" (RF-3). */
export const MIN_SCROLL_DELTA = 2;

function normalizeScroll(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * Decides whether the navbar is visible. Pure: no DOM access, never throws.
 * Negative or non-finite positions are read as the top of the page.
 */
export function resolveNavbarVisibility(
  input: NavbarVisibilityInput
): NavbarVisibility {
  if (input.menuOpen) return "visible";
  if (input.focusWithin) return "visible";
  if (input.reducedMotion) return "visible";
  if (!input.supportsScrollTimeline) return "visible";

  const scrollY = normalizeScroll(input.scrollY);
  const previousScrollY = normalizeScroll(input.previousScrollY);

  if (scrollY <= NAV_HIDE_THRESHOLD) return "visible";

  const delta = scrollY - previousScrollY;
  if (Math.abs(delta) < MIN_SCROLL_DELTA) return input.currentVisibility;

  return delta < 0 ? "visible" : "hidden";
}
