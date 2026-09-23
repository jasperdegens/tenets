# Changelog

## Unreleased

**Rule 18 Environments and Worktrees** is new, with the worktree setup it calls for. Configuration
reaches code only through the process environment: every variable is declared once, in the contract
parsed at startup and in a committed example file (18.1); env files are a local convenience, loaded
before the contract is parsed and never required, while remote environments get the same variables
from their platform (18.2); real values stay out of commits, logs, write-ups and prompts, and a
client-prefixed value is public (18.3). A worktree or fresh clone becomes runnable through one
idempotent command — copy the gitignored files `.worktreeinclude` names, install from the lockfile,
parse the contract — that every harness's worktree hook calls (18.4); worktrees share history, not
ports, databases or container names (18.5); and a variable a remote environment lacks is named,
never defaulted or mocked (18.6).

The skill ships that command as `templates/worktree-setup.sh`. It copies only gitignored files,
never overwrites one, enters a wholly ignored directory only the way Claude Code does — so `.env*`
never copies an `.env` out of `node_modules` — prints paths but never contents, skips the copy where
there is no other checkout, and fails with a failing step's own exit code. Twenty behavioral tests in
`test/worktree-setup.test.ts` pin that, and CI runs them. `docs/how-to/worktrees.md` covers adopting
it and wiring Claude Code (a `SessionStart` hook), Cursor (`.cursor/worktrees.json`), Conductor
(`conductor.json`), the Codex app and plain git, plus the env conventions locally and in remote
environments. The TypeScript profile binds the rule: `.env.example`, `.env*` then `!.env.example`,
framework and `--env-file-if-exists` loading, client prefixes, lockfile-exact installs. The guide
template's Commands and Data and runtime slots record the setup command and where each environment's
variables come from; Dimension 6 asks five 18.x questions and now runs when environment variables or
env files change; `/tenets-init` pre-fills environment facts and offers the script, a
`.worktreeinclude`, and each harness's one-line entry. Routing scenarios R26–R28 and abidance
scenario A09 expect the rule. In a smoke run against a minimal consumer rather than the reference
one, R26–R28 routed to Rule 18, R17–R18 stayed on Rule 15, and the negatives stayed silent; A09's
answer was right both times, but once it reached Rule 18 by searching rather than through the index.
The full suites were not run. The `tenets` skill moves to 2.4.0 and `tenets-init` to 1.2.0.

**Installable from this fork, in every harness.** Every install pointer — the README, the ruleset's
README, and the `State: BLOCKED` line in each workflow skill — now names this repository:
`npx skills add jasperdegens/tenets -y`, verified to write all seven skills to `.agents/skills/`
(the directory Codex, Cursor, Gemini CLI, GitHub Copilot and opencode read) and to link them into
`.claude/skills/` for Claude Code; the README also carries the three-line layout for an install
without the CLI. The workflow skills resolve the ruleset at `.agents/skills/tenets/` first, since
that is where the installer puts it. Codex reads only `name` and `description` from a `SKILL.md`,
so `disable-model-invocation` never reached it: each of the six workflow skills now ships
`agents/openai.yaml` with `allow_implicit_invocation: false`, the same user-invoked-only policy in
the sidecar Codex honors. `/tenets-init` writes the routing mandate to AGENTS.md alone and, because
Claude Code reads AGENTS.md on its own only when no CLAUDE.md exists (and only from 2.1.277),
ensures an existing CLAUDE.md imports it with `@AGENTS.md` and offers a one-line CLAUDE.md
otherwise. The README's harness table now says, per harness, where skills are read from, how a
workflow skill is typed, and which file carries the mandate. The workflow skills move to 1.1.0 and
the `tenets` skill to 2.3.1; no rule or anchor changes.

**Rule 1.6 Earning an Abstraction** gathers into one decision rule what Rules 3.6, 7.10 and 10.5
said separately: introduce an interface only when the implementation behind it is likely to change,
a second real implementation already exists, or tests need a fake in place of an external system —
one real implementation plus a fake is enough, a second that might exist someday is not. It fixes
the shape (only the operations callers use, domain terms, no provider or SDK types, one contract
test) and names the signals for deleting one. Rule 1.2's "one clear boundary benefit" now points at
it, the index row and Dimension 2 checklist carry it, and routing scenario R20 expects it.

**Streamlined rules.** Every rule file was rewritten for density without renumbering or removing an
anchor: each fact now lives in one section and the others cite it. Rule 2.6 points at 4.3's test
list instead of repeating it; 2.5 keeps the five-line decision flow and drops the adapter
translation that 2.3 and the profile already own; 1.4 defers the pre-code contract to 14.1; 14.3 and
14.5 cite 4.2 and 10.6 rather than restating them; 5.5 absorbs 6.4's stale-docs sweep; 7.x and 10.x
lose their repeated adapter and provider sentences; 7.10 and its checklist item say "shared
interface" where they said "port", and "seam" gives way to "the adapter that wraps it" (2.3) and "an
internal module" (4.2, 4.4). Anchor citations in the rules, the profile, and the workflow grammar
drop the zero padding (`Rule 2.1`, not `Rule 02.1`). The set goes from ~7,050 to ~6,000 words; every
anchor cited from a checklist, skill, profile, or doc still resolves.

**Rule 16 Contributions and Fixes** is new: how a change is investigated, scoped, proved, written
up, and closed, from a report to a merged commit a stranger can read. Measure before theorizing and
fix the mechanism rather than the instance (16.1); one defect per change, the requested fix as the
deliverable, one derivation per fact, and failure messages that name what was measured (16.2); the
reproduction as the first test, every new test shown failing, and the gate run with omissions
recorded (16.3); kind-prefixed branches and a title naming the outcome in the product's words
(16.4); a write-up shape that stands alone in the log — reported, why, change, tests, for the
reviewer, still open, verified (16.5); the issue answered in the same terms and the pull
request a draft until its verification line is true (16.6); and the severities for a missing
section, an unrun check, or a body that claims a check it did not run (16.7). 16.4 records a
deliberate calibration: Rule 11.2's imperative mood governs branch commits, while a title that
becomes a squash-merged subject states the outcome. Rule 9.1 carries the new severities, 9.2 asks
for the write-up, 11.2 points squash-merged subjects at 16.4, Dimension 6 now runs for a pull
request target and asks the 16.x questions, the guide template's Change delivery slot records squash
merging and branch prefixes, and routing scenarios R21–R23 plus abidance scenario A08 expect the
rule. The proposal arrived numbered 11; that number is taken and anchors never renumber, so it lands
as 16.

**Rule 17 Remote Verification** is new: work is overseen from wherever the reviewer is — a phone on
any network, through any agent interface — so verifying it never depends on a local environment.
Evidence is owed where a human eye is the check, not on every change: a screenshot of the result for
anything visible (taken with the harness's browser or a scripted one, recordings only on request),
the URL the reviewer can open for anything running, including every push that lands somewhere live.
Evidence is posted where the reviewer already looks with the question it answers beside it, never as
a local path; failures are shown the same way. Screenshots are sent in the chat the reviewer is
following, not committed; only when the harness cannot attach a file there is one committed and
linked by a permalink. Work that cannot run in the provisioned remote environment is named in the
plan's slice and the write-up's "Not run" rather than silently pushed back to a local machine. The
screenshot is a human gate for design intent and never replaces behavioral tests. The project
guide's Change delivery slot gains the verification surfaces (preview platform, URL patterns,
screenshot tool, where evidence is posted); dimension 6 of the review checklist gains four
questions; two routing scenarios cover the new row. The `tenets` skill moves to 2.3.0.

**Rules 16 and 17 cite each other.** They landed from separate branches and each restated the
other's ground: the write-up's verification line said "Verified locally" while 17.4 forbids the
silent fallback to a local machine, 16.3 and 17.2 both described exercising the visible surface, and
"record what was not run" was stated in 4.8, 16.3, 16.5, 17.1 and 17.4. Now the line reads
"Verified" and names the screenshot or URL Rule 17 owes; 16.3 points at 17.2 for what the reviewer
sees and sends its omissions to the write-up's "Not run"; 17.1 and 17.4 send missing proof and
local-only work to that same line instead of restating 4.8; and 14.4's slice names anything that
cannot run remotely, which gives 17.4's plan flag a place to land. The plan template, the
`tenets-plan` skill's slice bullet, the guide template's evidence examples, and Dimension 6's
question for 17.4 follow; Dimension 6's header and the dimension table in `workflow/scope.md` now
name Rule 17, which they had omitted since it landed. Abidance scenario A08 expects "Verified"
rather than "Verified locally". No anchor moves.

## 0.6.0 — 2026-09-17

Zod 4.6, and compilation where it actually pays.

**`@tenets/env` stops compiling its schemas.** `parseEnv` still caches the schema it builds per
definition and target — that cache is what makes repeated parses roughly thirty times cheaper than
rebuilding the contract, and it stays. What it no longer does is call `z.compile`. Measured on Zod
4.6.5, compiling an environment-shaped contract costs about as much as two thousand parses of it,
and a contract is parsed once per process, so the generated fast path was startup work that never
came back. `src/typed-env/parse.bench.ts` now prices compilation against what it saves, so the
ratio is reproducible rather than asserted, and the README no longer credits the cache's win to
compilation. Nothing about the API, the errors, or the parsed snapshot changes; the behavioral
suite passes unchanged, which is the proof.

The peer range moves to `zod ^4.6.0`. No 4.6-only API is used — `parseEnv` returns a parsed
snapshot, so the new boolean `.validate()` has nothing to offer it, and `withParser`,
`instanceof().properties()`, `iban` and `currencyCode` have no environment-variable use — but one
supported Zod line is simpler to reason about than two.

**The TypeScript profile gains the rule behind that decision.** A boolean `validate`-style gate is
correct only where nothing reads a parsed value and the schema cannot repair its input, because a
fallback or default makes a repaired value answer "valid" and the guard narrows the input type.
Compilation is a build-step concern first: a build-time compiler emits validators into the bundle
and ships no compiler and no `new Function`, while a runtime compiler earns its keep only where
expected parses per process exceed compile cost divided by per-parse saving — a measurement, not an
assumption. Where compiled validators ship, the test suite runs them, so divergence fails the gate
rather than production.

All packages at 0.6.0. The `tenets` skill is at 2.2.0.

## 0.5.0 — 2026-09-04

Concurrent change, and decomposition for locality.

**Rule 15 Concurrent Change** is new: parallel work is partitioned by the files it will *write*, not
by how the task is described; convergence points — registries, barrels, lockfiles, generated types,
migration sequences, changelogs, the guide itself — are named and made append-only, generated, or
singly owned; a plan is re-derived against what actually landed rather than replayed; integration
order is declared before work starts; and if the natural split fights the structure, the structure
is wrong. Rule 6.3's timestamped inbox filenames turn out to have been the first instance of this
all along.

**Rule 7.10 Decomposition for Locality** appends the other half: organize a workspace's interior by
capability rather than technical layer, pass the deletion test (removing a capability deletes one
directory and unwires one export), apply 7.2's internal-import ban at module granularity, and expose
a family of implementations through one port plus composition at the consumer — never a broad
aggregator re-exporting every implementation.

The TypeScript profile gains a boundary-enforcement section ordered by strength, with the facts
verified rather than assumed: `exports` is the only unbypassable layer, workspace-graph tools cannot
see inside a package, oxlint has no `import/no-restricted-paths` and its Rust regex has no
lookahead, and `@internal` with `stripInternal` enforces nothing at all.

New docs: `docs/patterns/provider-families.md` works the fan-out/fan-in problem end to end for
interchangeable implementations, and `docs/design.md` gains a concurrency section plus a
**Considered and deferred** record for two packages that were designed and then declined — a
first-party boundary linter (it would duplicate a dependency analyzer, which Rule 10.4 forbids, and
`exports` plus the workspace graph already cover it when slices are workspaces) and a change-coupling
analyzer (a diagnostic nothing yet depends on). Both carry the criteria that would change the answer.

All packages at 0.5.0.

## 0.4.0 — 2026-09-04

Workflow skills, and one `tenets` namespace.

The ruleset skill is renamed `engineering-rules` → `tenets`, and four workflow commands join it as
sibling skills: `/tenets-audit` (severity-ranked compliance report for a repo, package, or subtree),
`/tenets-review` (PR, branch, or dirty tree, plus an intent audit of the active plan against what
the diff actually does), `/tenets-plan` (requirement, contract, examples-as-tests, green revertable
slices), and `/tenets-realign` (ordered slice plan, applied only on approval, one green commit per
slice). The two setup procedures become real skills too — `/tenets-init` and `/tenets-check` — which
fixes a defect: they shipped in a `command/` directory that no harness ever registered, so neither
was invokable.

They share `tenets/workflow/`: `findings.md` (finding grammar over Rule 9.1's severities, internal
confidence with suppression, dedup, summary grammar, worker schema), `scope.md` (guide slots per
consumer, git scope modes, effort thresholds, dimensions, degradation), and six dimension
checklists. The workflow skills restate no rule content — they cite anchors.

New **Rule 14 Planning**: the plan as a contract stated before the code — boundary, API, error
cases, invariants, tests, docs — with examples becoming the test list and requirement before
mechanism. It lives in the rules rather than only in `/tenets-plan`, so an agent already planning
mid-task gets it through the index.

Portability is deliberate: no forked-context frontmatter, no hooks, no shell-output injection, and
no positional argument placeholders (`$1` is the first argument in some harnesses and the second in
others). Parallel work is expressed as intent, so a harness without parallel workers runs the same
procedure sequentially for the same output. Claude Code, Codex and Cursor invoke the skills
directly; `/tenets-init` offers two-line shims for Gemini CLI, opencode and Cline, plus the
`GEMINI.md` pointer Gemini CLI needs before it will read AGENTS.md at all.

Each workflow skill resolves the ruleset by locating the installed `tenets` skill directory rather
than by a path relative to the working directory — a live smoke test caught the difference — and
pre-approves its own read-only git commands through the spec's `allowed-tools`, so a review does not
stall on a permission prompt.

The eval harness gained a real gate: it now records which skill fired, so a workflow skill answering
an ordinary request fails the run instead of silently passing as the ruleset. A new
`evals/invocation.tsv` covers command routing and adversarial near-misses. All packages at 0.4.0.

## 0.3.0 — 2026-09-04

Language profiles: the rules are now language-neutral and a profile file binds them to one
ecosystem. `skills/tenets/profiles/typescript.md` (~500 words) owns the TypeScript
mechanisms the rules used to hardcode — primitive names, strictness settings and forbidden escape
hatches, the boundary-parse API, test declaration form and its example, JSDoc tags, packaging and
manifest exports, ambient adapter-only access, and the adapter throw-translation snippet. A profile
may bind, append ecosystem rules, or waive an anchor with a reason; anchors stay citable in every
ecosystem. `tenets.json` gains a `profile` field (default `typescript`), the loading protocol reads
the profile alongside matched rules, `/tenets-init` detects and records it, and `/tenets-check` audits
it. Measured after the split: 17/17 routing (14 triggers, 3 negatives silent) and 7/7 abidance,
with the profile read in all seven mechanism scenarios — no loading or instruction-quality
regression against the pre-split baseline (17/17 and 7/7). All packages at 0.3.0.

## 0.2.0 — 2026-09-03

@tenets/env extracted from the reference monorepo: composable typed environment contracts on
Zod 4.5 with compiled parsing (~29x steady-state, benchmarked), inheritance/override/diamond
composition tests, Next.js adapter tests, and deployed-rule hardening. Credits added across all
packages (t3-env, neverthrow, invariant/tiny-invariant lineage). All packages at 0.2.0.

## 1.0.0 — 2026-09-03

Initial release: 13 rules with stable anchors and a measured loading protocol, trigger-routing
index, project-guide template and discovery convention, /tenets-init and /tenets-check commands,
the @tenets/result and @tenets/invariant packages (53 specs), and the routing eval suite (18/18 rule loading under
adversarial minimalism hooks; negatives silent).
