import { describe, expect, test } from 'vitest';
import { screen, within } from '@testing-library/react';
import enMessages from '../../../../messages/en.json';
import esMessages from '../../../../messages/es.json';
import { STACK_TECHNOLOGIES } from '@/content/stack';
import { renderWithIntl } from '@/test/render-with-intl';
import Stack from './Stack';

const LOCALES = [
  { locale: 'en', messages: enMessages.stack, nav: enMessages.shared.nav },
  { locale: 'es', messages: esMessages.stack, nav: esMessages.shared.nav },
] as const;

const CATEGORY_LABEL_KEYS = [
  'frontend',
  'dataVisualization',
  'backendApis',
  'databases',
  'testingCi',
  'aiTools',
] as const;

describe.each(LOCALES)('Stack in $locale', ({ locale, messages, nav }) => {
  test('renders one section heading and the complete stack', () => {
    renderWithIntl(<Stack />, { locale });

    const region = screen.getByRole('region', { name: nav.stack });
    expect(region).toHaveAttribute('id', 'stack');

    const stack = within(region);
    const sectionHeadings = stack.getAllByRole('heading', { level: 2 });
    expect(sectionHeadings).toHaveLength(1);
    expect(sectionHeadings[0]).toHaveTextContent(`03 / ${nav.stack}`);

    expect(
      stack.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(CATEGORY_LABEL_KEYS.map((key) => messages.categories[key]));

    expect(stack.getAllByRole('list')).toHaveLength(6);
    expect(stack.getAllByRole('listitem')).toHaveLength(STACK_TECHNOLOGIES.length);

    for (const technology of STACK_TECHNOLOGIES) {
      const copy = messages.technologies[technology.id];
      expect(stack.getByText(copy.name, { exact: true })).toBeVisible();
      expect(stack.getByText(copy.description, { exact: true })).toBeVisible();
    }

    expect(stack.queryByRole('navigation')).not.toBeInTheDocument();
  });

  test('ships no filters, modes, zoom or rotation controls yet', () => {
    renderWithIntl(<Stack />, { locale });

    const region = screen.getByRole('region', { name: nav.stack });

    for (const role of [
      'button',
      'checkbox',
      'radio',
      'textbox',
      'combobox',
      'slider',
      'progressbar',
      'switch',
    ] as const) {
      expect(within(region).queryByRole(role)).not.toBeInTheDocument();
    }
    // eslint-disable-next-line testing-library/no-node-access
    expect(region.querySelector('canvas')).toBeNull();
  });
});
