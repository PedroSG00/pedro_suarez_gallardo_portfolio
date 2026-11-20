'use client';

import { useEffect, useState } from 'react';

import type { Theme } from '@/lib/theme';
import { currentTheme, setTheme } from '@/lib/theme-dom';
import ThemeToggle from '@/components/ui/ThemeToggle/ThemeToggle';

export type ThemeControlProps = {
  label: string;
};

export default function ThemeControl({ label }: ThemeControlProps) {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<Theme>('light');

  // El botón solo existe tras montar: en el servidor (SSR) no hay efecto, así que
  // nunca se renderiza un control inerte sin JS. setMounted en el efecto es el
  // único modo de disparar el re-render que muestra el botón tras la hidratación.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setThemeState(currentTheme(document.documentElement, false));
  }, []);

  if (!label) {
    return null;
  }

  // Antes de montar: solo reserva el espacio, sin botón (evita saltos de layout).
  if (!mounted) {
    return <span aria-hidden={true} />;
  }

  const handleToggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    try {
      setTheme(next);
      setThemeState(next);
    } catch {
      // setTheme falló: no se actualiza el estado local, se mantiene el tema actual.
    }
  };

  return (
    <ThemeToggle
      onToggle={handleToggle}
      pressed={theme === 'dark'}
      ariaLabel={label}
    />
  );
}
