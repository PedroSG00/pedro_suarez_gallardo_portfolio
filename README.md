# Pedro Suárez Gallardo — Portfolio

Personal résumé and portfolio website of **Pedro Suárez Gallardo**, web developer.

It is aimed mainly at recruiters and, occasionally, at potential clients. The site is static and bilingual (English and Spanish), with no database or custom backend.

<!-- Add a screenshot here once the design is ready:
![Portfolio screenshot](./docs/screenshot.png)
-->

**Live site:** <!-- https://your-domain.com -->

## Design

- Minimalist, "tech" look with a distinctive personality.
- Off-white (cream) and black palette, with dark mode.
- Elegant monospaced typography.

## Tech stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- i18n for English (`en`) and Spanish (`es`)
- Testing: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/react) and [Playwright](https://playwright.dev/)
- Linting: [ESLint](https://eslint.org/)

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (current LTS recommended)
- [pnpm](https://pnpm.io/installation)

### Installation

```bash
git clone <repository-url>
cd <repository-folder>
pnpm install
```

### Run locally

```bash
pnpm dev
```

The site will be available at [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run the TypeScript compiler without emitting files |
| `pnpm test` | Run unit and component tests (Vitest + React Testing Library) |
| `pnpm test:watch` | Run unit and component tests in watch mode |
| `pnpm test:e2e` | Run end-to-end tests (Playwright) |

### Running the tests

Unit and component tests:

```bash
pnpm test
```

End-to-end tests require the Playwright browsers. Install them once:

```bash
pnpm exec playwright install
```

Then run:

```bash
pnpm test:e2e
```

## Internationalization

The site is available in English and Spanish. All user-facing text lives in the i18n dictionaries and never directly in components, so any new text must be added in both languages.

## Conventions

- Code and comments in English.
- `camelCase` for names and `SCREAMING_SNAKE_CASE` for constants.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat: add contact section`).

Before opening a pull request or finishing a task, make sure these pass:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## AI agents

This repository includes an [`AGENTS.md`](./AGENTS.md) file with the instructions and rules that coding agents must follow when working on the project.

## License

<!-- Choose a license (e.g. MIT) and add a LICENSE file, or state that all rights are reserved. -->

## Contact

**Pedro Suárez Gallardo**

- Website: <!-- https://your-domain.com -->
- GitHub: <!-- https://github.com/your-user -->
- LinkedIn: <!-- https://linkedin.com/in/your-user -->
- Email: <!-- your@email.com -->