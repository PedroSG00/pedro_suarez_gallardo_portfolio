import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';

describe('ThemeToggle', () => {
  const onToggle = vi.fn();

  beforeEach(() => {
    onToggle.mockClear();
  });

  test('activates by click, Enter and Space but ignores unrelated keys', () => {
    render(
      <ThemeToggle onToggle={onToggle} pressed={false} ariaLabel="Switch theme" />
    );
    const button = screen.getByRole('button', { name: 'Switch theme' });
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
    button.focus();
    expect(button).toHaveFocus();
    fireEvent.keyDown(button, { key: 'a' });
    expect(onToggle).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onToggle).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(button, { key: ' ' });
    expect(onToggle).toHaveBeenCalledTimes(3);
  });

  test('announces the supplied label and state without visible text and updates the mode icon', () => {
    const { rerender } = render(
      <ThemeToggle onToggle={onToggle} pressed={false} ariaLabel="Cambiar a tema oscuro" />
    );
    const button = screen.getByRole('button', { name: 'Cambiar a tema oscuro' });
    expect(button).toHaveTextContent(/^$/);
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveAttribute('data-theme-icon', 'sun');

    rerender(
      <ThemeToggle onToggle={onToggle} pressed={true} ariaLabel="Switch theme" />
    );
    expect(button).toHaveAccessibleName('Switch theme');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('data-theme-icon', 'moon');
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
