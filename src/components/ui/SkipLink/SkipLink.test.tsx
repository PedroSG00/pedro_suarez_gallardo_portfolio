import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkipLink from './SkipLink';

describe('SkipLink', () => {
  test('renders a link with the label as accessible name and href="#main" by default', () => {
    render(<SkipLink label="Skip to content" />);
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main');
  });

  test('accepts a custom href', () => {
    render(<SkipLink label="Saltar al contenido" href="#section" />);
    const link = screen.getByRole('link', { name: 'Saltar al contenido' });
    expect(link).toHaveAttribute('href', '#section');
  });

  test('renders an anchor element, not a button', () => {
    render(<SkipLink label="Skip to content" />);
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(link.tagName).toBe('A');
  });

  test('is not aria-hidden', () => {
    render(<SkipLink label="Skip to content" />);
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(link).not.toHaveAttribute('aria-hidden');
  });

  test('is focusable and does not have tabIndex -1', () => {
    render(<SkipLink label="Skip to content" />);
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(link).not.toHaveAttribute('tabindex', '-1');
    expect(link).toBeInTheDocument();
  });

  test('renders null when label is missing', () => {
    // @ts-expect-error - Testing missing required prop label
    const { container } = render(<SkipLink href="#main" />);
    expect(container).toBeEmptyDOMElement();
  });
});
