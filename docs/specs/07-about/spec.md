# Spec 07 — About

## Contexto y objetivo

La sección About ayuda a reclutadores y clientes potenciales a entender qué tipo de problemas resuelve Pedro, cómo trabaja y qué aporta a un equipo. Presenta una afirmación personal como momento firma, una biografía breve, cualidades profesionales y una foto de perfil.

El objetivo es transmitir confianza y criterio sin convertir la sección en un CV ni añadir hechos que no estén confirmados.

Esta spec define el contenido y el comportamiento observable de About. No decide cómo se implementa.

## Usuarios

- Reclutadores que quieren valorar rápidamente la experiencia y la forma de trabajar de Pedro.
- Clientes potenciales que quieren saber qué problemas puede abordar.
- Visitantes en móvil, con texto ampliado o con baja visión.
- Personas que navegan con teclado o lector de pantalla.
- Personas que prefieren movimiento reducido o usan un navegador sin animación ligada al scroll.

## Historias de usuario

1. Como reclutador, quiero entender qué trabajo disfruta y en qué problemas aporta valor Pedro.
2. Como cliente potencial, quiero conocer su experiencia y forma de trabajar sin leer un CV completo.
3. Como visitante, quiero reconocer a Pedro mediante su foto, sin que un fallo al cargarla impida entender la sección.
4. Como visitante con movimiento reducido, quiero leer la afirmación completa sin animaciones.
5. Como persona que usa tecnologías de asistencia, quiero que la foto y el contenido sean accesibles.
6. Como visitante bilingüe, quiero leer toda la sección en el idioma activo.

## Requisitos funcionales

### RF-1 — Contenido de About

- Cuando se muestre About en inglés, el sistema presenta el encabezado `01 / ABOUT`; cuando se muestre en castellano, presenta `01 / SOBRE MÍ`.
- Cuando se muestre la sección en cualquiera de los dos idiomas, el sistema presenta la afirmación firma, la biografía, las cinco cualidades y la foto cuando esté disponible.
- El sistema expresa los hechos confirmados en el texto propuesto a continuación, sin añadir cifras, empleadores, credenciales ni otros datos no confirmados.
- El sistema no menciona la trayectoria en ingeniería de sonido.

**Texto propuesto — EN**

> **Complexity is where I'm calmest.**
>
> Large data sets, live updates, complex forms, and state people can rely on. That is the work teams trust me with—and the work I enjoy most.
>
> I have more than three years of professional experience building and maintaining production web apps with React and TypeScript. I also work on the backend, building REST APIs in several languages and refactoring for speed and clarity.
>
> I understand the problem before I touch it, care about the details, and deliver software that stays maintainable. I use AI tools such as Copilot every day to move faster, and I always review what they produce.
>
> I moved into web development through an intensive bootcamp and keep learning. Spanish is my native language.

**Texto propuesto — ES**

> **La complejidad es donde estoy más tranquilo.**
>
> Grandes volúmenes de datos, actualizaciones en directo, formularios complejos y estados en los que se puede confiar. Ese es el trabajo que los equipos me confían y el que más disfruto.
>
> Tengo más de tres años de experiencia profesional construyendo y manteniendo aplicaciones web en producción con React y TypeScript. También trabajo en el backend: desarrollo APIs REST en varios lenguajes y hago refactors para ganar velocidad y claridad.
>
> Entiendo el problema antes de intervenir, cuido los detalles y entrego software que sigue siendo mantenible. Uso a diario herramientas de IA como Copilot para avanzar más rápido y reviso siempre lo que generan.
>
> Di el salto al desarrollo web a través de un bootcamp intensivo y sigo aprendiendo. El castellano es mi lengua nativa.

### RF-2 — Afirmación firma

- Cuando el visitante avance por la afirmación con scroll, el sistema ilumina sus palabras en orden y de forma acumulativa: una palabra ya iluminada permanece iluminada mientras avanzan las siguientes.
- Cuando el visitante retroceda por el scroll, el sistema revierte la progresión en orden inverso.
- Cuando la progresión llegue al final de la afirmación, todas sus palabras se muestran iluminadas.
- El efecto depende de la posición actual del contenido, no del historial de scroll.
- Cuando se anuncie la frase a un lector de pantalla, el sistema presenta la oración completa una sola vez, sin fragmentarla según el progreso visual.
- La diferencia visual entre estados conserva el contraste AA y no depende únicamente del color.

**Estados visuales**

- Una palabra no iluminada usa el peso regular (400) y el color de texto secundario del tema activo.
- Una palabra iluminada usa el peso fuerte (700) y el color principal de texto del tema activo.
- En ambos temas y estados, el texto mantiene una relación de contraste mínima de 4,5:1 con el fondo. El peso tipográfico también distingue los estados; el color no es la única señal.

**Límites del progreso**

- El recorrido va del 0 % al 100 % del tramo de cobertura de la afirmación: 0 % cuando su borde inicial entra en el viewport por el borde inferior; 100 % cuando su borde final sale por el borde superior.
- Para una frase de N palabras, numeradas desde 1, la palabra i se ilumina al alcanzar el límite `i / N` del recorrido. En ese límite están iluminadas las primeras i palabras y las posteriores siguen no iluminadas.
- En 0 % no hay palabras iluminadas; en 100 % están iluminadas todas. Los límites se distribuyen uniformemente según el número de palabras de la frase localizada.
- Al retroceder, los mismos límites se recorren en sentido inverso: al cruzar hacia atrás el límite `i / N`, la palabra i vuelve al estado no iluminado. No se conserva progreso al salir y volver a entrar; el estado corresponde siempre a la posición actual.

**Criterios observables de prueba**

- En `/en` y `/es`, en tema claro y oscuro, recorrer el inicio, una posición inmediatamente anterior y posterior a un límite entre palabras, un estado intermedio acumulado, el final y el retroceso sobre el mismo límite.
- Determinar la iluminación mediante estilos computados: peso 400 y color secundario para no iluminada; peso 700 y color principal para iluminada. Comprobar el contraste mínimo 4,5:1 en ambos estados y temas. No consultar clases ni estructura interna.
- Comprobar que en cada límite se ilumina la palabra correspondiente junto con todas las anteriores, y que al retroceder se desiluminan en orden inverso.
- Comprobar por nombre accesible que la frase completa se anuncia una sola vez, sin cambios según el progreso visual.

### RF-3 — Cualidades profesionales

- Cuando se muestre About en inglés, el sistema presenta las cualidades `Detail-oriented`, `Analytical`, `Autonomous`, `Teamwork` y `Continuous learning`.
- Cuando se muestre About en castellano, el sistema presenta las cualidades `Detallista`, `Analítico`, `Autónomo`, `Trabajo en equipo` y `Aprendizaje continuo`.
- El sistema presenta las cualidades como etiquetas informativas no interactivas; no filtran contenido ni navegan a otros destinos.

### RF-4 — Foto de perfil y fallo de carga

- Cuando la foto se haya cargado y pueda mostrarse, el sistema la presenta en About.
- Cuando la foto se anuncie a tecnologías de asistencia, el sistema proporciona una alternativa textual informativa en el idioma activo: `Portrait of Pedro Suárez Gallardo` en inglés y `Retrato de Pedro Suárez Gallardo` en castellano.
- Mientras la foto siga cargando, el sistema muestra el resto de About sin esperar a que termine.
- Cuando la foto cargue correctamente, el sistema la muestra.
- Si la carga falla o la imagen no puede mostrarse, el sistema omite la foto sin marcador, espacio vacío ni error visible; el resto de About permanece disponible.

### Composición de About — RF-1, RF-2, RF-3 y RF-4

- La afirmación firma ocupa el ancho interior de la sección por encima del resto del contenido.
- En escritorio, el retrato queda a la izquierda y la biografía a la derecha, alineados por arriba. Las cualidades quedan debajo de la biografía. La medida de los párrafos no supera 65 caracteres monoespaciados.
- El retrato lleva un borde de 1 px con el token de línea existente y ocupa menos espacio que la biografía. La composición evita huecos grandes que no ayuden a leer y conserva una lectura continua de los párrafos y las cualidades.
- En los tamaños de escritorio y móvil verificados, el retrato no se solapa con el texto, no tapa información y no recorta contenido; About no provoca desplazamiento horizontal. No se añade una capa de apilado mientras no exista solapamiento.
- En una columna, la biografía y las cualidades preceden al retrato. Si falta la foto, la biografía arranca en el borde interior de la retícula, sin reservar una columna para la imagen.

### RF-5 — Revelado del contenido

- Cuando el visitante se desplace por About, los párrafos, las cualidades y la foto participan en el revelado general de la sección: cada bloque entra, alcanza un estado plenamente visible y sale con el scroll.
- La afirmación participa en el mismo revelado general y, además, cumple la progresión palabra a palabra definida en RF-2.
- Cuando el visitante vuelva atrás, el revelado y la progresión de la afirmación son reversibles.
- Cada bloque alcanza opacidad plena durante el primer quinto de su recorrido por el viewport y la conserva desde el tramo de lectura hasta que su borde superior alcanza el borde superior del viewport. La salida comienza solo al cruzar ese borde. Este tramo no modifica los límites de iluminación de RF-2.

### RF-6 — Fallback y movimiento reducido

- Si el visitante prefiere movimiento reducido, el sistema muestra todo el contenido de About estático y visible; la afirmación aparece completa y plenamente iluminada.
- Si el navegador no admite animación ligada al scroll, el sistema muestra todo el contenido de About estático y visible; la afirmación aparece completa y plenamente iluminada.
- Si no hay JavaScript, el sistema muestra todo el contenido de About estático y visible.
- Si la animación no se ejecuta o se interrumpe, el contenido sigue siendo legible y no queda oculto.

### RF-7 — Idiomas

- Cuando el idioma activo sea inglés o castellano, el sistema muestra en ese idioma todo el texto visible de About, incluidas las cualidades y la alternativa textual de la foto.
- Cuando el visitante cambie de idioma, el sistema presenta la versión equivalente de toda la sección sin omitir contenido.

## Requisitos no funcionales

- **Accesibilidad:** el contenido mantiene contraste AA; la estructura semántica es comprensible; la frase firma se anuncia como una oración completa; la foto disponible tiene texto alternativo informativo.
- **Movimiento:** la animación no oculta contenido y respeta movimiento reducido. El impacto de la sección se conserva mediante su composición estática.
- **Rendimiento:** el movimiento no interrumpe la lectura ni causa tirones perceptibles durante el scroll.
- **Adaptabilidad:** entre 320 y 1920 px, y con texto ampliado al 200 %, el contenido refluye sin pérdida de información ni scroll horizontal.
- **i18n:** todo texto visible tiene una versión en inglés y otra en castellano con sentido equivalente.
- **Robustez:** la indisponibilidad de la foto no impide leer ni recorrer el resto de About.

## Casos límite

- La foto carga después que el resto de la sección: About permanece visible durante la espera y la foto aparece al estar disponible.
- La carga de la foto falla o la imagen no se puede mostrar: la foto se omite y el resto de la sección no cambia.
- El visitante vuelve atrás durante la progresión de la afirmación: las palabras se desiluminan en orden inverso.
- El visitante llega a About con movimiento reducido, sin soporte de animación ligada al scroll o sin JavaScript: el contenido estático permanece completamente visible.
- El visitante cambia el idioma: cambian también la afirmación, los párrafos, las cualidades y el texto alternativo de la foto.
- El visitante amplía el texto al 200 % o usa una pantalla de 320 px: el texto refluye sin recorte ni scroll horizontal.
- El visitante usa un lector de pantalla durante la progresión: la frase se anuncia completa una sola vez, sin depender del estado visual.
- El visitante cambia de tema: el contenido y los estados de la frase mantienen contraste AA en tema claro y oscuro.

## Fuera de alcance

- Cambios en la navegación, la shell o los destinos de las secciones.
- Enlaces, filtros u otras acciones en las etiquetas de cualidades.
- Ampliar la foto, abrir una vista adicional o añadirle otras interacciones.
- Contenido de proyectos.
- Añadir hechos, cifras, empleadores o credenciales no confirmados.
- Mencionar la trayectoria en ingeniería de sonido.

## Criterios de finalización

- Los criterios de aceptación se cubren con pruebas de comportamiento observable, consultando contenido, roles, nombres accesibles e interacción cuando corresponda, no clases ni estructura interna.
- La afirmación se verifica en sus estados de progresión, acumulación, reversión y estado final; el lector de pantalla la recibe como una oración completa.
- El contenido general de About y la afirmación se verifican con movimiento normal, movimiento reducido, sin soporte de animación ligada al scroll y sin JavaScript.
- La foto se verifica cuando carga, mientras sigue pendiente, cuando falla la carga y cuando no puede mostrarse.
- About se verifica en inglés y castellano, tema claro y oscuro, entre 320 y 1920 px y con texto ampliado al 200 %.
- Las combinaciones de estados visuales mantienen contraste AA y no dejan contenido oculto.
- La animación no causa tirones perceptibles durante el scroll.
- Pasan `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`; también pasa `pnpm test:e2e` porque esta spec incorpora movimiento por scroll.
- La revisión editorial final de los textos propuestos queda como última tarea de Pedro.

## Dudas abiertas

No quedan dudas abiertas en esta versión.
