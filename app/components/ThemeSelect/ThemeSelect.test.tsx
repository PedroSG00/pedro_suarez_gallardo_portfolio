/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import ThemeSelect from './ThemeSelect';

// T-04: Tests fallidos (rojo) antes de implementar ThemeSelect.tsx
// RF cubiertos: RF-3, RF-5, RF-6

describe('ThemeSelect component — T-04 (red first)', () => {
  it('select is hidden by default', () => {
    render(<ThemeSelect />);
    const select = screen.queryByRole('combobox');
    expect(select).toBeNull();
  });

  it('reveals select after clicking theme button', () => {
    render(<ThemeSelect />);
    fireEvent.click(screen.getByRole('button', { name: /theme/i }));
    expect(screen.getByRole('combobox')).not.toBeDisabled();
  });

  it('has light, dark, and system options', () => {
    render(<ThemeSelect />);
    fireEvent.click(screen.getByRole('button', { name: /theme/i }));
    const options = screen.getAllByRole('option');
    expect(options.length).toBe(3);
  });

  it('applies change immediately without reload', () => {
    render(<ThemeSelect />);
    fireEvent.click(screen.getByRole('button', { name: /theme/i }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'dark' } });
    expect(window.localStorage.getItem('theme')).toBe('dark');
  });

  it('uses accessible names from i18n EN/ES', () => {
    render(<ThemeSelect lang="es" />);
    expect(screen.getByLabelText(/tema/i)).toBeInTheDocument();
  });

  it('renders a dialog element for show()', () => {
    render(<ThemeSelect />);
    expect(document.getElementById('theme-dialog')).toBeInTheDocument();
  });
});
