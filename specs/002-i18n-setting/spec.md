# Spec: Configuración i18n (internacionalización)

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
4. Como visitante, si falta una traducción de un texto, quiero verlo en inglés (idioma por defecto) en lugar de un hueco vacío o un código de clave.

## Requisitos funcionales (EARS, en español)

- **RF1.** Cuando el usuario accede al sitio por primera vez, el sistema SHALL detectar el idioma del navegador y mostrar el sitio en ese idioma si está soportado; en caso contrario, SHALL usar inglés como idioma por defecto.
- **RF2.** El sistema SHALL exponer un selector de idioma visible que permita al usuario elegir entre los idiomas soportados.
- **RF3.** Cuando el usuario selecciona un idioma en el selector, el sistema SHALL cambiar todos los textos visibles a ese idioma sin recargar la página.
- **RF4.** El sistema SHALL guardar la preferencia de idioma del usuario en el navegador para que persista entre sesiones.
- **RF5.** Cuando el usuario regresa al sitio y tiene una preferencia guardada, el sistema SHALL mostrar el sitio en ese idioma, por delante de la detección del navegador.
- **RF6.** Cuando un texto visible no tenga traducción para el idioma activo, el sistema SHALL mostrarlo en inglés (idioma de fallback).
- **RF7.** El sistema SHALL soportar N idiomas, siendo inglés y castellano los dos iniciales.
- **RF8.** Cada página SHALL tener metadatos SEO (título y descripción) propios por idioma.

## Requisitos no funcionales

- **RNF1.** Los textos visibles SHALL vivir en diccionarios i18n, nunca escritos directamente en los componentes.
- **RNF2.** La detección inicial y el cambio de idioma SHALL ser rápidos (transiciones entre 150 y 400 ms) y respetar `prefers-reduced-motion`.
- **RNF3.** El sitio SHALL seguir siendo estático: sin base de datos ni backend propio.
- **RNF4.** El renderizado SHALL ser en servidor o estático (SSR/SSG) para SEO.
- **RNF5.** La estructura semántica de encabezados SHALL mantenerse en ambos idiomas.
- **RNF6.** La preferencia de idioma SHALL guardarse en `localStorage` y sincronizarse con una cookie (`lang`) para que el SSR pueda servir el idioma correcto desde la primera carga.
- **RNF7.** El cambio de idioma SHALL redirigir al usuario a la misma ruta en el idioma seleccionado (ej. `/es/proyectos` → `/en/proyectos`).
- **RNF8.** La detección inicial del idioma en el servidor SHALL hacerse mediante un **middleware** que lea, en orden de prioridad: (1) cookie `lang` / `localStorage`, (2) cabecera `Accept-Language`, (3) inglés como fallback.

## Casos límite

- Idioma del navegador no soportado (por ejemplo, francés): se muestra en inglés como fallback.
- El usuario cambia de idioma y navega a otra página: la preferencia se mantiene.
- Página recién añadida sin traducción en un idioma: se muestra en inglés.
- Almacenamiento del navegador bloqueado por el usuario: el sistema cae a la detección del navegador (`Accept-Language`).
- Cookie expirada o eliminada: el middleware vuelve a detectar el idioma del navegador.
- Idioma del navegador no soportado y cookie no disponible: se muestra en inglés (fallback).

## Fuera de alcance (MVP)

- Traducción de contenidos más allá de estructura y navegación (proyectos, experiencia, etc. se dejan para fases futuras).
- Detección de idioma basada en IP.
- Sincronización de preferencia entre dispositivos mediante cuentas de usuario.
- Traducción automática de contenidos generados por el usuario.
- Integración de cookies de terceros para el idioma.

## Criterios de aceptación (finales)

- [ ] El sitio carga en el idioma del navegador si es español o inglés, y en inglés en cualquier otro caso.
- [ ] Existe un selector de idioma funcional que cambia el idioma sin recargar la página.
- [ ] La elección de idioma se conserva al recargar la página y al volver al sitio.
- [ ] Cualquier texto sin traducción se muestra en inglés.
- [ ] Cada ruta tiene metadatos (`title`, `description`) en inglés y español.
- [ ] No hay textos visibles hardcodeados en componentes de presentación.
- [ ] La primera carga del sitio (SSR) sirve el idioma correcto cuando hay cookie guardada.
- [ ] El middleware resuelve el idioma en el orden: cookie/`localStorage` → `Accept-Language` → inglés.
- [ ] Al cambiar el idioma, se actualizan tanto `localStorage` como la cookie `lang`.

## Dudas pendientes [NECESITA ACLARACIÓN]

- Listado exacto de claves de los diccionarios y alcance preciso de textos traducibles en el MVP.