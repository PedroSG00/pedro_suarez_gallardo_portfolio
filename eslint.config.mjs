import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactPlugin from "eslint-plugin-react";
import vitestPlugin from "@vitest/eslint-plugin";
import testingLibraryPlugin from "eslint-plugin-testing-library";
import jestDomPlugin from "eslint-plugin-jest-dom";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // All visible copy comes from messages; only JSX child text is restricted.
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}"],
    plugins: { react: reactPlugin },
    rules: {
      "react/jsx-no-literals": ["error", { noStrings: true, ignoreProps: true }],
    },
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    plugins: {
      vitest: vitestPlugin,
      "testing-library": testingLibraryPlugin,
      "jest-dom": jestDomPlugin,
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
      ...testingLibraryPlugin.configs["flat/react"].rules,
      ...jestDomPlugin.configs.recommended.rules,
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
