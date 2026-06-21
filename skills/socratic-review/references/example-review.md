# Example Socratic Review

## Context
User wants to migrate a monolithic API to microservices.

## Exchange

**Model:** Let's start broad. What is the primary goal of this migration — faster deployments, team autonomy, scaling specific paths, or something else?

**User:** Faster deployments. Our deploys take 45 minutes and fail half the time.

**Model:** What must be true for microservices to actually deliver faster deployments?

**User:** We'd split the codebase so each team owns a service.

**Model:** What are you assuming about team boundaries? Are they already aligned to service boundaries, or will you need to reorganize?

**User:** We'd probably reorganize. We have three backend teams now.

**Model:** So the dependency is: org redesign precedes service split. Has that cost been included in the timeline?

**User:** Not really. I was thinking 3 months for the tech work.

**Model:** Three months with org redesign, or three months ignoring it?

**User:** Ignoring it, I guess.

**Model:** Let's resolve this branch before moving on. If org redesign adds 2 months, does the 5-month total still beat fixing the monolith deploy pipeline? What would fixing the monolith take?

**User:** Maybe 2 months. But we also want team autonomy.

**Model:** Is team autonomy a separate goal, or is it only valuable because it enables faster deploys?

**User:** Separate. Teams step on each other's code.

**Model:** Good — that's a second branch. We'll come back to it. First, confirm: the deployment branch now has two viable paths — fix monolith (2 months) or migrate (5 months). Are you choosing the migration because it also serves the autonomy goal, or would you still choose it if autonomy were already solved?

**User:** It's the combo. Either alone might not be worth it.

**Model:** Noted. Branch 1 resolved: migration is justified by the combined goal, timeline estimate corrected to 5 months. Moving to branch 2: team autonomy. What does "stepping on each other's code" look like in practice?

...

## Final Output

**Model:** Branch 2 resolved: autonomy pain is real and justifies the migration independently, but the combined 5-month timeline must hold. Here's the decision log.

*(Writes `DECISION_LOG.md` using the template, then summarizes in chat.)*

**Model (chat summary):** The most critical assumption is that the 5-month timeline includes org redesign — if that slips, the ROI collapses against a 2-month monolith fix. The single biggest risk is that team autonomy and deployment speed are treated as a package deal; if one goal proves harder than expected, the other may not justify the migration alone.

## What This Shows
- The model did not let the user conflate goals.
- It resolved branch 1 (deployment goal + timeline) before moving to branch 2.
- It surfaced an implicit dependency (org redesign) and corrected an estimate.
- It asked for falsification: "would you still choose it if autonomy were solved?"
- It delivered a concrete artifact (`DECISION_LOG.md`) and a concise chat summary.
