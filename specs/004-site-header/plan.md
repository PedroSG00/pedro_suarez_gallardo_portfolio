# 004 — Cabecera y destinos — Plan técnico

- **Estado:** Borrador de planificación
- **Fecha:** 15 de noviembre de 2026
- **Spec fuente:** `specs/004-site-header/spec.md` (revisada el 15 de noviembre de 2026)
- **Constitución:** `docs/constitution.md` (vigente)
- **Depende de:** 003 (base consolidada)
- **Bloquea a:** 005 (portada y proyectos)
- **Alcance:** cabecera, destinos, secciones con titular y ancla, forma definitiva de los controles de tema e idioma.

> Este documento no implementa nada: fija módulos, contratos, algoritmo de validación y orden de trabajo.
> Cada sección declara los RF/RNF que cubre y la tabla de §6.4 cierra la trazabilidad completa.
> Las decisiones que la spec cerró en §9 no se reabren aquí.

## 0. Puntos de la spec que este plan implementa

La revisión de la spec dejó cuatro correcciones ya incorporadas al texto. El plan las trata como contrato, no como propuesta:

| Punto | Dónde vive en la spec | Qué implica en el plan |
|---|---|---|
| Retirada progresiva al bajar y retorno completo al subir | RF-4, caso 10, criterios de finalización y §9 | `transform` proporcional al scroll, tope de una altura, umbral de reversión de 8 px (§1, §3, §5) |
| La etiqueta del tema muestra la opción elegida, no el tema efectivo | RF-6 y casos 1 y 2 | El estado se fija antes del primer pintado y el ciclo se lee de la preferencia, no de la clase efectiva (§2.3, §5) |
| Proyectos se marca con `aria-current="true"` en listado y detalle | RF-5 y caso 20 | Destino de sección con página asociada; nunca `aria-current="page"` (§2.2, §5) |
| Navegación estrecha e idioma con `<details>/<summary>` nativo | RF-2, RF-7 y §9 | Un solo DOM, abierto por CSS en ≥1024 px; JavaScript solo añade cierre (§5) |

---

## 1. Estructura de módulos (RF-1 a RF-8)

```text
app/
├── [locale]/
│   ├── (site)/
│   │   ├── layout.tsx                     # Monta <SiteHeader> y retira la fila de controles heredada (RF-1, RF-6, RF-7)
│   │   ├── page.tsx                       # Portada: héroe + cuatro cascarones de sección (RF-3, RF-5)
│   │   └── projects/page.tsx              # Listado; Proyectos activo (RF-5)
│   ├── not-found.tsx                      # Sin cabecera (RF-1, caso 22)
│   └── layout.tsx                         # Sin cambios: proveedor de idioma y documento (RNF-3, RNF-9)
├── components/
│   ├── SiteHeader/
│   │   ├── SiteHeader.tsx                 # Composición y orden: marca → navegación → idioma → tema (RF-1)
│   │   ├── SiteHeader.test.tsx
│   │   ├── Brand.tsx                      # Nombre completo enlazado al inicio del idioma (RF-1)
│   │   ├── PrimaryNav.tsx                 # Lista de destinos, marca de activo, variante ancha (RF-1, RF-5)
│   │   ├── NavDisclosure.tsx              # <details>/<summary> de navegación en estrecho (RF-2)
│   │   ├── LanguageMenu.tsx               # <details> de idiomas con enlaces nativos (RF-7)
│   │   ├── ThemeToggle.tsx                # Botón único de tres estados (RF-6)
│   │   ├── use-disclosure.ts              # Escape, clic fuera y cierre al elegir; dos consumidores (RF-2, RF-7)
│   │   ├── use-header-shift.ts            # Único escucha de scroll; publica data-header-state (RF-4)
│   │   └── use-active-destination.ts      # Scroll-spy de secciones sobre el mismo frame (RF-5)
│   ├── SectionAnchor/SectionAnchor.tsx    # Titular + id + tabindex="-1"; 005 aporta el contenido (RF-3)
│   └── ThemeProvider/ThemeProvider.tsx    # Sin cambios: aplica tema y escucha otras pestañas (RF-6)
├── navigation/
│   ├── destinations.ts                    # Lista única de destinos tipada (RF-1, RNF-8)
│   ├── destinations.test.ts               # Orden, ids únicos, claves existentes (RF-1)
│   ├── active-destination.ts              # Función pura: métricas → id activo (RF-5)
│   └── active-destination.test.ts
├── theme/
│   ├── boot-script.ts                     # Añade data-theme-choice y la etiqueta del botón (RF-6, RNF-4)
│   └── theme.ts                           # Sin cambios: modelo, storage y evento storage (RF-6, RNF-7)
├── i18n/dictionaries/{en,es}.json          # Claves nuevas de nav, header, themeToggle y languageMenu (RF-8, RNF-9)
└── globals.css                             # --header-height, scroll-margin, foco, reduced-motion, forced-colors (RF-3, RF-4, RF-8)

tests/
├── fixtures/header-cases.json              # Matriz de la racha (§2.4, §3)
├── lib/header-streak.ts                    # Implementación de la racha (§3)
├── lib/header-streak.test.ts
└── e2e/
    ├── header-flow.e2e.ts                  # Presencia, orden, destinos, idioma, tema, sin JS (RF-1, RF-2, RF-6, RF-7)
    ├── header-scroll.e2e.ts                # Retirada/retorno, guardas, movimiento reducido, sin CLS (RF-4)
    └── header-a11y.e2e.ts                  # 320 px, zoom 200 %, 24 px, foco, forced-colors (RF-8, RNF-5)
```

### 1.1 Responsabilidades por módulo

| Módulo | Responsabilidad única | RF/RNF |
|---|---|---|
| `(site)/layout.tsx` | Montar la cabecera solo en páginas reales; la 404 queda fuera. | RF-1, RNF-10 |
| `SiteHeader` | Ordenar marca, navegación, idioma y tema; no conoce textos ni rutas. | RF-1, RNF-8 |
| `Brand` | Enlazar el nombre completo al inicio del idioma activo. | RF-1 |
| `PrimaryNav` | Pintar los destinos como lista y marcar el activo con recurso no cromático. | RF-1, RF-5, RF-8 |
| `NavDisclosure` | Agrupar la navegación en estrecho sin expulsar marca ni controles. | RF-2 |
| `LanguageMenu` | Enlaces nativos por idioma, idioma activo visible, URL equivalente. | RF-7 |
| `ThemeToggle` | Avanzar claro → oscuro → sistema y mostrar opción + acción. | RF-6 |
| `use-disclosure` | Cerrar con Escape, clic fuera y al elegir; no atrapa el foco. | RF-2, RF-7 |
| `use-header-shift` | Un solo escucha de scroll, con rAF y guardas; publica el estado. | RF-4, RNF-4 |
| `use-active-destination` | Calcular y anunciar la sección visible; Inicio al principio. | RF-5 |
| `SectionAnchor` | Titular con `id` y `tabindex="-1"`, extensión mínima y `scroll-margin`. | RF-3 |
| `destinations.ts` | Fuente única de destinos; añadir uno es añadir un dato. | RF-1, RNF-8 |
| `active-destination.ts` | Decidir el id activo a partir de métricas, sin DOM. | RF-5 |
| `boot-script.ts` | Fijar tema efectivo, opción elegida y etiqueta antes del primer pintado. | RF-6, RNF-4 |
| `globals.css` | Altura de cabecera, anclas, foco, movimiento reducido y colores forzados. | RF-3, RF-4, RF-8, RNF-5 |

### 1.2 Fronteras que el plan prohíbe cruzar

- Ningún componente de presentación importa diccionarios ni `get-dictionary`: todo texto llega por props (RF-8, Constitución 3).
- Solo `destinations.ts` declara destinos; ninguna cabecera escribe `href` ni etiquetas a mano (RF-1, RNF-8).
- Solo `LanguageMenu` → `useLocale` escribe la cookie `lang`; solo `theme.ts` y el script de arranque tocan `theme` (RF-6, RF-7, RNF-7).
- Solo `(site)/layout.tsx` monta la cabecera; la 404 y el layout raíz no la heredan (RF-1, RNF-10).
- `active-destination.ts` y el reductor de retirada son puros: ni `window` ni `document` (RF-4, RF-5, testeabilidad).

---

## 2. Modelo de datos JSON con un ejemplo (RF-1, RF-3, RF-6, RF-7, RF-8)

La 004 no introduce base de datos, backend ni dependencias (Constitución 1 y 5). Tiene cuatro contratos de datos: diccionarios, destinos, estado de preferencias y matriz de la racha.

### 2.1 Diccionarios (`app/i18n/dictionaries/{en,es}.json`)

Se retiran `themeSelect.*` y se añaden las claves de la cabecera. `en.json` sigue siendo la fuente del tipo.

```json
{
  "nav": {
    "home": "Inicio",
    "experience": "Experiencia",
    "projects": "Proyectos",
    "stack": "Stack",
    "contact": "Contacto",
    "label": "Navegación principal",
    "menu": "Menú"
  },
  "header": {
    "label": "Cabecera del sitio"
  },
  "themeToggle": {
    "state": { "light": "Claro", "dark": "Oscuro", "system": "Sistema" },
    "aria": {
      "light": "Tema claro. Cambiar a tema oscuro",
      "dark": "Tema oscuro. Cambiar a tema del sistema",
      "system": "Tema del sistema. Cambiar a tema claro"
    }
  },
  "languageMenu": {
    "label": "Idioma",
    "aria": {
      "en": "English. Cambiar idioma",
      "es": "Español. Cambiar idioma"
    }
  }
}
```

Reglas del contrato:

- `nav.stack` es idéntico en ambos idiomas: excepción documentada en la spec (RF-1).
- Los nombres accesibles son **frases completas** (opción + acción, o idioma + acción): el componente elige una y no concatena fragmentos (RF-6, RF-7, RNF-9).
- `themeToggle.state.*` es el texto visible; `themeToggle.aria.*` es el nombre accesible. Ambos cambian juntos (RF-6).
- El nombre de cada idioma en `languages.*` es endónimo y no se traduce (RF-7).
- Paridad tipada: `es.json` se declara `satisfies` sobre el tipo de `en.json`, como en la 003 (RF-8, RNF-9).
- La 003 declara `ThemeSelect` como forma provisional hasta la 004; al implementar esta spec se anota allí como sustituida y se eliminan sus claves.

### 2.2 Destinos (`app/navigation/destinations.ts`)

Los destinos son datos estructurales, no texto: viven en TS tipado y las etiquetas se resuelven por clave. Equivalente serializado:

```json
[
  { "id": "home",       "labelKey": "nav.home",       "sectionId": "inicio",      "page": null },
  { "id": "experience", "labelKey": "nav.experience", "sectionId": "experiencia", "page": null },
  { "id": "projects",   "labelKey": "nav.projects",   "sectionId": "proyectos",   "page": "projects" },
  { "id": "stack",      "labelKey": "nav.stack",      "sectionId": "stack",       "page": null },
  { "id": "contact",    "labelKey": "nav.contact",    "sectionId": "contacto",    "page": null }
]
```

```ts
type Destination = {
  id: 'home' | 'experience' | 'projects' | 'stack' | 'contact';
  labelKey: `nav.${DestinationId}`;
  sectionId: string;                 // ancla en la portada; `inicio` es la parte superior
  page: 'projects' | null;           // página que marca aria-current="true"
};
export const DESTINATIONS = [...] satisfies readonly Destination[];
```

- El orden del array **es** el orden del menú y el de la portada (RF-3).
- `href` se deriva: `#<sectionId>` en la portada, `/<locale>#<sectionId>` fuera de ella; `home` equivale a `#inicio`.
- Único punto de cambio para añadir o quitar un destino (RF-1, RNF-8).
- Validación en test: ids únicos, `sectionId` único, claves existentes en ambos diccionarios, «Stack» idéntico (RF-1, RNF-9).

### 2.3 Estado de preferencias y del documento (RF-6, RF-7, RNF-7)

Sin claves nuevas. La cabecera reutiliza las fuentes de la 003:

| Clave | Almacén | Valores | Escritor único |
|---|---|---|---|
| `theme` | `localStorage` | `light` \| `dark` \| `system` | `ThemeToggle` → `saveTheme` |
| `lang` | cookie | `en` \| `es` | `LanguageMenu` → `useLocale` |

```json
{
  "cookie": { "lang": "es" },
  "localStorage": { "theme": "system" },
  "document": {
    "lang": "es",
    "class": "theme-dark",
    "data-theme-choice": "system",
    "data-header-state": "pinned"
  }
}
```

`data-theme-choice` lo escribe el script de arranque y distingue **opción elegida** de **tema efectivo** (clase `theme-*`): en el ejemplo, la persona eligió «sistema» y el sistema está en oscuro, de modo que la etiqueta dice «sistema» y la cabecera se pinta oscura (RF-6, casos 1 y 2).

### 2.4 Matriz de la racha (`tests/fixtures/header-cases.json`)

Alimenta el algoritmo de §3 y las pruebas de tabla. Cada caso es una secuencia de eventos y el estado observable esperado.

```json
[
  {
    "id": "top-inicial",
    "eventos": [{ "tipo": "scroll", "top": 0, "atMs": 0 }],
    "esperado": { "offset": 0, "visible": true, "activeId": "home", "contentShiftPx": 0 }
  },
  {
    "id": "bajada-con-foco-dentro",
    "eventos": [
      { "tipo": "focusin" },
      { "tipo": "scroll", "top": 720, "atMs": 320 }
    ],
    "esperado": { "offset": 0, "visible": true, "activeId": "experience", "contentShiftPx": 0 }
  },
  {
    "id": "reversion-corta",
    "eventos": [
      { "tipo": "scroll", "top": 900, "atMs": 200 },
      { "tipo": "scroll", "top": 894, "atMs": 260 }
    ],
    "esperado": { "offset": -64, "visible": false, "activeId": "stack", "contentShiftPx": 0 }
  },
  {
    "id": "movimiento-reducido-sobrevenido",
    "eventos": [
      { "tipo": "scroll", "top": 800, "atMs": 180 },
      { "tipo": "reducedMotionChange", "value": true }
    ],
    "esperado": { "offset": 0, "visible": true, "activeId": "stack", "contentShiftPx": 0 }
  }
]
```

---

## 3. Algoritmo de cálculo de racha en pseudocódigo (RF-4, RF-5, RF-8)

**Interpretación de «racha» en este contexto:** racha de continuidad de la cabecera. Cuenta cuántos casos consecutivos de la matriz producen exactamente un estado de cabecera y un destino activo, sin desplazar el contenido y sin saltarse las guardas (foco, desplegable abierto, movimiento reducido, ausencia de JavaScript). Un fallo reinicia la racha y nombra el caso.

```text
ALGORITMO: calcularRachaCabecera(casos: Lista<CasoCabecera>, alturaCabecera: entero)
ENTRADA:
  casos: cada caso con
    - id: string
    - eventos: lista de { tipo, ... }   # scroll, focusin, focusout, openPanel,
                                       # closePanel, reducedMotionChange, resize, load
    - esperado: { offset, visible, activeId, contentShiftPx }
  alturaCabecera: altura real publicada en --header-height
CONSTANTES:
  UMBRAL_INICIO <- 64          # px desde el principio antes de retirar
  UMBRAL_REVERSION <- 8        # px de cambio de sentido necesarios para invertir
  RECORRIDO <- 2 * alturaCabecera   # px de scroll para pasar de 0 a retirada máxima

SALIDA:
  rachaActual, rachaMaxima: entero
  casosFallidos: lista de ids
  primerFallo: id | nulo

ESTADO (inmutable):
  { top, topPrevio, direccion, tUltimo, focoDentro, panelAbierto, reducido,
    offset, activeId, altura, jsActivo }

PROCEDIMIENTO:
  rachaActual <- 0 ; rachaMaxima <- 0 ; casosFallidos <- [] ; primerFallo <- nulo

  PARA cada caso EN casos HACER
    estado <- estadoInicial(alturaCabecera)      # top 0, offset 0, activeId "home", jsActivo
    PARA cada evento EN caso.eventos HACER
      estado <- aplicarEvento(estado, evento)    # función pura
    FIN PARA
    observado <- medir(estado)                   # { offset, visible, activeId, contentShiftPx }

    consistente <- VERDADERO
    SI observado.offset <> caso.esperado.offset ENTONCES consistente <- FALSO
    SI observado.visible <> caso.esperado.visible ENTONCES consistente <- FALSO
    SI observado.activeId <> caso.esperado.activeId ENTONCES consistente <- FALSO
    SI observado.contentShiftPx <> 0 ENTONCES consistente <- FALSO        # invariante global
    SI destinoActivoUnico(estado) ES FALSO ENTONCES consistente <- FALSO   # invariante global
    SI sinJavaScript(estado) Y observado.offset <> 0 ENTONCES consistente <- FALSO

    SI consistente ENTONCES
      rachaActual <- rachaActual + 1
      SI rachaActual > rachaMaxima ENTONCES rachaMaxima <- rachaActual
    SINO
      casosFallidos.agregar(caso.id)
      SI primerFallo = nulo ENTONCES primerFallo <- caso.id
      rachaActual <- 0
    FIN SI
  FIN PARA
  RETORNAR (rachaActual, rachaMaxima, casosFallidos, primerFallo)
FIN ALGORITMO

aplicarEvento(estado, evento):
  SI evento es "load"        -> estadoInicial(altura) con jsActivo = verdadero
  SI evento es "focusin"     -> focoDentro <- verdadero ; offset <- 0
  SI evento es "focusout"    -> focoDentro <- falso
  SI evento es "openPanel"   -> panelAbierto <- verdadero ; offset <- 0
  SI evento es "closePanel"  -> panelAbierto <- falso
  SI evento es "reducedMotionChange"
     -> reducido <- evento.value ; SI reducido ENTONCES offset <- 0
  SI evento es "resize"      -> altura <- nuevaAltura ; offset <- 0 ; sin mover contenido
  SI evento es "scroll" HACER
     delta <- evento.top - estado.top
     SI |delta| >= UMBRAL_REVERSION ENTONCES
        direccion <- (delta > 0) ? "bajando" : "subiendo"
     FIN SI                                   # delta menor: se conserva el último sentido
     topPrevio <- estado.top ; top <- evento.top

     SI top <= 0 ENTONCES offset <- 0 ; activeId <- "home"
     SI NO SI reducido O focoDentro O panelAbierto ENTONCES offset <- 0
     SI NO SI direccion = "subiendo" ENTONCES offset <- 0        # vuelve completa
     SI NO SI top > UMBRAL_INICIO ENTONCES
        progreso <- min(1, (top - UMBRAL_INICIO) / RECORRIDO)    # desvanecido gradual
        offset <- -altura * progreso                             # tope: una altura
     FIN SI
     activeId <- ultimaSeccionCuyoTitularCruzó(top + altura, destinos)
  FIN SI
  RETORNAR estado

COMPLEJIDAD:
  Tiempo: O(n · m), con n casos y m eventos por caso (m acotado por la matriz).
  Espacio: O(f) sobre los casos fallidos.

CRITERIO DE ACEPTACIÓN:
  rachaActual = número de casos  Y  casosFallidos vacía.
  Además, para cada caso: contentShiftPx = 0, un solo destino activo y,
  sin JavaScript, offset = 0 en todos los eventos.

RF CUBIERTOS:
  RF-2 (cierre del desplegable que impide retirar), RF-3 (titular bajo la cabecera),
  RF-4 (retirada progresiva, retorno, guardas y movimiento reducido), RF-5 (destino activo),
  RF-8 (foco no oculto), RNF-4 (sin saltos), RNF-5 (movimiento reducido).
```

La función pura `aplicarEvento` es la misma que consume `use-header-shift` y `use-active-destination`: la racha no prueba una copia del comportamiento, prueba el comportamiento (Constitución 4).

---

## 4. Contrato de la CLI (RNF-1, RNF-2)

La «CLI» son los scripts de `package.json`; no se añade ninguna herramienta nueva (Constitución 1, RNF-2).

### 4.1 Comandos

| Comando | Propósito | Salida esperada | RF/RNF |
|---|---|---|---|
| `pnpm dev` | Desarrollo con cabecera y recarga. | Sitio en `http://localhost:3000`; cabecera en inicio y proyectos, ausente en 404. | Todos |
| `pnpm build` | Build de producción con paridad de diccionarios (`prebuild`). | Build correcto o fallo explícito de paridad. | RF-8, RNF-1 |
| `pnpm start` | Servir el build. | Mismo HTML inicial: marca, destinos, tema y foco. | RNF-1, RNF-4 |
| `pnpm lint` | ESLint. | 0 errores. | RNF-1, RNF-8 |
| `pnpm typecheck` | `tsc --noEmit`. | 0 errores; detecta claves ausentes o sobrantes. | RF-8, RNF-1 |
| `pnpm test` | Vitest + RTL. | Verde, incluida la racha de §3. | RF-1 a RF-8, RNF-1 |
| `pnpm test:e2e` | Playwright, matriz 4 escritorio + 2 móvil de la 003. | Verde. | RF-1 a RF-8, RNF-6 |
| `pnpm exec vitest run app/navigation` | Iterar un grupo. | Solo ese grupo. | RNF-1 |
| `pnpm exec playwright test tests/e2e/header-scroll.e2e.ts` | Iterar el flujo de scroll. | Solo ese flujo. | RF-4 |
| `pnpm test:watch` | Modo watch (pendiente: hoy se usa `pnpm exec vitest`). | — | RNF-1 |

### 4.2 Salidas observables del sistema

| Salida | Descripción | RF/RNF |
|---|---|---|
| `<header role="banner">` + `<nav aria-label>` | Regiones identificables. | RF-1, RF-8 |
| `data-header-state="pinned" \| "retracting" \| "retracted"` | Estado único de retirada, sin cambios si no varía. | RF-4 |
| `aria-current="true" \| "location"` | Destino activo; como máximo uno. | RF-5 |
| `<html data-theme-choice="…">` + `<html class="theme-…">` | Opción elegida y tema efectivo desde el primer pintado. | RF-6, RNF-4 |
| `--header-height` | Altura real publicada; `scroll-margin-top` la consume. | RF-3, RF-4 |
| `Set-Cookie: lang=…` | Solo al elegir idioma. | RF-7, RNF-7 |
| `prefers-reduced-motion` | Cabecera fija, transición 0 ms. | RF-4, RF-8, RNF-5 |
| `forced-colors: active` | Bordes, estados y foco visibles. | RF-8, RNF-5 |

### 4.3 Códigos de salida

| Código | Significado | Acción |
|---|---|---|
| `0` | Lint, tipos, tests, e2e y build en verde. | Ninguna. |
| `1` | Fallo de lint o de tipos (incluida la paridad tipada). | Corregir antes de continuar. |
| `2` | Fallo de tests unitarios, de componentes o de la racha. | Corregir spec o implementación (Constitución 2). |
| `3` | Fallo de build, incluida la paridad de diccionarios. | Corregir diccionarios antes de publicar. |
| `4` | Fallo de e2e en cualquiera de los seis proyectos. | Corregir el flujo afectado. |

### 4.4 Orden obligatorio antes de publicar

```text
pnpm lint → pnpm typecheck → pnpm test → pnpm test:e2e → pnpm build
```

Cualquier código distinto de `0` bloquea la entrega (RNF-1, Constitución 4).

---

## 5. Decisiones técnicas justificadas (y alternativa descartada)

| Decisión | Alternativa descartada | Justificación | RF |
|---|---|---|---|
| Cabecera en `(site)/layout.tsx`, ya existente | Layout raíz, o montarla en cada página | El grupo `(site)` excluye la 404 sin condicionales; montarla por página duplica composición y deriva. | RF-1, RNF-10 |
| Destinos como constante TS tipada + claves i18n | Destinos escritos en JSX; o `navigation.json` leído en ejecución | Añadir un destino es añadir un dato y el typecheck valida `labelKey`; un JSON runtime pierde tipos literales y no aporta nada. | RF-1, RF-3, RNF-8 |
| `<details>/<summary>` para navegación estrecha e idioma | Menú propio con `role="menu"`, `aria-expanded` y captura de foco | Funciona sin JS, no atrapa foco y no añade teclas fuera de alcance; el rol menú exige gestión de foco que multiplica errores. | RF-2, RF-7 |
| Un solo DOM: el `<details>` se fuerza abierto por CSS en ≥1024 px | Dos árboles (uno móvil y otro escritorio) | Evita duplicar enlaces, ids y `aria-current`, que rompen RF-8 y el anuncio del destino activo. | RF-2, RF-8 |
| Panel a ancho completo con fondo opaco, superpuesto | Panel que empuja el contenido | Empujar mueve la marca y el contenido, y provoca saltos en cada apertura. | RF-2, RNF-4 |
| Escucha única de scroll con `requestAnimationFrame` | Dos escuchas (retirada y scroll-spy); o `IntersectionObserver` | Una sola fuente de verdad por frame, sin carreras ni marcas dobles; el cálculo por posiciones es determinista y testeable sin navegador. | RF-4, RF-5, RNF-4 |
| Destino activo = última sección cuyo titular cruzó el borde inferior de la cabecera | `IntersectionObserver` con umbrales y `rootMargin` | Con secciones cortas el observador marca dos o ninguna; la regla posicional siempre da exactamente una y coincide con lo que se ve. | RF-5 |
| Altura real publicada en `--header-height` | Token fijo por punto de ruptura; o 64 px constantes | El titular debe quedar justo debajo; la altura cambia con zoom, tipografía y etiquetas largas. El token fijo se queda corto. | RF-3, RF-4, RF-8 |
| `scroll-margin-top` con respaldo CSS generoso por punto de ruptura | Compensar el scroll por JavaScript | Sin JS el ancla también debe quedar visible; el respaldo cubre el primer frame antes de medir. | RF-3 |
| Foco al titular con `tabindex="-1"` + `focus({ preventScroll: true })` | `scrollIntoView` o interceptar el clic | Mantiene el scroll nativo y el historial, y añade el foco sin control visible; `scrollIntoView` duplica el desplazamiento. | RF-3 |
| Sin JS: ancla nativa y el navegador continúa la lectura | Redirigir a una versión sin anclas | El ancla funciona sola; la mejora añade foco y desplazamiento exacto. | RF-3, RF-5 |
| Retirada por `transform: translateY()` con la cabecera en flujo (`sticky`) | Animar `height`, `top` o `margin`; `position: fixed` | Solo `transform` no recalcula layout: cero desplazamiento de contenido. `fixed` saca la cabecera del flujo y salta al aparecer. | RF-4, RNF-4 |
| Progresiva: el desplazamiento crece con el scroll (tope: una altura) | Umbral binario y `animation-timeline: scroll()` | Libera espacio de forma continua y vuelve entera al subir; la línea de tiempo de scroll no es fiable en los cuatro motores ni permite guardas. | RF-4 |
| Guardas en CSS (`:focus-within`, `:has(details[open])`) + estado del cliente | Solo comprobaciones en JavaScript | Cubre el caso en que el estado y el foco se cruzan en el mismo frame; si `:has()` no existe, quedan el cliente y `:focus-within`. | RF-4 |
| Sentido del scroll con umbral de reversión de 8 px | Cambiar de sentido con cualquier delta | Evita parpadeo con temblor de trackpad o rebote, que es el caso 10. | RF-4 |
| Movimiento reducido: `matchMedia` en vivo + CSS | Consultarlo solo al cargar | El caso 7 exige dejar de retirarse en el momento, sin recargar. | RF-4, RNF-5 |
| Tema: el script de arranque fija `data-theme-choice` y la etiqueta desde el diccionario incrustado | Tres etiquetas alternadas por CSS; o resolver la etiqueta en el cliente | La etiqueta correcta existe antes del primer pintado y el nombre accesible es una frase completa; alternar por CSS obliga a concatenar fragmentos y depende de cómo excluya cada lector los nodos ocultos. | RF-6, RNF-4 |
| Ciclo leyendo la preferencia guardada, no la clase efectiva | Deducir el siguiente estado de `theme-*` | En «sistema» la clase puede ser oscura y el ciclo saltaría un estado. | RF-6 |
| Botón único con texto visible y nombre accesible de frase completa | `<select>` de la 003; iconos o abreviaturas | La 004 cierra la forma del control; un icono no comunica opción ni acción. | RF-6, RF-8 |
| Sin JS el botón de tema queda visible, en «sistema» e inerte | Ocultarlo; o dejar un control que parezca operativo | RF-6 lo exige visible y no promete operación sin script; ocultarlo dejaría un hueco y un control inerte disfrazado engaña. | RF-6 |
| Idioma: enlaces nativos reales, URL equivalente en el servidor | Botones que cambian estado en cliente | Sin JS el enlace ya lleva a la página equivalente; el cliente solo añade cookie, query y fragmento. | RF-7 |
| Marca de activo: bloque invertido + signo tipográfico + `aria-current` | Solo color, o una barra que se desplaza con el scroll | No depende de color, tamaño, posición ni movimiento, como exige RF-5; la barra móvil incumple «no depender del movimiento». | RF-5, RF-8, RNF-5 |
| Proyectos con `aria-current="true"` en listado y detalle | `aria-current="page"` | El destino es una sección de la portada, no la página en la que se está; `page` anunciaría una página que no es. | RF-5 |
| Sin dependencias nuevas: sin Floating UI, focus-trap, Framer ni similares | Librería de menús y animación | Constitución 1 y RNF-2; `<details>` y `transform` cubren el alcance. | RNF-2 |
| Tests primero, con la matriz de §2.4 como fuente compartida | Probar solo end-to-end | La racha corre en milisegundos, nombra el caso que falla y obliga a que la lógica sea pura (Constitución 4). | RNF-1 |

---

## 6. Estrategia de tests (Constitución 4)

Los tests se escriben antes que el código. Se retiran o reescriben los que validan la forma derogada: `ThemeSelect.test.tsx` (selector de la 003), las aserciones de `LanguageSelector.test.tsx` sobre enlaces sueltos y `(site)/layout.test.tsx` sobre la fila de controles.

### 6.1 Tests unitarios (Vitest)

| Grupo | Qué se prueba | RF | Archivo |
|---|---|---|---|
| Retirada | Reductor puro: umbral de inicio, reversión de 8 px, progresión hasta una altura, guardas de foco y panel, movimiento reducido sobrevenido, resize, sin JS. | RF-4 | `app/components/SiteHeader/header-shift.test.ts` |
| Destino activo | Última sección que cruzó el borde inferior; tope en Inicio; secciones cortas; orden del documento. | RF-5 | `app/navigation/active-destination.test.ts` |
| Destinos | Orden = portada, ids y anclas únicos, claves presentes en ambos diccionarios, «Stack» idéntico. | RF-1, RF-3, RNF-9 | `app/navigation/destinations.test.ts` |
| Diccionarios | Paridad de claves nuevas; frases accesibles completas; `themeSelect.*` eliminado. | RF-6, RF-7, RF-8 | `app/i18n/dictionaries/dictionary-parity.test.ts` |
| Arranque del tema | `data-theme-choice` correcto con valor guardado, ausente, inválido y almacenamiento bloqueado. | RF-6, RNF-4 | `app/theme/boot-script.test.ts` |
| Racha | La matriz completa produce `rachaActual = n` y `casosFallidos` vacía. | RF-2 a RF-5 | `tests/lib/header-streak.test.ts` |

### 6.2 Tests de componentes (Vitest + RTL)

| Componente | Qué se prueba | RF | Archivo |
|---|---|---|---|
| `SiteHeader` | Orden marca → navegación → idioma → tema; roles `banner` y `navigation` con nombre; sin textos propios. | RF-1, RF-8 | `app/components/SiteHeader/SiteHeader.test.tsx` |
| `Brand` | Nombre completo; enlace al inicio del idioma activo. | RF-1 | `app/components/SiteHeader/Brand.test.tsx` |
| `PrimaryNav` | Cinco destinos; `aria-current` correcto por ruta; marca no cromática; orden. | RF-1, RF-5 | `app/components/SiteHeader/PrimaryNav.test.tsx` |
| `NavDisclosure` | `<details>` cerrado por defecto; Escape, clic fuera y cierre al elegir; no atrapa foco; etiqueta traducida. | RF-2 | `app/components/SiteHeader/NavDisclosure.test.tsx` |
| `LanguageMenu` | Enlaces nativos con `hreflang`; idioma activo marcado sin color; disparador con el nombre activo; no cambia idioma al abrir. | RF-7 | `app/components/SiteHeader/LanguageMenu.test.tsx` |
| `ThemeToggle` | Ciclo claro → oscuro → sistema; etiqueta y nombre por opción; opción inicial desde el documento; almacenamiento bloqueado; cambio entre pestañas sin mover el foco. | RF-6 | `app/components/SiteHeader/ThemeToggle.test.tsx` |
| `SectionAnchor` | `id`, titular enfocable con `tabindex="-1"`, sin control añadido, extensión mínima. | RF-3 | `app/components/SectionAnchor/SectionAnchor.test.tsx` |

### 6.3 Tests end-to-end (Playwright, 4 escritorio + 2 móvil)

| Flujo | Qué se verifica | RF | Archivo |
|---|---|---|---|
| Cabecera y destinos | Presente en inicio y proyectos, ausente en 404; orden; marca; cinco destinos; navegación por anclas con titular enfocado y visible; salto desde otra página. | RF-1, RF-2, RF-3, RF-5 | `tests/e2e/header-flow.e2e.ts` |
| Scroll | Retirada progresiva al bajar, vuelta completa al subir, umbral de reversión, guardas de foco y desplegable; `contentShiftPx = 0`; movimiento reducido al cargar y activado en vivo; sin JS. | RF-4 | `tests/e2e/header-scroll.e2e.ts` |
| Tema | Etiqueta correcta en el primer pintado sin destello; ciclo; almacenamiento bloqueado; otra pestaña; tema del sistema. | RF-6 | `tests/e2e/theme-flow.e2e.ts` (ampliado) |
| Idioma | Desplegable sin JS; conserva ruta, consulta y fragmento; cookie; enlace directo a otro idioma; dos pestañas. | RF-7 | `tests/e2e/i18n-flow.e2e.ts` (ampliado) |
| Accesibilidad | 320 px y zoom 200 % sin scroll horizontal; objetivos 24×24; foco visible y no tapado; colores forzados; etiquetas en varias líneas; lector de pantalla. | RF-8, RNF-5 | `tests/e2e/header-a11y.e2e.ts` |

### 6.4 Matriz de cobertura RF → secciones del plan

| RF/RNF | Módulos (§1) | Datos (§2) | Racha (§3) | CLI (§4) | Decisión (§5) | Tests (§6) |
|---|---|---|---|---|---|---|
| RF-1 | `(site)/layout`, `SiteHeader`, `Brand`, `PrimaryNav`, `destinations` | 2.1, 2.2 | ✓ | `header`, `nav` | cabecera en `(site)`, datos tipados | 6.1, 6.2, 6.3 |
| RF-2 | `NavDisclosure`, `use-disclosure`, CSS | 2.1 | ✓ | `data-header-state` | `<details>` + CSS ≥1024 | 6.2, 6.3 |
| RF-3 | `SectionAnchor`, portada, `globals.css` | 2.2 | ✓ | `--header-height` | altura real + `scroll-margin` | 6.1, 6.2, 6.3 |
| RF-4 | `use-header-shift`, `globals.css` | 2.4 | ✓ | `data-header-state` | `transform` progresivo, guardas | 6.1, 6.3 |
| RF-5 | `PrimaryNav`, `use-active-destination`, `active-destination` | 2.2 | ✓ | `aria-current` | regla posicional, marca no cromática | 6.1, 6.2, 6.3 |
| RF-6 | `ThemeToggle`, `boot-script`, `theme.ts` | 2.1, 2.3 | — | `data-theme-choice` | etiqueta pregrabada, ciclo por preferencia | 6.1, 6.2, 6.3 |
| RF-7 | `LanguageMenu`, `use-disclosure`, `use-locale` | 2.1, 2.3 | — | `Set-Cookie` | enlaces nativos + URL equivalente | 6.1, 6.2, 6.3 |
| RF-8 | componentes, `globals.css`, diccionarios | 2.1, 2.2 | — | 4.2 | todo por props, frases completas | 6.1, 6.2, 6.3 |
| RNF-1 | todos | — | ✓ | 4.4 | tests primero | 6.3 |
| RNF-2 | — | — | — | — | sin dependencias | — |
| RNF-3 | layouts existentes | — | — | — | sin metadatos nuevos | 6.3 |
| RNF-4 | `boot-script`, `use-header-shift`, CSS | 2.3 | ✓ | `data-header-state` | `transform` sin layout | 6.1, 6.3 |
| RNF-5 | `globals.css`, `ThemeToggle` | — | — | 4.2 | movimiento reducido en vivo | 6.3 |
| RNF-6 | `playwright.config.ts` | — | — | `test:e2e` | matriz 4 + 2 | 6.3 |
| RNF-7 | `theme.ts`, `use-locale` | 2.3 | — | `Set-Cookie` | una fuente por preferencia | 6.1, 6.3 |
| RNF-8 | módulos pequeños | 2.2 | — | `lint` | responsabilidad única | 6.1, 6.2 |
| RNF-9 | diccionarios | 2.1 | — | `typecheck` | paridad tipada | 6.1 |
| RNF-10 | `(site)/layout` | — | — | — | alcance cerrado | — |

### 6.5 Orden de implementación

1. **Contratos rojos:** destinos, diccionarios, reductor de retirada, destino activo y matriz de la racha (RF-1, RF-3 a RF-8).
2. **Estructura:** `SiteHeader` con marca y controles heredados; cabecera en `(site)/layout` y ausencia en 404 (RF-1).
3. **Secciones:** cascarones con titular, ancla, foco y `scroll-margin` (RF-3).
4. **Navegación:** `PrimaryNav`, `<details>` y cierre con JavaScript (RF-2).
5. **Destino activo:** regla posicional, marca no cromática y estados del servidor (RF-5).
6. **Tema:** botón de tres estados, etiqueta pregrabada y sincronización entre pestañas (RF-6).
7. **Idioma:** desplegable nativo, URL equivalente y cookie (RF-7).
8. **Scroll:** retirada progresiva, guardas, movimiento reducido y sin CLS (RF-4).
9. **Accesibilidad y e2e:** 320 px, zoom, foco, colores forzados y seis proyectos (RF-8, RNF-5, RNF-6).

---

## 7. Cumplimiento de la constitución

| Regla | Cómo la cumple este plan |
|---|---|
| 1. Stack mínimo | Solo Next.js, React, TypeScript y Tailwind; `<details>`, CSS y `transform` cubren menús y animación (RNF-2). |
| 2. La spec manda | Cada decisión del plan remite a un RF o a una fila de §9; §0 enumera las cuatro correcciones ya recogidas en la spec. |
| 3. Componentes pequeños y sin datos | Un componente por responsabilidad; la cabecera recibe destinos y textos por props y no importa diccionarios. |
| 4. Tests primero | §6 se escribe antes del código; la racha de §3 valida la lógica pura y los flujos críticos van a Playwright. |
| 5. El contenido vive en el repo | Textos en diccionarios versionados; destinos en una constante; sin backend ni servicios. |
| 6. Inglés en el código, en/es en los textos | Código y tests en inglés, `camelCase` y `SCREAMING_SNAKE_CASE`; toda cadena visible existe en ambos idiomas en el mismo cambio. |
| 7. Minimalismo de alto impacto | La cabecera es una retícula sobria con un solo gesto (bloque invertido del destino activo); movimiento contenido de 150–300 ms, con `prefers-reduced-motion` como estado de primera clase. |

---

## 8. Riesgos abiertos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Medir la altura en JS produce un frame con el ancla torcida | Titular tapado al saltar nada más cargar | Respaldo CSS generoso por punto de ruptura; la medida solo mejora el valor. |
| `:has(details[open])` no disponible | La guarda CSS no aplica | El cliente ya no retira con panel abierto; `:focus-within` cubre el foco. |
| Zoom de texto al 200 % rompe la primera fila | Desbordamiento | Prueba con la traducción más larga; la fila permite varias líneas. |
| Secciones muy cortas en la 005 | Dos destinos activos | La regla posicional garantiza uno solo; la 005 hereda la restricción de extensión mínima. |
| Etiqueta del tema sin JavaScript | Botón visible e inerte | Recogido en RF-6: muestra «sistema» y no opera; se prueba end-to-end con JavaScript desactivado. |
| El script de arranque escribe texto | Riesgo de desajuste al hidratar | La etiqueta se marca `suppressHydrationWarning` y el cliente lee siempre `data-theme-choice`, no el texto. |
