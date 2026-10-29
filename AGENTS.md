# AGENTS.md — pedro-suarez-cv

## Proyecto
Web de currículum/portfolio de Pedro Suárez Gallardo, desarrollador web. Está pensada sobre todo para reclutadores y, en menor medida, para clientes potenciales de sus servicios. Es un sitio estático y bilingüe (inglés y castellano), sin base de datos ni backend propio.

Diseño minimalista de estética "tech", reconocible y atractiva:
- Paleta: crudo y negro, con modo oscuro.
- Tipografía: monoespaciada y elegante (fuente concreta por definir).

Stack: Next.js (App Router), React, TypeScript, Tailwind CSS e i18n para los idiomas `en` y `es`.

## Comandos
Gestor de paquetes: **pnpm**. No uses npm ni yarn, y no generes `package-lock.json` ni `yarn.lock`.

- Instalar dependencias: `pnpm install`
- Ejecutar en local: `pnpm dev`
- Build de producción: `pnpm build`
- Servir el build: `pnpm start`
- Tests unitarios y de componentes (Vitest + React Testing Library): `pnpm test` **(por añadir)**
- Tests en modo watch: `pnpm test:watch` **(por añadir)**
- Tests end-to-end (Playwright): `pnpm test:e2e` **(por añadir)**
- Typecheck: `pnpm typecheck` (`tsc --noEmit`) **(por añadir)**
- Lint: `pnpm lint` (ESLint)

Para iterar rápido, ejecuta solo el test afectado (por ejemplo `pnpm exec vitest run ruta/al/archivo.test.tsx`) en lugar de toda la suite.

## Estilo y convenciones
- Next.js 16.4.3, React 19.3.0, TypeScript. Tailwind para estilos.
- Código y comentarios en inglés.
- Nombres en `camelCase`; constantes en `SCREAMING_SNAKE_CASE`.
- Commits en inglés siguiendo Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`...).
- Todos los textos visibles para el usuario van en los diccionarios i18n (inglés y castellano), nunca escritos directamente en los componentes. Cualquier texto nuevo debe añadirse en ambos idiomas.
- Respetar siempre la identidad visual: minimalista, crudo y negro, fuente monoespaciada, y que modo claro y oscuro se vean bien.
- SEO: todo contenido nuevo debe tener metadatos propios por idioma (Metadata API), estructura semántica de encabezados y renderizado en servidor o estático. Sigue el principio de SEO de `docs/constitution.md`.
- Animaciones: suaves, elegantes y sutiles, solo donde aporten (transiciones de tema, hover, aparición de secciones). Duraciones cortas (150-400 ms) con easing suave. Respeta siempre `prefers-reduced-motion`. No uses librerías de animación sin preguntar; prefiere transiciones CSS/Tailwind.

## Reglas
- Si existen `docs/constitution.md` y una spec activa, léelos antes de tocar código. Si no existen, no los inventes: pregunta antes de empezar cualquier cambio no trivial.
- Puedes modificar cualquier parte del proyecto, pero **pregunta antes de**:
  - Añadir dependencias nuevas (`pnpm add`), incluida la librería de i18n.
  - Hacer cambios sustanciales en el código existente.
  - Modificar capas de abstracción muy transversales (layout raíz, sistema de i18n, configuración de tema y estilos globales, configuración de Tailwind/TypeScript/ESLint...).
- No introduzcas base de datos, backend ni servicios externos.
- Cambios pequeños y enfocados: no mezcles refactors con funcionalidades nuevas.

## Al terminar cualquier tarea
Ejecuta y comprueba que pasan, en este orden:
1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test` (y `pnpm test:e2e` si el cambio afecta a flujos de navegación, idioma o tema)

Si algo falla, corrígelo antes de dar la tarea por terminada o explica claramente por qué no se puede.