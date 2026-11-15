---
description: '/verify <carpeta> · Comprueba RF por RF si la spec está cumplida'
---
Recorre specs/$1/spec.md requisito por requisito.
Para cada uno indica: qué test lo cubre, y el resultado de ejecutarlo.
Si algún RF no está cubierto o falla, dilo claramente. Después comprueba los
criterios de finalización y dame un veredicto: ¿la spec está cumplida?
No modifiques código; solo ejecuta tests e informa.