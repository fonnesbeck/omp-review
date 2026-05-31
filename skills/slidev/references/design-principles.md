# Core Design Principles

These rules are non-negotiable. They reflect what works for technical
audiences.

## One Idea Per Slide

Each slide communicates exactly one concept. If you find yourself wanting two
titles, split it. The presenter notes carry the nuance; the slide carries the
punchline.

## Visuals Dominate, Text Supports

When an image explains the concept, let it fill the slide. Text should be
minimal: a title, a short label, or a single equation. Never put a paragraph on
a slide.

## Color Signals Structure

Use color intentionally, not decoratively. A color change should tell the
audience "new section," "important point," or "contrast." Random color
variations create noise.

## Math Must Be Readable

Equations are central to data science talks. Default size is too small. Use
`$$\Huge ... $$` or `$$\Large ... $$` for displayed math. Inline math should be
rare; when used, keep it simple.

## Presenter Notes Are the Script

Write full talking points in HTML comments. Notes should contain:
- The complete verbal explanation of the slide
- Citations and sources
- Transition sentences to the next slide
- Answers to anticipated questions

Never leave notes empty or write one-word reminders like "explain this."
