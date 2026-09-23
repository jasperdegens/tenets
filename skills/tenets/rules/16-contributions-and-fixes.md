# 16 Contributions and Fixes

A merged commit must tell a stranger why the change exists, what it proved, and what remains.

## 16.1 Before Touching Code

- Start from the current base; check whether the defect is fixed or already in flight (Rule 15.4).
- Measure before theorizing. Inspect available records and telemetry; name missing evidence and what
  would settle the question.
- Separate the symptom from the fault. If behavior is correct, close the report with evidence, not
  for staleness.
- Fix the mechanism that caused the symptom, not its single instance (Rule 10.2).

## 16.2 Scope

- One defect per change; move unrelated findings to another change or the inbox (Rules 11.1, 6.1).
- Do not change scope silently. Update and call out any changed contract (Rule 5.5).
- Compute a fact once when both behavior and UI/docs report it.
- User-facing errors state what failed, what passes, and the next action—not an internal name or
  bare code (Rule 11.4).

## 16.3 Proof

- Make the observed case the first test, using its real values.
- See each new test fail for the defect before fixing it; record that proof (Rule 4.2).
- Exercise user-facing changes before and after with the named fixtures; provide Rule 17.2's visual
  proof when applicable.
- Run the guide's affected acceptance gate and generators; list omissions under `Not run` (Rule
  4.8).

## 16.4 Branches and Titles

Unless the guide differs, branches use `fix/`, `feat/`, `ops/`, or `chore/` plus a short kebab-case
outcome. The title is one plain sentence describing the user outcome in product language—no type
prefix, ticket code, or mechanism.

Bad: `fix(billing): null check on invoice total`
Good: `An invoice with no lines totals zero instead of failing to render`

Rule 11.2's imperative applies to commits; a squash title states the outcome readers will scan.

## 16.5 The Write-Up

The pull request body must stand alone as the change record:

```text
Fixes #123.            (or: Relevant to #123, though not a claim about which fault was hit)

**What was reported.**  The observed symptom and identifying evidence.
**Why.**                The boundary that decided the behavior, and what it assumed.
**The change.**         What moved, and what deliberately did not.
**Evidence.**           Before and after, or measured values.
**Tests.**              What each proves, and which fail without the change.
**For the reviewer.**   Semantic changes, trade-offs, rollout or migration notes.
**Still open.**         What was found and left alone, and what would settle it.
**Verified.**           Commands plus any Rule 17 artifact.
**Not run.**            Omitted checks and why.
```

State facts and consequences, not an investigation diary. Use measured values; never expose secrets
or personal data. Use `Fixes #N` only when the cause is removed; otherwise use `Relevant to #N` and
state what remains unknown. A necessary code comment explains the defect, not merely its issue
number (Rule 5.3).

## 16.6 Closing the Loop

- Report what was observed, wrong, changed, and still needed. Ask for specific evidence, not "more
  information"; plainly correct earlier claims.
- Keep the pull request draft until its verification claims are true.
- Tool attribution follows repository policy and never replaces the accountable author.

## 16.7 Review Rule

A missing write-up section, a required check left unrun, or a fix with no test that fails without it
is REQUIRED CHANGES (Rule 9.1). A body that claims a check it did not run is BLOCK: the log now
lies (Rule 5.6).
