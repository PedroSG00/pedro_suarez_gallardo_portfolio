import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeBootstrapScript } from './ThemeBootstrapScript';

describe('ThemeBootstrapScript', () => {
  const originalWindow = global.window;

  afterEach(() => {
    global.window = originalWindow;
    vi.restoreAllMocks();
  });

  test('renders client script type when window is defined', () => {
    const { container } = render(<ThemeBootstrapScript html="const x = 1;" />);
    const script = container.querySelector('script')!;
    expect(script.getAttribute('type')).toBe('text/plain');
    expect(script.getAttribute('id')).toBe('theme-bootstrap');
  });

  test('renders server script type when window is undefined', () => {
    global.window = undefined as unknown as Window;
    const { container } = render(<ThemeBootstrapScript html="const x = 1;" />);
    const script = container.querySelector('script')!;
    expect(script.getAttribute('type')).toBe('text/javascript');
  });

  test('suppresses hydration warning', () => {
    const { container } = render(<ThemeBootstrapScript html="const x = 1;" />);
    const script = container.querySelector('script')!;
    expect(script).toHaveAttribute('suppress-hydration-warning');
  });

  test('sets innerHTML from html prop', () => {
    const html = 'document.documentElement.dataset.theme = "dark"';
    const { container } = render(<ThemeBootstrapScript html={html} />);
    const script = container.querySelector('script')!;
    expect(script.innerHTML).toBe(html);
  });
});
