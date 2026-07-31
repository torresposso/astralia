# Astralia — Coding Standards

> **Project**: Astralia — a web application for astrological chart interpretation.
> **Stack**: Astro 7 SSR + Alpine.js 3 + Tailwind CSS 4 + better-auth + Drizzle ORM + SQLite/Turso.
> **Language**: TypeScript strict. UI in Colombian Spanish. Code in English.

---

## Stack & Tooling

### Core

| Layer                | Technology                            | Purpose                        |
| -------------------- | ------------------------------------- | ------------------------------ |
| Framework            | Astro 7 (SSR, `output: 'server'`)     | Static + server-rendered pages |
| Adapter              | `@astrojs/node` (standalone)          | Node.js server deployment      |
| CSS                  | Tailwind CSS v4 (`@tailwindcss/vite`) | Utility-first styling          |
| Client interactivity | Alpine.js v3 (`@astrojs/alpinejs`)    | Lightweight reactive UI        |
| Dynamic loading      | HTMX v2 (`htmx.org`)                  | Partial page updates, AJAX     |

### Data

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Database   | SQLite via `@libsql/client` (Turso) |
| ORM        | Drizzle ORM v0.45                   |
| Migrations | `drizzle-kit`                       |

### Auth

| Layer       | Technology                                          |
| ----------- | --------------------------------------------------- |
| Auth server | better-auth v1.6                                    |
| Auth client | `@/lib/auth-client.ts` (better-auth browser client) |
| Strategies  | Email + password (currently)                        |

### Tooling

| Tool            | Config                                  |
| --------------- | --------------------------------------- |
| TypeScript      | `strict` mode, `@/` → `src/` path alias |
| Package manager | npm                                     |
| Dev server      | `astro dev --background`                |
| Build           | `astro build`                           |
| DB generate     | `drizzle-kit generate`                  |
| DB migrate      | `drizzle-kit migrate`                   |

---

## Domain Language (Ubiquitous Language)

> Terminology is precise. When multiple words could describe the same concept, this glossary defines the canonical term. Always use the canonical term in code, comments, documentation, and conversation. List avoided synonyms under `_Avoid_`.

### Core Domain

**User**:
A person who has registered and can authenticate. Has a `name`, `email`, and optional `image`. Identity is the `id` (UUID).
_Avoid_: Customer, member, account, client

**Session**:
An authenticated browser session tied to a User. Created on signin, destroyed on signout. Managed by better-auth.
_Avoid_: Login, token

**Chart** (future):
A calculated astrological chart (natal chart) for a User. Contains planetary positions, houses, aspects. Not yet implemented.
_Avoid_: Carta, horoscope

### Auth Subdomain

**Sign In**:
The act of authenticating a User with email + password. Renders the `/signin` page.
_Avoid_: Login, entrar

**Sign Up**:
The act of registering a new User. Renders the `/signup` page.
_Avoid_: Register, signup (as one word is acceptable in code identifiers), create account

**Sign Out**:
The act of ending a Session. Triggers via dashboard logout.
_Avoid_: Logout (acceptable in code identifiers), cerrar sesión

**Dashboard**:
The authenticated landing page for a User after signin. Route: `/dashboard`. Shows profile info and upcoming features.

### UI Component Domain

**FormError**:
An Astro component that renders an Alpine-reactive error message (`x-show="error"`, `x-text="error"`). Lives at `src/components/ui/FormError.astro`.

**SubmitButton**:
An Astro component that renders a submit button with Alpine loading state (`:disabled="loading"`, dynamic `x-text`). Lives at `src/components/ui/SubmitButton.astro`.

### Layout Domain

**Base**:
The root layout (`src/layouts/Base.astro`). Provides `<html>`, `<head>`, `<body>` with global CSS, Alpine.js via integration, HTMX via npm import, and the HTMX+Alpine bridge (`htmx:afterSettle -> Alpine.initTree()`).

**AuthLayout**:
A layout for auth pages (`src/layouts/AuthLayout.astro`). Renders a centered card with logo, title, and slot. Used inside Base.

---

## Architectural Decisions (ADRs)

### When to create an ADR

Create a new ADR in `docs/adr/` only when **all three** are true:

1. **Hard to reverse** — changing your mind later costs meaningful effort
2. **Surprising without context** — a future reader will wonder "why did they do this?"
3. **Result of a real trade-off** — there were genuine alternatives and you chose one

### What qualifies

- Architectural shape (monorepo vs multi-repo, write model, read model)
- Integration patterns between contexts (events vs HTTP)
- Technology choices with lock-in (database, auth provider, deployment target)
- Boundary and scope decisions (what owns what data)
- Deliberate deviations from the obvious path
- Constraints not visible in the code (compliance, performance SLAs)
- Rejected alternatives when the rejection is non-obvious

### What does NOT qualify

- Easy-to-reverse decisions (just revert them)
- Obvious choices (nobody will wonder)
- The only viable option (nothing to record beyond "we did the obvious")

### Format

ADRs live in `docs/adr/` with sequential numbering: `0001-title-with-dashes.md`.

Content template:

```markdown
# {Short title of the decision}

{1-3 sentences: what's the context, what did we decide, and why.}

Optional sections: Status, Considered Options, Consequences.
```

An ADR can be a single paragraph. The value is recording _that_ a decision was made and _why_.

---

## File Organization & Module Design

### Directory Structure

```
tests/                    # Global & integration tests
├── architecture.test.ts  # Clean Architecture contract tests
└── integration/          # Integration flow test suites

src/
├── domain/               # Domain Layer (Pure TS: entities, VOs, ports)
│   ├── auth/
│   ├── birth/
│   └── chart/
├── application/          # Application Layer (Use cases)
│   ├── auth/
│   ├── birth/
│   └── chart/
├── infrastructure/       # Infrastructure Layer (Adapters, DB, auth config)
│   ├── auth/
│   │   └── auth.config.ts
│   ├── db/               # Database connection & Drizzle schema
│   │   ├── index.ts
│   │   └── schema.ts
│   ├── birth/
│   └── chart/
├── components/           # UI Components (Organized by domain & primitive)
│   ├── ui/               # Generic UI primitives (FormError, SubmitButton)
│   └── birth/            # Birth Data UI components (BirthDataCard)
├── layouts/              # Astro layout components (Base.astro, AuthLayout.astro)
├── pages/                # Presentation / Routing (Astro SSR pages & API controllers)
│   ├── api/
│   │   ├── _helpers/     # Controller utility helpers
│   │   ├── auth/
│   │   ├── birth-data/
│   │   ├── chart/
│   │   └── geo/
│   ├── index.astro
│   ├── signin.astro
│   ├── signup.astro
│   └── dashboard.astro
├── lib/                  # Frontend/Alpine utilities (alpine-utils.ts)
├── styles/               # Global stylesheets (global.css)
├── middleware.ts         # Astro middleware (session guard)
└── env.d.ts              # TypeScript ambient declarations
```

### Module Design Principles (from codebase-design skill)

Use these terms precisely:

| Term               | Meaning                                                                                 | Avoid                    |
| ------------------ | --------------------------------------------------------------------------------------- | ------------------------ |
| **Module**         | Anything with an interface + implementation (function, class, file, directory)          | Component, service, unit |
| **Interface**      | Everything a caller must know: type signature + invariants + ordering + errors + config | API, signature           |
| **Implementation** | What's inside the module                                                                | —                        |
| **Depth**          | Behaviour per unit of interface — deep = lots of behaviour behind a small interface     | —                        |
| **Seam**           | Where you can alter behaviour without editing that place                                | Boundary                 |
| **Adapter**        | Concrete thing that satisfies an interface at a seam                                    | —                        |
| **Leverage**       | What callers get from depth (more capability per interface learned)                     | —                        |
| **Locality**       | What maintainers get from depth (change concentrates in one place)                      | —                        |

#### Guidelines

**Prefer deep modules.** A small interface with rich implementation gives callers leverage and maintainers locality.

```ts
// Shallow — interface is as complex as the implementation
function formatDate(d: Date, locale: string, format: string): string { ... }

// Deeper — hides complexity behind a simple interface
function formatDateShort(d: Date): string { ... }
```

**The deletion test.** Imagine deleting the module. If complexity vanishes, it was a pass-through. If complexity reappears across N callers, it was earning its keep.

**One adapter means a hypothetical seam. Two adapters means a real one.** Don't introduce a seam (interface + adapter) unless something actually varies across it.

**Accept dependencies, don't create them.** Pass dependencies in; don't instantiate them inside:

```ts
// Testable
function processOrder(order: Order, paymentGateway: PaymentGateway): Result { ... }

// Hard to test
function processOrder(order: Order): Result {
  const gateway = new StripeGateway() // ❌
}
```

**Return results, don't produce side effects:**

```ts
// Testable
function calculateDiscount(cart: Cart): Discount { ... }

// Hard to test
function applyDiscount(cart: Cart): void {
  cart.total -= discount // ❌
}
```

---

## Astro Conventions

### Layout Hierarchy

```
Base.astro (html, head, body, Alpine, HTMX, global CSS)
  └── AuthLayout.astro (centered card with logo/title)
  │     └── signin.astro, signup.astro
  └── index.astro (no AuthLayout — standalone hero layout)
  └── dashboard.astro (no AuthLayout — uses its own nav)
```

### Import Aliases

Always use `@/` path alias (maps to `src/`):

```astro
---
import Base from '@/layouts/Base.astro'
import AuthLayout from '@/layouts/AuthLayout.astro'
import FormError from '@/components/FormError.astro'
import SubmitButton from '@/components/SubmitButton.astro'
---
```

### Frontmatter Structure

```
1. Imports (groups: layouts, components, lib, db)
2. Session check / redirect
3. Data computation
4. Variables for template
```

```astro
---
import Base from '@/layouts/Base.astro'

// Session guard
const session = Astro.locals.session
if (!session) return Astro.redirect('/signin')

// Template data
const user = Astro.locals.user
const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase()
---
```

### Shared Components

Use `<FormError>` and `<SubmitButton>` in all forms:

```astro
<form x-data="signinForm" @submit.prevent="submit" class="space-y-5">
  <input x-model="email" ... />
  <input x-model="password" ... />

  <FormError />
  <SubmitButton text="Iniciar Sesion" loadingText="Iniciando sesion..." />
</form>
```

---

## Alpine.js Conventions

### Component Registration

Use `registerComponent()` from `@/lib/alpine-utils` — wraps `alpine:init` + `Alpine.data()`:

```astro
<script>
  import { authClient } from '@/lib/auth-client'
  import { registerComponent } from '@/lib/alpine-utils'

  registerComponent('myComponent', () => ({
    // Reactive state
    field: '',
    loading: false,
    error: '',

    // Actions
    async doSomething() {
      this.loading = true
      this.error = ''
      try {
        // ...
      } catch {
        this.setError('Error message')
      }
    },

    setError(msg) {
      this.error = msg
      this.loading = false
    },
  }))
</script>
```

### Naming

- Alpine component names: `camelCase`, unique across the project
- Properties: `camelCase`
- Methods: `camelCase`, preferably verbs
- Computed getters: prefixed with derived intent (not implementation)

### Directives Reference

| Directive         | When                                 | Example                           |
| ----------------- | ------------------------------------ | --------------------------------- |
| `x-data`          | Root element of Alpine scope         | `<form x-data="signinForm">`      |
| `x-model`         | Two-way binding on inputs            | `<input x-model="email">`         |
| `x-show`          | Conditional display (falsy = hidden) | `<p x-show="error">`              |
| `x-text`          | Dynamic text content                 | `<span x-text="buttonText">`      |
| `@submit.prevent` | Form submit with preventDefault      | `<form @submit.prevent="submit">` |
| `@click`          | Click handler                        | `<button @click="logout">`        |
| `:disabled`       | Conditional disabled attribute       | `<button :disabled="loading">`    |

### State Shape Convention

Every interactive Alpine component follows this state shape:

```
{
  // Form fields (string primitives)
  field: '',

  // Loading flag — disables buttons during async
  loading: false,

  // Error string — empty = no error
  error: '',

  // Single async action
  async action() {
    this.loading = true
    this.error = ''
    // validate -> try/catch -> setError or redirect
  },

  // Centralized error handler (also resets loading)
  setError(msg) {
    this.error = msg
    this.loading = false
  },
}
```

### Important Rules

- **Never use `x-data="{...}"` with complex logic inline** in HTML attributes. Only use it to reference a named component registered via `registerComponent()`. Complex logic in HTML attributes is impossible to test, hard to read, and blocks extraction.
- **Do NOT call `Alpine.start()`** manually. `@astrojs/alpinejs` handles this on DOMContentLoaded.
- **`alpine:init` listeners are module-scoped.** Page scripts run before DOMContentLoaded, so the listener fires before Alpine processes the DOM. No race condition.
- **Keep `id` attributes on inputs** for label association and accessibility, even though Alpine uses `x-model`.

---

## Auth & Session Patterns

### Server-side Session Guard

Protected pages check in frontmatter:

```astro
---
const session = Astro.locals.session
if (!session) return Astro.redirect('/signin')
---
```

Auth pages redirect authenticated users away:

```astro
---
const session = Astro.locals.session
if (session) return Astro.redirect('/dashboard')
---
```

### Client-side Auth Calls

```ts
import { authClient } from '@/lib/auth-client'

// Sign In
const { data, error } = await authClient.signIn.email({
  email: this.email.trim(),
  password: this.password,
})

// Sign Up
const { data, error } = await authClient.signUp.email({
  name: this.name.trim(),
  email: this.email.trim(),
  password: this.password,
})

// Sign Out
await authClient.signOut()
window.location.href = '/'
```

### Session Data Available

| Property               | Type     | Source |
| ---------------------- | -------- | ------ |
| `Astro.locals.user`    | `User    | null`  | From better-auth session |
| `Astro.locals.session` | `Session | null`  | From better-auth session |

`User` fields: `id`, `name`, `email`, `emailVerified`, `image`, `createdAt`, `updatedAt`

---

## Error Handling

### Client-side (Alpine)

Consistent error pattern in every Alpine component:

```ts
async action() {
  this.loading = true
  this.error = ''

  // Validation — early return via setError
  if (!this.field.trim()) return this.setError('User-facing message')

  try {
    const { error } = await someApi()
    if (error) return this.setError(error.message || 'Fallback message')

    // Success — navigate
    window.location.href = '/target'
  } catch {
    // Network or unexpected error
    this.setError('Error de conexion. Intenta de nuevo.')
  }
},

setError(msg) {
  this.error = msg
  this.loading = false  // Re-enable the button
}
```

Rules:

- **Validation errors**: early return with `setError()`, which resets `loading`
- **API errors**: check `{ error }` destructuring, show `error.message` with fallback
- **Network errors**: `catch` block with generic message
- **Error display**: always via `x-show="error"` + `x-text="error"` (or `<FormError />`)
- **Never swallow errors silently** — always show feedback

### Server-side (Middleware)

The middleware (`src/middleware.ts`) handles session-based authorization globally:

- Public routes (no session required): everything except `/dashboard`
- Protected route: `/dashboard` -> redirects to `/signin` without session
- Auth pages: `/signin`, `/signup` -> redirects to `/dashboard` with session

API routes (`/api/*`) and partials (`/partials/*`) pass through without session checks.

---

## Styling & Theming

### Tailwind CSS v4

All styling uses Tailwind utility classes. No custom CSS unless absolutely necessary. Custom CSS lives in `src/styles/global.css`.

### Dark Mode

Always provide both variants using `dark:` modifier:

```html
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"></div>
```

Required patterns:

- Background: `bg-white dark:bg-gray-800` (cards), `bg-white dark:bg-gray-900` (page), `bg-gray-50 dark:bg-gray-950` (subtle)
- Text: `text-gray-900 dark:text-gray-100` (headings), `text-gray-600 dark:text-gray-400` (body/muted)
- Borders: `border-gray-200 dark:border-gray-700`
- Links: `text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300`

### Brand Colors

| Token         | Light        | Dark         | Usage                |
| ------------- | ------------ | ------------ | -------------------- |
| Primary       | `indigo-600` | `indigo-400` | Links, buttons, logo |
| Primary hover | `indigo-700` | `indigo-300` | Button hover states  |
| Primary bg    | `indigo-100` | `indigo-900` | Avatar backgrounds   |

### Component Styling Guidance

Keep Alpine-enabled components purely functional for styling — use Tailwind classes in the Astro template, not in Alpine state. Alpine should manage behaviour (loading, error, visibility), not visual properties.

---

## Internationalization (i18n)

### Current Standard

- **UI Language**: Colombian Spanish (es-CO)
- **Code**: 100% English (identifiers, comments, types, filenames)
- **Dates**: `toLocaleDateString('es-CO')` for user-facing dates

### Adding Languages (Future)

When a second language is added, use a `src/lib/i18n.ts` module with key-value translation objects. Never mix UI strings directly in Alpine state — always reference translation keys.

---

## Testing Strategy

> Note: Tests are not yet set up in this project. The following standards document the intended approach for when they are.

### Test Types

- **Component testing** (future): Test Astro components and Alpine interactions with Playwright or Vitest + @astrojs/test
- **API testing** (future): Test better-auth endpoints with Vitest
- **E2E testing** (future): Test critical flows (signup -> signin -> dashboard -> logout) with Playwright

### Test File Location

Tests live next to the source file:

```
src/
├── pages/
│   ├── signin.astro
│   └── signin.test.ts        <- co-located
├── lib/
│   ├── alpine-utils.ts
│   └── alpine-utils.test.ts  <- co-located
```

### Test Runner

Vitest (consistent with Astro ecosystem).

---

## Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
```

### Types

| Type       | When                                                  |
| ---------- | ----------------------------------------------------- |
| `feat`     | A new feature                                         |
| `fix`      | A bug fix                                             |
| `refactor` | Code change that neither fixes nor adds               |
| `style`    | Formatting, missing semicolons, etc. (no code change) |
| `docs`     | Documentation only                                    |
| `chore`    | Build, deps, config, tooling                          |
| `perf`     | Performance improvement                               |

### Scope

The area of the codebase: `auth`, `ui`, `dashboard`, `db`, `config`, `deps`, `docs`

### Examples

```
feat(auth): add Alpine.js interactivity to signin form
refactor(ui): extract FormError and SubmitButton components
docs: add CODING_STANDARDS.md
chore(deps): update alpinejs to 3.14
```

---

## Code Smell Baseline

In addition to the standards above, all code should avoid the Fowler code smells (from _Refactoring_ ch.3). These are labelled heuristics, not hard rules — but they serve as the default review baseline when no documented standard addresses a concern.

| Smell                      | What to look for                                                | How to fix                                              |
| -------------------------- | --------------------------------------------------------------- | ------------------------------------------------------- |
| **Mysterious Name**        | A function/variable/type whose name doesn't reveal what it does | Rename it; if no honest name comes, the design is murky |
| **Duplicated Code**        | Same logic shape in more than one hunk/file                     | Extract the shared shape, call it from both             |
| **Feature Envy**           | A method reaching into another object's data more than its own  | Move the method onto the data it envies                 |
| **Data Clumps**            | Same fields/params travelling together (wanting a type)         | Bundle them into one type                               |
| **Primitive Obsession**    | A primitive standing in for a domain concept                    | Give the concept its own small type                     |
| **Repeated Switches**      | Same switch/if-cascade on same type recurring                   | Replace with polymorphism or a shared map               |
| **Shotgun Surgery**        | One logical change forces scattered edits across many files     | Gather what changes together into one module            |
| **Divergent Change**       | One module edited for several unrelated reasons                 | Split so each module changes for one reason             |
| **Speculative Generality** | Abstraction/params/hooks for needs the spec doesn't have        | Delete it; inline until a real need shows               |
| **Message Chains**         | Long `a.b().c().d()` navigation the caller shouldn't depend on  | Hide the walk behind one method                         |
| **Middle Man**             | A class/function that mostly delegates onward                   | Cut it, call the real target directly                   |
| **Refused Bequest**        | A subclass that ignores most of what it inherits                | Drop inheritance, use composition                       |

### Repo Standards Override the Baseline

Where a documented standard in this file endorses something the baseline would flag, the standard wins. For example, if this file says "use string primitives for Alpine state" (which it does), that's not Primitive Obsession — it's a documented convention.
