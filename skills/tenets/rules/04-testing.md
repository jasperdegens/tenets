# 04 Testing

Tests prove behavior, not structure; every test answers **what bug would this catch?** Each covers
one realistic behavior a caller can trigger; mock only slow, flaky, nondeterministic, or
side-effectful boundaries.

## 4.1 Required Shape

Use the runner's explicit declaration form (the profile shows it): name the unit under test, name
the observable behavior, carry the example in Given/When/Then comments, and assert the expected
rejection message — not merely that something threw.

## 4.2 Behavioral TDD Loop

Derive concrete examples from the requirement — one per business rule plus the boundary cases where
it bends — named in domain language (Rule 7.9). The example list is the test list; an example with
no expressible assertion means the requirement is not yet understood.

1. **Red:** a behavioral test at the smallest boundary that would fail without the behavior —
   public contracts when clear, internal seams when they own meaningful behavior. It counts only
   when it fails for the contract reason, not setup noise.
2. **Green:** the smallest code that satisfies the contract.
3. **Refactor:** simplify names, modules, duplication — only while green.

## 4.3 Coverage Rules

Coverage is feedback, never a target or gate (Rule 11.3) — a deliberate calibration away from
safety-critical test-per-function mandates; tests written to satisfy a number rot trust.

Every behavior change covers the happy path, every documented `Result` error type, schema rejection
at the boundary, invariant throws where they exist, and observable postconditions (persisted state,
emitted events, cleanup, immutability); plus, when touched, authentication, authorization, resource
cleanup, external mutations, and policy decisions.

## 4.4 Boundaries and Contracts

Test through public APIs — package exports, routes, RPC/tool schemas, CLI output, SDK methods,
adapter contracts. An internal seam is a valid subject when it owns parsing, normalization,
idempotency, retry math, or state transitions, and it still proves observable behavior; Rule 7.2's
internal-import ban applies to tests.

Interchangeable adapters each run one shared contract test — never an E2E provider cross-product.
Tests of an interface that hides sequencing assert success and caller-observable failure, never
helper counts, call order, or cache internals. For state machines, queues, and idempotency keys,
test invariants across states: repeated cycles do not duplicate active work; in-progress data
survives.

## 4.5 Test Data

Factories with sensible defaults; tests override only relevant fields. Prefer upstream-maintained
helpers at external boundaries (network, storage, filesystem, clock, process/env). Never mock the
unit under test or internal helpers to ease assertions; never maintain a substitute implementation
of an external protocol when collaborator tests plus one real integration prove more.

## 4.6 Organization and Levels

Tests live with the owning workspace; the outer name is the public unit (`CatalogService.search`),
the inner name is observable behavior. The project guide owns locations, patterns, runners, and
selection. Use the lowest level that proves the contract:

- **Unit:** pure contracts, parsing, state transitions, typed errors; never touches live services.
- **Local integration:** one real local boundary or resource lifecycle.
- **Live integration:** one real remote boundary and its cleanup contract — fakes prove routing
  logic; only a real run proves the external side.
- **E2E:** one full-journey proof; when it exposes a stable boundary contract, move it down.

## 4.7 Prohibitions

- No tests that only prove exports exist, or that pass when the implementation is a no-op.
- No snapshots as a substitute for behavioral assertions.
- No asserting private helper call order unless it is part of the public contract.
- No deleting or weakening a test to fit a change (Rule 10.2) unless the contract changed and the
  docs say so.

## 4.8 Release Gates

Routine validation is affected-aware and cacheable; release gates rerun the full suite without
trusting cache. A selected test fails when prerequisites are missing — never a skip. Scoped runs are
debugging tools, not completion evidence: record what was omitted and why. The project guide owns
phase commands.
