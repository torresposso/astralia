# Architecture — DDD + Clean Architecture

## Visual Layer Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERFACES / PRESENTATION                 │
│  Pages (.astro)  ·  Alpine.js Components  ·  API Routes     │
│  src/pages/      ·  src/components/       ·  src/layouts/   │
├─────────────────────────────────────────────────────────────┤
│                     APPLICATION (Use Cases)                  │
│  SignInUseCase   ·  SignUpUseCase  ·  SignOutUseCase        │
│  src/application/auth/                                       │
├─────────────────────────────────────────────────────────────┤
│                        DOMAIN (Core)                         │
│  Entities  ·  Value Objects  ·  Repository Interfaces       │
│  User.entity.ts  ·  Email.vo.ts  ·  Password.vo.ts         │
│  IAuthRepository.ts                                          │
│  src/domain/auth/                                            │
├─────────────────────────────────────────────────────────────┤
│                     INFRASTRUCTURE                           │
│  BetterAuthRepository  ·  auth.config.ts  ·  DB Schema      │
│  src/infrastructure/auth/   ·   src/infrastructure/db/      │
│  better-auth · Drizzle ORM · Turso (SQLite)                 │
└─────────────────────────────────────────────────────────────┘
```

**Regla de dependencia**: Las flechas apuntan hacia adentro. Interfaces → Application → Domain. Infrastructure también apunta a Domain (implementa sus interfaces). Domain no sabe de nadie.

## Layer Details

### Domain (`src/domain/`)

- **Puro** — zero dependencies en frameworks, DB, o librerías externas
- **Entities**: Tienen identidad (`User.id`), encapsulan invariantes de negocio
- **Value Objects**: Inmutables, con validación en el factory (`Email.vo`, `Password.vo`)
- **Repository Interfaces**: Contratos que el dominio necesita para persistencia/auth; la infraestructura los implementa

### Application (`src/application/`)

- Orquesta el flujo: valida con VOs → llama al repositorio → retorna resultado estructurado
- **No depende de frameworks** — solo de interfaces del dominio
- Cada Use Case tiene una sola responsabilidad
- Retorna **Result pattern**: `{ ok: true, data } | { ok: false, error }`

### Infrastructure (`src/infrastructure/`)

- Implementa las interfaces del dominio (repositorios concretos)
- Depende de librerías externas (better-auth, Drizzle, Turso)
- **No filtra lógica de negocio** — solo traducción técnica

### Interfaces / Presentation (`src/pages/`, `src/components/`, `src/layouts/`)

- **API routes** actúan como controllers: reciben HTTP, instancian Use Cases, construyen Response
- **Pages y Alpine.js** son la vista: formularios, fetch a API routes, renderizado
- **Middleware** protege rutas y provee sesión a `Astro.locals`

## Bounded Contexts

| Context    | Status          | Carpeta             |
| ---------- | --------------- | ------------------- |
| Auth       | ✅ Implementado | `src/*/auth/`       |
| Chart      | 🚧 Planeado     | `src/*/chart/`      |
| Birth Data | 🚧 Planeado     | `src/*/birth-data/` |

## Data Flow

```
Browser (Alpine.js)               Astro SSR
      │                              │
      │ POST /api/auth/signin        │
      │ { email, password }          │
      ▼                              │
  API Route (Controller)             │
      │                              │
      ▼                              │
  SignInUseCase                      │
      │ • Email.create(email)        │
      │ • Password.create(password)  │
      ▼                              │
  BetterAuthRepository               │
      │ • auth.api.signInEmail()     │
      ▼                              │
  better-auth + Drizzle + Turso      │
      │                              │
      ◄──── Response + Set-Cookie ────
      │
      ▼
  window.location.href = '/dashboard'
```

## Key Patterns

- **Result Pattern**: `{ ok: true; data: T } | { ok: false; error: string }` — todos los Use Cases retornan este tipo discriminado
- **Dependency Injection**: Use Cases reciben repositorios en el constructor (`new SignInUseCase(new BetterAuthRepository())`)
- **Value Objects**: Se validan al crearse vía factory estático (`Email.create()`), nunca existen en estado inválido
- **Private Constructor + Factories**: `User.create()` (con defaults) y `User.from()` (reconstitución exacta) vs constructor privado
- **Cookies as Opaque Data**: El dominio no sabe de HTTP; el repositorio pasa strings de cookies como metadata que el controller forwardea

## Technology Mapping

| Layer          | Tecnología                               | Propósito                           |
| -------------- | ---------------------------------------- | ----------------------------------- |
| Interfaces     | Astro 7 SSR, Alpine.js, Tailwind 4       | UI, routing, interactividad cliente |
| Application    | TypeScript puro                          | Use cases, orquestación             |
| Domain         | TypeScript puro                          | Entidades, VOs, reglas de negocio   |
| Infrastructure | better-auth, Drizzle ORM, Turso (SQLite) | Autenticación, persistencia, DB     |
