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
  new Function("w", "d", "ls", "return " + script)(w, d, ls)(w, d, ls);
}
