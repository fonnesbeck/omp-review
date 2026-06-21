# Reference: Output Template
This document contains the exact output format to be used for the `review-implementation` skill.

### Chat summary (always)

One paragraph summarizing:
- The plan file and implementation scope reviewed
- Overall alignment level (Aligned / Partially aligned / Misaligned)
- The top 2–3 priorities (Critical findings, or Warnings if none)
- Any beyond-scope items worth noting

### Full report (file or inline)

```markdown
# Implementation Review: [Plan Title]

**Plan source:** [path/to/plan.md]
**Implementation scope:** [path/to/src/ or description]
**Overall alignment:** [Aligned / Partially aligned / Misaligned]
**Review date:** [Date]

---

## Summary

[Brief narrative of what was implemented well, what was missed, and the most
important gaps.]

---

## [Category Name]

### 🔴 Critical — [Issue Title]

**Plan requirement:** [Exact quote or precise paraphrase from the plan]

**Implementation status:** [What the code actually does, with file/function
reference]

**Assessment:** [Missing / Partially implemented / Divergent]

**Recommendation:** [Concrete next step the developer should take]

**Why:** [Educational context on why this gap matters]

---

### 🟡 Warning — [Issue Title]

**Plan requirement:** [Exact quote or precise paraphrase from the plan]

**Implementation status:** [What the code actually does, with file/function
reference]

**Assessment:** [Partially implemented / Divergent / Simplification opportunity / Efficiency opportunity]

**Recommendation:** [Concrete next step the developer should take]

**Why:** [Educational context on why this divergence matters]

---

### 🟢 Note — [Issue Title]

**Plan requirement:** [Exact quote or precise paraphrase from the plan, or
"Not specified in plan" for beyond-scope or efficiency items]

**Implementation status:** [What the code actually does, with file/function
reference]

**Assessment:** [Beyond scope / Simplification opportunity / Efficiency opportunity / Minor divergence]

**Recommendation:** [Concrete next step the developer should take]

**Why:** [Educational context]
```

Repeat the issue template for every finding within each category.
