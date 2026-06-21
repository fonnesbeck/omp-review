---
name: review-loop
description: >-
  Iteratively review and improve a plan until an independent review has no
  remaining actionable concerns. A bounded wrapper that runs `review-plans` in a
  fresh independent reviewer subagent each pass and revises the plan with the
  `address-review` triage pattern. Use this skill when the user asks to "run a
  review loop", "review and address until clean", "spawn a reviewer and integrate
  comments", "repeat review until all concerns are resolved", or wants a reusable
  loop that combines review-plans with address-review.
---

# Review Loop

Use this when the deliverable is a plan, proposal, RFC, implementation design, or
similar pre-execution artifact that should be stress-tested and revised until an
independent reviewer has no remaining actionable concerns.

This skill is a thin protocol around two existing skills — `review-plans` (how to
review) and `address-review` (how to triage each finding). It adds only the loop
contract: independence, bounded passes, deterministic artifacts, and an explicit
stop condition. Do not restate how to review or how to judge a finding; defer to
those skills.

## The three primitives

Model each run on three semantics. These are the conceptual frame, not commands
to type. `omp` exposes `goal.*` and `loop.*` as settings and `/plan` as a mode
that makes spawned subagents read-only; this skill reproduces their behavior as a
protocol and never invokes the slash commands:

- **Goal** — one objective with one stop condition: the latest independent review
  is clean, or every remaining finding is explicitly closed as non-actionable.
  The loop exists only to reach it.
- **Loop** — bounded iteration. `max_passes=3` by default; each pass is
  review → revise → re-review. Stop at the Goal or the bound; never spin.
- **Plan** — every reviewer is a fresh subagent that never edits the plan; it
  reads and reports. The main agent is the only writer of the plan. This mirrors
  plan mode, where spawned subagents are read-only. Where each pass's report is
  stored depends on the main agent's own writability (see **Artifacts**); the
  reviewer only ever reads and reports.

## Inputs

Accept any of these as the plan source: a path to a plan file, a `local://...`
planning artifact, a plan in the current conversation, or a directory of
candidate plan files. If the target is a directory or ambiguous, inspect likely
plan files before asking; ask only when multiple plausible candidates remain.

If the plan exists only in conversation, write it to a `local://` artifact first,
then loop against that file so every pass reviews the same text.

## Protocol

1. **Prepare.**
   - Read the plan artifact.
   - If scope or success criteria are ambiguous, run `socratic-review` first and
     fold its decisions into the plan (or a loop-owned
     `local://REVIEW_DECISIONS.md`). `socratic-review` natively writes a
     repo-root `DECISION_LOG.md`; move or copy that into the loop's `local://`
     artifact unless the user wants repo-local planning files.
   - Set `max_passes=3` unless the user gave another bound.
   - Fix artifact names up front (see **Artifacts**). Prefer `local://` unless
     the user wants repo-local planning files.

2. **Review (Plan primitive).** Spawn a fresh subagent and have it run
   `review-plans` on the current plan artifact. The assignment must require it to:
   - read and report only — skip builds, tests, formatters, project-wide checks;
   - deliver its report — a writable reviewer writes it to the pass path; a
     read-only reviewer returns it inline — never via `review-plans`' default
     `REVIEW.md`; the main agent then stores it per **Artifacts**;
   - end with exact counts `Critical=<n>, Warning=<n>, Note=<n>` (and the review
     path when it wrote a file).

3. **Validate output.** Locate this pass's review: at the pass path when the main
   agent is writable, or in the reviewer's inline return (conversation/chat) when
   the main agent is in plan mode. Read it before extracting findings. If the
   counts are missing, derive them from the `🔴`/`🟡`/`🟢` headings. If the path
   is missing or unreadable, ask the reviewer once over the conversation channel;
   if still unreadable, rerun the pass. Never advance without a readable review
   and exact counts.

4. **Revise (address-review pattern).** Extract every Critical, Warning, and Note
   finding and assign each a stable ID `P<pass>-<C|W|N><ordinal>` (e.g. `P1-C1`,
   `P1-W2`). Triage each finding with the `address-review` method — verify it
   against the plan and referenced repo context, then resolve it by editing the
   plan, partially resolve it, or decline it with evidence. For plan-only edits,
   verification means checking the revised plan and referenced repo context; do
   not run builds, tests, linters, or formatters unless executable artifacts
   changed. Record exactly one disposition per finding in the trail (see
   **Artifacts**); never silently skip a Note.

5. **Re-review (Loop primitive).** Spawn a new reviewer on the revised plan with a
   new review path. Never reuse a prior review as proof the plan is now clean.
   Repeat from step 2 until a stop condition holds.

## Artifacts

Where the loop's process files live is governed by one switch — the **main
agent's** writability.

**Main agent writable (normal).** Keep two deterministic files:

- `REVIEW-P1.md`, `REVIEW-P2.md`, … — one report per pass (the reviewer writes
  it, or the main agent saves the reviewer's inline return there).
- `REVIEW_DISPOSITION.md` — cumulative finding trail, one entry per finding:

```markdown
### P<N>-<C|W|N><ordinal> — <severity>: <finding title>
- Source: <review path>
- Disposition: Resolved | Partially resolved | Won't fix
- Changed: <plan section/file changed, or "None">
- Evidence: <specific change made or evidence-backed reason for decline>
```

Prefer `local://` artifacts unless the user wants repo-local planning files.
These are process artifacts; do not commit them unless the user asks.

**Main agent in plan mode** (only the plan file is writable, e.g. hardening a
staged plan). No separate files are possible — read each reviewer's inline return
during the loop, and fold the per-pass counts and the same per-finding
dispositions into the final closure report (append a `Dispositions` section at
the end of the final response block and set the closure's `Disposition trail:` to
`inlined below`). The revised plan is the durable artifact.

## Stop conditions (the Goal)

Stop only when one is true:

- The latest independent review reports `Critical=0, Warning=0, Note=0`.
- The latest review contains only findings already dispositioned as duplicate,
  out of scope, unverifiable with available evidence, stylistic-only, or
  intentionally excluded; list those decisions explicitly.
- `max_passes` is reached: unresolved actionable findings mean the loop is
  incomplete; non-actionable findings may be closed with evidence; another pass
  needs explicit user opt-in.
- The user stops the loop.

Do not stop merely because Critical and Warning are gone — a Note can encode a
missing acceptance criterion, an ambiguous contract, or future-reader confusion.

## Final response

```markdown
Review loop complete.

Plan: <path>
Disposition trail: <path>
Max passes: <n>
Iterations:
- Pass 1: Critical=<n>, Warning=<n>, Note=<n>, review=<path>
- Pass 2: Critical=<n>, Warning=<n>, Note=<n>, review=<path>

Outcome: Clean | Closed with non-actionable findings | Incomplete
Closure: <why the loop stopped>
Remaining actionable items: <none or bullet list>
Remaining non-actionable items: <none or bullet list>
```

Mention the changed plan path if it moved. Do not paste the full plan unless
asked.

## Guardrails

- Authoring and review roles stay separate: the main agent revises, subagents
  review.
- Preserve reviewer criticism; never reword a finding to make it easier to close.
- Resolve the root gap in the plan, not just the wording that triggered the
  reviewer.
- An evidence-backed `Won't fix` is valid; prefer a finite loop over endless
  perfection.
