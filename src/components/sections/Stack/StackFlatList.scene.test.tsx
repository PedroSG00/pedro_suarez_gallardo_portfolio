import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import enMessages from '../../../../messages/en.json';
import { STACK_TECHNOLOGIES } from '@/content/stack';
import { renderWithIntl } from '@/test/render-with-intl';
import StackFlatList from './StackFlatList';

vi.mock('./StackCanvas', () => ({
  default: ({
    onSceneStatusChange,
    onSelect,
  }: {
    onSceneStatusChange: (status: 'ready' | 'flat' | 'fallback') => void;
    onSelect: (id: string) => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={() => {
          onSceneStatusChange('ready');
          onSelect('react');
        }}
      >
        Select React from canvas
      </button>
      <button type="button" onClick={() => onSceneStatusChange('flat')}>
        Open a flat-only scene
      </button>
      <button type="button" onClick={() => onSceneStatusChange('fallback')}>
        Report unavailable WebGL
      </button>
    </div>
  ),
}));

describe('StackFlatList scene integration', () => {
  test('keeps the complete list accessible and shares canvas selection state', () => {
    renderWithIntl(<StackFlatList />, { locale: 'en' });

    fireEvent.click(
      screen.getByRole('button', { name: 'Select React from canvas' }),
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(
      STACK_TECHNOLOGIES.length,
    );
    expect(
      screen.getByRole('button', {
        name: `Select ${enMessages.stack.technologies.react.name}`,
      }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('region', { name: enMessages.stack.detail.label }),
    ).toHaveTextContent(enMessages.stack.technologies.react.description);
  });

  test('exposes view controls only with a scene and preserves the current technology', () => {
    const cad = enMessages.stack.cad;
    renderWithIntl(<StackFlatList />, { locale: 'en' });

    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Select React from canvas' }));

    const view = screen.getByRole('switch', { name: cad.view });
    expect(view).not.toBeChecked();
    fireEvent.click(view);
    expect(view).toBeChecked();
    expect(
      screen.getByRole('region', { name: enMessages.stack.detail.label }),
    ).toHaveTextContent(enMessages.stack.technologies.react.description);

    const list = screen.getByRole('button', { name: cad.list });
    expect(list).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(list);
    expect(list).toHaveAttribute('aria-expanded', 'true');
    expect(list).toBeVisible();
    fireEvent.click(list);
    expect(list).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(view);
    expect(view).not.toBeChecked();
  });

  test('keeps filters on the canvas and restores them after an unfiltered list visit', () => {
    const cad = enMessages.stack.cad;
    const filterLabel = enMessages.stack.filters.label;
    renderWithIntl(<StackFlatList />, { locale: 'en' });
    fireEvent.click(screen.getByRole('button', { name: 'Select React from canvas' }));

    const filters = screen.getByRole('group', { name: filterLabel });
    const frontendFilter = within(filters).getByRole('radio', {
      name: enMessages.stack.categories.frontend,
    });
    fireEvent.click(frontendFilter);

    const chartJsButton = screen.getByRole('button', {
      name: enMessages.stack.detail.select.replace(
        '{name}',
        enMessages.stack.technologies.chartJs.name,
      ),
    });
    expect(chartJsButton).toBeDisabled();

    const listToggle = screen.getByRole('button', { name: cad.list });
    fireEvent.click(listToggle);
    expect(screen.queryByRole('group', { name: filterLabel })).not.toBeInTheDocument();
    expect(chartJsButton).toBeEnabled();
    fireEvent.click(chartJsButton);
    expect(chartJsButton).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(listToggle);
    const restoredFilters = screen.getByRole('group', { name: filterLabel });
    expect(restoredFilters).toBeVisible();
    expect(within(restoredFilters).getByRole('radio', {
      name: enMessages.stack.categories.frontend,
    })).toBeChecked();
    expect(chartJsButton).toBeDisabled();
  });

  test('hides filters and leaves every list technology selectable without WebGL', () => {
    const filterLabel = enMessages.stack.filters.label;
    renderWithIntl(<StackFlatList />, { locale: 'en' });
    fireEvent.click(screen.getByRole('button', { name: 'Report unavailable WebGL' }));

    expect(screen.queryByRole('group', { name: filterLabel })).not.toBeInTheDocument();
    for (const technology of STACK_TECHNOLOGIES) {
      expect(
        screen.getByRole('button', {
          name: enMessages.stack.detail.select.replace(
            '{name}',
            enMessages.stack.technologies[technology.id].name,
          ),
        }),
      ).toBeEnabled();
    }
  });

  test('keeps the icon console and technology detail inside the active scene frame', () => {
    const cad = enMessages.stack.cad;
    renderWithIntl(<StackFlatList />, { locale: 'en' });
    fireEvent.click(screen.getByRole('button', { name: 'Select React from canvas' }));

    const frame = screen.getByRole('region', { name: cad.title });
    fireEvent.click(within(frame).getByRole('switch', { name: cad.view }));
    expect(within(frame).getByRole('group', { name: enMessages.stack.filters.label })).toBeVisible();
    expect(within(frame).getByRole('switch', { name: cad.view })).toBeVisible();
    expect(within(frame).getByRole('button', { name: cad.list })).toBeVisible();
    expect(within(frame).getByRole('group', { name: cad.zoom.label })).toBeVisible();
    expect(within(frame).getByRole('group', { name: cad.rotation.label })).toBeVisible();
    expect(
      within(frame).getByRole('region', { name: enMessages.stack.detail.label }),
    ).toBeVisible();
    expect(within(frame).getAllByRole('img', { hidden: true }).length).toBeGreaterThan(0);
  });

  test('keeps 2D and its list available without offering an unsupported projection', () => {
    const cad = enMessages.stack.cad;
    renderWithIntl(<StackFlatList />, { locale: 'en' });
    fireEvent.click(screen.getByRole('button', { name: 'Open a flat-only scene' }));
    expect(screen.queryByRole('switch', { name: cad.view })).not.toBeInTheDocument();
    expect(screen.getByText(cad.plane)).toBeVisible();
    expect(screen.getByRole('button', { name: cad.list })).toBeVisible();
    expect(screen.getAllByRole('listitem')).toHaveLength(STACK_TECHNOLOGIES.length);
  });
});
