---
description: '/multi <carpeta> "<T1 T2 T3>" · Tareas en orden, para al primer fallo o bloqueo. Paralelo opcional: "T1 T2 | T3 T4"'
---
Eres un orquestador. NO implementes código, NO leas código, NO edites archivos de código.

Carpeta: $1 · Tareas: $2

## Interpretación de la lista
- Un rango como T2-T4 se expande (ambos incluidos).
- Las tareas separadas por espacio se ejecutan EN ORDEN, de una en una.
- El carácter "|" separa TANDAS. Las tandas siempre son secuenciales entre sí.
- Dentro de una tanda, las tareas se agrupan con "+" (ej. "T16+T17 | T18"): solo estas
  se lanzan en paralelo, y solo si tú las has agrupado explícitamente.
- Nunca paralelices por tu cuenta.

## Comprobaciones previas (lee solo specs/$1/tasks.md)
1. Si una tarea depende de otra que no está en la lista y no está marcada como hecha,
   avísame y no la lances.
2. Si pides paralelo con "+" y detectas que las tareas tocan los mismos archivos
   (según su sección "Archivos"), avísame y propón ejecutarlas en secuencia. No lances nada.
3. Si el orden pedido viola una dependencia, propón el correcto y espera mi confirmación.

## Ejecución
Para cada tarea (o grupo en paralelo), invoca @implementer con la carpeta, la tarea
y la línea de resumen de la tarea anterior (si existe). Espera su resumen.

Según ESTADO:
- hecha → pasa a la siguiente.
- parcial → PÁRATE. Explica qué quedó hecho y qué falta.
- bloqueada (necesita mi decisión) → PÁRATE. Pásame el informe tal cual lo dio el
  subagente (RF afectado, causa, opciones) y espera mi respuesta. No continúes.
- fallida → PÁRATE, no lances más tareas y explícame el fallo.

Si un grupo paralelo tiene una tarea no "hecha", espera a que terminen las demás del grupo,
no lances tandas posteriores y entrégame todos los resultados.

## Informe final
Tabla: tarea | estado (hecha / parcial / bloqueada / fallida / no iniciada) |
RF | evidencia (e2e / unit) | resultado de tests | commit.
Si queda algo ⚠️ o ❌, dilo antes de la tabla. No des veredictos de "spec cumplida":
eso lo comprueba una verificación aparte.so lo comprueba una verificación aparte.