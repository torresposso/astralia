# Session 4 — Lessons 07 and 08

> Learning record. Fill each field with your own words; evidence
> (file, symbol, test) is mandatory in verdicts. Copy the block per lesson
> or use one file per session, whichever you prefer.

**Date:** ________
**Session:** Session 4 — Lessons 07 and 08 (use cases and the dependency rule)
**Next review (day 16):** ________

---

## Lesson 07 — User goals become use cases: the application layer

**Cold recall (60 s, before reading):**

- Who owns a port, and who implements the adapter?
  ***
- What is the difference between orchestrating and deciding?
  ***

**Exercise artifact:** the use-case card for one real flow

- Which flow did you trace? What are its Given/When/Then steps?
  ***
- Which domain concepts does it use? Which ports does it call? Where is the result mapped?
  ***

**AI proposal judged:** (persistence and birth rules directly in an API route — rejected or accepted?)

---

**Verdict and evidence:** (which use case and which port prove the correct placement?)

---

**Confidence (1-5):** ____

**Unresolved question:**

---

---

## Lesson 08 — The dependency rule: architecture as an AI navigation map

**Cold recall (60 s, before reading):**

- What does a use case orchestrate, and what does it never do?
  ***
- What does "inner layers never import outer layers" mean for files?
  ***

**Exercise artifact:** the AI Architecture Review Card for "add a second chart calculator"

- Contract change (if any), new adapter, unchanged policy, allowed imports, tests.
  ***
- Which dependency edges does `tests/architecture.test.ts` verify?
  ***

**AI proposal judged:** (a file-by-file plan — did every dependency edge pass the contract?)

---

**Verdict and evidence:** (accepted / vetoed? which edge or test proves it?)

---

**Confidence (1-5):** ____

**Unresolved question:**

---

---

## Session wrap-up

**One-sentence summary:** (what did you learn today that you can use with the AI tomorrow)

---

**Next session (day 16):** Lesson 09 — domain events and Lesson 10 — testing the domain.

**Spaced review (day 16, 10 min):** mix questions — "new Email rule" (context), "is BirthData a root?" (evidence), "new geocoder" (port/adapter), "second chart provider" (dependency rule).
