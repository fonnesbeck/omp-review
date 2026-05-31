# Getting Started

## Scaffold the Project

Use the scaffold script or do it manually.

### Via Script

```bash
./scripts/scaffold.sh my-talk "Talk Title" "Author Name" "Affiliation"
cd my-talk && npm install && npm run dev
```

### Manually

```bash
mkdir my-talk && cd my-talk
npm install @slidev/cli@^0.51.0 slidev-theme-neversink@^0.3.6 slidev-theme-the-unnamed@^0.0.22 vue@^3.5.0
```

Use [scripts/scaffold.sh](../scripts/scaffold.sh) as the canonical source for
`package.json` and `slides.md` headmatter.

## Create `slides.md` with Headmatter

```md
---
theme: neversink
layout: cover
class: text-center
fonts:
  sans: Poppins
  mono: Source Code Pro
  weights: '200,400,600'
---

# Talk Title

**Author Name**
*Affiliation*

<div class="absolute right-80px bottom-30px">
  <img src="/images/logo.png" width="240" />
</div>

---
```

## Add Image Assets

Create `images/` or `assets/` directory. Reference images with absolute paths:
`/images/my-photo.jpg`. For full-slide backgrounds, use the `image:` frontmatter
or `layout: image`.

## Iterate with Dev Server

```bash
npm run dev
```

Verify at `http://localhost:3030`. Iterate on content before polishing design.
