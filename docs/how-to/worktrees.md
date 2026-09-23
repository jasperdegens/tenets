# Worktrees: one setup command, env files included

A git worktree is a second working directory for the same repository: its own branch and files, one
shared history. It is how parallel agents stay out of each other's way (Rule 15), and most agent
harnesses now create them. A new worktree holds every tracked file and nothing else — no env files,
no dependencies, no build output — so it cannot run until something sets it up.

This page is the how-to for [Rule 18](../../skills/tenets/rules/18-environments-and-worktrees.md):
one repository-owned command that makes any new working copy runnable, one list of the gitignored
files it needs, every harness pointed at that command, and the conventions for env files locally and
variables in remote environments.

## What a new worktree is missing

| Missing | Handle it by | Because |
| --- | --- | --- |
| Gitignored env files and local settings (`.env.local`, `apps/web/.env.local`) | Copying them from the main checkout, as `.worktreeinclude` lists | Git never carries them, and the code needs them locally |
| Dependencies (`node_modules/`, `.venv/`) | Installing from the lockfile | Installs are exact and cheap from a warm cache; copies carry absolute paths and links |
| Build output and caches | Building, or sharing a content-addressed cache | Equal keys hold equal content, so a shared cache cannot collide |
| A free port, database, container names | Deriving them from the worktree's name, or taking the harness's | Two copies cannot bind one port or migrate one database |

## The setup command

One command sets up any working copy — a new worktree, a fresh clone, a cloud session (Rule 18.4):

1. Copy the gitignored files `.worktreeinclude` names from the main checkout, never overwriting one
   already present.
2. Install dependencies from the lockfile.
3. Parse the environment contract, so a missing variable is named before work starts.

The ruleset ships it as
[`templates/worktree-setup.sh`](../../skills/tenets/templates/worktree-setup.sh) (installed at
`.agents/skills/tenets/templates/`). `/tenets-init` offers to adopt it; by hand:

- Copy it to `scripts/worktree-setup.sh` and set its two project lines — the install command and
  the environment check — from the project guide's Commands table.
- Add a root command that runs it, such as `"worktree:setup": "bash scripts/worktree-setup.sh"`,
  and a row for it in the guide's Commands table.
- Commit a `.worktreeinclude` at the repository root.

`.worktreeinclude` uses `.gitignore` syntax. It is the file [Claude
Code](https://code.claude.com/docs/en/worktrees#copy-gitignored-files-into-worktrees) reads when it
creates a worktree, and Conductor, the Codex app, and tools such as Worktrunk read it too, so one
list serves every tool — the script copies from it for the rest:

```gitignore
# Gitignored files a new worktree needs. Harnesses that read this file copy them when they create a
# worktree; scripts/worktree-setup.sh copies them everywhere else.
.env.local
apps/*/.env.local
```

In a new worktree:

```text
$ git worktree add ../app-billing -b billing
$ cd ../app-billing && npm run worktree:setup
worktree-setup: copying from /Users/me/code/app
  copied      .env.local
  copied      apps/web/.env.local
worktree-setup: 2 copied, 0 already present
worktree-setup: install: npm ci
...
worktree-setup: check: npm run env:check
worktree-setup: done
```

What the script guarantees, each pinned by a test in
[`test/worktree-setup.test.ts`](../../test/worktree-setup.test.ts):

- **Only gitignored files are copied**, matching Claude Code: a tracked file is already there, and
  an untracked one that is not ignored is someone's work in progress.
- **A file already present is kept**, so a worktree's own values (a different port, say) survive a
  re-run. Re-running is safe; the second run copies nothing.
- **Dependencies stay behind.** A directory `.gitignore` ignores as a whole (`node_modules/`,
  `dist/`) is entered only as Claude Code enters one: when the first name after a `**/` is on its
  path (`**/certs/*.pem` reaches `certs/`), or when a rooted pattern names it (`certs/dev.pem`). So
  `.env*` never picks up an `.env` a dependency happens to ship.
- **Paths are printed, never contents.**
- **No source, no copy.** In a fresh clone, a CI job, or a cloud agent session there is no other
  checkout; the script says so, skips the copy, and still installs and checks — those environments
  get their variables from platform settings (Rule 18.6).
- **The source is git's main worktree**, found with `git worktree list`; `--from <checkout>` names
  another. `--dry-run` lists what would happen and changes nothing. `WORKTREE_INSTALL` and
  `WORKTREE_CHECK` override the two project lines, and an empty value skips that step.
- **A failed step fails the command** with that step's own message and exit code.

The environment check is whatever parses the contract: a script that imports each app's env module,
so `parseEnv` throws an `EnvValidationError` naming every missing variable at once, or the
framework's own startup check.

## Point every harness at it

Each harness has its own place to run setup for a new worktree. Point every one of them at the same
command, so the steps live in one place.

| Harness | Where | Reads `.worktreeinclude` itself |
| --- | --- | --- |
| Claude Code — `claude --worktree`, desktop sessions, subagents with `isolation: worktree` | `SessionStart` hook in `.claude/settings.json`; a subagent's own instructions | Yes |
| Cursor — parallel agents | `.cursor/worktrees.json` | No — the script copies |
| Conductor | `conductor.json` | Yes, through its files-to-copy setting |
| Codex app | The local environment's setup script | Yes |
| Plain `git worktree add` | Run the command | No — the script copies |

**Claude Code** copies the `.worktreeinclude` files itself for every worktree it creates with git;
its docs leave installing dependencies to you or to Claude. A `SessionStart` hook makes it
automatic. Hook paths do not follow the session into the worktree — `CLAUDE_PROJECT_DIR` stays at
the main checkout, while the hook input's `cwd` is the worktree root, read here with `jq`. A
`SessionStart` hook's standard output becomes context the model reads, so the command sends
everything to standard error, and the guard skips a checkout whose dependencies are installed:

```json
{
	"hooks": {
		"SessionStart": [
			{
				"matcher": "startup",
				"hooks": [
					{
						"type": "command",
						"command": "cd \"$(jq -r .cwd)\" && { [ -e node_modules ] || bash scripts/worktree-setup.sh; } >&2"
					}
				]
			}
		]
	}
}
```

A subagent in its own worktree starts no session, so its definition says to run
`npm run worktree:setup` first when its work needs dependencies. Claude Code places its worktrees
in `.claude/worktrees/` inside the repository. Add that directory to `.gitignore`, as its docs
advise, and exclude it wherever a tool ignores `.gitignore` — test runners, linters, file watchers
— or the main checkout runs every worktree's tests too (Rule 18.5). Vitest, for one:
`exclude: [...configDefaults.exclude, '.claude/worktrees/**']`.

**Cursor** runs the commands in `.cursor/worktrees.json` in each new worktree. It exposes the main
checkout as `$ROOT_WORKTREE_PATH`, but the script finds it through git, so it does not depend on
that variable. On Windows the command needs `bash` on the path, such as Git Bash's.

```json
{
	"setup-worktree": ["bash scripts/worktree-setup.sh"]
}
```

**Conductor** runs `scripts.setup` in each new workspace and names the repository it came from in
`CONDUCTOR_ROOT_PATH`. It also reserves ten ports per workspace, starting at `CONDUCTOR_PORT` — use
them for the dev server (see [Keep worktrees apart](#keep-worktrees-apart)).

```json
{
	"scripts": {
		"setup": "bash scripts/worktree-setup.sh --from \"$CONDUCTOR_ROOT_PATH\""
	}
}
```

**The Codex app** runs a local environment's setup script when it creates a worktree. Enter
`bash scripts/worktree-setup.sh` there; the app writes the result to
`.codex/environments/environment.toml`, a file it generates and marks not to edit by hand.

**Plain git.** Put worktrees beside the main checkout rather than inside it, then run the command:

```sh
git worktree add ../app-billing -b billing
cd ../app-billing && npm run worktree:setup
```

VS Code's own worktree support copies files through its `git.worktreeIncludeFiles` setting rather
than this file; mirror the patterns there, or run the command.

## Environment conventions

### Declare every variable once (Rule 18.1)

The environment contract is the schema that parses `process.env` at startup (Rule 2.1), and the
example file lists the same variables with a comment and a safe placeholder. Both change in the same
commit as any new, renamed, or removed variable, together with every environment that provides it.

```sh
# .env.example — committed. Every variable the code reads; real values never appear here.
# Local values go in .env.local, from the source the project guide names.
DATABASE_URL=postgres://localhost:5432/app_dev
# Stripe test-mode key; required once deployed.
STRIPE_SECRET_KEY=
```

With `@tenets/env`, a package declares what it reads and the app composes the packages it deploys,
so a secret optional on a laptop is still required once deployed:

```ts
// apps/web/src/env.ts — the only module that reads process.env.
import {
	defineEnv,
	enumValue,
	optionalSecretValue,
	parseEnv,
	requiredWhenDeployed,
	urlValue,
	withDefault,
} from '@tenets/env';

const web = defineEnv({
	name: 'web',
	server: {
		DATABASE_URL: urlValue,
		STRIPE_SECRET_KEY: optionalSecretValue(32),
		VERCEL_ENV: withDefault(enumValue(['development', 'preview', 'production']), 'development'),
	},
	checks: [requiredWhenDeployed('STRIPE_SECRET_KEY')],
});

// Throws EnvValidationError naming every missing or invalid variable, e.g. in production:
// "STRIPE_SECRET_KEY is required in deployed environments".
export const env = parseEnv(web, process.env);
```

Behavior that differs between environments is a variable (`PAYMENTS_MODE=test`), never a branch on
the environment's name.

### Values arrive through the environment (Rules 18.2, 18.6)

The code reads the process environment and nothing else, so the same code runs everywhere; what
changes is who fills the environment in:

| Where the code runs | Where its values come from | Env files |
| --- | --- | --- |
| Main checkout | The project's one documented source: a platform pull such as `vercel env pull` (writes `.env.local`), a secret manager's CLI (`op inject`, `doppler run`), or `.env.example` filled in by hand | Yes, gitignored |
| Worktree | Copied from the main checkout by the setup command | Yes, gitignored |
| Claude Code cloud session | The cloud environment's variables, set in `.env` format in its settings and visible to anyone using that environment | No |
| Codex cloud task | The environment's variables for the whole task; its secrets reach the setup script only | No |
| Copilot cloud agent | The repository's agent secrets and variables; setup steps in `.github/workflows/copilot-setup-steps.yml` | No |
| CI, preview, production | The CI's or platform's secrets store | No |

Files are loaded before the contract is parsed and are never required: Next.js, Vite, and Bun load
`.env*` themselves, and plain Node takes `--env-file-if-exists=.env.local`. In Next.js, Vite, and
Node a value already in the environment wins over the file, which is what lets a cloud session and a
laptop share one code path.

In a remote environment, a variable that was never provisioned is named — in the plan's slice and
under the write-up's "Not run" (Rule 17.4) — and set in the platform's settings. It is never
defaulted to a local URL, mocked, or written into a file by the agent to make a run pass. Claude
Code's cloud docs split setup the same way: the environment's setup script provisions the machine
(toolchains, CLI tools) and is cached, while project setup such as `npm install` belongs in a
`SessionStart` hook, which runs in the cloud and locally alike. The hook above does that: in the
cloud it finds no other checkout, so it only installs and checks.

### Keep secrets out of git and output (Rule 18.3)

```gitignore
.env*
!.env.example
```

The second line matters: framework starters ship `.env*` alone, which ignores the example file too.
Tools that handle env files print variable names, never values. Anything behind a client prefix —
`NEXT_PUBLIC_`, `VITE_`, `PUBLIC_` — is compiled into the browser bundle, so it is public by
definition. A secret that reached a commit is rotated first; rewriting history does not un-leak it.
Values never go into a prompt either: a missing secret is provisioned where the environment reads
it, not pasted into the session.

## Keep worktrees apart

Worktrees share history and nothing writable (Rule 18.5). What two copies could both write gets a
per-worktree name or a harness-assigned value:

- **Ports.** Take the harness's (`CONDUCTOR_PORT`), derive one from the worktree's name, or serve
  every copy on a named `.localhost` host behind a local proxy, with the branch in the hostname.
- **Databases.** One database or schema per worktree (`app_dev_billing`), or a database branch where
  the platform offers one. Never two copies migrating one local database.
- **Containers.** Compose names containers after the project directory, so worktrees differ
  already; published host ports still collide, so they take the worktree's port.
- **Caches.** Content-addressed caches — the package manager's store, a build cache — are safe to
  share and save most of the install time. Anything else stays per worktree.

## Clean up

A worktree is done when its branch lands. `git worktree remove <path>` deletes it, copied env files
included; git refuses while it has changes, and `--force` overrides. `git worktree prune` clears
the records of worktree directories deleted by hand. Claude Code removes a clean unnamed worktree
when its session exits and asks about one with work in it; the Codex app keeps its most recent
fifteen, and Conductor runs `scripts.archive` for anything that lives outside the workspace
directory, such as a per-worktree database.

## Sources

- Git: [git-worktree](https://git-scm.com/docs/git-worktree), [gitignore](https://git-scm.com/docs/gitignore)
- Claude Code: [worktrees and `.worktreeinclude`](https://code.claude.com/docs/en/worktrees),
  [hooks](https://code.claude.com/docs/en/hooks), [cloud environments](https://code.claude.com/docs/en/cloud-environments)
- Cursor: [worktrees](https://cursor.com/docs/configuration/worktrees)
- Conductor: [docs](https://www.conductor.build/docs)
- OpenAI Codex: [local environments](https://developers.openai.com/codex/app/local-environments),
  [cloud environments](https://developers.openai.com/codex/cloud/environments)
- GitHub Copilot: [customize the agent environment](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment)
- VS Code: [branches and worktrees](https://code.visualstudio.com/docs/sourcecontrol/branches-worktrees)
- Env files: [Next.js](https://nextjs.org/docs/app/guides/environment-variables),
  [Vite](https://vite.dev/guide/env-and-mode), [Node.js `--env-file`](https://nodejs.org/api/cli.html),
  [Bun](https://bun.com/docs/runtime/environment-variables), [the twelve-factor app: config](https://12factor.net/config)
