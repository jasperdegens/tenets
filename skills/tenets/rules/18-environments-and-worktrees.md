# 18 Environments and Worktrees

Declare configuration once, supply it through the process environment, and make every working copy
runnable with one command. Copies never share writable state.

## 18.1 One Declared Contract

Declare every variable in the startup schema (Rule 2.1) and a committed, commented example file with
safe placeholders. Only the parsing module reads the ambient environment; code uses its parsed
contract. Configure behavior with variables, not environment-name branches, and state which
variables each environment requires. Change the schema, example, and provisioning together.

## 18.2 Values Arrive Through the Environment

The process environment is the configuration interface. Env files are optional local loaders; the
guide names one source for local values. Remote agents, CI, previews, and deployments use platform
variables and secrets.

## 18.3 Secrets Stay Out of Git and Output

Real values never enter git, examples, logs, screenshots, write-ups, or prompts. Ignore env files
while re-including the example; tools print names, not values. Client-bundled variables are public.
Rotate an exposed secret before rewriting history.

## 18.4 One Setup Command per Working Copy

One idempotent repository command (Rule 8.1) makes a clone or worktree runnable: copy files named by
the committed `.worktreeinclude` from the main checkout without overwriting; install locked
dependencies; parse the environment contract. Install or build dependencies and outputs—never copy
them. Every harness hook delegates to this command. This skill provides
`templates/worktree-setup.sh`.

## 18.5 Copies Share History, Not State

Each worktree owns dependencies, build output, ports, databases, container names, sockets, and lock
files. Partition writable resources by worktree or let the harness assign them. Content-addressed
caches may be shared. Exclude nested worktrees from the parent checkout's tools. This is Rule 15.1
at runtime.

## 18.6 Remote Environments Are Provisioned, Not Patched

Remote environments use platform settings, never agent-written files or committed defaults. Report
missing variables in the plan and under `Not run` (Rule 17.4); do not hide them with placeholders,
mocks, or fallbacks. Without a main checkout, setup skips copying but still installs and validates.
