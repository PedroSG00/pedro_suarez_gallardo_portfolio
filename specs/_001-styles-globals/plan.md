# 001 — Estilos globales de la aplicación — Plan técnico

**Estado:** Activo (documento de planificación que respalda la implementación)  
**Fecha:** 30 de octubre de 2026  
**Spec fuente:** `specs/001-styles-globals/spec.md` (estado: Borrador — En revisión)  
**Constitución:** `docs/constitution.md` (vigente)

> Nota: `specs/001-styles-globals-mvp/spec.md` no existe en el repositorio. Este plan se basa en `specs/001-styles-globals/spec.md` y en `docs/constitution.md`.

---

## 1. Estructura de módulos

```
app/
├── layout.tsx                 # Layout raíz. Incluye botón de tema + <ThemeSelect />.
│                              # Aplica clase .theme-light / .theme-dark / .theme-system en <html> o <body>.
│                              # RF: 2, 3, 5, 7, 16, 17
├── globals.css                # Variables CSS, roles semánticos, temas, escala editorial, transiciones, color-scheme.
│                              # RF: 1, 2, 8, 9, 10, 11, 12, 13, 14, 15, 17
│                              # NFR: 1, 3, 6, 8, 10
├── components/
│   └── ThemeSelect.tsx        # Componente de una sola responsabilidad: <select> + lógica de cambio.
│                              # RF: 3, 4, 5, 6, 7
│                              # NFR: 4, 7, 9
├── lib/
│   └── theme.ts               # Utilidades: lectura/escritura localStorage, evento storage, resolución de tema activo.
│                              # RF: 2, 4, 7
│                              # NFR: 4, 7
└── i18n/
    └── dictionaries/          # Diccionarios EN/ES con cadenas del selector y modal.
                               # NFR: 9
```

### Responsabilidades por módulo (Constitución 3)

| Módulo | Responsabilidad única | RF cubiertos |
|--------|----------------------|--------------|
| `layout.tsx` | Orquestar el layout raíz, montar el botón de tema y el componente selector, aplicar la clase de tema al documento y ofrecer el contenedor de composición full-bleed. | RF-2, RF-3, RF-5, RF-7, RF-16, RF-17 |
| `globals.css` | Definir una sola vez las variables de color, escala tipográfica editorial, espaciado, transiciones, revelados y `color-scheme`. | RF-1, RF-2, RF-8, RF-9, RF-10, RF-11, RF-12, RF-13, RF-14, RF-15, RF-17 |
| `ThemeSelect.tsx` | Renderizar el `<select>` oculto/revelado, gestionar su apertura al pulsar el botón, emitir el cambio de tema. | RF-3, RF-4, RF-5, RF-6, RF-7 |
| `theme.ts` | Leer/escribir `localStorage`, escuchar `storage`, resolver el tema activo (sistema vs manual). | RF-2, RF-4, RF-7 |
| i18n dictionaries | Almacenar cadenas visibles (selector, modal) en inglés y castellano. | NFR-9, RF-3, RF-6 |

---

## 2. Modelo de datos JSON con un ejemplo

La preferencia de tema se almacena exclusivamente en `localStorage` bajo la clave `theme` (NFR-7).

### Esquema JSON

```json
{
  "theme": "light" | "dark" | "system"
}
```

### Ejemplo de contenido en `localStorage`

```json
{
  "theme": "dark"
}
```

### Semántica de valores

| Valor | Significado | Comportamiento |
|-------|-------------|----------------|
| `"light"` | Tema claro forçado | Se aplica `--warm-*` claro; `color-scheme: light`. |
| `"dark"` | Tema oscuro forçado | Se aplica `--warm-*` oscuro; `color-scheme: dark`. |
| `"system"` | Seguir el SO | `color-scheme: light dark`; se escucha `prefers-color-scheme`. |

### Reglas de integridad (RF-4)

- Si el valor leído no es `"light"`, `"dark"` ni `"system"`, se ignora y se usa la preferencia del sistema (caso límite 5).
- Si `localStorage` está bloqueado o lleno, la opción se aplica en sesión y se pierde al cerrar (caso límite 6).
- La escritura es silenciosa: no se muestran errores al usuario (RF-4, caso límite 5 y 6).

---

## 3. Algoritmo de cálculo de racha en pseudocódigo

**Interpretación de "racha" en este contexto:** racha de consistencia de la base visual. Cuántos elementos de UI/herencias consecutivas aplican correctamente la base visual sin redefinir estilos ni colores fuera de paleta (RF-16). Este algoritmo se usa para validar, en tiempo de compilación o en tests, que ninguna página o sección rompe la base visual.

```text
ALGORITMO: calcularRachaConsistenciaVisual(paginas: Lista<Pagina>)
ENTRADA:
  paginas: lista de páginas del sitio, cada una con:
    - id: string
    - usaColoresFueraPaleta: boolean
    - redefineTipografia: boolean
    - redefineEspaciado: boolean
    - redefineTransiciones: boolean
    - tieneFocoVisible: boolean
    - enlacesSinColorSolo: boolean
    - tieneMomentoVisual: boolean
    - textoEnMedidaLegible: boolean

SALIDA:
  rachaActual: número entero (racha actual de páginas consistentes)
  rachaMaxima: número entero (racha máxima encontrada)
  paginasInconsistentes: lista de IDs de páginas que rompen la base visual

PROCEDIMIENTO:
  rachaActual <- 0
  rachaMaxima <- 0
  paginasInconsistentes <- lista vacía

  PARA cada pagina EN paginas HACER
    consistente <- VERDADERO

    SI pagina.usaColoresFueraPaleta ES VERDADERO ENTONCES
      consistente <- FALSO
    FIN SI

    SI pagina.redefineTipografia ES VERDADERO ENTONCES
      consistente <- FALSO
    FIN SI

    SI pagina.redefineEspaciado ES VERDADERO ENTONCES
      consistente <- FALSO
    FIN SI

    SI pagina.redefineTransiciones ES VERDADERO ENTONCES
      consistente <- FALSO
    FIN SI

    SI pagina.tieneFocoVisible ES FALSO ENTONCES
      consistente <- FALSO
    FIN SI

    SI pagina.enlacesSinColorSolo ES FALSO ENTONCES
      consistente <- FALSO
    FIN SI

    SI pagina.tieneMomentoVisual ES FALSO ENTONCES
      consistente <- FALSO
    FIN SI

    SI pagina.textoEnMedidaLegible ES FALSO ENTONCES
      consistente <- FALSO
    FIN SI

    SI consistente ES VERDADERO ENTONCES
      rachaActual <- rachaActual + 1
      SI rachaActual > rachaMaxima ENTONCES
        rachaMaxima <- rachaActual
      FIN SI
    SINO
      paginasInconsistentes.agregar(pagina.id)
      rachaActual <- 0
    FIN SI
  FIN PARA

  RETORNAR (rachaActual, rachaMaxima, paginasInconsistentes)
FIN ALGORITMO

COMPLEJIDAD:
  Tiempo: O(n) donde n es el número de páginas.
  Espacio: O(m) donde m es el número de páginas inconsistentes.

RF CUBIERTOS:
  RF-16 (coherencia de la base visual en todo el sitio).
  RF-17 (impacto visual deliberado y memorable por página).
  RF-13 (foco visible).
  RF-14 (enlaces sin color de acento).
  NFR-10 (impacto sin dependencias ni sacrificio de legibilidad).
```

---

## 4. Contrato de los estilos globales

### 4.1 Comandos

| Comando | Propósito | RF/NFR cubiertos |
|---------|-----------|------------------|
| `pnpm dev` | Servidor de desarrollo con recarga en caliente. Todos los estilos aplicados. | Todos |
| `pnpm build` | Build de producción. Verifica que no haya errores de tipado ni estilos rotos. | Todos |
| `pnpm start` | Servir el build de producción localmente. | Todos |
| `pnpm lint` | ESLint sobre todo el código fuente. | NFR-8, Constitución 1 |
| `pnpm typecheck` | `tsc --noEmit` para verificar tipos TypeScript. | Constitución 1, 2 |
| `pnpm test` | Suite de pruebas unitarias (Vitest + RTL) e e2e (Playwright). | Constitución 4, RF-2 a RF-16 |

### 4.2 Salidas esperadas

| Salida | Descripción | RF/NFR |
|--------|-------------|--------|
| Archivo CSS crítico inline | Variables CSS y reglas de tema en el `<head>` para evitar destellos (FOUC). | RF-7, NFR-3 |
| Clase `.theme-light` / `.theme-dark` / `.theme-system` en `<html>` | Controla qué conjunto de variables CSS se activa. | RF-2, RF-3 |
| `localStorage` clave `theme` | Persistencia de la elección manual. | RF-4, NFR-7 |
| Evento `storage` entre pestañas | Sincronización de tema sin recarga. | RF-4 |
| `<dialog>` no modal (`show()`) | Mensaje informativo accesible sin bloquear interacción. | RF-6 |

### 4.3 Códigos de salida

| Código | Significado | Acción requerida |
|--------|-------------|------------------|
| `0` | Éxito: lint, typecheck y tests en verde. | Ninguna. |
| `1` | Error de lint o typecheck. | Corregir antes de continuar (Constitución 2, 4). |
| `2` | Pruebas unitarias o e2e fallidas. | Corregir tests o implementación (Constitución 4). |
| `3` | Build de producción fallido por estilos o assets. | Revisar `globals.css` y variables CSS. |

### 4.4 Variables CSS (contrato público)

Definidas una sola vez en `app/globals.css` (NFR-6). Todos los componentes consumen estas variables; no se duplican valores a mano.

| Variable | Rol semántico | Tema claro | Tema oscuro | RF |
|----------|--------------|-------------|-------------|-----|
| `--color-bg` | Fondo general | `var(--warm-1)` | `#1a1a1a` | RF-1 |
| `--color-surface` | Superficie elevada | `var(--warm-2)` | `var(--warm-5)` | RF-1 |
| `--color-text-primary` | Texto principal | `#1a1a1a` | `var(--warm-1)` | RF-1, NFR-1 |
| `--color-text-secondary` | Texto secundario | `var(--warm-5)` | `var(--warm-3)` | RF-1 |
| `--color-border` | Bordes y separadores | `var(--warm-3)` | `var(--warm-4)` | RF-1 |
| `--color-inverse-bg` | Superficie invertida | `#1a1a1a` | `var(--warm-1)` | RF-1 |
| `--color-inverse-text` | Texto sobre superficie invertida | `var(--warm-1)` | `#1a1a1a` | RF-1 |
| `--color-focus` | Anillo de foco | `#000000` | `#ffffff` | RF-13, NFR-1 |
| `--color-selection` | Selección de texto | `var(--warm-4)` | `var(--warm-3)` | RF-15, NFR-1 |
| `--warm-1` a `--warm-5` | Escala de grises cálidos | Valores fijos (§4.1 spec) | Valores fijos | RF-1 |

**Escala de impacto (nuevos tokens del contrato):**

| Token | Rol | Valor orientativo | RF |
|-------|-----|-------------------|-----|
| `--type-display` | Titular *display* que actúa como elemento gráfico | `clamp(3.5rem, 11vw, 9rem)` | RF-9, RF-10, RF-17 |
| `--type-page-title` | Título de página | `clamp(2.5rem, 7vw, 5rem)` | RF-10 |
| `--type-section-title` | Título de sección | `clamp(1.75rem, 4vw, 3rem)` | RF-10 |
| `--type-body` | Cuerpo legible | `1rem` con `line-height: 1.7` | RF-10 |
| `--measure` | Medida máxima del texto corrido | `65ch` | RF-12 |
| `--gutter` | Margen lateral fluido | `clamp(1.25rem, 5vw, 4rem)` | RF-11, RF-12 |
| `--section-space` | Separación entre secciones | `clamp(5rem, 12vw, 10rem)` | RF-11, RF-17 |
| `--layout-wide` | Ancho de composición *full-bleed* | `100%` | RF-12, RF-17 |

**Transiciones y revelados:**
- `--transition-theme: 250ms ease-in-out` (dentro del rango 150–400 ms, RF-8).
- `--transition-reveal: 550ms cubic-bezier(0.16, 1, 0.3, 1)` para entradas escalonadas y revelados al hacer scroll (RF-17, NFR-3).
- Con `prefers-reduced-motion: reduce` → `0ms` y contenido visible desde el primer render (RF-8, RF-17, HU-5).

**Tipografía:**
- `--font-mono: "Geist Mono", monospace` (RF-9, RF-10).
- `font-weight: 400` solo para jerarquía; la escala *display* y el contraste tipográfico sustituyen a la negrita (RF-10, RF-17).
- Los titulares usan `letter-spacing` negativo moderado y `text-wrap: balance`; el texto corrido mantiene `65ch` (RF-12).

**Espaciado y composición:**
- Escala corta basada en `rem`, complementada con espacio negativo generoso en secciones (RF-11).
- Contenedor de lectura `max-width: 65ch`; los bloques *full-bleed* usan todo el ancho con `--gutter` para no tocar los bordes (RF-12, RF-17).
- Cada página incluye al menos un bloque invertido, titular *display*, retícula visible o composición asimétrica como momento visual deliberado (RF-17).

---

## 5. Decisiones técnicas justificadas (y alternativa descartada)

| Decisión | Alternativa descartada | Justificación | RF cubiertos |
|----------|----------------------|---------------|--------------|
| Botón de tema siempre visible + `<select>` oculto, revelado al pulsar el botón | `<select>` visible desde el inicio (rompe RF-5 "oculto por defecto"); botón secreto / atajo de teclado (poco descubrible para reclutadores, HU-1). | El botón da un disparador real al ciclo oculto→revelado sin romper "oculto por defecto". Cumple RF-5 y RF-3 (control visible en todas las páginas a través del botón). | RF-3, RF-5 |
| `<dialog>` con `show()` (no `showModal()`) | `<dialog>` con `showModal()` (bloqueante, atrapa foco); región `role="alert"` sin diálogo (menos semántico). | `show()` es no bloqueante, accesible, no atrapa foco y permite interacción con el resto de la página. Cumple RF-6. | RF-6 |
| `localStorage` clave `theme` con valores `"light"`, `"dark"`, `"system"` | Cookies, IndexedDB, URL query params. | `localStorage` es síncrono, simple, no envía datos a terceros (NFR-7 privacidad), y soporta evento `storage` para sincronización entre pestañas (RF-4). | RF-4, NFR-7 |
| Evento `storage` para sincronización entre pestañas | Broadcast Channel, SharedWorker, polling. | `storage` es nativo del navegador, no requiere dependencias (NFR-8), y funciona sin recargar (RF-4). | RF-4 |
| Propiedad CSS nativa `color-scheme` | Variable CSS propia + JS para controles nativos. | `color-scheme` es el estándar web para declarar el tema a controles nativos (scrollbars, campos, menús). Cumple RF-2 sin JS. | RF-2 |
| `font-display: swap(false)` para Geist Mono | `font-display: swap` (default) o `block`. | `swap(false)` evita el desplazamiento de contenido por la carga de la fuente (RF-9, NFR-3). | RF-9, NFR-3 |
| Variables CSS con nombres en inglés (`--warm-1`, `--color-bg`, etc.) | Nombres en español o sin nombres (valores hardcodeados). | Constitución 6: "Inglés en el código". Facilita mantenimiento y equipo internacional. | Constitución 6, NFR-6 |
| Componente `<ThemeSelect />` reutilizable en lugar de `<select>` plano en `layout.tsx` | `<select>` plano directamente en `layout.tsx` (p18 A del conflicto anterior se resolvió como A, es decir, componente). | Constitución 3: componentes pequeños, una sola responsabilidad, reutilizables y testeables. | Constitución 3, RF-3, RF-5 |
| Cadenas del selector y modal en diccionarios i18n (EN/ES) | Cadenas hardcodeadas en el componente. | Constitución 5: contenido en diccionarios versionados. NFR-9: bilingüe. | NFR-9, RF-3, RF-6 |
| Impacto visual mediante escala editorial, composición, contraste y espacio negativo | Añadir color de acento, gradientes, ilustraciones recargadas o efectos 3D. | Mantiene la identidad crudo/negro y la accesibilidad, evita dependencias y consigue una personalidad editorial reconocible. | RF-1, RF-9, RF-10, RF-11, RF-12, RF-17, NFR-10 |
| Revelados de entrada y microinteracciones con CSS/Tailwind | Librería de animación (GSAP, Framer Motion...). | NFR-8 y NFR-10 prohíben dependencias nuevas y assets pesados; CSS cubre entradas escalonadas, hover y respeto a `prefers-reduced-motion` con menos peso. | RF-17, NFR-3, NFR-8, NFR-10 |
| Composición *full-bleed* para elementos gráficos con texto corrido a 65ch | Limitar todo el layout a 65ch. | Separa medida de lectura de composición visual: la página gana impacto sin perder legibilidad. | RF-12, RF-17 |

---

## 6. Estrategia de tests (Constitución 4)

### 6.1 Tests unitarios (Vitest + React Testing Library)

| Grupo de tests | Qué se prueba | RF cubiertos | Archivo sugerido |
|----------------|---------------|--------------|------------------|
| `theme.util.test.ts` | Lectura/escritura `localStorage`, resolución de tema activo (sistema vs manual), manejo de valor inválido, almacenamiento bloqueado. | RF-2, RF-4, caso límite 5, 6 | `app/lib/theme.util.test.ts` |
| `ThemeSelect.test.tsx` | `<select>` oculto por defecto, revelado tras pulsar botón, opciones claro/oscuro/sistema, cambio inmediato sin recarga, accesibilidad (nombre accesible EN/ES, teclado). | RF-3, RF-5, RF-6 | `app/components/ThemeSelect.test.tsx` |
| `contrast.test.tsx` | Verificación de pares rol/fondo: texto normal ≥ 4.5:1, texto grande ≥ 3:1, foco ≥ 3:1, interfaz ≥ 3:1 en ambos temas. | NFR-1, RF-13 | `app/lib/contrast.test.ts` |

### 6.2 Tests end-to-end (Playwright)

| Flujo e2e | Qué se verifica | RF cubiertos | Archivo sugerido |
|-----------|-----------------|--------------|------------------|
| `theme-flow.e2e.ts` | Primera visita: tema según SO (claro/oscuro), sin destello. Cambio manual claro→oscuro→sistema. Persistencia al recargar. Sincronización entre dos pestañas. Revelado del `<select>` tras primer clic en botón. Modal informativo al interactuar con selector. | RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, caso límite 1-4, 7, 18 | `tests/e2e/theme-flow.e2e.ts` |
| `accessibility.e2e.ts` | Navegación solo con teclado: foco visible en botón y `<select>`, contraste de foco ≥ 3:1, enlaces identificables sin color, zoom 200 %, reflow a 320 px sin scroll horizontal. | RF-13, RF-14, NFR-2, caso límite 12 | `tests/e2e/accessibility.e2e.ts` |
| `motion.e2e.ts` | Con `prefers-reduced-motion: reduce`, cambio de tema instantáneo, sin animaciones. | RF-8, HU-5, caso límite 10 | `tests/e2e/motion.e2e.ts` |
| `visual-identity.e2e.ts` | Cada página renderiza al menos un momento visual deliberado (titular *display* o bloque invertido), el texto corrido no supera 65ch, las composiciones *full-bleed* no generan scroll horizontal y los revelados se desactivan con movimiento reducido. | RF-11, RF-12, RF-17, NFR-10, casos límite 19-20 | `tests/e2e/visual-identity.e2e.ts` |

### 6.3 Criterios de aceptación como tests (Constitución 4)

Cada criterio de aceptación (EARS) de RF-1 a RF-17 tiene al menos un test automatizado asociado. Nada se da por terminado con tests, lint o typecheck en rojo.

---

## 7. Matriz de cobertura RF → partes del plan

| RF | Estructura de módulos | Modelo JSON | Algoritmo racha | Contrato | Decisiones técnicas | Estrategia de tests |
|----|----------------------|-------------|-----------------|----------|---------------------|---------------------|
| RF-1 | globals.css | — | — | Variables CSS | Paleta, nombres inglés | contrast.test.tsx |
| RF-2 | layout.tsx, theme.ts | — | — | `color-scheme`, clases | `color-scheme` nativo | theme-flow.e2e.ts |
| RF-3 | layout.tsx, ThemeSelect.tsx | — | — | `<select>`, botón | Botón + select, componente | ThemeSelect.test.tsx, theme-flow.e2e.ts |
| RF-4 | ThemeSelect.tsx, theme.ts | `localStorage` schema | — | `localStorage`, evento storage | `localStorage`, evento storage | theme-flow.e2e.ts |
| RF-5 | ThemeSelect.tsx, layout.tsx | — | — | Revelado/oculto | Botón disparador | ThemeSelect.test.tsx, theme-flow.e2e.ts |
| RF-6 | ThemeSelect.tsx | — | — | `<dialog show()>` | `show()` no bloqueante | ThemeSelect.test.tsx, theme-flow.e2e.ts |
| RF-7 | layout.tsx, globals.css | — | — | CSS crítico, clases | `font-display: swap(false)` | theme-flow.e2e.ts |
| RF-8 | globals.css | — | — | Transiciones, `prefers-reduced-motion` | 250ms ease-in-out | motion.e2e.ts |
| RF-9 | globals.css | — | — | `--font-mono` | `font-display: swap(false)` | accessibility.e2e.ts |
| RF-10 | globals.css | — | — | Umbral 18px/14px itálico | No `font-weight: bold` | — |
| RF-11 | globals.css | — | — | Escala espaciado | Escala corta en `rem` | — |
| RF-12 | globals.css | — | — | `max-width: 65ch` | 65ch | accessibility.e2e.ts |
| RF-13 | globals.css | — | Algoritmo racha | `--color-focus` | Foco 3:1 | accessibility.e2e.ts |
| RF-14 | globals.css | — | Algoritmo racha | Enlaces sin color | Subrayado, no color | accessibility.e2e.ts |
| RF-15 | globals.css | — | — | `--color-selection` | Paleta para selección | — |
| RF-16 | layout.tsx, globals.css | — | Algoritmo racha | Herencia base visual | Fuente única de verdad | theme-flow.e2e.ts |
| RF-17 | layout.tsx, globals.css | — | Algoritmo racha (`tieneMomentoVisual`) | Escala de impacto, full-bleed, revelados | Escala editorial, CSS/Tailwind | visual-identity.e2e.ts |
| NFR-1 | globals.css | — | — | Contraste variables | Escala cálida verificada | contrast.test.tsx |
| NFR-7 | theme.ts | localStorage | — | Clave `theme` | Solo navegador, sin terceros | — |
| NFR-9 | i18n dictionaries | — | — | Cadenas EN/ES | Diccionarios versionados | ThemeSelect.test.tsx |
| NFR-10 | globals.css, layout.tsx | — | — | Sin dependencias ni assets pesados | Escala editorial, CSS/Tailwind, full-bleed | visual-identity.e2e.ts |
