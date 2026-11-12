# 005 — Portada editorial y proyectos

- **Estado:** Borrador inicial
- **Fecha:** 12 de noviembre de 2026
- **Alcance:** composición y contenido de la portada, listado y detalle de proyectos
- **Depende de:** 003 (base consolidada) y 004 (cabecera y destinos)
- **Bloquea a:** cualquier página o sección futura que reutilice la composición

## 1. Contexto y objetivo

La 003 deja la base corregida y la 004 una cabecera estable, pero la portada solo contiene el nombre en un titular y cuatro secciones con su encabezado y su ancla, sin contenido. Los proyectos tienen un listado con un titular y ningún detalle. En ese estado el sitio funciona, pero no se percibe la identidad «minimalista pero de alto impacto» que pide la 001, ni hay información que un reclutador pueda leer.

El objetivo es **convertir esa estructura en una pieza editorial con contenido real**: una portada que se lea de un tirón, con héroe, experiencia, proyectos, stack y contacto, y unas páginas de proyecto que den profundidad a lo que se anuncia en la portada. No se añaden secciones nuevas ni funcionalidades de producto: se compone y se rellena lo que ya existe.

## 2. Usuarios

- **Reclutador (usuario principal).** Quiere saber en un scroll quién es Pedro, qué ha hecho y con qué trabaja, sin pulsar nada.
- **Cliente potencial.** Entra a un proyecto concreto para valorar el trabajo y el criterio técnico.
- **Visitante que busca detalle.** Llega desde un enlace compartido a un proyecto y necesita entenderlo sin contexto previo.
- **Visitante que usa teclado, lector de pantalla, zoom o movimiento reducido.** Necesita la misma información, con estructura clara y sin depender del movimiento.
- **Pedro, mantenedor.** Necesita añadir o editar un proyecto sin tocar la composición ni duplicar textos.

## 3. Historias de usuario

- **HU-1.** Como reclutador, quiero entender quién es Pedro y qué ofrece en los primeros segundos, para decidir si sigo leyendo.
- **HU-2.** Como reclutador, quiero recorrer experiencia, proyectos y stack en una sola página, para evaluar el perfil sin navegar.
- **HU-3.** Como cliente potencial, quiero abrir un proyecto y entender qué problema resolvía y cómo, para valorar el trabajo.
- **HU-4.** Como visitante, quiero contactar sin buscar un correo escondido, para dar el paso.
- **HU-5.** Como visitante con lector de pantalla, quiero que la portada tenga una jerarquía de encabezados coherente, para saltar entre secciones.
- **HU-6.** Como Pedro, quiero que añadir un proyecto sea añadir sus datos y sus textos, para mantener el sitio sin tocar la composición.

## 4. Requisitos funcionales

### RF-1 — Composición editorial de la portada

- Criterios de aceptación (EARS, en español):
  - **El sistema deberá** componer la portada con las cinco secciones: héroe, experiencia, proyectos, stack y contacto, en ese orden.
  - **El sistema deberá** usar en cada sección al menos un recurso de la lista cerrada: titular a escala display, bloque invertido, retícula visible o composición asimétrica.
  - **El sistema deberá** emplear recursos distintos en secciones contiguas, de modo que la portada tenga ritmo y no repita el mismo gesto.
  - **El sistema deberá** mantener espacio negativo generoso entre secciones y una separación mayor entre secciones que dentro de cada una.
  - **El sistema deberá** alinear las secciones con una retícula común, sin que ninguna sección redefina márgenes, tipografía ni colores.
  - **El sistema deberá** superar la revisión visual con capturas a 320 px y a escritorio, en los dos temas y en los dos idiomas, comprobando que cada sección tiene su recurso y que ninguno compite con la lectura.
  - **El sistema no deberá** usar elementos decorativos sin función: nada de ilustraciones, iconos ni imágenes que no aporten información.

### RF-2 — Héroe

- Criterios de aceptación (EARS, en español):
  - **El sistema deberá** mostrar a escala display el nombre completo y, en un nivel secundario, el rol profesional, ambos en el idioma activo.
  - **El sistema deberá** incluir una línea breve de posicionamiento que explique a qué se dedica y qué ofrece, sin repetir el rol.
  - **El sistema deberá** ofrecer un enlace visible a la sección de contacto y otro a la de proyectos, con etiquetas propias del idioma activo.
  - **El sistema deberá** mantener el héroe legible sin JavaScript y con el contenido presente en el HTML inicial.
  - **El sistema no deberá** incluir carruseles, vídeos ni animaciones que retrasen la lectura.

### RF-3 — Experiencia

- Criterios de aceptación (EARS, en español):
  - **El sistema deberá** mostrar las experiencias profesionales en orden cronológico inverso.
  - **El sistema deberá** mostrar de cada experiencia el puesto, la organización, el periodo y un resumen breve de lo realizado.
  - **El sistema deberá** presentar cada experiencia como un bloque diferenciado, con jerarquía tipográfica propia y sin depender del color.
  - **El sistema deberá** mostrar el periodo con un formato comprensible en el idioma activo y sin ambigüedad entre fechas de inicio y fin.
  - **Cuando** una experiencia siga en curso, **el sistema deberá** indicarlo con un texto explícito en el idioma activo, no con un guion ni un hueco.
  - **El sistema no deberá** mostrar experiencias sin puesto, sin organización o sin periodo: un dato ausente impide publicar esa entrada.

### RF-4 — Stack

- Criterios de aceptación (EARS, en español):
  - **El sistema deberá** agrupar las tecnologías por área de trabajo, con una etiqueta por grupo en el idioma activo.
  - **El sistema deberá** mostrar cada tecnología por su nombre habitual, sin traducir los nombres propios.
  - **El sistema deberá** presentar el conjunto como una retícula o una lista estructurada, legible sin depender del color ni del tamaño de un icono.
  - **El sistema no deberá** mostrar tecnologías sin área asignada ni áreas sin tecnologías.
  - **El sistema no deberá** usar logos ni imágenes: el nombre escrito es el contenido.

### RF-5 — Proyectos: resumen, listado y detalle

- Criterios de aceptación (EARS, en español):
  - **El sistema deberá** mostrar en la portada un resumen de proyectos con los que se quieran destacar, cada uno con título, resumen breve y enlace a su página.
  - **El sistema deberá** mantener el listado de proyectos como página propia, con todos los proyectos y enlace a cada detalle.
  - **Cuando** haya más proyectos que los destacados en la portada, **el sistema deberá** ofrecer en la sección de proyectos un enlace al listado completo.
  - **El sistema deberá** mostrar de cada proyecto, en su página, el título, el resumen, el año, las tecnologías empleadas y los enlaces disponibles.
  - **El sistema deberá** usar la misma dirección de proyecto en los dos idiomas y traducir solo los textos.
  - **Cuando** un proyecto no tenga enlaces, **el sistema deberá** omitir esa parte sin dejar un hueco ni un texto sustituto.
  - **Cuando** un proyecto no tenga año o resumen, **el sistema deberá** omitir el dato y mantener el resto de la página legible.
  - **El sistema deberá** mostrar en la página de proyecto la identidad visual del sitio y un enlace de vuelta al listado y al inicio.
  - **El sistema no deberá** mostrar proyectos sin título ni sin contenido: un proyecto incompleto no se publica.

### RF-6 — Contacto

- Criterios de aceptación (EARS, en español):
  - **El sistema deberá** ofrecer en la portada los canales de contacto vigentes, cada uno con su etiqueta y su enlace.
  - **El sistema deberá** indicar de forma explícita qué hace cada enlace: escribir un correo, abrir un perfil profesional o abrir un repositorio.
  - **El sistema deberá** permitir copiar la dirección de correo o enlazarla de forma que funcione sin JavaScript.
  - **El sistema no deberá** incluir formularios ni envío de datos.
  - **El sistema no deberá** mostrar canales que no existan o que estén vacíos.

### RF-7 — Contenido bilingüe y datos en el repositorio

- Criterios de aceptación (EARS, en español):
  - **El sistema deberá** mantener en inglés y castellano todos los textos de las secciones, de los proyectos y de sus metadatos.
  - **El sistema deberá** mantener la misma estructura de datos en ambos idiomas, de modo que ningún proyecto exista en uno y falte en el otro.
  - **El sistema deberá** leer el contenido de los proyectos de datos versionados en el repositorio, sin servicios externos ni base de datos.
  - **El sistema deberá** detectar antes de publicar cualquier proyecto con datos incompletos o con un idioma sin traducir.
  - **El sistema no deberá** duplicar el mismo texto en la portada y en la página de proyecto: el resumen de la portada y el contenido del proyecto son campos distintos y explícitos.

### RF-8 — Metadatos de las páginas nuevas

- Criterios de aceptación (EARS, en español):
  - **El sistema deberá** dar a la portada, al listado de proyectos y a cada proyecto un título y una descripción propios en cada idioma.
  - **El sistema deberá** declarar la canónica de cada página y sus alternativas de idioma, con una versión por defecto que apunte a la raíz del sitio.
  - **El sistema deberá** describir cada proyecto con su propio título y resumen, sin reutilizar los de otra página.
  - **El sistema deberá** mantener el contenido visible en el HTML inicial, sin depender del script para mostrarlo.

### RF-9 — Navegación por secciones y destino activo

- Criterios de aceptación (EARS, en español):
  - **Cuando** el visitante elija una sección de la portada desde la cabecera, **el sistema deberá** llevarlo a esa sección y marcarla como ubicación actual mientras sea la visible.
  - **El sistema deberá** mantener el orden de las secciones del menú igual al orden de la portada.
  - **El sistema deberá** mantener el destino activo perceptible al recorrer la portada, con el recurso no cromático definido en la 004.
  - **El sistema deberá** conservar la sección de destino al cambiar de idioma, según lo establecido en la 004.

### RF-10 — Accesibilidad de la composición

- Criterios de aceptación (EARS, en español):
  - **El sistema deberá** usar un encabezado de nivel uno por página y una jerarquía de encabezados que refleje las secciones, sin saltos.
  - **El sistema deberá** marcar como listas las colecciones de experiencias, tecnologías y proyectos.
  - **El sistema deberá** mantener el contraste mínimo de AA en todos los pares de color de la composición, en los dos temas.
  - **El sistema deberá** mantener el contenido legible y completo con zoom de página y de texto al 200 % y a 320 px de ancho.
  - **El sistema deberá** mantener el foco visible en todos los enlaces y controles de la composición.
  - **Cuando** las animaciones de entrada estén activas, **el sistema deberá** mostrar el contenido completo desde el primer momento y anularlas con movimiento reducido.
  - **El sistema no deberá** transmitir información únicamente mediante el color, la posición o el movimiento.

## 5. Requisitos no funcionales

- **RNF-1 — Calidad en verde.** Lint, comprobación de tipos, pruebas unitarias y de componentes, pruebas end-to-end y build deberán pasar antes de dar la funcionalidad por terminada.
- **RNF-2 — Sin dependencias nuevas.** La composición se hará con lo ya disponible.
- **RNF-3 — SEO por idioma.** Cada página tendrá título, descripción, canónica y alternativas de idioma; el contenido estará en el HTML inicial.
- **RNF-4 — Rendimiento y estabilidad visual.** Sin desplazamiento por carga de tipografía ni por animaciones; el HTML inicial será suficiente para leer.
- **RNF-5 — Accesibilidad WCAG 2.2 AA,** con los criterios ya fijados en la 003.
- **RNF-6 — Compatibilidad.** Dos últimas versiones de Chrome, Firefox, Safari y Edge, en escritorio y móvil.
- **RNF-7 — Privacidad.** Sin analítica, sin terceros y sin envío de datos del visitante.
- **RNF-8 — Mantenibilidad.** Añadir un proyecto o una experiencia será añadir datos y textos, sin tocar la composición; los componentes seguirán recibiendo todo por props.
- **RNF-9 — Contenido bilingüe.** Todo texto visible existirá en inglés y castellano.
- **RNF-10 — Disciplina de alcance.** No se añaden secciones, páginas ni funcionalidades distintas de las descritas.

## 6. Casos límite

1. **Un solo proyecto:** la portada y el listado se ven completos, sin retículas vacías ni huecos reservados para más.
2. **Ningún proyecto:** la portada no muestra la sección, el menú no muestra el destino y el listado se mantiene publicado con su titular, sin huecos, retículas vacías ni textos de relleno.
3. **Proyecto con textos mucho más largos que el resto:** el resumen de la portada se limita a una extensión fija y el resto vive en la página del proyecto.
4. **Título de proyecto con una palabra larguísima:** se parte dentro del contenedor sin desbordar a 320 px.
5. **Experiencia en curso:** se indica con texto explícito, nunca con un guion.
6. **Experiencia sin periodo conocido:** no se publica la entrada hasta completar el dato.
7. **Tecnología poco conocida:** se escribe su nombre habitual y se mantiene en el idioma original.
8. **Enlaces externos de un proyecto:** se abren en una pestaña nueva solo si se avisa de forma perceptible; si no, en la misma.
9. **Enlace de contacto de correo:** funciona sin JavaScript y no expone la dirección como imagen.
10. **Cambio de idioma desde una sección de la portada:** se conserva la sección, según la 004.
11. **Cambio de idioma desde un proyecto:** se abre el mismo proyecto en el otro idioma.
12. **Proyecto que solo existe en un idioma:** se detecta antes de publicar y no se muestra a medias.
13. **Contenido largo en el stack:** el grupo se parte en varias líneas sin desplazamiento horizontal.
14. **Zoom al 200 %:** la composición se reordena sin perder información ni provocar desplazamiento horizontal.
15. **Movimiento reducido:** las animaciones de entrada no se ejecutan y el contenido se ve completo.

## 7. Fuera de alcance

- Cabecera y controles de tema e idioma: ya están en la 004. Pantalla de error y base visual: ya están en la 003.
- Secciones nuevas distintas de las cinco de la portada.
- Blog, buscador, formularios, CMS, analítica, RSS, PWA y cualquier funcionalidad de producto.
- Cambios en la paleta, las fuentes, el enrutador o la estrategia de renderizado.
- Imágenes, ilustraciones, iconografía y fotografías.
- Impresión, exportación a PDF, modo sin conexión y aplicaciones nativas.
- Despliegue, infraestructura y flujos de integración continua.
- Traducciones de contenido que no exista.

## 8. Contenido pendiente de aportar

Para cerrar esta funcionalidad hace falta, en inglés y castellano:

- Una línea de posicionamiento para el héroe.
- Las experiencias con puesto, organización, periodo y resumen.
- Las áreas del stack y las tecnologías de cada una.
- Los proyectos: título, resumen de portada, contenido de la página, año, tecnologías y enlaces.
- Los canales de contacto con su etiqueta y su enlace.

Sin este contenido la composición puede construirse, pero las secciones no se pueden publicar.

## 9. Criterios de finalización

- [ ] Las cinco secciones están compuestas y cada una usa al menos un recurso de la lista cerrada, distinto del de la sección contigua.
- [ ] La portada se lee completa en un scroll en escritorio y en móvil, sin huecos ni desplazamiento horizontal.
- [ ] Cada experiencia muestra puesto, organización, periodo y resumen, o no se publica.
- [ ] El stack está agrupado por área y no usa logos.
- [ ] La portada resume los proyectos y el listado los muestra todos, con enlace a cada detalle.
- [ ] Cada proyecto tiene página propia, con título, resumen, año, tecnologías y enlaces cuando existan.
- [ ] El contacto ofrece canales reales, con etiqueta y enlace, y funciona sin JavaScript.
- [ ] Todos los textos existen en los dos idiomas y la estructura de datos es la misma en ambos.
- [ ] Cada página tiene título, descripción, canónica y alternativas de idioma propios.
- [ ] La jerarquía de encabezados es correcta y las colecciones están marcadas como listas.
- [ ] Contraste AA verificado en los dos temas y en todos los pares de color.
- [ ] Sin desplazamiento horizontal a 320 px ni con zoom de página o de texto al 200 %.
- [ ] Las animaciones de entrada se anulan con movimiento reducido.
- [ ] Cada requisito funcional tiene al menos una prueba asociada, y los flujos críticos tienen prueba end-to-end.
- [ ] Lint, comprobación de tipos, pruebas, pruebas end-to-end y build pasan sin dependencias nuevas.

## 10. Decisiones cerradas

- **Arquitectura.** Portada larga con héroe, experiencia, proyectos, stack y contacto, y Proyectos como listado y detalle. Se descarta una página por sección porque exigiría tres páginas de contenido escaso, y se descarta una sola página con todo porque perdería la página de proyecto y su URL.
- **Conmutador de vista.** Se descarta: duplicaría contenido, complicaría el canonical, añadiría una preferencia y obligaría a que la composición funcionara en dos esqueletos.
- **Proyectos.** Listado en la dirección ya publicada y detalle en una dirección por proyecto, con el mismo identificador en los dos idiomas.
- **Momento visual.** Lista cerrada de recursos y revisión con capturas, en lugar de una redacción cualitativa o de describir la composición exacta.
- **Contenido.** Los datos viven en el repositorio y se escriben en los dos idiomas; lo que falta no se rellena con textos provisionales.
- **Secciones.** En la 004 existen con titular y ancla; aquí reciben composición y contenido.
