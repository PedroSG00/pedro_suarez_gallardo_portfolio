# AGENTS.md — pedro-suarez-cv

## Proyecto
Web portfolio de Pedro Suárez Gallardo, desarrollador web full-stack. Pensada para reclutadores y, en menor medida, clientes potenciales. Sitio estático y bilingüe (`en`, `es`), sin base de datos ni backend. Home de una sola página (Navbar, Hero, About, Experience, Stack, Contact, Footer). La sección de proyectos y la ruta `/projects/[slug]` están **aparcadas**: no las construyas ni las enlaces hasta que exista una spec.

No es un CV: transmite seguridad y confianza y habla de lo que el visitante obtiene. Voz: frases cortas y afirmativas, beneficio antes que tecnología. Los textos salen del brief de contenido; no inventes cifras.

Minimalista en elementos, espectacular en ejecución: una pieza editorial de alto impacto, nunca una plantilla. Stack: Next.js (App Router), React, TypeScript, Tailwind, `next-intl`, Iconoir (solo iconos).

## Antes de tocar código
1. Lee `docs/constitution.md` y la spec activa en `docs/specs/`. Si no existen, no las inventes: pregunta.
2. Next.js 16 tiene cambios incompatibles: lee la guía relevante en `node_modules/next/dist/docs/` antes de escribir código.
3. La estructura de carpetas y el plan de desarrollo están en el `README.md`. Respétalos.

## Comandos
Solo **pnpm** (nada de npm/yarn ni `package-lock.json`). La instalación la guarda `check-package-manager.mjs` desde `preinstall`: con npm o yarn, `pnpm install` aborta.

| Comando | Para qué |
| --- | --- |
| `pnpm dev` / `pnpm build` / `pnpm start` | Desarrollo, build y servir el build |
| `pnpm lint` | ESLint sobre js/mjs/ts/tsx, sin permitir warnings |
| `pnpm typecheck` | `next typegen && tsc --noEmit` |
| `pnpm test` | Vitest + RTL con cobertura y umbral 95 % global |
| `pnpm test:watch` | Vitest en modo watch, sin cobertura |
| `pnpm test:e2e` | `pnpm build` + Playwright, solo Chromium |

Para iterar rápido: `pnpm exec vitest run ruta/al/archivo.test.tsx`.

## Convenciones
- Código, comentarios y commits en inglés. `camelCase`; constantes en `SCREAMING_SNAKE_CASE`; componentes en `PascalCase`. Conventional Commits.
- Imports con el alias `@/` (apunta a `src/`); sin rutas relativas que suban niveles (`../../`).
- Sin repetición: antes de escribir algo, busca si ya existe. Si lo vas a repetir, extráelo.
- Estilos solo con los tokens del tema de `globals.css`; sin valores mágicos repetidos.
- Cambios pequeños y enfocados: no mezcles refactors con funcionalidades nuevas.

## Componentes
- Carpeta `Nombre/` con `Nombre.tsx` y `Nombre.test.tsx`, en `components/ui/` (genéricos, solo props) o `components/sections/` (bloques de la página).
- Una responsabilidad, props con tipos explícitos, unas 100 líneas como máximo. Las secciones se componen con piezas de `ui/`.
- Extiende un componente existente mediante props antes de crear otro. No crees hooks, contextos ni wrappers genéricos "por si acaso".
- Las secciones son componentes síncronos que usan `useTranslations` (así se pueden testear). Los datos asíncronos, solo en `page.tsx`.

## i18n y SEO
- Textos en `messages/en.json` y `messages/es.json`, mismas claves, siempre los dos idiomas en el mismo cambio. `src/i18n/messages.test.ts` comprueba que coinciden.
- `next/root-params` en layouts y páginas para mantener el renderizado estático. Navegación con los helpers de `src/i18n/navigation.ts`.
- Metadatos por idioma (Metadata API) en la home, encabezados semánticos, `hreflang`, sitemap y renderizado estático.

## Tests
- **Qué testear:** comportamiento visible: contenido mostrado, roles y etiquetas accesibles, variantes, interacción (`userEvent`), estados. Consulta por rol/texto/etiqueta, nunca por clases ni estructura interna.
- **Qué no:** snapshots, clases de Tailwind, detalles internos, ni el comportamiento de Next, `next-intl` o Iconoir. No escribas un test solo para subir la cobertura.
- **Lógica pura** (`lib/`): tests con tabla de casos, incluidos los límites.
- **Secciones:** `renderWithIntl` (`src/test/`) con los mensajes reales de `en.json`, para que una clave que falte rompa el test.
- **Cobertura:** mínimo 95% en líneas, funciones, ramas y sentencias, con umbral en la configuración de Vitest. Nunca bajes el umbral ni excluyas código para cumplirlo; si falta cobertura, falta un test con sentido.
- **e2e (Playwright):** solo flujos críticos: cambio de idioma, cambio de tema, navegación por secciones y movimiento de scroll. Los de navegación e idioma van con `prefers-reduced-motion` activado. El smoke de la 01 es transitorio (la home responde y sin `pageerror`); los flujos de idioma, tema, navegación y movimiento llegan con las specs 02, 03, 05 y 06.
- **Movimiento de scroll (garantía):** en cada sección, un bloque `Reveal` tiene `opacity` < 1 al entrar por abajo, `opacity` = 1 centrado y `opacity` < 1 al salir por arriba (estilo computado, nunca clases). Con `prefers-reduced-motion: reduce`, `opacity` = 1 en cualquier posición. El último bloque queda totalmente visible al final. Se prueba en `/en` y `/es`, en tema claro y oscuro (Chromium).
- Escribe los tests antes que el código.

## Dirección visual
- Crudo y negro; modo oscuro diseñado, no invertido (crudo sobre negro cálido casi puro). Una familia monoespaciada (`next/font`), máximo dos pesos. Sin color de acento.
- Escala extrema: titulares masivos y fluidos (`clamp`) como elemento gráfico frente a cuerpo pequeño y legible. El nombre del hero ocupa el ancho de la pantalla.
- Retícula visible con líneas de 1 px, secciones numeradas (`01 / EXPERIENCE`), metadatos pequeños en mono, bloques invertidos, asimetría y mucho espacio negativo.
- Detalles tipográficos: texto contorneado (`-webkit-text-stroke`), cifras tabulares, cursor parpadeante tipo terminal, inversión de color en hover.
- Movimiento solo con CSS, sin librerías de animación. Estados 150–250 ms, transición de tema hasta 400 ms, revelados hasta 600 ms; duraciones y distancias salen de tokens de `globals.css`. Entradas escalonadas y transición de tema con View Transitions.
- Cada bloque **entra y sale** con el scroll (ver «Movimiento»).
- Con `prefers-reduced-motion`, el impacto debe mantenerse con composición y tipografía estáticas.
- Cada sección tiene su "momento firma" definido en su spec. Base: Hero (nombre a todo el ancho, líneas escalonadas, cursor parpadeante; al hacer scroll pasa a contorno y se mueve más lento), About (frase invertida que se ilumina palabra a palabra), Experience (filas con número tabular que se invierten en hover), Stack (grupos escalonados con etiquetas mono), Contact (titular gigante con `clip` y email enorme que se invierte en hover).

## Movimiento
- Un único componente `ui/Reveal` (props: `children`, `variant`: `rise | clip | fade`, `delay` opcional). Una sola animación con entrada y salida mediante `animation-timeline: view()` y `animation-range: cover`: entra en ~0–25 %, estable en ~25–75 %, sale en ~75–100 % (opacidad 1→0 y desplazamiento hacia arriba). Sin JS ni librerías.
- Seguridad: `@supports not (animation-timeline: view())` → sin animación y todo visible. `prefers-reduced-motion: reduce` → sin animación y todo visible; el impacto se sostiene con tipografía y composición estáticas. El contenido nunca depende de JS para verse. La última sección no tiene salida.
- Antes de cerrar la fase de pulido, comprueba el soporte actual de Safari y Firefox y confirma el fallback.

## Pregunta antes de
- Añadir dependencias (`pnpm add`).
- Hacer cambios grandes en código existente.
- Tocar capas transversales: layout raíz, sistema i18n, tema y estilos globales, configuración de Tailwind/TypeScript/ESLint/Vitest.
- Crear carpetas nuevas en la raíz o en `src/`.

No introduzcas base de datos, backend ni servicios externos (SonarQube Cloud es la excepción aprobada: análisis estático y solo en CI).

## Al terminar una tarea
Comprueba que pasan, en este orden: `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`. Si has tocado idioma, tema, navegación o movimiento (o vas a abrir un PR), añade `pnpm test:e2e`. Si algo falla, corrígelo o explica claramente por qué no se puede.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
