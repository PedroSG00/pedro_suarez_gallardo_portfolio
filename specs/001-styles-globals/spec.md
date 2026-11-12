# 001 — Estilos globales de la aplicación

- **Estado:** Borrador — En revisión
- **Fecha:** 30 de octubre de 2026
- **Alcance:** fundamentos visuales compartidos por todo el sitio
- **Depende de:** nada (es la primera funcionalidad)
- **Bloquea a:** cualquier sección o componente futuro del portfolio

> **Actualizada el 12 de noviembre de 2026.** La 003 corrige la base y la 004 sustituye el control de tema: deja de existir el botón que revelaba un selector oculto y el aviso modal sobre JavaScript. El control pasa a ser un único botón que alterna entre claro, oscuro y sistema, siempre visible (ver 004, RF-6). Este documento se conserva como fuente de la paleta, la tipografía, el espaciado y los criterios de accesibilidad; los requisitos derogados se marcan como tales y no se reescribe el resto.

## 1. Contexto y objetivo

El portfolio de Pedro Suárez Gallardo será un sitio estático y bilingüe dirigido principalmente a reclutadores y, en segundo lugar, a clientes potenciales. Hoy solo existe el andamiaje generado por el scaffold: una paleta genérica de blanco y negro, una tipografía sans y una página de ejemplo. Antes de construir la primera sección real hay que fijar la identidad visual, porque cada pantalla futura heredará estas decisiones.

Esta funcionalidad define y aplica la **base visual única** del sitio: color, tipografía, escala de espaciado, anchura de lectura, foco, selección, movimiento y tema claro/oscuro. Su objetivo es que cualquier página nueva se vea como parte del mismo producto sin redefinir estilos, que el sitio sea legible y accesible en ambos temas y que la identidad **minimalista pero visualmente espectacular** —crudo y negro, monoespaciada, editorial— sea reconocible e impactante desde la primera visita. Menos elementos, pero con presencia máxima: el atractivo no vendrá de decorar más, sino de componer mejor.

### Decisiones ya acordadas (fuente de verdad)

- **Paleta monocroma cálida de alto contraste:** crudo y negro como extremos, con una escala corta de grises cálidos intermedios (definida en §4.1) y **sin color de acento**. La espectacularidad nace del contraste extremo, las grandes superficies y la escala tipográfica, no de añadir color. Estados y enlaces se distinguen por peso, subrayado, contraste y contorno.
- **Tipografía monoespaciada editorial:** **Geist Mono** para todo el sitio (titulares, párrafos, navegación, etiquetas, datos, controles). Geist Mono ofrece pesos 400 y 700, pero **RF-10 prohíbe usar `font-weight: bold` para jerarquía**; la jerarquía se expresa mediante tamaño, contraste, espaciado e itálico (400 y 400 itálico). Los titulares pueden alcanzar escala *display* y funcionar como elemento gráfico.
- **Composición de alto impacto:** espacio negativo generoso, retícula visible, asimetría controlada, bloques invertidos y detalles tipográficos (numeración de secciones, reglas finas, etiquetas en versalitas). Cada página debe incluir al menos un momento visual deliberado y memorable.
- **Movimiento contenido pero expresivo:** revelados de entrada escalonados, transiciones de tema y microinteracciones de hover que refuercen la composición. Nada de animaciones infinitas ni efectos gratuitos; con `prefers-reduced-motion` el impacto se mantiene por composición y tipografía estáticas.
- **Tema elegible con opción de sistema:** el visitante alterna entre **claro**, **oscuro** y **sistema**; la primera visita sigue la preferencia del sistema operativo; la elección se recuerda y se sincroniza entre pestañas del mismo navegador.
- **Control de tema siempre visible:** un único botón, visible desde la carga inicial, que avanza en cada pulsación entre claro, oscuro y sistema. No hay selector oculto ni estado que dependa de una interacción previa. Su forma y su comportamiento se especifican en la 004 (RF-6); su persistencia, en la 003 (RF-6).
- **Sin aviso sobre JavaScript:** no se muestra ningún diálogo informativo. La limitación de no recordar preferencias sin JavaScript se asume como intrínseca y no se anuncia a quien sí lo tiene, que es el único que podría verlo.
- **Solo fundamentos:** no se crean componentes de interfaz ni se define el contenido del currículum, excepto los fundamentos del control de tema, cuya forma se especifica en la 004.
- **Accesibilidad:** WCAG 2.2 AA en ambos temas, con animaciones suaves y elegantes que forman parte de la estética.
- **La impresión queda fuera de alcance.**

## 2. Usuarios

- **Reclutador (usuario principal).** Revisa el portfolio en escritorio y móvil, a menudo con prisa, y necesita entender quién es Pedro y qué ofrece en pocos segundos.
- **Cliente potencial.** Evalúa si el trabajo y el gusto visual encajan con lo que busca; la coherencia estética forma parte de su impresión.
- **Visitante con preferencia de tema.** Trabaja de día en claro o de noche en oscuro y espera que el sitio respete su elección sin repetirla en cada visita.
- **Visitante que usa teclado, lector de pantalla, zoom o movimiento reducido.** Necesita foco visible, contraste suficiente y ausencia de animaciones molestas.
- **Pedro, mantenedor del sitio.** Necesita una base de estilos coherente y única para no repetir decisiones en cada sección nueva.

## 3. Historias de usuario

- **HU-1.** Como reclutador que abre el sitio por primera vez, quiero ver de inmediato una identidad visual clara, legible y memorable, para formarme una impresión profesional sin esfuerzo.
- **HU-2.** Como visitante que prefiere el modo oscuro, quiero que el sitio se abra en oscuro sin tener que configurarlo, para no deslumbrarme.
- **HU-3.** Como visitante que prefiere el modo claro, quiero poder cambiar el tema y que el sitio lo recuerde, para no repetir el cambio en cada visita.
- **HU-4.** Como visitante que navega con teclado, quiero ver siempre dónde está mi foco, para moverme sin perderme.
- **HU-5.** Como visitante con sensibilidad al movimiento, quiero que el cambio de tema y las transiciones se desactiven según mi preferencia del sistema, para evitar molestias.
- **HU-6.** Como visitante que lee en el móvil o con poco ancho de pantalla, quiero que el texto siga siendo legible y no se corte, para leer con comodidad.
- **HU-7.** Como visitante con baja visión o daltonismo, quiero distinguir enlaces, estados y foco sin depender del color, para usar el sitio con autonomía.
- **HU-8.** Como Pedro, quiero que todas las páginas compartan una sola base visual, para que añadir secciones no reintroduzca decisiones de color, tipografía o espaciado.
- **HU-9.** Como visitante que compara portfolios, quiero que el sitio me sorprenda visualmente sin perder claridad, para recordarlo y percibir un nivel de detalle profesional.

## 4. Requisitos funcionales

### RF-1 — Identidad cromática cálida y monocroma

El sitio debe presentar una paleta monocroma cálida con dos extremos (crudo y negro) y una escala corta de grises cálidos intermedios, organizada en roles semánticos estables: fondo, superficie, texto principal, texto secundario, borde o separador, superficie invertida (con su texto), foco y selección.

- **Criterios de aceptación (EARS):**
  - **El sistema deberá** usar exclusivamente la paleta monocroma cálida definida para todos los colores visibles de la interfaz.
  - **El sistema deberá** disponer de un valor propio para cada rol semántico en el tema claro, el tema oscuro y el tema que siga al sistema.
  - **El sistema no deberá** introducir colores de acento ni colores fuera de los grises cálidos acordados.
  - **El sistema deberá** generar impacto visual mediante contraste extremo entre crudo y negro, grandes superficies y jerarquía tipográfica, sin depender del color.
  - **Cuando** una pantalla necesite un color que no corresponda a ningún rol, **el sistema deberá** reutilizar el rol más cercano en lugar de improvisar un valor nuevo.

#### 4.1 Escala de grises cálidos (valores exactos)

```css
:root {
  --warm-1: #f8f5f0; /* warm-white / base clara */
  --warm-2: #e9e5dc; /* warm-100 */
  --warm-3: #d6d1bb; /* warm-200 */
  --warm-4: #b0a99a; /* warm-300 */
  --warm-5: #8a8478; /* warm-400 / negro cálido */
}
```

Los nombres de las variables están en inglés (Constitución 6).

### RF-2 — Tema inicial según la preferencia del sistema

- **Criterios de aceptación (EARS):**
  - **Cuando** un visitante abra el sitio por primera vez y no exista una elección previa, **el sistema deberá** mostrar el tema claro u oscuro que indique su sistema operativo.
  - **Mientras** el visitante no haya elegido tema manualmente, **el sistema deberá** seguir la preferencia del sistema operativo, también si esta cambia con la página abierta.
  - **Si** el sistema operativo no expone ninguna preferencia, **entonces el sistema deberá** mostrar el tema claro.
  - **El sistema deberá** declarar a qué tema corresponde la página mediante la propiedad CSS nativa `color-scheme`, de modo que los controles nativos del navegador (barras de desplazamiento, campos, menús) se muestren en consonancia.

### RF-3 — Control manual de tema con opción "sistema"

- **Criterios de aceptación (EARS):**
  - **El sistema deberá** ofrecer un control de tema visible desde la carga inicial y durante toda la visita, con las opciones **claro**, **oscuro** y **sistema**.
  - **El sistema deberá** resolver el control con un único botón que, en cada pulsación, avance en el ciclo claro, oscuro, sistema y de nuevo claro, sin recargar ni navegar.
  - **El sistema deberá** mostrar en el texto visible del botón el estado activo y comunicar en su nombre accesible el estado y la acción disponible, en inglés y castellano, sin depender de iconografía.
  - **Cuando** la opción sea "sistema", **el sistema deberá** seguir la preferencia del sistema operativo en tiempo real.
  - **El sistema deberá** permitir operar el control tanto con ratón como con teclado y lector de pantalla.

### RF-4 — Persistencia de la elección y sincronización entre pestañas

- **Criterios de aceptación (EARS):**
  - **Cuando** el visitante elija una opción manualmente (claro, oscuro o sistema), **el sistema deberá** recordarla en el navegador y aplicarla en visitas posteriores.
  - **Mientras** exista una elección manual, **el sistema no deberá** sobrescribirla con cambios posteriores de la preferencia del sistema operativo, a menos que la opción activa sea explícitamente "sistema".
  - **Si** la elección recordada no puede leerse o no es válida, **entonces el sistema deberá** ignorarla, aplicar la preferencia del sistema y mantener el sitio completamente funcional.
  - **Si** el navegador bloquea o no permite conservar la elección, **entonces el sistema deberá** aplicar la opción elegida durante la visita, sin mostrar errores y sin impedir nuevos cambios de tema.
  - **El sistema deberá** sincronizar la preferencia entre pestañas abiertas del mismo navegador: al cambiar en una pestaña, las demás pestañas con el mismo origen deberán reflejar la nueva preferencia sin recargar su contenido.

### RF-5 — [Derogado] Selector oculto por defecto y revelado bajo preferencia

Este requisito queda sin efecto: la 003 elimina el revelado y la 004 define el control como un único botón siempre visible (ver 004, RF-6). Se conserva el número para no romper las referencias de `plan.md` y `tasks.md`.

### RF-6 — [Derogado] Modal informativo para JavaScript desactivado

Este requisito queda sin efecto por la 003: no se muestra ningún aviso sobre JavaScript. Se conserva el número para no romper las referencias de `plan.md` y `tasks.md`.

### RF-7 — Cambio de tema sin destellos ni pérdida de contexto

- **Criterios de aceptación (EARS):**
  - **Mientras** una página se carga con una elección previa, **el sistema no deberá** mostrar durante un instante el tema distinto al elegido.
  - **Cuando** el tema cambie, **el sistema deberá** conservar el contenido, la posición de lectura y el foco del teclado.
  - **El sistema deberá** aplicar el tema a la totalidad de la página visible, incluidos el fondo general, los controles, la selección de texto y las barras de desplazamiento.

### RF-8 — Transición de tema suave y elegante

- **Criterios de aceptación (EARS):**
  - **Cuando** el tema cambie, **el sistema deberá** transicionar los colores con una duración de entre 150 y 400 ms y una curva de aceleración suave, sin parpadeos.
  - **El sistema no deberá** animar propiedades que alteren el tamaño o la posición del contenido al cambiar de tema.
  - **Cuando** la página se cargue por primera vez, **el sistema no deberá** ejecutar la transición de tema.
  - **Si** el sistema operativo indica que el visitante prefiere movimiento reducido, **entonces el sistema deberá** aplicar los cambios de tema de forma instantánea y suprimir cualquier animación no esencial.

### RF-9 — Tipografía monoespaciada en todo el sitio

- **Criterios de aceptación (EARS):**
  - **El sistema deberá** usar **Geist Mono** como única familia tipográfica monoespaciada para todo el texto visible: titulares, párrafos, navegación, etiquetas, datos y controles.
  - **El sistema deberá** tratar los titulares y los datos como elementos gráficos: escala *display*, interletrado ajustado, alineaciones intencionadas y contraste de tamaños.
  - **El sistema no deberá** usar una segunda familia tipográfica para el texto corrido.
  - **Si** la fuente no está disponible o la carga es lenta, **entonces el sistema deberá** recurrir a una monoespaciada del sistema (`monospace`) sin salto perceptible de maquetación.
  - **El sistema deberá** mostrar el texto legible desde el primer momento, sin que la aparición de la tipografía desplace el contenido.

### RF-10 — Escala tipográfica sin negrita

- **Criterios de aceptación (EARS):**
  - **El sistema deberá** definir una escala editorial acotada de estilos de texto con roles diferenciados: título *display*, título de página, título de sección, subtítulo, cuerpo, texto secundario y texto técnico o de datos.
  - **El sistema deberá** permitir que los títulos de página o de sección alcancen tamaños *display* y funcionen como recurso visual principal, sin dejar de ser texto semántico.
  - **El sistema no deberá** usar `font-weight: bold` (o valores superiores a 400) para expresar jerarquía.
  - **El sistema deberá** expresar la jerarquía mediante **tamaño**, **contraste de color**, **espaciado** y, cuando sea apropiado, **itálico** (`font-style: italic`).
  - **El sistema deberá** usar un tamaño de cuerpo no inferior a 16 px y una altura de línea que mantenga el texto cómodo de leer.
  - **El sistema deberá** limitar la longitud de línea del texto corrido a un rango legible de entre 45 y 75 caracteres.
  - **Umbral de texto grande:** se considera texto grande a partir de **18 px** (o 14 px si es itálico), para efectos del contraste mínimo 3:1 de NFR-1.

### RF-11 — Escala de espaciado y ritmo vertical

- **Criterios de aceptación (EARS):**
  - **El sistema deberá** definir una escala corta y consistente de espaciados y usarla para separar elementos, bloques y secciones.
  - **El sistema deberá** usar espacio negativo generoso como recurso compositivo, alternando bloques densos y bloques amplios para crear ritmo visual.
  - **El sistema deberá** mantener un ritmo vertical regular entre títulos, párrafos y grupos de contenido.
  - **El sistema deberá** aumentar la separación entre secciones respecto a la separación dentro de una misma sección.

### RF-12 — Anchura de contenido y adaptación a la pantalla

- **Criterios de aceptación (EARS):**
  - **El sistema deberá** limitar el texto corrido a una medida máxima de **65ch** para mantener líneas legibles en pantallas grandes.
  - **El sistema deberá** permitir composiciones de ancho completo (*full-bleed*) para titulares, bloques invertidos, retículas y elementos gráficos, sin aplicarles la medida de lectura.
  - **Mientras** la pantalla sea estrecha, **el sistema deberá** reducir los márgenes laterales sin que el contenido toque los bordes.
  - **Cuando** la ventana se estreche hasta 320 px de ancho, **el sistema no deberá** producir desplazamiento horizontal.
  - **El sistema deberá** adaptar tipografía y espaciado a pantallas pequeñas sin perder jerarquía ni legibilidad.

### RF-13 — Foco de teclado visible

- **Criterios de aceptación (EARS):**
  - **Cuando** un elemento interactivo reciba el foco, **el sistema deberá** mostrarlo con un indicador visible que se distinga del estado sin foco y alcance un contraste mínimo de 3:1 frente a los colores adyacentes.
  - **El sistema no deberá** eliminar ni ocultar el indicador de foco por motivos estéticos.
  - **Mientras** el visitante navegue con teclado, **el sistema deberá** mantener el indicador visible aunque el elemento esté junto al borde de la ventana o sobre una superficie invertida.
  - **El sistema deberá** garantizar que ningún elemento que reciba el foco quede oculto por contenido superpuesto.
  - **El sistema deberá** ofrecer objetivos interactivos de al menos 24 por 24 píxeles.
  - **El sistema deberá** mantener el contenido legible y completo cuando el visitante amplíe el espaciado del texto.

### RF-14 — Enlaces y estados sin color de acento

- **Criterios de aceptación (EARS):**
  - **El sistema deberá** distinguir los enlaces dentro del texto mediante subrayado u otro recurso no cromático, de modo que sigan siendo identificables sin percibir el color.
  - **Cuando** un enlace o elemento interactivo esté bajo el puntero, **el sistema deberá** indicarlo mediante un cambio perceptible de peso (si aplica), subrayado, contraste o superficie, sin introducir colores fuera de la paleta.
  - **Cuando** un enlace reciba el foco de teclado, **el sistema deberá** mostrar el mismo tratamiento reforzado que el resto de elementos interactivos.

### RF-15 — Selección de texto y controles nativos

- **Criterios de aceptación (EARS):**
  - **Cuando** el visitante seleccione texto, **el sistema deberá** mostrarlo con un color de selección de la paleta y texto legible con contraste equivalente a AA.
  - **El sistema deberá** hacer que las barras de desplazamiento visibles sigan la paleta del tema activo.
  - **Si** el navegador no permite personalizar las barras de desplazamiento, **entonces el sistema deberá** mostrar las barras nativas coherentes con el tema declarado.

### RF-16 — Coherencia de la base visual en todo el sitio

- **Criterios de aceptación (EARS):**
  - **El sistema deberá** aplicar la misma base visual a todas las páginas y estados del sitio.
  - **El sistema no deberá** permitir que una página o sección redefina colores, tipografía, espaciado o movimiento al margen de los valores compartidos.
  - **Cuando** se añada una página o sección nueva, **el sistema deberá** heredar la base visual sin requerir ajustes de estilo propios.

### RF-17 — Impacto visual deliberado y memorable

- **Criterios de aceptación (EARS):**
  - **El sistema deberá** incluir en cada página al menos un **momento visual deliberado** (titular a gran escala, bloque invertido, retícula, composición asimétrica o revelado contenido) que aporte personalidad sin competir con la lectura.
  - **El sistema deberá** conseguir el impacto mediante tipografía, composición, contraste y movimiento, no mediante color de acento, ilustraciones recargadas ni efectos gratuitos.
  - **Cuando** el visitante prefiera movimiento reducido, **el sistema deberá** conservar el impacto visual mediante composición y tipografía estáticas.
  - **El sistema no deberá** sacrificar legibilidad, contraste, rendimiento, semántica ni accesibilidad para conseguir impacto visual.
  - **El sistema deberá** verse intencionado y editorial en ambos temas, nunca como una plantilla genérica ni como una inversión plana de colores.

## 5. Requisitos no funcionales

- **NFR-1 — Contraste (WCAG 2.2 AA).** Todo texto normal alcanzará al menos 4,5:1 sobre su fondo; el texto grande, al menos 3:1; los componentes de interfaz, bordes relevantes e indicadores de foco, al menos 3:1. Se verificará en todos los pares rol/fondo de ambos temas.
- **NFR-2 — Accesibilidad más allá del color.** Ningún estado, enlace o jerarquía se comunicará solo mediante color. Se mantendrá la legibilidad con zoom del 200 %, con reflow a 320 px y con colores forzados de alto contraste del sistema operativo.
- **NFR-3 — Rendimiento y estabilidad visual.** La base visual no bloqueará el primer renderizado, no provocará desplazamientos perceptibles por la carga de tipografía y no incluirá animaciones decorativas infinitas ni recursos pesados de terceros. Los revelados de entrada se implementarán con CSS/Tailwind, serán breves y no bloquearán la lectura.
- **NFR-4 — Respuesta percibida.** El cambio de tema se percibirá inmediato (sin recarga ni re-descarga de contenido) y no perderá el estado de la página.
- **NFR-5 — Compatibilidad.** El sitio se verá y funcionará correctamente en las dos últimas versiones de Chrome, Firefox, Safari y Edge, tanto en escritorio como en móvil, sin degradaciones que rompan la legibilidad o el tema.
- **NFR-6 — Fuente única de verdad.** Los valores de color, tipografía, espaciado, foco y movimiento se definirán una sola vez y todas las pantallas los consumirán; no se duplicarán valores a mano.
- **NFR-7 — Privacidad.** La preferencia de tema se conservará únicamente en el navegador del visitante (`localStorage`); no se enviará a terceros ni se usará para rastreo.
- **NFR-8 — Dependencias.** No se añadirán dependencias nuevas para implementar esta funcionalidad; se usará lo ya disponible en el stack aprobado (Next.js, React, TypeScript, Tailwind, Geist Mono).
- **NFR-9 — Contenido bilingüe.** Cualquier texto visible asociado al tema (estado del botón y nombre accesible) existirá en inglés y castellano conforme a la constitución (`docs/constitution.md`) y se almacenará en los diccionarios i18n del proyecto.
- **NFR-10 — Impacto sin dependencias.** El impacto visual se conseguirá con CSS/Tailwind, tipografía y composición, sin añadir librerías de animación, fuentes adicionales ni assets pesados. La identidad debe mantenerse reconocible en ambos temas y en cualquier tamaño de pantalla.

## 6. Casos límite

1. **Primera visita con el sistema en oscuro:** se muestra el tema oscuro, sin transición ni destello claro.
2. **Elección guardada contraria a la del sistema:** prevalece la elección guardada; el sistema operativo no la sobrescribe a menos que la opción activa sea "sistema".
3. **El sistema cambia de tema con la web abierta y el visitante nunca eligió (o eligió "sistema"):** la web acompaña el cambio sin recargar.
4. **El sistema cambia de tema con una elección manual activa (claro u oscuro):** la web no cambia.
5. **Preferencia guardada inválida o corrupta:** se ignora, se usa la preferencia del sistema y no se muestra ningún error.
6. **Navegador en modo privado o con almacenamiento bloqueado o lleno:** la opción elegida funciona durante la visita; solo se pierde al cerrar y el control sigue operativo.
7. **Dos pestañas abiertas con temas distintos:** al cambiar en una pestaña, las demás pestañas con el mismo origen reflejan la nueva preferencia mediante el evento `storage` sin perder contenido ni posición de lectura.
8. **JavaScript desactivado o fallido:** la página se muestra legible con el tema del sistema; el control de tema puede quedar inerte, pero la página sigue funcional y no aparece ningún aviso.
9. **Tipografía no disponible o red lenta:** se usa una monoespaciada del sistema (`monospace`) sin salto perceptible de maquetación.
10. **Movimiento reducido activado:** el cambio de tema es instantáneo y no hay animaciones no esenciales.
11. **Alto contraste forzado por el sistema operativo:** el contenido sigue siendo legible y el foco visible aunque la paleta se sustituya.
12. **Zoom del 200 % o ventana de 320 px:** no hay desplazamiento horizontal ni texto recortado.
13. **Texto seleccionado sobre una superficie invertida:** la selección sigue siendo legible.
14. **Enlace dentro de un párrafo:** se distingue por subrayado incluso en escala de grises.
15. **Página larga:** la barra de desplazamiento es coherente con el tema activo en ambos temas.
16. **Cambio de idioma (futuro):** la base visual no depende del idioma y no cambia al alternarlo.
17. **Control de tema tras varias pulsaciones:** el botón avanza por los tres estados y siempre muestra el estado efectivo, también tras recargar.
18. **[Derogado por 003] Modal mostrado con JavaScript activo:** no existe modal.
19. **Movimiento reducido con revelados de entrada:** el contenido aparece completo desde el primer momento y el impacto se mantiene mediante composición y tipografía estáticas.
20. **Titular *display* en pantalla de 320 px:** la escala se adapta sin desbordar, sin cortar palabras ni generar desplazamiento horizontal.

## 7. Fuera de alcance

- El contenido del currículum y las secciones del portfolio (presentación, experiencia, proyectos, contacto, etc.).
- Componentes de interfaz reutilizables (botones, tarjetas, navegación, formularios, badges), excepto los fundamentos del control de tema, cuya forma se especifica en la 004.
- El sistema completo de internacionalización (`i18n`) y los diccionarios de textos, más allá de las cadenas asociadas al control de tema.
- Impresión y exportación a PDF.
- Temas adicionales, personalización de acento, densidad o tipografía por parte del visitante.
- Efectos decorativos gratuitos, animaciones infinitas, parallax pesado, 3D y cualquier recurso que sacrifique rendimiento o accesibilidad por espectáculo.
- Iconografía, ilustraciones, imágenes, favicon y metadatos SEO. El impacto de esta base visual se consigue con tipografía, composición y movimiento contenido; las imágenes se definirán en funcionalidades posteriores.
- Estados de error, aviso o éxito: el sitio no tiene formularios ni acciones con error.

## 8. Criterios de finalización

La funcionalidad se considerará terminada cuando:

- [ ] La paleta monocroma cálida está definida para ambos temas con roles semánticos documentados.
- [ ] La identidad se percibe como minimalista pero visualmente espectacular: contraste editorial, escala *display* y composición intencionada, nunca una plantilla genérica.
- [ ] Cada página incluye al menos un momento visual deliberado y memorable (titular a gran escala, bloque invertido, retícula, asimetría o revelado contenido).
- [ ] El texto corrido respeta una medida máxima de 65ch, mientras las composiciones *full-bleed* aprovechan todo el ancho disponible.
- [ ] `Geist Mono` es la fuente exclusiva para todo el texto visible; no hay `font-weight` superior a 400 ni segunda familia para texto corrido.
- [ ] El control de tema es un único botón visible desde la carga inicial, alterna claro, oscuro y sistema, y muestra el estado efectivo.
- [ ] El tema por defecto en la primera visita sigue la preferencia del sistema; la opción "sistema" funciona en tiempo real.
- [ ] La elección (claro/oscuro/sistema) se persiste en `localStorage` y se sincroniza entre pestañas del mismo navegador.
- [ ] No se observa destello de tema incorrecto al cargar ni al navegar con una elección previa.
- [ ] La transición de tema es suave (150–400 ms) con easing suave; con `prefers-reduced-motion` es instantánea.
- [ ] Los revelados de entrada y microinteracciones son contenidos, se implementan con CSS/Tailwind, no bloquean la lectura y se desactivan con `prefers-reduced-motion`.
- [ ] Se ha verificado el contraste AA (4,5:1 texto / 3:1 interfaz) en ambos temas y en todos los roles.
- [ ] Foco de teclado visible y operable en todas las páginas, sin eliminarlo en ningún caso.
- [ ] Enlaces y estados se distinguen sin depender del color (subrayado, contraste, superficie).
- [ ] Reflow correcto a 320 px y zoom al 200 % sin desplazamiento horizontal.
- [ ] No existe selector oculto ni aviso modal; con JavaScript desactivado el sitio sigue funcional y no muestra errores.
- [ ] Comprobados los casos límite 1–18 en al menos un navegador de escritorio y uno móvil.
- [ ] Existen pruebas automatizadas del cambio de tema, la persistencia, la sincronización, el ciclo de estados del botón, el comportamiento sin JavaScript y la ausencia de destello, además de una prueba end-to-end del flujo completo.
- [ ] Lint, typecheck y pruebas en verde; sin dependencias nuevas.

## 9. Dudas abiertas (resueltas y pendientes)

- **[RESUELTA]** ¿Cómo se consigue que el diseño sea minimalista pero visualmente espectacular? → **Menos elementos, máxima presencia:** contraste crudo/negro, escala tipográfica editorial, composición asimétrica, espacio negativo generoso, retícula y movimiento contenido. Sin color de acento, decoración recargada ni dependencias extra.
- **[RESUELTA]** ¿Qué familia monoespaciada concreta se usará? → **Geist Mono** (incluida en el scaffold; pesos 400 y 400 itálico; jerarquía sin negrita).
- **[RESUELTA]** ¿En qué idiomas debe existir el texto del control de tema? → **Inglés y castellano** (en diccionarios i18n).
- **[ACTUALIZADA por 004]** ¿Se ofrece la opción de "sistema" junto a claro y oscuro? → **Sí**, como tercer estado del botón de tema.
- **[RESUELTA]** ¿Se sincroniza la preferencia entre pestañas? → **Sí**, mediante el evento `storage`.
- **[DEROGADA por 003 y 004]** ¿Cómo se revela el selector si está oculto por defecto? → **No se revela: no hay selector oculto.** El control es un único botón siempre visible.
- **[DEROGADA por 003]** ¿El modal es bloqueante? → **No hay modal.**
- **[RESUELTA]** ¿Valores exactos de paleta? → **Escala de 5 grises cálidos (`--warm-1` a `--warm-5`)** con nombres en inglés.
- **[RESUELTA]** ¿Anchura máxima? → **65ch**.
- **[RESUELTA]** ¿Umbral de texto grande para contraste 3:1? → **≥ 18 px** (o 14 px itálico).
- **[RESUELTA]** ¿Mecanismo para controles nativos del navegador? → **Propiedad CSS `color-scheme`**.
- **[ACTUALIZADA por 004]** ¿Dónde vive el control de tema? → **En la cabecera del sitio**, como componente reutilizable de una sola responsabilidad.
- **[RESUELTA]** ¿Dónde viven las cadenas del control de tema? → **En diccionarios i18n** (inglés y castellano).

**Estado del cribado:** todas las ambigüedades, contradicciones y casos límite detectados en la auditoría QA quedan resueltos en este documento. El spec se mantiene en **Borrador**; el spec Activo que respaldará el código será `specs/001-styles-globals/implementation.md`.