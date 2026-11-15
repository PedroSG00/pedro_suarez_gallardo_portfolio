# 004 — Cabecera y destinos — Tareas

- **Estado:** Pendiente
- **Spec:** `specs/004-site-header/spec.md` (revisada el 15 de noviembre de 2026)
- **Plan:** `specs/004-site-header/plan.md`
- **Duración objetivo:** 20–30 minutos por tarea
- **Orden:** estricto, de arriba abajo; no empezar una tarea hasta que la anterior tenga su «Hecho cuando» verde.

> **Tests primero (Constitución 4).** Cada tarea incluye su prueba: se escribe antes de la implementación, se confirma en rojo y se deja en verde. Ninguna tarea termina con lint, tipos o tests en rojo.
>
> **Alcance.** La 004 crea la cabecera, los destinos y las secciones con titular y ancla. No compone la portada ni escribe contenido: los cascarones quedan vacíos para la 005.

## Fase 1 — Datos y lógica pura

RF cubiertos: RF-1 (T1, T2), RF-3 (T2), RF-4 (T4, T5, T6), RF-5 (T3, T6), RF-8 (T1, T6), RNF-4 (T4, T5), RNF-5 (T4, T5), RNF-8 (T2), RNF-9 (T1, T2).

- [x] **T1 — Claves i18n de la cabecera** (`app/i18n/dictionaries/{en,es}.json`, `dictionary-parity.test.ts`, `dictionaries.test.ts`, `en-dictionary.test.ts`, `es-dictionary.test.ts`)
  - RF: RF-1, RF-6, RF-7, RF-8, RNF-9
  - Hecho cuando: `pnpm exec vitest run app/i18n/dictionaries` pasa y `pnpm typecheck` está limpio con `nav.*`, `header.label`, `themeToggle.state|aria.*` y `languageMenu.label|aria.*` presentes en ambos idiomas, `nav.stack` idéntico en `en` y `es`, y `themeSelect.*` todavía intacto.

- [x] **T2 — Lista única de destinos** (`app/navigation/destinations.ts` + `destinations.test.ts`)
  - RF: RF-1, RF-3, RNF-8, RNF-9
  - Hecho cuando: `pnpm exec vitest run app/navigation/destinations.test.ts` pasa y verifica cinco destinos en orden home→contact, ids y `sectionId` únicos, `projects.page === 'projects'`, y cada `labelKey` resoluble en ambos diccionarios.

- [x] **T3 — Función pura del destino activo** (`app/navigation/active-destination.ts` + `active-destination.test.ts`)
  - RF: RF-5
  - Hecho cuando: `pnpm exec vitest run app/navigation/active-destination.test.ts` pasa y, para cada conjunto de métricas (incluidos `top = 0`, secciones solapadas y sección más corta que la cabecera), devuelve exactamente un id y nunca dos.

- [x] **T4 — Matriz de la racha y retirada progresiva** (`tests/fixtures/header-cases.json`, `app/components/SiteHeader/header-shift.ts` + `header-shift.test.ts`)
  - RF: RF-4, RNF-4
  - Hecho cuando: `pnpm exec vitest run app/components/SiteHeader/header-shift.test.ts` pasa con `offset = 0` hasta 64 px, progresión `min(1, (top − 64) / (2 × altura))`, tope de una altura y retorno completo al subir, siempre con `contentShiftPx = 0`.

- [x] **T5 — Guardas del reductor de retirada** (`app/components/SiteHeader/header-shift.ts` + `header-shift.test.ts`)
  - RF: RF-4, RNF-4, RNF-5
  - Hecho cuando: el mismo test pasa para foco dentro, panel abierto, `reducedMotionChange` (también sobrevenido), `resize`, `load` sin JavaScript y reversión menor de 8 px, conservando el último sentido y `contentShiftPx = 0`.

- [x] **T6 — Racha de continuidad de la cabecera** (`tests/lib/header-streak.ts` + `header-streak.test.ts`)
  - RF: RF-2, RF-3, RF-4, RF-5, RF-8, RNF-4
  - Hecho cuando: `pnpm exec vitest run tests/lib/header-streak.test.ts` pasa con `rachaActual = nº de casos`, `rachaMaxima = rachaActual` y `casosFallidos` vacía, y un caso manipulado a propósito reinicia la racha y nombra su id.

## Fase 2 — Arranque del tema

RF cubiertos: RF-6, RNF-4.

- [x] **T7 — Opción de tema y etiqueta antes del primer pintado** (`app/theme/boot-script.ts`, `app/theme/boot-script.test.ts`, `app/[locale]/layout.tsx`)
  - RF: RF-6, RNF-4
  - Hecho cuando: `pnpm exec vitest run app/theme/boot-script.test.ts` pasa para valor guardado `light|dark|system`, ausente, inválido y almacenamiento bloqueado, y el HTML inicial de `[locale]/layout.tsx` contiene `data-theme-choice` y la etiqueta correspondiente al idioma.

## Fase 3 — Piezas de la cabecera

RF cubiertos: RF-1 (T8, T9, T14), RF-2 (T10, T11), RF-5 (T9), RF-6 (T12), RF-7 (T10, T13), RF-8 (T9–T13), RNF-7 (T12, T13).

- [x] **T8 — Marca** (`app/components/SiteHeader/Brand.tsx` + `Brand.test.tsx`)
  - RF: RF-1
  - Hecho cuando: `Brand.test.tsx` pasa y el enlace usa el nombre completo recibido por props y apunta al inicio del idioma activo (`/en` o `/es`), sin cadenas visibles escritas en el componente.

- [x] **T9 — Navegación ancha y destino activo** (`app/components/SiteHeader/PrimaryNav.tsx` + `PrimaryNav.test.tsx`)
  - RF: RF-1, RF-5, RF-8
  - Hecho cuando: `PrimaryNav.test.tsx` pasa con cinco enlaces en el orden de `DESTINATIONS`, `aria-current="true"` solo en Proyectos cuando la ruta es `/projects` o `/projects/<slug>`, y una marca no cromática (bloque invertido + signo tipográfico) en el destino activo.

- [x] **T10 — Cierre común de desplegables** (`app/components/SiteHeader/use-disclosure.ts` + `use-disclosure.test.ts`)
  - RF: RF-2, RF-7
  - Hecho cuando: `use-disclosure.test.ts` pasa y demuestra cierre con Escape, clic fuera y selección, sin mover ni atrapar el foco, y sin efectos cuando el `<details>` ya está cerrado.

- [x] **T11 — Navegación estrecha** (`app/components/SiteHeader/nav/NavDisclosure.tsx` + `NavDisclosure.test.tsx`)
  - RF: RF-2, RF-8
  - Hecho cuando: `NavDisclosure.test.tsx` pasa con `<details>` cerrado por defecto, `summary` con la etiqueta del diccionario, cierre con Escape/clic fuera/selección y un único DOM con los mismos enlaces en ancho y estrecho.

- [x] **T12 — Botón de tema de tres estados** (`app/components/SiteHeader/ThemeToggle.tsx` + `ThemeToggle.test.tsx`)
  - RF: RF-6, RF-8, RNF-7
  - Hecho cuando: `ThemeToggle.test.tsx` pasa con el ciclo claro→oscuro→sistema→claro leído de la preferencia, texto visible de la opción elegida, nombre accesible de frase completa, almacenamiento bloqueado sin errores y cambio entre pestañas sin mover el foco.

- [x] **T13 — Control de idioma** (`app/components/SiteHeader/LanguageMenu.tsx` + `LanguageMenu.test.tsx`)
  - RF: RF-7, RF-8, RNF-7
  - Hecho cuando: `LanguageMenu.test.tsx` pasa con dos enlaces nativos `hreflang` a la ruta equivalente (y, con JavaScript, misma consulta y fragmento), idioma activo marcado con signo además del estilo, disparador con el nombre del idioma y sin cambiar de idioma al abrir o cerrar.

- [x] **T14 — Composición de la cabecera** (`app/components/SiteHeader/SiteHeader.tsx` + `SiteHeader.test.tsx`)
  - RF: RF-1, RF-8
  - Hecho cuando: `SiteHeader.test.tsx` pasa con `<header role="banner" aria-label>`, `<nav aria-label>`, orden marca→navegación→idioma→tema y cero cadenas visibles escritas en el componente.

## Fase 4 — Montaje y retirada de la forma provisional

RF cubiertos: RF-1 (T15), RF-6 (T15, T16), RF-7 (T15, T16), RF-8 (T16), RNF-9 (T16), RNF-10 (T15).

- [x] **T15 — Montar la cabecera en `(site)`** (`app/[locale]/(site)/layout.tsx`, `app/[locale]/(site)/layout.test.tsx`)
  - RF: RF-1, RF-6, RF-7, RNF-10
  - Hecho cuando: `pnpm exec vitest run "app/[locale]/(site)"` pasa, el inicio y `/projects` renderizan la cabecera con textos del servidor, y la 404 de `app/[locale]/not-found.tsx` no la hereda.

- [x] **T16 — Retirar `LanguageSelector`, `ThemeSelect` y `themeSelect.*`** (`app/components/LanguageSelector/*`, `app/components/ThemeSelect/*`, diccionarios, `specs/003-base-consolidation/spec.md`)
  - RF: RF-6, RF-7, RF-8, RNF-9
  - Hecho cuando: ambos componentes y sus tests ya no existen, `themeSelect.*` está ausente de los dos diccionarios, `pnpm exec vitest run app/i18n/dictionaries "app/[locale]"` pasa y la 003 tiene la nota fechada de que la 004 sustituye esa forma provisional.

## Fase 5 — Secciones, anclas y foco

RF cubiertos: RF-3 (T17–T21), RF-4 (T20), RF-5 (T18, T21), RF-8 (T17, T19, T21), RNF-4 (T20), RNF-5 (T19), RNF-10 (T18).

- [x] **T17 — Titular con ancla** (`app/components/SectionAnchor/SectionAnchor.tsx` + `SectionAnchor.test.tsx`)
  - RF: RF-3, RF-8
  - Hecho cuando: `SectionAnchor.test.tsx` pasa con un `h2` que tiene `id`, `tabindex="-1"`, `scroll-margin-top` y ningún botón ni enlace añadido.

- [x] **T18 — Cascarones de las secciones del inicio** (`app/[locale]/(site)/page.tsx`, `page.test.tsx`)
  - RF: RF-3, RF-5, RNF-10
  - Hecho cuando: `page.test.tsx` pasa con el ancla `inicio` y las cuatro secciones `experiencia`, `proyectos`, `stack` y `contacto` en el orden de `DESTINATIONS`, cada una con `SectionAnchor`, titular bilingüe y altura mínima suficiente para que su titular cruce el borde inferior de la cabecera, sin contenido de currículum.

- [x] **T19 — Estructura visual de la cabecera** (`app/globals.css`, `globals.css.test.ts`)
  - RF: RF-1, RF-2, RF-5, RF-8, RNF-5
  - Hecho cuando: `globals.css.test.ts` pasa y comprueba fondo opaco, retícula de cabecera, `<details>` forzado abierto y `summary` oculto en ≥1024 px, panel superpuesto a ancho completo, objetivos de 24×24 px y marca de activo no cromática.

- [x] **T20 — Altura real y `scroll-margin`** (`app/components/SiteHeader/SiteHeader.tsx`, `app/globals.css`, tests de ambos)
  - RF: RF-3, RF-4, RNF-4
  - Hecho cuando: los tests de `SiteHeader` y `globals.css` pasan y `--header-height` refleja la altura medida al montar y tras `resize`, con un respaldo CSS que deja el titular debajo de la cabecera antes de medir.

- [x] **T21 — Foco en el titular al elegir un destino** (`app/components/SectionAnchor/SectionAnchor.tsx` + `SectionAnchor.test.tsx`)
  - RF: RF-3, RF-5, RF-8
  - Hecho cuando: el test pasa y, al activar `#experiencia` por clic o `hashchange`, el titular queda como `document.activeElement` con `focus({ preventScroll: true })`, sin `scrollIntoView`, sin control visible y sin duplicar el desplazamiento del ancla.

## Fase 6 — Scroll y destino activo en vivo

RF cubiertos: RF-4 (T22, T24), RF-5 (T23), RF-8 (T23, T24), RNF-4 (T22, T23), RNF-5 (T24).

- [ ] **T22 — Retirada progresiva en el cliente** (`app/components/SiteHeader/use-header-shift.ts`, `SiteHeader.test.tsx`)
  - RF: RF-4, RNF-4
  - Hecho cuando: el test de integración pasa y `use-header-shift` publica `data-header-state` y `--header-offset` en un solo `requestAnimationFrame` por scroll, con retirada progresiva, retorno completo, guardas de foco y panel, y cero cambios de layout (`contentShiftPx = 0`).

- [ ] **T23 — Destino activo en vivo** (`app/components/SiteHeader/use-active-destination.ts`, `SiteHeader.test.tsx`)
  - RF: RF-5, RNF-4, RF-8
  - Hecho cuando: el test de integración pasa y `aria-current` pasa a `location` en la sección visible, vuelve a Inicio en `top = 0`, el servidor entrega `true` en Proyectos y `location`/Inicio en el inicio sin JavaScript, y nunca hay dos `aria-current` a la vez.

- [ ] **T24 — Guardas CSS del scroll** (`app/globals.css`, `globals.css.test.ts`)
  - RF: RF-4, RF-8, RNF-5
  - Hecho cuando: `globals.css.test.ts` pasa y con `:focus-within`, `:has(details[open])`, `prefers-reduced-motion: reduce`, transición de 150–300 ms y `forced-colors: active` la cabecera queda fija y visible y el foco no queda tapado.

## Fase 7 — End-to-end y cierre

RF cubiertos: RF-1 a RF-8, RNF-1 a RNF-6, RNF-10.

- [ ] **T25 — E2E de cabecera y destinos** (`tests/e2e/header-flow.e2e.ts`)
  - RF: RF-1, RF-2, RF-3, RF-5, RNF-3
  - Hecho cuando: `pnpm exec playwright test tests/e2e/header-flow.e2e.ts` pasa en los seis proyectos y verifica cabecera en inicio y proyectos, ausente en 404, orden, cinco destinos, salto con titular enfocado y visible desde la portada y desde otra página, y metadatos sin cambios.

- [ ] **T26 — E2E de scroll** (`tests/e2e/header-scroll.e2e.ts`)
  - RF: RF-4, RNF-4, RNF-5
  - Hecho cuando: `pnpm exec playwright test tests/e2e/header-scroll.e2e.ts` pasa en los seis proyectos y verifica retirada progresiva, vuelta completa, umbral de 8 px, guardas de foco y desplegable, `contentShiftPx = 0`, movimiento reducido al cargar y activado en vivo, y cabecera visible sin JavaScript.

- [ ] **T27 — E2E de tema e idioma** (`tests/e2e/theme-flow.e2e.ts`, `tests/e2e/i18n-flow.e2e.ts`)
  - RF: RF-6, RF-7, RNF-4, RNF-7
  - Hecho cuando: ambos flujos pasan en los seis proyectos y verifican etiqueta correcta en el primer pintado, ciclo, almacenamiento bloqueado, otra pestaña, desplegable de idioma sin JavaScript, cookie y conservación de ruta, consulta y fragmento.

- [ ] **T28 — E2E de accesibilidad** (`tests/e2e/header-a11y.e2e.ts`)
  - RF: RF-8, RNF-5, RNF-6
  - Hecho cuando: el flujo pasa en los seis proyectos y no hay scroll horizontal a 320 px ni con zoom 200 %, todos los objetivos miden al menos 24×24 px, el foco es visible y no queda tapado, y `forced-colors` conserva bordes y estados.

- [ ] **T29 — Verificación final** (repositorio completo)
  - RF: todos, RNF-1, RNF-2
  - Hecho cuando: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e` y `pnpm build` terminan con código 0, `package.json` no gana dependencias y la tabla de cobertura de abajo no tiene huecos.

## Cobertura RF → tareas

| RF/RNF | Tareas |
|---|---|
| RF-1 | T1, T2, T8, T9, T14, T15, T19, T25 |
| RF-2 | T6, T10, T11, T19, T25 |
| RF-3 | T2, T6, T17, T18, T20, T21, T25 |
| RF-4 | T4, T5, T6, T20, T22, T24, T26 |
| RF-5 | T3, T6, T9, T18, T21, T23, T25 |
| RF-6 | T1, T7, T12, T15, T16, T27 |
| RF-7 | T1, T10, T13, T15, T16, T27 |
| RF-8 | T1, T6, T9, T11, T12, T13, T14, T16, T17, T19, T21, T23, T24, T28 |
| RNF-1 | T29 |
| RNF-2 | T29 |
| RNF-3 | T25 |
| RNF-4 | T4, T5, T6, T7, T20, T22, T26, T27 |
| RNF-5 | T4, T5, T19, T24, T26, T28 |
| RNF-6 | T28 (los seis proyectos en T25–T28) |
| RNF-7 | T12, T13, T27 |
| RNF-8 | T2, T14 |
| RNF-9 | T1, T2, T16 |
| RNF-10 | T15, T18 |

## Criterio de finalización

La 004 se da por terminada solo cuando T1–T29 están marcadas, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e` y `pnpm build` pasan en verde, y no se ha añadido ninguna dependencia.
