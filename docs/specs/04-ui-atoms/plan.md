# Plan — 04 Átomos de UI

Estado: pendiente de ejecución. Se deriva de `docs/specs/04-ui-atoms/spec.md` y debe respetar `docs/constitution.md`. No hay código de implementación en este plan; solo estructura, modelos, contratos, decisiones y estrategia de tests.

---

## 1. Estructura de módulos

Todos los módulos viven bajo `src/components/ui/` (dos niveles máximo: `components/` → `ui/`, regla 7 de la constitución). No se crean carpetas nuevas en la raíz ni en `src/`. No hay barrel files (`index.ts`); cada componente se importa por su ruta completa con el alias `@/`.

```
src/components/ui/
├── Button/
│   ├── Button.tsx
│   └── Button.test.tsx
├── Link/
│   ├── Link.tsx
│   └── Link.test.tsx
├── Heading/
│   ├── Heading.tsx
│   └── Heading.test.tsx
├── Tag/
│   ├── Tag.tsx
│   └── Tag.test.tsx
├── Section/
│   ├── Section.tsx
│   └── Section.test.tsx
├── ThemeToggle/
│   ├── ThemeToggle.tsx
│   └── ThemeToggle.test.tsx
├── LanguageSwitch/
│   ├── LanguageSwitch.tsx
│   └── LanguageSwitch.test.tsx
└── Logo/
    ├── Logo.tsx
    └── Logo.test.tsx
```

Cada carpeta = un componente con una sola responsabilidad (regla 3). Cada uno tiene su propio test (regla 3 y 8). Los átomos no conocen el contenido del portfolio ni importan de `messages/` ni de `src/content/` (regla 5); todo el contenido visible llega por prop.

Cobertura RF: RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8.

---

## 2. Modelo de datos

El modelo de datos son los props tipados de cada átomo. TypeScript los declara; no hay capa de datos separada ni store ni contexto (reglas 3 y 5). Los nombres de prop y tipos van en inglés (regla 11).

### 2.1 Button

| Prop | Tipo | Obligatorio | Descripción |
|------|------|-------------|-------------|
| children | ReactNode | sí | Contenido visible del botón (texto o símbolo) |
| onClick | () => void | sí | Acción al activar |
| disabled | boolean | no | Si true, no ejecuta acción y reduce opacidad |
| icon | ReactNode | no | Símbolo gráfico opcional de Iconoir |
| ariaLabel | string | no | Etiqueta accesible si no hay texto visible |

Ejemplo de instancia:

```json
{
  "children": null,
  "onClick": "<función del consumidor>",
  "disabled": false,
  "icon": "<SvgIconoir />",
  "ariaLabel": "Alternar tema"
}
```

### 2.2 Link

| Prop | Tipo | Obligatorio | Descripción |
|------|------|-------------|-------------|
| children | ReactNode | sí | Contenido visible del enlace |
| href | string | sí | Destino de navegación |
| target | "_self" \| "_blank" | no | Contexto de navegación |
| icon | ReactNode | no | Símbolo gráfico opcional de Iconoir |
| ariaLabel | string | no | Etiqueta accesible si no hay texto visible |

Ejemplo de instancia:

```json
{
  "children": "Contacto",
  "href": "/en#contact",
  "target": "_self",
  "icon": null,
  "ariaLabel": null
}
```

### 2.3 Heading

| Prop | Tipo | Obligatorio | Descripción |
|------|------|-------------|-------------|
| children | ReactNode | sí | Texto del encabezado |
| level | 1 \| 2 \| 3 \| 4 \| 5 \| 6 | no | Nivel semántico (default 2) |

Ejemplo de instancia:

```json
{
  "children": "Experience",
  "level": 2
}
```

### 2.4 Tag

| Prop | Tipo | Obligatorio | Descripción |
|------|------|-------------|-------------|
| children | string | sí | Texto corto de la etiqueta |

Ejemplo de instancia:

```json
{
  "children": "Next.js"
}
```

### 2.5 Section (contenedor de sección y retícula)

| Prop | Tipo | Obligatorio | Descripción |
|------|------|-------------|-------------|
| children | ReactNode | sí | Bloques de contenido de la sección |
| grid | boolean | no | Si true, muestra retícula de 1 px (default true) |

Ejemplo de instancia:

```json
{
  "children": "<Heading />...",
  "grid": true
}
```

### 2.6 ThemeToggle

| Prop | Tipo | Obligatorio | Descripción |
|------|------|-------------|-------------|
| onToggle | () => void | sí | Se dispara al activar el símbolo |
| pressed | boolean | sí | Estado actual del tema (para aria-pressed) |
| ariaLabel | string | sí | Texto anunciado en ambos idiomas, provisto por el consumidor desde `messages/` |
| icon | ReactNode | no | Símbolo gráfico (Iconoir) |

Ejemplo de instancia:

```json
{
  "onToggle": "<función del consumidor>",
  "pressed": false,
  "ariaLabel": "Cambiar a tema oscuro",
  "icon": "<SvgMoon />"
}
```

### 2.7 LanguageSwitch (toggler)

| Prop | Tipo | Obligatorio | Descripción |
|------|------|-------------|-------------|
| locale | "en" \| "es" | sí | Idioma actual (para aria-pressed y para calcular el otro idioma) |
| ariaLabelEn | string | sí | Texto anunciado al cambiar a inglés, provisto por el consumidor desde `messages/` |
| ariaLabelEs | string | sí | Texto anunciado al cambiar a español, provisto por el consumidor desde `messages/` |

Ejemplo de instancia:

```json
{
  "locale": "en",
  "ariaLabelEn": "Switch to English",
  "ariaLabelEs": "Cambiar a español"
}
```

### 2.8 Logo

| Prop | Tipo | Obligatorio | Descripción |
|------|------|-------------|-------------|
| href | string | sí | Destino (inicio del sitio) |
| src | string | no | Ruta al archivo SVG (por defecto `/logo.svg`) |
| alt | string | no | Texto alternativo |
| children | ReactNode | no | Contenido alternativo si no se usa src |

Ejemplo de instancia:

```json
{
  "href": "/en",
  "src": "/logo.svg",
  "alt": "Pedro Suárez Gallardo",
  "children": null
}
```

Cobertura RF: RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8.

---

## 3. Algoritmos clave (pseudocódigo)

No hay lógica de negocio compleja en los átomos; son componentes de presentación. Los algoritmos clave son de render condicional y manejo de eventos, sin estado propio salvo lo estrictamente necesario para la accesibilidad del teclado.

### 3.1 Render graceful (aplica a todos los átomos)

```
FUNCTION render(props):
    IF missing_required_props(props):
        RETURN null
    RETURN jsx_con_contenido_de(props)
```

Si faltan props obligatorias, no se renderiza nada visible y no se lanza error (regla de robustez del spec y caso límite).

Cobertura RF: todos (propósito transversal), casos límite de Button, Link, Tag, Logo.

### 3.2 Button: hover e interacción

```
ON mouseEnter:
    IF NOT disabled:
        INVERTIR_COLORES()

ON mouseLeave:
    IF NOT disabled:
        RESTAURAR_COLORES()

ON click / ON keypress (Enter o Space):
    IF disabled:
        RETURN  // no ejecuta acción, no hay indicador de foco interactivo
    onClick()

ON focus (teclado):
    MOSTRAR_INDICADOR_FOCO()
```

Cobertura RF: RF-1.

### 3.3 Link: hover, target y validación de destino

```
ON mouseEnter:
    INVERTIR_COLORES()

ON mouseLeave:
    RESTAURAR_COLORES()

ON click:
    IF href_es_invalido_o_vacio(href):
        PREVENIR_NAVEGACIÓN()
        RETURN
    IF target == "_blank":
        ABRIR_EN_NUEVA_PESTAÑA(href)
    ELSE:
        NAVEGAR_A(href)

ON focus (teclado):
    MOSTRAR_INDICADOR_FOCO()
```

Cobertura RF: RF-2.

### 3.4 Heading: nivel semántico

```
RENDER:
    ETIQUETA = level ?? "h2"   // valor por defecto del tema
    RENDER <ETIQUETA>{children}</ETIQUETA>
```

Cobertura RF: RF-3.

### 3.5 Tag: texto mono

```
RENDER:
    <span class="tag-mono">{children}</span>
```

Cobertura RF: RF-4.

### 3.6 Section: contenedor y retícula

```
RENDER:
    <section>
        IF grid:
            <div class="reticula-1px" />
        {children}
    </section>
```

Cobertura RF: RF-5.

### 3.7 ThemeToggle: símbolo sin texto

```
ON click / ON keypress:
    onToggle()

RENDER:
    <button
        aria-pressed={pressed}
        aria-label={ariaLabel}
        onClick={manejarClick}
        onKeyDown={manejarTeclado}
    >
        {icon ?? <SímboloPorDefecto />}
    </button>
```

El estado del tema (`pressed`, `ariaLabel`) lo administra el consumidor (sección o layout), no el átomo (regla 5: los átomos solo reciben contenido por prop).

Cobertura RF: RF-6.

### 3.8 LanguageSwitch: toggler de un solo botón

```
ON click / ON keypress (Enter o Space):
    navegar al otro idioma (en <-> es)
    preservar search y hash

RENDER:
    <a role="button"
        href={href al otro idioma}
        aria-pressed={locale === 'en'}   // true si inglés está activo
        aria-label={locale === 'en' ? ariaLabelEs : ariaLabelEn}  // anuncia el destino
        onClick={prevenir click nativo y hacer router.replace}
    >
        {símbolo globo}
    </a>
```

Cobertura RF: RF-7.

### 3.9 Logo: símbolo D con currentColor

```
RENDER:
    <a href={href}>
        IF src:
            <img src={src} alt={alt ?? ""} />
        ELSE IF children:
            {children}
        ELSE:
            <svg viewBox="0 0 64 64" style={{ color: "currentColor" }}>
                <use href="#d" />
            </svg>
    </a>
```

El color se resuelve mediante `currentColor` heredado del tema activo (negro cálido `#121110` en modo claro, crudo cálido `#F2EFE6` en modo oscuro), sin declarar colores propios dentro del componente (spec 03 define los tokens; el átomo no los duplica, regla 4).

Cobertura RF: RF-8.

---

## 4. Contratos de interfaz

Cada contrato declara: entradas (props), salidas (JSX renderizado y eventos) y errores (comportamiento ante entradas inválidas).

### 4.1 Button

- Entradas: `children` (ReactNode, obligatorio), `onClick` (función, obligatorio), `disabled` (boolean, opcional), `icon` (ReactNode, opcional), `ariaLabel` (string, opcional).
- Salidas: elemento `<button>` con tipo `button`, indicador de foco visible al enfoque por teclado, colores invertidos en hover cuando está habilitado, opacidad reducida y sin acción cuando está deshabilitado.
- Errores: si faltan `children` o `onClick`, renderiza `null` sin romper la página.

### 4.2 Link

- Entradas: `children` (ReactNode, obligatorio), `href` (string válido, obligatorio), `target` (opcional), `icon` (opcional), `ariaLabel` (opcional).
- Salidas: elemento `<a>` con `href`, colores invertidos en hover, indicador de foco visible al enfoque por teclado, navegación al destino (misma pestaña o nueva según `target`).
- Errores: si `href` es inválido o vacío, no navega y no rompe la página; si faltan `children` o `href`, renderiza `null`.

### 4.3 Heading

- Entradas: `children` (ReactNode, obligatorio), `level` (1-6, opcional, default 2).
- Salidas: elemento de encabezado semántico (`h1`-`h6`) con escala tipográfica editorial.
- Errores: si falta `children`, renderiza `null`; si `level` está fuera de rango, usa el valor por defecto.

### 4.4 Tag

- Entradas: `children` (string, obligatorio).
- Salidas: etiqueta monoespaciada con el texto recibido.
- Errores: si falta `children` o está vacío, renderiza `null`.

### 4.5 Section

- Entradas: `children` (ReactNode, obligatorio), `grid` (boolean, opcional, default true).
- Salidas: contenedor `<section>` con retícula de líneas de 1 px cuando `grid` es true.
- Errores: si falta `children`, renderiza `null`.

### 4.6 ThemeToggle

- Entradas: `onToggle` (función, obligatorio), `pressed` (boolean, obligatorio), `ariaLabel` (string, obligatorio), `icon` (ReactNode, opcional).
- Salidas: botón `<button>` con `aria-pressed` y `aria-label`, símbolo gráfico, dispara `onToggle` al activar.
- Errores: si faltan `onToggle`, `pressed` o `ariaLabel`, renderiza `null`.

### 4.7 LanguageSwitch

- Entradas: `locale` ("en" \| "es", obligatorio), `ariaLabelEn` (string, obligatorio), `ariaLabelEs` (string, obligatorio).
- Salidas: `<a role="button">` con `href` al otro idioma, `aria-pressed` reflejando el idioma actual, `aria-label` anunciando el idioma al que se va, símbolo gráfico, navega al otro idioma al activar preservando search y hash.
- Errores: si faltan `locale`, `ariaLabelEn` o `ariaLabelEs`, renderiza `null`.

### 4.8 Logo

- Entradas: `href` (string, obligatorio), `src` (string, opcional, default `/logo.svg`), `alt` (string, opcional), `children` (ReactNode, opcional).
- Salidas: enlace `<a>` al inicio del sitio con la letra "D" (símbolo `id="d"` de `public/logo.svg`) renderizada con `currentColor`, adaptada al tema activo.
- Errores: si falta `href`, renderiza `null`; si faltan `src`, `alt` y `children`, renderiza `null`.

Cobertura RF: RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8.

---

## 5. Decisiones técnicas justificadas

### 5.1 `currentColor` para el Logo en lugar de colores hardcodeados por modo

**Decisión:** El Logo usa `currentColor` y referencia el símbolo `id="d"` de `public/logo.svg`; el color se resuelve desde el tema activo (negro cálido `#121110` claro / crudo cálido `#F2EFE6` oscuro) sin declarar colores propios dentro del componente.

**Alternativa descartada:** Declarar dos colores fijos dentro del componente (`#121110` y `#F2EFE6`) según una prop de modo.

**Justificación:** Respeta la regla 4 (no hay valores mágicos repetidos; los colores salen de los tokens del tema en `globals.css`, definidos en la spec 03) y la regla 5 (el átomo no conoce datos del portfolio ni decide el tema; solo recibe y renderiza). También evita acoplar al Logo al sistema de tema, manteniéndolo genérico.

Cobertura RF: RF-8.

### 5.2 Los átomos emiten callbacks; el estado de tema e idioma vive fuera

**Decisión:** `ThemeToggle` y `LanguageSwitch` no importan contexto de tema ni de idioma. Reciben `onToggle` / `onChange`, `pressed` / `currentLang` y `ariaLabel` por prop, y disparan eventos al consumidor.

**Alternativa descartada:** Que los átomos lean directamente el contexto de tema (`useTheme`) o de idioma (`useLocale`) y gestionen su propio estado.

**Justificación:** Respeta la regla 5 (los componentes de `ui/` solo reciben contenido por prop y no conocen el contenido ni el estado global del portfolio) y la regla 3 (una sola responsabilidad; los átomos son de presentación, no de estado). El estado y la persistencia de tema/idioma pertenecen a la spec 03 y a quien compone los átomos (sección o layout).

Cobertura RF: RF-6, RF-7.

### 5.3 Una carpeta por componente, sin barrel files

**Decisión:** Cada átomo vive en su propia carpeta (`Nombre/Nombre.tsx` + `Nombre/Nombre.test.tsx`). No existe `src/components/ui/index.ts`.

**Alternativa descartada:** Carpeta plana `src/components/ui/` con todos los componentes y un `index.ts` que reexporta todo.

**Justificación:** Respeta la regla 3 (un componente = una carpeta) y la regla 7 (no hay barrel files; estructura estable de dos niveles). También facilita encontrar tests y evita importaciones implícitas.

Cobertura RF: todos (estructura transversal).

### 5.4 SVG inline con `<use href="#d">` en lugar de `` por defecto

**Decisión:** El Logo renderiza por defecto el símbolo `id="d"` de `public/logo.svg` mediante SVG inline con `<use>`, aceptando `src` como alternativa.

**Alternativa descartada:** Usar siempre `<img src="/logo.svg" alt={alt} />`.

**Justificación:** SVG inline permite que `currentColor` herede el color del tema automáticamente (negro cálido / crudo cálido) sin estilos adicionales, y evita una petición de red separada para un ícono que ya está embebido en el archivo fuente. Respeta el minimalismo espectacular (regla 12) y el rendimiento (sin recursos de red bloqueantes, regla 9 de la constitución / RNF-2 de la spec 03).

Cobertura RF: RF-8.

### 5.5 Sin animación propia en los átomos; la entrada/salida se delega a `Reveal` (spec 05)

**Decisión:** Ningún átomo incluye `@keyframes`, `animation-timeline` ni clases de animación. Cuando una sección consume un átomo, lo envuelve externamente en el componente `Reveal` de la spec 05.

**Alternativa descartada:** Que cada átomo reciba una prop `variant` (`rise | clip | fade`) y anime su propia entrada/salida.

**Justificación:** Respeta la espec 04 (los átomos no incluyen animación propia) y la spec 05 (el movimiento de scroll es responsabilidad exclusiva de `Reveal`). También respeta la regla 12 (movimiento solo con CSS, sin librerías) y la regla 14 (contenido siempre visible sin JS ni soporte de animaciones por scroll; los átomos no dependen de animación para verse).

Cobertura RF: todos (movimiento transversal), requisito no funcional de movimiento.

---

## 6. Estrategia de tests

Los tests se escriben antes que el código (regla 8 de la constitución y criterio de finalización del spec). Se ejecutan con Vitest + React Testing Library en `jsdom`. No se usan snapshots, no se comprueban clases de Tailwind, no se escriben tests solo para subir la cobertura (regla 8). Cada test verifica comportamiento visible para el usuario: contenido mostrado, roles y etiquetas accesibles, variantes, interacción y estados.

### 6.1 Enfoque por átomo

| Átomo | Qué se testa (comportamiento visible) | RF cubierto |
|-------|--------------------------------------|-------------|
| Button | Click ejecuta `onClick`; hover invierte colores; focus por teclado muestra indicador; `disabled` bloquea click y reduce opacidad; sin props obligatorios renderiza `null` | RF-1 |
| Link | Click navega a `href` válido; hover invierte colores; `target="_blank"` abre nueva pestaña; `href` inválido no navega; focus por teclado muestra indicador; sin props obligatorios renderiza `null` | RF-2 |
| Heading | Renderiza el nivel semántico indicado (h1-h6); muestra el texto por prop; escala tipográfica aplicada; sin `children` renderiza `null` | RF-3 |
| Tag | Renderiza texto corto como etiqueta monoespaciada; vacío renderiza `null` | RF-4 |
| Section | Muestra retícula de 1 px cuando `grid=true`; oculta retícula cuando `grid=false`; muestra hijos por prop; sin `children` renderiza `null` | RF-5 |
| ThemeToggle | Dispara `onToggle` al activar; `aria-pressed` refleja `pressed`; `aria-label` se anuncia; sin texto visible, solo símbolo; sin props obligatorios renderiza `null` | RF-6 |
| LanguageSwitch | Un único botón toggler que alterna entre idiomas; `aria-pressed` refleja el idioma actual; `aria-label` anuncia el idioma destino; navega al otro idioma en click y Enter/Space preservando search y hash; sin props obligatorios renderiza `null` | RF-7 |
| Logo | Renderiza la letra "D" del símbolo `id="d"`; enlace al `href` indicado; color se adapta al tema vía `currentColor`; sin `href` o sin contenido renderiza `null` | RF-8 |

### 6.2 Pruebas de accesibilidad (regla 14)

- Contraste AA verificado en ambos modos (claro y oscuro) para texto, texto atenuado, líneas y foco (delegado en spec 03 para los tokens; aquí se testa que los átomos usan los tokens sin override).
- Navegación por teclado: `Tab` alcanza todos los botones y enlaces; `Enter`/`Space` activan botones; `Enter` activa enlaces.
- Indicador de foco visible en todos los elementos interactivos.
- `aria-label` y `aria-pressed` presentes en `ThemeToggle` y `LanguageSwitch`.
- Semántica correcta: `<button>` para acciones, `<a>` para navegación, niveles de encabezado correctos.

### 6.3 Pruebas de robustez (casos límite del spec)

- Props obligatorias faltantes → renderiza `null`, sin error visible ni ruptura de la página.
- `disabled` en Button con puntero sobre él → no ejecuta acción, opacidad reducida, sin indicador de foco interactivo.
- `href` inválido o vacío en Link → no navega, no rompe la página.
- `Tag` vacío → renderiza `null`.
- `Heading` sin `level` → usa valor por defecto del tema.
- Logo sin `src`, `alt` ni `children` → renderiza `null`.

### 6.4 Pruebas de movimiento y reduced motion

- Con `prefers-reduced-motion: reduce`, los átomos no animan; el contenido sigue visible en cualquier posición (delegado en spec 05 para `Reveal`; aquí se testa que los átomos no incluyen animación propia).
- Sin soporte de `animation-timeline: view()`, los átomos siguen siendo visibles (fallback estático).

### 6.5 Cobertura

- Umbral global ≥ 95 % en líneas, funciones, ramas y sentencias, forzado por Vitest (regla 9 de la constitución).
- Se excluyen de cobertura: configuración, tests, `*.d.ts`, helpers de test, ficheros de ruta de `src/app/` y datos de `src/content/` (regla 9). Nada fuera de `src/` se mide.
- Los tests de los átomos viven junto a cada componente (`Nombre/Nombre.test.tsx`) y cuentan para la cobertura global.

### 6.6 e2e (Playwright)

- Cuando se toca idioma, tema, navegación o movimiento, se ejecuta `pnpm test:e2e` (regla 10 de la constitución).
- Para esta spec 04, los flujos e2e relevantes son: cambio de tema y cambio de idioma (cubiertos en specs 03 y 02 respectivamente), ya que los átomos `ThemeToggle` y `LanguageSwitch` son consumidos por quienes manejan ese estado. Los propios átomos no requieren e2e independiente porque son unidades de presentación sin estado propio.

Cobertura RF: todos (tests escritos antes del código, criterio de finalización del spec).

---

## 7. Trazabilidad RF → partes del plan

| RF | Módulos implicados | Modelo de datos | Algoritmos | Contratos | Decisiones | Tests |
|----|-------------------|-----------------|------------|-----------|------------|-------|
| RF-1 Button | `Button/` | `Button` props | Hover, foco, disabled, click | Entrada/salida/error | 5.1, 5.3, 5.5 | 6.1 (Button), 6.2, 6.3 |
| RF-2 Link | `Link/` | `Link` props | Hover, foco, validación href, target | Entrada/salida/error | 5.3, 5.5 | 6.1 (Link), 6.2, 6.3 |
| RF-3 Heading | `Heading/` | `Heading` props | Nivel semántico | Entrada/salida/error | 5.3 | 6.1 (Heading), 6.2 |
| RF-4 Tag | `Tag/` | `Tag` props | Texto mono | Entrada/salida/error | 5.3 | 6.1 (Tag), 6.3 |
| RF-5 Section | `Section/` | `Section` props | Retícula 1 px | Entrada/salida/error | 5.3 | 6.1 (Section) |
| RF-6 ThemeToggle | `ThemeToggle/` | `ThemeToggle` props | Emitir `onToggle`, aria | Entrada/salida/error | 5.2, 5.3, 5.5 | 6.1 (ThemeToggle), 6.2, 6.3, 6.4 |
| RF-7 LanguageSwitch | `LanguageSwitch/` | `LanguageSwitch` props | Emitir navegación al otro idioma, aria | Entrada/salida/error | 5.2, 5.3, 5.5 | 6.1 (LanguageSwitch), 6.2, 6.3, 6.4 |
| RF-8 Logo | `Logo/` | `Logo` props | Render símbolo `id="d"`, currentColor | Entrada/salida/error | 5.1, 5.3, 5.4, 5.5 | 6.1 (Logo), 6.2, 6.3 |

Todos los RF del spec 04 están cubiertos por al menos una parte de este plan. No hay RF sin módulo asociado.
