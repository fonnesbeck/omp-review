# cutie-pi

<img src="cutie-pi-logo.png" alt="cutie-pi logo" width="200">

**cutie-pi** is a personal [Oh My Pi](https://github.com/can1357/oh-my-pi) / pi toolkit: a collection of extensions, skills, and themes that I use every day. It is not a product to install and forget. It is a starting point to copy, mutate, and make your own.

If you see something you like, take it. If you do not like how a skill phrases its instructions, rewrite it (or ask omp to rewrite it for you). If an extension almost fits your workflow, change the code, or tell omp what you want and let it scaffold the changes. The harness is built for this.

## What's Inside

The package currently includes the following tools, with more on the way:

### Extensions

| Extension | Description |
|-----------|-------------|
| [`code-simplifier`](extensions/code-simplifier.ts) | Tracks files modified during an agent run and can automatically (or on-demand) trigger a follow-up pass that simplifies and refines the code for clarity, consistency, and maintainability. |
| [`nu-user-bash`](extensions/nu-user-bash.ts) | Intercepts `user_bash` events and executes commands through Nushell (`nu -c`) instead of the default shell. Honors `PI_USER_NU_SHELL` for a custom Nushell path and disables itself if Nushell is unavailable. |

**Commands added:**
- `/simplify` — Manually run simplification on recently modified files.
- `/simplify-auto on\|off` — Toggle automatic simplification after every edit.
- `/simplify-status` — List files currently tracked for simplification.

### Skills

| Skill | Description |
|-------|-------------|
| [`address-review`](skills/address-review/SKILL.md) | Triage and act on a review/feedback document, finding-by-finding. Invoke with "address this review," "resolve findings," "triage review," or `/skill:address-review`. Produces a per-finding disposition report (Resolved / Won't fix / Partially resolved). |
| [`audit-skills`](skills/audit-skills/SKILL.md) | Audit a directory of skills for visibility, deterministic vs non-deterministic behavior, and composability. Produces a structured report with per-skill ratings and cross-cutting findings. |
| [`code-simplifier`](skills/code-simplifier/SKILL.md) | System instructions injected during a simplification turn. Focuses on preserving functionality while applying project-specific standards and improving readability. |
| [`lessons-learned`](skills/lessons-learned/SKILL.md) | Automatically augment a skill after friction, misunderstandings, or back-and-forth correction. Invoke with "that was painful," "fix that skill," or `/skill:lessons-learned`. Surgically edits the target skill's `SKILL.md` so future invocations incorporate the correction. |
| [`nushell`](skills/nushell/SKILL.md) | Practical guidance for writing and running Nushell commands, scripts, and structured-data pipelines. Covers MCP and `nu -c` execution, Bash-to-Nushell translations, common syntax gotchas, and references for JSON/YAML/TOML/CSV/Parquet/SQLite workflows. |
| [`plan-viz`](skills/plan-viz/SKILL.md) | Create a rich, self-contained HTML visualization of an implementation plan. Invoke with "visualize my plan," "plan overview," or "show me the plan." Gathers plan content from conversation or files and produces a styled HTML artifact with phases, architecture, code excerpts, risks, and success criteria. |
| [`review-implementation`](skills/review-implementation/SKILL.md) | Compares a finished implementation against its original plan to identify gaps, divergences, and efficiency opportunities. Invoke with "compare this to the plan," "review implementation," or `/skill:review-implementation`. Produces `IMPLEMENTATION_REVIEW.md`. |
| [`review-loop`](skills/review-loop/SKILL.md) | Bounded wrapper that drives `review-plans` (a fresh independent reviewer subagent per pass) and the `address-review` triage pattern until a plan is clean. Reframed around goal/loop/plan semantics. Invoke with "run a review loop," "review and address until clean," "spawn a reviewer and integrate comments," or "repeat review until all concerns are resolved." Keeps per-pass reports (`REVIEW-P1.md`, ...), finding IDs, a `REVIEW_DISPOSITION.md` trail, and `max_passes=3` by default. |
| [`review-plans`](skills/review-plans/SKILL.md) | Pre-execution audit of software and data-science project plans. Invoke with "review this plan," "audit this proposal," or `/skill:review-plans`. Produces a categorized severity report (`REVIEW.md`) using the PCS framework for data-science plans. |
| [`socratic-review`](skills/socratic-review/SKILL.md) | Rigorous Socratic questioning to stress-test a plan or design. Invoke with "review my plan," "grill me," or `/skill:socratic-review`. Produces a `DECISION_LOG.md` at the end. |
| [`slidev`](skills/slidev/SKILL.md) | Opinionated guidance for building, editing, launching, reviewing, and exporting technical presentations with [Slidev](https://sli.dev). Covers neversink/the-unnamed themes, visual design, storytelling, code/math/diagram slides, and existing-deck edit guardrails. |
| [`todoist-time-blocking`](skills/todoist-time-blocking/SKILL.md) | Plan and review work on a daily and weekly cadence using a prioritized task slate (inspired by the Ivy Lee method) with Todoist time-blocking. Provides `plan_day`, `nightly_review`, and `weekly_review` functions. Depends on the `todoist-api` skill and `gws-calendar` tools. |

### Themes

| Theme | Description |
|-------|-------------|
| [`cobalt2`](themes/cobalt2.json) | A high-contrast blue theme inspired by the classic Cobalt 2 color palette. |
| [`cutie-pi`](themes/cutie-pi.json) | A warm dark theme with soft orange and purple accents. |

## How to Use This with Oh My Pi

The fastest way to benefit is to cherry-pick what you need. Copy a single skill, extension, or theme into your own OMP setup and adapt it.

If you want the whole package, install it as a linked local OMP plugin:

1. **Clone or copy** this repository:
   ```bash
   git clone https://github.com/fonnesbeck/cutie-pi.git
   cd cutie-pi
   ```

2. **Link it into OMP**:
   ```bash
   omp plugin link /path/to/cutie-pi
   ```

   For this checkout, that would be:
   ```bash
   omp plugin link ~/repos/cutie-pi
   ```

3. **Restart or reload OMP** to load the skills, extensions, and themes.

Linking is better than copying when you are actively customizing the package: OMP symlinks the local repository, so changes you make here are available after the next restart or reload.

The package currently declares its capabilities through the `pi` manifest key in `package.json`, which OMP accepts. If you only want a subset, copy or symlink individual directories into the native OMP locations instead:

```text
~/.omp/agent/skills/
~/.omp/agent/extensions/
```

Then start changing things. Rename a skill. Tighten a prompt. Add a new extension. The value is in the customization, not the defaults.

## Requirements

- [Oh My Pi](https://github.com/can1357/oh-my-pi) (`omp`)
- Node.js or Bun-compatible TypeScript extension loading
- [Nushell](https://www.nushell.sh/) for the `nu-user-bash` extension and `nushell` skill workflows; set `PI_USER_NU_SHELL` if `nu` is not on `PATH`

## License

MIT — see [LICENSE](LICENSE).
