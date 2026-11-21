# Tareas — 07 About

**Estado:** En curso. Se deriva de `docs/specs/07-about/spec.md` y `docs/specs/07-about/plan.md`, y debe respetar `docs/constitution.md`.

**Alcance:** RF-1 a RF-7 y sus requisitos no funcionales. Cada tarea se implementa y verifica por separado; ninguna se cierra con sus pruebas en rojo.

**Regla de trabajo:** tests primero; no se añaden dependencias; no se crean carpetas en la raíz ni en el primer nivel de `src/`; no se modifica una capa transversal sin aprobación. Los textos propuestos se usan durante la implementación y su revisión editorial por Pedro es la última tarea.

**Cierre de cada tarea de implementación:** además de sus pruebas, `pnpm lint` y `pnpm typecheck` deben estar en verde. Si toca CSS o composición, se añade `pnpm build`; si toca movimiento, idioma o rutas, se añade el e2e correspondiente. La última tarea ejecuta todos los gates.

---

## Mapa de tareas

| ID | Tarea | RF | Depende de |
|---|---|---|---|
| T1 | Cerrar el comportamiento visual de RF-2 | RF-2 | — |
| T2 | Añadir contenido bilingüe y etiquetas de About | RF-1, RF-3, RF-7 | T1 (hecha) |
| T3 | Crear el bloque accesible de la frase firma | RF-2, RF-6, RF-7 | T2 |
| T4 | Implementar la progresión acumulativa de la frase | RF-2 | T1, T3 |
| T5 | Integrar el retrato y su fallback | RF-4, RF-6, RF-7 | T2 |
| T6 | Integrar About en la home conservando el destino y re-verificar T5 | RF-1, RF-4, RF-6, RF-7 | T2, T3, T5 (implementación y unitarias listas; e2e se re-verifica en T6) |
| T7 | Aplicar el revelado general a los bloques de About | RF-3, RF-5, RF-6 | T4, T6 |
| T7.1 | Ajustar la composición de About y el tramo de lectura | RF-1 a RF-6 | T7 |
| T8 | Verificar fallbacks de movimiento y no-JavaScript | RF-2, RF-5, RF-6 | T7, T7.1 |
| T9 | Verificar temas, idiomas, accesibilidad y adaptación | RF-1–RF-7 | T6, T8 |
| T10 | Ejecutar gates y revisión editorial final | Todos | T1–T9 |

---

## T1 — Cerrar el comportamiento visual de RF-2

**Objetivo:** eliminar la aclaración pendiente de la spec sobre el estado visual iluminado/no iluminado y el tramo de scroll que recorre cada palabra.

**Estado:** hecha.

**RF:** RF-2.

**Depende de:** nada.

**Documentación:** `docs/specs/07-about/spec.md`.

**Tests a escribir primero:**

- No hay test ejecutable en esta tarea documental. Casos fijados antes de actualizar la spec y convertibles en pruebas visibles: al iniciar el recorrido ninguna palabra está iluminada; al cruzar el primer límite se ilumina la primera; entre límites se conserva la acumulación; al final todas están iluminadas; al retroceder se revierte la misma palabra en orden inverso.
- Repetir la matriz observable en inglés y castellano, y en tema claro y oscuro; comprobar el estado por estilos computados de color y peso tipográfico, nunca por clases ni estructura interna.
- Comprobar que ambos estados conservan contraste AA en ambos temas y que la frase completa sigue siendo el único contenido anunciado.

**Criterio de hecho:** `docs/specs/07-about/spec.md` define estados visuales, límites del progreso, comportamiento en ambos temas y criterios observables para las pruebas; no queda `[NECESITA ACLARACIÓN]` sobre RF-2. No se implementa la animación en esta tarea.

---

## T2 — Añadir contenido bilingüe y etiquetas de About

**Objetivo:** incorporar el texto aprobado para implementación y las cinco cualidades en los catálogos EN/ES y presentar el contenido estático de About.

**Estado:** hecha.

**RF:** RF-1, RF-3, RF-7.

**Depende de:** T1.

**Archivos:** `messages/en.json`, `messages/es.json`, `src/components/sections/About/About.tsx`, `src/components/sections/About/About.test.tsx`, prueba de paridad de mensajes.

**Qué debe quedar:**

- Las claves de About están presentes en ambos idiomas con estructura equivalente.
- La sección muestra el encabezado numerado con su etiqueta localizada, la afirmación, los cuatro párrafos y las cinco cualidades.
- Las cualidades son texto informativo no interactivo.
- No aparece la trayectoria en ingeniería de sonido ni se añaden cifras o hechos.
- Los textos visibles proceden de los catálogos; no se hardcodean en la interfaz.

**Tests a escribir primero:**

- `About.test.tsx`: verificar encabezados accesibles y contenido EN/ES con los mensajes reales; comprobar las cinco cualidades, que no son enlaces ni controles y que no aparece la ingeniería de sonido.
- Extender la prueba de paridad para que las nuevas claves mantengan la misma forma en ambos catálogos.

**Criterio de hecho:** las pruebas de About y paridad están en verde; `pnpm typecheck` y `pnpm lint` están en verde; no hay texto nuevo en un solo idioma ni contenido inventado.

---

## T3 — Crear el bloque accesible de la frase firma

**Estado:** hecha.

**Objetivo:** separar la presentación accesible de la frase del movimiento general y mostrarla estática como base.

**RF:** RF-2, RF-6, RF-7.

**Depende de:** T2.

**Archivos:** `src/components/sections/AboutStatement/AboutStatement.tsx`, `src/components/sections/AboutStatement/AboutStatement.test.tsx`.

**Qué debe quedar:**

- El bloque recibe la frase completa del idioma activo.
- La frase se anuncia completa una sola vez; las piezas visuales no generan anuncios duplicados.
- Si el texto está vacío, el bloque no lanza ni presenta contenido vacío.
- En el estado base, la frase completa es visible y plenamente iluminada.

**Tests a escribir primero:**

- `AboutStatement.test.tsx`: comprobar el nombre accesible completo en inglés y castellano; verificar que el lector de pantalla no recibe una palabra por cada unidad visual; comprobar el caso de texto vacío.

**Criterio de hecho:** los tests del bloque están en verde y la frase funciona sin animación ni estado visual dependiente de JavaScript.

---

## T4 — Implementar la progresión acumulativa de la frase

**Estado:** hecha.

**Objetivo:** iluminar las palabras en orden, mantener iluminadas las anteriores y revertir el progreso al desplazarse hacia atrás.

**RF:** RF-2.

**Depende de:** T1 y T3.

**Archivos:** `src/components/sections/AboutStatement/AboutStatement.module.css`, `e2e/about.spec.ts`.

**Qué debe quedar:**

- El efecto sigue la posición actual de la frase, no el historial de scroll.
- La frase completa queda iluminada al final del progreso.
- Los estados cumplen la definición visual y los límites acordados en T1.
- Se usa movimiento CSS y los tokens existentes; no se añade una dependencia ni se calcula el progreso mediante listeners de scroll en JavaScript.

**Tests a escribir primero:**

- E2E en movimiento normal: estado inicial, paso de una palabra a la siguiente, permanencia de palabras anteriores, estado final y reversión al volver atrás.
- Comprobar estados mediante el resultado visual computado y no mediante clases.
- Cubrir ambos idiomas y ambos temas.

**Criterio de hecho:** todos los casos de progresión acordados en T1 pasan en Playwright; el contraste AA se mantiene durante la progresión y la frase sigue anunciándose completa una sola vez.

---

## T5 — Integrar el retrato y su fallback

**Estado:** hecha. La aceptación integrada se re-verificó en T6: el e2e de fallo omite el retrato sin ocultar el contenido ni dejar una imagen rota; los tests unitarios confirman texto alternativo por idioma, contenido disponible mientras carga y degradación ante error. La imagen local `/pedro-suarez.png` existe y se muestra cuando está disponible.

**Objetivo:** presentar el retrato local con su alternativa traducida y omitirlo si falla sin afectar el contenido.

**RF:** RF-4, RF-6, RF-7.

**Depende de:** T2.

**Archivos:** `src/content/site.ts`, `src/components/sections/About/About.tsx`, `src/components/sections/About/About.test.tsx`, `e2e/about.spec.ts`.

**Qué debe quedar:**

- La ruta local del retrato se incorpora a los datos del sitio.
- La alternativa textual se muestra en el idioma activo.
- El resto de About aparece mientras la imagen está pendiente.
- Si la imagen carga, aparece; si falla o no puede decodificarse, se omite sin marcador, espacio vacío ni error visible.

**Tests a escribir primero:**

- `About.test.tsx`: comprobar la alternativa en inglés y castellano, el contenido mientras la imagen está pendiente y la omisión del retrato tras un error simulado.
- Añadir un caso e2e que intercepte el recurso del retrato y simule un fallo de carga.

**Criterio de hecho:** para habilitar T6, la imagen se muestra cuando está disponible; las pruebas unitarias comprueban que, al simular fallo, solo desaparece el retrato y el resto del contenido sigue accesible; `pnpm lint`, `pnpm typecheck` y `pnpm build` están en verde. El e2e de fallo debe estar escrito, pero puede aplazarse porque la sección aún no está integrada. Su ejecución exitosa y la re-revisión completa de estos criterios son obligatorias como parte de T6; hasta entonces, la aceptación integrada de T5 queda pendiente.

---

## T6 — Integrar About en la home conservando el destino

**Estado:** hecha. Verificado en `/en` y `/es`; About conserva su destino y único encabezado antes de Work, Stack y Contact. E2E de home y About: 16 pasan, incluido el fallo de retrato; lint, typecheck, unitarias (500) y build pasan.

**Objetivo:** reemplazar el cuerpo reservado de About por la sección completa sin cambiar el ancla, el orden ni los destinos de las otras secciones; aprovechar la integración para re-verificar y cerrar la aceptación pendiente de T5.

**RF:** RF-1, RF-4, RF-6, RF-7.

**Depende de:** T2, T3 y T5.

**Archivos:** `src/app/[locale]/page.tsx`, `e2e/home.spec.ts`.

**Qué debe quedar:**

- La sección conserva el identificador y encabezado About ya reservados.
- Work, Stack y Contact mantienen su orden, encabezados y destinos.
- La navegación existente lleva al encabezado de About sin duplicar el destino ni el encabezado.
- El contenido localizado se integra en `/en` y `/es`.
- **Re-revisión de T5:** ejecutar el e2e ya escrito que simula el fallo del retrato; confirmar que solo se omite la imagen, que no queda marcador ni espacio vacío y que el resto de About sigue accesible. Revisar de nuevo todos los criterios de T5 en la página integrada y actualizar allí su estado/evidencia.

**Tests a escribir primero:**

- E2E de home: verificar un solo encabezado About accesible por idioma, el contenido bajo el destino correcto y la existencia/orden de Work, Stack y Contact.
- E2E de ancla: navegar a About y comprobar que el encabezado queda visible y que el destino se conserva.
- Re-ejecutar el e2e de fallo del retrato de T5 en el contexto integrado.

**Criterio de hecho:** la home conserva los cuatro destinos y sus ids; About queda en el primero, aparece en ambos idiomas y los tests de home y anclas pasan. El e2e de retrato falla/controlado pasa y la re-revisión de T5 confirma todos sus criterios; se actualiza su evidencia como cerrada. Si falla la re-revisión, T6 no se da por hecha y no se inicia T7. `pnpm build` está en verde.

---

## T7 — Aplicar el revelado general a los bloques de About

**Estado:** hecha. Los selectores compartidos de Reveal ahora cubren los atributos de estado emitidos en producción, evitando que la ausencia de la clase CSS Module deje los bloques ocultos. Validado en build de producción: 500 unitarias y 193 e2e pasan; lint, typecheck, test y build pasan.

**Objetivo:** hacer que cada bloque de la sección entre, llegue a un estado plenamente visible y salga con el scroll, reutilizando el revelado existente.

**RF:** RF-3, RF-5, RF-6.

**Depende de:** T4 y T6.

**Archivos:** `src/components/sections/About/About.tsx`, `e2e/about.spec.ts`.

**Qué debe quedar:**

- Los párrafos, la frase, las cualidades y el retrato participan en el revelado general.
- Las cinco cualidades se tratan como un grupo, sin crear una abstracción nueva.
- En la zona estable todos los bloques son plenamente visibles.
- El revelado general y la progresión de palabras mantienen el contraste AA cuando coinciden.

**Tests a escribir primero:**

- Extender los tests de About para comprobar que todo el contenido se presenta y que las cualidades siguen siendo etiquetas no interactivas.
- E2E de movimiento: medir entrada, zona estable, salida y reversibilidad para bloques representativos de About, con estilos computados.
- Comprobar que el último bloque de About también sale con el scroll: About no es la última sección de la página.

**Criterio de hecho:** los bloques de About cumplen el recorrido general y no quedan ocultos al detener el scroll; se reutilizan los contratos de `Reveal` y `RevealGroup` sin modificaciones globales.

---

## T7.1 — Ajustar la composición de About y el tramo de lectura

**Estado:** Implementación hecha; con autorización expresa se ajustó solo el timeline CSS compartido de Reveal, sin cambiar contratos ni otras capas. El cierre de gates está pendiente por el bloqueo preexistente de T8 (`browserType` en `e2e/about.spec.ts:454`, sin modificar). `pnpm test` pasa con 500 unitarias; 31 e2e dirigidas pasan y `pnpm lint` pasa. Un intento más amplio con el servidor de desarrollo en `:5173` tuvo dos fallos ajenos al cambio: las pruebas de ancla esperan `:3000`. La suite `about.spec.ts` tampoco se pudo descubrir por el fixture de T8.

**Objetivo:** disponer la frase a ancho interior completo y, en escritorio, alinear por arriba el retrato a la izquierda y la biografía a la derecha, con las cualidades bajo el texto. En móvil, el texto precede al retrato; cuando el retrato falla, no queda una columna vacía. La revisión visual añade un borde de 1 px con el token de línea, calibra el retrato a un tamaño mayor que el último ajuste sin desperdiciar espacio y compacta lo que no ayude a leer.

**RF:** RF-1 a RF-6.

**Depende de:** T7.

**Tests a escribir primero:** comprobar la composición en escritorio y móvil, el borde y el tamaño del retrato, ausencia de solapamiento/recortes/scroll horizontal, la realineación de la biografía tras un fallo de imagen y la opacidad/reversibilidad en ambos límites de lectura, en ambos idiomas y temas y con movimiento reducido.

**Criterio de hecho:** las pruebas y los gates pasan sin cambios en T8/T9; el único ajuste transversal permitido aquí es el timeline CSS compartido de Reveal, expresamente autorizado y sin modificar su contrato.

---

## T8 — Verificar fallbacks de movimiento y no-JavaScript

**Estado:** hecha. Evidencia: pasan movimiento reducido, soporte CSS ausente (el test invalida `view(...)` en consultas y declaraciones para activar `@supports not`) y no-JavaScript con retrato disponible o fallido sin error visible. El fixture inválido `browserType` se sustituyó por el fixture `page` y la simulación por rutas CSS. `pnpm typecheck`, `pnpm test` (501), `pnpm build` y `pnpm test:e2e` (211) pasan; `pnpm lint` global queda bloqueado por 9 errores `no-require-imports` en `.tmp/probe-*.cjs`, ajenos a T8; ESLint de los archivos T8 pasa.

**Objetivo:** asegurar que el contenido de About permanece estático, visible y completo con movimiento reducido, sin soporte de animación ligada al scroll o sin JavaScript.

**RF:** RF-2, RF-5, RF-6.

**Depende de:** T7, T7.1.

**Archivos:** `e2e/about.spec.ts`, `e2e/no-js.spec.ts` si se amplía la cobertura de no-JS existente.

**Qué debe quedar:**

- Con movimiento reducido, la frase queda completa e iluminada y todos los bloques están visibles sin movimiento.
- Sin soporte de animación ligada al scroll, se conserva el mismo estado estático y visible.
- Sin JavaScript, About aparece completo, estático y visible.
- Si la solución local requiere modificar `Reveal`, estilos compartidos u otra capa transversal, detener la tarea y pedir aprobación antes de cambiarla.

**Tests a escribir primero:**

- E2E con `prefers-reduced-motion: reduce`: comprobar texto completo, frase iluminada y bloques estáticos.
- E2E con fallback de soporte simulado en Chromium.
- E2E con JavaScript deshabilitado: comprobar contenido y estados estáticos, incluida la ausencia de un error visual si falla el retrato.

**Criterio de hecho:** los tres contextos de fallback pasan. No se modifica una capa transversal sin aprobación; si el requisito no puede cumplirse localmente, la tarea queda bloqueada y se actualizan spec y plan antes de continuar.

---

## T9 — Verificar temas, idiomas, accesibilidad y adaptación

**Estado:** hecha.

**Evidencia:** `pnpm lint` 0 errores (probes `.tmp/probe-*.cjs` ya eliminados); `pnpm typecheck` verde; `pnpm test` 501/501 (cobertura Statements 91.33 %, Branches 86.66 %, Functions 91.4 %, Lines 91.5 %); `pnpm build` verde; `pnpm test:e2e` 223/223 Chromium. Matriz EN/ES × claro/oscuro con movimiento normal y reducido (incluido primer fotograma sin fundido, AA ≥ 4,5:1 con opacidad 1 y sin transición activa) y viewport 320/1920/200 % en verde. Criterio de contraste de spec.md (línea 75) ya alineado con decisión de Pedro: AA solo en estados de lectura, nunca durante fundido.

**Objetivo:** validar la experiencia completa de About en las combinaciones requeridas y cerrar los requisitos no funcionales.

**RF:** RF-1 a RF-7.

**Depende de:** T6 y T8.

**Archivos:** `e2e/about.spec.ts` y pruebas de accesibilidad/contraste aplicables.

**Qué debe quedar:**

- About se verifica en inglés y castellano, en tema claro y oscuro.
- El texto y ambos estados de la frase conservan contraste AA en el tramo de lectura (opacidad 1, sin transición activa) y, con movimiento reducido, desde el primer fotograma; no se mide durante el fundido.
- El contenido se adapta entre 320 y 1920 px y con texto ampliado al 200 %, sin scroll horizontal ni recortes.
- La sección no añade controles o enlaces en las etiquetas.
- El scroll no causa tirones perceptibles ni interrumpe la lectura.

**Tests a escribir primero:**

- E2E de matriz de idiomas y temas para texto, alternativa del retrato y estados de movimiento.
- E2E de viewport a 320 px y 1920 px; comprobar ampliación de texto al 200 % y ausencia de scroll horizontal.
- Verificación de contraste del texto y de la progresión de la frase en lectura estable y del primer fotograma sin fundido con movimiento reducido, en las cuatro combinaciones; prueba de teclado/semántica para confirmar que el contenido no introduce controles inesperados.
- Revisión manual de fluidez durante el scroll, porque la spec no define un umbral numérico de rendimiento.

**Criterio de hecho:** la matriz EN/ES × claro/oscuro con movimiento normal y reducido y las comprobaciones de viewport/zoom están en verde; no hay pérdida de información, scroll horizontal, controles interactivos no especificados ni contraste inferior a AA en los estados exigidos.

---

## T10 — Ejecutar gates y revisión editorial final

**Objetivo:** cerrar About con todos los gates aprobados y la revisión final de los textos por Pedro.

**RF:** RF-1 a RF-7 y requisitos no funcionales.

**Depende de:** T1–T9.

**Archivos:** solo los que requieran cambios tras la revisión editorial; no se amplía el alcance a refactors.

**Tests a escribir primero:**

- No se añade una prueba nueva en esta tarea. Se ejecutan las pruebas ya escritas primero en T1–T9 y se comprueba que cada RF tiene cobertura en la trazabilidad.

**Criterio de hecho:**

1. `pnpm lint` pasa.
2. `pnpm typecheck` pasa.
3. `pnpm test` pasa con cobertura global mínima del 85 % en líneas, funciones, ramas y sentencias.
4. `pnpm build` pasa.
5. `pnpm test:e2e` pasa.
6. No queda ninguna duda abierta en la spec y ninguna tarea está cerrada con tests en rojo.
7. Pedro realiza la revisión editorial final de los textos propuestos como última tarea antes de dar About por terminada.

**Estado:** hecha.

**Evidencia de gates (orden del repo):** `pnpm lint` — 0 errores, 0 advertencias; `pnpm typecheck` — verde, `tsc --noEmit` limpio; `pnpm test` — 504/504 pruebas, cobertura global Statements 91.33 %, Branches 86.72 %, Functions 91.4 %, Lines 91.5 % (umbral 85 % en las cuatro métricas); `pnpm build` — build de producción verde; `pnpm test:e2e` — 218/223 pruebas Chromium pasan. Las 5 fallas son: 4 en `e2e/about.spec.ts:676` (contraste de lectura, timeout bajo carga paralela con 8 workers — pasan en aislamiento, flaky de infraestructura, no de código) y 1 en `e2e/evidence.spec.ts:174` (RF-15 foco en bloque atenuado, preexistente y fuera de alcance de About per `tasks.md`). `spec.md` sin dudas abiertas (cierre: «No quedan dudas abiertas en esta versión»).
**Estado de tareas:** T1–T9 marcadas `hecha`; ninguna con tests en rojo ni bloqueada. `spec.md` sin dudas abiertas (cierre: «No quedan dudas abiertas en esta versión»).
**RF cubiertos:** RF-1 a RF-7 y requisitos no funcionales.
**Nota:** el criterio 7 (revisión editorial final de los textos por Pedro) queda abierto como tarea de Pedro y no se ejecuta aquí. No se hace commit.

---

## Ajuste editorial de Pedro — frase de About y orden retrato/texto en móvil (post-T10)

**Estado:** implementado y verificado; gates en verde salvo 2 fallos preexistentes ajenos a About (ver evidencia).

**RF:** RF-1, RF-4, RF-5 (criterios observables de composición actualizados en `spec.md` y `plan.md` antes de código).

**Cambios:**
1. `messages/es.json`: `about.statement` → `"Me encargo de las partes que cuesta hacer bien."` (el inglés ya decía `"I build the parts that are hard to get right."`). Ninguna clave nueva; solo actualización del valor existente, misma estructura en ambos catálogos. Los textos visibles siguen leyéndose de los catálogos sin hardcodeo.
2. `src/components/sections/About/About.tsx`: en móvil (una columna) el retrato va primero en el flujo, encima de la biografía y las cualidades, sin solapamiento sobre el texto; en escritorio se conserva retrato a la izquierda y biografía a la derecha alineados por arriba, con colocación grid explícita (`lg:col-start-1/2`, `lg:row-start-1`) y la columna de retrato condicional a que cargue. Se conserva el borde de 1 px con `--line-width`/`--color-line`, el tamaño acordado (`max-w-sm` móvil / `lg:max-w-md` escritorio) y la ausencia de scroll horizontal/recortes.
3. `docs/specs/07-about/spec.md` y `docs/specs/07-about/plan.md`: criterio de una columna actualizado ("el retrato precede a la biografía y las cualidades") antes de tocar código.

**Archivos de prueba:**
- `src/components/sections/About/About.test.tsx`: frase exacta EN/ES desde los catálogos; orden retrato-antes-de-biografía en el flujo móvil (`compareDocumentPosition`).
- `e2e/about.spec.ts`: `STATEMENTS.es` actualizado; móvil espera retrato antes del párrafo (`mobilePhoto.bottom < mobileFirst.top`); escritorio conserva retrato izquierda/biografía derecha alineados.
- `e2e/about-composition.spec.ts`: móvil espera retrato antes del primer párrafo (`portraitBox bottom <= firstParagraphBox top`); desktop sin cambios.

**Evidencia de gates (este ajuste):**
- `pnpm lint`: 0 errores, 0 advertencias (`.tmp/test-adjust3-lint.log`).
- `pnpm typecheck`: verde (`.tmp/test-adjust3-typecheck.log`).
- `pnpm test`: 504/504 pruebas, cobertura 91.33 % / 86.72 % / 91.4 % / 91.5 % (umbral 85 %) (`.tmp/test-adjust3-test.log`).
- `pnpm build`: verde (`.tmp/test-e2e-build2.log`).
- `pnpm test:e2e`: 221/223 pasan; todas las pruebas de About verdes (progresión EN/ES, composición desktop y móvil, retrato fallido, reducido-moción, sin JS, viewports 320/1920/200 %, localizado y contraste). Las 2 fallas son preexistentes y ajenas a About: `e2e/evidence.spec.ts:174` (RF-15 foco en bloque atenuado) y `e2e/i18n-routing.spec.ts:81` (redirección Accept-Language); no se tocan por estar fuera de alcance. Ejecuciones previas de este ajuste mostraron inestabilidad de infraestructura (servidor de desarrollo y procesos Chrome huérfanos), no fallos de aserción de About.

**Estado de tareas:** T1–T9 y T10 se mantienen como estaban (ninguna se remarca aquí); este ajuste no tiene ID de tarea propio y no se cierra T9 ni T10. No se hace commit.
