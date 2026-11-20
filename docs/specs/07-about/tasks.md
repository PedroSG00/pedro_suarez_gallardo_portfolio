# Tareas — 07 About

**Estado:** Pendiente de ejecución. Se deriva de `docs/specs/07-about/spec.md` y `docs/specs/07-about/plan.md`, y debe respetar `docs/constitution.md`.

**Alcance:** RF-1 a RF-7 y sus requisitos no funcionales. Cada tarea se implementa y verifica por separado; ninguna se cierra con sus pruebas en rojo.

**Regla de trabajo:** tests primero; no se añaden dependencias; no se crean carpetas en la raíz ni en el primer nivel de `src/`; no se modifica una capa transversal sin aprobación. Los textos propuestos se usan durante la implementación y su revisión editorial por Pedro es la última tarea.

**Cierre de cada tarea de implementación:** además de sus pruebas, `pnpm lint` y `pnpm typecheck` deben estar en verde. Si toca CSS o composición, se añade `pnpm build`; si toca movimiento, idioma o rutas, se añade el e2e correspondiente. La última tarea ejecuta todos los gates.

---

## Mapa de tareas

| ID | Tarea | RF | Depende de |
|---|---|---|---|
| T1 | Cerrar el comportamiento visual de RF-2 | RF-2 | — |
| T2 | Añadir contenido bilingüe y etiquetas de About | RF-1, RF-3, RF-7 | T1 |
| T3 | Crear el bloque accesible de la frase firma | RF-2, RF-6, RF-7 | T2 |
| T4 | Implementar la progresión acumulativa de la frase | RF-2 | T1, T3 |
| T5 | Integrar el retrato y su fallback | RF-4, RF-6, RF-7 | T2 |
| T6 | Integrar About en la home conservando el destino | RF-1, RF-7 | T2, T3, T5 |
| T7 | Aplicar el revelado general a los bloques de About | RF-3, RF-5, RF-6 | T4, T6 |
| T8 | Verificar fallbacks de movimiento y no-JavaScript | RF-2, RF-5, RF-6 | T7 |
| T9 | Verificar temas, idiomas, accesibilidad y adaptación | RF-1–RF-7 | T6, T8 |
| T10 | Ejecutar gates y revisión editorial final | Todos | T1–T9 |

---

## T1 — Cerrar el comportamiento visual de RF-2

**Objetivo:** eliminar la aclaración pendiente de la spec sobre el estado visual iluminado/no iluminado y el tramo de scroll que recorre cada palabra.

**RF:** RF-2.

**Depende de:** nada.

**Documentación:** `docs/specs/07-about/spec.md`.

**Tests a escribir primero:**

- No hay test ejecutable en esta tarea documental. Antes de actualizar la spec, fijar los casos que deberán convertirse en pruebas visibles: inicio de la frase, progreso entre palabras, acumulación, estado final y reversión.
- Definir cómo se comprobará la diferencia de estado sin consultar clases ni estructura interna.

**Criterio de hecho:** `docs/specs/07-about/spec.md` define estados visuales, límites del progreso, comportamiento en ambos temas y criterios observables para las pruebas; no queda `[NECESITA ACLARACIÓN]` sobre RF-2. No se implementa la animación en esta tarea.

---

## T2 — Añadir contenido bilingüe y etiquetas de About

**Objetivo:** incorporar el texto aprobado para implementación y las cinco cualidades en los catálogos EN/ES y presentar el contenido estático de About.

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

**Criterio de hecho:** la imagen se muestra cuando está disponible; al simular fallo, solo desaparece el retrato y el resto del contenido sigue accesible. `pnpm lint`, `pnpm typecheck` y `pnpm build` están en verde.

---

## T6 — Integrar About en la home conservando el destino

**Objetivo:** reemplazar el cuerpo reservado de About por la sección completa sin cambiar el ancla, el orden ni los destinos de las otras secciones.

**RF:** RF-1, RF-7.

**Depende de:** T2, T3 y T5.

**Archivos:** `src/app/[locale]/page.tsx`, `e2e/home.spec.ts`.

**Qué debe quedar:**

- La sección conserva el identificador y encabezado About ya reservados.
- Work, Stack y Contact mantienen su orden, encabezados y destinos.
- La navegación existente lleva al encabezado de About sin duplicar el destino ni el encabezado.
- El contenido localizado se integra en `/en` y `/es`.

**Tests a escribir primero:**

- E2E de home: verificar un solo encabezado About accesible por idioma, el contenido bajo el destino correcto y la existencia/orden de Work, Stack y Contact.
- E2E de ancla: navegar a About y comprobar que el encabezado queda visible y que el destino se conserva.

**Criterio de hecho:** la home conserva los cuatro destinos y sus ids; About queda en el primero, aparece en ambos idiomas y los tests de home y anclas pasan. `pnpm build` está en verde.

---

## T7 — Aplicar el revelado general a los bloques de About

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

## T8 — Verificar fallbacks de movimiento y no-JavaScript

**Objetivo:** asegurar que el contenido de About permanece estático, visible y completo con movimiento reducido, sin soporte de animación ligada al scroll o sin JavaScript.

**RF:** RF-2, RF-5, RF-6.

**Depende de:** T7.

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

**Objetivo:** validar la experiencia completa de About en las combinaciones requeridas y cerrar los requisitos no funcionales.

**RF:** RF-1 a RF-7.

**Depende de:** T6 y T8.

**Archivos:** `e2e/about.spec.ts` y pruebas de accesibilidad/contraste aplicables.

**Qué debe quedar:**

- About se verifica en inglés y castellano, en tema claro y oscuro.
- La frase conserva contraste AA durante el revelado general y la progresión de palabras.
- El contenido se adapta entre 320 y 1920 px y con texto ampliado al 200 %, sin scroll horizontal ni recortes.
- La sección no añade controles o enlaces en las etiquetas.
- El scroll no causa tirones perceptibles ni interrumpe la lectura.

**Tests a escribir primero:**

- E2E de matriz de idiomas y temas para texto, alternativa del retrato y estados de movimiento.
- E2E de viewport a 320 px y 1920 px; comprobar ampliación de texto al 200 % y ausencia de scroll horizontal.
- Verificación de contraste para texto y estados de la frase; prueba de teclado/semántica para confirmar que el contenido no introduce controles inesperados.
- Revisión manual de fluidez durante el scroll, porque la spec no define un umbral numérico de rendimiento.

**Criterio de hecho:** la matriz EN/ES × claro/oscuro y las comprobaciones de viewport/zoom están en verde; no hay pérdida de información, scroll horizontal, controles interactivos no especificados ni contraste inferior a AA.

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
