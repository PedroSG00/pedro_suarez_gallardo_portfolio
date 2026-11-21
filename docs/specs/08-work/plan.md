# Plan — Spec 08 Work

## Alcance y principios

Este plan concreta la implementación de `docs/specs/08-work/spec.md`. Work incorpora cinco resultados bilingües en la posición y el destino de navegación ya reservados.

- Se mantienen las reglas de `docs/constitution.md`: tests primero, sin nuevas dependencias, textos en los catálogos de idioma, datos en `src/content/`, componentes de sección síncronos y movimiento con fallback visible.
- No se crean carpetas en la raíz ni en el primer nivel de `src/`; la nueva sección vive bajo `components/sections/`.
- Work reutiliza la implementación compartida de `Reveal`, navegación y tema. La condición «estático sin JavaScript» de RF-6 requiere verificar y probablemente ajustar el contrato compartido de `Reveal`: el movimiento ligado al scroll no debe activarse hasta confirmar que JavaScript está disponible. Ese ajuste transversal queda bloqueado hasta recibir aprobación explícita; sin ella no se inicia la implementación ni se relaja RF-6.
- No se añaden páginas de detalle, enlaces externos ni una capa genérica reutilizable solo por Work.

## Estructura de módulos

| Módulo | Responsabilidad | RF |
|---|---|---|
| `src/components/sections/Work/Work.tsx` | Sección síncrona; obtiene los textos del idioma activo, ordena la lista, compone el encabezado, los resultados y sus etiquetas. | RF-1–RF-6 |
| `src/components/sections/Work/Work.module.css` | Presentación propia de las filas: composición, separadores y estado invertido al pasar un cursor compatible. Solo consume tokens y el tratamiento de inversión ya existente. | RF-4 |
| `src/components/sections/Work/Work.test.tsx` | Comportamiento visible, contenido localizado, lista semántica, orden y ausencia de controles. | RF-1–RF-5 |
| `src/content/work.ts` | Orden canónico, identificadores estables y etiquetas de tecnologías de las cinco entradas. No contiene prosa traducible. | RF-2, RF-3 |
| `messages/en.json`, `messages/es.json` | Titular de Work, titulares y frases de sus cinco resultados, con idéntica estructura de claves. Se conserva `shared.nav.experience` para la etiqueta de navegación. | RF-1, RF-2 |
| `src/app/[locale]/page.tsx` | Sustituye el cuerpo reservado de Work por la sección completa, conservando el destino, orden y envoltorio de página existentes. | RF-1 |
| `src/components/ui/Reveal/Reveal.tsx` y `Reveal.module.css` | Solo con aprobación explícita: asegurar que el movimiento ligado al scroll se activa únicamente cuando JavaScript está disponible; sin JavaScript, el contenido queda estático y visible. | RF-6 |
| `e2e/work/work.spec.ts` | Integración, idiomas, destino, semántica y comportamiento informativo. | RF-1–RF-5 |
| `e2e/work/work-visual.spec.ts` | Inversión completa, contraste, temas, hover y adaptación de viewport. | RF-4, RF-5 |
| `e2e/work/work-motion.spec.ts` | Entrada, lectura, salida, reversión, filas altas y acceso directo a Work. | RF-6 |
| `e2e/work/work-fallbacks.spec.ts` | Movimiento reducido, ausencia de soporte de animación por scroll y JavaScript desactivado. | RF-6 |

La sección reutiliza `Section`, `SectionHeading`, `Heading`, `Tag` y `Reveal`. `SectionHeading` conserva el único encabezado de sección (`02 / WORK` o `02 / TRABAJO`) asociado al destino. El titular del brief se presenta como encabezado subordinado; cada resultado tiene su propio titular. La lista es ordenada y contiene cinco elementos; cada elemento contiene el `Reveal` de su fila y su contenido.

La implementación no introduce `RevealGroup`: envolvería los elementos de una lista con nodos entre la lista y sus elementos. Cada fila se compone individualmente para preservar la semántica de lista y mantener su número unido al contenido durante el movimiento.

## Modelo de datos

### Registro no traducible

La lista de `src/content/work.ts` es la fuente del orden y de las tecnologías. El índice visible se deriva de la posición; no se almacena por separado, para evitar que el orden y la numeración diverjan.

| Campo | Tipo conceptual | Regla |
|---|---|---|
| `id` | Identificador estable, en inglés | Corresponde al grupo de claves traducibles del resultado. |
| `technologies` | Lista de nombres de tecnología | No se traduce ni se convierte en enlaces. |

La lista contiene exactamente cinco registros en el orden del brief:

| Posición | `id` conceptual | Tecnologías |
|---|---|---|
| 01 | `desktopAppsToWeb` | React, TypeScript |
| 02 | `liveSupervisionDashboard` | React, TypeScript |
| 03 | `adminSuite` | React, TypeScript |
| 04 | `visualFlowEditor` | React, TypeScript, WebSockets |
| 05 | `integrationsAndBackendApis` | Node.js, Express, C#, PHP, Python, REST |

### Textos localizados

Los catálogos conservan la convención del brief (`experience.*`). Estructura conceptual:

- `experience.title`
- `experience.items.<id>.title`
- `experience.items.<id>.result`

Las mismas claves aparecen en inglés y castellano. La etiqueta `02 / WORK` o `02 / TRABAJO` se obtiene de la navegación ya existente (`shared.nav.experience`); el titular principal se obtiene de `experience.title`.

Ejemplo del registro 01:

- Datos: `id = desktopAppsToWeb`; tecnologías `React`, `TypeScript`.
- Inglés: titular «Desktop apps, moved to the web.»; resultado «I migrated two contact-center applications and redesigned their multilanguage interface. Both are in production and actively maintained.»
- Castellano: titular «Aplicaciones de escritorio, llevadas a la web.»; resultado «Migré dos aplicaciones de contact center y rediseñé su interfaz multidioma. Ambas están en producción y en mantenimiento activo.»

Los textos literales de las cinco entradas se mantienen en el brief aprobado; este plan no crea contenido alternativo.

## Algoritmos clave

### Construcción de las cinco filas — RF-2, RF-3

Pseudocódigo:

1. Leer los cinco registros en su orden canónico.
2. Para cada registro y su posición:
   - Derivar el índice visual como posición más uno, con dos dígitos.
   - Resolver titular y resultado desde el catálogo del idioma activo usando el identificador.
   - Renderizar un elemento de lista con el índice decorativo, el titular, el resultado y todas las etiquetas de tecnologías.
3. No ordenar, filtrar ni completar registros en tiempo de ejecución.
4. Si falta una clave, un campo o una traducción, tratar el contenido como inválido: las pruebas deben fallar y el cierre queda bloqueado; no usar fallback a otro idioma ni descartar silenciosamente la fila.

### Estado de movimiento — RF-6

1. Cada fila utiliza el `Reveal` compartido y su estado depende de la posición actual en el viewport.
2. Al entrar desde abajo, el contenido se revela; en el tramo de lectura queda plenamente visible; al salir por arriba se atenúa.
3. Al desplazarse hacia atrás, el mismo recorrido se invierte porque depende de la posición, no de historial acumulado.
4. Si el usuario accede directamente al ancla o recarga dentro de Work, cada fila presenta el estado correspondiente a su posición actual.
5. Con movimiento reducido, sin JavaScript o sin soporte de animación por scroll, las filas quedan visibles y estáticas desde el primer fotograma.
6. No se calcula progreso con listeners propios ni se crea un mecanismo de scroll específico de Work.
7. Para el caso sin JavaScript, el movimiento del `Reveal` compartido debe estar desactivado por defecto y habilitarse solo cuando se haya confirmado que JavaScript está disponible. Como esto afecta a un componente compartido, solicitar aprobación explícita antes de implementarlo; hasta entonces RF-6 es un bloqueo, no un fallback que pueda omitirse.

### Inversión de color — RF-4

1. Solo un cursor en un dispositivo que ofrece hover activa la inversión.
2. La inversión afecta a la fila completa: fondo, número, titulares, resultado, etiquetas y separadores.
3. La fila usa la paleta del tema activo y vuelve al estado base al salir el cursor.
4. El efecto visual no produce navegación ni una acción. El toque no deja un estado persistente.
5. La inversión y el estado de movimiento son independientes.

## Contratos de interfaz

### `Work`

**Entradas**

- Sin props de contenido.
- Idioma activo y textos de `experience.*`.
- Lista estática de identificadores y tecnologías.
- Estado ambiental del tema, viewport, preferencia de movimiento, soporte del efecto de scroll y disponibilidad de hover.

**Salida**

- Una sección con el identificador `work`, el encabezado numerado localizado y el titular del brief.
- Una lista ordenada con exactamente cinco elementos.
- En cada elemento: índice visual decorativo, titular, frase de resultado y etiquetas de tecnologías.
- Ningún enlace, botón, control o parada de foco ficticia.

**Errores y datos inválidos**

- Un registro incompleto, una clave ausente o una diferencia de estructura entre idiomas bloquea la aceptación; no se publica contenido parcial ni se inventan valores.
- Una lista vacía, con menos de cinco registros, con más de cinco registros o con identificadores repetidos es inválida para esta spec.
- Las pruebas de paridad de mensajes comprueban que ambos idiomas mantienen las mismas claves; las pruebas de Work comprueban que las cinco entradas se renderizan completas.

### Integración con la home

- `page.tsx` mantiene el destino `work`, su posición después de About y antes de Stack, y la definición existente de navegación.
- `Work` asume la responsabilidad de renderizar su propio `Section` y `SectionHeading`, como hace About; la ruta no añade una segunda sección ni un segundo encabezado.
- La etiqueta de navegación conserva el valor y la localización existentes. No se modifica el contrato global del Navbar.

## Decisiones técnicas

| Decisión | Justificación | Alternativa descartada |
|---|---|---|
| Separar datos ordenados y etiquetas de tecnologías en `src/content/work.ts` de los textos bilingües en los catálogos. | Cumple la constitución: datos en contenido, textos en `messages/`, traducciones con claves equivalentes. | Guardar toda la prosa en el componente, o duplicar toda la estructura de datos dentro de ambos catálogos. |
| Usar identificadores estables para enlazar registros con sus traducciones; derivar el número de la posición. | Mantiene una única fuente de orden y evita índices duplicados o desincronizados. | Guardar simultáneamente orden e índice en cada registro. |
| Usar la lista semántica y marcar el número visual como decorativo. | La lista comunica orden a tecnologías de asistencia; evita anunciar dos veces la posición. | Cinco bloques sin relación de lista o incluir el índice visual en el nombre accesible. |
| Componer con `Section`, `SectionHeading`, `Heading`, `Tag` y `Reveal` existentes. | Conserva contratos de página, semántica, etiquetas y fallback de movimiento probados. | Crear wrappers genéricos, nuevas primitivas o duplicar esos comportamientos. |
| Aplicar el estado invertido en la composición de la fila usando el tratamiento y tokens existentes, con reglas propias en `Work.module.css`. | Mantiene consistente la paleta de ambos temas sin valores de color mágicos ni cambios a estilos globales. | Colores literales, una inversión global del tema o gestionar hover con estado JavaScript. |
| Dejar que `Reveal` controle el movimiento y su fallback. | Una fuente compartida de comportamiento mantiene reversibilidad, movimiento reducido y contenido visible cuando falta soporte. | Listeners de scroll, cálculo local de progreso, dependencia de animación o modificación transversal de `Reveal`. |
| Gatear el movimiento compartido según disponibilidad de JavaScript, únicamente tras aprobación. | La spec exige un estado estático y visible sin JavaScript; el contenido no puede quedar oculto por la animación CSS en ese entorno. | Confiar en que el fallback de soporte CSS o `prefers-reduced-motion` cubra también el caso sin JavaScript: son condiciones distintas. |
| Mantener filas no interactivas y hover solo visual. | Coincide con la intención informativa y evita controles o navegación engañosos. | Convertir filas o tecnologías en enlaces, botones o regiones enfocables. |
| No añadir dependencias ni nuevas capas compartidas. | El stack está cerrado y Work es el único consumidor de su presentación propia. | Añadir paquetes o abstraer una solución sin un segundo consumidor. |

Antes de reemplazar mensajes, verificar que las claves actuales `work.intro` y `work.results` no tengan consumidores. Si siguen sin uso, se sustituyen por las claves `experience.*` requeridas por el brief en ambos idiomas; no se retiran otras claves fuera del alcance.

## Estrategia de tests

Los tests de aceptación se escriben antes de la implementación.

### Unitarios de `Work`

Con los mensajes reales de ambos idiomas:

- Verificar encabezado numerado, titular localizado y orden exacto de las cinco entradas.
- Verificar que cada titular, resultado y tecnología del brief aparece completo; no depender de clases ni estructura visual interna.
- Verificar una sección y una lista con cinco elementos, titulares asociados a sus textos y números decorativos no anunciados.
- Verificar que las filas y etiquetas no contienen enlaces, botones ni focos de teclado.
- Verificar paridad de claves EN/ES mediante la prueba de catálogos existente.

### E2E de contenido e integración — RF-1–RF-3, RF-5

- EN y ES: textos, orden, índices, tecnologías y cinco elementos de lista.
- Destino `work`: navegación desde el Navbar, acceso directo y encabezado visible una sola vez.
- Orden de secciones: About, Work, Stack y Contact, sin cambio de destinos.
- Teclado y semántica: destino accesible; filas, números y etiquetas no se vuelven controles.

### E2E de tema, hover y contraste — RF-4

- Matriz de inglés/castellano por tema claro/oscuro.
- En cada combinación, verificar estado base e inversión de la fila completa mediante estilos computados y texto visible.
- Medir contraste AA en lectura estable para texto normal y grande según su tamaño/peso; repetir con la fila invertida.
- No exigir AA durante fundidos o transiciones, conforme a la spec.
- Probar ausencia de cursor y entrada táctil: contenido legible, sin inversión persistente ni acción.

### E2E de movimiento y acceso — RF-6

- En ambos idiomas y temas, comprobar para las cinco filas entrada, zona estable, salida y reversión usando estilos computados, nunca clases.
- Comprobar que una fila más alta que el viewport se lee sin recortes y que las partes visibles alcanzan el estado estable.
- Acceder directamente a `#work` y recargar dentro de Work; comprobar que el estado coincide con la posición actual.
- Verificar que el movimiento no impide leer ni desplazarse.

### E2E de adaptación y fallbacks

- Viewports de 320 px y 1920 px y texto al 200 %; comprobar todos los textos, etiquetas, cinco filas, ausencia de solapamiento, recorte y scroll horizontal en ambos idiomas y temas.
- Con `prefers-reduced-motion`, verificar visibilidad y legibilidad desde el primer fotograma, sin animaciones activas, y contraste AA desde ese fotograma.
- Simular ausencia de soporte de animación por scroll; verificar la misma presentación estática y completa.
- Desactivar JavaScript; verificar las cinco filas, textos e índices visibles y estáticos.
- Antes de implementar el gating de JavaScript en `Reveal`, obtener aprobación explícita por tratarse de un cambio transversal; probar también el estado con JavaScript activo para conservar entrada, lectura, salida y reversión.
- Para estilos y movimiento, comprobar resultados observables (roles, texto, estilos computados y contraste), no selectores internos ni clases.

### Gates de cierre

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` con umbral global mínimo del 85 % en líneas, funciones, ramas y sentencias
- `pnpm build`
- `pnpm test:e2e` por los cambios de idioma, navegación, tema y movimiento

## Trazabilidad RF

| RF | Componentes/datos | Verificación principal |
|---|---|---|
| RF-1 | `Work`, `Section`, `SectionHeading`, catálogos, integración de página | Unitarios EN/ES; E2E de etiquetas, ubicación, destino y unicidad del encabezado |
| RF-2 | `src/content/work.ts`, catálogos, `Work`, `Tag` | Unitarios de contenido completo y paridad; E2E de cinco entradas en ambos idiomas |
| RF-3 | Orden de `WORK_ENTRIES`, índice derivado, lista semántica | Unitarios de orden y numeración; E2E de lista y orden en EN/ES |
| RF-4 | `Work.module.css`, tokens y tratamiento de inversión existente | E2E de estado base/invertido, ambos temas, contraste, salida del cursor y táctil |
| RF-5 | Lista semántica, etiquetas no interactivas | Unitarios y E2E de roles, teclado, ausencia de enlaces y botones |
| RF-6 | `Reveal` existente y, tras aprobación, su gating de JavaScript; composición de filas | E2E de entrada/lectura/salida/reversión, acceso directo, filas altas, movimiento reducido, sin soporte y sin JavaScript |
