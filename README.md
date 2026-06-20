# omp-review

OMP plugin for reviewing plans, iterating plan reviews, reviewing implementations against plans, and running implementation-review loops.

## Skills

| Skill | Purpose |
| --- | --- |
| `address-review` | Triage and address review findings with evidence-backed dispositions. |
| `review-plans` | Audit project plans before implementation. |
| `review-loop` | Iterate plan reviews until actionable concerns are resolved. |
| `review-implementation` | Compare an implementation against its source plan. |
| `implementation-loop` | Implement a plan through bounded implementation-review and address-review passes. |
| `socratic-review` | Stress-test unresolved assumptions in a plan through focused questions. |

## Install

```bash
git clone https://github.com/fonnesbeck/omp-review.git
cd omp-review
omp install .
omp plugin list
```

The install command links the local package into OMP's plugin directory. `omp
plugin list` should show `omp-review@1.0.0`; `--extension .` is not an install
verification command.

## Usage

```text
/skill:review-plans path/to/PLAN.md
/skill:review-loop path/to/PLAN.md
/skill:review-implementation path/to/PLAN.md path/to/implementation/
/skill:implementation-loop path/to/PLAN.md
/skill:socratic-review
```

Use `/skill:socratic-review` when a plan has unresolved assumptions.

Unrelated personal skills, extensions, and themes live outside this repository.

## Requirements

- OMP.
- Node-compatible TypeScript loading for extension entry points.
