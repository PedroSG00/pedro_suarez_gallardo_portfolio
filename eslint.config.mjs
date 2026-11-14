import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactPlugin from "eslint-plugin-react";
import vitestPlugin from "eslint-plugin-vitest";
import testingLibraryPlugin from "eslint-plugin-testing-library";

const nonVisibleProps = [
  "className", "id", "href", "src", "type", "name", "value",
  "role", "lang", "dir", "alt", "title", "placeholder", "style",
  "method", "action", "target", "rel", "accept", "charset",
  "download", "for", "max", "maxlength", "min", "minlength",
  "pattern", "step", "width", "height",
  "autoCapitalize", "autoCorrect", "autoFocus", "checked",
  "cols", "disabled", "formAction", "formEncType", "formMethod",
  "formNoValidate", "formTarget", "list", "multiple", "readOnly",
  "required", "reversed", "selected", "size", "span", "wrap",
  "acceptCharset", "allowFullScreen", "async", "autoPlay",
  "capture", "cellPadding", "cellSpacing", "charSet", "classID",
  "colSpan", "contentEditable", "contextMenu", "crossOrigin",
  "dateTime", "defaultChecked", "defaultValue", "defer", "form",
  "frameBorder", "hidden", "high", "htmlFor", "inputMode",
  "integrity", "keyParams", "keyType", "low", "manifest",
  "marginHeight", "marginWidth", "noValidate", "nonce", "open",
  "optimum", "ping", "policy", "poster", "preload", "radiogroup",
  "rows", "rowSpan", "sandbox", "scope", "scoped", "seamless",
  "shape", "sizes", "spellCheck", "srcDoc", "srcLang", "srcSet",
  "start", "summary", "tabIndex", "useMap", "translate", "wmode",
  "onClick", "onChange", "onSubmit", "onKeyDown", "onKeyUp",
  "onFocus", "onBlur", "onMouseEnter", "onMouseLeave",
  "data-testid", "data-testids",
  "aria-label", "aria-labelledby", "aria-describedby",
  "aria-hidden", "aria-current", "aria-disabled", "aria-expanded",
  "aria-pressed", "aria-selected", "aria-checked", "aria-level",
  "aria-live", "aria-atomic", "aria-relevant", "aria-busy",
  "aria-controls", "aria-owns", "aria-flowto", "aria-posinset",
  "aria-setsize", "aria-valuemin", "aria-valuemax", "aria-valuenow",
  "aria-valuetext", "aria-roledescription", "aria-keyshortcuts",
  "aria-multiselectable", "aria-orientation", "aria-readonly",
  "aria-required", "aria-sort", "aria-modal", "aria-multiline",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // RNF1: no textos visibles hardcodeados en componentes de presentación.
    // Se aplica a componentes y páginas de origen (excluye tests).
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}"],
    plugins: {
      react: reactPlugin,
    },
    rules: {
      "react/jsx-no-literals": ["error", {
        noStrings: false,
        allowedStrings: nonVisibleProps,
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // RNF2: reglas específicas para archivos de test (Vitest + Testing Library).
  {
    files: ["**/*.test.{ts,tsx}"],
    plugins: {
      vitest: vitestPlugin,
      "testing-library": testingLibraryPlugin,
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
      ...testingLibraryPlugin.configs["flat/react"].rules,
    },
  },
]);

export default eslintConfig;
