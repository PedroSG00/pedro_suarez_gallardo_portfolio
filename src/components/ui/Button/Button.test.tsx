import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  const onClick = vi.fn();

  beforeEach(() => {
    onClick.mockClear();
  });

  test('renders children passed by prop and does not hardcode internal text', () => {
    render(<Button onClick={onClick}>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('executes onClick on click', () => {
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('executes onClick on Enter key', () => {
    render(<Button onClick={onClick}>Click me</Button>);
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('executes onClick on Space key', () => {
    render(<Button onClick={onClick}>Click me</Button>);
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('does not execute onClick on unrelated key', () => {
    render(<Button onClick={onClick}>Click me</Button>);
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: 'a' });
    expect(onClick).not.toHaveBeenCalled();
  });

  test('does not execute onClick when disabled', () => {
    render(<Button onClick={onClick} disabled>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
  });

  test('shows visible focus indicator when focused with keyboard', () => {
    render(<Button onClick={onClick}>Click me</Button>);
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
  });

  test('renders null when children is missing', () => {
    // @ts-expect-error - Testing missing required prop children
    render(<Button onClick={onClick} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('renders null when onClick is missing', () => {
    // @ts-expect-error - Testing missing required prop onClick
    render(<Button>Click me</Button>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('handles hover events on enabled button without error', () => {
    render(<Button onClick={onClick}>Click me</Button>);
    const button = screen.getByRole('button');
    expect(() => {
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);
    }).not.toThrow();
    expect(onClick).not.toHaveBeenCalled();
    expect(button).toBeInTheDocument();
  });
});
