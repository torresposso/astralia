# Study resources — DDD for a TypeScript engineer

A 2-4 week path and a curated list. All URLs verified (July 2026).
DDD terms are kept in English; explanations are in English.

## Study path (2-4 weeks)

### Week 1 — Concepts (1-2 days per block)

1. **DDD Quickly** (free) — a summary of Evans's "blue book"; a short read to
   have the complete vocabulary map.
2. **Learning Domain-Driven Design** by Khononov (chapters 1-8) — the most
   modern and friendly entry point; highly relevant to TS.
3. **Pluralsight course "Domain-Driven Design in Practice"** by Vladimir Khorikov
   (or his free blog: enterprisecraftsmanship.com) — universal concepts with C# examples.
4. **Khalil Stemmler's** introductory series — already TypeScript-oriented.

### Week 2 — Practice with TypeScript

1. Complete **Stemmler "DDD with TypeScript"** series (entities, value objects, aggregates, domain events).
2. Build a mini-domain using **stemmlerjs/ddd-forum** as a reference complete project.
3. **Hans Schenker's YouTube playlist "Typescript — Domain Driven Design"** (31 videos) as reinforcement.

### Week 3 — Modeling

1. **Domain Modeling Made Functional** by Wlaschin — functional modeling; the concepts
   map directly to TS (unions, Result, "make illegal states unrepresentable").
2. **Introducing EventStorming** by Brandolini + an EventStorming intro; run a mini-session.
3. **DDD Europe** talks (start with Evans's "Bounded Contexts").

### Week 4 — Depth + AI

1. Deep dive into **Sairyss/domain-driven-hexagon** (TS/NestJS, guide-repo).
2. **CodelyTV/typescript-ddd-example** and, if desired, CodelyTV's courses in Spanish ("DDD en TypeScript").
3. Selected chapters of Vernon's "red book" (aggregates).
4. **AI+DDD connections** (section below) + join r/domaindrivendesign and Virtual DDD.

## Curated complete list (15 resources)

| #   | Resource                                                                                                                                                                                                                                     | Type                 | Cost                | Level                 | TS relevance |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------- | --------------------- | ------------ |
| 1   | Domain-Driven Design ("blue book") — Eric Evans, 2004 — [domainlanguage.com/ddd/blue-book/](https://www.domainlanguage.com/ddd/blue-book/)                                                                                                   | Book                 | ~$45                | Advanced              | Medium       |
| 2   | Implementing Domain-Driven Design ("red book") — Vaughn Vernon, 2013 — [informit.com](https://www.informit.com/store/implementing-domain-driven-design-9780321834577)                                                                        | Book                 | ~$50                | Intermediate/advanced | Medium       |
| 3   | Domain Modeling Made Functional — Scott Wlaschin, 2018 — [pragprog.com](https://pragprog.com/titles/swdddf/)                                                                                                                                 | Book                 | ~$45                | Intermediate          | **High**     |
| 4   | Learning Domain-Driven Design — Vladik Khononov, 2021 — [oreilly.com](https://www.oreilly.com/library/view/learning-domain-driven-design/9781098100124/)                                                                                     | Book                 | ~$40 / O'Reilly sub | Beginner              | **High**     |
| 5   | Domain-Driven Design Quickly — Avram/Marinescu — [infoq.com](https://www.infoq.com/minibooks/domain-driven-design-quickly/)                                                                                                                  | Minibook             | **Free**            | Beginner              | Medium       |
| 6   | Introducing EventStorming — Alberto Brandolini — [leanpub.com](https://leanpub.com/introducing_eventstorming)                                                                                                                                | Book                 | ~$20-40             | Intermediate          | Medium       |
| 7   | Stemmler "DDD with TypeScript" — [khalilstemmler.com](https://khalilstemmler.com/articles/domain-driven-design-intro/)                                                                                                                       | Article series       | **Free**            | Beginner/intermediate | **High**     |
| 8   | stemmlerjs/ddd-forum — [github.com](https://github.com/stemmlerjs/ddd-forum)                                                                                                                                                                 | Example project      | **Free**            | Intermediate          | **High**     |
| 9   | Sairyss/domain-driven-hexagon — [github.com](https://github.com/Sairyss/domain-driven-hexagon)                                                                                                                                               | Guide-repo           | **Free**            | Intermediate/advanced | **High**     |
| 10  | CodelyTV/typescript-ddd-example — [github.com](https://github.com/CodelyTV/typescript-ddd-example) + CodelyTV courses "DDD en TypeScript"                                                                                                    | Project + courses    | Free / paid         | Intermediate          | **High**     |
| 11  | DDD Europe YouTube — [youtube.com](https://www.youtube.com/channel/UC3PGn-hQdbtRiqxZK9XBGqQ)                                                                                                                                                 | Channel (400+ talks) | **Free**            | All                   | Medium       |
| 12  | Pluralsight "Domain-Driven Design in Practice" — Vladimir Khorikov — [pluralsight.com](https://www.pluralsight.com/courses/domain-driven-design-in-practice) (free blog: [enterprisecraftsmanship.com](https://enterprisecraftsmanship.com)) | Course               | Paid / free blog    | Beginner/intermediate | Medium       |
| 13  | Playlist "Typescript — Domain Driven Design" — Hans Schenker — [youtube.com](https://www.youtube.com/playlist?list=PLw5h0DiJ-9PAMi7yjET_eYzD_mOvU6qvC)                                                                                       | Playlist (31 videos) | **Free**            | Intermediate          | **High**     |
| 14  | r/domaindrivendesign — [reddit.com](https://www.reddit.com/r/domaindrivendesign/) · Virtual DDD — [virtualddd.com](https://virtualddd.com) · dddcommunity.org                                                                                | Communities          | **Free**            | All                   | Medium       |
| 15  | heynickc/awesome-ddd — [github.com](https://github.com/heynickc/awesome-ddd) · mariuszgil/awesome-eventstorming — [github.com](https://github.com/mariuszgil/awesome-eventstorming)                                                          | Curated lists        | **Free**            | All                   | High         |

## Sources per lesson (10 lessons, verified 2026-07-31)

Each lesson links its primary sources in its own "Sources" section; this is the
same mapping in one place. URLs are the verified set from the course research
(OBS 2312); nothing here is invented.

| Lesson                           | Primary verified sources                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 01 — The domain model            | Evans, official DDD materials — <https://www.domainlanguage.com/ddd/>; local: `src/application/birth/SaveBirthData.ts`, `src/domain/birth/BirthData.vo.ts`, `src/domain/birth/ports/IBirthDataRepository.ts`, `src/infrastructure/birth/CaelusBirthConverter.ts`                                                                                                                                                                                                                                                                                                                                                         |
| 02 — Bounded context             | Evans, DDD Reference — <https://www.domainlanguage.com/ddd/reference/>; Fowler, "Bounded Context" — <https://martinfowler.com/bliki/BoundedContext.html>; local: `src/domain/{auth,birth,chart}/`, `CONTEXT.md`                                                                                                                                                                                                                                                                                                                                                                                                          |
| 03 — Ubiquitous language         | Evans, official DDD materials — <https://www.domainlanguage.com/ddd/>; local: `CONTEXT.md`, `src/domain/chart/ports/IChartCalculator.ts`, `src/infrastructure/chart/CaelusChartCalculator.ts`, `src/application/birth/SaveBirthData.ts`, `src/components/birth/BirthDataCard.astro`                                                                                                                                                                                                                                                                                                                                      |
| 04 — Entity vs value object      | Fowler, "Value Object" — <https://martinfowler.com/bliki/ValueObject.html>; Evans, DDD Reference — <https://www.domainlanguage.com/ddd/reference/>; local: `src/domain/auth/User.entity.ts`, `src/domain/auth/Email.vo.ts`, `src/domain/birth/BirthData.vo.ts`, `src/domain/chart/NatalChart.vo.ts`                                                                                                                                                                                                                                                                                                                      |
| 05 — Aggregate                   | Fowler, "DDD Aggregate" — <https://martinfowler.com/bliki/DDD_Aggregate.html>; Evans, DDD Reference — <https://www.domainlanguage.com/ddd/reference/>; local: `src/domain/birth/BirthData.vo.ts`, `src/domain/birth/ports/IBirthDataRepository.ts`, `src/application/birth/SaveBirthData.ts`                                                                                                                                                                                                                                                                                                                             |
| 06 — Ports, adapters, repository | Cockburn, "Hexagonal Architecture" — <https://alistair.cockburn.us/hexagonal-architecture/>; Fowler, "Repository" — <https://martinfowler.com/eaaCatalog/repository.html>; tiberriver256, ELI5 Dependency Injection — <https://tiberriver256.github.io/programming/eli5-dependency-injection/>; local: `src/domain/*/ports/`, `src/infrastructure/*/`                                                                                                                                                                                                                                                                    |
| 07 — Use cases                   | Khorikov, "Domain services vs Application services" — <https://enterprisecraftsmanship.com/posts/domain-vs-application-services/>; Evans, official DDD materials — <https://www.domainlanguage.com/ddd/>; freeCodeCamp (Buna), analogies for coding concepts — <https://www.freecodecamp.org/news/hard-coding-concepts-explained-with-simple-real-life-analogies-280635e98e37/>; local: `src/pages/api/auth/signin.ts`, `src/application/auth/SignIn.ts`, `src/pages/api/birth-data/create.ts`, `src/pages/api/birth-data/responseMapping.ts`, `src/pages/api/chart/natal.ts`, `src/application/chart/CalculateChart.ts` |
| 08 — The dependency rule         | Uncle Bob, "The Clean Architecture" — <https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html>; Palermo, "The Onion Architecture" — <https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/>; local: `tests/architecture.test.ts`, `src/{domain,application,infrastructure,pages}/`                                                                                                                                                                                                                                                                                                     |
| 09 — Domain events               | Fowler, "Domain Event" — <https://martinfowler.com/eaaDev/DomainEvent.html>; Microsoft Learn, domain events design/implementation — <https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-events-design-implementation>; local: `src/application/birth/SaveBirthData.ts`, `src/domain/birth/warnings.ts`                                                                                                                                                                                                                                                            |
| 10 — Testing the domain          | Protean docs, "Testing Domain Logic in Isolation" — <https://docs.proteanhq.com/patterns/testing-domain-logic-in-isolation/>; local: `src/domain/birth/BirthData.vo.test.ts`, `src/domain/chart/NatalChart.vo.test.ts`, `src/infrastructure/birth/DrizzleBirthDataRepository.test.ts`, `tests/architecture.test.ts`                                                                                                                                                                                                                                                                                                      |

Style references used when writing the ELI5 explanations: freeCodeCamp (Buna)
analogies, tiberriver256's 6×2-inch rod spec (interfaces), Nick Nish's
"Explain It Like I'm 5" series — <https://www.nicknish.co/series/explain-like-im-5>
and algocademy's "How to Explain Complex Technical Concepts Simply" —
<https://algocademy.com/blog/how-to-explain-complex-technical-concepts-simply-a-comprehensive-guide/>.

## AI + DDD connections (most relevant for an AI-assisted TS engineer)

- **Bounded contexts as agent work units**: splitting the repo by context limits
  the AI's blast radius and reduces out-of-place changes.
  [learninternetgrow.com/domain-driven-design-ai-agents/](https://learninternetgrow.com/domain-driven-design-ai-agents/)
- **Ubiquitous-language glossary in agent context files** (AGENTS.md,
  CLAUDE.md, .cursor/rules): reduces hallucination and keeps the vocabulary stable.
  [developertoolkit.ai](https://developertoolkit.ai/en/shared-workflows/development-workflows/domain-driven-design/)
- **Aggregate invariants as CI gates** over agent output: the machine does not
  accept code that breaks the rule; the AI should not either.
- **ACL as a "semantic firewall" between agents** — same idea as the anti-corruption layer.
- **ddd-meets-genai** — research + agent skills: EventStorming board →
  machine-readable domain model → code, with evaluations.
  [github.com/mardenneubert/ddd-meets-genai](https://github.com/mardenneubert/ddd-meets-genai)
- **Eric Evans, "My AI Learning Journey"** — DDD Europe 2025 talk (official channel).

> **Verification note**: the correct URL for Khononov's book is `9781098100124`
> (the `…0131` variant 404s). The freeCodeCamp video on DDD could not be verified
> as official; Hans Schenker's playlist replaces it.
