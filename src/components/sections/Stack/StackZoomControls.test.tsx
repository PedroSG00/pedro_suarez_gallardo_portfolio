import { fireEvent, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { renderWithIntl } from '@/test/render-with-intl';
import StackZoomControls from './StackZoomControls';

test('announces the zoom level and ignores the unavailable direction', () => {
  const onZoom = vi.fn();
  renderWithIntl(<StackZoomControls level={110} onZoom={onZoom} />, { locale: 'en' });
  const closer = screen.getByRole('button', { name: 'Zoom in' });
  const farther = screen.getByRole('button', { name: 'Zoom out' });
  expect(screen.getByRole('status')).toHaveTextContent('110%');
  expect(closer).toHaveAttribute('aria-disabled', 'true');
  fireEvent.click(closer);
  expect(onZoom).not.toHaveBeenCalled();
  fireEvent.click(farther);
  expect(onZoom).toHaveBeenCalledWith('out');
});
