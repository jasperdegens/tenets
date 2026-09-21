# 07 Repository Conventions

The repo shape is part of the contract: never invent a new structure when an existing package family
fits. These rules assume a workspace monorepo; the project guide names the namespace, stack, and
paths.

## 7.1 Workspace Families

`apps/*` private deployed entrypoints; `packages/*` public or potentially publishable reusable
capabilities; `libs/*` private internal utilities. These names are rule vocabulary; a guide may map
differently named directories onto them. All workspaces share one package namespace, uncoupled from
product, deployment, or repository names; product names live in prose and executables, not import
paths.

Inter-workspace APIs are the manifest's explicitly declared exports pointing to cohesive source
modules (the profile names the mechanism); a broad root barrel is prohibited unless the package is
one small cohesive contract.

## 7.2 Boundaries

Import other workspaces only through public exports, by installed workspace name — never their
internals; package-internal references may use the ecosystem's alias mechanism. Apps compose
packages and libs; packages depend on other packages' public APIs; libs never depend on apps.
Provider adapters isolate SDKs and quirks inside the owning package. The project guide records the
permitted directions and their enforcement.

## 7.3 Public API Discipline

Declared exports are the public API — inter-workspace APIs, exported schemas, CLI/API contracts,
adapter capabilities, and persisted artifacts callers rely on. Export the smallest useful surface:
never internal helpers, intermediate domain models, provider-specific types, or sequencing details;
every export needs tests and docs. Reserve `@internal` for useful test-only exports. Review signals,
not gates: a file past ~500 lines (keep cohesive schemas, fixtures, and migrations together), or
more than ~20 exports from one module — split into cohesive subpaths, not a broad aggregator.

## 7.4 Schema Ownership

The package that owns an operation owns its public schema and derived type; callers import the
schema, never duplicate the shape. Packages are trust boundaries: public package functions parse
untrusted inputs even when called from another workspace.

## 7.5 Architecture Ownership

The project guide and its architecture notes own repository-specific boundaries and state ownership.
Canonical state (reviewed config, schemas, public APIs, control files, compiled knowledge) is
durable and never silently removed; operational state (caches, sessions, retry markers, cursors) may
be cleaned up when policy allows.

Moving canonical ownership, adding a workspace family, introducing storage, or altering public API
boundaries needs an ADR-level reason and matching docs. A package earns existence when one deep
operation — `reconcileInventory(input)` — hides classification, ordering, cleanup, and recovery
policy, testable and versionable on its own; never to group helpers (`date-utils`).

## 7.6 Shared Primitives

Never reimplement the shared primitives: the result type and constructors, the invariant assertion
and its failure type, branded IDs and schema helpers once implemented. The profile fixes their
names; the guide names where they live. A domain-specific utility stays local until a second
package truly needs it. Changing the primitives is an architecture decision.

## 7.7 Type-System Strictness

Enable the profile's non-negotiable strictness settings; never use the escape hatches it forbids.
Narrow untyped values before use.

## 7.8 Root Changes

No new dependencies, packages, root-config changes, or build/test/lint behavior changes without
explicit task scope or an ADR-level reason.

## 7.9 Shared Vocabulary

Consult the project glossary before naming domain APIs or docs; add durable vocabulary there, or
write an inbox entry when a term needs curation. A concept touched by two workspaces, commands, or
docs gets one shared definition.

## 7.10 Decomposition for Locality

Organize a workspace's interior by capability, not technical layer: `controllers/`, `services/` and
`models/` scatter one capability across three directories, so every change is wide and every
concurrent change overlaps (Rule 15.1). Group by the decision a module hides (Parnas). **The
deletion test**: removing a capability deletes one directory and unwires one export; if it takes
edits across four layers, the boundary is in the wrong place.

Rule 7.2's internal-import ban applies at module granularity too: a sibling capability's
unpublished files are as off-limits as another workspace's internals. A capability earns
*workspace* status when it needs independent ownership, release, or testing — the point at which
its boundary becomes machine-enforced rather than conventional.

Expose a family of implementations behind one shared interface, and let the consumer wire only the
implementations it uses. Never a broad aggregator re-exporting every implementation (Rules 7.3,
15.2); a hand-maintained registry is a recorded deviation with that cost stated.
