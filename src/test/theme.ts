import { readFileSync } from "fs";
import { join } from "path";
import { parseTokenSheet, type TokenSheet } from "./theme-tokens";

const CSS_PATH = join(process.cwd(), "src/styles/globals.css");

export function readCssText(): string {
  return readFileSync(CSS_PATH, "utf8");
}

export function readTokenSheet(): TokenSheet {
  return parseTokenSheet(readCssText());
}

export interface ThemeScriptDeps {
  window: { addEventListener: (key: string, listener: unknown) => void };
  document: { documentElement: { dataset: Record<string, string> } };
  ls: { getItem: (key: string) => string | null };
}

export function runThemeScript(
  script: string,
  deps?: ThemeScriptDeps
): void {
  const w = deps?.window ?? window as unknown as ThemeScriptDeps["window"];
  const d = deps?.document ?? document as unknown as ThemeScriptDeps["document"];
  const ls = deps?.ls ?? window.localStorage;
  const r = d.documentElement;

  // Extrae la clave de almacenamiento del script generado por themeScript():
  // var k="psg-theme";
  const keyMatch = script.match(/var\s+k\s*=\s*"([^"]+)"/);
  const key = keyMatch?.[1] ?? "psg-theme";

  // Initial read (same logic as injected script)
  try {
    const s = ls.getItem(key);
    if (s === "light" || s === "dark") {
      r.dataset.theme = s;
    }
  } catch {}

  // pageshow listener (same logic as injected script)
  w.addEventListener("pageshow", (e: unknown) => {
    const event = e as { persisted?: boolean };
    if (!event.persisted) return;
    try {
      const v = ls.getItem(key);
      if (v === "light" || v === "dark") {
        r.dataset.theme = v;
      } else {
        delete r.dataset.theme;
      }
    } catch {}
  });
}
