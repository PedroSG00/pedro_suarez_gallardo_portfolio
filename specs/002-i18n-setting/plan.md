# Plan: Configuración i18n (internacionalización)

**Spec origen:** `specs/002-i18n-setting/spec.md`
**Constitución:** `docs/constitution.md`
**Idiomas iniciales:** `en` (default y fallback), `es`
**Alcance:** MVP — estructura y navegación. Proyectos y experiencia quedan fuera (spec, "Fuera de alcance").

## 0. Supuestos y puntos abiertos

**Supuestos de este plan**

- **S1.** Next.js con **App Router** y TypeScript. El idioma viaja en la URL (`/[locale]/...`) y las páginas se generan con SSG (`generateStaticParams`).
- **S2.** "Estático" (RNF3) significa: sin base de datos, sin API routes y sin backend propio. El middleware (RNF8) se ejecuta en el edge/servidor de la plataforma de despliegue. **No es compatible con `output: 'export'`.**
- **S3.** El slug de las rutas **no se traduce**: `/es/proyectos` y `/en/proyectos` comparten segmento (igual que el ejemplo de RNF7). Así el cambio de idioma solo sustituye el primer segmento.
- **S4.** Sin dependencias nuevas (constitución #1). No se usa `next-i18next`, `next-intl`, `react-i18next` ni librerías de animación.

**[NECESITA ACLARACIÓN]**

- **A1.** Plataforma de despliegue: debe soportar middleware de Next.js (p. ej. Vercel). Si el destino fuera hosting estático puro, RNF8 no se puede cumplir tal como está escrito y habría que reabrir la spec.
- **A2.** Lista exacta de claves de diccionario (duda ya abierta en la spec). Este plan fija solo la estructura y un conjunto mínimo (`nav`, `common`, `sections`, `metadata`).
- **A3.** Nombre del segmento de ruta: `proyectos` (como en la spec) o `projects`. Es indiferente para el diseño.

---

## 1. Estructura de módulos

Cubre: RF1–RF8, RNF1–RNF8.

```
src/
  middleware.ts                  # Next exige este fichero en la raíz de src; solo delega en i18n/
  i18n/
    config.ts                    # locales, defaultLocale, rutas con metadata, nombre de cookie
    dictionaries/
      en.json                    # fuente de verdad de claves
      es.json
    resolve-locale.ts            # puro: parseAcceptLanguage, resolveLocale
    translate.ts                 # puro: mergeWithFallback, createT
    get-dictionary.ts            # servidor: carga en + locale y los fusiona
    storage.ts                   # cliente: localStorage + cookie, con try/catch
    locale-provider.tsx          # "use client": contexto, sincronización al hidratar
    use-locale.ts                # hook: { locale, t, setLocale }
  components/
    ui/
      language-selector.tsx      # selector visible (RF2)
  app/
    [locale]/
      layout.tsx                 # <html lang>, generateStaticParams, LocaleProvider
      page.tsx                   # generateMetadata (metadata.home)
      proyectos/
        page.tsx                 # generateMetadata (metadata.projects)
```

| Módulo | Responsabilidad | Cubre |
|--------|-----------------|-------|
| `config.ts` | Única fuente de `locales`, `defaultLocale`, nombre y duración de la cookie, y mapa ruta → clave de metadata. El tipo `Locale` se **deriva** de aquí (`typeof locales[number]`). | RF1, RF7 |
| `dictionaries/*.json` | Todos los textos visibles. `en.json` define el conjunto de claves. | RF6, RNF1 |
| `resolve-locale.ts` | Lógica pura de prioridad cookie → `Accept-Language` → `en`. Testeable sin Next. | RF1, RF5, RNF8 |
| `middleware.ts` | Redirige rutas **sin** prefijo de idioma a `/<locale>/...`. No toca rutas que ya llevan prefijo válido. | RF1, RF5, RNF4, RNF8 |
| `get-dictionary.ts` | En servidor devuelve `en` fusionado con el idioma activo (las claves que falten en `es` quedan en inglés). | RF6 |
| `translate.ts` | `createT(dictionary)` → `t("nav.home")`. Último recurso: devolver la clave. | RF6, RNF1 |
| `storage.ts` | Lee/escribe `localStorage` y cookie `lang`. Nunca lanza si el almacenamiento está bloqueado. | RF4, RNF6 |
| `locale-provider.tsx` | Recibe `locale` y diccionario ya fusionado desde el servidor; expone `t` y `setLocale`; sincroniza almacenamiento al hidratar. | RF3, RF4, RF5 |
| `language-selector.tsx` | Selector con una opción por locale de `config.ts`. Etiquetas desde el diccionario. | RF2, RF7 |
| `app/[locale]/*` | SSG por idioma, `<html lang>`, metadata por idioma y ruta. | RF8, RNF4, RNF5 |

### Flujo de datos

1. **Petición sin prefijo** (`/`, `/proyectos`): el middleware resuelve el idioma (cookie → `Accept-Language` → `en`) y responde con redirect 307 a `/<locale>/...` conservando query. Añade `Vary: Cookie, Accept-Language`.
2. **Petición con prefijo válido** (`/es/proyectos`): el middleware no interviene. **La URL manda sobre la cookie**, para que un enlace compartido en otro idioma funcione.
3. El servidor renderiza (SSG) `app/[locale]/...` con el diccionario fusionado y la metadata de ese idioma. El HTML ya llega en el idioma correcto, sin JS.
4. El cliente hidrata. `LocaleProvider` sincroniza `localStorage` y cookie (ver algoritmo 3.3). **Nunca sobrescribe la preferencia con el idioma de la URL**: solo una acción explícita del usuario la cambia.
5. El usuario cambia de idioma: `setLocale` guarda `localStorage` + cookie y hace navegación cliente a la misma ruta bajo el nuevo prefijo (sin recarga completa).

---

## 2. Modelo de datos JSON

Cubre: RF6, RF7, RF8, RNF1.

### Reglas

- Un fichero por idioma, `src/i18n/dictionaries/<locale>.json`.
- Estructura **anidada por dominio**, claves en `camelCase`. Se accede con notación de puntos: `t("nav.home")`.
- Los valores son strings simples. **Sin interpolación en el MVP** (el copyright no lleva año).
- El JSON contiene solo textos: nada de `lang` ni `__fallback__`. El fallback vive en `config.ts` y `translate.ts`.
- `en.json` es la fuente de verdad. `es.json` puede omitir claves (fallback), pero **no puede tener claves que no existan en `en.json`**.
- Metadata SEO bajo `metadata.<rutaKey>.{title,description}`. Cada ruta registrada en `config.ts` debe tener ambas claves en `en` y `es`.

### `en.json`

```json
{
  "nav": {
    "home": "Home",
    "projects": "Projects",
    "cv": "CV",
    "contact": "Contact",
    "language": "Language"
  },
  "languages": {
    "en": "English",
    "es": "Español"
  },
  "sections": {
    "hero": { "title": "Pedro Suárez Gallardo", "role": "Web Developer" },
    "about": { "title": "About me" }
  },
  "metadata": {
    "home": {
      "title": "Pedro Suárez Gallardo — Web Developer",
      "description": "Portfolio and résumé of Pedro Suárez Gallardo, web developer."
    },
    "projects": {
      "title": "Projects — Pedro Suárez Gallardo",
      "description": "Selected web development projects by Pedro Suárez Gallardo."
    }
  },
  "common": {
    "notFound": "Page not found",
    "back": "Back",
    "copyright": "© Pedro Suárez Gallardo"
  }
}
```

### `es.json`

```json
{
  "nav": {
    "home": "Inicio",
    "projects": "Proyectos",
    "cv": "CV",
    "contact": "Contacto",
    "language": "Idioma"
  },
  "languages": {
    "en": "English",
    "es": "Español"
  },
  "sections": {
    "hero": { "title": "Pedro Suárez Gallardo", "role": "Desarrollador web" },
    "about": { "title": "Sobre mí" }
  },
  "metadata": {
    "home": {
      "title": "Pedro Suárez Gallardo — Desarrollador web",
      "description": "Portfolio y currículum de Pedro Suárez Gallardo, desarrollador web."
    },
    "projects": {
      "title": "Proyectos — Pedro Suárez Gallardo",
      "description": "Selección de proyectos de desarrollo web de Pedro Suárez Gallardo."
    }
  },
  "common": {
    "notFound": "Página no encontrada",
    "back": "Volver",
    "copyright": "© Pedro Suárez Gallardo"
  }
}
```

Los nombres de idioma (`languages.*`) se escriben en su propio idioma en ambos diccionarios, para que un visitante reconozca su idioma aunque la página esté en otro.

---

## 3. Algoritmo de resolución de idioma

Cubre: RF1, RF4, RF5, RF6, RNF6, RNF8 y los casos límite de la spec.

### 3.1. `parseAcceptLanguage` y `resolveLocale` (puros, servidor)

```
FUNCTION parseAcceptLanguage(header):
    IF header IS EMPTY: RETURN []
    entries = []
    FOR part IN header.split(","):
        (tag, q) = split part on ";q="            // q por defecto = 1
        IF tag == "*" OR q == 0 OR q IS NOT NUMBER: CONTINUE
        entries.push({ base: lowercase(tag).split("-")[0], q })   // "es-ES" → "es"
    RETURN entries sorted by q DESC (estable)

FUNCTION resolveLocale(cookieValue, acceptLanguage, locales, defaultLocale):
    // 1. Cookie lang (preferencia guardada, RF5)
    IF cookieValue IN locales: RETURN cookieValue          // valor inválido → se ignora
    // 2. Accept-Language (RF1)
    FOR entry IN parseAcceptLanguage(acceptLanguage):
        IF entry.base IN locales: RETURN entry.base
    // 3. Fallback
    RETURN defaultLocale                                    // "fr" → en
```

`localStorage` **no participa aquí**: el servidor no puede leerlo. Es el espejo cliente de la cookie (ver 3.3). Esta es la lectura de "cookie/`localStorage`" en RNF8.

### 3.2. Middleware

```
FUNCTION middleware(request):
    IF path starts with /_next, /favicon.ico, o tiene extensión de fichero: RETURN next()
    first = primer segmento de pathname
    IF first IN locales: RETURN next()                      // la URL manda
    locale = resolveLocale(request.cookies.lang, request.headers["accept-language"], ...)
    RETURN redirect307("/" + locale + pathname + search)
          con header Vary: Cookie, Accept-Language
```

La detección **no escribe** la cookie: solo una elección explícita del usuario crea la preferencia.

### 3.3. Cliente: sincronización al hidratar y `setLocale`

```
FUNCTION syncOnMount(urlLocale):
    cookie = readCookie("lang")              // try/catch
    stored = readStorage("lang")             // try/catch: si está bloqueado → null
    IF cookie IN locales AND stored != cookie: writeStorage(cookie)   // espejo
    IF cookie NOT IN locales AND stored IN locales: writeCookie(stored)
          // sin navegar: spec acepta que tras perder la cookie
          // el servidor use Accept-Language esa visita
    // Nunca se sobrescribe la preferencia con urlLocale

FUNCTION setLocale(next):
    REQUIRE next IN locales
    writeStorage(next)                       // RF4 (si falla, se ignora)
    writeCookie(next, path="/", maxAge=1 año, sameSite="Lax")   // RNF6
    router.push(replaceFirstSegment(pathname, next) + search + hash)   // RNF7, RF3, sin recarga
```

### 3.4. `t` con fallback

```
FUNCTION mergeWithFallback(dictEn, dictLocale):
    RETURN deepMerge(dictEn, dictLocale)     // lo que falte en locale queda en inglés (RF6)

FUNCTION createT(mergedDictionary):
    RETURN FUNCTION t(key):
        value = lookup(mergedDictionary, key.split("."))
        IF value IS STRING: RETURN value
        warn en desarrollo
        RETURN key                           // último recurso: nunca un hueco vacío
```

La fusión se hace **en servidor**: el cliente recibe un solo diccionario (activo + fallback), no los dos completos.

---

## 4. Contrato de la integración

Cubre: RF2, RF3, RF4, RF5, RF6, RF7, RF8, RNF1, RNF2, RNF4, RNF5, RNF6, RNF7, RNF8.

### 4.1. `config.ts`

```ts
export const locales = ["en", "es"] as const
export type Locale = (typeof locales)[number]      // RF7: se amplía añadiendo a la lista
export const defaultLocale: Locale = "en"
export const LOCALE_COOKIE = "lang"
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365
export const metadataRoutes = { "/": "home", "/proyectos": "projects" } as const
```

### 4.2. Hook `useLocale` (componentes cliente)

```ts
interface UseLocaleReturn {
  locale: Locale
  setLocale: (next: Locale) => void
  t: (key: string) => string
}
```

- `t(key)`: pura y síncrona. Devuelve el texto del idioma activo; si falta, el de `en`; si falta también, la clave.
- `setLocale(next)`: precondición `next ∈ locales`. Efectos: `localStorage.lang`, cookie `lang`, navegación cliente a la misma ruta con el nuevo prefijo. Postcondición: los consumidores se re-renderizan en el nuevo idioma sin recarga completa.
- Los errores de almacenamiento (bloqueado, cuota) se capturan y no interrumpen el cambio de idioma.

### 4.3. Componentes servidor

`getDictionary(locale)` y `createT(dictionary)` desde `get-dictionary.ts` y `translate.ts`. Mismo `t` que en cliente; ningún componente de presentación contiene texto literal (RNF1).

### 4.4. Cookie `lang`

| Atributo | Valor | Motivo |
|----------|-------|--------|
| Valor | `en` \| `es` | Cualquier otro valor se ignora |
| `Path` | `/` | Visible para todas las rutas |
| `Max-Age` | 1 año | RF4: persiste entre sesiones |
| `SameSite` | `Lax` | |
| `HttpOnly` | **No** | Se escribe desde cliente (`document.cookie`); `HttpOnly` lo impediría |
| `Secure` | Sí en producción | |

### 4.5. Middleware

- Entrada: petición con cookies y `Accept-Language`.
- Salida: `next()` si la ruta ya lleva prefijo válido; si no, redirect 307 a `/<locale>/<ruta>` con `Vary`.
- Sin endpoints API (RNF3).

### 4.6. Metadata y estructura (RF8, RNF4, RNF5)

- Cada `page.tsx` exporta `generateMetadata({ params })`, que lee `metadata.<rutaKey>.title/description` del diccionario fusionado. Se resuelve en servidor, **no** con el contexto cliente.
- `layout.tsx` fija `<html lang={locale}>` y exporta `generateStaticParams` con todos los `locales` (SSG).
- Recomendado: `alternates.languages` (hreflang) y `canonical` en la metadata. No lo exige la spec pero refuerza el SEO por idioma.
- Un solo `h1` por página y la misma jerarquía `h1 → h2 → h3` en ambos idiomas.

### 4.7. Selector de idioma (RF2, RF3)

- Una opción por entrada de `locales`, con etiqueta de `languages.<locale>`.
- Cada opción es un `<Link>` a la misma ruta en el otro idioma (funciona y es rastreable sin JS) con `onClick` que persiste la preferencia. Estado activo marcado con `aria-current`.
- Cualquier transición usa CSS nativo y respeta `prefers-reduced-motion` (RNF2). El cambio en sí es inmediato.

### Fuera de alcance (MVP)

Proyectos y experiencia, interpolación y plurales, detección por IP, cuentas y sincronización entre dispositivos, cookies de terceros.

---

## 5. Decisiones técnicas y alternativas descartadas

### D1 — Idioma en la URL (`/[locale]/...`)

- **Decisión:** segmento dinámico de idioma en la ruta, con SSG por idioma.
- **Justificación:** RNF7 exige redirigir a la misma ruta en otro idioma; RNF4/RF8 exigen HTML y metadata correctos por idioma desde el servidor; cada idioma tiene URL propia e indexable.
- **Descartada:** solo cookie/`localStorage` con una única URL, o `?lang=es`. No hay URL canónica por idioma, rompe RNF7 y el SEO de RF8.

### D2 — Middleware propio con redirect solo en rutas sin prefijo

- **Decisión:** `src/middleware.ts` con `resolveLocale` puro.
- **Justificación:** cumple RNF8 con orden explícito de prioridad y sin dependencias (constitución #1). Que la URL mande sobre la cookie hace los enlaces compartibles y evita bucles de redirección.
- **Descartadas:**
  - `i18n` de `next.config.js`: es Pages Router, no cubre App Router y no deja controlar el orden cookie → `Accept-Language`.
  - `next-intl`, `next-i18next` y similares: dependencia nueva sin aprobación.
  - Resolver solo en cliente: provoca flash del idioma erróneo e incumple RNF4 y el criterio 7.

### D3 — Persistencia dual: cookie (fuente para el servidor) + `localStorage` (espejo cliente)

- **Decisión:** `setLocale` escribe ambos; la cookie no es `HttpOnly` y dura un año.
- **Justificación:** RNF6. El servidor solo ve la cookie; `localStorage` permite recuperarla si desaparece.
- **Descartada:** solo `localStorage`. El middleware no puede leerlo, así que la primera carga no serviría el idioma guardado (rompe RNF4/RNF6 y el criterio 7).

### D4 — Fallback fusionado en servidor, `t` sin interpolación

- **Decisión:** `en` + idioma activo se fusionan en servidor; el cliente recibe un solo diccionario.
- **Justificación:** RF6 se cumple por construcción; solo se envía un diccionario al cliente; `t` queda trivial y testeable.
- **Descartada:** campo `__fallback__` dentro del JSON (mezcla datos con configuración) y enviar todos los diccionarios al cliente.

### D5 — Diccionarios anidados con claves por puntos, uno por idioma

- **Decisión:** `nav.home`, `metadata.projects.title`, etc.
- **Justificación:** agrupa por dominio y escala mejor que claves planas largas; añadir idioma = añadir fichero (RF7).
- **Descartada:** un único fichero con todos los idiomas (crece sin control y obliga a cargar todos) y claves totalmente planas.

### D6 — Estado con React Context

- **Decisión:** `LocaleProvider` con Context.
- **Justificación:** un solo valor de estado; sin dependencias (constitución #1).
- **Descartada:** librería de estado global, desproporcionada para un único valor.

### D7 — Sin librerías de animación

- **Decisión:** el cambio de idioma es inmediato; cualquier transición con CSS y `prefers-reduced-motion` (RNF2, constitución #7).
- **Descartada:** Framer Motion u otras, por dependencia nueva sin necesidad.

### D8 — Slugs sin traducir

- **Decisión:** el mismo slug en todos los idiomas (S3).
- **Justificación:** el cambio de idioma solo reemplaza el primer segmento, sin tabla de equivalencias.
- **Descartada:** slugs traducidos (`/en/projects` ↔ `/es/proyectos`): exige mapa por ruta y complica RNF7 sin pedirlo la spec.

---

## 6. Estrategia de tests

Principio (constitución #4): los criterios de aceptación se escriben como tests **antes** que el código. Nada se da por terminado con tests, lint o typecheck en rojo.

### 6.1. Unitarios (Vitest)

| Test | Cubre |
|------|-------|
| `parseAcceptLanguage`: `es-ES,es;q=0.9,en;q=0.8` → `es`; ignora `*` y `q=0`; cabecera vacía | RF1 |
| `resolveLocale`: cookie válida gana; cookie inválida (`fr`) se ignora; `Accept-Language: fr` → `en`; sin cookie ni cabecera → `en` | RF1, RF5, RNF8 |
| `mergeWithFallback` + `createT`: clave en `es` → español; solo en `en` → inglés; en ninguno → la clave | RF6 |
| Paridad de diccionarios: toda clave de `es.json` existe en `en.json`; toda ruta de `metadataRoutes` tiene `title` y `description` en `en` y `es` | RF6, RF8 |
| `storage.ts`: con `localStorage` bloqueado (lanza excepción) no lanza error; escribe cookie con `Path`, `Max-Age`, `SameSite` | RF4, RNF6, caso límite |

### 6.2. Componentes e integración (Vitest + React Testing Library)

| Test | Cubre |
|------|-------|
| `LocaleProvider`/`useLocale`: expone `t` y `setLocale`; los consumidores se re-renderizan al cambiar | RF3 |
| `setLocale("en")`: escribe `localStorage.lang` **y** cookie `lang`; llama a `router.push` con el prefijo nuevo y la misma ruta | RF4, RNF6, RNF7, criterio 9 |
| `syncOnMount`: cookie ausente + `localStorage` válido → restaura cookie; cookie válida + storage vacío → espeja; no sobrescribe con el idioma de la URL | RF5, caso límite |
| `LanguageSelector`: una opción por locale de `config.ts`; `aria-current` en la activa | RF2, RF7 |
| Lint `react/jsx-no-literals` en `components/` y `app/` (excluye ficheros de test) | RNF1, criterio 6 |

### 6.3. E2E (Playwright)

| # | Escenario | Criterio |
|---|-----------|----------|
| 1 | `Accept-Language: es-ES`, sin cookie, `/` → redirige a `/es` y se ve en español | 1, 8 |
| 2 | `Accept-Language: fr`, sin cookie, `/` → `/en` | 1, 8 |
| 3 | Cookie `lang=es` + `Accept-Language: en` → `/` redirige a `/es` (cookie gana) | 7, 8 |
| 4 | **Sin JavaScript** (`javaScriptEnabled: false`), `/es` → el HTML recibido ya contiene el texto y `<html lang="es">` | 7 |
| 5 | En `/es/proyectos`, usar el selector → URL `/en/proyectos`, textos en inglés, **sin recarga completa** (el marcador JS de `window` sigue vivo) | 2 |
| 6 | Tras el cambio: `localStorage.lang === "en"` y cookie `lang=en` | 9 |
| 7 | Recargar tras elegir idioma, y cerrar y reabrir la sesión conservando cookies → se mantiene | 3 |
| 8 | Almacenamiento bloqueado (`addInitScript` que hace lanzar a `Storage`): el sitio carga, el selector funciona y la detección cae en `Accept-Language` | Caso límite |
| 9 | Cookie eliminada → `/` vuelve a detectar por `Accept-Language` | Caso límite |
| 10 | Cada ruta de `metadataRoutes`, en `/en` y `/es`: `title` y `meta[name=description]` presentes y distintos entre idiomas | 5 |
| 11 | Secuencia de encabezados (`h1`, `h2`, `h3`) idéntica en `/en` y `/es`; un solo `h1` | RNF5 |
| 12 | Enlace directo `/en/...` con cookie `es` → se sirve en inglés y **la cookie no cambia** | Diseño (URL manda) |

El criterio 4 (texto sin traducción → inglés) se prueba en integración con diccionarios de prueba, no en E2E, para no alterar los diccionarios reales.

### 6.4. Trazabilidad con los criterios de aceptación

| Criterio de la spec | Tests |
|---------------------|-------|
| 1. Idioma del navegador / inglés en otro caso | E2E 1, 2; unitarios `resolveLocale` |
| 2. Selector sin recarga | E2E 5; integración `LocaleProvider` |
| 3. Persiste al recargar y al volver | E2E 7 |
| 4. Sin traducción → inglés | Unitario `createT`; integración con fixture |
| 5. Metadata en en/es por ruta | Unitario de paridad; E2E 10 |
| 6. Sin textos hardcodeados | Regla `jsx-no-literals` |
| 7. SSR sirve idioma con cookie | E2E 3, 4 |
| 8. Orden cookie → `Accept-Language` → `en` | Unitarios; E2E 1–3 |
| 9. `localStorage` y cookie al cambiar | Integración `setLocale`; E2E 6 |

### 6.5. Verificación (antes de dar por terminado)

- `pnpm lint`, `pnpm typecheck` y `pnpm test` en verde.
- `pnpm test:e2e` en verde (el cambio afecta a navegación e idioma).
- Comprobación de RNF3: no existe `app/api/` ni acceso a base de datos.

---

## 7. Cobertura de requisitos

| Requisito | Dónde se cubre |
|-----------|----------------|
| RF1 | 3.1, 3.2; tests unitarios y E2E 1–2 |
| RF2 | 4.7, `language-selector.tsx` |
| RF3 | 3.3, 4.2 (navegación cliente); E2E 5 |
| RF4 | 3.3, 4.4; integración y E2E 6–7 |
| RF5 | 3.1, 3.3; E2E 3, 7 |
| RF6 | 3.4, D4; unitarios `createT`, paridad |
| RF7 | 4.1 (`locales` única fuente), 4.7 |
| RF8 | 4.6, sección 2 (`metadata.*`); E2E 10 |
| RNF1 | Sección 2, 4.3; regla `jsx-no-literals` |
| RNF2 | 4.7, D7 |
| RNF3 | S2, 4.5; verificación 6.5 |
| RNF4 | 4.6 (SSG, `generateMetadata`), D1; E2E 4 |
| RNF5 | 4.6; E2E 11 |
| RNF6 | 3.3, 4.4, D3 |
| RNF7 | 3.3 (`setLocale`), D1, D8; E2E 5 |
| RNF8 | 3.1, 3.2, D2 |

---

## 8. Orden de trabajo (tests primero)

1. Escribir los tests de las secciones 6.1–6.3 (fallarán).
2. `config.ts` y diccionarios mínimos (`nav`, `languages`, `common`, `sections`, `metadata`).
3. `resolve-locale.ts` y `translate.ts` (puros).
4. `src/middleware.ts`.
5. `get-dictionary.ts`, `app/[locale]/layout.tsx`, páginas y `generateMetadata`.
6. `storage.ts`, `locale-provider.tsx`, `use-locale.ts`.
7. `language-selector.tsx` y regla de lint `jsx-no-literals`.
8. Verificación (6.5).