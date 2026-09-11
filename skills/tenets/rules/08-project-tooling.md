# 08 Project Tooling

Normal work uses documented repository-owned commands, never undocumented global tools or ad hoc
variants; the project guide owns the tool stack and command table. Rules own intent, ADRs own
calibrated decisions, tool config owns mechanical enforcement, and policy checks own only the
cross-file rules tools cannot express — resolve disagreements centrally, never with local
suppressions.

## 8.1 Command Surface

One command per common action; no hidden global dependencies or required flags for normal checks;
readable streaming output; deterministic setup through documented install commands. Root scripts
stay human-facing; orchestration lives behind package commands or tool config. The declared task
graph is the impact and cache authority: routine validation covers affected components and
downstream consumers with accurate inputs, and validation, tests, and builds stay distinct phases
(scoped runs: Rule 4.8).

## 8.2 Automated Feedback Hooks

Frequent hooks stay cheap and scoped; broader validation belongs at phase boundaries. Hooks never
run integration or E2E — those touch external systems and require an intentional decision.

## 8.3 Config Rules

- Prefer a commented config format where comments help agents.
- Keep cache declarations accurate and generated/local-state exclusions aligned across tools.
- Prefer native rules and dependency analysis before syntax-tree analysis; never duplicate a native
  check without measured justification.
- Automated writes stay behavior-preserving; unsafe fixes get review and targeted behavioral tests.
- Add a reasonable tool dependency instead of building around its absence.
