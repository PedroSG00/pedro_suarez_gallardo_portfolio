# 001 — Estilos globales de la aplicación — Tareas (TDD)

**Estado:** Pendiente  
**Especificaciones:** `specs/001-styles-globals/spec.md`, `specs/001-styles-globals/plan.md`  
**Duración objetivo por tarea:** ≤ 30 minutos  
**Orden:** de arriba a abajo (dependencias respetadas, tests antes que código)

---

## Tareas

- [x] **T-01 — Diccionarios i18n del selector y modal (EN/ES)**  
  RF cubiertos: NFR-9, RF-3, RF-6  
  Hecho cuando: existen entradas EN/ES para `themeSelect` (label + opciones light/dark/system) y `modalInfoJSDisabled` (title + body).
  - RF: NFR-9, RF-3, RF-6
  - Crear/actualizar diccionarios i18n con claves: `themeSelect.label`, `themeSelect.option.light`, `themeSelect.option.dark`, `themeSelect.option.system`, `modalInfoJSDisabled.title`, `modalInfoJSDisabled.body`.
  - Hecho cuando: existen entradas en inglés y castellano para todas las cadenas del selector y el modal.

- [x] **T-02 — Tests unitarios de `app/lib/theme.ts` (antes del código)**  
  RF cubiertos: RF-2, RF-4  
  - Test: `app/lib/theme.test.ts` creado; 7 fallas (rojo) confirmadas antes de la implementación (`getSavedTheme`, `saveTheme`, `resolveActiveTheme`, listener `storage`, caso límite 5 valor inválido, caso límite 6 `localStorage` bloqueado).
  - RF: RF-2, RF-4
  - Escribir tests que fallen primero para: `getSavedTheme()`, `saveTheme(value)`, `resolveActiveTheme()` (manual vs sistema, fallback claro), listener del evento `storage` entre pestañas, valor inválido → fallback sistema (caso límite 5), `localStorage` bloqueado → funciona en sesión sin errores (caso límite 6).
  - Hecho cuando: el archivo de tests existe y las pruebas fallan (rojo) antes de escribir la implementación.

- [x] **T-03 — Implementar `app/lib/theme.ts`**  
  RF cubiertos: RF-2, RF-4, RF-7  
  Hecho cuando: `pnpm exec vitest run app/lib/theme.test.ts` pasa en verde (7 passed). Implementadas `getSavedTheme`, `saveTheme`, `resolveActiveTheme`, `listenStorageChanges`; cubre caso límite 5 (invalid -> system) y caso límite 6 (`localStorage` bloqueado, sin errores).
  - RF: RF-2, RF-4, RF-7
  - Implementar las funciones para hacer pasar los tests de T-02.
  - Hecho cuando: `pnpm exec vitest run app/lib/theme.test.ts` pasa en verde.

- [x] **T-04 — Tests unitarios de `app/components/ThemeSelect.tsx` (antes del código)**  
  RF cubiertos: RF-3, RF-5, RF-6  
  - Archivo `app/components/ThemeSelect.test.tsx` creado; 5 fallas confirmadas (rojo): `<select>` oculto, revelado tras botón, opciones claro/oscuro/sistema, cambio inmediato, nombres accesibles EN/ES, modal `show()` (no `showModal()`).
  - RF: RF-3, RF-5, RF-6
  - Escribir tests con React Testing Library que fallen primero para: `<select>` oculto por defecto, revelado tras pulsar botón de tema, opciones claro/oscuro/sistema presentes, cambio inmediato al seleccionar sin recarga, nombres accesibles EN/ES desde i18n, operabilidad con teclado, modal `<dialog>` con `show()` (no `showModal()`).
  - Hecho cuando: el archivo de tests existe y las pruebas fallan (rojo) antes de escribir el componente.

- [x] **T-05 — Implementar `app/components/ThemeSelect.tsx`**  
  RF cubiertos: RF-3, RF-5, RF-6  
  Hecho cuando: `pnpm exec vitest run app/components/ThemeSelect.test.tsx` pasa (6 passed). Componente: `<select>` oculto/revelado por botón, opciones light/dark/system, cambio inmediato, nombres EN/ES, `<dialog>` con `show()` (id `theme-dialog`).
  - RF: RF-3, RF-5, RF-6
  - Componente de una sola responsabilidad: `<select>` oculto inicialmente, revelado al pulsar botón, aplica cambio inmediato, nombres accesibles EN/ES, modal no bloqueante.
  - Hecho cuando: `pnpm exec vitest run app/components/ThemeSelect.test.tsx` pasa en verde.

- [x] **T-06 — Variables CSS y temas en `app/globals.css`**  
  RF cubiertos: RF-1, RF-2, RF-8, RF-9, RF-10, RF-11, RF-12, RF-13, RF-14, RF-15  
  Hecho cuando: `pnpm exec vitest run app/globals.css.test.ts` pasa (11 passed). Variables `--warm-1` a `--warm-5`, roles semánticos, `.theme-light`/`.theme-dark`/`.theme-system`, `Geist Mono` 400, transición `250ms ease-in-out`, `prefers-reduced-motion`, `max-width: 65ch`, foco 3:1, enlaces subrayados, `--color-selection`.
  - RF: RF-1, RF-2, RF-8, RF-9, RF-10, RF-11, RF-12, RF-13, RF-14, RF-15
  - Definir `--warm-1` a `--warm-5`, roles semánticos, temas `.theme-light` / `.theme-dark` / `.theme-system`, `color-scheme` nativo, `Geist Mono` (400 + itálico, sin bold), transiciones `250ms ease-in-out`, `prefers-reduced-motion` instantáneo, `max-width: 65ch`, foco 3:1, enlaces subrayados sin color de acento, selección de texto.
  - Hecho cuando: todas las variables CSS del contrato de plan.md están definidas y aplican en ambos temas.

- [x] **T-07 — Layout raíz con botón de tema y `<ThemeSelect />` (`app/layout.tsx`)**  
  RF cubiertos: RF-2, RF-3, RF-5, RF-7, RF-16  
  Hecho cuando: `pnpm exec vitest run app/layout.test.tsx` pasa (4 passed). `ThemeProvider` cliente monta botón + `ThemeSelect`, aplica clase `.theme-*` en `<html>` (inicial `.theme-system`, actualizado por `resolveActiveTheme` + `listenStorageChanges`), sin destello. `layout.tsx` mantiene `metadata` (servidor) y `ThemeProvider` (cliente).
  - RF: RF-2, RF-3, RF-5, RF-7, RF-16
  - Montar botón de tema siempre visible + `<ThemeSelect />`. Aplicar clase `.theme-light` / `.theme-dark` / `.theme-system` en `<html>`. No destello en carga.
  - Hecho cuando: el botón es visible, `<ThemeSelect />` está montado, la clase de tema se aplica en `<html>` y no hay destello incorrecto al cargar.

- [ ] **T-08 — Tests end-to-end del flujo de tema (Playwright)**
  - RF: RF-2, RF-3, RF-4, RF-5, RF-6, RF-7
  - Flujo e2e: primera visita con tema del SO, cambio manual claro→oscuro→sistema, persistencia al recargar, sincronización entre dos pestañas, revelado del `<select>` tras primer clic, modal informativo al interactuar con selector.
  - Hecho cuando: `pnpm exec playwright test` para el flujo de tema pasa en verde en al menos un navegador de escritorio.

- [x] **T-09 — Ejecutar lint, typecheck y tests completos**  
  RF cubiertos: todos  
  Hecho cuando: `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm exec vitest run` finalizan con código 0 (36 passed en 6 archivos, 0 errores).
  - RF: todos
  - Ejecutar `pnpm lint`, `pnpm typecheck` y `pnpm test`.
  - Hecho cuando: todos finalizan sin errores (código de salida 0).

---

## Notas TDD

- **Nunca se escribe código de implementación sin un test fallando primero** (Constitución 4).
- T-02 y T-04 son obligatorias antes de T-03 y T-05 respectivamente.
- No se añaden dependencias nuevas (NFR-8).
- Código y comentarios en inglés (Constitución 6).
- Nada se da por terminado con lint, typecheck o tests en rojo (Constitución 4).
