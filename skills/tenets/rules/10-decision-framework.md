# 10 Decision Framework

Apply before choosing architecture, implementation path, integration boundary, tool setup, storage
model, API shape, or a substantial refactor.

## 10.1 Decision Order

1. Restate the **product requirement**, not the proposed mechanism.
2. Check the relevant engineering rules.
3. Inspect existing code, boundaries, tools, providers, libraries, platform capabilities.
4. For external or version-sensitive behavior, read current evidence: docs, changelogs, CLI help,
   source.
5. Choose the simplest path that satisfies the requirement, preserves contracts, and keeps
   ownership clear.

Custom code is justified only after the native tool, library, or existing primitive is understood
and proven insufficient.

## 10.2 Contract Contradictions

Observed behavior that contradicts an expected contract is a bug until proven otherwise — never
explain it away, weaken tests, broaden docs, or add fallbacks before the root cause. Keep or add the
failing assertion; instrument the exact boundary that decides the behavior; prove whether the call,
state, config, version, provider, or docs are wrong. Accept new behavior only with the source that
proves the contract changed; if the bug is ours, fix the caller and keep the stricter contract.

## 10.3 Occam's Razor

Prefer the fewest moving parts: remove layers, protocols, scripts, abstractions, states, fallbacks,
and configuration that correctness, safety, and observability do not need. If the tool already does
it, configure the tool. If a boundary can hide complexity, deepen the boundary. If a workflow needs
many special cases, recheck ownership. If a fix needs a workaround for a workaround, reread the
product goal. The preferred design is boring at the call site and explicit at the boundary.

## 10.4 Tool-Native Order

Prefer, in order: existing tool/platform/provider capability; repo-owned configuration; a thin
delegating script or adapter; custom implementation only when nothing else can express it. Stop
before duplicating the package manager, task runner, formatter, compiler, test runner, dependency
analyzer, Git, deployment platform, database, schema system, or an existing module.

Deliberate calibration: this inverts the zero-dependency default of safety-critical sources —
product engineering buys leverage from mature tooling.

## 10.5 Ownership Boundaries

When each fix adds wrappers, fallbacks, shims, or config exceptions, stop and restate ownership.
Application/domain code owns behavior, contracts, and state transitions; orchestration (jobs,
workflows, schedulers) owns lifecycle, retries, publishing, cleanup; providers stay behind adapters
and never define core vocabulary (Rule 1.6); policy tooling verifies rules and reimplements nothing.
Provider types, payloads, or protocol terms found in service or domain logic move behind the
adapter.

## 10.6 Pushback and Pivot

Push back before implementing when a request would weaken boundaries, duplicate tools, sprawl root
config, add speculative extension points, hide security/audit risk, or turn uncertainty into
abstraction: name the product goal, the conflict, the rule or tool contract, and the simpler shape;
ask only when product or architecture judgment is required. Uncertainty is acceptable; hiding it in
code is not. Before changing root config, dependencies, or architecture from local symptoms, apply
Rule 6.2.

## 10.7 Final Check

The implementation serves the requirement; public surface smaller than hidden implementation; the
chosen layer owns the side effects; provider details behind adapters; boundary behavior tested;
failures observable (Rule 11.4); decisions documented; replaced paths removed. If not, simplify
before adding code.
