---
name: transfer-session
description: >-
  Save the current session state to a durable markdown file, or adopt a
  previously saved session into the current conversation. Invoke when the user
  says "transfer session", "save session", "adopt session", "get session",
  "receive session", "resume session", or "pick up where I left off".
---

**Arguments:** For save — what the next session will focus on. For adopt — optional project name or file hint.

This skill has two modes: **save** and **adopt**. Infer which mode the user
wants from their words, or ask if ambiguous.

## Save mode

Triggered by phrases like "transfer session", "save session", "export session",
"I need to pick this up later".

Serialize the current session into a compact, structured markdown document.
A fresh agent should be able to read this file and resume work with minimal
ramp-up time.

### 0. Gather current state

Before writing the session file, collect the following. If any command fails,
note the failure and continue with what you have.

- **Git:** run `git branch --show-current`, `git status --short`, and
  `git diff --stat`.
- **Diagnostics:** re-read the most recent test failure or lint error output
  from this session's chat history.
- **Files:** list every file you modified or created in this session by
  reviewing the chat history for `edit`, `write`, and `bash` invocations.
- **Dependencies:** note any `pixi add`, `npm install`, or `pip install`
  commands issued this session.
- **Artifacts:** note any plans, ADRs, or issues referenced in chat by path or
  URL only.

### What to capture

Include only information needed to continue the task. Summarize ruthlessly.

1. **Session goal** — One-sentence description. Link to canonical artifacts
   (PRD, plan, issue, ADR) by path or URL only.
2. **Progress so far** — Completed items, decisions reached, approaches tried
   and rejected (one-line reason each).
3. **Active work state**
   - **Files in flight:** Modified, new, or deleted files with one-line status.
   - **Git state:** Branch name, commit hash if relevant, summary of
     uncommitted changes (reference the diff, do not paste it).
   - **Open diagnostics:** Recent test failures, lint errors, type-check
     errors, or runtime exceptions still unresolved.
4. **Open questions & blockers** — Explicit questions, blockers, risks, or
   assumptions that could invalidate the current direction.
5. **Relevant code & architecture** — Key interfaces, data structures, or
   functions being modified. Reference file paths and line ranges. Do not paste
   large code blocks.
6. **Environment & dependencies** — Active environment, running services,
   newly added dependencies, or special tooling.
7. **Suggested skills** — Recommend skills the next agent should invoke. To
   populate this, check this session's chat history for skills that were
   invoked (look for `/skill:name` commands or skill-trigger phrases). Suggest
   only skills that were used or are directly relevant to the remaining work.
   Include a one-line reason for each.
8. **Next steps** — Prioritized list of what the next session should do first.
   Include a clear "done" condition if one exists.

### What to strip

- Completed side quests that do not affect the current task.
- Converged iterations; state the decision only, omit the debate.
- Redundant tool output; summarize results.
- Sensitive information (API keys, passwords, tokens, PII). Replace with
  `[REDACTED]`.
- Duplicated artifacts; reference PRDs, plans, ADRs, issues, commits, or diffs
  by path or URL.

### Save location

Determine the save directory in this order:

1. Environment variable: `PI_SESSION_DIR`
2. Pi configuration field (if available): `session.saveDirectory`
3. Default: `~/.pi/sessions/`

If `PI_SESSION_DIR` is set but the directory does not exist and cannot be
created (permissions error, invalid path), stop and tell the user to fix the
variable or create the directory manually.

Otherwise, create the directory if it does not exist.

Use this filename format:

```
transfer-session_<project-name>_<YYYY-MM-DD>_<HHMMSS>.md
```

If a file with the computed name already exists, append a counter suffix
(`_2`, `_3`, ...) until the name is unique.

If the user passed arguments, treat them as a description of what the next
session will focus on. Tailor the "Next session focus" field and the "Next
Steps" section accordingly.

### Validation

After writing the file, confirm it exists and is non-empty. If the write
failed (disk full, permissions), report the error to the user.

### Output format

```markdown
# Session Snapshot: [Brief Title]

**Date:** [YYYY-MM-DD HH:MM]
**Project:** [Project name or path]
**Branch:** [Git branch]
**Next session focus:** [From user arguments, or inferred]

---

## Goal

[One sentence. Link to artifact if applicable.]

## Progress

- [Completed item]
- [Completed item]

## Active State

### Files in flight
- `path/to/file.py` — modified; [one-line status]
- `path/to/new_file.py` — new; [one-line status]

### Git summary
Branch: `feature/foo`. Uncommitted changes in 3 files.

### Diagnostics
- `pytest path/to/test.py::test_name` — failing with [short error summary]

## Open Questions & Blockers

1. [Question or blocker]
2. [Question or blocker]

## Relevant Code & Architecture

- `path/to/module.py:42-58` — [description of focal function/class]

## Environment

- [Any notes on environment, dependencies, or running services]

## Suggested Skills

- `skill-name` — [why it is relevant]
- `skill-name` — [why it is relevant]

## Next Steps

1. [First thing to do]
2. [Second thing to do]
3. [Done condition]
```

## Adopt mode

Triggered by phrases like "adopt session", "get session", "receive session",
"resume session", "pick up where I left off".

### 1. Discover available sessions

Read the session directory (same resolution order and error handling as save
mode). If the directory does not exist or contains no `.md` files, tell the
user no sessions are available and suggest they save one first.

Session files in `~/.pi/sessions/` accumulate if never adopted. You can safely
delete any `.md` file from this directory at any time.

List every `.md` file ordered by creation recency (newest first), showing:

- Filename
- Project name (parsed from the file header or filename)
- Date (parsed from the file header or filename)
- Next session focus (parsed from the file header, if present)

If a file is unreadable or has malformed content, skip it and note that it was
skipped. Continue with the remaining files.

**Matching rules:** If the user provided an argument:

1. Parse the `**Project:**` line from each file's header. Match
   case-insensitive substring against the user's argument.
2. If no header match, match case-insensitive substring against the filename
   (the `<project-name>` portion between the first `_` and the date).
3. If still no matches, try word-boundary matching (e.g., "django" matches
   "my-django-app" but not "djangonotes").
4. If still no matches, present the full list with a note that no project
   matched the argument.
5. If exactly one match is found at any step, skip the selection prompt and
   proceed directly to step 3.

### 2. Let the user choose

Present the list and ask the user which session to adopt. Wait for their
selection.

### 3. Load the session

Read the selected file in full. Session files are designed to be compact. If
one exceeds a few KB, the save agent did not follow the "summarize ruthlessly"
instruction. Load it anyway, but note the bloat to the user.

Present the session content as context for the current session.

### 4. Archive the session

After the session content has been successfully loaded, archive the file by
moving it to `~/.pi/sessions/.adopted/` using the same filename. Create
`.adopted/` if it does not exist, using default umask (no special access
controls are needed; session files are user-local and contain no secrets).

If the move fails (permissions, disk), warn the user and leave the file in
place. Do not delete.

Archived sessions accumulate. The `.adopted/` directory can be safely purged
at any time.

### 5. Confirm adoption

Briefly confirm to the user which session was adopted and what the immediate
next step should be based on the loaded context.
