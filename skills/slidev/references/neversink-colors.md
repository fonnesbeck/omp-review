# Neversink Color Schemes

Neversink uses Tailwind-like color schemes arranged in monochromatic pairs.
Apply a color to any slide via the `color:` frontmatter:

```yaml
---
color: amber
---
```

## B&W Schemes

| Color | Description |
|-------|-------------|
| `black` | White text on black background |
| `white` | Black text on white background |
| `dark` | Light gray text on dark gray background |
| `light` | Dark gray text on light gray background |

## Preferred Regular Schemes

Based on usage patterns, these are the most effective:

| Color | Best For |
|-------|----------|
| `amber` | Default content slides. Warm, neutral, professional |
| `violet` | Technical depth, math, algorithms |
| `blue` | Data, methodology, process slides |
| `zinc` | Quotes, reflective content, citations |
| `stone` | Earthy, grounded content. Good for examples |
| `dark` | Section dividers, dramatic transitions |
| `black` | Image-heavy slides where image must dominate |
| `navy` | Deep, serious content. Alternative to dark |

## Light Variants

Use `-light` variants for calm, airy slides with softer contrast:

| Color | Best For |
|-------|----------|
| `amber-light` | Gentle introductions, background material |
| `sky-light` | Open, optimistic content |
| `cyan-light` | Fresh, innovative ideas |

## All Available Colors

**Regular:** `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`,
`teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `pink`, `rose`,
`fuchsia`, `slate`, `gray`, `zinc`, `neutral`, `stone`, `navy`

**Light:** `red-light`, `orange-light`, `amber-light`, `yellow-light`,
`lime-light`, `green-light`, `emerald-light`, `teal-light`, `cyan-light`,
`sky-light`, `blue-light`, `indigo-light`, `violet-light`, `purple-light`,
`pink-light`, `rose-light`, `fuchsia-light`, `slate-light`, `gray-light`,
`zinc-light`, `neutral-light`, `stone-light`, `navy-light`

## Color as Structure

Use color to signal structure, not for decoration:

```md
---
layout: section
color: dark
---

# Part 1: Introduction

---
layout: top-title
color: amber
---

# Content slide in intro section

---
layout: section
color: dark
---

# Part 2: Methods

---
layout: top-title
color: violet
---

# Math-heavy methods slide
```

In this example, `dark` signals section boundaries while `amber` and `violet`
carry the content. The audience learns that color change means "pay attention,
structure shift."

## Custom CSS Binding

For custom elements, use neversink's CSS variables:

```html
<div class="neversink-amber-scheme ns-c-bind-scheme">
  This div uses the amber color scheme
</div>
```

Available CSS variables per scheme:
- `--neversink-bg-color`
- `--neversink-bg-code-color`
- `--neversink-fg-code-color`
- `--neversink-fg-color`
- `--neversink-text-color`
- `--neversink-border-color`
- `--neversink-highlight-color`
