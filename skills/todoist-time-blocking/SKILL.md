---
name: todoist-time-blocking
description: Plan and review work on a daily and weekly cadence using a small prioritized task slate (inspired by the Ivy Lee method) with Todoist time-blocking. Use when the user asks to "plan my day/tomorrow", "time block my tasks", wants a "nightly review", a "weekly review" or "weekly planning" (Fri afternoon through Sun evening), or wants to clean up incomplete tasks from a finished day or week. Provides plan_day (proposes up to six ordered tasks fitted around existing calendar events and writes them back as timed Todoist tasks), nightly_review (reconciles completions, reschedules or un-dates incomplete items), and weekly_review (light retrospective + stalled-project sweep + per-day soft schedule for the coming week via date-only Todoist dates). Depends on the `todoist-api` skill (td CLI) and the `gws-calendar` MCP tools.
---

# Todoist Time-Blocking

## Method (brief)

Pick **up to six** prioritized tasks for the day, work them sequentially, and reconcile at day's end. Unfinished items roll into the next day's slate. Derived from the Ivy Lee method — see [references/method.md](references/method.md) for origin, what this skill keeps vs. changes, and boundary cases.

## Excluded project: `#Ideas`

The `#Ideas` project contains non-actionable brainstorming items. **Never** surface, propose, or write back tasks from `#Ideas` in any function (`plan_day`, `nightly_review`, `weekly_review`). Filter it out at query time by appending `| ##Ideas` negation or by excluding `projectId` after parsing JSON. Do not include it in stalled-project sweeps, candidate pools, stragglers, or completion counts.

## Core principle: time-block *through* Todoist, not by creating calendar events

Set `--due` with a time and `--duration` on each task:

```bash
td task update <id> --due "YYYY-MM-DD at H:MMam" --duration <Xh|Xm|XhYm>
```

Todoist's Google Calendar integration renders the block on the "Todoist" calendar automatically (sync lag ~1 min). **Do not create parallel events on the Personal or other calendars** for Todoist-tracked work — it causes duplicates and clutter.

## Never assign Todoist priorities

This skill does **not** use Todoist's priority field. Never include `--priority`, `-p1`/`-p2`/`-p3`/`-p4`, or any equivalent flag in `td task add`/`td task update` calls. Never display `[P1]`/`[P2]` tags in proposals. If a task already has a priority set, leave it untouched — don't read it, don't surface it, don't sort by it. Importance is conveyed by slate position and the per-task rationale, not by a stored priority value.

## Required tooling

- `td` CLI — see the `todoist-api` skill for full syntax.
- Google Calendar MCP tools: `gcal_list_calendars`, `gcal_list_events`.

Verify both before proceeding. If the user's Google Calendar does not show a "Todoist" calendar in the list, mention it — time blocks won't render visually until they subscribe.

## Confirmation discipline

Always **present the proposed plan (or review actions) and wait for explicit user approval** before writing to Todoist. Do not batch "propose + execute" into a single turn. This holds even when the user's request sounds like a direct instruction — judgment calls (which tasks make the slate, how to slot them, which stragglers to push) are exactly what the checkpoint is for.

---

## Function: plan_day

**Default target date:** tomorrow (user's local TZ). Accept an explicit date override.

### Step 0 — Verify calendar access

Before proceeding, confirm calendar tools are reachable and return non-empty results for the target date. If calendar access fails or returns zero events across all calendars, **flag this immediately** — proceeding without calendar context has caused repeated scheduling conflicts in the past. Do not assume or guess at the user's schedule.

### Step 1 — Gather fixed commitments

Call `gcal_list_calendars`, then `gcal_list_events` on every calendar that represents real commitments. Include owner/reader calendars for personal, family, work, sports schedules, and travel feeds. **Exclude** holiday calendars and the Todoist calendar itself (its events are the output of this skill; counting them would be circular). Skip resource calendars.

Use the target date as `timeMin` / `timeMax` in the user's local timezone.

Record each event's: `summary`, `start`, `end`, `location` (for buffer sizing), and **`transparency`**.

**Transparency filter:** Only treat events with `transparency` = `opaque` (or unset, which defaults to opaque) as fixed busy blocks. Events with `transparency` = `transparent` are marked "free" in Google Calendar and **must not** be treated as time-blocked commitments — they're informational only and don't reduce available work time. Surface them in the proposal table as context (e.g., italics with a "free" label) so the user sees them, but don't slot tasks around them.

### Step 2 — Establish the work window

Default **08:00–16:00 local**, minus a 30-min lunch flex between 12:00 and 13:00. Ask if the date looks unusual (weekend, holiday, travel day per the Travel calendar).

The work window governs only the sequential deep-work portion of the day. Items the user designates as evening/household (shopping, personal errands, light decisions) can be placed outside the work window with an explicit evening time — they don't compete for work-window slots and don't count against the slate ceiling.

### Step 3 — Read candidate tasks

```bash
td task list --filter "(due before: <end-of-week+1 day>) | no date | ##Ideas" --json
```

The query extends through end-of-week (not just the target day) to surface tasks soft-scheduled by a prior `weekly_review` — they're eligible to pull forward when the target has capacity.

> **Filter note:** `##Ideas` excludes the Ideas project per the Excluded Project rule above.

Partition:
- **Target-day candidates:** dated on or before the target (overdue items roll into candidacy).
- **Rest-of-week bucket:** dated to later days this week — count by day, eligible to pull forward when rationale supports it.
- **Undated:** near deadlines or unblocking someone else.
- **Deadline-driven:** `deadline` within ~3 days of the target.

Filter out recurring operational tasks (`isRecurring: true` in the due object) from the slate — they belong in residual gaps, not prime slots.

### Step 3.5 — Surface one stalled-project nudge

A project is **stalled** when both hold (14-day look-back):
- No tasks completed in the project in the last 14 days.
- No active tasks in the project dated within the last 14 days or the next few days.

(Task modification timestamps aren't exposed by `td task list`, so the stalled check relies on completion history plus active-task dates.)

Identify candidate projects via `td project list --json`, then inspect each: `td task list --filter "##<project name>" --json` for active-task `due` dates, and scan `td completed --since <target-14d> --until <target+1d>` filtered by `projectId` for recent completions. If multiple projects qualify, pick the one stalled longest.

Select **one** concrete next-action task from that project as the nudge — prefer tasks with clear verbs and small scope over vague headings. Mark it distinctly in the proposal; it's not counted toward the six-task ceiling unless the user accepts.

If no project qualifies, skip this step silently.

### Step 4 — Propose up to six, ordered

Rank by true importance: deadline pressure, whether the task unblocks someone else, reversibility cost, concrete-next-action clarity. Fewer than six is fine — do not pad. See [references/heuristics.md](references/heuristics.md) for task-type prioritization.

The stalled-project nudge (if any) is proposed **separately** from the main slate — user accepts or rejects it. If accepted, it joins the slate and gets time-blocked; if rejected, take no action on it (don't re-date it).

**Rest-of-week buckets.** If the query returned tasks dated to later days this week (typically from `weekly_review`), show a one-line summary in the proposal: `Rest-of-week: Tue=4, Wed=3, Thu=2, Fri=3`. If the target day has headroom and a later day is overweight, **propose** pulling one task forward — surface the rationale (overloaded source day, deadline interaction, cognitive fit) and let the user accept or reject. Pulled tasks get re-dated to the target and time-blocked like any other slate item.

### Step 5 — Fit blocks around fixed events

Compute free windows = work window − fixed events (opaque only) − buffers. Default buffers: **10–15 min** around remote meetings, **15–30 min** around in-person events (gym, errand, off-site). Give deep work the longest unbroken window, usually morning. Avoid splitting a deep-work task across a fixed event.

Additional rules when fitting:

- **Transparent (free) events are not fixed blocks.** They appear in the calendar but don't consume scheduling capacity. Treat them as context only.

- **Recurring tasks as fixed load.** Recurring operational tasks dated on the target day (filtered from the slate in Step 3) still occupy time on the Todoist calendar. Treat them as additional fixed blocks when computing free windows — same as calendar events.
- **Pre-set task times yield to calendar events.** If a slate task carries a pre-set time (often inherited from a prior `weekly_review` or manual dating) and that time overlaps a fixed calendar event, re-time the task silently to the nearest suitable free window. Do not flag as a conflict — calendar events always win.
- **No calendar-vs-calendar conflict flags.** If two fixed calendar events overlap, that's the user's calendar to reconcile, not `plan_day`'s. Just slot tasks around whatever calendar time remains free.

Present the **full day's agenda** as a single chronological table that interleaves proposed Todoist blocks with the fixed calendar events from Step 1 — the user needs to see the whole day to approve the decisions. Mark fixed events clearly (italics, source label, or both) so there's no ambiguity about what the user is approving vs. what's already committed.

**Before presenting the proposal, run a reality check:**

- Confirm every proposed block's start+end time does NOT overlap any opaque calendar event.
- Confirm every proposed block fits within the declared work window (unless explicitly marked as evening).
- Confirm total deep-work blocks ≤ 2 per day.
- If any check fails, fix silently before presenting — never surface a conflict to the user.

| Time | Item | Duration | Source | Why here |
|---|---|---|---|---|
| 08:00 | Update Session 4 notebook | 2h45m | Todoist (proposed, #1) | longest morning block; deadline tomorrow |
| 11:00 | *Strength 50 class* | 50m | Personal (fixed) | — |
| 11:50 | Bring bikes in to be tuned | 30m | Todoist (proposed, #2) | errand, post-gym, on the way back |
| 12:20 | *(lunch / buffer)* | 30m | — | — |
| 12:50 | Read Devin's soccer book | 30m | Todoist (proposed, #3) | light post-lunch slot |
| … | … | … | … | … |

Include gaps/buffers as their own rows when material (>15 min) so the day reads end-to-end. Any straggler actions from Step 6 go in a separate short list under the table, not in it.

### Step 6 — Identify stragglers

Tasks already dated on the target day that **aren't** in the chosen slate. For each, propose a **default action** (typically push 1–3 days forward or un-date) and present it as the recommendation. The user may override per straggler.

**Do not bulk-decide, and do not allow unresolved stragglers.** If the user approves the slate without addressing every straggler, re-prompt explicitly: “You still have N stragglers — pick an action for each before I write anything back.”

### Step 7 — Wait for approval

Output the full proposal (slate + straggler actions + stalled-project nudge if any) and stop. Accept edits: reordering, swapping tasks in/out, adjusting times, accepting/rejecting the nudge.

**No writeback may proceed until every straggler has a chosen action.** Leaving a task date-only on the target day is not permitted — it creates a ghost entry with no time block.

### Step 8 — Write back

```bash
# Each chosen task (time + duration):
td task update <id> --due "YYYY-MM-DD at H:MMam" --duration <Xh|XhYm|Xm>

# Stragglers moved to another day (date only; user can time-block later):
td task update <id> --due "YYYY-MM-DD"

# Stragglers un-dated:
td task update <id> --due "no date"
```

Known-good `--due` formats: `"today at 8:00am"`, `"tomorrow at 1:20pm"`, `"2026-04-16 at 8:00am"`, `"Apr 16 at 8:00am"`. Prefer explicit `YYYY-MM-DD at H:MMam/pm` to avoid parser ambiguity.

### Step 9 — Verify

> **CRITICAL:** Use `--ndjson` or `--full` for verification. The default `--json` flag truncates `due.datetime` to a plain date, making it impossible to confirm that time-blocking actually stuck.

```bash
# Verify: every task due the target day is time-blocked (datetime + duration)
td task list --filter "due: YYYY-MM-DD" --ndjson \
  | jq 'select((.due.datetime // .due.date | test("T") | not) or .duration == null) | {content, due: .due, duration}'
```

Expected: **no output**. Any output means unresolved stragglers remain — abort writeback and return to Step 6.

Then verify the slate itself:
```bash
td task list --filter "due: YYYY-MM-DD" --ndjson \
  | jq '{content, due: .due, duration}'
```

Expected: exactly the chosen slate, each with a `due` containing a `datetime` field (`T` present) and a `duration`. Tell the user to refresh Google Calendar in ~1 minute if blocks aren't visible.

---

## Function: nightly_review

**Default target date:** today (the day ending). Accept an explicit override for retrospective cleanup. **Skip on Fridays** — `weekly_review` subsumes Friday's end-of-day reconciliation.

### Step 1 — Pull the day's slate

```bash
td task list --filter "due: <date> | ##Ideas" --json
```

This returns tasks still due today (excluding `#Ideas`). Tasks the user already moved to another day won't appear here — they'll surface in Step 3.

### Step 2 — Pull completions

```bash
td completed --since <date> --until <date+1> --json
```

**Note:** the output wraps results in `{"results": [...]}`, not a flat array. Parse with `.results[]`.

This may include tasks completed today that **weren't on the original slate** (bonus completions) — surface these as a positive signal.

### Step 3 — Partition into three groups

Compare the day's original slate against both the open-task list (Step 1) and completions (Step 2). Partition into:

- **Completed** — in the completions list. Include bonus completions (tasks not on the original slate) as a separate note.
- **Already moved** — tasks that were on today's slate but no longer appear in either list (the user already rescheduled or moved them during the day). Report these as-is; no action needed.
- **Incomplete** — still due today, not completed. These need decisions.

Report the completion rate against the original slate size (e.g., "2 of 6 completed, 1 already moved, 3 incomplete").

### Step 4 — Propose one action per incomplete task

User confirms per-task:

- **Carry into tomorrow's slate** — set `td task update <id> --due "YYYY-MM-DD"` (date only, no time). The next `plan_day` will re-evaluate the time slot — don't assume today's blocked time still fits tomorrow.
- **Push to a specific future date** — `td task update <id> --due "YYYY-MM-DD"` (date only, no time).
- **Un-date** — `td task update <id> --due "no date"`. Returns to backlog.
- **Delete** — `td task delete <id>`. Only if the task is no longer relevant.

**Flag tasks that have rolled over three or more times** — they likely need to be broken down, reprioritized, or dropped. Surface this for the user's judgment; don't auto-decide.

**Stale times:** Tasks that were time-blocked today retain their start time even when pushed to a new date. When carrying forward, use date-only `--due` to clear the time so `plan_day` can re-slot them fresh.

### Step 5 — Write back after approval

Execute the agreed actions in one batch. Do not act on any subset without a full-slate confirmation.

### Step 6 — Offer the hand-off

Ask whether to run `plan_day` for tomorrow now. If yes, pass forward the "carry into tomorrow" items as pre-selected candidates.

---

## Function: weekly_review

**Default target window:** the upcoming Mon–Fri (user's local TZ). When run Fri afternoon through Sun evening, targets next week. Accept explicit overrides.

**Unique vs `plan_day`:** `plan_day` time-blocks a single day. `weekly_review` writes **date-only** `--due "YYYY-MM-DD"` on tasks to produce a **soft schedule** for the week — no times, no durations. Each morning's `plan_day` time-blocks whichever tasks landed on that day (and may pull forward from later days).

**Replaces:** Friday `nightly_review` (subsumed) and Sunday-night prep (same operation).

### Step 1 — Retro (read-only, for calibration)

Pull completions over two windows (excluding `#Ideas` tasks by filtering `projectId` when parsing):

```bash
td completed --since <target-7d> --until <target> --json
td completed --since <target-28d> --until <target> --json
```

> After retrieving, filter out any items whose `project_id` matches `#Ideas` before bucketing or counting.

Group the 28-day set by the weekday of each task's original `due.date` and compute the mean per weekday — the **per-weekday capacity baseline** used in Step 4. `td completed` doesn't expose a completion timestamp; `due.date` is the reliable proxy. Completions with no `due.date` (undated tasks the user finished ad-hoc) aren't bucketed into weekday averages — report their total count separately as ambient work. Recomputed every run; no stored state.

Example jq pipeline for the 7-day view (substitute `-28d` for rolling average):

```bash
td completed --since <target-7d> --until <target> --json | jq '[.results[] | {content, due: .due.date}] | group_by(.due[0:10] // "undated") | map({day: (.[0].due[0:10] // "undated"), count: length, items: [.[].content]})'
```

Report shape:

```
Last 7 days: 18 completions
  Mon 5 / Tue 2 / Wed 6 / Thu 3 / Fri 2

4-week per-weekday average:
  Mon ~4.8 / Tue ~3.1 / Wed ~5.2 / Thu ~2.7 / Fri ~2.4
```

No decisions here — informational for Step 4's bucket sizing. Note any sharp deviation between last week and the 4-week average.

### Step 2 — Stalled-project sweep

Same stalled definition as `plan_day` Step 3.5 (14-day look-back on completions and active-task dates). Surface **every** qualifying project, not just one.

For each, present four actions in a batch:

- **Revive** — pick a concrete next-action task from the project; it joins the candidate pool in Step 3.
- **Defer** — propose creating a "Review <project> direction" task dated ~4 weeks out. The user must explicitly approve the creation; do not auto-create tasks.
- **Archive** — archive the project in Todoist.
- **Skip** — acknowledge; resurfaces next week if still stalled.

Collect marks for all projects in one pass. Writeback happens in Step 5, not mid-flow.

### Step 3 — Build the candidate pool

> **All streams exclude `#Ideas` tasks.** Append `| ##Ideas` to every `td task list` query and filter completions by `projectId` when parsing.

Combine four streams:

**3a. Past-7-day incomplete carry-forwards.** Partition tasks dated in the past 7 days (same logic as `nightly_review` Step 3):
- **Completed** — count only.
- **Already-moved** — count only.
- **Incomplete** — eligible for the coming week's pool. Flag any task rolled over 3+ times for user judgment.

"Past 7 days" is inclusive of the run day itself — when run Fri afternoon through Sun evening, the run-day's still-open tasks count as incomplete carry-forwards (there's no Friday `nightly_review` to catch them otherwise).

**3b. Deadline-driven work.** Tasks with a `deadline` within 14 days of the target start. Each pre-stages to a day that leaves prep buffer before the deadline.

**3c. Revived next-actions** from Step 2 (already excludes `#Ideas` since stalled sweep filters it).

**3d. Currently-dated tasks in the target week.** Query with `| ##Ideas` to exclude brainstorming items.
- Date-only → eligible for rebucketing across days.
- Date+time set → weekly_review does not re-date them (they read as appointment-like commitments at this stage). `plan_day` may still re-time them silently when the pre-set time collides with a target-day calendar event.

Exclude recurring operational tasks (`isRecurring: true`) from all four streams — they belong in residual gaps, handled by Todoist's own recurrence.

### Step 4 — Bucket per day (batched proposal)

Calendar context: call `gcal_list_events` across the target Mon–Fri on the same calendars `plan_day` uses; compute per-day meeting load. Don't surface calendar-vs-calendar overlaps — those are the user's own calendar to reconcile; `weekly_review` just reports meeting density so buckets can size appropriately.

Assign each pool task to a weekday, weighted by:

1. **Deadline (hard):** must land on or before deadline with ≥1 day prep buffer.
2. **Per-weekday capacity baseline** (Step 1): avoid piling onto historically low-throughput days.
3. **Calendar load:** deep work → lighter-meeting days; admin → meeting-heavy days.
4. **Energy/type match:** deep work Mon–Wed by default; admin/lighter items drift to Thu–Fri.
5. **Project clustering:** same-project tasks prefer the same day when timing allows.

Soft target: **3–4 tasks per day.** Exceed when the week genuinely demands it — flag overloaded days clearly in the output so the user can cut or defer during review. No hard cap, no overflow machinery — if the combined pool is unreasonable, that's a signal to pare, not mechanically drop.

**Weekend (Sat/Sun):** include only when a task obviously belongs there (household, shop-hour errands, explicitly-requested leisure). Don't auto-sweep household tasks onto the weekend.

Output format (per-day grouped):

```
## Mon 2026-04-27  (baseline ~4.8 / cal load: 1h)
- Update Session 4 notebook  (proj: NCSU, deadline Tue)
  └─ deadline pressure; deep work needs unbroken morning
- Review K's draft  (proj: BSEM)
  └─ blocking K

## Tue 2026-04-28  (baseline ~3.1 / cal load: 3h — heavy)
- Bike tune-up errand
  └─ shop hours; fits between afternoon meetings
- Email triage
  └─ admin fits a fragmented day

## Wed 2026-04-29  (baseline ~5.2 / cal load: 1.5h)
...

## Sat 2026-05-02  (household only)
- Replace porch light
  └─ obvious household; not a weekday item
```

**Unscheduled stragglers** from 3a that didn't make any bucket: show below with per-task actions — un-date / push beyond target week / delete.

### Step 5 — Approval and writeback

Present the full picture in one view: retro stats (read-only) + stalled-project action grid + per-day buckets + unscheduled straggler actions. Wait for explicit approval of the whole package before any writes.

**All straggler actions must be resolved before any writes.** If the user approves the bucketed schedule without addressing unscheduled stragglers, re-prompt explicitly.

On approval, execute in one batch:

```bash
# Bucketed tasks (date-only, no time):
td task update <id> --due "YYYY-MM-DD"

# Stalled deferrals (ONLY if user explicitly approved creation):
td task add "Review <project> direction" --due "YYYY-MM-DD" -p "<project>"

# Stalled archives:
td project archive <id>

# Un-dated stragglers:
td task update <id> --due "no date"

# Deleted stragglers:
td task delete <id>
```

Exact command flags vary — check the `todoist-api` skill for current `td` syntax.

### Step 6 — Verify

```bash
td task list --filter "due after: <target-1d> & due before: <target+7d>" --json \
  | jq '[.results[] | {content, due: .due.date // .due.datetime}] | group_by(.due) | map({day: .[0].due, count: length})'
```

Expected: each target weekday shows the approved bucket size, and entries have a `date` field (not `datetime`) — confirms they're ready for `plan_day` to time-block each morning.

### Step 7 — Hand-off

Offer to run `plan_day` for the upcoming Monday. If yes, pass Monday's bucket forward as pre-selected candidates.

---

## Operational notes

- **Six is a ceiling, not a target.** If only three things matter, block three.
- **Time-box only what you'll actually do sequentially.** Don't block email triage or Slack — those absorb residual time.
- **Respect the order.** Lower-numbered tasks come first chronologically when slot shapes allow. If importance and available slot-shape conflict, surface the conflict rather than silently reordering.
- **Durations are honest.** 30-min tasks get 30 min, not padded to look fuller. Underfilled days are a useful signal.
- **One plan surface.** Todoist is the source; the Todoist Google Calendar layer is the view. Nothing else.
- **Cadence.** `plan_day` runs daily (Mon–Fri plus Sun-for-Mon). `nightly_review` runs Mon–Thu. `weekly_review` runs once per week (Fri afternoon through Sun evening) and subsumes Friday's `nightly_review`.

## References

- [references/method.md](references/method.md) — derivation from Ivy Lee, what's kept vs. changed, boundary cases
- [references/heuristics.md](references/heuristics.md) — work window defaults, calendars to query, buffer table, prioritization hierarchy, slot sizing, `td` command formats, timezone handling
- `todoist-api` skill — full `td` CLI reference
