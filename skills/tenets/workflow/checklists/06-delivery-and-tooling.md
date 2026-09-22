# Dimension 6 — Delivery and tooling (Rules 11, 15, 16, 17, 08)

- Is each commit one logical change, with refactors separated from behavior changes? (11.1)
- Does every commit pass the acceptance gate and revert cleanly on its own? (11.2)
- Is unfinished behavior unreachable — behind a flag or unwired — rather than half-shipped, and is
  that isolation deleted when the work completes? (11.2, 1.5)
- Are branch commits imperative and carrying the why, not a file list? (11.2)
- Is any metric being optimized as a target rather than read as a signal? (11.3)
- Does a production-relevant behavior change ship the signal to see it fail: a log with actionable
  context, a health state, or a metric? (11.4)
- Are expected failures logged where the boundary translates them, and invariant failures surfaced
  loudly? (11.4)
- Does normal work use documented repository-owned commands, with no undocumented global tools or ad
  hoc variants? (08)
- Are new dependencies, packages, root-config changes, or gate changes within explicit task scope or
  backed by a decision record? (7.8, 8.3)
- Are there local suppressions standing in for a central decision? (08)
- Does new enforcement prefer native tool capability over custom policy code? (08, 10.4)
- Are cache declarations and generated-state exclusions accurate and aligned across tools? (8.3)
- Do hooks stay cheap and scoped, never running integration or end-to-end work? (8.2)
- If work was split across agents or worktrees, were the write sets disjoint — or did two changes
  edit one file? (15.1)
- Are the convergence points this change touched append-only, generated, or singly owned? (15.2)
- Was the plan re-derived against what actually landed, rather than replayed against stale state?
  (15.4)
- Was the report measured before it was theorized about — records and telemetry read, and whatever
  could not be read named? (16.1)
- Does the change fix the mechanism that let the symptom occur, not the instance? (16.1, 10.2)
- Is it one defect per change, with unrelated findings split out or captured in the inbox? (16.2,
  11.1)
- Do failure messages name what was measured, what would have passed, and what to do next? (16.2,
  11.4)
- Is the reproduction the first test, built from the observed case's own numbers, and shown failing
  before the fix? (16.3, 4.2)
- Does the title name the outcome in the product's words — no type prefix, ticket code, or
  mechanism? (16.4)
- Does the write-up carry every Rule 16.5 section, claim only checks that were run, and say "Fixes"
  only when the reported cause is removed? (16.5, 16.7)
- Does the comment at the fix site carry the issue number and what the defect looked like? (16.5,
  5.3)
- Where a human eye is the check, is the evidence posted where the reviewer looks — never a local
  path — with the question it answers beside it, and failures shown the same way? (17.1)
- Does a visible change carry a screenshot of the result at the viewports it affects? (17.2)
- Does anything running in a live system, including every live push, carry the URL the reviewer
  can open? (17.3)
- Is anything that cannot run in the remote environment named in the plan's slice and under the
  write-up's "Not run", rather than deferred to a local machine? (17.4, 14.4, 16.5)
