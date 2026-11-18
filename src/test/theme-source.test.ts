import { describe, expect, test } from "vitest";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { scanSource, type Violation } from "./source";

const FILE = (path: string, content: string) => ({ path, content });

function violationsFor(files: Array<{ path: string; content: string }>): Violation[] {
  return scanSource(files);
}

describe("scanSource: clean sources pass", () => {
  test("a source with no violations returns no violations", () => {
    const files = [
      FILE("src/components/ui/Button/Button.tsx", '<button className="p-4">Ok</button>'),
      FILE("src/lib/foo.ts", "export const x = 1;"),
      FILE("src/styles/globals.css", '@import "tailwindcss";\n--color-surface: var(--color-surface);'),
    ];
    expect(violationsFor(files)).toEqual([]);
  });

  test("multiples of 4px / 0.25rem pass", () => {
    const files = [
      FILE("src/components/foo.tsx", '<div className="p-4 m-8 gap-16 px-1 rem">x</div>'),
      FILE("src/styles/globals.css", "padding: 1rem; margin: var(--spacing); gap: calc(var(--spacing) * 2);"),
    ];
    expect(violationsFor(files)).toEqual([]);
  });

  test("zero passes", () => {
    const files = [FILE("src/components/foo.tsx", '<div className="p-0 m-0">x</div>')];
    expect(violationsFor(files)).toEqual([]);
  });
});

describe("scanSource: hex outside globals.css fails", () => {
  test("#fff outside globals.css fails with path and message", () => {
    const files = [FILE("src/components/foo.tsx", '<div style="color: #fff">x</div>')];
    const violations = violationsFor(files);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].path).toBe("src/components/foo.tsx");
    expect(violations[0].message).toContain("#fff");
  });

  test("hex inside globals.css is allowed", () => {
    const files = [FILE("src/styles/globals.css", "--color-surface: #f2efe6;")];
    expect(violationsFor(files)).toEqual([]);
  });

  test("hex inside a *.test.* file is allowed", () => {
    const files = [FILE("src/components/foo.test.ts", 'expect(color).toBe("#fff");')];
    expect(violationsFor(files)).toEqual([]);
  });

  test("hex inside src/test is allowed", () => {
    const files = [FILE("src/test/theme-tokens.test.ts", 'const c = "#f2efe6";')];
    expect(violationsFor(files)).toEqual([]);
  });
});

describe("scanSource: font families fail", () => {
  test.each(["font-sans", "font-serif"])("%s fails", (cls) => {
    const files = [FILE("src/components/foo.tsx", `<div className="${cls}">x</div>`)];
    const violations = violationsFor(files);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].message).toContain(cls);
  });
});

describe("scanSource: dark: variant fails", () => {
  test("dark:bg-black fails", () => {
    const files = [FILE("src/components/foo.tsx", '<div className="dark:bg-black">x</div>')];
    const violations = violationsFor(files);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].message).toContain("dark:");
  });
});

describe("scanSource: arbitrary spacing values fail", () => {
  test.each([
    "p-[10px]",
    "m-[3px]",
    "gap-[7px]",
    "inset-[5px]",
    "translate-[6px]",
  ])("%s fails", (cls) => {
    const files = [FILE("src/components/foo.tsx", `<div className="${cls}">x</div>`)];
    const violations = violationsFor(files);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].message).toContain(cls);
  });
});

describe("scanSource: CSS spacing properties fail", () => {
  test("padding: 10px in CSS fails", () => {
    const files = [FILE("src/styles/foo.css", ".a { padding: 10px; }")];
    const violations = violationsFor(files);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].message).toContain("padding");
  });

  test("margin-top: 6px in CSS fails", () => {
    const files = [FILE("src/styles/foo.css", ".a { margin-top: 6px; }")];
    const violations = violationsFor(files);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].message).toContain("margin-top");
  });
});

describe("scanSource: half-fraction spacing utilities fail", () => {
  test.each([
    "p-0.5", "m-1.5", "gap-2.5", "space-x-0.5", "inset-1.5",
    "size-3.5", "w-0.5", "h-2.5", "px-0.5", "my-1.5", "pt-2.5",
  ])("%s fails", (cls) => {
    const files = [FILE("src/components/foo.tsx", `<div className="${cls}">x</div>`)];
    const violations = violationsFor(files);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].message).toContain(cls);
  });
});

describe("scanSource: real tree is green", () => {
  test("no violations in src tree", () => {
    const files: Array<{ path: string; content: string }> = [];
    function walk(dir: string) {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(ts|tsx|css)$/.test(entry.name)) {
          files.push({ path: full, content: readFileSync(full, "utf8") });
        }
      }
    }
    walk(join(process.cwd(), "src"));
    const violations = scanSource(files);
    expect(violations).toEqual([]);
  });
});
