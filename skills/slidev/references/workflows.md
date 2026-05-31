# Workflows

## Add a Slide

### Choose the Right Layout

| Slide Purpose | Recommended Layout | Notes |
|---------------|-------------------|-------|
| Title / cover | `cover` | Keep minimal: title, author, affiliation, logo |
| Full-screen image | `image` | Use `image: /path.jpg` in frontmatter. Add short text overlay if needed |
| Content with heading | `top-title` | Default for most content. Use `color:` for variety |
| Section divider | `section` | Big text, transitional. Use `color:` to signal new section |
| Quote / citation | `quote` | Use `author:` and `quotesize:` frontmatter |
| Image + text side by side | `image-right` or `image-left` | Good for explaining a figure |
| Two concepts compared | `two-cols-title` | Use `::left::` and `::right::` slots |
| Heading + content sidebar | `side-title` | Use `side: left` or `side: right`. Good for section intros |
| Centered single point | `center` | Single image, single equation, or single statement |
| Code walkthrough | `default` or `top-title` | Use fenced code blocks with line highlighting |

### Apply Color Intentionally

With neversink, apply colors via `color:` frontmatter. Preferred colors based on
usage patterns:

| Color | Use Case |
|-------|----------|
| `amber` | Default content slides. Warm, neutral, easy on eyes |
| `black` | Image-heavy slides where you want the image to dominate |
| `violet` / `blue` | Technical depth, mathematical content |
| `zinc` / `stone` | Quotes, citations, reflective moments |
| `dark` | Section dividers, dramatic transitions |

Avoid: `red`, `green`, `yellow` as full-slide backgrounds (harsh or imply
success/failure semantics). Light variants (`amber-light`, `sky-light`) work for
calm, airy slides.

### Write Presenter Notes

Every slide gets notes. Format:

```md
# Slide Title

Slide content here

<!--
Full talking points. Write complete sentences the speaker can read verbatim.
Include citations: (Gelman et al. 2013).
Include transitions: "Next, we'll see how this applies to..."
-->
```

### Keep Text Minimal

- Title: one line, max 6 words
- Body bullets: max 5 per slide, max 6 words each
- Prefer visual explanations over bullet lists
- Use `v-click` to reveal points sequentially instead of showing all at once

## Review a Deck

Run this checklist before declaring a deck complete:

### Content
- [ ] Every slide has exactly one focal point
- [ ] No slide has more than 5 bullet points
- [ ] Every slide has presenter notes
- [ ] Notes contain full sentences, not reminders
- [ ] Math equations are sized with `\Huge` or `\Large`
- [ ] Code blocks use syntax highlighting and line highlighting when relevant

### Visual Design
- [ ] Color changes signal structural transitions, not decoration
- [ ] Images are high-resolution and fill their space intentionally
- [ ] Text contrasts sufficiently with background on every slide
- [ ] Logo placement is consistent (typically `absolute right-80px bottom-30px`)
- [ ] No slide feels crowded; whitespace is intentional

### Narrative Flow
- [ ] Title slide establishes topic, speaker, and affiliation
- [ ] Section dividers appear every 8–12 slides
- [ ] Each section has a clear purpose visible in its first slide
- [ ] The deck builds complexity gradually
- [ ] The final slide provides closure (summary, contact, or call to action)

### Technical
- [ ] `npm run dev` loads without errors
- [ ] All image paths resolve
- [ ] Math renders correctly
- [ ] Code blocks highlight correctly
