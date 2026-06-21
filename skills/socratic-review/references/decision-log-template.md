# Decision Log Template

Load this template when the user confirms the review is complete or when the completion criteria are met.

```markdown
# Socratic Review Decision Log

## Goal Restatement
One-sentence restatement of the user's goal, in shared terms.

## Key Assumptions
| Assumption | Confidence | Basis |
|------------|-----------|-------|
| e.g., "API latency < 100ms" | high / medium / low | Load test on staging |

## Dependencies Mapped
| Dependency | Blocker? | Mitigation |
|------------|----------|------------|
| e.g., "Auth service v2 rollout" | yes / no | Fallback to v1 tokens |

## Risks Identified
- Risk: [description]
  - Likelihood: high / medium / low
  - Impact: high / medium / low
  - Mitigation: [description]

## Open Questions Remaining
- [ ] Question that still needs research or an external decision.

## Branch Resolution Status
| Branch | Status | Notes |
|--------|--------|-------|
| e.g., "Data schema" | resolved | Agreed on JSON, nested objects |
| e.g., "Deployment strategy" | open | Needs ops team input |
```

Fill every section. If a section has nothing to report, write "None identified" rather than leaving it blank.
