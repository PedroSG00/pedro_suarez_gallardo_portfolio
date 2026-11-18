import { readFileSync } from "fs";
import { join } from "path";
import { parseTokenSheet, type TokenSheet } from "./theme-tokens";

export function readTokenSheet(): TokenSheet {
  const cssText = readFileSync(
    join(process.cwd(), "src/styles/globals.css"),
    "utf8"
  );
  return parseTokenSheet(cssText);
}
