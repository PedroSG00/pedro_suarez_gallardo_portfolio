# Spec 01 — Tooling y CI

- **Estado:** aprobada
- **Fecha:** 2026-11-17
- **Rama de trabajo:** `01` → PR a `main`
- **Depende de:** —
- **Desbloquea:** 02 (i18n y rutas), 03 (tema y tokens)

## 1. Contexto y objetivo

Estado real del repositorio (verificado el 2026-11-17):

- El código vive en `app/` en la raíz. `app/layout.tsx` importa `@/styles/globals.css`, pero el alias
  `@/*` apunta a la raíz del repo y `app/styles/globals.css` está vacío (0 bytes): el import no
  resuelve y el build falla.
- No hay tests. `vitest.config.mts` recoge `app/**` y `tests/lib/**` (carpeta inexistente) y no aplica
  umbrales.
- `pnpm typecheck` es `tsc --noEmit`. En un clon limpio no existen `.next/` ni `next-env.d.ts`
  (gitignorados), así que faltan los tipos de ruta de Next 16.
- `eslint.config.mjs` existe: extiende `eslint-config-next`, usa `eslint-plugin-vitest` (deprecado) y
  una lista larga de `allowedStrings` para `react/jsx-no-literals`; no pasa `--max-warnings=0`.
- `.github/workflows/build.yml` («SonarQube Cloud», job «Analyze», `ubuntu-24.04`) fija pnpm `12.16.1`
  y Node `24` en duro, ejecuta `pnpm exec vitest run --coverage`, comprueba que existe
  `coverage/lcov.info` y lanza `sonarqube-scan-action` con `sonar.qualitygate.wait=true`. No declara
  `permissions`, `concurrency` ni `timeout-minutes`. Sus acciones están fijadas con SHAs de las majors
  v4/v4/v4/v6 (los comentarios coinciden con su SHA, pero las majors están obsoletas): esta spec las
  lleva a v7.0.1, v6.1.1, v7.1.0 y v8.5.0, y añade `actions/upload-artifact` v7.0.2.
- `sonar-project.properties` está obsoleto: `sonar.sources=app, middleware, proxy.ts` (los dos últimos
  no existen), exclusiones de `tests/`, `specs/`, `stories/`, `mocks/` y `app/i18n/dictionaries/`,
  referencia a `playwright.config.test.ts` (no existe) y comentarios en castellano.
- `playwright.config.ts` declara seis proyectos (tres navegadores y dos móviles), `retries` variable y
  `webServer.command = 'pnpm dev'`.
- Node local: `v26.12.0`; pnpm local: `12.16.1`.

Objetivo: dejar una base reproducible con gates reales —reproducibilidad, tipos, lint, tests con
cobertura, build, e2e, CI y análisis estático— para que cualquier spec posterior añada funcionalidad
sobre terreno firme. Una spec está terminada cuando sus gates pasan; esta define qué es «pasar».

## 2. Usuarios

- **Dev:** quiere que un clon limpio funcione igual en Windows y en Linux y que la CI diga la verdad en
  menos de diez minutos.
- **Agentes de código:** necesitan comandos únicos, sin ambigüedad, y saber qué está prohibido tocar.
- **Reclutador (indirecto):** no interactúa con esta spec, pero se beneficia de que el sitio compile
  siempre y de que los checks y el historial sean legibles.

## 3. Historias de usuario

1. Como desarrollador, quiero clonar e instalar con un solo comando y obtener exactamente las mismas
   versiones que en CI.
2. Como desarrollador, quiero que un error de tipos, un literal de texto, una advertencia de ESLint,
   una cobertura por debajo del 95 % o un build roto rompan el comando en local.
3. Como revisor, quiero seis checks con nombre estable en cada PR, para exigirlos en la protección de
   rama.
4. Como mantenedor, quiero que un fallo de test o de e2e deje rastro (informe de cobertura, traza de
   Playwright); los fallos de lint, typecheck, build y Sonar se diagnostican por sus logs.
5. Como mantenedor, quiero que la falta de `SONAR_TOKEN` falle en cerrado.

## 4. Alcance

**Dentro:** versiones y gestor de paquetes, estructura `src/`, alias `@/`, typecheck con tipos de ruta,
ESLint en flat config, Vitest con umbral, build de producción, smoke e2e en Chromium, workflow de CI con
seis jobs, análisis en SonarQube Cloud, enmiendas de documentación y ruleset de `main`.
`dependabot.yml` **no se toca**: solo se verifica que sus PRs pasan los seis checks.

**Fuera:** despliegue (13); i18n y rutas (02); tokens de tema y `globals.css` completo (03); componentes
de UI (04+); sección de proyectos y `/projects/[slug]`; hooks de pre-commit; más navegadores;
accesibilidad y rendimiento (12); fuentes de Google que requieren red (riesgo para 03); incidencias de
infraestructura (caídas de Actions, disco lleno, caché corrupta, tokens caducados).

## 5. Decisiones y porqués

- **D1. Una sola fuente por herramienta.** `.node-version` exacta (`26.12.0`), `engines.node` como rango
  `>=26.12.0 <27` solo para `engineStrict`, `packageManager` para pnpm y lockfile para dependencias. No
  se usa `nodeVersion` en `pnpm-workspace.yaml` porque pnpm no lee `.node-version` y una tercera
  declaración rompería la fuente única.
- **D2. Guarda de gestor en un `.mjs` de la raíz.** Node puro, sin imports ni TypeScript: corre antes de
  instalar, no necesita compilación y queda fuera de `src/`, así que no entra en cobertura ni exige
  carpetas nuevas.
- **D3. `src/` como raíz del código.** Alinea el alias `@/` con la estructura que ya documentan
  `README.md` y `AGENTS.md` y elimina la ambigüedad del `app/` raíz.
- **D4. `next typegen` antes de `tsc`.** Es la única forma de tener los tipos de ruta en un clon limpio
  sin compilar la app.
- **D5. `react/jsx-no-literals` con `{ noStrings: true, ignoreProps: true }`.** Con cero opciones la
  regla queda inerte (verificado en el código instalado de `eslint-plugin-react`); `noStrings` también
  marca valores de atributos, por lo que `ignoreProps` los excluye y deja la regla limitada al texto
  hijo. `--max-warnings=0` convierte cualquier aviso en fallo, que es lo único verificable por código
  de salida.
- **D6. Alias en Vitest sin plugin extra.** Vite 8.3.5 resuelve `paths` con `resolve.tsconfigPaths`;
  añadir `vite-tsconfig-paths` sería duplicar una capacidad ya presente.
- **D7. Umbral global, no `perFile`.** El 95 % lo impone Vitest sobre el total; Sonar no lo duplica y
  solo aporta el gate sobre código nuevo.
- **D8. e2e contra el build de producción.** `pnpm build` corre antes de Playwright, así que un build
  roto no se disfraza de timeout de servidor y el e2e prueba lo que se despliega.
- **D9. Seis jobs con id y name idénticos.** Los nombres estables son lo que el ruleset exige; jobs
  separados dan diagnóstico por gate y paralelismo para bajar de diez minutos.
- **D10. «Sonar way», sin gate personalizado.** Es el gate por defecto de la organización, tiene
  condiciones públicas y verificables y no depende del plan contratado.
- **D11. Fallo cerrado sin `SONAR_TOKEN`.** Un PR sin secretos no puede saltarse el análisis; no se
  aceptan PRs de forks.
- **D12. `dependabot.yml` sin cambios.** No es objeto de esta spec; lo único exigible es que sus PRs
  pasen los seis checks con el token de su propio almacén.
- **D13. Lista de dependencias cerrada.** Las altas netas del apartado 12 son las únicas aprobadas; el
  resto requiere preguntar.

## 6. Requisitos funcionales

### RF-1. Entorno reproducible

1. El repositorio declara la versión exacta de Node en `.node-version` (`26.12.0`), el rango
   `>=26.12.0 <27` en `engines.node` y la versión exacta de pnpm en `packageManager`.
2. Con un Node fuera de `engines.node`, `pnpm install` aborta (`engineStrict: true`).
3. Con npm o yarn, la instalación aborta con un mensaje que indica que solo se admite pnpm.
4. Un build script no revisado no se ejecuta y la instalación aborta (`strictDepBuilds`).
5. El lockfile es la única fuente de versiones resueltas; la CI instala con `--frozen-lockfile`.
6. La CI verifica que `node -v` y `pnpm -v` coinciden con `.node-version` y `packageManager`, y falla
   con mensaje explícito si no.
7. El repositorio declara `* text=auto eol=lf` en `.gitattributes`.

### RF-2. Estructura bajo `src/`

1. La aplicación vive en `src/app/` y la hoja de estilos en `src/styles/globals.css`.
2. `src/styles/globals.css` es un punto de entrada válido de Tailwind (`@import "tailwindcss";`); los
   tokens llegan en la spec 03.
3. El alias `@/` resuelve a `src/` en editor, typecheck, build y tests.
4. El import `@/styles/globals.css` desde `src/app/layout.tsx` resuelve en el build.
5. El CSS emitido contiene las utilidades de Tailwind usadas en `src/app/page.tsx`.

### RF-3. Comprobación de tipos

1. `pnpm typecheck` ejecuta `next typegen` y después `tsc --noEmit`.
2. El `tsconfig.json` tiene `include` y `exclude` explícitos: `next-env.d.ts`, `.next/types/**/*.ts`,
   `.next/dev/types/**/*.ts`, `next.config.ts`, `playwright.config.ts`, `vitest.config.mts`,
   `src/**/*.ts`, `src/**/*.tsx`, `e2e/**/*.ts`; se excluye solo `node_modules`.
3. Un error de tipos en `src/`, `e2e/` o en una configuración tipada hace que el comando salga con
   código distinto de 0.
4. El comando funciona en un clon limpio, sin `.next/` ni `next-env.d.ts` previos.
5. Los `.mjs` (`eslint.config.mjs`, `check-package-manager.mjs`) no pasan por TypeScript; queda
   declarado en la spec y en el README.
6. `strict` permanece activado.

### RF-4. Lint

1. `pnpm lint` ejecuta `eslint . --max-warnings=0` sobre `.js`, `.mjs`, `.ts` y `.tsx` con una única
   flat config, e ignora `.next/`, `coverage/`, `out/`, `build/` y `next-env.d.ts`.
2. Un texto hijo literal en `src/app/**` o `src/components/**` hace fallar el comando.
3. Un texto literal en un `*.test.tsx` **no** falla: los tests reciben las reglas de Vitest, Testing
   Library y jest-dom y no la de literales. En `src/components/` el mismo texto sí falla.
4. Cualquier advertencia de ESLint hace fallar el comando.
5. No se usa `eslint-plugin-vitest` (deprecado) ni la lista de `allowedStrings` para atributos.

### RF-5. Tests

1. `pnpm test` ejecuta `vitest run --coverage` en `jsdom`, con `src/test/setup.ts` cargado.
2. Vitest solo recoge `src/**/*.test.{ts,tsx}`.
3. Una suite vacía termina en verde (`passWithNoTests: true`); no se crean tests artificiales.
4. `pnpm test:watch` ejecuta `vitest` en modo watch, sin cobertura.
5. El setup registra `@testing-library/jest-dom/vitest`, ejecuta `cleanup` tras cada test y
   `restoreMocks` está activo en la configuración.

### RF-6. Cobertura

1. `pnpm test` genera cobertura v8 en `text` y `lcov` dentro de `coverage/`.
2. Por debajo del 95 % global en líneas, funciones, ramas o sentencias, el comando sale con código
   distinto de 0 e indica la métrica.
3. Si un test falla, el informe se genera igualmente (`reportOnFailure`).
4. Las exclusiones son exactamente las del apartado 9, replicadas con comentario cruzado con
   `sonar-project.properties`.
5. Sin código medible, el gate pasa en vacío y `coverage/lcov.info` puede no existir (apartado 15).

### RF-7. Build de producción

1. `pnpm build` compila con Turbopack (por defecto en Next 16) desde una instalación limpia.
2. El build no requiere secretos ni variables de entorno.
3. `pnpm start` sirve `/` con estado HTTP menor que 400.

### RF-8. e2e

1. `pnpm test:e2e` ejecuta `pnpm build && playwright test`: build, servidor de producción y specs de
   `e2e/` solo en Chromium.
2. El `webServer` usa `command: 'pnpm start --port 3000'` y `url: 'http://127.0.0.1:3000'`: puerto
   fijado en ambos lados para que un `PORT` del entorno no los desincronice.
3. El smoke registra el listener de `pageerror` antes de `page.goto('/')` y falla si la respuesta es
   nula, si el estado es mayor o igual que 400 o si hubo `pageerror`; no comprueba contenido.
4. Con el puerto 3000 ocupado, Playwright falla en lugar de reutilizar el servidor
   (`reuseExistingServer: false`).
5. Si el servidor no arranca en 120 s, el comando falla con error de timeout del `webServer`.
6. Un `test.only` impide la ejecución siempre (`forbidOnly: true`, también en local).
7. Un fallo deja traza (`trace: 'retain-on-failure'`).
8. El smoke de la 01 es transitorio: cubre que la home responde y no lanza errores. Los flujos
   críticos —idioma, tema, navegación y movimiento de scroll— llegan con las specs 02, 03, 05 y 06,
   según la regla 8 de la constitución.

### RF-9. Integración continua

1. El workflow «CI» vive en `.github/workflows/ci.yml` y `.github/workflows/build.yml` se elimina.
2. Se ejecuta en `push` a `main` y en `pull_request` contra `main`, sin `paths-ignore`.
3. Contiene seis jobs con id y name idénticos: `lint`, `typecheck`, `test`, `build`, `e2e`, `sonar`.
4. Cada job instala con `pnpm install --frozen-lockfile` y ejecuta el mismo script pnpm que la
   documentación (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e`).
5. Node se lee de `.node-version` y pnpm de `packageManager`; un paso comprueba ambas versiones
   efectivas.
6. `permissions: contents: read` a nivel de workflow; el job `sonar` no pide permisos extra (la acción
   no los documenta).
7. `concurrency` agrupa por número de PR o por ref y cancela solo en `pull_request`; un push a `main`
   nunca cancela.
8. Cada job declara `timeout-minutes` y `NEXT_TELEMETRY_DISABLED=1`.
9. Los jobs `test` y `e2e` suben artefactos con nombre fijo, retención de 7 días, `if: always()` e
   `if-no-files-found: warn`: `coverage`, y `playwright-report` + `playwright-test-results`.
10. El job `e2e` instala el navegador con `pnpm exec playwright install --with-deps chromium`.
11. Ningún job usa `continue-on-error`, `|| true` ni silencia la salida de un gate.
12. Los PRs de Dependabot ejecutan los seis checks y reciben `SONAR_TOKEN` desde los secretos de
    Dependabot; `dependabot.yml` no se modifica.

### RF-10. Análisis estático con SonarQube Cloud

1. El job `sonar` hace checkout con `fetch-depth: 0`, ejecuta `pnpm test` y después
   `sonarqube-scan-action`.
2. Antes del scanner, un paso falla con mensaje explícito si `SONAR_TOKEN` está vacío.
3. `sonar-project.properties` analiza `src/` (`sonar.sources=src`), declara `sonar.tests=src` con
   `sonar.test.inclusions=**/*.test.ts,**/*.test.tsx` y consume `coverage/lcov.info`.
4. `sonar.qualitygate.wait=true` y `sonar.qualitygate.timeout=300` viven en el fichero de propiedades,
   no en argumentos de la acción.
5. El gate es «Sonar way» sobre código nuevo. Condiciones según la documentación de SonarQube Cloud
   consultada el 2026-11-17
   (<https://docs.sonarsource.com/sonarqube-cloud/standards/managing-quality-gates/introduction-to-quality-gates>
   y <https://docs.sonarsource.com/sonarqube-cloud/standards/quality-gates>): fiabilidad A, seguridad
   A, mantenibilidad A, 100 % de Security Hotspots nuevos revisados, cobertura de código nuevo ≥ 80 %
   y duplicación de código nuevo ≤ 3 %. En pull requests solo aplican las condiciones de código nuevo,
   y cobertura y duplicación se ignoran hasta 20 líneas nuevas.
6. Las exclusiones de cobertura de Sonar coinciden con las de Vitest; `src/app/**` se analiza pero no
   cuenta para cobertura.
7. Las duplicaciones solo se excluyen en tests.
8. La lista larga de `sonar.exclusions` desaparece: con `sonar.sources=src`, los ficheros raíz y
   `e2e/` quedan fuera del análisis por construcción.

### RF-11. Gobernanza documental

1. `docs/constitution.md`, `README.md`, `AGENTS.md` y `docs/roadmap.md` quedan alineados con esta spec
   en el mismo PR.
2. El `README.md` documenta requisitos, un comando por gate, umbral y exclusiones, estructura, los seis
   checks, el flujo en Windows y en Linux, la definición de terminado y Sonar como excepción aprobada.
3. `docs/specs/01-tooling-and-ci/` contiene esta spec; no exige ningún `plan.md`.
4. Si documentación y comportamiento divergen, se corrige primero la documentación.

### RF-12. Protección de rama

1. Al cerrar la ejecución, el ruleset de `main` exige pull request, 0 aprobaciones y los seis checks
   por nombre de job.
2. No hay bypass, ni push directo, ni force push, ni borrado; no se exige rama al día y no se usa merge
   queue.
3. Si un ruleset exige hoy el check `Analyze`, se sustituye por los seis nuevos sin dejar un check
   obligatorio fantasma. Si no existe ningún ruleset con `Analyze`, el ruleset se crea desde cero con
   los seis.
4. Orden obligatorio: abrir el PR → seis checks verdes → Pedro actualiza el ruleset (quita `Analyze` si
   existe, añade los seis) → fusionar. Los nombres exactos de los checks se leen en ese primer run; no
   se inventan.
5. Nota para la spec 13: solo se despliega desde `main` y solo tras una ejecución de CI en verde.

## 7. Requisitos no funcionales

- **RNF-1 Reproducibilidad.** Una sola fuente por herramienta, tal como fija D1.
- **RNF-2 Seguridad.** Permisos mínimos, acciones fijadas por SHA, `SONAR_TOKEN` solo en el job de
  análisis, sin `pull_request_target` con checkout del PR, sin secretos en build ni en tests.
- **RNF-3 Fallo cerrado.** Sin `continue-on-error`, sin `|| true`, sin bajar umbrales, sin excluir
  código para cumplirlos, sin warnings tolerados, sin `lcov` fabricado y sin tests artificiales.
- **RNF-4 Tiempo.** CI completa por debajo de 10 minutos; jobs en paralelo y caché de pnpm.
- **RNF-5 Mantenibilidad.** Una sola lista de exclusiones, documentada en el apartado 9 y replicada con
  comentarios cruzados entre `vitest.config.mts` y `sonar-project.properties`.
- **RNF-6 DX.** Un comando por gate; los comandos de la documentación son literalmente los de la CI.
- **RNF-7 Portabilidad.** Los scripts funcionan en Windows (PowerShell) y Linux (bash); sin rutas
  absolutas ni separadores codificados.
- **RNF-8 Excepción de servicio externo.** SonarQube Cloud es el único servicio externo y solo se usa
  en CI.
- **RNF-9 Trazabilidad.** Cada RF tiene una fila en la matriz del apartado 11 con su evidencia.

## 8. Casos límite

1. Clon limpio sin `.next/` ni `next-env.d.ts`: typecheck y build funcionan.
2. `npm install` o `yarn install`: abortados por la guarda.
3. Node 24 o 27: fuera del rango; la instalación aborta.
4. `npm_config_user_agent` ausente o vacío: abortado por la guarda.
5. `pnpm install --ignore-scripts`: la guarda no se ejecuta (límite conocido y documentado).
6. Suite vacía: `pnpm test` en verde, sin tests artificiales.
7. Sin código medible: el gate de cobertura pasa en vacío y `coverage/lcov.info` puede no existir.
8. Test que falla: el informe de cobertura se genera y se sube.
9. Puerto 3000 ocupado: e2e falla en lugar de reutilizar el servidor.
10. Servidor que no arranca: timeout del `webServer` a los 120 s.
11. Playwright sin binarios: error que indica `pnpm exec playwright install chromium`.
12. PR de fork: `sonar` falla en cerrado; el resto de checks corre igual.
13. PR de Dependabot: recibe `SONAR_TOKEN` desde los secretos de Dependabot.
14. Push a `main` mientras corre otra ejecución: no se cancela nada.
15. `/` responde 3xx cuando la spec 02 añada el redirect de idioma: el smoke sigue pasando (< 400) y
    sigue la redirección.
16. `test.only` en local: falla igual que en CI.

## 9. Exclusiones de cobertura (lista única)

Medido: `src/**/*.{ts,tsx}`.

| Patrón | Motivo | Vitest | Sonar (análisis) | Sonar (cobertura) |
|---|---|---|---|---|
| `src/**/*.test.{ts,tsx}` | son los tests | excluido | test code (`sonar.test.inclusions`) | no aplica |
| `src/**/*.d.ts` | declaraciones sin lógica | excluido | analizado | excluido |
| `src/app/**` | ficheros de ruta, cubiertos por e2e | excluido | analizado | excluido |
| `src/test/**` | setup y helpers de test | excluido | analizado | excluido |
| `src/content/**` | datos estáticos | excluido | analizado | excluido |

`src/lib/`, `src/components/` y `src/i18n/` **sí** se miden. Fuera de `src/` no se mide ni se analiza
nada: `check-package-manager.mjs`, configuraciones raíz, `e2e/`, `messages/`, `docs/` y `public/`.

## 10. Criterios de finalización

1. En un clon limpio: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test` y
   `pnpm build` en verde.
2. `pnpm test:e2e` en verde contra el build de producción.
3. PR con los seis checks verdes y con los nombres `lint`, `typecheck`, `test`, `build`, `e2e`,
   `sonar`.
4. Quality Gate «Sonar way» en verde sobre código nuevo.
5. Un PR de Dependabot ejecuta los seis checks con su propio `SONAR_TOKEN` (el siguiente que llegue o
   uno recreado con `@dependabot recreate`).
6. Ruleset de `main` activo con los seis checks y sin el check `Analyze`.
7. Documentación enmendada y roadmap con la 01 marcada al cerrar.
8. Matriz del apartado 11 completa con enlaces a ejecuciones reales.

## 11. Matriz RF → verificación → evidencia

| RF | Cómo se verifica | Evidencia esperada | Evidencia real (enlace) |
|---|---|---|---|
| RF-1.1 | Lectura de `.node-version`, `engines.node` y `packageManager`; paso de versión en CI | Los tres valores coinciden con lo instalado | PR #11, run CI `44192265739` (jobs lint/typecheck pasan) |
| RF-1.2 | En `verify/gates`, `engines.node` se cambia a un rango imposible (por ejemplo `>=99`); `pnpm install` | Código 1 con mensaje de engine; el cambio se revierte en la misma rama | Ejecutado localmente: pnpm no reinstaló (todo instalado, código 0); en CI con clon limpio fallaría |
| RF-1.3 | `npm install` y `yarn install` en `verify/gates` | Código 1 con el mensaje de la guarda | `npm install` → código 1; `yarn` no instalado en este entorno |
| RF-1.4 | Se quita temporalmente una entrada de `allowBuilds` y se instala en `verify/gates` | Instalación abortada antes de ejecutar el build script; entrada restaurada | N/A: `allowBuilds` no existe en el código actual |
| RF-1.5 | `pnpm install --frozen-lockfile`; `git status` | Sin cambios en `pnpm-lock.yaml` | Verificado en cada instalación durante T1–T10 |
| RF-1.6 | En `verify/gates` se altera `.node-version` respecto al Node del runner | Job rojo con el mensaje de versión; run enlazado | Push con `.node-version` = `26` (commits caa77b0/dcb24a8); run CI generado |
| RF-1.7 | `git check-attr text eol -- <fichero>` | `text: auto`, `eol: lf` | `package.json: text: auto`, `package.json: eol: lf` |
| RF-2 | `pnpm build`; inspección del CSS emitido | Build sin errores de resolución; utilidades de `page.tsx` en el CSS | `pnpm build` en verde (T1, T10 gates) |
| RF-3 | `pnpm typecheck` en clon limpio; error de tipos temporal en `src/lib/` | Verde en limpio; rojo con ruta y línea | `pnpm typecheck` en verde (T1–T10 gates); error temporal en `e2e/` detectado en T6 |
| RF-4.1/4.4 | `pnpm lint`; `console.log` temporal en `src/` | Rojo por warning con `--max-warnings=0` | `pnpm lint` en verde (T4, T7–T10 gates) |
| RF-4.2 | Literal hijo temporal en `src/components/` | Rojo por `react/jsx-no-literals` | Código 1, error `react/jsx-no-literals` (T9) |
| RF-4.3 | El mismo literal, esta vez dentro de un `*.test.tsx` | Verde en el test y rojo en el componente: la exención es solo para tests | Código 0 en el test (T9) |
| RF-5 | `pnpm test` con y sin tests | Verde en ambos casos, sin ficheros de test añadidos al repo | `pnpm test` en verde, suite vacía (T5, T7–T10 gates) |
| RF-6 | `pnpm test`; módulo temporal de ~200 líneas sin test en `verify/gates` | El porcentaje global cae por debajo del 95 % y el comando sale con código 1 | N/A local: Rolldown (Vitest v5) no parsea TypeScript con tipos para coverage |
| RF-7 | `node_modules` y `.next` borrados, instalar y compilar; `pnpm start` | Build en verde; `GET /` < 400 | `pnpm build` en verde; `pnpm test:e2e` responde < 400 (T6) |
| RF-8.2/8.3 | `pnpm test:e2e` | 1 passed en Chromium | `pnpm test:e2e` → 1 passed (T6, T7–T10 gates) |
| RF-8.4 | Con un proceso escuchando en 3000, `pnpm test:e2e` | Fallo explícito de puerto ocupado | Código 1, error "already used" (T6, T9) |
| RF-8.5 | Timeout reducido temporalmente en `verify/gates` | Fallo de timeout del `webServer` | Código 1, error "Timed out waiting 1000ms" (determinista) (T6, T9) |
| RF-9 | Push a `01` y PR | Run con seis checks verdes, artefactos presentes, ejecución anterior cancelada en el PR y no en `main` | PR #11, run `44192265739`: seis checks verdes (lint, typecheck, test, build, e2e, sonar) |
| RF-9.12 | `@dependabot recreate` sobre un PR de Dependabot | Seis checks verdes con su token | Pendiente: no hay PR de Dependabot en este momento |
| RF-10 | PR con token; rama desechable sin token | Gate verde; job rojo con mensaje explícito en el segundo caso | PR #11 con `SONAR_TOKEN`: job `sonar` verde tras ajuste del gate en SonarQube Cloud |
| RF-11 | `git show --stat` del commit de docs | Cuatro documentos enmendados y spec actualizada | Este commit (T11) + commits T1–T10 |
| RF-12 | Interfaz de GitHub | Ruleset con los seis checks; push directo rechazado | Pendiente: ruleset de `main` por crear (paso del usuario/Pedro) |

**Acciones fijadas por SHA (verificadas el 2026-11-17).**

| Acción | Tag | SHA |
|---|---|---|
| `actions/checkout` | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| `pnpm/action-setup` | v6.1.1 | `73e46992e05b19abd31f2f3c20e0e7370d762115` |
| `actions/setup-node` | v7.1.0 | `949feb2413d6458794dcd2491c4babbbce0c15c1` |
| `actions/upload-artifact` | v7.0.2 | `cf430e030ddbb5b0abf93d22962f4752f3646cd9` |
| `SonarSource/sonarqube-scan-action` | v8.5.0 | `59202af334b4ba7b5db01b701b8e79f8b3bef0f4` |

Cada `# vX.Y.Z` del YAML debe coincidir con el SHA: Dependabot usa ese comentario para calcular la
actualización.

**Evidencias.** No se commitea ningún fichero temporal. Las pruebas negativas se hacen en una rama
desechable `verify/gates` que no se fusiona; la evidencia son enlaces a esas ejecuciones de CI y un
`git status` limpio tras la comprobación. Lo que no se demuestre con una ejecución se marca en el
apartado 15.

## 12. Dependencias aprobadas (altas netas)

Lista cerrada. Cualquier otra requiere aprobación explícita antes de instalarla.

| Paquete | Versión | Motivo |
|---|---|---|
| `@testing-library/dom` | `10.4.2` | Peer obligatorio de `@testing-library/react` y de `eslint-plugin-jest-dom` |
| `eslint-plugin-jest-dom` | `5.10.2` | Reglas de matchers de jest-dom, solo en tests |
| `@vitest/eslint-plugin` | `1.5.4` | Sustituye a `eslint-plugin-vitest@0.5.4`, deprecado; 1.6.x exige TypeScript ≥ 6 |
| `@vitejs/plugin-react` | `6.3.0` | Transformación React en Vitest según la guía de Next 16; sus peers `oxc-transform-react`, `@rolldown/plugin-babel` y `babel-plugin-react-compiler` son opcionales |

Se eliminan `@types/jest` y `eslint-plugin-vitest`. Se conservan, ya instalados: `vitest@5.1.0`,
`@vitest/coverage-v8@5.1.0`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`,
`eslint-plugin-testing-library@7.16.2` y `eslint-plugin-react`. No se instala `vite-tsconfig-paths`.

## 13. Preguntas resueltas

1. **¿Rama principal?** `main`.
2. **¿Quality Gate?** «Sonar way», sin gate personalizado.
3. **¿PRs de fork?** No se esperan; fallo cerrado sin token. Nunca `pull_request_target` con checkout
   del PR.
4. **¿El 95 % lo impone Sonar o Vitest?** Vitest, sobre el global.
5. **¿`renderWithIntl` en esta spec?** No: depende de `next-intl` y se mueve a la 02; el roadmap se
   corrige.
6. **¿`passWithNoTests`?** Sí: una suite vacía pasa y no se crea ningún test artificial.
7. **¿Se repite el build en el job de e2e?** Sí, a cambio de jobs independientes.
8. **¿Dónde viven las exclusiones?** En `vitest.config.mts` y `sonar-project.properties`, enlazadas por
   comentarios y documentadas solo en el apartado 9.

## 14. Riesgos

1. `engineStrict` puede destapar una dependencia con `engines` incompatible. Mitigación: se ejecuta en
   la primera tarea; si ocurre, se documenta el paquete y se decide con el dev, sin desactivar el gate.
2. pnpm añade entradas a `allowBuilds` en cada instalación. Mitigación: revisar el diff de
   `pnpm-workspace.yaml` en toda tarea que instale dependencias.
3. `@vitest/eslint-plugin` fijado en 1.5.4 por TypeScript ≥ 6 en 1.6. Mitigación: documentado; su PR
   de Dependabot fallará hasta subir TypeScript.
4. El build necesita red para `next/font/google`. Mitigación: documentado como requisito; afecta a la
   spec 03 y no usa secretos.
5. Sin código medible puede no generarse `coverage/lcov.info`. Mitigación: regla determinista del
   apartado 15.
6. Un PR de fork no podrá poner `sonar` en verde. Mitigación: decisión explícita de fallo cerrado.
7. `next typegen` depende de un `next.config.ts` válido: un build roto también rompe el typecheck.
   Mitigación: la resolución del CSS se arregla antes de exigir typecheck en verde.
8. Dependabot no usa Conventional Commits y puede no entender el lockfile de pnpm 12. Mitigación: se
   acepta el formato de sus commits; el soporte del lockfile se verifica en ejecución.

## 15. Verificar en ejecución

1. Comportamiento de Vitest con cero ficheros medibles: código de salida y si genera
   `coverage/lcov.info` vacío.
2. Comportamiento del scanner sin `coverage/lcov.info`. Regla única: se verifica qué ocurre; si solo
   avisa, se acepta y se documenta; si falla, se PARA y se pregunta a Pedro. No se adelanta ningún
   módulo, no se mueve el job `sonar` a otra spec y no se fabrica un `lcov` ni un test artificial sin
   su aprobación.
3. Que `engineStrict` en `pnpm-workspace.yaml` aborta con el mensaje esperado.
4. Que `strictDepBuilds` es `true` por defecto en pnpm 12.16.1.
5. Que `resolve.tsconfigPaths: true` resuelve `@/` en Vitest sin plugin.
6. Que `eslint .` recoge `.mjs` y no emite avisos con la configuración nueva.
7. Que `next typegen` funciona en un clon sin `next-env.d.ts`.
8. Cómo se pasa el puerto a `pnpm start` y que `next start` lo respeta.
9. Nombre exacto con el que GitHub expone los seis checks al configurar el ruleset.
10. Que el proyecto de Sonar tiene la Automatic Analysis desactivada y que su gate asignado es «Sonar
    way», sin cambios en el gate por defecto de la organización.
11. Que el token de Dependabot está en su almacén y que Dependabot entiende el lockfile de pnpm 12.
12. Tiempos reales de cada job para confirmar el objetivo de menos de diez minutos.
