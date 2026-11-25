import { expect, test, type Page } from '@playwright/test';
import en from '../../messages/en.json';
import es from '../../messages/es.json';
import { readStackCardBounds } from './stack-geometry.helpers';

const SLOT = { x: 0.5, y: 0.5 };
type Point = { x: number; y: number };

async function openScene(page: Page, locale: 'en' | 'es', copy: typeof en | typeof es) {
  await page.goto(`/${locale}#stack`);
  const stack = page.getByRole('region', { name: copy.shared.nav.stack, exact: true });
  const detail = stack.getByRole('region', { name: copy.stack.detail.label });
  const canvas = stack.locator('[data-stack-canvas]');
  await expect(canvas).toHaveAttribute('data-stack-scene-ready', 'true');
  const coordinates = async () => {
    await canvas.scrollIntoViewIfNeeded();
    const bounds = await canvas.boundingBox();
    if (!bounds) throw new Error('Expected a visible canvas');
    return ({ x, y }: Point) => ({
      x: Math.round(bounds.x + bounds.width * x),
      y: Math.round(bounds.y + bounds.height * y),
    });
  };
  return { stack, detail, canvas, coordinates };
}

for (const { locale, copy } of [{ locale: 'en', copy: en }, { locale: 'es', copy: es }] as const) {
  const { detail: text, technologies, cad } = copy.stack;

  test.describe(`/${locale}: Stack card drag`, () => {
    test.use({ reducedMotion: 'reduce', viewport: { width: 1280, height: 1050 } });

    test('signals slot entry and exit, replaces the occupant and ejects by keyboard', async ({
      page,
    }) => {
      const { stack, detail, canvas, coordinates } = await openScene(page, locale, copy);
      const at = await coordinates();
      expect(await detail.textContent()).toContain(locale === 'en' ? 'drag it here' : 'arrástrala aquí');
      await expect(stack.getByText(cad.slot.replace('{name}', cad.empty), { exact: true })).toBeVisible();
      const move = async (point: Point) => page.mouse.move(at(point).x, at(point).y, { steps: 4 });
      const initialReact = (await readStackCardBounds(canvas)).react;

      await move(initialReact);
      await page.mouse.down();
      await move(SLOT);
      await expect(canvas).toHaveAttribute('data-stack-drop-active', 'true');
      await expect(detail.getByRole('heading')).toHaveCount(0);
      await move({ x: 0.5, y: 0.35 });
      await expect(canvas).toHaveAttribute('data-stack-drop-active', 'false');
      await move(SLOT);
      await page.mouse.up();
      await expect(canvas).toHaveAttribute('data-stack-drop-active', 'false');
      await expect(detail.getByRole('heading', { name: technologies.react.name })).toBeVisible();
      await expect(detail).toContainText(technologies.react.description);
      await expect(detail.getByRole('status')).toHaveText(text.feedback.received.replace('{name}', 'React'));
      await expect(stack.getByText(cad.slot.replace('{name}', 'React'), { exact: true })).toBeVisible();

      // The original position is empty while the card occupies the slot.
      await page.mouse.click(at(initialReact).x, at(initialReact).y);
      await expect(detail.getByRole('status')).toHaveText(text.feedback.received.replace('{name}', 'React'));

      await move((await readStackCardBounds(canvas)).typescript);
      await page.mouse.down();
      await move(SLOT);
      await page.mouse.up();
      await expect(detail).toHaveAttribute('data-slot-technology', 'typescript');
      await expect(detail.getByRole('heading', { name: technologies.typescript.name })).toBeVisible();
      await expect(detail).toContainText(technologies.typescript.description);
      await expect(detail.getByRole('status')).toHaveText(
        text.feedback.replaced
          .replace('{name}', technologies.typescript.name)
          .replace('{replacedName}', technologies.react.name),
      );
      const returnedReact = (await coordinates())((await readStackCardBounds(canvas)).react);
      await page.mouse.click(returnedReact.x, returnedReact.y);
      await expect(detail).toHaveAttribute('data-slot-technology', 'react');
      await expect(detail).toContainText(technologies.react.description);

      await detail.getByRole('button', { name: text.eject, exact: true }).press('Enter');
      await expect(detail.getByRole('status')).toHaveText(text.feedback.ejected.replace('{name}', 'React'));
      await expect(detail.getByRole('heading')).toHaveCount(0);
      const restored = await coordinates();
      await page.mouse.click(restored(SLOT).x, restored(SLOT).y);
      await expect(detail.getByRole('heading')).toHaveCount(0);
      const reactReturned = restored((await readStackCardBounds(canvas)).react);
      await page.mouse.click(reactReturned.x, reactReturned.y);
      await expect(detail).toContainText(technologies.react.description);
      await detail.getByRole('button', { name: text.eject, exact: true }).click();
      const returned = (await coordinates())((await readStackCardBounds(canvas)).typescript);
      await page.mouse.click(returned.x, returned.y);
      await expect(detail).toContainText(technologies.typescript.description);
    });

    test('disabled cards stay put and dropping elsewhere keeps both the new position and the old selection', async ({
      page,
    }) => {
      const { stack, detail, canvas, coordinates } = await openScene(page, locale, copy);
      await stack.getByRole('radio', { name: copy.stack.categories.databases }).check();
      const at = await coordinates();
      const move = async (point: Point) => page.mouse.move(at(point).x, at(point).y, { steps: 4 });
      const filteredReact = (await readStackCardBounds(canvas)).react;
      await move(filteredReact);
      await page.mouse.down();
      await move(SLOT);
      await expect(canvas).not.toHaveAttribute('data-stack-drop-active', 'true');
      await page.mouse.up();
      await expect(detail.getByRole('heading')).toHaveCount(0);

      await stack.getByRole('radio', { name: copy.stack.filters.all, exact: true }).check();
      const current = await coordinates();
      const initialPositions = await readStackCardBounds(canvas);
      await page.mouse.click(current(initialPositions.typescript).x, current(initialPositions.typescript).y);
      await expect(detail).toContainText(technologies.typescript.description);
      const destination = { x: 0.43, y: 0.35 };
      const reactStart = (await readStackCardBounds(canvas)).react;
      await page.mouse.move(current(reactStart).x, current(reactStart).y);
      await page.mouse.down();
      await page.mouse.move(current(destination).x, current(destination).y, { steps: 4 });
      await page.mouse.up();
      await expect(detail).toContainText(technologies.typescript.description);
      await page.mouse.click(current(reactStart).x, current(reactStart).y);
      await expect(detail).toContainText(technologies.typescript.description);
      await page.mouse.click(current(destination).x, current(destination).y);
      await expect(detail).toContainText(technologies.react.description);
  });

  test('receives a dragged card in perspective without switching the view', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
      const { stack, detail, canvas, coordinates } = await openScene(page, locale, copy);
      const view = stack.getByRole('switch', { name: cad.view });
      await view.click();
      await expect(canvas).toHaveAttribute('data-stack-projection', '1');
      const receive = async (id: 'react' | 'typescript') => {
        const at = await coordinates();
        const source = at((await readStackCardBounds(canvas))[id]);
        await page.mouse.move(source.x, source.y);
        await page.mouse.down();
        await page.mouse.move(at(SLOT).x, at(SLOT).y, { steps: 6 });
        await expect(canvas).toHaveAttribute('data-stack-drop-active', 'true');
        await page.mouse.up();
      };

      await receive('react');
      await expect(detail).toContainText(technologies.react.description);
      await receive('typescript');
      await expect(detail).toHaveAttribute('data-slot-technology', 'typescript');
      await expect(detail).toContainText(technologies.typescript.description);
      await expect(detail.getByRole('status')).toHaveText(
        copy.stack.detail.feedback.replaced
          .replace('{name}', technologies.typescript.name)
          .replace('{replacedName}', technologies.react.name),
      );
      const reactReturned = (await coordinates())((await readStackCardBounds(canvas)).react);
      await page.mouse.click(reactReturned.x, reactReturned.y);
      await expect(detail).toHaveAttribute('data-slot-technology', 'react');
      await expect(view).toBeChecked();
    });
  });
}

test.describe('Stack touch gestures', () => {
  test.use({ hasTouch: true, reducedMotion: 'reduce', viewport: { width: 390, height: 950 } });

  test('drags from a card, taps without dragging and scrolls from the background', async ({ page, context }) => {
    const { detail, canvas, coordinates } = await openScene(page, 'es', es);
    const session = await context.newCDPSession(page);
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd' | 'touchCancel', point?: Point) =>
      session.send('Input.dispatchTouchEvent', { type, touchPoints: point ? [point] : [] });
    const { react } = await readStackCardBounds(canvas);
    const at = await coordinates();
    const beforeDrag = await page.evaluate(() => window.scrollY);
    await touch('touchStart', at(react));
    await touch('touchMove', at({ x: 0.4, y: 0.3 }));
    await touch('touchMove', at(SLOT));
    await expect(canvas).toHaveAttribute('data-stack-drop-active', 'true');
    await touch('touchCancel');
    await expect(canvas).toHaveAttribute('data-stack-drop-active', 'false');
    await expect(detail.getByRole('heading')).toHaveCount(0);

    await touch('touchStart', at(react));
    await touch('touchMove', at({ x: 0.4, y: 0.3 }));
    await touch('touchMove', at(SLOT));
    await touch('touchEnd');
    expect(await page.evaluate(() => window.scrollY)).toBe(beforeDrag);
    await expect(detail.getByRole('status')).toHaveText(es.stack.detail.feedback.received.replace('{name}', 'React'));
    await detail.getByRole('button', { name: es.stack.detail.eject }).tap();
    await expect.poll(async () => (await readStackCardBounds(canvas)).react).toBeDefined();
    const restored = (await coordinates())((await readStackCardBounds(canvas)).react);
    await page.touchscreen.tap(restored.x, restored.y);
    await expect(detail).toContainText(es.stack.technologies.react.description);
    await expect(detail.getByRole('status')).toHaveCount(0);

    const background = await coordinates();
    const beforeScroll = await page.evaluate(() => window.scrollY);
    await touch('touchStart', background({ x: 0.5, y: 0.3 }));
    await touch('touchMove', background({ x: 0.5, y: 0.24 }));
    await touch('touchMove', background({ x: 0.5, y: 0.15 }));
    await touch('touchEnd');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(beforeScroll);
    await expect(detail).toContainText(es.stack.technologies.react.description);
    await session.detach();
  });
});

test.describe('Stack detail reveal', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1280, height: 1050 } });

  test('keeps the held card steady over the slot and the received description fully visible', async ({
    page,
  }) => {
    const { detail, canvas, coordinates } = await openScene(page, 'en', en);
    await canvas.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
    const initial = await readStackCardBounds(canvas);
    const at = await coordinates();

    await page.mouse.move(at(initial.react).x, at(initial.react).y);
    await page.mouse.down();
    await page.mouse.move(at(SLOT).x, at(SLOT).y, { steps: 6 });
    await expect(canvas).toHaveAttribute('data-stack-drop-active', 'true');

    const whileHeld = await readStackCardBounds(canvas);
    await expect.poll(async () => (await readStackCardBounds(canvas)).typescript).not.toEqual(
      whileHeld.typescript,
    );
    const { x, y } = (await readStackCardBounds(canvas)).react;
    expect(x).toBeCloseTo(SLOT.x, 2);
    expect(y).toBeCloseTo(SLOT.y, 2);
    await expect(detail.getByRole('heading')).toHaveCount(0);
    await page.mouse.up();

    const heading = detail.getByRole('heading', { name: en.stack.technologies.react.name });
    const description = detail.getByText(en.stack.technologies.react.description, { exact: true });
    const mark = detail.locator('[data-stack-brand-mark]');
    const feedback = detail.getByRole('status');
    await expect(heading).toBeVisible();
    await expect(description).toBeVisible();
    await expect(mark).toBeVisible();
    await expect(feedback).toHaveText(
      en.stack.detail.feedback.received.replace('{name}', 'React'),
    );
    await page.waitForTimeout(300);

    const panel = await detail.boundingBox();
    expect(panel).not.toBeNull();
    for (const content of [heading, mark, description, feedback]) {
      const bounds = await content.boundingBox();
      expect(bounds).not.toBeNull();
      const contentName = await content.textContent();
      expect(bounds!.x, `${contentName} left edge`).toBeGreaterThanOrEqual(panel!.x);
      expect(
        bounds!.x + bounds!.width,
        `${contentName} right edge`,
      ).toBeLessThanOrEqual(panel!.x + panel!.width);
      expect(bounds!.y, `${contentName} top edge`).toBeGreaterThanOrEqual(panel!.y);
      expect(
        bounds!.y + bounds!.height,
        `${contentName} bottom edge`,
      ).toBeLessThanOrEqual(panel!.y + panel!.height);
    }
    expect(await detail.evaluate((element) =>
      element.scrollWidth <= element.clientWidth &&
      element.scrollHeight <= element.clientHeight,
    )).toBe(true);
  });
});
