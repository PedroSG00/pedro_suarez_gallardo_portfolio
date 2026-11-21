import { expect, test } from '@playwright/test';
import {
  STATEMENTS,
  THEMES,
  THEME_COLORS,
  getEffectiveOpacity,
  getScrollTargetGeometry,
  getVisualState,
  openAbout,
  revealProgress,
  scrollElementToProgress,
  type AboutLocale,
} from './about-helpers';

for (const [locale, text] of Object.entries(STATEMENTS) as Array<[AboutLocale, string]>) {
  for (const theme of THEMES) {
    test.describe(`About reveal in ${locale}/${theme}`, () => {
      test('keeps every block at full opacity while reading', async ({ page }) => {
        const about = await openAbout(page, locale, { theme });
        const statement = about.getByRole('group', { name: text });
        const paragraphs = about.getByRole('paragraph');
        const qualities = about.getByRole('listitem');
        const portrait = about.getByRole('img');

        await expect(statement).toBeVisible();
        await expect(paragraphs).toHaveCount(4);
        await expect(qualities).toHaveCount(5);
        await expect(portrait).toBeVisible();

        const targets = [statement, ...(await paragraphs.all()), ...(await qualities.all()), portrait];
        for (const target of targets) {
          const label = (await target.textContent())?.trim() || 'portrait';
          const geometry = await getScrollTargetGeometry(target);
          const { beforeTop, halfwayOut } = revealProgress(geometry);
          const opacityAt = async (progress: number) => {
            await scrollElementToProgress(page, geometry, progress);
            return getEffectiveOpacity(target);
          };

          const entering = await opacityAt(0.05);
          expect(entering, `${label}: entering`).toBeLessThan(1);
          for (const progress of [0.2, 0.5, beforeTop]) {
            expect(await opacityAt(progress), `${label}: reading at ${progress}`).toBe(1);
          }
          expect(await opacityAt(halfwayOut), `${label}: exiting`).toBeLessThan(1);
          expect(await opacityAt(beforeTop), `${label}: reading again`).toBe(1);
          expect(await opacityAt(0.05), `${label}: back to entry`).toBeCloseTo(entering, 2);
        }
      });

      test('lights the statement with scroll and reverses it', async ({ page }) => {
        const about = await openAbout(page, locale, { theme });
        const statement = about.getByRole('group', { name: text });
        const geometry = await getScrollTargetGeometry(statement);

        await scrollElementToProgress(page, geometry, 0.15);
        const initialWords = await getVisualState(page, text);
        await scrollElementToProgress(page, geometry, 0.55);
        expect(await getVisualState(page, text)).not.toEqual(initialWords);
        await scrollElementToProgress(page, geometry, 0.15);
        expect(await getVisualState(page, text)).toEqual(initialWords);
      });

      test('shows everything static and lit with reduced motion', async ({ page }) => {
        const about = await openAbout(page, locale, { theme, reducedMotion: 'reduce' });
        const statement = about.getByRole('group', { name: text });
        const targets = [
          statement,
          ...(await about.getByRole('paragraph').all()),
          ...(await about.getByRole('listitem').all()),
          about.getByRole('img'),
        ];
        const geometry = await getScrollTargetGeometry(statement);

        for (const progress of [0.05, 0.5, 0.99]) {
          await scrollElementToProgress(page, geometry, progress);
          for (const target of targets) {
            expect(await getEffectiveOpacity(target)).toBe(1);
          }
        }
        expect(await getVisualState(page, text)).toEqual(
          text.split(/\s+/).map(() => ({ color: THEME_COLORS[theme].ink, fontWeight: '700' })),
        );
      });
    });
  }
}
