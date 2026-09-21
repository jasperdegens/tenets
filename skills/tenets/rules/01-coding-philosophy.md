# 01 Coding Philosophy

Functional-first, immutable, contract-driven code. Optimize for correctness, reviewability, and
agent legibility before speed.

## 1.1 Non-Negotiables

- Validate untrusted data at boundaries.
- Represent expected failure with `Result<T, E>` / `ResultAsync<T, E>`.
- Use `invariant()` only for impossible programmer-error states.
- Prefer immutable data: `const`, readonly inputs, spreads, non-mutating transforms.
- Keep modules deep: small public API, meaningful hidden implementation.
- Write behavioral tests before or alongside behavior changes.
- Document exported behavior and non-obvious decisions.

## 1.2 Design Order

1. **YAGNI:** no speculative extension points.
2. **KISS:** the simplest design that preserves the contract.
3. **DRY:** abstract after three real repetitions, or earlier only when Rule 1.6 justifies it.
4. **SOLID/principles:** only when they reduce real complexity.

Rule 10 governs larger architecture and tooling decisions.

## 1.3 Contracts Everywhere

Every public function, package boundary, adapter boundary, and workflow step has a contract:
**preconditions** (schema parse, type signature, or invariant), **postconditions** (returned values,
typed errors, persisted state, side effects, immutability promises), and **invariants** (facts that
stay true after success). Enforce contracts at both ends where cheap (Rule 2.2, the airlock).
Schemas own untrusted runtime boundaries; derive static types from the schema so the two cannot
drift.

## 1.4 Deep and Legible Code

State the contract before the code (Rule 14.1). Make invalid states unrepresentable: discriminated
unions, branded IDs, schemas, narrow public types. Export a purpose-built DTO, not the internal
domain model. Prefer predictable structure over cleverness — readers should find validation, core
logic, tests, and docs without guessing.

## 1.5 Clean Deletion

Replacing code removes the old path completely unless a migration period is explicitly required. No
`V2` names, deprecated shadows, speculative modules, or README stubs unless the task requires them.
Scaffold placeholders exist only before behavior does, and must say so.

## 1.6 Earning an Abstraction

Introduce an interface only for one of three reasons: the implementation behind it is likely to
change (Rule 3.6), a second real implementation already exists (Rule 7.10), or tests need a fake in
place of an external system. One real implementation plus a fake is enough; a second that might
exist someday is not. Keep the interface small: only the operations callers use, named in the
domain's terms, no provider or SDK types in its signatures (Rule 10.5), and one contract test every
implementation passes (Rule 4.4). When an interface has exactly one implementation and repeats its
methods one for one, delete it. Split a shared helper once it needs flags to tell its callers
apart — duplication is cheaper than the wrong abstraction.
