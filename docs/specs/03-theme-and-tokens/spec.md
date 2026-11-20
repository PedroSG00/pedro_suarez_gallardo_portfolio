# 03 — Tema y tokens

**Estado:** Aprobada y pendiente de ejecución. La implementación aún no ha comenzado.

## Contexto y objetivo

El portfolio es una pieza editorial de alto impacto: crudo sobre negro cálido, tipografía monoespaciada y escala extrema. Esa dirección visual solo funciona si el color, la tipografía, el espacio y el movimiento son un sistema, no una colección de decisiones sueltas repartidas por los componentes.

El sitio debe poder verse en tema claro y en tema oscuro diseñado, sin parpadeo al cargar, sin perder la elección de la persona y con contraste suficiente en ambos modos. Hoy no existe ningún token: los estilos globales están vacíos y el tema todavía no tiene comportamiento.

El objetivo es definir el sistema de tokens (color, tipografía, espaciado, retícula y movimiento) y el comportamiento del tema, de modo que las specs de átomos, movimiento y secciones solo compongan piezas ya decididas.

## Usuarios

- Reclutadores, audiencia principal.
- Clientes potenciales, audiencia secundaria.
- Visitantes que ya tienen una preferencia de tema en su sistema operativo.
- Visitantes que eligen el tema a mano y esperan que se recuerde.
- Visitantes con sensibilidad al movimiento, que han activado `prefers-reduced-motion`.
- Visitantes sin JavaScript, con almacenamiento bloqueado o en modo incógnito.
- Visitantes con baja visión, que necesitan contraste suficiente y texto legible al ampliar.

## Historias de usuario

- Como visitante, quiero que el sitio respete el tema de mi sistema al entrar por primera vez, para no recibir un destello ni un tema que no esperaba.
- Como visitante, quiero cambiar de tema y que mi elección se mantenga al navegar y al volver otro día.
- Como visitante con sensibilidad al movimiento, quiero que el cambio de tema sea instantáneo y no me maree.
- Como visitante sin JavaScript, quiero seguir leyendo el contenido con un tema legible aunque mi elección guardada no se aplique.
- Como visitante con baja visión, quiero que todo el texto, incluidos metadatos y bloques invertidos, tenga contraste suficiente en ambos temas.
- Como visitante en una pantalla pequeña o muy grande, quiero que la jerarquía tipográfica se mantenga y que nada se vuelva ilegible.
- Como persona que mantiene el sitio, quiero cambiar un valor en un solo sitio y que se propague a todo el portfolio sin tocar componentes.

## Requisitos funcionales

### RF-1 — Modelo de tema

Criterios de aceptación (EARS):

- Cuando no exista elección explícita guardada, el sistema deberá aplicar el tema de la preferencia de su sistema operativo.
- El sistema deberá exponer solo dos estados visibles, claro y oscuro; no existirá un tercer estado «automático» en la interfaz.
- Cuando exista una elección explícita guardada, esa elección deberá prevalecer siempre sobre la preferencia del sistema operativo.
- Cuando no exista elección explícita y la preferencia del sistema operativo cambie con la página abierta, el sistema deberá seguir la nueva preferencia.
- Si el sistema operativo no declara preferencia, el sistema deberá aplicar el tema claro.
- La elección explícita deberá persistir entre visitas hasta que la persona la cambie o borre los datos del navegador, salvo sin JavaScript o sin almacenamiento, casos regulados en RF-7.

«Sin elección explícita» significa que no hay ningún valor guardado; no es un tercer estado interno.

### RF-2 — Cambio de tema

Criterios de aceptación (EARS):

- Cuando la persona cambie el tema, el sistema deberá guardar su elección como elección explícita y aplicarla en las visitas posteriores y en las navegaciones dentro del sitio, salvo sin JavaScript o sin almacenamiento, casos regulados en RF-7.
- Al terminar el cambio, ninguna zona deberá quedar en el tema anterior: fondo, texto, texto atenuado, líneas de retícula, bloques invertidos y metadatos.
- El cambio de tema no deberá recargar la página ni perder la posición de scroll.
- El control de cambio de tema deberá poder usarse con teclado y deberá anunciar el estado actual; su forma y su colocación corresponden a la spec 04.
- El texto anunciado por el control deberá existir en inglés y castellano con las mismas claves (spec 04).

### RF-3 — Resolución antes del primer pintado

Criterios de aceptación (EARS):

- El sistema deberá resolver el tema aplicable antes del primer pintado de contenido.
- El tema resuelto deberá incluir el fondo y los controles y las barras de desplazamiento nativos del navegador.
- El sistema no deberá mostrar ningún fotograma con el tema contrario antes de aplicar la elección guardada, salvo sin JavaScript, caso regulado en RF-7.
- Cuando la elección guardada no sea válida o no se pueda leer, el sistema deberá aplicar el tema del sistema operativo sin mostrar ningún error visible.
- Cuando la página se restaure desde la caché de retroceso, el sistema deberá mostrar la elección guardada vigente.
- La resolución del tema no deberá ocultar el contenido ni retrasar su aparición.

### RF-4 — Transición de tema

Criterios de aceptación (EARS):

- Cuando la persona solicite el cambio de tema, el sistema deberá hacer una transición de color con la duración del token de transición de tema (RF-11), sin desplazar ni reordenar ningún contenido.
- La transición de tema solo deberá ejecutarse cuando la persona solicite el cambio; la carga inicial y los cambios de preferencia del sistema operativo deberán ser instantáneos.
- La transición de tema no deberá tratarse como estado de interacción de RF-11.
- Con movimiento reducido o sin soporte de la transición, el sistema no deberá aplicar transición alguna (duración efectiva cero); el valor del token no cambia.
- Sin JavaScript, el sistema no deberá intentar ninguna transición de tema (ver RF-7).
- La transición no deberá animar propiedades que obliguen a recalcular la posición del contenido.

### RF-5 — Paleta y roles de color

Criterios de aceptación (EARS):

- El sistema deberá definir roles semánticos de color, no valores sueltos: fondo, texto, texto atenuado, línea, foco y bloque invertido.
- En tema claro, el sistema deberá usar crudo cálido como fondo y negro cálido casi puro como texto.
- En tema oscuro, el sistema deberá usar negro cálido casi puro como fondo y crudo cálido como texto, con una paleta diseñada para ese modo y no una inversión automática del claro.
- El sistema no deberá introducir ningún color de acento.
- Todos los neutros deberán cumplir R ≥ G ≥ B, y el crudo deberá mantenerse en la familia `#EFECE2`–`#F5F2EA`.
- El texto atenuado deberá tener un valor propio por modo, porque un solo gris no alcanza el contraste mínimo sobre crudo y sobre negro.
- La línea de 1 px de la retícula deberá usar un único tono válido en ambos modos.
- El token de foco deberá referenciar la tinta de su contenedor y no declarar valor propio: `ink` sobre el fondo base e `ink` invertida dentro de un bloque invertido, sin token nuevo.
- La selección de texto deberá usar el par invertido, sin token nuevo.
- El sistema deberá usar el token de texto para el cuerpo, los titulares y las cifras, y el token de texto atenuado para los metadatos y la numeración secundaria.
- El bloque invertido deberá intercambiar el juego completo: la superficie toma la tinta base, el texto toma la superficie base y el texto atenuado toma el valor del modo contrario, sin introducir colores nuevos. La línea no cambia de tono. Dentro de un bloque invertido, el foco resuelve a la tinta invertida del bloque (ver el criterio del foco).
- La inversión de bloque es un recurso de composición, no una inversión del modo oscuro.

Valores de partida:

| Rol | Tema claro | Tema oscuro |
| --- | --- | --- |
| Fondo | `#F2EFE6` | `#121110` |
| Texto | `#121110` | `#F2EFE6` |
| Texto atenuado | `#5A574F` | `#A9A49A` |
| Línea | `#7C776C` | `#7C776C` |
| Foco | referencia a `ink` | referencia a `ink` |
| Bloque invertido | fondo `#121110` / texto `#F2EFE6` / atenuado `#A9A49A` | fondo `#F2EFE6` / texto `#121110` / atenuado `#5A574F` |

### RF-6 — Contraste

Criterios de aceptación (EARS):

- Todas las parejas alcanzables —las formadas por texto, texto atenuado, línea y foco sobre fondo y sobre fondo del bloque invertido— deberán alcanzar una relación de contraste de 4.5:1 para texto normal y de 3:1 para texto grande y para elementos de interfaz o líneas, con los valores de su contexto, en ambos modos.
- «Texto grande» es, según WCAG, el de 24 px o más, o el de 18,66 px o más con el peso de énfasis; todo lo demás es texto normal.
- La pareja del foco deberá evaluarse con la tinta de su contexto sobre la superficie de su contexto, en ambos modos.
- Los umbrales deberán alcanzar también los tokens de hover y foco; su forma y su colocación corresponden a la spec 04.
- La prueba automática deberá comprobar todas las parejas alcanzables de ambos modos, no solo las más visibles.
- La prueba de contraste deberá leer los valores de la misma declaración de tokens que usa el sitio, sin copiarlos.
- La prueba deberá ser unitaria, de lógica pura sobre los valores de los tokens, no sobre clases ni estructura.
- Si un valor cambia y deja de cumplir un umbral, la prueba deberá fallar; no se admitirá una excepción local.
- El indicador de foco deberá mantener 3:1 de contraste contra el fondo adyacente.

### RF-7 — Sin JavaScript y sin almacenamiento

Criterios de aceptación (EARS):

- Cuando el sitio se cargue sin JavaScript, el sistema deberá mostrar el tema del sistema operativo aunque exista una elección guardada, y todo el contenido deberá seguir siendo visible y legible.
- Cuando el almacenamiento del navegador no esté disponible o esté bloqueado, el sistema deberá usar el tema del sistema operativo y permitir el cambio de tema durante esa visita, sin persistirlo.
- Si el almacenamiento falla al escribir, el sistema no deberá mostrar ningún error ni bloquear el cambio de tema.

Sin JavaScript, la elección guardada no se aplica en esa visita. Es una decisión aceptada (d), no un fallo.

### RF-8 — Familia tipográfica y pesos

Criterios de aceptación (EARS):

- El sistema deberá usar una única familia monoespaciada.
- La familia monoespaciada deberá cubrir los caracteres del español y del inglés usados en el sitio y las cifras tabulares.
- El sistema deberá usar como máximo dos pesos: uno regular para el cuerpo y uno de énfasis para los titulares.
- El peso de énfasis se reservará a los titulares y al nombre del hero; el cuerpo y los metadatos usarán siempre el peso regular.
- Cuando se muestren cifras que deban alinearse en columna, el sistema deberá usar cifras tabulares.
- Si la familia no carga, el sistema deberá recurrir a una monoespaciada del sistema y mantener la jerarquía y la legibilidad.

### RF-9 — Escala tipográfica fluida y jerarquía

Criterios de aceptación (EARS):

- El sistema deberá definir los roles display, titular de gran formato, titular de sección, cuerpo y metadato.
- El sistema deberá usar el tamaño mínimo de cada rol a 360 px y por debajo, y el máximo a 1440 px y por encima.
- El sistema deberá interpolar todos los roles tipográficos entre esos extremos de ancho, de modo que el orden de jerarquía de los extremos se mantenga en cualquier ancho intermedio.
- Cuando se evalúen los tamaños en los extremos de ancho (360 y 1440 px) y en 320 y 768 px, el sistema deberá mantener la jerarquía display > titular de gran formato > titular de sección > cuerpo > metadato, sin igualar ni invertir ningún par.
- El sistema deberá mantener un mínimo de 16 px para el cuerpo y de 12 px para cualquier texto.
- El sistema deberá componer el nombre del hero en el segundo peso (énfasis); si la revisión visual de la spec 06 lo rechaza, la regla se cambiará en esta spec, nunca con una excepción local en el hero.
- La prueba automática deberá comprobar la jerarquía tipográfica a 320, 360, 768 y 1440 px.

Valores de partida:

| Rol | Mínimo (360 px) | Máximo (1440 px) | Peso | Uso |
| --- | --- | --- | --- | --- |
| Nombre del hero | 48 px | 300 px | Énfasis | Nombre del hero (token ``--text-hero-name``, rango ajustable) |
| Display | 64 px | 176 px | Énfasis | Titular de Contact |
| Titular de gran formato | 40 px | 96 px | Énfasis | Titulares de sección |
| Titular de sección | 24 px | 48 px | Énfasis | Encabezados internos |
| Cuerpo | 16 px | 20 px | Regular | Texto de lectura |
| Metadato | 12 px | 14 px | Regular | Etiquetas, numeración y datos de apoyo |

Nota: los rangos son valores de partida ajustables (decisión b), incluido el del nombre del hero (``--text-hero-name``). La jerarquía display > titular de gran formato > titular de sección > cuerpo > metadato y los mínimos (12 px cualquier texto, 16 px cuerpo) son contrato.

### RF-10 — Espaciado y retícula

Criterios de aceptación (EARS):

- El sistema deberá definir una escala de espacio única, en múltiplos de 4 px, y ningún espaciado podrá quedar fuera de ella.
- La retícula visible deberá usar líneas de 1 px del token de línea, sin sombras; la retícula no usa rellenos.
- El espacio negativo deberá salir de la misma escala; ninguna sección deberá inventar márgenes propios.
- La escala de espacio deberá ser la misma en ambos temas y en todos los anchos.

### RF-11 — Tokens de movimiento

Criterios de aceptación (EARS):

- El sistema deberá definir las duraciones de estado entre 150 y 250 ms, la transición de tema con un único valor, de hasta 400 ms y los revelados en 600 ms como máximo.
- El sistema deberá definir como token la distancia corta que usan los revelados.
- Ninguna transición o animación temporal deberá superar los 600 ms; el revelado ligado al scroll no tiene duración y se rige por la spec 05.
- Con `prefers-reduced-motion: reduce`, el sistema deberá aplicar duración efectiva cero, no una versión más lenta de la animación.
- Los topes en ms rigen transiciones temporales; el revelado ligado al scroll usa la distancia y el rango definidos en la spec 05.
- La coreografía de entrada y salida con el scroll corresponde a la spec 05.

### RF-12 — Única fuente de verdad de los tokens

Criterios de aceptación (EARS):

- Todo color, tamaño, espacio y duración deberá proceder de un token; no deberá repetirse ningún valor mágico.
- Cada token deberá declararse una sola vez, con valor por modo solo donde difiera; la línea, la tipografía, el espaciado y el movimiento no deberán duplicarse.
- Los tokens deberán nombrarse por su rol, no por su valor, con nombres en inglés (`surface`, `ink`, `ink-muted`, `line`, `focus`).
- El inventario de tokens deberá incluir, por rol, el grosor de línea, los pesos, el interlineado y el espaciado entre letras.
- Cambiar un token deberá propagarse a todo el sitio sin editar componentes.
- Los tokens que varían deberán existir en ambos modos con los mismos nombres.
- La forma en que la prueba de contraste lee los valores de los tokens se concretará en el plan.

## Requisitos no funcionales

- **Accesibilidad:** contraste AA en ambos modos, foco visible, información nunca transmitida solo por color y respeto a `prefers-reduced-motion`.
- **Rendimiento:** el tema deberá resolverse antes del primer pintado, sin añadir recursos de red bloqueantes ni retrasar el mayor elemento visible; el cambio de tema solo modifica valores de color y no altera propiedades que provoquen reflow. El peso de énfasis del nombre del hero no deberá retrasar el primer pintado del texto ni provocar desplazamiento del contenido al cargarse.
- **Compatibilidad:** el tema y los tokens deberán funcionar en los navegadores actuales; cuando falte una capacidad, el resultado deberá ser correcto aunque sea instantáneo.
- **Renderizado estático:** el tema no deberá exigir servidor ni alterar el HTML indexable; el contenido deberá estar disponible sin depender de JavaScript.
- **Mantenibilidad:** un solo lugar por token, sin duplicación entre modos ni entre secciones.

## Casos límite

- Sin JavaScript: tema del sistema aunque haya elección guardada, contenido legible, sin fundido (decisión aceptada, d).
- Fallo del script de tema (bloqueado o con error): equivalente a sin JavaScript.
- Almacenamiento bloqueado o modo incógnito: se usa el tema del sistema y el cambio funciona en esa visita sin persistir.
- Elección guardada inválida o corrupta: se ignora, se aplica el tema del sistema y no se muestra ningún error.
- El sistema operativo no declara preferencia: se aplica el tema claro.
- Navegador sin soporte de `prefers-color-scheme`: se muestra el tema claro.
- La preferencia del sistema operativo cambia con la página abierta y no hay elección explícita: se sigue la nueva preferencia sin recargar.
- El navegador no soporta la transición de tema: el cambio es instantáneo y correcto.
- `prefers-reduced-motion: reduce`: el cambio de tema y los revelados son instantáneos.
- La fuente no carga: se usa la monoespaciada del sistema y la jerarquía se mantiene.
- Ancho menor que 360 px: se mantienen los mínimos; ancho mayor que 1440 px: se mantienen los máximos.
- Zoom de texto al 200 %: la jerarquía y el contraste se mantienen, sin solapamientos.
- Bloque invertido: se aplican los mismos umbrales de contraste que en el resto de la página.
- Cambio de tema durante el scroll: no se pierde la posición ni se reinicia el movimiento de las secciones.

## Fuera de alcance

- Los átomos de interfaz, incluido el selector de tema y el cambio de idioma (spec 04).
- El texto localizado del control de tema (spec 04).
- El movimiento de scroll y el componente de revelado (spec 05).
- La composición y los momentos firma de las secciones (specs 06–10).
- El desbordamiento del nombre del hero en 320–360 px (spec 06).
- Los textos del portfolio y su contenido.
- Los metadatos SEO, `hreflang` y sitemap (spec 11).
- La medición final de rendimiento y la pasada de accesibilidad global (spec 12).
- Los valores numéricos de peso tipográfico (plan).
- La lista de navegadores mínimos y la impresión.

## Criterios de finalización

- El tema se resuelve antes del primer pintado: no se ve ningún fotograma con el tema contrario, salvo sin JavaScript.
- La elección explícita persiste entre visitas y navegaciones y prevalece sobre la preferencia del sistema operativo.
- El cambio de tema no desplaza contenido, dura lo que marca el token de transición de tema (RF-11) y es instantáneo sin soporte, con `prefers-reduced-motion` y sin JavaScript.
- La prueba automática de contraste AA está en verde, con los valores leídos de la declaración de tokens del sitio.
- La prueba automática de jerarquía tipográfica está en verde.
- Las pruebas de contraste y de jerarquía son de lógica pura: no comprueban clases ni estructura.
- Sin JavaScript, se muestra el tema del sistema y todo el contenido sigue siendo legible.
- Todo valor visual procede de un token y no hay valores mágicos repetidos.
- El e2e de tema en Playwright comprueba el cambio claro-oscuro en `/en` y `/es`, la persistencia tras recarga, la elección guardada opuesta al sistema aplicada antes del arranque y sin mutaciones de tema posteriores, el cambio instantáneo con movimiento reducido y el tema del sistema sin JavaScript.
- Se han escrito los tests antes que el código y se han superado los gates obligatorios (`pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`; `pnpm test:e2e` porque se toca tema).

## Decisiones

- **a) Valores hexadecimales ajustables.** La paleta parte de crudo `#F2EFE6` y negro cálido `#121110`. Los valores pueden ajustarse si la prueba de contraste sigue en verde, el negro se mantiene dentro de la familia `#0E0E0C`–`#141312` y el valor final queda registrado en el archivo de tokens. Son contrato: los roles semánticos, la ausencia de color de acento, los umbrales AA, el crudo dentro de la familia `#EFECE2`–`#F5F2EA`, los neutros con R ≥ G ≥ B y el tono único de la línea.
- **b) Escala fluida con rangos iniciales ajustables.** Los tamaños de la tabla de RF-9 son un punto de partida. Son contrato: la invariante de jerarquía display > titular de gran formato > titular de sección > cuerpo > metadato a 320, 360, 768 y 1440 px, y los mínimos de 12 px (cualquier texto) y 16 px (cuerpo). La interpolación entre los extremos de ancho (360 y 1440 px) y el interlineado y espaciado exactos por rol se concretan en el plan.
- **c) Nombre del hero en el segundo peso (peso de énfasis)**, coherente con la regla de RF-9 que lo reserva a titulares. En monoespaciada el ancho del carácter no depende del peso, así que la verificación de la spec 06 no cambia. Su carga se rige por el requisito no funcional de rendimiento: no debe retrasar el primer pintado del texto ni provocar desplazamiento del contenido, y su medición final corresponde a la spec 12. Si la revisión visual de la spec 06 lo rechaza, se cambia la regla en esta spec, no con una excepción local en el hero.
- **d) Sin JavaScript no se aplica la elección guardada.** Leer el almacenamiento antes del primer pintado exige JavaScript; resolverlo con una cookie o en el servidor rompería el renderizado estático y la indexación. Se acepta mostrar el tema del sistema en esa visita, con el contenido siempre legible.
- **e) No hay vuelta a seguir al sistema.** Una vez guardada una elección explícita, el sitio no vuelve a seguir la preferencia del sistema operativo salvo que la persona borre los datos del navegador. Se acepta: el control ofrece dos estados visibles y no un tercero «automático».
