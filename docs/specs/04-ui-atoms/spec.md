# 04 — Átomos de UI

**Estado:** Completada. Todos los átomos implementados, testeados y verificados (T1–T8, RF-1–RF-8). LanguageSwitch implementado como toggler de un solo botón.

## Contexto y objetivo

La home está compuesta por secciones que, a su vez, se construyen a partir de piezas de interfaz pequeñas, reutilizables y sin opinión sobre el contenido del portfolio. Estas piezas son los "átomos" de UI.

El sitio debe poder verse en tema claro y en tema oscuro diseñado, con contraste suficiente en ambos modos y sin color de acento. Cada sección se compone de estos átomos, que reciben todo su contenido por prop y nunca hardcodean texto ni datos internos.

El objetivo es definir el conjunto mínimo de componentes atómicos —Button, Link, Heading, Tag, contenedor de sección con retícula, alternador de tema, cambiador de idioma y Logo del home— de modo que las specs posteriores (movimiento, secciones y shell) solo compongan piezas ya decididas. Ningún átomo incluye animación propia: la entrada y salida por scroll se resuelven en la spec de movimiento (05).

El Logo del home es la letra "D" extraída del símbolo `id="d"` de `public/logo.svg` (`viewBox="0 0 64 64"`), compuesta por tallo + cursor sin contenedor. Se renderiza con `currentColor`, por lo que se adapta automáticamente al tema activo (negro cálido `#121110` en modo claro, crudo cálido `#F2EFE6` en modo oscuro) sin declarar colores propios.

## Usuarios

- Reclutadores, audiencia principal.
- Clientes potenciales, audiencia secundaria.
- Visitantes que navegan por teclado y necesitan indicador de foco visible.
- Visitantes con sensibilidad al movimiento, que han activado `prefers-reduced-motion`.
- Visitantes con baja visión, que necesitan contraste suficiente en ambos temas.
- La persona que mantiene el sitio, que quiere cambiar un valor en un solo sitio y que se propague a todos los componentes que lo usan.

## Historias de usuario

- Como visitante, quiero interactuar con botones y enlaces que respondan claramente al teclado y al puntero, para navegar y actuar con confianza.
- Como visitante, quiero leer encabezados y etiquetas con una jerarquía tipográfica clara, para escanear la página rápidamente.
- Como visitante, quiero identificar en qué sección estoy y alternar tema e idioma con símbolos claros, sin depender de texto adicional.
- Como visitante, quiero que el logo del home identifique el sitio y me permita volver al inicio.
- Como visitante con sensibilidad al movimiento, quiero que los átomos no animen por sí mismos y que el contenido siga siendo visible con `prefers-reduced-motion`.
- Como persona que mantiene el sitio, quiero componer secciones a partir de estos átomos pasando únicamente contenido por prop, sin hardcodear textos ni datos dentro de ellos.

## Requisitos funcionales

### RF-1 — Button

Criterios de aceptación (EARS):

- Cuando el usuario pulse o active un Button, el sistema ejecute la acción asociada.
- Cuando el usuario posicione el puntero sobre un Button habilitado, el sistema invierta los colores de fondo y texto.
- Cuando el usuario retire el puntero, el sistema restaure los colores originales.
- Cuando el usuario enfoque un Button con el teclado, el sistema muestre un indicador de foco visible.
- Cuando un Button esté deshabilitado, el sistema no ejecute la acción al activarlo y reduzca su opacidad.
- Cuando el contenido se pase por prop, el sistema lo muestre tal cual; ningún texto va hardcodeado dentro del componente.

### RF-2 — Link

Criterios de aceptación (EARS):

- Cuando el usuario active un Link con un destino válido, el sistema navegue a ese destino.
- Cuando el usuario posicione el puntero sobre un Link, el sistema invierta los colores de fondo y texto.
- Cuando el Link indique `target="_blank"`, el sistema abra el destino en pestaña nueva de forma nativa (`rel="noreferrer noopener"` en el `<a>`), permitiendo clic central y bloqueadores de ventanas emergentes, y anuncie `srLabel` solo a lectores de pantalla mediante un span `sr-only`, sin mostrarlo como texto visible.
- Cuando el Link indique `target="_self"` o no indique target, el sistema navegue en la misma pestaña.
- Cuando el destino del Link no sea válido, el sistema no navegue y no rompa la página.
- Cuando el usuario enfoque un Link con el teclado, el sistema muestre un indicador de foco visible.
- Cuando el contenido se pase por prop, el sistema lo muestre tal cual; ningún texto va hardcodeado dentro del componente.

### RF-3 — Heading

Criterios de aceptación (EARS):

- Cuando se indique un nivel de encabezado (h1 a h6), el sistema renderice el texto con esa semántica de encabezado.
- Cuando el contenido se pase por prop, el sistema lo muestre tal cual; ningún texto va hardcodeado dentro del componente.
- El sistema aplique la escala tipográfica editorial (titular masivo frente a cuerpo pequeño) según el nivel indicado.

### RF-4 — Tag

Criterios de aceptación (EARS):

- Cuando se le pase texto corto, el sistema lo renderice como etiqueta monoespaciada.
- Cuando el contenido se pase por prop, el sistema lo muestre tal cual; ningún texto va hardcodeado dentro del componente.

### RF-5 — Contenedor de sección y retícula

Criterios de aceptación (EARS):

- Cuando se renderice una sección, el sistema muestre una retícula de líneas de 1 px sobre el fondo de la sección.
- Cuando el contenido de la sección se pase por prop, el sistema lo muestre tal cual; ningún texto va hardcodeado dentro del contenedor.

### RF-6 — Alternador de tema

Criterios de aceptación (EARS):

- Cuando el usuario active el símbolo de alternar tema, el sistema cambie entre tema claro y oscuro.
- El sistema comunique su función únicamente con el símbolo gráfico y con `aria-label` / `aria-pressed` en ambos idiomas, pasados por prop desde quien lo consume.
- El sistema respete el modo claro y oscuro con el mismo nivel de detalle.

### RF-7 — Cambiador de idioma

Criterios de aceptación (EARS):

- Cuando el usuario active el símbolo de cambiar idioma, el sistema cambie el idioma de la interfaz.
- El sistema comunique su función únicamente con el símbolo gráfico y con `aria-label` / `aria-pressed` en ambos idiomas, pasados por prop desde quien lo consume.

### RF-8 — Logo del home

Criterios de aceptación (EARS):

- Cuando se renderice el home, el sistema muestre la letra "D" extraída del símbolo `id="d"` de `public/logo.svg` (`viewBox="0 0 64 64"`), compuesta por tallo + cursor sin contenedor.
- El sistema adapte el color del logo al tema activo mediante `currentColor` (negro cálido `#121110` en modo claro, crudo cálido `#F2EFE6` en modo oscuro), sin declarar colores propios dentro del componente.
- Cuando el usuario active el logo, el sistema navegue al inicio del sitio.
- Cuando el contenido (src, alt, hijos) se pase por prop, el sistema lo muestre tal cual; ningún texto va hardcodeado dentro del componente.

## Requisitos no funcionales

- **Accesibilidad:** contraste AA en ambos modos, navegable por teclado, indicador de foco visible, información nunca transmitida solo por color y respeto a `prefers-reduced-motion`.
- **Internacionalización:** todo contenido visible se recibe por prop; los textos traducidos viven en los mensajes de la sección que consume al átomo, nunca hardcodeados dentro de él.
- **Rendimiento:** renderizado ligero, sin dependencias de animación por scroll en los átomos.
- **Robustez:** si faltan props obligatorias o los valores son inválidos, el componente renderiza nada (`null`) sin error ni ruptura de la página.
- **Modo claro y oscuro:** igual de cuidados en ambos temas.
- **Estética:** sin color de acento ni decoración gratuita.
- **Movimiento:** los átomos no incluyen animación propia (entrada/salida por scroll corresponde a la spec de movimiento).

## Casos límite

- Button deshabilitado con puntero sobre él: no ejecuta acción, opacidad reducida, sin indicador de foco interactivo.
- Link con href inválido o vacío: no navega, no rompe la página.
- Props obligatorias faltantes en runtime: renderiza nada (`null`), sin error visible ni ruptura de la página.
- Símbolo gráfico opcional ausente en Button/Link: renderiza solo texto.
- Heading sin nivel de encabezado indicado: usa un valor por defecto definido en el tema.
- Tag vacío: renderiza nada (`null`), sin romper la página.
- Alternador de tema y cambiador de idioma sin texto visible: funcionan únicamente con símbolos gráficos y `aria-label` / `aria-pressed`.
- Logo sin `src`, `alt` o hijos: renderiza nada (`null`), sin romper la página.
- `prefers-reduced-motion: reduce`: los átomos no animan por sí mismos; el contenido sigue siendo visible.
- Sin soporte de animaciones por scroll: los átomos siguen siendo visibles.

## Fuera de alcance

- Navbar (se define en la spec de Shell y Hero, 06; no entra en esta spec).
- Animación propia de los átomos (entrada/salida por scroll se resuelve en la spec de movimiento, 05).
- Variantes de tamaño múltiples.
- Estados de carga (loading).
- Tooltips.
- Menús desplegables.

## Criterios de finalización

- Cada átomo tiene tests de comportamiento visible (contenido mostrado, roles y etiquetas accesibles, variantes, interacción, estados), escritos antes del código.
- Cobertura ≥ 95 % (líneas, funciones, ramas, sentencias), forzada por el umbral de Vitest.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` en verde.
- Accesibilidad verificada: contraste AA, teclado, semántica.

## Dudas abiertas

- Ninguna.
