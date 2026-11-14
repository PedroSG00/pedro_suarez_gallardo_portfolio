# 003 — Consolidación de la base — Plan técnico

**Estado:** Borrador de planificación
**Fecha:** 14 de noviembre de 2026
**Spec fuente:** `specs/003-base-consolidation/spec.md` (estado: Activo)
**Constitución:** `docs/constitution.md` (vigente)
**Alcance:** refactor de la base, enrutado determinista, pantalla de error, metadatos por idioma y suite de pruebas alineada con la spec.

> Este documento no implementa nada: fija módulos, contratos y orden de trabajo. Cada sección indica los RF/RNF que cubre. Las decisiones que la spec ya cerró se respetan sin reabrirse.

---

## 1. Estructura de módulos

```text
proxy.ts                                  # Resolución de idioma y canonicalización (RF-3, RF-5)
app/
├── [locale]/
│   ├── layout.tsx                        # Layout raíz por idioma: <html lang>, script de arranque de tema,
│   │                                     # ThemeProvider sin control visible, diccionario (RF-1, RF-4, RF-6, RNF-3)
│   ├── (site)/
│   │   ├── layout.tsx                    # Controles visibles: LanguageSelector + ThemeSelect (RF-4, RF-6)
│   │   ├── page.tsx                      # Inicio por idioma + generateMetadata (RNF-3)
│   │   └── projects/
│   │       └── page.tsx                  # Listado por idioma + generateMetadata (RNF-3)
│   ├── not-found.tsx                     # Pantalla 404 sin cabecera ni controles (RF-7)
│   └── [...rest]/
│       └── page.tsx                      # Cualquier ruta desconocida bajo idioma válido → notFound() (RF-5, RF-7)
├── i18n/
│   ├── config.ts                         # locales, defaultLocale, LOCALE_COOKIE, max-age (RF-3, RF-4)
│   ├── resolve-locale.ts                 # Resolvedor único: cookie → Accept-Language → en (RF-3)
│   ├── storage.ts                        # Lectura/escritura de cookie y localStorage con try/catch (RF-3, RF-4, RNF-7)
│   ├── get-dictionary.ts                 # Carga del diccionario del idioma, sin fusión de respaldo (RF-1)
│   ├── translate.ts                      # createT: resuelve claves, falla en vez de devolver la clave (RF-1)
│   ├── locale-provider.tsx               # Contexto de idioma y textos; no escribe la cookie (RF-1, RF-4)
│   ├── use-locale.ts                     # Hook de cambio de idioma: navegación + escritura única (RF-4)
│   └── dictionaries/
│       ├── en.json                       # Diccionario base (RF-1, RNF-8, RNF-9)
│       ├── es.json                       # Diccionario tipado con satisfies sobre typeof en (RF-1)
│       └── dictionary-parity.test.ts     # Paridad de claves y tipos (RF-1, RNF-8)
├── components/
│   ├── LanguageSelector/
│   │   └── LanguageSelector.tsx          # Enlaces nativos por idioma; único punto de escritura (RF-4)
│   ├── ThemeProvider/
│   │   └── ThemeProvider.tsx             # Aplica y sincroniza el tema; sin control visible (RF-6)
│   └── ThemeSelect/
│       └── ThemeSelect.tsx               # <select> nativo siempre visible hasta la 004 (RF-6)
├── lib/
│   └── theme.ts                          # Modelo de tema, storage y evento storage (RF-6)
├── globals.css                           # Tokens, foco, movimiento reducido, color-scheme (RF-9, RNF-4, RNF-5)
└── not-found.tsx                         # (si el framework lo exige) 404 global mínima (RF-7)

tests/
└── e2e/
    ├── i18n-flow.e2e.ts                  # Idioma, URL, historial, sin JS (RF-3, RF-4, RF-8)
    ├── theme-flow.e2e.ts                 # Tema, persistencia, pestañas, sin destello (RF-6)
    ├── routing.e2e.ts                    # Canonicalización, 308, variantes y 404 (RF-5, RF-7)
    ├── not-found.e2e.ts                  # Pantalla 404, idioma, enlaces, metadatos (RF-7, RNF-3)
    └── accessibility.e2e.ts              # Foco, objetivos, zoom, reduced motion (RF-9, RNF-5)
```

### 1.1 Responsabilidades por módulo

| Módulo | Responsabilidad única | RF/RNF |
|---|---|---|
| `proxy.ts` | Decidir entre pasar, redirigir (308) o reescribir a la ruta 404; nunca decidir el contenido de una página. | RF-3, RF-5 |
| `app/[locale]/layout.tsx` | Fijar `<html lang>`, ejecutar el script de arranque del tema y montar el proveedor de tema y el de idioma sin controles visibles. | RF-1, RF-4, RF-6, RNF-3 |
| `app/[locale]/(site)/layout.tsx` | Montar los controles visibles (idioma y tema) solo en páginas reales. | RF-4, RF-6 |
| `app/[locale]/not-found.tsx` | Componer la pantalla 404 bilingüe, sin cabecera ni controles, con enlaces de salida. | RF-7, RF-9, RNF-3 |
| `app/[locale]/[...rest]/page.tsx` | Convertir cualquier ruta desconocida bajo un idioma válido en `notFound()`. | RF-5, RF-7 |
| `app/i18n/resolve-locale.ts` | Único resolvedor de idioma: cookie válida → `Accept-Language` → inglés. | RF-3 |
| `app/i18n/storage.ts` | Único acceso a cookie y `localStorage`, tolerante a bloqueo y cuota. | RF-3, RF-4, RNF-7 |
| `app/i18n/get-dictionary.ts` | Entregar el diccionario del idioma sin fusión de respaldo. | RF-1 |
| `app/i18n/translate.ts` | Resolver claves; un fallo es un error de comprobación, no un texto de interfaz. | RF-1 |
| `app/i18n/locale-provider.tsx` | Distribuir idioma y textos; no escribe preferencias. | RF-1, RF-4 |
| `app/i18n/use-locale.ts` | Navegar a la URL equivalente y escribir la cookie una sola vez. | RF-4 |
| `LanguageSelector` | Renderizar enlaces nativos por idioma y persistir la elección. | RF-4, RF-8 |
| `ThemeProvider` | Aplicar el tema efectivo y escuchar cambios entre pestañas; no renderiza controles. | RF-6 |
| `ThemeSelect` | `<select>` nativo siempre visible con etiquetas del diccionario. | RF-6, RF-9 |
| `app/lib/theme.ts` | Modelo y persistencia del tema; único lector tras el arranque. | RF-6 |
| `app/globals.css` | Tokens, foco, contraste, `prefers-reduced-motion` y `color-scheme`. | RF-9, RNF-4, RNF-5 |
| `playwright.config.ts` | Matriz de 4 escritorio + 2 móvil. | RNF-6 |
| Diccionarios + test de paridad | Mismo juego de claves y valores tipados. | RF-1, RNF-8, RNF-9 |

### 1.2 Fronteras que el plan prohíbe cruzar

- Ningún componente de presentación importa `get-dictionary`, `resolve-locale` ni `storage` (RF-1, Constitución 3).
- Ningún módulo distinto de `use-locale.ts` y `LanguageSelector` escribe la cookie `lang` (RF-4).
- Ningún módulo distinto de `theme.ts` y del script de arranque toca la clave `theme` (RF-6).
- `proxy.ts` no compone HTML ni elige textos: solo decide el destino (RF-2, RF-5).

---

## 2. Modelo de datos JSON con un ejemplo

La 003 no introduce base de datos ni backend (Constitución 5). Tiene tres contratos de datos: diccionarios, preferencias del navegador y la matriz de casos que alimenta los tests de enrutado.

### 2.1 Diccionarios (`app/i18n/dictionaries/*.json`)

**Esquema (derivado de `en.json`, RF-1):**

```text
Dictionary = {
  nav:        { home, projects, cv, contact, language }
  languages:  { en, es }                    # endónimos, no traducibles
  sections:   { hero: { title, role }, about: { title } }
  metadata:   { home: { title, description }, projects: { title, description } }
  common:     { notFound, back, copyright } # notFound y back reservadas para la 404
  themeSelect:{ label, option: { light, dark, system } }  # reservadas para la 004
}
```

**Ejemplo (`es.json`, recortado):**

```json
{
  "nav": { "home": "Inicio", "projects": "Proyectos", "cv": "CV", "contact": "Contacto", "language": "Idioma" },
  "languages": { "en": "English", "es": "Español" },
  "metadata": {
    "home": { "title": "Pedro Suárez Gallardo — Desarrollador web", "description": "Portfolio y currículum…" },
    "projects": { "title": "Proyectos — Pedro Suárez Gallardo", "description": "Selección de proyectos…" }
  },
  "common": { "notFound": "Página no encontrada", "back": "Volver", "copyright": "© Pedro Suárez Gallardo" },
  "themeSelect": { "label": "Tema", "option": { "light": "Claro", "dark": "Oscuro", "system": "Sistema" } }
}
```

**Reglas del contrato:**

- `en.json` es la fuente del tipo: `es.json` se declara `satisfies typeof en` (RF-1).
- `themeSelect.*`, `common.notFound` y `common.back` están reservadas: hoy solo las usan la 404 y la 004, pero no se eliminan (RF-8).
- `modalInfoJSDisabled.*` y las claves de estado del revelado se eliminan del modelo (RF-1, RF-8).
- `languages.*` y los nombres de tecnologías son datos, no texto traducible (RF-1).

### 2.2 Preferencias del navegador (RF-3, RF-4, RF-6, RNF-7)

| Clave | Almacén | Tipo | Valores | Escritor único |
|---|---|---|---|---|
| `theme` | `localStorage` | string | `"light" \| "dark" \| "system"` | `ThemeSelect` → `saveTheme` |
| `lang` | cookie | string | `"en" \| "es"` | `LanguageSelector` → `useLocale` |
| `lang` (legado) | `localStorage` | string | `"en" \| "es"` | Solo lectura una vez; se borra tras migrar |

**Cookie `lang`:**

```text
lang=es; Path=/; Max-Age=31536000; SameSite=Lax
```

**Ejemplo de estado coherente:**

```json
{
  "cookie": { "lang": "es" },
  "localStorage": { "theme": "dark" },
  "html": { "lang": "es", "class": "theme-dark" }
}
```

**Ejemplo de estado legado que se migra:**

```json
{
  "cookie": {},
  "localStorage": { "theme": "system", "lang": "es" }
}
```

Resultado tras la primera petición: cookie `lang=es`, `localStorage.lang` eliminado, `theme` intacto.

### 2.3 Matriz de casos de enrutado (`tests/fixtures/routing-cases.json`)

Alimenta el algoritmo de racha y las pruebas de tabla (RF-5, RF-7).

```json
[
  {
    "id": "root-es-cookie",
    "url": "/",
    "cookieLang": "es",
    "legacyLang": null,
    "acceptLanguage": "en-US,en;q=0.9",
    "expectedStatus": 308,
    "expectedLocale": "es",
    "expectedLocation": "/es"
  },
  {
    "id": "trailing-slash",
    "url": "/en/projects/",
    "cookieLang": null,
    "legacyLang": null,
    "acceptLanguage": null,
    "expectedStatus": 308,
    "expectedLocale": "en",
    "expectedLocation": "/en/projects"
  },
  {
    "id": "uppercase-locale",
    "url": "/ES",
    "cookieLang": null,
    "legacyLang": null,
    "acceptLanguage": "es-ES",
    "expectedStatus": 404,
    "expectedLocale": "es",
    "expectedLocation": null
  }
]
```

---

## 3. Algoritmo de cálculo de racha en pseudocódigo

**Interpretación de «racha» en este contexto:** racha de resolución determinista. Cuenta cuántos casos consecutivos de la matriz se resuelven con una sola fuente de verdad y con el resultado esperado, sin mecanismos duplicados ni respaldos en tiempo de ejecución. Sirve para detectar regresiones en el enrutado y en la consolidación (RF-2, RF-5).

```text
ALGORITMO: calcularRachaResolucionDeterminista(casos: Lista<CasoRuta>)
ENTRADA:
  casos: lista de casos, cada uno con:
    - id: string
    - url: string
    - cookieLang: string | nulo
    - legacyLang: string | nulo
    - acceptLanguage: string | nulo
    - expectedStatus: 200 | 308 | 404
    - expectedLocale: "en" | "es"
    - expectedLocation: string | nulo
    - unicoResolvedor: booleano
    - unicoEscritor: booleano
    - sinRespaldoRuntime: booleano
    - sinTextoHardcodeado: booleano
    - paridadClaves: booleano

SALIDA:
  rachaActual: entero
  rachaMaxima: entero
  casosFallidos: lista de IDs

PROCEDIMIENTO:
  rachaActual <- 0
  rachaMaxima <- 0
  casosFallidos <- lista vacía

  PARA cada caso EN casos HACER
    observado <- resolverCaso(caso)          # usa proxy.ts + resolve-locale.ts
    consistente <- VERDADERO

    SI caso.unicoResolvedor ES FALSO ENTONCES consistente <- FALSO
    SI caso.unicoEscritor ES FALSO ENTONCES consistente <- FALSO
    SI caso.sinRespaldoRuntime ES FALSO ENTONCES consistente <- FALSO
    SI caso.sinTextoHardcodeado ES FALSO ENTONCES consistente <- FALSO
    SI caso.paridadClaves ES FALSO ENTONCES consistente <- FALSO

    SI observado.status <> caso.expectedStatus ENTONCES consistente <- FALSO
    SI observado.locale <> caso.expectedLocale ENTONCES consistente <- FALSO
    SI caso.expectedLocation <> nulo Y observado.location <> caso.expectedLocation
      ENTONCES consistente <- FALSO
    FIN SI

    SI consistente ES VERDADERO ENTONCES
      rachaActual <- rachaActual + 1
      SI rachaActual > rachaMaxima ENTONCES rachaMaxima <- rachaActual
    SINO
      casosFallidos.agregar(caso.id)
      rachaActual <- 0
    FIN SI
  FIN PARA

  RETORNAR (rachaActual, rachaMaxima, casosFallidos)
FIN ALGORITMO

COMPLEJIDAD:
  Tiempo: O(n) sobre el número de casos.
  Espacio: O(m) sobre el número de casos fallidos.

CRITERIO DE ACEPTACIÓN:
  rachaActual = número de casos  Y  casosFallidos está vacía.
  Cualquier fallo reinicia la racha y nombra el caso, lo que hace visible
  la regresión sin ambigüedad.

RF CUBIERTOS:
  RF-2 (un solo mecanismo), RF-3 (resolución inicial), RF-5 (canonicalización),
  RF-7 (404 por variante), RF-8 (enlaces y preferencias antiguas),
  RNF-7 (una fuente por preferencia), RNF-8 (mantenibilidad).
```

---

## 4. Contrato de la CLI

La «CLI» del proyecto son los scripts de `package.json`; no se añade ninguna herramienta nueva (RNF-2, Constitución 1). Todos se ejecutan con `pnpm`.

### 4.1 Comandos

| Comando | Propósito | Salida esperada | RF/RNF |
|---|---|---|---|
| `pnpm dev` | Servidor de desarrollo con proxy y recarga. | Sitio en `http://localhost:3000`; redirecciones y 404 visibles. | Todos |
| `pnpm build` | Build de producción. Incluye la comprobación de paridad de diccionarios. | Build correcto o fallo explícito de paridad. | RF-1, RNF-1, RNF-3 |
| `pnpm start` | Servir el build. | Mismas rutas y cabeceras que en producción. | RNF-1 |
| `pnpm lint` | ESLint sobre el código. | 0 errores. | RNF-1, RNF-8 |
| `pnpm typecheck` | `tsc --noEmit`. Detecta claves ausentes o sobrantes en `es.json`. | 0 errores. | RF-1, RNF-1 |
| `pnpm test` | Vitest + RTL: unidad, componentes y paridad. | Todos los tests en verde. | RF-1 a RF-9, RNF-8 |
| `pnpm test:e2e` | Playwright: 4 escritorio + 2 móvil. | Todos los flujos en verde. | RF-3 a RF-9, RNF-6 |

### 4.2 Salidas observables del sistema

| Salida | Descripción | RF/RNF |
|---|---|---|
| `308` + `Location` | Barra final y raíz sin idioma redirigen a la forma canónica conservando query. | RF-3, RF-5 |
| `404` + pantalla propia | Variantes inválidas, idioma no soportado y rutas desconocidas. | RF-5, RF-7 |
| `Set-Cookie: lang=…` | Solo al elegir idioma en el control. | RF-4, RNF-7 |
| `<html lang="…">` | Idioma del documento coherente con el contenido. | RF-3, RF-4, RNF-3 |
| `<html class="theme-…">` | Tema efectivo desde el primer frame. | RF-6, RNF-4 |
| `<link rel="canonical">` y `hreflang` | Canónica propia, `en`, `es` y `x-default` → `/en`. | RNF-3 |
| `noindex` en la 404 | Sin canonical ni alternativas. | RF-7, RNF-3 |

### 4.3 Códigos de salida

| Código | Significado | Acción |
|---|---|---|
| `0` | Todo en verde: lint, tipos, tests, e2e y build. | Ninguna. |
| `1` | Fallo de lint o de tipos (incluida la paridad tipada). | Corregir antes de continuar (Constitución 4). |
| `2` | Fallo de tests unitarios, de componentes o de paridad. | Corregir spec o implementación (Constitución 2, 4). |
| `3` | Fallo de build, incluida la paridad de diccionarios en `pnpm build`. | Corregir diccionarios antes de publicar. |
| `4` | Fallo de e2e en cualquiera de los seis proyectos. | Corregir el flujo afectado. |

### 4.4 Orden obligatorio antes de publicar

```text
pnpm lint  →  pnpm typecheck  →  pnpm test  →  pnpm test:e2e  →  pnpm build
```

Si cualquiera devuelve un código distinto de `0`, no se publica. El build es el último gate porque incluye la paridad (RNF-1, RF-1).

---

## 5. Decisiones técnicas justificadas (y alternativa descartada)

| Decisión | Alternativa descartada | Justificación | RF |
|---|---|---|---|
| Cookie `lang` como única fuente de idioma | Persistencia dual cookie + `localStorage` | Elimina la contradicción entre dos fuentes y cumple RNF-7; el servidor solo puede leer la cookie. | RF-3, RF-4, RNF-7 |
| Migrar `localStorage.lang` una vez y borrarlo | Ignorarlo o mantenerlo como respaldo permanente | Conserva la preferencia de visitantes anteriores (RF-8) sin reintroducir la duplicación. | RF-8, RNF-7 |
| Redirección permanente `308` | `301` o `307` | Conserva el método y la query, y es cacheable; `301` puede degradar a GET y `307` no es permanente. | RF-5 |
| Tabla única de precedencia en `proxy.ts` | Reglas dispersas entre proxy y páginas | Un solo punto decide pasar, redirigir o 404; evita respuestas contradictorias para `/es/`, `/ES` o `/projects/en`. | RF-2, RF-5 |
| Script inline síncrono en `<head>` como único lector del tema | Solo el proveedor cliente, o dos lectores declarados | Elimina el destello sin duplicar el mecanismo: el proveedor lee la clase del documento. | RF-6, RNF-4 |
| `<select>` nativo siempre visible en la 003 | Mantener el botón que revela el selector | Cumple la decisión cerrada de que el revelado desaparece, sin adelantar el botón de tres estados de la 004. | RF-6, RF-8 |
| Layout de 404 fuera del grupo `(site)` | Heredar el layout raíz con controles | La 404 no debe llevar cabecera ni selector; el grupo `(site)` aísla los controles de las páginas reales. | RF-7 |
| `x-default` → `/en` | `x-default` → `/` | `/` redirige según cookie y navegador; `/en` es estable y rastreable. | RNF-3 |
| `es.json` con `satisfies typeof en` | `Record<string, unknown>` + test de paridad | El typecheck detecta claves ausentes y sobrantes antes de ejecutar tests. | RF-1 |
| Paridad comprobada en `pnpm build` y `pnpm test` | Solo en tests, o solo en CI | El build falla antes de publicar y no depende de un CI que está fuera de alcance. | RF-1, RNF-1 |
| 4 escritorio + 2 móvil en Playwright | 8 proyectos (4 + 4) o 2 + 2 | Cubre los cuatro motores y los dos móviles relevantes sin duplicar cada motor en móvil. | RNF-6 |
| `notFound()` desde `[...rest]` | Reescribir a una URL fija de error | Mantiene la URL solicitada sin repetirla en pantalla y conserva el idioma resuelto. | RF-5, RF-7 |
| `ThemeProvider` separado de `ThemeSelect` | Un solo componente que aplica el tema y renderiza el control | Permite montar el tema en la 404 sin montar el control, y deja el control listo para la 004. | RF-6, RF-7 |
| Sin fusión de diccionarios en tiempo de ejecución | `deepMerge(en, locale)` con respaldo | La mezcla de idiomas era el defecto; la paridad se garantiza en compilación. | RF-1, RNF-9 |
| Matriz de casos en JSON + test de tabla | Pruebas e2e una a una | Hace explícita la tabla de precedencia y permite ejecutar la racha sin navegador. | RF-2, RF-5 |

---

## 6. Estrategia de tests (Constitución 4)

Los tests se escriben antes que el código. Se eliminan o reescriben los que validan el comportamiento derogado: `i18n-flow.e2e.ts` T10 (doble persistencia y ausencia de recarga) y `theme-flow.e2e.ts` (botón que revela el selector).

### 6.1 Tests unitarios (Vitest)

| Grupo | Qué se prueba | RF | Archivo |
|---|---|---|---|
| Resolución de idioma | Cookie válida, inválida, vacía y duplicada; `Accept-Language` con pesos, comodín, `q=0`, empate y valores malformados; orden cookie → navegador → inglés. | RF-3 | `app/i18n/resolve-locale.test.ts` |
| Migración de legado | `localStorage.lang` se lee una vez, resuelve, escribe cookie y se borra; no se toca si ya hay cookie. | RF-3, RF-8 | `app/i18n/storage.test.ts` |
| Diccionarios | Mismo juego de claves y tipos; `es.json` falla el typecheck si falta o sobra una clave. | RF-1, RNF-8 | `app/i18n/dictionaries/dictionary-parity.test.ts` |
| Traducción | `createT` resuelve notación de puntos y falla de forma explícita ante una clave ausente. | RF-1 | `app/i18n/translate.test.ts` |
| Tema | Lectura/escritura, valor inválido, almacenamiento bloqueado, cuota llena, `storage` con `newValue=null`. | RF-6 | `app/lib/theme.test.ts` |
| Racha de enrutado | La matriz de casos produce `rachaActual = n` y `casosFallidos` vacía. | RF-2, RF-5 | `app/lib/routing-streak.test.ts` |

### 6.2 Tests de componentes (Vitest + RTL)

| Componente | Qué se prueba | RF | Archivo |
|---|---|---|---|
| `LanguageSelector` | Enlaces nativos por idioma, etiquetas del diccionario, `aria-current`, escritura única de la cookie, funciona sin JS. | RF-4, RF-8 | `app/components/LanguageSelector/LanguageSelector.test.tsx` |
| `ThemeSelect` | `<select>` siempre visible, opciones del diccionario, cambio de tema, nombre accesible. | RF-6, RF-9 | `app/components/ThemeSelect/ThemeSelect.test.tsx` |
| `ThemeProvider` | Aplica la clase desde el documento, escucha `storage`, no renderiza controles. | RF-6 | `app/components/ThemeProvider/ThemeProvider.test.tsx` |
| `NotFound` | Mensaje y enlaces bilingües, sin cabecera ni controles, sin repetir la ruta, encabezado semántico. | RF-7, RF-9 | `app/[locale]/not-found.test.tsx` |
| `LocaleProvider` | Distribuye idioma y textos; no escribe la cookie. | RF-1, RF-4 | `app/i18n/locale-provider.test.tsx` |

### 6.3 Tests end-to-end (Playwright, 4 escritorio + 2 móvil)

| Flujo | Qué se verifica | RF | Archivo |
|---|---|---|---|
| Idioma | Cambio conserva ruta, query y fragmento; URL actualizada; historial; posición de lectura; sin JS. | RF-3, RF-4 | `tests/e2e/i18n-flow.e2e.ts` |
| Tema | Sin destello; persistencia; sincronización entre pestañas; `prefers-reduced-motion`; sin JS aplica sistema. | RF-6, RNF-4 | `tests/e2e/theme-flow.e2e.ts` |
| Enrutado | `/` → 308; barra final → 308; mayúsculas, `//`, locale fuera del primer segmento e idioma no soportado → 404; assets intactos. | RF-5 | `tests/e2e/routing.e2e.ts` |
| 404 | Estado 404, idioma correcto, enlaces de salida, `noindex`, sin cabecera, sin repetir la ruta. | RF-7, RNF-3 | `tests/e2e/not-found.e2e.ts` |
| Accesibilidad | Foco 3:1, objetivos 24×24, zoom 200 %, 320 px sin scroll horizontal, colores forzados. | RF-9, RNF-5 | `tests/e2e/accessibility.e2e.ts` |
| SEO | Título y descripción por idioma, canónica, `hreflang` y `x-default` → `/en`. | RNF-3 | `tests/e2e/seo.e2e.ts` |

### 6.4 Matriz de cobertura RF → secciones del plan

| RF/RNF | Módulos (§1) | Datos (§2) | Racha (§3) | CLI (§4) | Decisión (§5) | Tests (§6) |
|---|---|---|---|---|---|---|
| RF-1 | diccionarios, `get-dictionary`, `translate`, layouts | 2.1 | — | build, typecheck | `satisfies`, sin fusión | 6.1, 6.2 |
| RF-2 | `proxy`, resolvedor, storage | 2.3 | ✓ | test | tabla única | 6.1 |
| RF-3 | `proxy`, `resolve-locale`, `storage`, `config` | 2.2, 2.3 | ✓ | 308, cookie | cookie única, migración | 6.1, 6.3 |
| RF-4 | `use-locale`, `LanguageSelector`, provider | 2.2 | ✓ | cookie, `html lang` | escritura única | 6.2, 6.3 |
| RF-5 | `proxy`, `[...rest]`, `not-found` | 2.3 | ✓ | 308, 404 | tabla de precedencia | 6.1, 6.3 |
| RF-6 | `ThemeProvider`, `ThemeSelect`, `theme.ts`, layout | 2.2 | — | `html class` | script único, select visible | 6.1, 6.2, 6.3 |
| RF-7 | `not-found`, layout `(site)` | — | ✓ | 404, `noindex` | layout propio | 6.2, 6.3 |
| RF-8 | diccionarios, `storage`, `LanguageSelector` | 2.1, 2.2 | ✓ | cookie | migración, claves reservadas | 6.1, 6.2 |
| RF-9 | `globals.css`, componentes | — | — | — | foco y objetivos | 6.2, 6.3 |
| RNF-1 | todos | — | — | 4.4 | build como gate | 6.3 |
| RNF-3 | layouts, `generateMetadata` | — | — | canónica, `hreflang` | `x-default` → `/en` | 6.3 |
| RNF-4 | `globals.css`, script de arranque | — | — | — | script único | 6.3 |
| RNF-5 | `globals.css` | — | — | — | foco y objetivos | 6.3 |
| RNF-6 | `playwright.config.ts` | — | — | `test:e2e` | 4 + 2 | 6.3 |
| RNF-7 | `storage`, `theme.ts` | 2.2 | ✓ | cookie | una fuente por preferencia | 6.1 |
| RNF-8 | módulos pequeños | — | — | lint | responsabilidad única | 6.1, 6.2 |
| RNF-9 | diccionarios | 2.1 | — | typecheck | sin fusión | 6.1 |
| RNF-10 | fuera de alcance | — | — | — | disciplina de alcance | — |

### 6.5 Orden de implementación

1. Contratos y tests rojos: resolución de idioma, storage, paridad tipada, tema y matriz de enrutado (RF-1, RF-3, RF-6).
2. Módulos puros: `resolve-locale`, `storage`, `theme`, `translate` y `get-dictionary` (RF-1, RF-3, RF-6).
3. Enrutado: `proxy.ts`, `[...rest]` y la tabla de precedencia (RF-5).
4. Pantalla 404 y separación de layouts (RF-7).
5. Controles y proveedores: `LanguageSelector`, `ThemeProvider`, `ThemeSelect` (RF-4, RF-6).
6. Metadatos, accesibilidad y matriz de navegadores (RF-9, RNF-3, RNF-5, RNF-6).
7. Limpieza de claves, pruebas derogadas y notas en 001/002 (RF-8, RNF-8).
