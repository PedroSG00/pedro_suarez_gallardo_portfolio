# Constitución — Portfolio de Pedro Suárez Gallardo

1. **Stack mínimo.** Solo Next.js, React, TypeScript y Tailwind. Ninguna dependencia nueva sin aprobación explícita de Pedro.
2. **La spec manda.** No se escribe código sin una spec activa que lo respalde; si código y spec divergen, se corrige la spec primero y luego el código.
3. **Componentes pequeños y reutilizables.** Cada pieza de UI es un componente con una sola responsabilidad; si algo se repite o puede repetirse, se extrae. Los componentes no contienen textos ni datos del currículum: solo reciben contenido por props y lo muestran.
4. **Tests obligatorios.** Todo componente con comportamiento tiene test (Vitest + React Testing Library) y los flujos críticos (idioma, tema, navegación) tienen test E2E (Playwright). Nada se da por terminado con tests, lint o typecheck en rojo.
5. **El contenido vive en el repo.** Sin base de datos ni backend: los textos y datos del currículum están en diccionarios i18n y ficheros locales versionados en Git.
6. **Inglés en el código, en/es en los textos.** Código, comentarios y commits en inglés (`camelCase`, constantes en `SCREAMING_SNAKE_CASE`, Conventional Commits). Todo texto visible existe en inglés y castellano en el mismo cambio.