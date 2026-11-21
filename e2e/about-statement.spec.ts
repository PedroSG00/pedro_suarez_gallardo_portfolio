import { expect, test } from '@playwright/test';
import {
  STATEMENTS,
  THEMES,
  THEME_COLORS,
  getContrastRatio,
  getVisualState,
  mountStatement,
  scrollElementToProgress,
} from './about-helpers';

// The statement CSS is mounted alone, so word boundaries can be probed exactly.
for (const [locale, text] of Object.entries(STATEMENTS)) {
  for (const theme of THEMES) {
    test(`About statement progresses and reverses in ${locale}/${theme}`, async ({ page }) => {
      const geometry = await mountStatement(page, text, theme);
      const scrollTo = (progress: number) => scrollElementToProgress(page, geometry, progress);
      const colors = THEME_COLORS[theme];
      const wordCount = text.trim().split(/\s+/).length;
      const firstBoundary = 1 / wordCount;
      const secondBoundary = 2 / wordCount;
      const offset = 0.01;
      const hasAaContrast = (states: Array<{ color: string }>) =>
        states.every((word) => getContrastRatio(word.color, colors.background) >= 4.5);
      await expect(page.getByRole('group', { name: text })).toBeVisible();

      const initial = await getVisualState(page, text);
      expect(initial.every((word) => word.fontWeight === '400')).toBe(true);
      expect(initial.every((word) => word.color === colors.muted)).toBe(true);
      expect(hasAaContrast(initial)).toBe(true);

      await scrollTo(firstBoundary - offset);
      expect((await getVisualState(page, text)).every((word) => word.fontWeight === '400')).toBe(true);

      await scrollTo(firstBoundary + offset);
      const firstLit = await getVisualState(page, text);
      expect(firstLit[0]).toEqual({ color: colors.ink, fontWeight: '700' });
      expect(firstLit.slice(1).every((word) => word.fontWeight === '400')).toBe(true);
      expect(firstLit.slice(1).every((word) => word.color === colors.muted)).toBe(true);
      expect(hasAaContrast(firstLit)).toBe(true);

      await scrollTo(secondBoundary + offset);
      const accumulated = await getVisualState(page, text);
      expect(accumulated.slice(0, 2).every((word) => word.fontWeight === '700')).toBe(true);
      expect(accumulated.slice(0, 2).every((word) => word.color === colors.ink)).toBe(true);
      expect(accumulated.slice(2).every((word) => word.fontWeight === '400')).toBe(true);
      expect(accumulated.slice(2).every((word) => word.color === colors.muted)).toBe(true);

      await scrollTo(0.99);
      const beforeFinal = await getVisualState(page, text);
      expect(beforeFinal.slice(0, -1).every((word) => word.fontWeight === '700')).toBe(true);
      expect(beforeFinal.slice(0, -1).every((word) => word.color === colors.ink)).toBe(true);
      expect(beforeFinal.at(-1)).toEqual({ color: colors.muted, fontWeight: '400' });

      await scrollTo(1);
      const final = await getVisualState(page, text);
      expect(final.every((word) => word.fontWeight === '700')).toBe(true);
      expect(final.every((word) => word.color === colors.ink)).toBe(true);
      expect(hasAaContrast(final)).toBe(true);

      await scrollTo(secondBoundary - offset);
      const reversed = await getVisualState(page, text);
      expect(reversed[0]).toEqual({ color: colors.ink, fontWeight: '700' });
      expect(reversed.slice(1).every((word) => word.fontWeight === '400')).toBe(true);
      expect(reversed.slice(1).every((word) => word.color === colors.muted)).toBe(true);
    });
  }
}
