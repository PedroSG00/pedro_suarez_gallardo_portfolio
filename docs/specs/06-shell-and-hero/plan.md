# Plan — 06 Shell y Hero

**Estado:** Pendiente de ejecución. Se deriva de `docs/specs/06-shell-and-hero/spec.md` y debe respetar `docs/constitution.md`. No contiene código de implementación: solo estructura, modelo de datos, algoritmos, contratos, decisiones y estrategia de tests.

**Cobertura:** RF-1 a RF-14 de la spec 06, más los requisitos no funcionales (accesibilidad, i18n, movimiento, rendimiento, sin JS, robustez, impresión, compatibilidad).

**Enmiendas que este plan asume (se aplican en el mismo cambio):**

- **Spec 05, RF-11:** la barra de navegación puede salir de la vista al bajar y volver al subir (RF-3 de la 06). El pie, el enlace de salto y los elementos fijos que no son la barra siguen sin ocultarse. La opacidad de la barra permanece 1: se oculta por desplazamiento, no por atenuación.
- **README:** el pie ya no incluye cambio de idioma; la tabla de fases coloca «Scroll motion» antes de «Shell and Hero», como ya indica `docs/roadmap.md`.
- **Spec 03 (dependencia, no enmienda de comportamiento):** el nombre del hero necesita un tamaño mayor que el máximo actual de `--text-display` (176 px) para cumplir el 90 % a 1440 px. Se añade un token propio de nombre (`--text-hero-name`) y se actualiza la tabla de rangos de la 03, amparada por su decisión b (rangos ajustables). La jerarquía display > titular de gran formato > titular de sección > cuerpo > metadato se mantiene.

---

## 0. Dependencia previa: acceso a textos

La infraestructura de la spec 02 ya está implementada: `src/i18n/` configura `next-intl`, el layout monta `NextIntlClientProvider` y `renderWithIntl` usa los catálogos reales.

- Layout y página fijan el locale para el renderizado estático.
- Componentes de `ui/` y secciones consumen traducciones con `next-intl`; los datos no traducibles salen de `src/content/`.
- Todo texto nuevo se añade a `messages/en.json` y `messages/es.json` en el mismo cambio.

**Cobertura RF:** transversal a RF-1, RF-4, RF-5, RF-6, RF-7, RF-11 y RF-14 (todo texto visible).

---

## 1. Estructura de módulos

Sin carpetas nuevas en la raíz ni en `src/`. Se usan las carpetas que el README ya declara: `components/ui/`, `components/sections/`, componentes de layout en la raíz de `components/` y `src/content/`. Sin barrel files; imports con `@/`.

```text
src/
├── components/
│   ├── Navbar/
│   │   ├── Navbar.tsx                 # orquestador cliente: visibilidad, menú, tema, idioma
│   │   └── Navbar.test.tsx
│   ├── Footer/
│   │   ├── Footer.tsx                 # pie estático
│   │   └── Footer.test.tsx
│   ├── sections/
│   │   └── Hero/
│   │       ├── Hero.tsx               # nombre, rol, pitch, apoyo, metadatos, CTAs
│   │       ├── Hero.module.css        # entrada, cursor, contorno, parallax
│   │       └── Hero.test.tsx
│   └── ui/
│       ├── Section/                   # se extiende: id y labelledBy
│       ├── SectionHeading/            # nuevo: número + etiqueta como h2
│       ├── SkipLink/                  # nuevo: salto al contenido
│       ├── NavLinks/                  # nuevo: lista de enlaces reutilizable
│       ├── Logo/                       # marca enlazada desde public/logo.svg
│       ├── ThemeControl/              # nuevo: estado de tema + ThemeToggle
│       └── AnchorFocus/               # nuevo: foco en el encabezado del ancla
├── content/
│   ├── site.ts                        # nombre, email, GitHub, LinkedIn, CV por idioma
│   └── sections.ts                    # ids, números y orden de los destinos
├── lib/
│   ├── nav-visibility.ts              # lógica pura de ocultación de la barra
│   ├── hero-name.ts                   # lógica pura de tamaño y ancho del nombre
│   └── anchor-target.ts               # resolución pura de hash a destino
├── app/[locale]/
│   ├── layout.tsx                     # skip link, Navbar, main, Footer
│   ├── page.tsx                       # Hero + cuatro destinos reservados
│   └── not-found.tsx                  # shell en 404 (sin hero)
├── app/icon.svg                       # favicon: marca blanca sobre fondo tinta
└── styles/globals.css                 # tokens nuevos de la shell y del hero
```

### 1.1 Responsabilidad y RF de cada módulo

| Módulo | Responsabilidad | RF |
|---|---|---|
| `Navbar/Navbar.tsx` | Barra pegajosa con la marca de `/logo.svg`, enlaces de escritorio, menú móvil, tema e idioma. Mantiene visibilidad al navegar desde ella. | RF-1, RF-3, RF-4, RF-6, RF-12, RF-14 |
| `Navbar` (Tailwind) | Barra sólida, menú responsive superpuesto, estados de foco y controles. | RF-1, RF-3, RF-4, RF-12 |
| `Logo/Logo.tsx` | Marca de `public/logo.svg`; adapta el contraste al tema y mantiene nombre accesible. | RF-1 |
| `Footer/Footer.tsx` | GitHub, LinkedIn, email, CV y copyright; sin controles de tema ni idioma. | RF-11, RF-14 |
| `sections/Hero/Hero.tsx` | Nombre h1, rol, pitch, apoyo, metadatos, CTAs y revelado `rise` del contenido secundario. | RF-7, RF-8, RF-9, RF-10 |
| `sections/Hero/Hero.module.css` | Entrada escalonada, cursor, contorno, parallax, reduced-motion, impresión y colores forzados. | RF-8, RF-9, RF-10 |
| `ui/Section/` | Contenedor de sección con `id` y `aria-labelledby`; conserva la retícula. | RF-2, RF-13 |
| `ui/SectionHeading/` | h2 con número decorativo y etiqueta como nombre accesible; enfocable por programa. | RF-2, RF-13 |
| `ui/SkipLink/` | Primer elemento enfocable; visible solo al recibir foco; lleva a `#main`. | RF-5, RF-12 |
| `ui/NavLinks/` | Lista de enlaces de sección; se usa en escritorio y en el panel móvil. | RF-1, RF-4, RF-12 |
| `ui/ThemeControl/` | Estado de tema, `ThemeToggle`, persistencia y anuncio; oculto sin JS. | RF-6 |
| `ui/AnchorFocus/` | Mueve el foco al encabezado del destino al llegar por ancla. | RF-13 |
| `lib/nav-visibility.ts` | Decide visible/oculta a partir de scroll, dirección, menú, foco y capacidades. | RF-3 |
| `lib/hero-name.ts` | Calcula tamaño y ancho del nombre para el 90 % y el tope de retícula. | RF-8 |
| `lib/anchor-target.ts` | Valida el hash contra los destinos existentes; ignora los inexistentes. | RF-13 |
| `content/site.ts` | Datos no traducibles del sitio (email, URLs, CV). | RF-11, RF-14 |
| `content/sections.ts` | Orden, id y número de About, Work, Stack y Contact. | RF-2, RF-4 |
| `app/[locale]/layout.tsx` | Compone SkipLink, Navbar, `main` y Footer en todas las rutas localizadas. | RF-5, RF-12, RF-14 |
| `app/[locale]/page.tsx` | Compone Hero y los cuatro destinos reservados con sus encabezados. | RF-2, RF-7, RF-13 |
| `app/[locale]/not-found.tsx` | Mantiene la shell en la 404; sin hero ni destinos. | RF-14, RF-13 |
| `styles/globals.css` | Tokens de shell/hero, `--anchor-offset`, scroll nativo suave e instantáneo con movimiento reducido, y anclaje estable en recarga. | RF-3, RF-4, RF-6, RF-8, RF-9, RF-10, RF-13 |

### 1.2 Extensiones compatibles de átomos existentes (spec 04)

| Átomo | Extensión | Motivo | RF |
|---|---|---|---|
| `Section` | Props opcionales `id` y `labelledBy`. | Los destinos necesitan id estable y nombre accesible sin romper el contrato de la 04. | RF-2, RF-13 |
| `Link` | Prop opcional `srLabel` y uso nativo de `target="_blank"` con `rel`. | Anuncio de pestaña nueva sin texto visible y sin depender de `window.open`. | RF-11 |
| `Logo` | Prop opcional `onClick`. | La identidad limpia el ancla y sube al inicio cuando ya se está en la home. | RF-1 |

Las tres extensiones son aditivas: ningún consumidor existente cambia de contrato. Los tests de la 04 se amplían, no se reescriben.

**Cobertura RF:** RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-11, RF-12, RF-13, RF-14.

---

## 2. Modelo de datos

No hay store, contexto global ni capa de datos. Los tipos viven junto al módulo que los usa; los datos no traducibles viven en `src/content/`; los textos, en `messages/`.

### 2.1 Tipos principales

```text
Locale = "en" | "es"
SectionId = "about" | "work" | "stack" | "contact"
Theme = "light" | "dark"

SiteData {
  name: string
  email: string
  githubUrl: string
  linkedinUrl: string
  cvPath: Record<Locale, string>
}

SectionDestination {
  id: SectionId
  index: "01" | "02" | "03" | "04"
  label: string            // ya traducido, viene de messages/shared.nav
}

NavItem {
  href: string             // "#about" en la home; "/es#about" fuera de la home
  label: string
}

NavbarVisibilityInput {
  scrollY: number
  previousScrollY: number
  menuOpen: boolean
  focusWithin: boolean
  reducedMotion: boolean
  supportsScrollTimeline: boolean
}

NavbarVisibility = "visible" | "hidden"

HeroNameMetrics {
  viewportWidth: number
  contentWidth: number
  longestWordChars: number
  advanceRatio: number
  minFontSize: number
  maxFontSize: number
  fillRatio: number        // 0.9
  fontSize: number
  blockWidth: number
  ratio: number
}

AnchorResolution {
  targetId: SectionId | null
  reason: "valid" | "empty" | "unknown" | "not-section"
}
```

### 2.2 Ejemplo de instancia (home `/es`, tema oscuro, scroll 640 px)

```json
{
  "locale": "es",
  "pathname": "/es",
  "theme": "dark",
  "site": {
    "name": "Pedro Suárez Gallardo",
    "email": "suarezgallardopedro@gmail.com",
    "githubUrl": "https://github.com/PedroSG00",
    "linkedinUrl": "https://linkedin.com/in/pedro-suarez-gallardo",
    "cvPath": {
      "en": "/EN_Pedro_Suarez_Gallardo_CV.pdf",
      "es": "/ES_Pedro_Suarez_Gallardo_CV.pdf"
    }
  },
  "sections": [
    { "id": "about",   "index": "01", "label": "Sobre mí" },
    { "id": "work",    "index": "02", "label": "Trabajo" },
    { "id": "stack",   "index": "03", "label": "Stack" },
    { "id": "contact", "index": "04", "label": "Contacto" }
  ],
  "nav": [
    { "href": "#about",   "label": "Sobre mí" },
    { "href": "#work",    "label": "Trabajo" },
    { "href": "#stack",   "label": "Stack" },
    { "href": "#contact", "label": "Contacto" }
  ],
  "navbar": {
    "menuOpen": false,
    "focusWithin": false,
    "visibility": "hidden",
    "scrollY": 640,
    "previousScrollY": 600
  },
  "heroName": {
    "viewportWidth": 1440,
    "contentWidth": 1344,
    "longestWordChars": 8,
    "advanceRatio": 0.6,
    "minFontSize": 48,
    "maxFontSize": 300,
    "fillRatio": 0.9,
    "fontSize": 252,
    "blockWidth": 1209.6,
    "ratio": 0.9
  },
  "anchor": {
    "targetId": "work",
    "reason": "valid"
  }
}
```

### 2.3 Claves de mensajes nuevas (ambos idiomas en el mismo cambio)

| Clave | EN | ES |
|---|---|---|
| `shared.nav.about` | About | Sobre mí |
| `shared.nav.experience` | Work | Trabajo |
| `shared.nav.stack` | Stack | Stack |
| `shared.nav.contact` | Contact | Contacto |
| `shared.nav.label` | Main | Principal |
| `shared.menu.open` | Open menu | Abrir menú |
| `shared.menu.close` | Close menu | Cerrar menú |
| `shared.theme.toggle` | Toggle theme | Cambiar tema |
| `shared.langSwitch.switchToEnglish` | Switch to English | Switch to English |
| `shared.langSwitch.switchToSpanish` | Cambiar a español | Cambiar a español |
| `shared.skipToContent` | Skip to content | Saltar al contenido |
| `shared.newTab` | opens in a new tab | se abre en una pestaña nueva |
| `hero.name` | Pedro Suárez Gallardo | Pedro Suárez Gallardo |
| `hero.role` | Full-stack developer | Desarrollador full-stack |
| `hero.pitch` | I build the web products teams rely on: real-time, data-heavy and made to run in production. | Construyo los productos web en los que los equipos confían: en tiempo real, con muchos datos y hechos para funcionar en producción. |
| `hero.support` | React, TypeScript and Node.js. | React, TypeScript y Node.js. |
| `hero.meta` | 3+ YEARS / ES · EN | 3+ AÑOS / ES · EN |
| `hero.ctaPrimary` | See what I deliver | Ver lo que entrego |
| `hero.ctaSecondary` | Let's talk | Hablemos |
| `footer.copyright` | © 2026 Pedro Suárez Gallardo | © 2026 Pedro Suárez Gallardo |

Las etiquetas de GitHub, LinkedIn, email y CV se reutilizan de `contact.*`; no se duplican en `footer.*`. `hero.title` y `hero.subtitle` se sustituyen por `hero.name` y `hero.role`; los e2e que usaban el texto provisional se actualizan (ver 6.4).

### 2.4 Tokens nuevos en `globals.css`

| Token | Valor de partida | Uso | RF |
|---|---|---|---|
| `--nav-height` | `calc(var(--spacing) * 16)` | Altura de la barra y `scroll-padding` mínimo. | RF-3, RF-13 |
| `--nav-hide-threshold` | `calc(var(--spacing) * 20)` (80 px) | Umbral de ocultación. | RF-3 |
| `--nav-z` | `10` | Barra y panel por encima del contenido. | RF-3, RF-4 |
| `--grid-gutter` | `calc(var(--spacing) * 6)` (24 px); `calc(var(--spacing) * 12)` (48 px) desde 768 px | Margen lateral de la retícula. | RF-8 |
| `--grid-max-width` | `100rem` (1600 px) | Tope de contenido a partir de 1920 px. | RF-8 |
| `--text-hero-name` | `clamp(3rem, calc(0.9 * (100vw - 2 * var(--grid-gutter)) / 4.8), 18.75rem)` | Tamaño del nombre. | RF-8 |
| `--hero-name-fill` | `90%` | Ancho mínimo del nombre en 360/768/1440. | RF-8 |
| `--hero-name-advance` | `0.6` | Avance de Geist Mono por carácter (a verificar). | RF-8 |
| `--cursor-width` | `0.5ch` | Cursor y reserva de espacio. | RF-9 |
| `--cursor-duration` | `1s` | Ciclo del cursor. | RF-9 |
| `--hero-line-duration` | `400ms` | Duración de cada línea. | RF-9 |
| `--hero-line-stagger` | `100ms` | Desfase entre líneas (total 600 ms). | RF-9 |
| `--hero-parallax-distance` | `20dvh` | Desplazamiento máximo del nombre. | RF-10 |
| `--touch-target` | `calc(var(--spacing) * 6)` (24 px) | Área de contacto mínima. | RF-6 |

Los valores exactos pueden ajustarse si los tests de 6.2 y 6.3 siguen en verde; los umbrales (90 %, 80 px, 600 ms, 1 s, 20 %, 24 px) son contrato.

**Cobertura RF:** RF-1, RF-2, RF-3, RF-4, RF-6, RF-7, RF-8, RF-9, RF-10, RF-11, RF-13, RF-14.

---

## 3. Algoritmos clave (pseudocódigo)

### 3.1 Visibilidad de la barra (RF-3)

Entrada: posición de scroll actual y previa, estado del menú y del foco, preferencias y capacidades. Salida: `visible` o `hidden`.

```text
FUNCTION resolveNavbarVisibility(input):
    IF input.menuOpen == true:
        RETURN "visible"                  // RF-4: el menú abierto mantiene la barra

    IF input.focusWithin == true:
        RETURN "visible"                  // RF-3: el foco revela de inmediato

    IF input.reducedMotion == true:
        RETURN "visible"                  // RF-3 y NFR de movimiento

    IF input.supportsScrollTimeline == false:
        RETURN "visible"                  // NFR: sin animación ligada al scroll, barra visible

    IF input.scrollY <= NAV_HIDE_THRESHOLD:
        RETURN "visible"                  // arriba se muestra siempre

    IF input.scrollY < input.previousScrollY:
        RETURN "visible"                  // subir la revela

    IF input.scrollY > input.previousScrollY:
        RETURN "hidden"                   // bajar la oculta

    RETURN "visible"                      // sin cambio de dirección, no se altera
```

Notas de implementación:

- El umbral se evalúa sobre `scrollY`, no sobre el delta: «más de 80 px hacia abajo» significa `scrollY > 80`.
- Los deltas menores de 2 px se ignoran para evitar parpadeos por rebote.
- La primera lectura tras la carga no oculta la barra: el estado inicial es visible hasta el primer evento de scroll.
- Al final de la página no hay regla especial: si se llegó bajando, sigue oculta; subir o enfocar la revela.
- El foco se sigue con `focusin`/`focusout` en el `header`; al salir el foco, se recalcula.
- `supportsScrollTimeline` se consulta una vez con `CSS.supports("animation-timeline: view()")`.

**Cobertura RF:** RF-3, RF-4, RF-12.

### 3.2 Menú móvil (RF-4)

Se usa `<details>` nativo como disclosure: funciona sin JS, con teclado y sin trampa de foco. El control es `summary`, solo icono, con dos textos `sr-only` que cambian según `[open]`.

```text
RENDER:
    <details class="menu">
        <summary>                        // el nombre accesible sale de los spans
            <span class="when-closed">Abrir menú</span>
            <span class="when-open">Cerrar menú</span>
            <icon-closed /><icon-open />
        </summary>
        <div class="panel">
            <NavLinks items onNavigate=closeMenu />
        </div>
    </details>

ON details.toggle:
    menuOpen = details.open
    IF details.open:
        visibility = "visible"

ON link activate (solo con JS):
    details.open = false

ON breakpoint change to >= 768px:
    details.open = false

CSS:
    .when-open { display: none }
    details[open] .when-closed { display: none }
    details[open] .when-open { display: inline }
    .panel { position: absolute; max-height: calc(100dvh - var(--nav-height)); overflow-y: auto; overscroll-behavior: contain }
```

Sin JS no se ejecutan `toggle` ni el cierre al navegar: el menú queda abierto hasta que el usuario lo cierre con el control, tal como decide la spec. El panel no bloquea el scroll de la página y su scroll interno no lo cierra.

**Cobertura RF:** RF-4, RF-12.

### 3.3 Enlaces de sección dentro y fuera de la home (RF-1, RF-13, RF-14)

```text
FUNCTION sectionHref(locale, sectionId, pathname):
    IF pathname == "/" + locale OR pathname == "/" + locale + "/":
        RETURN "#" + sectionId          // misma página, sin recarga
    RETURN "/" + locale + "#" + sectionId   // desde la 404, vuelve a la home
```

En la 404 no existen los destinos: los cuatro enlaces llevan a la home del idioma con el ancla. En la home, el ancla conserva el scroll nativo y el foco lo gestiona 3.4.

**Cobertura RF:** RF-1, RF-13, RF-14.

### 3.4 Foco al llegar por ancla (RF-13)

```text
FUNCTION resolveAnchorTarget(hash, sectionIds):
    raw = hash.replace(/^#/, "")
    IF raw == "":
        RETURN { targetId: null, reason: "empty" }
    IF sectionIds does not contain raw:
        RETURN { targetId: null, reason: "unknown" }
    RETURN { targetId: raw, reason: "valid" }

ON mount AND ON hashchange:
    result = resolveAnchorTarget(location.hash, sectionIds)
    IF result.targetId == null:
        RETURN                           // no navega, no rompe

    section = document.getElementById(result.targetId)
    heading = section.querySelector("[data-section-heading]")
    IF heading == null:
        RETURN

    heading.focus({ preventScroll: true })
```

El desplazamiento lo hace el navegador con `scroll-padding-top: var(--anchor-offset)`, cuyo token se adapta al viewport y mantiene el destino por debajo de la barra y dentro de la banda estable del revelado. Con movimiento permitido, `scroll-behavior: smooth` se aplica en CSS; con `prefers-reduced-motion: reduce`, se usa `auto`. `AnchorFocus` enfoca con `preventScroll: true` y no causa un segundo salto.

El cambio de idioma usa `router.replace(..., {scroll: false})`, sin fragmento durante la navegación. Conserva query, hash y la posición visible; aplica el hash después del cambio sin solicitar otro scroll. En recarga se mantiene la restauración nativa exacta (`overflow-anchor: none` evita que el anclaje del documento la desplace).

**Cobertura RF:** RF-2, RF-13.

### 3.5 Tamaño y ancho del nombre (RF-8)

```text
FUNCTION heroNameMetrics(viewportWidth, gutter, options):
    contentWidth = MIN(viewportWidth - 2 * gutter, GRID_MAX_WIDTH)
    preferred = FILL_RATIO * contentWidth / (longestWordChars * advanceRatio)
    fontSize = CLAMP(minFontSize, preferred, maxFontSize)
    blockWidth = longestWordChars * advanceRatio * fontSize
    ratio = blockWidth / contentWidth
    RETURN { fontSize, blockWidth, ratio, contentWidth }
```

La misma fórmula base se expresa en CSS con `clamp()` y `calc()`; la función pura existe para verificarla sin depender de un motor de layout. La composición aplica `--hero-name-scale` (0.96) y `--hero-name-letter-spacing` (0.032) para reducir la altura óptica y conservar un ancho medido ≥90 % también en Chromium Linux. El cursor se pinta fuera del flujo y no suma al ancho de la línea más larga.

Casos de la tabla de tests (gutter 24 px hasta 767 y 48 px desde 768):

| Viewport | Contenido | Tamaño | Ancho de línea | Ratio | Resultado |
|---|---|---|---|---|---|
| 320 | 272 | 51 px | 244,8 px | 90 % | Permitido; si el mínimo lo reduce, sigue sin scroll horizontal |
| 360 | 312 | 58,5 px | 280,8 px | 90 % | Cumple |
| 768 | 672 | 126 px | 604,8 px | 90 % | Cumple |
| 1440 | 1344 | 252 px | 1209,6 px | 90 % | Cumple |
| 1920 | 1600 | 300 px | 1440 px | 90 % de la retícula | Tope de retícula |
| 2560 | 1600 | 300 px | 1440 px | 90 % de la retícula | No crece más |

**Cobertura RF:** RF-8.

### 3.6 Entrada, cursor, contorno y parallax (RF-9, RF-10)

No hay JS. Todo es CSS con `animation-timeline` y `prefers-reduced-motion`.

```text
ENTRADA (al cargar):
    cada línea: opacity 0 → 1, translateY(100%) → 0
    duración: 400 ms; desfases: 0, 100, 200 ms; total 600 ms
    animation-fill-mode: both
    no se repite al hacer scroll

CURSOR:
    ciclo 1 s; 0–49 % visible, 50–100 % oculto
    visible en relleno y en contorno
    aria-hidden="true"

CONTORNO Y PARALLAX:
    el hero define view-timeline-name: --hero
    rango: exit 0% → exit 100%
    color de relleno: ink hasta 80% de exit; ink → transparent en 80–100%
    trazo: ink fijo (no currentColor)
    translateY: 0 → var(--hero-parallax-distance)

FALLBACK:
    @supports not (animation-timeline: view()):
        nombre sólido, sin transform, sin animación
    @media (prefers-reduced-motion: reduce):
        nombre sólido, sin entrada, cursor estático visible, sin parallax
    @media print:
        nombre sólido, sin animación, sin barra ni pie
    @media (forced-colors: active):
        relleno CanvasText, trazo CanvasText
```

El contorno se completa cuando el hero termina de salir (`exit 100%`), no cuando el nombre sale por su cuenta. El relleno permanece sólido hasta el último tramo para evitar estados intermedios rasterizados que se perciben como fragmentos. El parallax usa como máximo `20dvh`, que es ≤ 20 % de la altura del hero porque el hero mide al menos `100dvh`; el hueco entre el nombre y el rol reserva esa distancia para que no se solapen.

**Cobertura RF:** RF-9, RF-10.

### 3.7 Tema e idioma en la barra (RF-6)

```text
ON mount (ThemeControl):
    theme = currentTheme(document.documentElement, systemPrefersDark())
    mounted = true

ON toggle:
    next = theme == "dark" ? "light" : "dark"
    setTheme(next)                    // lib/theme-dom: persistencia + View Transition
    theme = next

ON system preference change AND no stored choice:
    theme = systemPrefersDark() ? "dark" : "light"

RENDER:
    IF NOT mounted:
        <span aria-hidden class="reserve" />   // sin botón: sin JS no aparece
    ELSE:
        <ThemeToggle pressed={theme == "dark"} ariaLabel={label} onToggle={toggle} />
```

`LanguageSwitch` se reutiliza tal cual: ya conserva path, search y hash con JS, y en la 404 mantiene la ruta traducida. El control de tema no se renderiza en el servidor, de modo que sin JS no hay un botón inerte.

**Cobertura RF:** RF-6.

---

## 4. Contratos de interfaz

### 4.1 `Navbar`

- **Entradas:** `locale: Locale`; `sections: SectionDestination[]`; `labels` con `identity`, `navLabel`, `openMenu`, `closeMenu`, `themeToggle`, `switchToEnglish`, `switchToSpanish`.
- **Salidas:** `<header>` pegajoso con identidad (Logo), `NavLinks` de escritorio, `<details>` móvil con `NavLinks`, `ThemeControl` y `LanguageSwitch`; estados `data-hidden` y `data-menu-open`; atributos de foco.
- **Errores:** si falta una etiqueta de sección, se omite ese enlace y el resto se renderiza; si falta la identidad, se omite el Logo; nunca lanza.

### 4.2 `Footer`

- **Entradas:** `locale: Locale`; `site: SiteData`; `labels` con `copyright`, `github`, `linkedin`, `email`, `cv`, `newTab`.
- **Salidas:** `<footer>` con cuatro enlaces y copyright; GitHub, LinkedIn y CV con `target="_blank"`, `rel="noreferrer noopener"` y texto `sr-only`; email con `mailto:`; sin controles de tema ni idioma.
- **Errores:** si falta una URL, se omite ese enlace; si falta el copyright, se omite; el resto se renderiza.

### 4.3 `Hero`

- **Entradas:** `content` con `name`, `role`, `pitch`, `support`, `meta`, `ctaPrimary`, `ctaSecondary`; `primaryHref` (`#work`); `secondaryHref` (`#contact`).
- **Salidas:** `<section aria-labelledby="hero-name">`; `<h1 id="hero-name" aria-label={name}>` con tres líneas `aria-hidden` y cursor `aria-hidden`; rol, pitch, apoyo y metadatos envueltos en `Reveal variant="rise"`; CTAs en `RevealGroup variant="rise"`; metadatos como texto plano.
- **Errores:** si falta el nombre, no se renderiza el h1 pero sí el resto; si falta un CTA, se omite ese enlace; no lanza.

### 4.4 `SectionHeading`

- **Entradas:** `id: string`; `index: string`; `label: string`; `level?: 2` (por defecto 2).
- **Salidas:** `<h2 id data-section-heading tabIndex={-1}>` con `<span aria-hidden>{index} /</span> {label}`; el nombre accesible es solo `label`.
- **Errores:** si falta `label`, devuelve `null`; si falta `id`, no se puede enlazar y devuelve `null`.

### 4.5 `SkipLink`

- **Entradas:** `label: string`; `href?: "#main"`.
- **Salidas:** `<a>` como primer elemento enfocable; visualmente oculto hasta `:focus-visible`; al activarlo, el foco va a `#main`.
- **Errores:** si falta `label`, devuelve `null`.

### 4.6 `NavLinks`

- **Entradas:** `items: NavItem[]`; `ariaLabel: string`; `onNavigate?: () => void`.
- **Salidas:** `<ul>` de enlaces; un solo conjunto visible según el ancho; `onNavigate` se dispara al activar un enlace (solo con JS).
- **Errores:** si `items` está vacío, devuelve `null`; los elementos sin `href` o `label` se omiten.

### 4.7 `ThemeControl`

- **Entradas:** `label: string`.
- **Salidas:** `ThemeToggle` con `aria-pressed` y etiqueta; reserva de espacio antes de montar; sin botón en el HTML del servidor.
- **Errores:** si falta `label`, no renderiza el botón; si `setTheme` falla, no muestra error y mantiene el tema actual.

### 4.8 `AnchorFocus`

- **Entradas:** `sectionIds: SectionId[]`.
- **Salidas:** ningún marcado visible; al montar y en `hashchange`, mueve el foco al encabezado del destino válido.
- **Errores:** hash vacío, desconocido o sin encabezado: no hace nada, no lanza.

### 4.9 `lib/nav-visibility`

- **Entradas:** `NavbarVisibilityInput`.
- **Salidas:** `"visible" | "hidden"`.
- **Errores:** valores negativos o no finitos se normalizan a 0; nunca lanza.

### 4.10 `lib/hero-name`

- **Entradas:** `viewportWidth`, `gutter`, `longestWordChars`, `advanceRatio`, `minFontSize`, `maxFontSize`, `fillRatio`.
- **Salidas:** `HeroNameMetrics`.
- **Errores:** si `contentWidth <= 0` o `longestWordChars <= 0`, devuelve el mínimo y ratio 0; nunca lanza.

### 4.11 `lib/anchor-target`

- **Entradas:** `hash: string`; `sectionIds: string[]`.
- **Salidas:** `AnchorResolution`.
- **Errores:** hash con caracteres inválidos o sección inexistente: `{ targetId: null, reason: "unknown" }`; nunca lanza.

### 4.12 `Link` extendido

- **Entradas:** las de la 04 más `srLabel?: string`.
- **Salidas:** `<a>` nativo; con `target="_blank"` añade `rel="noreferrer noopener"` y un `span` `sr-only` con `srLabel`; conserva el resto del contrato.
- **Errores:** `href` vacío no navega; sin `children` o `href`, `null`.

**Cobertura RF:** RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-11, RF-12, RF-13, RF-14.

---

## 5. Decisiones técnicas justificadas

| # | Decisión | Justificación | Alternativa descartada | RF |
|---|---|---|---|---|
| 5.1 | **Navbar cliente** que recibe etiquetas ya traducidas por props. | Necesita `usePathname`, scroll, foco y tema; mantiene el render estático y evita enviar todo `messages/` al cliente. | Navbar servidor con islas cliente separadas para cada control: más piezas y más complejidad sin beneficio. | RF-1, RF-3, RF-4, RF-6 |
| 5.2 | **`<details>` nativo** para el menú móvil. | Abre y cierra con teclado y sin JS; el estado expandido lo anuncia el navegador; no atrapa el foco. | Botón con estado React: no funciona sin JS y obliga a simular `aria-expanded`. | RF-4, RF-12 |
| 5.3 | **`NavLinks` renderizado dos veces** (escritorio y panel móvil), con `display:none` en el conjunto inactivo. | Garantiza un único conjunto visible y tabulable, y evita depender de `::details-content` para mostrar los enlaces en escritorio. | Un solo `<details>` con los enlaces forzados visibles en escritorio: depende de CSS experimental y rompe en navegadores sin soporte. | RF-4, RF-12 |
| 5.4 | **Ocultar la barra con `transform: translateY(-100%)`** sobre `position: sticky`. | No cambia el flujo, no hay saltos de layout y la opacidad sigue siendo 1; el foco la revela sin transición. | `display:none`, `visibility:hidden` o `opacity:0`: rompen el orden de tabulación, el árbol de accesibilidad o la regla de no atenuar. | RF-3, RF-12 |
| 5.5 | **Lógica de visibilidad en `lib/`**, con un hook fino en Navbar. | Permite tests de tabla con los límites (80/81 px, dirección, menú, foco) sin depender de scroll real. | Probar solo en e2e: lento y con falsos negativos por timing. | RF-3 |
| 5.6 | **Nombre con token propio `--text-hero-name`** calculado por fórmula, no con `--text-display`. | El máximo de display (176 px) no alcanza el 90 % a 1440 px; el token propio cumple RF-8 sin arrastrar otros titulares. | Reutilizar `--text-display`: incumple el 90 % o cambia el tamaño de Contact. | RF-8 |
| 5.7 | **Entrada, cursor, contorno y parallax solo con CSS** (`animation-timeline`, `@supports`, `prefers-reduced-motion`). | Respeta «solo CSS», no añade JS y el contenido se ve sin animación. | `IntersectionObserver` o `requestAnimationFrame`: añade JS y duplica el sistema de la 05. | RF-9, RF-10 |
| 5.8 | **Contorno por `color` a transparente con trazo fijo**, no por dos capas de texto. | Una sola copia del nombre evita duplicar el h1 y mantiene el nombre accesible una vez. | Dos capas (rellena + contorno) con opacidad cruzada: duplica texto y complica la accesibilidad y el copiado. | RF-9, RF-10 |
| 5.9 | **Parallax con `exit 0% → exit 100%` y `20dvh`**, reservando el hueco con el rol. | El contorno se completa al salir el hero, no al cargar; el nombre no se solapa con el resto del hero. | `cover` desde 0 %: el nombre ya estaría medio contorneado al cargar. | RF-10 |
| 5.10 | **`ThemeControl` renderiza el botón solo tras montar.** | Sin JS no aparece un control inerte y no se añade un segundo script en `<head>` (el e2e de tema exige uno solo). | Marcar `data-js` con un script extra: rompe el e2e de tema y toca la capa de tema de la 03. | RF-6 |
| 5.11 | **Enlaces de sección calculados con `usePathname`**: `#id` en la home, `/{locale}#id` fuera. | La 404 conserva la shell y sus enlaces llevan a la home + ancla; el HTML del servidor ya sale correcto. | Enlaces siempre `#id`: en la 404 no existen y no navegan. | RF-1, RF-13, RF-14 |
| 5.12 | **Foco al encabezado con `tabIndex={-1}` y `focus({preventScroll:true})`.** | El destino queda como punto de partida de la tabulación sin un segundo scroll ni un anillo visible en un elemento no interactivo. | Enfocar la `<section>`: el nombre accesible es más pobre y el foco no cae en el encabezado. | RF-13 |
| 5.13 | **`Link` nativo para pestaña nueva** (`target` + `rel` + `srLabel`). | Evita bloqueadores de ventanas emergentes, permite clic central y anuncia el contexto; el contrato de la 04 no cambia. | Mantener `window.open`: peor comportamiento y sin anuncio accesible. | RF-11 |
| 5.14 | **Datos del pie en `src/content/site.ts` y textos en `messages/`.** | Cumple «sin textos ni datos en la UI» y permite cambiar URLs o CV sin tocar componentes. | URLs y email dentro del Footer: viola la regla 5 y duplica datos con Contact. | RF-11 |
| 5.15 | **Un único `AnchorFocus` en el layout**, no un efecto por sección. | Centraliza la gestión del foco, cubre la carga inicial y el cambio de hash, y no añade JS a cada sección. | Un `useEffect` en cada `Section`: repite lógica y complica las secciones 07–10. | RF-13 |
| 5.16 | **Destinos reservados con `Section` + `SectionHeading` en `page.tsx`.** | Las specs 07–10 sustituyen el cuerpo sin tocar la navegación ni los ids; el encabezado ya es h2 y enfocable. | Crear un componente `Placeholder` temporal: se borraría en la siguiente spec y añade una pieza sin reutilización. | RF-2, RF-13 |

**Cobertura RF:** RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-11, RF-12, RF-13, RF-14.

---

## 6. Estrategia de tests

Los tests se escriben antes que el código (regla 8). Se verifica comportamiento visible: contenido, roles, nombres accesibles, foco, estado expandido, navegación y estilos computados cuando el requisito es visual (opacidad, transform, color). Nunca snapshots, clases de Tailwind ni estructura interna.

### 6.1 Lógica pura (`src/lib/*.test.ts`)

| Archivo | Casos | RF |
|---|---|---|
| `nav-visibility.test.ts` | Tabla: arriba (0/80/81), bajando, subiendo, sin cambio, menú abierto, foco dentro, reduced motion, sin soporte de timeline, valores negativos/NaN. Límite exacto 80/81. | RF-3 |
| `hero-name.test.ts` | Tabla 320/360/768/1440/1920/2560; ratio ≥ 0,9 en 360/768/1440; 320 sin scroll; tope de retícula; contentWidth 0; palabra de 1 carácter; mínimo y máximo. | RF-8 |
| `anchor-target.test.ts` | Hash vacío, `#`, `#about`, `#unknown`, `#about?x`, mayúsculas, ids repetidos; sección válida sin encabezado. | RF-13 |

### 6.2 Componentes (`Vitest + RTL`, mensajes reales)

| Componente | Qué se testa | RF |
|---|---|---|
| `Navbar` | Identidad con nombre accesible; cuatro enlaces en orden; un solo conjunto visible por ancho simulado; `details` con «Abrir menú»/«Cerrar menú»; enlaces dentro y fuera de la home; foco en la barra oculta la revela; tema e idioma presentes; `data-hidden` según scroll simulado. | RF-1, RF-3, RF-4, RF-6, RF-12, RF-14 |
| `Footer` | GitHub, LinkedIn, email y CV; `target="_blank"` + texto `sr-only`; `mailto:`; CV del idioma; copyright; sin controles de tema/idioma; falta una URL y el resto sigue. | RF-11, RF-14 |
| `Hero` | h1 con nombre completo como una sola cadena; tres líneas; cursor `aria-hidden`; rol, pitch, apoyo y metadatos visibles; CTAs a `#work` y `#contact`; `Reveal` en el contenido secundario y no en el nombre; sin nombre, el resto sigue. | RF-7, RF-8, RF-9, RF-10 |
| `SectionHeading` | h2 con nombre «About» y no «01 / About»; número `aria-hidden`; `tabIndex=-1`; `data-section-heading`; sin label → `null`. | RF-2, RF-13 |
| `SkipLink` | Primer enfocable; oculto sin foco; visible con foco; `href="#main"`; etiqueta traducida. | RF-5, RF-12 |
| `NavLinks` | Lista y orden; `onNavigate` al activar; item sin href omitido; lista vacía → `null`. | RF-1, RF-4 |
| `ThemeControl` | Sin montar no hay botón; al montar muestra `ThemeToggle`; `aria-pressed`; alterna y persiste; fallo de `setTheme` no rompe. | RF-6 |
| `AnchorFocus` | Hash válido enfoca el encabezado; hash vacío/desconocido no hace nada; `hashchange` vuelve a enfocar; no lanza. | RF-13 |
| `Section` (extensión) | `id` y `aria-labelledby`; retícula intacta; sin children → `null`. | RF-2 |
| `Link` (extensión) | `srLabel` visible solo para lectores; `target="_blank"` nativo con `rel`; href vacío no navega. | RF-11 |
| `Logo` (extensión) | `onClick` se dispara; href y nombre accesible intactos. | RF-1 |

### 6.3 e2e (Playwright, Chromium)

| Archivo | Flujo | RF |
|---|---|---|
| `e2e/navbar.spec.ts` | `/en` y `/es`, claro y oscuro: skip link; orden de tabulación; marca `logo.svg`; cuatro anclas; barra visible durante navegación y oculta solo por scroll posterior del usuario; menú a 360 px; 404; locale conserva hash y posición; recarga restaura posición; scroll suave solo sin `reduce`. | RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-12, RF-13, RF-14 |
| `e2e/hero.spec.ts` (nuevo) | Nombre como h1 único; entrada ≤ 600 ms; cursor con ciclo 1 s; contorno y parallax reversibles, sin salir del hero; reduced motion sólido y estático; no-JS visible; sin scroll horizontal en 320–1920; nombre ≥ 90 % en 360/768/1440; impresión sin barra/pie y nombre sólido; colores forzados. | RF-7, RF-8, RF-9, RF-10 |
| `e2e/theme.spec.ts` | El control de tema cambia claro/oscuro, persiste y anuncia; sin JS no aparece; no se añade un segundo script en `<head>`. | RF-6 |
| `e2e/shell.spec.ts` | El favicon generado usa la marca blanca del sitio. | RF-1 |
| `e2e/i18n-routing.spec.ts` (actualizar) | Sustituir «Web portfolio»/«Portfolio web» por el rol traducido; mantener idioma, hash, query, 404 y cambio de idioma. | RF-6, RF-14 |
| `e2e/home.spec.ts` | Se mantiene el smoke sin `pageerror`. | RF-14 |
| `e2e/scroll-motion.spec.ts` | Se mantiene; añadir si falta que la barra no participa del revelado y que el hero no tapa el destino. | RF-3, RF-10 |

Los e2e de navegación e idioma se ejecutan con `prefers-reduced-motion: reduce`, como exige la constitución.

### 6.4 Tests existentes que cambian

- `e2e/i18n-routing.spec.ts`: las 16 apariciones de «Web portfolio»/«Portfolio web» pasan a «Full-stack developer»/«Desarrollador full-stack» (o al nombre, que es igual en ambos idiomas y no sirve como marcador).
- `src/components/ui/Link/Link.test.tsx`: el caso `target="_blank"` deja de esperar `window.open` y pasa a comprobar `target`, `rel` y `srLabel`.
- `src/components/ui/Section/Section.test.tsx`: añadir `id` y `aria-labelledby`.
- `src/components/ui/Logo/Logo.test.tsx`: añadir `onClick`.
- `src/app/[locale]/page.tsx` deja de renderizar `hero.title`/`hero.subtitle`; los tests que los usaban se actualizan.

### 6.5 Cobertura y gates

- Umbral global ≥ 85 % en líneas, funciones, ramas y sentencias (requisito vigente). Los módulos nuevos se testean por comportamiento; las ramas de `prefers-reduced-motion`, `supportsScrollTimeline`, menú abierto/cerrado, foco dentro/fuera, tema montado/sin montar y hash válido/desconocido tienen caso propio.
- `src/app/` sigue excluido (cubierto por e2e); `src/content/` excluido; `src/lib/` y `src/components/` medidos.
- Gates: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` y `pnpm test:e2e` (la spec toca idioma, tema, navegación y movimiento).
- Se ejecutan en el orden de la regla 10 y antes de un PR.

**Cobertura RF:** RF-1 a RF-14.

---

## 7. Trazabilidad RF → partes del plan

| RF | Módulos | Modelo | Algoritmos | Contratos | Decisiones | Tests |
|---|---|---|---|---|---|---|
| RF-1 Barra | `Navbar`, `NavLinks`, `Logo`, `content/sections` | `NavItem`, `SectionDestination` | 3.3 | 4.1, 4.6 | 5.1, 5.3, 5.11 | 6.2, 6.3 |
| RF-2 Destinos | `Section`, `SectionHeading`, `page.tsx` | `SectionDestination` | 3.4 | 4.4 | 5.12, 5.16 | 6.2, 6.3 |
| RF-3 Barra pegajosa | `Navbar`, `lib/nav-visibility`, `globals.css` | `NavbarVisibilityInput` | 3.1 | 4.1, 4.9 | 5.1, 5.4, 5.5 | 6.1, 6.2, 6.3 |
| RF-4 Menú | `Navbar`, `NavLinks` | `NavItem` | 3.2 | 4.1, 4.6 | 5.2, 5.3 | 6.2, 6.3 |
| RF-5 Salto | `SkipLink`, `layout.tsx` | — | — | 4.5 | — | 6.2, 6.3 |
| RF-6 Tema e idioma | `ThemeControl`, `LanguageSwitch` | `Theme` | 3.7 | 4.7 | 5.1, 5.10 | 6.2, 6.3 |
| RF-7 Hero | `Hero`, `Reveal`, `RevealGroup` | `HeroContent` | 3.6 | 4.3 | 5.7 | 6.2, 6.3 |
| RF-8 Nombre | `Hero`, `lib/hero-name`, `globals.css` | `HeroNameMetrics` | 3.5 | 4.3, 4.10 | 5.6 | 6.1, 6.2, 6.3 |
| RF-9 Entrada y cursor | `Hero.module.css` | — | 3.6 | 4.3 | 5.7, 5.8 | 6.2, 6.3 |
| RF-10 Contorno y parallax | `Hero.module.css`, `globals.css` | — | 3.6 | 4.3 | 5.7, 5.8, 5.9 | 6.2, 6.3 |
| RF-11 Pie | `Footer`, `Link`, `content/site` | `SiteData` | — | 4.2, 4.12 | 5.13, 5.14 | 6.2, 6.3 |
| RF-12 Teclado | `Navbar`, `Footer`, `Hero`, `SkipLink`, `SectionHeading` | — | 3.1, 3.4 | 4.1–4.8 | 5.4, 5.12 | 6.2, 6.3 |
| RF-13 Llegada a sección | `AnchorFocus`, `Section`, `SectionHeading`, `Navbar` | `AnchorResolution` | 3.3, 3.4 | 4.8, 4.11 | 5.11, 5.12, 5.15 | 6.1, 6.2, 6.3 |
| RF-14 Shell en rutas | `layout.tsx`, `not-found.tsx`, `Navbar`, `Footer` | `Locale` | 3.3 | 4.1, 4.2 | 5.1, 5.11 | 6.3 |

Todos los RF tienen al menos un módulo, un contrato y un test asociados. No queda RF sin cobertura.

---

## 8. Cumplimiento de la constitución

| Regla | Cómo la cumple el plan |
|---|---|
| 1. Stack cerrado | No se añaden dependencias. Se usa Iconoir para el icono del menú, Next/React/TS/Tailwind y Vitest/RTL/Playwright. |
| 2. Spec antes que código | El plan deriva de la spec 06; las enmiendas a la 05, 03 y README se aplican antes o en el mismo cambio. |
| 3. Atomizados | Una carpeta por componente, props tipadas, ≤ 100 líneas. Navbar se descompone en `NavLinks` y `ThemeControl`; Hero se apoya en `Reveal`/`RevealGroup`. |
| 4. Sin repetición | `NavLinks` se reutiliza en escritorio y móvil; `SectionHeading` cubre los cuatro destinos; valores en tokens, no en componentes. |
| 5. Sin textos ni datos en la UI | `ui/` y `sections/` reciben todo por props; datos en `src/content/`; textos en `messages/`. |
| 6. i18n completo | Todas las claves nuevas van en `en.json` y `es.json` en el mismo cambio; el test de paridad existente las cubre. |
| 7. Estructura estable | No hay carpetas nuevas en la raíz ni en `src/`; se usan `components/ui/`, `components/sections/`, `components/Navbar/`, `components/Footer/`, `src/content/`, `src/lib/`. Sin barrel files. |
| 8. Tests de calidad | Tests por comportamiento y estilos computados; e2e solo para los flujos críticos (navegación, tema, idioma, movimiento). |
| 9. Cobertura ≥ 85 % | Tabla de tests por módulo y ramas; umbral intacto; sin exclusiones nuevas. |
| 10. Definición de terminado | Gates completos, incluido `pnpm test:e2e` por tocar idioma, tema, navegación y movimiento. |
| 11. Inglés en el código | Nombres de archivos, tipos, funciones y tokens en inglés; documentos y textos en español/inglés según corresponda. |
| 12. Minimalismo espectacular | El nombre a todo el ancho, el cursor, el contorno y el parallax son el momento firma; sin color de acento ni decoración añadida. La barra y el pie son discretos. |
| 13. Voz de marca | Los textos salen del brief; no se inventan cifras ni datos. «3+ years» procede del brief. |
| 14. No negociables | AA en ambos temas y en el contorno; teclado sin trampas; contenido visible sin JS y sin animación; reduced motion; impresión; colores forzados. |

---

## 9. Riesgos y dependencias

1. **Infraestructura i18n ausente (bloqueante si se exige `next-intl`).** El plan usa el acceso directo a `messages/` ya existente. Si se quiere `useTranslations`/`renderWithIntl`, hay que completar la spec 02 antes de ejecutar la 06.
2. **Conflicto de tamaño con la spec 03.** El 90 % a 1440 px exige ~252 px de nombre; el máximo actual de display es 176 px. Se añade `--text-hero-name` y se actualiza la tabla de la 03 (decisión b). Sin esa actualización, RF-8 y la 03 se contradicen.
3. **Avance de Geist Mono.** La fórmula usa 0,6 em por carácter. Si la métrica real difiere, el test de `hero-name` y el e2e de ancho lo detectan; el valor se ajusta en el token, no en el componente.
4. **Doble conjunto de enlaces.** Escritorio y móvil comparten `NavLinks` pero se renderizan dos veces; el e2e debe comprobar que solo uno es visible y tabulable. Es el precio de no depender de `::details-content`.
5. **`<details>` en resize.** Al pasar a escritorio, el panel se oculta por CSS; con JS se cierra además el `details`. Sin JS, al volver a móvil puede reaparecer abierto; se documenta como limitación aceptada.
6. **Textos provisionales en e2e.** `i18n-routing.spec.ts` usa «Web portfolio»/«Portfolio web»; hay que actualizarlo en el mismo cambio o fallará.
7. **`Reveal` es JS en el árbol actual.** La 05 lo describe como CSS, pero la implementación usa un listener de scroll. El hero no depende de `Reveal` para su efecto; sus efectos son CSS puros. No se reabre la 05 por esto.
8. **Scroll padding de 30vh.** Ya existe para el revelado; la barra mide bastante menos, así que el encabezado queda visible. Si se reduce el padding, RF-13 y RF-12 de la 05 pueden chocar.
9. **Impresión y colores forzados.** El contorno con relleno transparente puede desaparecer en `forced-colors`; el plan incluye el fallback y un e2e de impresión.

---

## 10. Orden de ejecución sugerido

1. Tokens y mensajes (ambos idiomas) + test de paridad.
2. `lib/nav-visibility`, `lib/hero-name`, `lib/anchor-target` con tests de tabla.
3. Extensiones de `Section`, `Link` y `Logo` con tests.
4. `SectionHeading`, `SkipLink`, `NavLinks`, `ThemeControl`, `AnchorFocus`.
5. `Navbar` + CSS + tests.
6. `Footer` + tests.
7. `Hero` + CSS + tests.
8. `layout.tsx`, `page.tsx`, `not-found.tsx`.
9. Enmienda de la 05, corrección del README y actualización de e2e existentes.
10. Gates completos y e2e nuevos.
