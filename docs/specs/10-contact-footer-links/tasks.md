# Tareas — Spec 10 Contact y enlaces del Footer

**Fuente:** `docs/specs/10-contact-footer-links/spec.md` y `docs/specs/10-contact-footer-links/plan.md`.

**Regla de trabajo:** tests primero; sin dependencias nuevas; textos en inglés y español en el mismo cambio; no cambiar el comportamiento compartido fuera del alcance de la spec.

**Cierre por tarea:** sus tests y `pnpm lint` y `pnpm typecheck` deben pasar. Si cambia la presentación, añadir `pnpm build`. Si cambia movimiento, fallback sin JavaScript o comportamiento de pestañas, ejecutar los e2e afectados. T8 ejecuta todos los gates de la spec.

## Mapa de tareas

| ID | Tarea | RF | Depende de |
|---|---|---|---|
| T1 | Añadir el contenido bilingüe e integrar Contact en el destino existente | RF-1 | — |
| T2 | Crear y probar la resolución compartida de enlaces | RF-2, RF-3, RF-4, RF-5, RF-8 | — |
| T3 | Mostrar los cuatro canales en Contact | RF-2, RF-3, RF-4, RF-5 | T1, T2 |
| T4 | Alinear el Footer con los enlaces y etiquetas compartidos | RF-2, RF-3, RF-4, RF-5, RF-6, RF-8 | T2, T3 |
| T5 | Aplicar el momento firma y la respuesta accesible del email | RF-3, RF-7 | T3 |
| T6 | Integrar el reveal y verificar movimiento reducido y final de página | RF-7 | T1, T3, T5 |
| T7 | Validar destinos estáticos, CV y fallos de enlaces | RF-5, RF-8 | T2, T3, T4 |
| T8 | Verificar la matriz completa y cerrar los gates | RF-1–RF-8 y NFR | T1–T7 |

## T1 — Añadir contenido bilingüe e integrar Contact

**Estado:** hecha.

**Objetivo:** sustituir el encabezado reservado por la sección Contact con el contenido aprobado en inglés y español.

**RF:** RF-1.

**Depende de:** nada.

**Tests a escribir primero:**

- Con `renderWithIntl` y los mensajes reales, verificar el titular y el texto exactos en inglés.
- Repetir la verificación en español.
- Verificar que Contact conserva un único encabezado de sección, su etiqueta localizada y el número `04`.
- Verificar en la home que Contact aparece una sola vez, después de Stack y en el destino existente.

**Qué debe quedar:**

- Las cadenas aprobadas están en ambos catálogos con claves correspondientes.
- Contact ocupa el destino reservado; no se crea una ruta ni un destino de navegación nuevo.
- La sección no incluye todavía comportamiento de enlaces ni efectos visuales propios de T3–T6.

**Criterio de hecho:** los tests de contenido y de integración pasan en `/en` y `/es`; la sección está en el orden correcto y no duplica encabezado ni destino; lint, typecheck y build pasan.

## T2 — Crear y probar la resolución compartida de enlaces

**Estado:** hecha.

**Objetivo:** resolver etiquetas, destinos, target y aviso accesible a partir del locale y de la ubicación Contact/Footer, sin duplicar datos.

**RF:** RF-2, RF-3, RF-4, RF-5, RF-8.

**Depende de:** nada.

**Tests a escribir primero:**

- Para `en`, resolver email, LinkedIn, GitHub y el CV inglés con las etiquetas inglesas.
- Para `es`, resolver los mismos canales con las etiquetas españolas y el CV español, sin fallback entre idiomas.
- En Contact, LinkedIn, GitHub y CV usan nueva pestaña, pero no reciben `srLabel`.
- En Footer, solo LinkedIn, GitHub y CV reciben el aviso traducido; email permanece en la pestaña actual y no recibe aviso.
- Para URL vacía, omitir el enlace incompleto sin lanzar error; para el CV ausente en un locale, no seleccionar el CV del otro.

**Qué debe quedar:**

- Una función pura compartida por Contact y Footer que recibe locale, ubicación, datos estáticos y etiquetas.
- El orden visual lo determina cada sección; estos tests no convierten un orden no exigido por RF-2 en requisito.
- Ninguna URL ni texto queda duplicado en la UI.

**Criterio de hecho:** todos los casos de la tabla de locales, ubicaciones y entradas incompletas pasan; no hay fallback al CV de otro idioma; lint y typecheck pasan.

## T3 — Mostrar los cuatro canales en Contact

**Estado:** hecha.

**Objetivo:** ofrecer email, LinkedIn, GitHub y CV desde Contact con etiquetas localizadas y comportamiento de apertura acordado.

**RF:** RF-2, RF-3, RF-4, RF-5.

**Depende de:** T1 y T2.

**Tests a escribir primero:**

- Contact contiene los cuatro enlaces en ambos idiomas, con las etiquetas aprobadas (`Email`, `LinkedIn`, `GitHub`, `CV`; `Correo`, `LinkedIn`, `GitHub`, `Currículum`).
- El email tiene como destino la dirección aprobada y permanece visible como texto.
- LinkedIn y GitHub tienen sus destinos aprobados y se activan en pestaña nueva.
- El CV corresponde al locale activo y se activa en pestaña nueva.
- Los nombres accesibles de los enlaces de Contact no incluyen el aviso de nueva pestaña.
- No aparece una acción adicional para copiar el email.

**Qué debe quedar:**

- El componente de Contact presenta los enlaces mediante el resolvedor compartido y el átomo Link.
- Las etiquetas españolas se actualizan en `messages/es.json`; los dos idiomas conservan paridad.
- Los fallos del gestor de correo no ocultan la dirección ni agregan un control de copia.

**Criterio de hecho:** Contact renderiza y navega a los cuatro destinos en inglés y español, no anuncia la nueva pestaña y conserva el email visible; tests de Contact y paridad i18n pasan.

## T4 — Alinear el Footer con los enlaces y etiquetas compartidos

**Estado:** hecha.

**Objetivo:** conservar el Footer existente y garantizar que sus canales y destinos coinciden con Contact, manteniendo el aviso accesible acordado.

**RF:** RF-2, RF-3, RF-4, RF-5, RF-6, RF-8.

**Depende de:** T2 y T3.

**Tests a escribir primero:**

- El Footer conserva email, LinkedIn, GitHub, CV y copyright en ambos idiomas.
- Las etiquetas del Footer coinciden con las aprobadas para cada idioma.
- LinkedIn, GitHub y CV se abren en pestaña nueva y su nombre accesible incluye el aviso localizado; el texto del aviso no se muestra visualmente.
- Email usa el destinatario correcto, no abre una pestaña nueva y no anuncia el aviso.
- El CV corresponde al idioma activo; una URL opcional vacía no rompe los otros enlaces ni el copyright.
- No aparecen controles de tema ni de idioma en el Footer.

**Qué debe quedar:**

- El Footer usa el resolvedor compartido, conserva sus iconos decorativos y su copyright.
- Se conserva la navegación nativa y la protección del enlace a pestaña nueva.
- La estructura del Footer sigue fuera del reveal por scroll.

**Criterio de hecho:** los tests del Footer pasan en inglés y español; los enlaces externos se anuncian solo a tecnologías de asistencia y el resto del Footer sigue disponible ante una URL ausente.

## T5 — Aplicar el momento firma y la respuesta accesible del email

**Estado:** hecha.

**Objetivo:** presentar el email como enlace prominente e invertir su tratamiento visual en hover y foco, sin duplicar el componente de enlace.

**RF:** RF-3, RF-7.

**Depende de:** T3.

**Tests a escribir primero:**

- En navegador, verificar que el email tiene una escala visual claramente superior a los otros enlaces.
- Con puntero compatible, comparar estilos computados del email antes, durante y después de hover; el estado se invierte y vuelve al salir.
- Al llegar con teclado y recibir foco, verificar una respuesta visual equivalente a hover.
- Verificar contraste AA del enlace en tema claro y oscuro.
- En pantallas estrechas y con texto ampliado al 200 %, comprobar que el email sigue legible, activable y sin desbordamiento horizontal.

**Qué debe quedar:**

- El átomo Link acepta una clase de presentación opcional sin cambiar su comportamiento por defecto.
- La presentación específica del email vive en Contact y usa tokens de tema; no se añaden valores mágicos ni colores de acento.
- La dirección sigue siendo texto visible y copiable manualmente.

**Criterio de hecho:** hover y foco producen estados equivalentes y reversibles, el enlace conserva su destino y el contraste y reflujo cumplen los criterios; tests visuales, lint, typecheck y build pasan.

## T6 — Integrar el reveal y verificar fallbacks de movimiento

**Objetivo:** revelar el titular con recorte y conservar visible todo Contact al final de la página, con movimiento reducido y sin JavaScript.

**RF:** RF-7.

**Depende de:** T1, T3 y T5.

**Tests a escribir primero:**

- Con movimiento normal, verificar que el titular está parcialmente revelado al entrar, completo en la zona estable y vuelve a revelar al cambiar su posición.
- Al llegar al final de la página, verificar que todos los bloques de Contact permanecen completamente visibles y no entran en salida.
- Verificar que el Footer queda visible y fuera del reveal.
- Con `prefers-reduced-motion: reduce`, comprobar el titular completo y estático.
- Sin JavaScript, comprobar texto y enlaces completos y utilizables.
- Si Contact ya está visible al cargar, comprobar visibilidad completa desde el primer fotograma.

**Qué debe quedar:**

- Se reutiliza `Reveal` con variante `clip` y la condición de última sección.
- No se añade JavaScript, listener, variante ni sistema de animación nuevo.
- Los tests de movimiento cubren `/en` y `/es`, ambos temas y reduced-motion según el contrato global.

**Criterio de hecho:** las verificaciones de entrada, zona estable, final de página, Footer, movimiento reducido, carga inicial y sin JavaScript pasan; `pnpm test:e2e`, lint, typecheck y build pasan.

- [x] T6 completada.

## T7 — Validar destinos estáticos, CV y fallos de enlaces

**Objetivo:** confirmar que los destinos obligatorios existen y que los errores externos no producen estados o sustituciones incorrectos.

**RF:** RF-4, RF-5, RF-8.

**Depende de:** T2, T3 y T4.

**Tests a escribir primero:**

- Verificar que los dos destinos del CV están presentes y responden correctamente.
- Verificar que el destino inglés contiene el documento inglés y el español contiene el documento español; comprobar legibilidad e integridad de ambos documentos.
- Cambiar el idioma antes de activar el CV y verificar que el enlace apunta a la versión del idioma recién seleccionado.
- Verificar que la ausencia de un destino del CV bloquea la aceptación y no selecciona el documento del otro idioma.
- Verificar los href de LinkedIn y GitHub sin depender de que los servicios externos respondan durante la suite.
- Simular un destino externo inaccesible y comprobar que el resto del portfolio sigue utilizable y que no se muestra una interfaz de error propia.

**Qué debe quedar:**

- Los tests automatizados comprueban disponibilidad y correspondencia de locale de los destinos estáticos.
- La legibilidad e integridad del contenido de cada PDF se revisan como criterio de entrega, sin añadir una dependencia para inspeccionarlo.
- La disponibilidad de perfiles externos no se convierte en requisito de red ni en fallo de render.

**Criterio de hecho:** los dos CV son accesibles, íntegros y del idioma correcto; no hay fallback entre CV; los destinos sociales son los aprobados y un fallo externo no rompe la página. Si falla un CV, la tarea queda bloqueada.

- [x] T7 completada.

## T8 — Verificar la matriz completa y cerrar los gates

**Objetivo:** comprobar trazabilidad y comportamiento integrado de RF-1 a RF-8 en ambos idiomas, temas y condiciones relevantes.

**RF:** RF-1 a RF-8 y requisitos no funcionales.

**Depende de:** T1–T7.

**Tests a escribir primero:** no se añaden tests por cobertura. Antes del cierre se confirma que cada criterio de aceptación ya tiene un test observable escrito antes de su implementación; cualquier hueco real se cubre antes de ejecutar los gates.

**Comprobaciones:**

- Contact y Footer contienen los cuatro canales y sus etiquetas en inglés y español.
- El CV correcto se ofrece para cada locale; Footer conserva el aviso solo para lectores de pantalla y Contact no anuncia la apertura.
- Email, navegación de pestañas, destinos, copyright y errores se comportan como especifica cada RF.
- El titular, la inversión del email, foco, contraste, adaptación, movimiento reducido, final de página y ausencia de JavaScript quedan cubiertos.
- No hay errores de render ni dependencias nuevas; no se baja el umbral del 85 % ni se añaden exclusiones.

**Criterio de hecho:**

- Pasan, en orden, `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`.
- Pasa `pnpm test:e2e` con la cobertura de movimiento y locales requerida.
- Todos los RF tienen evidencia asociada y no quedan fallos de CV, traducciones, accesibilidad o enlaces.

**Evidencia cotejada:**

| RF | Evidencia unitaria | Evidencia E2E (Chromium) |
|---|---|---|
| RF-1 | `Contact.test.tsx`: encabezado, titular y cuerpo exactos en EN/ES; `i18n-parity.test.ts`: mismas claves en ambos idiomas. | `home.spec.ts`: jerarquía y secciones localizadas. |
| RF-2 | `contact-links.test.ts`, `Contact.test.tsx` y `Footer.test.tsx`: cuatro canales con etiquetas y destinos localizados. | `home.spec.ts`: mismo orden y destinos en Contact y Footer en EN/ES. |
| RF-3 | `Contact.test.tsx`, `Footer.test.tsx` y `contact-links.test.ts`: `mailto`, email visible sin copia y sin apertura en otra pestaña. | `home.spec.ts`: destinatario y activación con Enter al 200 % de tamaño de texto. |
| RF-4 | `contact-links.test.ts`, `Contact.test.tsx`, `Footer.test.tsx` y `Link.test.tsx`: destinos, nueva pestaña y aviso accesible según ubicación. | `home.spec.ts`: destino, `target`, `rel` y aviso solo para lectores de pantalla, en ambos idiomas; `contact-destinations.spec.ts`: perfiles y navegación ante un destino inaccesible. |
| RF-5 | `contact-links.test.ts`, `Contact.test.tsx` y `Footer.test.tsx`: CV por idioma, sin sustituir el CV ausente. | `contact-destinations.spec.ts`: respuesta PDF y huella de cada documento revisado, cambio de idioma y 404 sin sustitución; `home.spec.ts`: aviso accesible según ubicación. |
| RF-6 | `Footer.test.tsx`: copyright en EN/ES; se omite si falta sin romper los enlaces. | — |
| RF-7 | `Contact.test.tsx` y `Link.test.tsx`: semántica, nombre accesible y enlace nativo. | `home.spec.ts`: prominencia, inversión en hover y foco, contraste AA y adaptación al 200 %; `contact-motion.spec.ts`: recorte reversible, primer fotograma, final visible sin animar Footer, movimiento reducido y navegación sin JavaScript, en EN/ES y ambos temas. |
| RF-8 | `contact-links.test.ts` y `Footer.test.tsx`: datos vacíos o incompletos sin romper el render de los canales restantes. | `contact-destinations.spec.ts`: 404 sin sustitución y fallo social sin inutilizar la home; `home.spec.ts` e `i18n-routing.spec.ts`: sin errores de página o hidratación. |

**Gates:** `pnpm lint` → `pnpm typecheck` → `pnpm test` (698 pasan, 0 fallan; cobertura global por encima del 85 % en las cuatro métricas) → `pnpm build` → `pnpm test:e2e` (404 pasan, 0 fallan, 1 omitido). La primera ejecución e2e falló en la prueba de scroll al final de `navbar.spec.ts`; la repetición de la suite completa pasó sin cambios de código.

- [x] T8 completada.

## Trazabilidad RF → tareas

| RF | Tareas |
|---|---|
| RF-1 Contenido bilingüe | T1, T8 |
| RF-2 Canales y ubicación | T2, T3, T4, T8 |
| RF-3 Email | T2, T3, T4, T5, T8 |
| RF-4 LinkedIn y GitHub | T2, T3, T4, T7, T8 |
| RF-5 CV localizado | T2, T3, T4, T7, T8 |
| RF-6 Copyright | T4, T8 |
| RF-7 Momento firma y movimiento | T5, T6, T8 |
| RF-8 Fallos y robustez | T2, T4, T7, T8 |
