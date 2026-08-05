# Session 3 — Lessons 05 and 06

> Learning record. Fill each field with your own words; evidence
> (file, symbol, test) is mandatory in verdicts. Copy the block per lesson
> or use one file per session, whichever you prefer.

**Date:** ________
**Session:** Session 3 — Lessons 05 and 06 (aggregate and ports/adapters/repository)
**Next review (day 9):** ________

---

## Lesson 05 — Protecting consistency: aggregate and aggregate root

**Cold recall (60 s, before reading):**

- What is the difference between an entity and a value object?
  ***
- What evidence would prove an object is an aggregate root?
  ***

**Exercise artifact:** the aggregate boundary card for `BirthData.vo.ts`

- What must be valid together? What has identity across saves?
  ***
- The crucial conclusion: what does `BirthData.vo.ts` prove, and what does it NOT prove?
  ***

**AI proposal judged:** ("turn BirthData.vo.ts into an aggregate root" — did it prove identity and invariants?)

---

**Verdict and evidence:** (accepted / vetoed? which file or symbol proves it?)

---

**Confidence (1-5):** ____

**Unresolved question:**

---

---

## Lesson 06 — Contracts inward, technology outward: ports, adapters, repository

**Cold recall (60 s, before reading):**

- What did Lesson 05 conclude about aggregate roots in Astralia?
  ***
- What is an interface, and what does it promise?
  ***

**Exercise artifact:** the port-to-adapter table

- For each row: who owns the interface? who knows the vendor? what stays unchanged when the vendor changes?
  ***
- Which rows surprised you, and why?
  ***

**AI proposal judged:** (an OpenMeteo replacement — did the plan keep the provider SDK out of the domain?)

---

**Verdict and evidence:** (accepted / vetoed? which import edge proves it?)

---

**Confidence (1-5):** ____

**Unresolved question:**

---

---

## Session wrap-up

**One-sentence summary:** (what did you learn today that you can use with the AI tomorrow)

---

**Next session (day 10-14):** Lesson 07 — use cases and Lesson 08 — the dependency rule.

**Spaced review (day 9, 10 min):** mix questions — "new Email rule" (context), "is BirthData a root?" (evidence), "new geocoder" (port/adapter), "what is a domain model?" (definition with example).
