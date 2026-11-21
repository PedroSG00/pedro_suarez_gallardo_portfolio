# Plan — 07 About

**Estado:** Pendiente de ejecución. Deriva de `docs/specs/07-about/spec.md` y debe respetar `docs/constitution.md`. Este documento describe estructura, datos, algoritmos, contratos, decisiones y tests; no contiene código de implementación.

**Cobertura:** RF-1 a RF-7 y todos los requisitos no funcionales de la spec.

**Definición de RF-2:** la spec fija los estados visuales, sus requisitos de contraste y los límites uniformes de progreso dentro del tramo de cobertura. Las aserciones visuales de implementación deben seguir esos criterios observables.

---

## 1. Estructura de módulos

Se reutilizan los componentes existentes de sección y UI. No se añaden dependencias, carpetas en la raíz ni niveles adicionales bajo `components/`.

**Ajuste local previo a T8:** `About` mantiene la frase en todo el ancho y organiza el resto con biografía y cualidades antes del retrato en el orden de lectura. En escritorio el retrato toma la columna izquierda; si se omite, la biografía ocupa la primera posición sin crecer más allá de la medida de lectura. El retrato lleva un borde de 1 px con el token de línea existente y una huella visual menor que la biografía. La composición reduce huecos innecesarios y mantiene los textos continuos, sin solapamiento, recorte ni desplazamiento horizontal en los tamaños verificados. El estilo local mantiene una entrada temprana y retrasa la salida de About; el CSS compartido amplía la banda legible del resto de bloques sin cambiar los contratos de `Reveal`/`RevealGroup`, la retícula global ni la progresión de palabras. Las pruebas integradas comprueban geometría, recuperación tras fallo y opacidad en entrada, lectura y salida por idioma y tema.

| Módulo | Responsabilidad | RF |
|---|---|---|
| `src/components/sections/About/About.tsx` | Componer el destino About, su encabezado, biografía, cualidades y retrato. Lee los textos del idioma activo y consume los datos locales del retrato. | RF-1, RF-3, RF-4, RF-5, RF-6, RF-7 |
| `src/components/sections/About/About.test.tsx` | Verificar contenido traducido, encabezado, cualidades, retrato y degradación ante la falta del retrato. | RF-1, RF-3, RF-4, RF-7 |
| `src/components/sections/AboutStatement/AboutStatement.tsx` | Presentar la frase firma con un único contenido accesible y palabras visuales progresivas. | RF-2, RF-5, RF-6, RF-7 |
| `src/components/sections/AboutStatement/AboutStatement.test.tsx` | Verificar nombre accesible completo, secuencia y reversibilidad perceptibles, y fallback estático. | RF-2, RF-6, RF-7 |
| `src/components/sections/AboutStatement/AboutStatement.module.css` | Asignar los estados visuales de la frase a la progresión ligada al scroll; usar únicamente tokens existentes del tema y del movimiento. | RF-2, RF-5, RF-6 |
| `src/components/ui/Section/` | Contenedor semántico y retícula existentes; no se modifica su contrato. | RF-1, RF-5 |
| `src/components/ui/SectionHeading/` | Encabezado existente con número `01` y etiqueta traducida. | RF-1 |
| `src/components/ui/Reveal/` | Revelado general existente, aplicado a los bloques de About. | RF-5, RF-6 |
| `src/components/ui/RevealGroup/` | Revelado escalonado de las cinco cualidades como grupo existente. | RF-3, RF-5 |
| `src/components/ui/Tag/` | Presentar cada cualidad como etiqueta informativa no interactiva. | RF-3 |
| `src/content/site.ts` | Añadir la ruta del retrato a los datos locales del sitio; no contiene texto traducible. | RF-4 |
| `messages/en.json` y `messages/es.json` | Incorporar la frase, los párrafos, las cualidades y el texto alternativo con claves equivalentes. | RF-1, RF-2, RF-3, RF-4, RF-7 |
| `src/app/[locale]/page.tsx` | Sustituir el cuerpo reservado de About por la sección completa, conservando el destino y el orden existentes. | RF-1, RF-5, RF-7 |
| `e2e/about.spec.ts`, `e2e/about-composition.spec.ts` | Verificar en navegador el movimiento, fallos del retrato, composición, idiomas, temas, fallbacks y adaptación de About. | RF-1 a RF-7 |
| Prueba existente de paridad de mensajes | Verificar que los catálogos conservan el mismo conjunto de claves. | RF-7 |

**Cobertura RF:** todos los RF tienen al menos un módulo asociado; la trazabilidad completa está en la sección 7.

---

## 2. Modelo de datos

No hay estado global ni backend. Los textos localizados pertenecen a los catálogos de mensajes. La ruta del retrato es un dato local no traducible. El progreso visual no se almacena: se deriva de la posición del bloque respecto al viewport.

### 2.1 Forma conceptual del contenido localizado

| Campo | Tipo conceptual | Propósito | RF |
|---|---|---|---|
| `statement` | Texto | Afirmación firma completa en el idioma activo. | RF-1, RF-2, RF-7 |
| `paragraphs.problem` | Texto | Problemas que Pedro disfruta y que los equipos le confían. | RF-1, RF-7 |
| `paragraphs.experience` | Texto | Experiencia profesional y trabajo frontend/backend. | RF-1, RF-7 |
| `paragraphs.approach` | Texto | Forma de entender el problema, cuidar detalles y revisar herramientas de IA. | RF-1, RF-7 |
| `paragraphs.background` | Texto | Transición al desarrollo web mediante un bootcamp intensivo, aprendizaje continuo e idioma nativo. | RF-1, RF-7 |
| `values.detailOriented` | Texto | Cualidad «Detail-oriented» / «Detallista». | RF-3, RF-7 |
| `values.analytical` | Texto | Cualidad «Analytical» / «Analítico». | RF-3, RF-7 |
| `values.autonomous` | Texto | Cualidad «Autonomous» / «Autónomo». | RF-3, RF-7 |
| `values.teamwork` | Texto | Cualidad «Teamwork» / «Trabajo en equipo». | RF-3, RF-7 |
| `values.continuousLearning` | Texto | Cualidad «Continuous learning» / «Aprendizaje continuo». | RF-3, RF-7 |
| `portraitAlt` | Texto | Alternativa informativa del retrato, traducida. | RF-4, RF-7 |
| `portraitSrc` | Ruta local | Fuente no traducible del retrato. | RF-4 |

Las claves se organizan bajo el espacio `about` existente. Se reutilizan las claves actuales solo cuando expresan exactamente contenido exigido por la spec; no se añade contenido visible adicional por el mero hecho de que exista una clave anterior.

### 2.2 Ejemplo de instancia localizada

Ejemplo conceptual para el idioma inglés:

| Campo | Ejemplo |
|---|---|
| `locale` | `en` |
| `statement` | `Complexity is where I'm calmest.` |
| `paragraphs.problem` | `Large data sets, live updates, complex forms, and state people can rely on. That is the work teams trust me with—and the work I enjoy most.` |
| `paragraphs.experience` | `I have more than three years of professional experience building and maintaining production web apps with React and TypeScript. I also work on the backend, building REST APIs in several languages and refactoring for speed and clarity.` |
| `paragraphs.approach` | `I understand the problem before I touch it, care about the details, and deliver software that stays maintainable. I use AI tools such as Copilot every day to move faster, and I always review what they produce.` |
| `paragraphs.background` | `I moved into web development through an intensive bootcamp and keep learning. Spanish is my native language.` |
| `values` | `Detail-oriented`; `Analytical`; `Autonomous`; `Teamwork`; `Continuous learning` |
| `portraitAlt` | `Portrait of Pedro Suárez Gallardo` |
| `portraitSrc` | Ruta local del retrato existente |

El ejemplo en castellano usa los textos propuestos en RF-1 de la spec, las cinco etiquetas traducidas de RF-3 y `Retrato de Pedro Suárez Gallardo` como alternativa del retrato.

### 2.3 Estado efímero

| Estado | Ubicación conceptual | Uso | RF |
|---|---|---|---|
| Preferencia de movimiento reducida | Preferencia del navegador | Mantener estático el revelado y la frase. | RF-6 |
| Soporte de animación ligada al scroll | Capacidad CSS del navegador | Activar movimiento solo cuando esté soportado. | RF-2, RF-6 |
| Carga del retrato: pendiente, disponible o fallida | Estado local de About | Mostrar el retrato al cargarlo y omitirlo si falla. | RF-4 |
| Progreso de frase | Posición del bloque en el viewport | Derivar qué palabras están iluminadas, sin almacenar historial. | RF-2 |

No se persiste ningún estado de movimiento entre renders, locales o visitas.

---

## 3. Algoritmos clave en pseudocódigo

### 3.1 Composición y resolución de contenido — RF-1, RF-3, RF-4, RF-7

1. Obtener el idioma activo mediante el contexto de internacionalización ya existente.
2. Resolver los textos requeridos del espacio `about`, incluidas la frase, los cuatro párrafos, las cinco cualidades y el texto alternativo.
3. Obtener la ruta no traducible del retrato desde los datos locales del sitio.
4. Componer la sección con el encabezado reservado `01` y la etiqueta localizada.
5. Si una traducción requerida falta, no lanzar un error de renderizado; la prueba de paridad de claves debe fallar para impedir que la entrega se acepte con catálogos incompletos.
6. No introducir texto de reemplazo ni hechos adicionales.

### 3.2 Progresión acumulativa de palabras — RF-2, RF-5, RF-6

1. Recibir la frase completa ya localizada.
2. Derivar de esa única frase la secuencia ordenada de palabras visuales, conservando puntuación y espacios.
3. Exponer la frase completa una sola vez en el árbol accesible; las piezas visuales de palabra no se anuncian de nuevo.
4. Obtener el progreso visual únicamente de la posición del bloque respecto al scroll, mediante la capacidad CSS de animación ligada al scroll.
5. Normalizar el recorrido entre el borde inicial de la afirmación entrando por debajo del viewport (0 %) y su borde final saliendo por arriba (100 %). Para N palabras, iluminar la palabra i al alcanzar `i / N`; las palabras anteriores permanecen iluminadas.
6. Al retroceder, recalcular desde la posición actual con los mismos límites. Las palabras dejan de estar iluminadas en orden inverso, sin estado persistente en JavaScript.
7. Con movimiento reducido, sin soporte o sin JavaScript, presentar desde el primer render la frase completa, estática y totalmente iluminada.
8. Usar los estados de RF-2: no iluminada con peso 400 y color secundario; iluminada con peso 700 y color principal. En ambos temas, cada estado mantiene contraste mínimo 4,5:1 y los estados difieren también por peso tipográfico.

**Contrato de verificación:** comprobar estado inicial, ambos lados de un límite, acumulación, final y reversión mediante estilos computados y nombre accesible, en ambos idiomas y temas. La spec define el contrato visual y los límites; la implementación no debe inventar otros.

### 3.3 Carga y fallo del retrato — RF-4

1. Renderizar la sección y el resto de su contenido sin esperar a la respuesta de la imagen.
2. Mientras el retrato está pendiente, no reservar contenido textual alternativo como sustituto.
3. Cuando la imagen pueda mostrarse, hacer visible el retrato con su texto alternativo localizado.
4. Si la carga falla o no se puede decodificar, marcar el retrato como fallido y omitirlo sin afectar el resto de About.
5. No hacer que los párrafos, las etiquetas ni la frase dependan de la carga de la imagen.

### 3.4 Fallback de movimiento y no-JavaScript — RF-5, RF-6

1. El HTML inicial presenta todos los textos y el retrato disponible en un estado legible y sin depender de JavaScript.
2. El estado base de About es estático y visible.
3. Solo si JavaScript está disponible, el usuario no ha solicitado movimiento reducido y el navegador soporta la animación, habilitar el movimiento CSS de About.
4. Si cualquiera de esas condiciones no se cumple, mantener el estado base estático y totalmente visible.
5. No usar código JavaScript para calcular progreso, iluminar palabras, animar bloques ni escuchar eventos de scroll.

Este comportamiento se limita a la sección About. Si no puede aislarse sin cambiar el contrato global de `Reveal`, se debe detener la ejecución y solicitar aprobación antes de tocar esa capa transversal.

---

## 4. Contratos de interfaz

### 4.1 Sección `About`

- **Entradas:** idioma activo y sus mensajes localizados; definición existente de la sección About; ruta local del retrato.
- **Salidas:** sección semántica con el destino `about`, encabezado numerado `01`, afirmación, cuatro párrafos, cinco etiquetas no interactivas y retrato cuando esté disponible.
- **Errores y degradación:**
  - Si falta una traducción, no lanza ni impide que la página restante se renderice; la paridad de mensajes impide aceptar catálogos incompletos.
  - Si el retrato falla, lo omite y mantiene los demás contenidos.
  - Si no hay JavaScript, mantiene el contenido visible en estado estático.
- **RF:** RF-1, RF-3, RF-4, RF-5, RF-6, RF-7.

### 4.2 Bloque `AboutStatement`

- **Entradas:** `text`, una frase completa en el idioma activo.
- **Salidas:** una frase completa para tecnologías de asistencia y una presentación visual palabra a palabra derivada de la misma cadena; progresión acumulativa y reversible cuando el movimiento está activo.
- **Errores y degradación:**
  - Si `text` está vacío, no produce una frase vacía ni lanza.
  - Si no hay soporte, JavaScript o preferencia de movimiento normal, presenta la frase estática y totalmente iluminada.
  - Las palabras visuales no duplican la frase en el árbol accesible.
- **RF:** RF-2, RF-5, RF-6, RF-7.

### 4.3 Retrato

- **Entradas:** ruta local de imagen y alternativa textual traducida.
- **Salidas:** imagen semántica accesible cuando se puede mostrar; ningún elemento de imagen cuando la carga o decodificación falla.
- **Errores y degradación:**
  - El fallo no propaga una excepción ni oculta otros contenidos.
  - La ausencia de JavaScript no oculta los textos de About.
  - La respuesta exacta del navegador ante un fallo de imagen sin JavaScript se verifica como riesgo de RF-4; no se acepta un estado que deje un error visual en la sección.
- **RF:** RF-4, RF-6, RF-7.

### 4.4 Componentes existentes reutilizados

| Componente | Entradas relevantes | Salida esperada | Error / degradación | RF |
|---|---|---|---|---|
| `Section` | Hijos, id y etiqueta accesible existentes | Contenedor de sección y retícula | Sin cambio de contrato | RF-1, RF-5 |
| `SectionHeading` | Id, número `01` y etiqueta localizada | Encabezado semántico con número decorativo | Sin cambio de contrato | RF-1 |
| `Reveal` | Contenido y variante existente | Bloque que entra y sale por scroll | Fallback visible según el contrato global | RF-5, RF-6 |
| `RevealGroup` | Cinco cualidades y variante existente | Grupo escalonado de etiquetas | Fallback visible según el contrato global | RF-3, RF-5, RF-6 |
| `Tag` | Texto de cualidad | Etiqueta informativa | Sin acción interactiva | RF-3 |

---

## 5. Decisiones técnicas justificadas

| Decisión | Justificación | Alternativa descartada | RF |
|---|---|---|---|
| Componer About con `Section`, `SectionHeading`, `Reveal`, `RevealGroup` y `Tag` existentes. | Respeta la estructura estable, evita repetir marcado y conserva los contratos ya probados. | Crear nuevos átomos genéricos para párrafos, secciones o etiquetas sin una segunda necesidad real. | RF-1, RF-3, RF-5, RF-6 |
| Mantener la frase firma en un bloque específico de About, con una responsabilidad de presentación accesible y de progresión visual. | La frase tiene un momento firma distinto al revelado general; separarla evita que la sección se convierta en un único componente sobredimensionado. No se crea una capa reutilizable «por si acaso». | Añadir la lógica de palabras al componente genérico `Reveal` o añadirle props específicas de About. | RF-2, RF-5, RF-6 |
| Mantener todo texto visible en los catálogos bilingües y la ruta del retrato en datos locales no traducibles. | Cumple la separación de contenido y UI, evita hardcodear textos y conserva la paridad EN/ES. | Escribir texto o ruta del retrato dentro del marcado de la sección o duplicar contenido por locale en lógica de presentación. | RF-1, RF-3, RF-4, RF-7 |
| Reutilizar el revelado CSS existente y derivar la iluminación de palabras de la posición de scroll, sin listeners ni dependencias de animación. | Respeta el movimiento CSS-only y el principio de que el estado depende de la posición actual. | Usar un observer, un bucle de scroll en JavaScript o una dependencia de animación. | RF-2, RF-5, RF-6 |
| Derivar el texto visual palabra a palabra de una única frase localizada y exponer la frase completa una sola vez a tecnologías de asistencia. | Evita divergencias entre el texto visual y el accesible y evita anuncios fragmentados. | Mantener dos versiones escritas manualmente o anunciar cada palabra durante el scroll. | RF-2, RF-7 |
| Mantener el contenido estático como estado base y habilitar movimiento solo como mejora progresiva. | Es necesario para que About sea estático sin JavaScript y plenamente visible con movimiento reducido o sin soporte. La animación, una vez habilitada, continúa siendo CSS. | Permitir que la animación CSS se active en el estado inicial sin distinguir la ausencia de JavaScript, pues no cumpliría RF-6. | RF-5, RF-6 |
| Usar el retrato local existente; tratar la carga de imagen como opcional respecto al texto. | No introduce servicios externos ni hace depender el contenido de una petición de imagen. | Cargar la foto desde una URL externa, añadir un servicio de imágenes o bloquear la sección hasta obtenerla. | RF-4, RF-6 |
| Usar el grupo existente para las cinco cualidades y no hacerlas interactivas. | Las cualidades son informativas y forman un conjunto corto; no requieren lógica adicional. | Añadir filtros, enlaces o un componente interactivo sin necesidad funcional. | RF-3, RF-5 |

### 5.1 Límite de la capa transversal

El plan no autoriza cambios al contrato global de `Reveal`. La regla de movimiento sin JavaScript se resuelve primero de manera local a About. Si esa solución requiere cambiar `Reveal`, sus estilos globales o una preferencia compartida, se considera un cambio transversal: antes de implementarlo hay que obtener aprobación y actualizar la spec/plan afectados.

---

## 6. Estrategia de tests

Los tests se escriben antes del código. Se consulta por rol, texto, nombre accesible y estado visible, nunca por clases, snapshots ni estructura interna. Las comprobaciones visuales usan estilos computados solo cuando el criterio es movimiento o contraste.

### 6.1 Tests de componente — Vitest y React Testing Library

| Suite | Comprobaciones | RF |
|---|---|---|
| `About.test.tsx` | Encabezado `01 / ABOUT` y `01 / SOBRE MÍ` mediante su nombre accesible; cuatro párrafos del idioma activo; cinco cualidades visibles y no interactivas; no aparece ingeniería de sonido; no se añaden hechos; alternativa del retrato traducida. | RF-1, RF-3, RF-4, RF-7 |
| `About.test.tsx` — carga de imagen | El resto del contenido aparece mientras la imagen está pendiente; la imagen aparece al cargar; ante error de carga/decodificación se omite solo el retrato y no hay error de renderizado. | RF-4 |
| `AboutStatement.test.tsx` | La frase se anuncia completa una vez; la versión visual no produce anuncios adicionales palabra a palabra; cadena vacía no rompe el bloque. | RF-2, RF-6, RF-7 |
| Prueba de paridad de mensajes | Todas las claves usadas por About existen en ambos idiomas con la misma forma. | RF-1, RF-3, RF-4, RF-7 |

### 6.2 Tests de movimiento y accesibilidad

- Verificar la progresión acumulativa: una palabra anterior permanece iluminada cuando avanza la siguiente; al retroceder, la progresión se revierte.
- Verificar la frase completa como una sola unidad accesible, independientemente del estado visual.
- Verificar que los párrafos, las etiquetas, la frase y el retrato participan del revelado general y están plenamente visibles en su fase estable.
- Verificar contraste AA en tema claro y oscuro para la frase en ambos estados visuales y en combinación con el revelado general.
- Verificar que `prefers-reduced-motion: reduce` deja el contenido estático y totalmente visible.
- Verificar los límites `i / N` y los estilos computados definidos en RF-2, en ambos idiomas y temas, sin aserciones por clases ni estructura interna.

**RF:** RF-2, RF-3, RF-5, RF-6.

### 6.3 E2E — Playwright en Chromium

La spec introduce movimiento ligado al scroll; se requiere e2e. La suite de About cubre:

| Flujo | Comprobaciones | RF |
|---|---|---|
| Contenido localizado | `/en` y `/es`: contenido, cualidades, encabezado y texto alternativo correctos. | RF-1, RF-3, RF-4, RF-7 |
| Movimiento de frase | Estado inicial, progreso entre palabras, acumulación, estado final y reversibilidad al volver atrás. | RF-2 |
| Revelado general | En About, cada bloque entra, alcanza estado estable y sale al desplazarse; no queda contenido oculto al detener el scroll. | RF-5 |
| Tema | Verificar texto y estados visuales en claro y oscuro, manteniendo contraste AA. | RF-2, RF-5 |
| Movimiento reducido | Todo contenido visible y estático; frase completa e iluminada. | RF-5, RF-6 |
| Sin soporte de animación ligada al scroll | Simular el fallback en Chromium y comprobar contenido visible y frase estática completa. Safari/Firefox reales se verifican en la pasada transversal prevista por la spec 12. | RF-5, RF-6 |
| Sin JavaScript | Contenido completo, estático y visible; sin progresión animada. | RF-1, RF-2, RF-5, RF-6, RF-7 |
| Fallo del retrato | Interceptar el recurso para provocar fallo; comprobar que no queda imagen rota visible y que todo el texto continúa disponible. | RF-4, RF-6 |
| Adaptabilidad | Verificar 320 px, 1920 px y texto ampliado al 200 %, sin scroll horizontal ni pérdida de contenido. | RF-1, RF-3, RF-4 |

Los e2e de idioma y navegación mantienen `prefers-reduced-motion: reduce`, conforme a la constitución. Las pruebas de movimiento de About usan movimiento normal cuando verifican la progresión y la salida de bloques.

### 6.4 Rendimiento y cobertura

- Comprobar manualmente que el scroll de About no causa tirones perceptibles y no interrumpe la lectura; no se inventa un umbral de fotogramas que la spec no define.
- Mantener el umbral global de cobertura en 85 % para líneas, funciones, ramas y sentencias; no añadir exclusiones.
- La verificación de anchura y zoom se hace sobre la experiencia visible, no mediante aserciones de clases.

### 6.5 Gates de finalización

En el orden de la constitución:

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`
4. `pnpm build`
5. `pnpm test:e2e`

Los gates se ejecutan sin reducir umbrales. Como la spec toca movimiento, e2e es obligatorio; también se ejecuta siempre antes de un PR.

---

## 7. Trazabilidad RF → partes del plan

| RF | Estructura / datos | Algoritmos | Contratos | Decisiones | Tests |
|---|---|---|---|---|---|
| RF-1 Contenido de About | `About`, mensajes bilingües, ejemplo de modelo | 3.1 | 4.1 | Mensajes fuera de UI; composición con piezas existentes | 6.1, 6.3 |
| RF-2 Afirmación firma | `AboutStatement`, mensajes bilingües | 3.2 | 4.2 | Progresión CSS acumulativa y reversible; límites y estados visuales definidos en la spec; texto visual derivado de una sola frase | 6.1, 6.2, 6.3 |
| RF-3 Cualidades | `About`, `Tag`, grupo de cinco valores en mensajes | 3.1 | 4.1, 4.4 | Reutilizar etiquetas; no crear interacción | 6.1, 6.3 |
| RF-4 Retrato | `About`, ruta local, texto alternativo traducido | 3.3 | 4.1, 4.3 | Recurso local opcional respecto al texto | 6.1, 6.3 |
| RF-5 Revelado | `About`, `Reveal`, `RevealGroup` | 3.2, 3.4 | 4.1, 4.2, 4.4 | Reutilizar movimiento existente | 6.2, 6.3 |
| RF-6 Fallback | Estado estático base, preferencias y capacidad del navegador | 3.2, 3.4 | 4.1–4.3 | Mejora progresiva CSS; no JS no anima | 6.2, 6.3 |
| RF-7 Idiomas | Mensajes en ambos locales y About | 3.1 | 4.1, 4.2, 4.3 | Sin texto duplicado en UI | 6.1, 6.3 |

---

## 8. Cumplimiento de la constitución

| Regla | Aplicación en este plan |
|---|---|
| Stack cerrado y dependencias | Se reutiliza el stack existente; no se propone ninguna dependencia ni servicio externo. |
| Spec antes que código | La implementación deriva de la spec 07. La aclaración pendiente de RF-2 se resuelve en la spec antes de implementar ese efecto. |
| Componentes atomizados | About compone piezas existentes; la frase firma queda aislada por su responsabilidad visual y accesible. Cada componente nuevo tiene tests junto a él. |
| Sin repetición y tokens | No se crean componentes genéricos preventivos; color, espacio y movimiento usan tokens existentes. |
| Textos y datos fuera de UI | Textos en los catálogos; ruta local del retrato en datos del sitio. |
| i18n completo | Claves paralelas EN/ES en el mismo cambio y cubiertas por el test de paridad. |
| Estructura estable | Se usan `components/sections/`, `components/ui/`, `src/content/`, `messages/` y la ruta ya existente; sin nuevas carpetas raíz o de primer nivel en `src/`, sin barrel files. |
| Tests de comportamiento | Pruebas por contenido, nombres accesibles, estados, movimiento y errores; sin snapshots ni tests de clases. |
| Cobertura | Se mantiene el umbral global del 85 % sin exclusiones nuevas. |
| Definición de terminado | Gates completos, incluido e2e por movimiento. |
| Inglés en el código | Nombres de módulos, interfaces y datos en inglés; los textos visibles conservan EN/ES. |
| Minimalismo y momento firma | La frase progresiva es el momento firma de About; no se añaden adornos o interacciones fuera de la spec. |
| Voz y hechos | Se implementa el texto propuesto; no se añade la ingeniería de sonido ni se inventan cifras. La revisión editorial de Pedro queda al final. |
| No negociables | Contraste AA, frase accesible, movimiento reducido, fallbacks, texto visible sin JavaScript y pruebas de 320–1920 px y 200 %. |

---

## 9. Riesgos, dependencias y decisiones pendientes

1. **Contraste de RF-2.** Los dos estados y los límites uniformes del progreso están definidos en la spec. Verificar que la implementación preserve contraste AA en ambos temas y siga el mismo recorrido al avanzar y retroceder.
2. **Estado sin JavaScript.** La spec requiere About estático sin JavaScript, mientras el revelado existente usa animación CSS cuando el navegador la soporta. La prueba debe confirmar que la sección puede conservar ese contrato localmente. Si requiere modificar `Reveal` o estilos compartidos, detenerse y pedir aprobación por tratarse de una capa transversal.
3. **Fallo del retrato sin JavaScript.** La sección y sus textos deben seguir visibles sin JavaScript. El comportamiento del navegador ante un recurso de imagen fallido también debe satisfacer la omisión sin error visual exigida por RF-4; se valida explícitamente y no se da por supuesto.
4. **Contraste durante dos efectos simultáneos.** La frase combina el revelado general con el estado por palabra. Todas las combinaciones tienen que mantener AA; no se acepta una solución que oscurezca temporalmente el texto por debajo del contraste requerido.
5. **Revisión editorial.** Se trabaja con los textos propuestos durante la implementación. La revisión final de esos textos queda como última tarea de Pedro, antes de dar About por terminada.
