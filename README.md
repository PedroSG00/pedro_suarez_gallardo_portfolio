# pedro_suarez_gallardo_portfolio

Personal portfolio website of Pedro Suárez Gallardo, full-stack developer.

Aimed mainly at recruiters and, occasionally, at potential clients. Static and bilingual (English and Spanish), with no database or custom backend. It is not a résumé: it communicates confidence and reliability, and speaks about what the visitor gets.

## Design

Minimal in elements, spectacular in execution: an editorial, high-impact piece, not a template.

- Cream and black palette with a designed (not merely inverted) dark mode. No accent color.
- Monospaced typography at extreme scale: massive fluid headlines against small, readable body text.
- Visible grid, numbered sections, inverted blocks, asymmetry and generous negative space.
- CSS-only motion: every block animates **in as it enters the viewport and out as it leaves** while scrolling, plus staggered entrances and themed transitions. Fully respects `prefers-reduced-motion`.
- Voice: short, affirmative, benefit first.

Details live in `AGENTS.md`; each section defines its own "signature moment".

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS
- next-intl for i18n (`en`, `es`)
- Iconoir for icons
- Testing: Vitest (v8 coverage), React Testing Library, Playwright (Chromium)
- Linting: ESLint
- Static analysis: SonarQube Cloud (CI only, approved exception to "no external services")

## Getting started

Requirements: Node.js 26.12.0 (see `.node-version`) and pnpm 12.16.1 (see `packageManager`). `pnpm install` aborts if you use another Node version, another package manager, or an unreviewed build script.

```bash
git clone <repository-url>
cd <repository-folder>
pnpm install
pnpm dev        # http://localhost:3000
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build / serve it |
| `pnpm lint` | ESLint over js/mjs/ts/tsx, zero warnings allowed |
| `pnpm typecheck` | `next typegen` + `tsc --noEmit` |
| `pnpm test` | Vitest + Testing Library with coverage (fails under 95 %) |
| `pnpm test:watch` | Same tests in watch mode, without coverage |
| `pnpm test:e2e` | Production build + Playwright (Chromium only) |

Install the only supported browser once with `pnpm exec playwright install chromium`.

## Continuous integration

`.github/workflows/ci.yml` runs six parallel jobs on every push to `main` and every pull request: `lint`, `typecheck`, `test`, `build`, `e2e` and `sonar`. Node comes from `.node-version`, pnpm from `packageManager`, and a step fails if either does not match. The `test` and `e2e` jobs upload diagnostics (`coverage`, Playwright report and traces) even when they fail. Nothing is silenced: no `continue-on-error`, no lowered thresholds.

## Windows and Linux

Everything runs from the repository root in PowerShell and in bash: `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e`. No absolute paths and no encoded separators; `.gitattributes` keeps line endings at LF.

## Definition of done

`pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass. `pnpm test:e2e` passes when language, theme, navigation or motion is touched, and always before a pull request. In CI, the six checks and the SonarQube Cloud quality gate pass.

## Project structure

```text
.
├── .github/
│   ├── dependabot.yml            # Dependency updates (not changed by spec 01)
│   └── workflows/ci.yml          # CI: lint, typecheck, test, build, e2e, sonar
├── .gitattributes                # LF line endings
├── .node-version                 # Exact Node version (single source)
├── check-package-manager.mjs     # preinstall guard: pnpm only
├── e2e/                          # Playwright specs (Chromium)
├── messages/                     # en.json / es.json (spec 02)
├── pnpm-workspace.yaml           # pnpm settings: engineStrict, allowBuilds
├── public/                       # Static assets (CV PDFs, profile photo, favicon, OG image)
├── src/
│   ├── app/                      # App Router entries (excluded from coverage)
│   ├── components/               # ui/ and sections/
│   ├── content/                  # Typed, non-translatable data (stack, links)
│   ├── i18n/                     # next-intl setup and helpers (spec 02)
│   ├── lib/                      # Pure helpers
│   ├── styles/globals.css        # Tailwind entry, theme and motion tokens
│   └── test/setup.ts             # jest-dom, cleanup, restoreMocks
├── docs/                         # constitution.md and specs/
├── eslint.config.mjs
├── next.config.ts
├── playwright.config.ts
├── sonar-project.properties
├── tsconfig.json
├── vitest.config.mts
├── AGENTS.md
└── README.md
```

## Rules that keep it maintainable

* One component = one folder with its file and its test: `Name/Name.tsx` + `Name/Name.test.tsx`.
* Component organization: `ui/` (generic, props only, knows nothing about portfolio content), `sections/` (page blocks that compose `ui/` pieces and read `messages/` and `content/`), and top-level layout components (`Navbar/`, `Footer/`) used in `layout.tsx`. No deeper nesting.
* Atomic and reusable: one responsibility each, around 100 lines at most. A block repeated twice with the same intent gets extracted.
* No duplicated values: colors, spacing, type scale, and motion durations and distances come only from the theme tokens in `globals.css`.
* No barrel files (`index.ts`); import with the `@/` alias (maps to `src/`).
* No new top-level folders without a reason written in a spec.
* Things used by one component live next to it; they move to `ui/` or `lib/` only when a second consumer appears.

## Testing

* Quality over quantity: tests check user-visible behavior (content, roles, interaction, states, accessibility). No snapshots, no Tailwind class assertions, no tests written only to raise coverage.
* Coverage ≥ 95 % globally (lines, functions, branches, statements), enforced by the Vitest threshold. Excluded: configuration, tests, `*.d.ts`, `src/test/`, `src/app/` route files (covered by e2e) and `src/content/`. Nothing outside `src/` is measured.
* Playwright covers only the critical flows: language, theme, navigation and scroll motion (in/out of each section, checked through computed opacity while scrolling, and fully visible under `prefers-reduced-motion`). Spec 01 ships a transitional smoke test (the home responds without `pageerror`); the critical flows arrive with specs 02, 03, 05 and 06.
* Tests are written before the code.

## Internationalization

Handled by `next-intl` with locale-prefixed routes (`/en`, `/es`) and static rendering. All visible text lives in `messages/en.json` and `messages/es.json`, organized by section (`hero.title`, `experience.items`...). Every new text is added to both files in the same change; a test verifies that both have the same keys. The home page defines its metadata per language.

## Page structure

Every route is wrapped by the global `Navbar` and `Footer` layout components. The site is a single home page with anchors.

**Layout components:**

* **Navbar**: section links, language and theme switches.
* **Footer**: links, language and copyright.

**Home page sections:**

1. **Hero**: name, role, pitch and calls to action. Home of the site's signature moment.
2. **About** (`01`): a statement of confidence, then who I am and how I work.
3. **Work** (`02`, `experience.*` keys): "What I deliver", five result-led blocks (live data, web migrations, administration at scale, workflow tools, integrations and performance), with no company names.
4. **Stack** (`03`): "The tools I trust", technologies grouped, frontend first.
5. **Contact** (`04`): "Let's build something solid", with email as a giant link.

**Parked:** the Projects section and the `/projects/[slug]` pages are out of scope for now. They return when there is a new project, with their own spec. See `content-brief.md`, section 10.

## Development plan

Every phase follows the same loop: spec → tests → code → gates (`lint`, `typecheck`, `test`, `build`, and `test:e2e` when it applies). A phase is done only when its gates pass.

| Phase | Goal | Done when |
| --- | --- | --- |
| **0. Foundation** | Tooling (Vitest + coverage threshold, RTL, Playwright, CI), `next-intl` with `/en` and `/es`, theme tokens, mono font, light/dark theme | Tooling gates green (lint, typecheck, test, build, e2e) and the six CI checks pass on a placeholder page |
| **1. Atoms** | `ui/` pieces: Button/Link, Heading, Tag, Section wrapper, grid lines, ThemeToggle, LanguageSwitch | Each atom tested and reusable, no section-specific code inside |
| **2. Shell and Hero** | Global layout components (`Navbar`, `Footer`) and the `Hero` section with the site's signature moment | Memorable at first glance in both themes and both languages; navigation works |
| **3. About and Work** | Confident, benefit-led sections composed from atoms | Same standard as previous phases; content only from `messages/` and `content/` |
| **4. Scroll motion** | `ui/Reveal` (in and out while scrolling) applied to every block, plus each section's signature moment | e2e proves opacity changes on entry and exit in every section, in both languages and themes; everything visible with `prefers-reduced-motion` and without `animation-timeline` support |
| **5. Stack and Contact** | Grouped stack and contact block | Links verified, no duplicated markup between groups |
| **6. Polish** | Per-language metadata, sitemap, robots, OG image, accessibility pass, performance pass, reduced-motion check, Safari and Firefox motion fallback check | Lighthouse 95+ in all categories, AA contrast, full keyboard navigation |
| **7. Launch** | Static deploy and domain | Live site and README links filled in |

`docs/roadmap.md` orders scroll motion (spec 05) before Shell and Hero (06); the rows above are updated when that spec is executed.

## Conventions

* Code, comments and commits in English; `camelCase` for names, `SCREAMING_SNAKE_CASE` for constants, `PascalCase` for components.
* Conventional Commits (e.g. `feat: add contact section`).
* Non-trivial changes start with a spec in `docs/specs/`. See `docs/constitution.md`.
* Before opening a pull request:

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
```

## AI agents

`AGENTS.md` holds the instructions coding agents must follow in this repository.

## License

## Contact

Pedro Suárez Gallardo

* Website:
* GitHub:
* LinkedIn:
* Email:
