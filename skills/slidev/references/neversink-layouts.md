# Neversink Layouts

Neversink provides custom layouts beyond Slidev's defaults. All layouts support
the `color:` frontmatter for color scheme application.

## cover

Title slide. Use for the first slide and optionally for major section starts.

```yaml
---
layout: cover
class: text-center
color: amber
---
```

## intro

Introduction slide with large text. Good for setting context after the title.

```yaml
---
layout: intro
color: blue
---
```

## default

Standard content slide. Inherits from Slidev default but with neversink
styling applied.

```yaml
---
layout: default
color: amber
---
```

## top-title

Content slide with a title bar at the top. The workhorse layout for most
content.

```yaml
---
layout: top-title
color: amber
align: lt
---
```

Alignment options via `align:` frontmatter:
- `lt`: left-top
- `lm`: left-middle
- `lb`: left-bottom
- `ct`: center-top
- `cm`: center-middle (default)
- `cb`: center-bottom
- `rt`: right-top
- `rm`: right-middle
- `rb`: right-bottom

## top-title-two-cols

Title bar plus two columns below.

```yaml
---
layout: top-title-two-cols
columns: is-6
align: l-lt-lt
---

::title::

# Title

::left::

Left content

::right::

Right content
```

## two-cols-title

Title area plus two columns. Similar to `top-title-two-cols` but with more
flexible title placement.

```yaml
---
layout: two-cols-title
columns: is-6
align: l-lt-lt
---

::title::

# Title

::left::

Left content

::right::

Right content
```

## side-title

Title in a sidebar with main content beside it.

```yaml
---
layout: side-title
side: left
color: violet
titlewidth: is-4
align: rm-lm
---

::title::

# Sidebar Title

::content::

Main content here
```

Options:
- `side:` `left` or `right`
- `titlewidth:` `is-1` through `is-12` (Bootstrap-style grid)
- `align:` combines title alignment and content alignment, e.g., `rm-lm` means
  right-middle title, left-middle content

## quote

Quotation display with author attribution.

```yaml
---
layout: quote
color: zinc
quotesize: text-m
authorsize: text-s
author: 'Bill James'
---

# "the search for objective knowledge about baseball"
```

Options:
- `quotesize:` `text-xs`, `text-s`, `text-m`, `text-l`, `text-xl`
- `authorsize:` same options
- `author:` attribution text

## section

Section divider. Big text, minimal content.

```yaml
---
layout: section
color: dark
---

# What is Bayes?
```

## full

Full-screen content with no padding. Use for custom layouts or when you need
complete control.

```yaml
---
layout: full
---

Custom content here
```

## credits

Credits / acknowledgments slide.

```yaml
---
layout: credits
---

# Acknowledgments

- Collaborator names
- Funding sources
- Tool credits
```

## Alignment Quick Reference

Neversink uses a two-letter alignment code:

| | Left | Center | Right |
|---|------|--------|-------|
| Top | `lt` | `ct` | `rt` |
| Middle | `lm` | `cm` | `rm` |
| Bottom | `lb` | `cb` | `rb` |

For layouts with two elements (like `side-title`), concatenate two codes:
`rm-lm` means right-middle for the first element, left-middle for the second.
