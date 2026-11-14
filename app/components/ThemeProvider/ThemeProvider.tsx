"use client";

import { useEffect } from "react";
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
    return () => {
      unlisten();
    };
  }, []);

  return null;
}
