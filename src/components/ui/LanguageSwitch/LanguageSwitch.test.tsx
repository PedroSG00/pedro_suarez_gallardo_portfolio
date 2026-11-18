import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import LanguageSwitch from './LanguageSwitch';

describe('LanguageSwitch', () => {
  test('renders link to English when current locale is Spanish', () => {
    render(<LanguageSwitch locale="es" />);
    const link = screen.getByText('EN');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/en');
  });

  test('renders link to Spanish when current locale is English', () => {
    render(<LanguageSwitch locale="en" />);
    const link = screen.getByText('ES');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/es');
  });
});
