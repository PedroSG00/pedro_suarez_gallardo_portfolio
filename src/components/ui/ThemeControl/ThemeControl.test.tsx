import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import ThemeControl from './ThemeControl';

vi.mock('@/lib/theme-dom', () => ({
  currentTheme: vi.fn(() => 'light'),
  setTheme: vi.fn(),
}));

import { currentTheme, setTheme } from '@/lib/theme-dom';

const mockedSetTheme = setTheme as ReturnType<typeof vi.fn>;
const mockedCurrentTheme = currentTheme as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  mockedSetTheme.mockReset();
  mockedCurrentTheme.mockReset();
  mockedCurrentTheme.mockReturnValue('light');
  document.documentElement.removeAttribute('data-theme');
});

function renderControl(label = 'Cambiar tema') {
  return render(<ThemeControl label={label} />);
}

// Observa el primer commit (antes de que se flusheen los efectos pasivos):
// sin montar no debe haber botón, solo el espacio reservado.
function mountSync(label = 'Cambiar tema') {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  flushSync(() => {
    root.render(<ThemeControl label={label} />);
  });
  return { container, root };
}

describe('ThemeControl', () => {
  test('sin montar no renderiza botón; reserva el espacio', () => {
    const { container, root } = mountSync();
    // eslint-disable-next-line testing-library/no-node-access
    expect(container.querySelector('button')).toBeNull();
    // eslint-disable-next-line testing-library/no-node-access
    expect(container.querySelector('span[aria-hidden="true"]')).not.toBeNull();
    root.unmount();
    document.body.removeChild(container);
  });

  test('al montar aparece ThemeToggle con aria-pressed y la etiqueta traducida', () => {
    renderControl();
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed');
    expect(button).toHaveAttribute('aria-label', 'Cambiar tema');
  });

  test('al pulsar alterna aria-pressed y llama a setTheme', () => {
    renderControl();
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(button);
    expect(mockedSetTheme).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  test('setTheme que lanza no rompe y mantiene el tema actual', () => {
    mockedSetTheme.mockImplementation(() => {
      throw new Error('boom');
    });
    renderControl();
    const button = screen.getByRole('button');
    expect(() => fireEvent.click(button)).not.toThrow();
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  test('etiqueta ausente no renderiza botón', () => {
    renderControl('');
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
