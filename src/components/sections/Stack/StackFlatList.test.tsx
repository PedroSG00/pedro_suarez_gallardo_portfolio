import { describe, expect, test } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
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
  {
    locale: 'en',
    messages: enMessages.stack,
    filterLabel: 'Filter by category',
    allLabel: 'All',
    detailLabel: 'Technology detail',
    emptyDetail: 'Select a card to see what it is.',
    ejectLabel: 'Eject',
    selectName: (name: string) => `Select ${name}`,
  },
  {
    locale: 'es',
    messages: esMessages.stack,
    filterLabel: 'Filtrar por categoría',
    allLabel: 'Todas',
    detailLabel: 'Detalle de tecnología',
    emptyDetail: 'Selecciona una carta para ver qué es.',
    ejectLabel: 'Expulsar',
    selectName: (name: string) => `Seleccionar ${name}`,
  },
] as const;

const CATEGORY_LABEL_KEYS = [
  'frontend',
  'dataVisualization',
  'backendApis',
  'databases',
  'testingCi',
  'aiTools',
] as const;

const makeDataTransfer = (id: string) => ({
  types: ['application/x-stack-technology'],
  getData: (type: string) => (type === 'application/x-stack-technology' ? id : ''),
});

const FEATURED_IDS: ReadonlySet<string> = new Set(
  FEATURED_STACK_TECHNOLOGY_IDS,
);

const technologiesIn = (category: string) =>
  STACK_TECHNOLOGIES.filter((technology) => technology.category === category);

describe.each(LOCALES)(
  'StackFlatList in $locale',
  ({
    locale,
    messages,
    filterLabel,
    allLabel,
    detailLabel,
    emptyDetail,
    ejectLabel,
    selectName,
  }) => {
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
        expect(item.queryByText(copy.description, { exact: true })).not.toBeInTheDocument();
      });
    });

    const names = screen.getAllByRole('button');
    expect(names.map((button) => button.textContent)).toEqual(
      STACK_TECHNOLOGIES.map((technology) => messages.technologies[technology.id].name),
    );
  });

  test('renders each own brand mark as decorative for assistive technology', () => {
    renderWithIntl(<StackFlatList />, { locale });

    const marks = screen.getAllByRole('img', { hidden: true });
    expect(marks).toHaveLength(STACK_TECHNOLOGIES.length);

    STACK_TECHNOLOGIES.forEach((technology, index) => {
      const mark = marks[index];

      expect(mark).toBeVisible();
      expect(mark).toHaveAttribute(
        'src',
        technology.id === 'cSharp' || technology.id === 'playwright'
          ? `/stack/${technology.id}-flat.svg`
          : technology.brandMark,
      );
      expect(mark).toHaveAttribute('alt', '');
      expect(mark).toHaveAttribute('aria-hidden', 'true');
      expect(mark).not.toHaveAccessibleName();
    });

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  test('gives React and TypeScript visual priority without changing the reading order', () => {
    renderWithIntl(<StackFlatList />, { locale });

    const featured = STACK_TECHNOLOGIES.filter((technology) =>
      FEATURED_IDS.has(technology.id),
    ).map((technology) => messages.technologies[technology.id].name);

    expect(
      screen.getAllByText(/.+/, {
        selector: '[data-featured] [data-stack-select]',
      }).map((name) => name.textContent),
    ).toEqual(featured);

    for (const technology of STACK_TECHNOLOGIES) {
      if (FEATURED_IDS.has(technology.id)) continue;
      expect(
        screen.queryByText(messages.technologies[technology.id].name, {
          selector: '[data-featured] [data-stack-select]',
        }),
      ).not.toBeInTheDocument();
    }
  });

  test('starts with All selected and exposes one localized active filter', () => {
    renderWithIntl(<StackFlatList />, { locale });

    const group = screen.getByRole('group', { name: filterLabel });
    const radios = within(group).getAllByRole('radio');

    expect(radios).toHaveLength(STACK_CATEGORIES.length + 1);
    expect(within(group).getByRole('radio', { name: allLabel })).toBeChecked();
    expect(within(group).getAllByRole('radio', { checked: true })).toHaveLength(1);
    for (const key of CATEGORY_LABEL_KEYS) {
      expect(
        within(group).getByRole('radio', { name: messages.categories[key] }),
      ).not.toBeChecked();
    }
  });

  test('starts with the approved empty detail slot in both languages', () => {
    renderWithIntl(<StackFlatList />, { locale });

    const detail = screen.getByRole('region', { name: detailLabel });
    expect(detail).toHaveTextContent(emptyDetail);
    expect(screen.queryByRole('button', { name: ejectLabel })).not.toBeInTheDocument();
  });

  test('selects, replaces the detail and ejects back to the list', () => {
    renderWithIntl(<StackFlatList />, { locale });

    const detail = screen.getByRole('region', { name: detailLabel });
    const reactCopy = messages.technologies.react;
    const reactButton = screen.getByRole('button', {
      name: selectName(reactCopy.name),
    });
    fireEvent.click(reactButton);

    expect(reactButton).toHaveAttribute('aria-pressed', 'true');
    expect(detail).toHaveTextContent(reactCopy.name);
    expect(detail).toHaveTextContent(reactCopy.description);

    const nodeCopy = messages.technologies.nodeJs;
    const nodeButton = screen.getByRole('button', { name: selectName(nodeCopy.name) });
    fireEvent.click(nodeButton);
    expect(nodeButton).toHaveAttribute('aria-pressed', 'true');
    expect(reactButton).toHaveAttribute('aria-pressed', 'false');
    expect(detail).toHaveTextContent(nodeCopy.description);
    expect(detail).not.toHaveTextContent(reactCopy.description);

    const eject = within(detail).getByRole('button', { name: ejectLabel });
    fireEvent.click(eject);

    expect(detail).toHaveTextContent(emptyDetail);
    expect(nodeButton).toHaveAttribute('aria-pressed', 'false');
    expect(nodeButton).toBeEnabled();
    expect(screen.getByText(nodeCopy.name, { exact: true })).toBeVisible();

    fireEvent.click(nodeButton);
    fireEvent.click(within(detail).getByRole('button', { name: ejectLabel }));
    expect(detail).toHaveTextContent(emptyDetail);
    expect(nodeButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('replaces the current technology when another card is dropped into the occupied slot', () => {
    renderWithIntl(<StackFlatList />, { locale });

    const detail = screen.getByRole('region', { name: detailLabel });
    fireEvent.click(
      screen.getByRole('button', {
        name: selectName(messages.technologies.react.name),
      }),
    );
    fireEvent.drop(detail, {
      dataTransfer: makeDataTransfer('nodeJs'),
    });

    expect(detail).toHaveAttribute('data-slot-technology', 'nodeJs');
    expect(detail).toHaveTextContent(messages.technologies.nodeJs.description);
    expect(detail).toHaveTextContent(
      messages.detail.feedback.replaced
        .replace('{name}', messages.technologies.nodeJs.name)
        .replace('{replacedName}', messages.technologies.react.name),
    );
    expect(
      screen.getByRole('button', {
        name: selectName(messages.technologies.nodeJs.name),
      }),
    ).toBeEnabled();
  });

  test('confirms an accepted drop and exposes its description and eject action', () => {
    renderWithIntl(<StackFlatList />, { locale });

    const detail = screen.getByRole('region', { name: detailLabel });
    fireEvent.drop(detail, { dataTransfer: makeDataTransfer('react') });

    expect(detail).toHaveAttribute('data-slot-technology', 'react');
    expect(detail).toHaveTextContent(messages.technologies.react.name);
    expect(detail).toHaveTextContent(messages.technologies.react.description);
    expect(detail).toHaveTextContent(
      messages.detail.feedback.received.replace(
        '{name}',
        messages.technologies.react.name,
      ),
    );
    expect(within(detail).getByRole('button', { name: ejectLabel })).toBeVisible();
  });

  test('keeps selected detail while its category is filtered out and disables that card', () => {
    renderWithIntl(<StackFlatList />, { locale });

    const detail = screen.getByRole('region', { name: detailLabel });
    const reactCopy = messages.technologies.react;
    const reactButton = screen.getByRole('button', {
      name: selectName(reactCopy.name),
    });
    fireEvent.click(reactButton);

    const filters = screen.getByRole('group', { name: filterLabel });
    fireEvent.click(
      within(filters).getByRole('radio', {
        name: messages.categories.testingCi,
      }),
    );

    expect(reactButton).toBeDisabled();
    expect(reactButton).toHaveAttribute('aria-pressed', 'true');
    expect(detail).toHaveTextContent(reactCopy.description);
  });

  test('filters prominence without hiding or reordering technologies and restores All', () => {
    renderWithIntl(<StackFlatList />, { locale });

    const group = screen.getByRole('group', { name: filterLabel });
    const all = within(group).getByRole('radio', { name: allLabel });
    const filteredItems = screen.getAllByRole('listitem');
    const readingOrder = filteredItems.map((item) => item.textContent);
    expect(filteredItems).toHaveLength(STACK_TECHNOLOGIES.length);

    const testingFilter = within(group).getByRole('radio', {
      name: messages.categories.testingCi,
    });
    fireEvent.click(testingFilter);

    expect(testingFilter).toBeChecked();
    expect(within(group).getAllByRole('radio', { checked: true })).toHaveLength(1);
    expect(screen.getAllByRole('listitem')).toHaveLength(STACK_TECHNOLOGIES.length);
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(
      readingOrder,
    );
    for (const item of screen.getAllByRole('listitem')) {
      expect(item).toBeVisible();
    }

    fireEvent.click(screen.getByText(messages.technologies.react.name, { exact: true }));
    expect(testingFilter).toBeChecked();

    fireEvent.click(all);
    expect(all).toBeChecked();
    expect(within(group).getAllByRole('radio', { checked: true })).toHaveLength(1);
  });

  test('exposes one localized selection button per technology without canvas controls', () => {
    renderWithIntl(<StackFlatList />, { locale });

    expect(screen.getAllByRole('button')).toHaveLength(STACK_TECHNOLOGIES.length);
    expect(screen.getAllByRole('radio')).toHaveLength(STACK_CATEGORIES.length + 1);

    for (const technology of STACK_TECHNOLOGIES) {
      expect(
        screen.getByRole('button', {
          name: selectName(messages.technologies[technology.id].name),
        }),
      ).toBeVisible();
    }

    for (const role of [
      'checkbox',
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
  },
);
