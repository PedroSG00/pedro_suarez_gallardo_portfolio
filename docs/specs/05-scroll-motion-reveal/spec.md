# Spec 05 — Movimiento y revelado por scroll (Reveal)

## Contexto y objetivo

La home del portfolio es una pieza editorial de una sola página compuesta por secciones apiladas verticalmente. Cada bloque de contenido (titulares, párrafos, filas, grupos y llamadas a la acción) debe aparecer al visitante a medida que avanza por la página, respetando el principio de que el estado visual depende solo de la posición del bloque respecto a la pantalla, nunca del historial de scroll.

El objetivo de esta spec es garantizar que el sistema de revelado:

- Muestre cada bloque con opacidad completa en algún momento de su recorrido vertical.
- Mantenga el contenido siempre legible, incluso sin JavaScript, sin soporte de animación por scroll o con movimiento reducido.
- Nunca oculte contenido por error, resize, scroll rápido o cambio de idioma/tema.

Esta spec define qué garantiza el sistema de revelado, no qué variante lleva cada bloque concreto. La asignación de variantes (`rise`, `clip`, `fade`) y el escalonado por grupo se deciden en las specs de sección (06 a 10).

## Usuarios

- Reclutadores que navegan la home en `/en` y `/es`, en tema claro y oscuro, buscando evaluar el perfil del desarrollador.
- Usuarios con preferencia de movimiento reducido (`prefers-reduced-motion: reduce`).
- Usuarios en navegadores sin soporte para animación ligada al scroll (por ejemplo, Safari y Firefox en el momento de redacción).
- Usuarios que acceden desde dispositivos móviles con redimensionamiento, giro de pantalla o texto ampliá al 200 %.
- Usuarios que saltan a una sección desde la navegación por anclas.

## Historias de usuario

1. Como visitante, quiero que cada bloque de contenido se revele progresivamente al hacer scroll para poder leerlo sin sentirme abrumado.
2. Como visitante con movimiento reducido, quiero que todo el contenido sea visible sin animaciones para no sufrir molestias visuales.
3. Como visitante en un navegador sin soporte de animación por scroll, quiero que el contenido siga siendo completo y legible.
4. Como visitante que salta a una sección desde la navegación, quiero que el bloque de destino esté completo al llegar, no a medio revelar.
5. Como visitante que cambia de idioma o de tema, quiero que no queden bloques ocultos ni se produzcan parpadeos.

## Requisitos funcionales

Cada requisito se expresa con criterios de aceptación en notación EARS (español), como comportamientos observables: opacidad al entrar por abajo, centrado y al salir por arriba, en `/en` y `/es`, en tema claro y oscuro.

**RF-01 — Revelado progresivo de bloques (regla general)**

Cuando un bloque de contenido entra por la parte baja de la pantalla, el sistema muestra su opacidad por debajo de 1; cuando el bloque ocupa la zona central de la pantalla, el sistema muestra opacidad igual a 1; cuando el bloque sale por la parte alta de la pantalla, el sistema muestra opacidad por debajo de 1.

Criterios de aceptación:
- Cuando un bloque está en su fase de entrada, su opacidad computada es menor que 1.
- Cuando un bloque está en su fase estable, su opacidad computada es igual a 1.
- Cuando un bloque está en su fase de salida, su opacidad computada es menor que 1.
- El comportamiento se verifica en `/en` y en `/es`, en tema claro y oscuro.

**Precedencia de excepciones sobre RF-01**

Las siguientes reglas prevalecen sobre RF-01, por este orden: RF-10 (fallo seguro), RF-11 (exclusiones), RF-03 (visible al cargar), RF-05 (sin scroll suficiente) y RF-04 (último bloque).

**RF-02 — Fases del bloque por posición de los bordes respecto a la pantalla**

Las fases se definen por la posición de los bordes del bloque respecto a la pantalla:

- **Entrada**: mientras el borde superior del bloque está en el cuarto inferior de la pantalla.
- **Estable (opacidad = 1)**: el resto del tiempo, salvo que se aplique la fase de salida.
- **Salida**: mientras el borde inferior del bloque está en el cuarto superior de la pantalla.

Entrada y salida nunca se solapan. Un bloque alto nunca se atenúa mientras una parte suya aún no se ha visto completa.

Para que los criterios de aceptación no dependan de un píxel exacto, se verifican con márgenes de seguridad:

- La opacidad es menor que 1 si el borde superior del bloque está en el 15 % inferior de la pantalla (entrada) o si el borde inferior está en el 15 % superior de la pantalla (salida).
- La opacidad es igual a 1 si el borde superior del bloque está por encima del 70 % de la altura de la pantalla y el borde inferior está por debajo del 30 % de la altura de la pantalla.
- Entre el 15 % inferior y el 70 % para el borde superior, y entre el 30 % y el 15 % superior para el borde inferior, la opacidad es continua y monótona. Sin saltos, y no se verifica un valor concreto.

Criterios de aceptación:
- Cuando el borde superior del bloque está en el 15 % inferior de la pantalla, su opacidad computada es menor que 1.
- Cuando el borde inferior del bloque está en el 15 % superior de la pantalla, su opacidad computada es menor que 1.
- Cuando el borde superior del bloque está por encima del 70 % de la altura de la pantalla y el borde inferior está por debajo del 30 %, su opacidad computada es igual a 1.
- En las franjas intermedias, la opacidad es continua y monótona.
- El comportamiento se verifica en `/en` y en `/es`, en tema claro y oscuro.

**RF-03 — Bloques ya visibles al cargar**

Lo que ya está en pantalla al cargar, sin hacer scroll, se ve completo desde el primer fotograma. No hay entrada ni parpadeo inicial.

Criterios de aceptación:
- Cuando la página carga sin scroll previo, los bloques inicialmente dentro de la zona visible muestran opacidad igual a 1 desde el primer fotograma.
- No se produce una transición de entrada visible para bloques ya en pantalla al cargar.

**RF-04 — Último bloque de la última sección sin salida**

La última sección de la página (Contact) no tiene salida: ninguno de sus bloques se desvanece al salir. Al llegar al final de la página, todo bloque de la última sección tiene opacidad igual a 1 aunque no haya completado su entrada.

Criterios de aceptación:
- Cuando el usuario llega al final de la página, todos los bloques de la última sección muestran opacidad igual a 1.
- Ningún bloque de la última sección muestra una fase de salida por la parte alta de la pantalla.

**RF-05 — Pantalla sin scroll suficiente**

Cuando la página no tiene scroll suficiente (pantallas muy altas), todo el contenido es visible.

Criterios de aceptación:
- Cuando el alto total de la página es menor o igual al alto del viewport, todos los bloques muestran opacidad igual a 1 sin necesidad de scroll.

**RF-06 — Reversibilidad del efecto**

El efecto es reversible: al volver atrás en el scroll, el bloque se vuelve a revelar.

Criterios de aceptación:
- Cuando el usuario hace scroll hacia atrás después de que un bloque haya salido por la parte alta, el bloque vuelve a mostrar opacidad igual a 1 al ocupar de nuevo su fase estable.
- Cuando el usuario hace scroll hacia atrás después de que un bloque haya entrado por la parte baja, el bloque vuelve a mostrar opacidad menor que 1 al salir de su fase de entrada.

**RF-07 — Scroll rápido sin contenido oculto**

Con scroll rápido, el contenido nunca se queda a medias ni invisible al detenerse.

Criterios de aceptación:
- Cuando el usuario hace scroll rápido y se detiene, los bloques en su fase estable muestran opacidad igual a 1.
- Ningún bloque queda con opacidad menor que 1 de forma permanente tras detener el scroll rápido.

**RF-08 — Resize, giro de pantalla y zoom sin estados atascados**

Con resize, giro de pantalla y zoom (incluido texto ampliá al 200 %), el efecto se recalcula y nunca deja contenido oculto. Un estado atascado se define por comparación: tras resize, giro, zoom, scroll rápido o cambio de idioma/tema, la opacidad de cada bloque debe ser la misma que tendría llegando a esa misma posición con scroll normal (tolerancia 0,01).

Criterios de aceptación:
- Cuando el usuario cambia el tamaño de la ventana, gira la pantalla o amplia el texto al 200 %, los bloques en su fase estable muestran opacidad igual a 1.
- Tras un resize, giro o zoom, no queda ningún bloque con opacidad menor que 1 de forma permanente si ocupa su fase estable.

**RF-09 — Cambio de idioma o tema sin bloques ocultos ni parpadeos**

Cuando el usuario cambia de idioma o de tema, el sistema no deja bloques ocultos ni provoca parpadeos. Un parpadeo es que un bloque en zona estable baje de opacidad 1 en cualquier fotograma muestreado durante el cambio.

Criterios de aceptación:
- Tras cambiar de idioma (`/en` a `/es` o viceversa), los bloques en su fase estable muestran opacidad igual a 1.
- Tras cambiar de tema (claro a oscuro o viceversa), los bloques en su fase estable muestran opacidad igual a 1.
- No se produce un parpadeo visible de entrada o salida durante el cambio de idioma o de tema.

**RF-10 — Fallo seguro: contenido siempre completo**

Un fallo es cualquier situación en que el revelado no está activo: sin soporte del navegador, movimiento reducido, impresión o error. En todas, el estado es estático con opacidad 1 y sin desplazamiento. La estética nunca prima sobre la legibilidad.

Criterios de aceptación:
- Si falla el mecanismo de revelado, todos los bloques muestran opacidad igual a 1.
- El contenido nunca depende de JavaScript para verse, tampoco al imprimir.

**RF-11 — Exclusiones del reveal**

Quedan fuera del sistema de revelado: la barra de navegación, el pie de página, el enlace de salto al contenido y cualquier elemento fijo o pegajoso. Ningún elemento fijo o pegajoso puede estar dentro de un bloque revelable. Estos elementos nunca se ocultan por scroll.

Criterios de aceptación:
- La navegación, el pie de página, el enlace de salto al contenido y los elementos fijos o pegajosos mantienen opacidad igual a 1 en todo momento.
- Ninguno de estos elementos participa en el revelado por scroll (entrada, centro o salida).
- Ningún elemento fijo o pegajoso está contenido dentro de un bloque revelable.

**RF-12 — Salto por anclas: sección de destino completa**

Al saltar a una sección desde la navegación por anclas, todos los bloques de la sección de destino se ven completos al llegar, sin quedarse a medio revelar. Si el plan demuestra que esto no es posible solo con CSS, la regla se relaja a que el bloque de destino se ve completo al llegar, y esa relajación se anota en esta spec.

Criterios de aceptación:
- Cuando el usuario navega por ancla a una sección, todos los bloques de esa sección muestran opacidad igual a 1 al llegar.
- Ningún bloque de la sección de destino aparece a medio revelar tras un salto por ancla.

**RF-13 — Escalonado solo entre hermanos de un mismo grupo**

El retraso (`delay`) solo sirve para escalonar elementos hermanos dentro de un mismo grupo. No se encadena entre grupos ni se usa para retrasar bloques sueltos.

Grupo: conjunto de hermanos que se leen como una unidad (por ejemplo, las filas de Work o las etiquetas de un grupo de Stack). Qué constituye un grupo en cada sección lo decide su spec de sección.
Bloque suelto: el que no pertenece a ningún grupo.

Cada elemento hermano se retrasa respecto al anterior como un desfase dentro del recorrido de scroll. Máximo 6 elementos con desfase propio por grupo; los elementos restantes comparten el último desfase. El desfase total del grupo no supera 5 puntos del recorrido, y cada elemento completa su entrada antes de entrar en su fase estable. Los valores exactos de desfase y paso se definen en tokens de movimiento del tema y en el plan.

Criterios de aceptación:
- Dentro de un mismo grupo, los elementos hermanos pueden mostrar desfases escalonados en su revelado.
- Entre grupos diferentes no hay encadenamiento de desfases.
- Un bloque suelto fuera de un grupo no usa desfase de escalonado.
- El desfase total del grupo no supera 5 puntos del recorrido.
- Cada elemento del grupo completa su entrada antes de entrar en su fase estable.

**RF-14 — Sin variantes adicionales**

El sistema solo admite las variantes `rise`, `clip` y `fade`. No se definen nuevas variantes en esta spec.

Criterios de aceptación:
- Cada bloque revelado usa una de las tres variantes: `rise` (desplazamiento), `clip` (recorte) o `fade` (solo opacidad).
- No existen variantes adicionales definidas por esta spec.

**RF-15 — Foco por teclado**

Mientras un bloque contiene el elemento enfocado, su opacidad es 1. El foco nunca puede dejar un control atenuado u oculto.

Criterios de aceptación:
- Cuando un elemento dentro de un bloque recibe el foco por teclado, la opacidad computada de ese bloque es 1.
- Ningún control enfocado queda con opacidad menor que 1.

**RF-16 — Impresión**

Al imprimir, todos los bloques muestran opacidad igual a 1 y sin desplazamiento.

Criterios de aceptación:
- En modo impresión, todos los bloques revelables tienen opacidad computada igual a 1.

## Requisitos no funcionales

**Accesibilidad**
- Contraste AA mantenido en todo momento, tanto en estado revelado como en estado de entrada/salida.
- El contenido es operable por teclado y semánticamente correcto independientemente del estado de revelado.
- Durante entrada y salida el contenido sigue en el árbol de accesibilidad y es operable.
- El cumplimiento de accesibilidad se verifica en la spec 12.

**Movimiento reducido**
- Con `prefers-reduced-motion: reduce`, no hay animación ni desplazamiento; todo el contenido es visible. El impacto se sostiene con tipografía y composición estáticas.
- Este comportamiento se verifica en `/en` y `/es`, en tema claro y oscuro.

**Sin soporte de animación por scroll**
- En navegadores sin soporte para animación ligada al scroll, el contenido se muestra visible sin animar ("visible sin animar").
- En el MVP no hay mecanismo alternativo basado en JavaScript, para mantener la regla de "solo CSS".
- La verificación es compartida:
  - La spec 05 verifica el fallback en Chromium, simulando la ausencia de animación por scroll.
  - La spec 12 verifica el soporte real de Safari y Firefox y decide si se reabre la regla de "solo CSS". Si el comportamiento con fallback cumple la calidad esperada, no se cambia nada. Solo si la revisión demuestra que el fallback degrada de forma inaceptable la experiencia, se reabre la decisión. Antes de añadir cualquier mecanismo con JS, hay que enmendar la constitución (punto 1 y regla de "solo CSS") y esta spec. Mientras tanto, la spec 05 se da por terminada con el fallback actual.

**Rendimiento**
- El revelado no bloquea el hilo principal ni provoca caídas de tasa de fotogramas perceptibles.
- El recalculo ante resize, giro o zoom es eficiente y no deja contenido oculto.

**Contenido sin JS**
- El contenido es siempre visible sin JavaScript, incluyendo al imprimir.
- La experiencia con fallback es coherente y de calidad, no una versión rota.

## Escenarios de verificación

| Situación | Posición del bloque | Resultado esperado (opacidad computada) |
|---|---|---|
| Bloque entrando por la parte baja | Borde superior en el 15 % inferior de la pantalla | Menor que 1 |
| Bloque estable en zona central | Borde superior por encima del 70 % y borde inferior por debajo del 30 % | Igual a 1 |
| Bloque saliendo por la parte alta | Borde inferior en el 15 % superior de la pantalla | Menor que 1 |
| Página cargada sin scroll | Bloque inicialmente visible | Igual a 1 desde el primer fotograma |
| Pantalla sin scroll suficiente | Cualquier bloque | Igual a 1 sin scroll |
| Última sección al final de página | Cualquier bloque de Contact | Igual a 1, sin salida |
| Scroll rápido, tras detenerse | Bloque en zona estable | Igual a 1 |
| Resize / giro / zoom | Bloque en zona estable | Igual a 1, sin estado atascado |
| Cambio de idioma o tema | Bloque en zona estable | Igual a 1, sin parpadeo |
| Fallo del revelado | Cualquier bloque | Igual a 1 |
| Elemento enfocado dentro de un bloque | Cualquier posición | Igual a 1 |
| Impresión | Cualquier bloque | Igual a 1, sin desplazamiento |
| Navegación por ancla a una sección | Cualquier bloque de la sección destino | Igual a 1 |

Los tests consultan por rol, texto o etiqueta, nunca por clases ni estructura interna.

## Casos límite

- Bloque más corto que el viewport: está plenamente visible mientras ocupa su fase estable; nunca entra ni sale parcialmente de forma que quede oculto.
- Bloque más alto que el viewport: entra por su borde superior en el cuarto inferior de la pantalla y sale por su borde inferior en el cuarto superior; nunca se atenúa mientras una parte suya aún no se ha visto completa.
- Bloque de altura igual a la pantalla: estable cuando su borde superior ya subió del cuarto inferior y el inferior no ha llegado al cuarto superior.
- Último bloque que nunca llega a centrarse: si pertenece a la última sección, queda plenamente visible al final y nunca se desvanece.
- Página sin scroll suficiente: todo visible desde el primer fotograma.
- Scroll rápido y parada brusca: ningún bloque queda a medio revelar ni invisible.
- Cambio de idioma o tema durante el scroll: no deja bloques ocultos ni parpadeos.
- Resize, giro de pantalla y zoom al 200 %: el efecto se recalcula sin estados atascados.
- Salto por ancla a una sección: todos los bloques de la sección de destino están completos al llegar.
- Elementos fijos o pegajosos (nav, footer, salto al contenido): nunca participan en el reveal.
- Ningún elemento fijo o pegajoso dentro de un bloque revelable.
- Movimiento reducido con resize, giro o zoom: mismo comportamiento que el estático, todo visible.

## Fuera de alcance

- Parallax y paso a contorno del Hero (pertenecen a la spec 06).
- Efectos propios de cada sección: frase que se ilumina palabra a palabra, inversión de filas en hover, etc. (pertenecen a las specs 07 a 10).
- Animaciones por clic o hover.
- Scroll programático o suave.
- Cualquier librería de animación.
- Cualquier mecanismo alternativo basado en JavaScript para el revelado.
- Nuevas variantes más allá de `rise`, `clip` y `fade`.
- Revelado de elementos añadidos o eliminados dinámicamente (el sitio es estático; fuera del MVP).

## Criterios de finalización

- `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` en verde.
- `pnpm test:e2e` en verde (la spec toca movimiento de scroll; también se ejecuta siempre antes de un PR).
- Los criterios de aceptación de RF-01 a RF-16 están cubiertos por tests visibles para el usuario (opacidad al entrar, centrado y al salir, en `/en` y `/es`, tema claro y oscuro).
- Los casos de `prefers-reduced-motion` y navegadores sin soporte de animación por scroll están verificados en e2e (Chromium).
- La definición de terminado es el punto 10 de la constitución; se cumple para esta spec.

## Decisiones tomadas

Sin dudas abiertas.

- RF-02 (fases del bloque): entrada si borde superior en el cuarto inferior de la pantalla; salida si borde inferior en el cuarto superior; estable el resto del tiempo. Márgenes: opacidad < 1 en el 15 % inferior/superior de la pantalla, = 1 si borde superior > 70 % y borde inferior < 30 %, continua y monótona entre medias.
- RF-13 (escalonado por posición de scroll): máximo 6 elementos con desfase propio por grupo, los restantes comparten el último desfase; desfase total ≤ 5 puntos del recorrido; cada elemento completa su entrada antes de la fase estable; los valores exactos se definen en tokens y en el plan.
- Precedencia: RF-10 > RF-11 > RF-03 > RF-05 > RF-04 prevalecen sobre RF-01.
- Fallo: revelado inactivo (sin soporte, movimiento reducido, impresión o error); estado estático con opacidad 1 y sin desplazamiento.
- Safari y Firefox: spec 05 verifica fallback en Chromium; spec 12 verifica soporte real y decide si se reabre la regla de "solo CSS".
- "Decisiones tomadas" reemplaza a "Dudas abiertas"; ninguna queda abierta.
