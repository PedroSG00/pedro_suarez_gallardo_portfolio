import { expect, test, type Page } from '@playwright/test';
import {
  ABOUT_PROBLEM,
  ABOUT_VALUES,
  PORTRAIT_NAME,
  STATEMENTS,
  THEME_COLORS,
  getEffectiveOpacity,
  getScrollTargetGeometry,
  getVisualState,
  openAbout,
  scrollElementToProgress,
} from './about-helpers';

async function expectStaticAbout(
  page: Page,
  withPortrait: boolean,
  { waitForAnimationFrame = true } = {},
): Promise<void> {
  const about = page.getByRole('region', { name: 'About' });
  const statement = about.getByRole('group', { name: STATEMENTS.en });
  const paragraphs = about.getByRole('paragraph');
  const targets = [
    about.getByRole('heading', { name: 'About' }),
    statement,
    ...(await paragraphs.all()),
    ...ABOUT_VALUES.map((value) => about.getByText(value, { exact: true })),
  ];
  if (withPortrait) targets.push(about.getByRole('img', { name: PORTRAIT_NAME }));

  await expect(about.getByText(ABOUT_PROBLEM, { exact: true })).toBeVisible();
  await expect(paragraphs).toHaveCount(4);
  await Promise.all(targets.map((target) => expect(target).toBeVisible()));

  const geometry = await getScrollTargetGeometry(statement);
  for (const position of [0.1, 0.5]) {
    await scrollElementToProgress(page, geometry, position, waitForAnimationFrame);
    expect(await about.evaluate((node) => node.getAnimations({ subtree: true }).length)).toBe(0);
    for (const target of targets) {
      expect(await getEffectiveOpacity(target)).toBe(1);
    }
    expect(await getVisualState(page, STATEMENTS.en)).toEqual(
      STATEMENTS.en.split(/\s+/).map(() => ({
        color: THEME_COLORS.light.ink,
        fontWeight: '700',
      })),
    );
  }
}

test('About is static with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en');
  await expectStaticAbout(page, true);
});

// Chromium supports scroll-driven animations, so simulate an unsupported CSS
// value in both declarations and @supports queries. Positive queries then fail
// and their `@supports not` fallbacks apply, as they would in an unsupported
// browser; the engine's own JavaScript capability query remains untouched.
async function neutralizeScrollTimelineCss(page: Page): Promise<() => number> {
  let neutralizedStylesheets = 0;

  await page.route(/\.css(\?.*)?$/, async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    const neutralized = body.replace(/view\([^)]*\)/g, 'not-a-scroll-timeline');
    if (neutralized !== body) neutralizedStylesheets += 1;
    const headers = { ...response.headers() };
    delete headers['content-encoding'];
    delete headers['content-length'];
    await route.fulfill({ status: response.status(), headers, body: neutralized });
  });

  return () => neutralizedStylesheets;
}

test('About is static without scroll-driven animation support', async ({ page }) => {
  const getNeutralizedStylesheets = await neutralizeScrollTimelineCss(page);
  await page.goto('/en');
  expect(getNeutralizedStylesheets()).toBeGreaterThan(0);
  await expectStaticAbout(page, true);
});

test('omits a failed local portrait while keeping About available', async ({ page }) => {
  let portraitRequestFailed = false;
  await page.route('**/pedro-suarez.png', async (route) => {
    portraitRequestFailed = true;
    await route.abort();
  });
  const about = await openAbout(page, 'en', { reducedMotion: 'reduce' });
  const problemParagraph = about.getByText(ABOUT_PROBLEM);
  const statement = about.getByRole('group', { name: STATEMENTS.en });

  await expect.poll(() => portraitRequestFailed).toBe(true);
  await expect(about.getByRole('img')).toHaveCount(0);
  await expect(problemParagraph).toBeVisible();
  await expect(about.getByRole('heading', { name: 'About' })).toHaveCount(1);
  await expect(statement).toBeVisible();
  await expect(about.locator('p')).toHaveCount(5);
  const [headline, paragraph] = await Promise.all([
    statement.boundingBox(),
    problemParagraph.boundingBox(),
  ]);
  expect(paragraph!.x).toBeCloseTo(headline!.x);
});

test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  test('About is static and includes the portrait when available', async ({ page }) => {
    await page.goto('/en');
    await expectStaticAbout(page, true, { waitForAnimationFrame: false });
  });

  test('About stays static and omits a failed portrait without a visual error', async ({ page }) => {
    const failedRequest = page.waitForEvent('requestfailed', {
      predicate: (request) => request.url().endsWith('/pedro-suarez.png'),
    });
    await page.route('**/pedro-suarez.png', (route) => route.abort());
    await page.goto('/en');
    await failedRequest;

    const about = page.getByRole('region', { name: 'About' });
    const failedPortrait = about.getByRole('img');
    await expect(failedPortrait).toHaveCount(1);
    await expect(failedPortrait).not.toBeVisible();
    await expect(about.getByText(PORTRAIT_NAME, { exact: true })).not.toBeVisible();
    await expectStaticAbout(page, false, { waitForAnimationFrame: false });
  });
});
