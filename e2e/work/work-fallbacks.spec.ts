import { expect, test, type Page } from '@playwright/test';
import { WORK_ENTRIES } from '@/content/work';
import en from '../../messages/en.json';
import es from '../../messages/es.json';
import {
  expectReadingContrast,
  readTextPaint,
  THEMES,
} from '../about/about-helpers';

const LOCALES = [
  { locale: 'en', label: 'Work', messages: en.experience },
  { locale: 'es', label: 'Trabajo', messages: es.experience },
] as const;

// Self-contained browser sampler: observe text paint and its entire ancestor
// chain, not class names, animation wrappers or implementation attributes.
function readWorkFrame(paint: typeof readTextPaint) {
  return Array.from(document.querySelectorAll('#work ol > li')).map((row) => {
    const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
    const elements = new Set<Element>();
    while (walker.nextNode()) {
      if (walker.currentNode.textContent?.trim()) elements.add(walker.currentNode.parentElement!);
    }
    return Array.from(elements).map((element) => {
      let translated = false;
      let clipped = false;
      let hidden = false;
      let animations = 0;
      let translateY = 0;
      for (let node: Element | null = element; node; node = node.parentElement) {
        const style = getComputedStyle(node);
        const matrix = new DOMMatrixReadOnly(style.transform);
        translated ||= !matrix.isIdentity;
        translateY += matrix.m42;
        clipped ||= style.clipPath !== 'none';
        hidden ||= style.visibility !== 'visible' || style.display === 'none';
        animations += node.getAnimations().length;
      }
      return {
        text: element.textContent!.trim(),
        paint: paint(element),
        translated,
        translateY,
        clipped,
        hidden,
        animations,
      };
    });
  });
}

type WorkFrame = ReturnType<typeof readWorkFrame>;
type FrameHistory = {
  first: WorkFrame | null;
  violations: WorkFrame[];
  count: number;
  blockedScripts: string[];
};

async function frame(page: Page): Promise<WorkFrame> {
  return page.evaluate(`(${readWorkFrame.toString()})(${readTextPaint.toString()})`);
}

function expectStaticFrame(actual: WorkFrame, context: string) {
  expect(actual, context).toHaveLength(5);
  for (const [index, texts] of actual.entries()) {
    expect(texts.length).toBeGreaterThanOrEqual(3 + WORK_ENTRIES[index].technologies.length);
    for (const state of texts) {
      expect(state, `${context}: ${state.text}`).toEqual(expect.objectContaining({
        translated: false, translateY: 0, clipped: false, hidden: false, animations: 0,
      }));
      expectReadingContrast(state.paint, `${context}: ${state.text}`);
    }
  }
}

async function watchFirstFrames(page: Page, reducedOnly = false) {
  await page.addInitScript({ content: `{
    const read = () => (${readWorkFrame.toString()})(${readTextPaint.toString()});
    const history = window.__workFrames = { first: null, violations: [], count: 0, blockedScripts: [] };
    document.addEventListener('securitypolicyviolation', event => {
      if (event.effectiveDirective.startsWith('script-src')) history.blockedScripts.push(event.blockedURI);
    });
    const sample = () => {
      const rows = read();
      if ((!${reducedOnly} || matchMedia('(prefers-reduced-motion: reduce)').matches) &&
        rows.length === 5 && rows.every(texts => texts.length >= 5)) {
        history.first ??= rows;
        history.count++;
        if (rows.flat().some(s => s.paint.opacity !== 1 || s.paint.transitioning ||
          s.translated || s.clipped || s.hidden || s.animations !== 0)) {
          if (history.violations.length < 10) history.violations.push(rows);
        }
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  }` });
}

async function firstFrames(page: Page): Promise<FrameHistory> {
  return page.evaluate('window.__workFrames');
}

async function settle(page: Page) {
  await page.evaluate(() => new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  ));
}

// Change the capability query itself and the corresponding declarations before
// CSS reaches the browser. Do not inject the desired fallback declarations or
// spoof CSS.supports: the actual production @supports not branch must win.
async function withoutScrollSupport(page: Page) {
  let changed = 0;
  await page.route(/\.css(\?.*)?$/, async (route) => {
    const response = await route.fetch();
    const css = await response.text();
    const body = css.replace(/view\([^)]*\)/g, 'unsupported-scroll-timeline');
    if (body !== css) changed++;
    const headers = { ...response.headers() };
    delete headers['content-encoding'];
    delete headers['content-length'];
    await route.fulfill({ status: response.status(), headers, body });
  });
  return () => changed;
}

async function verifyContent(page: Page, item: (typeof LOCALES)[number]) {
  const work = page.getByRole('region', { name: item.label, exact: true });
  await expect(work.getByRole('heading', { name: item.messages.title })).toBeVisible();
  const rows = work.getByRole('listitem');
  await expect(rows).toHaveCount(5);
  for (const [index, entry] of WORK_ENTRIES.entries()) {
    const row = rows.nth(index);
    const message = item.messages.items[entry.id];
    for (const text of [
      String(index + 1).padStart(2, '0'), message.title, message.result, ...entry.technologies,
    ]) {
      await expect(row.getByText(text, { exact: true })).toBeVisible();
    }
  }
  return rows;
}

for (const item of LOCALES) {
  for (const theme of THEMES) {
    test.describe(`${item.locale}, ${theme}: Work fallbacks`, () => {
      test.use({ viewport: { width: 1440, height: 320 }, colorScheme: theme });

      for (const fallback of [
        'reduced motion', 'unsupported scroll animation', 'no JavaScript', 'blocked application JavaScript',
      ] as const) {
        test.describe(fallback, () => {
          test.use({
            reducedMotion: fallback === 'reduced motion' ? 'reduce' : 'no-preference',
            javaScriptEnabled: fallback !== 'no JavaScript',
          });

          test('keeps all content static and AA on entry, reading, exit and return', async ({ page }) => {
            const changed = fallback === 'unsupported scroll animation'
              ? await withoutScrollSupport(page) : undefined;
            if (fallback === 'blocked application JavaScript') {
              // Browser-level JS disabling also suppresses rAF observers.
              // Supplement that real-disabled case with a CSP denying ALL site
              // scripts (inline and external), while privileged test observers
              // can still measure the very first rendered frame.
              await page.route('**/*', async (route) => {
                if (route.request().resourceType() !== 'document') return route.continue();
                const response = await route.fetch();
                await route.fulfill({
                  response,
                  headers: { ...response.headers(), 'content-security-policy': "script-src 'none'" },
                });
              });
            }
            if (fallback !== 'no JavaScript') await watchFirstFrames(page);
            // DOMContentLoaded can precede stylesheet readiness; this manual
            // sample is post-load. The preinstalled rAF observer still audits
            // the first rendered frame independently.
            await page.goto(`/${item.locale}#work`);
            if (changed) expect(changed()).toBeGreaterThan(0);
            // Native CSS support remains real, independently of JS availability.
            expect(await page.evaluate(() => CSS.supports('animation-timeline: view()'))).toBe(true);
            expectStaticFrame(await frame(page), 'initial document');
            await page.evaluate(() => document.fonts.ready);
            const rows = await verifyContent(page, item);
            for (const index of [0, 1, 2, 3, 4, 2, 0]) {
              const center = await rows.nth(index).evaluate((element) => {
                const rect = element.getBoundingClientRect();
                return scrollY + rect.top + rect.height / 2;
              });
              for (const position of [0.9, 0.5, 0.1]) {
                await page.evaluate(({ center, position }) =>
                  window.scrollTo({ top: center - innerHeight * position, behavior: 'instant' }),
                { center, position });
                if (fallback !== 'no JavaScript') await settle(page);
                expectStaticFrame(await frame(page), `row ${index + 1}, viewport ${position}`);
              }
            }
            if (fallback !== 'no JavaScript') {
              const history = await firstFrames(page);
              expect(history.count).toBeGreaterThan(2);
              expectStaticFrame(history.first!, 'first rendered Work frame');
              expect(history.violations).toEqual([]);
              if (fallback === 'blocked application JavaScript') {
                expect(history.blockedScripts).toContain('inline');
                expect(history.blockedScripts.some((uri) => uri.includes('/_next/'))).toBe(true);
              }
            }
          });
        });
      }

      test('direct anchor and reloading within Work preserve position-linked paint', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.goto(`/${item.locale}#work`);
        await page.evaluate(() => document.fonts.ready);
        const work = page.getByRole('region', { name: item.label, exact: true });
        await expect(work.getByRole('heading', { name: item.label, exact: true })).toBeInViewport();
        const rows = await verifyContent(page, item);
        await settle(page);
        const anchoredY = await page.evaluate(() => scrollY);
        expect(anchoredY).toBeGreaterThan(0);
        const anchoredPaint = await frame(page);
        // A fresh direct visit must match approaching the same position by scroll.
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await settle(page);
        await page.evaluate((top) => scrollTo({ top, behavior: 'instant' }), anchoredY);
        await settle(page);
        expect(await frame(page)).toEqual(anchoredPaint);

        // Reload a reading state and a partial exit state in the middle of Work,
        // not just its anchor. Include all five rows, not only the visible one.
        for (const phase of ['reading', 'exit'] as const) {
          const text = rows.nth(2).getByRole('heading', { level: 4 });
          const textContent = await text.textContent();
          const painted = (await frame(page))[2].find((state) => state.text === textContent);
          const target = await rows.nth(2).evaluate((element, { phase, translateY }) => {
            const texts = Array.from(element.querySelectorAll('h4, p, span')).filter((node) => node.textContent?.trim());
            const rects = texts.map((node) => node.getBoundingClientRect());
            const top = Math.min(...rects.map((rect) => rect.top)) + scrollY - translateY;
            const bottom = Math.max(...rects.map((rect) => rect.bottom)) + scrollY - translateY;
            return phase === 'reading' ? (top + bottom - innerHeight) / 2 : bottom - innerHeight * 0.1;
          }, { phase, translateY: painted!.translateY });
          await page.evaluate((top) => scrollTo({ top, behavior: 'instant' }), target);
          await settle(page);
          const before = await frame(page);
          const beforeText = before[2].find((state) => state.text === painted!.text)!;
          if (phase === 'reading') expect(beforeText.paint.opacity).toBe(1);
          else {
            expect(beforeText.paint.opacity).toBeGreaterThan(0);
            expect(beforeText.paint.opacity).toBeLessThan(1);
            expect(beforeText.translateY).toBeLessThan(0);
          }
          const position = await page.evaluate(() => scrollY);
          await page.reload();
          await page.evaluate(() => document.fonts.ready);
          await expect.poll(() => page.evaluate(() => scrollY)).toBe(position);
          await settle(page);
          expect(await frame(page)).toEqual(before);
          // Time alone must not replay entry or return the page to its anchor.
          for (let sample = 0; sample < 8; sample++) {
            await settle(page);
            expect(await page.evaluate(() => scrollY)).toBe(position);
            expect(await frame(page)).toEqual(before);
          }
        }
      });

      test('switching to reduced motion during reading makes every row static at its first reduced frame', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await watchFirstFrames(page, true);
        await page.goto(`/${item.locale}#work`);
        await page.evaluate(() => document.fonts.ready);
        const rows = await verifyContent(page, item);
        const center = await rows.nth(2).evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return scrollY + rect.top + rect.height / 2;
        });
        await page.evaluate((center) => scrollTo({ top: center - innerHeight / 2, behavior: 'instant' }), center);
        await settle(page);
        const before = await frame(page);
        expect(before[2].every((text) => text.paint.opacity === 1)).toBe(true);
        expect(before.flat().some((text) => text.paint.opacity < 1)).toBe(true);
        const position = await page.evaluate(() => scrollY);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await settle(page);
        const history = await firstFrames(page);
        expect(history.count).toBeGreaterThan(0);
        expectStaticFrame(history.first!, 'first frame after live preference change');
        expect(history.violations).toEqual([]);
        expect(await page.evaluate(() => scrollY)).toBe(position);
        for (const row of await rows.all()) {
          await row.scrollIntoViewIfNeeded();
          await settle(page);
          expectStaticFrame(await frame(page), 'scrolling after live preference change');
        }
      });
    });
  }
}

test('first-frame observer detects real motion without a fallback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await watchFirstFrames(page);
  await page.goto('/en#work');
  await expect.poll(async () => (await firstFrames(page)).violations.length).toBeGreaterThan(0);
});
