# Tareas — Spec 05: Movimiento y revelado por scroll (Reveal)

Tareas pequeñas y ordenadas (T1 a T15). Cada tarea tiene objetivo, RF que cubre, tests a escribir primero y criterio de hecho. Cada tarea puede implementarse y verificarse por separado. Los tests se escriben antes que el código (constitución, punto 8). Los criterios de aceptación se expresan como comportamientos observables (opacidad computada, rol, texto o etiqueta), nunca clases de Tailwind ni estructura interna.

---

## T1 — Infraestructura de detección de capacidades y estado base ✅ COMPLETADA

**Objetivo:** Establecer la detección de `animation-timeline: view()`, `prefers-reduced-motion: reduce` y modo impresión, más el estado base del revelado (opacidad 1 estática por defecto). Este es el fallback seguro que prevalece ante cualquier situación sin revelado activo.

**RF cubiertos:** RF-10 (fallo seguro), RF-16 (impresión base).

**Tests escritos y pasantes (3):**
- Sin soporte de scroll timeline → opacidad computada 1 y `transform: none`. ✅
- Con `prefers-reduced-motion: reduce` → opacidad computada 1 y `transform: none`. ✅
- En modo impresión → opacidad computada 1 y `transform: none`. ✅

**Criterio de hecho:** Los 3 tests pasan en Vitest. El componente `Reveal` renderiza cualquier hijo con opacidad 1 y sin desplazamiento cuando el revelado está inactivo.

**Archivos creados:**
- `src/components/ui/Reveal/Reveal.tsx`
- `src/components/ui/Reveal/Reveal.test.tsx`
- `src/components/ui/Reveal/Reveal.module.css`

---

## T2 — Componente Reveal base: cálculo de fase por bordes de pantalla ✅ COMPLETADA

**Objetivo:** Implementar el cálculo de fase (`entry`, `stable`, `exit`) basado en la posición de los bordes del bloque respecto a la pantalla, con márgenes de seguridad (15 % inferior/superior para entrada/salida, 70 % / 30 % para estable).

**RF cubiertos:** RF-01, RF-02.

**Tests escritos y pasantes (4, Playwright Chromium):**
- Borde superior en el 15 % inferior de la pantalla → opacidad computada < 1 y desplazamiento de entrada. ✅
- Bloque más alto que el viewport, con los bordes dentro de la zona estable → opacidad computada = 1 y sin desplazamiento. ✅
- Borde inferior en el 15 % superior de la pantalla → opacidad computada < 1 y desplazamiento de salida. ✅
- En las franjas de entrada y salida, la opacidad cambia de forma monótona y continua según posiciones muestreadas. ✅

**Criterio de hecho:** Los 4 escenarios pasan en Playwright Chromium. `Reveal` aplica opacidad y desplazamiento mediante CSS ligado a la posición de los bordes respecto al viewport; no calcula ni conserva estado de scroll con JavaScript. Se usa Chromium porque jsdom no evalúa animaciones ligadas al scroll.

**Archivos modificados o creados:**
- `src/components/ui/Reveal/Reveal.tsx` — añade marcadores de borde accesibles como decorativos.
- `src/components/ui/Reveal/Reveal.module.css` — anima opacidad y desplazamiento según las líneas de tiempo de los bordes.
- `e2e/reveal.spec.ts` — escenarios de verificación de T2.

---

## T3 — Bloques ya visibles al cargar (sin entrada ni parpadeo inicial) ✅ COMPLETADA

**Objetivo:** Garantizar que los bloques inicialmente dentro del viewport al cargar la página muestren opacidad 1 desde el primer fotograma, sin transición de entrada.

**RF cubiertos:** RF-03.

**Tests escritos y pasantes (2):**
- Página cargada sin scroll previo, bloque inicialmente visible → opacidad computada igual a 1 desde el primer fotograma. ✅
- No se aplica una transición de entrada visible a bloques ya en pantalla al cargar (opacidad 1 y sin desplazamiento). ✅

**Criterio de hecho:** Los 2 tests pasan en Vitest. El render inicial mantiene opacidad 1 y `transform: none` para bloques ya visibles; no hay fase de entrada ni parpadeo.

---

## T4 — Pantalla sin scroll suficiente ✅ COMPLETADA

**Objetivo:** Cuando el alto total de la página es menor o igual al alto del viewport, todo el contenido es visible (opacidad 1) sin necesidad de scroll.

**RF cubiertos:** RF-05.

**Tests escritos y pasantes (2 unitarios):**
- Página con alto menor que el viewport → opacidad computada igual a 1 sin scroll. ✅
- Página con alto igual al viewport → opacidad computada igual a 1 sin scroll. ✅

**Criterio de hecho:** Los 2 tests pasan en Vitest. `Reveal` detecta con `useEffect` si `document.documentElement.scrollHeight <= window.innerHeight` y, al ser cierto, aplica `opacity: 1` y `transform: none` mediante estilo en línea, sobrescribiendo cualquier fase de animación por scroll.

**Archivos modificados:**
- `src/components/ui/Reveal/Reveal.tsx` — añade `'use client'`, `useState`/`useEffect` para detectar página corta y aplicar estilo estático de visibilidad total.
- `src/components/ui/Reveal/Reveal.test.tsx` — 2 pruebas unitarias de RF-05.

---

## T5 — Última sección (Contact) sin salida ✅ COMPLETADA

**Objetivo:** La última sección de la página no tiene salida: ninguno de sus bloques se desvanece al salir. Al llegar al final, todos sus bloques tienen opacidad 1 aunque no hayan completado su entrada.

**RF cubiertos:** RF-04.

**Tests escritos y pasantes (2 unitarios):**
- Bloque de la última sección al final de la página → opacidad computada igual a 1. ✅
- Ningún bloque de la última sección muestra fase de salida por la parte alta de la pantalla (opacidad 1 y sin desplazamiento). ✅

**Criterio de hecho:** Los 2 tests pasan en Vitest. La propiedad `isLastSection` prevalece sobre la fase de salida.

**Archivos modificados:**
- `src/components/ui/Reveal/Reveal.tsx` — añade prop `isLastSection`, detección de fase de salida y final de página mediante `ref` + `scroll`/`resize`, y estilo inline que anula la salida cuando es la última sección.
- `src/components/ui/Reveal/Reveal.test.tsx` — 2 pruebas unitarias de RF-04.

---

## T6 — Reversibilidad del efecto ✅ COMPLETADA

**Objetivo:** El efecto es reversible: al hacer scroll hacia atrás, el bloque vuelve a su fase anterior (estable con opacidad 1 o entrada con opacidad < 1).

**RF cubiertos:** RF-06.

**Tests escritos y pasantes (2 unitarios):**
- Tras salir por la parte alta y volver atrás, el bloque no aplica override de estilo en línea (la animación CSS gestiona la reversibilidad). ✅
- Tras entrar por la parte baja y volver atrás, el bloque no aplica override de estilo en línea (la animación CSS gestiona la reversibilidad). ✅

**Criterio de hecho:** Los 2 tests pasan en Vitest. El cálculo de fase depende solo de la posición actual (recalculado en cada scroll/resize vía `useEffect`), nunca del historial de scroll.

**Archivos modificados:**
- `src/components/ui/Reveal/Reveal.test.tsx` — 2 pruebas unitarias de RF-06.

---

## T7 — Scroll rápido sin contenido oculto ✅ COMPLETADA

**Objetivo:** Con scroll rápido y parada brusca, ningún bloque queda a medio revelar ni invisible de forma permanente. Los bloques en fase estable muestran opacidad 1.

**RF cubiertos:** RF-07.

**Tests escritos y pasantes (2 unitarios):**
- Tras una ráfaga de scroll rápido y parada brusca en fase estable, el bloque muestra opacidad computada 1 y sin desplazamiento. ✅
- Tras detener el scroll rápido en fase estable, la última sección elimina el override de salida y vuelve a la animación CSS (sin estado atascado). ✅

**Criterio de hecho:** Los dos tests pasan en Vitest. El recálculo ante scroll rápido no deja estados atascados.

**Archivos modificados:**
- `src/components/ui/Reveal/Reveal.tsx` — añade escucha de `scrollend` para recalcular al detenerse el scroll y corrige el umbral de salida: `rect.bottom` es relativo al viewport, así que se compara con `innerHeight * 0.25` (antes sumaba `scrollY` y marcaba salida en cualquier posición de scroll distinta de cero).
- `src/components/ui/Reveal/Reveal.test.tsx` — 2 pruebas unitarias de RF-07 y helper `setScrollEnvironment` para simular posiciones de scroll cambiantes.

---

## T8 — Exclusiones del reveal (nav, footer, skip link, fijos/pegajosos)

**Objetivo:** Navegación, pie de página, enlace de salto al contenido y cualquier elemento fijo o pegajoso mantienen opacidad 1 en todo momento y nunca participan en el reveal. Ningún elemento fijo/pegajoso puede estar dentro de un bloque revelable.

**RF cubiertos:** RF-11.

**Tests a escribir primero:**
- Test unitario: nav, footer y skip link mantienen opacidad computada igual a 1 en todo momento.
- Test unitario: ningún elemento fijo/pegajoso participa en entrada, centro o salida del reveal.
- Test unitario: ningún elemento fijo o pegajoso está contenido dentro de un bloque revelable.

**Criterio de hecho:** Los tres tests pasan. Los componentes `Navbar`, `Footer` y `SkipLink` no se envuelven en `Reveal`.

---

## T9 — Resize, giro de pantalla y zoom sin estados atascados

**Objetivo:** Tras resize, giro de pantalla o zoom (incluido texto al 200 %), el efecto se recalcula y nunca deja contenido oculto. La opacidad de cada bloque debe ser la misma que tendría llegando a esa misma posición con scroll normal (tolerancia 0,01).

**RF cubiertos:** RF-08.

**Tests a escribir primero:**
- Test unitario: tras cambio de viewport, bloques en fase estable muestran opacidad computada igual a 1.
- Test unitario: tras resize/giro/zoom, ningún bloque queda con opacidad menor que 1 de forma permanente si ocupa su fase estable.

**Criterio de hecho:** Los dos tests pasan. El recalculo ante cambio de viewport es inmediato y no deja estados atascados.

---

## T10 — Cambio de idioma o tema sin bloques ocultos ni parpadeos

**Objetivo:** Al cambiar de idioma (`/en` ↔ `/es`) o de tema (claro ↔ oscuro), no quedan bloques ocultos ni se producen parpadeos (un bloque en zona estable no baja de opacidad 1 en ningún fotograma durante el cambio).

**RF cubiertos:** RF-09.

**Tests a escribir primero:**
- Test unitario: tras cambiar de idioma, bloques en fase estable muestran opacidad computada igual a 1.
- Test unitario: tras cambiar de tema, bloques en fase estable muestran opacidad computada igual a 1.
- Test unitario: no se produce parpadeo visible de entrada o salida durante el cambio de idioma o de tema.

**Criterio de hecho:** Los tres tests pasan. El cambio de idioma y tema no afecta al cálculo de fase de scroll.

---

## T11 — Escalonado solo entre hermanos de un mismo grupo (RevealGroup)

**Objetivo:** Implementar `RevealGroup` que aplica desfases de posición de scroll (no de tiempo) a hermanos de un mismo grupo. Máximo 6 elementos con desfase propio; los restantes comparten el último desfase. Desfase total ≤ 5 puntos del recorrido. Cada elemento completa su entrada antes de la fase estable. Un bloque suelto no usa desfase. No hay encadenamiento entre grupos.

**RF cubiertos:** RF-13.

**Tests a escribir primero:**
- Test unitario: dentro de un mismo grupo, los elementos hermanos muestran desfases escalonados de posición.
- Test unitario: entre grupos diferentes no hay encadenamiento de desfases.
- Test unitario: un bloque suelto fuera de un grupo no usa desfase de escalonado.
- Test unitario: el desfase total del grupo no supera 5 puntos del recorrido.
- Test unitario: cada elemento del grupo completa su entrada antes de entrar en su fase estable.

**Criterio de hecho:** Los cinco tests pasan. `RevealGroup` envuelve cada hijo en `Reveal` con `offsetPoints` calculado.

---

## T12 — Variantes rise, clip y fade (RF-14)

**Objetivo:** El componente `Reveal` admite únicamente las variantes `rise` (desplazamiento), `clip` (recorte) y `fade` (solo opacidad). Cada sección decide qué variante usa cada bloque. No se definen variantes adicionales.

**RF cubiertos:** RF-14.

**Tests a escribir primero:**
- Test unitario: cada bloque revelado usa una de las tres variantes válidas.
- Test unitario: no existen variantes adicionales definidas por el sistema.

**Criterio de hecho:** Los dos tests pasan. La prop `variant` de `Reveal` está tipada como `"rise" | "clip" | "fade"`.

---

## T13 — Foco por teclado (RF-15)

**Objetivo:** Mientras un bloque contiene el elemento enfocado, su opacidad es 1. El foco nunca puede dejar un control atenuado u oculto.

**RF cubiertos:** RF-15.

**Tests a escribir primero:**
- Test unitario: cuando un elemento dentro de un bloque recibe el foco por teclado, la opacidad computada de ese bloque es 1.
- Test unitario: ningún control enfocado queda con opacidad menor que 1.

**Criterio de hecho:** Los dos tests pasan. El estado `hasFocus` prevalece sobre la fase de scroll.

---

## T14 — Salto por anclas: sección de destino completa (RF-12)

**Objetivo:** Al saltar a una sección desde la navegación por anclas, todos los bloques de la sección de destino se ven completos al llegar (opacidad 1), sin quedarse a medio revelar. Si el plan demuestra que no es posible solo con CSS, se relaja a que el bloque de destino se ve completo y se anota en la spec.

**RF cubiertos:** RF-12.

**Tests a escribir primero:**
- Test e2e: navegar por ancla a una sección → todos los bloques de esa sección muestran opacidad computada igual a 1 al llegar.
- Test e2e: ningún bloque de la sección de destino aparece a medio revelar tras un salto por ancla.

**Criterio de hecho:** Los dos tests e2e pasan en Playwright (Chromium). La navegación por ancla no deja bloques a medio revelar.

---

## T15 — Tests e2e integrados y definición de terminado

**Objetivo:** Ejecutar los flujos críticos de scroll en Playwright (Chromium) y verificar que todos los criterios de aceptación de RF-01 a RF-16 están cubiertos por tests visibles para el usuario, en `/en` y `/es`, tema claro y oscuro.

**RF cubiertos:** RF-01 a RF-16 (cobertura e2e).

**Tests a escribir primero:**
- Test e2e: revelado por scroll (entrada, estable, salida) en `/en` y `/es`, claro y oscuro.
- Test e2e: movimiento reducido (`prefers-reduced-motion: reduce`) → todo visible, sin animación.
- Test e2e: sin soporte de scroll timeline (simulado) → fallback "visible sin animar".
- Test e2e: resize / giro / zoom 200 % → sin estados atascados.
- Test e2e: cambio de idioma y tema → sin bloques ocultos ni parpadeos.
- Test e2e: salto por ancla → sección destino completa.
- Test e2e: última sección (Contact) sin salida → opacidad 1 al final.
- Test e2e: impresión → todos los bloques opacidad 1 sin desplazamiento.

**Criterio de hecho:** Todos los tests e2e pasan en Chromium. `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` en verde. `pnpm test:e2e` en verde. Cobertura ≥ 95 % (líneas, funciones, ramas, sentencias) sin bajar el umbral.
