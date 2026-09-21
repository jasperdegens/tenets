# 05 Documentation

Document why, constraints, contracts, and non-obvious behavior. Never restate code.

## 5.1 File Preambles

Repository-owned source and test files carry a brief preamble stating durable responsibility and
domain context; generated and vendored sources are exempt. Package entrypoints also show the public
API with a small example once behavior exists. The project guide owns the preamble schema.

## 5.2 Public APIs

Public package APIs, exported schemas, commands, and non-obvious exports carry API documentation
(the profile names the doc system); self-explanatory internal exports need none. Document what
applies: formats, ranges, units, defaults; auth/provider/environment assumptions; idempotency and
retries; expected `Result` errors; invariant throws; side effects; external state and cleanup. Types
replace parameter/return restatements; document a throw only when it marks programmer error; add an
example when usage is non-obvious; record known abstraction leaks (pagination slowdowns, rate limits
the adapter absorbs) as remarks.

Bad: `id - The id`. Good: `pageId - Stable page ID from the source CMS; path aliases must be
resolved before calling.`

## 5.3 Internal Comments

Comment only the non-obvious: domain rules, algorithm steps, workarounds, magic numbers and regexes,
security constraints, protocol quirks, concurrency assumptions. Never narrate assignments or
boilerplate. Non-exported functions are documented only when they assert an invariant, return
`Result`, are called from multiple files, or are not self-explanatory. Editing nuanced code includes
its nearby comments — a stale comment is a failing contract.

## 5.4 Package READMEs

Every workspace README states the package contract, covering every declared export and subpath, in
the template the project guide names. Commands go in a `Command | Use` table so agents need not
infer which are setup, iteration, final validation, or expensive/live.

## 5.5 Durable Docs

Code, tests, and docs move together: a behavior change is incomplete while any public contract,
README, topic page, glossary entry, or guide teaches old behavior, and a rename scans them for
affected context. The project guide names each location and changes only when the map, commands,
or rule translation change. No competing sources of truth: work artifacts link to topic pages and
decision records rather than restating them.

## 5.6 Review Rule

Block junk docs as you block missing docs: documentation that lies or restates names is worse than
none, because agents will trust it.
