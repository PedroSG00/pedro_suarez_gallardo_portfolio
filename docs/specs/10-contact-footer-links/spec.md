# Spec 10 — Contact y enlaces del Footer

## Contexto y objetivo

Contact debe facilitar que reclutadores y clientes potenciales inicien una conversación y consulten el CV adecuado. El Footer debe mantener a mano los mismos canales al final de la página.

La experiencia ofrece cuatro vías —email, LinkedIn, GitHub y CV— en inglés y español. El contacto directo se presenta primero; GitHub y el CV son accesos complementarios. El momento firma es un titular editorial de gran escala y un enlace de email prominente que invierte su tratamiento visual al interactuar.

## Usuarios

- Reclutadores que quieren contactar o consultar el CV en el idioma que están leyendo.
- Clientes potenciales que quieren iniciar una conversación por email o LinkedIn.
- Visitantes que quieren consultar GitHub, LinkedIn o el CV.
- Personas que navegan con teclado, lector de pantalla, movimiento reducido o pantallas estrechas.

## Historias de usuario

- Como reclutador, quiero abrir el CV en el idioma actual, para consultar la versión adecuada sin tener que elegirla.
- Como cliente potencial, quiero contactar por email o LinkedIn, para usar el canal que me resulte más cómodo.
- Como visitante, quiero encontrar GitHub, LinkedIn, email y CV tanto en Contact como en el Footer, para acceder a ellos desde cualquiera de las dos zonas.
- Como persona que usa teclado o tecnología de asistencia, quiero reconocer y activar los enlaces y entender cuándo se abre otra pestaña.

## Requisitos funcionales

### RF-1 — Contenido de Contact

**Criterios de aceptación (EARS):**

- Cuando la persona consulte Contact en inglés, el sistema deberá mostrar el titular **“Let's build something solid.”** y el texto **“Tell me what you need. Email or LinkedIn, whichever is easier.”**
- Cuando la persona consulte Contact en español, el sistema deberá mostrar el titular **“Construyamos algo sólido.”** y el texto **“Cuéntame qué necesitas. Por email o LinkedIn, como te resulte más cómodo.”**
- Cuando la persona cambie el idioma del sitio, el sistema deberá mostrar el contenido correspondiente al idioma seleccionado.
- Cuando se muestre el texto introductorio de Contact, deberá presentar email y LinkedIn como vías principales de contacto; GitHub y el CV serán enlaces complementarios, no canales de contacto descritos por ese texto.

### RF-2 — Canales y ubicación

**Criterios de aceptación (EARS):**

- Cuando se muestre Contact, el sistema deberá ofrecer enlaces a email, LinkedIn, GitHub y al CV correspondiente al idioma actual.
- Cuando se muestre el Footer, el sistema deberá ofrecer los mismos cuatro canales.
- Cuando el sitio esté en inglés, el sistema deberá identificar los enlaces como **Email**, **LinkedIn**, **GitHub** y **CV**.
- Cuando el sitio esté en español, el sistema deberá identificar los enlaces como **Correo**, **LinkedIn**, **GitHub** y **Currículum**.
- Cuando una persona identifique o active un enlace, su propósito deberá ser comprensible sin depender únicamente de un icono o del color.

### RF-3 — Email

**Criterios de aceptación (EARS):**

- Cuando la persona active el enlace de email, el sistema deberá delegar la acción al gestor de correo predeterminado, si está disponible, con destinatario `suarezgallardopedro@gmail.com`.
- Si no hay un gestor de correo disponible, la dirección deberá permanecer visible y se podrá copiar manualmente.
- Cuando se muestre el enlace de email, el sistema no deberá añadir una acción independiente para copiarlo ni intentar detectar si hay un gestor configurado.

### RF-4 — LinkedIn y GitHub

**Criterios de aceptación (EARS):**

- Cuando la persona active LinkedIn, el sistema deberá abrir `https://linkedin.com/in/pedro-suarez-gallardo` en una pestaña nueva.
- Cuando la persona active GitHub, el sistema deberá abrir `https://github.com/PedroSG00` en una pestaña nueva.
- Cuando un enlace a LinkedIn o GitHub se muestre en Contact, no deberá mostrar ni anunciar una indicación de que abre una pestaña nueva.
- Cuando un enlace a LinkedIn o GitHub se muestre en el Footer, las tecnologías de asistencia deberán recibir una indicación localizada de que abre una pestaña nueva, sin mostrarla visualmente.
- Si la política del navegador impide abrir una pestaña nueva, el sistema deberá respetar el comportamiento del navegador, sin intentar detectarlo ni ofrecer una alternativa propia.

### RF-5 — CV localizado

**Criterios de aceptación (EARS):**

- Cuando el idioma actual del sitio sea inglés, el enlace al CV deberá conducir a la versión en inglés.
- Cuando el idioma actual del sitio sea español, el enlace al CV deberá conducir a la versión en español.
- Cuando la persona active el enlace al CV desde Contact o el Footer, el documento deberá abrirse en una pestaña nueva.
- Cuando el enlace al CV se muestre en Contact, no deberá mostrar ni anunciar una indicación de que abre una pestaña nueva.
- Cuando el enlace al CV se muestre en el Footer, las tecnologías de asistencia deberán recibir una indicación localizada de que abre una pestaña nueva, sin mostrarla visualmente.
- Cuando la persona cambie el idioma del sitio antes de activar el enlace, el sistema deberá ofrecer el CV del nuevo idioma seleccionado.

### RF-6 — Copyright

**Criterios de aceptación (EARS):**

- Cuando se muestre el Footer, el sistema deberá mostrar **“© 2026 Pedro Suárez Gallardo”**.
- Cuando cambie el idioma del sitio, el copyright deberá conservar el mismo contenido.

### RF-7 — Momento firma y movimiento

**Criterios de aceptación (EARS):**

- Cuando el titular de Contact entre en el viewport con movimiento normal, el sistema deberá revelarlo mediante un efecto de recorte.
- Cuando la persona pase el puntero sobre el email prominente, el sistema deberá invertir su tratamiento visual.
- Cuando la persona enfoque el email mediante teclado, el sistema deberá ofrecer un estado visual equivalente al de hover.
- Cuando la persona prefiera movimiento reducido, el sistema deberá mostrar el titular completo de forma estática y sin depender de una animación.
- Cuando la página cargue con contenido de Contact ya visible, el sistema deberá mostrarlo completo desde el primer fotograma.
- Cuando la persona llegue al final de la página, todos los bloques de Contact deberán permanecer completamente visibles y sin una fase de salida.
- Cuando se muestre el Footer, este deberá permanecer fuera del revelado por scroll y completamente visible.

### RF-8 — Fallos de destinos y documentos

**Criterios de aceptación (EARS):**

- Si un destino externo no está disponible, el sistema deberá conservar el enlace y el fallo no deberá impedir el uso del resto del portfolio.
- Si el CV no está disponible, devuelve un error, está corrupto o contiene la versión de idioma equivocada, la funcionalidad no deberá considerarse terminada.
- Si el navegador no abre una pestaña nueva conforme a su propia política, el sistema no deberá mostrar un error propio ni alterar el destino del enlace.

## Requisitos no funcionales

- **i18n:** todo texto visible deberá estar disponible en inglés y español con contenido equivalente. Las etiquetas de enlaces y las indicaciones para tecnologías de asistencia deberán estar localizadas.
- **Accesibilidad:** enlaces con propósito comprensible, foco visible, uso por teclado y nombres accesibles. El Footer anunciará a tecnologías de asistencia la apertura en una pestaña nueva, sin añadir un aviso visual; Contact no incluirá dicho aviso.
- **Contraste:** el contenido y los estados interactivos deberán mantener contraste AA en los temas claro y oscuro.
- **Movimiento:** con movimiento reducido, el contenido seguirá completo y legible; no dependerá del efecto visual para comunicarse.
- **Sin JavaScript:** el texto, las direcciones y los enlaces seguirán visibles y utilizables.
- **Adaptación:** el titular, el email y los cuatro enlaces deberán seguir siendo legibles y utilizables en pantallas estrechas y con texto ampliado al 200 %, sin desbordamiento horizontal.
- **Rendimiento y robustez:** Contact deberá mostrar su contenido sin depender de la disponibilidad de destinos externos. Un fallo de email, LinkedIn, GitHub o del visor de documentos no deberá impedir leer el resto de la página.

## Casos límite

- No hay un gestor de correo configurado: el enlace delega la acción al comportamiento disponible y la dirección sigue visible para copiarla manualmente; no aparece un control adicional.
- El navegador impide abrir una pestaña nueva: se respeta su comportamiento y el portfolio no intenta detectarlo ni intervenir.
- Los enlaces de Contact que abren una pestaña nueva no muestran ni anuncian un aviso; los enlaces del Footer conservan el anuncio localizado solo para tecnologías de asistencia.
- LinkedIn o GitHub no están disponibles: su destino puede fallar, pero el resto del portfolio sigue funcionando.
- El CV no está disponible, no se puede leer o corresponde al idioma equivocado: la entrega queda bloqueada; no se sustituye por la versión del otro idioma.
- La persona cambia de idioma antes de activar el CV: se ofrece el documento del idioma que esté activo en ese momento.
- Contact está ya en pantalla al cargar: sus bloques se muestran completamente desde el primer fotograma.
- Contact es la última sección: sus bloques no se atenúan al salir; al final de la página todos están completamente visibles.
- Se usa movimiento reducido o no hay JavaScript: el contenido permanece completo, estático y disponible.
- Se usa teclado: el email recibe una respuesta visual equivalente a hover y los enlaces permanecen operables.
- Se usa una pantalla estrecha o texto al 200 %: el contenido se reorganiza sin recortar enlaces ni causar desplazamiento horizontal.

## Fuera de alcance

- Formulario, chat u otro mecanismo para enviar mensajes dentro del sitio.
- Acción adicional para copiar el email o detección de gestores de correo.
- Selector que permita elegir el idioma del CV independientemente del idioma actual del sitio.
- Descarga forzada del CV; el comportamiento acordado es abrir el documento en una pestaña nueva.
- Teléfono, aviso de disponibilidad laboral u otros canales de contacto.
- Analítica o seguimiento de clics en los enlaces.
- Proyectos y enlaces a proyectos.
- Interfaz propia para errores de servicios externos.

## Criterios de finalización

- Contact muestra el titular y el texto aprobados en inglés y español.
- Contact y el Footer ofrecen los cuatro canales con las etiquetas acordadas en cada idioma.
- El email conduce al destinatario aprobado y permanece visible como texto.
- LinkedIn y GitHub conducen a los perfiles aprobados.
- El CV corresponde al idioma activo, abre en una pestaña nueva y su contenido es íntegro y legible.
- Los enlaces de Contact abren en una pestaña nueva sin aviso; los del Footer anuncian ese comportamiento de forma localizada solo para tecnologías de asistencia.
- El titular, el email y el Footer respetan el comportamiento de movimiento, movimiento reducido, navegación por teclado y contraste definido.
- El contenido y los enlaces siguen disponibles sin JavaScript, en ambos temas y en ambos idiomas.
- Los criterios de aceptación se verifican mediante comportamientos observables, no mediante detalles internos de presentación.
- Pasan `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` y `pnpm test:e2e`.

## Dudas abiertas

Ninguna. El aviso de pestaña nueva no se muestra en Contact; el Footer conserva el aviso localizado solo para tecnologías de asistencia.
