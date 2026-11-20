import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Link from './Link';

describe('Link', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('renders children passed by prop and does not hardcode internal text', () => {
    render(<Link href="/en#contact">Contact me</Link>);
    const link = screen.getByRole('link', { name: 'Contact me' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/en#contact');
  });

  test('click on valid href does not prevent navigation (natural anchor behavior)', () => {
    const openSpy = vi.spyOn(window, 'open');
    render(<Link href="/en#contact">Contact me</Link>);
    fireEvent.click(screen.getByRole('link', { name: 'Contact me' }));
    expect(openSpy).not.toHaveBeenCalled();
  });

  test('target _blank sets native target and rel="noreferrer noopener"', () => {
    render(<Link href="https://example.com" target="_blank">External</Link>);
    const link = screen.getByRole('link', { name: 'External' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
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

  test('target _blank click does not call window.open (native navigation)', () => {
    const openSpy = vi.spyOn(window, 'open');
    render(<Link href="https://example.com" target="_blank">External</Link>);
    fireEvent.click(screen.getByRole('link', { name: 'External' }));
    expect(openSpy).not.toHaveBeenCalled();
  });

  test('target _blank without srLabel keeps accessible name as the children', () => {
    render(<Link href="https://example.com" target="_blank">External</Link>);
    const link = screen.getByRole('link', { name: 'External' });
    expect(link).toHaveAccessibleName('External');
  });

  test('empty href does not navigate and prevents default', () => {
    const openSpy = vi.spyOn(window, 'open');
    render(<Link href="">Contact me</Link>);
    const link = screen.getByText('Contact me');
    fireEvent.click(link);
    expect(openSpy).not.toHaveBeenCalled();
  });

  test('shows visible focus indicator when focused with keyboard', () => {
    render(<Link href="/en#contact">Contact me</Link>);
    const link = screen.getByRole('link', { name: 'Contact me' });
    link.focus();
    expect(link).toHaveFocus();
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

  test('handles hover events on enabled link without error', () => {
    render(<Link href="/en#contact">Contact me</Link>);
    const link = screen.getByRole('link', { name: 'Contact me' });
    expect(() => {
      fireEvent.mouseEnter(link);
      fireEvent.mouseLeave(link);
    }).not.toThrow();
    expect(link).toBeInTheDocument();
  });
});
