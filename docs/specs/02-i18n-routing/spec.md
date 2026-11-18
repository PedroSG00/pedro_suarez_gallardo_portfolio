# 02 — i18n y rutas

**Estado:** Completada y aprobada. La implementación se integró en el PR #12.

## Contexto y objetivo

El portfolio debe poder consultarse en inglés y español desde rutas identificables y compartibles. La experiencia debe mantener un solo idioma por página y facilitar el cambio de idioma sin perder la sección que se está leyendo.

El objetivo es definir el comportamiento de las rutas localizadas, la selección del idioma inicial y el cambio de idioma entre secciones, sin mezclar inglés y español en la misma página.

## Usuarios

- Reclutadores, audiencia principal.
- Clientes potenciales, audiencia secundaria.
- Visitantes que llegan mediante un enlace directo o tienen una preferencia de idioma configurada en el navegador.

## Historias de usuario

- Como visitante, quiero abrir el portfolio en inglés o español mediante una ruta clara para compartir o guardar el idioma que prefiero.
- Como visitante que llega a la portada sin una preferencia previa, quiero verla en el idioma que prefiero en el navegador.
- Como visitante que ya eligió un idioma, quiero que esa elección se respete cuando vuelva a la portada, también entre visitas posteriores.
- Como visitante, quiero cambiar de idioma y permanecer en la sección que estoy leyendo, conservando también los parámetros de la URL.
- Como visitante, quiero recibir una indicación clara cuando la ruta solicitada no existe o usa un idioma no admitido.

## Requisitos funcionales

### RF-1 — Resolución de la portada sin idioma

Criterios de aceptación (EARS):

- Cuando una persona visite `/` y exista una elección explícita de idioma hecha previamente, el sistema deberá dirigirla a la portada de ese idioma.
- La elección explícita deberá recordarse mediante una cookie del cliente con expiración larga y deberá persistir entre visitas posteriores mientras no se borre.
- Cuando una persona visite `/` y no exista una elección explícita previa, el sistema deberá elegir el idioma preferido compatible del navegador.
- El idioma preferido del navegador se resolverá respetando el orden de `Accept-Language`, normalizando subtags regionales (`es-ES` → `es`, `en-US` → `en`) y usando inglés como fallback si no hay coincidencia.
- Si el navegador no indica una preferencia compatible, o si no se puede leer ni escribir la cookie (modo incógnito, cookies bloqueadas), el sistema deberá dirigir a la portada en inglés.

### RF-2 — Rutas de idioma admitidas

Criterios de aceptación (EARS):

- Cuando una persona visite `/en`, el sistema deberá mostrar la portada en inglés.
- Cuando una persona visite `/es`, el sistema deberá mostrar la portada en español.
- Cuando una persona abra directamente una de esas rutas, el sistema deberá mostrar el idioma indicado por la ruta, independientemente del idioma del navegador y de cualquier elección previa guardada.
- Las rutas se normalizarán a minúsculas sin trailing slash (`/EN` → `/en`, `/es/` → `/es`).
- Cualquier ruta con doble prefijo de idioma (`/en/es`) devolverá 404.

### RF-3 — Cambio de idioma

Criterios de aceptación (EARS):

- Cuando una persona cambie el idioma desde una sección de la portada, el sistema deberá mostrar esa sección en el otro idioma.
- Cuando la URL contenga un fragmento que identifique la sección actual, el sistema deberá conservarlo al cambiar de idioma, aunque el fragmento no exista en el idioma de destino.
- Cuando la URL contenga parámetros de consulta, el sistema deberá conservarlos tal cual al cambiar de idioma, sin modificar ni interpretar claves arbitrarias.
- Cuando el usuario tenga una elección previa guardada pero entre directamente a `/en` o `/es`, la ruta explícita tendrá prioridad sobre la elección guardada.
- El sistema no deberá mezclar inglés y español en la misma página al cambiar de idioma.
- Cuando el usuario cambie de idioma desde una ruta inexistente (`/en/unknown`), el sistema deberá conservar el path bajo el nuevo idioma (`/es/unknown`), que seguirá siendo 404 si ese path no existe.

### RF-4 — Prefijo de idioma no admitido

Criterios de aceptación (EARS):

- Cuando una persona solicite una ruta con un prefijo de idioma no admitido, como `/fr` o `/fr/about`, el sistema deberá mostrar una página 404.
- El sistema no deberá redirigir automáticamente una ruta con idioma no admitido a otro idioma.
- La página 404 deberá devolver código HTTP 404 real y mostrar un mensaje visible en inglés cuando no se pueda inferir el idioma de la ruta.

### RF-5 — Ruta inexistente bajo un idioma admitido

Criterios de aceptación (EARS):

- Cuando una persona solicite una ruta inexistente bajo `/en` o `/es`, el sistema deberá mostrar una página 404.
- El sistema no deberá redirigir automáticamente una ruta inexistente a la portada.
- La página 404 deberá devolver código HTTP 404 real y mostrar un mensaje visible en el idioma de la ruta.

### RF-6 — Organización de las traducciones

Criterios de aceptación (EARS):

- Cuando se incorporen textos de una parte de la página, el sistema deberá mantenerlos agrupados de forma coherente con esa parte.
- Las agrupaciones previstas deberán cubrir la interfaz compartida, Hero, About, Experience/Work, Stack, Contact, Footer y los textos de mensaje de UI por idioma.
- Los metadatos SEO (`hreflang`, sitemap, robots, metadatos de página) quedan fuera de esta spec y corresponden a la spec 11.
- El sistema no deberá incorporar en esta fase textos ni rutas de la sección de proyectos, que permanece aparcada.
- Los archivos de traducción vivirán en la raíz del proyecto (`messages/en.json` y `messages/es.json`).

### RF-7 — Paridad de traducciones

Criterios de aceptación (EARS):

- Cuando se valide el conjunto de traducciones, el sistema deberá comprobar que inglés y español contienen las mismas claves.
- Si falta una clave en uno de los idiomas o sobra respecto al otro, la validación deberá fallar.
- Cualquier adición o modificación de claves deberá realizarse en inglés y español en el mismo cambio.
- Cuando un texto no esté disponible en el idioma solicitado, el sistema no deberá sustituirlo silenciosamente por el texto del otro idioma.

## Requisitos no funcionales

- Las rutas localizadas deberán ser comprensibles, estables y compartibles.
- La selección de idioma no deberá producir páginas que mezclen inglés y español.
- Los textos visibles cubiertos por esta funcionalidad deberán disponer de su contenido correspondiente en ambos idiomas.
- Los errores por rutas inexistentes o idiomas no admitidos deberán ser claros y coherentes (código HTTP 404 real y mensaje visible).

## Casos límite

- La preferencia del navegador no corresponde a ninguno de los idiomas admitidos: se utiliza inglés.
- La persona vuelve a `/` después de elegir un idioma: prevalece su última elección explícita, también entre visitas posteriores mientras esté disponible.
- La persona solicita una ruta con un idioma no admitido: se muestra 404, sin redirección.
- La persona solicita una ruta inexistente bajo un idioma admitido: se muestra 404, sin redirección a la portada.
- Falta una traducción en uno de los idiomas: la paridad debe fallar; no se muestra texto de respaldo en otro idioma.
- La persona cambia de idioma desde una sección identificada en la URL: se conserva esa sección y los parámetros de consulta cuando existen.
- La persona cambia de idioma desde una ruta inexistente: se conserva el path bajo el nuevo idioma.
- El navegador está en modo incógnito o tiene cookies bloqueadas: se usa la preferencia del navegador y, como alternativa, inglés, sin bloquear la experiencia.
- Rutas con mayúsculas o trailing slash: se normalizan a minúsculas sin trailing slash.

## Fuera de alcance

- Añadir idiomas distintos del inglés y el español.
- Crear la sección de proyectos o rutas de proyectos.
- Definir el diseño visual del selector de idioma.
- Definir los textos finales de secciones cuya spec de contenido aún no esté redactada.
- Definir metadatos SEO, `hreflang`, sitemap y robots, que corresponden a la spec 11.

## Criterios de finalización

- `/en` y `/es` muestran la portada en el idioma correspondiente al abrirse directamente.
- `/` respeta la última elección explícita, también entre visitas posteriores; si no existe, usa la preferencia compatible del navegador y, como alternativa, inglés.
- El cambio de idioma conserva el fragmento de sección y los parámetros de consulta cuando existen.
- Las rutas con idioma no admitido y las rutas inexistentes muestran 404 con código HTTP real y mensaje visible.
- La validación detecta diferencias entre las claves de traducción de inglés y español.
- Cualquier adición o modificación de claves va en ambos idiomas en el mismo cambio.
- La falta de una traducción no provoca que se muestre contenido del otro idioma.
- Se han escrito tests antes que el código: criterios de unidad e integración con Vitest y RTL, y flujos críticos de idioma y navegación con Playwright (e2e).
- Se han superado los gates de calidad obligatorios del proyecto (`pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` en verde; `pnpm test:e2e` porque se toca idioma y navegación).

## Dudas abiertas

- Ninguna.
