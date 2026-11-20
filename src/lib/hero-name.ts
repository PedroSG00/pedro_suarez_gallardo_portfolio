/**
 * Pure sizing logic for the hero name (RF-8). The same formula lives in CSS
 * through `--text-hero-name`; this module verifies the invariant without a
 * layout engine. No DOM access, never throws.
 */

export interface HeroNameMetrics {
  viewportWidth: number;
  contentWidth: number;
  longestWordChars: number;
  advanceRatio: number;
  minFontSize: number;
  maxFontSize: number;
  /** Share of the content width the longest line should cover (0.9 = 90%). */
  fillRatio: number;
  fontSize: number;
  blockWidth: number;
  /** `blockWidth / contentWidth`; 0 when there is no usable content width. */
  ratio: number;
}

export interface HeroNameOptions {
  /** Longest word of the name; "Gallardo" has 8 characters. */
  longestWordChars?: number;
  /** Horizontal advance of one monospace character, in `em` (0.6). */
  advanceRatio?: number;
  minFontSize?: number;
  maxFontSize?: number;
  /** Unitted fill ratio; the same value as `--hero-name-fill` (0.9). */
  fillRatio?: number;
  /** Overrides the viewport-derived gutter, in px. */
  gutter?: number;
}

/** "Gallardo" is the longest word of the name. */
export const HERO_LONGEST_WORD_CHARS = 8;

/**
 * Horizontal advance of one Geist Mono character, in `em`. Must stay equal to
 * `--hero-name-advance` in `src/styles/globals.css` (RF-8).
 */
export const HERO_NAME_ADVANCE = 0.6;

/** Share of the content width the longest line must cover (90%). */
export const HERO_NAME_FILL = 0.9;

/** Smallest name size, in px. */
export const HERO_NAME_MIN_FONT_SIZE = 48;

/** Largest name size, in px. */
export const HERO_NAME_MAX_FONT_SIZE = 300;

/** Grid cap, in px (`--grid-max-width`). */
export const GRID_MAX_WIDTH = 1600;

/** Side gutter below the 768px breakpoint, in px. */
export const GRID_GUTTER_COMPACT = 24;

/** Side gutter from the 768px breakpoint on, in px. */
export const GRID_GUTTER_WIDE = 48;

/** Breakpoint where the grid gutter grows, in px. */
export const GRID_GUTTER_BREAKPOINT = 768;

/**
 * Divisor of the CSS clamp: longest word times advance (4.8). Must stay equal
 * to `--hero-name-divisor`; changing the word or the advance changes both.
 */
export const HERO_NAME_DIVISOR =
  HERO_LONGEST_WORD_CHARS * HERO_NAME_ADVANCE;

function finiteOr(value: number | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function positiveOr(value: number | undefined, fallback: number): number {
  const resolved = finiteOr(value, fallback);
  return resolved > 0 ? resolved : fallback;
}

/** Grid gutter in px for a viewport, matching the CSS media query. */
export function gridGutterFor(viewportWidth: number): number {
  const width = finiteOr(viewportWidth, 0);
  return width >= GRID_GUTTER_BREAKPOINT
    ? GRID_GUTTER_WIDE
    : GRID_GUTTER_COMPACT;
}

/**
 * Computes the font size and block width of the hero name. The viewport is
 * read as 0 when unusable; without usable content or a longest word, the
 * minimum size is returned with a ratio of 0.
 */
export function heroNameMetrics(
  viewportWidth: number,
  options: HeroNameOptions = {}
): HeroNameMetrics {
  const width = Math.max(0, finiteOr(viewportWidth, 0));
  const longestWordChars = Math.max(
    0,
    finiteOr(options.longestWordChars, HERO_LONGEST_WORD_CHARS)
  );
  const advanceRatio = positiveOr(options.advanceRatio, HERO_NAME_ADVANCE);
  const minFontSize = positiveOr(
    options.minFontSize,
    HERO_NAME_MIN_FONT_SIZE
  );
  const maxFontSize = Math.max(
    minFontSize,
    positiveOr(options.maxFontSize, HERO_NAME_MAX_FONT_SIZE)
  );
  const fillRatio = positiveOr(options.fillRatio, HERO_NAME_FILL);
  const gutter =
    options.gutter !== undefined &&
    Number.isFinite(options.gutter) &&
    options.gutter >= 0
      ? options.gutter
      : gridGutterFor(width);

  const contentWidth = Math.min(width - 2 * gutter, GRID_MAX_WIDTH);

  const base = {
    viewportWidth: width,
    contentWidth,
    longestWordChars,
    advanceRatio,
    minFontSize,
    maxFontSize,
    fillRatio,
  };

  if (contentWidth <= 0 || longestWordChars <= 0) {
    return {
      ...base,
      fontSize: minFontSize,
      blockWidth: 0,
      ratio: 0,
    };
  }

  const preferred =
    (fillRatio * contentWidth) / (longestWordChars * advanceRatio);
  const fontSize = Math.min(Math.max(preferred, minFontSize), maxFontSize);
  const blockWidth = longestWordChars * advanceRatio * fontSize;

  return {
    ...base,
    fontSize,
    blockWidth,
    ratio: blockWidth / contentWidth,
  };
}
