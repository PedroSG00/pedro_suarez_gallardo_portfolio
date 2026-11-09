# Tareas: Configuración i18n (internacionalización)

Small tasks (max 20-30 min each), in dependency order, each covering the RFs and with a verifiable "Hecho cuando:". Use checkboxes.

## Fase 1: Tests unitarios e integración (en rojo, antes de implementación)

- [ ] **T1: Test unitario parseAcceptLanguage**
    - **Depende de:** Ninguna
    - **RFs:** RF1
    - **Hecho cuando:** Test Vitest en `src/i18n/__tests__/parseAcceptLanguage.test.ts` pasa: header `es-ES,es;q=0.9,en;q=0.8` → `es`; ignora `*` y `q=0`; cabecera vacía devuelve `[]`.

- [ ] **T2: Test unitario resolveLocale**
    - **Depende de:** Ninguna
    - **RFs:** RF5, RNF8
    - **Hecho cuando:** Test Vitest en `src/i18n/__tests__/resolveLocale.test.ts` pasa: cookie válida gana; cookie inválida `fr` se ignora; `Accept-Language: fr` → `en`; sin cookie ni cabecera → `en`. El parámetro `cookieValue` acepta `string | undefined | null`.

- [ ] **T3: Test unitario mergeWithFallback y createT**
    - **Depende de:** Ninguna
    - **RFs:** RF6, RNF1
    - **Hecho cuando:** Test Vitest en `src/i18n/__tests__/mergeWithFallback.test.ts` pasa: merge profundo donde lo que falte en el locale queda en inglés. Test de `createT` en `src/i18n/__tests__/createT.test.ts`: clave en `es` → español; solo en `en` → inglés; en ninguno → la propia clave (nunca hueco vacío).

- [ ] **T4: Test unitario storage.ts con caso límite**
    - **Depende de:** Ninguna
    - **RFs:** RF4, RNF6
    - **Hecho cuando:** Test Vitest en `src/i18n/__tests__/storage.test.ts` pasa: con `localStorage` bloqueado (lanza excepción) no lanza error y retorna `null`. Lee y escribe correctamente `localStorage` y cookie cuando el almacenamiento está disponible. El algoritmo `syncOnMount` no forma parte de este test (fue extraído al provider).

- [ ] **T5: Test de paridad de diccionarios**
    - **Depende de:** Ninguna
    - **RFs:** RF6, RNF1
    - **Hecho cuando:** Test Vitest que verifica: ninguna clave de `es.json` falta en `en.json`. Cada ruta de `metadataRoutes` tiene `title` y `description` en `en` y `es`. Se ejecuta como parte de `pnpm test`.

- [ ] **T6: Test unitario del middleware**
    - **Depende de:** Ninguna
    - **RFs:** RF1, RNF8
    - **Hecho cuando:** Test Vitest en `src/middleware.test.ts` pasa: rutas con prefijo válido pasan sin redirigir; las que no, redirigen 307 con header `Vary: Cookie, Accept-Language`. Excluye `/_next`, `/favicon.ico` y ficheros con extensión. Usa `next` mock.

## Fase 2: Escenarios E2E (12 escenarios del plan sección 6.3, agrupados en 4 tareas)

- [ ] **T7: E2E - SSR sin JavaScript y RNF5**
    - **Depende de:** Ninguna
    - **RFs:** RNF5
    - **Hecho cuando:** Test Playwright con `addInitScript` que simula JS bloqueado: la página sirve HTML con un solo `h1`, la jerarquía de encabezados es idéntica en `en` y `es`, y no hay acceso a `app/api/` ni base de datos (RNF3).

- [ ] **T8: E2E - URL manda sobre cookie y persistencia**
    - **Depende de:** Ninguna
    - **RFs:** RNF8
    - **Hecho cuando:** Test Playwright: al visitar `/es/proyectos` sin cookie, la URL manda sobre la detección de idioma. Al borrar la cookie y recargar, el idioma se restaura desde `localStorage` si existe (no modo incógnito).

- [ ] **T9: E2E - Almacenamiento bloqueado y idioma `fr`**
    - **Depende de:** Ninguna
    - **RFs:** RNF6
    - **Hecho cuando:** Test Playwright con `addInitScript` que simula `localStorage` lanzando excepción: no hay error en consola y el flujo continúa. Al acceder con idioma `fr` en la cabecera `Accept-Language`, el sitio cae back a inglés (fallback), no acepta `fr` como locale válido.

- [ ] **T10: E2E - Sin recarga completa y marcador en window**
    - **Depende de:** Ninguna
    - **RFs:** RF4, RNF6
    - **Hecho cuando:** Test Playwright mide con un marcador en `window` que se mantiene vivo tras el cambio de idioma mediante `router.push` replacing el primer segmento: la navegación no es una recarga completa y el marcador persiste.

## Fase 3: Implementación (orden de dependencia real)

- [ ] **T11: config.ts con locales y configuración**
    - **Depende de:** Ninguna
    - **RFs:** RF7
    - **Hecho cuando:** `src/i18n/config.ts` exporta `locales`, `defaultLocale`, `LOCALE_COOKIE`, `LOCALE_COOKIE_MAX_AGE` y `metadataRoutes`. El tipo `Locale` se deriva correctamente de `typeof locales[number]`. Fija `locales = ["en", "es"]`, `defaultLocale = "en"`, cookie `lang` con duración de 1 año. Atributos por defecto de cookie: `Path=/`, `Max-Age=LOCALE_COOKIE_MAX_AGE`, `SameSite=Lax`, sin `HttpOnly`, `Secure` en producción.

- [ ] **T12: en.json diccionario (fuente de verdad)**
    - **Depende de:** T11
    - **RFs:** RF6, RNF1
    - **Hecho cuando:** `src/i18n/dictionaries/en.json` existe con las secciones `nav`, `languages`, `sections`, `metadata` y `common`, usando claves en `camelCase` y notación de puntos `t("nav.home")`. Incluye todas las claves listadas en el plan (home, projects, cv, contact, language, hero.title, hero.role, about.title, metadata.home.title/description, metadata.projects.title/description, notFound, back, copyright). Notación de ejemplo: `t("nav.home")` → "Home".

- [ ] **T13: es.json diccionario (traducciones español)**
    - **Depende de:** T12
    - **RFs:** RF6
    - **Hecho cuando:** `src/i18n/dictionaries/es.json` existe con traducciones de todas las claves de `en.json`. Las claves deben ser idénticas y los valores en español. Nombres de idioma escritos en su propio idioma (`en: "English"`, `es: "Español"`). **Criterio:** ninguna clave de `es.json` falta en `en.json`; `es.json` puede omitir claves pero no puede tener claves que no existan en `en.json`.

- [ ] **T14: get-dictionary.ts servidor (carga y fusión)**
    - **Depende de:** T12, T13
    - **RFs:** RF4, RF5
    - **Hecho cuando:** `src/i18n/get-dictionary.ts` exporta una función de servidor que carga el diccionario fusionado: toma `en` como base y mergea las claves del idioma activo. Retorna un objeto plano que no contiene textos hardcodeados. Se usa en `generateMetadata` y en el `LocaleProvider` del servidor.

- [ ] **T15: resolve-locale.ts con funciones puras**
    - **Depende de:** T11
    - **RFs:** RF1, RF5, RNF8
    - **Hecho cuando:** `src/i18n/resolve-locale.ts` exporta `parseAcceptLanguage(header: string): Array<{base: string, q: number}>` y `resolveLocale(cookieValue: string | undefined | null, acceptLanguage: string, locales: string[], defaultLocale: string): string`. La prioridad es: cookie → `Accept-Language` → `defaultLocale`. Funciona en Node sin Next.js. Si la cookie está en `locales`, úsala. Si no, itera `parseAcceptLanguage` y devuelve la primera coincidencia. Si nada coincide, devuelve `defaultLocale`. Usa el tipo `Locale` derivado de `config.ts`.

- [ ] **T16: storage.ts con localStorage y cookie**
    - **Depende de:** T11
    - **RFs:** RF4, RNF6
    - **Hecho cuando:** `src/i18n/storage.ts` exporta `readStorage(key): string|null`, `writeStorage(key, value): void`, `readCookie(key): string|null`, `writeCookie(key, value, options?): void` que nunca lanzan error si el almacenamiento está bloqueado (try/catch alrededor de todo). **Hecho cuando (caso límite):** Si `localStorage` lanza excepción, la función retorna `null` y no interrumpe el flujo. Los atributos por defecto de la cookie son: `Path=/`, `Max-Age=LOCALE_COOKIE_MAX_AGE`, `SameSite=Lax`, sin `HttpOnly`. La función guarda `typeof document` para manejar SSR.

- [ ] **T17: locale-provider.tsx con Context y useEffect**
    - **Depende de:** T15, T16, T14
    - **RFs:** RF3, RF4, RF5
    - **Hecho cuando:** `src/i18n/locale-provider.tsx` es un componente `"use client"` que provee el contexto i18n: recibe `locale` y `dictionary` fusionado desde el servidor, expone `t` y `setLocale` por medio de Context. **Corrección:** sustituye `onMount` por `useEffect`. Extrae la lógica como función pura `syncOnMount` (testeable). Al montar, sincroniza `localStorage` y cookie según el algoritmo: si la cookie es válida y difiere del stored, espeja la cookie; si la cookie no es válida y el stored sí, escribe la cookie. Nunca sobrescribe la preferencia con el idioma de la URL.

- [ ] **T18: use-locale.ts hook personalizado**
    - **Depende de:** T17
    - **RFs:** RF3, RF4, RF5, RNF6, RNF7
    - **Hecho cuando:** `src/i18n/use-locale.ts` exporta un hook `useLocale()` que retorna `{ locale: Locale, setLocale: (next: Locale) => void, t: (key: string) => string }`. **Corrección:** `setLocale(next)` precondición `next ∈ locales`, escribe `localStorage.lang` y cookie `lang`, y conserva query y hash al navegar. Navega cliente a la misma ruta bajo el nuevo prefijo sin recarga completa (`router.push` replacing el primer segmento, manteniendo query y hash). Los errores de almacenamiento se capturan y no interrumpen el cambio.

- [ ] **T19: language-selector.tsx con persistLocale**
    - **Depende de:** T18
    - **RFs:** RF2, RF7
    - **Hecho cuando:** `src/components/ui/language-selector.tsx` renderiza una opción por entrada de `config.ts.locales`, con etiquetas desde `languages.<locale>` del diccionario. Cada opción es un `<Link>` a la misma ruta en el otro idioma (funciona sin JS). El estado activo lleva `aria-current`. **Corrección:** El selector usa `<Link onClick={() => persistLocale(next)}` y nunca `setLocale`, para no navegar dos veces. **Hecho cuando (comportamiento):** `persistLocale(next)` escribe `localStorage` y cookie `lang`, sin navegar. No hay transiciones, o están bajo `@media (prefers-reduced-motion: no-preference)`.

- [ ] **T20: app/[locale]/layout.tsx con html lang y generateStaticParams**
    - **Depende de:** T11, T17
    - **RFs:** RF8, RNF4, RNF5
    - **Hecho cuando:** `app/[locale]/layout.tsx` fija `<html lang={locale}>`, exporta `generateStaticParams` que devuelve parámetros para todos los `locales` (SSG), y incluye el `LocaleProvider` envolviendo a los hijos. **Corrección:** Se quitan RF8 y RNF5 de sus RFs si no los implementa. En Next 15 `params` es una `Promise`.

- [ ] **T21: app/[locale]/page.tsx con generateMetadata**
    - **Depende de:** T14, T15
    - **RFs:** RF8, RNF4
    - **Hecho cuando:** `app/[locale]/page.tsx` exporta `generateMetadata({ params })` que lee `metadata.<rutaKey>.title/description` del diccionario fusionado (resuelto en servidor, no en contexto cliente). Cada ruta registrada en `metadataRoutes` debe tener ambas claves en `en` y `es`. **Corrección T12:** Se decide `alternates.languages` (hreflang) y `canonical`: o se hacen, o se quitan. No se deja "se recomienda".

- [ ] **T22: app/[locale]/proyectos/page.tsx con generateMetadata**
    - **Depende de:** T21
    - **RFs:** RF8
    - **Hecho cuando:** `app/[locale]/proyectos/page.tsx` exporta `generateMetadata({ params })` que lee `metadata.proyectos.title/description` del diccionario fusionado. Cada ruta de proyectos tiene metadatos en `en` y `es`.

- [ ] **T23: Validación de locale en ruta (dynamicParams = false o notFound())**
    - **Depende de:** T20
    - **RFs:** RF8
    - **Hecho cuando:** La ruta `[locale]` está configurada con `dynamicParams = false` o incluye `notFound()` para que `/xx/...` devuelva 404. Esto evita que segmentos de idioma inválidos se resuelvan silenciosamente.

- [ ] **T24: Configuración de lint react/jsx-no-literals**
    - **Depende de:** T11, T12, T13
    - **RFs:** RNF1
    - **Hecho cuando:** La regla `react/jsx-no-literals` está configurada en `components/` y `app/` (excluye tests). No hay textos visibles hardcodeados en componentes de presentación. Todos los textos visibles pasan por `t()` o vienen del diccionario.

## Fase 4: Verificación final (tareas cortas)

- [ ] **T25: pnpm lint en verde**
    - **Hecho cuando:** `pnpm lint` pasa sin errores, aplicando la regla `jsx-no-literals` en `components/` y `app/`.

- [ ] **T26: pnpm typecheck en verde**
    - **Hecho cuando:** `pnpm typecheck` (`tsc --noEmit`) pasa sin errores.

- [ ] **T27: pnpm test en verde**
    - **Hecho cuando:** `pnpm test` pasa todos los tests unitarios e de integración (Fases 1 y 2).

- [ ] **T28: pnpm test:e2e en verde**
    - **Hecho cuando:** `pnpm test:e2e` pasa todos los escenarios E2E (Fase 2).

- [ ] **T29: Comprobación RNF3**
    - **Hecho cuando:** No existe `app/api/` ni acceso a base de datos. Verificado revisando la estructura de la aplicación.

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