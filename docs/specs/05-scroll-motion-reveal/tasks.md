# Tareas — Spec 05: Movimiento y revelado por scroll (Reveal)

Tareas pequeñas y ordenadas (T1 a T15). Cada tarea tiene objetivo, RF que cubre, tests a escribir primero y criterio de hecho. Cada tarea puede implementarse y verificarse por separado. Los tests se escriben antes que el código (constitución, punto 8). Los criterios de aceptación se expresan como comportamientos observables (opacidad computada, rol, texto o etiqueta), nunca clases de Tailwind ni estructura interna.

---

## T1 — Infraestructura de detección de capacidades y estado base

**Objetivo:** Establecer la detección de `animation-timeline: view()`, `prefers-reduced-motion: reduce` y modo impresión, más el estado base del revelado (opacidad 1 estática por defecto). Este es el fallback seguro que prevalece ante cualquier situación sin revelado activo.

**RF cubiertos:** RF-10 (fallo seguro), RF-16 (impresión base).

**Tests a escribir primero:**
- Test unitario: sin soporte de scroll timeline → todos los bloques renderizan con opacidad 1 y sin desplazamiento.
- Test unitario: con `prefers-reduced-motion: reduce` → todos los bloques renderizan con opacidad 1 y sin animación.
- Test unitario: en modo `@media print` → todos los bloques renderizan con opacidad 1 y sin desplazamiento.

**Criterio de hecho:** Los tres tests pasan en Vitest. El componente `Reveal` renderiza cualquier hijo con `opacity: 1` y `transform: none` cuando el revelado está inactivo.

---

## T2 — Componente Reveal base: cálculo de fase por bordes de pantalla

**Objetivo:** Implementar el cálculo de fase (`entry`, `stable`, `exit`) basado en la posición de los bordes del bloque respecto a la pantalla, con márgenes de seguridad (15 % inferior/superior para entrada/salida, 70 % / 30 % para estable).

**RF cubiertos:** RF-01, RF-02.

**Tests a escribir primero:**
- Test unitario: bloque con borde superior en el 15 % inferior de la pantalla → opacidad computada menor que 1.
- Test unitario: bloque con borde superior > 70 % y borde inferior < 30 % → opacidad computada igual a 1.
- Test unitario: bloque con borde inferior en el 15 % superior de la pantalla → opacidad computada menor que 1.
- Test unitario: en franjas intermedias, la opacidad es continua y monótona (sin saltos; no se verifica valor concreto).

**Criterio de hecho:** Los cuatro tests pasan. El componente `Reveal` aplica `opacity` y `transform` según la fase calculada, sin usar clases de Tailwind para el estado de opacidad.

---

## T3 — Bloques ya visibles al cargar (sin entrada ni parpadeo inicial)

**Objetivo:** Garantizar que los bloques inicialmente dentro del viewport al cargar la página muestren opacidad 1 desde el primer fotograma, sin transición de entrada.

**RF cubiertos:** RF-03.

**Tests a escribir primero:**
- Test unitario: página cargada sin scroll previo, bloque inicialmente visible → opacidad computada igual a 1 desde el primer fotograma.
- Test unitario: no se produce una transición de entrada visible para bloques ya en pantalla al cargar.

**Criterio de hecho:** Los dos tests pasan. El render inicial no aplica fase de entrada a bloques ya visibles.

---

## T4 — Pantalla sin scroll suficiente

**Objetivo:** Cuando el alto total de la página es menor o igual al alto del viewport, todo el contenido es visible (opacidad 1) sin necesidad de scroll.

**RF cubiertos:** RF-05.

**Tests a escribir primero:**
- Test unitario: `pageHeight <= viewportHeight` → todos los bloques muestran opacidad computada igual a 1 sin scroll.

**Criterio de hecho:** El test pasa. El cálculo de fase devuelve `stable` con opacidad 1 para todos los bloques cuando no hay scroll suficiente.

---

## T5 — Última sección (Contact) sin salida

**Objetivo:** La última sección de la página no tiene salida: ninguno de sus bloques se desvanece al salir. Al llegar al final, todos sus bloques tienen opacidad 1 aunque no hayan completado su entrada.

**RF cubiertos:** RF-04.

**Tests a escribir primero:**
- Test unitario: bloque de la última sección al final de la página → opacidad computada igual a 1.
- Test unitario: ningún bloque de la última sección muestra fase de salida por la parte alta de la pantalla.

**Criterio de hecho:** Los dos tests pasan. La propiedad `isLastSection` prevalece sobre la fase de salida.

---

## T6 — Reversibilidad del efecto

**Objetivo:** El efecto es reversible: al hacer scroll hacia atrás, el bloque vuelve a su fase anterior (estable con opacidad 1 o entrada con opacidad < 1).

**RF cubiertos:** RF-06.

**Tests a escribir primero:**
- Test unitario: tras salir por la parte alta y volver atrás, el bloque vuelve a opacidad 1 al ocupar su fase estable.
- Test unitario: tras entrar por la parte baja y volver atrás, el bloque vuelve a opacidad menor que 1 al salir de su fase de entrada.

**Criterio de hecho:** Los dos tests pasan. El cálculo de fase depende solo de la posición actual, nunca del historial de scroll.

---

## T7 — Scroll rápido sin contenido oculto

**Objetivo:** Con scroll rápido y parada brusca, ningún bloque queda a medio revelar ni invisible de forma permanente. Los bloques en fase estable muestran opacidad 1.

**RF cubiertos:** RF-07.

**Tests a escribir primero:**
- Test unitario: tras scroll rápido y detención, bloques en fase estable muestran opacidad computada igual a 1.
- Test unitario: ningún bloque queda con opacidad menor que 1 de forma permanente tras detener el scroll rápido.

**Criterio de hecho:** Los dos tests pasan. El recalculo ante scroll rápido no deja estados atascados.

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
