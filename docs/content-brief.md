# Brief de contenido — Portfolio de Pedro Suárez Gallardo

Estado: versión con voz de marca (confianza y seguridad) y sin sección de proyectos. Textos en EN y ES con el mismo sentido.
Reglas: no publicar nombres de empleadores ni el nombre del bootcamp. Las claves de i18n se escriben en inglés. No inventar cifras ni datos personales.
Voz: frases cortas y afirmativas, el beneficio antes que la tecnología, cero relleno. Habla de lo que el visitante obtiene, no de un historial.

---

## 0. Decisiones confirmadas

- No publicar teléfono ni nombres de empleadores. Integraciones descritas genéricamente como plataformas de mensajería y CRM.
- LinkedIn: `https://linkedin.com/in/pedro-suarez-gallardo`.
- No incluir mensajes sobre disponibilidad laboral.
- No mostrar Madrid ni el nivel de inglés B2.
- No hay cifras más exactas; conservar las aproximaciones del CV.
- Foto de perfil: `public/pedro-suarez.png`.
- Los paneles de monitorización no usaban WebSockets.
- Priorizar frontend en el orden del stack. Quitar jQuery y Bootstrap de la lista general.
- Contacto: email y LinkedIn. GitHub se mantiene como enlace.
- CVs disponibles: `public/EN_Pedro_Suarez_Gallardo_CV.pdf` y `public/ES_Pedro_Suarez_Gallardo_CV.pdf`.
- **Sin sección de proyectos por ahora.** Ni sección, ni ruta, ni enlace en navegación, sitemap o metadatos. Queda como futurible (ver sección 10).
- **Sin retórica numérica:** nada de "cien reglas" y similares; solo las aproximaciones del CV.

---

## 1. Hero

| | EN | ES |
|---|---|---|
| Nombre | Pedro Suárez Gallardo | Pedro Suárez Gallardo |
| Rol | Full-stack developer | Desarrollador full-stack |
| Pitch | I build the web products teams rely on: real-time, data-heavy and made to run in production. | Construyo los productos web en los que los equipos confían: en tiempo real, con muchos datos y hechos para funcionar en producción. |
| Línea de apoyo | React, TypeScript and Node.js. | React, TypeScript y Node.js. |
| CTA principal | See what I deliver | Ver lo que entrego |
| CTA secundaria | Let's talk | Hablemos |

Metadatos pequeños para la retícula (mono, opcionales): `3+ YEARS / ES · EN` · `3+ AÑOS / ES · EN`

Momento firma: el nombre ocupa todo el ancho; las líneas suben escalonadas al cargar, con cursor parpadeante. Al hacer scroll pasa a contorno y se desplaza más lento que el resto.

---

## 2. About — `01 / ABOUT` · `01 / SOBRE MÍ`

**Frase de afirmación (bloque invertido)**

- **EN:** I build the parts that are hard to get right.
- **ES:** Me encargo de las partes que cuesta hacer bien.

**EN**

> **Complexity is where I'm calmest.**
>
> Large data sets, live updates, complex forms, and state people can rely on. That is the work teams trust me with—and the work I enjoy most.
>
> I have more than three years of professional experience building and maintaining production web apps with React and TypeScript. I also work on the backend, building REST APIs in several languages and refactoring for speed and clarity.
>
> I understand the problem before I touch it, care about the details, and deliver software that stays maintainable. I use AI tools such as Copilot every day to move faster, and I always review what they produce.
>
> I moved into web development through an intensive bootcamp and keep learning. Spanish is my native language.

**ES**

> **La complejidad es donde estoy más tranquilo.**
>
> Grandes volúmenes de datos, actualizaciones en tiempo real, formularios complejos y estados en los que se puede confiar. Ese es el trabajo que los equipos me confían y que más disfruto.
>
> Tengo más de tres años de experiencia profesional creando y manteniendo aplicaciones web en producción con React y TypeScript. También trabajo en el backend, creando API REST en varios lenguajes y refactorizando para ganar velocidad y claridad.
>
> Entiendo el problema antes de tocarlo, cuido los detalles y entrego software fácil de mantener. Uso herramientas de IA como Copilot a diario para avanzar más rápido y siempre reviso lo que generan.
>
> Me pasé al desarrollo web a través de un bootcamp intensivo y sigo aprendiendo. El español es mi lengua materna.

Valores (etiquetas cortas): *Detail-oriented · Analytical · Autonomous · Teamwork · Continuous learning* / *Detallista · Analítico · Autónomo · Trabajo en equipo · Aprendizaje continuo*

Momento firma: la frase invertida se ilumina palabra a palabra con el scroll.

---

## 3. Work — `02 / WORK` · `02 / TRABAJO`

Titular de la sección: **What I've built.** / **Lo que he construido.**
Tono: titulares descriptivos que nombran lo que es, sin promesas ni adjetivos de marketing. La frase de debajo aporta el dato que lo demuestra. Sin nombres de empleadores ni fechas. Cinco entradas: titular, una frase y tecnologías. Las claves siguen siendo `experience.*`. La mención a IA aparece solo en About.

### 01
- **EN:** **Desktop apps, moved to the web.** I migrated two contact-center applications and redesigned their multilanguage interface. Both are in production and actively maintained.
- **ES:** **Aplicaciones de escritorio, llevadas a la web.** Migré dos aplicaciones de contact center y rediseñé su interfaz multidioma. Ambas están en producción y en mantenimiento activo.
- **Tech:** React, TypeScript

### 02
- **EN:** **A real-time supervision dashboard.** Tracks agent activity live, with customizable views and charts over hundreds of thousands of records.
- **ES:** **Un panel de supervisión en tiempo real.** Sigue la actividad de los agentes al instante, con vistas y gráficas personalizables sobre cientos de miles de registros.
- **Tech:** React, TypeScript

### 03
- **EN:** **An admin suite with dozens of sections.** Custom reporting, plus complex forms and tables with advanced validation.
- **ES:** **Una suite de administración con decenas de secciones.** Informes a medida, y formularios y tablas complejos con validación avanzada.
- **Tech:** React, TypeScript

### 04
- **EN:** **A visual flow editor.** A workflow system for chatbots and voice menus (IVR), plus the frontend of a real-time live chat.
- **ES:** **Un editor visual de flujos.** Un sistema de flujos para chatbots y menús de voz (IVR), y el frontend de un chat en vivo en tiempo real.
- **Tech:** React, TypeScript, WebSockets

### 05
- **EN:** **Integrations and backend APIs.** Messaging and CRM integrations through REST APIs and third-party SDKs, REST APIs in Node.js (Express), C# and PHP, Python automation, and backend refactors for speed and clarity.
- **ES:** **Integraciones y APIs de backend.** Integraciones de mensajería y CRM mediante APIs REST y SDKs de terceros, APIs REST en Node.js (Express), C# y PHP, automatización en Python y refactors del backend para ganar velocidad y claridad.
- **Tech:** Node.js, Express, C#, PHP, Python, REST

Momento firma: cada fila entra con su número tabular; en hover se invierte (crudo ↔ negro).

---

## 4. Stack — `03 / STACK`

- **Titular EN:** The tools I trust. / **ES:** Las herramientas en las que confío.

### Dirección de experiencia propuesta

Presentar el stack como un canvas espectacular e interactivo, no como una lista convencional: las tecnologías aparecen como cartas flotantes con icono y nombre. Un switch permite pasar de 2D a 3D y viceversa; el cambio debe sentirse natural y mantener la continuidad visual de la composición, no reemplazarla por otra escena. En el centro hay un casillero; al llevar una carta hasta él —o seleccionarla mediante una alternativa accesible sin arrastre— se muestra información sobre esa tecnología.

La interacción debe ayudar a entender cómo Pedro usa cada tecnología, no sugerir niveles, puntuaciones ni dominio comparativo. El contenido concreto de esa información se definirá y validará en la spec 09, usando únicamente datos respaldados por el CV y este brief. La experiencia debe conservar una alternativa estática y legible con movimiento reducido o cuando no haya soporte 3D.

### Tecnologías y agrupación aprobadas

Agrupado como en el CV. Sin niveles ni barras de progreso.

| Grupo (EN / ES) | Tecnologías |
|---|---|
| Frontend / Frontend | React, TypeScript, JavaScript, HTML, CSS |
| Backend / Backend | Node.js, Express.js, REST APIs, WebSockets, WebRTC, MySQL, MongoDB, C#, Python, PHP |
| Testing / Testing | Vitest, Playwright |
| Tools / Herramientas | Git, GitHub Copilot, OpenCode |

Prioridad al frontend (React y TypeScript). Sin jQuery ni Bootstrap en la lista general.
Momento firma propuesto: cartas de tecnología flotantes en un canvas que transiciona naturalmente entre los modos 2D y 3D mediante un switch; el casillero central transforma la selección en información útil.

---

## 5. Contact — `04 / CONTACT` · `04 / CONTACTO`

- **Titular EN:** Let's build something solid. / **ES:** Construyamos algo sólido.
- **Texto EN:** Tell me what you need. Email or LinkedIn, whichever is easier.
- **Texto ES:** Cuéntame qué necesitas. Por email o LinkedIn, como te resulte más cómodo.

| Canal | Valor |
|---|---|
| Email | suarezgallardopedro@gmail.com |
| GitHub | https://github.com/PedroSG00 |
| LinkedIn | https://linkedin.com/in/pedro-suarez-gallardo |
| CV (PDF) | EN: `public/EN_Pedro_Suarez_Gallardo_CV.pdf`; ES: `public/ES_Pedro_Suarez_Gallardo_CV.pdf` |

Momento firma: el titular gigante entra con `clip`; el email es un enlace enorme que se invierte en hover.

---

## 6. Footer

- Enlaces: GitHub, LinkedIn, email y CV.
- Copyright EN: `© 2026 Pedro Suárez Gallardo` / ES: igual.

---

## 7. Metadatos SEO (por idioma, solo home)

| | EN | ES |
|---|---|---|
| Título | Pedro Suárez Gallardo — Full-stack developer | Pedro Suárez Gallardo — Desarrollador full-stack |
| Descripción | I build real-time, data-heavy web products with React, TypeScript and Node.js. Portfolio and contact. | Construyo productos web en tiempo real y con muchos datos con React, TypeScript y Node.js. Portfolio y contacto. |

**Imagen OG:** nombre en tipografía masiva, crudo sobre negro, generada desde el propio diseño. La foto `public/pedro-suarez.png` se integrará en About al abrir la spec 07; no se usa en la imagen OG salvo que Pedro lo indique.

---

## 8. Textos de interfaz (Navbar y controles)

Las claves de i18n se escriben en inglés: `nav.about`, `nav.experience`, `nav.stack`, `nav.contact`, `theme.toggle`, `language.change`, `a11y.skipToContent`.

| Clave | EN | ES |
|---|---|---|
| Nav: about | About | Sobre mí |
| Nav: experience | Work | Trabajo |
| Nav: stack | Stack | Stack |
| Nav: contact | Contact | Contacto |
| Cambiar tema | Toggle theme | Cambiar tema |
| Cambiar idioma | Change language | Cambiar idioma |
| Saltar al contenido | Skip to content | Saltar al contenido |

---

## 9. Movimiento (resumen de contenido)

Cada bloque entra al aparecer en pantalla y sale al abandonarla, solo con CSS (ver `AGENTS.md`, "Movimiento"). Con `prefers-reduced-motion` no hay animación y todo es visible. El último bloque de la página no se desvanece.

---

## 10. Futurible: proyectos (aparcado, no publicar)

Cuando haya un proyecto nuevo se recuperará la sección con spec propia (entrada en `content/projects.ts`, ruta `/projects/[slug]`, textos en `messages/`, enlace en navegación, sitemap y metadatos).

**Rambler (placeholder de bootcamp, sin publicar el nombre del bootcamp)**

- Frontend: https://github.com/PedroSG00/rambler-client · Backend: https://github.com/PedroSG00/rambler-server · Sin demo.
- **EN:** A carpooling app with live chat between drivers and passengers. Built as a full-stack bootcamp project: drivers publish trips, passengers join them and both talk in real time with Socket.IO. Routes and locations use the Google Maps API.
- **ES:** Una app de carpooling con chat en vivo entre conductores y pasajeros. Proyecto full-stack de bootcamp: los conductores publican viajes, los pasajeros se unen y ambos hablan en tiempo real con Socket.IO. Las rutas y ubicaciones usan la API de Google Maps.
- Stack: React, Node.js, Express, MongoDB, Socket.IO, Google Maps API, Axios. Capturas pendientes.

---

## 11. Checklist de entrega

- [x] Decisiones editoriales resueltas
- [x] URL de LinkedIn
- [x] Cifras: mantener aproximaciones del CV
- [x] Foto de perfil (`public/pedro-suarez.png`)
- [x] CV en PDF en inglés y castellano en `public/`
- [x] Sección de proyectos aparcada
- [ ] Revisión final de los textos en ambos idiomas
