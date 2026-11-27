# Spec 08 — Work

## Contexto y objetivo

Work presenta cinco resultados destacados del trabajo de Pedro para que reclutadores y clientes potenciales entiendan rápidamente qué ha construido, qué problemas ha resuelto y qué tecnologías ha utilizado.

El brief de contenido define las cinco entradas en inglés y castellano. Cada una contiene un titular descriptivo, una frase que aporta el resultado o contexto y sus tecnologías. La sección comunica valor sin convertirse en un historial de puestos: no muestra empleadores ni fechas.

El momento firma combina la entrada de cada fila acompañada por su número tabular con una inversión de color al pasar el cursor.

### Reajuste visual — 2026-11-22

Se refuerza la composición editorial sin cambiar contenido ni comportamiento: la apertura usa una escala contenida, no mayor que el encabezado de sección, y menos espacio vertical; cada fila combina un índice compacto, un icono lineal propio, un titular destacado y una explicación con tecnologías en una columna secundaria en escritorio. Los iconos representan aplicaciones web, supervisión, administración, flujos e infraestructura; son decorativos, no añaden nombres accesibles ni focos y acompañan la inversión y el movimiento de su fila. En móvil las piezas se apilan en orden de lectura. La jerarquía debe distinguir claramente titular y descripción; los cinco resultados siguen siendo informativos, con inversión completa y el movimiento compartido existente. Solo se modifica la presentación local de Work, reutilizando los tokens del tema e Iconoir.

## Usuarios

- **Reclutadores**, que quieren valorar rápidamente los resultados y capacidades relevantes de Pedro.
- **Clientes potenciales**, que quieren conocer el tipo de trabajo y los resultados que pueden esperar.

## Historias de usuario

- Como reclutador, quiero recorrer resultados concretos para valorar la experiencia y el enfoque de Pedro.
- Como cliente potencial, quiero entender qué aporta su trabajo y con qué tecnologías, para decidir si encaja con lo que necesito.
- Como visitante, quiero leer la información completa sin interactuar con las filas ni depender de efectos visuales para entenderla.

## Requisitos funcionales

### RF-1 — Encabezado, ubicación y destino

Cuando una persona visite Work, el sistema deberá conservar su ubicación actual en la home, después de About y antes de Stack, el destino de navegación existente y un único encabezado de sección. La etiqueta numerada será «02 / WORK» en inglés y «02 / TRABAJO» en castellano. El titular será «What I've built.» o «Lo que he construido.», según el idioma.

**Criterios de aceptación (EARS):**

- Cuando se consulte Work en inglés, se mostrarán «02 / WORK» y «What I've built.».
- Cuando se consulte Work en castellano, se mostrarán «02 / TRABAJO» y «Lo que he construido.».
- Cuando se navegue a Work mediante su destino existente, el encabezado será accesible y no se duplicará el destino ni el encabezado de sección.

### RF-2 — Cinco resultados completos y localizados

Cuando se muestre Work, el sistema deberá presentar las cinco entradas definidas en el brief, en el orden aprobado. Cada entrada incluirá un titular, una frase descriptiva y todas sus tecnologías. Los textos descriptivos se mostrarán en el idioma activo.

**Criterios de aceptación (EARS):**

- Cuando se consulte Work en inglés o castellano, se mostrarán las mismas cinco entradas, en el mismo orden y con sus textos correspondientes al idioma.
- Cuando se muestre una entrada, aparecerán su titular, su frase descriptiva y todas sus tecnologías aprobadas.
- Si durante la preparación falta un campo o traducción, la entrada no se considerará completa y no se podrá cerrar la spec hasta que las cinco entradas estén completas en ambos idiomas.

### RF-3 — Orden y numeración

Cuando se presenten las entradas, el sistema deberá conservar el orden editorial y acompañar cada fila con su índice tabular secuencial, del 01 al 05. Los números indican posición, no una métrica de impacto, y son decorativos para tecnologías de asistencia.

**Criterios de aceptación (EARS):**

- Cuando se muestre la lista en cualquiera de los idiomas, las entradas aparecerán en el mismo orden editorial.
- Cuando se muestren las cinco filas, sus índices serán consecutivos del 01 al 05 y corresponderán a ese orden.
- Cuando una persona use tecnología de asistencia, percibirá una sección con una lista de cinco resultados; cada titular estará asociado a su descripción y tecnologías, y los índices visuales no se anunciarán.

### RF-4 — Inversión visual de la fila

Cuando un cursor se sitúe sobre una fila, el sistema deberá invertir la relación visual crudo/negro de toda su composición: fondo, número, titular, descripción, tecnologías y líneas que la delimitan. La inversión usará la paleta correspondiente al tema activo y no cambiará el tema completo. Al salir el cursor, la fila volverá a su estado base.

La inversión será independiente del movimiento de la fila durante el scroll. La interacción táctil no dejará un estado invertido persistente ni activará una acción.

**Criterios de aceptación (EARS):**

- Cuando un cursor entre en una fila, todos sus elementos visuales mostrarán juntos el estado invertido en ambos temas.
- Cuando el cursor salga, la fila recuperará su estado base.
- Mientras una fila esté invertida, su contenido seguirá siendo legible.
- Cuando una fila se desplace bajo un cursor inmóvil, el estado de hover dependerá de la posición actual del cursor; el revelado seguirá dependiendo de la posición de la fila.
- Cuando una persona toque una fila en una pantalla táctil, no se mantendrá la inversión ni se producirá navegación.

### RF-5 — Filas informativas

El sistema deberá presentar las filas y etiquetas de tecnologías como contenido informativo, no como enlaces ni controles interactivos.

**Criterios de aceptación (EARS):**

- Cuando una persona consulte o señale una fila o etiqueta, no se producirá navegación ni se ofrecerá una acción.
- Cuando se navegue con teclado, las filas y las etiquetas no añadirán paradas de foco que impliquen una interacción inexistente.

### RF-6 — Movimiento vinculado a la posición

Cuando una persona recorra Work con desplazamiento, cada fila deberá entrar, alcanzar un tramo de lectura plenamente visible y salir, acompañada por su número. Al desplazarse hacia atrás, el estado de cada fila deberá corresponder a su posición actual y revertir el recorrido. El efecto no requerirá que una fila alta quepa completa en la pantalla: cada parte deberá poder leerse plenamente al atravesar el tramo de lectura.

**Criterios de aceptación (EARS):**

- Cuando una fila entre desde abajo, su contenido pasará al estado plenamente visible en el tramo de lectura y se atenuará al salir por arriba.
- Cuando la persona se desplace hacia atrás, las filas recuperarán el estado correspondiente a su posición actual, sin depender del historial de scroll.
- Cuando una fila supere la altura visible, cada parte de su contenido alcanzará un estado plenamente legible al atravesar el tramo de lectura.
- Cuando se acceda directamente al destino de Work o se recargue la página dentro de la sección, las filas corresponderán a la posición actual; no será necesario volver arriba ni repetir una entrada.

## Requisitos no funcionales

- El texto mantendrá contraste AA en ambos temas cuando las filas estén en lectura estable, tanto en el estado base como en el invertido. No se exige AA durante fundidos o transiciones. Con movimiento reducido, AA se mantendrá desde el primer fotograma.
- La estructura accesible será una sección con una lista de cinco resultados. Los titulares estarán asociados a sus descripciones y tecnologías; los índices serán decorativos y no habrá controles ficticios.
- Las cinco filas y todo su contenido permanecerán estáticos, visibles y legibles sin JavaScript, sin soporte de animaciones por scroll o cuando se solicite movimiento reducido.
- Al activar movimiento reducido durante la lectura, ninguna fila quedará parcialmente oculta.
- La sección se verificará entre 320 y 1920 px y con texto ampliado al 200 %, sin recortes, solapamientos ni desplazamiento horizontal.
- La longitud de los textos no alterará el orden ni impedirá leer una fila, aunque su altura supere la pantalla.
- El movimiento no interrumpirá la lectura ni impedirá el desplazamiento.
- Los textos mantendrán la voz aprobada: titulares descriptivos, frases directas y beneficio antes que tecnología. No se añadirán hechos, tecnologías ni métricas que no estén aprobados en el brief.

## Casos límite

- Si falta un campo o traducción durante la preparación, la entrada se considera incompleta y bloquea el cierre; no se acepta publicar una lista incompleta.
- En dispositivos sin cursor, las filas permanecerán visibles en su estado base y el toque no dejará un estado de hover persistente.
- En dispositivos híbridos, hover y revelado seguirán siendo efectos independientes; el toque no activará navegación ni acción.
- Si un titular, una frase o el conjunto de tecnologías ocupa más espacio que el área visible, cada parte podrá leerse plenamente al atravesar el tramo de lectura, sin recortes.
- Al cambiar de idioma, la longitud distinta del texto no alterará el orden, ocultará contenido ni causará solapamientos.
- Al acceder directamente a Work o recargar dentro de la sección, el estado de las filas corresponderá a su posición actual.
- Con movimiento reducido, sin JavaScript o sin soporte de animaciones por scroll, todas las filas estarán visibles desde el primer fotograma.
- Durante los fundidos o la transición de hover puede no cumplirse AA; el criterio AA se comprueba en lectura estable y, con movimiento reducido, desde el primer fotograma.

## Fuera de alcance

- Páginas de detalle, rutas individuales o enlaces externos para los resultados.
- Presentar la sección como una cronología laboral o añadir empleadores y fechas.
- Filtros, ordenación interactiva, filas expandibles u otras acciones.
- Añadir entradas distintas de las cinco definidas por el brief.

## Criterios de finalización

- Las cinco entradas están completas y aprobadas en inglés y castellano; si falta un campo o traducción, el cierre queda bloqueado.
- Se conserva la ubicación, el destino de navegación, la etiqueta numerada y un único encabezado de sección en ambos idiomas.
- El orden es idéntico en ambos idiomas y los índices van del 01 al 05.
- La sección se percibe como una lista accesible de cinco resultados; las filas y etiquetas no son controles y los índices son decorativos.
- La inversión abarca toda la fila, es legible en ambos temas y no es necesaria para acceder a la información.
- El movimiento entra, alcanza lectura estable y sale según la posición actual; se revierte al desplazarse hacia atrás y funciona al acceder directamente a Work.
- Sin JavaScript, sin soporte de animación por scroll y con movimiento reducido, las cinco filas están visibles y legibles desde el primer fotograma.
- Contraste AA, adaptación a 320–1920 px y ampliación de texto al 200 % cumplen los criterios especificados.
- Los tests de comportamiento se escriben antes de la implementación. El cierre exige lint, comprobación de tipos, tests con al menos 85 % de cobertura en líneas, funciones, ramas y sentencias, build y e2e aplicables en verde.

## Dudas abiertas

Ninguna sobre el alcance funcional descrito. Las cinco entradas y sus textos en ambos idiomas están definidas en el brief de contenido.
