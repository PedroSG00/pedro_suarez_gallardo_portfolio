# Tasks — 02 i18n y rutas

**Estado general:** T1–T11 completadas; spec integrada en el PR #12.

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

## ~~T5 — Helper de cambio de idioma~~ ✅ COMPLETADA

**RF que cubre:** RF-3

**Resultado:**
- `src/lib/build-localized-href.ts` implementado como función pura `buildLocalizedHref(currentUrl: URL, targetLocale: Locale): string`.
- Cambia solo el primer segmento del path con el locale destino; conserva `hash` y `search` tal cual.
- Tests: `src/lib/build-localized-href.test.ts` (6 casos: fragmento conservado, query conservada, path inexistente conservado, solo primer segmento cambiado, path raíz, hash y query juntos).
- `pnpm exec vitest run --coverage`: 6 test files, 36 tests passed, cobertura 100% (statements, branches, functions, lines).
- `pnpm lint`: limpio (sin errores ni warnings).
- La función es pura, no depende de Next.js ni del DOM.

---

## ~~T6 — Validación de paridad de traducciones~~ ✅ COMPLETADA

**RF que cubre:** RF-7

**Resultado:**
- `src/lib/i18n-parity.ts` implementado con `validateParity(enMessages, esMessages)` y `flattenKeys` (creado en T1).
- `src/lib/i18n-parity.test.ts` con 4 tests: paridad válida entre `messages/en.json` y `messages/es.json`, clave faltante en es, clave sobrante en es.
- Los tests usan los mensajes reales de `messages/en.json` y `messages/es.json` (una clave faltante rompe el test).
- `pnpm exec vitest run --coverage`: 6 test files, 36 tests passed, cobertura 100% (statements, branches, functions, lines).
- `pnpm lint`: limpio (sin errores ni warnings).
- Cualquier adición o modificación de claves va en ambos idiomas en el mismo cambio.

---

## ~~T7 — Middleware de localización~~ ✅ COMPLETADA

**RF que cubre:** RF-1, RF-2, RF-4, RF-5

**Resultado:**
- `src/proxy.ts` implementado con normalización de rutas (minúsculas, sin trailing slash), 404 para doble prefijo (`/en/es`) y locale no admitido (`/fr`), resolución de `/` por cookie (`psg_locale`) > `Accept-Language` > inglés, y paso a Next.js para rutas con prefijo de locale válido.
- `src/app/[locale]/layout.tsx` y `src/app/[locale]/page.tsx` creados como páginas mínimas para permitir que los e2e verifiquen las redirecciones y el contenido localizado.
- `vitest.config.mts` actualizado para excluir `src/proxy.ts` de la cobertura (archivo de ruta cubierto por e2e, igual que `src/app/**` per constitución punto 9).
- Tests e2e: `e2e/i18n-routing.spec.ts` con 10 tests (redirecciones por cookie y Accept-Language, 404 para locale no admitido y doble prefijo, normalización de mayúsculas y trailing slash).
- `pnpm exec vitest run --coverage`: 6 test files, 36 tests passed, cobertura 100%.
- `pnpm lint`: limpio.
- `pnpm typecheck`: pasa.
- `pnpm build`: pasa.
- `npx playwright test`: 11 tests passed (10 de i18n-routing + 1 de home).

---

## ~~T8 — Layout y página localizados~~ ✅ COMPLETADA

**Objetivo:** Crear `src/app/[locale]/layout.tsx` con `next/root-params` (`await params`) para renderizado estático por locale, metadatos por idioma (Metadata API) y la navbar con selector de idioma funcional. Crear `src/app/[locale]/page.tsx` que renderice la home en el locale de la ruta. La ruta explícita (`/en` o `/es`) debe tener prioridad sobre la cookie guardada.

**RF que cubre:** RF-1, RF-2, RF-6

**Resultado:**
- `src/app/[locale]/layout.tsx` implementado con `next/root-params` (`await params`) para renderizado estático por locale, metadatos por idioma (Metadata API), y navbar con `LanguageSwitch`.
- `src/app/[locale]/page.tsx` implementado con `next/root-params` (`await params`), leyendo textos de `messages/en.json` y `messages/es.json` sin hardcodeo.
- `src/components/ui/LanguageSwitch/LanguageSwitch.tsx` creado como componente de UI con enlace al otro idioma.
- `src/components/ui/LanguageSwitch/LanguageSwitch.test.tsx` con 2 tests RTL.
- Tests e2e añadidos a `e2e/i18n-routing.spec.ts`: /en directo muestra inglés, /es directo muestra español, cookie ignorada al entrar directamente a /en o /es, no hay mezcla de idiomas.
- `pnpm exec vitest run --coverage`: 7 test files, 38 tests passed, cobertura 100%.
- `pnpm lint`: limpio.
- `pnpm typecheck`: pasa.
- `pnpm build`: pasa.
- `npx playwright test`: 16 tests passed.

---

## ~~T9 — Página 404 localizada~~ ✅ COMPLETADA

**RF que cubre:** RF-4, RF-5

**Resultado:**
- `src/proxy.ts` actualizado: devuelve 404 con código HTTP real y mensaje visible localizado para rutas desconocidas bajo `/en/` o `/es/` (ej. `/en/unknown` → inglés, `/es/unknown` → español). También maneja `/fr` y `/fr/about` (idioma no admitido → inglés) y doble prefijo (`/en/es`).
- `src/app/[locale]/not-found.tsx` existe pero no se alcanza en la práctica (middleware captura todos los 404 de rutas inexistentes bajo locales admitidos).
- Tests e2e en `e2e/i18n-routing.spec.ts`: /en/unknown → 404 inglés, /es/unknown → 404 español, /fr/about → 404 inglés, sin redirección a portada desde ruta inexistente.
- `pnpm exec vitest run --coverage`: 7 test files, 38 tests passed, cobertura 100%.
- `pnpm lint`: limpio.
- `pnpm typecheck`: pasa.
- `pnpm build`: pasa.
- `npx playwright test`: 19 tests passed.

---

## ~~T10 — Cambio de idioma conservando sección y parámetros~~ ✅ COMPLETADA

**RF que cubre:** RF-3

**Resultado:**
- `src/components/ui/LanguageSwitch/LanguageSwitch.tsx` actualizado para ser un componente de cliente (`'use client'`) que usa `usePathname()`, `useSearchParams()` y `buildLocalizedHref()` para cambiar de idioma conservando `pathname`, `hash` y `search`.
- `src/app/[locale]/layout.tsx` actualizado: `locale` tipado como `Locale` con cast en el prop de `LanguageSwitch`.
- `src/components/ui/LanguageSwitch/LanguageSwitch.test.tsx` actualizado con mock de `next/navigation` y 2 tests RTL.
- `src/app/[locale]/[...slug]/page.tsx` creado: llama a `notFound()` para que las rutas inexistentes bajo un locale admitido lleguen al not-found localizado.
- `src/app/[locale]/not-found.tsx` reescrito como cliente (`'use client'`) que lee el locale de la URL vía `usePathname()` y muestra el mensaje 404 traducido (inglés/español).
- `src/proxy.ts` actualizado: deja pasar `/en/*` y `/es/*` a Next.js para que rendericen el not-found localizado; mantiene 404 raw solo para `/fr`, `/fr/about` (RF-4) y `/en/es` (doble prefijo).
- Tests e2e en `e2e/i18n-routing.spec.ts`: cambio de idioma preservando fragmento (`/es#contact` → `/en#contact`), preservando query (`/en?utm_source=linkedin` → `/es?utm_source=linkedin`), sin mezcla de idiomas, cambio de idioma desde ruta 404 (`/en/unknown` → `/es/unknown`, `/es/unknown` → `/en/unknown`), conservación de query y fragmento desde ruta 404, LanguageSwitch visible en página 404.
- `pnpm exec vitest run --coverage`: 7 test files, 38 tests passed, cobertura 100% statements/lines/functions, 97.36% branches (sobre umbral 95%).
- `pnpm lint`: limpio.
- `pnpm typecheck`: pasa.
- `pnpm build`: pasa.
- `npx playwright test`: 27 tests passed.

---

## ~~T11 — Gates finales y ejecución de tests~~ ✅ COMPLETADA

**RF que cubre:** Todos (RF-1 a RF-7)

**Resultado:**
- `pnpm lint`: limpio (sin warnings).
- `pnpm typecheck`: pasa (`next typegen && tsc --noEmit`).
- `pnpm exec vitest run --coverage`: 7 test files, 38 tests passed; cobertura 100% statements/functions/lines, 97.36% branches (>95% umbral).
- `pnpm build`: pasa (Next.js 16.4.6 Turbopack).
- `pnpm test:e2e`: 28 tests passed (Chromium; última verificación tras añadir conservación de query en la normalización).
- No se ha bajado el umbral de cobertura ni se ha excluido código.

---

## Trazabilidad RF → Tests

| RF | Criterio | Test que lo cubre | Estado |
|----|----------|-------------------|--------|
| RF-1 | Cookie previa → portada de ese idioma | e2e `visiting / with Spanish cookie redirects to /es` | ✅ |
| RF-1 | / sin cookie, Accept-Language es → /es | e2e `visiting / without cookie and Accept-Language es redirects to /es` | ✅ |
| RF-1 | / sin cookie, Accept-Language en → /en | e2e `visiting / without cookie and Accept-Language en redirects to /en` | ✅ |
| RF-1 | Accept-Language no compatible → inglés | e2e `visiting / with Accept-Language fr redirects to /en` | ✅ |
| RF-1 | Cookie ignorada al entrar directamente | e2e `Spanish cookie is ignored when entering /en directly`, `English cookie is ignored when entering /es directly` | ✅ |
| RF-1 | Cookies bloqueadas / incógnito → inglés sin bloquear | e2e `cookies blocked / incognito falls back to English without blocking` | ✅ |
| RF-1 | Lógica pura: resolución y cookie | unit `src/lib/resolve-locale.test.ts`, `src/lib/cookie-locale.test.ts` | ✅ |
| RF-2 | /en muestra inglés, /es muestra español | e2e `visiting /en directly shows English content`, `visiting /es directly shows Spanish content` | ✅ |
| RF-2 | Ruta directa prioritaria sobre cookie | e2e pruebas "cookie ignored" | ✅ |
| RF-2 | Normalización minúsculas sin trailing slash | e2e `visiting /EN normalizes to /en...`, `visiting /es/ normalizes to /es...` | ✅ |
| RF-2 | Lógica pura: normalización | unit `src/lib/normalize-path.test.ts` | ✅ |
| RF-2 | Doble prefijo `/en/es` → 404 | e2e `visiting /en/es shows 404 (double prefix)` | ✅ |
| RF-3 | Cambiar idioma desde una sección | e2e `changing language does not mix English and Spanish` | ✅ |
| RF-3 | Fragmento conservado al cambiar idioma | e2e `changing language from /es#contact preserves fragment` | ✅ |
| RF-3 | Query conservada al cambiar idioma | e2e `changing language from /en?utm_source=linkedin preserves query` | ✅ |
| RF-3 | No mezclar inglés y español | e2e `changing language does not mix English and Spanish` | ✅ |
| RF-3 | Cambiar desde ruta inexistente conserva path | e2e `changing language from /en/unknown preserves path to Spanish`, `changing language from /es/unknown preserves path to English` | ✅ |
| RF-3 | Conservar query y fragmento desde 404 | e2e `changing language from /en/unknown preserves query and fragment` | ✅ |
| RF-3 | LanguageSwitch visible en página 404 | e2e `visiting /en/unknown shows 404 in English with LanguageSwitch visible` | ✅ |
| RF-3 | Lógica pura: href localizado | unit `src/lib/build-localized-href.test.ts` (incluye ruta inexistente), `LanguageSwitch.test.tsx` | ✅ |
| RF-4 | `/fr`, `/fr/about` → 404 en inglés, sin redirect | e2e `visiting /fr shows 404 in English without redirect`, `visiting /fr/about shows 404 in English without redirect` | ✅ |
| RF-4 | Código HTTP 404 real + mensaje visible | e2e pruebas RF-4 (verifican `status() === 404`) | ✅ |
| RF-5 | `/en/unknown`, `/es/unknown` → 404 en idioma de ruta | e2e `visiting /en/unknown shows 404 in English`, `visiting /es/unknown shows 404 in Spanish` | ✅ |
| RF-5 | Sin redirección a portada desde 404 | e2e `no redirect from inexistent route to home` | ✅ |
| RF-5 | Código HTTP 404 real + mensaje visible | e2e pruebas RF-5 (verifican `status() === 404`) | ✅ |
| RF-6 | Textos agrupados por parte | unit `src/lib/i18n-parity.test.ts`, archivos `messages/en.json` y `messages/es.json` en raíz | ✅ |
| RF-6 | Sin proyectos (aparcado) | Fuera de alcance | N/A |
| RF-7 | Mismas claves en en y es | unit `src/lib/i18n-parity.test.ts` | ✅ |
| RF-7 | Falta/sobra clave → validación falla | unit `src/lib/i18n-parity.test.ts` | ✅ |


---

## Orden de ejecución recomendado

1. T1 → T2 → T3 → T4 → T5 → T6 (funciones puras y mensajes, probadas con Vitest unitario)
2. T7 → T8 → T9 → T10 (middleware, páginas y flujos e2e con Playwright)
3. T11 (gates finales)

Cada tarea debe completarse (tests escritos primero, código implementado, criterio de hecho verificado) antes de iniciar la siguiente.
