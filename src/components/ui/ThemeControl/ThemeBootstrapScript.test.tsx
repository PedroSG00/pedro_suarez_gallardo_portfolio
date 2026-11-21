import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { ThemeBootstrapScript } from '@/components/ui/ThemeControl/ThemeBootstrapScript';

function renderServerScript(html: string): string {
  const originalWindow = global.window;
  try {
    global.window = undefined as unknown as Window & typeof globalThis;
    return renderToString(<ThemeBootstrapScript html={html} />);
  } finally {
    global.window = originalWindow;
  }
}

describe('ThemeBootstrapScript', () => {
  const originalWindow = global.window;

  afterEach(() => {
    global.window = originalWindow;
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  test('renders client script type when window is defined', () => {
    render(<ThemeBootstrapScript html="const x = 1;" />);
    // eslint-disable-next-line testing-library/no-node-access
    const script = document.getElementById('theme-bootstrap')!;
    expect(script).toHaveAttribute('type', 'text/plain');
  });

  test('renders server script type when window is undefined', () => {
    expect(renderServerScript('const x = 1;')).toContain(
      '<script id="theme-bootstrap" type="text/javascript">const x = 1;</script>',
    );
  });

  test('hydrates the initial theme script without errors or warnings', () => {
    const html = 'document.documentElement.dataset.theme = "dark"';
    const container = document.createElement('div');
    container.innerHTML = renderServerScript(html);
    document.body.append(container);
    const consoleError = vi.spyOn(console, 'error');
    const onRecoverableError = vi.fn();

    render(<ThemeBootstrapScript html={html} />, {
      container,
      hydrate: true,
      onRecoverableError,
    });

    expect(consoleError.mock.calls).toEqual([]);
    expect(onRecoverableError.mock.calls).toEqual([]);
  });

  test('sets innerHTML from html prop', () => {
    const html = 'document.documentElement.dataset.theme = "dark"';
    render(<ThemeBootstrapScript html={html} />);
    // eslint-disable-next-line testing-library/no-node-access
    const script = document.getElementById('theme-bootstrap')!;
    expect(script.innerHTML).toBe(html);
  });
});
