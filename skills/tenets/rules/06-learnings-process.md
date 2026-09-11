# 06 Learnings Process

Non-obvious operational knowledge goes to the learnings inbox (location in the project guide) until
a deliberate curation pass promotes it into a topic page, the glossary, or a decision record.

## 6.1 When to Capture

Capture what a future agent could not infer from code, tests, or durable docs: surprising command or
CI behavior, a hidden utility, a package gotcha, a debugging root cause, a provider quirk, a rabbit
hole to avoid, reviewer feedback revealing a missing convention. Skip general language and framework
knowledge and notes with no future value.

## 6.2 Rabbit Hole Protocol

After three failed approaches, ~10 minutes without progress, or on the verge of changing root
config, dependencies, or architecture from local symptoms: stop, capture what you learned in the
inbox, ask for guidance with specific options, wait. This is the one stop-and-capture trigger.

## 6.3 Entry Format

One discovery per file, named `YYYYMMDD-HHMM-short-slug.md` so parallel writers cannot collide, in
the template the project guide names: context, learning, action, promotion target. Compiled docs
never link inbox entries; raw notes stay discoverable through their folder.

## 6.4 Curation

During normal work, capture freely and leave unrelated learnings alone. When asked to curate:
promote durable facts to the right topic page, rule, or README; delete entries once represented or
staled. Rules and compiled docs override inbox entries; a learning never justifies violating a rule.
