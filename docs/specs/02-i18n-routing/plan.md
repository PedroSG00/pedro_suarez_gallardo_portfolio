# Plan — 02 i18n y rutas

Este plan traduce la spec `docs/specs/02-i18n-routing/spec.md` en módulos, datos, algoritmos, contratos, decisiones técnicas y estrategia de tests. Respeta la constitución y cubre todos los RF (RF-1 a RF-7).

## 1. Estructura de módulos

Los módulos se ubican dentro de la estructura existente de Next.js App Router. No se crean carpetas nuevas en la raíz ni en `src/` (constitución punto 7). `components/` no supera dos niveles (`ui/` y `sections/`). No hay barrel files.

| Módulo | Ruta | Responsabilidad | RF cubiertos |
|--------|------|-----------------|--------------|
| Middleware de localización | `src/middleware.ts` | Detección de locale, normalización de ruta (minúsculas, sin trailing slash), redirección de `/` según cookie o `Accept-Language`, 404 para locale no admitido y doble prefijo (`/en/es`). | RF-1, RF-2, RF-4 |
| Helpers de navegación localizada | `src/i18n/routing.ts` | Construcción de `href` al cambiar de idioma conservando `pathname`, `hash` y `search`; prioridad de ruta explícita sobre cookie. | RF-2, RF-3, RF-5 |
| Persistencia de preferencia | `src/lib/cookie-locale.ts` | Lectura y escritura de cookie de cliente (expiración larga) con el locale elegido. | RF-1 |
| Validación de paridad | `src/lib/i18n-parity.ts` | Comparación de claves entre `messages/en.json` y `messages/es.json`; falla si faltan o sobran claves. | RF-6, RF-7 |
| Layout localizado | `src/app/[locale]/layout.tsx` | `setRequestLocale` para renderizado estático por locale; metadatos por idioma (Metadata API); navbar con selector de idioma. | RF-1, RF-2, RF-6 |
| Página de inicio | `src/app/[locale]/page.tsx` | `setRequestLocale`; render de la home en el locale de la ruta. | RF-1, RF-2 |
| Página 404 | `src/app/[locale]/not-found.tsx` | 404 con código HTTP real y mensaje visible en el idioma de la ruta (inglés si no se infiere). | RF-4, RF-5 |

Notas de estructura:
- `messages/en.json` y `messages/es.json` viven en la raíz del proyecto (constitución punto 6 y decisión de plan).
- Los textos de UI quedan agrupados por sección dentro de esos JSON (RF-6).
- Los metadatos SEO (`hreflang`, sitemap, robots) quedan fuera de este plan y corresponden a la spec 11 (RF-6, fuera de alcance).

## 2. Modelo de datos

### 2.1 Tipo de locale

```ts
type Locale = "en" | "es";
```

### 2.2 Cookie de preferencia (cliente)

Nombre: `psg_locale` (ejemplo; valor final por definir en implementación)

Ejemplo de valor serializado:
```
es
```

Atributos: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=31536000` (1 año).

### 2.3 Mensajes (ejemplo simplificado)

`messages/en.json`:
```json
{
  "shared": {
    "nav": { "home": "Home", "about": "About", "contact": "Contact" },
    "langSwitch": { "en": "English", "es": "Español" }
  },
  "hero": {
    "title": "Web portfolio",
    "subtitle": "Full-stack developer"
  },
  "about": { "intro": "About me" },
  "work": { "intro": "Experience" },
  "stack": { "intro": "Stack" },
  "contact": { "intro": "Contact" },
  "footer": { "text": "Footer" },
  "notFound": { "title": "Not found", "message": "This page does not exist." }
}
```

`messages/es.json`:
```json
{
  "shared": {
    "nav": { "home": "Inicio", "about": "Sobre mí", "contact": "Contacto" },
    "langSwitch": { "en": "English", "es": "Español" }
  },
  "hero": {
    "title": "Portfolio web",
    "subtitle": "Desarrollador full-stack"
  },
  "about": { "intro": "Sobre mí" },
  "work": { "intro": "Experiencia" },
  "stack": { "intro": "Stack" },
  "contact": { "intro": "Contacto" },
  "footer": { "text": "Pie de página" },
  "notFound": { "title": "No encontrado", "message": "Esta página no existe." }
}
```

Regla: mismas claves en ambos archivos (RF-7). Cualquier adición/modificación va en ambos idiomas en el mismo cambio (constitución punto 6 y RF-7).

## 3. Algoritmos clave (pseudocódigo)

### 3.1 Resolver locale para `/` (RF-1)

```
FUNCTION resolveLocaleForRoot(request, cookieStore):
  // 1. Elección explícita previa (cookie) tiene prioridad
  cookieLocale = readCookie(cookieStore, "psg_locale")
  IF cookieLocale IS IN ["en", "es"]:
    RETURN cookieLocale

  // 2. Preferencia del navegador (Accept-Language)
  acceptLanguage = request.headers.get("accept-language")
  preferred = parseAcceptLanguage(acceptLanguage) // lista ordenada
  FOR lang IN preferred:
    normalized = normalizeSubtag(lang) // es-ES -> es, en-US -> en
    IF normalized IS IN ["en", "es"]:
      RETURN normalized

  // 3. Fallback a inglés
  RETURN "en"
```

`normalizeSubtag`: convierte `es-ES`, `es-MX`, etc. a `es`; `en-US`, `en-GB`, etc. a `en`; ignora el resto.

### 3.2 Normalizar ruta (RF-2)

```
FUNCTION normalizePath(pathname):
  lowercased = pathname.toLowerCase()
  // Eliminar trailing slash excepto en raíz
  IF lowercased != "/" AND lowercased endsWith "/":
    lowercased = removeTrailingSlash(lowercased)
  RETURN lowercased
```

Ejemplos: `/EN` → `/en`, `/es/` → `/es`, `/` → `/`.

Doble prefijo (`/en/es`) se detecta en el middleware y devuelve 404 (RF-2, RF-4).

### 3.3 Cambiar idioma conservando path, hash y query (RF-3)

```
FUNCTION buildLocalizedHref(currentUrl, targetLocale):
  pathname = currentUrl.pathname  // ya normalizado, ej. /es/about
  hash = currentUrl.hash          // ej. #contact
  search = currentUrl.search      // ej. ?utm_source=linkedin

  // Prioridad: ruta explícita gana sobre cookie; se construye sobre el pathname actual
  newPathname = replaceFirstSegment(pathname, targetLocale)
  // Ejemplo: /es/about + en → /en/about

  RETURN newPathname + search + hash
```

Reglas: se conserva `hash` aunque el ID de sección no exista en el idioma de destino; se conserva `search` tal cual sin interpretar claves arbitrarias (RF-3).

Desde ruta inexistente (`/es/unknown`): `buildLocalizedHref("/es/unknown", "en")` → `/en/unknown` (RF-3).

### 3.4 Validar paridad de traducciones (RF-7)

```
FUNCTION validateParity(enMessages, esMessages):
  enKeys = flattenKeys(enMessages)
  esKeys = flattenKeys(esMessages)
  missingInEs = enKeys - esKeys
  extraInEs = esKeys - enKeys

  IF missingInEs is NOT EMPTY OR extraInEs is NOT EMPTY:
    RETURN { valid: false, missing: missingInEs, extra: extraInEs }

  RETURN { valid: true }
```

`flattenKeys` devuelve el conjunto de claves hojas (ej. `shared.nav.home`, `hero.title`).

## 4. Contratos de interfaz

### 4.1 `getResolvedLocale(request): Locale`

- Entrada: objeto de solicitud HTTP (headers con `accept-language` y cookies).
- Salida: `"en"` o `"es"`.
- Errores: ninguno; siempre devuelve un locale válido (fallback a inglés).
- RF: RF-1.

### 4.2 `setLocaleCookie(response, locale: Locale): void`

- Entrada: objeto de respuesta HTTP y locale válido.
- Salida: `void` (establece cookie `Set-Cookie` en la respuesta).
- Errores: ninguno; si no se puede escribir (cookies bloqueadas), se ignora silenciosamente y se continúa con el flujo de navegador.
- RF: RF-1.

### 4.3 `getLocaleCookie(request): Locale | null`

- Entrada: objeto de solicitud HTTP.
- Salida: `"en"` | `"es"` si existe cookie válida; `null` si no existe o no es válida.
- Errores: ninguno.
- RF: RF-1.

### 4.4 `buildLocalizedHref(currentUrl: URL, targetLocale: Locale): string`

- Entrada: URL actual y locale destino.
- Salida: string con la URL localizada (misma ruta, distinto primer segmento; hash y query conservados).
- Errores: ninguno.
- RF: RF-3.

### 4.5 `normalizePath(pathname: string): string`

- Entrada: pathname crudo.
- Salida: pathname normalizado (minúsculas, sin trailing slash salvo raíz).
- Errores: ninguno.
- RF: RF-2.

### 4.6 `validateParity(enMessages: Record<string, unknown>, esMessages: Record<string, unknown>): { valid: boolean; missing: string[]; extra: string[] }`

- Entrada: dos objetos de mensajes aplanables.
- Salida: objeto con `valid` booleano y listas de claves faltantes/sobrantes.
- Errores: ninguno; lanza error solo si los argumentos no son objetos.
- RF: RF-7.

### 4.7 Middleware de next-intl (`src/middleware.ts`)

- Entrada: request de Next.js.
- Salida: `NextResponse.next()`, `NextResponse.redirect()`, o `NextResponse.rewrite()` a 404.
- Errores: devuelve 404 para locales no admitidos y rutas con doble prefijo.
- RF: RF-1, RF-2, RF-4, RF-5.

### 4.8 Layout y página `[locale]`

- Entrada: `params.locale` (`"en"` | `"es"`).
- Salida: JSX renderizado estáticamente en el locale indicado.
- Errores: si `params.locale` no es válido, next-intl 404 antes de llegar al componente.
- RF: RF-1, RF-2, RF-6.

## 5. Decisiones técnicas justificadas

| Decisión | Justificación | Alternativa descartada | RF |
|----------|---------------|------------------------|-----|
| Cookie del cliente (`psg_locale`) para recordar elección | `setRequestLocale` se ejecuta en servidor; la cookie es legible allí y evita hydration mismatch. Expiración larga para persistencia entre visitas. | `localStorage`: solo disponible en cliente; causaría mismatch de hidratación al no estar disponible en el render del servidor. | RF-1 |
| `next-intl` middleware para detección y redirección | Stack aprobado (constitución punto 1). Maneja nativamente `Accept-Language`, redirección de `/` y 404 para locales no admitidos. | Middleware custom: requeriría reimplementar detección de locale, redirección y manejo de 404; más código y mayor riesgo de error. | RF-1, RF-2, RF-4 |
| Rutas `[locale]` en App Router | Permite renderizado estático por locale y es el patrón estándar de next-intl. Cada URL tiene un solo idioma. | Rutas estáticas duplicadas (`/en`, `/es` como carpetas separadas sin parámetro): menos escalable y no idiomático de next-intl. | RF-2 |
| Normalización de ruta (minúsculas, sin trailing slash) en middleware | Se aplica globalmente antes de llegar a la página; evita duplicación de contenido y rutas inconsistentes. | Normalizar solo en la página: las rutas `/EN` y `/en` coexistirían hasta llegar al componente, generando confusión y posible duplicación de contenido. | RF-2 |
| Ruta explícita (`/en` o `/es`) gana sobre cookie | Es una acción intencional del usuario; respeta el contrato de que la URL define el idioma. | Cookie siempre gana: ignoraría la intención explícita del usuario al escribir una URL en otro idioma. | RF-3 |
| Conservar `hash` y `search` al cambiar idioma | El usuario no pierde la sección ni los parámetros de campaña/referrer. | Eliminar `hash` o `search`: perdería contexto de navegación y datos de UTI/campaña. | RF-3 |
| 404 con mensaje visible + código HTTP real | Cumple el requisito de "indicación clara" y es accesible (semántica correcta). | Solo redirect a portada: oculta el error y viola el requisito de mostrar 404 sin redirección. | RF-4, RF-5 |
| Mensajes en `messages/en.json` y `messages/es.json` en la raíz | Constitución punto 6 ubica los textos en `messages/`; decisión de plan confirma la raíz. | `src/messages/`: crearía carpeta nueva en `src/`, violando la constitución punto 7. | RF-6 |
| Validación de paridad como test/build (no fallback silencioso) | Evita que se mezcle inglés y español en runtime; obliga a completar traducciones antes de desplegar. | Mostrar texto del otro idioma como sustituto: violaría el requisito de no mezclar idiomas (constitución punto 6 y RF-7). | RF-7 |

## 6. Estrategia de tests

### 6.1 Principios (constitución)

- Los criterios de aceptación se escriben como tests antes que el código (punto 8).
- Un test verifica comportamiento visible para el usuario (contenido, roles, interacción, estados, accesibilidad), no la implementación.
- Ni snapshots, ni clases de Tailwind, ni tests solo para subir la cobertura.
- Playwright cubre flujos críticos: idioma, navegación (punto 8).
- Cobertura mínima 95% global (líneas, funciones, ramas, sentencias) con umbral en Vitest (punto 9).
- Se excluyen de cobertura: configuración, tests (`src/**/*.test.{ts,tsx}`), declaraciones (`*.d.ts`), helpers de test (`src/test/`), ficheros de ruta de `src/app/` (cubiertos por e2e) y datos de `src/content/` (punto 9).
- Se usan los mensajes reales de `en.json` y `es.json` para que una clave faltante rompa el test (sección Tests de AGENTS.md).

### 6.2 Tests de unidad e integración (Vitest + RTL)

| Módulo probado | Qué se verifica | RF |
|----------------|-----------------|-----|
| `resolveLocaleForRoot` | Cookie prioritaria; `Accept-Language` con normalización de subtags; fallback a inglés; cookies bloqueadas → inglés. | RF-1 |
| `normalizePath` | `/EN` → `/en`; `/es/` → `/es`; `/` → `/`. | RF-2 |
| `buildLocalizedHref` | Conserva `hash` y `search`; cambia solo el primer segmento; desde ruta inexistente conserva el path. | RF-3 |
| `validateParity` | Detecta claves faltantes y sobrantes; pasa cuando ambas claves coinciden. | RF-7 |
| `getLocaleCookie` / `setLocaleCookie` | Lectura y escritura correctas; devuelve `null` si no hay cookie. | RF-1 |

Estos tests usan funciones puras de `src/lib/` y no dependen de Next.js ni del DOM, por lo que se miden para cobertura (no están excluidos).

### 6.3 Tests e2e críticos (Playwright, Chromium)

| Flujo | Qué se verifica | RF |
|-------|-----------------|-----|
| Cambio de idioma | Desde cualquier sección, al cambiar de idioma se muestra esa sección en el otro idioma; se conserva `hash` y `search`. | RF-3 |
| Navegación directa | Abrir `/en` y `/es` directamente muestra el idioma correspondiente, ignorando el navegador y la cookie. | RF-2 |
| Resolución de `/` | Sin cookie: usa `Accept-Language` del navegador (simulado). Con cookie: respeta la cookie. Sin preferencia compatible: inglés. | RF-1 |
| 404 locale no admitido | `/fr` y `/fr/about` devuelven 404 con mensaje en inglés; no redirigen. | RF-4 |
| 404 ruta inexistente | `/en/unknown` y `/es/unknown` devuelven 404 con mensaje en el idioma de la ruta; no redirigen a portada. | RF-5 |
| Cambio desde 404 | Desde `/en/unknown` al cambiar a español se va a `/es/unknown` (sigue siendo 404). | RF-3 |
| Cookies bloqueadas | Modo incógnito: usa preferencia del navegador y fallback inglés sin bloquear. | RF-1 |

Los tests e2e se ejecutan con `prefers-reduced-motion: reduce` activado para flujos de idioma y navegación (constitución sección Tests).

### 6.4 Regla de geschrieben antes del código

Cada criterio de aceptación de la spec tiene al menos un test correspondiente escrito antes de la implementación. Si un test falla, se corrige la spec o el código, nunca el test para forzar cobertura.

## 7. Trazabilidad RF → partes del plan

- RF-1: Middleware, `cookie-locale.ts`, layout/página `[locale]`, algoritmos 3.1 y 3.4, contratos 4.1-4.3, tests 6.2 y 6.3.
- RF-2: Middleware, `routing.ts`, algoritmo 3.2, contratos 4.5, tests 6.2 y 6.3.
- RF-3: `routing.ts`, algoritmo 3.3, contrato 4.4, tests 6.2 y 6.3.
- RF-4: Middleware, `not-found.tsx`, contratos 4.7, tests 6.3.
- RF-5: `not-found.tsx`, contrato 4.7, tests 6.3.
- RF-6: Estructura de módulos, mensajes ejemplo, layout `[locale]`, tests 6.2.
- RF-7: `i18n-parity.ts`, algoritmo 3.4, contrato 4.6, tests 6.2.
