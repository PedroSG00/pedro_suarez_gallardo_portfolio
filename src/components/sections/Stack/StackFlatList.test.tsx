import { describe, expect, test } from 'vitest';
import { screen, within } from '@testing-library/react';
import enMessages from '../../../../messages/en.json';
import esMessages from '../../../../messages/es.json';
import {
  FEATURED_STACK_TECHNOLOGY_IDS,
  STACK_CATEGORIES,
  STACK_TECHNOLOGIES,
} from '@/content/stack';
import { renderWithIntl } from '@/test/render-with-intl';
import StackFlatList from './StackFlatList';

const LOCALES = [
  { locale: 'en', messages: enMessages.stack },
  { locale: 'es', messages: esMessages.stack },
] as const;

const CATEGORY_LABEL_KEYS = [
  'frontend',
  'dataVisualization',
  'backendApis',
  'databases',
  'testingCi',
  'aiTools',
] as const;

const FEATURED_IDS: ReadonlySet<string> = new Set(
  FEATURED_STACK_TECHNOLOGY_IDS,
);

const technologiesIn = (category: string) =>
  STACK_TECHNOLOGIES.filter((technology) => technology.category === category);

describe.each(LOCALES)('StackFlatList in $locale', ({ locale, messages }) => {
  test('renders the six categories and the 25 technologies in editorial order', () => {
    renderWithIntl(<StackFlatList />, { locale });

    expect(
      screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(CATEGORY_LABEL_KEYS.map((key) => messages.categories[key]));

    const lists = screen.getAllByRole('list');
    expect(lists).toHaveLength(STACK_CATEGORIES.length);

    lists.forEach((list, index) => {
      const category = STACK_CATEGORIES[index];
      expect(list).toHaveAccessibleName(messages.categories[CATEGORY_LABEL_KEYS[index]]);

      const technologies = technologiesIn(category);
      const items = within(list).getAllByRole('listitem');
      expect(items).toHaveLength(technologies.length);

      technologies.forEach((technology, position) => {
        const item = within(items[position]);
        const copy = messages.technologies[technology.id];
        expect(item.getByText(copy.name, { exact: true })).toBeVisible();
        expect(item.getByText(copy.description, { exact: true })).toBeVisible();
      });
    });

    const names = screen.getAllByText(/.+/, {
      selector: '[data-stack-technology-name]',
    });
    expect(names.map((name) => name.textContent)).toEqual(
      STACK_TECHNOLOGIES.map(
        (technology) => messages.technologies[technology.id].name,
      ),
    );
  });

  test('keeps every technology icon decorative for assistive technology', () => {
    renderWithIntl(<StackFlatList />, { locale });

    const icons = screen.getAllByRole('img', { hidden: true });
    expect(icons).toHaveLength(STACK_TECHNOLOGIES.length);
    for (const icon of icons) {
      expect(icon).toBeVisible();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveAttribute('focusable', 'false');
      expect(icon).not.toHaveAccessibleName();
    }
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  test('gives React and TypeScript visual priority without changing the reading order', () => {
    renderWithIntl(<StackFlatList />, { locale });

    const featured = STACK_TECHNOLOGIES.filter((technology) =>
      FEATURED_IDS.has(technology.id),
    ).map((technology) => messages.technologies[technology.id].name);

    expect(
      screen
        .getAllByText(/.+/, {
          selector: '[data-featured] [data-stack-technology-name]',
        })
        .map((name) => name.textContent),
    ).toEqual(featured);

    for (const technology of STACK_TECHNOLOGIES) {
      if (FEATURED_IDS.has(technology.id)) continue;
      expect(
        screen.queryByText(messages.technologies[technology.id].name, {
          selector: '[data-featured] [data-stack-technology-name]',
        }),
      ).not.toBeInTheDocument();
    }
  });

  test('stays informational without controls, levels or metrics', () => {
    renderWithIntl(<StackFlatList />, { locale });

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
      expect(screen.queryByRole(role)).not.toBeInTheDocument();
    }
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelector('canvas')).toBeNull();
  });
});
