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
