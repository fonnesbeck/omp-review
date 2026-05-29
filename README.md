# cutie-pi

<img src="cutie-pi-logo.png" alt="cutie-pi logo" width="200">

**cutie-pi** is a custom [pi](https://github.com/mariozechner/pi) package that adds extensions and skills to the pi coding agent — a toolkit for better coding workflows.

## What's Inside

The package currently includes the following tools, with more on the way:

### Extensions

| Extension | Description |
|-----------|-------------|
| [`code-simplifier`](extensions/code-simplifier.ts) | Tracks files modified during an agent run and can automatically (or on-demand) trigger a follow-up pass that simplifies and refines the code for clarity, consistency, and maintainability. |
| [`nu-user-bash`](extensions/nu-user-bash.ts) | Intercepts `user_bash` events to route commands through Nushell instead of the default shell. |

**Commands added:**
- `/simplify` — Manually run simplification on recently modified files.
- `/simplify-auto on\|off` — Toggle automatic simplification after every edit.
- `/simplify-status` — List files currently tracked for simplification.

### Skills

| Skill | Description |
|-------|-------------|
| [`code-simplifier`](skills/code-simplifier/SKILL.md) | System instructions injected during a simplification turn. Focuses on preserving functionality while applying project-specific standards and improving readability. |
| [`socratic-review`](skills/socratic-review/SKILL.md) | Rigorous Socratic questioning to stress-test a plan or design. Invoke with "review my plan," "grill me," or `/skill:socratic-review`. Produces a `DECISION_LOG.md` at the end. |
| [`review-plans`](skills/review-plans/SKILL.md) | Pre-execution audit of software and data-science project plans. Invoke with "review this plan," "audit this proposal," or `/skill:review-plans`. Produces a categorized severity report (`REVIEW.md`) using the PCS framework for data-science plans. |
| [`review-implementation`](skills/review-implementation/SKILL.md) | Compares a finished implementation against its original plan to identify gaps, divergences, and efficiency opportunities. Invoke with "compare this to the plan," "review implementation," or `/skill:review-implementation`. Produces `IMPLEMENTATION_REVIEW.md`. |
| [`transfer-session`](skills/transfer-session/SKILL.md) | Save the current session state to a durable markdown file, or adopt a previously saved session into the current conversation. Invoke with "transfer session," "save session," "adopt session," or "pick up where I left off." |
| [`todoist-time-blocking`](skills/todoist-time-blocking/SKILL.md) | Plan and review work on a daily and weekly cadence using a prioritized task slate (inspired by the Ivy Lee method) with Todoist time-blocking. Provides `plan_day`, `nightly_review`, and `weekly_review` functions. Depends on the `todoist-api` skill and `gws-calendar` tools. |

### Themes

| Theme | Description |
|-------|-------------|
| [`cobalt2`](themes/cobalt2.json) | A high-contrast blue theme inspired by the classic Cobalt 2 color palette. |
| [`cutie-pi`](themes/cutie-pi.json) | A warm dark theme with soft orange and purple accents. |

## Installation

1. **Clone or copy** this repository into a directory of your choice:
   ```bash
   git clone https://github.com/fonnesbeck/cutie-pi.git
   cd cutie-pi
   ```

2. **Install as a local pi package** by adding the path to your pi configuration. In your `~/.pi/config.json`:
   ```json
   {
     "packages": [
       "/path/to/cutie-pi"
     ]
   }
   ```

   Or install directly via the pi CLI:
   ```bash
   pi install /path/to/cutie-pi
   ```

3. **Restart pi** (or reload packages) to load the extensions and skills.

## Requirements

- [pi](https://github.com/mariozechner/pi) coding agent
- Node.js (for TypeScript extensions)

## License

MIT — see [LICENSE](LICENSE).
