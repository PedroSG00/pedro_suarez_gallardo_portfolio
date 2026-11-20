# 06 — Shell y Hero

**Estado:** Implementada.
**Depende de:** 04 (átomos de UI) y 05 (movimiento y revelado). **Consume:** 02 (i18n) y 03 (tema).
**Enmienda:** RF-11 de la spec 05.

## Contexto y objetivo

La home es el sitio. La barra y el pie la enmarcan; el hero es lo primero que se ve y la promesa del resto. Esta spec define el comportamiento de la shell y del hero para que el sitio sea memorable a primera vista en ambos temas e idiomas, la navegación funcione por teclado y el momento firma del hero sea comprobable.

Esta spec decide qué se ve y qué se garantiza; la arquitectura y los valores de implementación corresponden al plan.

**Enmienda a la 05.** RF-11 de la 05 prohíbe que la navegación y los elementos fijos se oculten por scroll. Aquí se enmienda: la barra puede salir de la vista al bajar, pero nunca se atenúa, nunca se desvanece y nunca participa en el revelado. La enmienda se escribe también en la 05 y en el README en el mismo cambio.

## Usuarios

- Reclutadores (principal) y clientes potenciales (secundario).
- Visitantes en móvil, de 320 a 430 px.
- Visitantes que navegan solo con teclado o con lector de pantalla.
- Visitantes con sensibilidad al movimiento.
- Visitantes con baja visión o texto ampliado al 200 %.
- La persona que mantiene el sitio: las secciones 07–10 deben encajar sin reabrir la shell.

## Historias de usuario

1. Como reclutador, quiero entender en segundos quién es Pedro y qué construye.
2. Como visitante en móvil, quiero navegar sin que la barra me tape el contenido.
3. Como visitante, quiero que la barra reaparezca al subir para cambiar de sección sin volver arriba.
4. Como usuario de teclado, quiero orden predecible, salto al contenido y foco visible.
5. Como usuario de lector de pantalla, quiero oír el nombre una vez y saber qué hace cada control.
6. Como usuario con movimiento reducido, quiero el hero y la barra estáticos y completos.
7. Como usuario con baja visión, quiero contraste AA y un nombre legible también en contorno.
8. Como visitante que llega por ancla, quiero aterrizar en la sección correcta con su encabezado visible.
9. Como visitante que cambia de idioma, quiero seguir en la misma sección.
10. Como mantenedor, quiero que las secciones 07–10 rellenen destinos ya reservados sin tocar la navegación.

## Requisitos funcionales

### RF-1 — Barra de navegación

- Cuando la home se muestre en cualquiera de los dos idiomas, el sistema muestre una barra con identidad, cuatro enlaces de sección, control de tema y control de idioma.
- El sistema muestre `public/logo.svg` como identidad de inicio, lo invierta en modo oscuro y lo anuncie como «Pedro Suárez Gallardo» con texto alternativo. El favicon usa la misma marca en blanco sobre fondo oscuro.
- El sistema muestre la marca en un tamaño claramente legible y alineado con la altura de los controles de la barra.
- Cuando el usuario active la identidad estando en la home, el sistema suba al inicio y limpie el ancla de la URL.
- El sistema muestre los enlaces en el orden About, Work, Stack, Contact, con etiquetas en el idioma activo.
- El sistema no muestre enlaces a proyectos ni a rutas inexistentes.
- El sistema mantenga la barra fuera de cualquier bloque revelable y con opacidad 1, aunque salga de la vista.

### RF-2 — Destinos reservados

- El sistema exponga cuatro destinos con identificadores definitivos: About, Work, Stack y Contact.
- El sistema muestre en cada destino su número y etiqueta (`01 / ABOUT`, `02 / WORK`, `03 / STACK`, `04 / CONTACT`) como h2, con nombre accesible solo la etiqueta.
- El sistema no muestre contenido de cuerpo en los destinos; las specs 07–10 lo rellenan sin cambiar barra ni identificadores.
- Cuando el usuario llegue por ancla, el sistema deje el encabezado visible por debajo de la barra y actualice el hash.
- El sistema mantenga el mismo orden de destinos en ambos idiomas.

### RF-3 — Barra pegajosa y dirección del scroll

- Mientras la página esté arriba, el sistema muestre la barra.
- Cuando el usuario haga scroll hacia abajo más de 80 px, el sistema retire la barra de la vista con un deslizamiento de 200 ms, sin atenuarla ni desvanecerla.
- Cuando el usuario haga scroll hacia arriba, el sistema devuelva la barra a la vista.
- Cuando la página se desplace como consecuencia de activar un enlace de la barra, el sistema mantenga la barra visible; solo un scroll posterior del usuario puede ocultarla.
- Cuando el usuario llegue al final, el sistema mantenga la barra oculta hasta que suba o el foco entre en ella.
- Cuando el foco entre en un control de la barra oculta, el sistema la muestre de inmediato.
- El sistema mantenga la barra en el orden de tabulación y en el árbol de accesibilidad mientras está oculta.
- El sistema no muestre la barra translúcida ni con opacidad menor que 1, ni provoque saltos de layout.
- Cuando no haya JavaScript o el movimiento esté reducido, el sistema mantenga la barra siempre visible.

### RF-4 — Menú en pantallas estrechas

- Cuando el ancho sea menor que 768 px, el sistema sustituya los cuatro enlaces por un control de menú; desde 768 px, el sistema muestre los enlaces en línea.
- El sistema muestre el control solo con icono y con nombre accesible «Abrir menú» / «Open menu» cerrado y «Cerrar menú» / «Close menu» abierto, anunciando el estado expandido.
- Cuando el usuario active el control, el sistema superponga el menú y lo cierre al volver a activarlo o al elegir un enlace.
- Mientras el menú esté abierto, el sistema mantenga la barra visible aunque se haga scroll; el scroll interno del menú no lo cierra ni mueve la página.
- El sistema permita abrir y cerrar el menú con teclado, sin JavaScript y sin atrapar el foco.
- Sin JavaScript, el sistema no lo cierra al elegir un enlace; el usuario lo cierra con el control. Con JavaScript, el sistema lo cierra al elegir un enlace.
- El sistema mantenga los controles de tema e idioma fuera del menú y un único conjunto de enlaces en el orden de tabulación.
- El control hamburguesa aparezca a la derecha de tema e idioma. Al abrir, el panel entra con una transición breve; con movimiento reducido aparece sin animación.
- El sistema no bloquee el scroll de la página al abrir el menú.

### RF-5 — Enlace de salto

- El sistema sitúe el enlace de salto al contenido como primer elemento enfocable.
- Mientras no reciba foco, el sistema lo mantenga oculto visualmente pero disponible para lectores de pantalla.
- Cuando reciba foco, el sistema lo muestre con contraste AA y foco visible.
- Cuando el usuario lo active, el sistema lleve el foco al contenido principal, saltando la barra.
- El sistema muestre su texto en el idioma activo.

### RF-6 — Tema e idioma

- Cuando el usuario active el control de tema, el sistema cambie entre claro y oscuro sin recargar y anuncie el estado resultante.
- Cuando el usuario active el control de idioma, el sistema cambie entre inglés y castellano sin recargar, conservando el ancla y la posición visible; en la 404, conserve la 404 traducida. El cambio no anima ni reinicia el scroll.
- El sistema mantenga ambos controles visibles en la barra en todos los anchos, alcanzables por teclado y sin duplicarlos en la misma vista.
- El sistema oculte el control de tema cuando no haya JavaScript.
- El sistema muestre el estado del tema y del idioma sin depender solo del color.
- El icono de tema represente el tema que realmente se está mostrando, incluida la preferencia del sistema cuando no existe una selección guardada, y siga correcto tras cambiar de idioma.
- El sistema garantice un área de contacto de al menos 24 × 24 px en los controles.

### RF-7 — Contenido del hero

- Cuando la home se renderice, el sistema muestre el hero como primer bloque, con el nombre como único h1, rol, pitch, línea de apoyo, línea de metadatos y dos llamadas a la acción.
- El sistema anuncie el nombre completo como una sola cadena y no como tres encabezados ni letras sueltas.
- El sistema muestre la línea de metadatos como texto plano: «3+ YEARS / ES · EN» y «3+ AÑOS / ES · EN».
- Cuando el usuario active la llamada principal, el sistema lo lleve al destino de Work; la secundaria, al de Contact.
- El sistema acepte que Work y Contact estén vacíos en esta fase; el sitio no se publica hasta que la 08 y la 10 los rellenen.
- El sistema no incluya fotografía ni contenido de otras secciones, ni invente cifras o datos.
- El sistema aplique el revelado `rise` a rol, pitch, apoyo, metadatos y CTAs, con las dos CTAs escalonadas como grupo; el nombre no se envuelve en el revelado.

### RF-8 — Nombre a todo el ancho

- El sistema componga el nombre en tres líneas, una por palabra, con el mismo tamaño y alineación a la izquierda.
- El sistema haga que la línea más larga defina el ancho del bloque.
- Cuando el ancho sea 360, 768 o 1440 px, el sistema muestre el bloque ocupando al menos el 90 % del ancho disponible, descontando el margen de la retícula.
- Para reducir la altura óptica sin perder ese ancho, el sistema aplica la escala y el tracking del nombre desde tokens y verifica el ancho real en Chromium.
- Cuando el ancho sea 320 px, el sistema permita que el bloque baje del 90 % antes que provocar scroll horizontal.
- Cuando el ancho supere 1920 px, el sistema limite el nombre al ancho de la retícula; el 90 % solo se exige hasta 1440 px.
- El sistema no parta palabras ni provoque scroll horizontal entre 320 y 1920 px.
- Cuando el texto se amplíe al 200 %, el sistema permita refluir a más líneas antes que provocar scroll horizontal; la legibilidad prevalece sobre las tres líneas.

### RF-9 — Entrada y cursor

- Cuando la home cargue con el hero visible, el sistema haga entrar las tres líneas escalonadas desde abajo, con un total no superior a 600 ms.
- El sistema complete la entrada en el estado final visible y no la repita al hacer scroll.
- El sistema muestre un cursor al final de la última línea, con ciclo de 1 s y 50 % encendido, visible en relleno y contorno, decorativo y oculto a lectores de pantalla.
- Cuando el movimiento esté reducido, el sistema muestre el nombre completo de inmediato y el cursor estático y visible.
- Si la animación no puede ejecutarse, el sistema muestre el nombre completo sin depender de ella.

### RF-10 — Contorno y parallax

- Cuando el usuario haga scroll desde arriba, el sistema transforme el nombre de relleno a contorno y complete el contorno al salir el hero de la pantalla.
- El relleno permanece sólido durante el primer 80 % de la salida y se vuelve transparente solo en el tramo final; la transición no deja fragmentos ni artefactos de rasterizado.
- Mientras el hero esté en pantalla, el sistema desplace el nombre verticalmente como máximo un 20 % de la altura del hero.
- El sistema mantenga el nombre dentro del hero, sin solaparse con el resto del contenido del hero ni con el contenido siguiente, y revierta el efecto al volver arriba.
- El sistema mantenga el nombre legible con contraste AA para texto grande (3:1) en ambos temas, medido sobre la silueta del trazo.
- Cuando el navegador no soporte animación ligada al scroll o el movimiento esté reducido, el sistema muestre el nombre sólido y estático.
- El sistema no oculte el nombre ni lo sustituya por una imagen en ningún estado.

### RF-11 — Pie de página

- Cuando la home se renderice, el sistema muestre un pie con GitHub, LinkedIn, email, CV y «© 2026 Pedro Suárez Gallardo».
- Cuando el usuario active el email, el sistema abra el cliente de correo.
- Cuando el usuario active GitHub, LinkedIn o el CV, el sistema abra el destino en pestaña nueva y lo anuncie con un texto solo para lectores de pantalla, traducido.
- El sistema muestre el icono correspondiente de GitHub, LinkedIn, email y documento CV en cada enlace; los iconos decorativos no alteren sus nombres accesibles.
- El sistema use el CV del idioma activo.
- El sistema no muestre controles de tema ni de idioma en el pie, mantenga el pie fuera del revelado y no lo haga pegajoso.
- El sistema tome los enlaces y el email de los datos del sitio y los textos de los mensajes, sin hardcodearlos en la interfaz.

### RF-12 — Navegación por teclado

- El sistema permita recorrer con Tab: salto al contenido, identidad, enlaces o control de menú, tema, idioma, contenido principal y enlaces del pie.
- El sistema muestre un indicador de foco visible en cada elemento interactivo, en ambos temas.
- Cuando el usuario active un enlace o control con Enter o Espacio, el sistema ejecute su acción.
- El sistema no atrape el foco en ningún elemento, incluido el menú.
- Cuando el foco entre en la barra oculta, el sistema la muestre.
- El sistema mantenga el orden de tabulación coherente con el orden visual y un único conjunto de enlaces de sección.

### RF-13 — Llegada a una sección

- Cuando el usuario active un enlace de sección, el sistema desplace la página, actualice el ancla y deje el encabezado visible por debajo de la barra.
- Con `prefers-reduced-motion: no-preference`, el navegador desplaza suavemente al destino usando CSS nativo; con movimiento reducido, el desplazamiento es instantáneo.
- Cuando la página llegue por ancla, el sistema mueva el foco al encabezado del destino y continúe la tabulación dentro de la sección.
- El sistema muestre el contenido del destino completo al llegar, sin bloques a medio revelar.
- Cuando el usuario cambie de idioma con un ancla activa, el sistema conserve el ancla y el destino equivalentes.
- Cuando el usuario active un enlace de sección desde la 404, el sistema navegue a la home del idioma + ancla.
- Si el destino no existe, el sistema no navegue ni rompa la página.
- Al recargar, el sistema restaura de forma instantánea la misma posición, sin un segundo salto provocado por el anclaje del layout.

### RF-14 — Shell en todas las rutas

- Cuando el usuario visite la home o la página de no encontrado, el sistema muestre barra y pie.
- El sistema mantenga la shell en el idioma de la ruta; en la 404, el cambio de idioma conserva la 404 traducida.
- El sistema renderice barra, pie y hero de forma estática, sin depender de JavaScript para mostrarse.
- El sistema no muestre enlaces del shell a rutas inexistentes.
- Al cambiar de idioma con navegación cliente, el sistema no produzca errores de React por volver a renderizar el script inicial del tema.

## Requisitos no funcionales

- **Accesibilidad:** contraste AA en ambos temas y en relleno/contorno; semántica de regiones y encabezados; teclado sin trampas; foco visible; nombre anunciado una vez; cursor y decoración ocultos; estado del menú y del tema anunciado; 24 × 24 px de área de contacto; 200 % de texto sin pérdida ni scroll horizontal; colores forzados sin ocultar el nombre.
- **i18n:** todo texto visible en inglés y castellano, mismas claves y mismo cambio; nada hardcodeado; metadatos traducidos; copyright idéntico; cambio de idioma conserva página y ancla.
- **Movimiento:** sin librerías; duraciones del sistema de movimiento (barra 200 ms, hero ≤600 ms, cursor 1 s); `prefers-reduced-motion` desactiva entrada, parpadeo, contorno, parallax y ocultación de la barra; sin soporte de animación ligada al scroll, nombre sólido y barra visible; ningún contenido depende del efecto.
- **Scroll:** los anclajes usan el desplazamiento suave nativo solo sin preferencia de movimiento reducido. Recargas y cambios de idioma preservan la posición sin animarla; navegar desde la barra no la oculta.
- **Rendimiento:** el mayor elemento de la primera pantalla es texto; sin saltos de layout; espacio del nombre reservado desde el primer fotograma; sin scroll horizontal entre 320 y 1920 px.
- **Estático y sin JS:** barra, pie y hero renderizados estáticamente por idioma; contenido visible sin JS; menú, anclas, salto e idioma operativos; control de tema oculto; sin desajustes de hidratación.
- **Robustez:** si falta un texto o un dato, el resto se renderiza sin error; ancla inexistente sin navegación ni ruptura; enlace externo fallido sin romper la página; estados de menú y barra se reinician al navegar; sin errores de consola al cambiar de locale.
- **Impresión:** se imprime el contenido sin barra ni pie; el nombre se imprime sólido y sin animaciones.
- **Compatibilidad:** navegadores actuales de escritorio y móvil; la verificación de Safari y Firefox y el fallback final corresponden a la spec 12.

## Casos límite

- 320 px: el nombre puede bajar del 90 %; el menú y los controles caben sin scroll horizontal.
- 768 px: un solo conjunto de enlaces, menú o en línea, nunca ambos.
- 1920 px o más: el nombre se limita a la retícula; el 90 % solo se exige hasta 1440.
- Texto al 200 %: el nombre refluye a más líneas; sin scroll horizontal.
- Viewport corto: el hero puede requerir scroll; nada se recorta.
- Final de página: barra oculta hasta subir o enfocar.
- Foco en la barra oculta: la barra aparece y el foco queda dentro de la pantalla.
- Menú abierto y scroll: sigue abierto, la barra visible y el scroll interno no lo cierra.
- Menú abierto y resize a escritorio: se cierra y aparecen los enlaces en línea.
- Menú abierto y cambio de idioma: la nueva página carga con el menú cerrado.
- Menú más alto que el viewport: scroll interno sin cerrarlo.
- Ancla ya visible: se actualiza el hash y el foco se mueve al encabezado.
- Ancla inexistente: no navega ni rompe.
- Movimiento reducido: sin entrada, parpadeo, contorno, parallax ni ocultación; todo visible y el menú operativo.
- Sin JavaScript: barra siempre visible; menú, anclas, salto e idioma operativos; el menú no se cierra solo al elegir enlace; el control de tema no aparece.
- Sin soporte de animación ligada al scroll: nombre sólido y estático.
- Colores forzados: el nombre y los controles siguen visibles.
- Impresión: nombre sólido y sin shell.
- Lector de pantalla: nombre una vez, cursor no anunciado, estado del menú comunicado.
- Cambio de tema con el nombre contorneado: contraste mantenido, sin parpadeo.
- Cambio de idioma con el nombre contorneado: la nueva página empieza sólida.
- Historial con ancla: la llegada deja el destino completo.
- Recarga: se restaura instantáneamente la posición anterior, sin una corrección posterior del navegador.
- Navegación iniciada desde la barra: esta permanece visible hasta que el usuario vuelva a desplazarse.
- 404: enlaces a home + ancla; idioma conserva la 404 traducida.

## Fuera de alcance

- Contenido de cuerpo de las secciones 07–10; aquí solo se reservan sus destinos.
- Indicación de la sección activa en la barra (scroll spy).
- Proyectos y `/projects/[slug]`.
- Formulario de contacto.
- Fotografía en el hero.
- Controles duplicados de tema o idioma en el pie.
- Botón de volver arriba.
- Animación de cierre del menú y trampa de foco.
- Bucles de scroll suave programados en JavaScript; se permite el comportamiento suave nativo de CSS cuando no se reduce el movimiento.
- Metadatos SEO, `hreflang`, sitemap, robots e imagen OG (spec 11).
- Auditoría final de accesibilidad, rendimiento y Safari/Firefox (spec 12).
- Cambios de contenido, cifras o PDFs del CV.
- Animaciones de hover o clic más allá de los estados de los átomos.

## Criterios de finalización

- Tests de comportamiento de barra, menú, salto, pie y hero: contenido, roles, nombres accesibles, estado expandido, enlaces y CTAs.
- El nombre se prueba como una sola cadena accesible y el cursor como decoración oculta.
- E2E en `/en` y `/es`, tema claro y oscuro: navegación por las cuatro anclas, foco y orden de tabulación, salto, ocultación/reaparición de la barra, menú a 360 px y ausencia de enlaces duplicados.
- E2E de movimiento: entrada ≤600 ms, contorno y parallax reversibles, sin salir del hero ni provocar scroll horizontal; reduced motion y no-JS.
- E2E de navegación: recarga y cambio de idioma mantienen la posición; anclas suaves sin movimiento reducido e instantáneas con `reduce`; la barra no se oculta al navegar desde ella.
- El logo de la barra carga `public/logo.svg` y el favicon muestra esa marca en blanco.
- El ancho del nombre en 360, 768 y 1440 px se verifica fuera de los flujos críticos de Playwright.
- Sin scroll horizontal entre 320 y 1920 px.
- Contraste AA en ambos temas y en ambos estados del nombre.
- Paridad de claves entre `messages/en.json` y `messages/es.json`.
- RF-11 de la 05 enmendado y README corregido en el mismo cambio.
- Cobertura ≥85 % y `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` y `pnpm test:e2e` en verde.
- La pasada final de accesibilidad, rendimiento y compatibilidad se cierra en la spec 12.

## Decisiones

- Barra pegajosa: se oculta tras 80 px hacia abajo con deslizamiento de 200 ms y reaparece al subir; sigue en tabulación y árbol de accesibilidad.
- Menú por debajo de 768 px, solo icono, superpuesto; se cierra con el control o un enlace; abierto mantiene la barra visible y no cierra con el scroll.
- Sin JS, el menú no se cierra solo al elegir enlace; con JS, sí.
- Destinos reservados con `01 / ABOUT` visual, nombre accesible «About» y h2; 07–10 los rellenan.
- El retrato `public/pedro-suarez.png` queda reservado para About/spec 07, no para el hero; su integración se difiere por decisión del usuario.
- Hero con el brief completo; CTAs a Work y Contact; destinos vacíos hasta 08/10.
- Nombre en tres líneas, mismo tamaño, izquierda; 90 % en 360/768/1440; 320 puede bajar; tope 1920.
- Contorno completo al salir el hero; parallax máximo 20 %; contraste 3:1 sobre la silueta.
- Cursor de 1 s al 50 %, visible en relleno y contorno; estático visible con reduced motion.
- Rol, pitch, apoyo, metadatos y CTAs con `rise`; CTAs escalonadas; el nombre fuera del revelado.
- Metadatos traducidos; copyright 2026 fijo; enlaces externos en pestaña nueva con aviso solo para lectores.
- Identidad «Pedro Suárez Gallardo», hero h1, destinos h2; en la home, la identidad sube y limpia el ancla.
- Control de tema oculto sin JS; 24 × 24 px de área de contacto; impresión sin barra ni pie.
- E2E de navegación y movimiento; ancho del nombre fuera de los flujos críticos.
- Enmienda de la 05 y corrección del README en el mismo cambio, sin reabrir gates.

## Dudas abiertas

Ninguna.
