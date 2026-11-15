"use client";

import { useEffect } from "react";
import {
  applyTheme,
  getThemeFromDocument,
  listenStorageChanges,
} from "../../theme/theme";

/**
 * ThemeProvider — T19 (RF-6)
 * The inline <head> script is the only storage reader at boot and the only
 * one that sets the initial <html> class. This provider reads that class and
 * only touches the document when the theme changes (e.g. in another tab).
 */
export default function ThemeProvider() {
  useEffect(() => {
    // Read the class applied by the boot script (never localStorage).
    getThemeFromDocument();
    return listenStorageChanges((value) => applyTheme(value));
  }, []);

  return null;
}
