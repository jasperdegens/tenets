# 16 Contributions and Fixes

A change is finished when a stranger can read, from the merged commit alone, why it exists, what it
proved, and what it left open. Rules 01–05 say what code, tests, and docs must be, and Rule 11 how
commits land; this rule says how a change is investigated, scoped, proved, written up, and closed.

## 16.1 Before Touching Code

- Start from the current base branch: fetch, then check whether the report is already fixed or in
  flight — a second fix of the same defect is a defect (Rule 15.4, at the start as well as the end).
- Measure before theorizing. For a report from a live environment, read the records and telemetry
  first — ids, timestamps, job rows, request logs. What cannot be read, say so, and name what would
  settle it.
- Separate what was seen from what is wrong. A report can describe correct behavior: say so on the
  issue with the evidence, and close it with the finding, never for staleness.
- Fix the mechanism, not the instance (Rule 10.2). When a specific throw was hit, ask what structure
  let a throw there become that symptom, and fix the structure.

## 16.2 Scope

- One defect per change (Rule 11.1). An unrelated finding becomes its own change, marked "Not tied
  to an open issue", or an inbox entry (Rule 6.1).
- The requested fix is the deliverable; never widen or narrow it quietly. A fix that changes what a
  documented field, option, or state means says so under "For the reviewer" and updates the
  contract text and docs in the same change (Rule 5.5).
- When two surfaces derive one fact — an enforcing path and a reporting path, say — derive it once
  and make both read it. Drift between them is itself a defect (Rule 5.5).
- Words a person reads are part of the fix. A failure message names what was measured, what would
  have passed, and what to do next — never an environment variable's name or a bare code
  (Rule 11.4). A state badge carries its reason, and every refused state offers the lever that
  clears it.

## 16.3 Proof

- Build tests from the observed case's own numbers; for a report, the reproduction is the first
  test.
- Show each new test failing against the unfixed behavior and say so in the write-up. An assertion
  nobody has seen fail is a hypothesis (Rule 4.2).
- Exercise a user-facing change before and after on the surface the user sees, against the fixtures
  or the local stack the project guide names, and add or adjust a fixture so the state under test
  stays visible there afterwards.
- Run the project guide's acceptance gate for the touched layers, and any generation step until its
  diff is clean. Record what was not run and why (Rule 4.8).

## 16.4 Branches and Titles

Branch names carry a kind prefix — `fix/`, `feat/`, `ops/`, or `chore/` unless the project guide's
Change delivery slot says otherwise — and a short kebab-case description of the outcome.

A title is one plain sentence naming what the user gets after the change, in the product's words:
no type prefixes, no ticket codes, no mechanism.

Bad: `fix(billing): null check on invoice total`
Good: `An invoice with no lines totals zero instead of failing to render`

Deliberate calibration: Rule 11.2's imperative mood governs branch commits, which record actions
taken. The title — the merged subject under squash merging — is scanned to learn what changed for
the reader, so it states the outcome.

## 16.5 The Write-Up

The pull request body is the change's record and, where the project squash-merges, the merged
commit's message, so it must stand alone in the log. Its shape:

```text
Fixes #123.            (or: Relevant to #123, though not a claim about which fault was hit)

**What was reported.**  The symptom in the reporter's terms, with ids and times.
**Why.**                The boundary that decided the behavior, and what it assumed.
**The change.**         What moved, and what deliberately did not.
Before and after, or the measured numbers, in a fenced block.
**Tests.**              What each proves, and which fail without the change.
**For the reviewer.**   Semantic changes, trade-offs, rollout or migration notes.
**Still open.**         What was found and left alone, and what would settle it.
Verified locally: the exact commands and checks run. Not run: what, and why.
```

- Paragraphs open with a bold lead-in and state facts and consequences, not the story of the
  investigation.
- Numbers are measured and quoted, never estimated in prose. Quote ids and counts; never
  credentials, tokens, or personal data.
- "Fixes #N" only when the change removes the reported cause. Otherwise "Relevant to #N", plus what
  remains unknown.
- The comment at the site of the fix carries the issue number and what the defect looked like to
  the person who hit it (Rule 5.3).

## 16.6 Closing the Loop

- Answer on the issue in the write-up's terms: what was seen, what was wrong, what changed, and what
  is still needed from the reporter. Ask for specific ids, timestamps, or screenshots, never "more
  information".
- Correct an earlier comment in the thread as plainly as the finding that replaces it.
- Open the pull request as a draft until every claim in its verification line has been run. Ready
  for review means the body is true.
- Tool attribution follows repository policy and never replaces the accountable author.

## 16.7 Review Rule

A missing write-up section, a required check left unrun, or a fix with no test that fails without it
is REQUIRED CHANGES (Rule 9.1). A body that claims a check it did not run is BLOCK: the log now
lies (Rule 5.6).
