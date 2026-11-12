# 001 - Estilos globales de la aplicación - Tareas (TDD)

> **Aviso del 12 de noviembre de 2026.** Las partes de este documento relativas al botón que revela el selector, al selector oculto y al modal de aviso quedan obsoletas. El control de tema vigente se especifica en la 004 (RF-6), sobre la persistencia que fija la 003 (RF-6). El resto del plan y de las tareas sigue siendo válido.

**Estado:** Pendiente  
**Especificaciones:** `specs/001-styles-globals/spec.md`, `specs/001-styles-globals/plan.md`  
**Duración objetivo por tarea:** ≤ 30 minutos  
**Orden:** de arriba a abajo (dependencias respetadas, tests antes que código)

---

## TarReviseas

- [x] **T1 — Diccionarios i18n del selector y modal (EN/ES)**  
  RF cubiertos: NFR-9, RF-3, RF-6  
  Hecho cuando: existen entradas EN/ES para `themeSelect` (label + opciones light/dark/system) y `modalInfoJSDisabled` (title + body).
  - RF: NFR-9, RF-3, RF-6
  - Crear/actualizar diccionarios i18n con claves: `themeSelect.label`, `themeSelect.option.light`, `themeSelect.option.dark`, `themeSelect.option.system`, `modalInfoJSDisabled.title`, `modalInfoJSDisabled.body`.
  - Hecho cuando: existen entradas en inglés y castellano para todas las cadenas del selector y el modal.

- [x] **T2 — Tests unitarios de `app/lib/theme.ts` (antes del código)**  
  RF cubiertos: RF-2, RF-4  
  - Test: `app/lib/theme.test.ts` creado; 7 fallas (rojo) confirmadas antes de la implementación (`getSavedTheme`, `saveTheme`, `resolveActiveTheme`, listener `storage`, caso límite 5 valor inválido, caso límite 6 `localStorage` bloqueado).
  - RF: RF-2, RF-4
  - Escribir tests que fallen primero para: `getSavedTheme()`, `saveTheme(value)`, `resolveActiveTheme()` (manual vs sistema, fallback claro), listener del evento `storage` entre pestañas, valor inválido → fallback sistema (caso límite 5), `localStorage` bloqueado → funciona en sesión sin errores (caso límite 6).
  - Hecho cuando: el archivo de tests existe y las pruebas fallan (rojo) antes de escribir la implementación.

- [x] **T3 — Implementar `app/lib/theme.ts`**  
  RF cubiertos: RF-2, RF-4, RF-7  
  Hecho cuando: `pnpm exec vitest run app/lib/theme.test.ts` pasa en verde (7 passed). Implementadas `getSavedTheme`, `saveTheme`, `resolveActiveTheme`, `listenStorageChanges`; cubre caso límite 5 (invalid -> system) y caso límite 6 (`localStorage` bloqueado, sin errores).
  - RF: RF-2, RF-4, RF-7
  - Implementar las funciones para hacer pasar los tests de T2.
  - Hecho cuando: `pnpm exec vitest run app/lib/theme.test.ts` pasa en verde.

- [x] **T4 — Tests unitarios de `app/components/ThemeSelect.tsx` (antes del código)**  
  RF cubiertos: RF-3, RF-5, RF-6  
  - Archivo `app/components/ThemeSelect.test.tsx` creado; 5 fallas confirmadas (rojo): `<select>` oculto, revelado tras botón, opciones claro/oscuro/sistema, cambio inmediato, nombres accesibles EN/ES, modal `show()` (no `showModal()`).
  - RF: RF-3, RF-5, RF-6
  - Escribir tests con React Testing Library que fallen primero para: `<select>` oculto por defecto, revelado tras pulsar botón de tema, opciones claro/oscuro/sistema presentes, cambio inmediato al seleccionar sin recarga, nombres accesibles EN/ES desde i18n, operabilidad con teclado, modal `<dialog>` con `show()` (no `showModal()`).
  - Hecho cuando: el archivo de tests existe y las pruebas fallan (rojo) antes de escribir el componente.

- [x] **T5 — Implementar `app/components/ThemeSelect.tsx`**  
  RF cubiertos: RF-3, RF-5, RF-6  
  Hecho cuando: `pnpm exec vitest run app/components/ThemeSelect.test.tsx` pasa (6 passed). Componente: `<select>` oculto/revelado por botón, opciones light/dark/system, cambio inmediato, nombres EN/ES, `<dialog>` con `show()` (id `theme-dialog`).
  - RF: RF-3, RF-5, RF-6
  - Componente de una sola responsabilidad: `<select>` oculto inicialmente, revelado al pulsar botón, aplica cambio inmediato, nombres accesibles EN/ES, modal no bloqueante.
  - Hecho cuando: `pnpm exec vitest run app/components/ThemeSelect.test.tsx` pasa en verde.

- [x] **T6 — Variables CSS y temas en `app/globals.css`**  
  RF cubiertos: RF-1, RF-2, RF-8, RF-9, RF-10, RF-11, RF-12, RF-13, RF-14, RF-15  
  Hecho cuando: `pnpm exec vitest run app/globals.css.test.ts` pasa (11 passed). Variables `--warm-1` a `--warm-5`, roles semánticos, `.theme-light`/`.theme-dark`/`.theme-system`, `Geist Mono` 400, transición `250ms ease-in-out`, `prefers-reduced-motion`, `max-width: 65ch`, foco 3:1, enlaces subrayados, `--color-selection`.
  - RF: RF-1, RF-2, RF-8, RF-9, RF-10, RF-11, RF-12, RF-13, RF-14, RF-15
  - Definir `--warm-1` a `--warm-5`, roles semánticos, temas `.theme-light` / `.theme-dark` / `.theme-system`, `color-scheme` nativo, `Geist Mono` (400 + itálico, sin bold), transiciones `250ms ease-in-out`, `prefers-reduced-motion` instantáneo, `max-width: 65ch`, foco 3:1, enlaces subrayados sin color de acento, selección de texto.
  - Hecho cuando: todas las variables CSS del contrato de plan.md están definidas y aplican en ambos temas.

- [x] **T7 — Layout raíz con botón de tema y `<ThemeSelect />` (`app/layout.tsx`)**  
  RF cubiertos: RF-2, RF-3, RF-5, RF-7, RF-16  
  Hecho cuando: `pnpm exec vitest run app/layout.test.tsx` pasa (4 passed). `ThemeProvider` cliente monta botón + `ThemeSelect`, aplica clase `.theme-*` en `<html>` (inicial `.theme-system`, actualizado por `resolveActiveTheme` + `listenStorageChanges`), sin destello. `layout.tsx` mantiene `metadata` (servidor) y `ThemeProvider` (cliente).
  - RF: RF-2, RF-3, RF-5, RF-7, RF-16
  - Montar botón de tema siempre visible + `<ThemeSelect />`. Aplicar clase `.theme-light` / `.theme-dark` / `.theme-system` en `<html>`. No destello en carga.
  - Hecho cuando: el botón es visible, `<ThemeSelect />` está montado, la clase de tema se aplica en `<html>` y no hay destello incorrecto al cargar.

- [ ] **T8 — Tests end-to-end del flujo de tema (Playwright)**
  - RF: RF-2, RF-3, RF-4, RF-5, RF-6, RF-7
  - Flujo e2e: primera visita con tema del SO, cambio manual claro→oscuro→sistema, persistencia al recargar, sincronización entre dos pestañas, revelado del `<select>` tras primer clic, modal informativo al interactuar con selector.
  - Hecho cuando: `pnpm exec playwright test` para el flujo de tema pasa en verde en al menos un navegador de escritorio.

- [x] **T9 — Ejecutar lint, typecheck y tests completos**  
  RF cubiertos: todos  
  Hecho cuando: `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm exec vitest run` finalizan con código 0 (36 passed en 6 archivos, 0 errores).
  - RF: todos
  - Ejecutar `pnpm lint`, `pnpm typecheck` y `pnpm test`.
  - Hecho cuando: todos finalizan sin errores (código de salida 0).

---

## Tareas pendientes derivadas de la revisión visual (RF-17)

- [x] **T-10 — Tests de la escala de impacto y composición full-bleed (antes del código)**
  - RF: RF-9, RF-10, RF-11, RF-12, RF-17, NFR-10
  - Escribir tests que fallen primero para: existencia de `--type-display`, `--type-page-title`, `--type-section-title`, `--measure`, `--gutter`, `--section-space` y `--layout-wide`; texto corrido limitado a 65ch; contenedor full-bleed sin scroll horizontal.
  - Hecho cuando: los tests existen y fallan (rojo) antes de implementar los tokens.
  - Hecho: 8 tests añadidos en `app/globals.css.test.ts`; rojo confirmado (8 failed | 13 passed) antes de T-11.

- [x] **T-11 — Implementar la capa de impacto visual en `app/globals.css` y `app/layout.tsx`**
  - RF: RF-9, RF-10, RF-11, RF-12, RF-17, NFR-3, NFR-10
  - Añadir escala tipográfica editorial, espacio negativo generoso, contenedor full-bleed, utilidades de bloque invertido y revelados de entrada con CSS/Tailwind.
  - Hecho cuando: `pnpm exec vitest run app/globals.css.test.ts` pasa en verde y no se añaden dependencias.
  - Hecho: `app/globals.css.test.ts` 21 passed; tokens `--type-*`, `--measure`, `--gutter`, `--section-space`, `--layout-wide`, `--transition-reveal`; `.layout-wide`/`.full-bleed`, `.inverted`, `.reveal` y `prefers-reduced-motion`; contenedor en `app/layout.tsx`. Sin dependencias nuevas.

- [x] **T-12 — Test e2e de identidad visual**
  - RF: RF-11, RF-12, RF-17, NFR-10, casos límite 19-20
  - Verificar en `tests/e2e/visual-identity.e2e.ts`: al menos un momento visual por página, medida de lectura, ausencia de scroll horizontal en full-bleed y revelados desactivados con `prefers-reduced-motion`.
  - Hecho cuando: el test pasa en al menos un navegador de escritorio y uno móvil (14 tests pasaron: 10 desktop + 4 mobile).

- [x] **T-13 — Revisión visual manual en ambos temas y tamaños**
  - RF: RF-1, RF-8, RF-12, RF-17, NFR-1, NFR-3
  - Revisar claro/oscuro, escritorio/móvil, 320 px, zoom 200 % y movimiento reducido; confirmar que la identidad se percibe minimalista pero espectacular y no como una plantilla genérica.
  - Hecho cuando: la revisión queda registrada y no hay regresiones de contraste, legibilidad ni rendimiento (screenshots capturados: desktop-light.png, desktop-dark.png, mobile-320-light.png, mobile-320-dark.png, desktop-light-reduced-motion.png).

---

## Notas TDD

- **Nunca se escribe código de implementación sin un test fallando primero** (Constitución 4).
- T2 y T4 son obligatorias antes de T3 y T5 respectivamente.
- No se añaden dependencias nuevas (NFR-8).
- Código y comentarios en inglés (Constitución 6).
- Nada se da por terminado con lint, typecheck o tests en rojo (Constitución 4).
