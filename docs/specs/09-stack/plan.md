# Plan — Spec 09 Stack

## Alcance, principios y bloqueos

Este plan concreta `docs/specs/09-stack/spec.md`: una sección bilingüe con 25 tecnologías y sus marcas propias, descripciones, filtro por categoría, casillero con feedback y expulsión, cartas volumétricas en un escenario 3D coherente con movimiento pausado y colisiones, zoom y rotación, y lista plana cuando no hay JavaScript o WebGL.

- Se respetan `docs/constitution.md`: tests primero, datos estáticos en `src/content/`, textos en `messages/en.json` y `messages/es.json`, accesibilidad por teclado, contraste AA, movimiento reducido y contenido disponible sin JavaScript.
- La implementación anterior (registro, sección estática, filtros y mensajes) se retiró del repositorio. El árbol vuelve a tener solo documentación de Stack; este plan sustituye la propuesta CSS por Three.js.
- **Three.js está aprobado expresamente por el usuario** para Stack. No se añaden más dependencias: sin `react-three-fiber`, sin motor de física, sin librerías de animación. `@types/three` solo como dependencia de desarrollo.
- Three.js no incluye colisiones, física ni entrada: la repulsión, los límites, el arrastre y la cámara se implementan en el proyecto.
- Cada tecnología usa su propio logotipo, no un icono genérico. Los recursos SVG locales no se cargan desde red en runtime; se verifican exactitud, legibilidad monocroma y derechos/atribución antes del cierre. No se sustituye una marca pendiente por Iconoir.
- La escena 3D es un sistema coherente: cartas con grosor y cantos, marca integrada en la cara, casillero con profundidad, escenario, materiales, perspectiva, luz y sombras coordinados. Sin mezcla accidental de sprites planos y objetos volumétricos.
- La mesa CAD usa folios numerados y cableado tenue por categoría. El papel cuadriculado pasa a una cuadrícula de suelo en perspectiva; la ranura sigue centrada y el modo lista conserva el estado del dibujo.
- Las cartas tienen movimiento ambiental coreografiado, pausado y acotado, con colisiones visibles y estables; no es una simulación física. `prefers-reduced-motion` desactiva el movimiento ambiental, no la respuesta directa.
- El casillero tiene ocupación exclusiva: la carta alojada sale de la nube; expulsarla la devuelve a una posición visible y libre. Nunca hay cartas ocultas bajo el casillero.
- La incorporación de Three.js al stack cerrado debe quedar registrada en `docs/constitution.md` antes de implementar. Esa edición es una capa transversal y requiere autorización explícita.
- Las 25 descripciones EN/ES de `content-review.md` están pendientes de aprobación editorial. No se implementa contenido no aprobado.
- Se autorizan las carpetas necesarias para Stack bajo `src/`. No se autorizan cambios en layout raíz, tema, i18n, `Reveal`, configuración ni estilos globales.

## Arquitectura de la experiencia

Tres capas, en orden de degradación:

1. **Lista plana (HTML del servidor).** Categorías, tecnologías y descripciones completas. Es el contenido real y funciona sin JavaScript. Base de RF-9 y de la semántica accesible.
2. **Escena Three.js (mejora progresiva).** Se monta solo si hay JavaScript y WebGL. Sustituye visualmente a la lista, que permanece en el árbol de accesibilidad para lectores de pantalla.
3. **Controles DOM.** Filtro, switch 2D/3D, zoom, rotación y selección por lista son botones reales fuera del canvas. El canvas nunca es la única vía de interacción.

Consecuencias de diseño:

- El canvas es decorativo desde el punto de vista semántico (`aria-hidden` en el nodo WebGL); la información vive en la capa 1.
- Las cartas del canvas se seleccionan por *raycasting*, pero la misma selección se puede hacer desde la lista accesible.
- El estado (filtro, selección, modo, cámara, posiciones) vive en React y se refleja en atributos `data-*` del contenedor para poder verificarlo sin leer píxeles.
- Sin WebGL o sin JavaScript no se muestran controles inoperantes: solo la lista plana.

## Estructura de módulos

| Módulo propuesto | Responsabilidad | RF |
|---|---|---|
| `src/content/stack.ts` | Registro canónico: `id`, categoría, orden y referencia a marca propia. Sin prosa. | RF-1, RF-2, RF-9 |
| `src/content/stack.test.ts` | Integridad: 25 tecnologías, seis categorías, orden, ids únicos, prioridad React/TypeScript. | RF-1 |
| `src/lib/stack/stack-geometry.ts` | Límites, colocación inicial/libre, movimiento acotado, repulsión y exclusión del slot. Funciones puras. | RF-4, RF-4a |
| `src/lib/stack/stack-camera.ts` | Límites de zoom, orientación y paso de cámara. Funciones puras. | RF-6, RF-7 |
| `src/lib/stack/stack-state.ts` | Filtro, selección, ocupación exclusiva del slot, expulsión y estado inicial. Funciones puras. | RF-2, RF-3, RF-4a, RF-5, RF-8 |
| `src/lib/stack/stack-capabilities.ts` | Detección de WebGL y de soporte 3D, con valor inyectable para tests. | RF-5, RF-9 |
| `src/lib/stack/*.test.ts` | Casos tabulados, incluidos límites exactos. | RF-2–RF-8 |
| `src/components/sections/Stack/Stack.tsx` | Composición y estado de la sección; decide escena o lista plana. | RF-1–RF-9 |
| `src/components/sections/Stack/StackFlatList.tsx` | Lista plana accesible con categorías y descripciones. | RF-1, RF-3, RF-9 |
| `src/components/sections/Stack/StackFilters.tsx` | Filtro único con estado accesible. | RF-2 |
| `src/components/sections/Stack/StackDetail.tsx` | Casillero: estados vacío/hover/ocupado, descripción y botón de expulsión. | RF-3, RF-4a |
| `src/components/sections/Stack/StackCanvas.tsx` | Monta y destruye la escena; traduce puntero a acciones. | RF-4–RF-7 |
| `src/components/sections/Stack/StackControls.tsx` | Switch 2D/3D, zoom y rotación accesibles. | RF-5–RF-7 |
| `src/components/sections/Stack/stack-scene.ts` | Adaptador Three.js: escena volumétrica, cartas/marcas, slot, materiales, luces, raycasting, colisiones y movimiento acotado. | RF-1, RF-4–RF-7 |
| `src/components/sections/Stack/Stack.module.css` | Presentación local; consume tokens existentes. | RF-1–RF-9 |
| `src/components/sections/Stack/*.test.tsx` | Comportamiento observable de cada pieza. | RF-1–RF-3, RF-5, RF-8, RF-9 |
| `messages/en.json`, `messages/es.json` | Titular, filtros, controles, instrucción y descripciones. | RF-1–RF-3, RF-5–RF-7, RF-9 |
| `src/app/[locale]/page.tsx` | Sustituye el placeholder de Stack por la sección. | RF-1, RF-9 |
| `e2e/stack/*.spec.ts` | Escena, marcas, filtros, selección/expulsión, colisiones, modos, cámara y fallbacks. | RF-1–RF-9 |

Notas de estructura:

- `stack-scene.ts` no es un componente: es el único punto que importa `three`. El resto de la sección no depende de la librería, lo que permite testear sin WebGL.
- Si alguna pieza supera ~100 líneas o mezcla responsabilidades, se divide antes de implementar, dentro de las carpetas ya autorizadas.
- No se crean utilidades genéricas ni hooks preventivos.

## Modelo de datos

### Registro canónico

| Campo | Regla |
|---|---|
| `id` | Identificador estable en inglés; clave de las descripciones. |
| `category` | `frontend`, `data-visualization`, `backend-apis`, `databases`, `testing-ci`, `ai-tools`. |
| `order` | Orden editorial del brief; React y TypeScript primero en Frontend. |
| `brandMark` | Referencia local, única y aprobada al logotipo de esa tecnología; no icono genérico ni recurso remoto. |

### Descripción

| Campo | Regla |
|---|---|
| `name` | Nombre oficial de la tecnología; no se traduce. |
| `description` | Texto EN/ES que explica qué es la tecnología; sin uso personal ni métricas. |

### Estado de interacción

```text
mode: '2d' | '3d'                  // inicial '2d'
filter: 'all' | CategoryId         // inicial 'all'
selectedId: TechnologyId | null    // inicial null
slotId: TechnologyId | null        // ocupante única; coincide con selectedId
positions: Record<TechnologyId, Vec2>
camera: { zoom, yaw, pitch }       // ambos modos; yaw/pitch solo en 3d
motion: 'ambient' | 'reduced'      // reduced desactiva desplazamiento autónomo
```

Sin persistencia entre entradas. El cambio de idioma restablece `mode` y `filter`.

### Ejemplo

```text
{ id: 'react', category: 'frontend', order: 3, brandMark: '/stack/react.svg' }
name: 'React'
description.en: 'A component library for building interfaces from small, reusable pieces.'
description.es: 'Una biblioteca de componentes para construir interfaces con piezas pequeñas y reutilizables.'
```

## Algoritmos clave

### Colocación inicial — RF-1

1. Leer el registro y agrupar por categoría en orden editorial.
2. Calcular una posición por carta dentro del área útil, con separación mínima y sin tapar el casillero central.
3. Colocación determinista: la misma entrada produce el mismo reparto, sin aleatoriedad.
4. Aplicar la resolución de colisiones hasta que no haya solapes por encima del umbral.

### Movimiento, repulsión y límites — RF-4

```text
pasoEscena(cartas, limites, slot, delta):
  actualizar desplazamiento ambiental pausado para cartas libres
resolverColisiones(cartas, limites, iteraciones = N):
  repetir N veces:
    para cada par (a, b):
      d = b.pos - a.pos
      si |d| < distanciaMinima:
        empuje = (distanciaMinima - |d|) / 2
        normal = d normalizado (o eje fijo si |d| = 0)
        a.pos -= normal * empuje
        b.pos += normal * empuje
    para cada carta:
      carta.pos = limitar(carta.pos, limites, radio)
```

- Se permite solapamiento parcial: la distancia mínima es menor que el diámetro de la carta.
- El slot es una zona reservada: las cartas libres no pueden invadirla. La carta alojada sale del conjunto de colisiones.
- `limitar` recorta al rectángulo interior descontando el radio; una carta nunca sale del área.
- El movimiento tiene velocidad/amplitud limitadas, se pausa con reduced-motion, canvas fuera de vista o pestaña inactiva.

### Selección — RF-3, RF-4

```text
alSoltar(carta):
  si !habilitada(carta): ignorar
  si dentroDelCasillero(carta) y slotId == null: alojar(carta.id); seleccionar(carta.id)
  si dentroDelCasillero(carta) y slotId != null: rechazarConFeedback(); devolverAPosicionLibre(carta)
  si no: conservarPosicion(carta); no cambiar selección

expulsar():
  si slotId != null: colocarEnPosicionLibreVisible(slotId); slotId = null; selectedId = null
```

Seleccionar por control accesible ejecuta la misma función de estado, sin geometría.

### Modo 2D/3D — RF-5

- Una sola escena y un solo grupo de cartas.
- 2D: cámara ortográfica frontal, retícula plana y distribución editorial.
- 3D: cámara en perspectiva y retícula de suelo; las mismas cartas conservan su identidad/posición y enseñan el grosor real de sus cantos. Cada marca se integra en la cara, no como sprite flotante.
- El slot tiene cavidad/profundidad y hover en ambas proyecciones. Escenario y cartas comparten escala, materiales y sistema de luz/sombra.
- El cambio interpola la cámara y la proyección sin recalcular la colocación; ambas vistas encuadran toda el área donde pueden moverse las cartas. Las retículas se funden durante la transición, que usa un token de duración existente y se omite con `prefers-reduced-motion`.
- El switch solo se muestra si `stack-capabilities` detecta un búfer de profundidad capaz de renderizar la perspectiva. Sin él, la escena ortográfica y su lista siguen disponibles; sin WebGL queda la lista plana.

### Cámara — RF-6, RF-7

```text
zoom(delta): camera.zoom = limitar(camera.zoom + delta, MIN, MAX)
girar(dx, dy): yaw = limitar(yaw + dx, -MAX_YAW, MAX_YAW)
               pitch = limitar(pitch + dy, MIN_PITCH, MAX_PITCH)
```

- Arrastrar el fondo rota; arrastrar una carta mueve la carta.
- Los límites garantizan que todas las cartas sigan dentro del frustum explorable.
- El zoom de la vista 3D va del 85 % al 110 %, parte del 100 % y cambia en pasos de 5 puntos. El máximo se ajusta al área útil para mantener visibles las cartas de los bordes; solo la rueda vertical sobre el canvas 3D controla el zoom.
- Sin animación autónoma: la cámara solo se mueve por entrada de la persona.

### Render bajo demanda — rendimiento

- Render bajo demanda con reduced-motion. El movimiento ambiental usa un ciclo acotado solo mientras la escena está visible y la pestaña activa.
- Sin movimiento autónomo con reduced-motion; colisiones, recepción y expulsión responden a eventos directos.
- `ResizeObserver` recalcula tamaño y proyección; `dispose()` libera geometrías, materiales, texturas y listeners al desmontar.

### Detección y degradación — RF-9

1. Servidor: siempre renderiza la lista plana.
2. Cliente: si no hay WebGL, no se monta el canvas ni se ocultan controles inexistentes.
3. Cliente con WebGL: se monta la escena, la lista pasa a oculta visualmente pero sigue accesible.
4. Sin JavaScript: queda la lista plana servida, completa.

## Contratos de interfaz

### `Stack`

- **Entradas:** idioma activo, mensajes de Stack, registro canónico.
- **Salidas:** sección con destino `stack`, encabezado numerado, lista plana siempre presente, escena y controles cuando procede.
- **Errores:** registro incompleto, descripción ausente, id duplicado o traducción faltante bloquean la aceptación; no hay fallback silencioso entre idiomas.

### `stack-scene`

```text
crearEscena({ canvas, cards, callbacks, limits, capabilities }) → { actualizar, destruir }
```

- **Entradas:** nodo canvas, cartas con posición y textura, límites, callbacks (`onSelect`, `onMove`, `onCameraChange`).
- **Salidas:** instancia con `actualizar(estado)` y `destruir()`.
- **Errores:** si no se obtiene contexto WebGL, lanza o informa `unsupported` y la sección cae a la lista plana; nunca deja un canvas vacío con controles activos.
- **Garantías:** no accede a red, no persiste estado y no lanza errores no capturados en `dispose`.

### `stack-geometry`, `stack-camera`, `stack-state`

Funciones puras, sin DOM ni Three.js: reciben números y devuelven números o estado nuevo. Los límites son parámetros con valores por defecto en tokens locales.

## Decisiones técnicas justificadas

| Decisión | Justificación | Alternativa descartada |
|---|---|---|
| Three.js sobre WebGL para la escena | Aprobado por el usuario; permite una escena real con cámara, picking y continuidad 2D/3D sin reimplementar proyección. | CSS 3D: se intentó, no permitía colisiones ni cámara reales y producía una experiencia plana. |
| Un único punto de importación de `three` (`stack-scene.ts`) | Aísla la librería, permite testear el resto sin WebGL y sustituir el adaptador si cambia el enfoque. | Importar `three` en cada componente. |
| Colisiones propias por separación iterativa | Three.js no incluye física; un motor de física sería una dependencia nueva y desproporcionada. | `cannon-es`, `rapier` u otro motor: dependencia no aprobada y peso innecesario. |
| Render bajo demanda | Evita consumo continuo y cumple movimiento reducido sin ramas especiales. | Bucle `requestAnimationFrame` permanente. |
| Lista plana como contenido base | Cumple RF-9 sin JavaScript, da semántica accesible y evita duplicar textos. | Canvas con texto alternativo o una capa oculta generada por JS. |
| Controles DOM fuera del canvas | Teclado, lectores de pantalla y táctil funcionan sin depender del canvas. | Controles dibujados en WebGL. |
| Estado en React y atributos `data-*` para verificación | Permite e2e sin leer píxeles ni depender de la implementación gráfica. | Aserciones por captura de imagen. |
| Marcas SVG locales en textura/material de cara | Conservan el reconocimiento de cada tecnología sin cargas externas ni dependencias nuevas. | Iconos genéricos compartidos o logos remotos, que dañan reconocimiento y fiabilidad. |
| Descripciones neutrales de la tecnología | Evita atribuir usos no respaldados y simplifica el contenido. | Fichas de uso personal: requerían hechos del CV y aprobaciones por tecnología. |

## Estrategia de tests

Los tests de aceptación se escriben antes de implementar. Se comprueba comportamiento observable: roles, nombres accesibles, texto, estado y estilos computados. Nunca clases, snapshots ni estructura privada.

### Unitarios de contenido y lógica — RF-1–RF-8

- Registro: 25 tecnologías, seis categorías, orden editorial, ids únicos, prioridad React/TypeScript.
- Marcas: 25 recursos locales propios, asociados a la tecnología correcta, legibles en claro/oscuro y sin requests remotos.
- Paridad EN/ES: toda tecnología tiene nombre y descripción en ambos catálogos, sin claves sobrantes.
- `stack-state`: «Todas» inicial, filtro único, habilitación, selección conservada al filtrar, reinicio en entrada e idioma.
- `stack-geometry`: límites en los cuatro bordes, solape parcial permitido, ninguna carta completamente tapada, colocación determinista.
- Movimiento/slot: desplazamiento acotado, colisión estable, pausa con reduced-motion, exclusión de la zona del casillero, segundo drop rechazado y expulsión a posición libre visible.
- `stack-camera`: mínimos y máximos de zoom, yaw y pitch; valores fuera de rango se recortan.
- `stack-capabilities`: detección con contexto inyectado (soportado, no soportado, lanza al crear contexto).

### Componentes — RF-1–RF-3, RF-5, RF-8, RF-9

Con mensajes reales y ambos idiomas:

- Lista plana: categorías, tecnologías, descripciones, orden y prioridad visual.
- Filtros: estado inicial, selección única, estado accesible, atenuación y deshabilitado.
- Casillero: instrucción inicial, descripción al seleccionar, reemplazo y conservación al filtrar.
- Casillero: hover, confirmación de recepción, expulsión accesible, ocupación exclusiva y ausencia verificable de cartas ocultas debajo.
- Controles: switch oculto sin 3D, zoom y rotación con nombres accesibles y límites.
- Sin controles inoperantes en la lista plana.

### E2E (Chromium) — RF-1–RF-9

- Sin JavaScript: lista plana completa en `/en` y `/es`.
- Sin WebGL (contexto bloqueado): lista plana, sin controles de canvas.
- Escena: cartas presentes, arrastre al casillero selecciona, drop fuera conserva posición y selección.
- Colisiones: al acercar dos cartas se separan; ninguna queda oculta por completo.
- Marcas: cada carta muestra su logo identificador en 2D/3D y mantiene nombre accesible sin duplicar anuncios.
- Volumen: cartas, casillero y escenario comparten profundidad, materiales, luz y escala coherentes en ambos temas y tamaños.
- Movimiento: desplazamiento pausado y colisiones visibles; pausa fuera de viewport, pestaña inactiva y con reduced-motion.
- Casillero: hover al aproximarse, confirmación al soltar, expulsión por teclado/tacto/ratón y verificación de que no hay cartas ocultas debajo.
- Límites: arrastrar fuera del área deja la carta dentro.
- Modos: inicio 2D, switch conserva posiciones, filtro, selección y descripción; instantáneo con `prefers-reduced-motion`.
- Cámara: rueda y botones cambian el zoom hasta el límite; arrastre del fondo rota; arrastre de carta no rota.
- Accesibilidad: selección por teclado desde la lista, foco visible, contraste AA en ambos temas, 320 px, 1920 px y texto al 200 %.
- Entrada e idioma: modo 2D y «Todas» al volver y al cambiar de idioma.

Las verificaciones de la escena usan los atributos de estado expuestos por el contenedor; no se comparan píxeles ni se depende de la implementación interna de Three.js.

### Matriz de trazabilidad

| RF | Módulos | Verificación |
|---|---|---|
| RF-1 | `stack.ts`, `Stack`, `StackFlatList`, mensajes | Unitarias de registro y paridad; componentes y e2e de contenido |
| RF-2 | `stack-state`, `StackFilters` | Unitarias de filtro; componentes y e2e de atenuación y estado accesible |
| RF-3 | `StackDetail`, `stack-state`, mensajes | Componentes de instrucción, selección y reemplazo; e2e de idioma y filtro |
| RF-4 | `stack-geometry`, `stack-scene`, `StackCanvas` | Unitarias de límites y repulsión; e2e de arrastre, drop y colisiones |
| RF-5 | `Stack`, `StackControls`, `stack-scene` | Componentes y e2e de switch, continuidad y movimiento reducido |
| RF-6 | `stack-camera`, `StackControls` | Unitarias de límites; e2e de rueda y botones |
| RF-7 | `stack-camera`, `stack-scene`, `StackControls` | Unitarias de ángulos; e2e de fondo frente a carta |
| RF-8 | `stack-state`, `Stack` | Unitarias de estado inicial; e2e de reentrada e idioma |
| RF-9 | `StackFlatList`, `stack-capabilities` | Componentes de lista; e2e sin JavaScript y sin WebGL |

### Gates de cierre

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test` con cobertura mínima del 85 % en líneas, funciones, ramas y sentencias
4. `pnpm build`
5. `pnpm test:e2e`

No se baja cobertura ni se excluye código para cumplir el umbral. La verificación nativa en Safari y Firefox queda para la spec 12.
