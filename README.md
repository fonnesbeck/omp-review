# omp-review

`omp-review` is an Oh My Pi (omp) plugin that adds reusable review workflows for planning and implementation work. It helps an agent audit a plan before execution, run a bounded review/revision loop, compare finished work against the source plan, and triage review findings with evidence-backed dispositions.

The package is a pure omp skill plugin: all behavior lives in `skills/*/SKILL.md`, and `omp install .` makes those skills available through slash commands.

## What it does

- **Plan review** — checks plans for missing goals, architecture gaps, data strategy risks, security boundaries, testing strategy, dependency drift, timeline risk, and documentation gaps.
- **Review loops** — runs independent plan reviews in bounded passes, then addresses every finding until the latest review is clean or all remaining findings are explicitly non-actionable.
- **Implementation review** — maps a completed implementation back to the plan and reports what is complete, missing, divergent, beyond scope, or unnecessarily complex.
- **Implementation loops** — drives implementation from a plan through review, per-finding triage, re-review, and final simplification.
- **Socratic review** — stress-tests unresolved assumptions through focused questioning and writes a decision log.
- **Review triage** — verifies each review finding against the actual repo, applies warranted fixes, rejects false positives with evidence, and reports a disposition for every finding.

## Skills

| Skill | Purpose |
| --- | --- |
| `review-plans` | Audit project plans before implementation. |
| `review-loop` | Iterate plan reviews until actionable concerns are resolved. |
| `review-implementation` | Compare an implementation against its source plan. |
| `implementation-loop` | Implement a plan through bounded implementation-review and address-review passes. |
| `address-review` | Triage and address review findings with evidence-backed dispositions. |
| `socratic-review` | Stress-test unresolved assumptions in a plan through focused questions. |

## Install

```bash
git clone https://github.com/fonnesbeck/omp-review.git
cd omp-review
omp install .
```

`omp install .` links this package into omp's plugin directory. No extra command is required to install the skills.

## Optional local verification

These commands check this checkout directly without depending on the installed plugin state:

```bash
omp --no-session --plugin-dir . -p '/skills'
omp --no-session --plugin-dir . -p '/skill:review-plans'
```

## Usage

Invoke a skill from an omp session:

```text
/skill:review-plans path/to/PLAN.md
/skill:review-loop path/to/PLAN.md
/skill:review-implementation path/to/PLAN.md path/to/implementation/
/skill:implementation-loop path/to/PLAN.md
/skill:socratic-review
```

Use `/skill:socratic-review` first when the plan still has unresolved assumptions or unclear success criteria.

### Example: review and refine a plan

Given a plan at `plans/search-redesign.md`:

```text
/skill:review-loop plans/search-redesign.md
```

The loop will:

1. spawn an independent reviewer to run `review-plans`;
2. classify findings as `🔴 Critical`, `🟡 Warning`, or `🟢 Note`;
3. revise the plan or decline findings with evidence;
4. repeat with a fresh reviewer until no actionable findings remain or the bounded pass limit is reached.

For a finished implementation:

```text
/skill:review-implementation plans/search-redesign.md src/search/
```

This compares the implementation to the plan and reports missing requirements, divergences, testing gaps, simplification opportunities, dependency issues, and beyond-scope changes.

## Requirements

- omp.
- npm, only for package metadata checks (`npm run check`).
