# Tasks — 03 Tema y tokens

- **Spec:** `docs/specs/03-theme-and-tokens/spec.md` (aprobada)
- **Plan:** `docs/specs/03-theme-and-tokens/plan.md` (módulos, contratos y algoritmos)
- **Estado:** pendiente de ejecución. T1 está bloqueada por aprobaciones (plan §10) y por el estado real de la 02.

Este fichero **no añade ni cambia requisitos**: trocea el plan en incrementos que se implementan y verifican uno a uno. El plan dice *qué* contiene cada pieza; aquí se dice *en qué orden* se toca y *cómo se demuestra* que está hecho.

## 0. Cómo se lee cada tarea

| Campo | Qué significa |
| --- | --- |
| **Objetivo** | Resultado observable del incremento, en una frase |
| **RF** | Requisitos de la spec que quedan cubiertos (no se inventan nuevos) |
| **Depende de** | Tareas que deben estar cerradas, o aprobaciones de plan §10 |
| **Tests a escribir primero** | Comprobación de aceptación que se escribe **antes** del código |
| **Criterio de hecho** | Criterio binario, con el comando o la salida que lo demuestra |

Cada tarea termina en verde por sí sola: ningún test nuevo queda rojo al cerrar una tarea. Cuando un test de auditoría solo puede pasar contra el `globals.css` real, se anota en la tarea que lo activa; hasta entonces el mismo módulo se prueba con fixtures inline, y la lectura de `globals.css?raw` se enciende en T7.

## 1. Reglas que valen para todas las tareas

- Tests antes que código; sin snapshots, sin clases de Tailwind y sin tests que solo suban cobertura.
- Solo pnpm. Sin dependencias nuevas: si algo exige `pnpm add`, se para y se pregunta.
- Sin carpetas nuevas en la raíz ni en `src/`; sin barrel files; imports con `@/`.
- Los módulos de producto (`theme.ts`, `theme-script.ts`, `theme-dom.ts`) van a `src/lib/` con su test al lado. Los de auditoría (`theme-tokens.ts`, `theme-contrast.ts`, `type-scale.ts`) y los helpers (`theme.ts`, `source.ts`, `raw.d.ts`, `theme-audit.test.ts`, `theme-source.test.ts`) van a `src/test/`, ya excluido de cobertura.
- Cobertura ≥ 95 % sin bajar el umbral y sin excluir código nuevo. `src/lib/**` entra entero.
- Gates al cerrar cada tarea: `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`. De T9 en adelante, también `pnpm test:e2e` (se toca tema).
- Código, comentarios y commits en inglés; documentación en castellano. Conventional Commits: `feat(03): …`, `test(03): …`, `docs(03): …`.
- Prohibido: `dark:` de Tailwind (sigue a `prefers-color-scheme`, no a `data-theme`), `font-sans`/`font-serif`, hex fuera de `globals.css`, espaciados fuera de la escala de 4 px.

## 2. Orden, dependencias y commits

| Tarea | Qué entrega | RF | Depende de |
| --- | --- | --- | --- |
| T1 | Un solo `<html>`, `[locale]` root param, rutas estáticas, placeholder fuera | soporte de RF-3 y del NFR estático | §10.2, §10.4, estado de la 02 |
| T2 | `src/lib/theme.ts` | RF-1 | — |
| T3 | `src/test/theme-tokens.ts` | RF-5, RF-12 | — |
| T4 | `src/test/theme-contrast.ts` | RF-5, RF-6, RF-12 | T3 |
| T5 | `src/test/type-scale.ts` | RF-9 | — |
| T6 | `src/test/source.ts` + barrido | RF-10, RF-12 | T1 |
| T7 | `@theme` completo en `globals.css` + auditoría | RF-5, 8, 9, 10, 11, 12 | T3–T6, §10.1 |
| T8 | `color-scheme`, invertido, base, foco, reduce | RF-4, 5, 7, 11, 12 | T7 |
| T9 | `src/lib/theme-script.ts` | RF-1, 3, 7 | T2 |
| T10 | `theme-dom.ts`: lectura y aplicación | RF-1, 2, 7 | T2 |
| T11 | `theme-dom.ts`: `setTheme` y View Transitions | RF-2, 4, 7 | T10 |
| T12 | Layout único monta tema, fuente y script | RF-3, 8 | T1, T9 |
| T13 | e2e de resolución, persistencia y primera pintura | RF-1, 2, 3, 5, 7 | T12 |
| T14 | e2e de invertido, reduce, sin JS y `pageshow` | RF-1, 3, 4, 5, 7, 11 | T13 |
| T15 | Gates finales y cierre documental | todos | T14 |

T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9 → T10 → T11 → T12 → T13 → T14 → T15. T2 y T5 no dependen de T1, pero van después por orden de revisión. T9–T11 pueden avanzar en paralelo a T7–T8 una vez cerrada T2, siempre que los gates sigan verdes.

---

## T1 — Prerrequisito estructural: un solo `<html>` y rutas estáticas

**Estado:** completada. Un solo `<html>` en `src/app/[locale]/layout.tsx` (root layout con `next/root-params` y `generateStaticParams` → `/en` y `/es` prerenderizados, sin `ƒ /[locale]`). `src/app/layout.tsx` y `src/app/page.tsx` retirados.

**Objetivo:** que exista un único punto de montaje del documento (`<html>`/`<body>`) con el locale conocido, y que `/en` y `/es` se prerendericen en vez de servirse como `ƒ /[locale]`.

**RF:** soporte estructural de RF-3 (resolución antes del primer pintado) y del NFR de renderizado estático. No introduce criterios nuevos.

**Depende de:** aprobaciones §10.2 y §10.4; estado real de la 02.

**Tests a escribir primero:**
- e2e en `e2e/i18n-routing.spec.ts`: el HTML servido de `/en` y `/es` contiene exactamente una aparición de `<html` y una de `<body`, y el `lang` coincide con el locale pedido. Hoy falla: hay dos `<html>` anidados.
- e2e de `/`: la portada sigue respondiendo con estado < 400 después de retirar `src/app/page.tsx` (el smoke de `e2e/home.spec.ts` ya lo cubre; se comprueba que sigue verde).
- Comprobación de build escrita antes del cambio: la tabla de rutas debe dejar de mostrar `ƒ /[locale]` y mostrar las dos rutas prerenderizadas.

**Criterio de hecho:**
- `pnpm build` no muestra `ƒ /[locale]`; `en` y `es` figuran como prerenderizadas.
- `/en` y `/es` responden con un solo `<html>` y un solo `<body>`, con `lang` correcto.
- `src/app/page.tsx` ya no existe (o no queda como página fuera del root layout); `bg-zinc-50`, `dark:bg-black` y `font-sans` han desaparecido del árbol.
- Los estilos y las dos fuentes siguen cargando: `globals.css` se importa desde el layout consolidado y los `variable` de las fuentes siguen en `<html>` (la retirada de `Geist` sans es de T12).
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` y `pnpm test:e2e` en verde.

**Paradas:** si la consolidación obliga a escribir el esqueleto de i18n de la 02, se para: la 03 no absorbe ese trabajo. Si `next/root-params` exige una configuración no documentada, se contrasta con `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/next-root-params.md` antes de tocar el layout.

---

## T2 — Modelo de tema

**Estado:** completada. `src/lib/theme.ts` con `Theme`, `StoredTheme`, `THEME_STORAGE_KEY = "psg-theme"`, `isTheme` y `resolveTheme`, sin DOM ni React.

**Objetivo:** tener un módulo puro con el tipo de tema, la clave de almacenamiento y la resolución elección/sistema, sin DOM.

**RF:** RF-1.

**Depende de:** —

**Tests a escribir primero** (`src/lib/theme.test.ts`, tabla de casos incluidos los límites):
- `isTheme` acepta solo `"light"` y `"dark"`; rechaza `"Light"`, `""`, `"auto"`, `null`, `undefined`, `0`, `true`, `{}` y arrays.
- `resolveTheme` con las cuatro combinaciones de elección guardada y preferencia del sistema; con `null` y sistema claro devuelve `"light"`; con `null` y sistema oscuro devuelve `"dark"`.
- La clave exportada vale exactamente `psg-theme` y no se repite como literal en otro módulo.

**Criterio de hecho:**
- `src/lib/theme.ts` no importa nada del DOM ni de React y no supera ~100 líneas.
- `pnpm exec vitest run src/lib/theme.test.ts` en verde y cobertura 100 % del módulo.
- Gates en verde.

---

## T3 — Lector de tokens

**Estado:** completada. `src/test/theme-tokens.ts` con `parseTokenSheet`, `REQUIRED_TOKENS` (33 nombres) y clasificación de colores `pair`/`alias`/`solid`; `src/test/theme-tokens.test.ts` con 11 casos, fixtures CSS inline, sin leer todavía `globals.css`.

**RF:** RF-5, RF-12.

**Depende de:** — (orden de revisión: después de T2).

**Tests a escribir primero** (`src/test/theme-tokens.test.ts`, fixtures CSS inline):
- Un `:root` señuelo y un `@media` señuelo con los mismos nombres no entran en el resultado; solo cuentan los bloques `@theme`.
- Se equilibran llaves anidadas dentro de `@theme` y se ignoran comentarios.
- `light-dark(#f2efe6, #121110)` → `pair`; `var(--color-ink)` → `alias` con token `ink`; `#7c776c` → `solid`.
- La misma regex genérica captura los sub-tokens `--text-display--line-height`, `--text-display--letter-spacing` y `--text-display--font-weight`.
- Las declaraciones de reinicio de namespace (`--color-*: initial`, valor `initial`) no se registran como token.
- Falla con el **nombre** del token si falta uno de `REQUIRED_TOKENS`, si hay un duplicado dentro de `@theme` o si un color tiene una forma desconocida.
- El resultado no incluye el prefijo `--` en las claves de `raw` y recorta espacios del valor.

**Criterio de hecho:**
- `pnpm exec vitest run src/test/theme-tokens.test.ts` en verde sin leer todavía `globals.css`.
- `REQUIRED_TOKENS` es una única exportación explícita de 33 nombres (5 colores, 5 tamaños, 15 sub-tokens de rol, 8 de tipografía/espaciado/línea/movimiento), no una derivación de lo que haya en el CSS.
- Gates en verde; `src/test/**` sigue fuera de cobertura.

---

## T4 — Contraste y parejas alcanzables

**Estado:** completada. `src/test/theme-contrast.ts` con `parseColor`, `relativeLuminance`, `contrastRatio`, `requiredContrast`, `resolveColor`, `tokenValue` y `reachablePairs`; `src/test/theme-contrast.test.ts` con 27 casos, fixtures CSS inline, sin leer todavía `globals.css`.

**RF:** RF-5, RF-6, RF-12.

**Depende de:** T3 (consume `TokenSheet`).

**Tests a escribir primero** (`src/test/theme-contrast.test.ts`):
- `contrastRatio` da 21:1 entre negro y blanco, 1:1 entre iguales, y es simétrico.
- `parseColor` entiende hex de 6 y de 3 dígitos y devuelve `null` con un valor inválido.
- `requiredContrast` en los límites: 24 px → 3; 23,99 px → 4,5; 18,66 px con 700 → 3; 18,65 px con 700 → 4,5; 18,66 px con 400 → 4,5.
- `resolveColor` sigue un alias y aplica el modo contrario en contexto `inverted`; un alias cíclico o un token desconocido falla como error de test.
- `reachablePairs` devuelve 8 parejas por modo (base e invertido) con su umbral, usando un `TokenSheet` construido con `parseTokenSheet` sobre un CSS inline.
- `tokenValue` devuelve el valor crudo y falla si el token no existe.

**Criterio de hecho:**
- `pnpm exec vitest run src/test/theme-contrast.test.ts` en verde sin DOM y sin leer todavía `globals.css`.
- Ningún valor hexadecimal del test se usa como expectativa del producto: los fixtures son sintéticos y los reales llegan en T7.
- Gates en verde.

---

## T5 — Escala fluida

**Estado:** completada. `src/test/type-scale.ts` con `parseClamp` y `sizeAt`; `src/test/type-scale.test.ts` con 11 casos, fixtures CSS inline, sin leer todavía `globals.css`.

**RF:** RF-9.

**Depende de:** —

**Tests a escribir primero** (`src/test/type-scale.test.ts`):
- `parseClamp` entiende `rem` y `px` en los extremos y uno o dos términos en el preferido (`px + vw`).
- `sizeAt` devuelve el mínimo en 360 y el máximo en 1440 con tolerancia de 0,05 px, para los cinco roles con los valores del plan.
- La curva no decrece entre 360 y 1440.
- Jerarquía estricta `display > title-lg > title > body > meta` en 320, 360, 768 y 1440.
- Cuerpo ≥ 16 px y cualquier rol ≥ 12 px en todos los anchos probados.
- Caso sintético de 18,66 px con énfasis para fijar la frontera de «texto grande».
- Un `clamp` mal formado falla como error de test.

**Criterio de hecho:**
- `pnpm exec vitest run src/test/type-scale.test.ts` en verde con fixtures inline.
- La jerarquía y los mínimos sobre los valores reales de `globals.css` se activan en T7; en T5 no hay copia de la tabla de tokens en el test.
- Gates en verde.

---

## T6 — Barrido de fuente

**Estado:** completada. `src/test/source.ts` con `scanSource` y `src/test/theme-source.test.ts` con 29 casos (sintéticos + barrido del árbol real verde tras T1).

**RF:** RF-10, RF-12.

**Depende de:** T1 (mientras el placeholder conserve `dark:bg-black` y `font-sans`, el barrido real no puede estar verde).

**Tests a escribir primero** (`src/test/theme-source.test.ts` + helper `src/test/source.ts`):
- El helper se prueba con cadenas sintéticas: una fuente limpia pasa; cada violación falla con su mensaje y su ruta.
- Violaciones que deben fallar: `#fff` fuera de `globals.css`; `dark:bg-black`; `font-sans` y `font-serif`; `p-[10px]`, `m-[3px]`, `gap-[7px]`, `inset-[5px]`, `translate-[6px]`; `padding: 10px` y `margin-top: 6px` en CSS; `p-0.5`, `m-1.5`, `gap-2.5`, `space-x-0.5`, `inset-1.5`, `size-3.5`, `w-0.5`, `h-2.5` y sus variantes de eje (`px-0.5`, `my-1.5`, …).
- Excepciones que deben pasar: hex dentro de `src/**/*.test.*` y `src/test/**`; `0`, `var(--spacing)`, `calc(...)` sobre `--spacing` y múltiplos de 4 px/0,25 rem.
- El barrido se ejecuta además sobre el árbol real y debe quedar en verde.

**Criterio de hecho:**
- `pnpm exec vitest run src/test/theme-source.test.ts` en verde sobre el árbol real.
- Cada clase de violación tiene al menos un caso sintético que la demuestra roja; el barrido no es vacuo.
- No hay exclusiones nuevas: las únicas son las del plan (tests y `src/test/`).
- Gates en verde.

---

## T7 — Tokens en `globals.css`

**Objetivo:** declarar una sola vez todo el sistema en `@theme static` + `@theme static inline`, con los namespaces propios vaciados, y activar la auditoría contra el archivo real.

**RF:** RF-5, RF-8, RF-9, RF-10, RF-11, RF-12.

**Depende de:** T3, T4, T5, T6; aprobación §10.1 (fuente y red en build).

**Tests a escribir primero** (`src/test/theme-audit.test.ts` + `src/test/raw.d.ts` + `readTokenSheet` en `src/test/theme.ts`, leyendo `@/styles/globals.css?raw`):
- `parseTokenSheet` no lanza sobre el archivo real: los 33 tokens obligatorios existen.
- La paleta tiene exactamente `surface`, `ink`, `ink-muted`, `line` y `focus`, sin color de acento.
- El crudo de `surface` cae en `#EFECE2`–`#F5F2EA` y el negro de `ink` en `#0E0E0C`–`#141312`; todos los neutros cumplen R ≥ G ≥ B.
- `line` es sólido y único; `ink-muted` tiene valor propio por modo; `focus` es alias de `ink`.
- Cada uno de los cinco roles tiene sus tres sub-tokens y coinciden con el inventario del plan §2.5.
- Cada `--text-<rol>--font-weight` es 400 o 700 y concuerda con `--font-weight-regular`/`--font-weight-emphasis`.
- Duraciones: estado entre 150 y 250 ms; tema ≤ 400 ms; revelado ≤ 600 ms; ninguna temporal > 600 ms; `--spacing: 0.25rem`; `--line-width: 1px`; `--motion-distance` declarado; una sola familia.
- Las 16 parejas (8 por modo, base e invertido) superan su umbral con los valores reales (usa `reachablePairs` + `contrastRatio`).
- Los cinco roles superan la jerarquía y los mínimos en 320, 360, 768 y 1440 px con los `clamp` reales.

**Criterio de hecho:**
- `pnpm exec vitest run src/test` en verde, incluidos `theme-audit`, `theme-tokens`, `theme-contrast` y `type-scale` contra el archivo real.
- Tras `pnpm build`, el CSS emitido contiene `--color-surface`, `--text-display--line-height` y `--duration-theme`, aunque ninguna utilidad los use (`@theme static`).
- `--font-mono` se emite como `var(--font-geist-mono), …` y `--color-focus` como `var(--color-ink)` (`static inline`).
- `globals.css` sigue siendo el único sitio con valores de color, tamaño, espacio y duración.
- Gates en verde.

**Paradas:** si el build no puede descargar la fuente, se para: la alternativa (paquete `geist` o fuente local) requiere aprobación, no se instala por iniciativa propia.

---

## T8 — Modos, bloque invertido y reglas base

**Objetivo:** que el tema se resuelva por `color-scheme`, que `.inverted` invierta de verdad y que la base, el foco, la selección y el movimiento reducido queden declarados.

**RF:** RF-4, RF-5, RF-7, RF-11, RF-12.

**Depende de:** T7.

**Tests a escribir primero** (se amplía `src/test/theme-audit.test.ts`, también con `?raw`):
- Existen las tres reglas de `color-scheme`: `:root` (`light dark`), `:root[data-theme="light"]` (`light`) y `:root[data-theme="dark"]` (`dark`).
- `.inverted` reaplica `surface` e `ink` en el propio elemento y cambia `color-scheme`; hay override para `data-theme="dark"` y para «sin atributo + sistema oscuro»; el caso base cubre sistema claro y navegador sin `prefers-color-scheme`.
- La línea no cambia dentro del bloque invertido.
- `html` aplica `surface`, `ink`, `font-family: var(--font-mono)`, `font-weight: var(--font-weight-regular)` y `tabular-nums`; `body` aplica `surface` e `ink` y `min-height`.
- `*, ::before, ::after` toman `border-color: var(--color-line)`.
- `::selection` usa el par `ink`/`surface`; `:focus-visible` usa `--color-focus` con `calc(var(--line-width) * 2)` y `calc(var(--spacing) / 2)`.
- No hay `transition` en `html` ni en `body`.
- Los pseudo-elementos `::view-transition-*` usan `var(--duration-theme)`.
- El bloque de `prefers-reduced-motion: reduce` está sin `@layer`, pone a `0ms` las tres duraciones y declara `animation: none` sobre `::view-transition-*`.

**Criterio de hecho:**
- `pnpm exec vitest run src/test/theme-audit.test.ts` en verde con los dos bloques (tokens y reglas).
- El CSS emitido contiene `.inverted`, `::selection`, `:focus-visible` y el bloque de `prefers-reduced-motion`.
- Ningún token se declara dos veces: `parseTokenSheet` sigue sin lanzar por duplicados (las reglas viven fuera de `@theme`).
- Gates en verde.

**Nota:** el comportamiento computado del bloque invertido y de la duración efectiva se comprueba en T14; aquí solo se audita la declaración.

---

## T9 — Script de primer pintado

**Objetivo:** una función pura que genere el script inline mínimo que fija `data-theme` desde el almacenamiento y registra `pageshow`.

**RF:** RF-1, RF-3, RF-7.

**Depende de:** T2.

**Tests a escribir primero** (`src/lib/theme-script.test.ts` + helper `runThemeScript` en `src/test/theme.ts`; el script se ejecuta con `new Function` sobre un `window`, `document` y `localStorage` falsos):
- Con elección válida escribe `data-theme` exactamente una vez y durante el parseo.
- Sin elección no escribe nada; con valor inválido (`"auto"`, `""`, `"Dark"`) tampoco, y no deja el atributo.
- Con un `getItem` que lanza no propaga el error y el listener de `pageshow` **queda registrado**.
- Con la primera lectura lanzando y la segunda devolviendo `"dark"`, `pageshow` con `persisted: true` aplica `dark`.
- `pageshow` con `persisted: true` relee y aplica el valor vigente o retira el atributo si ya no hay elección.
- `pageshow` con `persisted: false` no toca el DOM.
- La clave se inyecta con `JSON.stringify`: una clave con comillas no rompe el script y el texto no contiene `</script>`.

**Criterio de hecho:**
- `pnpm exec vitest run src/lib/theme-script.test.ts` en verde; el módulo es puro y no toca `window` al importarse.
- Las dos lecturas de `localStorage` viven en `try` independientes (test de primera lectura fallida y segunda correcta).
- Cobertura 100 % del módulo.
- `pnpm test:e2e` sigue en verde.

---

## T10 — Lectura y aplicación en el DOM

**Objetivo:** leer la elección guardada sin lanzar, conocer el tema efectivo y escribir el atributo una sola vez.

**RF:** RF-1, RF-2, RF-7.

**Depende de:** T2.

**Tests a escribir primero** (`src/lib/theme-dom.test.ts`, jsdom):
- `applyTheme` escribe solo `data-theme` y no añade clases ni otros atributos (se comparan las listas de atributos antes y después).
- `readStoredTheme` devuelve `"light"`/`"dark"` con valores válidos, `null` sin valor, `null` con valor inválido y `null` si el almacenamiento lanza o es `null`.
- `readStoredTheme` sin argumento usa `localStorage` y no propaga sus errores.
- `currentTheme` prefiere el atributo válido; con atributo ausente o inválido cae a la preferencia del sistema.

**Criterio de hecho:**
- `pnpm exec vitest run src/lib/theme-dom.test.ts` en verde.
- Cobertura 100 % de las ramas nuevas; ninguna exclusión añadida.
- Gates en verde.

---

## T11 — Cambio de tema y View Transitions

**Objetivo:** persistir y aplicar el cambio con una sola escritura, usando View Transitions solo si hay soporte y no hay movimiento reducido.

**RF:** RF-2, RF-4, RF-7.

**Depende de:** T10.

**Tests a escribir primero** (se amplía `src/lib/theme-dom.test.ts`, con dependencias inyectadas):
- `setTheme("dark")` persiste y escribe el atributo una sola vez.
- Con almacenamiento que lanza no hay error y el tema se aplica igual.
- Con `reducedMotion: () => true`, `startViewTransition` no se llama y el atributo queda escrito.
- Sin `startViewTransition` disponible, aplica directo.
- Con la API disponible y sin `reduce`, se llama una vez y el callback escribe una vez.
- Si el callback se invoca dos veces, la escritura sigue siendo una (`applyOnce`).
- Si la API lanza, el tema se aplica igual y no se propaga el error.
- Tras `setTheme`, `readStoredTheme` devuelve el valor nuevo.
- La llamada pública `setTheme(theme)` sin dependencias funciona con `document` y `localStorage` reales de jsdom.

**Criterio de hecho:**
- `pnpm exec vitest run src/lib/theme-dom.test.ts` en verde.
- El control de la 04 puede llamar a `setTheme(next)` sin dependencias: queda documentado en el JSDoc del módulo.
- No se crea `theme-transition.ts` ni ningún componente de tema.
- Cobertura 100 % del módulo; gates en verde.

---

## T12 — Layout único monta el tema, la fuente y el script

**Objetivo:** un solo root layout que emite `lang`, la clase de la fuente mono variable y el script de tema como primer hijo del `<head>`, con `suppressHydrationWarning`.

**RF:** RF-3, RF-8.

**Depende de:** T1 (root layout consolidado) y T9 (script).

**Tests a escribir primero** (`e2e/theme.spec.ts`, contra el build de producción):
- El HTML de `/en` y `/es` trae `<script>` como primer hijo del `<head>` y **no** trae `data-theme` en el servidor.
- `<html>` lleva la clase que expone `--font-geist-mono` y `lang` correcto; no se pide ninguna fuente a Google (ninguna petición a `fonts.googleapis.com` ni `fonts.gstatic.com`).
- Sin `prefers-reduced-motion` ni elección sembrada, cargar `/en` no produce `pageerror` ni error de consola con «hydrat» (hidratación limpia con `suppressHydrationWarning`).
- `pnpm build` sigue prerenderizando `/en` y `/es`.

**Criterio de hecho:**
- `pnpm test:e2e` en verde con el nuevo spec.
- `Geist` sans ha desaparecido de los layouts; solo queda `Geist_Mono`, sin array de `weight`.
- El script se inserta con `dangerouslySetInnerHTML` desde `themeScript(THEME_STORAGE_KEY)`; no hay componente cliente ni `useEffect` para el primer pintado.
- Gates en verde.

**Nota:** la reaplicación tras el remontaje de Strict Mode en desarrollo **no** se resuelve aquí (plan §10.5, recomendación de no añadir `ThemeRestore`).

---

## T13 — e2e de resolución, persistencia y primera pintura

**Objetivo:** demostrar en Chromium que la elección guardada se aplica antes del primer pintado, persiste y no produce fotogramas con el tema contrario.

**RF:** RF-1, RF-2, RF-3, RF-5, RF-7.

**Depende de:** T12.

**Tests a escribir primero** (`e2e/theme.spec.ts`):
- Elección sembrada (`addInitScript` con `psg-theme`) en claro y en oscuro, en `/en` y en `/es`, con el sistema en el modo contrario: `data-theme` tiene el valor sembrado y el `background-color` computado coincide con `--color-surface` del modo (comparado con un elemento sonda que aplica `var(--color-surface)`, sin hex en el test).
- Persistencia: tras `reload` el tema sigue aplicado y `localStorage` conserva el valor.
- Sin fotograma contrario: `addInitScript` instala un `MutationObserver` sobre `document` (`subtree`, `attributes`, `attributeFilter: ["data-theme"]`, `attributeOldValue`) antes del script inline. Con sistema claro y elección oscura se registra **exactamente una** mutación, con `readyState === "loading"`, `oldValue === null` y `newValue === "dark"`; ninguna después de `load` ni tras dos `requestAnimationFrame`.
- Sistema sin preferencia (`colorScheme: "no-preference"`): se pinta en claro y sin `data-theme`.

**Criterio de hecho:**
- `pnpm test:e2e` en verde con los dos idiomas y los dos modos.
- Ningún test lee clases de Tailwind ni compara estructura DOM; todo pasa por atributos y estilos computados.
- El límite conocido queda documentado: el clic real sobre el control es de la 04 (enmienda §10.3 pendiente de aprobación).
- Gates en verde.

---

## T14 — e2e de bloque invertido, movimiento reducido, sin JavaScript y `pageshow`

**Objetivo:** cerrar los estados que dependen del contexto (invertido), de la preferencia de movimiento, de la ausencia de JavaScript y de la restauración desde caché.

**RF:** RF-1, RF-3, RF-4, RF-5, RF-7, RF-11.

**Depende de:** T13.

**Tests a escribir primero** (`e2e/theme.spec.ts`):
- Bloque invertido inyectado (`innerHTML` con `<div class="inverted">` y un hijo de texto) en los cuatro estados: `data-theme` claro, `data-theme` oscuro, sin atributo con sistema claro y sin atributo con sistema oscuro. El par fondo/texto del bloque es el contrario del de la página, y el hijo hereda el par invertido; la línea conserva su tono.
- Movimiento reducido (`reducedMotion: "reduce"`): `getComputedStyle(document.documentElement).getPropertyValue("--duration-state")` y `--duration-theme`, con `trim()`, devuelven `0ms`.
- Sin JavaScript (`javaScriptEnabled: false`) con `colorScheme: "dark"`: no hay `data-theme`, el fondo computado es el oscuro y el `h1` localizado sigue visible (el contenido no depende de JS).
- `pageshow` persistido: se cambia `localStorage` y se despacha `pageshow` con `persisted: true`; el atributo se actualiza o se retira. Proxy aceptado de bfcache.

**Criterio de hecho:**
- `pnpm test:e2e` en verde con los cuatro bloques nuevos.
- La auditoría CSS de `animation: none` bajo `reduce` sigue en `theme-audit.test.ts` (sin transición activa no hay estilo computado que leer).
- Gates en verde.

---

## T15 — Gates finales y cierre documental

**Objetivo:** cerrar la 03 con los gates, la cobertura, el roadmap y el estado de la spec alineados.

**RF:** todos (RF-1 a RF-12) y la definición de terminado de la constitución.

**Depende de:** T14.

**Comprobaciones antes de tocar documentación:**
- `pnpm lint` sin warnings, `pnpm typecheck` en verde, `pnpm test` con ≥ 95 % en las cuatro métricas y `pnpm build` en verde.
- `pnpm test:e2e` completo en verde en Chromium.
- `git status` limpio y ningún cambio de umbral ni exclusión nueva.
- `pnpm build` sirve `/en` y `/es` prerenderizadas.

**Criterio de hecho:**
- `docs/roadmap.md` marca la 03 y `docs/specs/03-theme-and-tokens/spec.md` pasa a completada (solo tras aprobar la enmienda §10.3; si no está aprobada, se deja constancia del criterio pendiente y no se edita la spec).
- `tasks.md` refleja el estado real de cada tarea y la matriz de abajo no tiene filas sin evidencia.
- La tabla de decisiones §10 del plan queda resuelta: aprobadas, rechazadas o trasladadas con su motivo.
- `git status` limpio y PR abierto con los checks en verde.

---

## Trazabilidad RF → tareas

| RF | Tareas que lo cierran |
| --- | --- |
| RF-1 | T2, T9, T10, T13, T14 |
| RF-2 | T10, T11, T13 |
| RF-3 | T1, T9, T12, T13, T14 |
| RF-4 | T8, T11, T14 |
| RF-5 | T3, T4, T7, T8, T13, T14 |
| RF-6 | T4, T7 |
| RF-7 | T8, T9, T10, T11, T13, T14 |
| RF-8 | T7, T12 |
| RF-9 | T5, T7 |
| RF-10 | T6, T7 |
| RF-11 | T7, T8, T14 |
| RF-12 | T3, T6, T7, T8 |

## Fuera de estas tareas

- Control de tema, su texto y su anuncio (spec 04).
- Reaplicación tras el remontaje de desarrollo (plan §10.5).
- `ui/Reveal`, `animation-timeline: view()` y coreografía de scroll (spec 05).
- Secciones, hero y momentos firma (specs 06–10).
- Metadatos, `hreflang` y sitemap (spec 11).
- Medición final de rendimiento (CLS de la fuente), lista de navegadores mínimos y pasada global de accesibilidad (spec 12).
