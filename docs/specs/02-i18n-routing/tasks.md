# Tasks — 02 i18n y rutas

Tareas pequeñas y ordenadas (T1 → T11). Cada tarea tiene objetivo, RF que cubre, tests a escribir primero y criterio de hecho. Cada tarea debe poder implementarse y verificarse por separado antes de pasar a la siguiente.

---

## ~~T1 — Archivos de mensajes y tipo Locale~~ ✅ COMPLETADA

**RF cubiertos:** RF-6, RF-7

**Resultado:**
- `messages/en.json` y `messages/es.json` creados en la raíz del proyecto con textos agrupados por sección (shared, hero, about, work, stack, contact, footer, notFound).
- `src/lib/locale.ts` con `export type Locale = "en" | "es"`.
- `src/lib/i18n-parity.ts` con `validateParity` y `flattenKeys`.
- Tests: `src/lib/i18n-parity.test.ts` (4 casos) y `src/lib/locale.test.ts` (1 caso).
- `pnpm exec vitest run --coverage`: 2 test files, 4 tests passed, cobertura 100% (statements, branches, functions, lines).

---

## T2 — Helpers de cookie de preferencia (RF-1)

**Objetivo:** Crear `messages/en.json` y `messages/es.json` en la raíz del proyecto con textos agrupados por sección (shared, hero, about, work, stack, contact, footer, notFound), y definir el tipo `Locale = "en" | "es"`. Ambos archivos deben tener las mismas claves.

**RF que cubre:** RF-6, RF-7

**Tests a escribir primero:**
- Test de unidad `validateParity` que falle si `messages/en.json` y `messages/es.json` no tienen las mismas claves (una clave faltante o sobrante rompe el test).
- Test de unidad que confirme que el tipo `Locale` solo admite `"en"` o `"es"`.

**Criterio de hecho:**
- `messages/en.json` y `messages/es.json` existen en la raíz del proyecto.
- Ambos archivos tienen exactamente las mismas claves hojas.
- Existe el tipo `Locale = "en" | "es"`.
- Los mensajes son agrupados por sección y no contienen cifras inventadas.

---

## ~~T2 — Helpers de cookie de preferencia~~ ✅ COMPLETADA

**RF que cubre:** RF-1

**Resultado:**
- `src/lib/cookie-locale.ts` implementado con `getLocaleCookie(request): Locale | null` y `setLocaleCookie(response, locale: Locale): void`.
- Cookie: `psg_locale`, `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=31536000` (1 año).
- Tests: `src/lib/cookie-locale.test.ts` (11 casos: 7 para getLocaleCookie, 4 para setLocaleCookie).
- `pnpm exec vitest run --coverage`: 3 test files, 15 tests passed, cobertura 100% (statements, branches, functions, lines).
- Las funciones son puras, no dependen de Next.js ni del DOM. `setLocaleCookie` no lanza error cuando `response` no tiene `headers`.

---

## ~~T3 — Resolución de locale para `/`~~ ✅ COMPLETADA

**RF que cubre:** RF-1

**Resultado:**
- `src/lib/resolve-locale.ts` implementado como función pura `resolveLocaleForRoot(request, cookieStore)`.
- Lógica: 1) cookie previa válida (`psg_locale`) con prioridad, 2) `Accept-Language` del navegador respetando orden y normalizando subtags regionales (`es-ES → es`, `en-US → en`), 3) fallback a inglés.
- Tests: `src/lib/resolve-locale.test.ts` (11 casos: cookie prioritaria, orden Accept-Language, normalización de subtags, fallback inglés, cookie inválida/vacía, sin cookieStore).
- `pnpm exec vitest run --coverage`: 4 test files, 26 tests passed, cobertura 100% (statements, branches, functions, lines).
- La función es pura, no depende de Next.js ni del DOM.

---

## ~~T4 — Normalización de ruta~~ ✅ COMPLETADA

**RF que cubre:** RF-2

**Resultado:**
- `src/lib/normalize-path.ts` implementado como función pura `normalizePath(pathname: string): string`.
- Convierte a minúsculas y elimina el trailing slash excepto en la raíz (`/`).
- Tests: `src/lib/normalize-path.test.ts` (4 casos: `/EN` → `/en`, `/es/` → `/es`, `/` → `/`, `/ES/About` → `/es/about`).
- `pnpm exec vitest run --coverage`: 5 test files, 30 tests passed, cobertura 100% (statements, branches, functions, lines).
- `pnpm lint`: limpio (sin errores ni warnings).
- La función es pura, no depende de Next.js ni del DOM.

---

## T5 — Helper de cambio de idioma (RF-3)

**Objetivo:** Crear la función pura `buildLocalizedHref(currentUrl: URL, targetLocale: Locale): string` que construya la URL localizada cambiando solo el primer segmento del path, conservando `hash` y `search` tal cual. Desde una ruta inexistente (`/en/unknown`), cambiar a español debe dar `/es/unknown`.

**RF que cubre:** RF-3

**Tests a escribir primero:**
- Test de unidad: cambiar de `/es#contact` a inglés devuelve `/en#contact` (fragmento conservado aunque no exista en destino).
- Test de unidad: cambiar de `/en?utm_source=linkedin` a español devuelve `/es?utm_source=linkedin` (query conservada tal cual).
- Test de unidad: cambiar de `/en/unknown` a español devuelve `/es/unknown` (path conservado bajo el nuevo idioma).
- Test de unidad: no se mezclan idiomas; solo cambia el primer segmento del path.

**Criterio de hecho:**
- `buildLocalizedHref` implementada y todos los casos de conservación de `hash`, `search` y path pasan sus tests unitarios.

---

## T6 — Validación de paridad de traducciones (RF-7)

**Objetivo:** Crear `src/lib/i18n-parity.ts` con `validateParity(enMessages, esMessages)` que compruebe que ambos archivos de mensajes tienen las mismas claves hojas. Debe fallar si falta una clave en un idioma o sobra respecto al otro.

**RF que cubre:** RF-7

**Tests a escribir primero:**
- Test de unidad: `validateParity` devuelve `valid: true` cuando `messages/en.json` y `messages/es.json` tienen las mismas claves.
- Test de unidad: `validateParity` devuelve `valid: false` y lista las claves faltantes si se elimina una clave de `es.json`.
- Test de unidad: `validateParity` devuelve `valid: false` y lista las claves sobrantes si se añade una clave solo en `en.json`.

**Criterio de hecho:**
- `validateParity` implementada y los tests usan los mensajes reales de `messages/en.json` y `messages/es.json` (una clave faltante rompe el test).
- Cualquier adición o modificación de claves debe ir en ambos idiomas en el mismo cambio.

---

## T7 — Middleware de localización (RF-1, RF-2, RF-4, RF-5)

**Objetivo:** Implementar `src/middleware.ts` con next-intl que: redirija `/` según cookie o `Accept-Language` (resolución de portada), normalice rutas (minúsculas, sin trailing slash), devuelva 404 para locales no admitidos (`/fr`, `/fr/about`) y para doble prefijo (`/en/es`), y no redirija rutas inexistentes bajo `/en` o `/es`.

**RF que cubre:** RF-1, RF-2, RF-4, RF-5

**Tests a escribir primero (e2e Playwright, Chromium):**
- Visitar `/` con cookie de español → redirige a `/es`.
- Visitar `/` sin cookie y con `Accept-Language: es` → redirige a `/es`.
- Visitar `/` con `Accept-Language: fr` (no compatible) → redirige a `/en`.
- Visitar `/fr` → 404 con mensaje en inglés, sin redirección.
- Visitar `/fr/about` → 404 con mensaje en inglés, sin redirección.
- Visitar `/en/es` → 404 (doble prefijo).
- Visitar `/EN` → normaliza a `/en` y muestra inglés.
- Visitar `/es/` → normaliza a `/es` y muestra español.

**Criterio de hecho:**
- Middleware implementado y los flujos críticos de idioma, navegación y 404 pasan en e2e con `prefers-reduced-motion: reduce`.

---

## T8 — Layout y página localizados `[locale]` (RF-1, RF-2, RF-6)

**Objetivo:** Crear `src/app/[locale]/layout.tsx` con `setRequestLocale` para renderizado estático por locale, metadatos por idioma (Metadata API) y la navbar con selector de idioma funcional. Crear `src/app/[locale]/page.tsx` que renderice la home en el locale de la ruta. La ruta explícita (`/en` o `/es`) debe tener prioridad sobre la cookie guardada.

**RF que cubre:** RF-1, RF-2, RF-6

**Tests a escribir primero (e2e Playwright, Chromium):**
- Abrir `/en` directamente → muestra la portada en inglés, ignorando el navegador y la cookie.
- Abrir `/es` directamente → muestra la portada en español, ignorando el navegador y la cookie.
- Tener cookie de español y entrar a `/en` → muestra inglés (ruta explícita gana sobre cookie).
- Tener cookie de inglés y entrar a `/es` → muestra español (ruta explícita gana sobre cookie).
- Los textos visibles existen en ambos idiomas con las mismas claves (no hay mezcla inglés/español en la misma página).

**Criterio de hecho:**
- `src/app/[locale]/layout.tsx` y `src/app/[locale]/page.tsx` implementados.
- `setRequestLocale` se usa en layout y página para mantener renderizado estático.
- Los textos de UI leen de `messages/` por props; no hay textos hardcodeados en componentes.
- Las páginas se construyen estáticamente para ambos locales.

---

## T9 — Página 404 localizada (RF-4, RF-5)

**Objetivo:** Crear `src/app/[locale]/not-found.tsx` que devuelva código HTTP 404 real y muestre un mensaje visible en el idioma de la ruta (inglés cuando no se pueda inferir el idioma, como en `/fr`).

**RF que cubre:** RF-4, RF-5

**Tests a escribir primero (e2e Playwright, Chromium):**
- Visitar `/en/unknown` → 404 con código HTTP real y mensaje visible en inglés.
- Visitar `/es/unknown` → 404 con código HTTP real y mensaje visible en español.
- Visitar `/fr/about` → 404 con código HTTP real y mensaje visible en inglés (idioma no inferible).
- No hay redirección automática a la portada desde ninguna ruta inexistente.

**Criterio de hecho:**
- `src/app/[locale]/not-found.tsx` implementada.
- Todas las rutas inexistentes o con locale no admitido devuelven 404 real con mensaje visible en el idioma correspondiente.
- Los tests e2e verifican el código de estado y el mensaje visible, no clases ni estructura interna.

---

## T10 — Cambio de idioma conservando sección y parámetros (RF-3)

**Objetivo:** Implementar el cambio de idioma desde la navbar (selector funcional, sin diseño visual específico) que use `buildLocalizedHref` para navegar al mismo path en el otro idioma, conservando `hash` y `search`.

**RF que cubre:** RF-3

**Tests a escribir primero (e2e Playwright, Chromium):**
- Estar en `/es#contact` y cambiar a inglés → navega a `/en#contact` (fragmento conservado).
- Estar en `/en?utm_source=linkedin` y cambiar a español → navega a `/es?utm_source=linkedin` (query conservada).
- Estar en `/en/unknown` (404) y cambiar a español → navega a `/es/unknown` (path conservado, sigue siendo 404).
- Al cambiar de idioma, la página no mezcla inglés y español.

**Criterio de hecho:**
- El cambio de idioma funciona desde cualquier sección y conserva `hash` y `search`.
- Los tests e2e verifican navegación por teclado y contenido mostrado, no clases de Tailwind.

---

## T11 — Gates finales y ejecución de tests (todos los RF)

**Objetivo:** Ejecutar y pasar todos los gates de calidad obligatorios del proyecto: `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` en verde; `pnpm test:e2e` porque se toca idioma y navegación. Verificar cobertura mínima del 95 % global.

**RF que cubre:** Todos (RF-1 a RF-7)

**Tests a escribir primero:**
- Ninguno nuevo; ejecutar los tests escritos en T1-T10 y los e2e de T7-T10.

**Criterio de hecho:**
- `pnpm lint` en verde (sin warnings).
- `pnpm typecheck` en verde (`next typegen && tsc --noEmit`).
- `pnpm test` en verde con cobertura ≥ 95 % en líneas, funciones, ramas y sentencias.
- `pnpm build` en verde.
- `pnpm test:e2e` en verde (idioma y navegación con `prefers-reduced-motion: reduce`).
- No se ha bajado el umbral de cobertura ni se ha excluido código para cumplirlo.

---

## Orden de ejecución recomendado

1. T1 → T2 → T3 → T4 → T5 → T6 (funciones puras y mensajes, probadas con Vitest unitario)
2. T7 → T8 → T9 → T10 (middleware, páginas y flujos e2e con Playwright)
3. T11 (gates finales)

Cada tarea debe completarse (tests escritos primero, código implementado, criterio de hecho verificado) antes de iniciar la siguiente.
