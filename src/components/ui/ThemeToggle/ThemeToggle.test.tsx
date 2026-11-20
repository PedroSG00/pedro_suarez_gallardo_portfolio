import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';

describe('ThemeToggle', () => {
  const onToggle = vi.fn();

  beforeEach(() => {
    onToggle.mockClear();
  });

  test('fires onToggle on click', () => {
    render(
      <ThemeToggle onToggle={onToggle} pressed={false} ariaLabel="Switch theme" />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  test('fires onToggle on Enter key', () => {
    render(
      <ThemeToggle onToggle={onToggle} pressed={false} ariaLabel="Switch theme" />
    );
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  test('fires onToggle on Space key', () => {
    render(
      <ThemeToggle onToggle={onToggle} pressed={false} ariaLabel="Switch theme" />
    );
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: ' ' });
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  test('aria-pressed reflects the value of pressed', () => {
    render(
      <ThemeToggle onToggle={onToggle} pressed={true} ariaLabel="Switch theme" />
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  test('changes the visible theme icon with the active mode', () => {
    const { rerender } = render(
      <ThemeToggle onToggle={onToggle} pressed={false} ariaLabel="Switch theme" />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-theme-icon', 'sun');

    rerender(
      <ThemeToggle onToggle={onToggle} pressed={true} ariaLabel="Switch theme" />
    );
    expect(button).toHaveAttribute('data-theme-icon', 'moon');
  });

  test('aria-label is announced with the text passed by prop', () => {
    render(
      <ThemeToggle
        onToggle={onToggle}
        pressed={false}
        ariaLabel="Cambiar a tema oscuro"
      />
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Cambiar a tema oscuro'
    );
  });

  test('shows no visible text, only symbol and accessibility attributes', () => {
    render(
      <ThemeToggle onToggle={onToggle} pressed={false} ariaLabel="Switch theme" />
    );
    const button = screen.getByRole('button');
    expect(button.textContent?.trim()).toBe('');
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('aria-pressed');
  });

  test('renders null when onToggle is missing', () => {
    // @ts-expect-error - Testing missing required prop onToggle
    const { container } = render(<ThemeToggle pressed={false} ariaLabel="Switch theme" />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders null when pressed is missing', () => {
    // @ts-expect-error - Testing missing required prop pressed
    const { container } = render(<ThemeToggle onToggle={onToggle} ariaLabel="Switch theme" />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders null when ariaLabel is missing', () => {
    // @ts-expect-error - Testing missing required prop ariaLabel
    const { container } = render(<ThemeToggle onToggle={onToggle} pressed={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});
