'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import type { Theme } from '@/lib/theme';
import { applyTheme, currentTheme, readStoredTheme, setTheme } from '@/lib/theme-dom';
import ThemeToggle from '@/components/ui/ThemeToggle/ThemeToggle';

export type ThemeControlProps = {
  label?: string;
};

export default function ThemeControl({ label }: ThemeControlProps) {
  const t = useTranslations('shared.theme');
  const ariaLabel = label ?? t('toggle');
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<Theme>('light');

  // The button only exists after mounting: on the server (SSR) there is no effect, so
  // an inert control is never rendered without JS. setMounted in the effect is the
  // only way to trigger the re-render that shows the button after hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const root = document.documentElement;
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)');
    const syncTheme = () => {
      const storedTheme = readStoredTheme();
      if (!root.dataset.theme && storedTheme) {
        applyTheme(root, storedTheme);
      }
      setThemeState(currentTheme(root, systemPreference.matches));
    };

    syncTheme();
    systemPreference.addEventListener('change', syncTheme);
    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      systemPreference.removeEventListener('change', syncTheme);
      themeObserver.disconnect();
    };
  }, []);

  if (!ariaLabel) {
    return null;
  }

  // Before mounting: only reserves space, no button (avoids layout shifts).
  if (!mounted) {
    return <span aria-hidden={true} />;
  }

  const handleToggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    try {
      setTheme(next);
      setThemeState(next);
    } catch {
      // setTheme failed: local state is not updated, current theme is kept.
    }
  };

  return (
    <ThemeToggle
      onToggle={handleToggle}
      pressed={theme === 'dark'}
      ariaLabel={ariaLabel}
    />
  );
}
