# 003 — Consolidación de la base

- **Estado:** Borrador para revisión
- **Fecha:** 12 de noviembre de 2026
- **Alcance:** corrección de la deuda de 001 y 002, sin funcionalidad nueva salvo la pantalla de error
- **Depende de:** 001 (estilos globales) y 002 (i18n), corregidas solo en los puntos anotados
- **Bloquea a:** 004 (cabecera y destinos) y 005 (portada y proyectos)

> **Nota de trazabilidad.** Esta spec recoge únicamente el refactor. La cabecera, los destinos y la forma de los controles de tema e idioma se especifican en la 004; la composición editorial y el contenido, en la 005. La 003 no se publica por separado: corrige la base sobre la que se construyen las dos siguientes y, hasta la 005, el sitio no cumple la regla de un momento visual deliberado por página. La única excepción es el código de la pantalla de error, que se compone a escala display porque la pantalla se construye aquí.

## 1. Contexto y objetivo

La base visual y el sistema de internacionalización se construyeron como MVP. Ambos acumularon deuda: textos visibles escritos en los componentes, controles que contradicen lo acordado en 001, comportamientos duplicados que compiten entre sí, restos de código sin uso y pruebas que validan el comportamiento defectuoso. El enrutado de idioma tampoco distingue una ruta que debe redirigirse de una que debe responder como inexistente, y no existe pantalla propia para las rutas que no corresponden a ninguna página.

El objetivo es **consolidar lo existente**: una sola fuente de verdad por comportamiento compartido, cumplimiento real de 001 y 002, enrutado determinista, una pantalla de error coherente y una suite de pruebas que describa la spec y no los defectos.

Esta funcionalidad **no rediseña la interfaz ni añade funcionalidad visible**. Los controles de tema e idioma siguen donde están y con la forma que tienen hasta que la 004 los sustituya dentro de la cabecera. La 003 solo corrige su comportamiento interno y su relación con las preferencias guardadas.

## 2. Usuarios

- **Reclutador (usuario principal).** Revisa el sitio con prisa y necesita que el idioma y el tema no le jueguen malas pasadas entre visitas.
- **Visitante que ya conoce el sitio.** Espera que sus preferencias se recuerden y que los enlaces que guardó sigan funcionando.
- **Visitante que usa teclado, lector de pantalla, zoom o movimiento reducido.** Necesita foco visible, contraste suficiente y ausencia de animaciones molestas.
- **Visitante con JavaScript desactivado o bloqueado.** Necesita leer el contenido, cambiar de idioma y entender una ruta inexistente sin depender del script.
- **Visitante que llega a un enlace roto o inexistente.** Necesita una explicación clara en su idioma y una salida, sin acabar en un error del servidor.
- **Pedro, mantenedor del sitio.** Necesita una base sin duplicaciones y con pruebas fiables antes de construir la cabecera y el contenido.

## 3. Historias de usuario

- **HU-1.** Como visitante que ya eligió idioma o tema, quiero que el sitio lo recuerde sin contradicciones, para no configurarlo en cada visita.
- **HU-2.** Como visitante, quiero cambiar de idioma y seguir en la misma página, con una URL que pueda compartir, para leer exactamente lo que me interesa.
- **HU-3.** Como visitante que usa teclado o lector de pantalla, quiero operar los controles sin ambigüedad y con foco visible, para navegar con autonomía.
- **HU-4.** Como visitante sin JavaScript, quiero leer el contenido y cambiar de idioma, para no quedarme fuera.
- **HU-5.** Como visitante que llega por un enlace antiguo o con preferencias guardadas, quiero que todo siga funcionando, para no perder mi configuración.
- **HU-6.** Como visitante que llega a una URL que no existe, quiero una explicación clara en mi idioma y una salida al inicio, para no quedarme en un callejón sin salida.
- **HU-7.** Como Pedro, quiero una sola fuente de verdad por comportamiento y pruebas que reflejen la spec, para construir encima sin repetir decisiones.

## 4. Requisitos funcionales

### RF-1 — Todos los textos visibles son bilingües y llegan como datos

- Criterios de aceptación (EARS, en español):
  - **El sistema deberá** obtener de los diccionarios en inglés y castellano todo texto visible para el usuario, incluidos los nombres accesibles de los controles y los textos de la pantalla de error.
  - **El sistema deberá** mantener en los dos diccionarios exactamente el mismo juego de claves, de modo que no pueda existir un texto traducido en un idioma y ausente en el otro.
  - **El sistema deberá** detectar cualquier desajuste entre diccionarios antes de publicar, mediante comprobación de tipos y pruebas automáticas.
  - **El sistema no deberá** mostrar claves, huecos vacíos ni textos en otro idioma: la ausencia de una traducción es un fallo de la comprobación, no un estado de la interfaz.
  - **El sistema no deberá** mezclar idiomas dentro de una misma pantalla.
  - **El sistema deberá** entregar a cada componente de presentación todos sus textos como datos recibidos, de modo que ningún componente lea diccionarios ni conozca el idioma activo.
  - **El sistema deberá** eliminar las claves que dejen de usarse, incluidas las del aviso de JavaScript y las del revelado del selector.

### RF-2 — Un solo mecanismo por comportamiento compartido

- Criterios de aceptación (EARS, en español):
  - **El sistema deberá** tener un único mecanismo responsable de cada comportamiento compartido: resolución del idioma, detección inicial, tema y textos.
  - **El sistema no deberá** mantener dos mecanismos equivalentes que puedan competir y producir estados distintos.
  - **El sistema no deberá** conservar rutas de código, puntos de entrada ni comportamientos sin uso que dupliquen la funcionalidad vigente.
  - **El sistema deberá** superar esta comprobación cerrada en la revisión de la entrega: un único punto lee y escribe cada preferencia; un único resolvedor decide el idioma; no existe un segundo módulo con la misma responsabilidad; no queda ningún punto de entrada alternativo sin uso.

### RF-3 — Resolución inicial del idioma y raíz del sitio

- Criterios de aceptación (EARS, en español):
  - **Cuando** la URL incluya explícitamente un idioma soportado, **el sistema deberá** mostrar ese idioma y no redirigir, aunque exista otra preferencia guardada.
  - **Cuando** el visitante acceda a una dirección sin idioma, incluida la raíz del sitio, **el sistema deberá** redirigir a la misma ruta con el idioma resuelto, conservando los parámetros de consulta.
  - **El sistema deberá** resolver ese idioma en este orden: preferencia guardada válida, idioma del navegador cuando esté soportado, inglés.
  - **El sistema deberá** interpretar la preferencia de idiomas del navegador por orden de peso, ignorando el comodín y las entradas con peso cero, comparando por idioma base y eligiendo el primero soportado.
  - **Si** la preferencia guardada no es válida o no puede leerse, **entonces el sistema deberá** ignorarla y continuar con el idioma del navegador y, en su defecto, el inglés.
  - **Mientras** el visitante navegue dentro del sitio, **el sistema deberá** mantener el idioma de la URL y no mezclarlo con la preferencia guardada.
  - **La preferencia guardada solo deberá** cambiar cuando el visitante use el control de idioma.
  - **El sistema no deberá** sincronizar el idioma entre pestañas abiertas: cada una conserva el idioma de su URL.

### RF-4 — Cambio de idioma mediante la URL equivalente

- Criterios de aceptación (EARS, en español):
  - **Cuando** el visitante elija un idioma, **el sistema deberá** navegar a la misma página en el idioma elegido, conservando la ruta equivalente, los parámetros de consulta y el fragmento.
  - **Cuando** el visitante cambie de idioma, **el sistema deberá** actualizar la URL para que refleje el idioma activo y pueda compartirse.
  - **El sistema deberá** conservar el historial de navegación: volver atrás deberá devolver al idioma anterior, con la posición de lectura que gestione el navegador.
  - **Cuando** el visitante seleccione un idioma, **el sistema deberá** recordar esa preferencia para futuras visitas.
  - **Si** JavaScript está desactivado, **entonces el sistema deberá** permitir el cambio de idioma, sin poder recordar la preferencia.
  - **El sistema deberá** declarar el idioma del documento de forma coherente con el contenido mostrado.
  - **El sistema no deberá** sobrescribir la preferencia guardada por el mero hecho de abrir un enlace directo a otro idioma.
  - **El sistema deberá** mantener la forma del control de idioma vigente hasta que la 004 lo sustituya; su presentación definitiva se especifica allí.

### RF-5 — Direcciones canónicas y variantes

- Criterios de aceptación (EARS, en español):
  - **El sistema deberá** reconocer como direcciones válidas únicamente la forma canónica de cada página: idioma como primer segmento y, después, la ruta de la página.
  - **Cuando** una dirección incluya una barra final, **el sistema deberá** redirigir de forma permanente a su forma canónica.
  - **Cuando** una dirección use mayúsculas en el idioma, barras dobles o coloque el idioma fuera del primer segmento, **el sistema deberá** responder con la pantalla de página no encontrada, sin redirigir a otro idioma.
  - **Cuando** una dirección incluya un idioma que el sitio no soporta, **el sistema deberá** responder con la pantalla de página no encontrada, sin redirigir a otro idioma.
  - **Cuando** una ruta contenga codificaciones anómalas, caracteres Unicode o una longitud extrema, **el sistema deberá** responder con la pantalla de página no encontrada, nunca con un fallo del servidor.
  - **El sistema deberá** usar el mismo identificador de proyecto en los dos idiomas, de modo que la URL equivalente de un proyecto solo cambie en el segmento del idioma.

### RF-6 — Tema: una sola fuente, sin destello

- Criterios de aceptación (EARS, en español):
  - **Cuando** el visitante elija un tema manualmente, **el sistema deberá** recordarlo en el navegador y aplicarlo en visitas posteriores.
  - **Cuando** un visitante abra el sitio por primera vez, **el sistema deberá** mostrar el tema claro u oscuro que indique su sistema operativo.
  - **Si** el sistema operativo no expone ninguna preferencia, **entonces el sistema deberá** mostrar el tema claro.
  - **Mientras** no exista una elección manual, **el sistema deberá** acompañar los cambios de preferencia del sistema operativo sin recargar.
  - **Mientras** exista una elección manual distinta de sistema, **el sistema no deberá** sobrescribirla con cambios del sistema operativo.
  - **Si** la preferencia guardada es inválida, está corrupta o no puede leerse, **entonces el sistema deberá** ignorarla, usar la preferencia del sistema y mantenerse completamente funcional.
  - **Si** el navegador no permite leer o escribir el almacenamiento, por bloqueo, falta de espacio o modo privado, **entonces el sistema deberá** tratar el caso del mismo modo: aplicar la elección durante la visita, no mostrar ningún error y mantener la preferencia modificable.
  - **Cuando** el tema cambie en una pestaña, **el sistema deberá** aplicarlo en las demás pestañas del mismo origen, sin recargar el contenido y sin mover el foco.
  - **Mientras** una página se cargue con una elección previa, **el sistema no deberá** mostrar durante un instante el tema contrario al elegido.
  - **Cuando** el tema cambie, **el sistema deberá** transicionar los colores entre 150 y 400 ms, sin alterar el tamaño ni la posición del contenido.
  - **Si** el visitante prefiere movimiento reducido, **entonces el sistema deberá** aplicar los cambios de tema de forma instantánea.
  - **El sistema deberá** mantener la forma del control de tema vigente hasta que la 004 lo sustituya; el botón de tres estados se especifica allí.

### RF-7 — Pantalla de página no encontrada

- Criterios de aceptación (EARS, en español):
  - **Cuando** la ruta solicitada no corresponda a ninguna página del sitio, **el sistema deberá** responder con estado de página no encontrada y mostrar una pantalla propia, nunca contenido de una página real.
  - **Cuando** la ruta inexistente esté dentro de un idioma soportado, **el sistema deberá** mostrar la pantalla en ese idioma.
  - **Cuando** la ruta no contenga un idioma soportado, **el sistema deberá** mostrar la pantalla en el idioma resuelto por el orden: preferencia guardada válida, idioma del navegador soportado e inglés.
  - **El sistema deberá** incluir en la pantalla el código de error a escala display como momento visual, un mensaje que indique que la página no existe, un enlace para volver al inicio en el idioma activo y un enlace al otro idioma, etiquetado en ese idioma.
  - **El sistema deberá** mantener en la pantalla la identidad visual, la tipografía y el contraste del resto del sitio.
  - **El sistema deberá** aplicar el tema efectivo igual que en el resto del sitio, sin forzar un tema propio.
  - **El sistema no deberá** modificar ninguna preferencia guardada por el mero hecho de mostrar la pantalla o de usar sus enlaces.
  - **El sistema no deberá** incluir en la pantalla cabecera, navegación principal, contenido del currículum ni ofertas de secciones que no existan.
  - **El sistema no deberá** repetir en la pantalla la ruta solicitada.
  - **El sistema deberá** declarar la pantalla como no indexable, sin canonical ni alternativas de idioma.
  - **El sistema deberá** mostrar la pantalla completa y legible con JavaScript desactivado.
  - **El sistema deberá** mantener la pantalla utilizable con teclado y lector de pantalla, con un encabezado semántico y foco visible.

### RF-8 — Conservación de lo publicado

- Criterios de aceptación (EARS, en español):
  - **El sistema deberá** conservar las direcciones de inicio y de listado de proyectos en ambos idiomas.
  - **El sistema deberá** reconocer las preferencias de idioma y tema guardadas por visitantes anteriores al cambio, sin pedirles que vuelvan a configurarlas.
  - **El sistema deberá** ignorar y eliminar del navegador las preferencias de estados que desaparecen, relativas al revelado del selector y al aviso ya visto.
  - **Cuando** un visitante abra un enlace guardado a cualquiera de las páginas, **el sistema deberá** mostrar la misma página en el idioma indicado.
  - **El sistema no deberá** introducir redirecciones que rompan enlaces existentes ni cambien el idioma de un enlace explícito.

### RF-9 — Accesibilidad de la base

- Criterios de aceptación (EARS, en español):
  - **Cuando** un elemento interactivo reciba el foco, **el sistema deberá** mostrar un indicador visible que se distinga del estado sin foco y alcance un contraste mínimo de 3:1 frente a los colores adyacentes.
  - **El sistema deberá** garantizar que ningún elemento que reciba el foco quede oculto por otro contenido superpuesto.
  - **El sistema deberá** ofrecer objetivos interactivos de al menos 24 por 24 píxeles.
  - **El sistema deberá** mantener el contenido legible y completo cuando el visitante amplíe el espaciado del texto.
  - **El sistema deberá** distinguir enlaces, estados y foco sin depender únicamente del color.
  - **El sistema deberá** mantener la estructura semántica de encabezados en ambos idiomas, incluida la pantalla de error.
  - **Mientras** el sistema operativo imponga colores forzados de alto contraste, **el sistema deberá** mantener el contenido legible y el foco visible.
  - **El sistema no deberá** sacrificar legibilidad, contraste o semántica para conseguir impacto visual.

## 5. Requisitos no funcionales

- **RNF-1 — Calidad en verde.** Lint, comprobación de tipos, pruebas unitarias y de componentes, pruebas end-to-end y build deberán pasar antes de dar la funcionalidad por terminada.
- **RNF-2 — Sin dependencias nuevas.** El trabajo se hará con lo ya disponible; no se añadirán librerías de animación, i18n, temas ni utilidades.
- **RNF-3 — SEO por idioma.** Cada página existente tendrá título y descripción propios por idioma; las direcciones equivalentes se declararán con sus alternativas de idioma y una versión por defecto que apunte a la raíz del sitio; las páginas de contenido se declararán como canónicas de sí mismas. El contenido deberá estar presente en el HTML inicial.
- **RNF-4 — Rendimiento y estabilidad visual.** No habrá destello de tema ni desplazamiento perceptible por carga de tipografía; el HTML inicial será suficiente para leer el contenido.
- **RNF-5 — Accesibilidad WCAG 2.2 AA.** Texto normal con contraste mínimo 4,5:1, texto grande e interfaz 3:1, reflow sin desplazamiento horizontal a 320 px, zoom de página y de texto al 200 % y respeto a `prefers-reduced-motion`.
- **RNF-6 — Compatibilidad.** El sitio funcionará en las dos últimas versiones de Chrome, Firefox, Safari y Edge, en escritorio y móvil. Las pruebas end-to-end cubrirán esos cuatro navegadores.
- **RNF-7 — Privacidad.** Las preferencias se conservarán únicamente en el navegador del visitante: el tema en su almacenamiento local y el idioma en una cookie propia que solo transporta ese dato. No se enviarán a terceros ni se usarán para rastreo.
- **RNF-8 — Mantenibilidad.** Cada comportamiento compartido tendrá una sola fuente de verdad; los componentes serán pequeños, de una sola responsabilidad, con props tipadas y sin textos propios; los diccionarios estarán completos y las pruebas describirán la spec.
- **RNF-9 — Contenido bilingüe.** Todo texto visible, incluidos nombres accesibles y los de la pantalla de error, existirá en inglés y castellano.
- **RNF-10 — Disciplina de alcance.** Esta funcionalidad no rediseñará la cabecera, los controles ni la composición, no escribirá contenido del currículum y no añadirá páginas nuevas más allá de la pantalla de error.

## 6. Casos límite

1. **Preferencia de tema guardada inválida o corrupta:** se ignora, se usa la del sistema, sin errores ni bloqueo.
2. **Almacenamiento bloqueado, lleno o en modo privado:** el tema elegido funciona durante la visita y solo se pierde al cerrar; la preferencia sigue siendo modificable.
3. **Dos pestañas con temas distintos:** al cambiar en una, la otra refleja el tema sin recargar, sin mover el foco y sin perder la posición de lectura.
4. **El sistema operativo cambia de tema con la web abierta:** se acompaña si no hay elección manual o si la opción es sistema; no se acompaña si hay elección manual.
5. **Primera visita con el sistema en oscuro:** se muestra oscuro, sin destello claro.
6. **Visitante que ya tenía preferencias guardadas antes del cambio:** se respetan idioma y tema; las claves del revelado y del aviso se ignoran y se eliminan.
7. **Enlace directo a un idioma distinto del guardado:** se muestra el idioma del enlace y no se sobrescribe la preferencia.
8. **Idioma del navegador no soportado, con varios idiomas y pesos, o con comodín:** se elige el primer idioma soportado por peso; sin ninguno, inglés; el comodín y las entradas con peso cero se ignoran.
9. **URL con un idioma no soportado, como `/fr` o `/fr/projects`:** se muestra la pantalla de página no encontrada en el idioma resuelto, sin redirección y sin contenido de una página real.
10. **Ruta inexistente dentro de un idioma válido, como `/es/loquesea`:** pantalla de página no encontrada en ese idioma, con salida al inicio en ese idioma.
11. **Falta una traducción en un diccionario:** la comprobación falla antes de publicar; nunca se muestra una clave ni un hueco.
12. **JavaScript desactivado o fallido:** el contenido se lee, el cambio de idioma funciona, la pantalla de error se muestra completa y se aplica el tema del sistema. El tema no se recuerda entre visitas, la preferencia de idioma no se guarda y no aparece ningún error visible.
13. **Recarga o reapertura con el tema ya elegido:** el tema efectivo coincide con el elegido y la preferencia puede cambiarse.
14. **Tipografía no disponible o red lenta:** se usa una monoespaciada del sistema sin salto perceptible de maquetación.
15. **Movimiento reducido activado:** el cambio de tema es instantáneo.
16. **Movimiento reducido activado después de cargar la página:** el cambio de preferencia se aplica en el momento, sin recargar.
17. **Colores forzados de alto contraste:** el contenido sigue legible y el foco visible.
18. **Zoom del 200 %, zoom de solo texto o ventana de 320 px:** sin desplazamiento horizontal, sin titulares recortados y sin controles que tapen contenido; las palabras largas se parten.
19. **Pestaña restaurada tras cerrar el navegador:** idioma y tema efectivos coinciden con lo que el visitante dejó.
20. **Dos pestañas en idiomas distintos:** cada una conserva el idioma de su URL; la preferencia guardada pasa a ser la de la última elección explícita y no se aplica a las pestañas ya abiertas.
21. **Variantes de URL:** la barra final redirige a la forma canónica; mayúsculas, barras dobles y el idioma fuera del primer segmento responden con la pantalla de error.
22. **Ruta anómala, con codificaciones, Unicode o longitud extrema:** responde con la pantalla de error, nunca con un fallo del servidor, y no repite la ruta solicitada.
23. **Enlace compartido a la pantalla de error:** se abre en el idioma que corresponda y permite volver al inicio.
24. **Visitante que vuelve a la portada desde la pantalla de error:** no se modifica ninguna preferencia guardada.

## 7. Fuera de alcance

- La cabecera, la navegación, los destinos y la forma definitiva de los controles de tema e idioma: se especifican en la 004.
- La composición editorial de la portada y de las secciones, y el contenido del currículum: se abordan en la 005.
- El listado de proyectos más allá de su dirección y de sus metadatos.
- Pie de página, estados de carga y estados vacíos.
- Buscador, blog, formularios, CMS, analítica, RSS, PWA y cualquier funcionalidad de producto nueva.
- Rediseño de la identidad visual: nueva paleta, nuevas fuentes, iconografía, ilustraciones o imágenes.
- Cambiar el framework, el enrutador, el gestor de paquetes o la estrategia de renderizado.
- Renombrar las URLs publicadas, las claves de preferencias guardadas o descartar las preferencias vigentes de los visitantes.
- Impresión, exportación a PDF, modo sin conexión y aplicaciones nativas.
- Despliegue, infraestructura y flujos de integración continua.
- Corrección de otros puntos de 001 y 002 distintos de los anotados en sus notas de actualización.

## 8. Criterios de finalización

La funcionalidad se considerará terminada cuando:

- [ ] La 001 está corregida en los puntos relativos al control de tema, el revelado y el aviso de JavaScript, y la 002 en el respaldo a inglés y la persistencia dual, con su nota fechada y con el aviso correspondiente en sus planes y tareas.
- [ ] Los dos diccionarios tienen el mismo juego de claves, comprobado de forma automática, y no queda ninguna clave sin uso.
- [ ] Ningún componente de presentación contiene textos ni lee diccionarios: recibe todo por props y no existe respaldo de idioma en tiempo de ejecución.
- [ ] La raíz y las direcciones sin idioma redirigen a la ruta con el idioma resuelto por preferencia, navegador e inglés.
- [ ] Las variantes de URL y los idiomas no soportados responden como se describe en RF-5, sin cambiar el idioma de un enlace explícito.
- [ ] El control de idioma navega a la misma página conservando ruta, consulta y fragmento, actualiza la URL, deja entrada en el historial y guarda la preferencia.
- [ ] El tema se aplica sin recarga, se recuerda entre visitas, se sincroniza entre pestañas y no produce destello.
- [ ] La primera visita sigue la preferencia del sistema; sin preferencia del sistema se muestra claro.
- [ ] Los fallos de almacenamiento se gestionan sin errores visibles y sin impedir cambiar la preferencia.
- [ ] La pantalla de página no encontrada es bilingüe, no indexable, no repetitiva de la ruta, sin cabecera, y ofrece volver al inicio y el otro idioma.
- [ ] Cada página existente tiene título y descripción propios por idioma, canónica propia y alternativas de idioma con versión por defecto.
- [ ] El foco es visible y distinguible, con contraste de 3:1 frente al estado sin foco y los colores adyacentes, y nunca queda oculto.
- [ ] Los objetivos interactivos miden al menos 24 por 24 píxeles y el contenido soporta zoom de página y de texto al 200 %.
- [ ] No hay desplazamiento horizontal a 320 px ni con texto ampliado.
- [ ] Los cambios de tema respetan `prefers-reduced-motion`.
- [ ] Cada requisito funcional tiene al menos una prueba asociada, escrita antes del código; los componentes con comportamiento se prueban con pruebas de componente y los flujos de idioma, tema y página no encontrada con pruebas end-to-end en los cuatro navegadores.
- [ ] Existe un único mecanismo por comportamiento compartido y no quedan rutas de código ni puntos de entrada sin uso.
- [ ] Las URLs publicadas y las preferencias guardadas antes del cambio siguen funcionando.
- [ ] Lint, comprobación de tipos, pruebas, pruebas end-to-end y build pasan sin dependencias nuevas.

## 9. Decisiones cerradas

- **Reparto con 004 y 005.** Esta spec corrige la base; la 004 construye la cabecera y los destinos; la 005 compone y rellena la portada y los proyectos. Se descarta mezclar refactor y funcionalidad en un mismo documento porque impedía publicar la corrección sin arrastrar una funcionalidad grande.
- **Raíz y direcciones sin idioma.** Se mantiene la redirección a la ruta con idioma, con el orden preferencia, navegador e inglés. Se descarta servir contenido variable en la raíz y se descarta responder con error.
- **Completitud de los diccionarios.** No hay traducción de respaldo en tiempo de ejecución: los dos diccionarios deben tener las mismas claves y la comprobación falla antes de publicar. Se descarta el respaldo a inglés porque producía mezcla de idiomas.
- **Forma de los controles.** La 003 no rediseña los controles; solo corrige su comportamiento y sus preferencias. El botón de tema de tres estados y el desplegable de idioma se especifican en la 004, junto con la cabecera que los aloja.
- **Revelados.** El revelado del selector desaparece y esta funcionalidad no introduce animaciones de entrada. Si la 005 las añade, serán solo de presentación, con el contenido visible en el HTML y anuladas con movimiento reducido.
- **Contradicción con la 001.** Se corrige la 001 solo en los puntos en conflicto, con nota fechada, y se anotan su plan y sus tareas. No se reescribe entera ni se marca como histórica.
- **Contradicción con la 002.** Se corrige la 002 solo en el respaldo a inglés y la persistencia dual, que esta spec deroga, con nota fechada y aviso en su plan y sus tareas.
- **Tipografía y escala.** La 003 remite a la 001 para paleta, tipografía, espaciado y foco, y no repite sus cifras. Solo añade lo relativo a la ampliación de texto.
- **Pantalla de error.** Lleva el código a escala display, el mensaje, volver al inicio y el enlace al otro idioma. No lleva cabecera, ni selector de tema, ni navegación principal. Se descarta repetir la ruta solicitada.
- **Estático y dinámico.** Las páginas de contenido se sirven estáticas por dirección de idioma. Solo la redirección de la raíz y la pantalla de error de una dirección con idioma inválido se resuelven por petición, y no se almacenan.
- **Privacidad.** El tema vive en el almacenamiento local y el idioma en una cookie propia. Una fuente por preferencia, sin duplicados, de modo que no puedan contradecirse.
- **Preferencias antiguas.** Se respetan idioma y tema; las claves del revelado y del aviso se ignoran y se eliminan.
- **SEO entre idiomas.** Canónica propia, alternativas en castellano e inglés y versión por defecto apuntando a la raíz.
- **Coherencia estructural.** Se comprueba con la lista cerrada de RF-2 y con una prueba por requisito, no con pruebas artificiales de estructura.
- **Textos por props.** Los componentes de presentación no leen diccionarios ni conocen el idioma; la página resuelve los textos y los pasa.
- **Accesibilidad.** Se mantiene la declaración WCAG 2.2 AA y se añaden los criterios que faltaban: contraste del indicador de foco frente al estado sin foco, tamaño de objetivo, espaciado de texto y foco no oculto.
- **Historial.** El navegador gestiona la restauración de la posición al volver atrás; no se añade tratamiento propio.
- **Idioma entre pestañas.** Sin sincronización: cada pestaña conserva el idioma de su URL y la preferencia guardada solo cambia con el control.
- **Idioma sin JavaScript.** La navegación y el cambio de idioma funcionan; la preferencia no se guarda. Se declara como limitación en vez de guardarla en el servidor, que sobrescribiría enlaces compartidos.
