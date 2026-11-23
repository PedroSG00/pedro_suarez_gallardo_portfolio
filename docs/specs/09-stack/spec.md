# Spec 09 — Stack

## Contexto y objetivo

Stack presenta las 25 tecnologías que Pedro utiliza como cartas flotantes dentro de un canvas 3D renderizado con Three.js. La persona puede explorar las tecnologías por categoría, mover las cartas, cambiarlas entre una composición plana y otra en perspectiva y consultar qué es cada tecnología.

El momento firma es un pequeño escenario editorial, minimalista en elementos y espectacular en ejecución: cada tecnología aparece como una carta tridimensional con su marca reconocible, volumen, material, luz y sombra coherentes con el mismo lenguaje visual. Las cartas se desplazan suavemente por el escenario y colisionan entre ellas con una respuesta legible, sin física realista ni movimiento frenético. Se pueden agarrar, mover y soltar; al recibir una carta, el casillero responde con hover y feedback visible, muestra su descripción y ofrece expulsarla de vuelta al escenario. La expulsión es explícita y nunca deja cartas ocultas bajo el casillero. El modo 2D conserva la identidad de las cartas en una composición plana.

**Dirección de arte — mesa CAD.** La referencia visual se traduce en una consola monocroma: barra compacta de filtros y vistas, cartas extruidas con ficha numerada y marca propia, conexiones finas entre cartas de una misma categoría y ranura en el centro. La vista 2D usa papel cuadriculado y proyección frontal; la vista 3D muestra la misma composición sobre una cuadrícula de suelo en perspectiva. Una banda inferior informa de la vista y la ocupación. La consola mantiene las 25 tecnologías y seis categorías aprobadas (las referencias no cambian el contenido), hereda el tema del sitio y ofrece acceso visible a la lista. Se exponen solo acciones ya operativas.

La sección comunica criterio técnico. No presenta niveles, puntuaciones ni comparaciones de dominio, y no atribuye a Pedro usos, proyectos o resultados no respaldados.

## Usuarios

- **Reclutadores**, que quieren entender con qué tecnologías trabaja Pedro y qué es cada una.
- **Clientes potenciales**, que quieren situar rápidamente el tipo de herramientas que domina el stack.
- **Visitantes**, que quieren explorar el stack sin depender de arrastrar, del modo 3D, de WebGL o de animaciones.

## Historias de usuario

- Como reclutador, quiero consultar una tecnología y leer qué es y para qué sirve.
- Como cliente potencial, quiero filtrar las tecnologías por categoría para explorar con más claridad las capacidades relevantes.
- Como visitante, quiero mover las cartas por el canvas y ver cómo reaccionan entre ellas.
- Como visitante, quiero reconocer cada tecnología por su marca propia y ver cartas con volumen real integradas en una escena 3D coherente.
- Como visitante, quiero recibir feedback visual claro al acercar o soltar una carta sobre el casillero y poder expulsarla de nuevo al escenario.
- Como visitante, quiero alternar entre 2D y 3D sin perder la continuidad espacial del canvas.
- Como visitante, quiero rotar y acercar la escena 3D con ratón y controles accesibles.
- Como visitante que no puede o no quiere arrastrar, quiero seleccionar tecnologías por otra vía.
- Como visitante con movimiento reducido, sin JavaScript o sin WebGL, quiero acceder al contenido completo como una lista plana.

## Requisitos funcionales

### RF-1 — Tecnologías y categorías

El sistema deberá mostrar las 25 tecnologías aprobadas en la sección 4 del brief, organizadas en seis categorías: Frontend, Data visualization, Backend & APIs, Databases, Testing & CI/CD y AI & Tools.

**Criterios de aceptación (EARS):**

- Cuando se consulte Stack en cualquiera de los idiomas, se mostrarán todas las tecnologías aprobadas, sin añadir tecnologías no aprobadas.
- Cuando se muestre una tecnología, aparecerá identificable por su nombre y un icono.
- Cada tecnología se identificará con su propio logotipo/marca reconocible, no con un icono genérico de Iconoir ni con una marca compartida; el nombre escrito seguirá visible.
- Las marcas tendrán un tratamiento compatible con la dirección editorial minimalista y contraste AA, sin convertir los colores de marca en colores de acento de la interfaz.
- Cuando se muestren las cartas, React y TypeScript tendrán prioridad visual dentro de Frontend, sin indicar niveles de dominio.
- Cuando se presente el contenido en orden de lectura, se respetarán el orden de categorías y el orden editorial de tecnologías del brief; la prioridad visual no cambia ese orden.
- Cuando una persona consulte la estructura con tecnología de asistencia, podrá identificar las categorías y las tecnologías que pertenecen a cada una.
- Las marcas serán decorativas para lectores de pantalla: el nombre de la tecnología proporcionará el nombre accesible sin anuncios duplicados.
- El sistema no mostrará niveles, puntuaciones, rankings ni barras de progreso.

### RF-2 — Filtro por categoría

El sistema deberá permitir filtrar las cartas mediante una sola categoría activa o la opción «Todas». Las cartas de otras categorías permanecerán visibles, atenuadas y no seleccionables.

**Criterios de aceptación (EARS):**

- Cuando se entre en Stack, el filtro activo será «Todas» y todas las cartas tendrán la misma prominencia.
- Cuando se active una categoría, las cartas que pertenezcan a ella conservarán su prominencia y las demás quedarán visiblemente atenuadas.
- Mientras una categoría esté activa, las cartas atenuadas no podrán seleccionarse ni moverse al casillero mediante ratón, teclado o interacción táctil.
- Cuando se active «Todas», todas las cartas volverán a ser seleccionables.
- Cuando se cambie la categoría activa, las cartas conservarán sus posiciones y la descripción seleccionada no cambiará.
- Cuando se use teclado o tecnología de asistencia, los filtros tendrán nombres accesibles y el filtro activo se podrá identificar.
- Las cartas atenuadas seguirán siendo legibles y distinguibles en ambos temas.
- El filtro tendrá el mismo comportamiento en 2D y en 3D y se conservará al alternar entre modos.

### RF-3 — Selección de tecnología y descripción

El sistema deberá permitir seleccionar una tecnología y mostrar en el casillero central una descripción bilingüe de la propia tecnología: qué es y para qué sirve. Solo habrá una tecnología seleccionada a la vez.

**Criterios de aceptación (EARS):**

- Cuando se entre sin una selección, el casillero estará vacío de detalle y mostrará una instrucción breve para elegir una carta; no se preseleccionará ninguna tecnología. La instrucción mencionará el arrastre cuando esté disponible.
- Cuando se seleccione una carta habilitada, el casillero mostrará la descripción de esa tecnología.
- Cuando se seleccione otra carta habilitada, el casillero reemplazará la descripción anterior por la nueva.
- Cuando se muestre una descripción, el nombre y el texto corresponderán a la misma tecnología y al idioma activo.
- Cuando se cambie de idioma, nombres, categorías, controles y descripciones estarán disponibles en el idioma seleccionado.
- Cuando se active un filtro que atenúe la carta seleccionada, la descripción y el estado de selección se conservarán; la carta no se podrá volver a seleccionar mientras permanezca atenuada.
- La descripción hablará de la tecnología, no de la experiencia personal de Pedro ni de resultados profesionales.
- Si falta la descripción validada de una tecnología o su traducción, la spec no se considerará completa y no se publicará un texto inventado o incompleto.

### RF-4 — Arrastre, límites y colisiones

El sistema deberá permitir arrastrar una carta habilitada al casillero para seleccionarla. Las cartas se desplazarán por el escenario, responderán a colisiones entre sí y al arrastre, y no saldrán de sus límites.

**Criterios de aceptación (EARS):**

- Cuando una carta habilitada se suelte en el casillero, quedará seleccionada y se mostrará su descripción.
- Cuando una carta se suelte fuera del casillero, conservará la posición de soltado dentro del canvas y no cambiará la selección activa.
- Cuando una carta se arrastre fuera de los límites del canvas, permanecerá dentro de estos; ninguna carta podrá perderse fuera del área visible.
- Cuando una carta se acerque a otra, se producirá repulsión: se admite solapamiento parcial, pero ninguna carta ocultará por completo a otra.
- En reposo, las cartas se desplazarán lentamente y de forma acotada; las colisiones producirán separación perceptible, sin vibración, aceleraciones bruscas ni ocultación completa.
- Con movimiento reducido, las cartas quedarán quietas hasta una interacción directa; la respuesta a un arrastre seguirá disponible y será inmediata.
- Mientras una carta esté atenuada por el filtro, no se podrá arrastrar ni seleccionar.
- Cuando se use teclado o pantalla táctil, se podrá seleccionar una carta sin arrastrarla.
- Cuando se arrastre una carta, no se rotará la escena.

### RF-4a — Casillero: recepción, estado ocupado y expulsión

El casillero central deberá comunicar cuándo acepta una carta, mostrar la tecnología seleccionada y permitir devolverla al escenario mediante una acción explícita.

**Criterios de aceptación (EARS):**

- Cuando una carta habilitada entre en la zona de recepción, el casillero mostrará un hover claramente perceptible; al salir de la zona volverá al estado normal.
- Cuando se suelte una carta habilitada en el casillero, este confirmará la recepción con feedback visual breve, mostrará su marca, nombre y descripción, y expondrá un botón accesible para expulsarla.
- Mientras una carta esté alojada, no quedará una copia interactiva de esa carta en la escena: el casillero será su ubicación visible y única.
- Cuando se active «Expulsar» con ratón, teclado o tacto, la carta volverá al escenario en una posición libre, visible, dentro de límites y que no se solape por completo con otra carta ni con el casillero.
- Cuando se seleccione otra tecnología mediante la lista accesible, la nueva pasará a ocupar el casillero y la anterior volverá a una posición libre visible; el cambio nunca crea duplicados ni cartas ocultas.
- Al expulsar, el casillero volverá a su estado vacío y la descripción dejará de presentarse como selección activa.
- Mientras haya una carta alojada, no se podrá soltar otra bajo el casillero ni ocultarla: se rechazará con feedback y la nueva carta volverá a una posición visible, o se deberá expulsar primero la ocupante.
- Si cambia el viewport, la carta alojada seguirá representada en el casillero y la acción de expulsión seguirá disponible.
- El botón tendrá nombre accesible localizado, foco visible y uso por teclado; el estado ocupado/vacío se comunicará semánticamente.

### RF-5 — Cambio entre 2D y 3D

El sistema deberá ofrecer un switch para alternar entre los modos 2D y 3D de la misma escena. El cambio conservará la continuidad espacial de las cartas y no sustituirá el canvas por otra escena.

**Criterios de aceptación (EARS):**

- Cuando se entre en Stack con soporte 3D disponible, el modo inicial será 2D.
- Cuando se active el switch, las cartas pasarán al otro modo manteniendo continuidad espacial: no desaparecerán para reaparecer en una composición ajena.
- Cuando se cambie entre modos, las cartas conservarán las posiciones asignadas por la persona.
- Cuando se alterne 2D↔3D, se conservarán el filtro activo, la selección y la descripción.
- Cuando se active `prefers-reduced-motion`, el switch seguirá permitiendo cambiar de modo, pero el cambio será instantáneo y no animado.
- Cuando el navegador no admita 3D, el switch no se mostrará y el modo 2D seguirá disponible.
- La escena puede tener movimiento ambiental pausado y acotado; no habrá movimiento frenético ni física continua de cuerpos. Con movimiento reducido se desactiva por completo. Las colisiones por interacción directa siempre se resuelven.

### RF-6 — Zoom en 3D

El sistema deberá permitir acercar y alejar la vista 3D mediante la rueda del ratón y controles visibles utilizables con teclado y pantalla táctil.

**Criterios de aceptación (EARS):**

- Cuando se use la rueda del ratón sobre la escena 3D, la vista se acercará o alejará según la dirección del movimiento.
- Cuando se use el control de acercar o alejar, el nivel de zoom cambiará en la dirección indicada.
- Cuando se alcance cualquiera de los límites de zoom, las acciones posteriores en esa dirección no alejarán ni acercarán más la vista.
- Cuando se use movimiento reducido, el zoom explícito seguirá funcionando sin animación añadida.
- Los controles de zoom tendrán nombres accesibles y se podrán utilizar con teclado.

### RF-7 — Rotación en 3D

El sistema deberá permitir rotar la escena horizontal y verticalmente arrastrando el fondo, con controles de rotación accesibles mediante teclado y pantalla táctil.

**Criterios de aceptación (EARS):**

- Cuando se arrastre el fondo de la escena 3D, la escena rotará en dirección horizontal o vertical según el movimiento del puntero.
- Cuando se arrastre una carta, se moverá la carta y no se rotará la escena.
- Cuando se use un control de rotación, la escena rotará en la dirección indicada sin requerir arrastrar.
- Cuando se alcance un límite de orientación, las acciones posteriores que lo sobrepasen no dejarán la escena en una orientación que impida explorar las cartas.
- Cuando se solicite movimiento reducido, la rotación causada directamente por la persona seguirá disponible y no se añadirá movimiento autónomo.
- Los controles de rotación tendrán nombres accesibles y se podrán utilizar con teclado y pantalla táctil.

### RF-8 — Estado al entrar y volver a Stack

El sistema deberá iniciar cada nueva entrada a Stack en un estado predecible.

**Criterios de aceptación (EARS):**

- Cuando se entre de nuevo en Stack, el modo inicial será 2D y el filtro activo será «Todas».
- Cuando se inicie una entrada nueva sin selección, el casillero mostrará la instrucción inicial y ninguna descripción preseleccionada.
- Cuando se cambie de idioma, el modo y el filtro volverán a 2D y «Todas».
- La preferencia de modo o filtro no se conservará entre entradas ni cambios de idioma.

### RF-9 — Lista plana sin JavaScript o sin WebGL

El sistema deberá ofrecer una presentación plana y completa cuando no haya JavaScript o no haya soporte de WebGL.

**Criterios de aceptación (EARS):**

- Cuando se consulte Stack sin JavaScript, se mostrará una lista plana con todas las categorías, tecnologías y sus descripciones completas, sin canvas ni controles interactivos.
- Cuando el navegador no disponga de WebGL, se mostrará la misma lista plana en lugar del canvas.
- Cuando se muestre la lista plana, el contenido será el mismo que el de las cartas y estará completo en ambos idiomas.
- Cuando se muestre la lista plana, no aparecerán controles de filtro, modo, zoom o rotación que no puedan funcionar.
- La lista plana mantendrá el orden editorial de categorías y tecnologías y la prioridad visual de React y TypeScript.

## Requisitos no funcionales

- Todo texto visible —incluidos filtros, controles, nombres accesibles y descripciones— estará disponible en inglés y castellano.
- La presentación conservará contraste AA en los temas claro y oscuro, incluso para las cartas atenuadas.
- Toda la información deberá poder consultarse con teclado y tecnología de asistencia; la selección no dependerá exclusivamente del arrastre.
- La presentación se adaptará a móvil y escritorio, sin recortar cartas, nombres, controles ni descripciones.
- La escena 3D tendrá profundidad legible en todas sus piezas: cartas extruidas con cantos, marcas legibles, casillero, y un escenario con planos/materiales, iluminación y sombras consistentes. No se mezclarán objetos planos flotando sobre elementos volumétricos como si fueran escenas distintas.
- La dirección 3D será una feature única y coherente: paleta editorial, escala, perspectiva, iluminación, materiales, profundidad y respuesta física compartirán reglas visuales. El impacto vendrá del volumen, la composición y el movimiento, no de adornos, colores aleatorios, partículas o efectos ajenos al sistema.
- El movimiento ambiental será pausado y de baja amplitud, se detendrá cuando la escena no esté visible o la pestaña no esté activa y no consumirá un bucle continuo si no es necesario; `prefers-reduced-motion` desactivará el movimiento ambiental.
- Con movimiento reducido, sin JavaScript o sin WebGL, el contenido permanecerá visible y legible.
- La interacción no impedirá el desplazamiento de la página ni bloqueará la lectura.
- La voz será breve, afirmativa y centrada en qué es cada tecnología. No se inventarán cifras, usos ni afirmaciones profesionales.
- La escena no consumirá recursos de forma continua cuando no haya cambios visuales; el movimiento ambiental, si está activo, usará un ciclo acotado y se pausará fuera de vista o con la pestaña inactiva.
- Los bloques de Stack respetarán el comportamiento general de entrada y salida con el scroll. Con movimiento reducido o sin soporte de la animación por scroll, todos permanecerán visibles.

## Casos límite

- Si una carta se suelta fuera del casillero, pero dentro del canvas, conservará su posición sin cambiar la descripción activa.
- Si se intenta llevar una carta atenuada al casillero, no se seleccionará ni moverá.
- Si se cambia de filtro mientras hay una descripción activa, la descripción se conserva aunque su carta quede atenuada.
- Si una carta se suelta más allá de los límites del canvas, no podrá quedar fuera del área visible.
- Si varias cartas se acercan o solapan, podrán tocarse parcialmente, pero se repelerán y ninguna ocultará totalmente a otra.
- Si se usa arrastre sobre una carta en modo 3D, se moverá la carta; si se arrastra el fondo, rotará la escena.
- Si se intenta superar los límites del zoom o la orientación, la escena permanecerá dentro de límites explorables.
- Si el navegador no admite 3D, no se mostrará el switch; el modo 2D seguirá disponible.
- Si el navegador no admite WebGL, se mostrará la lista plana.
- Si se solicita movimiento reducido, el cambio de modo será instantáneo y no habrá movimiento autónomo; los controles directos de zoom y rotación seguirán funcionando.
- Si JavaScript está desactivado, Stack se mostrará como una lista plana con todas las tecnologías y sus descripciones.
- Si falta una descripción aprobada o una traducción, el cierre de la spec queda bloqueado; no se recurre a una traducción incompleta ni a contenido inventado.

## Fuera de alcance

- Comparaciones entre tecnologías.
- Niveles, puntuaciones, rankings o barras de progreso.
- Selección simultánea de varias tecnologías.
- Tecnologías que no estén aprobadas en el brief.
- Descripciones basadas en la experiencia personal, proyectos o resultados de Pedro.
- Enlaces externos desde las cartas.
- Guardar posiciones, modo o filtro entre entradas.
- Física realista, gravedad o simulación de cuerpos rígidos; el movimiento ambiental es coreografiado y las colisiones son una respuesta simple y estable.
- La sección de proyectos y sus páginas de detalle.

## Restricciones técnicas

- La escena se renderiza con **Three.js** sobre WebGL, aprobado expresamente por el usuario para Stack. No se añaden otras dependencias: sin motores de física, sin `react-three-fiber` y sin librerías de animación.
- Three.js es una biblioteca de renderizado: no incluye colisiones, física ni sistemas de entrada. La repulsión y los límites se implementan en el propio proyecto.
- La constitución mantiene un stack cerrado; la incorporación de Three.js debe quedar registrada en ella antes de implementar.
- La lista plana de RF-9 es HTML servido desde el servidor; el canvas es una mejora progresiva que nunca sustituye al contenido.

## Criterios de finalización

- Las 25 tecnologías están representadas en sus seis categorías y tienen descripción completa en ambos idiomas.
- La escena inicia en 2D y «Todas»; el filtro atenúa y deshabilita las cartas de categorías inactivas sin cambiar sus posiciones.
- La selección única muestra la descripción correcta, y cambiar de filtro conserva la descripción activa.
- Las cartas se pueden arrastrar al casillero o seleccionar sin arrastrar; las atenuadas no son seleccionables por ningún método.
- Las cartas no se pierden fuera del canvas y la repulsión impide que una oculte por completo a otra.
- Cada carta usa la marca propia de su tecnología; los 25 logotipos son identificables, legibles en 2D/3D y tienen representación alternativa con nombre en la lista plana.
- En 3D, cartas, casillero y escenario comparten un lenguaje volumétrico coherente; iluminación, materiales, sombras, escala y perspectiva se verifican en tamaños móvil y escritorio.
- Las cartas se desplazan de forma pausada, colisionan con separación visible y paran con movimiento reducido; la escena se pausa fuera de vista.
- El casillero da hover al recibir una carta, confirma la recepción, presenta el botón «Expulsar» y devuelve la carta a una posición libre visible; no hay cartas apiladas u ocultas debajo.
- El switch ofrece transición con continuidad espacial, conserva posiciones, filtro, selección y descripción, y no se muestra si falta soporte 3D.
- En 3D funcionan el zoom acotado y la rotación horizontal/vertical mediante ratón y controles accesibles.
- Movimiento reducido, ausencia de JavaScript y ausencia de WebGL dejan el contenido completo visible como lista plana o modo 2D.
- Se verifican ambos idiomas, ambos temas, teclado, tecnología de asistencia, pantallas táctiles y adaptación a viewport antes del cierre.
- Las descripciones por tecnología están revisadas y aprobadas; no hay campos ni traducciones pendientes.
- Los tests de aceptación se escriben antes de implementar. El cierre requiere los gates definidos por el proyecto y las pruebas e2e aplicables.

## Decisiones confirmadas

- Se adoptan las 25 tecnologías y seis categorías de la sección 4 del brief; se mantiene la prioridad visual de React y TypeScript.
- El casillero comienza sin selección ni descripción, con una instrucción breve para elegir o arrastrar una carta.
- Al alternar 2D↔3D se conservan posiciones, filtro, selección y descripción. Esto no modifica los reinicios entre entradas o idiomas de RF-8.
- El contenido de cada tecnología es una descripción de la propia tecnología, no un relato de uso personal.
- Sin JavaScript o sin WebGL, Stack se presenta como una lista plana completa.
- La escena se construye con Three.js; la implementación anterior con CSS se descartó y se retiró del repositorio.
- Se autorizan las carpetas necesarias para Stack bajo `src/` conforme al plan. No se autorizan cambios en capas transversales ni otras dependencias.
- Mensaje del usuario: «APRUEBO EL CONTENT-REVIEW». Quedan aprobados las etiquetas y la instrucción inicial de `docs/specs/09-stack/content-review.md`. Las descripciones de tecnología sustituyen a las fichas de uso y requieren nueva aprobación editorial antes de implementar.
