import { expect, test } from '@playwright/test';
import { canvasCoordinates, readStackCardBounds, SLOT, type Point } from './stack-geometry.helpers';
import { openStackScene, STACK_COPY, STACK_LOCALES } from './stack.helpers';

const { en, es } = STACK_COPY;

for (const locale of STACK_LOCALES) {
  const { detail: text, technologies, cad, categories, filters } = STACK_COPY[locale].stack;
  test.describe(`/${locale}: Stack card drag`, () => {
    test.use({ reducedMotion: 'reduce', viewport: { width: 1280, height: 1050 } });

    test('signals slot entry and exit, replaces the occupant and ejects by keyboard', async ({
      page,
    }) => {
      const { stack, detail, canvas, eject } = await openStackScene(page, locale);
      const at = await canvasCoordinates(canvas);
      await expect(detail).toContainText(text.emptyWithDrag);
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
      const returnedReact = (await canvasCoordinates(canvas))((await readStackCardBounds(canvas)).react);
      await page.mouse.click(returnedReact.x, returnedReact.y);
      await expect(detail).toHaveAttribute('data-slot-technology', 'react');
      await expect(detail).toContainText(technologies.react.description);

      await eject.press('Enter');
      await expect(detail.getByRole('status')).toHaveText(text.feedback.ejected.replace('{name}', 'React'));
      await expect(detail.getByRole('heading')).toHaveCount(0);
      const restored = await canvasCoordinates(canvas);
      await page.mouse.click(restored(SLOT).x, restored(SLOT).y);
      await expect(detail.getByRole('heading')).toHaveCount(0);
      const reactReturned = restored((await readStackCardBounds(canvas)).react);
      await page.mouse.click(reactReturned.x, reactReturned.y);
      await expect(detail).toContainText(technologies.react.description);
      await eject.click();
      const returned = (await canvasCoordinates(canvas))((await readStackCardBounds(canvas)).typescript);
      await page.mouse.click(returned.x, returned.y);
      await expect(detail).toContainText(technologies.typescript.description);
    });

    test('disabled cards stay put and dropping elsewhere keeps both the new position and the old selection', async ({
      page,
    }) => {
      const { stack, detail, canvas } = await openStackScene(page, locale);
      await stack.getByRole('radio', { name: categories.databases }).check();
      const at = await canvasCoordinates(canvas);
      const move = async (point: Point) => page.mouse.move(at(point).x, at(point).y, { steps: 4 });
      const filteredReact = (await readStackCardBounds(canvas)).react;
      await move(filteredReact);
      await page.mouse.down();
      await move(SLOT);
      await expect(canvas).not.toHaveAttribute('data-stack-drop-active', 'true');
      await page.mouse.up();
      await expect(detail.getByRole('heading')).toHaveCount(0);
      expect((await readStackCardBounds(canvas)).react).toEqual(filteredReact);

      await stack.getByRole('radio', { name: filters.all, exact: true }).check();
      const current = await canvasCoordinates(canvas);
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
      const { detail, canvas, view } = await openStackScene(page, locale);
      await view.click();
      await expect(canvas).toHaveAttribute('data-stack-projection', '1');
      const receive = async (id: 'react' | 'typescript') => {
        const at = await canvasCoordinates(canvas);
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
        text.feedback.replaced
          .replace('{name}', technologies.typescript.name)
          .replace('{replacedName}', technologies.react.name),
      );
      const reactReturned = (await canvasCoordinates(canvas))((await readStackCardBounds(canvas)).react);
      await page.mouse.click(reactReturned.x, reactReturned.y);
      await expect(detail).toHaveAttribute('data-slot-technology', 'react');
      await expect(view).toBeChecked();
    });
  });
}

test.describe('Stack touch gestures', () => {
  test.use({ hasTouch: true, reducedMotion: 'reduce', viewport: { width: 390, height: 950 } });

  test('drags from a card, taps without dragging and scrolls from the background', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Native touch gestures use Chromium CDP');
    const { detail, canvas } = await openStackScene(page, 'es');
    const session = await context.newCDPSession(page);
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd' | 'touchCancel', point?: Point) =>
      session.send('Input.dispatchTouchEvent', { type, touchPoints: point ? [point] : [] });
    const { react } = await readStackCardBounds(canvas);
    const at = await canvasCoordinates(canvas);
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
    const restored = (await canvasCoordinates(canvas))((await readStackCardBounds(canvas)).react);
    await page.touchscreen.tap(restored.x, restored.y);
    await expect(detail).toContainText(es.stack.technologies.react.description);
    await expect(detail.getByRole('status')).toHaveCount(0);

    const background = await canvasCoordinates(canvas);
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
    const { detail, canvas } = await openStackScene(page, 'en');
    await canvas.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
    const initial = await readStackCardBounds(canvas);
    const at = await canvasCoordinates(canvas);

    await page.mouse.move(at(initial.react).x, at(initial.react).y);
    await page.mouse.down();
    await page.mouse.move(at(SLOT).x, at(SLOT).y, { steps: 6 });
    await expect(canvas).toHaveAttribute('data-stack-drop-active', 'true');

    const whileHeld = await readStackCardBounds(canvas);
    const neighbor = whileHeld.typescript;
    await expect.poll(async () => {
      const { typescript } = await readStackCardBounds(canvas);
      return Math.hypot(typescript.x - neighbor.x, typescript.y - neighbor.y);
    }).toBeGreaterThan(0.0001);
    const { x, y } = (await readStackCardBounds(canvas)).react;
    expect(x).toBeCloseTo(SLOT.x, 2);
    expect(y).toBeCloseTo(SLOT.y, 2);
    expect(x).toBeCloseTo(whileHeld.react.x, 4);
    expect(y).toBeCloseTo(whileHeld.react.y, 4);
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
    await detail.evaluate(async (element) => {
      await Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished));
    });

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
