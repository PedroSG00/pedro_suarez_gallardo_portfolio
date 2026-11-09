import { test, expect, type Page } from '@playwright/test';

/**
 * Visual identity contract (RF-11, RF-12, RF-17, NFR-10, edge cases 19-20).
 *
 * The shared visual layer is exercised against the real compiled stylesheet:
 * a specimen composition using the public utilities (`.text-display`,
 * `.inverted`, `.full-bleed`, `.measure`, `.reveal`) is injected into the
 * rendered page so the assertions do not depend on curriculum content, which
 * is out of scope for this spec.
 */

const HEADLINE = 'PEDRO SUÁREZ';
const LONG_HEADLINE = 'DESARROLLADOR';
const BODY_COPY =
  'La legibilidad manda: el texto corrido se mantiene dentro de la medida de lectura mientras la composición ocupa todo el ancho. '.repeat(
    6,
  );

async function injectSpecimen(page: Page, headline: string): Promise<void> {
  await expect(page.locator('html')).toHaveClass(/theme-(light|dark|system)/);
  await page.evaluate(
    ({ headlineText, bodyText }) => {
      const host = document.querySelector('.layout-wide') ?? document.body;
      const section = document.createElement('section');
      section.className = 'full-bleed inverted';
      section.dataset.testid = 'visual-moment';
      section.innerHTML = [
        `<h1 class="text-display" data-testid="display">${headlineText}</h1>`,
        `<p class="text-body measure" data-testid="measure">${bodyText}</p>`,
        '<div class="reveal" data-testid="reveal">Contenido revelado</div>',
      ].join('');
      host.appendChild(section);
    },
    { headlineText: headline, bodyText: BODY_COPY },
  );
}

test.describe('Visual identity (RF-11, RF-12, RF-17, NFR-10)', () => {
  test('exposes the editorial impact tokens on the document', async ({ page }) => {
    await page.goto('/');

    const tokens = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      const read = (name: string) => styles.getPropertyValue(name).trim();
      return {
        display: read('--type-display'),
        pageTitle: read('--type-page-title'),
        sectionTitle: read('--type-section-title'),
        body: read('--type-body'),
        measure: read('--measure'),
        gutter: read('--gutter'),
        sectionSpace: read('--section-space'),
        layoutWide: read('--layout-wide'),
        reveal: read('--transition-reveal'),
      };
    });

    expect(tokens.display).toMatch(/clamp\(/);
    expect(tokens.pageTitle).toMatch(/clamp\(/);
    expect(tokens.sectionTitle).toMatch(/clamp\(/);
    expect(tokens.body).not.toBe('');
    expect(tokens.measure).toBe('65ch');
    expect(tokens.gutter).toMatch(/clamp\(/);
    expect(tokens.sectionSpace).toMatch(/clamp\(/);
    expect(tokens.layoutWide).toBe('100%');
    expect(tokens.reveal).toMatch(/^\d*\.?\d+m?s/);
  });

  test('renders a deliberate visual moment with display scale and inverted block', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await injectSpecimen(page, HEADLINE);

    const metrics = await page.evaluate(() => {
      const display = document.querySelector('[data-testid="display"]') as HTMLElement;
      const moment = document.querySelector('[data-testid="visual-moment"]') as HTMLElement;
      const displayStyle = getComputedStyle(display);
      const momentStyle = getComputedStyle(moment);
      const bodyStyle = getComputedStyle(document.body);
      return {
        displayFontSize: parseFloat(displayStyle.fontSize),
        displayWeight: displayStyle.fontWeight,
        displayLetterSpacing: parseFloat(displayStyle.letterSpacing),
        bodyFontSize: parseFloat(bodyStyle.fontSize),
        momentBackground: momentStyle.backgroundColor,
        momentColor: momentStyle.color,
        pageBackground: bodyStyle.backgroundColor,
      };
    });

    expect(metrics.displayFontSize).toBeGreaterThanOrEqual(32);
    expect(metrics.displayFontSize).toBeGreaterThan(metrics.bodyFontSize * 2);
    expect(metrics.displayWeight).toBe('400');
    expect(metrics.displayLetterSpacing).toBeLessThan(0);
    expect(metrics.momentBackground).not.toBe('rgba(0, 0, 0, 0)');
    expect(metrics.momentBackground).not.toBe(metrics.pageBackground);
    expect(metrics.momentColor).not.toBe(metrics.momentBackground);
  });

  test('keeps running text within the 65ch reading measure inside full-bleed blocks', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await injectSpecimen(page, HEADLINE);

    const measure = await page.evaluate(() => {
      const paragraph = document.querySelector('[data-testid="measure"]') as HTMLElement;
      const probe = document.createElement('span');
      probe.style.position = 'absolute';
      probe.style.visibility = 'hidden';
      probe.style.whiteSpace = 'nowrap';
      probe.style.width = '65ch';
      paragraph.appendChild(probe);
      const probeWidth = probe.getBoundingClientRect().width;
      probe.remove();
      return {
        clientWidth: paragraph.clientWidth,
        maxWidth: parseFloat(getComputedStyle(paragraph).maxWidth),
        probeWidth,
      };
    });

    expect(measure.maxWidth).toBeGreaterThan(0);
    expect(measure.clientWidth).toBeLessThanOrEqual(measure.maxWidth + 1);
    expect(Math.abs(measure.maxWidth - measure.probeWidth)).toBeLessThanOrEqual(1);
  });

  test('adapts the display scale to 320px without horizontal overflow (edge case 20)', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto('/');
    await injectSpecimen(page, LONG_HEADLINE);

    const layout = await page.evaluate(() => {
      const display = document.querySelector('[data-testid="display"]') as HTMLElement;
      const moment = document.querySelector('[data-testid="visual-moment"]') as HTMLElement;
      const range = document.createRange();
      range.selectNodeContents(display);
      const momentRect = moment.getBoundingClientRect();
      return {
        docScrollWidth: document.documentElement.scrollWidth,
        docClientWidth: document.documentElement.clientWidth,
        momentLeft: momentRect.left,
        momentRight: momentRect.right,
        viewportWidth: window.innerWidth,
        displayClientWidth: display.clientWidth,
        textWidth: range.getBoundingClientRect().width,
      };
    });

    expect(layout.docScrollWidth).toBeLessThanOrEqual(layout.docClientWidth + 1);
    expect(layout.momentLeft).toBeGreaterThanOrEqual(-1);
    expect(layout.momentRight).toBeLessThanOrEqual(layout.viewportWidth + 1);
    expect(layout.textWidth).toBeLessThanOrEqual(layout.displayClientWidth + 1);
  });

  test('disables entry reveals with reduced motion while keeping content visible (edge case 19)', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await injectSpecimen(page, HEADLINE);

    const reveal = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="reveal"]') as HTMLElement;
      const style = getComputedStyle(element);
      return {
        animationName: style.animationName,
        opacity: style.opacity,
        transform: style.transform,
      };
    });

    expect(reveal.animationName).toBe('none');
    expect(reveal.opacity).toBe('1');
    expect(reveal.transform).toBe('none');
  });

  test('animates entry reveals when motion is allowed', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await injectSpecimen(page, HEADLINE);

    const reveal = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="reveal"]') as HTMLElement;
      const style = getComputedStyle(element);
      return {
        animationName: style.animationName,
        duration: style.animationDuration,
      };
    });

    expect(reveal.animationName).toBe('reveal-in');
    expect(parseFloat(reveal.duration)).toBeGreaterThan(0);
  });
});
