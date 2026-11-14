# 003 — Consolidación de la base — Tareas

Orden de ejecución estricto: no empezar una tarea hasta que la anterior tenga su "Hecho cuando" verde. Tests primero (Constitución 4): cada implementación va precedida de su test en rojo.

## Fase 1 — Tests rojos (tests antes que el código) — COMPLETA
RF cubiertos: RF-1 (T1, T4), RF-2 (T6), RF-3 (T2, T3), RF-5 (T6), RF-6 (T5), RNF-8 (T1), RNF-9 (T1).

- [x] **T1. Test de paridad de diccionarios** — `app/i18n/dictionaries/dictionary-parity.test.ts` — HECHA
  - RF: RF-1, RNF-8, RNF-9
  - Hecho cuando: `pnpm test` ejecuta el test y falla si `es.json` tiene claves ausentes o sobrantes respecto a `en.json`, o si faltan claves reservadas (`themeSelect.*`, `common.notFound`, `common.back`).
  - Resultado: 7 tests de paridad pasan; suite completa 131 tests en verde.

- [x] **T2. Tests de resolución de idioma** — `app/i18n/resolve-locale.test.ts` — HECHA
  - RF: RF-3
  - Hecho cuando: el test cubre cookie válida/inválida/vacía/duplicada, `Accept-Language` con pesos, comodín, `q=0`, empate y valores malformados, y el orden cookie → navegador → inglés; está en rojo antes de implementar `resolve-locale.ts`.
  - Resultado: 28 tests de resolución de idioma pasan; suite completa 154 tests en verde. `resolve-locale.ts` ya existía y es conforme a spec (no hubo que modificarlo); solo se corrigió una expectativa de test ("parámetros extra" → default, conforme a spec RF-3).

- [x] **T3. Tests de storage y migración legacy** — `app/i18n/storage.test.ts` — HECHA
  - RF: RF-3, RF-8
  - Hecho cuando: el test cubre lectura/escritura de cookie, `localStorage.lang` se lee una vez, se escribe cookie y se borra, y no se toca si ya hay cookie; está en rojo antes de implementar `storage.ts`.
  - Resultado: se añadió `migrateLegacyLang()` a `app/i18n/storage.ts` (migración one-time: cookie gana, `localStorage.lang` se lee una vez y se borra, valor inválido no se migra, nunca lanza). 12 tests de storage pasan; suite completa 159 tests en verde.

- [x] **T4. Tests de traducción** — `app/i18n/translate.test.ts` — HECHA
  - RF: RF-1
  - Hecho cuando: el test cubre `createT` con notación de puntos y falla explícitamente ante una clave ausente; está en rojo antes de implementar `translate.ts`.

- [x] **T5. Tests de tema** — `app/lib/theme.test.ts` — HECHA
  - RF: RF-6
  - Hecho cuando: el test cubre lectura/escritura, valor inválido, almacenamiento bloqueado, cuota llena y `storage` con `newValue=null`; está en rojo antes de implementar `theme.ts`.

- [x] **T6. Test de racha de enrutado** — `app/lib/routing-streak.test.ts` — HECHA
  - RF: RF-2, RF-5
  - Hecho cuando: el test alimenta la matriz de `routing-cases.json` y exige `rachaActual = número de casos` con `casosFallidos` vacío; está en rojo antes de implementar `proxy.ts`.

## Fase 2 — Módulos puros — COMPLETA
RF cubiertos: RF-1 (T10, T11), RF-3 (T7, T8, T9), RF-6 (T12), RF-8 (T9).

- [x] **T7. Crear `app/i18n/config.ts`** — locales, `defaultLocale`, `LOCALE_COOKIE`, max-age
  - RF: RF-3, RF-4
  - Hecho cuando: el archivo exporta las constantes y `pnpm typecheck` no reporta errores.
  - Resultado: `config.ts` exporta `locales`, `Locale`, `defaultLocale`, `LOCALE_COOKIE`, `LOCALE_COOKIE_MAX_AGE`, `metadataRoutes`; typecheck limpio; `config.test.ts` pasa.

- [x] **T8. Implementar `app/i18n/resolve-locale.ts`** — resolvedor único: cookie → `Accept-Language` → inglés
  - RF: RF-3
  - Hecho cuando: `pnpm test` pasa en `resolve-locale.test.ts` y el resolvedor es el único punto que decide el idioma inicial.
  - Resultado: `resolve-locale.ts` + `parseAcceptLanguage` implementados como único resolvedor; 28 tests pasan (válida/inválida/vacía/duplicada cookie, pesos, comodín, q=0, empate, malformado, orden cookie→navegador→inglés).

- [x] **T9. Implementar `app/i18n/storage.ts`** — lectura/escritura de cookie y `localStorage` con `try/catch`; migración legacy una vez
  - RF: RF-3, RF-8
  - Hecho cuando: `pnpm test` pasa en `storage.test.ts` y `localStorage.lang` se migra una vez y se borra.
  - Resultado: `readStorage`, `writeStorage`, `readCookie`, `writeCookie`, `migrateLegacyLang` implementados; cookie gana sobre localStorage; migración one-time con borrado; nunca lanza; 12 tests pasan.

- [x] **T10. Implementar `app/i18n/get-dictionary.ts`** — carga del diccionario sin fusión de respaldo
  - RF: RF-1
  - Hecho cuando: `pnpm test` pasa y ningún módulo mezcla idiomas en tiempo de ejecución.
  - Resultado: `deepMerge` eliminado; `getDictionary` retorna cada diccionario tal cual (sin merge ni fallback); paridad tipada en compile time vía `satisfies typeof en`; 4 tests pasan.

- [x] **T11. Implementar `app/i18n/translate.ts`** — `createT`: resuelve claves y falla en vez de devolver la clave
  - RF: RF-1
  - Hecho cuando: `pnpm test` pasa en `translate.test.ts` y ningún componente muestra claves sin traducir.
  - Resultado: `mergeWithFallback` eliminado; `createT` lanza `Error` explícito ante clave ausente o valor no-string; 4 tests pasan; `merge-with-fallback.test.ts` obsoleto eliminado.

- [x] **T12. Implementar `app/lib/theme.ts`** — modelo de tema, storage y evento `storage`
  - RF: RF-6
  - Hecho cuando: `pnpm test` pasa en `theme.test.ts` y es el único lector de la clave `theme` tras el arranque.
  - Resultado: `getSavedTheme`, `saveTheme`, `resolveActiveTheme`, `listenStorageChanges` implementados (movido a `app/theme/theme.ts`); valor inválido → sistema; almacenamiento bloqueado/cuota llena sin lanzar; 7 tests pasan.

## Fase 3 — Enrutado y layouts

- [ ] **T13. Implementar `proxy.ts`** — tabla única de precedencia: pasar, redirigir 308 o 404; excluir assets técnicos
  - RF: RF-2, RF-5
  - Hecho cuando: el test de racha (T6) pasa con la matriz completa de `routing-cases.json` y `proxy.ts` es el único punto que decide el destino.

- [ ] **T14. Crear `app/[locale]/layout.tsx`** — `<html lang>`, script de arranque de tema inline en `<head>`, proveedores sin controles visibles
  - RF: RF-1, RF-4, RF-6
  - Hecho cuando: el idioma del documento y la clase de tema se aplican en el primer frame sin destello (CLS < 0,1).

- [ ] **T15. Crear `app/[locale]/(site)/layout.tsx`** — controles visibles (`LanguageSelector` + `ThemeSelect`) solo en páginas reales
  - RF: RF-4, RF-6
  - Hecho cuando: la pantalla 404 no hereda este layout y no muestra cabecera ni controles.

- [ ] **T16. Crear `app/[locale]/[...rest]/page.tsx`** — cualquier ruta desconocida bajo idioma válido → `notFound()`
  - RF: RF-5, RF-7
  - Hecho cuando: una ruta inexistente bajo `/es/` responde 404 sin repetir la ruta solicitada y conserva el idioma resuelto.

- [ ] **T17. Crear `app/[locale]/not-found.tsx`** — pantalla 404 bilingüe, sin cabecera ni controles, con enlaces de salida
  - RF: RF-7, RF-9, RNF-3
  - Hecho cuando: muestra `common.notFound`, enlace `common.back` al inicio y enlace al otro idioma, declara `noindex` sin canonical ni alternativas.

## Fase 4 — Controles y proveedores

- [ ] **T18. Crear `app/components/LanguageSelector/LanguageSelector.tsx`** — enlaces nativos por idioma; único punto de escritura de la cookie `lang`
  - RF: RF-4, RF-8
  - Hecho cuando: el cambio de idioma conserva ruta, consulta y fragmento, actualiza la URL, deja entrada en el historial y guarda la preferencia solo vía `LanguageSelector`/`use-locale`.

- [ ] **T19. Crear `app/components/ThemeProvider/ThemeProvider.tsx`** — aplica y sincroniza el tema; escucha cambios entre pestañas; sin control visible
  - RF: RF-6
  - Hecho cuando: el tema se aplica sin recarga, se sincroniza entre pestañas sin mover el foco y respeta `prefers-reduced-motion`.

- [ ] **T20. Crear `app/components/ThemeSelect/ThemeSelect.tsx`** — `<select>` nativo siempre visible con etiquetas del diccionario (hasta la 004)
  - RF: RF-6, RF-9
  - Hecho cuando: el `<select>` es siempre visible, usa etiquetas del diccionario, tiene nombre accesible y cumple objetivo 24×24.

## Fase 5— Metadatos, accesibilidad y navegadores

- [ ] **T21. Añadir `generateMetadata` en `page.tsx` y `projects/page.tsx`** — título y descripción por idioma, canónica propia, `hreflang` y `x-default` → `/en`
  - RF: RNF-3
  - Hecho cuando: cada página tiene metadatos propios por idioma y `x-default` apunta a `/en`; la 404 se declara como no indexable sin canonical ni alternativas.

- [ ] **T22. Añadir tokens de foco y contraste en `app/globals.css`** — indicador de foco 3:1 frente al fondo y al estado sin foco; `prefers-reduced-motion`; `color-scheme`
  - RF: RF-9, RNF-5
  - Hecho cuando: el foco es visible y distinguible con contraste 3:1, nunca queda oculto, y los cambios de tema son instantáneos con movimiento reducido.

- [ ] **T23. Actualizar `playwright.config.ts`** — matriz de 4 escritorio (Chromium, Firefox, WebKit, Edge) + 2 móvil (Chromium, WebKit)
  - RF: RNF-6
  - Hecho cuando: `pnpm test:e2e` ejecuta los seis proyectos definidos.

## Fase 6 — Limpieza y notas de corrección

- [ ] **T24. Eliminar claves derogadas de diccionarios** — `modalInfoJSDisabled.*` y claves de estado del revelado del selector
  - RF: RF-1, RF-8
  - Hecho cuando: ninguna de esas claves existe en `en.json` ni `es.json`, y la paridad de diccionarios sigue pasando.

- [ ] **T25. Reescribir pruebas derogadas** — `i18n-flow.e2e.ts` T10 (doble persistencia y ausencia de recarga) y `theme-flow.e2e.ts` (botón que revela el selector)
  - RF: RF-8
  - Hecho cuando: ninguna prueba end-to-end valida comportamiento derogado y `pnpm test:e2e` pasa en verde.

- [ ] **T26. Corregir notas en specs 001 y 002** — nota fechada sobre control de tema, revelado y aviso de JavaScript (001); respaldo a inglés y persistencia dual (002); quitar referencia inexistente a `implementation.md`
  - RF: RNF-8
  - Hecho cuando: `specs/001-styles-globals/spec.md` y `specs/002-i18n-setting/spec.md` tienen nota fechada y aviso en sus planes/tareas, y no existe referencia a `implementation.md`.

## Criterio de finalización de la fase

Toda la 003 se da por terminada solo cuando `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e` y `pnpm build` pasan en verde, y el build no falla por desajuste de diccionarios (gate de paridad, RF-1, RNF-1).
