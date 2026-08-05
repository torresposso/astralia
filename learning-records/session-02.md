# Session 2 — Lessons 03 and 04

> Learning record. Fill each field with your own words; evidence
> (file, symbol, test) is mandatory in verdicts. Copy the block per lesson
> or use one file per session, whichever you prefer.

**Date:** ________
**Session:** Session 2 — Lessons 03 and 04 (ubiquitous language and entity vs value object)
**Next review (day 5):** ________

---

## Lesson 03 — Words are architecture: ubiquitous language

**Cold recall (60 s, before reading):**

- What is a domain model, in your own words?
  ***
- Why does the same word need a single meaning inside a bounded context?
  ***

**Exercise artifact:** the language contract table (term, plain meaning, bounded context, real symbols, forbidden/ambiguous synonyms)

- Which terms from `CONTEXT.md` did you place? Which synonyms are forbidden and why?
  ***
- The overloaded `BirthData` family: what different roles does the same word play?
  ***

**AI proposal judged:** (`SaveBirthData` → `CreateBirthDataUseCase` — did it justify the rename with context and behavior?)

---

**Verdict and evidence:** (accepted / vetoed? which file or symbol proves it?)

---

**Confidence (1-5):** ____

**Unresolved question:**

---

---

## Lesson 04 — Identity versus description: entity and value object

**Cold recall (60 s, before reading):**

- What did we learn about vocabulary in Lesson 03?
  ***
- What makes a $5 bill a value object and you an entity?
  ***

**Exercise artifact:** the entity/VO decision card (identity, equality, mutation, reason)

- `User.entity.ts` vs the `.vo.ts` files: what is the deciding question?
  ***
- Hypothetical `Timezone` and `ChartPreferences`: what did you decide and why?
  ***

**AI proposal judged:** ("Give Email a UUID so it can be stored independently" — accepted or vetoed?)

---

**Verdict and evidence:** (which rule — identity or equality — supports it?)

---

**Confidence (1-5):** ____

**Unresolved question:**

---

---

## Session wrap-up

**One-sentence summary:** (what did you learn today that you can use with the AI tomorrow)

---

**Next session (day 6-7):** Lesson 05 — protecting consistency (aggregate) and Lesson 06 — ports, adapters, repository.

**Spaced review (day 5, 10 min):** mix questions — "new Email rule" (context), "is BirthData a root?" (evidence), "new geocoder" (port/adapter), "what is a domain model?" (definition with example).
