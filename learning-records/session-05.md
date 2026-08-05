# Session 5 — Lessons 09 and 10

> Learning record. Fill each field with your own words; evidence
> (file, symbol, test) is mandatory in verdicts. Copy the block per lesson
> or use one file per session, whichever you prefer.

**Date:** ________
**Session:** Session 5 — Lessons 09 and 10 (domain events and testing the domain)
**Next review (day 30):** ________

---

## Lesson 09 — What already happened: domain events

**Cold recall (60 s, before reading):**

- What does the dependency rule allow the domain to know about the outside?
  ***
- Why are events named in the past tense?
  ***

**Exercise artifact:** the design of `BirthDataSaved` / `DstAmbiguousWarning` (on paper)

- Who publishes? What is the event name? Who could subscribe?
  ***
- Does the source know its subscribers? How did you check?
  ***

**AI proposal judged:** (an event flow for birth-data save — did the source stay decoupled?)

---

**Verdict and evidence:** (accepted / vetoed? which wiring proves the decoupling?)

---

**Confidence (1-5):** ____

**Unresolved question:**

---

---

## Lesson 10 — Prove the rules where they live: testing the domain

**Cold recall (60 s, before reading):**

- What is a domain event, and why is it immutable?
  ***
- What is the difference between a unit test and an integration test?
  ***

**Exercise artifact:** the test ladder (identify → modify → create)

- Which tests are bench tests? Which are traffic tests? Which is the layer police?
  ***
- Write the Given/When/Then for a new birth rule: date must not be in the future.
  ***

**AI proposal judged:** (AI-generated tests for a new birth rule — did it write domain-level tests without mocking frameworks?)

---

**Verdict and evidence:** (accepted / vetoed? which test file proves the approach?)

---

**Confidence (1-5):** ____

**Unresolved question:**

---

---

## Session wrap-up

**One-sentence summary:** (what did you learn today that you can use with the AI tomorrow)

---

**Course complete:** 10 lessons. Cold feature-placement audit on day 30: place four features (new Email rule, alternate geocoder, second chart provider, new HTTP response) with context, invariant, dependency edge, and test.

**Spaced review (day 30, cold audit):** do not peek — answer "where does X go?" from memory, then check `CONTEXT.md` and `tests/architecture.test.ts`.
