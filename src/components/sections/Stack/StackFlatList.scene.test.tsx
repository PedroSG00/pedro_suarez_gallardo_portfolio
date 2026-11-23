import { fireEvent, screen } from '@testing-library/react';
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
    fireEvent.click(list);
    expect(list).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(view);
    expect(view).not.toBeChecked();
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
