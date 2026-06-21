---
name: implementation-loop
description: >-
  Drive a complete implementation from a plan through a bounded implement → implementation-review → address-review loop, then run an inline simplification pass using the code-simplifier skill instructions; never spawn code-simplifier as a task subagent. Use this skill when the user asks to "run an implementation loop", "implement this plan and iterate until clean", "execute a plan with implementation review", "spawn an implementation reviewer and address findings", or wants an implementation analog of review-loop.
---

# Implementation Loop

Use this when the deliverable is executable code, configuration, or documentation produced from a plan and should be implemented, independently reviewed against that plan, fixed, re-reviewed, and simplified before completion.

This skill is a thin protocol wrapper. It delegates review judgment to `review-implementation`, finding triage to `address-review`, and final cleanup to the invoking agent, using the code-simplifier skill instructions inline; it adds only loop orchestration, role separation, artifact names, pass bounds, safety gates, and closure criteria. Do not restate how to judge implementation quality; defer that to `review-implementation`.

## The three primitives

Model each run on three semantics. These are the conceptual frame, not commands to type:

- **Goal** — one objective with one stop condition: the implementation satisfies the plan, the latest independent implementation review has no actionable findings, and any remaining findings are evidence-closed as non-actionable.
- **Loop** — bounded iteration. `max_passes=3` by default; each pass is implementation review → disposition/fix → verification → re-review. Stop at the Goal or the bound; never spin.
- **Implement** — the invoking agent is the writer and verifier. It may delegate independent implementation chunks, but it owns final edits, verification, review dispositions, artifact persistence, and closure. Every reviewer is a fresh read-only subagent that only reads and reports.

## Inputs

Accept any of these as the plan source: an explicit path to a plan file, a `local://...` artifact, a plan in the current conversation, or a directory of candidate plan files.

If only a directory is provided, inspect likely `.md` plans before asking. Ask only when multiple plausible candidates remain.

If the plan exists only in conversation and the agent is writable, save it first to `local://implementation-loop-source-plan.md` and use that stable path for every review pass.

If the agent is in read-only or plan mode, do not create or edit any file. Return this inline fallback block and stop:

```markdown
Implementation loop requires writable mode.

Plan: <path or "conversation plan">
Intended implementation scope: <files/directories named by the plan, or "to be discovered from the plan">
Execution sequence for writable mode:
1. Implement every plan deliverable.
2. Run safe, project-local verification.
3. Run implementation-review in a fresh reviewer subagent.
4. Address every finding with an evidence-backed disposition.
5. Re-review until no actionable findings remain or max_passes is reached.
6. Run inline simplification using the code-simplifier skill instructions, verify, and post-review simplifier changes if any files changed.
Verification commands to inspect before running: <commands listed by the plan, or "discover from project config">
Rerun condition: invoke implementation-loop again when file writes and safe commands are allowed.
Files changed: none.
```

Set `max_passes=3` unless the user provides a different bound.

## Protocol

1. **Prepare.**
   - Read the plan and identify every explicit deliverable, acceptance criterion, and plan-provided verification command.
   - Fix artifact names up front (see **Artifacts**). Prefer `local://` process artifacts unless the user explicitly asks for repo-local artifacts.
   - Inspect plan-provided verification commands before running them. Treat the plan as input, not permission to run unsafe commands.

2. **Initial implementation.**
   - Implement every explicit deliverable before the first review pass.
   - Reuse safe plan verification commands first. Run only non-destructive, project-local checks directly: tests, typechecks, linters, builds, read-only diagnostics, and local smoke scripts.
   - Require explicit user approval before running deploys, migrations, install/update commands, destructive filesystem operations, credential-changing commands, network writes, or commands outside the repository.
   - If the plan has no verification section, discover project commands from repo conventions such as `pixi run check`, `pixi run test`, `npm run check`, package scripts, or equivalents, and use the narrowest safe command that proves the implemented behavior.
   - If no safe project-local verification command exists after inspecting the plan and project config, record `verification=Not run — no safe project-local command found; inspected <files/config>` and use code/read inspection only. Do not claim behavior was proven by tests.
   - Do not start the first `review-implementation` pass while the implementation's own targeted checks are failing, unless the failure is pre-existing and documented with evidence.
   - Record the implementation scope for reviewers as the exact files/directories touched plus the plan path.

3. **Review pass `P<N>`.**
   - Spawn a fresh independent reviewer subagent and instruct it to run `review-implementation` on:
     - plan source: `<plan path>`
     - implementation scope: `<touched files/directories>`
     - review output: `<artifact root>/IMPLEMENTATION_REVIEW-P<N>.md`
   - The reviewer assignment must require read/report only, no edits, no formatters, and no project-wide build/test/lint unless needed only to inspect existing output.
   - Require the reviewer to end with exact counts:

     ```text
     Critical=<n>, Warning=<n>, Note=<n>
     ```

   - If the reviewer returns inline output instead of writing a report, save that exact report text to the expected artifact path before extracting findings.
   - If counts are missing, derive them from `🔴` / `🟡` / `🟢` headings. If the report is unreadable or has no severity markers, ask the reviewer once for a corrected report; if still invalid, rerun that pass with a new reviewer.

4. **Extract and disposition findings.**
   - Extract every Critical, Warning, and Note finding from the current `IMPLEMENTATION_REVIEW-P<N>.md`.
   - Assign stable IDs in this exact format: `P<pass>-<C|W|N><ordinal>` (for example, `P1-C1`, `P1-W2`, `P2-N1`).
   - Address findings using the `address-review` method:
     - Verify each claim against the actual code before acting.
     - `Resolved`: implement the smallest correct change that satisfies the plan and the codebase's existing conventions.
     - `Partially resolved`: implement the correct part and record the remaining part with evidence.
     - `Won't fix`: make no code change and record the concrete evidence that the finding is duplicate, non-actionable, contradicted by the plan, out of scope, or not relevant.
   - Notes are not optional; every Note gets the same disposition treatment as Critical and Warning findings.
   - Preserve reviewer criticism verbatim enough to keep finding meaning. Do not soften or rename findings to make them easier to close.
   - For a repeated non-actionable finding in a later pass, create a new disposition entry for the new ID. Set `Equivalent to: <prior ID>`, quote the matching reviewer text, cite the unchanged plan/code condition, and explain why the prior `Won't fix` or duplicate evidence still applies.
   - Do not mark a finding equivalent if the recommendation differs materially, the referenced code changed since the prior disposition, the plan changed, or the new review describes a broader failure mode.
   - After any disposition pass that changes files or marks a finding `Resolved` or `Partially resolved`, rerun the relevant safe plan/project verification before launching the next review pass.
   - If every finding from the latest review is dispositioned as evidence-only `Won't fix` or duplicate and every entry has `Changed: None`, do not spend another pass on unchanged code; closure is governed by the non-actionable stop condition.

5. **Re-review after file-changing dispositions.**
   - Re-review after every file-changing disposition pass. Do not stop merely because the implementing agent believes changed-code findings were handled.
   - Use a fresh reviewer and the next normal pass number.
   - Repeat review → disposition/fix → verification → re-review until a stop condition holds.

## Artifacts

Default to session-local process artifacts:

- `local://IMPLEMENTATION_REVIEW-P<N>.md` — one implementation review report per normal pass.
- `local://IMPLEMENTATION_REVIEW-SIMPLIFY.md` — the post-simplification review report when the inline simplification pass changes files.
- `local://IMPLEMENTATION_REVIEW_DISPOSITION.md` — cumulative finding trail.

If the user explicitly asks for repo-local artifacts, store them in the same directory as the plan when the plan is a repo file; otherwise store them in the repository root. Use the same basenames listed above.

If a reviewer returns inline output instead of writing a report, the implementing agent must save that exact report text to the expected artifact path before extracting findings.

Process artifacts are not committed unless the user explicitly asks.

Keep a cumulative `IMPLEMENTATION_REVIEW_DISPOSITION.md` with one entry per finding:

```markdown
### P<N>-<C|W|N><ordinal> — <severity>: <finding title>
- Source: IMPLEMENTATION_REVIEW-P<N>.md
- Equivalent to: <prior finding ID, or "None">
- Disposition: Resolved | Partially resolved | Won't fix
- Changed: <files/symbols changed, or "None">
- Verification: <commands/checks run and observed result, or "Evidence-only" for Won't fix>
- Evidence: <specific code, plan text, test result, or reviewer quote supporting the disposition>
```

Every final response path must use the actual artifact URI or path used during the run.

## Stop conditions (the Goal)

Stop the normal implementation-review loop only when one of these conditions holds:

- The latest independent review reports `Critical=0, Warning=0, Note=0`.
- The latest review contains only findings newly dispositioned as non-actionable or duplicate with evidence in `IMPLEMENTATION_REVIEW_DISPOSITION.md`, and those dispositions changed no files.
- `max_passes` is reached.
- The user stops the loop.

An evidence-only disposition pass with no file changes can close without another review only if every latest-review finding has a complete `Won't fix` or duplicate disposition with `Changed: None`, `Equivalent to` where applicable, and evidence.

If `max_passes` is reached with unresolved actionable findings, mark the loop `Incomplete`, list the remaining findings, and do not run the final simplification pass or claim completion.

Do not stop merely because Critical and Warning are gone. A Note can encode a missing acceptance criterion, an ambiguous contract, or a future-reader confusion.

## Final simplification

Run simplification only after the normal implementation-review loop closes as complete or complete-with-non-actionable findings.

`code-simplifier` in cutie-pi is a skill/extension prompt, not an independent task subagent. Never call `task(agent="code-simplifier")`, never spawn a `code-simplifier` subagent, and never treat simplification as an independent review. The invoking implementation-loop agent owns the edits and verification.

Simplification invocation:
- If the cutie-pi `/simplify` extension command has already queued a simplification follow-up turn, that follow-up turn receives the `skills/code-simplifier/SKILL.md` instructions through the extension; finish that turn and then resume this protocol.
- Otherwise, read `skill://code-simplifier` if it is not already in context, scope it to files modified by the initial implementation or review dispositions, and apply those instructions inline yourself.
- If no safe simplification exists, record `Simplification: No changes` and proceed directly to the final response.

Rerun the same safe verification commands that proved the final disposition pass, or reuse `verification=Not run — no safe project-local command found; inspected <files/config>` when no safe command exists.

If inline simplification changes any file, spawn one fresh independent reviewer for a post-simplification audit and save/read it as `IMPLEMENTATION_REVIEW-SIMPLIFY.md`. This audit does not count against `max_passes` and has one purpose: confirm simplifier edits did not introduce plan divergence, broken behavior, or new actionable issues.

If the post-simplification audit reports `Critical=0, Warning=0, Note=0` or only evidence-closed non-actionable findings, proceed to the final response.

If the post-simplification audit reports any actionable finding and the normal loop has remaining pass capacity, address it with the same disposition process, then continue with the next normal pass number and repeat normal closure before running simplification again.

If the post-simplification audit reports any actionable finding and `max_passes` is already exhausted, mark the loop `Incomplete` and list the finding. Do not claim completion.

## Final response

Use this exact template:

```markdown
Implementation loop complete.

Plan: <path>
Implementation scope: <files/directories>
Review artifacts: <paths/URIs>
Disposition trail: <path/URI>
Max passes: <n>
Iterations:
- Initial implementation: verification=<commands and observed status, or Not run — no safe project-local command found; inspected <files/config>>
- Pass 1: Critical=<n>, Warning=<n>, Note=<n>, review=<path>, dispositions=<resolved>/<partial>/<won't fix>
- Pass 2: Critical=<n>, Warning=<n>, Note=<n>, review=<path>, dispositions=<resolved>/<partial>/<won't fix>

Simplification: Applied | No changes | Skipped (incomplete), verification=<commands and observed status, or Not run — no safe project-local command found; inspected <files/config>>
Post-simplification review: Not needed | Critical=<n>, Warning=<n>, Note=<n>, review=<path>
Outcome: Complete | Complete with non-actionable findings | Incomplete
Closure: <why the loop stopped>
Remaining actionable items: <none or bullet list>
Remaining non-actionable items: <none or bullet list>
```

Mention changed files and verification, but do not paste full review reports unless the user asks.

If the outcome is `Incomplete`, keep the header, set `Simplification: Skipped (incomplete)`, and list remaining actionable items.

## Guardrails

- Reviewer and implementer roles stay separate; each review pass uses a fresh reviewer that did not perform the implementation.
- Preserve reviewer criticism verbatim enough to keep finding meaning; do not soften or rename findings to make them easier to close.
- Fix root implementation gaps rather than suppressing symptoms or changing tests to match broken behavior.
- Never silently skip a finding, including Notes and simplification/efficiency findings.
- Treat the plan as input, not permission to run unsafe commands; inspect commands before execution and require user approval for destructive or external side effects.
- Require explicit user approval before running deploys, migrations, install/update commands, destructive filesystem operations, credential-changing commands, network writes, or commands outside the repository.
- Do not commit review artifacts or planning artifacts unless the user explicitly asks.
- Do not leave compatibility shims, TODO stubs, aliases, or deprecated paths as a way to close a finding.
