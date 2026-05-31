# Themes

## Primary: neversink

The neversink theme is the default. It is education-oriented with whimsical
elements. Install it:

```bash
npm install slidev-theme-neversink
```

Headmatter for neversink decks:

```yaml
---
theme: neversink
layout: cover
class: text-center
fonts:
  sans: Poppins
  mono: Source Code Pro
  weights: '200,400,600'
---
```

Neversink provides:
- Rich color schemes applied per-slide via `color:` frontmatter
- Custom layouts: `top-title`, `side-title`, `two-cols-title`, `top-title-two-cols`, `quote`, `section`, `intro`, `credits`, `full`
- The `neversink_slug` frontmatter field for branding
- Alignment controls via `align:` frontmatter

See [neversink-layouts.md](neversink-layouts.md) and [neversink-colors.md](neversink-colors.md)
for detailed layout and color reference.

## Secondary: the-unnamed

Use the-unnamed for a darker, more minimal aesthetic. Install it:

```bash
npm install slidev-theme-the-unnamed
```

Headmatter:

```yaml
---
theme: the-unnamed
title: Talk Title
---
```

The-unnamed provides:
- Deep navy background with customizable accent colors
- Layouts: `cover`, `center`, `section`, `two-cols`, `about-me`, `default`
- Full `themeConfig` customization for brand colors

See [the-unnamed.md](the-unnamed.md) for detailed customization options.
