# Tareas: Configuración i18n (internacionalización)

Small tasks (max 20-30 min each), in dependency order, each covering the RFs and with a verifiable "Hecho cuando:". Use checkboxes.

## Fase 1: Tests unitarios e integración (en rojo, antes de implementación)

- [x] **T1: Test unitario parseAcceptLanguage** — RF: **RF1**
    - **Depende de:** Ninguna
    - **Hecho cuando:** Test Vitest en `app/i18n/parseAcceptLanguage.test.ts` pasa: header `es-ES,es;q=0.9,en;q=0.8` → entradas ordenadas por q; ignora `*` y `q=0`; cabecera vacía devuelve `[]`. Implementado en `app/i18n/resolve-locale.ts`. Test pasa (5 tests).

- [x] **T2: Test unitario resolveLocale** — RF: **RF5, RNF8**
    - **Depende de:** Ninguna
    - **Hecho cuando:** Test Vitest en `app/i18n/resolve-locale.test.ts` pasa: cookie válida gana; cookie inválida `fr` se ignora; `Accept-Language: fr` → `en`; sin cookie ni cabecera → `en`. El parámetro `cookieValue` acepta `string | undefined | null`. Implementado en `app/i18n/resolve-locale.ts`.

- [x] **T3: Test unitario mergeWithFallback y createT** — RF: **RF6, RNF1**
    - **Depende de:** Ninguna
    - **Hecho cuando:** Test Vitest en `app/i18n/mergeWithFallback.test.ts` pasa: merge profundo donde lo que falte en el locale queda en inglés. Test de `createT` en `app/i18n/translate.test.ts`: clave en `es` → español; solo en `en` → inglés; en ninguno → la propia clave (nunca hueco vacío). `mergeWithFallback` exportado desde `app/i18n/translate.ts`. Test pasa (7 tests).

- [x] **T4: Test unitario storage.ts con caso límite** — RF: **RF4, RNF6**
    - **Depende de:** Ninguna
    - **Hecho cuando:** Test Vitest en `app/i18n/storage.test.ts` pasa: con `localStorage` bloqueado (lanza excepción) no lanza error y retorna `null`. Lee y escribe correctamente `localStorage` y cookie cuando el almacenamiento está disponible. El algoritmo `syncOnMount` no forma parte de este test (fue extraído al provider). Test pasa (7 tests).

- [x] **T5: Test de paridad de diccionarios** — RF: **RF6, RNF1**
    - **Depende de:** Ninguna
    - **Hecho cuando:** Test Vitest en `app/i18n/dictionaries/dictionary-parity.test.ts` pasa: ninguna clave de `es.json` falta en `en.json`. Cada ruta de `metadataRoutes` tiene `title` y `description` en `en` y `es`. Test pasa (5 tests).

- [x] **T6: Test unitario del middleware** — RF: **RF1, RNF8**
    - **Depende de:** Ninguna
    - **Hecho cuando:** Test Vitest en `app/middleware.test.ts` pasa: rutas con prefijo válido pasan sin redirigir; las que no, redirigen 307 con header `Vary: Cookie, Accept-Language`. Excluye `/_next`, `/favicon.ico` y ficheros con extensión. Middleware implementado en `proxy.ts` (convención `proxy` de Next.js 16, antes `middleware`). Test pasa (4 tests).

## Fase 2: Escenarios E2E (12 escenarios del plan sección 6.3, agrupados en 4 tareas)

- [x] **T7: E2E - SSR sin JavaScript y RNF5** — RF: **RNF5**
    - **Depende de:** Ninguna
    - **Hecho cuando:** Test Playwright con `addInitScript` que simula JS bloqueado: la página sirve HTML con un solo `h1`, la jerarquía de encabezados es idéntica en `en` y `es`, y no hay acceso a `app/api/` ni base de datos (RNF3). Escenario escrito y ejecutado (en rojo hasta Fase 3).

- [x] **T8: E2E - URL manda sobre cookie y persistencia** — RF: **RNF8**
    - **Depende de:** Ninguna
    - **Hecho cuando:** Test Playwright: al visitar `/es/projects` sin cookie, la URL manda sobre la detección de idioma. Al borrar la cookie y recargar, el idioma se restaura desde `localStorage` si existe (no modo incógnito). Escenario escrito y ejecutado (en rojo hasta Fase 3).

- [x] **T9: E2E - Almacenamiento bloqueado y idioma `fr`** — RF: **RNF6**
    - **Depende de:** Ninguna
    - **Hecho cuando:** Test Playwright con `addInitScript` que simula `localStorage` lanzando excepción: no hay error en consola y el flujo continúa. Al acceder con idioma `fr` en la cabecera `Accept-Language`, el sitio cae back a inglés (fallback), no acepta `fr` como locale válido. Escenario escrito y ejecutado (en rojo hasta Fase 3).

- [x] **T10: E2E - Sin recarga completa y marcador en window** — RF: **RF4, RNF6**
    - **Depende de:** Ninguna
    - **Hecho cuando:** Test Playwright mide con un marcador en `window` que se mantiene vivo tras el cambio de idioma mediante `router.push` replacing el primer segmento: la navegación no es una recarga completa y el marcador persiste. Escenario escrito y ejecutado (en rojo hasta Fase 3).

## Fase 3: Implementación (orden de dependencia real)

- [x] **T11: config.ts con locales y configuración** — RF: **RF7**
    - **Depende de:** Ninguna
    - **Hecho cuando:** `app/i18n/config.ts` exporta `locales`, `defaultLocale`, `LOCALE_COOKIE`, `LOCALE_COOKIE_MAX_AGE` y `metadataRoutes`. El tipo `Locale` se deriva correctamente de `typeof locales[number]`. Fija `locales = ["en", "es"]`, `defaultLocale = "en"`, cookie `lang` con duración de 1 año. Atributos por defecto de cookie: `Path=/`, `Max-Age=LOCALE_COOKIE_MAX_AGE`, `SameSite=Lax`, sin `HttpOnly`, `Secure` en producción. Test en `app/i18n/config.test.ts` pasa (4 tests).

- [x] **T12: en.json diccionario (fuente de verdad)** — RF: **RF6, RNF1**
    - **Depende de:** T11
    - **Hecho cuando:** `app/i18n/dictionaries/en.json` existe con las secciones `nav`, `languages`, `sections`, `metadata` y `common`, usando claves en `camelCase` y notación de puntos `t("nav.home")`. Incluye todas las claves listadas en el plan. Test en `app/i18n/dictionaries/en-dictionary.test.ts` pasa (6 tests).

- [x] **T13: es.json diccionario (traducciones español)** — RF: **RF6**
    - **Depende de:** T12
    - **Hecho cuando:** `app/i18n/dictionaries/es.json` existe con traducciones de todas las claves de `en.json`. Las claves son idénticas y los valores en español. Nombres de idioma en su propio idioma. Test en `app/i18n/dictionaries/es-dictionary.test.ts` pasa (8 tests).

- [x] **T14: get-dictionary.ts servidor (carga y fusión)** — RF: **RF4, RF5**
    - **Depende de:** T12, T13
    - **Hecho cuando:** `app/i18n/get-dictionary.ts` exporta una función de servidor que carga el diccionario fusionado: toma `en` como base y mergea las claves del idioma activo. Retorna un objeto plano que no contiene textos hardcodeados. Test en `app/i18n/get-dictionary.test.ts` pasa (4 tests).

- [x] **T15: resolve-locale.ts con funciones puras** — RF: **RF1, RF5, RNF8**
    - **Depende de:** T11
    - **Hecho cuando:** `app/i18n/resolve-locale.ts` exporta `parseAcceptLanguage` y `resolveLocale` usando el tipo `Locale` de `config.ts`. Prioridad: cookie → `Accept-Language` → `defaultLocale`. Test en `app/i18n/resolve-locale.test.ts` pasa (5 tests).

- [x] **T16: storage.ts con localStorage y cookie** — RF: **RF4, RNF6**
    - **Depende de:** T11
    - **Hecho cuando:** `app/i18n/storage.ts` exporta `readStorage`, `writeStorage`, `readCookie`, `writeCookie` con try/catch que nunca lanzan si el almacenamiento está bloqueado. Caso límite: `localStorage` lanza excepción → retorna `null` sin interrumpir. Atributos por defecto: `Path=/`, `Max-Age=LOCALE_COOKIE_MAX_AGE`, `SameSite=Lax`, sin `HttpOnly`. Test en `app/i18n/storage.test.ts` pasa (7 tests).

- [x] **T17: locale-provider.tsx con Context y useEffect** — RF: **RF3, RF4, RF5**
    - **Depende de:** T15, T16, T14
    - **Hecho cuando:** `app/i18n/locale-provider.tsx` es `"use client"` que provee contexto i18n: recibe `locale` y `dictionary` fusionado, expone `t` y `setLocale` por Context. Usa `useEffect`. `syncOnMount` es función pura testeable. Al montar sincroniza localStorage y cookie sin sobrescribir con el idioma de la URL. Test en `app/i18n/locale-provider.test.tsx` pasa (7 tests).

- [x] **T18: use-locale.ts hook personalizado** — RF: **RF3, RF4, RF5, RNF6, RNF7**
    - **Depende de:** T17
    - **Hecho cuando:** `app/i18n/use-locale.ts` exporta `useLocale()` que retorna `{ locale, setLocale, t }`. `setLocale(next)` valida `next ∈ locales`, escribe `localStorage.lang` y cookie `lang`, y navega con `router.push` a la misma ruta bajo el nuevo prefijo (sin recarga completa), conservando query y hash. Errores de almacenamiento se capturan. Test en `app/i18n/use-locale.test.tsx` pasa (3 tests).

- [x] **T19: LanguageSelector/LanguageSelector.tsx with persistLocale** — RF: **RF2, RF7**
    - **Depende de:** T18
    - **Hecho cuando:** `app/components/LanguageSelector/LanguageSelector.tsx` renders one option per entry of `config.ts.locales`, with labels from `languages.<locale>` in the dictionary. Each option is a `<Link>` to the same route in the other language (works without JS). Active state carries `aria-current`. **Correction:** The selector uses `<Link onClick={() => persistLocale(next)}` and never `setLocale`, to avoid double navigation. **Behavior:** `persistLocale(next)` writes `localStorage` and cookie `lang`, without navigating. No transitions, or under `@media (prefers-reduced-motion: no-preference)`. Test in `app/components/LanguageSelector/LanguageSelector.test.tsx` passes (4 tests).

- [x] **T20: app/[locale]/layout.tsx con html lang y generateStaticParams** — RF: **RF8, RNF4, RNF5**
    - **Depende de:** T11, T17
    - **Hecho cuando:** `app/[locale]/layout.tsx` fija `<html lang={locale}>`, exporta `generateStaticParams` que devuelve parámetros para todos los `locales` (SSG), e incluye el `LocaleProvider` envolviendo a los hijos. Test en `app/[locale]/layout.test.tsx` pasa (3 tests).

- [x] **T21: app/[locale]/page.tsx con generateMetadata** — RF: **RF8, RNF4**
    - **Depende de:** T14, T15
    - **Hecho cuando:** `app/[locale]/page.tsx` exporta `generateMetadata({ params })` que lee `metadata.home.title/description` del diccionario fusionado en servidor. Test en `app/[locale]/page.test.tsx` pasa (2 tests).

- [x] **T22: app/[locale]/projects/page.tsx con generateMetadata** — RF: **RF8**
    - **Depende de:** T21
    - **Hecho cuando:** `app/[locale]/projects/page.tsx` exporta `generateMetadata({ params })` que lee `metadata.projects.title/description` del diccionario fusionado. Test en `app/[locale]/projects/page.test.tsx` pasa (2 tests).

- [x] **T23: Validación de locale en ruta (dynamicParams = false)** — RF: **RF8**
    - **Depende de:** T20
    - **Hecho cuando:** `app/[locale]/layout.tsx` exporta `dynamicParams = false` para que `/xx/...` devuelva 404. Test en `app/[locale]/layout.test.tsx` pasa (4 tests).

- [x] **T24: Configuración de lint react/jsx-no-literals** — RF: **RNF1**
    - **Depende de:** T11, T12, T13
    - **Hecho cuando:** La regla `react/jsx-no-literals` está configurada en `eslint.config.mjs` aplicándose a `components/` y `app/` (excluye tests). `eslint-plugin-react` añadido como dependencia de desarrollo con aprobación explícita. No hay textos visibles hardcodeados en componentes de presentación. Todos los textos visibles pasan por `t()` o vienen del diccionario. `pnpm lint` pasa en verde (0 errores).

## Fase 4: Verificación final (tareas cortas)

- [x] **T25: pnpm lint en verde**
    - **Hecho cuando:** `pnpm lint` pasa sin errores, aplicando la regla `jsx-no-literals` en `components/` y `app/`. Verificado: 0 errores y 0 warnings.

- [x] **T26: pnpm typecheck en verde**
    - **Hecho cuando:** `pnpm typecheck` (`tsc --noEmit`) pasa sin errores. Verificado: exit 0.

- [x] **T27: pnpm test en verde**
    - **Hecho cuando:** `pnpm test` pasa todos los tests unitarios e de integración (Fases 1 y 2). Verificado: 23 ficheros, 129 tests.

- [x] **T28: pnpm test:e2e en verde**
    - **Hecho cuando:** `pnpm test:e2e` pasa todos los escenarios E2E (Fase 2). Verificado: 40 tests en chromium y mobile-chromium.

- [x] **T29: Comprobación RNF3**
    - **Hecho cuando:** No existe `app/api/` ni acceso a base de datos. Verificado revisando la estructura de la aplicación: no existe `app/api/` y no hay dependencias ni referencias a base de datos.

## Trazabilidad

| RF | Tareas de implementación | Tareas de test |
|----|---------|--------|
| RF1 | T15, T20, T23 | T1, T6 |
| RF2 | T19 | T7 (parte) |
| RF3 | T17, T18 | T5 (parte) |
| RF4 | T16, T17, T22 | T4, T10 |
| RF5 | T15, T17, T20 | T2, T14 |
| RF6 | T12, T13, T14, T22, T23 | T3, T5 |
| RF7 | T11, T19 | — |
| RF8 | T20, T21, T22, T23 | T5 (paridad) |

| Criterio de aceptación | Test(s) concretos |
|------------------------|-------------------|
| Persistencia selector (RF4, RNF6) | T7, T9, T10 |
| URL manda sobre cookie (RNF8) | T8, T28 |
| Almacenamiento bloqueado (RNF6) | T4, T9 |
| Cookie borrada | T8 |
| Idioma `fr` | T9 |
| RNF5 (jerarquía encabezados, un solo h1) | T7, T29 |
| Sin recarga completa (marcador window) | T10, T28 |
| Migración componentes a `t()` / `useLocale` | T22, T24 |
| Sin textos hardcodeados (RNF1) | T3, T5, T24 |

**Nota:** Si algún requisito o criterio queda sin tarea o sin test, se añade antes de entregar. Se comprueba además que ninguna tarea depende de otra posterior.