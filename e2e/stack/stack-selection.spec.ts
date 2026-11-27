import { expect, test } from '@playwright/test';
import { canvasCoordinates, readStackCardBounds, SLOT, type Point } from './stack-geometry.helpers';
import { openStackScene, stackControls, STACK_COPY, STACK_LOCALES } from './stack.helpers';

function allFilter({ filters, messages }: ReturnType<typeof stackControls>) {
  return filters.getByRole('radio', { name: messages.filters.all, exact: true });
}

async function selectIn3D(scene: ReturnType<typeof stackControls>) {
  const { filters, view, listToggle, technology, messages } = scene;
  await filters.getByRole('radio', { name: messages.categories.frontend, exact: true }).check();
  await view.press('Space');
  await expect(view).toBeChecked();
  await listToggle.click();
  await technology('react').click();
  await expect(technology('react')).toHaveAttribute('aria-pressed', 'true');
  await listToggle.click();
}

async function expectInitialState(scene: ReturnType<typeof stackControls>) {
  await expect(scene.canvas).toHaveAttribute('data-stack-scene-mode', '2d');
  await expect(scene.view).not.toBeChecked();
  await expect(allFilter(scene)).toBeChecked();
  await expect(scene.detail).toContainText(scene.messages.detail.emptyWithDrag);
  await expect(scene.technology('react')).toHaveAttribute('aria-pressed', 'false');
}

for (const locale of STACK_LOCALES) {
  test.describe(`/${locale}: Stack accessible selection`, () => {
    test.use({ reducedMotion: 'reduce' });

    test('selects by keyboard, preserves detail through filtering and ejects', async ({
      page,
    }) => {
      const scene = await openStackScene(page, locale);
      const { detail, eject, filters, messages, technology } = scene;
      const react = technology('react');
      const description = messages.technologies.react.description;

      await react.focus();
      await page.keyboard.press('Enter');
      await expect(react).toHaveAttribute('aria-pressed', 'true');
      await expect(detail).toContainText(description);

      await filters
        .getByRole('radio', {
          name: messages.categories.testingCi,
        })
        .check();
      await expect(react).toBeDisabled();
      await expect(react).toHaveAttribute('aria-pressed', 'true');
      await expect(detail).toContainText(description);

      await page.keyboard.press('Tab'); // View mode.
      await page.keyboard.press('Tab'); // List view.
      await page.keyboard.press('Tab'); // Eject from the detail inspector.
      await expect(eject).toBeFocused();
      expect(await eject.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
      const focusStyle = await eject.evaluate((element) => {
        const styles = getComputedStyle(element);
        return {
          outlineStyle: styles.outlineStyle,
          outlineWidth: styles.outlineWidth,
          outlineColor: styles.outlineColor,
        };
      });
      expect(focusStyle.outlineStyle).not.toBe('none');
      expect(Number.parseFloat(focusStyle.outlineWidth)).toBeGreaterThan(0);
      expect(focusStyle.outlineColor).not.toBe('rgba(0, 0, 0, 0)');
      await page.keyboard.press('Enter');
      await expect(detail).toContainText(messages.detail.emptyWithDrag);
      await expect(detail.getByRole('status')).toHaveText(
        messages.detail.feedback.ejected.replace('{name}', messages.technologies.react.name),
      );
      await expect(react).toHaveAttribute('aria-pressed', 'false');
      await allFilter(scene).check();
      await expect(react).toBeEnabled();
    });

    test('starts a fresh Stack state after a new page entry', async ({ page }) => {
      const scene = await openStackScene(page, locale);
      await selectIn3D(scene);
      await page.reload();
      await expectInitialState(scene);
    });

    test('resets mode, filter and selection when the language changes', async ({
      page,
    }) => {
      await selectIn3D(await openStackScene(page, locale));
      const [alternateLocale, languageSwitch] = locale === 'en'
        ? ['es', 'Español'] as const
        : ['en', 'English'] as const;
      await page.getByRole('button', { name: languageSwitch }).click();
      await expect(page).toHaveURL(new RegExp(`/${alternateLocale}#stack$`));
      await expectInitialState(stackControls(page, alternateLocale));
    });
  });
}

test('animates an ejected technology from the slot back into the canvas', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const { canvas, detail, eject } = await openStackScene(page, 'en');
  const { en } = STACK_COPY;
  const at = await canvasCoordinates(canvas);
  await expect(canvas).toBeInViewport();

  const reactOrigin = (await readStackCardBounds(canvas)).react;
  const start = at(reactOrigin);
  const destination = at(SLOT);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(destination.x, destination.y, { steps: 6 });
  await page.mouse.up();
  await expect(detail).toContainText(en.stack.technologies.react.description);
  const sample = await eject.evaluateHandle((button) => ({
    result: new Promise<Point[]>((resolve) => {
      const canvas = button.closest('#stack')?.querySelector<HTMLCanvasElement>('[data-stack-canvas]');
      if (!canvas) throw new Error('The stack canvas is missing');
      button.addEventListener('click', () => {
        const positions: Point[] = [];
        const startedAt = performance.now();
        const record = () => {
          const { react } = JSON.parse(canvas.dataset.stackCardBounds!) as Record<string, Point>;
          if (react) positions.push(react);
          if (performance.now() - startedAt >= 350) resolve(positions);
          else requestAnimationFrame(record);
        };
        requestAnimationFrame(record);
      }, { once: true });
    }),
  }));
  await eject.click();
  await expect(detail).toContainText(en.stack.detail.emptyWithDrag);
  const positions = await sample.evaluate(({ result }) => result);
  await sample.dispose();
  expect(positions.length).toBeGreaterThan(2);
  const firstPosition = positions[0];
  const lastPosition = positions.at(-1);
  if (!firstPosition || !lastPosition) throw new Error('The ejection animation was not sampled');
  const distanceFromOrigin = (point: Point) =>
    Math.hypot(point.x - reactOrigin.x, point.y - reactOrigin.y);
  const startDistance = distanceFromOrigin(firstPosition);
  const endDistance = distanceFromOrigin(lastPosition);

  expect(startDistance).toBeGreaterThan(0.03);
  expect(positions.some((point) => {
    const distance = distanceFromOrigin(point);
    return distance > 0.01 && distance < startDistance - 0.01;
  })).toBe(true);
  expect(endDistance).toBeLessThan(startDistance - 0.01);
});
