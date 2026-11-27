# Plan — Spec 10: Contact y enlaces del Footer

**Estado:** Pendiente de ejecución. Este plan deriva de la spec 10 y de `docs/constitution.md`. Describe módulos, datos, contratos y verificación; no contiene implementación.

**Cobertura:** RF-1 a RF-8 y requisitos no funcionales de la spec 10.

## 1. Estructura de módulos

Se conserva la estructura del README: sección en `components/sections/`, Footer en el nivel existente de `components/`, átomos en `components/ui/`, lógica pura en `src/lib/` y datos/textos en sus ubicaciones establecidas. No se añaden dependencias, servicios ni carpetas de nivel raíz.

| Módulo | Cambio | Responsabilidad | RF |
|---|---|---|---|
| `src/components/sections/Contact/Contact.tsx` | Nuevo | Componer la sección `04 / CONTACT`, el titular, el texto, el email prominente y los cuatro enlaces. Lee los textos traducidos y los datos estáticos del sitio. | RF-1, RF-2, RF-3, RF-4, RF-5, RF-7 |
| `src/components/sections/Contact/Contact.module.css` | Nuevo | Aplicar escala editorial, composición adaptable e inversión visual del email usando exclusivamente tokens del tema. | RF-7, NFR de contraste y adaptación |
| `src/components/sections/Contact/Contact.test.tsx` | Nuevo | Verificar contenido, etiquetas, destinos, roles y comportamiento accesible en inglés y español. | RF-1, RF-2, RF-3, RF-4, RF-5, RF-7 |
| `src/lib/contact-links.ts` | Nuevo | Construir las descripciones de enlaces a partir de `SiteData`, el idioma, las etiquetas traducidas y la ubicación (`contact` o `footer`). No contiene JSX ni accede al estado global. | RF-2, RF-3, RF-4, RF-5, RF-8 |
| `src/lib/contact-links.test.ts` | Nuevo | Probar por tabla la selección de destinos por idioma, las diferencias Contact/Footer y las entradas incompletas. | RF-2, RF-3, RF-4, RF-5, RF-8 |
| `src/components/Footer/Footer.tsx` | Extender | Consumir los enlaces compartidos, conservar copyright e iconos, y mantener el aviso de nueva pestaña solo para tecnologías de asistencia. | RF-2, RF-3, RF-4, RF-5, RF-6, RF-8 |
| `src/components/Footer/Footer.test.tsx` | Extender | Cubrir etiquetas localizadas, destinos, aviso accesible, copyright y datos incompletos sin romper los demás enlaces. | RF-2, RF-3, RF-4, RF-5, RF-6, RF-8 |
| `src/components/ui/Link/Link.tsx` | Extender | Añadir una prop opcional `className` que permita a Contact aplicar su presentación al enlace prominente sin duplicar la semántica de ancla ni su comportamiento seguro. Mantener intacta la presentación por defecto. | RF-3, RF-4, RF-5, RF-7 |
| `src/components/ui/Link/Link.test.tsx` | Extender | Verificar que la prop opcional no altera el contrato actual y que target, `rel` y `srLabel` siguen funcionando. | RF-3, RF-4, RF-5 |
| `src/app/[locale]/page.tsx` | Extender | Renderizar Contact en el destino existente `contact`, en lugar del encabezado reservado sin contenido. Mantener orden e identificador. | RF-1, RF-2, RF-7 |
| `messages/en.json`, `messages/es.json` | Extender | Añadir los textos aprobados de Contact y ajustar las etiquetas: `Email` / `Correo`, `CV` / `Currículum`. Reutilizar `shared.newTab` únicamente para el aviso accesible del Footer. | RF-1, RF-2, RF-4, RF-5, RF-6 |

### 1.1 Composición de Contact

Contact reutiliza `Section`, `SectionHeading`, `Heading`, `Reveal` y `Link`. El encabezado de sección mantiene el id `contact` y el número `04`. El titular editorial utiliza `Reveal` con variante `clip` y `isLastSection`; los demás bloques revelables de Contact también reciben el comportamiento de última sección. El Footer permanece fuera de `Reveal`, como exige el contrato general.

La integración no modifica el layout ni los destinos de navegación. La página sustituye únicamente el contenido reservado de Contact por la sección nueva.

**Cobertura RF:** RF-1, RF-2, RF-7.

### 1.2 Fuentes de texto y datos

- Los textos visibles se leen de los catálogos en inglés y español.
- Los valores no traducibles —email, perfiles sociales y rutas de CV por idioma— se reutilizan de `SiteData`.
- `shared.newTab` ya existe traducido. Se entrega a `Link` solo desde el Footer; Contact omite `srLabel`.
- El copyright reutiliza el texto ya existente.
- No se duplican URLs ni se guardan textos en los componentes.

**Cobertura RF:** RF-1 a RF-6.

## 2. Modelo de datos

No se introduce estado persistente ni un store. El modelo reutiliza `SiteData` y los mensajes existentes; la única estructura nueva es una descripción ligera de enlace para que Contact y Footer compartan la resolución de destinos.

### 2.1 Datos de entrada existentes

| Dato | Fuente | Ejemplo |
|---|---|---|
| Idioma | Locale activo del sitio | `es` |
| Email | `SiteData.email` | `suarezgallardopedro@gmail.com` |
| GitHub | `SiteData.githubUrl` | `https://github.com/PedroSG00` |
| LinkedIn | `SiteData.linkedinUrl` | `https://linkedin.com/in/pedro-suarez-gallardo` |
| CV | `SiteData.cvPath[locale]` | `/ES_Pedro_Suarez_Gallardo_CV.pdf` |
| Etiquetas | Mensajes de `contact` | `Correo`, `LinkedIn`, `GitHub`, `Currículum` |
| Aviso accesible | Mensaje `shared.newTab` | `se abre en una pestaña nueva` |
| Ubicación | Parámetro de construcción | `contact` o `footer` |

### 2.2 Descripción de enlace

| Campo | Significado |
|---|---|
| `channel` | `email`, `linkedin`, `github` o `cv` |
| `label` | Etiqueta visible en el idioma actual |
| `href` | Destino resuelto a partir de `SiteData` |
| `target` | Navegación en la pestaña actual para email; pestaña nueva para LinkedIn, GitHub y CV |
| `srLabel` | Opcional. Solo se asigna a enlaces externos del Footer; nunca se asigna a los enlaces de Contact |

### 2.3 Ejemplo de datos resueltos

Idioma activo: español.

| Ubicación | Canal | Etiqueta | Destino | Pestaña | Aviso para tecnología de asistencia |
|---|---|---|---|---|---|
| Contact | Email | Correo | `mailto:suarezgallardopedro@gmail.com` | Actual | Ninguno |
| Contact | LinkedIn | LinkedIn | `https://linkedin.com/in/pedro-suarez-gallardo` | Nueva | Ninguno |
| Contact | GitHub | GitHub | `https://github.com/PedroSG00` | Nueva | Ninguno |
| Contact | CV | Currículum | `/ES_Pedro_Suarez_Gallardo_CV.pdf` | Nueva | Ninguno |
| Footer | Email | Correo | `mailto:suarezgallardopedro@gmail.com` | Actual | Ninguno |
| Footer | LinkedIn | LinkedIn | `https://linkedin.com/in/pedro-suarez-gallardo` | Nueva | `se abre en una pestaña nueva` |
| Footer | GitHub | GitHub | `https://github.com/PedroSG00` | Nueva | `se abre en una pestaña nueva` |
| Footer | CV | Currículum | `/ES_Pedro_Suarez_Gallardo_CV.pdf` | Nueva | `se abre en una pestaña nueva` |

**Cobertura RF:** RF-2, RF-3, RF-4, RF-5.

## 3. Algoritmos clave en pseudocódigo

### 3.1 Construcción de enlaces por idioma y ubicación

**Entrada:** idioma, ubicación, `SiteData` y etiquetas traducidas.
**Salida:** lista ordenada de enlaces con destino, target y aviso accesible aplicables.

```text
FUNCTION buildContactLinks(locale, placement, site, labels):
    cvDestination = site.cvPath[locale]

    candidates = [
        { channel: email,    href: mailto(site.email),     label: labels.email },
        { channel: linkedin, href: site.linkedinUrl,       label: labels.linkedin },
        { channel: github,   href: site.githubUrl,         label: labels.github },
        { channel: cv,       href: cvDestination,          label: labels.cv }
    ]

    links = []

    FOR EACH candidate IN candidates:
        IF candidate.href is empty:
            CONTINUE

        IF candidate.channel == email:
            target = current tab
            srLabel = none
        ELSE:
            target = new tab
            IF placement == footer:
                srLabel = labels.newTab
            ELSE:
                srLabel = none

        APPEND candidate + target + srLabel TO links

    RETURN links
```

No se sustituye un CV ausente por el del otro idioma. La ausencia de un enlace obligatorio debe hacer fallar la validación de los datos de entrega, aunque el renderizado omita el enlace incompleto para no crear un destino roto.

**Cobertura RF:** RF-2, RF-3, RF-4, RF-5, RF-8.

### 3.2 Validación de los dos CV

**Entrada:** los dos destinos estáticos de CV.
**Salida:** validación aprobada o cierre de la funcionalidad bloqueado.

```text
FOR EACH locale IN ["en", "es"]:
    destination = site.cvPath[locale]

    IF destination is missing:
        FAIL completion

    IF destination does not resolve to a readable document:
        FAIL completion

    IF document language does not match locale:
        FAIL completion

PASS CV validation
```

La comprobación incluye verificar el contenido de ambos documentos; una respuesta correcta del destino por sí sola no demuestra que el PDF esté íntegro ni en el idioma adecuado.

**Cobertura RF:** RF-5, RF-8.

### 3.3 Revelado e inversión visual

No se añade un algoritmo JavaScript. El titular usa el reveal `clip` existente, cada bloque de Contact respeta la excepción de última sección y el Footer queda excluido. El enlace prominente responde a hover y foco con estados visuales equivalentes; sus estilos salen de los tokens existentes.

**Cobertura RF:** RF-7 y NFR de movimiento.

## 4. Contratos de interfaz

### 4.1 Sección `Contact`

- **Entradas:** idioma y traducciones disponibles en el contexto i18n; datos estáticos del sitio. No necesita estado local.
- **Salidas:** sección identificada como `contact`, encabezado `04 / CONTACT`, titular y texto localizados, email prominente y enlaces a los cuatro canales.
- **Errores:** una traducción ausente hace fallar las pruebas de mensajes; un destino obligatorio ausente se omite para no producir un enlace roto y bloquea la aceptación de los datos. No hay fallback a texto o URL inventados.
- **RF:** RF-1, RF-2, RF-3, RF-4, RF-5, RF-7, RF-8.

### 4.2 `buildContactLinks`

- **Entradas:** `locale`, ubicación (`contact` o `footer`), `SiteData` y las etiquetas localizadas.
- **Salidas:** descripciones ordenadas para email, LinkedIn, GitHub y CV; `target` y `srLabel` según canal y ubicación.
- **Errores:** URL vacía o CV ausente para el idioma activo: omitir ese enlace, no usar otra URL como sustitución y hacer fallar la validación de entrega.
- **RF:** RF-2, RF-3, RF-4, RF-5, RF-8.

### 4.3 Footer existente

- **Entradas:** se conservan `site`, `locale` y las etiquetas actuales.
- **Salidas:** cuatro enlaces y copyright; enlaces externos con navegación nativa a pestaña nueva y aviso localizado solo para tecnologías de asistencia.
- **Errores:** si falta una URL, se omite ese enlace y el resto del Footer sigue renderizándose. La validación de la configuración estática impide dar por terminado el MVP con un canal obligatorio ausente.
- **RF:** RF-2, RF-3, RF-4, RF-5, RF-6, RF-8.

### 4.4 Átomo `Link`

- **Entradas:** etiqueta, destino, target opcional, `srLabel` opcional y nueva prop opcional de clase de presentación.
- **Salidas:** enlace nativo; para target de pestaña nueva conserva `rel="noreferrer noopener"`. Cuando no se pasa `srLabel`, el nombre accesible no añade un aviso.
- **Errores:** un destino vacío no navega; las entradas incompletas no deben provocar una excepción.
- **RF:** RF-3, RF-4, RF-5, RF-7.

### 4.5 Datos y mensajes

- **Datos:** se conserva el contrato actual de `SiteData`; no se añaden email, redes ni rutas de CV duplicados.
- **Mensajes:** se reutiliza `contact.intro` para la etiqueta de sección y se añaden las cadenas aprobadas de titular y cuerpo. Las etiquetas españolas pasan a `Correo` y `Currículum`. El aviso existente de nueva pestaña sigue reservado al Footer.
- **Errores:** falta de paridad de claves entre idiomas bloquea la validación.
- **RF:** RF-1, RF-2, RF-4, RF-5, RF-6.

## 5. Decisiones técnicas justificadas

| Decisión | Justificación | Alternativa descartada | RF |
|---|---|---|---|
| Reutilizar `SiteData` para email, redes y CV, y mensajes para todo texto. | Evita duplicar destinos y cumple la separación entre contenido y UI. | Hardcodear valores o copias traducidas dentro de Contact/Footer. | RF-1 a RF-6 |
| Centralizar la resolución de enlaces en una función pura compartida por Contact y Footer. | Las dos ubicaciones muestran los mismos canales y deben coincidir en destino e idioma; solo difiere el aviso accesible del Footer. | Mantener dos listas independientes de destinos y reglas de idioma, con riesgo de divergencia. | RF-2, RF-3, RF-4, RF-5, RF-8 |
| Reutilizar `Link` y añadir una prop opcional de presentación. | Mantiene un único contrato de ancla, navegación segura y foco; permite que Contact aplique la escala visual del email sin crear otro componente. | Crear un enlace especializado para Contact o duplicar la gestión de `target` y `rel`. | RF-3, RF-4, RF-5, RF-7 |
| Usar navegación nativa con target de pestaña nueva; no abrir ventanas mediante lógica propia. | El navegador gestiona la apertura y sus preferencias; el componente existente ya añade el `rel` seguro. | `window.open` y detección de bloqueos o fallos de apertura. | RF-4, RF-5, RF-8 |
| Aplicar `srLabel` solo a enlaces externos del Footer. | Coincide con la decisión de la spec: Contact no anuncia la apertura; el Footer conserva el aviso localizado solo para tecnologías de asistencia. | Mostrar el aviso visualmente en ambas zonas o anunciarlo también en Contact. | RF-4, RF-5 |
| Resolver el CV exclusivamente con el idioma actual, sin fallback a la otra versión. | Impide presentar un documento que no corresponda a la lengua elegida. | Selector de CV o sustitución silenciosa por el documento disponible. | RF-5, RF-8 |
| Usar `Reveal` con variante `clip` y la excepción existente para la última sección. | Reutiliza el comportamiento global, mantiene visible el contenido al final y respeta movimiento reducido y fallbacks. | Animación propia con JavaScript o un reveal nuevo para Contact. | RF-7 |
| Mantener la sección síncrona y sin servicios ni dependencias nuevas. | El contenido es estático y ya existe en el repositorio; no se justifica estado asíncrono ni infraestructura adicional. | Backend, servicio de contacto, formulario o dependencia de animación. | RF-1 a RF-8 y NFR |

## 6. Estrategia de tests

Los tests se escriben antes de implementar. Verifican contenido, nombres accesibles, navegación y estados observables. No usan snapshots, clases CSS ni estructura interna como criterio de aceptación. Se conservan el umbral global de cobertura y los gates del proyecto.

### 6.1 Tests unitarios de lógica pura

| Área | Casos | RF |
|---|---|---|
| Resolución de enlaces | Tabla de locales `en` y `es`; orden y etiquetas; `mailto`; perfiles; CV correspondiente al locale; nunca elegir el CV de otro idioma. | RF-2, RF-3, RF-4, RF-5 |
| Ubicación | Contact omite `srLabel`; Footer añade `shared.newTab` solo a LinkedIn, GitHub y CV; email nunca abre una pestaña nueva. | RF-3, RF-4, RF-5 |
| Configuración incompleta | URL social vacía; email vacío; CV ausente en un locale; no se reutiliza el CV del otro locale y la validación de entrega falla. | RF-3, RF-4, RF-5, RF-8 |

### 6.2 Tests de componentes con mensajes reales

| Componente | Verificaciones | RF |
|---|---|---|
| `Contact` | Titular y cuerpo exactos en ambos idiomas; encabezado Contact; cuatro enlaces con etiquetas localizadas y destinos correctos; email visible; los enlaces nuevos no anuncian la pestaña; etiqueta de foco y estados visibles de teclado. | RF-1, RF-2, RF-3, RF-4, RF-5, RF-7 |
| `Footer` | Cuatro canales, copyright, CV según locale; LinkedIn, GitHub y CV anuncian apertura a tecnología de asistencia sin mostrar el aviso; email sin aviso; los enlaces restantes sobreviven a una URL opcional ausente. | RF-2, RF-3, RF-4, RF-5, RF-6, RF-8 |
| `Link` | Se conserva el comportamiento por defecto; presentación personalizada no altera nombre accesible, href, navegación nativa ni `rel`; `srLabel` solo se incorpora cuando se proporciona. | RF-3, RF-4, RF-5, RF-7 |
| Paridad i18n | Las claves nuevas coinciden entre inglés y español; verificar `Correo` y `Currículum` en la versión española. | RF-1, RF-2, RF-4, RF-5, RF-6 |

### 6.3 E2E con Playwright

- En `/en` y `/es`, verificar contenido, orden, etiquetas y destinos en Contact y Footer.
- Verificar que LinkedIn, GitHub y CV usan navegación de pestaña nueva; Contact no añade aviso accesible y Footer sí lo anuncia en el idioma activo.
- Comprobar que el CV inglés y español responden correctamente, y revisar que cada documento contiene el idioma esperado. Si falla disponibilidad, legibilidad o correspondencia, bloquear la entrega.
- Con movimiento normal, verificar entrada recortada del titular, estado completo en la zona estable, inversión visual de email al hover y estado equivalente al foco.
- Con `prefers-reduced-motion: reduce`, verificar contenido visible y estático.
- En el final de página, verificar que los bloques de Contact permanecen totalmente visibles; verificar también que Footer no participa en el revelado.
- Ejecutar los escenarios relevantes en ambos temas. Para el flujo de idioma y scroll, respetar las condiciones de movimiento reducido de la constitución.
- En la comprobación sin JavaScript existente, confirmar que Contact conserva textos y destinos navegables.
- Usar consultas por rol, texto y nombre accesible; comprobar estilos computados solo para el comportamiento visual observable.

### 6.4 Gates

- Ejecutar en el orden de la constitución: `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`.
- Ejecutar `pnpm test:e2e` porque la sección incorpora movimiento y debe verificarse el comportamiento de scroll.
- No bajar el umbral global de cobertura ni añadir exclusiones.

## 7. Trazabilidad RF → plan

| RF | Módulos | Modelo y algoritmo | Contratos | Tests |
|---|---|---|---|---|
| RF-1 Contenido bilingüe | `Contact`, mensajes, página | Mensajes `contact.title/body` | Contact, datos y mensajes | Contact en `en` y `es`; paridad i18n |
| RF-2 Cuatro canales y etiquetas | Contact, Footer, `contact-links` | `ContactLink`; construcción por ubicación | Contact, Footer, `buildContactLinks` | Roles, etiquetas, cantidad y destinos |
| RF-3 Email | Contact, Footer, `Link`, `contact-links` | Descriptor `email` con destino de correo y pestaña actual | Link y builder | Destinatario, etiqueta, visibilidad y ausencia de acción de copia |
| RF-4 LinkedIn y GitHub | Contact, Footer, `Link`, `contact-links` | Destinos estáticos; `srLabel` según ubicación | Link y builder | Target, destino, ausencia/presencia del nombre accesible adicional |
| RF-5 CV localizado | Contact, Footer, `contact-links` | Selección estricta por locale; validación de ambos documentos | Builder y datos | `en`/`es`, respuesta, integridad y correspondencia de idioma |
| RF-6 Copyright | Footer, mensajes | Texto existente reutilizado | Footer y mensajes | Contenido del Footer en ambos idiomas |
| RF-7 Momento firma y movimiento | Contact, `Link`, `Reveal`, estilos | Reveal existente, última sección; hover/foco | Contact y Link | Computed styles, reduced motion, carga visible y final de página |
| RF-8 Fallos y robustez | `contact-links`, Contact, Footer | Omisión segura; validación bloqueante del CV | Builder, Footer y Contact | Datos incompletos, PDFs y ausencia de fallos de render |

## 8. Cumplimiento de la constitución

| Regla | Aplicación en este plan |
|---|---|
| Stack cerrado | No se añaden librerías, servicios ni backend. Se reutilizan los componentes y herramientas existentes. |
| Spec antes que código | El plan deriva de la spec 10; cualquier divergencia se resuelve primero en la spec. |
| Componentes atomizados | Contact es una sección con una responsabilidad; Footer y Link conservan su propósito. Los componentes nuevos tienen pruebas junto a ellos. |
| Sin repetición | Se centraliza la construcción de enlaces compartidos; no se duplican datos ni reglas de idioma. |
| Textos y datos fuera de UI | Textos en mensajes bilingües; URLs y CV en `SiteData`; la sección compone ambos. |
| i18n completo | Toda etiqueta nueva se incorpora simultáneamente a inglés y español; los textos de tecnologías de asistencia también se localizan. |
| Estructura estable | No hay carpetas nuevas de nivel raíz, capas preventivas ni barrel files; Contact ocupa el espacio de sección ya reservado. |
| Tests de calidad | Tests primero; consultas por roles/texto; estilos computados únicamente para resultados visibles. |
| Cobertura | Se conserva el umbral global del 85 % sin exclusiones nuevas. |
| Definición de terminado | Gates completos; E2E por el movimiento de Contact. |
| Código en inglés | Nombres de módulos, tipos, props y funciones en inglés; contenido y documentación en los idiomas acordados. |
| Dirección visual | Titular de gran escala, email prominente, retícula y tokens; no se añade color de acento ni decoración gratuita. |
| Voz de marca | Se usan los textos aprobados; no se inventan datos ni cifras. |
| No negociables | Contraste AA, teclado, semántica, movimiento reducido, contenido visible sin JavaScript y rendimiento. |
