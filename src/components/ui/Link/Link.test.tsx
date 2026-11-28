import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Link from './Link';

describe('Link', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('exposes its destination, takes focus and allows native navigation', () => {
    const openSpy = vi.spyOn(window, 'open');
    render(<Link href="/en#contact">Contact me</Link>);
    const link = screen.getByRole('link', { name: 'Contact me' });
    expect(link).toHaveAttribute('href', '/en#contact');
    link.focus();
    expect(link).toHaveFocus();
    expect(fireEvent.click(link)).toBe(true);
    expect(openSpy).not.toHaveBeenCalled();
  });

  test('opens external links natively with safe rel and no invented announcement', () => {
    const openSpy = vi.spyOn(window, 'open');
    render(<Link href="https://example.com" target="_blank">External</Link>);
    const link = screen.getByRole('link', { name: 'External' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
    expect(link).toHaveAccessibleName('External');
    expect(fireEvent.click(link)).toBe(true);
    expect(openSpy).not.toHaveBeenCalled();
  });

  test('target _blank announces srLabel to screen readers, not as visible text', () => {
    render(
      <Link href="https://example.com" target="_blank" srLabel="opens in a new tab">
        External
      </Link>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAccessibleName('External opens in a new tab');

    const visible = screen.getAllByText('External');
    expect(visible).toHaveLength(1);
  });

  test('keeps the native link contract with custom presentation', () => {
    render(
      <Link href="https://example.com" target="_blank" className="prominent">
        External
      </Link>
    );
    const link = screen.getByRole('link', { name: 'External' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
    expect(fireEvent.click(link)).toBe(true);
  });

  test('empty href does not navigate and prevents default', () => {
    const openSpy = vi.spyOn(window, 'open');
    render(<Link href="">Contact me</Link>);
    const link = screen.getByText('Contact me');
    expect(fireEvent.click(link)).toBe(false);
    expect(openSpy).not.toHaveBeenCalled();
  });

  test('renders null when children is missing', () => {
    // @ts-expect-error - Testing missing required prop children
    render(<Link href="/en#contact" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  test('renders null when href is missing', () => {
    // @ts-expect-error - Testing missing required prop href
    render(<Link>Contact me</Link>);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

});
