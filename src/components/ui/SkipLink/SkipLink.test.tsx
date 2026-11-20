import { describe, expect, test, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithIntl } from '@/test/render-with-intl';
import SkipLink from './SkipLink';

describe('SkipLink', () => {
  test('renders a link with the label as accessible name and href="#main" by default', () => {
    renderWithIntl(<SkipLink />);
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main');
  });

  test('accepts a custom href', () => {
    renderWithIntl(<SkipLink label="Saltar al contenido" href="#section" />, {
      locale: 'es',
    });
    const link = screen.getByRole('link', { name: 'Saltar al contenido' });
    expect(link).toHaveAttribute('href', '#section');
  });

  test('renders an anchor element, not a button', () => {
    renderWithIntl(<SkipLink />);
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(link.tagName).toBe('A');
  });

  test('is not aria-hidden', () => {
    renderWithIntl(<SkipLink />);
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(link).not.toHaveAttribute('aria-hidden');
  });

  test('is focusable and does not have tabIndex -1', () => {
    renderWithIntl(<SkipLink />);
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(link).not.toHaveAttribute('tabindex', '-1');
    expect(link).toBeInTheDocument();
  });

  test('renders null when label is missing', () => {
    const { container } = renderWithIntl(<SkipLink label="" href="#main" />);
    expect(container).toBeEmptyDOMElement();
  });

  test('uses the active locale for its accessible name', () => {
    renderWithIntl(<SkipLink />, { locale: 'es' });
    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toBeInTheDocument();
  });

  test('click focuses the target element when it exists', () => {
    const target = document.createElement('div');
    target.id = 'main';
    document.body.appendChild(target);
    const focusSpy = vi.spyOn(target, 'focus');

    renderWithIntl(<SkipLink href="#main" />);
    const link = screen.getByRole('link', { name: 'Skip to content' });
    fireEvent.click(link);
    expect(focusSpy).toHaveBeenCalled();
  });

  test('click does not throw when target does not exist', () => {
    renderWithIntl(<SkipLink href="#nonexistent" />);
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(() => fireEvent.click(link)).not.toThrow();
  });
});
