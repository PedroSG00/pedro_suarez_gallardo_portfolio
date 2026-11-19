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

## T8 — Exclusiones del reveal (nav, footer, skip link, fijos/pegajosos) ✅ COMPLETADA

**Objetivo:** Navegación, pie de página, enlace de salto al contenido y cualquier elemento fijo o pegajoso mantienen opacidad 1 en todo momento y nunca participan en el reveal. Ningún elemento fijo/pegajoso puede estar dentro de un bloque revelable.

**RF cubiertos:** RF-11.

**Tests escritos y pasantes (3 unitarios):**
- Nav, footer y skip link mantienen opacidad computada 1 y sin desplazamiento en entrada, centro y salida. ✅
- Los elementos fijos y pegajosos no participan en el reveal en ninguna fase (opacidad computada 1). ✅
- Un bloque revelable con contenido fijo o pegajoso anidado se excluye del reveal y permanece visible (opacidad 1 y sin desplazamiento). ✅

**Criterio de hecho:** Los tres tests pasan. `Navbar`, `Footer` y `SkipLink` (spec 06) no se envuelven en `Reveal`; el shell actual mantiene el `<nav>` fuera de cualquier bloque revelable. `Reveal` expone `isExcluded` para exclusiones explícitas y neutraliza cualquier fijo/pegajoso anidado para que nunca se atenúe ni se desplace.

**Archivos modificados:**
- `src/components/ui/Reveal/Reveal.tsx` — añade `isExcluded` (envoltorio estático sin marcadores ni escuchas, siempre visible) y detecta descendientes `fixed`/`sticky` para excluir el bloque del reveal.
- `src/components/ui/Reveal/Reveal.module.css` — estilo `.excluded` sin animación, opacidad 1 y sin desplazamiento.
- `src/components/ui/Reveal/Reveal.test.tsx` — 3 pruebas unitarias de RF-11.

---

## T9 — Resize, giro de pantalla y zoom sin estados atascados ✅ COMPLETADA

**Objetivo:** Tras resize, giro de pantalla o zoom (incluido texto al 200 %), el efecto se recalcula y nunca deja contenido oculto. La opacidad de cada bloque debe ser la misma que tendría llegando a esa misma posición con scroll normal (tolerancia 0,01).

**RF cubiertos:** RF-08.

**Tests escritos y pasantes (2 unitarios):**
- Tras resize y giro, el bloque recalculado a su fase estable muestra opacidad computada 1, sin anular la animación CSS con un estilo en línea obsoleto; al volver al viewport original la opacidad coincide con la de llegar por scroll normal. ✅
- Cuando un zoom de texto o un reflujo cambia el alto de la página sin emitir `resize`, el bloque se recalcula: en una página sin scroll queda plenamente visible (nunca atenuado) y al volver a haber scroll recupera el revelado. ✅

**Criterio de hecho:** Los dos tests pasan. El recálculo ante cambio de viewport es inmediato (evento `resize`) y el que provoca un cambio de layout sin `resize` (zoom de texto, reflujo) llega por un `ResizeObserver` sobre `document.documentElement`; ningún estado queda atascado.

**Archivos modificados:**
- `src/components/ui/Reveal/Reveal.tsx` — añade un `ResizeObserver` sobre el elemento raíz del documento (con guarda para entornos sin la API) que ejecuta el mismo recálculo que `scroll`/`resize`; se desconecta al desmontar.
- `src/components/ui/Reveal/Reveal.test.tsx` — extiende el entorno de scroll con `setViewport`, añade un doble de `ResizeObserver` y 2 pruebas unitarias de RF-08.

---

## T10 — Cambio de idioma o tema sin bloques ocultos ni parpadeos ✅ COMPLETADA

**Objetivo:** Al cambiar de idioma (`/en` ↔ `/es`) o de tema (claro ↔ oscuro), no quedan bloques ocultos ni se producen parpadeos (un bloque en zona estable no baja de opacidad 1 en ningún fotograma durante el cambio).

**RF cubiertos:** RF-09.

**Tests escritos y pasantes (3 unitarios):**
- Tras cambiar de idioma, los bloques en fase estable mantienen opacidad computada 1 y no reciben override en línea. ✅
- Tras cambiar de tema, los bloques en fase estable mantienen opacidad computada 1 y no reciben override en línea. ✅
- Durante el cambio de idioma (con reflujo de altura de página) y de tema en ambos sentidos, ninguna muestra baja de opacidad 1 ni aplica desplazamiento. ✅

**Criterio de hecho:** Los tres tests pasan. El cambio de idioma y tema no afecta al cálculo de fase de scroll: este depende solo de la geometría del bloque y del viewport, por lo que no fue necesario añadir código de producción. La cobertura de RF-09 queda en `Reveal.test.tsx`.

**Archivos modificados:**
- `src/components/ui/Reveal/Reveal.test.tsx` — 3 pruebas unitarias de RF-09.

---

## T11 — Escalonado solo entre hermanos de un mismo grupo (RevealGroup) ✅ COMPLETADA

**Objetivo:** Implementar `RevealGroup` que aplica desfases de posición de scroll (no de tiempo) a hermanos de un mismo grupo. Máximo 6 elementos con desfase propio; los restantes comparten el último desfase. Desfase total ≤ 5 puntos del recorrido. Cada elemento completa su entrada antes de la fase estable. Un bloque suelto no usa desfase. No hay encadenamiento entre grupos.

**RF cubiertos:** RF-13.

**Tests escritos y pasantes (6 unitarios):**
- Dentro de un mismo grupo, los hermanos muestran desfases escalonados de posición (0 → 1,67 % → 3,33 % con 3 elementos). ✅
- Entre grupos diferentes no hay encadenamiento: el primer bloque del segundo grupo vuelve a 0 y su paso se calcula con su propio tamaño. ✅
- Un bloque suelto fuera de un grupo no usa desfase (sin variable de offset). ✅
- El desfase total del grupo no supera 5 puntos y, a partir del sexto elemento, los restantes comparten el último desfase. ✅
- Cada elemento del grupo completa su entrada antes de la fase estable: el inicio de entrada queda por debajo del 25 %, donde arranca la fase estable. ✅
- Los hijos que no son elementos React se renderizan sin envoltura de reveal ni desfase. ✅

**Criterio de hecho:** Los seis tests pasan. `RevealGroup` envuelve cada hijo en `Reveal` con `offsetPoints` calculado por su posición. El offset se aplica con la variable CSS `--psg-reveal-entry-start`, que mueve el inicio de la entrada sin tocar la fase estable y sin usar tiempo (`animation-delay` ni `transition-delay`).

**Archivos creados o modificados:**
- `src/components/ui/RevealGroup/RevealGroup.tsx`
- `src/components/ui/RevealGroup/RevealGroup.test.tsx`
- `src/components/ui/Reveal/Reveal.tsx` — añade la prop `offsetPoints` y la expone como variable CSS.
- `src/components/ui/Reveal/Reveal.module.css` — el rango de entrada empieza en el offset del grupo y termina siempre en el 25 %.

---

## T12 — Variantes rise, clip y fade (RF-14) ✅ COMPLETADA

**Objetivo:** El componente `Reveal` admite únicamente las variantes `rise` (desplazamiento), `clip` (recorte) y `fade` (solo opacidad). Cada sección decide qué variante usa cada bloque. No se definen variantes adicionales.

**RF cubiertos:** RF-14.

**Tests escritos y pasantes (4 unitarios):**
- Cada bloque revelado usa una de las tres variantes válidas: `rise`, `clip` y `fade` se renderizan con su variante declarada. ✅
- Un bloque sin variante explícita cae en una variante válida del sistema. ✅
- El sistema no define variantes más allá de `rise`, `clip` y `fade`; un valor no soportado en tiempo de ejecución vuelve a una variante definida, nunca a una cuarta. ✅
- Un grupo comparte la misma variante con todos sus hermanos. ✅

**Criterio de hecho:** Los tests pasan. La prop `variant` de `Reveal` está tipada como `"rise" | "clip" | "fade"` y se expone como `data-reveal-variant` para que el CSS aplique el tratamiento de cada variante: `rise` desplaza, `clip` recorta con `clip-path` y `fade` solo cambia la opacidad. Los fallos seguros (sin scroll timeline, reduced motion, impresión) anulan también el recorte.

**Archivos creados o modificados:**
- `src/components/ui/Reveal/Reveal.tsx` — tipo `RevealVariant`, lista `REVEAL_VARIANTS`, prop `variant` (por defecto `rise`) y su atributo de variante.
- `src/components/ui/Reveal/Reveal.module.css` — variables y rangos de recorte por variante, sin desplazamiento en `clip` ni `fade`.
- `src/components/ui/Reveal/Reveal.test.tsx` — 3 tests de variantes.
- `src/components/ui/RevealGroup/RevealGroup.tsx` — prop `variant` compartida.
- `src/components/ui/RevealGroup/RevealGroup.test.tsx` — 1 test de variante compartida.

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
