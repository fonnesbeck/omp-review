# Reference: Output Template
This document contains the exact output format to be used for the `review-plans` skill.

### Chat summary (always)

One paragraph summarizing:
- The plan type detected
- Overall risk level (Low / Medium / High)
- The top 2–3 priorities (Critical findings, or Warnings if none)

### Full report (file or inline)

```markdown
# Plan Review: [Title or Filename]

**Plan type:** [Software / Data Science / Mixed / Infrastructure / Notebook Analysis]
**Overall risk:** [Low / Medium / High]
**Review date:** [Date]

---

## Summary

[Brief narrative of the plan's strengths and the most important gaps.]

---

## [Category Name]

### 🔴 Critical — [Issue Title]

**Evidence:** [Specific quote, section, or omission from the plan]

**Risk:** [What could go wrong if this is not addressed]

**Recommendation:** [Concrete next step the author should take]

**Why:** [Educational context on why this matters]

---

### 🟡 Warning — [Issue Title]

**Evidence:** [Specific quote, section, or omission from the plan]

**Risk:** [What could go wrong if this is not addressed]

**Recommendation:** [Concrete next step the author should take]

**Why:** [Educational context on why this matters]

---

### 🟢 Note — [Issue Title]

**Evidence:** [Specific quote, section, or omission from the plan]

**Recommendation:** [Concrete next step the author should take]

**Why:** [Educational context on why this matters]
```

Repeat the issue template for every finding within each category. Include a
section even if it has no findings, with a brief confirmation that the topic was
reviewed.
