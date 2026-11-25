# Tareas — Spec 09 Stack

**Fuente:** `docs/specs/09-stack/spec.md` y `docs/specs/09-stack/plan.md`.
**Regla de trabajo:** tests primero; sin dependencias adicionales; sin cambios en capas compartidas sin aprobación explícita.
**Estado:** implementación reiniciada. La anterior (registro, sección estática, filtros y mensajes) se retiró del repositorio; el árbol solo contiene documentación de Stack. Las decisiones nuevas de marcas, volumen, movimiento y slot amplían la aceptación y requieren verificación aunque una tarea histórica figure como completada.

## Bloqueos previos

Antes de implementar T1:

- [x] Aprobar las 25 descripciones EN/ES de `docs/specs/09-stack/content-review.md` y la instrucción del casillero. Aprobado por el usuario.
- [x] Registrar en `docs/constitution.md` la incorporación de Three.js al stack cerrado. Es una capa transversal: requiere autorización explícita. Autorizado y registrado.
- [x] Adoptar las 25 tecnologías y seis categorías de la sección 4 del brief, con prioridad visual de React y TypeScript.
- [x] Casillero inicial sin selección, con instrucción breve.
- [x] Registrar y validar 25 marcas propias en recursos SVG locales; documentar fuentes, licencias conocidas, límites de marca y arte original en `public/stack/ATTRIBUTION.md`. Los permisos de marca no se presumen: el uso identifica las tecnologías y no implica respaldo.
- [ ] Definir dirección de arte de la escena como un único sistema volumétrico: cartas, caras con marcas, slot, escenario, escala, materiales, luces, sombras y perspectiva.
- [ ] Aprobar el comportamiento de movimiento ambiental pausado, colisiones estables, pausa fuera de vista y reduced-motion.
- [x] Definir exclusividad del slot, feedback de recepción, reemplazo al soltar sobre una ocupación y expulsión a posición visible libre. El usuario confirma que el drop nuevo reemplaza a la tecnología alojada.
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
| T4 | Casillero accesible, selección y expulsión | RF-3, RF-4a | T2, T3 |
| T5 | Escena Three.js con marcas y cartas volumétricas | RF-1, RF-4, RF-5 | T2–T4 |
| T6 | Arrastre de cartas en la escena | RF-4 | T5 |
| T7 | Movimiento pausado, límites y colisiones | RF-4 | T6 |
| T8 | Switch 2D/3D con continuidad espacial | RF-5 | T7 |
| T9 | Zoom 3D con límites | RF-6 | T8 |
| T10 | Rotación 3D y controles accesibles | RF-7 | T8, T9 |
| T13 | Consola y detalle integrados, nitidez y movimiento fluido | RF-2–RF-7 | T5–T10 |
| T11 | Entrada, idioma y degradación sin WebGL | RF-8, RF-9 | T2–T10, T13 |
| T12 | Verificación de la matriz de aceptación | RF-1–RF-9 | T1–T11, T13 |

## T1 — Registrar tecnologías y descripciones bilingües

**Objetivo:** fijar el registro canónico de las 25 tecnologías y sus descripciones aprobadas.

**RF:** RF-1, RF-3.

**Tests a escribir primero:**

- El registro contiene exactamente las 25 tecnologías, en sus seis categorías y orden editorial.
- Identificadores únicos, categorías permitidas y prioridad de React/TypeScript en Frontend.
- Cada tecnología tiene nombre y descripción en EN y ES, con claves equivalentes en ambos catálogos.
- Las 25 tecnologías apuntan a su logotipo propio, revisado y local; ningún logo genérico compartido, placeholder o petición remota.
- Los recursos tienen atribución/licencia comprobada, nombre accesible visible y variante que conserva legibilidad monocroma.
- Ninguna descripción menciona niveles, métricas, proyectos, clientes ni resultados.

**Qué debe quedar:**

- Registro estático con `id`, categoría, orden y referencia de marca propia.
- Recursos de marca aprobados listos para integrarse en HTML y en la cara de las cartas 3D.
- Descripciones EN/ES aprobadas en los catálogos de idioma.
- Si falta una descripción o su traducción, la tarea queda bloqueada.

**Criterio de hecho:** pasan los tests de integridad y paridad; las 25 descripciones están aprobadas y presentes en ambos idiomas.

**Estado:** completada. `src/content/stack.ts` conserva el registro canónico de 25 tecnologías, seis categorías, orden editorial, ids únicos e iconos existentes, y añade una referencia local única `brandMark` por tecnología. `public/stack/` contiene los 25 SVG: marcas de tecnología con fuente/licencia y límites documentados en `ATTRIBUTION.md`, y arte original propio para REST APIs y WebSockets, que no tienen logotipo oficial. Los mensajes EN/ES mantienen nombre y descripción aprobados para las 25 claves. `src/content/stack.test.ts` verifica integridad, orden, categorías, prioridad, paridad, SVG locales únicos y atribución; también conserva la cobertura editorial de descripciones. Licencias no declaradas por la fuente se indican como no concedidas, y no se afirma autorización de marca ni respaldo.

## T2 — Lista plana accesible e integración de la sección

**Objetivo:** sustituir el placeholder de Stack por la lista plana completa, legible sin JavaScript y base semántica de la sección.

**RF:** RF-1, RF-3, RF-9.

**Tests a escribir primero:**

- Encabezado único, seis categorías y 25 tecnologías en EN y ES.
- Cada tecnología muestra nombre, icono decorativo y descripción; React/TypeScript con prioridad visual sin niveles.
- Cada carta/lista muestra el logotipo propio de la tecnología; la marca es decorativa para AT y el nombre escrito identifica el contenido.
- Orden de lectura editorial; Stack después de Work y antes de Contact.
- Sin controles de filtro, modo, zoom o rotación.
- E2E sin JavaScript: lista completa y legible en ambas rutas de idioma.

**Qué debe quedar:**

- Lista plana servida desde el servidor, sin depender de interacción.
- Sección integrada en el destino existente, sin duplicar encabezado ni navegación.
- Contratos actuales de `Section` y `Reveal` intactos.

**Criterio de hecho:** unitarios y e2e sin JavaScript pasan en ambos idiomas; lint, typecheck y build pasan.

**Estado:** completada (RF-1, RF-3, RF-9). `src/components/sections/Stack/Stack.tsx` integra la sección después de Work y antes de Contact, con un único encabezado `03 / Stack` y sin duplicar navegación. `StackFlatList.tsx` sirve desde el servidor las seis categorías y las 25 tecnologías con nombre, su marca SVG local propia (decorativa para tecnología de asistencia) y descripción completa, en orden editorial y con React/TypeScript destacados sin niveles. Las marcas se sirven directamente como SVG y se muestran en monocromo, claro sobre oscuro y oscuro sobre claro; el registro ya no conserva los iconos genéricos de Iconoir. Las etiquetas de categoría están en `messages/en.json` y `messages/es.json`. `Stack.test.tsx`, `StackFlatList.test.tsx`, `e2e/stack/stack-flat-list.spec.ts` y `e2e/stack/stack-no-js.spec.ts` verifican contenido, orden, encabezado único, marcas propias, ausencia de controles, prioridad visual y lista completa sin JavaScript en EN y ES.

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

**Estado:** completada (RF-2). `src/lib/stack/stack-state.ts` centraliza el estado inicial «Todas», la selección única y la comprobación de tecnologías habilitadas para reutilizarla en la escena. `StackFilters` presenta radios nativos localizados para «Todas» y las seis categorías, y no emite controles en el HTML del servidor. La lista conserva el orden y las 25 tecnologías; las categorías inactivas permanecen visibles, atenuadas con contraste AA en ambos temas y sin elementos accionables ni paradas de foco. `StackFilters.test.tsx`, `StackFlatList.test.tsx`, `stack-state.test.ts` y `e2e/stack/stack-filter.spec.ts` verifican estado, idiomas, selección por ratón/teclado/tacto, restauración de «Todas», orden, foco y contraste.

## T4 — Casillero accesible, selección y expulsión

**Objetivo:** seleccionar una tecnología habilitada con teclado, ratón o tacto y mostrar su descripción.

**RF:** RF-3.

**Depende de:** T2, T3.

**Tests a escribir primero:**

- Casillero inicial con la instrucción aprobada y sin descripción.
- Selección por activación accesible muestra la descripción correcta en el idioma activo.
- Al aproximar una carta habilitada, el casillero entra en hover; salir revierte ese estado.
- Al soltar una carta, el casillero confirma recepción, presenta marca/nombre/descripcion y un botón «Expulsar».
- Soltar una segunda carta con el slot ocupado la rechaza con feedback y la devuelve a zona visible libre.
- La carta alojada no permanece en el conjunto visible/interactivo de cartas; no hay carta bajo el slot.
- «Expulsar» funciona con teclado, ratón y tacto, vacía el slot y coloca la carta dentro de límites, visible y sin ocultar otras.
- Seleccionar otra reemplaza la anterior; solo hay una seleccionada.
- Las atenuadas no se pueden seleccionar por ningún método.
- Cambiar de filtro conserva la descripción aunque la carta quede atenuada.

**Qué debe quedar:**

- Estado de selección y ocupación únicos, contenido de textos aprobados y devolución segura a posición libre.

**Criterio de hecho:** unitarios de estado, tests de sección y e2e de selección accesible pasan; lint y typecheck pasan.

**Estado:** completada (RF-3, RF-4a). `stack-state.ts` mantiene una única selección y ocupación del casillero, conserva la descripción al filtrar, reemplaza la selección accesible, rechaza recepciones con el slot ocupado o desde categorías inactivas y devuelve el id liberado al expulsar. `StackDetail` presenta la instrucción aprobada, marca/nombre/descripción, hover de recepción, feedback localizado y el botón accesible «Expulsar». Los controles de selección solo aparecen tras hidratar, por lo que la lista sin JavaScript sigue siendo informativa. `StackDetail.test.tsx`, `stack-state.test.ts`, `StackFlatList.test.tsx` y `e2e/stack/stack-selection.spec.ts` cubren estados, idiomas, filtro, ratón, teclado y tacto. La lista actual mantiene visible la tecnología expulsada; la fuente de arrastre de la escena y su colocación geométrica pertenecen a las tareas posteriores.

## T5 — Escena Three.js con marcas y cartas volumétricas

**Objetivo:** montar el canvas WebGL con las cartas, sustituyendo visualmente la lista cuando hay soporte, sin perder accesibilidad.

**RF:** RF-1, RF-4, RF-5.

**Depende de:** T2, T3, T4.

**Tests a escribir primero:**

- Con WebGL disponible se monta la escena; sin WebGL se mantiene la lista plana y no aparecen controles de canvas.
- La lista permanece en el árbol de accesibilidad mientras la escena está visible.
- Las 25 cartas existen con su nombre e icono; React/TypeScript mantienen prioridad.
- Las 25 cartas presentan su marca correcta como textura/material integrado en la cara, nunca como icono genérico flotante.
- En 3D se percibe volumen real en cartas (cantos/grosor), slot (cavidad/profundidad) y escenario; luz, sombras, materiales, perspectiva y escala son coherentes.
- En 2D se conserva la legibilidad de cada marca, categoría y nombre.
- La composición se mantiene minimalista: sin decoración gratuita, partículas ni paleta de acentos ajena al sistema.
- Selección por *raycasting* actualiza el mismo estado que la selección accesible.
- Desmontar libera recursos y no deja listeners ni errores.

**Qué debe quedar:**

- `stack-scene.ts` como único punto de importación de Three.js.
- Render bajo demanda con reduced-motion; ciclo ambiental acotado solo mientras la escena está visible y la pestaña activa.
- Selector 2D/3D para mostrar ambas proyecciones de la mesa CAD, conservando escena, filtro y selección. La transición de T8 y los controles de zoom y rotación quedan pendientes.

**Criterio de hecho:** unitarios de capacidades y estado, tests de sección y e2e de montaje y selección en canvas pasan; lint, typecheck y build pasan.

**Estado:** implementación completada. La mesa CAD presenta las 25 cartas con marcas locales (RF-1), un casillero central con selección por raycasting y movimiento ambiental respetuoso con la visibilidad y el movimiento reducido (base de RF-4), y un selector 2D/3D que conserva escena, filtro y selección (base de RF-5). Sin WebGL se mantiene la lista. El arrastre, las colisiones y la transición de cámara están pendientes en sus respectivas tareas. Pasan los 22 e2e de Stack, el lint de Stack, los unitarios, typecheck y build. El lint global sigue bloqueado por un aviso preexistente en `.tmp/R2-visual.mjs`; la ejecución e2e global agotó su tiempo límite.

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
- Acercar/retirar una carta alterna el hover del slot; soltar confirma recepción.
- Con slot ocupado, un segundo drop da feedback de rechazo y vuelve a posición visible.
- «Expulsar» funciona por teclado, ratón y tacto; la carta vuelve a posición libre, sin ocultarse bajo el slot.
- Estado accesible ocupado/vacío y nombre localizado del botón de expulsión.

**Qué debe quedar:**

- Arrastre como una vía más, nunca la única.

**Criterio de hecho:** tests de interacción y e2e de drop dentro/fuera pasan; lint, typecheck y build pasan.

**Estado:** completada en su alcance (RF-4: arrastre; RF-4a: conexión con el casillero). Las cartas habilitadas se arrastran con ratón o tacto en 2D y 3D; al soltar fuera conservan la posición sin cambiar la selección. El casillero se resalta al acercar una carta, confirma la recepción y rechaza un segundo drop. Al expulsar, la carta vuelve al escenario en una posición visible fuera del casillero. Se mantienen la selección sin arrastre y el scroll desde el fondo. Los límites generales y las colisiones quedan para T7.

**Verificación:** 604 tests de Vitest y 29 e2e de Stack en verde; pasan typecheck, build y lint de Stack. El lint global falla por el aviso previo de `.tmp/R2-visual.mjs:51`. La suite e2e global terminó con 324/339 aprobados y 15 fallos en las suites de About, Hero, Navbar y Work.

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
- El desplazamiento ambiental es pausado y acotado; las colisiones son perceptibles, estables y nunca ocultan totalmente.
- Con reduced-motion no hay movimiento ambiental; fuera de viewport o con pestaña inactiva se pausa.
- La carta alojada se excluye de la simulación y las cartas libres no invaden el área del slot.
- En reposo, las cartas se desplazan despacio por el escenario y sus colisiones producen separación perceptible sin rebotes bruscos ni vibración.
- El slot queda excluido de la trayectoria libre; cartas alojadas se excluyen del conjunto de colisiones.
- Con reduced-motion no existe desplazamiento ambiental; los gestos directos conservan respuesta inmediata.
- El movimiento se pausa al salir la escena del viewport o quedar la pestaña inactiva.

**Qué debe quedar:**

- `stack-geometry` con límites verificables y sin valores mágicos repetidos.
- Posiciones expulsadas/rechazadas siempre libres y visibles, calculadas respetando límites, cartas vecinas y zona del casillero.
- Sin scroll horizontal ni recortes.

**Criterio de hecho:** unitarios de límites y repulsión, y e2e en móvil y escritorio, pasan; lint, typecheck y build pasan.

**Estado:** completada en su alcance (RF-4: límites, repulsión y movimiento ambiental; RF-4a: colocación al expulsar o rechazar). Las cartas quedan dentro del canvas en 2D y 3D, incluso al soltar fuera o redimensionar. La repulsión admite solapamiento parcial sin ocultar cartas por completo y mantiene libre el casillero. El movimiento ambiental se pausa fuera de vista o con la pestaña oculta y se desactiva con movimiento reducido sin afectar al arrastre. Verificado el reflujo de Stack a 320 px con texto al 200 %.

**Verificación:** 617 tests de Vitest y 32 e2e de Stack en verde; pasan typecheck y build. La suite e2e global terminó con 338/342 aprobados y cuatro fallos de foco por teclado en Work ya observados antes de T7. El lint global falla por el aviso previo de `.tmp/R2-visual.mjs:51`; al excluir solo ese archivo, pasa.

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

**Estado:** completada (RF-5). El selector alterna de 2D a 3D y de vuelta en la misma escena. La cámara y las retículas cambian de forma continua sin recolocar las cartas ni perder el filtro, la selección o la descripción. Con movimiento reducido el cambio se aplica en el primer fotograma; sin soporte de perspectiva el selector se oculta y la escena ortográfica queda disponible.

**Verificación:** 626 tests de Vitest y 35 e2e de Stack en verde; pasan typecheck y build. La suite e2e global terminó con 341/345 aprobados y los cuatro fallos de foco por teclado en Work ya observados antes de T8. El lint global falla por el aviso previo de `.tmp/R2-visual.mjs:51`; al excluir solo ese archivo, pasa.

## T9 — Zoom 3D con límites

**Objetivo:** acercar y alejar la vista 3D con rueda y controles accesibles.

**RF:** RF-6.

**Depende de:** T8.

**Tests a escribir primero:**

- La rueda sobre la escena acerca y aleja en la dirección esperada.
- Los controles funcionan con ratón, teclado y tacto.
- En los límites, más entradas en esa dirección no cambian el zoom.
- El zoom-out mínimo muestra la composición completa; el zoom-in máximo amplía claramente la escena y puede recortar cartas periféricas.
- Al volver a alejar, las cartas periféricas vuelven a quedar visibles y se pueden seleccionar.
- La rueda fuera del canvas mantiene el desplazamiento de la página.

**Qué debe quedar:**

- Rango de zoom acotado y calibrado, con nombres accesibles y foco visible.

**Criterio de hecho:** unitarios de límites y e2e de rueda y controles pasan; lint, typecheck y build pasan.

**Estado:** completada y ampliada (RF-6). El zoom 3D va del 50 % al 150 %, parte del 100 % y cambia en pasos de 5. Al 50 % encuadra toda la composición; al 150 % acerca más allá del encuadre completo y puede recortar cartas periféricas, que reaparecen al alejarse. La rueda vertical solo controla el zoom sobre el canvas 3D; fuera de él y en 2D se conserva el desplazamiento nativo de la página, y se ignoran gestos horizontales y con Ctrl. Los controles bilingües funcionan con ratón, teclado y tacto; en los límites se desactiva la dirección correspondiente sin perder el foco, y el cambio es inmediato también con movimiento reducido.

**Verificación:** ampliación verificada en la prueba e2e de límites: zoom 50–150 %, encuadre completo al alejar, acercamiento por encima del encuadre y acceso a las cartas al recuperar la composición. E2E de Stack: 41/41 en verde; gates globales registrados en T10.

## T10 — Rotación 3D y controles accesibles

**Objetivo:** rotar horizontal y verticalmente arrastrando el fondo o con controles accesibles.

**RF:** RF-7.

**Depende de:** T8, T9.

**Tests a escribir primero:**

- Arrastrar el fondo rota en ambos ejes.
- Arrastrar una carta mueve la carta y no rota.
- Los controles rotan en la dirección indicada con teclado y tacto.
- La rotación horizontal completa 360° sin detenerse y vuelve al mismo ángulo; la inclinación vertical conserva límites explorables.
- Sin movimiento autónomo; con movimiento reducido solo responde a la acción directa.

**Qué debe quedar:**

- Rotación diferenciada del arrastre de cartas y compatible con el scroll de página.

**Criterio de hecho:** unitarios de ángulos y e2e de ratón, teclado, tacto y límites pasan; lint, typecheck y build pasan.

**Estado:** completada y ampliada (RF-7). `stack-camera.ts` permite vueltas horizontales completas de 360° con yaw normalizado a −180°…180°; la inclinación vertical queda entre −20°…20°. Los controles accesibles rotan en pasos de 5° y no bloquean el giro horizontal. Arrastrar el fondo en 3D rota en ambos ejes; las cartas conservan su arrastre y no rotan la cámara. La orientación recalcula el encuadre. Los botones localizados funcionan por teclado y tacto, el límite vertical conserva el foco y el fondo táctil mantiene el scroll nativo. No hay rotación autónoma ni se desactivan las acciones directas con movimiento reducido.

**Verificación:** `pnpm test`: 654/654 tests; cobertura 93.65 % sentencias, 87.97 % ramas, 95.53 % funciones y 95.67 % líneas. E2E de Stack: 41/41; incluyen vuelta horizontal completa por teclado, límites verticales, zoom 50–150 %, acceso a cartas tras alejarse y scroll táctil nativo. Pasan `pnpm typecheck`, `pnpm build` y ESLint sobre los archivos de T9/T10. `pnpm lint` global sigue bloqueado por el aviso preexistente `.tmp/R2-visual.mjs:51` (`before` asignado pero no usado); ese archivo no se modificó.

## T13 — Consola y detalle integrados, nitidez y movimiento fluido

**Objetivo:** integrar los controles y el detalle dentro del marco visual del canvas y asegurar que la escena conserve definición y respuesta en tamaños de pantalla variados.

**RF:** RF-2–RF-7.

**Depende de:** T5–T10.

**Tests a escribir primero:**

- Filtros, cambio de vista, lista, zoom y rotación aparecen como controles de icono dentro del marco de la escena; cada uno mantiene nombre accesible localizado y su acción actual.
- El filtro activo se identifica visualmente y los radios siguen operables con teclado y tecnología de asistencia.
- El detalle de la tecnología se muestra dentro del marco en la escena activa; mantiene selección, recepción, expulsión y contenido bilingüe. El fallback sin WebGL conserva su presentación plana.
- En anchos 320, 390, 768, 1920 y 3840 px no hay scroll horizontal ni controles, cartas o textos recortados; en DPR alto el canvas usa resolución adecuada sin exceder el presupuesto de píxeles.
- Los enlaces de categoría terminan en el borde de las cartas, se actualizan durante el arrastre y no aparecen detrás de las superficies.
- El movimiento ambiental actualiza a 60 fps mientras está visible; reduced-motion lo detiene y conserva los gestos directos.

**Qué debe quedar:**

- Consola responsive dentro del marco visual, controles iconográficos con nombres localizados y detalle dentro de la escena.
- Canvas adaptado al tamaño CSS y al DPR, texturas de carta de alta definición y presupuesto de búfer limitado.
- Trazados integrados a las cartas y actualizados durante el movimiento.

**Criterio de hecho:** unitarios y e2e de estructura accesible, interacción, resoluciones, nitidez y trazados pasan; lint, typecheck, test y build pasan. No iniciar T11.

**Verificación:** `pnpm lint`, `pnpm typecheck`, `pnpm test` (660/660; 93,85 % sentencias, 88,30 % ramas, 95,56 % funciones y 95,86 % líneas) y `pnpm build` pasan. Una ejecución aislada de Stack pasó 43/43, incluidos los cinco anchos responsive en inglés y castellano; los resultados posteriores impiden considerarla estable. El primer intento global de `pnpm test:e2e` coincidió con otros procesos de validación: 311 pasaron y 42 fallaron por timeouts y expectativas de Stack que se corrigieron después. La repetición global sin otras validaciones, `pnpm exec playwright test --workers=4`, terminó con 342 aprobados y 11 fallidos: dos filtros táctiles de Stack (EN/ES), cuatro expectativas de navegación por teclado de Work, cuatro timeouts de inversión de filas de Work y un timeout de reflow de Work a 320 px y texto al 200 %.

**Reproducción aislada previa al refinamiento:** `pnpm exec playwright test --last-failed --workers=1` terminó con 5 aprobados y 6 fallidos. Los cinco casos que antes agotaron el tiempo pasaron con un solo worker; esto no garantizaba su estabilidad en paralelo. Se reprodujeron los dos casos táctiles de Stack (el radio Frontend quedaba sin marcar tras el toque por coordenadas) y los cuatro de teclado de Work (tras Tab no había ningún enlace enfocado). El refinamiento posterior corrigió estas pruebas y verificó el resultado global completo.

**Estado:** completada, incluido el refinamiento y su verificación global. T11 sigue sin iniciar.

### Refinamiento solicitado — interacción y diseño

- Corregir los tests táctiles con objetivos estables y la expectativa de teclado de Work para el nuevo control real que sigue en la página.
- Escribir primero regresiones de hover, arrastre continuo, cancelación y colisiones de movimientos rápidos.
- Invertir cartas habilitadas en hover, reforzar hover/foco/pressed de controles y separar los grupos de la consola.
- Resolver arrastre por pasos, conservar desplazamientos de vecinas y evitar saltos al soltar.
- Integrar el detalle como franja editorial responsive, sin tapar el dibujo ni reducir su legibilidad.
- Verificar ambos idiomas, ambos temas, móvil/escritorio y movimiento reducido, sin tocar capas transversales ni iniciar T11.

**Implementación del refinamiento:** hover por inversión sobre cartas habilitadas, cursores de agarre/rotación, controles con inversión en hover/foco y desplazamiento CSS solo sin movimiento reducido. Arrastre por pasos acotados, mayor separación de contacto, conservación de posiciones vecinas y restauración al cancelar. Detalle en franja completa, entrada CSS breve al cambiar de tecnología, cuerpo legible en móvil y filtros en retícula de cuatro columnas en pantallas estrechas. Sin nuevas dependencias ni cambios en capas transversales.

**Verificación del refinamiento:** lint, typecheck, test (666/666; 93,83 % sentencias, 88,53 % ramas, 95,65 % funciones y 95,68 % líneas) y build pasan. Los cuatro casos de teclado de Work pasan; los dos táctiles de Stack pasan tras esperar la escena y tocar objetivos estables (el control deshabilitado se prueba con un toque nativo). La regresión de continuidad/cancelación y las de hover EN/ES pasan. Los tests de devolución consultan la geometría actual, no posiciones antiguas que las colisiones pueden desplazar. Revisión renderizada en 2D/3D, claro/oscuro y anchos 320, 390, 768 y 1440 px, incluidos nombres largos y detalle sin desbordamiento.

**Corrección de la prueba de foco:** el primer global del refinamiento terminó con 354 aprobados y dos fallos en la nueva expectativa de foco visible EN/ES: enfocar por código tras usar el ratón no activa necesariamente `:focus-visible`. La prueba se corrigió para navegar realmente con `Shift+Tab` y comprobar el radio enfocado y su contorno. Ambos casos pasaron en la repetición aislada (2/2).

**Cierre global (2026-11-25):** tras repetir lint, typecheck, test y build en orden, todos en verde, `pnpm test:e2e --workers=2` terminó con **356/356 aprobados en una sola ejecución** (14 minutos), incluidos los 46 casos de Stack y los de Work que fallaban anteriormente. No quedan fallos pendientes de este refinamiento.

**Estado del refinamiento:** completado y verificado. T11 sigue sin iniciar.

### Corrección posterior — movimiento y trazados durante el arrastre

- El ciclo ambiental continúa mientras una carta está agarrada; la carta sujetada mantiene su posición bajo el puntero y el resto conserva el movimiento acotado. La fase se recalibra al interactuar para evitar saltos al reanudar.
- Las conexiones actualizan sus vértices durante el movimiento. Si cambia el número de segmentos al ocupar o liberar el casillero, se reemplaza y libera la geometría anterior; `BufferGeometry.setFromPoints` no reduce el búfer existente.
- Las regresiones verifican movimiento de vecinas durante un arrastre, continuidad de colisiones y geometría de trazados al cambiar su cantidad.

**Verificación:** lint, typecheck, 669/669 tests (94,23 % sentencias, 88,77 % ramas, 95,98 % funciones y 96,06 % líneas), build y `pnpm test:e2e --workers=2` pasan. La suite global terminó con 357/357 aprobados en 13,4 minutos; los e2e focales de geometría y proyección pasaron 8/8 antes de la repetición. T11 sigue sin iniciar.

### Refinamiento solicitado — deslizamiento sutil al empujar

- Las cartas libres que reciben un empuje del arrastre conservan un impulso pequeño en esa dirección y frenan exponencialmente. La velocidad se limita a 0,55 unidades/s y cada impulso añade un recorrido acotado; la carta agarrada sigue directamente al puntero.
- La continuación reutiliza el ciclo de escena y respeta límites, slot y colisiones. Con `prefers-reduced-motion`, solo queda la separación directa e inmediata.
- El observer de visibilidad ahora considera cualquier entrada visible del lote, evitando que una entrada anterior fuera de viewport mantenga detenido el ciclo.
- Regresiones unitarias para dirección, frenado y límite de impulsos; e2e para el deslizamiento al soltar y su ausencia con movimiento reducido.

**Verificación:** `pnpm lint`, `pnpm typecheck`, `pnpm test` (672/672), `pnpm build` y `pnpm test:e2e --workers=2` (359/359 en la ejecución global) pasan. También pasan los 42 tests focales de geometría/escena y sus 7 e2e. T11 sigue sin iniciar.

### Ampliación solicitada — contenido, marca y movimiento de cámara

- Ampliar las descripciones de las 25 tecnologías en inglés y español con una segunda frase factual, sin niveles, métricas ni atribuciones personales.
- Sustituir el SVG de Recharts —una superficie SVG interactiva y recortada— por una marca compacta y estática, con atribución actualizada.
- Animar zoom y rotación iniciados por controles desde la pose visible, permitir que un nuevo objetivo interrumpa el anterior y respetar `prefers-reduced-motion`; el arrastre del fondo sigue siendo directo.
- Alinear las acciones con la primera fila de filtros en escritorio y reflujo sin desbordamiento en tamaños estrechos.
- Añadir una entrada breve al detalle y verificar que nombre, marca, descripción y feedback no se recortan al recibir una carta.
- Tests primero: integridad de las 50 descripciones, SVG estático, interpolación/retarget/reduced-motion, alineación e2e y recepción visible.

**Verificación de la ampliación (2026-11-25):** `pnpm lint`, `pnpm typecheck`, `pnpm test` (678/678; 95,41 % líneas, 86,95 % ramas, 96,10 % funciones y 93,57 % sentencias), `pnpm build` y `pnpm test:e2e --workers=2` (361/361 en 11,2 minutos) pasan.

**Estado:** completada y verificada globalmente. T11 sigue sin iniciar.

### Refinamiento solicitado — inspector visible y reemplazo al recibir

- Sustituir la franja bajo el canvas por un inspector lateral en escritorio; en tamaños estrechos el panel permanece visible al recorrer el canvas, sin obligar a bajar hasta el final del dibujo.
- Recibir una segunda carta en el casillero ocupado devuelve la anterior a una posición libre y deja la nueva como única ocupante.
- Reforzar jerarquía, legibilidad y estados vacío/ocupado del detalle sin añadir color de acento ni cubrir las cartas.
- Regresiones bilingües para reemplazo/expulsión y e2e de composición responsive, persistencia del inspector y visibilidad del contenido.

**Estado:** implementación en curso; T11 no se inicia.

## T11 — Entrada, idioma y degradación sin WebGL

**Objetivo:** fijar los estados iniciales y garantizar el contenido en todos los modos degradados.

**RF:** RF-8, RF-9.

**Depende de:** T2–T10, T13.

**Tests a escribir primero:**

- Cada entrada inicia en 2D y «Todas», sin restaurar estado previo.
- Cambiar de idioma restablece modo y filtro.
- Sin JavaScript: lista plana completa, sin controles.
- Sin WebGL: lista plana completa, sin controles de canvas.
- Las marcas propias siguen presentes y correctas en la lista plana sin JavaScript/WebGL.
- Con movimiento reducido: contenido visible desde el primer fotograma, sin transición ni animación de scroll.
- Ambos temas, contraste AA, teclado, tecnología de asistencia, 320 px, 1920 px y texto al 200 %.
- Logos, volumen, slot y controles siguen legibles en ambos temas y tamaños; no se ocultan cartas durante resize.

**Qué debe quedar:**

- La degradación no depende de una capa de error ni de hidratación.
- Sin cambios en `Reveal`, layout raíz ni `globals.css` sin aprobación.

**Criterio de hecho:** pruebas de fallbacks, idioma, tema y accesibilidad pasan; lint, typecheck y build pasan.

## T12 — Verificación de la matriz de aceptación

**Objetivo:** cerrar la trazabilidad requisito por requisito y ejecutar los gates.

**RF:** RF-1–RF-9.

**Depende de:** T1–T11, T13.

**Tests a escribir primero:** no se añaden pruebas por cobertura; se comprueba que cada criterio EARS tiene un test observable escrito antes de su implementación.

**Comprobaciones:**

- Matriz EN/ES y tema claro/oscuro para contenido, filtros, selección, contraste y controles.
- Cada RF con pruebas unitarias o e2e trazables y ejecutadas.
- Verificar manualmente la dirección visual de la escena: volumen coherente de cartas/slot/escenario, lectura de marcas, hover, confirmación, colisiones y expulsión; sin depender solo de capturas.
- Verificar 25 marcas únicas y correctas, recursos locales y atribución/licencia revisadas.
- Verificar movimiento acotado, colisiones, pausa por visibilidad/reduced-motion y ausencia de carta oculta debajo del slot.
- Las 25 descripciones aprobadas y completas en ambos idiomas.
- Gates en orden: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e`.
- Cobertura global mínima del 85 % en líneas, funciones, ramas y sentencias.
- Limitaciones de verificación nativa en Safari y Firefox registradas para la spec 12.

**Criterio de hecho:** todos los criterios de RF-1–RF-9 están cubiertos y en verde, los gates pasan y no quedan decisiones ni contenido pendientes.
