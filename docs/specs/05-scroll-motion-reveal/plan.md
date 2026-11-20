# Plan técnico — Spec 05: Movimiento y revelado por scroll (Reveal)

Esta especificación de implementación deriva de `docs/specs/05-scroll-motion-reveal/spec.md` y cubre todos los RF-01 a RF-16. Respeta la constitución: stack cerrado (Next.js, React, TypeScript, Tailwind), CSS-only para animación por scroll, sin JS para revelado, componentes atómicos en `components/ui/` y `components/sections/`, i18n con `next-intl`, tests visibles para el usuario, cobertura ≥ 85 %, definición de terminado (punto 10 de la constitución).

Nota de ubicación: la spec funcional vive en `docs/specs/05-scroll-motion-reveal/spec.md` (según constitución, punto 2 y 7). Este plan vive junto a ella en `docs/specs/05-scroll-motion-reveal/plan.md` como documento de implementación asociado.

---

## 1. Estructura de módulos

Los componentes siguen la regla de una carpeta por componente (`Nombre/Nombre.tsx` + `Nombre/Nombre.test.tsx`), máximo ~100 líneas, una responsabilidad. No hay barrel files ni capas preventivas.

| Módulo | Responsabilidad | RF cubiertos |
|---|---|---|
| `components/ui/Reveal/Reveal.tsx` | Componente genérico que envuelve un bloque y aplica opacidad y desplazamiento según su fase de scroll. No contiene texto ni datos; todo entra por props. | RF-01, RF-02, RF-06, RF-07, RF-08, RF-14 |
| `components/ui/Reveal/Reveal.test.tsx` | Tests de unidad del comportamiento visible: opacidad en entrada/estable/salida, reversibilidad, márgenes de seguridad. | RF-01, RF-02, RF-06, RF-07 |
| `components/ui/RevealGroup/RevealGroup.tsx` | Orquesta el escalonado de hermanos dentro de un mismo grupo. Aplica desfases de posición de scroll, no de tiempo. Máximo 6 elementos con desfase propio. | RF-13, RF-14 |
| `components/ui/RevealGroup/RevealGroup.test.tsx` | Tests de grupo: escalonado entre hermanos, sin encadenamiento entre grupos, bloque suelto sin desfase, límite de 6 elementos. | RF-13 |
| `components/sections/*/SectionName.tsx` | Sección de la home (Hero, About, Experience, Stack, Contact...). Compone bloques con `Reveal` y `RevealGroup`. Lee textos de `messages/` y datos de `src/content/`. Decide qué variante (`rise`, `clip`, `fade`) usa cada bloque y qué bloques forman un grupo. | RF-01, RF-02, RF-14 (decisión de variante por sección) |
| `src/i18n/navigation.ts` | Helpers de navegación por idioma. Usados para construir anclas sin dejar bloques a medio revelar. | RF-12 |
| `src/test/renderWithIntl.tsx` | Helper de renderizado con `next-intl` para tests de sección. | Todos los RF de sección |
| `tests/e2e/scroll-motion.spec.ts` (Playwright) | Flujos críticos de scroll: revelado, reduced-motion, resize, giro, cambio de idioma/tema, salto por ancla, impresión simulada. | RF-01 a RF-16 (e2e) |

**Exclusiones (RF-11):** `Navbar`, `Footer`, `SkipLink` y cualquier elemento fijo/pegajoso nunca se envuelven en `Reveal`. Ningún elemento fijo/pegajoso puede estar dentro de un bloque revelable.

---

## 2. Modelo de datos

### 2.1. Estado del bloque (interno, no expuesto a la UI)

```text
BlockState {
  id: string                      // identificador estable del bloque
  variant: "rise" | "clip" | "fade" // variante visual asignada por la sección
  isGrouped: boolean              // pertenece a un grupo escalonado
  groupId: string | null          // id del grupo si isGrouped es true
  groupIndex: number              // posición dentro del grupo (0-based)
  offsetPoints: number            // desfase en puntos del recorrido (0-5), solo si agrupado
  isExcluded: boolean             // true para nav, footer, skip link, fijos/pegajosos
  isLastSection: boolean          // true si el bloque pertenece a la última sección (Contact)
  hasFocus: boolean               // true si contiene el elemento enfocado
}
```

### 2.2. Estado global del revelado

```text
RevealState {
  supportsScrollTimeline: boolean // detección de capacidades del navegador (CSS)
  prefersReducedMotion: boolean   // media query prefers-reduced-motion: reduce
  viewportHeight: number          // altura del viewport en px
  scrollY: number                 // posición actual de scroll en px
  pageHeight: number              // altura total del documento en px
  isPrinting: boolean             // true en modo @media print
  blocks: Map<string, BlockState> // mapa de id a estado de bloque
}
```

### 2.3. Ejemplo de modelo (página cargada, `/es`, tema oscuro, sin scroll previo)

```json
{
  "supportsScrollTimeline": true,
  "prefersReducedMotion": false,
  "viewportHeight": 900,
  "scrollY": 0,
  "pageHeight": 3200,
  "isPrinting": false,
  "blocks": {
    "hero-name": {
      "id": "hero-name",
      "variant": "clip",
      "isGrouped": false,
      "groupId": null,
      "groupIndex": null,
      "offsetPoints": null,
      "isExcluded": false,
      "isLastSection": false,
      "hasFocus": false
    },
    "hero-tagline": {
      "id": "hero-tagline",
      "variant": "fade",
      "isGrouped": true,
      "groupId": "hero-group",
      "groupIndex": 0,
      "offsetPoints": 0,
      "isExcluded": false,
      "isLastSection": false,
      "hasFocus": false
    },
    "hero-description": {
      "id": "hero-description",
      "variant": "fade",
      "isGrouped": true,
      "groupId": "hero-group",
      "groupIndex": 1,
      "offsetPoints": 1.25,
      "isExcluded": false,
      "isLastSection": false,
      "hasFocus": false
    },
    "nav-logo": {
      "id": "nav-logo",
      "variant": "fade",
      "isGrouped": false,
      "groupId": null,
      "groupIndex": null,
      "offsetPoints": null,
      "isExcluded": true,
      "isLastSection": false,
      "hasFocus": false
    }
  }
}
```

En este ejemplo, `nav-logo` está excluido (RF-11). `hero-tagline` y `hero-description` forman un grupo con desfase escalonado de posición (RF-13). `hero-name` es un bloque suelto sin desfase (RF-13).

---

## 3. Algoritmos clave en pseudocódigo

### 3.1. Cálculo de fase de un bloque (RF-01, RF-02, RF-04, RF-05, RF-06)

Entrada: estado del bloque, geometría del viewport y scroll.
Salida: fase (`"entry"`, `"stable"`, `"exit"`) y opacidad objetivo.

```
FUNCTION calculateBlockPhase(block, viewportHeight, scrollY, pageHeight):
  // Exclusiones y fallo seguro prevalecen sobre todo (RF-10, RF-11, RF-03, RF-05)
  IF block.isExcluded == true:
    RETURN { phase: "stable", opacity: 1, transform: none }

  // Fallo seguro: sin soporte de scroll timeline o movimiento reducido (RF-10)
  IF NOT supportsScrollTimeline OR prefersReducedMotion == true OR isPrinting == true:
    RETURN { phase: "stable", opacity: 1, transform: none }

  // Sin scroll suficiente: todo visible (RF-05)
  IF pageHeight <= viewportHeight:
    RETURN { phase: "stable", opacity: 1, transform: none }

  // Bloques ya visibles al cargar: sin entrada ni parpadeo inicial (RF-03)
  // Se maneja en el render inicial: si el bloque está en viewport en scrollY=0, opacity=1.

  // Obtener rectángulo del bloque respecto al viewport
  rect = block.getBoundingClientRect()
  blockTop = rect.top + scrollY
  blockBottom = rect.bottom + scrollY

  // Cuarto inferior de la pantalla: desde 75% hasta 100% de viewportHeight
  entryThreshold = scrollY + viewportHeight * 0.75
  // Cuarto superior de la pantalla: desde 0% hasta 25% de viewportHeight
  exitThreshold = scrollY + viewportHeight * 0.25

  // Fase de entrada: borde superior en el cuarto inferior
  IF blockTop >= entryThreshold:
    // Dentro del tramo de entrada (márgenes de seguridad RF-02)
    // Opacidad < 1, continua y monótona; valor concreto no verificado
    RETURN { phase: "entry", opacity: < 1, transform: rise/clip/fade según variant }

  // Fase de salida: borde inferior en el cuarto superior
  IF blockBottom <= exitThreshold:
    // Última sección nunca sale (RF-04)
    IF block.isLastSection == true:
      RETURN { phase: "stable", opacity: 1, transform: none }
    RETURN { phase: "exit", opacity: < 1, transform: rise/clip/fade según variant }

  // Fase estable: el resto del tiempo (opacidad = 1)
  RETURN { phase: "stable", opacity: 1, transform: none }
```

### 3.2. Cálculo de desfase de grupo (RF-13)

Entrada: índice del elemento dentro del grupo, total de elementos, desfase total máximo (5 puntos del recorrido).
Salida: offsetPoints para ese elemento.

```
FUNCTION calculateGroupOffset(groupIndex, totalInGroup, maxTotalPoints = 5):
  IF totalInGroup <= 1:
    RETURN 0

  // Máximo 6 elementos con desfase propio; los restantes comparten el último
  effectiveIndex = MIN(groupIndex, 5)

  // Desfase distribuido entre 0 y maxTotalPoints
  // Cada elemento completa su entrada antes de entrar en fase estable
  step = maxTotalPoints / MIN(totalInGroup, 6)
  RETURN effectiveIndex * step
```

### 3.3. Recalculo ante resize / giro / zoom (RF-08)

```
FUNCTION onViewportChange():
  viewportHeight = window.innerHeight
  pageHeight = document.documentElement.scrollHeight
  scrollY = window.scrollY

  FOR EACH block in visibleBlocks:
    state = calculateBlockPhase(block, viewportHeight, scrollY, pageHeight)
    applyOpacityAndTransform(block, state)

  // No hay estados atascados: la opacidad coincide con la posición actual
  // Tolerancia 0,01 para comparación con scroll normal
```

### 3.4. Salto por ancla (RF-12)

```
FUNCTION onAnchorJump(targetSectionId):
  // Al llegar por ancla, todos los bloques de la sección destino opacidad 1
  FOR EACH block in blocksOfSection(targetSectionId):
    block.opacity = 1
    block.transform = none

  // Si no es posible solo con CSS, relajarse a "bloque de destino completo"
  // y anotar la relajación en la spec (RF-12)
```

### 3.5. Foco por teclado (RF-15)

```
FUNCTION onFocusChange(focusedElement):
  block = closestRevealableAncestor(focusedElement)
  IF block != null:
    block.opacity = 1
    block.transform = none
```

### 3.6. Impresión (RF-16)

```
CSS @media print:
  .reveal-block, .reveal-group:
    opacity: 1 !important
    transform: none !important
    animation: none !important
    transition: none !important
```

---

## 4. Contratos de interfaz

### 4.1. Componente `Reveal`

**Entradas (props):**
- `children`: ReactNode — contenido del bloque (texto, filas, etc.)
- `variant`: `"rise" | "clip" | "fade"` — variante visual
- `isGrouped`: boolean — si pertenece a un grupo escalonado
- `groupIndex`: number | null — posición dentro del grupo
- `offsetPoints`: number | null — desfase de posición de scroll (0-5)
- `isExcluded`: boolean — si es nav, footer, skip link o fijo/pegajoso
- `isLastSection`: boolean — si pertenece a la última sección
- `hasFocus`: boolean — si contiene el elemento enfocado

**Salidas:**
- Un bloque renderizado con `opacity` y `transform` aplicados vía CSS (variables CSS o estilo inline calculado). Nunca clases de Tailwind para el estado de opacidad.

**Errores:**
- No lanza excepciones. Si el navegador no soporta `animation-timeline: view()`, el bloque se renderiza con `opacity: 1` y `transform: none` (RF-10).

### 4.2. Componente `RevealGroup`

**Entradas (props):**
- `children`: ReactNode[] — hermanos del grupo
- `variant`: `"rise" | "clip" | "fade"` — variante compartida
- `maxPoints`: number — desfase total máximo del grupo (default 5)
- `maxElementsWithOffset`: number — máximo de elementos con desfase propio (default 6)

**Salidas:**
- Cada hijo envuelto en `Reveal` con `offsetPoints` calculado.

**Errores:**
- Si `children` no son elementos válidos, se renderizan sin envoltura de reveal (opacidad 1).

### 4.3. Función interna `calculateBlockPhase`

**Entradas:** `blockRect`, `viewportHeight`, `scrollY`, `isLastSection`, `supportsScrollTimeline`, `prefersReducedMotion`, `isPrinting`

**Salidas:** `{ phase: "entry" | "stable" | "exit", opacity: number, transform: string | null }`

**Errores:** Ninguno. Devuelve siempre `{ phase: "stable", opacity: 1, transform: null }` en caso de fallback.

### 4.4. Función interna `calculateGroupOffset`

**Entradas:** `groupIndex`, `totalInGroup`, `maxTotalPoints`, `maxElementsWithOffset`

**Salidas:** `number` (desfase en puntos, 0-5)

**Errores:** Devuelve 0 si `groupIndex` es inválido o `totalInGroup` <= 1.

---

## 5. Decisiones técnicas justificadas

| Decisión | Justificación | Alternativa descartada | RF afectados |
|---|---|---|---|
| **CSS-only para animación por scroll** (`animation-timeline: view()`) | Constitución: "solo CSS", sin librerías de animación, sin JS para revelado. Contenido siempre visible sin JS. | Usar Intersection Observer o `requestAnimationFrame` con JS para calcular opacidad. | RF-01, RF-02, RF-10 |
| **Fallback "visible sin animar" en navegadores sin soporte** | Constitución punto 14: contenido siempre visible sin soporte de animaciones por scroll. Spec 12 verifica Safari/Firefox. | Añadir polyfill o JS alternativo para simular scroll timeline. | RF-10 |
| **Fases por bordes de pantalla (no por % de recorrido)** | Evita que bloques altos se atenúen antes de verse completos (corrección B). Coincide con "el estado visual depende solo de la posición del bloque respecto a la pantalla". | Reparto 0–25–75–100 % del recorrido (descartado por problema con bloques altos). | RF-01, RF-02 |
| **Desfase por posición de scroll, no por tiempo (ms)** | El revelado va ligado a la posición de scroll, no al tiempo. Los ms no se pueden medir en un sistema basado en scroll. | Escalonado con `transition-delay` en milisegundos (descartado: corrección A). | RF-13 |
| **Máximo 6 elementos con desfase propio por grupo** | Evita escalonados excesivos que dejen contenido a medias más tiempo (principio de fallo seguro). | Número ilimitado de elementos con desfase propio. | RF-13 |
| **Desfase total ≤ 5 puntos del recorrido** | El conjunto del grupo completa su revelado dentro del recorrido visible. Los valores exactos van en tokens del tema. | Desfase total mayor a 5 puntos o basado en tiempo. | RF-13 |
| **Precedencia RF-10 > RF-11 > RF-03 > RF-05 > RF-04 sobre RF-01** | Las excepciones (fallo seguro, exclusiones, visible al cargar, sin scroll, última sección) deben prevalecer sobre la regla general de revelado progresivo. | Aplicar RF-01 a todos los bloques sin excepción. | RF-01, RF-03, RF-04, RF-05, RF-10, RF-11 |
| **Última sección (Contact) sin salida** | Constitución punto 12: "la última sección no tiene salida". El último bloque queda plenamente visible al final. | Aplicar salida a todos los bloques incluyendo el último. | RF-04 |
| **Última sección sin salida vía CSS (RF-04)** | Los bloques con `data-last-section` solo aplican la animación de entrada (`reveal-enter`), sin keyframes ni rango de salida, con `animation-fill-mode: forwards` para quedarse en opacity 1, y `padding-bottom: var(--section-end-padding)` (≥ 30vh) para alcanzar la zona estable al final. No requiere JS. | Forzar salida en la última sección (descartado: viola RF-04). | RF-04 |
| **RF-05 sin JS en páginas cortas** | Sin JavaScript, en páginas que no superan el viewport, el contenido es visible y legible aunque pueda estar parcialmente atenuado (opacidad < 1 en fases de entrada/salida por posición de bordes); con JavaScript, opacidad 1 (mejora progresiva). No existe selector CSS que detecte `scrollHeight <= viewportHeight`. | Forzar opacidad 1 sin JS (descartado: imposible solo con CSS). | RF-05 |
| **Opacidad computada como única métrica de verificación** | Constitución punto 8: tests por comportamiento visible, nunca por clases ni estructura interna. | Verificar clases de Tailwind o snapshot DOM. | RF-01, RF-02, RF-04, RF-06, RF-07, RF-08, RF-09, RF-15, RF-16 |

---

## 6. Estrategia de tests

### 6.1. Tests de unidad (Vitest + React Testing Library)

Se escriben antes que el código (constitución punto 8). Cada test verifica comportamiento visible, nunca clases ni estructura interna. Usa `renderWithIntl` con mensajes reales de `en.json` para que una clave faltante rompa el test.

| Test | Qué verifica | RF cubiertos |
|---|---|---|
| `Reveal.test.tsx` — entrada | Opacidad computada < 1 cuando borde superior en 15 % inferior de pantalla | RF-01, RF-02 |
| `Reveal.test.tsx` — estable | Opacidad computada = 1 cuando borde superior > 70 % y borde inferior < 30 % | RF-01, RF-02 |
| `Reveal.test.tsx` — salida | Opacidad computada < 1 cuando borde inferior en 15 % superior de pantalla | RF-01, RF-02 |
| `Reveal.test.tsx` — reversibilidad | Al hacer scroll atrás, el bloque vuelve a su fase anterior | RF-06 |
| `Reveal.test.tsx` — scroll rápido | Tras parar scroll rápido, bloques estables tienen opacidad 1 | RF-07 |
| `Reveal.test.tsx` — exclusiones | Nav, footer, skip link, fijos mantienen opacidad 1 siempre | RF-11 |
| `Reveal.test.tsx` — fallo seguro | Sin scroll timeline o reduced-motion: todos los bloques opacidad 1 | RF-10 |
| `RevealGroup.test.tsx` — escalonado | Hermanos de un grupo tienen desfase escalonado de posición | RF-13 |
| `RevealGroup.test.tsx` — sin encadenamiento | Grupos diferentes no comparten desfase | RF-13 |
| `RevealGroup.test.tsx` — bloque suelto | Bloque fuera de grupo no tiene desfase | RF-13 |
| `RevealGroup.test.tsx` — límite 6 | Máximo 6 elementos con desfase propio; resto comparte último | RF-13 |
| `Reveal.test.tsx` — foco | Bloque con elemento enfocado tiene opacidad 1 | RF-15 |

### 6.2. Tests de sección (Vitest + RTL)

Cada sección (`Hero`, `About`, `Experience`, `Stack`, `Contact`) tiene su test que renderiza con mensajes reales y verifica que sus bloques revelados se comportan según RF-01, RF-02, RF-14.

### 6.3. Tests e2e (Playwright, Chromium)

Flujos críticos de la constitución (punto 8, 12):

| Flujo | Qué verifica | RF cubiertos |
|---|---|---|
| Revelado por scroll | Bloques entran (opacidad < 1), se estabilizan (= 1) y salen (< 1) al hacer scroll | RF-01, RF-02 |
| Movimiento reducido | Con `prefers-reduced-motion: reduce`, todo visible, sin animación | RF-10 |
| Sin soporte de scroll timeline | Simulado en Chromium: fallback "visible sin animar" | RF-10 |
| Resize / giro / zoom 200 % | Tras cambiar viewport, opacidad coincide con posición normal (tol 0,01) | RF-08 |
| Cambio de idioma | `/en` ↔ `/es`: sin bloques ocultos ni parpadeos | RF-09 |
| Cambio de tema | Claro ↔ oscuro: sin bloques ocultos ni parpadeos | RF-09 |
| Salto por ancla | Bloques de la sección destino opacidad 1 al llegar | RF-12 |
| Última sección sin salida | Bloques de Contact opacidad 1 al final, sin desvanecerse | RF-04 |
| Impresión | Todos los bloques opacidad 1 sin desplazamiento | RF-16 |

Los e2e de navegación e idioma van con `prefers-reduced-motion: reduce` activado (constitución punto 8).

### 6.4. Cobertura

Vitest con umbral 85 % en líneas, funciones, ramas y sentencias (constitución punto 9). Se excluyen: configuración, tests, declaraciones, helpers de test (`src/test/`), rutas de `src/app/` (cubiertas por e2e) y datos de `src/content/`. Nada fuera de `src/` se mide.

### 6.5. Definición de terminado

`pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` en verde. `pnpm test:e2e` en verde (la spec toca movimiento de scroll y siempre se ejecuta antes de un PR). Constitución punto 10.

---

## 7. Trazabilidad RF → partes del plan

| RF | Módulo | Algoritmo | Contrato | Test unidad | Test e2e |
|---|---|---|---|---|---|
| RF-01 | Reveal | 3.1 | 4.1, 4.3 | Reveal.test | scroll-motion |
| RF-02 | Reveal | 3.1 | 4.1, 4.3 | Reveal.test | scroll-motion |
| RF-03 | Secciones / Reveal | 3.1 | 4.1 | Sección.test | — |
| RF-04 | Secciones (Contact) | 3.1 | 4.1 | Contact.test | scroll-motion |
| RF-05 | Reveal | 3.1 | 4.3 | Reveal.test | — |
| RF-06 | Reveal | 3.1 | 4.3 | Reveal.test | scroll-motion |
| RF-07 | Reveal | 3.1 | 4.3 | Reveal.test | scroll-motion |
| RF-08 | Reveal | 3.3 | 4.3 | — | scroll-motion |
| RF-09 | i18n / tema | — | — | — | scroll-motion |
| RF-10 | Reveal | 3.1 | 4.1, 4.3 | Reveal.test | scroll-motion |
| RF-11 | Reveal / Navbar / Footer / SkipLink | 3.1 | 4.1 | Reveal.test | — |
| RF-12 | i18n navigation / Secciones | 3.4 | 4.1 | — | scroll-motion |
| RF-13 | RevealGroup | 3.2 | 4.2 | RevealGroup.test | — |
| RF-14 | Secciones | — | 4.1, 4.2 | Sección.test | — |
| RF-15 | Reveal | 3.5 | 4.1 | Reveal.test | — |
| RF-16 | CSS @media print | 3.6 | 4.1 | — | scroll-motion |
