# Spec 09 — Stack

## Contexto y objetivo

Stack presenta las 25 tecnologías que Pedro utiliza como cartas flotantes dentro de un canvas 3D renderizado con Three.js. La persona puede explorar las tecnologías por categoría, mover las cartas, cambiarlas entre una composición plana y otra en perspectiva y consultar qué es cada tecnología.

El momento firma es un pequeño escenario editorial, minimalista en elementos y espectacular en ejecución: cada tecnología aparece como una carta tridimensional con su marca reconocible, volumen, material, luz y sombra coherentes con el mismo lenguaje visual. Las cartas se desplazan suavemente por el escenario y colisionan entre ellas con una respuesta legible, sin física realista ni movimiento frenético. Se pueden agarrar, mover y soltar; al recibir una carta, el casillero responde con hover y feedback visible, muestra su descripción y ofrece expulsarla de vuelta al escenario. La expulsión es explícita y nunca deja cartas ocultas bajo el casillero. El modo 2D conserva la identidad de las cartas en una composición plana.

**Dirección de arte — mesa CAD.** La referencia visual se traduce en una consola monocroma: filtros y acciones mediante iconos en el marco del escenario, cartas extruidas con ficha numerada y marca propia, trazados finos conectados a los bordes de las cartas de una misma categoría y ranura central. La vista 2D usa papel cuadriculado y proyección frontal; la vista 3D muestra la misma composición sobre una cuadrícula de suelo en perspectiva. Los controles, el estado y el detalle viven dentro del marco del escenario como HTML nítido y accesible, nunca pintados en WebGL. La consola mantiene las 25 tecnologías y seis categorías aprobadas (las referencias no cambian el contenido), hereda el tema del sitio y ofrece acceso visible a la lista. Se exponen solo acciones ya operativas.

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

El sistema deberá permitir filtrar las cartas del canvas mediante una sola categoría activa o la opción «Todas». Las cartas de otras categorías permanecerán visibles, atenuadas y no seleccionables.

**Criterios de aceptación (EARS):**

- Cuando se entre en Stack, el filtro activo será «Todas» y todas las cartas tendrán la misma prominencia.
- Cuando se active una categoría, las cartas que pertenezcan a ella conservarán su prominencia y las demás quedarán visiblemente atenuadas.
- Mientras una categoría esté activa, las cartas atenuadas no podrán seleccionarse ni moverse al casillero mediante ratón, teclado o interacción táctil.
- Cuando se active «Todas», todas las cartas volverán a ser seleccionables.
- Los filtros se mostrarán como botones de icono; cada uno conservará un nombre accesible localizado y el filtro activo tendrá una etiqueta visible.
- Cuando se cambie la categoría activa, las cartas conservarán sus posiciones y la descripción seleccionada no cambiará.
- Cuando se use teclado o tecnología de asistencia, los filtros tendrán nombres accesibles y el filtro activo se podrá identificar.
- Las cartas atenuadas seguirán siendo legibles y distinguibles en ambos temas.
- El filtro tendrá el mismo comportamiento en 2D y en 3D y se conservará al alternar entre modos.
- Los controles de filtro solo se mostrarán mientras el canvas esté visible. En cualquier vista de lista, todas las tecnologías estarán habilitadas; al volver al canvas, se restaurará el filtro que estaba activo.

### RF-3 — Selección de tecnología y descripción

El sistema deberá permitir seleccionar una tecnología y mostrar en el casillero central una descripción bilingüe de la propia tecnología: qué es y para qué sirve. Solo habrá una tecnología seleccionada a la vez.

**Criterios de aceptación (EARS):**

- Cuando se entre sin una selección, el casillero estará vacío de detalle y mostrará una instrucción breve para elegir una carta; no se preseleccionará ninguna tecnología. La instrucción mencionará el arrastre cuando esté disponible.
- Cuando se seleccione una carta habilitada, el casillero mostrará la descripción de esa tecnología.
- Cuando se seleccione otra carta habilitada, el casillero reemplazará la descripción anterior por la nueva.
- Cuando la escena esté disponible, el detalle aparecerá dentro del marco visual de la escena; en la lista plana seguirá disponible fuera de la escena.
- Cuando se muestre una descripción, el nombre y el texto corresponderán a la misma tecnología y al idioma activo.
- Cada descripción tendrá dos frases breves: la primera explicará qué es la tecnología y la segunda concretará capacidades o propósitos distintivos, sin atribuir usos a Pedro.
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
- En perspectiva, el cuerpo completo de cada carta permanecerá por encima del plano del suelo, también al moverla al borde inferior del canvas en un viewport móvil.
- En reposo, las cartas se desplazarán lentamente y de forma acotada; las colisiones producirán separación perceptible, sin vibración, aceleraciones bruscas ni ocultación completa.
- Con movimiento reducido, las cartas quedarán quietas hasta una interacción directa; la respuesta a un arrastre seguirá disponible y será inmediata.
- Mientras una carta esté atenuada por el filtro, no se podrá arrastrar ni seleccionar.
- Cuando se use teclado o pantalla táctil, se podrá seleccionar una carta sin arrastrarla.
- Cuando se arrastre una carta, no se rotará la escena.
- Los trazados de categoría conectarán los bordes de las cartas, respetarán su profundidad y seguirán el movimiento de las cartas sin quedar flotando por detrás.
- Al pasar un puntero compatible sobre una carta habilitada, su superficie se invertirá y el cursor indicará que puede agarrarse; las cartas inactivas no darán una señal de acción. El foco de los controles HTML tendrá una respuesta equivalente.
- Durante un arrastre, las cartas vecinas conservarán el desplazamiento recibido, sin volver a su posición anterior en cada evento ni saltar al soltar. Los movimientos rápidos se resolverán por pasos acotados para no atravesar cartas intermedias. La carta agarrada seguirá el puntero mientras los límites y el casillero lo permitan.
- Cuando una carta empuje a otra, la carta desplazada continuará deslizándose un tramo corto en la misma dirección y frenará suavemente; el impulso y la distancia quedan acotados, sin rebotes ni deriva larga. La carta agarrada seguirá fija bajo el puntero.
- Con `prefers-reduced-motion`, el empuje y la separación por colisión serán inmediatos, sin deslizamiento posterior ni movimiento ambiental.
- La consola separará filtros y acciones en grupos legibles. En escritorio, el detalle ocupará un inspector lateral integrado en el marco; en tamaños estrechos será un panel compacto persistente al recorrer el canvas, sin quedar al final del dibujo ni exigir scroll para consultar una selección.
- En escritorio, con el canvas visible las acciones se alinearán con la fila de filtros; en la vista de lista los controles de vista quedarán alineados al borde derecho de la barra. En viewports estrechos los grupos se reorganizarán sin desbordamiento ni cambios en el orden de lectura.
- En teléfonos, la lista y el cambio de vista tendrán etiquetas visibles junto a sus iconos. El canvas ajustará su altura al espacio vertical disponible sin quitar cartas, y el inspector colocará la expulsión junto al nombre. El inspector permanecerá pegado al borde superior del viewport; dejará espacio para la navbar cuando esté visible y subirá al borde cuando esta se oculte.

### RF-4a — Casillero: recepción, estado ocupado y expulsión

El casillero central deberá comunicar cuándo acepta una carta, mostrar la tecnología seleccionada y permitir devolverla al escenario mediante una acción explícita.

**Criterios de aceptación (EARS):**

- Cuando una carta habilitada entre en la zona de recepción, el casillero mostrará un hover claramente perceptible; al salir de la zona volverá al estado normal.
- Mientras se mantenga agarrada una carta sobre la zona de recepción, seguirá al puntero sin que el movimiento ambiental la empuje fuera del casillero entre fotogramas.
- Cuando se suelte una carta habilitada en el casillero, este confirmará la recepción con feedback visual breve, mostrará su marca, nombre y descripción, y expondrá un botón accesible para expulsarla.
- Mientras una carta esté alojada, no quedará una copia interactiva de esa carta en la escena: el casillero será su ubicación visible y única.
- Cuando se active «Expulsar» con ratón, teclado o tacto, la carta volverá al escenario en una posición libre, visible, dentro de límites y que no se solape por completo con otra carta ni con el casillero.
- Con movimiento normal, la expulsión usará una curva ease-in-out fluida para animar la salida de la carta desde el casillero hasta su posición libre en el canvas; con `prefers-reduced-motion`, la colocará sin transición.
- Cuando se seleccione otra tecnología mediante la lista accesible, la nueva pasará a ocupar el casillero y la anterior volverá a una posición libre visible; el cambio nunca crea duplicados ni cartas ocultas.
- Al expulsar, el casillero volverá a su estado vacío y la descripción dejará de presentarse como selección activa.
- Cuando se suelte una segunda carta habilitada sobre el casillero ocupado, la anterior volverá a una posición libre y visible, la nueva pasará al casillero y el feedback confirmará el reemplazo.
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
- El zoom permitirá niveles del 50 % al 150 %, en pasos de 5 y con un inicio del 100 %; al alejarse al mínimo se podrá ver de nuevo la composición completa.
- Al acercarse por encima del encuadre completo, se podrán recortar cartas periféricas; el zoom hacia fuera y la lista accesible seguirán permitiendo explorarlas.
- Cuando se use movimiento reducido, el zoom explícito seguirá funcionando sin animación añadida.
- Los controles de zoom tendrán nombres accesibles y se podrán utilizar con teclado.
- Los controles de zoom serán botones de icono dentro del marco visual de la escena, con nombres accesibles localizados.
- Al accionar el zoom, la cámara llegará al nuevo nivel con una transición suave e interrumpible; con movimiento reducido aplicará el nivel sin transición.

### RF-7 — Rotación en 3D

El sistema deberá permitir rotar la escena horizontal y verticalmente arrastrando el fondo, con controles de rotación accesibles mediante teclado y pantalla táctil.

**Criterios de aceptación (EARS):**

- Cuando se arrastre el fondo de la escena 3D, la escena rotará en dirección horizontal o vertical según el movimiento del puntero.
- La rotación horizontal permitirá completar vueltas de 360° sin detenerse; al completar una vuelta, la orientación volverá al mismo ángulo.
- La inclinación vertical permanecerá dentro de límites explorables.
- Cuando se arrastre una carta, se moverá la carta y no se rotará la escena.
- Cuando se use un control de rotación, la escena rotará en la dirección indicada sin requerir arrastrar.
- Cuando se alcance un límite de inclinación vertical, las acciones posteriores no dejarán la escena en una orientación que impida explorar las cartas.
- Cuando se solicite movimiento reducido, la rotación causada directamente por la persona seguirá disponible y no se añadirá movimiento autónomo.
- Los controles de rotación tendrán nombres accesibles y se podrán utilizar con teclado y pantalla táctil.
- Los controles de rotación serán botones de icono dentro del marco visual de la escena, con nombres accesibles localizados.
- La rotación iniciada desde los botones tendrá una transición suave e interrumpible; el arrastre del fondo seguirá la entrada directamente y movimiento reducido aplica los botones sin transición.

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
- En cualquier vista de lista —al abrirla o al recurrir al fallback sin WebGL— no se mostrarán los controles de filtro. Todas las tecnologías estarán habilitadas y seleccionables, y el filtro anterior se restaurará al volver al canvas.
- Cuando se muestre la lista plana de fallback, no aparecerán controles de modo, zoom o rotación que no puedan funcionar.
- La lista plana mantendrá el orden editorial de categorías y tecnologías y la prioridad visual de React y TypeScript.
- Al abrir la lista o faltar WebGL, las tecnologías se mostrarán como cartas compactas y seleccionables, agrupadas por categoría dentro del marco de Stack. La selección mostrará la descripción en el inspector, que permanecerá a mano al recorrer las cartas. Sin JavaScript, las descripciones se mostrarán en las propias cartas.
- La lista se reorganizará según el ancho disponible y tendrá entrada escalonada y transiciones de interacción solo cuando se permita el movimiento. En esta vista, las marcas de C# y Playwright tendrán acabados planos monocromos sin alterar las del canvas.

## Requisitos no funcionales

- Todo texto visible —incluidos filtros, controles, nombres accesibles y descripciones— estará disponible en inglés y castellano.
- La presentación conservará contraste AA en los temas claro y oscuro, incluso para las cartas atenuadas.
- Toda la información deberá poder consultarse con teclado y tecnología de asistencia; la selección no dependerá exclusivamente del arrastre.
- La presentación se adaptará a móvil y escritorio, sin recortar cartas, nombres, controles ni descripciones.
- La escena y sus controles se refluye sin desbordamiento horizontal entre 320 px y 3840 px; los objetivos táctiles tendrán al menos 44 px.
- El canvas seguirá el tamaño CSS y la densidad de píxel del dispositivo, con un límite de memoria del búfer; el texto de los controles y el detalle no se rasterizará. Las texturas de las cartas mantendrán definición al acercar.
- La escena 3D tendrá profundidad legible en todas sus piezas: cartas extruidas con cantos, marcas legibles, casillero, y un escenario con planos/materiales, iluminación y sombras consistentes. No se mezclarán objetos planos flotando sobre elementos volumétricos como si fueran escenas distintas.
- La dirección 3D será una feature única y coherente: paleta editorial, escala, perspectiva, iluminación, materiales, profundidad y respuesta física compartirán reglas visuales. El impacto vendrá del volumen, la composición y el movimiento, no de adornos, colores aleatorios, partículas o efectos ajenos al sistema.
- El movimiento ambiental será pausado y de baja amplitud, se detendrá cuando la escena no esté visible o la pestaña no esté activa y no consumirá un bucle continuo si no es necesario; `prefers-reduced-motion` desactivará el movimiento ambiental.
- Con movimiento reducido, sin JavaScript o sin WebGL, el contenido permanecerá visible y legible.
- La interacción no impedirá el desplazamiento de la página ni bloqueará la lectura.
- La voz será breve, afirmativa y centrada en qué es cada tecnología. No se inventarán cifras, usos ni afirmaciones profesionales.
- La escena no consumirá recursos de forma continua cuando no haya cambios visuales; el movimiento ambiental, si está activo, usará un ciclo acotado y se pausará fuera de vista o con la pestaña inactiva.
- Las transiciones de cámara reutilizarán el ciclo de render existente, se detendrán al alcanzar el objetivo y no saltarán al encadenar controles. La entrada del detalle no recortará nombre, marca, descripción ni feedback al recibir una carta.
- El movimiento ambiental visible apuntará a 60 fps cuando la pestaña y la escena estén activas; los arrastres responderán directamente y actualizarán los trazados en el mismo movimiento.
- La inercia breve de una carta empujada se integra en el ciclo existente, se desacelera y se pausa fuera de vista; movimiento reducido elimina la continuación y conserva la respuesta directa.
- Los bloques de Stack respetarán el comportamiento general de entrada y salida con el scroll. Con movimiento reducido o sin soporte de la animación por scroll, todos permanecerán visibles.

## Casos límite

- Si una carta se suelta fuera del casillero, pero dentro del canvas, conservará su posición sin cambiar la descripción activa.
- Si se intenta llevar una carta atenuada al casillero, no se seleccionará ni moverá.
- Si se cambia de filtro mientras hay una descripción activa, la descripción se conserva aunque su carta quede atenuada.
- Si una carta se suelta más allá de los límites del canvas, no podrá quedar fuera del área visible.
- Si una carta entra en el casillero, el detalle podrá aparecer con una transición breve, pero todo su contenido seguirá visible y sin recortes durante y después de la entrada.
- Si varias cartas se acercan o solapan, podrán tocarse parcialmente, pero se repelerán y ninguna ocultará totalmente a otra.
- Si se recibe una carta con el casillero ocupado, la anterior vuelve al escenario en una posición libre y la nueva queda como única ocupante.
- Si el arrastre empuja una carta vecina, esta avanzará brevemente por inercia y se detendrá dentro de un recorrido limitado; empujes repetidos no acumularán una deriva excesiva.
- Si se usa arrastre sobre una carta en modo 3D, se moverá la carta; si se arrastra el fondo, rotará la escena.
- Si se mueve una carta conectada, su trazado se actualizará con ella y terminará en el borde de la carta; ninguna línea de categoría se dibujará como una capa de fondo detrás de la escena.
- Si se intenta superar los límites de zoom o de inclinación vertical, la escena permanecerá dentro de límites explorables; la rotación horizontal continuará y envolverá cada 360°.
- Si el navegador no admite 3D, no se mostrará el switch; el modo 2D seguirá disponible.
- Si el navegador no admite WebGL, se mostrará la lista plana.
- Si se solicita movimiento reducido, el cambio de modo será instantáneo y no habrá movimiento autónomo; los controles directos de zoom y rotación seguirán funcionando.
- Si se solicitan zooms o giros consecutivos desde los controles, la cámara continuará desde su posición visual actual hacia el último objetivo; con movimiento reducido cada acción será instantánea.
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
- En la escena activa, todos los controles —filtro, vista, lista, zoom y rotación— aparecen dentro de su marco como iconos con nombres accesibles; el detalle de la tecnología también queda dentro del marco.
- En viewports de 320 px, 390 px, 768 px, 1920 px y 3840 px no hay desbordamiento horizontal ni se pierden controles, detalle o cartas; la resolución del canvas se adapta a CSS size y device pixel ratio.
- Los trazados se adhieren a los bordes de las cartas, respetan profundidad y siguen las cartas durante el arrastre y el movimiento ambiental.
- En 3D funcionan el zoom de 50–150 % y la rotación horizontal completa de 360° más la inclinación vertical acotada, mediante ratón y controles accesibles.
- Movimiento reducido, ausencia de JavaScript y ausencia de WebGL dejan el contenido completo visible como lista plana o modo 2D.
- Antes del cierre de Stack se verifican ambos idiomas, ambos temas, teclado, pantallas táctiles y adaptación a viewport. Las comprobaciones nativas con Safari y lectores de pantalla reales —VoiceOver/Safari y NVDA/Firefox— se reservan para la fase transversal 12 del roadmap, posterior a las specs 01–11.
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
- Mensaje del usuario: «APRUEBO EL CONTENT-REVIEW». Quedaron aprobados las etiquetas y la instrucción inicial de `docs/specs/09-stack/content-review.md`. El usuario aprobó explícitamente las 25 descripciones ampliadas EN/ES el 2026-11-26 («Sí, aprobadas»); queda registrada esa aprobación posterior a la incorporación del contenido.
- El usuario aprobó la revisión visual manual el 2026-11-26 («La revision visual manual queda aprobada»). Esta aprobación no sustituye las pruebas con tecnología de asistencia ni con navegadores nativos, que se realizarán en la fase transversal 12 del roadmap.
- Al solicitar el cierre de Stack, el usuario confirmó la aprobación pendiente del movimiento ambiental pausado, las colisiones, la pausa fuera de vista y el comportamiento con movimiento reducido.
