import { describe, expect, test } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithIntl } from '@/test/render-with-intl';
import SkipLink from './SkipLink';

describe('SkipLink', () => {
  test('exposes a focusable skip link and transfers focus to main when activated', () => {
    renderWithIntl(
      <>
        <SkipLink />
        <main id="main" tabIndex={-1}>Main content</main>
      </>,
    );
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(link).toHaveAttribute('href', '#main');
    expect(link.tagName).toBe('A');
    expect(link).not.toHaveAttribute('aria-hidden');
    expect(link).not.toHaveAttribute('tabindex', '-1');
    link.focus();
    expect(link).toHaveFocus();
    fireEvent.click(link);
    expect(screen.getByRole('main')).toHaveFocus();
  });

  test('accepts a custom href', () => {
    renderWithIntl(<SkipLink label="Saltar al contenido" href="#section" />, {
      locale: 'es',
    });
    const link = screen.getByRole('link', { name: 'Saltar al contenido' });
    expect(link).toHaveAttribute('href', '#section');
  });

  test('renders null when label is missing', () => {
    const { container } = renderWithIntl(<SkipLink label="" href="#main" />);
    expect(container).toBeEmptyDOMElement();
  });

  test('uses the active locale for its accessible name', () => {
    renderWithIntl(<SkipLink />, { locale: 'es' });
    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toBeInTheDocument();
  });

  test('click does not throw when target does not exist', () => {
    renderWithIntl(<SkipLink href="#nonexistent" />);
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(() => fireEvent.click(link)).not.toThrow();
  });
});
