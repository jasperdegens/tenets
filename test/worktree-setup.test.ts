/**
 * @description Behavioral tests for the worktree setup script template: which gitignored files
 * reach a new working copy, what the script prints and runs, and when it copies nothing.
 */

import { execFileSync, spawnSync } from 'node:child_process';
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

const script = fileURLToPath(
	new URL('../skills/tenets/templates/worktree-setup.sh', import.meta.url),
);

// Hermetic git: no user or system config (signing, hooks, default branch), one fixed identity.
const gitEnv: NodeJS.ProcessEnv = {
	...process.env,
	GIT_CONFIG_GLOBAL: '/dev/null',
	GIT_CONFIG_NOSYSTEM: '1',
	GIT_AUTHOR_NAME: 'test',
	GIT_AUTHOR_EMAIL: 'test@example.com',
	GIT_COMMITTER_NAME: 'test',
	GIT_COMMITTER_EMAIL: 'test@example.com',
};

const committedFiles = {
	'.gitignore': '.env*\n!.env.example\nnode_modules/\nsecrets/\n',
	'.worktreeinclude': '.env*\nsecrets/dev.pem\n',
	'.env.example': 'DATABASE_URL=postgres://localhost:5432/app_dev\n',
};

interface Checkout {
	readonly root: string;
	readonly main: string;
}

const roots: string[] = [];

afterEach(() => {
	for (const root of roots.splice(0)) {
		rmSync(root, { recursive: true, force: true });
	}
});

const git = (cwd: string, ...args: string[]): string =>
	execFileSync('git', args, { cwd, env: gitEnv, encoding: 'utf8' });

const writeFiles = (dir: string, files: Readonly<Record<string, string>>): void => {
	for (const [path, content] of Object.entries(files)) {
		mkdirSync(dirname(join(dir, path)), { recursive: true });
		writeFileSync(join(dir, path), content);
	}
};

/** Creates a main checkout with `committed` in its first commit and `local` left uncommitted. */
const mainCheckout = (
	local: Readonly<Record<string, string>>,
	committed: Readonly<Record<string, string>> = committedFiles,
): Checkout => {
	const root = mkdtempSync(join(tmpdir(), 'worktree-setup-'));
	roots.push(root);
	const main = join(root, 'main');
	mkdirSync(main);
	git(main, 'init', '-q', '-b', 'main');
	writeFiles(main, committed);
	git(main, 'add', '--all');
	git(main, 'commit', '-q', '-m', 'init');
	writeFiles(main, local);
	return { root, main };
};

const addWorktree = (checkout: Checkout, name: string): string => {
	const path = join(checkout.root, name);
	git(checkout.main, 'worktree', 'add', '-q', path, '-b', name);
	return path;
};

/** Runs the script in `cwd`; install and check are skipped unless a test sets them. */
const runSetup = (
	cwd: string,
	args: readonly string[] = [],
	steps: { readonly install?: string; readonly check?: string } = {},
): { readonly status: number | null; readonly output: string } => {
	const result = spawnSync('bash', [script, ...args], {
		cwd,
		encoding: 'utf8',
		env: {
			...gitEnv,
			WORKTREE_INSTALL: steps.install ?? '',
			WORKTREE_CHECK: steps.check ?? '',
		},
	});
	return { status: result.status, output: `${result.stdout}${result.stderr}` };
};

const read = (dir: string, path: string): string => readFileSync(join(dir, path), 'utf8');

describe('worktree-setup.sh', () => {
	it('should copy the gitignored files the include list names, keeping their paths', () => {
		// Given: a main checkout holding env files at the root, in an app, and under a spaced path
		const checkout = mainCheckout({
			'.env.local': 'DATABASE_URL=postgres://main\n',
			'apps/web/.env.local': 'API_URL=https://api.example.com\n',
			'dir with space/.env.local': 'FLAG=true\n',
		});
		const worktree = addWorktree(checkout, 'feature');

		// When: setup runs in the new worktree
		const result = runSetup(worktree);

		// Then: each file arrives at the same path with the same content
		expect(result.status).toBe(0);
		expect(read(worktree, '.env.local')).toBe('DATABASE_URL=postgres://main\n');
		expect(read(worktree, 'apps/web/.env.local')).toBe('API_URL=https://api.example.com\n');
		expect(read(worktree, 'dir with space/.env.local')).toBe('FLAG=true\n');
	});

	it('should keep a file already present in the worktree rather than overwrite it', () => {
		// Given: the worktree already carries its own copy of an included file
		const checkout = mainCheckout({ '.env.local': 'PORT=3000\n' });
		const worktree = addWorktree(checkout, 'feature');
		writeFiles(worktree, { '.env.local': 'PORT=3001\n' });

		// When: setup runs
		const result = runSetup(worktree);

		// Then: the worktree's value survives and the output says the file was kept
		expect(result.status).toBe(0);
		expect(read(worktree, '.env.local')).toBe('PORT=3001\n');
		expect(result.output).toMatch(/kept\s+\.env\.local/);
	});

	it('should skip a matching file that is not gitignored', () => {
		// Given: an untracked file the include list matches but .gitignore does not ignore
		const checkout = mainCheckout({ 'config/master.key': 'key\n' }, {
			...committedFiles,
			'.worktreeinclude': 'config/*.key\n',
		});
		const worktree = addWorktree(checkout, 'feature');

		// When: setup runs
		const result = runSetup(worktree);

		// Then: work in progress is never copied between checkouts
		expect(result.status).toBe(0);
		expect(existsSync(join(worktree, 'config/master.key'))).toBe(false);
	});

	it('should skip files inside an ignored directory the include list does not name', () => {
		// Given: a dependency directory holding a file an unanchored pattern would match
		const checkout = mainCheckout({ 'node_modules/pkg/.env': 'FROM_A_DEPENDENCY=1\n' });
		const worktree = addWorktree(checkout, 'feature');

		// When: setup runs
		const result = runSetup(worktree);

		// Then: dependencies are installed, never copied
		expect(result.status).toBe(0);
		expect(existsSync(join(worktree, 'node_modules'))).toBe(false);
	});

	it('should copy a file inside an ignored directory a rooted pattern names', () => {
		// Given: an ignored secrets directory and an include pattern naming one file inside it
		const checkout = mainCheckout({
			'secrets/dev.pem': 'certificate\n',
			'secrets/other.pem': 'not listed\n',
		});
		const worktree = addWorktree(checkout, 'feature');

		// When: setup runs
		const result = runSetup(worktree);

		// Then: exactly the named file arrives
		expect(result.status).toBe(0);
		expect(read(worktree, 'secrets/dev.pem')).toBe('certificate\n');
		expect(existsSync(join(worktree, 'secrets/other.pem'))).toBe(false);
	});

	it('should reach an ignored directory whose path holds the first name after **/', () => {
		// Given: an ignored certs directory and a **/ pattern whose first name is that directory
		const checkout = mainCheckout(
			{ 'certs/dev.pem': 'certificate\n', 'node_modules/pkg/dev.pem': 'from a dependency\n' },
			{
				...committedFiles,
				'.gitignore': 'node_modules/\ncerts/\n',
				'.worktreeinclude': '**/certs/*.pem\n',
			},
		);
		const worktree = addWorktree(checkout, 'feature');

		// When: setup runs
		const result = runSetup(worktree);

		// Then: the certificate arrives and the dependency directory stays unread
		expect(result.status).toBe(0);
		expect(read(worktree, 'certs/dev.pem')).toBe('certificate\n');
		expect(existsSync(join(worktree, 'node_modules'))).toBe(false);
	});

	it('should reach only the nested ignored directory a rooted pattern names', () => {
		// Given: per-app ignored secrets and dependency directories; a pattern names the secrets
		const checkout = mainCheckout(
			{
				'apps/web/secrets/key.pem': 'web key\n',
				'apps/web/node_modules/pkg/key.pem': 'from a dependency\n',
			},
			{
				...committedFiles,
				'.gitignore': 'node_modules/\nsecrets/\n',
				'.worktreeinclude': 'apps/*/secrets/key.pem\n',
				'apps/web/package.json': '{}\n',
			},
		);
		const worktree = addWorktree(checkout, 'feature');

		// When: setup runs
		const result = runSetup(worktree);

		// Then: only the named file arrives
		expect(result.status).toBe(0);
		expect(read(worktree, 'apps/web/secrets/key.pem')).toBe('web key\n');
		expect(existsSync(join(worktree, 'apps/web/node_modules'))).toBe(false);
	});

	it('should skip an entry that is not a regular file and keep going', () => {
		// Given: an included env file that is a dangling symlink, beside a regular one
		const checkout = mainCheckout({ '.env.local': 'A=1\n' });
		symlinkSync(join(checkout.root, 'moved-away.env'), join(checkout.main, '.env.shared'));
		const worktree = addWorktree(checkout, 'feature');

		// When: setup runs
		const result = runSetup(worktree);

		// Then: the link is reported as skipped and the regular file still arrives
		expect(result.status).toBe(0);
		expect(result.output).toMatch(/skipped\s+\.env\.shared/);
		expect(read(worktree, '.env.local')).toBe('A=1\n');
	});

	it('should follow gitignore syntax, including negated patterns', () => {
		// Given: an include list that excludes one env file by negation
		const checkout = mainCheckout(
			{ '.env.local': 'A=1\n', '.env.production.local': 'B=2\n' },
			{ ...committedFiles, '.worktreeinclude': '.env*\n!.env.production.local\n' },
		);
		const worktree = addWorktree(checkout, 'feature');

		// When: setup runs
		const result = runSetup(worktree);

		// Then: the negated file stays behind
		expect(result.status).toBe(0);
		expect(read(worktree, '.env.local')).toBe('A=1\n');
		expect(existsSync(join(worktree, '.env.production.local'))).toBe(false);
	});

	it('should print paths but never file contents', () => {
		// Given: an env file holding a secret value
		const checkout = mainCheckout({ '.env.local': 'STRIPE_SECRET_KEY=sk_test_hunter2\n' });
		const worktree = addWorktree(checkout, 'feature');

		// When: setup runs
		const result = runSetup(worktree);

		// Then: the path is reported and the value is not
		expect(result.output).toContain('.env.local');
		expect(result.output).not.toContain('hunter2');
	});

	it('should copy nothing on a second run', () => {
		// Given: a worktree that setup has already run in
		const checkout = mainCheckout({ '.env.local': 'A=1\n' });
		const worktree = addWorktree(checkout, 'feature');
		runSetup(worktree);

		// When: setup runs again
		const result = runSetup(worktree);

		// Then: it succeeds and reports nothing copied
		expect(result.status).toBe(0);
		expect(result.output).toMatch(/0 copied/);
	});

	it('should copy from the checkout --from names', () => {
		// Given: the files live in another worktree rather than in the main checkout
		const checkout = mainCheckout({});
		const source = addWorktree(checkout, 'source');
		writeFiles(source, { '.env.local': 'FROM=source\n' });
		const worktree = addWorktree(checkout, 'feature');

		// When: setup runs with --from pointing at it
		const result = runSetup(worktree, ['--from', source]);

		// Then: the file comes from there
		expect(result.status).toBe(0);
		expect(read(worktree, '.env.local')).toBe('FROM=source\n');
	});

	it('should copy nothing in the main checkout itself and still succeed', () => {
		// Given: a fresh clone, as in CI or a cloud agent session, with no other checkout
		const checkout = mainCheckout({ '.env.local': 'A=1\n' });

		// When: setup runs in it
		const result = runSetup(checkout.main);

		// Then: it says there is no separate source and exits cleanly
		expect(result.status).toBe(0);
		expect(result.output).toMatch(/no separate source checkout/);
	});

	it('should treat a bare main repository as having no source', () => {
		// Given: a worktree added to a bare repository, which has no files of its own
		const checkout = mainCheckout({});
		const bare = join(checkout.root, 'bare.git');
		git(checkout.root, 'clone', '-q', '--bare', checkout.main, bare);
		const worktree = join(checkout.root, 'from-bare');
		git(bare, 'worktree', 'add', '-q', worktree, '-b', 'feature');

		// When: setup runs in that worktree
		const result = runSetup(worktree);

		// Then: it copies nothing and exits cleanly
		expect(result.status).toBe(0);
		expect(result.output).toMatch(/no separate source checkout/);
	});

	it('should say so and succeed when there is no include list', () => {
		// Given: a repository without .worktreeinclude
		const committed: Record<string, string> = { ...committedFiles };
		delete committed['.worktreeinclude'];
		const checkout = mainCheckout({ '.env.local': 'A=1\n' }, committed);
		const worktree = addWorktree(checkout, 'feature');

		// When: setup runs
		const result = runSetup(worktree);

		// Then: nothing is copied and the reason is printed
		expect(result.status).toBe(0);
		expect(result.output).toMatch(/no \.worktreeinclude/);
		expect(existsSync(join(worktree, '.env.local'))).toBe(false);
	});

	it('should run install, then check, in the worktree', () => {
		// Given: install and check commands that record their order
		const checkout = mainCheckout({ '.env.local': 'A=1\n' });
		const worktree = addWorktree(checkout, 'feature');

		// When: setup runs with both set
		const result = runSetup(worktree, [], {
			install: 'echo install >> steps.log',
			check: 'test -f .env.local && echo check >> steps.log',
		});

		// Then: both ran after the copy, install first
		expect(result.status).toBe(0);
		expect(read(worktree, 'steps.log')).toBe('install\ncheck\n');
	});

	it('should fail when the environment check fails', () => {
		// Given: a check that finds a variable missing
		const checkout = mainCheckout({});
		const worktree = addWorktree(checkout, 'feature');

		// When: setup runs
		const result = runSetup(worktree, [], {
			check: 'echo "DATABASE_URL is missing" >&2; exit 3',
		});

		// Then: setup fails and the check's own message reaches the caller
		expect(result.status).not.toBe(0);
		expect(result.output).toContain('DATABASE_URL is missing');
		expect(result.output).toMatch(/check failed/);
	});

	it('should list without copying or running anything on --dry-run', () => {
		// Given: an included file and an install command that would leave a trace
		const checkout = mainCheckout({ '.env.local': 'A=1\n' });
		const worktree = addWorktree(checkout, 'feature');

		// When: setup runs as a dry run
		const result = runSetup(worktree, ['--dry-run'], { install: 'touch installed' });

		// Then: the file is listed but neither copied nor installed around
		expect(result.status).toBe(0);
		expect(result.output).toMatch(/would copy\s+\.env\.local/);
		expect(existsSync(join(worktree, '.env.local'))).toBe(false);
		expect(existsSync(join(worktree, 'installed'))).toBe(false);
	});

	it('should fail when --from is not a git checkout', () => {
		// Given: a directory that holds no checkout
		const checkout = mainCheckout({});
		const worktree = addWorktree(checkout, 'feature');
		const elsewhere = join(checkout.root, 'elsewhere');
		mkdirSync(elsewhere);

		// When: setup runs with --from pointing at it
		const result = runSetup(worktree, ['--from', elsewhere]);

		// Then: it stops and names the path it could not use
		expect(result.status).toBe(1);
		expect(result.output).toContain(`not a git checkout: ${elsewhere}`);
	});

	it('should reject an unknown argument', () => {
		// Given: a worktree
		const checkout = mainCheckout({});
		const worktree = addWorktree(checkout, 'feature');

		// When: setup runs with an argument it does not know
		const result = runSetup(worktree, ['--force']);

		// Then: it refuses with a usage error before touching anything
		expect(result.status).toBe(2);
		expect(result.output).toMatch(/unknown argument: --force/);
	});
});
