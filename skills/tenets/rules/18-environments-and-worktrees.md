# 18 Environments and Worktrees

Code reads its configuration from the process environment, declared once and provisioned wherever it
runs: a main checkout, a worktree, a remote agent session, CI, a deployment. A new working copy
becomes runnable with one command, and no two copies share state they could both write.

## 18.1 One Declared Contract

Every variable the code reads is declared once, in the schema parsed at startup (Rule 2.1), and
listed in a committed example file with a comment and a safe placeholder — never a real value. Code
reads configuration only through the parsed contract; ambient access stays in the module that parses
it (the profile names the mechanism). Behavior that differs between environments is a variable,
never a branch on the environment's name, and the contract states what each environment requires — a
secret optional locally is required once deployed. Adding, renaming, or removing a variable updates
the contract, the example file, and every environment that provisions it in the same change.

## 18.2 Values Arrive Through the Environment

The process environment is the only interface between code and its configuration. Env files are a
local convenience, loaded before the contract is parsed and never required: without them, the same
variables arrive from the environment. Local values come from one documented source — a secret
manager or platform pull, a copy from the main checkout (18.4), or the example file filled in by
hand — which the project guide names. Remote environments — agent sessions, CI, preview, production
— get the same variables from their platform's variables and secrets settings.

## 18.3 Secrets Stay Out of Git and Output

Real values never enter a commit, the example file, a log, a screenshot, a write-up, or a prompt.
Env files are ignored by pattern, with the example file re-included, and tools that handle them
print variable names, never values. A value behind a client-side prefix ships in the bundle, so it
is public and never a secret. A committed secret is rotated first; rewriting history does not
un-leak it.

## 18.4 One Setup Command per Working Copy

A worktree or fresh clone becomes runnable through one repository-owned, idempotent command (Rule
8.1): copy the gitignored files a committed include list names from the main checkout, never
overwriting one already present; install dependencies from the lockfile; then parse the contract, so
a missing variable is named before work starts. Dependencies and build output are installed or
built, never copied. The include list is `.worktreeinclude`, in .gitignore syntax — the file Claude
Code and several other harnesses read for the worktrees they create — and every harness's worktree
hook calls the same command instead of carrying its own steps. This skill ships one:
`templates/worktree-setup.sh`.

## 18.5 Copies Share History, Not State

Worktrees share one object store and nothing writable. Each gets its own dependencies, build output,
ports, local databases, and container names; a resource two copies could both write — a port, a dev
database, a socket or lock file — is partitioned by the worktree's name or assigned by the harness.
Content-addressed caches, such as a package store or build cache, may be shared: equal keys hold
equal content. A worktree nested inside the main checkout is excluded from that checkout's test
runner, linters, and watchers. This is Rule 15.1's write-set partition, applied at run time.

## 18.6 Remote Environments Are Provisioned, Not Patched

A remote environment gets its variables from its platform settings, never from a file an agent
writes or a committed default. A variable it lacks is named in the plan's slice and under the
write-up's "Not run" (Rule 17.4) — never replaced by a placeholder, a mock, or a fallback that hides
the gap. The setup command finds no main checkout to copy from there, skips that step, and still
installs and checks.
