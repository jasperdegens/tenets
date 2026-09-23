# 17 Remote Verification

Work is overseen from wherever the reviewer happens to be — a phone on any network, through
whichever agent interface is at hand — so verifying it never depends on a local environment.
Evidence is matched to the change, not attached to every change.

## 17.1 Evidence Where a Human Eye Is the Check

Evidence is owed when the gate cannot be the judge: something a user can see, something running in a
live system, a behavior only a person can call right. Internal refactors, logic the tests pin, docs,
and config need no artifact beyond the passing gate and the diff. When evidence is owed, it is
posted where the reviewer already looks — the write-up's verification line (Rule 16.5), the session,
the message — never as a local path or a description of what it would show, and the question it
answers is stated beside it so the reviewer can judge from the artifact alone. A failed verification
is shown the same way: the error captured, not paraphrased. Proof that cannot be produced goes under
the write-up's "Not run" (Rule 16.5), never unmentioned.

## 17.2 Visual Proof

Any change a user can see gets a screenshot of the result, at the viewports the change affects, on a
stated route. Capture with the harness's built-in browser when it has one, otherwise a scripted
browser — the project guide names the tool. A recording only when asked for; it costs far more than
a still and rarely proves more.

**Screenshots are sent in the chat, not committed.** Whenever the harness can attach a file to the
chat the reviewer is following, the screenshot goes there and the write-up's verification line says
so. Only when it cannot is the screenshot committed, and then linked to with a permalink the
reviewer's device can open (17.3), in the chat and on that line. A committed image widens the diff
under review and outlives the UI it shows.

Deliberate calibration: the screenshot is the human gate for design intent, which no assertion can
express. It never replaces behavioral tests (Rule 4) and is never a snapshot assertion (Rule 4.7).

## 17.3 Live URLs

Anything that can be exercised in a running system ships the URL the reviewer can open: a
per-change preview environment where the platform provides one (Rule 10.4), staging or production
once a push lands there — and every push that lands somewhere live is reported with its URL. A link
the reviewer's device cannot open is not a verification link; say what stands in for it.

## 17.4 Flag Local-Only Work

Work is assumed to run in a remote environment provisioned with the project's variables and secrets.
Anything that cannot — device hardware, a service reachable only from one machine, a credential not
provisioned there — is named in the plan's slice (Rule 14.4) before it blocks and under the
write-up's "Not run" (Rule 16.5) when the change lands, so the reviewer knows what remote execution
does not cover. Never fall back silently to "run it locally".
