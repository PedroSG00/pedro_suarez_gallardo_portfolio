# Tareas — 08 Work

**Estado:** Completada (2026-11-21). Se deriva de `docs/specs/08-work/spec.md` y `docs/specs/08-work/plan.md`; respeta `docs/constitution.md`.

**Alcance:** RF-1 a RF-6 y sus requisitos no funcionales. Cada tarea se implementa y verifica por separado; ninguna se cierra con sus pruebas en rojo.

**Regla de trabajo:** tests primero; no se añaden dependencias; no se crean carpetas en la raíz ni en el primer nivel de `src/`; no se modifican capas transversales sin aprobación explícita.

**Cierre por tarea:** además de sus pruebas, `pnpm lint` y `pnpm typecheck` deben estar en verde. Si la tarea toca CSS o composición, también `pnpm build`; si toca idioma, tema, navegación o movimiento, también los e2e correspondientes. T8 ejecuta todos los gates.

---

## Mapa de tareas

| ID | Tarea | RF | Depende de |
|---|---|---|---|
| T1 | Crear Work estática con contenido bilingüe y lista accesible | RF-1, RF-2, RF-3, RF-5 | — |
| T2 | Integrar Work en la home conservando destino y orden | RF-1 | T1 |
| T3 | Implementar la inversión visual de la fila | RF-4 | T1, T2 |
| T4 | Habilitar el fallback estático sin JavaScript en Reveal | RF-6 | Aprobación explícita de Pedro |
| T5 | Aplicar Reveal a las cinco filas de Work | RF-6 | T1, T2, T4 |
| T6 | Verificar movimiento reducido, falta de soporte y acceso directo | RF-1, RF-6 | T2, T4, T5 |
| T7 | Verificar temas, contraste, accesibilidad y adaptación | RF-1–RF-6 | T2, T3, T5, T6 |
| T8 | Ejecutar gates y cerrar Work | RF-1–RF-6 | T1–T7 |

**Decisiones confirmadas por Pedro:** la dependencia autorreferente de T2 era un error: T2 depende solo de T1; T3 depende de T1 y T2. T4 tiene aprobación explícita limitada al fallback estático sin JavaScript del `Reveal` compartido. Esta aprobación no permite anticipar T4 durante otras tareas ni ampliar su alcance; RF-6 no se omite ni se rebaja.

---

## T1 — Crear Work estática con contenido bilingüe y lista accesible

**Estado:** hecha.

**Objetivo:** presentar los cinco resultados del brief en inglés y castellano, con su titular, resultado y tecnologías; mantener una estructura semántica y no interactiva.

**RF:** RF-1, RF-2, RF-3, RF-5.

**Depende de:** nada.

**Archivos previstos:** `src/content/work.ts`, `messages/en.json`, `messages/es.json`, `src/components/sections/Work/Work.tsx`, `src/components/sections/Work/Work.test.tsx`.

**Tests a escribir primero:**

- Verificar mediante `renderWithIntl` los textos reales en ambos idiomas, el encabezado de Work, los cinco resultados, sus tecnologías y el orden.
- Verificar que se presenta una lista de cinco elementos y que los titulares, resultados y tecnologías se leen dentro del elemento correspondiente.
- Verificar que los índices 01–05 son decorativos para tecnologías de asistencia.
- Verificar que las filas y etiquetas no son enlaces, botones ni paradas de foco.
- Extender la prueba de paridad existente para asegurar que los catálogos contienen las mismas claves de Work en ambos idiomas.

**Qué debe quedar:**

- Los textos traducibles viven en los catálogos y el orden, identificadores y tecnologías en los datos de Work.
- La numeración se deriva del orden canónico; no se duplica como dato independiente.
- La sección se muestra estática, sin aplicar aún el movimiento ni la inversión de color.
- Un registro o traducción incompletos bloquean el cierre; no hay fallback a otro idioma ni filas parciales.
- Se comprueba que `work.intro` y `work.results` no tienen consumidores antes de reemplazar esas claves por la estructura `experience.*` del brief.

**Criterio de hecho:** pruebas unitarias y paridad en verde; se muestran los cinco resultados completos en ambos idiomas, en el mismo orden, sin contenido inventado ni controles ficticios; lint, typecheck y build pasan.

**Evidencia (2026-11-21):**

- Tests escritos antes del código; fase roja registrada en `.tmp/test-T1-red.log` (faltaban el componente y las claves `experience.*`).
- `pnpm exec vitest run src/components/sections/Work/Work.test.tsx src/lib/i18n-parity.test.ts`: 12 pasan, 0 fallan (`.tmp/test-T1-unit.log`). Los seis tests de Work verifican el contenido literal del brief en EN/ES, su orden, lista ordenada, números decorativos y ausencia de controles/paradas de foco; la paridad exige los cinco registros completos.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`: verdes, ejecutados en ese orden. Suite completa: 490 tests pasan, 0 fallan, 44 archivos; cobertura: 96,76 % sentencias, 92,60 % ramas, 97,69 % funciones y 96,97 % líneas. Logs: `.tmp/lint-T1.log`, `.tmp/typecheck-T1.log`, `.tmp/test-T1.log`, `.tmp/build-T1.log`.
- `pnpm test:e2e e2e/i18n/i18n-routing.spec.ts --workers=2`: 31 pasan, 0 fallan (`.tmp/test-T1-e2e.log`), como regresión del idioma al actualizar ambos catálogos. Work aún no está integrada: su contenido se verifica con unitarias; la integración y sus e2e corresponden a T2.
- Búsqueda previa de consumidores de `work.intro` y `work.results`: ninguno; ambas claves se sustituyen por `experience.*` en EN/ES. No se modifican página, navegación, tema, estilos globales ni Reveal; sin dependencias nuevas y sin commit.

---

## T2 — Integrar Work en la home conservando destino y orden

**Estado:** hecha.

**Objetivo:** reemplazar el cuerpo reservado por Work sin duplicar la sección, el encabezado ni su destino, y conservar el orden de About, Work, Stack y Contact.

**RF:** RF-1.

**Depende de:** T1.

**Archivos previstos:** `src/app/[locale]/page.tsx`, pruebas e2e de home y navegación.

**Tests a escribir primero:**

- E2E en `/en` y `/es`: verificar el rótulo numerado y titular del idioma, un solo encabezado de sección y un solo destino `work`.
- E2E de orden: About antes de Work y Work antes de Stack y Contact; los demás destinos se mantienen.
- E2E de navegación: activar el enlace existente a Work y comprobar que el destino y encabezado quedan accesibles.

**Criterio de hecho:** Work ocupa el destino reservado una sola vez, aparece después de About y antes de Stack en ambos idiomas, y el destino existente funciona; pruebas e2e dirigidas, lint, typecheck y build pasan.

**Evidencia (2026-11-21):**

- Tests escritos antes del código en `e2e/home/home.spec.ts`; fase roja en `.tmp/test-T2-red.log`: los dos escenarios EN/ES fallaban porque el destino reservado no contenía el titular de Work.
- La home compone `Work` en lugar del placeholder, sin añadir envoltorio, encabezado ni destino duplicado. Los nueve e2e de home pasan dentro de la suite completa: rótulo `02 / Work` o `02 / Trabajo`, titular localizado, cinco resultados, orden About → Work → Stack → Contact y navegación existente a About/Work con encabezado visible, en viewport y enfocado; movimiento reducido activado.
- Primer gate e2e completo: 224 pasan y 2 fallan (`.tmp/test-T2-e2e.log`). La integración expuso desbordamiento de Work en ES a 320 px con texto al 200 %. Se corrigió únicamente la ruptura de palabras dentro de Work (`wrap-anywhere`), sin cambiar componentes compartidos, recortar contenido ni anticipar la matriz de T7.
- Tras esa única corrección, `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` pasan, ejecutados en ese orden. Unitarias: 490 pasan, 0 fallan, 44 archivos; cobertura: 96,76 % sentencias, 92,60 % ramas, 97,69 % funciones y 96,97 % líneas. Logs: `.tmp/lint-T2.log`, `.tmp/typecheck-T2.log`, `.tmp/test-T2.log`, `.tmp/build-T2.log`.
- `pnpm test:e2e --workers=2`: 226 pasan, 0 fallan, incluidos home (9), navegación, idioma, tema, movimiento y regresión de adaptación de About (`.tmp/test-T2-e2e-fixed.log`).
- Se conserva el trabajo de T1. Sin inversión de fila, movimiento de Work, cambios en Reveal, dependencias nuevas ni commit. T3 depende de T1 y T2; no se anticipan T3–T5.

---

## T3 — Implementar la inversión visual de la fila

**Estado:** hecha.

**Objetivo:** invertir visualmente toda la composición de una fila al pasar un cursor compatible, sin convertirla en una acción.

**RF:** RF-4, RF-5.

**Depende de:** T1 y T2.

**Archivos previstos:** `src/components/sections/Work/Work.module.css`, `e2e/work/work-visual.spec.ts`.

**Tests a escribir primero:**

- E2E de estado base e invertido para fondo, número, titular, resultado, tecnologías y separadores, usando estilos computados y no clases.
- Verificar que el estado invertido se revierte al salir el cursor y no cambia el contenido ni provoca navegación.
- Verificar contraste de texto AA en lectura estable en tema claro y oscuro, con la fila base e invertida.
- Verificar en entrada táctil y sin cursor que la fila permanece legible, no conserva hover persistente y no ofrece una acción.

**Criterio de hecho:** la fila completa invierte y revierte su presentación usando la paleta del tema activo, sin valores de color mágicos ni controles; los e2e visuales y de interacción, lint, typecheck y build pasan.

**Evidencia (2026-11-21):**

- Tests escritos antes del código en `e2e/work/work-visual.spec.ts`; fase roja en `.tmp/test-T3-red.log` (8 escenarios sin el tratamiento visual de fila).
- El CSS queda limitado a los atributos de Work, importado por efecto lateral como los módulos existentes. Dos correcciones locales adaptaron la primera implementación al pipeline actual: sin exports de clases y sin intentar recalcular los tokens heredados mediante `color-scheme`; la solución intercambia la pareja ink/surface ya resuelta del tema activo con alias locales, también para número, etiquetas y separadores.
- Los ocho escenarios nuevos pasan dentro de la suite e2e completa: EN/ES × claro/oscuro × cursor/táctil; verifican las cinco filas, fondo, número, titular, resultado, etiquetas y separadores mediante estilos computados, contraste estable ≥ 4,5:1, reversión al salir, persistencia del contenido y URL, ausencia de controles, foco añadido y cursor de acción. La preferencia guardada se prueba contra el tema contrario del sistema; el toque no conserva inversión.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`: verdes, ejecutados en ese orden. Unitarias: 490 pasan, 0 fallan, 44 archivos; cobertura: 96,76 % sentencias, 92,60 % ramas, 97,69 % funciones y 96,97 % líneas. Logs: `.tmp/lint-T3.log`, `.tmp/typecheck-T3.log`, `.tmp/test-T3.log`, `.tmp/build-T3.log`.
- `pnpm test:e2e --workers=2`: 234 pasan, 0 fallan, incluidos los ocho nuevos de Work y las regresiones existentes de idioma, tema, navegación, movimiento y adaptación (`.tmp/test-T3-e2e.log`). Capturas base/invertidas revisadas en `.tmp/work-{en,es}-{light,dark}-{base,inverted}.png`.
- Sin colores literales, dependencias, controles ni cambios de tema, estilos globales o Reveal. Se conserva el trabajo previo; no se anticipan T4/T5 ni se añade movimiento de scroll. Sin commit.

---

## T4 — Habilitar el fallback estático sin JavaScript en Reveal

**Estado:** hecha.

**Autorización registrada (2026-11-21):** Pedro respondió «Si» a «¿Confirmas esas dependencias y autorizas el cambio compartido de Reveal limitado a T4?». Se autoriza únicamente el fallback estático sin JavaScript de `Reveal.tsx` y `Reveal.module.css`, con sus pruebas y documentación; no un refactor general, dependencias, otras capas transversales ni T5.

**Objetivo:** hacer que el contenido no dependa de JavaScript para permanecer estático y visible, conservando el movimiento cuando JavaScript está disponible.

**RF:** RF-6.

**Depende de:** aprobación explícita de Pedro antes de modificar el `Reveal` compartido.

**Archivos previstos:** `src/components/ui/Reveal/Reveal.tsx`, `src/components/ui/Reveal/Reveal.module.css`, pruebas de `Reveal` y e2e de no-JavaScript.

**Tests a escribir primero:**

- E2E sin JavaScript: comprobar bloques representativos al inicio, en mitad y al final de la página, tanto antes como después del desplazamiento; todos permanecen visibles y estáticos.
- E2E con JavaScript: comprobar que el contrato actual de entrada, lectura, salida y reversibilidad sigue activo.
- Re-ejecutar las pruebas existentes de movimiento y fallbacks de secciones ya implementadas para detectar regresiones transversales.

**Qué debe quedar:**

- La prueba sin JavaScript falla antes del cambio si el movimiento CSS oculta o anima contenido.
- El movimiento se habilita solo al confirmar que JavaScript está disponible; el HTML y contenido siguen visibles sin él.
- Sin aprobación explícita, la tarea permanece bloqueada y no se modifica `Reveal`.

**Criterio de hecho:** aprobación registrada, pruebas de no-JavaScript y de movimiento con JavaScript en verde, fallbacks existentes sin regresiones, lint, typecheck, build y e2e afectados en verde. Si falta aprobación, T4 no se cierra.

**Evidencia (2026-11-21):**

- Tests escritos antes del código en `e2e/reveal/reveal-hydration.spec.ts`. La fase roja final (`.tmp/test-T4-red.log`) registra 4 fallos exclusivamente sin JavaScript y 13 escenarios verdes, incluidos los de entrada, lectura, salida y reversión con JavaScript. Los cuatro fallos comprueban soporte CSS real y detectan opacidad inferior a 1 en el HTML servido; no se confunden falta de JavaScript y falta de soporte CSS. La preparación de las pruebas nuevas se ajustó a la precisión de píxel del navegador y al rango de salida local de About antes de modificar Reveal.
- `Reveal` parte sin habilitación de movimiento, mantiene el contenido estático/visible y confirma disponibilidad de JavaScript desde su efecto existente, tras comprobar la geometría. El CSS desactiva animación, opacidad reducida, desplazamiento y recorte mientras falte esa confirmación. No se añaden listeners, cálculos de progreso, dependencias ni cambios en otras capas.
- Ocho e2e nuevos en EN/ES × claro/oscuro: cuatro con `javaScriptEnabled: false` verifican todos los bloques de Reveal servidos (inicio, intermedios y últimos), antes y después de desplazarse al centro, final y de vuelta; opacidad 1, sin transformación, recorte ni animaciones. Cuatro con JavaScript conservan entrada, lectura, salida y reversibilidad tras hidratar.
- Las fixtures CSS de movimiento existentes representan explícitamente el estado habilitado para seguir probando las animaciones y fallbacks, no el nuevo estado estático. Las pruebas antiguas de páginas cortas sin JavaScript ahora exigen opacidad 1: se retira su relajación previa de opacidad > 0.
- Gates ejecutados en orden: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e --workers=2`, todos verdes. Unitarias: 490 pasan, 0 fallan (44 archivos); cobertura: 96,77 % sentencias, 92,66 % ramas, 97,69 % funciones y 96,98 % líneas. E2E completos: 242 pasan, 0 fallan; incluyen movimiento compartido, Hero, About, movimiento reducido, impresión, falta de soporte, navegación, idioma, tema y Work existente.
- Logs: `.tmp/test-T4-lint.log`, `.tmp/test-T4-typecheck.log`, `.tmp/test-T4.log`, `.tmp/test-T4-build.log`, `.tmp/test-T4-e2e.log`. `git diff --check` verde. Se conservan todos los cambios previos y ajenos; Work no recibe Reveal todavía (T5 pendiente). Sin commit.

---

## T5 — Aplicar Reveal a las cinco filas de Work

**Objetivo:** hacer que cada fila y su número entren, alcancen lectura estable y salgan según la posición actual de desplazamiento, con reversión al desplazarse hacia atrás.

**RF:** RF-6.

**Depende de:** T1, T2 y T4.

**Autorización adicional registrada (2026-11-21):** Pedro respondió «Autorizo» a «¿Autorizas el ajuste mínimo compartido de Reveal para resolver las filas altas y reintentar T5?». Se autoriza únicamente ese arreglo de `Reveal` y sus tests de regresión, además de completar T5. No autoriza refactors generales, otras capas transversales, dependencias ni T6–T8.

**Archivos previstos:** `src/components/sections/Work/Work.tsx`, `e2e/work/work-motion.spec.ts` y, con la autorización adicional, `src/components/ui/Reveal/Reveal.module.css` y `e2e/reveal/reveal.spec.ts`.

**Tests a escribir primero:**

- E2E de las cinco filas en ambos idiomas y ambos temas: estado de entrada, tramo de lectura, salida y reversión, medidos con estilos computados.
- Comprobar que número y contenido de cada fila se mueven juntos y que cada parte de una fila más alta que el viewport alcanza lectura plena.
- No usar clases, estructura de implementación ni historial de scroll como criterio de estado.

**Criterio de hecho:** todas las filas reflejan la posición actual, se leen plenamente en su tramo estable y revierten su estado al volver atrás; los e2e de movimiento, lint, typecheck y build pasan.

**Estado:** Completada (2026-11-21), tras la autorización adicional y el reintento con todos los gates verdes.

**Histórico del bloqueo previo (resuelto en el reintento autorizado):**

- Tests primero: la primera ejecución sin composición de movimiento dio 4 casos rojos de entrada y 4 verdes de lectura estática (`.tmp/test-T5-red.log`). Se probó después un único `Reveal` por fila, con número y contenido dentro, sin modificar el contrato compartido.
- Al ampliar texto al 200 % en un viewport de 320 × 240, la última línea `TypeScript` de la primera fila no alcanza lectura plena en ninguno de los dos idiomas ni temas. Incluso en la posición más baja donde cabe la línea completa, su opacidad efectiva es `0.855463` y su desplazamiento `-6.93779px`; al subir sigue atenuándose. En el centro, `opacity=0.51828`. Evidencia: `.tmp/test-T5-motion-confirmation.log`; el diagnóstico completo dio 8 rojos (4 de filas altas y 4 de muestreo de entrada que todavía necesita ajustar la posición respecto al padding). La prueba anterior, con 390 × 480, ya detectaba atenuación en lectura central (`.tmp/test-T5-motion.log`).
- Causa identificada entonces sin modificarla: la salida compartida usaba `animation-timeline: view(block 0px)` y `cover 80% cover 100%`, por lo que el inicio del fundido dependía de la altura de toda la fila. En filas suficientemente altas empezaba antes de que el contenido final pudiera leerse plenamente. El marcador de salida existente no gobernaba esa animación.
- Se detuvo la implementación sin ampliar T4, añadir mecanismos locales de scroll, rebajar RF-6 ni avanzar T6–T8. Se retiraron únicamente la composición y el nuevo test experimental de T5 para no dejar la suite roja; propuestas conservadas en `.tmp/T5-Work.proposed.tsx` y `.tmp/T5-work-motion.proposed.ts`. El código y pruebas anteriores de T1–T4 y los cambios ajenos se conservan.
- Gates del estado restaurado, ejecutados en orden: lint, typecheck, 490 unitarios (0 fallos), build y `pnpm test:e2e` con 242 e2e (0 fallos). Logs: `.tmp/test-T5-restored-lint.log`, `.tmp/test-T5-restored-typecheck.log`, `.tmp/test-T5-restored.log`, `.tmp/test-T5-restored-build.log`, `.tmp/test-T5-restored-e2e.log`. `git diff --check` verde. Único cambio persistente de T5: esta documentación; sin commit.

**Evidencia del reintento autorizado:**

- Tests primero: se escribieron las pruebas de Work y tres regresiones de bloques de seis viewports para `rise`, `clip` y `fade`. Antes de implementar, 7 casos fallaron por los motivos esperados (4 de entrada de Work todavía estática y 3 de lectura final de bloques altos); 8 pasaron. Log: `.tmp/test-T5-retry-red.log`.
- Se reutiliza un `Reveal` por fila, con número, titular, resultado y tecnologías juntos. Se conservan `ol`/`li`, cinco resultados, el índice `aria-hidden`, la retícula y la inversión de fila de T3. Sin listeners ni mecanismo local de scroll, textos nuevos o cambios de contenido.
- Arreglo compartido mínimo: la salida usa el marcador inferior existente (`--reveal-exit`), con `view-timeline-inset: 0px` para conservar el inset explícito anterior y no heredar el `scroll-padding` de navegación. No se altera el contrato de props, el gating sin JavaScript de T4 ni los fallbacks. La regresión añade `scroll-padding-top` no nulo; antes del ajuste del inset, 3 variantes fallaban (`.tmp/test-T5-retry-inset-red.log`).
- Los e2e de Work miden opacidad efectiva y desplazamiento computado de número, titular, resultado y cada tecnología en entrada, lectura, salida y recorrido inverso, con estados coincidentes al volver a la misma posición. La geometría se obtiene del contenido, no de clases o wrappers. En EN/ES y claro/oscuro, cada línea real de las cinco filas refluídas a 200 % en 320 × 240 alcanza `opacity=1`, desplazamiento cero y ausencia de recorte en lectura centrada.
- Foco de movimiento y regresión compartida: 15 pasan, 0 fallan (`.tmp/test-T5-retry-motion-fixed.log`). Suite completa en orden: lint, typecheck, 490 unitarios, build y `pnpm test:e2e` con 253 e2e, todos verdes y sin fallos. Cobertura global: 96.77 % sentencias, 92.66 % ramas, 97.69 % funciones y 96.98 % líneas; sin modificar umbrales.
- Evidencia de gates: `.tmp/test-T5-retry-lint.log`, `.tmp/test-T5-retry-typecheck.log`, `.tmp/test-T5-retry.log`, `.tmp/test-T5-retry-build.log`, `.tmp/test-T5-retry-e2e.log`. Los e2e completos conservan las regresiones de Reveal, Hero, About, navegación, temas e idioma y el fallback sin JavaScript. `git diff --check` verde.
- Archivos de T5: `Work.tsx`, `Reveal.module.css`, `e2e/work/work-motion.spec.ts`, `e2e/reveal/reveal.spec.ts` y este registro. Se conservan T1–T4 y los cambios ajenos. Sin dependencias nuevas, otras capas transversales ni commit. No se implementan ni se cierran T6–T8.

---

## T6 — Verificar movimiento reducido, falta de soporte y acceso directo

**Estado:** hecha (2026-11-21).

**Objetivo:** comprobar que Work permanece completa en los fallbacks y que la carga o navegación directa dentro de la sección respeta la posición actual.

**RF:** RF-1, RF-6.

**Depende de:** T2, T4 y T5.

**Archivos previstos:** `e2e/work/work-fallbacks.spec.ts`, pruebas de anclas si requieren ampliación.

**Tests a escribir primero:**

- Con movimiento reducido: verificar las cinco filas visibles, estáticas y con contraste AA desde el primer fotograma.
- Sin soporte de animación por scroll: simular soporte ausente y verificar el mismo estado estático completo.
- Sin JavaScript: verificar las cinco filas, sus índices, textos y etiquetas visibles y estáticos en Work.
- Acceder directamente a `#work` y recargar con la página dentro de Work; verificar el estado que corresponde a la posición actual, sin volver arriba ni repetir una entrada.

**Criterio de hecho:** todos los fallbacks y escenarios de acceso pasan en ambos idiomas; Work nunca depende de movimiento para presentar su contenido; e2e dirigidos, lint y typecheck pasan.

**Evidencia de verificación (2026-11-21):**

- Tests primero en `e2e/work/work-fallbacks.spec.ts`, sin necesitar cambios de producción: los escenarios iniciales ya pasan sobre T1–T5 (`.tmp/test-T6-first.log`, 17 pasan). El conjunto final añade cuatro comprobaciones de primer fotograma sin scripts de aplicación: 21 pasan, 0 fallan (`.tmp/test-T6-fallbacks.log`).
- Matriz EN/ES × claro/oscuro: las cinco filas conservan índices, titulares, resultados y todas sus tecnologías con movimiento reducido, sin soporte simulado de animación por scroll y con JavaScript realmente desactivado. Se miden opacidad efectiva 1, matriz identidad, ausencia de recorte, visibilidad y cero animaciones en toda la cadena de antecesores de cada texto, al entrar, leer, salir y volver. Contraste compuesto ≥ 4,5:1, incluidos los índices.
- El observador instalado antes de los scripts de página registra el primer fotograma con las cinco filas y vigila los posteriores para movimiento reducido y falta de soporte. Un control positivo sin fallback detecta movimiento real: la observación no pasa por estar vacía o inactiva.
- Con JavaScript desactivado a nivel de navegador tampoco se ejecutan callbacks de `requestAnimationFrame`: se verifica el documento desde `DOMContentLoaded` y durante el desplazamiento. Como complemento para observar el primer fotograma sin JavaScript de aplicación, cuatro escenarios bloquean TODOS sus scripts mediante CSP (externos e inline), conservando solo el observador privilegiado de Playwright. Los eventos de violación confirman ambos bloqueos; el primer fotograma mantiene todo estático y con contraste AA.
- La ausencia de soporte se simula sustituyendo `view(...)` por un valor no soportado en las hojas servidas, incluidas sus consultas `@supports`, antes de aplicarlas. Se ejecuta el fallback real de producción; no se inyectan estilos que impongan el resultado ni se falsea `CSS.supports`. La capacidad nativa de Chromium se comprueba por separado. No representa una ejecución en Safari o Firefox, fuera de T6.
- Acceso directo a `#work`: encabezado en viewport, desplazamiento no nulo y pintura idéntica al llegar a esa misma posición desde arriba. Recarga dentro de la tercera fila, en lectura plena y salida parcial: conserva exactamente el scroll y los estilos computados de las cinco filas; ocho muestreos posteriores confirman que no vuelve al ancla ni repite una entrada. Ambos idiomas y temas.
- Gates ejecutados en orden: lint, typecheck, 490 unitarios (44 archivos, 0 fallos) y build verdes. Cobertura: 96,77 % sentencias, 92,66 % ramas, 97,69 % funciones y 96,98 % líneas. Logs: `.tmp/test-T6-lint.log`, `.tmp/test-T6-typecheck.log`, `.tmp/test-T6.log`, `.tmp/test-T6-build.log`.
- Gate final `pnpm test:e2e --workers=2`: 274 pasan, 0 fallan, incluidas las 21 verificaciones de T6 y todas las regresiones previas de Work, Reveal, Hero, About, navegación, idioma y tema (`.tmp/test-T6-e2e.log`). `git diff --check` verde. T6 queda cerrada sin pruebas rojas.
- Solo se añaden pruebas y este registro; no se amplían las autorizaciones transversales de T4/T5, no se cambian dependencias y no se implementan T7/T8. Se conservan los cambios anteriores y ajenos. Sin commit.

---

## T7 — Verificar temas, contraste, accesibilidad y adaptación

**Estado:** Hecha.

**Objetivo:** validar la experiencia completa en la matriz de idiomas, temas, hover, movimiento y tamaños acordados.

**RF:** RF-1–RF-6 y requisitos no funcionales.

**Depende de:** T2, T3, T5 y T6.

**Archivos previstos:** `e2e/work/work.spec.ts`, `e2e/work/work-visual.spec.ts`, `e2e/work/work-motion.spec.ts`, `e2e/work/work-fallbacks.spec.ts`.

**Tests a escribir primero:**

- Matriz EN/ES × claro/oscuro para contenido, orden, semántica y apariencia base/invertida.
- Contraste AA en estados estables base e invertido, para texto normal y grande según su tamaño y peso; con movimiento reducido, desde el primer fotograma. No medir durante fundidos o transiciones.
- Viewports de 320 px y 1920 px y texto ampliado al 200 %: verificar los cinco resultados, sin recortes, solapamientos ni scroll horizontal.
- Comprobar lista accesible, relación entre título y contenido, foco de teclado y ausencia de controles inesperados.
- Comprobar filas altas, dispositivos híbridos, toque sin hover persistente y que el movimiento no interrumpa la lectura.

**Criterio de hecho:** la matriz y los límites de adaptación pasan; se conserva toda la información, no hay controles ficticios y el contraste cumple exactamente en los estados establecidos; e2e, lint, typecheck y build pasan.

**Evidencia de verificación (2026-11-21):**

- Tests primero, sin cambios de producción: `e2e/work/work.spec.ts` añade 16 combinaciones EN/ES × claro/oscuro × 320/1920 px × texto 100/200 %, y cuatro recorridos de teclado. Se comprueban lista ordenada, cinco titulares y resultados completos, tecnologías, índices decorativos, encabezados localizados, ausencia de controles o focos ficticios, destino enfocado sin quedar bajo el Navbar y siguiente parada en un enlace real.
- La ampliación duplica los tamaños computados de los textos de Work además del tamaño raíz: duplicar solo `rem` no duplica el término `vw` de una tipografía fluida. Se verifican fragmentos de texto dentro del viewport, recortes reales de antecesores, ausencia de colisión entre piezas de contenido y ausencia de scroll horizontal. Las cajas em que sobresalen de una línea con `overflow: visible` no se confunden con un recorte.
- Contraste compuesto en lectura estática, con tamaño y peso computados: ≥ 4,5:1 para texto normal y ≥ 3:1 para texto grande (24 px o 18,6667 px con peso ≥ 700). Se conservan las comprobaciones base/invertido de las cinco filas y los muestreos de primer fotograma con movimiento reducido de T3/T6, que además exigen ≥ 4,5:1 para todos los textos de fila.
- `work-motion.spec.ts` añade cuatro escenarios de independencia entre inversión y scroll: el cursor inmóvil cambia de fila según su posición actual, el hover no desplaza la página ni altera opacidad/transformación, y la entrada parcial y el retorno a lectura siguen dependiendo del scroll. Se conservan las pruebas de cada línea de filas más altas que el viewport.
- `work-visual.spec.ts` añade cuatro escenarios de escritorio híbrido con entrada primaria táctil y ratón real emulado: capacidad de toque y puntero grueso comprobadas; alternar movimiento de ratón, toque nativo y salida no produce acción ni inversión persistente. Se conservan los escenarios de cursor fino con hover y de móvil táctil. Es emulación Chromium, no certificación sobre hardware físico ni sobre Safari/Firefox.
- `work-fallbacks.spec.ts` añade cuatro cambios dinámicos de preferencia durante lectura: confirma primero una fila plenamente visible y otras atenuadas, registra el primer fotograma con la nueva preferencia, exige todas las filas estáticas y AA desde ese fotograma, conserva el scroll y permite seguir recorriéndolas.
- Primera ejecución completa: 285 e2e pasan y 21 fallan (`.tmp/test-T7-e2e-first.log`): los tests nuevos confundían cajas em con recorte, asumían que ampliar solo la raíz duplicaba fuentes fluidas y usaban `Locator.hover()`, que puede desplazar automáticamente una fila parcialmente visible. Se corrige únicamente la medición/emulación. Un muestreo manual heredado de T6 se adelantó a la disponibilidad de CSS; ahora se toma tras `load`, conservando sin retrasar el observador rAF preinstalado del primer fotograma.
- Gates finales en orden: `pnpm lint`, `pnpm typecheck`, `pnpm test` (490 pasan, 0 fallan; 44 archivos), `pnpm build` y `pnpm test:e2e --workers=2` (306 pasan, 0 fallan; 4,5 minutos). Cobertura: 96,77 % sentencias, 92,66 % ramas, 97,69 % funciones y 96,98 % líneas. Logs completos: `.tmp/test-T7-lint.log`, `.tmp/test-T7-typecheck.log`, `.tmp/test-T7.log`, `.tmp/test-T7-build.log` y `.tmp/test-T7-e2e.log`.
- T7 añade 32 e2e; junto con los escenarios anteriores de Work, se ejecutan 69 verificaciones de esta sección. No se cambian producción, capas transversales, dependencias ni autorizaciones. Se conservan los cambios ajenos y anteriores, sin commit. T7 queda cerrada en verde; T8 sigue pendiente y no se ejecuta como tarea.

---

## T8 — Ejecutar gates y cerrar Work

**Estado:** hecha (2026-11-21), incluidos los gates, el cotejo independiente requisito por requisito y el cierre de la spec.

**Objetivo:** verificar la trazabilidad completa y confirmar que ningún requisito queda con pruebas rojas o fallbacks pendientes.

**RF:** RF-1–RF-6 y requisitos no funcionales.

**Depende de:** T1–T7.

**Tests a escribir primero:** no se añaden pruebas nuevas; se ejecutan las escritas primero en T1–T7 y se confirma que cada RF tiene cobertura observable.

**Criterio de hecho:**

1. `pnpm lint` pasa sin errores ni advertencias.
2. `pnpm typecheck` pasa.
3. `pnpm test` pasa con al menos 85 % de cobertura global en líneas, funciones, ramas y sentencias.
4. `pnpm build` pasa.
5. `pnpm test:e2e` pasa para idioma, tema, navegación, movimiento y fallbacks de Work.
6. T4 cuenta con aprobación explícita y no queda ningún bloqueo transversal sin resolver.
7. Las cinco entradas y sus traducciones coinciden con el brief aprobado; no hay dudas abiertas ni tareas cerradas con tests en rojo.

**Evidencia de T8 (2026-11-21):**

- No se añaden ni modifican pruebas o código de producción. Se reejecutan las pruebas escritas en T1–T7, conservando todos los cambios anteriores y ajenos. Sin dependencias nuevas, ampliación de autorizaciones, cambios de roadmap ni commit.
- Gates ejecutados exactamente en este orden, todos con salida completa redirigida:

| Gate | Resultado | Evidencia |
|---|---|---|
| `pnpm lint` | Pasa, sin errores ni advertencias | `.tmp/test-T8-lint.log` |
| `pnpm typecheck` | Pasa | `.tmp/test-T8-typecheck.log` |
| `pnpm test` | 490 pasan, 0 fallan; 44 archivos | `.tmp/test-T8-unit.log` |
| `pnpm build` | Pasa | `.tmp/test-T8-build.log` |
| `pnpm test:e2e` | 306 pasan, 0 fallan; Chromium, 2,1 minutos; sin reintentos ni casos omitidos | `.tmp/test-T8-e2e.log` |

- Total: 796 pruebas pasan, 0 fallan. La suite e2e incluye 69 escenarios de Work y 9 de home, además de las regresiones de idioma, tema, navegación, Reveal, Hero, About y sus fallbacks. No se necesitaron intentos de arreglo.
- Cobertura global real: sentencias **96,77 % (601/621)**, ramas **92,66 % (417/450)**, funciones **97,69 % (127/130)** y líneas **96,98 % (580/598)**. Las cuatro métricas superan el 85 %. `vitest.config.mts` permanece sin cambios: umbrales del 85 % y exclusiones existentes intactos.

**Trazabilidad contrastada con las pruebas existentes y la ejecución de T8:**

| Requisito | Evidencia observable en verde |
|---|---|
| RF-1 | `Work.test.tsx` verifica rótulo, titular y destino en EN/ES; `e2e/home/home.spec.ts` verifica ubicación About → Work → Stack → Contact, unicidad de sección/encabezado y navegación con foco; `work.spec.ts` verifica teclado y destino visible; `work-fallbacks.spec.ts` verifica acceso directo y recarga. |
| RF-2 | Los seis casos de `Work.test.tsx` comprueban contenido literal y tecnologías del brief en EN/ES; `src/lib/i18n-parity.test.ts` comprueba claves y campos completos; `work.spec.ts` y `work-fallbacks.spec.ts` comprueban las cinco entradas completas en navegador. |
| RF-3 | `Work.test.tsx` comprueba orden, lista ordenada de cinco elementos e índices decorativos 01–05; `work.spec.ts` repite orden, contenido por fila y `aria-hidden` en ambos idiomas y temas. |
| RF-4 | `work-visual.spec.ts` comprueba fondo, número, titular, resultado, tecnologías y separadores base/invertidos, contraste, reversión y ausencia de acción en EN/ES × claro/oscuro; `work-motion.spec.ts` comprueba independencia entre cursor inmóvil y scroll; se incluyen móvil táctil y escritorio híbrido emulados. |
| RF-5 | `Work.test.tsx`, `work.spec.ts` y `work-visual.spec.ts` comprueban ausencia de enlaces, botones, focos ficticios y navegación al señalar/tocar filas o etiquetas; el recorrido de teclado salta a un control real. |
| RF-6 | `work-motion.spec.ts` comprueba las cinco filas en entrada, lectura, salida y reversión, y cada línea de filas más altas que el viewport; `work-fallbacks.spec.ts` comprueba ancla, recarga, movimiento reducido inicial/dinámico, falta de soporte simulado y JavaScript desactivado; `reveal-hydration.spec.ts` conserva fallback estático e hidratación reversible compartidos. |
| RNF: contraste, semántica y adaptación | `work.spec.ts` comprueba EN/ES × claro/oscuro × 320/1920 px × texto 100/200 %, contenido sin recorte, colisión ni scroll horizontal, contraste según tamaño/peso, lista accesible y teclado. `work-visual.spec.ts` comprueba AA en lectura base/invertida; `work-fallbacks.spec.ts` comprueba AA y presentación estática desde el primer fotograma observable, incluido el cambio dinámico a movimiento reducido. |
| RNF: lectura, fallbacks y contenido aprobado | Los escenarios de filas altas comprueban opacidad 1, desplazamiento cero y ausencia de recorte por línea en lectura; los fallbacks conservan las cinco filas durante el recorrido. La comprobación literal del brief se detalla a continuación; no se añaden hechos, empleadores, fechas, métricas ni tecnologías. |

**Comprobación del brief aprobado (`docs/content-brief.md`, sección 3):**

- Cotejo literal de `messages/en.json`, `messages/es.json`, `src/content/work.ts` y las expectativas independientes de `Work.test.tsx`: coinciden el titular «What I've built.» / «Lo que he construido.», los diez titulares de entrada, los diez resultados completos, el orden y todas las tecnologías.

| Orden / identificador | Titular EN / ES coincidente | Tecnologías coincidentes |
|---|---|---|
| 01 / `desktopAppsToWeb` | Desktop apps, moved to the web. / Aplicaciones de escritorio, llevadas a la web. | React, TypeScript |
| 02 / `liveSupervisionDashboard` | A real-time supervision dashboard. / Un panel de supervisión en tiempo real. | React, TypeScript |
| 03 / `adminSuite` | An admin suite with dozens of sections. / Una suite de administración con decenas de secciones. | React, TypeScript |
| 04 / `visualFlowEditor` | A visual flow editor. / Un editor visual de flujos. | React, TypeScript, WebSockets |
| 05 / `integrationsAndBackendApis` | Integrations and backend APIs. / Integraciones y APIs de backend. | Node.js, Express, C#, PHP, Python, REST |

**Límites y traspaso:**

- T1–T7 constan hechas con sus ejecuciones finales en verde. Los rojos históricos de tests primero y el bloqueo anterior de T5 permanecen documentados, no abiertos: T5 registra su resolución autorizada y T8 vuelve a ejecutar toda la suite sin fallos.
- La aprobación explícita de T4 y la autorización adicional limitada de T5 constan en sus apartados. No se detectan dudas abiertas ni bloqueos transversales pendientes dentro de T8.
- La evidencia de navegador es Chromium; la ausencia de soporte de scroll se simula sobre el CSS servido. No acredita una ejecución nativa en Safari/Firefox ni hardware híbrido físico. Estas limitaciones no bloquean los criterios de esta spec; permanecen para la fase de pulido multiplataforma.
- Verificación independiente final: `pnpm test` (490/490, 44 archivos) y `pnpm test:e2e --workers=2` (306/306, Chromium) pasan sin reintentos. La auditoría requisito por requisito confirma cobertura observable y resultados verdes para RF-1–RF-6; los criterios de finalización y el brief aprobado quedan satisfechos.
- `git diff --check` pasa. **Cierre:** Work queda completada; todos los requisitos funcionales y no funcionales definidos para esta spec cuentan con evidencia en verde.

## Reajuste visual — 2026-11-22

- A petición de Pedro, se refuerza la presentación local de Work: apertura de gran escala, índices protagonistas y titulares destacados junto a la explicación en escritorio; composición apilada en móvil. Se conservan contenido bilingüe, semántica, navegación, inversión y movimiento.
- Tests primero: los cuatro escenarios nuevos de jerarquía editorial fallan con la presentación anterior. Se comprueban tamaños relativos y disposición visible, no clases. La revisión al 200 % detecta índices partidos; la comprobación de una sola línea falla antes de reservarles una columna de ancho intrínseco.
- Solo se modifican `Work.tsx`, `Work.module.css`, su prueba e2e y la documentación de la spec. Sin cambios en componentes compartidos, tokens globales, traducciones ni dependencias.
- Validación final en orden: `pnpm lint`, `pnpm typecheck`, `pnpm test` (490/490), `pnpm build` y `pnpm test:e2e --workers=2` (310/310, Chromium, sin reintentos), todos verdes. Cobertura global: 96,77 % sentencias, 92,66 % ramas, 97,69 % funciones y 96,98 % líneas.
- Revisión visual del render en castellano/claro e inglés/oscuro a 1440 px y castellano a 390 px; también se revisan las composiciones intermedias a 768/1024 px y el hover completo. Se comprueban los cinco índices al 200 %. Las pruebas conservan la matriz EN/ES, temas, adaptación 320/1920 px, contraste, movimiento y fallbacks.

### Segunda pasada: escala contenida e iconos

- Pedro pide reducir el tamaño e incorporar iconos a las entradas. La apertura pasa del token `title-lg` a `title` (aproximadamente 96 → 48 px en escritorio), con menos espacio vertical. Los titulares de fila se reducen conservando una jerarquía clara respecto al cuerpo; los números pasan a escala de metadatos.
- Cada registro de `src/content/work.ts` incorpora un icono de Iconoir: `Computer`, `GraphUp`, `ViewGrid`, `Network` y `Server`. Se muestran junto al índice, dentro del mismo Reveal; heredan el color de la fila y son decorativos y no enfocables.
- Tests primero: dos unitarios fallan por la ausencia de iconos y los cuatro e2e de jerarquía fallan por el tamaño anterior de la apertura. Tras implementar, las seis pruebas unitarias de Work y los cuatro escenarios de jerarquía pasan.
- Lint, tipos, 490 unitarias con la cobertura anterior intacta y build pasan en orden. Se revisan capturas reales en móvil y escritorio, ambos temas, las cinco entradas y la inversión completa.
- El puerto 3000 estaba ocupado y se conserva el servidor existente. Se usa una configuración temporal que hereda la de Playwright y solo cambia el puerto al 3002: 309 e2e pasan, incluidos los 73 de Work; falla un caso de idioma cuya intercepción usa literalmente `http://127.0.0.1:3000/`. La misma comprobación de `Accept-Language` con la URL del servidor aislado pasa (1/1), sin modificar producción ni tests de idioma. Esto no se presenta como una ejecución estándar de 310/310 en el puerto 3000.
- Sin dependencias nuevas, cambios globales, commit ni push.
