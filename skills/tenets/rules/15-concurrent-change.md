# 15 Concurrent Change

Several agents or people changing one repository at once is normal. Contention is a design property
decided when work is split, not a merge problem resolved later.

## 15.1 Partition by Write Set

Two tasks run in parallel only when the files they will **write** are disjoint — reads may overlap
freely. Partition by write set, never by task description: "you take Stripe, I take PayPal" is not
a partition until the shared registry, barrel, manifest, and lockfile are accounted for. Name each
task's write set before starting; overlap means sequential work, or a structure change (15.7).

## 15.2 Name the Convergence Points

Some files are touched by every change of a kind: registries and barrels, lockfiles, generated
types, migration sequences, changelogs, root config, the project guide. They cannot be designed
away — only named and made cheap: **append-only**, **generated**, or **owned by one change at a
time** with that ownership stated. Rule 6.3's timestamped inbox filenames are the canonical shape.

## 15.3 One Writer Per Slice

A slice has one writer until it lands; a second agent takes an adjacent slice or waits.

## 15.4 Re-read Before Landing

A plan goes stale the moment another change lands. Before landing, re-read the files it names and
**re-derive** the change against what is there now. A conflict is information about the contract,
not just a text collision (Rules 10.2, 14.6).

## 15.5 Declare Integration Order

When concurrent changes depend on each other, declare the order before work starts: dependencies
before dependents, tests before the behavior they pin (Rule 14.4 across changes).

## 15.6 No Ceremony

Use what the tools provide: branches, worktrees, the task graph, small green commits (Rule 11.1).
Do not invent lock files, claim protocols, or ownership registries — coordination overhead standing
in for a decomposition fix (Rules 10.3, 10.4).

## 15.7 Structure Follows the Partition

If the natural split fights the structure, the structure is wrong. Repeated contention on one file
is a decomposition signal (Rule 7.10), not a scheduling problem (Conway).
