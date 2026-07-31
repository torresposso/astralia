# Adopt DDD + Clean Architecture

We reorganized the project from a flat Astro structure into Domain-Driven Design layers with Clean Architecture separation, to prepare for the astrological domain logic (charts, houses, aspects) that the project will eventually implement.

### Status

accepted

### Considered Options

- **Flat Astro structure** (current): All files in src/pages, src/layouts, src/components, src/lib, src/db. Simple but no separation of concerns. Domain logic would leak into pages.

- **Feature-based**: Group by feature (auth/, chart/, dashboard/) with sub-folders for each layer. Clear feature isolation but cross-cutting concerns (DB, middleware) would need special handling.

- **DDD + Clean Architecture** (chosen): Separate by architectural layer (domain/, application/, infrastructure/, interfaces/) with sub-folders for bounded contexts. Domain logic is pure, testable, and framework-independent.

### Consequences

- Domain entities and use cases are now testable without Astro, Alpine.js, or better-auth
- Pages and components must import from application/ use cases instead of calling infrastructure directly
- Learning curve for new developers unfamiliar with DDD
- Slightly more files and imports for simple operations
