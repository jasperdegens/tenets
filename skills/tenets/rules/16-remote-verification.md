# 16 Remote Verification

Work is overseen from wherever the reviewer happens to be — a phone on any network, through
whichever agent interface is at hand — never from a developer's machine. So every claim of done
carries evidence a human can judge at a glance, and every step of the work can run and be checked
without a local environment.

## 16.1 Evidence, Not Assertion

"It works" is not a status. A change ships with the artifact that proves it, matched to what
changed: a screenshot or recording for anything visible, a live URL for anything running, the gate's
output for logic and tests, a link to the diff for code. The artifact is posted where the reviewer
already looks — the PR, the session, the message — never as a local path or a description of what a
screenshot would have shown. When no proof can be produced, say so and name what stands in for it. A
failed verification is shown the same way: the error captured, not paraphrased.

## 16.2 Visual Proof

Any change a user can see gets screenshots: before and after when it alters something existing, at
every viewport and theme the change affects, on a stated route and data state. Capture with the
harness's built-in browser when it has one, otherwise a scripted browser — the project guide names
the tool. Interactions and motion a still frame cannot prove get a recording. Redact secrets and
personal data before posting.

Deliberate calibration: the screenshot is the human gate for design intent, which no assertion can
express. It never replaces behavioral tests (Rule 04) and is never a snapshot assertion (Rule 4.7).

## 16.3 Live URLs

Anything that can be exercised in a running system ships a URL: a per-change preview environment by
default (platform-native, Rule 10.4), then staging or production once a push lands there. Every URL
states the commit it serves, what to check — a few steps with expected outcomes — and when it
expires. A link a phone cannot open, or that needs a VPN or local tunnel, is not a verification link.

## 16.4 Remote-Executable Work

Plan and slice work (Rule 14.4) so every slice runs to green in a fresh cloud session from
documented commands (Rule 08): no local secrets, no machine-specific setup, no unpushed state.
Whatever truly requires a local device is named as such in the plan and isolated so the rest still
lands. Work state lives in shared, addressable places — a pushed branch, an open PR carrying the
plan and current status, a resumable session link — so any device or agent interface can pick up
where the last one stopped.

## 16.5 Mobile-Sized Requests

A request for human verification is one message: the artifact inline, the commit it reflects, and a
question answerable with a tap — pass, fail, or a pick between options. Batch pending checks into one
request rather than a drip. Never ask the reviewer to clone, run, or open an editor to answer.
