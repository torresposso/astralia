## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Agent skills

### Issue tracker

Issues and PRDs for this repo live as GitHub issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles with default label names. See `docs/agents/triage-labels.md`.

### Architecture & Domain

This project follows **Domain-Driven Design** with **Clean Architecture**.
All agents MUST respect layer boundaries — see `docs/architecture.md`.

- **Domain layer** (`src/domain/`): Pure logic. No frameworks, no DB, no HTTP.
  Imported by Application and Infrastructure — never the reverse.
- **Application layer** (`src/application/`): Use cases. Depends only on Domain interfaces and Value Objects.
- **Infrastructure layer** (`src/infrastructure/`): Implements Domain repository interfaces.
  Contains database setup (`src/infrastructure/db/`), BetterAuth config (`src/infrastructure/auth/auth.config.ts`), and adapters.
  Depends on frameworks (better-auth, Drizzle, Turso).
- **Interfaces layer** (`src/pages/`, API routes, components): HTTP entry points.
  Calls Application Use Cases, never Domain directly.
- **Tests & Contract Verifications** (`tests/`): Integration flows (`tests/integration/`) and architecture contract tests (`tests/architecture.test.ts`).

Glossary and Ubiquitous Language: `CONTEXT.md`
Architecture decisions: `docs/adr/`
Architecture overview: `docs/architecture.md`

## Verification gates

Run the repo verification gates before reporting work as done:

- `npm test` — Vitest test suite (targeted: `npx vitest run <path>`)
- `npm run check` — `astro check` (types + project integrity)
- `npx tsc --noEmit` — TypeScript typecheck
- `npm run lint` — ESLint
- `npm run format:check` — Prettier format check

Run the focused gate(s) for what you changed after each milestone, not only at the end. If a gate fails for reasons that pre-date your changes, report it as a separate pre-existing failure rather than masking it or fixing it out of scope.
