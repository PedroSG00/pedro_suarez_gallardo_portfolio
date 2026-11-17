# Tareas — Spec 01 (Tooling y CI)

- **Fecha:** 2026-11-17
- **Rama:** `01` → PR a `main`
- **Spec:** `docs/specs/01-tooling-and-ci/spec.md` (aprobada)
- **Plan:** `docs/specs/01-tooling-and-ci/plan.md` (contenido exacto de cada fichero)
- **Estado:** pendiente de aprobación

Este fichero **no añade ni cambia requisitos**: trocea el plan en incrementos que se
implementan y verifican uno a uno. El plan dice *qué* contiene cada fichero; aquí se dice
*en qué orden* se toca y *cómo se demuestra* que cada paso está hecho.

## 0. Cómo se lee cada tarea

Cada tarea tiene siete campos:

| Campo | Qué significa |
|---|---|
| **Objetivo** | El resultado observable del incremento, en una frase |
| **RF** | Los requisitos de la spec que quedan cubiertos (no se inventan nuevos) |
| **Gates** | Los gates que esta tarea pone en verde y los que debe mantener verdes |
| **Tests a escribir primero** | La comprobación de aceptación que se escribe **antes** de tocar ficheros |
| **Pasos** | Ficheros y acciones; el contenido literal está en el plan |
| **Hecho cuando** | Criterio binario, con el comando o la salida que lo demuestra |
| **Evidencia** | Qué se guarda para la matriz del apartado 11 de la spec |

**Sobre «tests a escribir primero».** Esta spec no crea tests automatizados: RF-5.3 exige
que la suite vacía pase y prohíbe tests artificiales. Por eso, en la mayoría de tareas
«test» significa una de estas dos cosas, nunca un `*.test.tsx` de relleno:

1. **Una prueba negativa** que se ejecuta en la rama desechable `verify/gates`: se escribe
   primero el estado que debe fallar (literal, error de tipos, módulo sin cobertura, puerto
   ocupado) y se comprueba que el gate se pone rojo; luego se revierte.
2. **Una comprobación de aceptación** en forma de comandos y salida esperada, escrita antes
   del cambio, que se ejecuta al terminar (por ejemplo, comparar listas de exclusiones o
   verificar que los SHAs del YAML coinciden con sus comentarios `# vX.Y.Z`).

La única excepción real es el smoke de Playwright (T6): ahí sí se escribe el test antes que
la configuración, porque es el único test automatizado que esta spec deja en el repo, y es
transitorio por decisión de la constitución (regla 8).

## 1. Reglas que valen para todas las tareas

- Solo pnpm. Nunca `npm install` ni `yarn install`, salvo como prueba negativa de T2 en
  `verify/gates`, que debe fallar por diseño.
- Prohibido: bajar umbrales, excluir código para cumplir cobertura, `continue-on-error`,
  `|| true`, `--no-verify`, `lcov` a mano, tests artificiales y silenciar un gate.
- No se toca `next.config.ts`, `dependabot.yml`, el contenido de `page.tsx`/`layout.tsx`
  más allá del movimiento, ni nada de la sección de proyectos.
- Cambios de código y commits en inglés; documentación en castellano.
- Cada tarea cierra los gates que ya posee, indicados en su campo **Gates** y detallados en
  «Hecho cuando»; ningún gate ya cerrado vuelve a rojo.
- Se para y se pregunta, sin rodear el problema, en los seis supuestos del apartado 9 del
  plan. El más probable en las primeras tareas es el de `allowBuilds` (T2).

## 2. Orden, dependencias y commits

| Tarea | Qué entrega | RF | Gate que la cierra | Commit del plan |
|---|---|---|---|---|
| T1 | `src/` con Tailwind y alias | 2.1–2.5, 7.1–7.2 | `pnpm build` | 1 |
| T2 | Node, pnpm y guarda de gestor | 1.1–1.5, 1.7 | `pnpm install --frozen-lockfile` + negativas 1.2/1.3/1.4 | 2 |
| T3 | Typecheck con tipos de ruta | 3.1–3.6 | `pnpm typecheck` | 3 |
| T4 | Dependencias aprobadas y lint real | 4.1–4.5, 5.5, §12 | `pnpm lint` | 4 |
| T5 | Vitest con umbral | 5.1–5.5, 6.1–6.5, 2.3 | `pnpm test` | 5 |
| T6 | e2e contra el build | 7.3, 8.1–8.8 | `pnpm test:e2e` | 6 |
| T7 | CI con cinco gates locales | 9.1–9.11, 1.6 | run en PR de prueba | 7 |
| T8 | CI con Sonar | 9.3, 10.1–10.8 | run con seis checks | 7 |
| T9 | Batería negativa consolidada | matriz §11 | runs enlazados + `git status` limpio | — |
| T10 | PR, checks y ruleset | 12.1–12.5, 9.12, 10 | ruleset activo | — |
| T11 | Cierre documental | 11.1–11.4, 10.7–10.8 | merge en `main` | 8 |

Dependencias duras: T1 antes que T3, T4, T5 y T6 (todo apunta a `src/`); T2 no depende de
T1, pero va después por decisión de orden. T4 antes que T5 y T6. T7 y T8 antes que T9. T9 y
T10 antes que T11.

T7 y T8 comparten el commit 7 porque el workflow y el job `sonar` se revisan juntos. El
resto tiene commit propio: al pasar la tarea de `src/` al primer puesto, gana su commit y el
typecheck deja de compartirlo, y la fusión de dependencias y lint libera el commit que
ocupaban por separado. Los criterios de hecho se verifican tarea a tarea igual que si cada
una tuviera commit.

**Cómo se verifica la CI.** El workflow solo dispara en `push` a `main` y en
`pull_request` contra `main` (RF-9.2). Por tanto **nada de T7, T8 ni T9 se puede verificar
empujando una rama suelta**: se abre un PR de borrador `verify/gates` → `main` al empezar
T7, se acumulan ahí los commits negativos y cada tarea enlaza el run de **su propio push**.
Ese PR se cierra sin fusionar. El PR real es el de `01` (T10).

## 3. Punto de partida

Resumido del apartado 0 del plan: `app/` en la raíz con un `globals.css` de 0 bytes, alias
`@/*` apuntando a la raíz (build roto), `lint` sin `--max-warnings`, `typecheck` sin
`typegen`, `test` sin cobertura, seis proyectos de Playwright, un `build.yml` con un job
`Analyze`, Node local `26.12.0` y pnpm `12.16.1`, y ni `src/`, ni `e2e/`, ni
`.node-version`. El repo es público y no tiene rulesets.

---

## T1 — `src/` con Tailwind y alias

**Estado:** hecho (2026-11-17). `pnpm build` en verde; utilidades de `src/app/page.tsx` en el CSS emitido.

**Objetivo:** que el build resuelva `@/styles/globals.css`, Tailwind emita las utilidades
que ya usa la home y el código viva bajo `src/`.

**RF:** 2.1, 2.2, 2.3 (editor, typecheck, build), 2.4, 2.5, 7.1, 7.2.

**Gates:** cierra `pnpm build` (RF-7.1, 7.2). No exige lint, typecheck ni test como gates:
no son reales hasta T3, T4 y T5. A partir de aquí, el build no puede volver a rojo.

**Tests a escribir primero:** se reproduce el rojo actual antes de mover nada:
`pnpm build` falla por el import `@/styles/globals.css` no resuelto. Ese fallo y su mensaje
se anotan como línea base; el criterio de hecho es el mismo comando en verde.

**Pasos:** `git mv app src/app` y `git mv src/app/styles src/styles` (conservando
historial); contenido mínimo de Tailwind en `src/styles/globals.css`; `paths` del
`tsconfig.json` a `./src/*` (el `include` se toca en T3). No se toca el contenido de
`page.tsx` ni de `layout.tsx`, ni `next.config.ts`.

**Hecho cuando:**

- `pnpm build` termina con 0 y sin errores de resolución.
- El CSS emitido contiene las utilidades usadas en `src/app/page.tsx` (`flex`,
  `bg-zinc-50`, `dark:bg-black`).
- No queda `app/` en la raíz y `git log --follow` sigue el historial de los dos ficheros
  movidos.
- `pnpm build` no pide secretos ni variables de entorno (RF-7.2).

**Evidencia:** salida del build roto anterior y del build verde, y el fragmento de CSS
emitido con las utilidades.

**Paradas:** si el build no compila Tailwind con el loader de `next.config.ts` y pide un
`postcss.config.mjs` nuevo (plan §9.2); si `next/font/google` no tiene red (plan §9.3).

---

## T2 — Entorno reproducible y guarda de gestor

**Estado:** hecho (2026-11-17). `pnpm install --frozen-lockfile` pasó sin modificar
`pnpm-lock.yaml`; las negativas de engine, gestor y build script abortaron como se esperaba;
`git check-attr` y `pnpm build` pasaron. `pnpm test` aún falla porque Vitest no encuentra
tests; la suite se añade en T5. Yarn 1 abortó primero por el campo `packageManager`; la
guarda se verificó ejecutando `preinstall` con su *user agent*.

**Objetivo:** que un clon limpio instale con pnpm en las versiones declaradas y que
cualquier otro gestor, Node fuera de rango o build script no revisado aborte la
instalación.

**RF:** 1.1, 1.2, 1.3, 1.4, 1.5, 1.7.

**Gates:** cierra la instalación reproducible (`pnpm install --frozen-lockfile`) y las
negativas 1.2/1.3/1.4. No toca código: el build de T1 sigue verde.

**Tests a escribir primero:** tres negativas en `verify/gates`, cada una con su salida
esperada escrita antes del cambio:

1. `engines.node` temporal a `>=99` → `pnpm install` sale con código 1 y mensaje de engine.
2. `npm install` y `yarn install` → código 1 con el mensaje de la guarda. Antes se
   comprueba qué hay en la máquina: si `yarn` no existe, se habilita con `corepack` y se
   anota cómo se lanzó, porque el resultado depende de que el *user agent* llegue como
   `yarn/…`.
3. Quitar temporalmente una entrada de `allowBuilds` → la instalación aborta **antes** de
   ejecutar el build script de ese paquete.

Ningún test automatizado: `check-package-manager.mjs` vive fuera de `src/`, no se mide y su
verificación real es la negativa de arriba.

**Pasos:** `.node-version`, `.gitattributes`, `check-package-manager.mjs`, `preinstall` y
`engines.node` en `package.json`, `engineStrict: true` en `pnpm-workspace.yaml`.
`allowBuilds` se revisa entrada por entrada cuando el primer `pnpm install` aborte y liste
paquetes con build script; se esperan `@tailwindcss/oxide`, `sharp`, `unrs-resolver` y algún
nativo de Vitest o Playwright. Después, `pnpm install` y `pnpm install --frozen-lockfile`.

**Hecho cuando:**

- `pnpm install --frozen-lockfile` sale con 0 y no modifica `pnpm-lock.yaml`.
- Las tres negativas dan código 1 con el mensaje previsto y quedan revertidas.
- `git check-attr text eol -- package.json` devuelve `text: auto` y `eol: lf`.
- `package.json` conserva `packageManager: "pnpm@12.16.1"` sin añadir `nodeVersion`.
- Cada entrada de `allowBuilds` tiene decisión explícita y justificada; ninguna se añadió
  «porque sí».
- `pnpm build` de T1 sigue en verde.

**Evidencia:** salida de las tres negativas y de `git check-attr`, más la lista final de
`allowBuilds` con su razón.

**Verificar en ejecución:** que `engineStrict` aborta de verdad (§15.3) y que
`strictDepBuilds` es `true` por defecto en pnpm 12.16.1 (§15.4). Si no lo fuera, se declara
explícitamente en `pnpm-workspace.yaml`, sin desactivar el gate.

**Paradas:** un build script que no se reconoce (plan §9.4); una dependencia con `engines`
incompatible (riesgo 1 de la spec), que se documenta y se decide, sin apagar `engineStrict`.

---

## T3 — Typecheck con tipos de ruta

**Estado:** hecho (2026-11-17). `pnpm typecheck` pasa desde un árbol sin `.next/` ni
`next-env.d.ts`; `next typegen` genera los tipos antes de `tsc`. El error temporal se detectó
con ruta y línea, y se retiró. La comprobación limpia previa al cambio ya pasaba porque el
código aún no consume helpers de ruta. `pnpm build` pasa; `pnpm test` sigue sin encontrar
tests, que se incorporan en T5.

**Objetivo:** que `pnpm typecheck` funcione en un clon sin `.next/` ni `next-env.d.ts` y
que un error de tipos en `src/` o en una configuración tipada lo ponga rojo.

**RF:** 3.1, 3.2, 3.3, 3.4, 3.5, 3.6.

**Gates:** cierra `pnpm typecheck`; mantiene `pnpm build` en verde.

**Tests a escribir primero:** dos comprobaciones, escritas antes de tocar el `tsconfig`:

1. Clon limpio simulado: borrar `.next/` y `next-env.d.ts` y ejecutar `pnpm typecheck`.
   Antes del cambio debe fallar por tipos de ruta ausentes; después debe salir en 0.
2. Error inyectado: una línea con un tipo imposible en un fichero temporal de `src/lib/`
   → el comando debe salir distinto de 0 e indicar ruta y línea. Se revierte.

**Pasos:** `include`/`exclude` explícitos del apartado 3 del plan y script
`"typecheck": "next typegen && tsc --noEmit"`. No se toca `strict`.

**Hecho cuando:**

- `pnpm typecheck` en 0 sobre un árbol sin `.next/` ni `next-env.d.ts`.
- El error inyectado se reporta con ruta y línea y código distinto de 0.
- `include` es exactamente la lista de RF-3.2 y `exclude` solo `node_modules`.
- `strict` sigue en `true`, y ni `eslint.config.mjs` ni `check-package-manager.mjs` entran
  en el programa de TypeScript (RF-3.5).
- `pnpm build` sigue en verde.

**Evidencia:** las dos salidas y `git diff` del `tsconfig.json`.

**Verificar en ejecución:** que `next typegen` genera los tipos de ruta sin compilar la app
(§15.7). Se completa en T6 con un error de tipos dentro de `e2e/`, cuando esa carpeta ya
existe.

**Paradas:** si `next typegen` falla por un `next.config.ts` inválido (riesgo 7), se arregla
antes lo que rompe el build, no se relaja el typecheck.

---

## T4 — Dependencias aprobadas y lint real

**Estado:** hecho (2026-11-17). Se instalaron las cuatro dependencias aprobadas y se quitaron
`@types/jest` y `eslint-plugin-vitest`; `pnpm install --frozen-lockfile`, `pnpm lint`,
`pnpm typecheck` y `pnpm build` pasan. Los fixtures temporales confirmaron texto hijo rojo,
literal en test verde y aviso `no-console` (activado como `warn` solo en el fixture `.mjs`)
rojo por `--max-warnings=0`; se eliminaron. `src/app/page.tsx` pasó sin cambios. La primera
ejecución confirmó que `noStrings` también marcaba atributos, por lo que se añadió
`ignoreProps: true` y se actualizó D5 en la spec. `pnpm test` todavía no encuentra suites; se
configura en T5.

**Objetivo:** tener instaladas exactamente las cuatro altas netas del apartado 12 y ninguna
de las dos bajas, y que `pnpm lint` falle con cualquier aviso, prohíba texto hijo literal en
la UI y use el plugin de Vitest vigente con reglas de test solo en tests.

**RF:** 4.1, 4.2, 4.3, 4.4, 4.5, 5.5 y la lista cerrada de §12.

**Gates:** cierra `pnpm lint` y la instalación reproducible (`pnpm install
--frozen-lockfile`); mantiene `pnpm build` y `pnpm typecheck` en verde.

**Tests a escribir primero:** comprobaciones de aceptación del «antes» y el «después», más
cuatro fixtures temporales que no se commitean:

1. `pnpm why eslint-plugin-vitest` y `pnpm why @types/jest` devuelven árbol antes; al
   terminar no deben devolver nada, y el diff de `package.json` solo puede contener las
   cuatro altas, las dos bajas y, si acaso, `@testing-library/dom` como peer declarado.
2. `src/components/Temp/Temp.tsx` con un texto hijo literal → rojo por
   `react/jsx-no-literals`.
3. El mismo literal dentro de `src/components/Temp/Temp.test.tsx` → verde: la exención es
   solo para tests, y en el componente sigue siendo rojo.
4. Un aviso real provocado a propósito → rojo por `--max-warnings=0`. La matriz de la spec
   propone `console.log`; si la configuración no lo marca como aviso, se usa la regla que sí
   avise (por ejemplo una variable sin usar) y **se documenta cuál se usó**, en vez de dar
   por hecho que `no-console` está activo.

**Comprobación obligatoria (además de las cuatro anteriores):** `pnpm lint` pasa sobre
`src/app/page.tsx` **sin cambios**, con su `className="flex flex-col flex-1 …"` intacto. Es
el fichero real que ya existe y la primera prueba de que la regla de literales no rompe la
UI por un atributo.

**Pasos:** altas con la versión exacta del apartado 12 (`@testing-library/dom@10.4.2`,
`eslint-plugin-jest-dom@5.10.2`, `@vitest/eslint-plugin@1.5.4`,
`@vitejs/plugin-react@6.3.0`), bajas de `@types/jest` y `eslint-plugin-vitest`, y
`eslint.config.mjs` reescrito con `@vitest/eslint-plugin` y `eslint-plugin-jest-dom`, bloque
de literales limitado a `src/app/**` y `src/components/**`, bloque de tests para
`**/*.test.{ts,tsx}`, `globalIgnores` del plan y script `eslint . --max-warnings=0`. Antes
de escribirlo se confirma en `node_modules` la forma exacta de los configs exportados
(`recommended` frente a `flat/recommended`).

**Hecho cuando:**

- `pnpm install --frozen-lockfile` sale limpio y no gana ni pierde ninguna otra dependencia;
  no aparece `vite-tsconfig-paths`.
- El diff de `pnpm-workspace.yaml` se revisa línea a línea (riesgo 2: pnpm puede añadir
  entradas a `allowBuilds`).
- `@vitest/eslint-plugin` queda en 1.5.4, no en 1.6.x (exige TypeScript ≥ 6).
- `pnpm lint` sale en 0 sobre el repo tal cual, incluido `src/app/page.tsx` sin cambios, y
  en rojo con los fixtures 2 y 4 y en verde con el 3.
- La lista de `allowedStrings` y la dependencia `eslint-plugin-vitest` han desaparecido.
- `eslint .` recoge también `.mjs` (§15.6) y no emite avisos.
- Los `.tsx` de test no reciben `jsx-no-literals` y sí las reglas de Vitest, Testing Library
  y jest-dom.
- `pnpm build` y `pnpm typecheck` siguen en verde.

**Evidencia:** diff de `package.json` y de `pnpm-workspace.yaml`, salida de `pnpm why`, y
las cuatro salidas del lint (verde de `page.tsx` y del fixture 3; rojo de los fixtures 2
y 4).

**Verificar en ejecución:** si `react/jsx-no-literals` con `noStrings: true` marca también
los atributos (`className` de `src/app/page.tsx`), se añade `ignoreProps: true` a la regla y
se enmienda la spec (D5 y el alcance de RF-4.2), porque la intención es marcar solo el texto
hijo y dejar los atributos para la spec 02. El código instalado de la regla reporta
`invalidPropValue` cuando `noStrings` está activo y `ignoreProps` no, así que se confirma al
ejecutar; no se da por hecho en ninguna dirección.

**Paradas:** si pnpm resuelve una versión distinta de la aprobada o pide otra dependencia
para satisfacer un peer, se para y se pregunta: §12 es una lista cerrada.

---

## T5 — Vitest con umbral y cobertura

**Estado:** hecho (2026-11-17). La suite vacía pasa y genera `coverage/lcov.info` de 0 bytes
(sin código medible, las cuatro métricas figuran como `Unknown%`, según §15.1). El módulo
temporal de 200 líneas hizo fallar las cuatro métricas al 0 %; el test temporal del alias `@/`
pasó (1/1, 100 %). Ambos se eliminaron. `pnpm test:watch --watch` entró en modo `DEV` y no
creó `coverage/`; como esta shell no es interactiva, se cerró el proceso tras comprobarlo.
`pnpm lint`, `pnpm typecheck` y `pnpm build` pasan. No quedan tests artificiales.

**Objetivo:** que `pnpm test` corra en jsdom con el setup cargado, recoja solo tests de
`src/`, genere `text` + `lcov` y falle por debajo del 95 % global en cualquiera de las
cuatro métricas.

**RF:** 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5 y 2.3 en tests.

**Gates:** cierra `pnpm test` (suite vacía en verde) y `pnpm test:watch`; mantiene
`pnpm build`, `pnpm typecheck` y `pnpm lint`.

**Tests a escribir primero:** ninguna suite nueva (RF-5.3); cuatro comprobaciones, escritas
antes de la configuración:

1. **Suite vacía:** `pnpm test` en 0 sin ningún fichero de test en el repo, y se anota si se
   generó `coverage/lcov.info` (§15.1).
2. **Umbral:** módulo temporal de ~200 líneas sin test en `src/lib/` → el global cae por
   debajo del 95 % y el comando sale con código 1 nombrando la métrica. Se revierte.
3. **Alias:** fichero temporal en `src/lib/` más un `*.test.tsx` que lo importe con `@/…`
   → verde, y luego se borran los dos.
4. **Watch:** `pnpm test:watch` arranca en watch y sale sin generar `coverage/`.

**Pasos:** `vitest.config.mts` del apartado 5 del plan (react, alias por tsconfig,
`passWithNoTests`, `setupFiles`, `include` de `src/`, `restoreMocks`, cobertura v8 con
`reportOnFailure` y umbrales 95/95/95/95), `src/test/setup.ts` con jest-dom y `cleanup`, y
scripts `test` y `test:watch`.

**Hecho cuando:**

- `pnpm test` sale en 0 con la suite vacía y sin tests en el repo.
- Las cuatro métricas están al 95 % y la cobertura se emite en `text` y `lcov`.
- La lista de exclusiones es exactamente la del apartado 9 de la spec y lleva el comentario
  cruzado con `sonar-project.properties` (RF-6.4).
- El módulo temporal de 200 líneas pone el comando rojo y, al borrarlo, vuelve a verde.
- `restoreMocks` está activo y el setup registra jest-dom y `cleanup`.
- `pnpm build`, `pnpm typecheck` y `pnpm lint` siguen en verde.

**Evidencia:** salida verde con suite vacía, salida roja del umbral con el porcentaje, y la
respuesta a §15.1 sobre `lcov`.

**Paradas:** si `resolve.tsconfigPaths` no resuelve `@/` en Vite 8.3.5 (§15.5), se para: no
se instala `vite-tsconfig-paths` sin aprobación.

---

## T6 — e2e contra el build de producción

**Estado:** hecho (2026-11-17). `pnpm test:e2e` construye producción y pasa el único smoke
en Chromium; también pasó con `PORT=4010`, verificando que `-p 3000` fija el puerto. Las
negativas de puerto ocupado, timeout de 1 s y `test.only` fallaron como se esperaba; el error
temporal de tipos bajo `e2e/` fue detectado por `pnpm typecheck`. Se restauraron y eliminaron
todos los fixtures. `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` pasan.

**Objetivo:** que `pnpm test:e2e` construya, levante el servidor de producción en el puerto
fijo y pase un smoke en Chromium, sin reutilizar servidores ni tolerar `test.only`.

**RF:** 8.1–8.8 y 7.3.

**Gates:** cierra `pnpm test:e2e` y la comprobación de `pnpm start` (RF-7.3); mantiene
`pnpm build`, `pnpm typecheck`, `pnpm lint` y `pnpm test`.

**Tests a escribir primero:** el smoke, antes que la configuración (es el único test
automatizado que deja esta spec): registra el listener de `pageerror` **antes** del
`page.goto('/')` y exige respuesta no nula, estado menor que 400 y cero `pageerror`. Sin
comprobar contenido. Después, tres negativas:

1. Con un proceso escuchando en el puerto 3000 → fallo explícito, no reutilización.
2. `webServer.timeout` temporal a 1 s → fallo de timeout.
3. Un `test.only` temporal → el comando falla en local igual que en CI.

**Pasos:** `playwright.config.ts` del apartado 6 del plan (un solo proyecto Chromium,
`forbidOnly: true`, `retries: 0`, reporter `list` + `html`, `trace: 'retain-on-failure'`,
`command: 'pnpm start -p 3000'`, `url: 'http://127.0.0.1:3000'`,
`reuseExistingServer: false`), `e2e/home.spec.ts`, script `test:e2e` y `/playwright-report`
en `.gitignore`.

**Hecho cuando:**

- `pnpm test:e2e` construye y pasa 1 test en Chromium, sin servidor de desarrollo.
- `pnpm start` sirve `/` con estado menor que 400 (RF-7.3).
- Las tres negativas fallan como se espera y quedan revertidas.
- Un fallo deja traza en `test-results/` y el informe HTML se escribe en
  `playwright-report/` (los dos aparecen en `.gitignore`).
- Un error de tipos dentro de `e2e/` pone rojo `pnpm typecheck` (cierra RF-3.3 en esa
  carpeta).
- Los cuatro gates anteriores siguen en verde.

**Evidencia:** salida del run verde y de las tres negativas.

**Verificar en ejecución:** confirmar en la máquina que `pnpm start -p 3000` fija el puerto
y que `next start` lo respeta (§15.8). Ya está comprobado en el plan: la guía del CLI
instalada documenta `-p`/`--port` y `PORT`, y pnpm reenvía los argumentos tras el nombre del
script sin `--`; lo que queda es verlo con el servidor arrancado. Si no lo respetara, se fija
por otra vía equivalente y se anota; no se cambia a un puerto dinámico, porque RF-8.2 lo
prohíbe.

---

## T7 — CI con los cinco gates locales

**Estado:** hecho (2026-11-17) en lo local. `.github/workflows/ci.yml` creado con los cinco jobs
`lint`, `typecheck`, `test`, `build` e `e2e` (id == name), `build.yml` borrado, SHA + `# vX.Y.Z` en
todas las `uses`, sin `continue-on-error`/`|| true`/`paths-ignore`/`pull_request_target`,
`permissions: contents: read`, concurrency segura, `NEXT_TELEMETRY_DISABLED=1`, timeouts,
`pnpm install --frozen-lockfile` + script pnpm de la documentación en cada job, artefactos
`coverage`, `playwright-report` y `playwright-test-results` con retención 7 días, `if: always()` y
`if-no-files-found: warn`, e `e2e` instala Chromium. La negativa RF-1.6 (`.node-version` = `26`)
se ejecutó localmente y falló con mensaje explícito y código 1; `.node-version` quedó restaurado a
`26.12.0`. `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` pasan.

**Objetivo:** un workflow «CI» que ejecute lint, typecheck, test, build y e2e en paralelo,
con permisos mínimos, concurrencia segura, timeouts y artefactos, sustituyendo al
`build.yml` actual.

**RF:** 9.1, 9.2, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11 y 1.6.

**Gates:** cierra los cinco checks de CI (`lint`, `typecheck`, `test`, `build`, `e2e`) y
RF-1.6; mantiene en verde los cinco gates locales.

**Tests a escribir primero:** la comprobación de aceptación se escribe como lista de
verificación del YAML antes de subirlo:

- Cada `uses` lleva SHA y el comentario `# vX.Y.Z` coincide con la tabla del apartado 11 de
  la spec.
- No aparece `continue-on-error`, `|| true`, `paths-ignore` ni `pull_request_target`
  (`grep` sobre el fichero).
- Los `id` de los jobs coinciden con sus `name`.

Y una negativa real en `verify/gates`: `.node-version` con un valor **parcial**, `26`, en vez
de la versión completa → el paso de versión se pone rojo con mensaje explícito (RF-1.6). Se
elige un pin parcial y no un valor «alterado respecto al runner» porque el fallo que se
quiere detectar es el pin mal escrito: `.node-version` se escribe a mano y `26` es un valor
plausible. La comprobación exige coincidencia exacta porque `node -v` siempre devuelve
`X.Y.Z`: con `26`, `setup-node` instala el último 26.x que encuentre y el literal del fichero
(`26`) nunca iguala la salida del binario (`26.12.0`), así que el PR queda rojo. La versión
exacta de `.node-version` tiene que ser, por tanto, la que imprime `node -v` sin la `v`.

**Pasos:** crear `.github/workflows/ci.yml` con `lint`, `typecheck`, `test`, `build` y
`e2e` del apartado 7 del plan (sin el job `sonar` todavía), borrar
`.github/workflows/build.yml` y abrir el PR de borrador `verify/gates` → `main` para que el
workflow dispare.

**Hecho cuando:**

- El run del PR de prueba muestra cinco jobs verdes, cada uno con el nombre de su `id`.
- `test` deja el artefacto `coverage` y `e2e` deja `playwright-report` y
  `playwright-test-results`, con retención de 7 días, `if: always()` e
  `if-no-files-found: warn`.
- Cada job instala con `pnpm install --frozen-lockfile` y ejecuta el mismo script pnpm que
  la documentación.
- Un segundo push al mismo PR cancela la ejecución anterior; un push a `main` no lo haría
  (se comprueba leyendo el `concurrency`, porque `main` todavía no recibe pushes directos en
  esta fase).
- La negativa del pin parcial deja el job `lint` rojo con el mensaje de versión.

**Evidencia:** enlace al run de cinco jobs, a la negativa del pin parcial y al artefacto de
cobertura.

**Verificar en ejecución:** que cada SHA fijado corresponde de verdad a su tag, con
`git ls-remote --tags https://github.com/<org>/<repo> refs/tags/vX.Y.Z` (en tags anotados,
comparar con la línea `^{}`); y que GitHub expone los checks con los nombres de los `id`.

**Paradas:** si los nombres reales de los checks no son los `id` (plan §9.6), se para antes
de tocar el ruleset; si un `git ls-remote` no devuelve el SHA fijado, se corrige la tabla
antes de seguir.

---

## T8 — CI con Sonar y propiedades alineadas

**Estado:** hecho (2026-11-17) en lo local. Job `sonar` añadido a `.github/workflows/ci.yml`
con checkout `fetch-depth: 0`, paso `Require SONAR_TOKEN` antes de instalar dependencias,
`pnpm install --frozen-lockfile`, `pnpm test` y `sonarqube-scan-action@… # v8.5.0` con
`SONAR_TOKEN`. `sonar-project.properties` reescrito: `sonar.sources=src`, `sonar.tests=src`,
`sonar.test.inclusions=**/*.test.ts,**/*.test.tsx`, `sonar.javascript.lcov.reportPaths=coverage/lcov.info`,
exclusiones de cobertura idénticas a `vitest.config.mts`, `sonar.cpd.exclusions` solo tests,
sin `sonar.language` ni `sonar.exclusions`, `sonar.qualitygate.wait=true` y
`sonar.qualitygate.timeout=300` en el fichero. La negativa sin `SONAR_TOKEN` falla con
mensaje explícito y código 1 antes del scanner. `pnpm lint`, `pnpm typecheck`, `pnpm test`
y `pnpm build` pasan.

**Objetivo:** añadir el sexto check, con análisis sobre `src/`, gate «Sonar way» y fallo
cerrado sin token.

**RF:** 9.3, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8.

**Gates:** cierra el sexto check (`sonar`) y el Quality Gate; mantiene los otros cinco
checks en verde.

**Tests a escribir primero:** dos comprobaciones y una negativa:

1. Comparación literal entre las exclusiones de `vitest.config.mts` y
   `sonar.coverage.exclusions`: mismos cinco patrones, sin sobrantes ni faltantes (RF-6.4 /
   RF-10.6).
2. `sonar.sources=src`, `sonar.tests=src` y `sonar.test.inclusions` declarados; sin
   `sonar.exclusions` ni `sonar.language`; `qualitygate.wait` y `timeout` en el fichero, no
   en argumentos de la acción.
3. Negativa: rama sin `SONAR_TOKEN` (o variable vacía) → el job sale rojo con el mensaje
   explícito, antes de llamar al scanner.

**Pasos:** reescribir `sonar-project.properties` con el contenido del apartado 7 del plan y
añadir el job `sonar` (checkout con `fetch-depth: 0`, paso `Require SONAR_TOKEN` **antes** de
instalar dependencias, `pnpm test` y `sonarqube-scan-action@… # v8.5.0` con
`SONAR_TOKEN`). No se toca `dependabot.yml`.

**Hecho cuando:**

- El PR de prueba muestra **seis** checks verdes con los nombres `lint`, `typecheck`, `test`,
  `build`, `e2e` y `sonar`.
- El Quality Gate «Sonar way» está en verde sobre código nuevo y el job espera el veredicto.
- Sin token, el job falla con el mensaje explícito y no llega al scanner.
- Las exclusiones de cobertura de Sonar coinciden con las de Vitest y `src/app/**` se
  analiza pero no cuenta para cobertura.
- Desaparecen la lista larga de `sonar.exclusions` y las referencias a `tests/`, `specs/`,
  `stories/`, `mocks/` y `app/i18n/dictionaries/`.

**Evidencia:** enlace al run de seis checks, al gate y a la negativa sin token.

**Verificar en ejecución:** el solape de `sonar.sources=src` y `sonar.tests=src`, que es
deliberado (los tests viven dentro de `src/` y se separan con `sonar.test.inclusions`), no
puede duplicar ficheros ni hacer fallar el scanner. Se confirma en el primer run: si avisa,
se documenta; si falla, se para y se pregunta antes de tocar el alcance del análisis.

**Paradas:** si el scanner falla sin `coverage/lcov.info`, se aplica la regla única: si solo
avisa, se acepta y se documenta; si falla, se para y se pregunta (§15.2). No se fabrica un
`lcov`, no se adelanta un módulo y no se mueve el job.

**Requisito previo ya cumplido (no es tarea):** Automatic Analysis desactivada, gate «Sonar
way» por defecto y `SONAR_TOKEN` en secretos de Actions y de Dependabot (§15.10).

---

## T9 — Batería negativa consolidada

**Objetivo:** demostrar que cada gate se pone rojo cuando debe, con evidencia enlazada y sin
dejar rastro en el repositorio.

**RF:** la matriz del apartado 11 de la spec: 1.2, 1.3, 1.4, 1.6, 1.7, 4.2, 4.3, 6, 8.4,
8.5.

**Gates:** no añade gates; demuestra que los existentes fallan cuando deben. Al terminar,
ningún gate puede quedar rojo en `01`.

**Tests a escribir primero:** la tabla de negativas, con su resultado esperado, se copia al
cuerpo del PR de `verify/gates` **antes** de ejecutarlas; cada fila se rellena con el enlace
del run o la salida del comando.

**Pasos:** en `verify/gates`, ejecutar una por una las diez pruebas del apartado 8 del plan,
revertir cada cambio antes de la siguiente y empujar solo lo necesario para que la CI genere
el run. Al terminar, borrar la rama y cerrar el PR sin fusionar.

**Hecho cuando:**

- Las diez filas tienen evidencia: enlace al run o salida de terminal con el código de
  salida.
- Ninguna prueba deja ficheros temporales commiteados ni en `01`.
- `git status` en `01` está limpio y `verify/gates` está borrada.
- Los cinco gates locales y los seis checks siguen verdes en `01`.

**Evidencia:** PR cerrado con la tabla rellena; sus enlaces alimentan la matriz de T11.

---

## T10 — PR, nombres de check y ruleset

**Objetivo:** que `01` llegue a `main` con los seis checks verdes y que el ruleset los exija
por nombre, sin `Analyze` fantasma.

**RF:** 12.1, 12.2, 12.3, 12.4, 10, 9.12 en lo que dependa de esta fase.

**Gates:** cierra RF-12 (ruleset). Ningún gate puede estar rojo en el PR.

**Tests a escribir primero:** la comprobación de aceptación es la lista de lo que se va a
verificar en la interfaz **antes** de pedir el ruleset: nombres exactos de los seis checks,
que no quede `Analyze`, y que un push directo a `main` esté rechazado.

**Pasos:** push de `01`, PR a `main`, esperar los seis checks, leer sus nombres exactos en la
pestaña *Checks* y comunicárselos a Pedro. Con el ruleset creado (PR obligatorio, 0
aprobaciones, seis checks por nombre, sin bypass, sin force push, sin borrado, sin rama al
día, sin merge queue), comprobar el rechazo de un push directo. **No fusionar todavía**: el
cierre es T11.

**Hecho cuando:**

- El PR muestra seis checks verdes con nombres idénticos a los `id`, y el run completo baja
  de diez minutos (§15.12).
- El ruleset de `main` está activo con esos seis y sin `Analyze`.
- `git push origin HEAD:main` desde una rama cualquiera se rechaza, y no hay bypass ni force
  push.
- Los nombres no se han inventado: salen del primer run (§15.9).

**Evidencia:** enlace al PR, captura o listado de los seis nombres, y salida del push
rechazado.

**Paradas:** si los nombres no coinciden con los `id`, se corrige el workflow antes de crear
el ruleset; nunca se crea un ruleset con checks inexistentes.

---

## T11 — Cierre documental y verificación de Dependabot

**Objetivo:** cerrar la spec con la documentación y el roadmap alineados, la matriz con
evidencias reales y el PR de Dependabot verificado o marcado como pendiente.

**RF:** 11.1, 11.2, 11.3, 11.4, 10.7, 10.8; RF-9.12 (§15.11) y la nota de RF-12.5 para la
spec 13.

**Gates:** cierra la definición de terminado completa en `main`.

**Tests a escribir primero:** la comprobación de aceptación se escribe como diff esperado:
la casilla de la 01 marcada en `docs/roadmap.md`, la matriz del apartado 11 con enlaces, y
una lectura cruzada de `README.md`/`AGENTS.md` contra los scripts reales de `package.json`
(que el comando documentado sea **literalmente** el de la CI).

**Pasos:** commit `docs(01): mark the tooling spec as done` con la casilla del roadmap, el
estado de la spec y la matriz rellenada con los enlaces de T7–T10. Fusionar el PR. Después,
cuando llegue un PR de Dependabot o se recree con `@dependabot recreate`, comprobar que
ejecuta los seis checks con su propio token.

**Hecho cuando:**

- El commit de cierre toca solo documentación y la casilla de la 01 queda marcada.
- La matriz del apartado 11 no tiene filas sin evidencia, salvo las que la spec marca
  explícitamente como «verificar en ejecución».
- `README.md` no menciona `npm`, `yarn` ni `eslint-plugin-vitest`, y sus comandos coinciden
  con `package.json`.
- El PR está fusionado y `main` tiene un run de CI en verde.
- El PR de Dependabot pasa los seis checks o queda registrado como pendiente con su motivo
  (§15.11), sin editar `dependabot.yml`.
- No queda ninguna mención a un check `Analyze` obligatorio en la documentación.

**Evidencia:** `git show --stat` del commit de cierre, run verde en `main` y enlace al PR de
Dependabot.

**Nota:** RF-12.5 (despliegue solo desde `main` y tras CI en verde) no se implementa aquí:
se traslada a la spec 13.

---

## 4. Definición de terminado (global)

Al cerrar T11, en un clon limpio y en `main`:

1. `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test` y
   `pnpm build` en verde.
2. `pnpm test:e2e` en verde contra el build de producción.
3. PR con los seis checks verdes y con esos seis nombres en el ruleset de `main`.
4. Quality Gate «Sonar way» verde sobre código nuevo.
5. Roadmap con la 01 marcada, documentación alineada y matriz con evidencias.
6. `verify/gates` borrada y `git status` limpio.

Si algo de esto no se puede demostrar, se dice explícitamente qué falta y por qué, en vez de
afirmar que está hecho.
