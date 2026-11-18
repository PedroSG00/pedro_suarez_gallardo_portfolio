# Plan — 03 Tema y tokens

Este plan traduce `docs/specs/03-theme-and-tokens/spec.md` en módulos, datos, algoritmos, contratos y tests. No escribe código de producto: fija las piezas, sus límites y la evidencia que las respalda. Respeta `docs/constitution.md` y `AGENTS.md`.

## 0. Re-baseline, alcance y bloqueos

### 0.1 Estado real comprobado

Rama `03`, base `main` en `59c4195` (`Merge pull request #14 from PedroSG00/dev`). El plan es el único archivo sin seguimiento. Evidencia que condiciona el diseño:

- `src/styles/globals.css` contiene solo `@import "tailwindcss";`. No hay tokens todavía.
- `src/app/layout.tsx` y `src/app/[locale]/layout.tsx` renderizan **los dos** `<html>` y `<body>`; el segundo conoce el locale. Es HTML inválido y deja dos candidatos para montar `data-theme`, la fuente y el script.
- `pnpm build` sirve `○ /`, `○ /_not-found`, `ƒ /[locale]` y `ƒ /[locale]/[...slug]`. La home real no es estática: falta convertir `[locale]` en root param y prerenderizar los dos idiomas.
- `src/app/page.tsx` (placeholder raíz) usa `bg-zinc-50`, `dark:bg-black` y `font-sans`. Al vaciar la paleta y la familia por defecto, esas clases dejan de existir; hay que retirarlas en el mismo cambio.
- No existe `src/i18n/`; el locale se resuelve en `src/proxy.ts` y en los layouts. La 03 no toca i18n.
- `next/font/google` descarga las fuentes **en build time** y las autoaloja; el navegador no hace peticiones a Google. `Geist_Mono` está disponible en los tipos instalados, con `subsets: ["latin"]`, y es una **fuente variable** (eje de peso): la documentación de `next/font` reserva el array de pesos para fuentes no variables, así que se carga sin `weight` o con `"variable"`. El paquete `geist` no está instalado. `pnpm build` ya compiló con estas importaciones, así que el entorno actual tiene red; CI no lo garantiza.
- `vitest.config.mts` mide `src/lib/**` con umbral 95 % y excluye `src/app/**`, `src/proxy.ts`, `src/test/**`, `src/content/**` y los tests. No hacen falta exclusiones nuevas.
- `playwright.config.ts` usa `e2e/`, Chromium y `pnpm start -p 3000`.
- `README.md` dice «Cream and black palette». No es una divergencia: crudo es cream. El riesgo documental anterior desaparece.

### 0.2 Entrega y fuera de alcance

**Entrega la 03:** tokens en `src/styles/globals.css`; resolución del tema antes del primer pintado; persistencia y cambio con View Transitions; módulos puros de tema, lectura de tokens, contraste y escala; familia monoespaciada; tests unitarios, de integración y e2e.

**No entrega:** el control de tema ni su texto (04), el revelado (05), las secciones (06–10), los metadatos (11) y la medición final de rendimiento y accesibilidad (12).

### 0.3 Bloqueos y prerrequisitos

1. **Un solo `<html>`.** Sin consolidar los dos layouts no hay un único punto donde montar `data-theme`, `lang`, `suppressHydrationWarning`, la fuente y el script. La consolidación toca `src/app/layout.tsx`, `src/app/[locale]/layout.tsx` y probablemente `src/app/page.tsx`; es un cambio transversal y necesita aprobación. La propuesta técnica es que `src/app/[locale]/layout.tsx` sea el root layout y que `locale` se lea con `next/root-params`, pero pertenece al prerrequisito estructural de la 02, no a los tokens.
2. **Renderizado estático.** `ƒ /[locale]` contradice el NFR de renderizado estático. La guía de `next/root-params` documenta el layout raíz en `app/[locale]/` con `generateStaticParams`; ese `generateStaticParams` es el que prerenderiza `en` y `es` (la guía solo lo exige con Cache Components, pero sin él la ruta sigue en `ƒ`, como demuestra el build actual). La 03 no puede declarar cumplido «antes del primer pintado» sobre una ruta dinámica.
3. **Fuente en build.** `next/font/google` exige red en el build. La decisión está en la sección 10.
4. **Estado real de la 02.** La 02 figura como integrada (PR #12), pero `src/i18n/` no existe en esta rama: el locale sigue resolviéndose en `src/proxy.ts` y en los layouts. Antes de consolidar layouts hay que confirmar dónde vive ese trabajo (otra rama, un merge pendiente o un PR sin fusionar). Si no aparece, la consolidación arrastra también el esqueleto de i18n y deja de ser un cambio de la 03; el bloqueo 1 no se puede cerrar sin resolver este primero.

## 1. Módulos y límites

Todo cae en carpetas existentes (`src/lib/`, `src/styles/`, `src/app/`, `src/test/`). No se crean carpetas en la raíz ni en `src/`, no hay barrel files y los imports usan `@/`.

| Módulo | Ruta | Responsabilidad | RF |
|---|---|---|---|
| Tokens del tema | `src/styles/globals.css` | Declaración única de color, tipografía, espaciado, línea y movimiento; `color-scheme`; bloque invertido; reglas base; View Transitions y movimiento reducido. | RF-4, RF-5, RF-8, RF-9, RF-10, RF-11, RF-12 |
| Modelo de tema | `src/lib/theme.ts` | `Theme`, `StoredTheme`, `isTheme`, `resolveTheme`, clave y valores válidos. Sin DOM. | RF-1, RF-2 |
| Script de primer pintado | `src/lib/theme-script.ts` | Genera el script inline que fija `data-theme` y registra `pageshow`. Función pura: clave → código. | RF-1, RF-3, RF-7 |
| Aplicación en el DOM | `src/lib/theme-dom.ts` | `readStoredTheme`, `currentTheme`, `applyTheme` y `setTheme` con View Transitions y dependencias inyectables. Absorbe la antigua `theme-transition`. | RF-1, RF-2, RF-3, RF-4, RF-7 |
| Lector de tokens | `src/test/theme-tokens.ts` | Escanea solo bloques `@theme`, parsea declaraciones con una regex genérica y resuelve color por modo y contexto. | RF-5, RF-6, RF-9, RF-10, RF-11, RF-12 |
| Contraste | `src/test/theme-contrast.ts` | Hex a RGB, luminancia relativa, ratio, umbral por tamaño/peso y parejas alcanzables. Lógica pura. | RF-5, RF-6 |
| Escala fluida | `src/test/type-scale.ts` | Parsea `clamp(min, preferido, max)` y calcula el tamaño en un ancho. Lógica pura. | RF-9 |
| Layout que monta el tema | `src/app/[locale]/layout.tsx` (destino; hoy `src/app/layout.tsx`) | `<html suppressHydrationWarning className={geistMono.variable}>`, script como primer hijo de `<head>`, `lang`, fuente mono variable. | RF-1, RF-3, RF-7, RF-8 |
| Helpers solo-test | `src/test/theme.ts`, `src/test/source.ts`, `src/test/raw.d.ts` | Carga del CSS con `?raw`, ejecución del script con `new Function`, almacenamiento en memoria y barrido de fuentes. | RF-5, RF-6, RF-9, RF-10, RF-12 |

`theme-tokens.ts`, `theme-contrast.ts` y `type-scale.ts` son módulos de **auditoría**: solo los importan los tests, así que viven en `src/test/` con sus tests (`theme-tokens.test.ts`, `theme-contrast.test.ts`, `type-scale.test.ts`), junto a `theme.ts`, `source.ts` y `raw.d.ts`. `src/test/**` ya está excluido de cobertura, de modo que no hay código solo-test en `src/lib/` ni se duplica en dos sitios. `theme-audit.test.ts` y `theme-source.test.ts` también viven en `src/test/`: auditan `globals.css`, no un módulo de producto.

**Límites:**

- No se crea `src/components/ThemeProvider/` ni ningún contexto: el tema es un atributo en `<html>` y una función de escritura. `ThemeRestore` no forma parte del plan por defecto; solo se añadiría si se aprueba 10.5.
- No se crea `ThemeToggle`: su forma, texto y colocación son de la 04.
- No hay `theme-transition.ts`: `setTheme` y la transición viven en `theme-dom.ts`.
- Los tests de producto viven junto al módulo (`theme.test.ts`, `theme-dom.test.ts`, …); los de auditoría y sus helpers viven en `src/test/`, ya excluido de cobertura.
- Nada en `components/` conoce colores: usan utilidades que apuntan a tokens.

## 2. Modelo de datos

### 2.1 Modelo de tema

```ts
type Theme = "light" | "dark";
type StoredTheme = Theme | null;
```

- No existe un tercer valor de interfaz. «Sin elección» es `StoredTheme = null` y, en el DOM, la ausencia de `data-theme`.
- Clave: `psg-theme`. Valores válidos: `"light"` y `"dark"`. Cualquier otro se descarta.
- La ausencia de atributo deja que `light-dark()` siga la preferencia del sistema en vivo; no hay listener ni JavaScript adicional para eso.

### 2.2 Estructura CSS y endurecimiento de Tailwind

Se vacían solo los namespaces que el proyecto posee, para que no queden colores, tamaños, pesos, familias, interlineados ni trackings por defecto. `@theme static` garantiza que **todos** los tokens se emitan como variables CSS aunque ninguna utilidad los use. Las declaraciones que referencian otra variable van en `@theme static inline`, como recomienda la documentación de Tailwind 4 para evitar el contexto de resolución.

```css
@import "tailwindcss";

@theme static {
  /* Remove Tailwind defaults for the namespaces this project owns. */
  --color-*: initial;
  --font-*: initial;
  --text-*: initial;
  --font-weight-*: initial;
  --leading-*: initial;
  --tracking-*: initial;

  --color-surface: light-dark(#f2efe6, #121110);
  --color-ink: light-dark(#121110, #f2efe6);
  --color-ink-muted: light-dark(#5a574f, #a9a49a);
  --color-line: #7c776c;

  --text-display: clamp(4rem, 1.6667rem + 10.37vw, 11rem);
  --text-display--line-height: 0.9;
  --text-display--letter-spacing: -0.02em;
  --text-display--font-weight: 700;

  --text-title-lg: clamp(2.5rem, 1.3333rem + 5.185vw, 6rem);
  --text-title-lg--line-height: 0.95;
  --text-title-lg--letter-spacing: -0.015em;
  --text-title-lg--font-weight: 700;

  --text-title: clamp(1.5rem, 1rem + 2.222vw, 3rem);
  --text-title--line-height: 1;
  --text-title--letter-spacing: -0.01em;
  --text-title--font-weight: 700;

  --text-body: clamp(1rem, 0.9167rem + 0.37vw, 1.25rem);
  --text-body--line-height: 1.5;
  --text-body--letter-spacing: 0em;
  --text-body--font-weight: 400;

  --text-meta: clamp(0.75rem, 0.7083rem + 0.185vw, 0.875rem);
  --text-meta--line-height: 1.4;
  --text-meta--letter-spacing: 0.02em;
  --text-meta--font-weight: 400;

  --font-weight-regular: 400;
  --font-weight-emphasis: 700;

  --spacing: 0.25rem;
  --line-width: 1px;
  --motion-distance: 1.5rem;

  --duration-state: 200ms;
  --duration-theme: 400ms;
  --duration-reveal: 600ms;
}

@theme static inline {
  --font-mono: var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace;
  --color-focus: var(--color-ink);
}
```

Verificado contra Tailwind 4.3.5: `static` emite `--duration-state` y `--line-width` aunque no exista una utilidad `duration-state`; `inline` hace que `font-mono` emita `var(--font-geist-mono), …` y `text-focus` emita `var(--color-ink)`; `initial` elimina los valores por defecto sin borrar las declaraciones posteriores.

- Interlineado, tracking y peso no son tokens sueltos: son sub-tokens de `--text-<rol>` (`--text-display--line-height`, `--text-display--letter-spacing`, `--text-display--font-weight`). Tailwind 4 los emite en una sola utilidad compuesta: `.text-body { font-size: var(--text-body); line-height: var(--tw-leading, var(--text-body--line-height)); letter-spacing: var(--tw-tracking, var(--text-body--letter-spacing)); font-weight: var(--tw-font-weight, var(--text-body--font-weight)); }`. Un rol se aplica con una clase y no se puede combinar el tamaño de un rol con el interlineado de otro por accidente.
- Nombres comprobados en `node_modules/tailwindcss/theme.css` (`--text-xs--line-height`, …) y en una compilación real con `@theme static`: los tres sufijos se reconocen y se emiten. `--leading-*` y `--tracking-*` siguen vaciados para que `leading-*`/`tracking-*` no reintroduzcan valores fuera del rol.
- `--font-weight-regular` y `--font-weight-emphasis` se mantienen para la base y para énfasis sin cambio de tamaño; el peso por rol repite `400`/`700` porque el sub-token debe resolverse por sí solo. La auditoría cruza que ambos digan lo mismo.
- `--color-focus` es alias de `--color-ink`: no declara tono propio y dentro del bloque invertido resuelve a la tinta invertida.
- `--color-line` es un sólido y no cambia entre modos ni dentro del bloque invertido.
- La selección usa el par invertido; no hay token de selección.
- Los colores usan `light-dark()`, que resuelve con el `color-scheme` del elemento (Baseline 2024; sin `@supports` duplicado, ver 5).
- `--duration-*`, `--line-width` y `--motion-distance` no son namespaces de utilidades; se consumen con `var()` o con `duration-(--duration-state)` en los componentes.
- `--font-*: initial` también vacía `--font-sans`, del que Preflight deriva `--default-font-family`. Por eso la regla `html { font-family: var(--font-mono) }` de 2.4 es obligatoria y debe ir **después** del import; sin ella, la página cae en la fuente por defecto del navegador. `geistMono.variable` debe estar en el `<html>` para que `--font-geist-mono` exista y la cadena de `--font-mono` resuelva.
- Con `data-theme`, la variante `dark:` de Tailwind sigue siendo la de `prefers-color-scheme` y no consulta el atributo. El proyecto no la usa: el modo se resuelve con `light-dark()`. El barrido de 6.2 prohíbe `dark:` en `src/**`; si la 04 lo necesitara, se declararía `@custom-variant dark` en este archivo, nunca en un componente.

### 2.3 Bloque invertido en los tres estados

El bloque invertido no introduce colores: cambia `color-scheme` y **reaplica** los mismos tokens en el propio elemento. Reaplicarlos es imprescindible: `color` se hereda ya computado, así que un hijo no vuelve a resolver `light-dark()` solo por heredar `color-scheme`. Sin `background-color` y `color` en `.inverted`, el bloque no se vería invertido.

```css
@layer base {
  :root {
    color-scheme: light dark;
  }

  :root[data-theme="light"] {
    color-scheme: light;
  }

  :root[data-theme="dark"] {
    color-scheme: dark;
  }

  /* Base light, also the fallback when prefers-color-scheme is unsupported. */
  .inverted {
    color-scheme: dark;
    background-color: var(--color-surface);
    color: var(--color-ink);
  }

  :root[data-theme="dark"] .inverted {
    color-scheme: light;
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme]) .inverted {
      color-scheme: light;
    }
  }
}
```

**¿`@utility inverted`?** Se evaluó y se descarta; `.inverted` se queda como CSS plano dentro de `@layer base`. Tres razones:

- `@utility` genera la clase **solo si aparece en el contenido escaneado**. El e2e inyecta `<div class="inverted">` en runtime, así que Tailwind no la vería en el build y no la emitiría; el test fallaría por una razón ajena al diseño.
- La inversión depende del ancestro (`:root[data-theme="dark"] .inverted`, `:root:not([data-theme]) .inverted` dentro de una media query). `@utility` admite variantes y `&`, pero no reglas condicionadas por un ancestro externo con `prefers-color-scheme`; habría que duplicar la lógica por otra vía.
- `.inverted` no es una utilidad con variantes ni se compone con otras: es un bloque semántico que la 06/08 aplican tal cual. `@utility` está pensado para utilidades atómicas; usarlo aquí añadiría una capa de indirección sin ganancia.

Casos cubiertos:

| Estado de la página | `color-scheme` del bloque | Fondo / texto |
|---|---|---|
| `data-theme="light"` | `dark` (regla base) | negro cálido / crudo |
| `data-theme="dark"` | `light` | crudo / negro cálido |
| Sin atributo, sistema claro | `dark` (regla base) | negro cálido / crudo |
| Sin atributo, sistema oscuro | `light` (media query) | crudo / negro cálido |
| Sin `prefers-color-scheme` | `dark` (regla base) | negro cálido / crudo |

- Un `.inverted` no se anida: la inversión se define respecto del modo de la página, no del bloque padre. Si la 06 necesitara anidarlo, se resolvería con una variante explícita, no con esta regla.
- La línea no cambia; el foco y la selección usan la tinta y la superficie del contexto, así que se invierten con el bloque.

### 2.4 Reglas base, foco y movimiento reducido

```css
@layer base {
  html {
    background-color: var(--color-surface);
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-weight: var(--font-weight-regular);
    font-variant-numeric: tabular-nums;
    -webkit-font-smoothing: antialiased;
  }

  body {
    min-height: 100dvh;
    background-color: var(--color-surface);
    color: var(--color-ink);
  }

  *,
  ::before,
  ::after {
    border-color: var(--color-line);
  }

  ::selection {
    background-color: var(--color-ink);
    color: var(--color-surface);
  }

  :focus-visible {
    outline: calc(var(--line-width) * 2) solid var(--color-focus);
    outline-offset: calc(var(--spacing) / 2);
  }
}

::view-transition-group(root),
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: var(--duration-theme);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-state: 0ms;
    --duration-theme: 0ms;
    --duration-reveal: 0ms;
  }

  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

- No hay `transition` global en `html`/`body`: sin View Transition el cambio de tema es instantáneo. Las transiciones de estado son de los componentes (04/05) y usan `--duration-state`.
- El `border-color` base evita que un `border` sin color herede `currentColor` y meta tinta donde la retícula pide línea.
- `--duration-*: 0ms` es la **duración efectiva** que exige RF-11. No redefine el token declarado: la auditoría lee `@theme` (200/400/600 ms) y el e2e lee el valor computado bajo `reduce` (0 ms). RF-4 («el valor del token no cambia») se cumple porque no se sustituye por otra duración no nula.
- El bloque de `prefers-reduced-motion` queda deliberadamente **sin `@layer`**: las declaraciones sin capa ganan a `@layer base` y `@layer theme`, así que la duración efectiva es cero aunque el token declarado siga en 200/400/600 ms.
- `animation: none !important` anula cualquier View Transition aunque el navegador la iniciara; el JS además no la pide con `reduce`. `theme-audit.test.ts` comprueba que esa regla existe dentro del bloque de movimiento reducido, porque sin transición activa no hay estilo computado que leer.

### 2.5 Tipografía, línea, espaciado y movimiento

Los valores de interlineado y tracking son los que la decisión (b) deja al plan. El inventario por rol es:

| Rol (`token`) | Tamaño 360 → 1440 | `--font-weight` | `--line-height` | `--letter-spacing` | Uso |
|---|---|---|---|---|---|
| `display` | 64 → 176 px | 700 | 0.9 | -0.02em | Nombre del hero y titular de Contact |
| `title-lg` | 40 → 96 px | 700 | 0.95 | -0.015em | Titulares de sección |
| `title` | 24 → 48 px | 700 | 1 | -0.01em | Encabezados internos |
| `body` | 16 → 20 px | 400 | 1.5 | 0em | Texto de lectura |
| `meta` | 12 → 14 px | 400 | 1.4 | 0.02em | Etiquetas, numeración y datos de apoyo |

Cada fila son cuatro tokens: `--text-<rol>`, `--text-<rol>--line-height`, `--text-<rol>--letter-spacing` y `--text-<rol>--font-weight`. La utilidad compuesta `text-<rol>` aplica los cuatro; no se usan `leading-*` ni `tracking-*` sueltos.

- El grosor de línea es único (`--line-width: 1px`) para toda la retícula; no hay un grosor por rol.
- `--spacing: 0.25rem` es la base de 4 px. La escala se consume con utilidades (`p-4`) o con `var(--spacing)`; no se declaran escalas paralelas.
- `--motion-distance: 1.5rem` y `--duration-reveal: 600ms` son de la 05; la 03 solo los declara.
- La familia es una sola; `400` es el peso del cuerpo y `700` el de los titulares. Las cifras se alinean con `tabular-nums` en la base, sin depender de que la familia lo traiga por defecto.
- El archivo es la fuente variable completa; `400` y `700` son valores de `font-weight`, no dos archivos. `--font-weight-regular`/`--font-weight-emphasis` fijan esos dos valores y los sub-tokens de cada rol los repiten. `adjustFontFallback` (por defecto en `next/font`) genera un fallback con métricas ajustadas para acotar el desplazamiento al intercambiar; la 12 mide el CLS.

### 2.6 Modelo que consume el lector de tokens

```ts
type Mode = "light" | "dark";
type Context = "base" | "inverted";
type ColorToken = "surface" | "ink" | "ink-muted" | "line" | "focus";

type ColorValue =
  | { kind: "pair"; light: string; dark: string }
  | { kind: "alias"; token: ColorToken }
  | { kind: "solid"; value: string };

interface TokenSheet {
  raw: Readonly<Record<string, string>>;          // keys without the leading --
  colors: Readonly<Record<ColorToken, ColorValue>>;
}
```

Ejemplo del objeto que produce el lector con el CSS anterior:

```json
{
  "raw": {
    "color-surface": "light-dark(#f2efe6, #121110)",
    "color-ink": "light-dark(#121110, #f2efe6)",
    "color-ink-muted": "light-dark(#5a574f, #a9a49a)",
    "color-line": "#7c776c",
    "color-focus": "var(--color-ink)",
    "text-display": "clamp(4rem, 1.6667rem + 10.37vw, 11rem)",
    "text-display--line-height": "0.9",
    "text-display--letter-spacing": "-0.02em",
    "text-display--font-weight": "700",
    "text-body--font-weight": "400",
    "duration-state": "200ms",
    "duration-theme": "400ms",
    "duration-reveal": "600ms",
    "line-width": "1px",
    "spacing": "0.25rem"
  },
  "colors": {
    "surface": { "kind": "pair", "light": "#f2efe6", "dark": "#121110" },
    "ink": { "kind": "pair", "light": "#121110", "dark": "#f2efe6" },
    "ink-muted": { "kind": "pair", "light": "#5a574f", "dark": "#a9a49a" },
    "line": { "kind": "solid", "value": "#7c776c" },
    "focus": { "kind": "alias", "token": "ink" }
  }
}
```

`raw` conserva el valor tal cual; los helpers convierten a píxeles o a número. El parser valida que existan los tokens obligatorios y falla con el nombre del token si falta o no se entiende. Es un fallo de test, no de runtime.

### 2.7 Parejas alcanzables y umbrales

| Origen | Superficie | Contexto | Mínimo | Uso |
|---|---|---|---|---|
| `ink` | `surface` | base, ambos modos | 4.5:1 | Texto normal |
| `ink-muted` | `surface` | base, ambos modos | 4.5:1 | Texto normal |
| `line` | `surface` | base, ambos modos | 3:1 | Interfaz y líneas |
| `focus` | `surface` | base, ambos modos | 3:1 | Interfaz |
| `ink` | `surface` | invertido, ambos modos | 4.5:1 | Texto normal |
| `ink-muted` | `surface` | invertido, ambos modos | 4.5:1 | Texto normal |
| `line` | `surface` | invertido, ambos modos | 3:1 | Interfaz y líneas |
| `focus` | `surface` | invertido, ambos modos | 3:1 | Interfaz |

- En el contexto invertido cada token se resuelve con el modo contrario; `focus` sigue a `ink` de su contexto.
- El hover es el par invertido (`ink` sobre `surface`, o `surface` sobre `ink`), sin token propio. No hay `--color-hover`; el par ya está cubierto por la tabla.
- «Texto grande» es ≥ 24 px, o ≥ 18.66 px con `emphasis`; baja el umbral de texto a 3:1. La prueba incluye un caso sintético en esa franja aunque ningún rol actual caiga en ella.

## 3. Algoritmos clave

### 3.1 Resolución antes del primer pintado (RF-1, RF-3, RF-7)

```
FUNCTION themeScript(storageKey = "psg-theme"):
  key = JSON.stringify(storageKey)
  reread =
    "try{var v=localStorage.getItem(k);" +
      "if(v==='light'||v==='dark'){r.dataset.theme=v}else{delete r.dataset.theme}" +
    "}catch(_){}"
  RETURN "(function(){" +
    "var k=" + key + ";" +
    "var r=document.documentElement;" +
    "try{var s=localStorage.getItem(k);" +
      "if(s==='light'||s==='dark'){r.dataset.theme=s}" +
    "}catch(_){}" +
    "window.addEventListener('pageshow',function(e){" +
      "if(!e.persisted)return;" + reread +
    "});" +
  "})()"
```

- Si hay elección válida, se fija `data-theme` **una sola vez**, durante el parseo del HTML. No hay ninguna otra escritura.
- Si no hay elección, no se escribe el atributo: el CSS resuelve con el sistema y sigue sus cambios en vivo.
- La lectura inicial y la de `pageshow` van en **dos `try` independientes**, no en uno que envuelva todo el script. Si el almacenamiento lanza al arrancar, el error se absorbe y el listener **se registra igual**; si el `try` fuese único, un almacenamiento bloqueado desactivaría la restauración desde bfcache.
- `pageshow` vive dentro del script: en una restauración desde bfcache el script no se reejecuta, pero el listener relee la elección vigente. En una carga normal `persisted` es `false` y no hace nada.
- El script se inserta como primer hijo del `<head>` explícito y no oculta contenido ni bloquea el mayor elemento visible. `JSON.stringify` evita inyección en la clave; el texto no contiene `</script>`.
- `suppressHydrationWarning` en `<html>` es obligatorio: el servidor emite el HTML sin `data-theme` y el script lo añade antes de que React hidrate. Sin él, React trata la diferencia como error de hidratación y puede repintar. Next documenta exactamente este patrón (guía *Preventing flash before hydration*).
- En **desarrollo**, Strict Mode remonta y React restablece los atributos de `<html>`, `<head>` y `<body>` a los que gestiona desde JSX, borrando `data-theme`. Es un efecto solo de desarrollo: el build de producción no remonta. El plan por defecto no añade un componente para esto: lo cubre el `useLayoutEffect` del control de la 04, y el e2e corre contra `pnpm start`, así que no lo observa (ver 10.5).
- El script inline exige `'unsafe-inline'` o un `nonce` si se añade una CSP estricta. Hoy no hay CSP; la 11 y la 12 deben tenerlo en cuenta.
- Caso de test obligatorio: con un `getItem` que lanza en la primera lectura y devuelve `"dark"` en la segunda, el listener queda registrado y un `pageshow` con `persisted: true` aplica `dark`; con `getItem` que lanza siempre, el listener se ejecuta, no propaga y no deja el atributo.

### 3.2 Cambio solicitado por la persona (RF-2, RF-4)

```
FUNCTION setTheme(theme, deps = {}):
  ASSERT isTheme(theme)
  root = deps.root ?? document.documentElement
  storage = deps.storage ?? localStorageIfAvailable()
  reduced = deps.reducedMotion?.() ?? prefersReducedMotion()
  start = deps.startViewTransition ?? document.startViewTransition?.bind(document)

  try { storage?.setItem("psg-theme", theme) } catch (_) {}

  applied = false
  applyOnce():
    IF applied: RETURN
    applied = true
    root.dataset.theme = theme        // one write

  IF reduced OR NOT start:
    applyOnce()                       // instant, no CSS fallback
    RETURN

  TRY:
    start(applyOnce)                  // View Transition cross-fade
  CATCH:
    applyOnce()                       // API present but failed: still apply
```

- Persistir antes de aplicar no bloquea el cambio: si el almacenamiento falla, no hay error visible y el atributo se escribe igual.
- Una sola escritura del atributo garantiza que ninguna zona quede en el tema anterior: todos los colores cuelgan del mismo ancestro.
- La transición solo anima el cross-fade de snapshots de la raíz; no anima propiedades que provoquen reflow.
- Con `prefers-reduced-motion: reduce` o sin `startViewTransition`, el cambio es instantáneo. No hay reserva CSS: la regla base no declara `transition` en `html`/`body`.
- El control de la 04 llamará a `setTheme(next)` sin dependencias; los tests inyectan raíz, almacenamiento, `reducedMotion` y `startViewTransition`.

### 3.3 Lectura de tokens, solo `@theme` (RF-5, RF-6, RF-12)

```
FUNCTION parseTokenSheet(cssText):
  sheet = {}
  seen = {}
  FOR EACH block OF themeBlocks(cssText):       // scans @theme ... { balanced }
    FOR EACH declaration AT depth 1 OF block:
      MATCH /(--[a-z0-9*-]+)\s*:\s*([^;]+);/g
      IF name CONTAINS "*" OR value == "initial": CONTINUE   // namespace reset
      name = name WITHOUT "--"
      IF seen[name]: THROW "duplicate token: " + name
      seen[name] = true
      sheet[name] = trim(value)
  FOR EACH required IN REQUIRED_TOKENS:
    IF NOT sheet[required]: THROW "missing token: " + required
  RETURN { raw: sheet, colors: parseColorTokens(sheet) }
```

- `themeBlocks` localiza `@theme` y equilibra llaves; **nunca** lee `:root`, media queries ni `@layer`. La duración efectiva de `prefers-reduced-motion` y cualquier override quedan fuera y no producen duplicados.
- `REQUIRED_TOKENS` es explícita y sale del inventario 2.5, no de los tokens existentes: los cinco colores (`color-surface`, `color-ink`, `color-ink-muted`, `color-line`, `color-focus`); los cinco tamaños (`text-display`, `text-title-lg`, `text-title`, `text-body`, `text-meta`); los quince sub-tokens de rol (`--text-<rol>--line-height`, `--text-<rol>--letter-spacing`, `--text-<rol>--font-weight` para cada uno de los cinco); `font-weight-regular`, `font-weight-emphasis`, `spacing`, `line-width`, `motion-distance`, `duration-state`, `duration-theme` y `duration-reveal`. Son 33 nombres. Si falta uno, el test falla con su nombre.
- Los sub-tokens entran en el mismo objeto `raw` con su nombre completo (`text-display--line-height`), así que el parser no necesita una regla especial: la regex genérica ya los captura y el test los exige uno a uno.
- No hay una regex por token: una sola declaración genérica y una lista de tokens obligatorios.
- `parseColorTokens` reconoce `light-dark(a, b)`, `var(--color-x)` y hex sólido. Un valor desconocido lanza con el nombre del token.
- El test importa `@/styles/globals.css?raw`; así audita la misma declaración que usa el sitio, sin copiar valores. `src/test/raw.d.ts` declara el módulo `*.css?raw` para TypeScript.

### 3.4 Contraste y parejas (RF-5, RF-6)

```
FUNCTION resolveColor(sheet, token, mode, context):
  effective = context == "inverted" ? opposite(mode) : mode
  value = sheet.colors[token]
  IF value.kind == "alias": RETURN resolveColor(sheet, value.token, mode, context)
  IF value.kind == "solid": RETURN value.value
  RETURN effective == "light" ? value.light : value.dark

FUNCTION reachablePairs(sheet, mode):
  FOR context IN ["base", "inverted"]:
    bg = resolveColor(sheet, "surface", mode, context)
    FOR token IN ["ink", "ink-muted", "line", "focus"]:
      pairs.push({ token, context, fg: resolveColor(sheet, token, mode, context), bg })

FUNCTION contrastRatio(fg, bg):
  l1 = relativeLuminance(fg); l2 = relativeLuminance(bg)
  lighter = MAX(l1, l2); darker = MIN(l1, l2)
  RETURN (lighter + 0.05) / (darker + 0.05)

FUNCTION relativeLuminance(rgb):
  FOR c IN rgb:
    channel = (c / 255 <= 0.03928) ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ^ 2.4
  RETURN 0.2126 * r + 0.7152 * g + 0.0722 * b

FUNCTION requiredContrast(sizePx, weight):
  large = sizePx >= 24 OR (sizePx >= 18.66 AND weight >= 700)
  RETURN large ? 3 : 4.5
```

- Umbral por pareja: 4.5:1 para `ink` y `ink-muted`; 3:1 para `line` y `focus`.
- `contrastRatio` devuelve 1–21; `parseColor` devuelve `null` si no entiende el valor y el test lo trata como fallo.
- El par de hover no se declara: se evalúa como `ink` sobre `surface` (o el inverso), que ya está en la tabla.

### 3.5 Escala fluida (RF-9)

```
FUNCTION parseClamp(value):
  // "clamp(4rem, 1.6667rem + 10.37vw, 11rem)"
  parts = splitTopLevel(value)
  RETURN {
    min: toPx(parts[0]),
    preferred: sumTerms(parts[1]),   // { px, vw }
    max: toPx(parts[2])
  }

FUNCTION sizeAt(spec, widthPx):
  preferred = spec.preferred.px + spec.preferred.vw * widthPx / 100
  RETURN clamp(preferred, spec.min, spec.max)
```

- `toPx` convierte `rem` con raíz de 16 px y deja `px` igual; `sumTerms` admite uno o dos términos (`px + vw`).
- Cada `clamp` corta exactamente en el mínimo a 360 px y en el máximo a 1440 px: el término preferido es la recta que une ambos extremos. La prueba de extremos mide la curva real y no el recorte; los decimales del CSS (`1.6667rem`, `10.37vw`) y el redondeo de `rem`/`vw` obligan a comparar con tolerancia de 0,05 px.
- Propiedades exigidas: `sizeAt(spec, 360) ≈ min`, `sizeAt(spec, 1440) ≈ max` (ambas con 0,05 px), no decreciente entre ambos y orden estricto `display > title-lg > title > body > meta` en 320, 360, 768 y 1440 px.

## 4. Contratos de interfaz

### 4.1 `isTheme(value: unknown): value is Theme`

- Salida: `true` solo para `"light"` y `"dark"`.
- Errores: ninguno. RF-1.

### 4.2 `resolveTheme(stored: StoredTheme, systemPrefersDark: boolean): Theme`

- Salida: la elección guardada si existe; si no, `"dark"` o `"light"` según el sistema; sin preferencia, `"light"`.
- Errores: ninguno. RF-1.

### 4.3 `readStoredTheme(storage?: Pick<Storage, "getItem"> | null): StoredTheme`

- Salida: `"light"`, `"dark"` o `null` si no hay valor, no es válido o el acceso lanza.
- Errores: ninguno; absorbe el almacenamiento bloqueado. RF-1, RF-7.

### 4.4 `themeScript(storageKey?: string): string`

- Salida: JavaScript síncrono y autocontenido que fija `data-theme` solo con una elección válida y registra `pageshow`.
- Errores: ninguno; las dos lecturas de `localStorage` van en `try/catch` independientes y el texto no puede lanzar hacia fuera ni al arrancar ni al restaurar. RF-1, RF-3, RF-7.

### 4.5 `currentTheme(root: HTMLElement, systemPrefersDark: boolean): Theme`

- Salida: el tema efectivo; lee `data-theme` y, si no existe o no es válido, el sistema.
- Errores: ninguno. RF-1. Lo consume el control de la 04.

### 4.6 `applyTheme(root: HTMLElement, theme: Theme): void`

- Salida: `void`; escribe solo `dataset.theme`. No toca clases ni otros atributos.
- Errores: no valida en runtime; el tipo lo impide. RF-2.

### 4.7 `setTheme(theme: Theme, deps?: ThemeDeps): void`

- `ThemeDeps = { root?, storage?, reducedMotion?, startViewTransition? }`.
- Salida: `void`; persiste si puede, aplica una sola vez y usa View Transitions solo si hay soporte y no hay movimiento reducido.
- Errores: ninguno; si el almacenamiento o la API fallan, el tema se aplica igual. RF-2, RF-4, RF-7.

### 4.8 `parseTokenSheet(css: string): TokenSheet`

- Entrada: el texto completo de `src/styles/globals.css` (vía `?raw` en tests).
- Salida: `raw` con todos los tokens de `@theme` y `colors` resueltos a `pair`, `alias` o `solid`.
- Errores: lanza con el nombre del token si falta un obligatorio, hay un duplicado dentro de `@theme` o un color no se entiende. RF-5, RF-9, RF-10, RF-11, RF-12.

### 4.9 `resolveColor(sheet, token, mode, context): string` y `tokenValue(sheet, name): string`

- `resolveColor`: aplica el modo contrario en `inverted`, sigue alias y devuelve sólidos sin cambios.
- `tokenValue`: devuelve el valor crudo o lanza si falta.
- Errores: token desconocido o alias cíclico → error de test. RF-5, RF-6.

### 4.10 `contrastRatio(fg, bg)`, `requiredContrast(sizePx, weight)`, `reachablePairs(sheet, mode)`

- `contrastRatio`: ratio 1–21.
- `requiredContrast`: 3 o 4.5 según el umbral WCAG de texto grande.
- `reachablePairs`: las ocho parejas por modo, con su contexto.
- Errores: `parseColor` devuelve `null`; el test falla con el valor. RF-5, RF-6.

### 4.11 `parseClamp(value): ClampSpec` y `sizeAt(spec, widthPx): number`

- `parseClamp`: mínimo, preferido (`px` + `vw`) y máximo en píxeles.
- `sizeAt`: tamaño recortado a `[min, max]`.
- Errores: valor no reconocido → error de test. RF-9.

## 5. Decisiones técnicas justificadas

| Decisión | Justificación | Alternativa descartada | RF |
|---|---|---|---|
| `light-dark()` con `color-scheme` por contexto | Un valor por token cubre los dos modos; el bloque invertido sale de cambiar `color-scheme` y reaplicar los mismos tokens. Da controles y barras nativos correctos. Baseline 2024 (Chrome/Edge 123, Firefox 120, Safari 17.5). | Bloques por modo con literales duplicados y un `.inverted` que repite la paleta: cuatro declaraciones del mismo color y deriva entre modos. | RF-3, RF-5, RF-12 |
| `.inverted` reaplica `surface` e `ink` en el propio bloque, como CSS plano | `color` se hereda computado: cambiar solo `color-scheme` no reinvierte el texto heredado. Reaplicar los tokens sí, y no introduce colores nuevos. Se descarta `@utility`: solo emite la clase si aparece en el contenido escaneado (el e2e la inyecta en runtime) y no expresa reglas condicionadas por un ancestro. | Solo `color-scheme` en `.inverted`: el fondo y el texto heredados se quedan en el modo base. `@utility inverted`: la clase desaparece del build cuando no se escanea y no puede leer `:root[data-theme]`. | RF-5 |
| `data-theme` solo cuando hay elección guardada | La ausencia de atributo deja que el CSS siga al sistema en vivo, sin listener, y hace que «sin elección» sea la ausencia de un valor. | Fijar siempre el atributo resuelto: congelaría el tema al cargar y rompería RF-1. | RF-1, RF-7 |
| Script inline generado por una función pura, con `pageshow` dentro | Se ejecuta antes del primer pintado, no depende de red ni de un componente cliente, y su texto es testeable con `new Function`. El listener cubre bfcache sin un módulo extra. | Componente cliente con `useEffect`: después del primer pintado y con fotograma contrario. Un `syncOnPageShow` separado: más superficie y el script seguiría sin cubrir la restauración. | RF-1, RF-3 |
| `localStorage` para la elección | Es la única fuente que se lee sin servidor y sin hacer la página dinámica; encaja con el renderizado estático. | Cookie leída en el layout: obliga a renderizar por petición. | RF-1, RF-2, RF-7 |
| View Transitions como única transición de tema | Cumple RF-4 con `--duration-theme`. Sin soporte o con `reduce`, el cambio es instantáneo; el CSS anula además los pseudo-elementos. | Reserva a transición CSS: en navegadores sin la API el cambio dejaría de ser instantáneo y se solaparía con las transiciones de estado. | RF-4, RF-11 |
| Tokens en `globals.css` y lector que solo lee `@theme` | La constitución 4 fija `globals.css` como fuente única; el lector evita copiar valores y no confunde overrides de media queries con declaraciones. | Tokens en un módulo TS que genere variables: duplicaría la declaración y tocaría la capa global. | RF-6, RF-12 |
| `@theme static` + `inline` + `initial` | `initial` elimina la paleta, la escala y los pesos por defecto; `static` emite todos los tokens aunque no se usen; `inline` resuelve las referencias (`font-mono`, `color-focus`) en el punto de uso. | `@theme` simple: Tailwind omite variables no usadas y las referencias pueden resolverse en el contexto equivocado. | RF-8, RF-12 |
| `--text-<rol>` con sub-tokens de interlineado, tracking y peso | Una sola clase `text-<rol>` aplica tamaño y las tres propiedades tipográficas, así que no se mezcla el tamaño de un rol con el tracking de otro; `leading-*` y `tracking-*` quedan sin valores. Verificado contra Tailwind 4.3.5. | Tokens sueltos `--leading-*`/`--tracking-*` y peso por rol: cuatro decisiones por rol y combinaciones accidentales. | RF-8, RF-9, RF-12 |
| Sin `ThemeProvider` ni contexto | El tema es un atributo en `<html>` y una función de escritura; no hay estado compartido que justifique una capa nueva. | Contexto React: render de cliente, riesgo de desajuste de hidratación y una capa que la constitución no pide. | RF-2 |
| `Geist_Mono` variable vía `next/font/google` | Un solo archivo variable cubre el eje de peso; los tokens fijan 400 y 700. Cubre `latin` (español e inglés), es monoespaciada, se autoaloja en el build y `adjustFontFallback` acota el desplazamiento. No añade dependencias. | Añadir el paquete `geist`, otra familia o una fuente local: dependencia, binario o recurso extra; requiere aprobación. | RF-8 |
| Base de 4 px y barrido de fuente para RF-10 | La escala de Tailwind deriva de `--spacing`; el barrido detecta valores arbitrarios y CSS crudo fuera de la escala. No se afirma «por construcción». | Confiar solo en que las utilidades numéricas son múltiplos: no detecta `p-[10px]` ni `margin: 10px` en CSS. | RF-10, RF-12 |
| Un test que lee el CSS con `?raw` y audita tokens | Cubre contraste, jerarquía, espaciado y duraciones sobre la misma declaración que usa el sitio, sin fixtures paralelos. | Fixtures con valores esperados: verifican la copia, no el producto. | RF-5, RF-6, RF-9, RF-10, RF-11, RF-12 |

## 6. Estrategia de tests

### 6.1 Principios

- Tests antes que código; el criterio de aceptación se escribe como test y luego se implementa.
- Solo comportamiento observable y contratos públicos; ni snapshots ni aserciones de clases Tailwind.
- Cobertura ≥ 95 % en líneas, funciones, ramas y sentencias, sin bajar el umbral ni excluir código nuevo.
- Los tests de tokens, contraste, escala y auditoría son de lógica pura: leen `globals.css?raw` y no abren navegador. Sus módulos (`theme-tokens.ts`, `theme-contrast.ts`, `type-scale.ts`) viven en `src/test/` con sus tests. `vitest.config.mts` ya usa `resolve.tsconfigPaths`, así que `@/styles/globals.css?raw` resuelve con el alias; `src/test/raw.d.ts` declara el módulo para TypeScript.
- El script inline se prueba ejecutando el texto generado con `new Function` y un `window`, `document` y `localStorage` falsos; no se prueba el texto por coincidencia de cadenas.
- Los módulos de producto (`theme.ts`, `theme-script.ts`, `theme-dom.ts`) se testean junto al archivo; los de auditoría, sus tests y los helpers viven en `src/test/`, ya excluido de cobertura.

### 6.2 Unidad (Vitest, sin DOM)

| Test | Qué se verifica | RF |
|---|---|---|
| `theme.test.ts` | `isTheme` rechaza todo lo que no sea `light`/`dark`; `resolveTheme` con las cuatro combinaciones de elección y sistema, incluido el defecto claro; la clave es `psg-theme`. | RF-1 |
| `theme-script.test.ts` | Ejecutado con `new Function`: con elección válida escribe `data-theme` exactamente una vez; sin elección o con valor inválido, cero escrituras; con almacenamiento que lanza no propaga el error; si la primera lectura lanza y la segunda devuelve `dark`, el listener queda registrado y `pageshow` con `persisted: true` aplica `dark`; `pageshow` relee y aplica o retira el atributo; con `persisted: false` no toca nada. | RF-1, RF-3, RF-7 |
| `theme-tokens.test.ts` | Solo lee `@theme` (un `:root` y un `@media` señuelo se ignoran); parsea `light-dark`, alias y sólido con una regex genérica; captura los sub-tokens `--text-<rol>--line-height`, `--letter-spacing` y `--font-weight` con esa misma regex; falla si falta un token obligatorio, si hay duplicado dentro de `@theme` o si un color no se entiende. | RF-5, RF-12 |
| `theme-contrast.test.ts` | Negro/blanco 21:1 e iguales 1:1; las 16 parejas (8 por modo) superan su umbral; `requiredContrast` en los límites 24 px y 18.66 px con 400/700; el foco invertido usa la tinta del contexto. | RF-5, RF-6 |
| `type-scale.test.ts` | Cada rol alcanza su mínimo en 360 y su máximo en 1440 con tolerancia de 0,05 px; no decrece entre ambos; jerarquía estricta en 320, 360, 768 y 1440; cuerpo ≥ 16 px y cualquier texto ≥ 12 px; caso sintético de 18.66 px con énfasis. | RF-9 |
| `theme-audit.test.ts` | La paleta solo tiene `surface`, `ink`, `ink-muted`, `line` y `focus`; crudo dentro de `#EFECE2`–`#F5F2EA`; negro dentro de `#0E0E0C`–`#141312`; todos los neutros con R ≥ G ≥ B; línea sólida única; atenuado con par por modo; foco alias de `ink`; cada rol tiene sus tres sub-tokens y coinciden con el inventario 2.5; cada `--text-<rol>--font-weight` es 400 o 700 y los dos pesos globales concuerdan; duraciones 150–250 ms de estado, tema ≤ 400 ms, revelado ≤ 600 ms y ningún temporal > 600 ms; `--spacing: 0.25rem`; `--line-width: 1px`; una sola familia; regla `animation: none` sobre `::view-transition-*` dentro de `prefers-reduced-motion`. | RF-5, RF-8, RF-9, RF-10, RF-11, RF-12 |
| `theme-source.test.ts` | Barrido de `src/**/*.{ts,tsx,css}`: ningún hex fuera de `globals.css`, salvo en `*.test.*` y `src/test/`, que usan literales como fixtures; ningún `font-family`, `font-sans`, `font-serif` ni variante `dark:` fuera del token (la variante `dark:` de Tailwind sigue al sistema, no a `data-theme`); ningún espaciado arbitrario (`p-[…]`, `m-[…]`, `gap-[…]`, `inset-[…]`, `translate-[…]`) ni propiedad CSS de margen, padding, gap o inset con un valor que no sea `0`, múltiplo de 4 px/0.25 rem o `var(--spacing)`/`calc()` sobre él; ninguna utilidad de espaciado con fracción de medio (`p-0.5`, `m-1.5`, `gap-2.5`, `space-x-0.5`, `inset-1.5`, `size-3.5`, `w-0.5`, `h-2.5` y sus variantes de eje), porque `0.5 × 4 px = 2 px` rompe la retícula de 4 px. El barrido vive en `src/test/source.ts`. | RF-10, RF-12 |

### 6.3 Integración (Vitest + jsdom)

| Módulo | Qué se verifica | RF |
|---|---|---|
| `theme-dom.ts` | `applyTheme` escribe solo `data-theme` y no toca clases ni otros atributos; `readStoredTheme` absorbe almacenamiento que lanza; `currentTheme` prefiere el atributo válido y cae al sistema. | RF-1, RF-2, RF-7 |
| `theme-dom.ts` (`setTheme`) | Persiste y aplica con una sola escritura; con almacenamiento que lanza no hay error y el tema cambia; con `reducedMotion` no llama a `startViewTransition`; sin API aplica directo; con API y sin `reduce` la llama una vez y el callback escribe una vez; si la API lanza, aplica directo. | RF-2, RF-4, RF-7 |

### 6.4 e2e (Playwright, Chromium)

| Flujo | Qué se verifica | RF |
|---|---|---|
| Elección sembrada, claro y oscuro, en `/en` y `/es` | Con `addInitScript` se siembra `psg-theme`; con el sistema en el modo contrario, el fondo computado corresponde al token y `data-theme` tiene el valor esperado. | RF-1, RF-2, RF-5 |
| Persistencia tras recarga | Tras `reload`, el tema guardado sigue aplicado y `localStorage` conserva el valor. | RF-1, RF-2 |
| Sin fotograma contrario | `addInitScript` instala un `MutationObserver` sobre `document` (`subtree`, `attributes`, `attributeFilter: ["data-theme"]`, `attributeOldValue`) antes del script inline; con sistema claro y elección oscura se registra **exactamente una** mutación, con `readyState === "loading"`, `oldValue === null` y `newValue === "dark"`, y ninguna después de `load` ni de dos `requestAnimationFrame`. | RF-3 |
| Bloque invertido inyectado | En los tres estados (light, dark y sin atributo con sistema claro/oscuro), se inyecta `<div class="inverted">` y se comprueban los colores computados del bloque y de un hijo: el par es el contrario del fondo de la página. | RF-5 |
| Movimiento reducido | Con `reduce`, `getComputedStyle(document.documentElement).getPropertyValue("--duration-state")` y `--duration-theme` devuelven `0ms` (con `trim()`); la anulación de los pseudo-elementos de View Transition se audita en `theme-audit.test.ts`, porque sin transición activa no hay estilo computado que leer. | RF-4, RF-11 |
| Sin JavaScript | Con `javaScriptEnabled: false` y `colorScheme: "dark"`, no hay `data-theme` y el fondo computado es el oscuro; el contenido sigue visible. | RF-7 |
| Sistema sin preferencia | Con `colorScheme: "no-preference"` se pinta en claro. | RF-1, RF-7 |
| `pageshow` persistido | Se cambia `localStorage` y se despacha un `pageshow` con `persisted: true`; el atributo se actualiza o se retira. Es un proxy del bfcache, que Chromium headless no fuerza de forma fiable. | RF-3 |

**Límite conocido y enmienda propuesta:** el escenario «la persona pulsa el control» necesita la 04. La 03 verifica la resolución, la persistencia, la primera pintura, el bloque invertido, `reduce` y sin JavaScript con elección sembrada. El clic real, la persistencia desde el control y el anuncio se añaden en la 04. En lugar de declararlo «desviación consciente», se propone enmendar el criterio de finalización de `spec.md`; la enmienda está en la sección 10 y **no se edita** `spec.md` sin aprobación.

### 6.5 Orden y cobertura

0. **Commit previo, fuera de la 03:** consolidación de layouts (`[locale]` como root layout, un solo `<html>` y `<body>`), `[locale]` como root param y las rutas estáticas. Sin ese commit no se escribe ningún test de la 03: el script, el `lang` y la fuente no tienen un punto de montaje único, y «antes del primer pintado» no se puede medir sobre `ƒ /[locale]`. Este paso depende de resolver el bloqueo 0.3.1 y el estado real de la 02 (0.3.4).
1. Tests de `theme.ts`, `theme-tokens.test.ts` y `theme-contrast.test.ts`.
2. Tests de `type-scale.test.ts`, `theme-audit.test.ts` y `theme-source.test.ts`.
3. Tokens en `globals.css` hasta poner en verde 1 y 2.
4. Tests de `theme-script.test.ts` y `theme-dom.test.ts`; luego el layout consolidado.
5. e2e al final, con el build de producción.

Todo módulo de `src/lib/` entra en cobertura; no hay exclusiones nuevas. `src/app/**` sigue excluido como fichero de ruta y se cubre por e2e. `src/test/**` ya está excluido por configuración.

## 7. Trazabilidad RF → partes del plan

- **RF-1:** `theme.ts`, `theme-script.ts`, `theme-dom.ts` (`readStoredTheme`, `currentTheme`), layout, algoritmos 3.1 y 3.2, contratos 4.1–4.5, tests 6.2–6.4.
- **RF-2:** `theme-dom.ts` (`applyTheme`, `setTheme`), `theme.ts`, algoritmo 3.2, contratos 4.6–4.7, tests 6.3 y 6.4.
- **RF-3:** `theme-script.ts` (incluido `pageshow` con lecturas independientes), layout, algoritmo 3.1, contrato 4.4, tests 6.2–6.4. La reaplicación tras el remontaje de desarrollo se deja a la 04 (10.5).
- **RF-4:** `globals.css` (`::view-transition-*`, `reduce`), `theme-dom.ts` (`setTheme`), algoritmo 3.2, contrato 4.7, tests 6.3 y 6.4.
- **RF-5:** `globals.css` (2.2, 2.3 y 2.7), `src/test/theme-tokens.ts`, `src/test/theme-contrast.ts`, algoritmos 3.3–3.4, contratos 4.8–4.10, tests 6.2 y 6.4.
- **RF-6:** `src/test/theme-contrast.ts`, parejas 2.7, algoritmos 3.4, contratos 4.9–4.10, tests 6.2.
- **RF-7:** `theme-script.ts`, `theme-dom.ts`, `globals.css` (`color-scheme`), algoritmos 3.1–3.2, contratos 4.3–4.4 y 4.7, tests 6.2–6.4.
- **RF-8:** `globals.css` (2.2 y 2.5; `--text-<rol>` con sus tres sub-tokens), layout (fuente mono), auditoría de pesos y familia, test 6.2.
- **RF-9:** `globals.css` (2.5), `src/test/type-scale.ts`, algoritmo 3.5, contratos 4.8 y 4.11, test 6.2.
- **RF-10:** `globals.css` (`--spacing`, `--line-width`), `theme-audit.test.ts`, `theme-source.test.ts`, tests 6.2.
- **RF-11:** `globals.css` (duraciones, `--motion-distance`, `reduce`), `theme-dom.ts`, auditoría, tests 6.2 y 6.4.
- **RF-12:** declaración única en `globals.css`, `@theme static/inline`, lector `src/test/theme-tokens.ts`, auditoría y barrido, tests 6.2.
- **NFR:** script inline sin red en runtime; transición de solo color; sin reflow; renderizado estático pendiente del prerrequisito 0.3; un lugar por token; Baseline 2024 para `light-dark()`.
- **Casos límite:** fallo del script y almacenamiento bloqueado (3.1, 4.3, 6.2–6.3); preferencia del sistema ausente o cambiante (3.1, 6.4); navegador sin `prefers-color-scheme` (CSS, 6.4); sin soporte de View Transition (3.2, 6.3); zoom y bloque invertido (2.7, 6.2 y 6.4).

## 8. Riesgos y dependencias abiertas

1. **Control de tema (04).** Sin átomo no se puede probar el clic real en la 03; se cubre con elección sembrada y la 04 añade la interacción.
2. **Doble `<html>` y `[locale]` dinámica.** `src/app/layout.tsx` y `src/app/[locale]/layout.tsx` renderizan ambos `<html>`, y `pnpm build` sirve `ƒ /[locale]`. Hay que consolidar el layout y prerenderizar por locale antes de dar por bueno «antes del primer pintado». Es el bloqueo principal, y arrastra el estado real de la 02: figura integrada (PR #12) pero `src/i18n/` no está en la rama.
3. **Fuente en build.** `next/font/google` descarga en build time. Sin red en CI, el build falla. La alternativa sin red es el paquete `geist` o una fuente local, ambas con aprobación.
4. **Cobertura de glifos.** Que la familia cubra español, inglés y cifras tabulares se comprueba al elegirla y en la revisión visual de la 06; ningún test unitario puede demostrarlo. La base pide `tabular-nums` para no depender del default de la fuente.
5. **Baseline 2024.** `light-dark()` exige Chrome/Edge 123, Firefox 120 o Safari 17.5. No hay `@supports` duplicado por decisión; la lista mínima de navegadores de la 12 debe confirmar ese suelo.
6. **Spec 05.** La distancia y el rango del revelado son suyos; la 03 solo declara `--motion-distance` y `--duration-reveal`.
7. **Placeholder raíz.** `src/app/page.tsx` usa `bg-zinc-50`, `dark:bg-black` y `font-sans`; al vaciar la paleta y la familia hay que retirarlos en el mismo cambio para que no queden clases muertas.

## 9. Cambios respecto a la versión anterior

1. **RF-4 sin reserva CSS:** View Transitions es la única transición de tema; sin soporte o con `reduce`, el cambio es instantáneo. Se eliminó la reserva a transición CSS y se añadió CSS que anula los pseudo-elementos de View Transition bajo `reduce`.
2. **Bloque invertido en tres estados:** se documentan `data-theme="light"`, `data-theme="dark"` y sin atributo (sistema claro/oscuro); `.inverted` reaplica `surface` e `ink` en el propio elemento para que el texto heredado se invierta; el e2e inyecta `.inverted` y comprueba colores computados.
3. **Hidratación:** se documenta `suppressHydrationWarning` en `<html>`, el script como primer hijo del `<head>` explícito y el remontaje de Strict Mode en desarrollo, con la referencia a la guía de Next 16.
4. **`pageshow` en el script:** el listener vive dentro del script inline; se elimina `syncOnPageShow` de `theme-dom.ts`; los tests ejecutan el texto generado con `new Function`.
5. **Parser solo `@theme`:** escanea bloques `@theme` con una regex genérica y equilibrio de llaves, ignora `:root` y media queries; los tests importan `globals.css?raw` y se añade `src/test/raw.d.ts`.
6. **Tailwind endurecido:** `initial` para los namespaces propios, `@theme static` para emitir todos los tokens y `@theme static inline` para las referencias (`font-mono`, `color-focus`); verificado contra Tailwind 4.3.5.
7. **Reglas base:** `html`/`body`, `:focus-visible`, `::selection`, `border-color: var(--color-line)` y `--duration-*: 0ms` bajo `reduce`.
8. **Hover:** el par invertido `ink`/`surface`, sin `--color-hover`; la tabla de contraste ya cubre ese par.
9. **RF-10 por barrido:** test que recorre `src/**/*.{ts,tsx,css}` y falla ante espaciados arbitrarios, hex fuera de `globals.css` o CSS crudo fuera de la escala; también prohíbe `dark:` y `font-sans`/`font-serif`. Se retira la afirmación «por construcción».
10. **Módulos y helpers solo-test:** `theme-tokens.ts`, `theme-contrast.ts`, `type-scale.ts`, `loadTokenSheet`, `runThemeScript`, el almacenamiento en memoria y el barrido viven en `src/test/`, junto a sus tests; solo los módulos de producto (`theme.ts`, `theme-script.ts`, `theme-dom.ts`) quedan en `src/lib/` con su test al lado.
11. **`theme-transition` fusionado:** `setTheme(theme, deps?)` vive en `theme-dom.ts`, con raíz, almacenamiento, `reducedMotion` y `startViewTransition` inyectables; el control de la 04 lo llama sin dependencias.
12. **Fuente confirmada:** `Geist_Mono` está en `next/font/google`, cubre `latin` y es variable; se carga sin array de `weight` (los pesos 400/700 son tokens de `font-weight`) y se retira `Geist` sans. Se marca la red en build como decisión pendiente, sin añadir dependencias.
13. **`light-dark()` sin duplicado:** Baseline 2024 (Chrome/Edge 123, Firefox 120, Safari 17.5); se elimina el `@supports` y la paleta duplicada.
14. **e2e de primera pintura:** `addInitScript` instala un `MutationObserver` antes del script inline; con elección opuesta al sistema se exige exactamente una mutación de `data-theme`, durante `loading`, y ninguna posterior.
15. **Enmienda de spec:** se sustituye la «desviación consciente» por una propuesta de enmienda a los criterios de finalización, marcada pendiente de aprobación y sin editar `spec.md`.
16. **Riesgo del README eliminado:** «Cream and black» no diverge de crudo/negro; el riesgo documental desaparece.
17. **Auditoría dentro de `src/test/`:** `theme-tokens.ts`, `theme-contrast.ts` y `type-scale.ts` se mueven con sus tests a `src/test/` en §1, §6 y §7; se elimina la alternativa «con aprobación» y §9.10 queda corregido.
18. **Barrido más estricto:** `theme-source.test.ts` falla ante fracciones de medio en utilidades de espaciado (`p-0.5`, `m-1.5`, `gap-2.5`, `space-x-0.5`, `inset-1.5`, `size-3.5`, `w-0.5`, `h-2.5` y variantes de eje) y la regla de hex excluye `*.test.*` y `src/test/`.
19. **`pageshow` con dos `try`:** la lectura inicial y la de restauración son independientes, así que un almacenamiento que lanza ya no desactiva bfcache; se añade el test de primera lectura fallida y segunda correcta.
20. **Tipografía compuesta:** interlineado, tracking y peso pasan a `--text-<rol>--line-height`, `--text-<rol>--letter-spacing` y `--text-<rol>--font-weight`; se actualizan `REQUIRED_TOKENS` (33 nombres), el inventario 2.5 y la auditoría. Comprobado en `node_modules/tailwindcss/theme.css` y con una compilación real.
21. **Estado de la 02 como bloqueo:** se documenta en 0.3 que figura integrada (PR #12) pero `src/i18n/` no existe en la rama; hay que confirmarlo antes de consolidar layouts.
22. **Baseline sin fecha:** se retira «ampliamente disponible desde noviembre de 2026» en §5 y §9.13; queda Baseline 2024 con Chrome/Edge 123, Firefox 120 y Safari 17.5.
23. **Tolerancia de escala:** `sizeAt` compara con 0,05 px por el redondeo de `rem`/`vw`.
24. **`@utility` evaluado y descartado para `.inverted`:** se justifica en 2.3 y 5 (tree-shaking de la clase inyectada en e2e y reglas condicionadas por ancestro).
25. **Paso 0 en 6.5:** commit previo de consolidación de layouts y rutas estáticas antes de cualquier test de la 03.
26. **`ThemeRestore` no recomendado:** el plan por defecto deja la reaplicación al `useLayoutEffect` de la 04; el componente solo queda como opción si se aprueba.

## 10. Decisiones pendientes de aprobación

1. **Fuente y red en build.** Recomendado: `Geist_Mono` como fuente **variable**, `Geist_Mono({ subsets: ["latin"], display: "swap", variable: "--font-geist-mono" })`, sin array de `weight`: `next/font` documenta el array solo para fuentes no variables y Geist Mono expone el eje de peso completo. La clase `geistMono.variable` va en `<html>`; los pesos salen de `--text-<rol>--font-weight` y de `--font-weight-regular`/`--font-weight-emphasis` para énfasis sin cambio de tamaño. Requiere aprobar que el build descarga la fuente; el navegador no contacta con Google. Alternativa: paquete `geist` o fuente local, que sí añade dependencia o binario.
2. **Consolidación de layouts.** Aprobar el cambio transversal para dejar un solo `<html>` y `[locale]` como root param (`next/root-params` + `generateStaticParams`), con la retirada o reubicación de `src/app/page.tsx`. Sin esto, la 03 no puede cumplir «antes del primer pintado» sobre una ruta estática. Antes hay que confirmar el estado real de la 02 (0.3.4).
3. **Enmienda de `spec.md`.** Aprobar este texto para el criterio de finalización, sin editarlo todavía:
   - «El e2e de tema en Playwright comprueba, en `/en` y `/es`, la resolución con elección sembrada (clara y oscura), la persistencia tras recarga, la elección opuesta al sistema aplicada antes del arranque con exactamente una mutación de `data-theme`, el bloque invertido en los tres estados, la duración efectiva cero con movimiento reducido y el tema del sistema sin JavaScript. La interacción real con el control de tema (clic, persistencia y anuncio) se verifica en el e2e de la spec 04.»
   - «El cambio de tema no desplaza contenido; con la API disponible dura el token de transición de tema, y es instantáneo sin soporte, con `prefers-reduced-motion` y sin JavaScript. La 03 lo verifica sobre `setTheme` y el CSS; la 04 añade la pulsación real.»
4. **Limpieza del placeholder raíz.** Confirmar que se retiran `bg-zinc-50`, `dark:bg-black` y `font-sans` de `src/app/page.tsx` en el mismo cambio que vacía la paleta y la familia; es limpieza mínima, no una sección nueva.
5. **Reaplicación en desarrollo.** Recomendado: **no** añadir `ThemeRestore` en la 03. Strict Mode solo borra `data-theme` al remontar `<html>` en desarrollo, y el `useLayoutEffect` del control de la 04 —que ya tiene que leer el tema para pintar su estado— lo reaplica antes de pintar; en producción no ocurre. Así se evita una carpeta, un archivo y un test que solo existen por una peculiaridad de desarrollo. Opción solo si se aprueba: `ThemeRestore` nulo con `useLayoutEffect` que reaplica si el atributo falta o difiere, más un test de integración que compruebe que no escribe cuando el valor ya está.
