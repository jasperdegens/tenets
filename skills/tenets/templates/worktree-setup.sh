#!/usr/bin/env bash
# Makes this working copy runnable, whether it is a new git worktree or a fresh clone (Rule 18.4).
#
# Usage: bash scripts/worktree-setup.sh [--from <checkout>] [--dry-run]
#
#   1. Copies the gitignored files that .worktreeinclude matches from the source checkout. The list
#      uses .gitignore syntax and is the file Claude Code reads for the worktrees it creates, so one
#      list serves every tool. A file already present is kept, never overwritten; a link is copied
#      as the file it points to, and one that leads to no file is skipped with a note. A directory
#      that .gitignore ignores as a whole (node_modules/, build output) is entered only as Claude
#      Code enters one: when a **/ pattern's first name is on its path, or a rooted pattern names
#      it, as certs/dev.pem does. Dependencies and build output are installed or built, not copied.
#   2. Runs the install command, then the environment check, so a missing variable is named now
#      rather than at the first request.
#
# The source is --from, else git's main worktree. With no separate source (a fresh clone, CI, a
# cloud agent session) step 1 is skipped, because those environments get their variables from
# platform settings, not files (Rule 18.6). Prints paths, never file contents. Safe to re-run.
set -euo pipefail

# The two project steps: set them from the project guide's Commands table when adopting this
# template. An environment variable of the same name overrides each; an empty value skips it.
install_command=${WORKTREE_INSTALL-npm ci}
check_command=${WORKTREE_CHECK-}

say() { printf 'worktree-setup: %s\n' "$*"; }

from=''
dry_run=false
while [ $# -gt 0 ]; do
	case $1 in
	--from)
		[ $# -ge 2 ] || { say '--from needs a path' >&2; exit 2; }
		from=$2
		shift 2
		;;
	--dry-run) dry_run=true; shift ;;
	-h | --help) sed -n '2,/^set -/p' "$0" | sed '$d; s/^# \{0,1\}//'; exit 0 ;;
	*) say "unknown argument: $1" >&2; exit 2 ;;
	esac
done

target=$(git rev-parse --show-toplevel)
include=$target/.worktreeinclude
if [ -n "$from" ]; then
	if ! root=$(git -C "$from" rev-parse --show-toplevel); then
		say "not a git checkout: $from" >&2
		exit 1
	fi
	from=$root
else
	# git lists the main worktree first; a bare repository there has no files to copy.
	from=$(git worktree list --porcelain | awk '
		NR == 1 { sub(/^worktree /, ""); path = $0 }
		NR == 2 && $0 == "bare" { path = "" }
		END { print path }')
fi

# True when rooted pattern $2 names directory $1, or a path inside it, name by name.
names_dir() {
	local dir=$1 pattern=$2 d p
	while :; do
		d=${dir%%/*} p=${pattern%%/*}
		[ "$p" = '**' ] && return 0
		# shellcheck disable=SC2254 # the pattern's own glob characters apply
		case $d in $p) ;; *) return 1 ;; esac
		[ "$d" = "$dir" ] && return 0
		[ "$p" = "$pattern" ] && return 1
		dir=${dir#*/} pattern=${pattern#*/}
	done
}

# True when an include pattern reaches into this directory, which .gitignore ignores as a whole.
# Claude Code's rule: a pattern starting with **/ (a bare name counts as one) reaches it when the
# first name after **/ is a name on the directory's path; any other pattern must name the
# directory, or a path inside it, from the root.
reaches_ignored_dir() {
	local dir=${1%/} pattern first
	while IFS= read -r pattern || [ -n "$pattern" ]; do
		pattern=${pattern%$'\r'}
		pattern=${pattern%/}
		case $pattern in
		'' | '#'* | '!'*) continue ;;
		'**/'*) first=${pattern#'**/'} ;;
		/* | */*)
			if names_dir "$dir" "${pattern#/}"; then return 0; fi
			continue
			;;
		*) first=$pattern ;;
		esac
		# shellcheck disable=SC2254 # the pattern's own glob characters apply
		case /$dir/ in */${first%%/*}/*) return 0 ;; esac
	done <"$include"
	return 1
}

# Every gitignored path in the source, one entry per ignored directory. --no-optional-locks keeps
# git from rewriting the source's index while someone may be working there; untracked files are
# requested explicitly because status.showUntrackedFiles=no would otherwise reject --ignored.
ignored_paths() {
	git -C "$from" --no-optional-locks status --porcelain -z --ignored=matching \
		--untracked-files=normal |
		while IFS= read -r -d '' entry; do
			case $entry in
			'!! '*/) if reaches_ignored_dir "${entry#!! }"; then printf '%s\0' "${entry#!! }"; fi ;;
			'!! '*) printf '%s\0' "${entry#!! }" ;;
			esac
		done
}

# The ignored files the include list matches. git applies the patterns, so the list keeps exact
# .gitignore semantics: anchoring, **, and negation.
included_files() {
	ignored_paths |
		GIT_LITERAL_PATHSPECS=1 xargs -0 -r git -C "$from" ls-files -z --others --ignored \
			--exclude-from="$include" --
}

copy_included() {
	local path copied=0 present=0
	say "copying from $from"
	# Listed to a file first, so a failing git call stops the script instead of reading as empty.
	list=$(mktemp "${TMPDIR:-/tmp}/worktree-setup.XXXXXX")
	trap 'rm -f "$list"' EXIT
	included_files >"$list"
	while IFS= read -r -d '' path; do
		if [ -e "$target/$path" ] || [ -L "$target/$path" ]; then
			printf '  kept        %s\n' "$path"
			present=$((present + 1))
		elif [ ! -f "$from/$path" ]; then
			# A dangling link or a link to a directory: name it and move on.
			printf '  skipped     %s (not a regular file)\n' "$path"
		elif $dry_run; then
			printf '  would copy  %s\n' "$path"
			copied=$((copied + 1))
		else
			mkdir -p "$(dirname "$target/$path")"
			cp -p "$from/$path" "$target/$path"
			printf '  copied      %s\n' "$path"
			copied=$((copied + 1))
		fi
	done <"$list"
	if $dry_run; then
		say "$copied to copy, $present already present"
	else
		say "$copied copied, $present already present"
	fi
}

run_step() { # <name> <command>
	local status
	if [ -z "$2" ]; then
		say "no $1 command set; skipped"
	elif $dry_run; then
		say "would run $1: $2"
	else
		say "$1: $2"
		(cd "$target" && bash -c "$2") || {
			status=$?
			say "$1 failed" >&2
			exit "$status"
		}
	fi
}

if [ -z "$from" ] || [ "$(cd "$from" && pwd -P)" = "$(cd "$target" && pwd -P)" ]; then
	say 'no separate source checkout; nothing to copy (a remote environment gets its variables' \
		'from platform settings)'
elif [ ! -f "$include" ]; then
	say 'no .worktreeinclude; nothing to copy'
else
	copy_included
fi
run_step install "$install_command"
run_step check "$check_command"
say 'done'
