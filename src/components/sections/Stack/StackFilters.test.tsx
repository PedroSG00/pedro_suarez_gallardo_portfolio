import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import enMessages from '../../../../messages/en.json';
import esMessages from '../../../../messages/es.json';
import { STACK_CATEGORIES } from '@/content/stack';
import StackFilters, { type StackFilterOption } from './StackFilters';

const LOCALES = [
  {
    locale: 'en',
    categories: enMessages.stack.categories,
    filterLabel: 'Filter by category',
    allLabel: 'All',
  },
  {
    locale: 'es',
    categories: esMessages.stack.categories,
    filterLabel: 'Filtrar por categoría',
    allLabel: 'Todas',
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

const CATEGORY_IDS = [
  'frontend',
  'data-visualization',
  'backend-apis',
  'databases',
  'testing-ci',
  'ai-tools',
] as const;

function filterOptionsFor(
  localeData: (typeof LOCALES)[number],
): StackFilterOption[] {
  return [
    { id: 'all', label: localeData.allLabel },
    ...CATEGORY_IDS.map((id, index) => ({
      id,
      label: localeData.categories[CATEGORY_LABEL_KEYS[index]],
    })),
  ];
}

describe.each(LOCALES)('StackFilters in $locale', (localeData) => {
  test('exposes one accessible, localized radio group for all filters', () => {
    render(
      <StackFilters
        activeFilter="all"
        groupLabel={localeData.filterLabel}
        options={filterOptionsFor(localeData)}
        onFilterChange={vi.fn()}
      />,
    );

    const group = screen.getByRole('group', {
      name: localeData.filterLabel,
    });
    const radios = within(group).getAllByRole('radio');

    expect(radios).toHaveLength(STACK_CATEGORIES.length + 1);
    expect(within(group).getByRole('radio', { name: localeData.allLabel })).toBeChecked();
    for (const key of CATEGORY_LABEL_KEYS) {
      expect(
        within(group).getByRole('radio', { name: localeData.categories[key] }),
      ).toBeInTheDocument();
    }
  });

  test('reports the selected category through the native radio control', () => {
    const onFilterChange = vi.fn();

    render(
      <StackFilters
        activeFilter="all"
        groupLabel={localeData.filterLabel}
        options={filterOptionsFor(localeData)}
        onFilterChange={onFilterChange}
      />,
    );

    const group = screen.getByRole('group', { name: localeData.filterLabel });
    for (const [index, categoryLabelKey] of CATEGORY_LABEL_KEYS.entries()) {
      fireEvent.click(
        within(group).getByRole('radio', {
          name: localeData.categories[categoryLabelKey],
        }),
      );
      expect(onFilterChange).toHaveBeenLastCalledWith(CATEGORY_IDS[index]);
    }
  });

  test('reports All when selected from a category filter', () => {
    const onFilterChange = vi.fn();

    render(
      <StackFilters
        activeFilter="frontend"
        groupLabel={localeData.filterLabel}
        options={filterOptionsFor(localeData)}
        onFilterChange={onFilterChange}
      />,
    );

    const group = screen.getByRole('group', { name: localeData.filterLabel });
    fireEvent.click(within(group).getByRole('radio', { name: localeData.allLabel }));
    expect(onFilterChange).toHaveBeenLastCalledWith('all');
  });
});
