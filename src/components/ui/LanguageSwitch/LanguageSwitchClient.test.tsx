import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitchClient from './LanguageSwitchClient';

const mockPush = vi.fn();
const mockUsePathname = vi.fn(() => '/en/about');
const mockUseSearchParams = vi.fn(() => new URLSearchParams());
const mockUseRouter = vi.fn(() => ({ push: mockPush }));

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
  useRouter: () => mockUseRouter(),
}));

vi.mock('./LanguageSwitch', () => ({
  default: function MockLanguageSwitch({ onChange, currentLang, ariaLabel }: {
    onChange: (lang: string) => void;
    currentLang: string;
    ariaLabel: string;
  }) {
    return (
      <button
        data-testid="mock-language-switch"
        onClick={() => onChange(currentLang === 'en' ? 'es' : 'en')}
        aria-pressed={currentLang === 'en'}
        aria-label={ariaLabel}
      />
    );
  },
}));

describe('LanguageSwitchClient', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  test('renders LanguageSwitch with currentLang and ariaLabel props', () => {
    render(<LanguageSwitchClient currentLang="en" ariaLabel="Switch to English" />);
    const button = screen.getByTestId('mock-language-switch');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Switch to English');
  });

  test('calls router.push with localized pathname on language change', () => {
    render(<LanguageSwitchClient currentLang="en" ariaLabel="Switch to English" />);
    const button = screen.getByTestId('mock-language-switch');
    fireEvent.click(button);
    expect(mockPush).toHaveBeenCalledWith('/es/about');
  });

  test('calls router.push with search params preserved', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('utm_source=linkedin'));
    render(<LanguageSwitchClient currentLang="en" ariaLabel="Switch to English" />);
    const button = screen.getByTestId('mock-language-switch');
    fireEvent.click(button);
    expect(mockPush).toHaveBeenCalledWith('/es/about?utm_source=linkedin');
  });
});
