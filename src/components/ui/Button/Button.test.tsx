import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  const onClick = vi.fn();

  beforeEach(() => {
    onClick.mockClear();
  });

  test('shows its label, takes focus and activates only for click, Enter and Space', () => {
    render(<Button onClick={onClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    button.focus();
    expect(button).toHaveFocus();
    fireEvent.keyDown(button, { key: 'a' });
    expect(onClick).not.toHaveBeenCalled();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(button, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(3);
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

});
