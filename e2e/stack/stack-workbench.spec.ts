import { expect, test } from '@playwright/test';
import en from '../../messages/en.json';
import es from '../../messages/es.json';
import { readStackCardBounds } from './stack-geometry.helpers';

const LOCALES = [
  { locale: 'en', copy: en.stack, nav: en.shared.nav },
  { locale: 'es', copy: es.stack, nav: es.shared.nav },
] as const;

const RESPONSIVE_VIEWPORTS = [
  { width: 320, height: 950 },
  { width: 390, height: 950 },
  { width: 768, height: 1080 },
  { width: 1023, height: 1050 },
  { width: 1024, height: 1050 },
  { width: 1920, height: 1200 },
  { width: 3840, height: 2160 },
] as const;

for (const { locale, copy, nav } of LOCALES) {
  test.describe(`/${locale}: Stack on a touch screen`, () => {
    test.use({ hasTouch: true, reducedMotion: 'reduce', viewport: { width: 320, height: 568 } });

    test('keeps the inspector beneath a visible navbar and pins it at the top when the navbar hides', async ({ page }) => {
      await page.goto(`/${locale}#stack`);
      const stack = page.getByRole('region', { name: nav.stack, exact: true });
      const canvas = stack.locator('[data-stack-canvas]');
      await expect(canvas).toHaveAttribute('data-stack-scene-ready', 'true');
      expect(await readStackCardBounds(canvas)).toHaveProperty('react');
      expect((await canvas.boundingBox())!.height).toBeLessThan(650);

      const view = stack.getByRole('switch', { name: copy.cad.view });
      const list = stack.getByRole('button', { name: copy.cad.list });
      await expect(view.getByText(copy.cad.view, { exact: true })).toBeVisible();
      await expect(list.getByText(copy.cad.list, { exact: true })).toBeVisible();
      await view.tap();
      const zoom = stack.getByRole('button', { name: copy.cad.zoom.in });
      const rotate = stack.getByRole('button', { name: copy.cad.rotation.left });
      for (const control of [view, list, zoom, rotate]) {
        const bounds = (await control.boundingBox())!;
        expect(bounds.width).toBeGreaterThanOrEqual(44);
        expect(bounds.height).toBeGreaterThanOrEqual(44);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
      }
      await zoom.tap();
      await expect(stack.getByRole('group', { name: copy.cad.zoom.label })).toContainText('105');
      await list.tap();
      await stack.getByRole('button', { name: copy.detail.select.replace('{name}', 'React') }).tap();
      await list.tap();

      const detail = stack.getByRole('region', { name: copy.detail.label });
      const detailDock = stack.locator('[data-stack-detail-dock]');
      const heading = detail.getByRole('heading', { name: 'React' });
      const eject = detail.getByRole('button', { name: copy.detail.eject });
      await expect(detail).toContainText(copy.technologies.react.description);
      const nameBox = (await heading.boundingBox())!;
      const ejectBox = (await eject.boundingBox())!;
      expect(Math.abs(nameBox.y + nameBox.height / 2 - ejectBox.y - ejectBox.height / 2)).toBeLessThan(2);

      await page.setViewportSize({ width: 667, height: 375 });
      const navbar = page.getByRole('banner');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await expect(navbar).not.toHaveAttribute('data-hidden');
      await page.mouse.move(8, 300);
      await page.mouse.wheel(0, 120);
      await expect(navbar).toHaveAttribute('data-hidden');
      await expect.poll(() => detailDock.boundingBox().then((bounds) => bounds!.y))
        .toBeLessThan(1);

      await page.mouse.wheel(0, -120);
      await expect(navbar).not.toHaveAttribute('data-hidden');
      const navbarHeight = await navbar.evaluate((element) => element.getBoundingClientRect().height);
      await expect.poll(() => detailDock.boundingBox().then((bounds) => bounds!.y))
        .toBeGreaterThanOrEqual(navbarHeight - 1);
      await expect.poll(() => detailDock.boundingBox().then((bounds) => bounds!.y))
        .toBeLessThanOrEqual(navbarHeight + 1);
      await eject.tap();
      await expect(heading).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(667);
    });
  });
}

for (const { locale, copy, nav } of LOCALES) {
  test.describe(`/${locale}: Stack workbench`, () => {
    test.use({ reducedMotion: 'reduce', deviceScaleFactor: 2 });

    test('responds to card hover without moving the target and clears inactive hover', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 1050 });
      await page.goto(`/${locale}#stack`);
      const stack = page.getByRole('region', { name: nav.stack, exact: true });
      const canvas = stack.locator('[data-stack-canvas]');
      await expect(canvas).toHaveAttribute('data-stack-scene-ready', 'true');
      await canvas.scrollIntoViewIfNeeded();
      const bounds = await canvas.boundingBox();
      if (!bounds) throw new Error('The drawing must be visible');
      const before = await readStackCardBounds(canvas);
      await page.mouse.move(
        bounds.x + before.react.x * bounds.width,
        bounds.y + before.react.y * bounds.height,
      );
      await expect(canvas).toHaveAttribute('data-stack-hovered-technology', 'react');
      await expect(canvas).toHaveCSS('cursor', 'grab');
      expect(await readStackCardBounds(canvas)).toEqual(before);
      await stack.getByRole('radio', { name: copy.categories.databases, exact: true }).check();
      await expect(canvas).toHaveAttribute('data-stack-hovered-technology', '');
      const frontend = stack.getByRole('radio', { name: copy.categories.frontend, exact: true });
      const option = frontend.locator('..');
      const ink = await option.evaluate((element) => getComputedStyle(element).color);
      await frontend.hover();
      await expect(option).toHaveCSS('background-color', ink);
      await expect(frontend).not.toBeChecked();
      await stack.getByRole('switch', { name: copy.cad.view }).focus();
      await page.keyboard.press('Shift+Tab');
      const activeFilter = stack.getByRole('radio', { checked: true });
      await expect(activeFilter).toBeFocused();
      await expect(activeFilter.locator('..')).toHaveCSS('outline-style', 'solid');
    });

    test('keeps icon controls and technology detail inside a responsive frame', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 1050 });
      await page.goto(`/${locale}#stack`);

      const stack = page.getByRole('region', { name: nav.stack, exact: true });
      const frame = stack.getByRole('region', { name: copy.cad.title });
      const canvas = frame.locator('[data-stack-canvas]');
      const view = frame.getByRole('switch', { name: copy.cad.view });
      const list = frame.getByRole('button', { name: copy.cad.list });
      const detail = frame.getByRole('region', { name: copy.detail.label });
      const detailDock = frame.locator('[data-stack-detail-dock]');

      await expect(canvas).toHaveAttribute('data-stack-scene-ready', 'true');
      await expect(frame.getByRole('group', { name: copy.filters.label })).toBeVisible();
      await expect(frame.getByRole('radio')).toHaveCount(7);
      await expect(view).toBeVisible();
      await expect(view.locator('svg')).toBeVisible();
      await expect(list).toBeVisible();
      await expect(list.locator('svg')).toBeVisible();
      await expect(detail).toBeVisible();
      await expect(frame.locator('[data-stack-drawing-note]')).toHaveText(copy.cad.hint);

      const filters = frame.getByRole('group', { name: copy.filters.label });
      const all = filters.getByRole('radio', { name: copy.filters.all, exact: true });
      const filterBox = await all.locator('xpath=..').boundingBox();
      const viewBox = await view.boundingBox();
      expect(filterBox).not.toBeNull();
      expect(viewBox).not.toBeNull();
      expect(Math.abs(filterBox!.y - viewBox!.y)).toBeLessThanOrEqual(1);
      await expect(all.locator('xpath=..').locator('svg')).toBeVisible();
      await expect(all.locator('xpath=..')).toHaveAttribute('title', copy.filters.all);
      await all.check();

      await view.click();
      const zoom = frame.getByRole('group', { name: copy.cad.zoom.label });
      const rotation = frame.getByRole('group', { name: copy.cad.rotation.label });
      await expect(zoom).toBeVisible();
      await expect(rotation).toBeVisible();
      const zoomIn = zoom.getByRole('button', { name: copy.cad.zoom.in });
      const rotateLeft = rotation.getByRole('button', { name: copy.cad.rotation.left });
      await expect(zoomIn.locator('svg')).toBeVisible();
      await expect(rotateLeft.locator('svg')).toBeVisible();
      await expect(zoomIn).toHaveAttribute(
        'title',
        copy.cad.zoom.in,
      );
      await expect(rotateLeft).toHaveAttribute(
        'title',
        copy.cad.rotation.left,
      );

      await list.click();
      await expect(list).toHaveAttribute('aria-expanded', 'true');
      await expect(detail).toBeVisible();
      const selectReact = copy.detail.select.replace(
        '{name}',
        copy.technologies.react.name,
      );
      await stack.getByRole('button', { name: selectReact }).click();
      await expect(detail).toContainText(copy.technologies.react.description);
      await expect(frame.locator('[data-stack-drawing-note]')).toHaveCount(0);
      const eject = detail.getByRole('button', { name: copy.detail.eject });
      await expect(eject.locator('svg')).toBeVisible();
      await list.click();
      await expect(list).toHaveAttribute('aria-expanded', 'false');

      for (const viewport of RESPONSIVE_VIEWPORTS) {
        await page.setViewportSize(viewport);
        await expect.poll(() =>
          page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(viewport.width);

        const frameBox = await frame.boundingBox();
        const canvasBox = await canvas.boundingBox();
        const detailBox = await detail.boundingBox();
        const dockBox = await detailDock.boundingBox();
        const controlBoxes = await frame.locator(
          '[data-stack-filter-option], [data-stack-view-controls] button, ' +
          '[data-stack-zoom-controls] button, [data-stack-rotation-controls] button, ' +
          '[data-stack-detail]',
        ).evaluateAll((elements) => elements.map((element) => {
          const { left, right } = element.getBoundingClientRect();
          return { left, right };
        }));

        expect(frameBox).not.toBeNull();
        expect(canvasBox).not.toBeNull();
        expect(detailBox).not.toBeNull();
        expect(dockBox).not.toBeNull();
        if (canvasBox && dockBox && viewport.width >= 1024) {
          expect(dockBox.x).toBeGreaterThanOrEqual(canvasBox.x + canvasBox.width);
          expect(Math.abs(dockBox.y - canvasBox.y)).toBeLessThanOrEqual(1);
        } else if (viewport.width < 1024) {
          expect(await detailDock.evaluate((element) => getComputedStyle(element).position)).toBe('sticky');
          await canvas.scrollIntoViewIfNeeded();
          await expect(detail).toBeInViewport();
          const dockRect = await detailDock.evaluate((element) => {
            const { top, bottom } = element.getBoundingClientRect();
            return { top, bottom };
          });
          expect(dockRect.top).toBeGreaterThanOrEqual(0);
          expect(dockRect.bottom).toBeLessThanOrEqual(viewport.height);
        }
        for (const { left, right } of controlBoxes) {
          expect(left).toBeGreaterThanOrEqual(0);
          expect(right).toBeLessThanOrEqual(viewport.width);
          expect(left).toBeGreaterThanOrEqual(frameBox!.x);
          expect(right).toBeLessThanOrEqual(frameBox!.x + frameBox!.width);
        }

        const detailFits = await detail.evaluate((element) =>
          element.scrollWidth <= element.clientWidth,
        );
        expect(detailFits).toBe(true);

        const bufferPixels = await canvas.evaluate((element: HTMLCanvasElement) =>
          element.width * element.height,
        );
        expect(bufferPixels).toBeLessThanOrEqual(3840 * 2160);
      }

      await page.setViewportSize({ width: 320, height: 950 });
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '200%';
      });
      await expect.poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(320);
      const zoomedDetailBox = await detail.boundingBox();
      expect(zoomedDetailBox).not.toBeNull();
      for (const content of [
        detail.getByRole('heading'),
        detail.locator('[data-stack-brand-mark]'),
        detail.locator('[data-stack-detail-description]'),
        eject,
      ]) {
        const bounds = await content.boundingBox();
        expect(bounds).not.toBeNull();
        expect(bounds!.x).toBeGreaterThanOrEqual(zoomedDetailBox!.x);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(
          zoomedDetailBox!.x + zoomedDetailBox!.width,
        );
      }
      expect(await detail.evaluate((element) =>
        element.scrollWidth <= element.clientWidth,
      )).toBe(true);

      await eject.click();
      await expect(detail).toContainText(copy.detail.emptyWithDrag);
      await expect.poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(320);
      expect(await detail.evaluate((element) =>
        element.scrollWidth <= element.clientWidth,
      )).toBe(true);
      await expect(frame.locator('[data-stack-drawing-note]')).toHaveText(copy.cad.hint);
      await expect(detail.getByRole('status')).toHaveText(
        copy.detail.feedback.ejected.replace(
          '{name}',
          copy.technologies.react.name,
        ),
      );
    });
  });
}
