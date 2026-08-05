# Mission: Direct the AI with DDD

> _Mission: Direct the AI with DDD._ A personal standard for evaluating every AI
> proposal before accepting it, naming it, or vetoing it. DDD is not a technical
> ornament: it is the vocabulary that lets you **demand** architecture with
> meaning.

## Learning context

You are a TypeScript engineer with zero DDD experience, and you want to master
Domain-Driven Design as a general skill for directing AI-assisted development.
Astralia is your living case study: every concept is learned over real repo
symbols (`src/domain/`, `src/application/`, `src/infrastructure/`, `src/pages/`),
never over invented examples.

Rule of the game: **no blind renames**. Before trusting stale documentation,
inspect `CONTEXT.md`, the current symbols, and `tests/architecture.test.ts`. Docs
can be outdated; the current code and the executable contract are the authority.

## Definition of success

For any proposed feature (by the AI, by a teammate, or by you), you can:

1. **Name the bounded context** — which boundary does this feature live in?
2. **State the domain concept and its invariant** — what rule must remain true?
3. **Classify the object** — entity, value object, or aggregate candidate?
4. **Choose the owning layer** — Domain, Application, Infrastructure, or Interfaces?
5. **Identify port + adapter** — what capability does the domain contract, and who implements it outside?
6. **List the allowed dependency edges** — what can import what?
7. **Require tests** — which test demonstrates the invariant or the layer contract?
8. **Explain the uncertainty or veto with evidence** — “the current map does not
   prove this; here is the evidence I need”.

You do not need perfect certainty. You need to be able to say, with evidence,
what is known and what remains to be proven — and ask the AI constrained
follow-up questions.

## How to use this space

- **`lessons/`** — ten short lessons (5-10 min of reading/practice), English,
  DDD terms in English, with a tangible artifact per lesson.
- **`reference/glossary-ddd-astralia.html`** — the 18 terms, each with a real Astralia example.
- **`learning-records/`** — per-session record: cold recall, artifact, judged AI proposal, confidence.
- **`RESOURCES.md`** — 2-4 week study path and curated resource list.
- **`NOTES.md`** — your preferences and learning style.

## Verification criterion (per-lesson checkpoint)

Each lesson ends with a reminder: record the session in `learning-records/`
before continuing. If you cannot name the new concept with a real Astralia
example, reread the lesson before moving on.
