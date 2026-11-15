---
description: '/multi <carpeta> "<T1 T2 T3>" · Implementa varias tareas en orden, tests primero, y para al primer fallo'
---
Implementa SOLO estas tareas, en este orden: $2
Están definidas en specs/$1/tasks.md. Sigue specs/$1/plan.md y docs/constitution.md.

Para CADA tarea de la lista, una detrás de otra:
1. Escribe primero los tests y luego el código.
2. Ejecuta los tests del proyecto y muéstrame el resultado completo.
3. Si pasan: marca la tarea en tasks.md, indica qué RF cubre y pasa a la siguiente de la lista.
4. Si fallan y no logras arreglarlos en un máximo de 2 intentos: PÁRATE ahí.
   No sigas con las tareas restantes. Explica qué falla y por qué.

Reglas:
- Si la lista es un rango (por ejemplo T2-T4), son todas las tareas entre ambas, incluidas.
- Si alguna tarea de la lista depende de otra que NO está en ella y aún no está marcada
  como hecha, avísame y no la implementes.
- No empieces ninguna tarea que no esté en la lista. No toques archivos ajenos a ellas.

Al terminar, dame una tabla con: tarea, estado (hecha / fallida / no iniciada),
RF cubiertos y resultado de los tests.