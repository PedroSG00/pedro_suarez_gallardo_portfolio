import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Logo from './Logo';

vi.mock('next/image', () => ({
  default: function MockImage({
    src,
    alt,
    width,
    height,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
  }) {
    return (
      <div
        data-testid="mock-image"
        data-src={src}
        data-alt={alt}
        data-width={width}
        data-height={height}
      />
    );
  },
}));

describe('Logo', () => {
  test('renders the letter D from the symbol id="d" of logo.svg', () => {
    render(<Logo href="/en" alt="Logo" />);
    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 64 64');
    const useEl = screen.getByTestId('logo-symbol');
    expect(useEl).toHaveAttribute('href', '#d');
  });

  test('navigates to the href indicated when activated', () => {
    render(<Logo href="/en" alt="Logo" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/en');
  });

  test('uses currentColor so the color adapts to the active theme without declaring its own colors', () => {
    render(<Logo href="/en" alt="Logo" />);
    const svg = screen.getByRole('img');
    expect(svg).not.toHaveAttribute('fill');
    expect(svg).not.toHaveAttribute('stroke');
    const useEl = screen.getByTestId('logo-symbol');
    expect(useEl).toHaveAttribute('fill', 'currentColor');
  });

  test('renders children passed by prop without hardcoding internal text', () => {
    render(
      <Logo href="/en">Pedro Suárez Gallardo</Logo>
    );
    expect(screen.getByText('Pedro Suárez Gallardo')).toBeInTheDocument();
  });

  test('renders image when src is provided', () => {
    render(<Logo href="/en" src="/logo.svg" alt="Logo" />);
    expect(screen.getByTestId('mock-image')).toBeInTheDocument();
  });

  test('renders null when href is missing', () => {
    // @ts-expect-error - Testing missing required prop href
    const { container } = render(<Logo />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders null when src, alt and children are missing', () => {
    const { container } = render(<Logo href="/en" />);
    expect(container).toBeEmptyDOMElement();
  });
});
