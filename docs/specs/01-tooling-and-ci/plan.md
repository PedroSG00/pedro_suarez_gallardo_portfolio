# Plan de implementación — Spec 01 (Tooling y CI)

- **Fecha:** 2026-11-17
- **Rama:** `01` → PR a `main`
- **Spec de referencia:** `docs/specs/01-tooling-and-ci/spec.md`
- **Estado:** pendiente de aprobación

Este plan no añade requisitos: ejecuta los RF de la spec 01. Cuando algo no se
puede confirmar de antemano, se marca «verificar en ejecución» y se para si
falla, en vez de afirmarlo. El orden de ejecución y las dependencias entre tareas
viven en `tasks.md`; las fases de este plan agrupan contenido, no secuencia.

## 0. Punto de partida verificado

| Elemento | Estado real |
|---|---|
| `app/` | `layout.tsx` (importa `@/styles/globals.css`, usa `next/font/google` Geist y Geist Mono), `page.tsx` (div vacío con clases Tailwind), `styles/globals.css` de 0 bytes |
| Alias `@/*` | `./*` en `tsconfig.json`: `@/styles/globals.css` apunta a la raíz y no resuelve; el build está roto |
| `package.json` | `lint` sin `--max-warnings`, `typecheck` sin `typegen`, `test` sin cobertura, sin `preinstall`; `engines.node: ">=24"`; `pnpm@12.16.1` |
| `tsconfig.json` | `include` con comodines (`**/*.ts`, `**/*.tsx`, `**/*.mts`), `paths` a la raíz |
| `vitest.config.mts` | recoge `app/**` y `tests/lib/**`, sin umbrales, sin setup, sin alias |
| `playwright.config.ts` | 6 proyectos (chrome, firefox, webkit, 2 móviles), `testDir: tests/e2e`, `testMatch: *.e2e.ts`, `pnpm dev`, `reuseExistingServer` activo en local |
| `eslint.config.mjs` | `eslint-plugin-vitest` (deprecado), `jsx-no-literals` con `noStrings: false` y unos 120 `allowedStrings`, sin `coverage` en los ignores |
| `pnpm-workspace.yaml` | solo `allowBuilds: { sharp: false, unrs-resolver: false }` |
| `sonar-project.properties` | `sonar.sources=app, middleware, proxy.ts` (dos inexistentes), exclusiones obsoletas, comentarios en castellano |
| `next.config.ts` | `skipTrailingSlashRedirect`, `experimental.agentFeedback`, loader `@tailwindcss/turbopack` para `*.css` |
| CI | `.github/workflows/build.yml`: un job `Analyze`, Node 24 en duro, SHAs de v4/v4/v4/v6 |
| Node / pnpm locales | `v26.12.0` / `12.16.1` |
| Repo en GitHub | público (necesario para que los rulesets se apliquen); sin rulesets |

Dos detalles que condicionan el plan:

1. No hay `postcss.config.mjs`: Tailwind se compila con el loader de Turbopack
   declarado en `next.config.ts`. No se toca salvo que falle.
2. El índice de git ya guarda LF; los avisos de CRLF vienen del working copy.
   Añadir `.gitattributes` no renormaliza el repositorio.

## 1. Inventario de cambios

**Nuevos:** `.node-version`, `.gitattributes`, `check-package-manager.mjs`,
`src/styles/globals.css`, `src/test/setup.ts`, `e2e/home.spec.ts`,
`.github/workflows/ci.yml`.

**Movidos con `git mv` (conservando historial):** `app/layout.tsx` →
`src/app/layout.tsx`, `app/page.tsx` → `src/app/page.tsx`,
`app/styles/globals.css` → `src/styles/globals.css` (y se le pone contenido).

**Borrados:** `app/styles/` (queda vacío), `.github/workflows/build.yml`,
`@types/jest` y `eslint-plugin-vitest` del manifiesto.

**Modificados:** `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`,
`tsconfig.json`, `vitest.config.mts`, `playwright.config.ts`,
`eslint.config.mjs`, `sonar-project.properties`, `.gitignore` y
`docs/roadmap.md` (solo la casilla, al final).

**No se toca:** `next.config.ts`, `dependabot.yml`, el contenido de
`src/app/page.tsx` y `layout.tsx` más allá del movimiento, ni nada de la
sección de proyectos.

## 2. Fase 1 — Entorno reproducible (RF-1)

### `.node-version`

```text
26.12.0
```

### `.gitattributes`

```gitattributes
* text=auto eol=lf
```

### `check-package-manager.mjs`

Nuevo, en la raíz. Node puro, sin imports, sin TypeScript: corre en `preinstall`
antes de instalar y queda fuera de `src/` y de la cobertura.

```js
const agent = process.env.npm_config_user_agent ?? '';

if (!agent.startsWith('pnpm/')) {
  console.error('');
  console.error('This repository only supports pnpm.');
  console.error('Install dependencies with: pnpm install');
  console.error(`Detected package manager: ${agent || 'unknown'}`);
  console.error('');
  process.exit(1);
}
```

Límite conocido y aceptado: `pnpm install --ignore-scripts` evita la guarda.

### `package.json` (bloque)

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "preinstall": "node check-package-manager.mjs",
  "lint": "eslint . --max-warnings=0",
  "typecheck": "next typegen && tsc --noEmit",
  "test": "vitest run --coverage",
  "test:watch": "vitest",
  "test:e2e": "pnpm build && playwright test"
},
"engines": { "node": ">=26.12.0 <27" },
"packageManager": "pnpm@12.16.1"
```

Dependencias: altas netas `@testing-library/dom@10.4.2`,
`eslint-plugin-jest-dom@5.10.2`, `@vitest/eslint-plugin@1.5.4` y
`@vitejs/plugin-react@6.3.0`; bajas `@types/jest` y `eslint-plugin-vitest`.
Ninguna otra cambia.

### `pnpm-workspace.yaml`

```yaml
engineStrict: true
allowBuilds:
  sharp: false
  unrs-resolver: false
  # + las entradas que pnpm exija, revisadas una a una
```

`allowBuilds` es el único punto con incertidumbre real: con `strictDepBuilds`
activo, el primer `pnpm install` aborta y lista todo paquete con build script no
declarado. **Protocolo:** leer la lista, revisar qué hace cada paquete
(esperables: `@tailwindcss/oxide`, `sharp`, `unrs-resolver`, algún nativo de
Vitest o Playwright) y añadir cada uno con decisión explícita `true` o `false`.
Si aparece uno que no se reconoce, se para y se pregunta.

### Comandos

```bash
pnpm install                 # actualiza pnpm-lock.yaml
pnpm install --frozen-lockfile   # debe salir limpio
```

**Verificar en ejecución:** que `engineStrict` aborta con un Node fuera de rango
(negativo en la fase 7) y que `strictDepBuilds` es `true` por defecto en pnpm
12.16.1; si no lo fuera, se declara explícitamente en `pnpm-workspace.yaml`.

## 3. Fase 2 — `src/` y tipos (RF-2, RF-3)

### Movimiento

```bash
git mv app src/app
git mv src/app/styles src/styles
```

`app/styles/` queda vacío y desaparece del árbol.

### `src/styles/globals.css`

```css
@import "tailwindcss";
```

Los tokens de tema llegan en la spec 03.

### `tsconfig.json`

```json
"paths": { "@/*": ["./src/*"] },
"include": [
  "next-env.d.ts",
  ".next/types/**/*.ts",
  ".next/dev/types/**/*.ts",
  "next.config.ts",
  "playwright.config.ts",
  "vitest.config.mts",
  "src/**/*.ts",
  "src/**/*.tsx",
  "e2e/**/*.ts"
],
"exclude": ["node_modules"]
```

`strict: true` se mantiene. Los `.mjs` (`eslint.config.mjs`,
`check-package-manager.mjs`) no pasan por TypeScript por construcción.

### Comandos

```bash
rm -rf .next next-env.d.ts   # clon limpio simulado
pnpm build
pnpm typecheck
```

**Verificar en ejecución:** que `next typegen` crea los tipos de ruta sin
compilar la app y que el CSS emitido contiene las utilidades de
`src/app/page.tsx` (`flex`, `bg-zinc-50`, `dark:bg-black`...).

## 4. Fase 3 — Lint (RF-4)

`eslint.config.mjs` se reescribe manteniendo la estructura `defineConfig([...])`:

```js
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
    // Todo texto visible sale de messages/ (spec 02). Solo texto hijo.
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}"],
    plugins: { react: reactPlugin },
    rules: {
      "react/jsx-no-literals": ["error", { noStrings: true }],
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
```

Antes de escribirlo se comprueba en `node_modules` el nombre exacto de los
configs exportados por `@vitest/eslint-plugin@1.5.4` y
`eslint-plugin-jest-dom@5.10.2` (`recommended` frente a `flat/recommended`
cambia entre versiones). Ese detalle no se da por hecho.

Comando: `pnpm lint`.

**Verificar en ejecución:** que `eslint .` recoge `.mjs` y no emite avisos con
la configuración nueva.

## 5. Fase 4 — Tests y cobertura (RF-5, RF-6)

### `vitest.config.mts`

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true }, // Vite 8: alias desde tsconfig, sin plugin extra
  test: {
    environment: 'jsdom',
    passWithNoTests: true,
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      // Lista única: espejo de sonar.coverage.exclusions.
      // Cambiar los dos ficheros a la vez.
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/app/**',
        'src/test/**',
        'src/content/**',
      ],
      reportOnFailure: true,
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
    },
  },
});
```

### `src/test/setup.ts`

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

### Tests

No se escribe ningún test para esta spec: la suite vacía debe pasar. No se crean
tests artificiales ni `lcov` a mano.

### Comandos

```bash
pnpm test
```

**Verificar en ejecución:** código de salida con cero ficheros medibles y si se
genera `coverage/lcov.info` (apartado 15.1 de la spec). Si
`resolve.tsconfigPaths` no funciona en Vite 8.3.5, se para y se pregunta antes
de añadir `vite-tsconfig-paths`, que no está aprobado.

## 6. Fase 5 — e2e (RF-8)

### `playwright.config.ts`

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm start -p 3000',
    url: 'http://127.0.0.1:3000',
    timeout: 120_000,
    reuseExistingServer: false,
  },
});
```

### `e2e/home.spec.ts` (smoke transitorio)

```ts
import { expect, test } from '@playwright/test';

test('the home responds without page errors', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const response = await page.goto('/');

  expect(response, 'navigation should return a response').not.toBeNull();
  expect(response?.status()).toBeLessThan(400);
  expect(pageErrors).toEqual([]);
});
```

No comprueba contenido. Los flujos de idioma, tema, navegación y movimiento
llegan con las specs 02, 03, 05 y 06.

### `.gitignore`

Añadir `/playwright-report` (hoy solo está `/test-results`).

### Comandos

```bash
pnpm test:e2e
```

**Verificar en ejecución:** que el smoke pasa en el estado actual (respuesta < 400, sin
`pageerror`). El puerto queda cerrado por dos lados verificados el 2026-11-17: la guía del
CLI instalada documenta `-p`/`--port` para `next start` (además de `PORT`), y `pnpm` reenvía
los argumentos que siguen al nombre del script sin necesidad de `--`, así que
`pnpm start -p 3000` es la variante portable a Windows. La comprobación con el servidor
arrancado sigue pendiente y es parte de T6.

## 7. Fase 6 — CI y Sonar (RF-9, RF-10)

Se elimina `.github/workflows/build.yml` y se crea `.github/workflows/ci.yml`.

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: ci-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

env:
  NEXT_TELEMETRY_DISABLED: '1'

jobs:
  lint:
    name: lint
    runs-on: ubuntu-24.04
    timeout-minutes: 10
    steps:
      - name: Checkout repository
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - name: Setup pnpm
        uses: pnpm/action-setup@73e46992e05b19abd31f2f3c20e0e7370d762115 # v6.1.1
      - name: Setup Node.js
        uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version-file: .node-version
          cache: pnpm
      - name: Check tool versions
        run: |
          expected_node="$(tr -d '[:space:]' < .node-version)"
          actual_node="$(node -v | sed 's/^v//')"
          expected_pnpm="$(node -p "require('./package.json').packageManager.replace('pnpm@', '')")"
          actual_pnpm="$(pnpm -v)"
          if [ "$actual_node" != "$expected_node" ]; then
            echo "::error::Node $actual_node does not match .node-version ($expected_node)"
            exit 1
          fi
          if [ "$actual_pnpm" != "$expected_pnpm" ]; then
            echo "::error::pnpm $actual_pnpm does not match packageManager ($expected_pnpm)"
            exit 1
          fi
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Lint
        run: pnpm lint

  typecheck:
    name: typecheck
    runs-on: ubuntu-24.04
    timeout-minutes: 10
    steps:
      - name: Checkout repository
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - name: Setup pnpm
        uses: pnpm/action-setup@73e46992e05b19abd31f2f3c20e0e7370d762115 # v6.1.1
      - name: Setup Node.js
        uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version-file: .node-version
          cache: pnpm
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Typecheck
        run: pnpm typecheck

  test:
    name: test
    runs-on: ubuntu-24.04
    timeout-minutes: 15
    steps:
      - name: Checkout repository
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - name: Setup pnpm
        uses: pnpm/action-setup@73e46992e05b19abd31f2f3c20e0e7370d762115 # v6.1.1
      - name: Setup Node.js
        uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version-file: .node-version
          cache: pnpm
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Test with coverage
        run: pnpm test
      - name: Upload coverage
        if: always()
        uses: actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9 # v7.0.2
        with:
          name: coverage
          path: coverage/
          retention-days: 7
          if-no-files-found: warn

  build:
    name: build
    runs-on: ubuntu-24.04
    timeout-minutes: 15
    steps:
      - name: Checkout repository
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - name: Setup pnpm
        uses: pnpm/action-setup@73e46992e05b19abd31f2f3c20e0e7370d762115 # v6.1.1
      - name: Setup Node.js
        uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version-file: .node-version
          cache: pnpm
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Build
        run: pnpm build

  e2e:
    name: e2e
    runs-on: ubuntu-24.04
    timeout-minutes: 20
    steps:
      - name: Checkout repository
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - name: Setup pnpm
        uses: pnpm/action-setup@73e46992e05b19abd31f2f3c20e0e7370d762115 # v6.1.1
      - name: Setup Node.js
        uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version-file: .node-version
          cache: pnpm
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Install Chromium
        run: pnpm exec playwright install --with-deps chromium
      - name: End-to-end tests
        run: pnpm test:e2e
      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9 # v7.0.2
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
          if-no-files-found: warn
      - name: Upload Playwright results
        if: always()
        uses: actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9 # v7.0.2
        with:
          name: playwright-test-results
          path: test-results/
          retention-days: 7
          if-no-files-found: warn

  sonar:
    name: sonar
    runs-on: ubuntu-24.04
    timeout-minutes: 20
    steps:
      - name: Checkout repository
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          fetch-depth: 0
      - name: Setup pnpm
        uses: pnpm/action-setup@73e46992e05b19abd31f2f3c20e0e7370d762115 # v6.1.1
      - name: Setup Node.js
        uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version-file: .node-version
          cache: pnpm
      - name: Require SONAR_TOKEN
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        run: |
          if [ -z "${SONAR_TOKEN}" ]; then
            echo "::error::SONAR_TOKEN is not set. Add it to repository secrets and to Dependabot secrets."
            exit 1
          fi
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Test with coverage
        run: pnpm test
      - name: SonarQube Cloud scan
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        uses: SonarSource/sonarqube-scan-action@59202af334b4ba7b5db01b701b8e79f8b3bef0f4 # v8.5.0
```

Notas de diseño:

- Los seis jobs tienen `id` y `name` idénticos: eso es lo que exige el ruleset.
- La comprobación de versiones vive en `lint` y protege contra **pins mal escritos**, no
  contra desvíos entre ficheros: los seis jobs leen las mismas dos fuentes
  (`.node-version` y `packageManager`), así que no hay dos valores que puedan separarse.
  `node -v` imprime siempre `X.Y.Z`, de modo que un `.node-version` parcial como `26` hace
  que `setup-node` instale el último 26.x y que el literal del fichero (`26`) nunca iguale
  la salida del binario (`26.12.0`): el paso lo detecta y pone el PR en rojo. La única forma
  de pasar es escribir la versión exacta, que es lo que exige RF-1.1.
- La repetición de los tres pasos de setup entre jobs es inevitable sin una
  composite action; se acepta para no añadir una carpeta nueva.
- Sin `continue-on-error`, sin `|| true`, sin `paths-ignore`, sin
  `pull_request_target`.

### `sonar-project.properties` (contenido final)

```properties
# SonarQube Cloud project configuration
# Repository: PedroSG00/pedro_suarez_gallardo_portfolio

sonar.projectKey=PedroSG00_pedro_suarez_gallardo_portfolio
sonar.organization=pedrosg00
sonar.projectName=pedro_suarez_gallardo_portfolio
sonar.projectDescription=Portfolio of Pedro Suarez Gallardo, full-stack web developer

# Analysis scope: application and tooling code lives under src/.
# Root-level files (configs, check-package-manager.mjs) and e2e/ stay outside the scope.
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx

# Coverage report produced by `pnpm test` (Vitest, v8 provider).
sonar.javascript.lcov.reportPaths=coverage/lcov.info

# Coverage exclusions: identical to `test.coverage.exclude` in vitest.config.mts.
# Change both files together; src/app/ is analyzed but not measured.
sonar.coverage.exclusions=**/*.test.ts,**/*.test.tsx,**/*.d.ts,src/app/**,src/test/**,src/content/**

# Duplication is only waived for tests.
sonar.cpd.exclusions=**/*.test.ts,**/*.test.tsx

# Fail the job when the quality gate fails, waiting up to 300 seconds.
sonar.qualitygate.wait=true
sonar.qualitygate.timeout=300
```

**Verificar en ejecución:** el solape deliberado de `sonar.sources=src` y `sonar.tests=src`
(los tests viven dentro de `src/` y se separan con `sonar.test.inclusions`) no puede duplicar
ficheros ni hacer fallar el scanner. Se comprueba en el primer run: si solo avisa, se
documenta; si falla, se para y se pregunta antes de tocar el alcance del análisis.

### Acciones fijadas por SHA (verificadas el 2026-11-17)

| Acción | Tag | SHA |
|---|---|---|
| `actions/checkout` | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| `pnpm/action-setup` | v6.1.1 | `73e46992e05b19abd31f2f3c20e0e7370d762115` |
| `actions/setup-node` | v7.1.0 | `949feb2413d6458794dcd2491c4babbbce0c15c1` |
| `actions/upload-artifact` | v7.0.2 | `cf430e030ddbb5b0abf93d22962f4752f3646cd9` |
| `SonarSource/sonarqube-scan-action` | v8.5.0 | `59202af334b4ba7b5db01b701b8e79f8b3bef0f4` |

Cada comentario `# vX.Y.Z` debe coincidir con su SHA: Dependabot lo usa para
calcular la actualización.

**Verificar en ejecución:** que cada SHA de la tabla es de verdad el del tag, con
`git ls-remote --tags https://github.com/<org>/<repo> refs/tags/vX.Y.Z` (en tags anotados,
comparar con la línea `^{}`). La tabla se corrige antes de subir el workflow si alguno no
coincide.

## 8. Fase 7 — Pruebas negativas

Rama desechable `verify/gates` que no se fusiona. La evidencia son enlaces a los
runs de CI y un `git status` limpio al terminar. No se commitea ningún fichero
temporal.

| RF | Prueba | Resultado esperado |
|---|---|---|
| 1.2 | `engines.node` → `>=99`, `pnpm install` | Código 1 con mensaje de engine |
| 1.3 | `npm install` y `yarn install` | Código 1 con el mensaje de la guarda |
| 1.4 | Quitar una entrada de `allowBuilds`, instalar | Instalación abortada antes del build script |
| 1.6 | `.node-version` con un valor parcial (`26`), no la versión completa | Job rojo con el mensaje de versión |
| 1.7 | `git check-attr text eol -- package.json` | `text: auto`, `eol: lf` |
| 4.2 | Literal hijo en `src/components/` | Rojo por `react/jsx-no-literals` |
| 4.3 | El mismo literal en un `*.test.tsx` | Verde: la exención es solo para tests |
| 6 | Módulo temporal de ~200 líneas sin test | Cobertura global < 95 %, código 1 |
| 8.4 | Proceso escuchando en 3000, `pnpm test:e2e` | Fallo explícito de puerto ocupado |
| 8.5 | `timeout` reducido a 1 s | Fallo de timeout del `webServer` |

## 9. Paradas obligatorias

Se para y se pregunta, sin rodear el problema, si ocurre cualquiera de estas:

1. `resolve.tsconfigPaths` no resuelve `@/` (implicaría una dependencia no
   aprobada).
2. El build no compila Tailwind con el loader actual y haría falta un
   `postcss.config.mjs` nuevo.
3. `next/font/google` no puede descargar las fuentes (sin red el build no pasa).
4. Aparece un build script no reconocido en `allowBuilds`.
5. El scanner de Sonar falla sin `coverage/lcov.info`. Regla única: si solo
   avisa, se acepta y se documenta; si falla, se para. No se adelanta ningún
   módulo, no se mueve el job `sonar` y no se fabrica un `lcov`.
6. Los nombres reales de los checks no coinciden con los `id` de los jobs.

## 10. Commits y PR

Siete commits pequeños en la rama `01`, en el orden de ejecución de `tasks.md`, cada uno
con sus gates en verde:

1. `refactor(app): move the application under src`
2. `chore(tooling): pin node, pnpm and the package manager guard`
3. `build(typecheck): generate route types before tsc`
4. `build(lint): enforce literals and replace the deprecated vitest plugin`
5. `test(tooling): add vitest coverage threshold and test setup`
6. `test(e2e): run playwright against the production build`
7. `ci: replace the sonar workflow with six checks`

Después:

1. Push de `01` y PR a `main`.
2. Se leen los nombres exactos de los seis checks en la pestaña *Checks* y se
   comunican a Pedro.
3. Pedro crea el ruleset de `main`: PR obligatorio, 0 aprobaciones, los seis
   checks por nombre, sin bypass, sin force push, sin borrado, sin rama al día,
   sin merge queue.
4. Commit `docs(01): mark the tooling spec as done` (casilla del roadmap) y
   fusión del PR.

Lo que no se puede automatizar desde aquí: los pasos 2 y 3 de esta lista, porque
`gh` no está instalado y el ruleset se configura en la interfaz de GitHub.

## 11. Lo que no entra

Sin componentes, sin i18n, sin tokens de tema, sin `renderWithIntl`, sin sección
de proyectos, sin tests artificiales, sin `lcov` a mano y sin tocar
`dependabot.yml`. `next.config.ts` se queda como está.
