# 14 Planning

A plan is not a schedule; it is the contract stated before the code exists, where scope, contracts,
and tests are cheapest to change.

## 14.1 Minimum Viable Plan

Before non-trivial work, name six things — inline is enough: the **boundary** the change lives
behind, the **public API** it adds or changes, the **error cases** callers can act on, the
**invariants** that stay true after success, the **tests** that would fail without it, and the
**docs** it makes stale. Unable to name one? Resolve that before writing code. The project guide
names the template for work that warrants a written plan.

## 14.2 Requirement Before Mechanism

Restate the product requirement before designing (Rule 10.1). A request naming a solution ("add a
cache", "make it a plugin") gets the requirement extracted first — most shrink once the existing
boundary, primitive, or tool capability is inspected.

## 14.3 Examples Are the Plan's Test List

Rule 4.2's examples, each a named test at a stated path; an example with no expressible assertion
becomes a question, not a test.

## 14.4 Slices

Cut work into independently valuable slices, each landing green and revertable (Rules 11.1, 11.2).
A slice names the files it touches, the test that goes red first, and the gate it must pass; tests
precede the behavior they pin and primitives precede their callers. Past roughly five slices, it is
two plans — split.

## 14.5 Push Back Before Planning Around a Conflict

Rule 10.6's pushback comes **before** the plan, never as a caveat inside it.

## 14.6 Plans Are Disposable, Contracts Are Not

When implementation contradicts the plan, the plan loses — but re-check the requirement and the
contract first (Rule 10.2). Fold what proved durable into docs, tests, or a decision record and
discard the rest (Rule 5.5).
