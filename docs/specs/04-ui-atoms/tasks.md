# Tareas — 04 Átomos de UI

Estado: T1 completado (Button, RF-1), T2 completado (Link, RF-2), T3 completado (Heading, RF-3), T4 completado (Tag, RF-4), T5 completado (Section, RF-5) y T6 completado (ThemeToggle, RF-6). T7–T8 pendientes. Cada tarea es pequeña, ordenada e implementable y verificable por separado. Se siguen los gates de la constitución: `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`. Los tests se escriben antes que el código (regla 8 de la constitución).

---

## T1 — Button ✅ (completado)

**Objetivo:** Implementar el átomo Button con acción, hover (inversión de color), foco por teclado y estado deshabilitado, todo recibido por prop.

**RF cubierto:** RF-1.

**Tests a escribir primero:**
- Renderiza el contenido pasado por `children` y no hardcodea texto interno.
- Al hacer clic (o pulsar Enter/Space con teclado) ejecuta `onClick`.
- Con `disabled`, no ejecuta `onClick` al activar ni al pulsar teclado.
- Al enfocar con el teclado, muestra un indicador de foco visible.
- Con el puntero sobre un Button habilitado, invierte los colores de fondo y texto; al retirarlos, los restaura.
- Si faltan props obligatorias (`children` o `onClick`), renderiza nada (`null`) sin error visible ni romper la página.

**Criterio de hecho:**
- Componente `Button/Button.tsx` implementado con props tipadas en inglés.
- Test `Button/Button.test.tsx` pasando con React Testing Library y Vitest.
- `pnpm lint`, `pnpm typecheck` y `pnpm test` en verde para este módulo.

---

## T2 — Link ✅ (completado)

**Objetivo:** Implementar el átomo Link con navegación a destino válido, hover (inversión de color), `target` opcional y foco por teclado, todo recibido por prop.

**RF cubierto:** RF-2.

**Tests a escribir primero:**
- Renderiza el contenido pasado por `children` y no hardcodea texto interno.
- Al activar un Link con `href` válido, navega a ese destino.
- Con `href` inválido o vacío, no navega y no rompe la página.
- Cuando se indica `target`, abre el destino en ese contexto de navegación.
- Al enfocar con el teclado, muestra un indicador de foco visible.
- Si faltan props obligatorias (`children` o `href`), renderiza nada (`null`) sin error visible ni romper la página.

**Criterio de hecho:**
- Componente `Link/Link.tsx` implementado con props tipadas en inglés.
- Test `Link/Link.test.tsx` pasando con React Testing Library y Vitest.
- `pnpm lint`, `pnpm typecheck` y `pnpm test` en verde para este módulo.

---

## T3 — Heading ✅ (completado)

**Objetivo:** Implementar el átomo Heading con niveles semánticos h1–h6 y escala tipográfica editorial, todo recibido por prop.

**RF cubierto:** RF-3.

**Tests a escribir primero:**
- Renderiza el encabezado con el nivel semántico indicado (h1 a h6).
- Si no se indica nivel, usa el valor por defecto del tema (h2).
- Muestra el texto pasado por `children` y no hardcodea texto interno.
- Si falta `children`, renderiza nada (`null`) sin romper la página.

**Criterio de hecho:**
- Componente `Heading/Heading.tsx` implementado con props tipadas en inglés.
- Test `Heading/Heading.test.tsx` pasando con React Testing Library y Vitest.
- `pnpm lint`, `pnpm typecheck` y `pnpm test` en verde para este módulo.

---

## T4 — Tag ✅ (completado)

**Objetivo:** Implementar el átomo Tag para etiquetar elementos con texto corto monoespaciado, todo recibido por prop.

**RF cubierto:** RF-4.

**Tests a escribir primero:**
- Renderiza el texto corto pasado por `children` como etiqueta monoespaciada.
- Si `children` está vacío, renderiza nada (`null`) sin romper la página.
- No hardcodea texto interno.

**Criterio de hecho:**
- Componente `Tag/Tag.tsx` implementado con props tipadas en inglés.
- Test `Tag/Tag.test.tsx` pasando con React Testing Library y Vitest.
- `pnpm lint`, `pnpm typecheck` y `pnpm test` en verde para este módulo.

---

## T5 — Section (contenedor de sección y retícula) ✅ (completado)

**Objetivo:** Implementar el contenedor de sección con retícula visible de 1 px y contenedor de hijos, todo recibido por prop.

**RF cubierto:** RF-5.

**Tests a escribir primero:**
- Muestra una retícula de líneas de 1 px sobre el fondo de la sección cuando `grid` está activo (o por defecto).
- Oculta la retícula cuando `grid` es falso.
- Renderiza el contenido pasado por `children`.
- Si falta `children`, renderiza nada (`null`) sin romper la página.

**Criterio de hecho:**
- Componente `Section/Section.tsx` implementado con props tipadas en inglés.
- Test `Section/Section.test.tsx` pasando con React Testing Library y Vitest.
- `pnpm lint`, `pnpm typecheck` y `pnpm test` en verde para este módulo.

---

## T6 — ThemeToggle ✅ (completado)

**Objetivo:** Implementar el alternador de tema como símbolo sin texto, con `aria-label` / `aria-pressed` recibidos por prop y emisión de evento al activar.

**RF cubierto:** RF-6.

**Tests a escribir primero:**
- Dispara `onToggle` al activar el símbolo (click o teclado).
- `aria-pressed` refleja el valor de `pressed`.
- `aria-label` se anuncia con el texto pasado por prop (en ambos idiomas, provisto por el consumidor desde `messages/`).
- No muestra texto visible; comunica su función únicamente con el símbolo gráfico y los atributos de accesibilidad.
- Si faltan props obligatorias (`onToggle`, `pressed` o `ariaLabel`), renderiza nada (`null`) sin romper la página.

**Criterio de hecho:**
- Componente `ThemeToggle/ThemeToggle.tsx` implementado con props tipadas en inglés.
- Test `ThemeToggle/ThemeToggle.test.tsx` pasando con React Testing Library y Vitest.
- `pnpm lint`, `pnpm typecheck` y `pnpm test` en verde para este módulo.

---

## T7 — LanguageSwitch

**Objetivo:** Implementar el cambiador de idioma como símbolo sin texto, con `aria-label` / `aria-pressed` recibidos por prop y emisión de evento al activar.

**RF cubierto:** RF-7.

**Tests a escribir primero:**
- Dispara `onChange` al activar el símbolo (click o teclado).
- `aria-pressed` refleja el valor de `currentLang`.
- `aria-label` se anuncia con el texto pasado por prop (en ambos idiomas, provisto por el consumidor desde `messages/`).
- No muestra texto visible; comunica su función únicamente con el símbolo gráfico y los atributos de accesibilidad.
- Si faltan props obligatorias (`onChange`, `currentLang` o `ariaLabel`), renderiza nada (`null`) sin romper la página.

**Criterio de hecho:**
- Componente `LanguageSwitch/LanguageSwitch.tsx` implementado con props tipadas en inglés.
- Test `LanguageSwitch/LanguageSwitch.test.tsx` pasando con React Testing Library y Vitest.
- `pnpm lint`, `pnpm typecheck` y `pnpm test` en verde para este módulo.

---

## T8 — Logo

**Objetivo:** Implementar el logo del home como la letra "D" extraída del símbolo `id="d"` de `public/logo.svg` (`viewBox="0 0 64 64"`), renderizada con `currentColor` para adaptarse al tema activo, sin declarar colores propios, y navegando al inicio al activar.

**RF cubierto:** RF-8.

**Tests a escribir primero:**
- Renderiza la letra "D" del símbolo `id="d"` de `public/logo.svg` (`viewBox="0 0 64 64"`), compuesta por tallo + cursor sin contenedor.
- Al activar el logo, navega al `href` indicado (inicio del sitio).
- El color se adapta al tema activo mediante `currentColor`; el componente no declara colores propios.
- Muestra el contenido pasado por prop (`src`, `alt` o `children`) y no hardcodea texto interno.
- Si falta `href` o si faltan `src`, `alt` y `children`, renderiza nada (`null`) sin romper la página.

**Criterio de hecho:**
- Componente `Logo/Logo.tsx` implementado con props tipadas en inglés.
- Test `Logo/Logo.test.tsx` pasando con React Testing Library y Vitest.
- `pnpm lint`, `pnpm typecheck` y `pnpm test` en verde para este módulo.

---

## Criterio de finalización del conjunto (después de T1–T8)

- Cada átomo tiene su carpeta propia bajo `src/components/ui/` con `Nombre/Nombre.tsx` y `Nombre/Nombre.test.tsx`.
- No hay barrel files ni carpetas nuevas en la raíz ni en `src/`.
- Cobertura ≥ 95 % (líneas, funciones, ramas, sentencias) forzada por el umbral de Vitest.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` en verde.
- Accesibilidad verificada: contraste AA, teclado, semántica.
- Cualquier adición o modificación de claves de traducción para `aria-label` va en inglés y español en el mismo cambio (regla 6 de la constitución).
