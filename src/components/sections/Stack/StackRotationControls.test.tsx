import { fireEvent, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { renderWithIntl } from '@/test/render-with-intl';
import StackRotationControls from './StackRotationControls';

test.each([
  {
    locale: 'en',
    group: '3D rotation',
    labels: ['Rotate left', 'Rotate right', 'Tilt up', 'Tilt down'],
  },
  {
    locale: 'es',
    group: 'Rotación 3D',
    labels: ['Girar a la izquierda', 'Girar a la derecha', 'Inclinar arriba', 'Inclinar abajo'],
  },
] as const)('exposes localized rotation controls in $locale', ({ locale, group, labels }) => {
  const onRotate = vi.fn();
  renderWithIntl(
    <StackRotationControls
      orientation={{ yaw: 0, pitch: 0 }}
      onRotate={onRotate}
    />,
    { locale },
  );

  const controls = screen.getByRole('group', { name: group });
  const buttons = labels.map((label) => screen.getByRole('button', { name: label }));
  expect(within(controls).getAllByRole('button')).toHaveLength(4);
  labels.forEach((label) => expect(screen.getByTitle(label)).toBeInTheDocument());

  fireEvent.click(buttons[0]);
  fireEvent.click(buttons[2]);
  expect(onRotate.mock.calls).toEqual([['left'], ['up']]);
});

test('keeps horizontal rotation continuous while blocking vertical rotation at its limit', () => {
  const onRotate = vi.fn();
  renderWithIntl(
    <StackRotationControls
      orientation={{ yaw: -180, pitch: 20 }}
      onRotate={onRotate}
    />,
    { locale: 'en' },
  );

  const left = screen.getByRole('button', { name: 'Rotate left' });
  const up = screen.getByRole('button', { name: 'Tilt up' });
  expect(left).toHaveAttribute('aria-disabled', 'false');
  expect(up).toHaveAttribute('aria-disabled', 'true');
  fireEvent.click(left);
  fireEvent.click(up);
  expect(onRotate).toHaveBeenCalledTimes(1);
  expect(onRotate).toHaveBeenCalledWith('left');
});
