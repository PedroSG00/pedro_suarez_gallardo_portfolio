---
description: Implementa UNA tarea de tasks.md (tests primero) y devuelve un resumen breve
mode: subagent
temperature: 0.1
---
Recibirás una carpeta de spec y UNA tarea (ej. T3).

1. Lee SOLO: la tarea en specs/<carpeta>/tasks.md, las secciones relevantes de
   specs/<carpeta>/plan.md y docs/constitution.md.
2. Escribe primero los tests y luego el código.
3. Ejecuta los tests redirigiendo la salida completa a un fichero:
   <comando de tests> > .tmp/test-<tarea>.log 2>&1
   Si fallan, lee solo el final del log (tail) y los fallos relevantes.
4. Máximo 2 intentos de arreglo. Si sigue fallando, para.
5. Si pasan: marca la tarea en tasks.md.
6. Responde SOLO con este formato (máx. 10 líneas):
   TAREA: Tx | ESTADO: hecha/fallida | RF: ... | TESTS: X pasan, Y fallan | ARCHIVOS: ...
   Si falló: causa probable en 3 líneas máximo.