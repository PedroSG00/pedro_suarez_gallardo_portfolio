import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitch from './LanguageSwitch';

describe('LanguageSwitch', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  test('fires onChange on click', () => {
    render(
      <LanguageSwitch
        onChange={onChange}
        currentLang="en"
        ariaLabel="Cambiar a español"
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test('fires onChange on Enter key', () => {
    render(
      <LanguageSwitch
        onChange={onChange}
        currentLang="en"
        ariaLabel="Cambiar a español"
      />
    );
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test('fires onChange on Space key', () => {
    render(
      <LanguageSwitch
        onChange={onChange}
        currentLang="en"
        ariaLabel="Cambiar a español"
      />
    );
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: ' ' });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test('aria-pressed reflects the value of currentLang', () => {
    render(
      <LanguageSwitch
        onChange={onChange}
        currentLang="en"
        ariaLabel="Cambiar a español"
      />
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  test('aria-label is announced with the text passed by prop', () => {
    render(
      <LanguageSwitch
        onChange={onChange}
        currentLang="es"
        ariaLabel="Switch to English"
      />
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Switch to English'
    );
  });

  test('shows no visible text, only symbol and accessibility attributes', () => {
    render(
      <LanguageSwitch
        onChange={onChange}
        currentLang="en"
        ariaLabel="Cambiar a español"
      />
    );
    const button = screen.getByRole('button');
    expect(button.textContent?.trim()).toBe('');
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('aria-pressed');
  });

  test('renders null when onChange is missing', () => {
    // @ts-expect-error - Testing missing required prop onChange
    const { container } = render(<LanguageSwitch currentLang="en" ariaLabel="Cambiar a español" />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders null when currentLang is missing', () => {
    // @ts-expect-error - Testing missing required prop currentLang
    const { container } = render(<LanguageSwitch onChange={onChange} ariaLabel="Cambiar a español" />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders null when ariaLabel is missing', () => {
    // @ts-expect-error - Testing missing required prop ariaLabel
    const { container } = render(<LanguageSwitch onChange={onChange} currentLang="en" />);
    expect(container).toBeEmptyDOMElement();
  });
});
