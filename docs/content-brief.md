# Brief de contenido — Portfolio de Pedro Suárez Gallardo

Estado: borrador actualizado con las decisiones de Pedro. Textos en EN y ES con el mismo sentido.
Reglas: no publicar nombres de empleadores ni el nombre del bootcamp. Las claves de i18n se escriben en inglés. No inventar cifras ni datos personales.

---

## 0. Decisiones confirmadas

- No publicar teléfono ni nombres de empleadores. Mantener las integraciones descritas genéricamente como plataformas de mensajería y CRM.
- LinkedIn: `https://linkedin.com/in/pedro-suarez-gallardo`.
- No incluir mensajes sobre disponibilidad laboral.
- No mostrar Madrid ni el nivel de inglés B2.
- No hay cifras más exactas; conservar las aproximaciones del CV.
- Foto de perfil: `public/pedro-suarez.png`.
- Los paneles de monitorización no usaban WebSockets.
- Rambler es un proyecto placeholder de bootcamp y se quitará cuando haya otro proyecto.
- Priorizar frontend en el orden del stack. Quitar jQuery y Bootstrap de la lista general.
- Contacto: email y LinkedIn. GitHub se mantiene como enlace.
- CVs disponibles: `public/EN_Pedro_Suarez_Gallardo_CV.pdf` y `public/ES_Pedro_Suarez_Gallardo_CV.pdf`. Las capturas de Rambler están pendientes.
- Las claves de mensajes/i18n deben estar en inglés.

---

## 1. Hero

| | EN | ES |
|---|---|---|
| Nombre | Pedro Suárez Gallardo | Pedro Suárez Gallardo |
| Rol | Full-stack developer | Desarrollador full-stack |
| Pitch | I build production web apps with React, TypeScript and Node.js: real-time dashboards, complex workflows and the APIs behind them. | Construyo aplicaciones web en producción con React, TypeScript y Node.js: paneles en tiempo real, flujos complejos y las APIs que los sostienen. |
| CTA principal | See my work | Ver mi trabajo |
| CTA secundaria | Get in touch | Contactar |

Metadatos pequeños para la retícula (mono, opcionales):

- `3+ YEARS / ES · EN`
- `3+ AÑOS / ES · EN`

---

## 2. About

**EN**

> I'm a full-stack developer with more than three years of professional experience building and maintaining production web applications with React and TypeScript.
>
> I'm most comfortable where the frontend meets the hard parts: large data sets, real-time updates, complex forms and state that has to stay predictable. I also work on the backend, designing REST APIs in several languages and refactoring existing code for speed and clarity.
>
> I work autonomously, pay attention to detail and like to understand a problem before touching it. I use AI tools such as Copilot every day for development and refactoring, and I always review what they generate.
>
> I started in sound engineering, switched to web development through an intensive bootcamp, and I keep learning. Spanish is my native language.

**ES**

> Soy desarrollador full-stack con más de tres años de experiencia profesional construyendo y manteniendo aplicaciones web en producción con React y TypeScript.
>
> Me siento más cómodo donde el frontend se encuentra con lo difícil: grandes volúmenes de datos, actualizaciones en tiempo real, formularios complejos y un estado que tiene que seguir siendo predecible. También trabajo en el backend, diseñando APIs REST en varios lenguajes y refactorizando código existente para ganar velocidad y claridad.
>
> Trabajo con autonomía, cuido los detalles y me gusta entender un problema antes de tocarlo. Uso a diario herramientas de IA como Copilot para desarrollar y refactorizar, y reviso siempre lo que generan.
>
> Empecé en ingeniería de sonido, di el salto al desarrollo web con un bootcamp intensivo y sigo aprendiendo. El castellano es mi lengua nativa.

Valores (etiquetas cortas, opcional): *Detail-oriented · Analytical · Autonomous · Teamwork · Continuous learning* / *Detallista · Analítico · Autónomo · Trabajo en equipo · Aprendizaje continuo*

---

## 3. Experience

Se cuenta a través del trabajo, sin nombres de empleadores ni fechas de empleo. Cinco entradas. Cada una: título, resumen de una o dos frases, qué hice y tecnologías.

### 01 · Desktop to web migration / Migración de escritorio a web

- **EN:** I led the migration of two desktop contact-center applications to the web, with a redesigned multilanguage interface. Both are in production and actively maintained.
- **ES:** Lideré la migración de dos aplicaciones de escritorio de contact center a la web, con una interfaz multidioma rediseñada. Ambas están en producción y en mantenimiento activo.
- **Tech:** React, TypeScript

### 02 · Real-time monitoring dashboards / Paneles de monitorización en tiempo real

- **EN:** A supervision application to follow agent activity live, with customizable dashboards and charts over hundreds of thousands of records.
- **ES:** Una aplicación de supervisión para seguir la actividad de los agentes en directo, con paneles y gráficas personalizables sobre cientos de miles de registros.
- **Tech:** React, TypeScript

### 03 · Administration suite / Suite de administración

- **EN:** Dozens of sections for managing the platform: custom reporting, and complex forms and tables with advanced validation.
- **ES:** Decenas de secciones para administrar la plataforma: informes a medida, y formularios y tablas complejos con validación avanzada.
- **Tech:** React, TypeScript

### 04 · Workflow builder and live chat / Editor de flujos y chat en vivo

- **EN:** A workflow system for designing chatbot and voice-menu (IVR) flows, with complex client-side state management, plus the frontend of a real-time live chat.
- **ES:** Un sistema de flujos para diseñar chatbots y menús de voz (IVR), con gestión compleja del estado en cliente, y el frontend de un chat en vivo en tiempo real.
- **Tech:** React, TypeScript, WebSockets

### 05 · Integrations, APIs and performance / Integraciones, APIs y rendimiento

- **EN:** Integrated messaging and CRM platforms through REST APIs and third-party SDKs. Designed REST APIs in Node.js (Express), C# and PHP, wrote Python automation scripts, and refactored backend functions to make them faster and easier to extend.
- **ES:** Integré plataformas de mensajería y CRM mediante APIs REST y SDKs de terceros. Diseñé APIs REST en Node.js (Express), C# y PHP, escribí scripts de automatización en Python y refactoricé funciones del backend para hacerlas más rápidas y fáciles de ampliar.
- **Tech:** Node.js, Express, C#, PHP, Python, REST

**Titular de la sección (EN / ES):** `01 / EXPERIENCE` · `01 / EXPERIENCIA`
La mención al uso de IA aparece solo en About.

---

## 4. Projects

### Rambler (primer proyecto)

| Campo | Valor |
|---|---|
| `slug` | `rambler` |
| Tipo | Proyecto de bootcamp (sin publicar el nombre del bootcamp); placeholder temporal |
| Rol | Proyecto full-stack; no especificar tamaño del equipo ni contribución individual |
| Año | 2022 (según el CV; omitir si no aporta valor al diseño) |
| Frontend | https://github.com/PedroSG00/rambler-client |
| Backend | https://github.com/PedroSG00/rambler-server |
| Demo | No se ha facilitado URL; omitir |
| Imágenes | Pedro tiene capturas; pendiente añadir los archivos al proyecto |

**Resumen corto (tarjeta de la home)**

- **EN:** A carpooling app with live chat between drivers and passengers.
- **ES:** Una app de carpooling con chat en vivo entre conductores y pasajeros.

**Descripción larga (página `/projects/rambler`)**

- **EN:** Rambler is a full-stack carpooling application built as a bootcamp project. Drivers publish trips, passengers find and join them, and both can talk in real time through a live chat powered by Socket.IO. Routes and locations are handled with the Google Maps API.
- **ES:** Rambler es una aplicación full-stack de carpooling creada como proyecto de bootcamp. Los conductores publican viajes, los pasajeros los encuentran y se unen, y ambos pueden hablar en tiempo real mediante un chat en vivo con Socket.IO. Las rutas y ubicaciones se gestionan con la API de Google Maps.

**Stack:** React, Node.js, Express, MongoDB, Socket.IO, Google Maps API, Axios.

Rambler es contenido provisional: se sustituirá cuando haya otro proyecto.

---

## 5. Stack

Agrupado como en el CV. Sin niveles ni barras de progreso.

| Grupo (EN / ES) | Tecnologías |
|---|---|
| Frontend / Frontend | React, TypeScript, JavaScript, HTML, CSS |
| Backend / Backend | Node.js, Express.js, REST APIs, WebSockets, WebRTC, MySQL, MongoDB, C#, Python, PHP |
| Testing / Testing | Vitest, Playwright |
| Tools / Herramientas | Git, GitHub Copilot, OpenCode |

Ordenar el contenido dando prioridad al frontend (React y TypeScript). No incluir jQuery ni Bootstrap en la lista general.

---

## 6. Contact

- **Titular EN:** Let's talk. / **ES:** Hablemos.
- **Texto EN:** The best way to reach me is by email or LinkedIn.
- **Texto ES:** La mejor forma de contactarme es por email o LinkedIn.

| Canal | Valor |
|---|---|
| Email | suarezgallardopedro@gmail.com |
| GitHub | https://github.com/PedroSG00 |
| LinkedIn | https://linkedin.com/in/pedro-suarez-gallardo |
| CV (PDF) | EN: `public/EN_Pedro_Suarez_Gallardo_CV.pdf`; ES: `public/ES_Pedro_Suarez_Gallardo_CV.pdf` |

---

## 7. Footer

- Enlaces: GitHub, LinkedIn, email y CV cuando se añadan los archivos.
- Copyright EN: `© 2026 Pedro Suárez Gallardo` / ES: igual.

---

## 8. Metadatos SEO (por idioma)

| | EN | ES |
|---|---|---|
| Título home | Pedro Suárez Gallardo — Full-stack developer | Pedro Suárez Gallardo — Desarrollador full-stack |
| Descripción home | Full-stack developer specialized in React, TypeScript and Node.js. Portfolio, projects and contact. | Desarrollador full-stack especializado en React, TypeScript y Node.js. Portfolio, proyectos y contacto. |
| Título Rambler | Rambler — Carpooling app with live chat · Pedro Suárez Gallardo | Rambler — App de carpooling con chat en vivo · Pedro Suárez Gallardo |
| Descripción Rambler | A full-stack carpooling app built with React, Node.js, MongoDB and Socket.IO. | Una app full-stack de carpooling con React, Node.js, MongoDB y Socket.IO. |

**Imagen OG:** propuesta: nombre en tipografía masiva, crudo sobre negro, generada desde el propio diseño. La foto de perfil se incluirá en la web; no se usará en la imagen OG salvo que Pedro lo indique.

---

## 9. Textos de interfaz (Navbar y controles)

Las claves de i18n se escribirán en inglés. Ejemplos: `nav.about`, `nav.experience`, `theme.toggle`, `language.change`, `a11y.skipToContent`, `projects.backToProjects`, `projects.viewCode`.

| Clave | EN | ES |
|---|---|---|
| Nav: about | About | Sobre mí |
| Nav: experience | Experience | Experiencia |
| Nav: projects | Projects | Proyectos |
| Nav: stack | Stack | Stack |
| Nav: contact | Contact | Contacto |
| Cambiar tema | Toggle theme | Cambiar tema |
| Cambiar idioma | Change language | Cambiar idioma |
| Saltar al contenido | Skip to content | Saltar al contenido |
| Volver | Back to projects | Volver a proyectos |
| Ver código | View code | Ver código |

---

## 10. Checklist de entrega

- [x] Decisiones editoriales de la sección 0 resueltas
- [x] URL de LinkedIn
- [x] Cifras exactas: no disponibles; mantener aproximaciones del CV
- [x] Añadir foto de perfil (`public/pedro-suarez.png`)
- [ ] Añadir capturas de Rambler
- [x] Añadir CV en PDF en inglés y castellano a `public/`
- [ ] Revisión final de los textos en ambos idiomas
