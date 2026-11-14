"use client";

import { useEffect } from "react";
import ThemeSelect from "../ThemeSelect/ThemeSelect";
import { resolveActiveTheme, listenStorageChanges } from "../../theme/theme";

export default function ThemeProvider() {
  useEffect(() => {
    const theme = resolveActiveTheme();
    document.documentElement.classList.remove("theme-light", "theme-dark", "theme-system");
    document.documentElement.classList.add(`theme-${theme}`);
    const unlisten = listenStorageChanges((val) => {
      document.documentElement.classList.remove("theme-light", "theme-dark", "theme-system");
      document.documentElement.classList.add(`theme-${val}`);
    });
    const apply = (e: Event) => {
      const v = (e as CustomEvent).detail as 'light' | 'dark' | 'system';
      document.documentElement.classList.remove("theme-light", "theme-dark", "theme-system");
      document.documentElement.classList.add(`theme-${v}`);
    };
    window.addEventListener('theme-change', apply);
    return () => {
      unlisten();
      window.removeEventListener('theme-change', apply);
    };
  }, []);

  return (
    <div className="absolute top-4 right-4 z-50">
      <ThemeSelect />
    </div>
  );
}
