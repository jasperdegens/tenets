# 03 Function Design

Functions should be predictable to scan and hard to misuse.

## 3.1 Standard Ordering

Boundary parse or precondition invariants; derived values; core logic; postcondition assertions
where a promise is worth checking; return. Pure utilities on trusted, typed inputs may skip
validation. Framework-specific ordering (components, hooks, handlers) comes from the framework's
own guidance; the project guide names it.

## 3.2 Thin Wrappers

HTTP handlers, RPC/tool endpoints, CLI commands, SDK methods, and server-side action handlers stay
thin: parse input, call one use-case function, map `Result` to protocol output. Orchestration,
`.andThen()` chains, provider calls, and persistence decisions live in services, not wrappers.

## 3.3 Control Flow

Keep control flow flat, bounded, and boring:

- Length past ~70 lines or nesting past ~3 levels is a review signal — split for ownership and
  testability, not to hit a number.
- Push conditionals up into the caller and loops down into leaf helpers.
- No nested ternaries or compound boolean soup — name intermediate conditions.
- Every loop over unbounded input carries an explicit bound (limit, pagination cap, timeout) or a
  comment stating why the input is finite; reject work over capacity rather than growing.
- Recursion needs a documented termination bound; prefer an explicit stack or loop.

## 3.4 Function Shape

One object parameter for multi-input operations; units in names (`timeoutMs`, `sizeBytes`); boolean
prefixes (`is`, `has`, `should`, `can`, `did`); domain types over primitive parameter trains; narrow,
declared return types on exports; non-mutating collection transforms, with a named loop when a fold
would obscure state. Never `fn(a, true, 5000, false)`, boolean flags that switch unrelated behavior,
pass-through functions that hide nothing, public helpers callers must sequence by hand, or functions
that both compute and perform unrelated side effects.

## 3.5 Naming

`parse` returns typed data or a validation result; `validate` checks an already-shaped value.
Collections plural, items singular. Allowed abbreviations: `id`, `url`, `api`, `db`, `env`, `auth`,
`req`, `res`, `config`.

## 3.6 Deep Module Interface

A public API hides a volatile decision: resource state, provider quirks, retry/cleanup policy,
storage layout, session lifecycle, policy evaluation. Caller-knowledge test: if callers must know
resolution order, retry rules, startup sequencing, or polling cadence, the module is too shallow.
Prefer one deep operation — `prepareOrderShipment(input)` — over exporting `resolveCarrier`,
`reserveStock`, and `printLabel` for callers to assemble; split only when each public operation
owns a separate business capability and test boundary.

## 3.7 Railway-Oriented Programming

Compose `Result` values in service/domain layers where expected-failure operations chain; no ROP in
UI components, protocol wrappers, or simple pure transforms. When a chain gets hard to debug, name
the steps: `settleInvoice(input)` public with private `validateClaim`, `reserveFunds`,
`recordSettlement` — not a 14-step anonymous `.andThen()` chain.

## 3.8 Side Effects

Name and isolate side effects: filesystem, network/provider, storage, process/env, clock/randomness.
Side-effecting functions state idempotency, retries, and expected errors in the contract. Product
modules receive injected environment, logger, and clock; raw environment access, ambient logging,
and process termination stay in designated adapters (the profile names them).
