# Spec: Configuración i18n (internacionalización)

> **Actualizada el 11 de noviembre de 2026:** el cambio de idioma se resuelve navegando a la misma página en el idioma elegido, con la URL actualizada (ver RF3 y RNF2). La promesa anterior de «cambio sin recarga» se descarta porque el idioma vive en la URL; el cambio vigente lo establece la spec 003.
>
> **Actualizada también el 12 de noviembre de 2026:** la 003 deroga el respaldo a inglés en tiempo de ejecución (RF6) y la persistencia dual de idioma (RNF6). Los dos diccionarios deben tener el mismo juego de claves, la comprobación falla antes de publicar y la preferencia vive solo en la cookie `lang`.

## Contexto
El sitio es un portfolio/currículum estático dirigido principalmente a reclutadores, con una audiencia secundaria de clientes potenciales. Actualmente todo el texto visible está escrito directamente en los componentes en un solo idioma, sin soporte de internacionalización. El sitio es estático, sin base de datos ni backend propio, y se prevé extenderlo a N idiomas en el futuro (inglés y castellano como iniciales).

## Qué
Añadir un sistema de internacionalización que separe los textos visibles de los componentes, permita mostrar el sitio en inglés y castellano, ofrezca un mecanismo de cambio de idioma y persista la preferencia del usuario.

## Por qué
Los reclutadores pueden navegar en cualquiera de los dos idiomas, y separar los textos de los componentes evita duplicar lógica de UI. Además, cumple la regla del proyecto de que todo texto visible viva en diccionarios i18n y no directamente en los componentes.

## Usuarios
- **Reclutadores** (audiencia principal): leen el CV y los proyectos en su idioma preferido.
- **Clients potenciales** (audiencia secundaria): mismo caso.
- **Visitante anónimo**: no tiene cuenta, por lo que la preferencia de idioma debe guardarse en el navegador sin requerir login.

## Historias de usuario
1. Como visitante, quiero ver el sitio en el idioma de mi navegador (español o inglés) sin configurar nada, para entender el contenido inmediatamente.
2. Como visitante, quiero cambiar el idioma mediante un selector visible, para leer el sitio en el idioma que elija.
3. Como visitante, quiero que el sitio recuerde mi idioma elegido al volver, para no tener que seleccionarlo de nuevo.
4. Como visitante, quiero que el sitio esté completamente traducido en el idioma activo, para no leer una pantalla mezclada.

## Requisitos funcionales (EARS, en español)

- **RF1.** Cuando el usuario accede al sitio por primera vez, el sistema SHALL detectar el idioma del navegador y mostrar el sitio en ese idioma si está soportado; en caso contrario, SHALL usar inglés como idioma por defecto.
- **RF2.** El sistema SHALL exponer un selector de idioma visible que permita al usuario elegir entre los idiomas soportados.
- **RF3.** Cuando el usuario selecciona un idioma en el selector, el sistema SHALL navegar a la misma página en el idioma elegido, actualizando la URL para que refleje el idioma activo (por ejemplo, `/es/proyectos` → `/en/proyectos`), de forma que el enlace sea compartible, el historial del navegador funcione y el cambio siga disponible sin JavaScript.
- **RF4.** El sistema SHALL guardar la preferencia de idioma del usuario en el navegador para que persista entre sesiones.
- **RF5.** Cuando el usuario regresa al sitio y tiene una preferencia guardada, el sistema SHALL mostrar el sitio en ese idioma, por delante de la detección del navegador.
- **RF6.** El sistema SHALL exigir que los dos diccionarios tengan exactamente el mismo juego de claves y SHALL impedir publicar si falta una traducción; no SHALL mostrar un texto en otro idioma como respaldo.
- **RF7.** El sistema SHALL soportar N idiomas, siendo inglés y castellano los dos iniciales.
- **RF8.** Cada página SHALL tener metadatos SEO (título y descripción) propios por idioma.

## Requisitos no funcionales

- **RNF1.** Los textos visibles SHALL vivir en diccionarios i18n, nunca escritos directamente en los componentes.
- **RNF2.** La detección inicial del idioma SHALL ser inmediata, sin pasos intermedios visibles para el visitante. El cambio de idioma SHALL resolverse mediante la navegación a la URL equivalente descrita en RF3 y RNF7. Cualquier transición o revelado asociado SHALL ser contenido, encajar con la identidad minimalista de alto impacto y respetar `prefers-reduced-motion`.
- **RNF3.** El sitio SHALL seguir siendo estático: sin base de datos ni backend propio.
- **RNF4.** El renderizado SHALL ser en servidor o estático (SSR/SSG) para SEO.
- **RNF5.** La estructura semántica de encabezados SHALL mantenerse en ambos idiomas.
- **RNF6.** La preferencia de idioma SHALL guardarse en una única cookie `lang`, de modo que el servidor pueda servir el idioma correcto desde la primera carga y no exista una segunda copia que pueda contradecirla.
- **RNF7.** El cambio de idioma SHALL redirigir al usuario a la misma ruta en el idioma seleccionado (ej. `/es/proyectos` → `/en/proyectos`).
- **RNF8.** La detección inicial del idioma en el servidor SHALL hacerse en un único punto que lea, en orden de prioridad: (1) cookie `lang`, (2) cabecera `Accept-Language`, (3) inglés como opción por defecto.

## Casos límite

- Idioma del navegador no soportado (por ejemplo, francés): se muestra en inglés por ser el idioma por defecto.
- El usuario cambia de idioma y navega a otra página: la preferencia se mantiene.
- Página recién añadida sin traducción en un idioma: la comprobación falla antes de publicar y la página no se sirve a medias.
- Almacenamiento del navegador bloqueado por el usuario: se aplica el idioma de la URL y, si no lo hay, la detección del navegador (`Accept-Language`).
- Cookie expirada o eliminada: el servidor vuelve a detectar el idioma del navegador.
- Idioma del navegador no soportado y cookie no disponible: se muestra en inglés por ser el idioma por defecto.

## Fuera de alcance (MVP)

- Traducción de contenidos más allá de estructura y navegación (proyectos, experiencia, etc. se dejan para fases futuras).
- Detección de idioma basada en IP.
- Sincronización de preferencia entre dispositivos mediante cuentas de usuario.
- Traducción automática de contenidos generados por el usuario.
- Integración de cookies de terceros para el idioma.

## Criterios de aceptación (finales)

- [ ] El sitio carga en el idioma del navegador si es español o inglés, y en inglés en cualquier otro caso.
- [ ] Existe un selector de idioma funcional que navega a la misma página en el idioma elegido y actualiza la URL.
- [ ] La elección de idioma se conserva al recargar la página y al volver al sitio.
- [ ] Cualquier texto sin traducción impide publicar: los dos diccionarios tienen las mismas claves.
- [ ] Cada ruta tiene metadatos (`title`, `description`) en inglés y español.
- [ ] No hay textos visibles hardcodeados en componentes de presentación.
- [ ] La primera carga del sitio (SSR) sirve el idioma correcto cuando hay cookie guardada.
- [ ] El servidor resuelve el idioma en el orden: cookie `lang` → `Accept-Language` → inglés.
- [ ] Al cambiar el idioma, se actualiza la cookie `lang` y ninguna otra copia de la preferencia.

## Dudas pendientes [NECESITA ACLARACIÓN]

- Listado exacto de claves de los diccionarios y alcance preciso de textos traducibles en el MVP.