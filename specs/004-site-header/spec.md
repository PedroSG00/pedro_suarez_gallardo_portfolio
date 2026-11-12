# 004 — Cabecera y destinos

- **Estado:** Borrador para revisión
- **Fecha:** 12 de noviembre de 2026
- **Alcance:** cabecera del sitio, destinos de navegación y forma definitiva de los controles de tema e idioma
- **Depende de:** 003 (base consolidada)
- **Bloquea a:** 005 (portada y proyectos), que compone sobre estas anclas

> **Nota de trazabilidad.** Esta spec construye la cabecera y los destinos que la 003 deja pendientes. La 003 corrige los diccionarios, las preferencias, el enrutado, el tema y la pantalla de error; aquí se decide dónde viven la marca, la navegación y los controles, y cómo se comportan. La composición editorial y el contenido de las secciones se abordan en la 005. La 004 no se publica sola: hasta que exista la 005, las secciones de la portada tienen titular y ancla, pero no contenido.

## 1. Contexto y objetivo

Después de la 003 la base funciona, pero el sitio no tiene cabecera. Los controles de tema e idioma viven sueltos en la composición de cada página, no hay un lugar estable para la marca ni para los destinos, y las secciones del inicio todavía no existen. Eso obliga a colocar los controles dos veces —una ahora y otra cuando lleguen las secciones— y deja al visitante sin orientación fuera de la portada.

El objetivo es **dar al sitio una cabecera estable y una navegación comprensible**: marca, destinos, idioma y tema en un orden único, un destino activo perceptible, un comportamiento contenido al hacer scroll y una forma de control que funcione con ratón, teclado, lector de pantalla y sin JavaScript.

Esta funcionalidad **no compone la portada ni escribe contenido**. Crea las secciones del inicio con su titular y su ancla, y deja el resto a la 005.

## 2. Usuarios

- **Reclutador (usuario principal).** Revisa el sitio con prisa, en escritorio o móvil, y necesita saber en todo momento quién es Pedro, en qué idioma está y cómo moverse.
- **Visitante que ya conoce el sitio.** Espera encontrar los mismos destinos y que su idioma y su tema se conserven.
- **Visitante que usa teclado, lector de pantalla, zoom o movimiento reducido.** Necesita controles comprensibles, foco visible, contraste suficiente y ausencia de animaciones molestas.
- **Visitante con JavaScript desactivado o bloqueado.** Necesita navegar y cambiar de idioma sin depender del script.
- **Pedro, mantenedor del sitio.** Necesita añadir o quitar un destino sin tocar la cabecera y sin duplicar etiquetas.

## 3. Historias de usuario

- **HU-1.** Como visitante, quiero una cabecera siempre disponible con la marca y los destinos, para orientarme y moverme sin buscar.
- **HU-2.** Como visitante, quiero cambiar de idioma y de tema desde la cabecera, para ajustar el sitio sin salir de la página.
- **HU-3.** Como visitante que usa teclado o lector de pantalla, quiero entender y operar la cabecera sin ambigüedad, para navegar con autonomía.
- **HU-4.** Como visitante con sensibilidad al movimiento, quiero que la cabecera respete mi preferencia, para evitar molestias.
- **HU-5.** Como visitante sin JavaScript, quiero navegar y cambiar de idioma, para no quedarme fuera.
- **HU-6.** Como visitante que recorre la portada, quiero saber en qué sección estoy, para no perder la orientación.
- **HU-7.** Como Pedro, quiero que la navegación se alimente de una lista de destinos, para añadir secciones sin reescribir la cabecera.

## 4. Requisitos funcionales

### RF-1 — Cabecera con marca, destinos y controles

- Criterios de aceptación (EARS, en español):
  - **El sistema deberá** mostrar la cabecera en el inicio y en el listado de proyectos, y en el detalle de cada proyecto cuando esa página exista, pero no en la pantalla de página no encontrada.
  - **El sistema deberá** incluir en la cabecera, en este orden visual y de lectura: la marca, la navegación, el control de idioma y el control de tema.
  - **El sistema deberá** mostrar como marca el nombre completo de Pedro, enlazado al inicio en el idioma activo.
  - **El sistema deberá** ofrecer los destinos Inicio, Experiencia, Proyectos, Stack y Contacto, cada uno en el idioma activo y con su etiqueta traducida.
  - **El sistema deberá** mantener «Stack» igual en los dos idiomas, por ser el término que se usa en ambos.
  - **El sistema deberá** ofrecer Experiencia, Proyectos, Stack y Contacto como secciones del inicio, y mantener el listado de proyectos como página propia a la que se llega desde esa sección.
  - **El sistema deberá** entregar a la navegación su lista de destinos como dato, de modo que añadir o quitar un destino no obligue a cambiar la cabecera.
  - **El sistema deberá** identificar la cabecera y la navegación con semántica y nombres accesibles, de modo que se puedan recorrer como regiones.
  - **El sistema deberá** mantener la cabecera con un fondo opaco del tema activo, de modo que el contenido no se lea por debajo.

### RF-2 — Navegación en pantallas estrechas

- Criterios de aceptación (EARS, en español):
  - **Cuando** el ancho disponible sea inferior a 1024 px, **el sistema deberá** mostrar la marca y los controles en la primera fila y agrupar la navegación en un desplegable que se abre y se cierra con ratón y teclado.
  - **El sistema deberá** mostrar en el disparador del desplegable una etiqueta comprensible en el idioma activo.
  - **El sistema deberá** permitir usar el desplegable de navegación sin JavaScript, y cerrarlo al elegir un destino, al pulsar Escape y al hacer clic fuera cuando JavaScript esté disponible.
  - **El sistema no deberá** empujar ni tapar la marca al abrir el desplegable, ni provocar desplazamiento horizontal a 320 px.
  - **El sistema deberá** mantener visibles y operativos el control de idioma y el de tema con el desplegable abierto o cerrado.

### RF-3 — Destinos de sección: ancla, titular y foco

- Criterios de aceptación (EARS, en español):
  - **El sistema deberá** crear en el inicio las secciones Experiencia, Proyectos, Stack y Contacto, cada una con su titular, su identificador y una extensión suficiente para que la navegación tenga destino.
  - **El sistema deberá** mantener el orden de las secciones del menú igual al orden de la portada.
  - **Cuando** el visitante elija un destino que lleve a una sección, **el sistema deberá** dejar el titular de esa sección justo debajo de la cabecera, sin quedar oculto por ella.
  - **Cuando** el visitante elija un destino que lleve a una sección, **el sistema deberá** trasladar el foco al titular, de modo que la lectura continúe en la sección elegida.
  - **Si** JavaScript no está disponible, **entonces el sistema deberá** mantener el ancla funcional y continuar la lectura en la sección elegida.
  - **El sistema deberá** mantener el titular de la sección visible y enfocable con el teclado sin añadir un control a la interfaz.

### RF-4 — Cabecera que se retira al bajar y vuelve al subir

- Criterios de aceptación (EARS, en español):
  - **Mientras** el visitante esté al principio de la página, **el sistema deberá** mantener la cabecera visible.
  - **Cuando** el visitante se haya desplazado más de 64 px desde el principio y siga bajando, **el sistema deberá** retirar la cabecera con una transición de entre 150 y 300 ms.
  - **Cuando** el visitante suba, aunque sea poco, **el sistema deberá** mostrar la cabecera de nuevo con la misma transición.
  - **El sistema no deberá** retirar la cabecera mientras el foco de teclado esté dentro de ella, mientras su desplegable de navegación esté abierto o mientras el desplegable de idioma esté abierto.
  - **El sistema no deberá** provocar desplazamiento, salto ni cambio de tamaño del contenido al retirar o mostrar la cabecera.
  - **Si** JavaScript no está disponible, **entonces el sistema deberá** mantener la cabecera en su posición sin retirarla.
  - **Si** el visitante prefiere movimiento reducido, **entonces el sistema deberá** mantener la cabecera visible sin retirarla en ningún momento.

### RF-5 — Destino activo perceptible

- Criterios de aceptación (EARS, en español):
  - **El sistema deberá** indicar el destino activo con un recurso no cromático, además del color.
  - **Mientras** el visitante recorra el inicio, **el sistema deberá** marcar como ubicación actual la sección visible, anunciarlo así a la tecnología asistiva y marcar Inicio cuando esté en el principio de la página.
  - **Si** JavaScript no está disponible, **entonces el sistema deberá** marcar Inicio como destino actual en el inicio, sin seguimiento de sección.
  - **Cuando** el visitante esté en el listado de proyectos o en el detalle de un proyecto, **el sistema deberá** anunciar y marcar Proyectos como la página actual.
  - **La marca no deberá** depender del tamaño, de la posición ni del movimiento para ser perceptible.

### RF-6 — Control de tema de tres estados

- Criterios de aceptación (EARS, en español):
  - **El sistema deberá** ofrecer en la cabecera, desde la carga inicial y sin interacción previa, un control de tema visible y operativo.
  - **El sistema deberá** resolver el control con un único botón que, en cada pulsación, avance en el ciclo claro, oscuro, sistema y de nuevo claro.
  - **El sistema deberá** mostrar en el texto visible del botón el estado activo, con las palabras «claro», «oscuro» o «sistema» en el idioma activo.
  - **El sistema deberá** comunicar en el nombre accesible el estado activo y la acción disponible, de modo que no dependa de un icono ni de una abreviatura.
  - **El sistema deberá** mostrar el estado activo correcto ya en el primer pintado, sin cambiar de etiqueta después de cargar.
  - **Cuando** la opción activa sea sistema, **el sistema deberá** seguir en tiempo real la preferencia del sistema operativo.
  - **El sistema deberá** permitir operar el control con ratón, teclado y lector de pantalla, con foco visible.
  - **El sistema deberá** mantener el control visible y operativo durante toda la visita y tras recargar la página.
  - **El sistema deberá** mantener el control operativo y sin cambios visibles cuando el almacenamiento del navegador no esté disponible.

### RF-7 — Control de idioma

- Criterios de aceptación (EARS, en español):
  - **El sistema deberá** ofrecer en la cabecera un control de idioma que, al abrirse, muestre los idiomas soportados y marque el activo de forma perceptible y no solo cromática.
  - **El sistema deberá** mostrar en el disparador del control el nombre del idioma activo.
  - **El sistema deberá** ofrecer cada idioma como un enlace nativo que funcione sin JavaScript.
  - **El sistema deberá** permitir abrir y cerrar el control con ratón, teclado y lector de pantalla, y cerrarlo al elegir un idioma, al pulsar Escape y al hacer clic fuera cuando JavaScript esté disponible.
  - **Cuando** el visitante elija un idioma, **el sistema deberá** llevar cada enlace a la misma página en ese idioma, conservando la ruta equivalente, los parámetros de consulta y el fragmento, y recordar la preferencia, según lo establecido en la 003.
  - **El sistema deberá** mantener visible y operativo el resto de la cabecera mientras el control de idioma está abierto, y no retirar la cabecera en ese estado.
  - **El sistema no deberá** cambiar de idioma ni modificar la preferencia por el mero hecho de abrir o cerrar el control.

### RF-8 — Textos y accesibilidad de la cabecera

- Criterios de aceptación (EARS, en español):
  - **El sistema deberá** recibir todos los textos de la cabecera como datos, sin escribir etiquetas visibles ni nombres accesibles dentro de los componentes.
  - **El sistema deberá** mantener la cabecera legible y completa a 320 px de ancho y con zoom de página y de texto al 200 %, sin desplazamiento horizontal ni etiquetas recortadas.
  - **El sistema deberá** mantener el foco visible en todos los controles y destinos, con el contraste definido en la 003, y sin que la cabecera lo tape.
  - **El sistema deberá** ofrecer objetivos interactivos de al menos 24 por 24 píxeles en todos sus controles y destinos.
  - **El sistema deberá** mantener el contraste mínimo de AA en todos sus pares de color, en los dos temas.
  - **El sistema deberá** distinguir el destino activo, el foco y los estados de apertura sin depender únicamente del color.
  - **Cuando** el visitante amplíe el espaciado del texto, **el sistema deberá** permitir que las etiquetas ocupen varias líneas sin recortarse ni superponerse.

## 5. Requisitos no funcionales

- **RNF-1 — Calidad en verde.** Lint, comprobación de tipos, pruebas unitarias y de componentes, pruebas end-to-end y build deberán pasar antes de dar la funcionalidad por terminada.
- **RNF-2 — Sin dependencias nuevas.** La cabecera se construirá con lo ya disponible; no se añadirán librerías de menús, animación ni utilidades de foco.
- **RNF-3 — SEO.** La cabecera no añadirá títulos, descripciones ni direcciones nuevas: usa los que ya declara cada página según la 003.
- **RNF-4 — Rendimiento y estabilidad visual.** La cabecera no producirá destello, salto de contenido ni desplazamiento por carga de tipografía; el HTML inicial será suficiente para verla y usarla.
- **RNF-5 — Accesibilidad WCAG 2.2 AA.** Se mantienen los criterios de la 003 y se aplican a la cabecera: texto normal 4,5:1, interfaz 3:1, foco no oculto, reflow a 320 px, zoom al 200 % y respeto a `prefers-reduced-motion`.
- **RNF-6 — Compatibilidad.** El sitio funcionará en las dos últimas versiones de Chrome, Firefox, Safari y Edge, en escritorio y móvil. Las pruebas end-to-end cubrirán esos cuatro navegadores.
- **RNF-7 — Privacidad.** La cabecera no enviará datos a terceros ni añadirá seguimiento; solo escribe la preferencia de idioma y la de tema, cada una en su única fuente, según la 003.
- **RNF-8 — Mantenibilidad.** Marca, navegación, idioma y tema serán piezas separadas, con props tipadas y sin textos propios; añadir un destino será añadir un dato.
- **RNF-9 — Contenido bilingüe.** Todo texto visible y todo nombre accesible de la cabecera existirá en inglés y castellano.
- **RNF-10 — Disciplina de alcance.** Esta funcionalidad no compondrá la portada, no escribirá contenido del currículum y no añadirá páginas nuevas.

## 6. Casos límite

1. **Primera visita con el tema del sistema en oscuro:** la cabecera aparece oscura y el botón muestra «oscuro» desde el primer pintado, sin destello.
2. **Recarga con un tema ya elegido:** el botón muestra el estado efectivo y la cabecera no cambia de etiqueta tras cargar.
3. **Tema cambiado en otra pestaña:** la cabecera de esta pestaña actualiza su etiqueta sin recargar y sin mover el foco.
4. **Almacenamiento bloqueado:** el botón sigue operativo y la etiqueta cambia durante la visita, sin errores visibles.
5. **JavaScript desactivado:** la cabecera permanece visible, la navegación por anclas funciona y los enlaces de idioma llevan a la página equivalente.
6. **Movimiento reducido:** la cabecera no se retira y el cambio de tema es instantáneo.
7. **Movimiento reducido activado después de cargar:** la cabecera deja de retirarse en el momento, sin recargar.
8. **Foco de teclado dentro de la cabecera mientras se hace scroll:** la cabecera no se retira.
9. **Desplegable de navegación o de idioma abierto mientras se hace scroll:** la cabecera no se retira.
10. **Scroll de ida y vuelta rápido:** la cabecera no parpadea ni salta; se aplica el último sentido con un umbral corto.
11. **Cambio de ancho de ventana con el desplegable abierto:** al pasar a escritorio el desplegable deja de mostrarse y la navegación vuelve a su forma ancha, sin recargar.
12. **Salto a una sección con la cabecera visible:** el titular queda debajo de la cabecera y recibe el foco.
13. **Salto a una sección desde otra página:** el navegador carga el inicio y continúa en la sección con el titular visible.
14. **Etiqueta de destino muy larga o traducción más extensa:** ocupa varias líneas sin recortarse ni desbordar a 320 px.
15. **Idioma activo con nombre largo:** el disparador del control de idioma no empuja la marca ni desborda la fila.
16. **320 px con zoom de texto al 200 %:** marca, controles y navegación se reordenan sin desplazamiento horizontal ni contenido tapado.
17. **Colores forzados de alto contraste:** la cabecera mantiene bordes, estados y foco visibles.
18. **Enlace directo a otro idioma:** la cabecera muestra ese idioma y no sobrescribe la preferencia guardada.
19. **Dos pestañas en idiomas distintos:** cada cabecera muestra el idioma de su URL.
20. **Listado y detalle de proyecto:** Proyectos aparece marcado como página actual en ambos.
21. **Inicio recién cargado sin scroll:** Inicio aparece marcado como destino actual y ninguna sección se anuncia como ubicación actual.
22. **Página no encontrada:** no se muestra la cabecera.
23. **Apertura del desplegable con lector de pantalla:** el estado de apertura se anuncia y el foco no queda atrapado fuera de la cabecera.

## 7. Fuera de alcance

- La composición editorial de la portada y de las secciones, y el contenido del currículum: se abordan en la 005.
- El listado de proyectos más allá de su cabecera y de su dirección, y el detalle de cada proyecto.
- La pantalla de página no encontrada, el enrutado y las preferencias: ya están en la 003.
- Pie de página, estados de carga y estados vacíos.
- Buscador, blog, formularios, CMS, analítica, RSS, PWA y cualquier funcionalidad de producto nueva.
- Rediseño de la identidad visual: nueva paleta, nuevas fuentes, iconografía, ilustraciones o imágenes.
- Menús anidados, submenús, migas de pan y barras de progreso de lectura.
- Cambiar el framework, el enrutador, el gestor de paquetes o la estrategia de renderizado.
- Impresión, exportación a PDF, modo sin conexión y aplicaciones nativas.
- Despliegue, infraestructura y flujos de integración continua.

## 8. Criterios de finalización

La funcionalidad se considerará terminada cuando:

- [ ] La cabecera aparece en inicio y listado de proyectos, y en el detalle cuando exista, pero no en la pantalla de error.
- [ ] La cabecera contiene marca, navegación, idioma y tema en ese orden, y la navegación se alimenta de una lista de destinos.
- [ ] La marca es el nombre completo y enlaza al inicio en el idioma activo.
- [ ] Existen los cinco destinos, con sus etiquetas en ambos idiomas y «Stack» idéntico en los dos.
- [ ] Las cuatro secciones del inicio existen con titular, ancla y foco, y el titular queda debajo de la cabecera al saltar.
- [ ] En pantallas estrechas la navegación se agrupa en un desplegable que funciona con teclado y sin JavaScript, y la marca y los controles quedan en la primera fila.
- [ ] La cabecera se retira al bajar y vuelve al subir, nunca con el foco dentro ni con un desplegable abierto, y no provoca saltos de contenido.
- [ ] Sin JavaScript o con movimiento reducido, la cabecera permanece visible.
- [ ] El destino activo se marca sin depender del color y se anuncia como página actual o ubicación actual.
- [ ] El control de tema es un único botón que cicla claro, oscuro y sistema, muestra el estado activo desde el primer pintado y anuncia la acción.
- [ ] El control de idioma es un desplegable de enlaces que muestra el idioma activo, funciona sin JavaScript y lleva a la misma página con la misma ruta, consulta y fragmento.
- [ ] Ningún componente de la cabecera contiene textos propios: todo llega como dato.
- [ ] La cabecera no produce desplazamiento horizontal a 320 px ni con zoom de texto al 200 %, y mantiene el foco visible y no oculto.
- [ ] Cada requisito funcional tiene al menos una prueba asociada, escrita antes del código; los flujos de cabecera, navegación, tema e idioma se prueban end-to-end en los cuatro navegadores.
- [ ] Lint, comprobación de tipos, pruebas, pruebas end-to-end y build pasan sin dependencias nuevas.

## 9. Decisiones cerradas

- **Reparto con 003 y 005.** La 003 corrige la base; esta funcionalidad construye la cabecera, los destinos y la forma de los controles; la 005 compone y rellena las secciones. Se descarta mantener la cabecera dentro del refactor porque mezclaba corrección y funcionalidad en una entrega imposible de revisar por separado.
- **Orden de la cabecera.** Marca, navegación, idioma y tema. Se descarta colocar los controles antes de la navegación porque rompe la lectura de identidad → destinos → preferencias.
- **Marca.** Nombre completo enlazado al inicio del idioma activo. Se descarta el alias corto porque el nombre completo es el dato que un reclutador necesita retener.
- **Destinos.** Inicio, Experiencia, Proyectos, Stack y Contacto. Experiencia, Proyectos, Stack y Contacto son secciones del inicio, y Proyectos tiene además su listado como página.
- **Navegación en pantallas estrechas.** Se agrupa en un desplegable nativo; la marca y los controles quedan en la primera fila. Se descarta un menú lateral con captura de foco porque añade superficie de error y no aporta al alcance.
- **Ocultación al bajar.** La cabecera se retira por transformación y permanece en el flujo, con un umbral corto y guardas de foco y de desplegable abierto. Sin JavaScript o con movimiento reducido, permanece visible.
- **Destino activo.** Proyectos se anuncia como página actual; en el inicio se marca la sección visible como ubicación actual y, sin JavaScript, Inicio. El indicador no es solo cromático.
- **Control de tema.** Un único botón que cicla tres estados, con el estado visible en el texto y la acción en el nombre accesible, resuelto ya en el primer pintado. Se descarta un desplegable, iconos y abreviaturas.
- **Control de idioma.** Desplegable de enlaces nativos que muestra el idioma activo y funciona sin JavaScript. La navegación equivalente y la preferencia se definen en la 003.
- **Secciones.** Aquí existen con titular, ancla y foco; la composición y el contenido llegan en la 005.
- **Accesibilidad.** La cabecera hereda los criterios de la 003 y añade los propios: foco no oculto, objetivos de 24 px, etiquetas que pueden ocupar varias líneas y estados no cromáticos.
