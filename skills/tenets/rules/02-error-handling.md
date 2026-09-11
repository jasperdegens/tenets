# 02 Error Handling

Every failure lives in exactly one tier: boundary schema, invariant, or typed `Result`.

## 2.1 Tier 1: Boundary Validation

Parse with a schema wherever data enters a trust boundary — HTTP/RPC/tool/CLI/SDK/worker/adapter
inputs, provider responses, file contents, environment variables, URL and query params, and public
package functions called from another workspace. Use the schema's non-throwing parse API (the
profile names it) and the parsed value; never cast. The package that owns a public operation owns
and exports its schema (Rule 7.4).

## 2.2 Tier 2: Invariants and the Airlock

`invariant(condition, message)` marks states impossible in correct code: corrupted internal state,
an impossible union branch, data missing after validation guaranteed it, a violated postcondition
after a trusted operation. Invariant failures throw and are never caught to recover — that launders
a bug into control flow.

Assert both ends of an interaction (the airlock): preconditions at entry, postconditions before
return when a trusted operation makes a promise worth checking, and at a call site that cannot
tolerate a broken promise. Messages name the violated expectation. Density is a review signal, not
a quota: assert non-obvious relationships; a simple pure transform needs nothing.

## 2.3 Tier 3: Expected Failures

Recoverable workflow and domain failures — not found, unauthorized, conflict, provider timeout,
rate limit, storage write failure, unsupported capability — return `Result<T, E>` /
`ResultAsync<T, E>`. Each error is a discriminated object with a `type` field and context enough
for callers and tests. Service/domain layers compose `Result` values; wrappers map them at the edge
(Rule 3.2).

A throwing dependency (SDK, CLI, synchronous parser) is translated once, at its adapter seam, and
the decision recorded in the adapter's contract: wrap into a typed `Result` carrying the failure
kind, provider identity, and cause when a caller retries, branches on, or degrades around it; let
it propagate when no caller can act on it. The translating `catch` rethrows an invariant failure
unchanged (the profile shows the shape).

## 2.4 Prohibitions

- No bare string errors; no type-system bypasses (Rule 7.7).
- No untyped expected throws; no throwing across a recoverable contract.
- No `try/catch` for business branching; no swallowed errors.
- No dropped `Result`: each one is matched, mapped, returned, or explicitly unwrapped.
- No `null`/`undefined` for known failure states.
- No manual checks where a schema owns the boundary; no provider errors surfaced as user-facing
  strings.

## 2.5 Decision Flow

Untrusted or boundary-crossing data → schema. Impossible if the code is correct → `invariant()`.
Caller can recover or choose a path → typed `Result`. A declared throwing boundary → throw there,
translate at the adapter (Rule 2.3). None of the above → re-check the contract.

## 2.6 Tests Required

Rule 4.3 lists the tests every `Result`-returning function and boundary carries.
