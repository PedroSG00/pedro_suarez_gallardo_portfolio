import { expect, type Page } from '@playwright/test';
import en from '../../messages/en.json';
import es from '../../messages/es.json';

export const STACK_LOCALES = ['en', 'es'] as const;
export type StackLocale = (typeof STACK_LOCALES)[number];
export const STACK_COPY = { en, es };

export function stackControls(page: Page, locale: StackLocale) {
  const copy = STACK_COPY[locale];
  const messages = copy.stack;
  const stack = page.getByRole('region', { name: copy.shared.nav.stack, exact: true });
  const detail = stack.getByRole('region', { name: messages.detail.label });
  return {
    copy,
    messages,
    stack,
    detail,
    canvas: stack.locator('[data-stack-canvas]'),
    frame: stack.getByRole('region', { name: messages.cad.title }),
    filters: stack.getByRole('group', { name: messages.filters.label }),
    view: stack.getByRole('switch', { name: messages.cad.view }),
    listToggle: stack.getByRole('button', { name: messages.cad.list }),
    eject: detail.getByRole('button', { name: messages.detail.eject, exact: true }),
    technology: (id: keyof typeof messages.technologies) =>
      stack.getByRole('button', {
        name: messages.detail.select.replace('{name}', messages.technologies[id].name),
        exact: true,
      }),
  };
}

export async function openStackScene(page: Page, locale: StackLocale, anchor = '#stack') {
  await page.goto(`/${locale}${anchor}`);
  const controls = stackControls(page, locale);
  // First render also waits for the local card textures and WebGL initialization.
  await expect(controls.canvas).toHaveAttribute('data-stack-scene-ready', 'true', { timeout: 10_000 });
  return controls;
}
