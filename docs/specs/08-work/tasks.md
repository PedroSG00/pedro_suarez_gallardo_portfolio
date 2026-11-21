# Tareas — 08 Work

**Estado:** En curso. Se deriva de `docs/specs/08-work/spec.md` y `docs/specs/08-work/plan.md`; debe respetar `docs/constitution.md`.

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

**Bloqueo conocido:** T4 modifica el `Reveal` compartido para distinguir la disponibilidad de JavaScript. No se inicia esa modificación sin aprobación explícita. Si no se aprueba, T4 y sus dependientes quedan bloqueadas; no se omite ni rebaja el requisito de RF-6.

---

## T1 — Crear Work estática con contenido bilingüe y lista accesible

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

---

## T2 — Integrar Work en la home conservando destino y orden

**Objetivo:** reemplazar el cuerpo reservado por Work sin duplicar la sección, el encabezado ni su destino, y conservar el orden de About, Work, Stack y Contact.

**RF:** RF-1.

**Depende de:** T1 y T2.

**Archivos previstos:** `src/app/[locale]/page.tsx`, pruebas e2e de home y navegación.

**Tests a escribir primero:**

- E2E en `/en` y `/es`: verificar el rótulo numerado y titular del idioma, un solo encabezado de sección y un solo destino `work`.
- E2E de orden: About antes de Work y Work antes de Stack y Contact; los demás destinos se mantienen.
- E2E de navegación: activar el enlace existente a Work y comprobar que el destino y encabezado quedan accesibles.

**Criterio de hecho:** Work ocupa el destino reservado una sola vez, aparece después de About y antes de Stack en ambos idiomas, y el destino existente funciona; pruebas e2e dirigidas, lint, typecheck y build pasan.

---

## T3 — Implementar la inversión visual de la fila

**Objetivo:** invertir visualmente toda la composición de una fila al pasar un cursor compatible, sin convertirla en una acción.

**RF:** RF-4, RF-5.

**Depende de:** T1.

**Archivos previstos:** `src/components/sections/Work/Work.module.css`, `e2e/work/work-visual.spec.ts`.

**Tests a escribir primero:**

- E2E de estado base e invertido para fondo, número, titular, resultado, tecnologías y separadores, usando estilos computados y no clases.
- Verificar que el estado invertido se revierte al salir el cursor y no cambia el contenido ni provoca navegación.
- Verificar contraste de texto AA en lectura estable en tema claro y oscuro, con la fila base e invertida.
- Verificar en entrada táctil y sin cursor que la fila permanece legible, no conserva hover persistente y no ofrece una acción.

**Criterio de hecho:** la fila completa invierte y revierte su presentación usando la paleta del tema activo, sin valores de color mágicos ni controles; los e2e visuales y de interacción, lint, typecheck y build pasan.

---

## T4 — Habilitar el fallback estático sin JavaScript en Reveal

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

---

## T5 — Aplicar Reveal a las cinco filas de Work

**Objetivo:** hacer que cada fila y su número entren, alcancen lectura estable y salgan según la posición actual de desplazamiento, con reversión al desplazarse hacia atrás.

**RF:** RF-6.

**Depende de:** T1, T2 y T4.

**Archivos previstos:** `src/components/sections/Work/Work.tsx`, pruebas e2e de movimiento de Work.

**Tests a escribir primero:**

- E2E de las cinco filas en ambos idiomas y ambos temas: estado de entrada, tramo de lectura, salida y reversión, medidos con estilos computados.
- Comprobar que número y contenido de cada fila se mueven juntos y que cada parte de una fila más alta que el viewport alcanza lectura plena.
- No usar clases, estructura de implementación ni historial de scroll como criterio de estado.

**Criterio de hecho:** todas las filas reflejan la posición actual, se leen plenamente en su tramo estable y revierten su estado al volver atrás; los e2e de movimiento, lint, typecheck y build pasan.

---

## T6 — Verificar movimiento reducido, falta de soporte y acceso directo

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

---

## T7 — Verificar temas, contraste, accesibilidad y adaptación

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

---

## T8 — Ejecutar gates y cerrar Work

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
