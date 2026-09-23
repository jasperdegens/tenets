# 17 Remote Verification

Verification must work from the reviewer's device. Match evidence to the change; do not attach an
artifact to every change.

## 17.1 Evidence Where a Human Eye Is the Check

Provide evidence when automation cannot judge the result: visible behavior, a live system, or a
subjective outcome. Tests and the diff suffice for internal logic, docs, and config. Put the artifact
and the question it answers where review happens, never behind a local path. Capture failures too;
list unavailable proof under `Not run` (Rule 16.5).

## 17.2 Visual Proof

Any visible change gets a screenshot at each affected viewport and route, using the guide's browser
tool. Record video only when requested.

Send screenshots in the review conversation, not the repository. Commit one only when attachment is
impossible, then provide an accessible permalink (17.3).

A screenshot proves design intent, not behavior; it never replaces tests (Rule 4.7).

## 17.3 Live URLs

Provide an accessible preview, staging, or production URL for running changes and report every live
push. If the reviewer cannot open it, state the substitute evidence.

## 17.4 Flag Local-Only Work

Name anything remote execution cannot access in the plan (Rule 14.4) and under `Not run` (Rule
16.5). Never silently fall back to local-only verification.
