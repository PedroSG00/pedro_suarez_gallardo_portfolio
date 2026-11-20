# Tareas — 06 Shell y Hero

**Estado:** Pendiente de ejecución. Se deriva de `docs/specs/06-shell-and-hero/spec.md` y de `docs/specs/06-shell-and-hero/plan.md`, y respeta `docs/constitution.md`.

**Alcance:** RF-1 a RF-14 de la spec 06 y sus requisitos no funcionales. Cada tarea se implementa y se verifica por separado; ninguna se cierra con tests en rojo.

**Regla de trabajo:** tests primero (constitución, regla 8), un commit por tarea con Conventional Commits, sin dependencias nuevas, sin carpetas nuevas en la raíz ni en `src/`, y sin mezclar refactors con funcionalidad. Las tareas de documentación se hacen en el mismo cambio que el código al que acompañan.

**Cierre de cada tarea:** además del test indicado, `pnpm lint` y `pnpm typecheck` deben estar en verde. Las tareas que tocan CSS, rutas o composición añaden `pnpm build`; las que tocan navegación, tema, idioma o movimiento añaden el e2e correspondiente. La T23 ejecuta la batería completa.

---

## Precisiones que fijan estas tareas

El plan contiene algunos detalles de implementación que conviene fijar antes de codificar para que cada tarea sea verificable por separado. Las tareas los resuelven así:

1. **Etiquetas del cambio de idioma:** se reutilizan las claves existentes `shared.langSwitch.en` y `shared.langSwitch.es`, con las props `ariaLabelEn` y `ariaLabelEs` de `LanguageSwitch`. No se crean `shared.langSwitch.switchToEnglish` ni `switchToSpanish`.
2. **Identidad de la barra:** el nombre accesible sale de `SiteData.name` (`Pedro Suárez Gallardo`). No existe una etiqueta `labels.identity`.
3. **Resolución de ancla:** `AnchorResolution.reason` solo admite `valid`, `empty` y `unknown`. Un hash que no es un destino de sección es `unknown`; no hay un estado `not-section`.
4. **Visibilidad de la barra:** la entrada de `resolveNavbarVisibility` incluye la visibilidad actual. Si el scroll no cambia de dirección, se devuelve la visibilidad actual, no `visible`. Así el final de página y los eventos de scroll sin desplazamiento no revelan la barra por accidente.
5. **Tamaño del nombre:** `--hero-name-divisor` vale `4.8` y `--hero-name-advance` vale `0.6`. El divisor es la palabra más larga (8 caracteres: «Gallardo») multiplicada por el avance; si cambia una de las dos cosas, cambian las dos y lo detectan el test de `lib/hero-name` y el de tokens. No se usa el literal suelto en el componente.
6. **Ancho del nombre:** se verifica en `e2e/hero-name-width.spec.ts`, un archivo separado de los flujos críticos. No va dentro de `e2e/hero.spec.ts`.
7. **`SectionHeading`:** siempre es un `h2`. No lleva prop `level`.
8. **`Link`:** la pestaña nueva se resuelve con `target="_blank"` nativo, `rel="noreferrer noopener"` y `srLabel`. Se elimina el interceptado con `window.open` y se actualiza el contrato de la spec 04 en el mismo cambio. Los e2e de fixtures (`anchor-jump`, `no-js`, `reveal`) no usan `Link` y no cambian.
9. **Tokens:** los tokens de shell y hero viven en `:root`, junto a `--section-end-padding`. No se amplía el inventario de 33 tokens de `@theme` de la spec 03; la tabla de la 03 se amplía en la tarea de documentación.
10. **`Reveal` no se toca:** la implementación actual de `Reveal` es JavaScript y pertenece a la spec 05. El hero usa `Reveal`/`RevealGroup` para el contenido secundario, pero sus efectos de nombre (entrada, cursor, contorno, parallax) son CSS puro y no dependen de `Reveal`.

---

## Mapa de tareas

| ID | Tarea | RF | Depende de |
|---|---|---|---|
| T1 | Datos del sitio, destinos y textos bilingües | RF-1, RF-2, RF-7, RF-11, RF-14 | — |
| T2 | Tokens de shell y hero | RF-3, RF-4, RF-6, RF-8, RF-9, RF-10, RF-13 | — |
| T3 | Lógica de visibilidad de la barra | RF-3, RF-4, RF-12 | T2 |
| T4 | Lógica de tamaño y ancho del nombre | RF-8 | T2 |
| T5 | Resolución de hash a destino | RF-13 | T1 |
| T6 | Extensión de `Section` | RF-2, RF-13 | — |
| T7 | `SectionHeading` | RF-2, RF-13 | — |
| T8 | `SkipLink` | RF-5, RF-12 | — |
| T9 | `NavLinks` | RF-1, RF-4 | T1 |
| T10 | `ThemeControl` | RF-6 | T2 |
| T11 | `AnchorFocus` | RF-13 | T5, T7 |
| T12 | Extensión de `Link` | RF-11 | — |
| T13 | Extensión de `Logo` | RF-1 | — |
| T14 | `Navbar`: estructura, menú y controles | RF-1, RF-4, RF-6, RF-12, RF-14 | T1, T2, T9, T10, T13 |
| T15 | `Navbar`: visibilidad por scroll y foco | RF-3, RF-4, RF-12 | T3, T14 |
| T16 | `Footer` | RF-11, RF-14 | T1, T2, T12 |
| T17 | `Hero`: contenido y revelado | RF-7, RF-9 | T1, T12 |
| T18 | Shell de layout y 404 | RF-5, RF-12, RF-13, RF-14 | T8, T11, T14, T16 |
| T19 | Home: hero y cuatro destinos reservados | RF-2, RF-7, RF-13, RF-14 | T6, T7, T17, T18 |
| T20 | Nombre a todo el ancho | RF-8 | T2, T17, T19 |
| T21 | Entrada, cursor, contorno y parallax | RF-7, RF-9, RF-10 | T17, T19, T20 |
| T22 | E2E de navegación y actualización de e2e existentes | RF-1–RF-6, RF-12–RF-14 | T14, T15, T16, T18, T19, T20, T21 |
| T23 | Enmiendas documentales y gates finales | Todos | T1–T22 |

---

## T1 — Datos del sitio, destinos y textos bilingües ✅ COMPLETADA

**Objetivo:** crear la fuente única de datos no traducibles y todos los textos nuevos, en inglés y castellano, antes de que los consumidores existan.

**RF:** RF-1, RF-2, RF-7, RF-11, RF-14 (y el requisito de i18n completo).

**Depende de:** nada.

**Archivos:** `src/content/site.ts`, `src/content/sections.ts`, `messages/en.json`, `messages/es.json`.

**Qué debe quedar:**

- `SiteData` con `name`, `email`, `githubUrl`, `linkedinUrl` y `cvPath` por idioma. El nombre es `Pedro Suárez Gallardo`; el email, GitHub, LinkedIn y las rutas de CV salen del brief. No se inventan datos.
- Cuatro definiciones de destino (`SectionDefinition`: id e índice) en orden fijo: `about` (`01`), `work` (`02`), `stack` (`03`), `contact` (`04`). El orden es el del array; no se duplica en un campo aparte. El identificador es estable y no cambia con el idioma. `sections.ts` no contiene texto traducido: una función pura `buildSectionDestinations(navLabels)` combina las definiciones con `shared.nav.*` y devuelve `SectionDestination[]` con `label`; la usan el layout (barra) y la página (encabezados) para no repetir el mapeo.
- Claves nuevas en ambos idiomas: `shared.nav.label`, `shared.menu.open`, `shared.menu.close`, `shared.theme.toggle`, `shared.skipToContent`, `shared.newTab`, `hero.name`, `hero.role`, `hero.pitch`, `hero.support`, `hero.meta`, `hero.ctaPrimary`, `hero.ctaSecondary`, `footer.copyright`.
- Se reutilizan `shared.nav.about`, `shared.nav.experience`, `shared.nav.stack`, `shared.nav.contact` y `shared.langSwitch.en`/`es`. Los valores actuales de `shared.nav.experience` («Experience»/«Experiencia») se corrigen a «Work»/«Trabajo» en este mismo cambio, como pide el brief; la clave no cambia. No se duplican las etiquetas de GitHub, LinkedIn, email y CV: se reutilizan las de `contact.*`.
- `hero.title` y `hero.subtitle` siguen existiendo hasta que la T19 actualice `page.tsx`; se eliminan en esa tarea, no aquí, para no romper el build entre tareas.

**Tests primero:**

- `src/lib/i18n-parity.test.ts`: debe seguir en verde; las claves nuevas van en los dos archivos en el mismo cambio.
- `src/content/sections.test.ts` (nuevo, junto a los datos): comprueba que hay exactamente cuatro definiciones, que los ids son `about`, `work`, `stack`, `contact`, que los índices son `01`–`04` y que el orden del array es el de la spec; comprueba también que `buildSectionDestinations` aplica las etiquetas recibidas en ese mismo orden y no muta las definiciones. Es un test de contrato de datos, no de presentación.
- El tipo inferido de los JSON hace que una clave que falte y se consuma en T14–T19 rompa `pnpm typecheck`; esa es la segunda red.

**Criterio de hecho:** `pnpm exec vitest run src/lib/i18n-parity.test.ts src/content/sections.test.ts` en verde; `pnpm typecheck` en verde; no hay claves nuevas en un solo idioma; no hay datos inventados.

---

## T2 — Tokens de shell y hero ✅ COMPLETADA

**Objetivo:** declarar los valores de layout, nombre, cursor, movimiento y área táctil en `globals.css`, una sola vez y con nombres de rol.

**RF:** RF-3, RF-4, RF-6, RF-8, RF-9, RF-10, RF-13.

**Depende de:** nada.

**Archivos:** `src/styles/globals.css`, `src/test/shell-tokens.test.ts` (nuevo).

**Qué debe quedar:**

- En el bloque `:root` de `@layer base`, junto a `--section-end-padding`, los tokens: `--nav-height`, `--nav-hide-threshold`, `--nav-z`, `--grid-gutter`, `--grid-max-width`, `--text-hero-name`, `--hero-name-fill`, `--hero-name-advance`, `--hero-name-divisor`, `--cursor-width`, `--cursor-duration`, `--hero-line-duration`, `--hero-line-stagger`, `--hero-parallax-distance`, `--touch-target`.
- `--grid-gutter`: 24 px por defecto y 48 px desde 768 px, mediante media query. `--grid-max-width`: 1600 px. `--text-hero-name` usa `clamp()` con `--grid-gutter`, `--hero-name-fill` y `--hero-name-divisor`.
- `--nav-hide-threshold` equivale a 80 px; `--touch-target`, como mínimo 24 px; `--cursor-duration`, 1 s; `--hero-line-duration` 400 ms y `--hero-line-stagger` 100 ms (total 600 ms); `--hero-parallax-distance`, 20 dvh; `--hero-name-fill`, `0.9` sin unidad (equivale al 90 % y se puede multiplicar dentro de `calc()`).
- No se tocan los 33 tokens de `@theme` ni el test `theme-audit`; estos tokens son de layout/hero y viven en `:root`.
- Sin valores mágicos repetidos en componentes: los componentes consumen estos tokens.

**Tests primero:**

- `src/test/shell-tokens.test.ts`: lee el CSS real y comprueba que existen todos los tokens, que `--nav-hide-threshold` son 80 px, que `--touch-target` no baja de 24 px, que el ciclo del cursor es 1 s, que la entrada suma 600 ms como máximo, que el parallax es 20 dvh, que `--hero-name-fill` es `0.9` (90 %), que el tope de retícula es 1600 px y que `--grid-gutter` cambia a 48 px desde 768 px.
- `src/test/theme-audit.test.ts` debe seguir en verde sin cambios.

**Criterio de hecho:** `pnpm exec vitest run src/test/shell-tokens.test.ts src/test/theme-audit.test.ts` en verde; `pnpm typecheck` en verde; ningún componente nuevo introduce valores fuera de tokens.

---

## T3 — Lógica de visibilidad de la barra ✅ COMPLETADA

**Objetivo:** decidir de forma pura cuándo la barra está visible u oculta, con todos los límites y excepciones de RF-3.

**RF:** RF-3, RF-4, RF-12.

**Depende de:** T2 (umbral y contrato de 80 px).

**Archivos:** `src/lib/nav-visibility.ts`, `src/lib/nav-visibility.test.ts`.

**Qué debe quedar:**

- `NavbarVisibilityInput` con `scrollY`, `previousScrollY`, `currentVisibility`, `menuOpen`, `focusWithin`, `reducedMotion` y `supportsScrollTimeline`.
- `resolveNavbarVisibility` devuelve `visible` o `hidden` con este orden: menú abierto → visible; foco dentro → visible; movimiento reducido → visible; sin soporte de `animation-timeline` → visible; `scrollY` ≤ 80 → visible; scroll hacia arriba → visible; scroll hacia abajo → hidden; sin cambio de dirección → `currentVisibility`.
- Los valores negativos o no finitos se normalizan a 0; los deltas menores de 2 px se consideran «sin cambio» para evitar parpadeos por rebote.
- La primera lectura tras la carga no oculta la barra: el estado inicial es visible y solo el primer evento de scroll decide.
- Al final de la página no hay regla especial: si se llegó bajando, sigue oculta; subir o enfocar la revela.
- El umbral de 80 px es el mismo que `--nav-hide-threshold`; si cambia uno, cambian los dos y los tests de T2 y T3 lo detectan.

**Tests primero:**

- `src/lib/nav-visibility.test.ts`, con tabla de casos: 0, 80 y 81 px desde 0; bajando; subiendo; sin cambio con visibilidad previa `hidden` (debe seguir `hidden`) y con visibilidad previa `visible` (debe seguir `visible`); menú abierto; foco dentro; reduced motion; sin soporte de timeline; negativos, `NaN` y deltas menores de 2 px.

**Criterio de hecho:** `pnpm exec vitest run src/lib/nav-visibility.test.ts` en verde; todas las ramas cubiertas; la función no toca el DOM y no lanza.

---

## T4 — Lógica de tamaño y ancho del nombre ✅ COMPLETADA

**Objetivo:** calcular el tamaño y el ancho del nombre para cumplir el 90 % en 360, 768 y 1440 px, el tope de retícula y la ausencia de scroll horizontal.

**RF:** RF-8.

**Depende de:** T2 (valores de partida).

**Archivos:** `src/lib/hero-name.ts`, `src/lib/hero-name.test.ts`.

**Qué debe quedar:**

- `HeroNameMetrics` con `viewportWidth`, `contentWidth`, `longestWordChars`, `advanceRatio`, `minFontSize`, `maxFontSize`, `fillRatio`, `fontSize`, `blockWidth` y `ratio`.
- Constantes documentadas: palabra más larga 8 caracteres («Gallardo»), avance 0,6, relleno 0,9, mínimo 48 px, máximo 300 px, tope de retícula 1600 px.
- Fórmula: `contentWidth = min(viewportWidth - 2 * gutter, 1600)`, `preferred = 0.9 * contentWidth / (longestWordChars * advanceRatio)`, `fontSize = clamp(min, preferred, max)`, `blockWidth = longestWordChars * advanceRatio * fontSize`, `ratio = blockWidth / contentWidth`.
- Si `contentWidth <= 0` o `longestWordChars <= 0`, devuelve el mínimo y ratio 0; nunca lanza.
- El cursor se pinta en el espacio reservado del bloque y no suma al ancho de la línea más larga.

**Tests primero:**

- `src/lib/hero-name.test.ts`, con tabla 320/360/768/1440/1920/2560; ratio ≥ 0,9 en 360/768/1440; 320 sin scroll horizontal; tope de retícula en 1920 y 2560; `contentWidth` 0; palabra de un carácter; mínimo y máximo; avance distinto para comprobar que la fórmula no está cableada. El test lee `globals.css` y comprueba que `--hero-name-advance` y `--hero-name-divisor` coinciden con las constantes del módulo (0,6 y 4,8); si cambia uno, el test obliga a cambiar el otro.

**Criterio de hecho:** `pnpm exec vitest run src/lib/hero-name.test.ts` en verde; los valores de la tabla coinciden con el plan; el test de tokens y el de e2e de ancho pueden detectar una deriva del avance.

---

## T5 — Resolución de hash a destino ✅ COMPLETADA

**Objetivo:** validar un hash contra los cuatro destinos existentes sin navegar ni romper la página.

**RF:** RF-13.

**Depende de:** T1 (ids de sección).

**Archivos:** `src/lib/anchor-target.ts`, `src/lib/anchor-target.test.ts`.

**Qué debe quedar:**

- `AnchorResolution` con `targetId: SectionId | null` y `reason: "valid" | "empty" | "unknown"`.
- `resolveAnchorTarget(hash, sectionIds)` quita el `#`, ignora vacío, compara contra los ids y devuelve `unknown` para cualquier otro valor, incluidas mayúsculas, query o caracteres inválidos.
- No lanza y no navega.

**Tests primero:**

- `src/lib/anchor-target.test.ts`: hash vacío, `#`, `#about`, `#unknown`, `#about?x`, `#About` (mayúsculas), `#about/extra`, ids repetidos y lista vacía.

**Criterio de hecho:** `pnpm exec vitest run src/lib/anchor-target.test.ts` en verde; solo existen los tres motivos; ningún caso lanza.

---

## T6 — Extensión de `Section` ✅ COMPLETADA

**Objetivo:** permitir que los destinos tengan id estable y nombre accesible sin romper el contrato de la spec 04.

**RF:** RF-2, RF-13.

**Depende de:** nada.

**Archivos:** `src/components/ui/Section/Section.tsx`, `src/components/ui/Section/Section.test.tsx`.

**Qué debe quedar:**

- Props opcionales `id` y `labelledBy`.
- La `<section>` recibe `id` y `aria-labelledby`; la retícula y el resto del contrato no cambian.
- Sin `children`, sigue devolviendo `null`.

**Tests primero:**

- Ampliar `Section.test.tsx`: `id` presente; `aria-labelledby` presente; la retícula sigue con `grid` por defecto y se oculta con `grid={false}`; sin `children` sigue siendo vacío. Los tests existentes no se reescriben.

**Criterio de hecho:** `pnpm exec vitest run src/components/ui/Section/Section.test.tsx` en verde; ningún consumidor existente cambia.

---

## T7 — `SectionHeading` ✅ COMPLETADA

**Objetivo:** mostrar el número y la etiqueta de cada destino como un `h2` cuyo nombre accesible sea solo la etiqueta.

**RF:** RF-2, RF-13.

**Depende de:** nada.

**Archivos:** `src/components/ui/SectionHeading/SectionHeading.tsx`, `src/components/ui/SectionHeading/SectionHeading.test.tsx`.

**Qué debe quedar:**

- Props `id`, `index` y `label`. Siempre `h2`; no hay prop `level`.
- El número va en un `span` con `aria-hidden`; el nombre accesible es solo `label` («About», no «01 / About»).
- `tabIndex={-1}` y `data-section-heading` para que `AnchorFocus` pueda enfocarlo.
- Si falta `label` o `id`, devuelve `null`.

**Tests primero:**

- `SectionHeading.test.tsx`: rol `heading` nivel 2 con nombre «About»; el número no forma parte del nombre; `tabIndex=-1`; `data-section-heading`; sin label → `null`; sin id → `null`.

**Criterio de hecho:** `pnpm exec vitest run src/components/ui/SectionHeading/SectionHeading.test.tsx` en verde; no hay `h3` ni niveles alternativos.

---

## T8 — `SkipLink` ✅ COMPLETADA

**Objetivo:** ofrecer el salto al contenido como primer elemento enfocable, oculto visualmente hasta recibir foco.

**RF:** RF-5, RF-12.

**Depende de:** nada.

**Archivos:** `src/components/ui/SkipLink/SkipLink.tsx`, `src/components/ui/SkipLink/SkipLink.test.tsx`.

**Qué debe quedar:**

- Props `label` y `href` opcional con valor por defecto `#main`.
- Es un `<a>` normal, no un botón; no tiene `aria-hidden`; su texto es el del idioma activo.
- Visualmente oculto hasta `:focus-visible`; al recibir foco se muestra con contraste AA y foco visible.
- Si falta `label`, devuelve `null`.

**Tests primero:**

- `SkipLink.test.tsx`: enlace con nombre y `href="#main"`; `href` personalizado; sin label → `null`; el enlace no está `aria-hidden` ni `tabIndex=-1` (debe ser enfocable).
- La comprobación de «primer enfocable» y de visibilidad al foco se hace en `e2e/shell.spec.ts` (T18).

**Criterio de hecho:** `pnpm exec vitest run src/components/ui/SkipLink/SkipLink.test.tsx` en verde; el enlace es alcanzable por teclado.

---

## T9 — `NavLinks`

**Objetivo:** renderizar la lista de enlaces de sección una sola vez como pieza reutilizable por escritorio y por el panel móvil.

**RF:** RF-1, RF-4.

**Depende de:** T1 (tipos de destino y etiquetas).

**Archivos:** `src/components/ui/NavLinks/NavLinks.tsx`, `src/components/ui/NavLinks/NavLinks.test.tsx`.

**Qué debe quedar:**

- Props `items: NavItem[]`, `ariaLabel: string` y `onNavigate?: () => void`.
- `<ul>` con un `<a>` por item, en el orden recibido; `onNavigate` se dispara al activar un enlace.
- Si `items` está vacío, devuelve `null`; los items sin `href` o `label` se omiten.
- No decide el ancho ni duplica estilos de la barra; eso es de `Navbar`.

**Tests primero:**

- `NavLinks.test.tsx`: lista y orden; `onNavigate` al activar; item sin href omitido; item sin label omitido; lista vacía → `null`; nombre accesible de la lista.

**Criterio de hecho:** `pnpm exec vitest run src/components/ui/NavLinks/NavLinks.test.tsx` en verde; no hay enlaces duplicados dentro de la pieza.

---

## T10 — `ThemeControl`

**Objetivo:** mostrar el control de tema solo cuando hay JavaScript y anunciar su estado sin depender del color.

**RF:** RF-6.

**Depende de:** T2 (área táctil).

**Archivos:** `src/components/ui/ThemeControl/ThemeControl.tsx`, `src/components/ui/ThemeControl/ThemeControl.test.tsx`.

**Qué debe quedar:**

- Props `label: string`.
- Antes de montar no renderiza botón; reserva el espacio para no provocar saltos de layout.
- Tras montar, renderiza `ThemeToggle` con `aria-pressed` y la etiqueta traducida; alterna con `setTheme` de `lib/theme-dom` y mantiene el estado.
- Si `setTheme` falla, no rompe ni muestra error; mantiene el tema actual.
- El botón no aparece en el HTML del servidor, de modo que sin JS no hay un control inerte.
- El área de contacto cumple `--touch-target` (24 × 24 px como mínimo).

**Tests primero:**

- `ThemeControl.test.tsx`: sin montar no hay botón; al montar aparece con `aria-pressed`; al pulsar alterna y llama a `setTheme`; `setTheme` que lanza no rompe; etiqueta ausente no renderiza botón.
- El caso sin JS se cubre en `e2e/theme.spec.ts` (T22).

**Criterio de hecho:** `pnpm exec vitest run src/components/ui/ThemeControl/ThemeControl.test.tsx` en verde; no se añade un segundo script al `<head>`; el control no se renderiza en servidor.

---

## T11 — `AnchorFocus`

**Objetivo:** mover el foco al encabezado del destino cuando la página llega por ancla o cambia el hash, sin un segundo scroll.

**RF:** RF-13.

**Depende de:** T5 (resolución) y T7 (encabezado enfocable).

**Archivos:** `src/components/ui/AnchorFocus/AnchorFocus.tsx`, `src/components/ui/AnchorFocus/AnchorFocus.test.tsx`.

**Qué debe quedar:**

- Props `sectionIds: SectionId[]`; no renderiza marcado visible.
- Al montar y en `hashchange`, resuelve el hash; si es `valid`, busca la sección, su `[data-section-heading]` y llama a `focus({ preventScroll: true })`.
- Hash `empty`, `unknown` o sección sin encabezado: no hace nada y no lanza.
- El desplazamiento lo hace el navegador con `scroll-padding-top`; el foco no vuelve a desplazar.

**Tests primero:**

- `AnchorFocus.test.tsx`: hash válido enfoca el encabezado; hash vacío no hace nada; hash desconocido no hace nada; `hashchange` vuelve a enfocar; sección sin encabezado no lanza; no renderiza nodos visibles.

**Criterio de hecho:** `pnpm exec vitest run src/components/ui/AnchorFocus/AnchorFocus.test.tsx` en verde; no se enfoca la `<section>` sino el encabezado.

---

## T12 — Extensión de `Link`

**Objetivo:** abrir enlaces externos en pestaña nueva de forma nativa, con aviso solo para lectores de pantalla, sin `window.open`.

**RF:** RF-11.

**Depende de:** nada.

**Archivos:** `src/components/ui/Link/Link.tsx`, `src/components/ui/Link/Link.test.tsx`, `docs/specs/04-ui-atoms/spec.md`, `docs/specs/04-ui-atoms/plan.md`.

**Qué debe quedar:**

- Props de la 04 más `srLabel?: string`.
- Con `target="_blank"`, el `<a>` nativo lleva `rel="noreferrer noopener"` y un `span` `sr-only` con `srLabel`.
- Se elimina el `preventDefault` + `window.open` para `_blank`; el clic central y los bloqueadores de ventanas emergentes funcionan.
- `href` vacío sigue sin navegar; sin `children` o `href`, `null`.
- El contrato de la spec 04 se actualiza en el mismo cambio para describir el comportamiento nativo y `srLabel`. Los e2e de fixtures no cambian.

**Tests primero:**

- Actualizar `Link.test.tsx`: `_blank` comprueba `target`, `rel` y `srLabel`, y que `window.open` no se llama; `srLabel` no es texto visible; href vacío no navega; el resto de casos existentes siguen verdes.
- Revisar que `anchor-jump.spec.ts`, `no-js.spec.ts` y `reveal.spec.ts` no usan `Link`; no requieren cambios.

**Criterio de hecho:** `pnpm exec vitest run src/components/ui/Link/Link.test.tsx` en verde; la spec 04 y el plan 04 describen el contrato nuevo; no queda ninguna llamada a `window.open`.

---

## T13 — Extensión de `Logo`

**Objetivo:** permitir que la identidad de la barra suba al inicio y limpie el ancla cuando ya se está en la home.

**RF:** RF-1.

**Depende de:** nada.

**Archivos:** `src/components/ui/Logo/Logo.tsx`, `src/components/ui/Logo/Logo.test.tsx`.

**Qué debe quedar:**

- Prop opcional `onClick`.
- El `href` y el nombre accesible no cambian; el `onClick` se dispara al activar.
- Sin `href`, sigue devolviendo `null`.

**Tests primero:**

- Ampliar `Logo.test.tsx`: `onClick` se dispara; `href` y nombre accesible intactos; sin `href` → `null`.

**Criterio de hecho:** `pnpm exec vitest run src/components/ui/Logo/Logo.test.tsx` en verde; los tests existentes no se reescriben.

---

## T14 — `Navbar`: estructura, menú y controles

**Objetivo:** construir la barra completa en estado visible: identidad, enlaces de escritorio, menú móvil nativo, control de tema y control de idioma.

**RF:** RF-1, RF-4, RF-6, RF-12, RF-14.

**Depende de:** T1, T2, T9, T10 y T13.

**Archivos:** `src/components/Navbar/Navbar.tsx`, `src/components/Navbar/Navbar.module.css`, `src/components/Navbar/Navbar.test.tsx`.

**Qué debe quedar:**

- Props: `locale`, `site: SiteData`, `sections: SectionDestination[]` y `labels` con `nav`, `openMenu`, `closeMenu`, `themeToggle`, `langEn` y `langEs`. La identidad sale de `site.name`; no hay `labels.identity`.
- `<header>` pegajoso, sólido, con opacidad 1, fuera de cualquier bloque revelable y por encima del contenido con `--nav-z`.
- Identidad con `Logo`, nombre accesible «Pedro Suárez Gallardo» y enlace al inicio de la home del idioma. En la home, `onClick` sube al inicio y limpia el ancla; fuera de la home, navega a `/{locale}`.
- Cuatro enlaces en orden About, Work, Stack, Contact, con las etiquetas del idioma activo. Los `href` son `#id` en la home y `/{locale}#id` fuera de ella; no hay enlaces a proyectos ni a rutas inexistentes.
- `NavLinks` de escritorio y `NavLinks` dentro de un `<details>` móvil. El `<summary>` es solo icono y su nombre accesible cambia entre «Abrir menú» y «Cerrar menú»; el estado expandido lo aporta `<details>`. El panel es superpuesto, con scroll interno y sin bloquear el scroll de la página.
- El menú se cierra al elegir un enlace solo con JS; sin JS queda abierto hasta que se cierre con el control. Al pasar a 768 px o más, se cierra si hay JS.
- `ThemeControl` y `LanguageSwitch` están siempre en la barra, fuera del menú, sin duplicarse. `LanguageSwitch` recibe `ariaLabelEn`/`ariaLabelEs` de `shared.langSwitch.en`/`es`.
- Los controles cumplen 24 × 24 px y tienen foco visible en ambos temas.
- En impresión, la barra no se imprime.

**Tests primero:**

- `Navbar.test.tsx`: identidad con nombre accesible y `href` correcto; cuatro enlaces en orden; etiquetas traducidas; un `NavLinks` de escritorio y otro dentro de `<details>`; `summary` con «Abrir menú»/«Cerrar menú»; tema e idioma presentes; `onClick` de la identidad; enlaces `#id` en la home y `/{locale}#id` fuera; ausencia de enlaces a proyectos; falta una etiqueta de sección y se omite ese enlace; falta el nombre y se omite el Logo; el menú se cierra al navegar con JS.
- La visibilidad de un solo conjunto de enlaces y el comportamiento del panel se verifican en e2e (T22).

**Criterio de hecho:** `pnpm exec vitest run src/components/Navbar/Navbar.test.tsx` en verde; `pnpm typecheck` en verde; la barra no está dentro de `Reveal`; no hay controles duplicados.

---

## T15 — `Navbar`: visibilidad por scroll y foco

**Objetivo:** ocultar la barra al bajar más de 80 px y devolverla al subir o al recibir foco, sin atenuarla ni sacarla del orden de tabulación.

**RF:** RF-3, RF-4, RF-12.

**Depende de:** T3 y T14.

**Archivos:** `src/components/Navbar/Navbar.tsx`, `src/components/Navbar/Navbar.module.css`, `src/components/Navbar/Navbar.test.tsx`.

**Qué debe quedar:**

- La barra usa `transform: translateY(-100%)` sobre `position: sticky`; no usa `display:none`, `visibility:hidden` ni `opacity` menor que 1. No hay salto de layout.
- `data-hidden` refleja el resultado de `resolveNavbarVisibility`; la transición dura `--duration-state` (200 ms).
- Al bajar más de 80 px, se oculta; al subir, se muestra; al final de la página sigue oculta hasta subir o enfocar.
- `focusin` dentro del `header` la muestra de inmediato; `focusout` recalcula.
- Con el menú abierto, siempre visible, aunque se haga scroll; el scroll interno del menú no la oculta ni la cierra.
- Con `prefers-reduced-motion: reduce` o sin soporte de `animation-timeline`, siempre visible y sin transición.
- La barra sigue en el orden de tabulación y en el árbol de accesibilidad mientras está oculta.

**Tests primero:**

- Ampliar `Navbar.test.tsx`: estado inicial visible; scroll a 81 px bajando añade `data-hidden`; subir lo quita; scroll sin cambio mantiene el estado; `focusin` lo quita; menú abierto lo mantiene visible; reduced motion y sin soporte de timeline siempre visible; el foco no se pierde.
- Los casos de scroll real, final de página y foco con teclado se cubren en `e2e/navbar.spec.ts` (T22).

**Criterio de hecho:** `pnpm exec vitest run src/components/Navbar/Navbar.test.tsx` en verde; la opacidad computada de la barra es 1 en todos los estados; no hay `display:none` ni `visibility:hidden`.

---

## T16 — `Footer`

**Objetivo:** cerrar la página con GitHub, LinkedIn, email, CV del idioma activo y copyright, sin controles de tema ni idioma.

**RF:** RF-11, RF-14.

**Depende de:** T1, T2 y T12.

**Archivos:** `src/components/Footer/Footer.tsx`, `src/components/Footer/Footer.test.tsx`.

**Qué debe quedar:**

- Props `locale`, `site: SiteData` y `labels` con `copyright`, `github`, `linkedin`, `email`, `cv` y `newTab`.
- GitHub, LinkedIn y CV con `target="_blank"`, `rel="noreferrer noopener"` y texto `sr-only` traducido; email con `mailto:`; CV del idioma activo.
- Copyright «© 2026 Pedro Suárez Gallardo» desde `messages`, no hardcodeado en el componente.
- Sin controles de tema ni idioma; fuera de `Reveal`; no pegajoso; oculto en impresión.
- Si falta una URL, se omite ese enlace y el resto se renderiza; si falta el copyright, se omite; nunca lanza.

**Tests primero:**

- `Footer.test.tsx`: cuatro destinos; `target` y `rel`; texto `sr-only`; `mailto:`; CV EN/ES; copyright; sin controles de tema/idioma; falta una URL y el resto sigue; falta el copyright y no rompe.

**Criterio de hecho:** `pnpm exec vitest run src/components/Footer/Footer.test.tsx` en verde; ningún dato ni texto está hardcodeado en el componente.

---

## T17 — `Hero`: contenido y revelado

**Objetivo:** componer el hero completo con el nombre como único `h1`, el contenido del brief y las dos llamadas a la acción, con el revelado `rise` en el contenido secundario.

**RF:** RF-7, RF-9.

**Depende de:** T1 y T12.

**Archivos:** `src/components/sections/Hero/Hero.tsx`, `src/components/sections/Hero/Hero.module.css`, `src/components/sections/Hero/Hero.test.tsx`.

**Qué debe quedar:**

- Props `content` con `name`, `role`, `pitch`, `support`, `meta`, `ctaPrimary` y `ctaSecondary`; `primaryHref` (`#work`) y `secondaryHref` (`#contact`).
- `<section aria-labelledby="hero-name">`; `<h1 id="hero-name" aria-label={name}>` con tres líneas `aria-hidden` y el cursor `aria-hidden`. El nombre se anuncia una sola vez y no como tres encabezados ni letras sueltas. Si falta el nombre, la sección no lleva `aria-labelledby` y no se renderiza el `h1`.
- Rol, pitch, línea de apoyo y metadatos como texto plano; los metadatos son «3+ YEARS / ES · EN» y «3+ AÑOS / ES · EN», sin iconos.
- Rol, pitch, apoyo, metadatos y CTAs con `Reveal variant="rise"`; las dos CTAs van en `RevealGroup variant="rise"` y se escalonan como grupo. El nombre no se envuelve en `Reveal`.
- CTAs a Work y Contact; se acepta que los destinos estén vacíos en esta fase. Si falta una CTA, se omite ese enlace; si falta el nombre, no se renderiza el `h1` pero sí el resto; nunca lanza.
- Sin fotografía ni contenido de otras secciones.

**Tests primero:**

- `Hero.test.tsx`: `h1` único con el nombre completo como nombre accesible; tres líneas; cursor `aria-hidden`; rol, pitch, apoyo y metadatos visibles; CTAs a `#work` y `#contact`; el nombre no está dentro de un bloque revelable; el contenido secundario sí; sin nombre, el resto sigue; sin una CTA, se omite.

**Criterio de hecho:** `pnpm exec vitest run src/components/sections/Hero/Hero.test.tsx` en verde; no hay textos ni URLs hardcodeadas; el hero no incluye fotografía.

---

## T18 — Shell de layout y 404

**Objetivo:** envolver todas las rutas localizadas con enlace de salto, barra, `main` accesible y pie, y mantener la shell en la 404.

**RF:** RF-5, RF-12, RF-13, RF-14.

**Depende de:** T8, T11, T14 y T16.

**Archivos:** `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`, `src/app/[locale]/not-found.tsx`, `e2e/shell.spec.ts` (nuevo).

**Qué debe quedar:**

- `layout.tsx` compone `SkipLink`, `Navbar`, `<main id="main" tabIndex={-1}>` y `Footer`, más `AnchorFocus` con los ids de sección. El layout sigue siendo de servidor; la barra y el pie reciben textos ya traducidos por props.
- Se retira el `<nav>` provisional con `LanguageSwitch` del layout; el control de idioma pasa a `Navbar`, de modo que no hay dos controles de idioma en la misma vista.
- `page.tsx` y `not-found.tsx` dejan de renderizar su propio `<main>` para no anidar landmarks; el contenido va dentro del `main` del layout.
- La 404 conserva barra y pie, el idioma de la ruta y los enlaces de sección a la home + ancla; no muestra hero ni destinos.
- El enlace de salto es el primer elemento enfocable; al activarlo, el foco va a `#main` y se salta la barra.
- La shell se renderiza estáticamente por idioma; no depende de JS para mostrarse.

**Tests primero:**

- `e2e/shell.spec.ts`: `/en` y `/es` tienen `banner`, `main` y `contentinfo`; el enlace de salto existe con `href="#main"`; solo hay un control de idioma en la página; la 404 localizada (`/en/ruta-inexistente` y `/es/ruta-inexistente`) muestra barra y pie; no hay dos `main` ni dos `banner`.
- `/fr` sigue siendo la 404 desnuda que genera `src/proxy.ts` (sin layout localizado); no se le exige shell en esta spec. Si se quisiera shell también ahí, sería un cambio de la spec 02, no de la 06.
- Los tests de 404 existentes de `i18n-routing.spec.ts` deben seguir verdes.

**Criterio de hecho:** `pnpm build` y `pnpm exec playwright test e2e/shell.spec.ts` en verde; no hay landmarks anidados; la shell aparece sin JS.

---

## T19 — Home: hero y cuatro destinos reservados

**Objetivo:** convertir la home en hero + cuatro destinos vacíos con encabezado, sin contenido de cuerpo y sin tocar la navegación.

**RF:** RF-2, RF-7, RF-13, RF-14.

**Depende de:** T6, T7, T17 y T18.

**Archivos:** `src/app/[locale]/page.tsx`, `e2e/home.spec.ts`.

**Qué debe quedar:**

- La home selecciona los mensajes por locale como ya hace y compone `Hero` como primer bloque.
- Cuatro `Section` con `id` estable y `aria-labelledby` al `SectionHeading` correspondiente; los encabezados son `01 / ABOUT`, `02 / WORK`, `03 / STACK`, `04 / CONTACT` en inglés y `01 / SOBRE MÍ`, `02 / TRABAJO`, `03 / STACK`, `04 / CONTACTO` en castellano, con nombre accesible solo la etiqueta.
- Los destinos no tienen contenido de cuerpo; las specs 07–10 los rellenarán sin cambiar ids ni navegación.
- El orden es About, Work, Stack, Contact en ambos idiomas.
- Se eliminan `hero.title` y `hero.subtitle` de `messages/en.json` y `messages/es.json` una vez que `page.tsx` ya no los usa; la paridad sigue verde.
- La página sigue siendo de servidor y estática.

**Tests primero:**

- Ampliar `e2e/home.spec.ts`: `/en` y `/es` tienen un solo `h1` (el nombre) y cuatro `h2`; en EN los nombres accesibles son «About», «Work», «Stack» y «Contact», y en ES «Sobre mí», «Trabajo», «Stack» y «Contacto»; el orden es el de la spec; los destinos no muestran contenido de cuerpo; el hero es el primer bloque; no hay enlaces a proyectos.
- El smoke existente sin `pageerror` se mantiene.

**Criterio de hecho:** `pnpm exec playwright test e2e/home.spec.ts` en verde; `pnpm typecheck` en verde; `hero.title`/`hero.subtitle` ya no existen; la home no tiene `<main>` propio.

---

## T20 — Nombre a todo el ancho

**Objetivo:** hacer que el nombre ocupe al menos el 90 % del ancho disponible en 360, 768 y 1440 px, con tope de retícula desde 1920 px, sin scroll horizontal entre 320 y 1920 px y con reflujo legible al 200 % de texto.

**RF:** RF-8.

**Depende de:** T2, T17 y T19.

**Archivos:** `src/components/sections/Hero/Hero.module.css`, `src/components/sections/Hero/Hero.tsx`, `e2e/hero-name-width.spec.ts` (nuevo).

**Qué debe quedar:**

- Tres líneas, una por palabra, con el mismo tamaño y alineación a la izquierda; la línea más larga define el ancho del bloque.
- El tamaño sale de `--text-hero-name`, calculado con `--grid-gutter`, `--hero-name-fill` y `--hero-name-divisor`; no se usa `--text-display`.
- El bloque ocupa al menos el 90 % del ancho disponible en 360, 768 y 1440 px, descontando el margen de retícula. En 320 px puede bajar del 90 % antes que provocar scroll horizontal. Desde 1920 px se limita a `--grid-max-width`; el 90 % solo se exige hasta 1440 px.
- No se parten palabras ni se provoca scroll horizontal entre 320 y 1920 px. Al 200 % de texto, el nombre puede refluir, reducirse o partir una palabra solo cuando no quepa antes que provocar scroll horizontal; la legibilidad prevalece sobre las tres líneas y a tamaños normales no se parte ninguna palabra.
- El hero mide al menos `100dvh` y el espacio del nombre queda reservado desde el primer fotograma; no hay saltos de layout al cargar la fuente. Ese `100dvh` es la referencia del límite del 20 % del parallax de T21.

**Tests primero:**

- `e2e/hero-name-width.spec.ts`, separado de los flujos críticos: a 360, 768 y 1440 px el ancho del bloque es ≥ 90 % del ancho disponible; a 320 px no hay scroll horizontal; a 1920 y 2560 px el bloque no supera la retícula y no crece; barrido de 320 a 1920 px sin scroll horizontal; texto al 200 % (font-size del root al doble, como aproximación al zoom de texto) sin scroll horizontal y sin palabras partidas a tamaños normales.
- El test de `lib/hero-name` (T4) sigue siendo la verificación pura de la fórmula.

**Criterio de hecho:** `pnpm exec playwright test e2e/hero-name-width.spec.ts` en verde; el nombre no usa `--text-display`; no hay scroll horizontal; la comprobación de ancho no vive en `e2e/hero.spec.ts`.

---

## T21 — Entrada, cursor, contorno y parallax

**Objetivo:** ejecutar el momento firma del hero solo con CSS: entrada escalonada, cursor terminal, paso a contorno y parallax reversible, con todos los fallbacks.

**RF:** RF-7, RF-9, RF-10.

**Depende de:** T17, T19 y T20.

**Archivos:** `src/components/sections/Hero/Hero.module.css`, `e2e/hero.spec.ts` (nuevo).

**Qué debe quedar:**

- Entrada: cada línea pasa de opacidad 0 y desplazamiento inferior a opacidad 1 y posición final; duración 400 ms por línea, desfases 0/100/200 ms, total ≤ 600 ms; `animation-fill-mode: both`; no se repite al hacer scroll.
- Cursor: ciclo de 1 s, 50 % encendido, visible en relleno y contorno, decorativo y `aria-hidden`.
- Contorno: el hero define `view-timeline-name`; el rango es `exit 0%` a `exit 100%`; el relleno pasa de tinta a transparente y el trazo se mantiene fijo (no `currentColor`). El contorno se completa cuando el hero termina de salir, no al cargar.
- Parallax: el nombre se desplaza como máximo `--hero-parallax-distance` (20 dvh), que es ≤ 20 % de la altura del hero porque el hero mide al menos 100 dvh. El hueco con el rol reserva esa distancia; el nombre no se solapa con el resto del hero ni con la sección siguiente y revierte al volver arriba.
- Fallbacks: `@supports not (animation-timeline: view())` deja el nombre sólido, estático y sin transformación; `prefers-reduced-motion: reduce` elimina entrada, parpadeo, contorno y parallax, y deja el cursor estático y visible; `@media print` imprime el nombre sólido y sin animaciones; `@media (forced-colors: active)` mantiene relleno y trazo visibles con `CanvasText`.
- El nombre nunca se oculta ni se sustituye por una imagen.

**Tests primero:**

- `e2e/hero.spec.ts`: un solo `h1` con el nombre; entrada ≤ 600 ms y estado final estable; no se repite al hacer scroll; cursor con duración de 1 s, corte de las keyframes en el 50 % y `aria-hidden`; contorno y parallax reversibles, sin salir del hero ni solaparse, y con desplazamiento máximo ≤ 20 % de la altura del hero; reduced motion sólido y estático; sin JS el nombre se ve; impresión sin barra ni pie y con el nombre sólido; colores forzados con el nombre visible.
- Para el fallback sin `animation-timeline`, se sigue el patrón de `reveal-fallback.spec.ts`: un fixture con el CSS real del hero y la regla de fallback inyectada, y se comprueba que el nombre queda sólido, sin transformación y sin animación.
- El trazo usa la tinta del tema sobre la superficie; el e2e comprueba que el color computado del trazo es esa tinta. El par tinta/superficie ya está cubierto por `src/test/theme-contrast.test.ts` (3:1 para texto grande); no se duplica el cálculo en e2e ni se comprueban clases o nombres de animación.

**Criterio de hecho:** `pnpm exec playwright test e2e/hero.spec.ts` en verde en `/en` y `/es`, tema claro y oscuro; el hero no depende de JS para verse; `Reveal` no se modifica.

---

## T22 — E2E de navegación y actualización de e2e existentes

**Objetivo:** demostrar los flujos críticos de navegación, teclado, menú, idioma y tema en la página real, y actualizar los e2e que usaban el contenido provisional.

**RF:** RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-12, RF-13, RF-14.

**Depende de:** T14, T15, T16, T18, T19, T20 y T21.

**Archivos:** `e2e/navbar.spec.ts` (nuevo), `e2e/i18n-routing.spec.ts`, `e2e/theme.spec.ts`, `e2e/scroll-motion.spec.ts`, `e2e/home.spec.ts`.

**Qué debe quedar:**

- `e2e/navbar.spec.ts`, en `/en` y `/es`, tema claro y oscuro. Los casos de teclado, anclas, menú, idioma y 404 se ejecutan con `prefers-reduced-motion: reduce`; la ocultación y reaparición de la barra se ejecuta sin reducir el movimiento, porque con `reduce` la barra debe permanecer siempre visible:
  - el enlace de salto es el primero y lleva el foco a `main`;
  - el orden de tabulación es salto, identidad, enlaces o menú, tema, idioma, contenido y pie;
  - la identidad sube al inicio y limpia el hash;
  - las cuatro anclas dejan el encabezado visible por debajo de la barra, actualizan el hash y dejan el foco en el encabezado;
  - la barra está visible arriba, oculta tras 80 px bajando, visible subiendo y visible al enfocar un control oculto;
  - con `prefers-reduced-motion: reduce`, la barra permanece visible en todas las posiciones y no hay deslizamiento;
  - a 360 px el menú abre, muestra los enlaces, cierra con el control y con un enlace, mantiene la barra visible al hacer scroll y no duplica enlaces;
  - al redimensionar a escritorio el menú se cierra y solo hay un conjunto de enlaces visible y tabulable;
  - la 404 localizada (`/en/ruta-inexistente` y `/es/ruta-inexistente`) tiene enlaces a la home del idioma + ancla;
  - el cambio de idioma conserva el ancla y el destino;
  - tema e idioma están en la barra, sin duplicados, y el tema anuncia su estado;
  - en un contexto sin JavaScript: la barra está siempre visible, el menú abre y cierra con el control, no se cierra al elegir un enlace, el control de tema no aparece y el salto y las anclas siguen operativos.
- `e2e/i18n-routing.spec.ts`: sustituir las apariciones de «Web portfolio»/«Portfolio web» por el rol traducido; mantener idioma, hash, query, 404 y cambio de idioma.
- `e2e/theme.spec.ts`: añadir que el control de tema cambia claro/oscuro, persiste y anuncia; sin JS no aparece; sigue habiendo un solo script en `<head>`.
- `e2e/scroll-motion.spec.ts`: añadir que la barra no participa del revelado y que el hero no tapa el destino; los tests de fixtures se mantienen.
- `e2e/home.spec.ts`: se mantiene el smoke sin `pageerror`.

**Tests primero:** escribir `navbar.spec.ts` antes de dar por cerrada la barra; ejecutar los e2e actualizados antes de tocar el código que falte.

**Criterio de hecho:** `pnpm test:e2e` en verde; no hay enlaces duplicados; el menú funciona sin JS; el idioma y el tema se conservan; los e2e de navegación e idioma usan movimiento reducido, salvo el caso de ocultación de la barra, que se prueba sin reducción y con un caso reducido que verifica que no se oculta.

---

## T23 — Enmiendas documentales y gates finales

**Objetivo:** dejar la documentación alineada con el comportamiento entregado y cerrar la spec con todos los gates.

**RF:** Todos (transversal).

**Depende de:** T1–T22.

**Archivos:** `docs/specs/05-scroll-motion-reveal/spec.md`, `README.md`, `docs/specs/03-theme-and-tokens/spec.md`, `docs/specs/06-shell-and-hero/spec.md`.

**Qué debe quedar:**

- Spec 05, RF-11: la barra puede salir de la vista al bajar y volver al subir; mantiene opacidad 1, no participa del revelado y sigue en el orden de tabulación. El pie, el enlace de salto y los elementos fijos que no son la barra siguen sin ocultarse.
- README: el pie ya no incluye cambio de idioma; la tabla de fases coloca «Scroll motion» antes de «Shell and Hero»; la estructura de página refleja la shell real.
- Spec 03: añadir la fila del tamaño del nombre (`--text-hero-name`) a la tabla de rangos, amparada por la decisión b (rangos ajustables), sin cambiar la jerarquía display > titular de gran formato > titular de sección > cuerpo > metadato.
- Spec 06: actualizar el estado a implementada solo cuando los gates estén en verde.
- No se reabren gates ni se bajan umbrales.

**Tests primero:** no hay test automático nuevo; la verificación es la revisión cruzada de docs y los gates completos. El test de paridad y el de tokens ya cubren los datos y los valores.

**Criterio de hecho:**

1. `pnpm lint` en verde.
2. `pnpm typecheck` en verde.
3. `pnpm test` en verde con cobertura ≥ 95 % en líneas, funciones, ramas y sentencias.
4. `pnpm build` en verde.
5. `pnpm test:e2e` en verde.
6. Paridad de claves entre `messages/en.json` y `messages/es.json`.
7. RF-11 de la 05 enmendado y README corregido en el mismo cambio.
8. Ningún RF de la 06 sin tarea y sin test; ninguna duda abierta.

---

## Cobertura RF → tareas

| RF | Tareas que lo cubren |
|---|---|
| RF-1 Barra de navegación | T1, T9, T13, T14, T22 |
| RF-2 Destinos reservados | T1, T6, T7, T19, T22 |
| RF-3 Barra pegajosa y scroll | T2, T3, T14, T15, T22 |
| RF-4 Menú en pantallas estrechas | T3, T9, T14, T15, T22 |
| RF-5 Enlace de salto | T8, T18, T22 |
| RF-6 Tema e idioma | T2, T10, T14, T22 |
| RF-7 Contenido del hero | T1, T17, T19, T21 |
| RF-8 Nombre a todo el ancho | T2, T4, T20 |
| RF-9 Entrada y cursor | T2, T17, T21 |
| RF-10 Contorno y parallax | T2, T21 |
| RF-11 Pie de página | T1, T12, T16 |
| RF-12 Navegación por teclado | T3, T8, T14, T15, T18, T22 |
| RF-13 Llegada a una sección | T2, T5, T6, T7, T11, T19, T22 |
| RF-14 Shell en todas las rutas | T1, T14, T16, T18, T19, T22 |

Todos los RF tienen al menos una tarea de implementación y una verificación asociada. Las tareas T1–T22 se pueden ejecutar en el orden de la tabla; T23 cierra el cambio.
