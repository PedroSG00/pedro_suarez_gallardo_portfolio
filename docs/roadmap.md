# Roadmap — Portfolio de Pedro Suárez Gallardo

Hoja de ruta de specs, en orden de ejecución. Cada spec sigue el mismo bucle: **spec → tests → código → gates** (`pnpm lint`, `pnpm typecheck`, `pnpm test`, y `pnpm test:e2e` cuando toca idioma, tema, navegación o movimiento). Una spec está terminada solo cuando sus gates pasan.

Las specs 01, 02 y 03 tocan capas transversales (tooling, i18n, tema y estilos globales): requieren aprobación explícita de Pedro antes de ejecutarse (ver `AGENTS.md`). La 01 está aprobada y se cierra en el PR de la rama `01`.

Fuera de alcance por ahora: sección de proyectos y ruta `/projects/[slug]` (futurible, ver `content-brief.md`, sección 10).

## Estado

- [ ] 01 Tooling y CI
- [ ] 02 i18n y rutas
- [ ] 03 Tema y tokens
- [ ] 04 Átomos de UI
- [ ] 05 Movimiento de scroll (`Reveal`)
- [ ] 06 Shell y Hero
- [ ] 07 About
- [ ] 08 Work
- [ ] 09 Stack
- [ ] 10 Contact y enlaces del footer
- [ ] 11 SEO y metadatos
- [ ] 12 Pasada de accesibilidad y rendimiento
- [ ] 13 Lanzamiento

## Specs

| # | Spec (`docs/specs/`) | Qué decide | Depende de | Hecho cuando |
|---|---|---|---|---|
| 01 | `01-tooling-and-ci` | pnpm, ESLint, Vitest con umbral del 95 % global, RTL, Playwright (Chromium), `src/test/setup.ts`, CI de seis checks y gate de Sonar | — | CI en verde con seis checks y Sonar sobre una página vacía; ruleset de `main` con los seis |
| 02 | `02-i18n-routing` | `next-intl`, rutas `/en` y `/es`, `setRequestLocale`, renderizado estático, esquema de claves de `messages/` por sección, test de paridad de claves y `renderWithIntl` en `src/test/` | 01 | `/en` y `/es` se construyen estáticas; el test de paridad rompe si falta una clave |
| 03 | `03-theme-and-tokens` | Paleta crema/negro, modo oscuro diseñado (no invertido), fuente mono con máximo dos pesos, escala tipográfica con `clamp`, espaciados, **tokens de movimiento** (duraciones y distancias), View Transitions para el tema | 01 | Cambio de tema sin parpadeo; contraste AA verificado en ambos modos |
| 04 | `04-ui-atoms` | `Button/Link`, `Heading`, `Tag`, `Section` (con numeración `01 / ABOUT`), líneas de retícula, `ThemeToggle`, `LanguageSwitch` | 02, 03 | Cada átomo testado por rol y comportamiento, sin contenido de portfolio dentro |
| 05 | `05-scroll-motion-reveal` | `ui/Reveal` (`rise`, `clip`, `fade`, `delay`); una sola animación de entrada y salida con `animation-timeline: view()`; fallback visible; `prefers-reduced-motion`; la última sección no sale | 03, 04 | e2e de opacidad al entrar, centrado y al salir, en ambos idiomas y temas |
| 06 | `06-shell-and-hero` | `Navbar`, `Footer` y `Hero`: nombre a todo el ancho, líneas escalonadas, cursor parpadeante, paso a contorno con parallax | 04, 05 | Memorable a primera vista en ambos temas e idiomas; navegación por teclado completa |
| 07 | `07-about` | Frase invertida que se ilumina palabra a palabra, valores como etiquetas, foto de perfil | 05, 06 | Contenido solo de `messages/`; el efecto degrada a texto estático |
| 08 | `08-work` | Cinco filas de resultado con número tabular, inversión en hover, etiquetas de tecnología desde `content/` | 05, 06 | Añadir o quitar una fila es solo datos |
| 09 | `09-stack` | Grupos desde `content/stack.ts`, frontend primero, etiquetas mono escalonadas | 05 | Sin marcado duplicado entre grupos |
| 10 | `10-contact-footer-links` | Titular gigante con `clip`, email como enlace enorme, LinkedIn, GitHub y CV por idioma | 05 | Enlaces verificados; CV EN y ES correctos |
| 11 | `11-seo-metadata` | Metadatos por idioma, `hreflang`, sitemap, robots, imagen OG generada desde el diseño | 06–10 | Metadatos correctos en ambos idiomas |
| 12 | `12-a11y-perf-pass` | Contraste, teclado, lectores de pantalla, reduced-motion, LCP, soporte de `animation-timeline` en Safari y Firefox y decisión sobre el fallback | 01–11 | Lighthouse 95+ en todas las categorías; fallback decidido |
| 13 | `13-launch` | Despliegue estático, dominio, enlaces del README | 12 | Sitio en producción y README completado |

## Orden y paralelismo

```text
01 → 02 ┐
     03 ┴→ 04 → 05 → 06 → 07 ┐
                       ├→ 08 ┤
                       ├→ 09 ├→ 11 → 12 → 13
                       └→ 10 ┘
```

- Ruta crítica: 01 → (02 ∥ 03) → 04 → 05 → 06.
- No se escriben las secciones (07–10) hasta que existan `Reveal` y el Hero.
- 07 a 10 pueden ir en paralelo entre sí.

## Cambio respecto al plan del README

La fase "Scroll motion" se adelanta a antes de Shell y Hero (spec 05), porque todas las secciones se componen con `Reveal`. Si fuese después, habría que reabrir cada sección para envolverla. Al ejecutar la spec 05, mover esa fila en la tabla de fases del `README.md`.

## Riesgos a resolver en la spec, no en el código

- **03, tema.** View Transitions y el modo oscuro diseñado son lo más fácil de dejar a medias. Definir la paleta oscura completa y el comportamiento si el navegador no soporta View Transitions.
- **05, movimiento.** El mayor riesgo es el fallback. Decidir si se acepta "visible sin animar" o se añade un `IntersectionObserver` propio solo para navegadores sin `view()` (en ese caso, ajustar la regla de "solo CSS" en la constitución y en `AGENTS.md`). Sin librerías de animación salvo aprobación explícita.
- **06, hero.** Es la promesa de todo el sitio. Escribir el momento firma con criterios comprobables (por ejemplo, el nombre ocupa el ancho en 360, 768 y 1440 px), no con adjetivos.
- **02, claves.** Fijar el esquema de `messages/` antes de las secciones para no renombrar claves a mitad de camino.
- **Cifras.** Ningún texto introduce datos que no estén en el CV (`content-brief.md`).

## Plantilla mínima de spec

1. Objetivo en una frase.
2. Alcance y qué queda fuera.
3. Decisiones de diseño y de API (props tipadas).
4. Momento firma (solo secciones).
5. Criterios de aceptación escritos como tests: comportamientos visibles para el usuario.
6. Impacto en `messages/`, `content/` y docs.
7. Riesgos y preguntas abiertas.

## Futurible

- **Proyectos:** sección y ruta `/projects/[slug]` cuando haya un proyecto nuevo (entrada en `content/projects.ts`, textos en `messages/`, navegación, sitemap y metadatos), con su propia spec.
