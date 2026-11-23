# Tareas — Spec 09 Stack

**Fuente:** `docs/specs/09-stack/spec.md` y `docs/specs/09-stack/plan.md`.
**Regla de trabajo:** tests primero; sin dependencias adicionales; sin cambios en capas compartidas sin aprobación explícita.
**Estado:** implementación reiniciada. La anterior (registro, sección estática, filtros y mensajes) se retiró del repositorio; el árbol solo contiene documentación de Stack.

## Bloqueos previos

Antes de implementar T1:

- [x] Aprobar las 25 descripciones EN/ES de `docs/specs/09-stack/content-review.md` y la instrucción del casillero. Aprobado por el usuario.
- [x] Registrar en `docs/constitution.md` la incorporación de Three.js al stack cerrado. Es una capa transversal: requiere autorización explícita. Autorizado y registrado.
- [x] Adoptar las 25 tecnologías y seis categorías de la sección 4 del brief, con prioridad visual de React y TypeScript.
- [x] Casillero inicial sin selección, con instrucción breve.
- [x] Conservar posiciones, filtro, selección y descripción al alternar 2D↔3D.
- [x] Sustituir la propuesta CSS por Three.js.
- [x] Presentar una lista plana cuando no haya JavaScript o WebGL.
- [x] Autorizar las carpetas necesarias para Stack bajo `src/`.

No se implementa una tarea mientras sus decisiones previas sigan abiertas. No se inventan descripciones ni se sustituyen por placeholders publicables.

## Mapa y dependencias

| ID | Tarea | RF | Depende de |
|---|---|---|---|
| T1 | Registrar tecnologías y descripciones bilingües | RF-1, RF-3 | Bloqueos previos |
| T2 | Lista plana accesible e integración de la sección | RF-1, RF-3, RF-9 | T1 |
| T3 | Filtrar por categoría | RF-2 | T2 |
| T4 | Casillero y selección sin arrastre | RF-3 | T2, T3 |
| T5 | Escena Three.js en 2D con cartas flotantes | RF-1, RF-4, RF-5 | T2–T4 |
| T6 | Arrastre de cartas en la escena | RF-4 | T5 |
| T7 | Límites del área y colisiones | RF-4 | T6 |
| T8 | Switch 2D/3D con continuidad espacial | RF-5 | T7 |
| T9 | Zoom 3D con límites | RF-6 | T8 |
| T10 | Rotación 3D y controles accesibles | RF-7 | T8, T9 |
| T11 | Entrada, idioma y degradación sin WebGL | RF-8, RF-9 | T2–T10 |
| T12 | Verificación de la matriz de aceptación | RF-1–RF-9 | T1–T11 |

## T1 — Registrar tecnologías y descripciones bilingües

**Objetivo:** fijar el registro canónico de las 25 tecnologías y sus descripciones aprobadas.

**RF:** RF-1, RF-3.

**Tests a escribir primero:**

- El registro contiene exactamente las 25 tecnologías, en sus seis categorías y orden editorial.
- Identificadores únicos, categorías permitidas y prioridad de React/TypeScript en Frontend.
- Cada tecnología tiene nombre y descripción en EN y ES, con claves equivalentes en ambos catálogos.
- Ninguna descripción menciona niveles, métricas, proyectos, clientes ni resultados.

**Qué debe quedar:**

- Registro estático con `id`, categoría, orden e icono.
- Descripciones EN/ES aprobadas en los catálogos de idioma.
- Si falta una descripción o su traducción, la tarea queda bloqueada.

**Criterio de hecho:** pasan los tests de integridad y paridad; las 25 descripciones están aprobadas y presentes en ambos idiomas.

**Estado:** completada. `src/content/stack.ts` contiene el registro canónico (25 tecnologías, seis categorías, orden editorial, ids únicos e iconos) y `FEATURED_STACK_TECHNOLOGY_IDS` para la prioridad visual de React y TypeScript sin alterar el orden de lectura. `messages/en.json` y `messages/es.json` incluyen nombre y descripción aprobados para las 25 claves. `src/content/stack.test.ts` cubre integridad, orden, categorías, prioridad, paridad y ausencia de niveles, métricas, proyectos personales, clientes y resultados.

## T2 — Lista plana accesible e integración de la sección

**Objetivo:** sustituir el placeholder de Stack por la lista plana completa, legible sin JavaScript y base semántica de la sección.

**RF:** RF-1, RF-3, RF-9.

**Tests a escribir primero:**

- Encabezado único, seis categorías y 25 tecnologías en EN y ES.
- Cada tecnología muestra nombre, icono decorativo y descripción; React/TypeScript con prioridad visual sin niveles.
- Orden de lectura editorial; Stack después de Work y antes de Contact.
- Sin controles de filtro, modo, zoom o rotación.
- E2E sin JavaScript: lista completa y legible en ambas rutas de idioma.

**Qué debe quedar:**

- Lista plana servida desde el servidor, sin depender de interacción.
- Sección integrada en el destino existente, sin duplicar encabezado ni navegación.
- Contratos actuales de `Section` y `Reveal` intactos.

**Criterio de hecho:** unitarios y e2e sin JavaScript pasan en ambos idiomas; lint, typecheck y build pasan.

## T3 — Filtrar por categoría

**Objetivo:** permitir una categoría activa o «Todas», atenuando y deshabilitando las tecnologías de otras categorías.

**RF:** RF-2.

**Depende de:** T2.

**Tests a escribir primero:**

- «Todas» activa inicialmente; todas habilitadas.
- Selección única entre las seis categorías y «Todas», con etiquetas localizadas.
- Las no coincidentes siguen visibles, atenuadas, no accionables por ratón, teclado ni tacto, y fuera del orden de foco.
- Contraste AA de las atenuadas en ambos temas.
- Nombre accesible del filtro y estado activo comunicado.

**Qué debe quedar:**

- Filtro sin mover ni reordenar; al volver a «Todas» todo se habilita.
- Estado del filtro en la lógica pura, reutilizable por la escena de T5.

**Criterio de hecho:** unitarios de estado, tests de sección y e2e de filtros pasan; lint y typecheck pasan.

## T4 — Casillero y selección sin arrastre

**Objetivo:** seleccionar una tecnología habilitada con teclado, ratón o tacto y mostrar su descripción.

**RF:** RF-3.

**Depende de:** T2, T3.

**Tests a escribir primero:**

- Casillero inicial con la instrucción aprobada y sin descripción.
- Selección por activación accesible muestra la descripción correcta en el idioma activo.
- Seleccionar otra reemplaza la anterior; solo hay una seleccionada.
- Las atenuadas no se pueden seleccionar por ningún método.
- Cambiar de filtro conserva la descripción aunque la carta quede atenuada.

**Qué debe quedar:**

- Estado de selección único y contenido siempre procedente de los textos aprobados.

**Criterio de hecho:** unitarios de estado, tests de sección y e2e de selección accesible pasan; lint y typecheck pasan.

## T5 — Escena Three.js en 2D con cartas flotantes

**Objetivo:** montar el canvas WebGL con las cartas, sustituyendo visualmente la lista cuando hay soporte, sin perder accesibilidad.

**RF:** RF-1, RF-4, RF-5.

**Depende de:** T2, T3, T4.

**Tests a escribir primero:**

- Con WebGL disponible se monta la escena; sin WebGL se mantiene la lista plana y no aparecen controles de canvas.
- La lista permanece en el árbol de accesibilidad mientras la escena está visible.
- Las 25 cartas existen con su nombre e icono; React/TypeScript mantienen prioridad.
- Selección por *raycasting* actualiza el mismo estado que la selección accesible.
- Desmontar libera recursos y no deja listeners ni errores.

**Qué debe quedar:**

- `stack-scene.ts` como único punto de importación de Three.js.
- Render bajo demanda, sin bucle continuo ni flotación idle.
- Sin controles de modo, zoom o rotación todavía.

**Criterio de hecho:** unitarios de capacidades y estado, tests de sección y e2e de montaje y selección en canvas pasan; lint, typecheck y build pasan.

## T6 — Arrastre de cartas en la escena

**Objetivo:** mover cartas habilitadas y seleccionar al soltarlas en el casillero.

**RF:** RF-4.

**Depende de:** T5.

**Tests a escribir primero:**

- Soltar en el casillero selecciona y actualiza la descripción.
- Soltar fuera conserva posición y selección.
- Las atenuadas no se arrastran ni seleccionan.
- El gesto de arrastre no se confunde con seleccionar sin arrastrar, en ratón y táctil.
- El arrastre no bloquea el desplazamiento de la página fuera del gesto.

**Qué debe quedar:**

- Arrastre como una vía más, nunca la única.

**Criterio de hecho:** tests de interacción y e2e de drop dentro/fuera pasan; lint, typecheck y build pasan.

## T7 — Límites del área y colisiones

**Objetivo:** mantener las cartas dentro del canvas y evitar que se oculten por completo entre sí.

**RF:** RF-4.

**Depende de:** T6.

**Tests a escribir primero:**

- Una carta soltada fuera del área queda dentro.
- El solapamiento parcial está permitido; la repulsión separa las cartas y ninguna queda completamente tapada.
- Los cuatro bordes se respetan en viewports estrechos y con texto ampliado.
- Una carta junto al borde sigue siendo alcanzable y seleccionable.
- La colocación inicial es determinista y no tapa el casillero.

**Qué debe quedar:**

- `stack-geometry` con límites verificables y sin valores mágicos repetidos.
- Sin scroll horizontal ni recortes.

**Criterio de hecho:** unitarios de límites y repulsión, y e2e en móvil y escritorio, pasan; lint, typecheck y build pasan.

## T8 — Switch 2D/3D con continuidad espacial

**Objetivo:** alternar la misma escena entre composición plana y perspectiva conservando posiciones.

**RF:** RF-5.

**Depende de:** T7.

**Tests a escribir primero:**

- Inicio en 2D; el switch alterna en ambos sentidos cuando hay soporte.
- Las cartas conservan posición y no desaparecen para reaparecer en otra composición.
- Filtro, selección y descripción se conservan al alternar.
- Con `prefers-reduced-motion` el cambio es instantáneo.
- Sin soporte 3D el switch no aparece y 2D sigue completo.

**Qué debe quedar:**

- Una sola escena y un solo grupo de cartas; la cámara cambia, no el contenido.
- Sin dependencias nuevas ni cambios de tema global.

**Criterio de hecho:** tests de sección y e2e de modos, continuidad y fallback pasan; lint, typecheck y build pasan.

## T9 — Zoom 3D con límites

**Objetivo:** acercar y alejar la vista 3D con rueda y controles accesibles.

**RF:** RF-6.

**Depende de:** T8.

**Tests a escribir primero:**

- La rueda sobre la escena acerca y aleja en la dirección esperada.
- Los controles funcionan con ratón, teclado y tacto.
- En los límites, más entradas en esa dirección no cambian el zoom.
- Las cartas siguen explorables en ambos extremos.
- La rueda fuera del canvas mantiene el desplazamiento de la página.

**Qué debe quedar:**

- Rango de zoom acotado y calibrado, con nombres accesibles y foco visible.

**Criterio de hecho:** unitarios de límites y e2e de rueda y controles pasan; lint, typecheck y build pasan.

## T10 — Rotación 3D y controles accesibles

**Objetivo:** rotar horizontal y verticalmente arrastrando el fondo o con controles accesibles.

**RF:** RF-7.

**Depende de:** T8, T9.

**Tests a escribir primero:**

- Arrastrar el fondo rota en ambos ejes.
- Arrastrar una carta mueve la carta y no rota.
- Los controles rotan en la dirección indicada con teclado y tacto.
- Los límites impiden orientaciones que hagan inexplorables las cartas.
- Sin movimiento autónomo; con movimiento reducido solo responde a la acción directa.

**Qué debe quedar:**

- Rotación diferenciada del arrastre de cartas y compatible con el scroll de página.

**Criterio de hecho:** unitarios de ángulos y e2e de ratón, teclado, tacto y límites pasan; lint, typecheck y build pasan.

## T11 — Entrada, idioma y degradación sin WebGL

**Objetivo:** fijar los estados iniciales y garantizar el contenido en todos los modos degradados.

**RF:** RF-8, RF-9.

**Depende de:** T2–T10.

**Tests a escribir primero:**

- Cada entrada inicia en 2D y «Todas», sin restaurar estado previo.
- Cambiar de idioma restablece modo y filtro.
- Sin JavaScript: lista plana completa, sin controles.
- Sin WebGL: lista plana completa, sin controles de canvas.
- Con movimiento reducido: contenido visible desde el primer fotograma, sin transición ni animación de scroll.
- Ambos temas, contraste AA, teclado, tecnología de asistencia, 320 px, 1920 px y texto al 200 %.

**Qué debe quedar:**

- La degradación no depende de una capa de error ni de hidratación.
- Sin cambios en `Reveal`, layout raíz ni `globals.css` sin aprobación.

**Criterio de hecho:** pruebas de fallbacks, idioma, tema y accesibilidad pasan; lint, typecheck y build pasan.

## T12 — Verificación de la matriz de aceptación

**Objetivo:** cerrar la trazabilidad requisito por requisito y ejecutar los gates.

**RF:** RF-1–RF-9.

**Depende de:** T1–T11.

**Tests a escribir primero:** no se añaden pruebas por cobertura; se comprueba que cada criterio EARS tiene un test observable escrito antes de su implementación.

**Comprobaciones:**

- Matriz EN/ES y tema claro/oscuro para contenido, filtros, selección, contraste y controles.
- Cada RF con pruebas unitarias o e2e trazables y ejecutadas.
- Las 25 descripciones aprobadas y completas en ambos idiomas.
- Gates en orden: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e`.
- Cobertura global mínima del 85 % en líneas, funciones, ramas y sentencias.
- Limitaciones de verificación nativa en Safari y Firefox registradas para la spec 12.

**Criterio de hecho:** todos los criterios de RF-1–RF-9 están cubiertos y en verde, los gates pasan y no quedan decisiones ni contenido pendientes.
