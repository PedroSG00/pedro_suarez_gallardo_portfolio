import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LanguageSwitch from './LanguageSwitch';

const mockUsePathname = vi.fn(() => '/es');
const mockUseSearchParams = vi.fn(() => new URLSearchParams('utm_source=linkedin'));

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}));

describe('LanguageSwitch', () => {
  test('renders link to English when current locale is Spanish', () => {
    render(<LanguageSwitch locale="es" />);
    const link = screen.getByText('EN');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/en?utm_source=linkedin');
  });

  test('renders link to Spanish when current locale is English', () => {
    mockUsePathname.mockReturnValue('/en');
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    render(<LanguageSwitch locale="en" />);
    const link = screen.getByText('ES');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/es');
  });
});
