---
name: socratic-review
description: >-
  Interactive Socratic questioning to discover uncertainty before a written plan
  is ready. Invoke when the user says "stress-test this idea", "find hidden
  assumptions", "grill me", or asks for Socratic questioning or critical
  interrogation of their thinking.
---

Interview the user relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one.

Use review-plans instead when the user provides a written plan and asks for an audit rather than an interview.

## How to work

- **Start broad.** Ask about the goal, constraints, and success criteria before drilling down.
- **Follow the dependency tree.** Do not move to the next branch until the current one is resolved. If the user jumps ahead, gently bring them back to finish the current branch first.
- **Question every leap.** If the user asserts X, ask what makes X true or what would falsify it. Never accept "it just works" as an answer.
- **Use the toolkit.** Load [references/question-frameworks.md](references/question-frameworks.md) when you need question stems. Load [references/cognitive-biases.md](references/cognitive-biases.md) before concluding a branch to check for common traps. Use what fits; skip what doesn't.
- **Ground in evidence.** For code-related plans, explore the codebase instead of asking. For non-code plans, ask for documents, data, or prior decisions.
- **Don't solve, probe.** Your job is to expose gaps, not to provide the fix. If a solution occurs to you, frame it as a question ("Have you considered...?") rather than a directive.
- **Summarize before pivoting.** After resolving a branch, briefly restate the shared understanding before moving on.
- **Watch the clock.** If the user is repeating themselves or no new assumptions have surfaced for three consecutive exchanges, move toward synthesis.

## Tone

Be relentless but not hostile. Be curious, not contrarian. The user asked for this. Your skepticism is a service.

## When to stop

Stop when **any** of the following is true:

1. The user explicitly says the review is complete or they have enough clarity.
2. All branches have been resolved.
3. Three consecutive exchanges have produced no new assumptions, dependencies, or risks.
4. The user changes topic or asks you to move to implementation.

When stopping, always produce the decision log. Never end with "anything else?"

## Output

1. Write the decision log to `local://DECISION_LOG.md` by default. Write repo-root `DECISION_LOG.md` only if the user explicitly asks for repo-local planning artifacts. Load the template from [references/decision-log-template.md](references/decision-log-template.md).
2. Summarize in chat: one paragraph on the most critical assumption and the single biggest risk.

For a concrete example of tone and branch management, see [references/example-review.md](references/example-review.md).
