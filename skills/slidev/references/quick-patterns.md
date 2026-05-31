# Quick Patterns

### Title Slide

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
```

### Full-Screen Image with Overlay

```md
---
layout: image
image: /images/photo.jpg
---

<div class="text-4xl font-bold">
Image Label
</div>
```

### Section Divider

```md
---
layout: section
color: dark
---

# New Section Title
```

### Quote Slide

```md
---
layout: quote
color: zinc
quotesize: text-m
authorsize: text-s
author: 'Author Name'
---

# "The quote text goes here"
```

### Two-Column Comparison

```md
---
layout: two-cols-title
columns: is-6
align: l-lt-lt
---

::title::

# Comparison Title

::left::

Left content

::right::

Right content
```

### Side Title with Content

```md
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

### Code Walkthrough

```md
---
layout: top-title
color: amber
---

# Code Example

```python {1|3-5|all}
def model(x, y):
    with pm.Model() as m:
        alpha = pm.Normal('alpha', 0, 10)
        beta = pm.Normal('beta', 0, 10)
        sigma = pm.HalfNormal('sigma', 1)
        y_hat = alpha + beta * x
        pm.Normal('y', mu=y_hat, sigma=sigma, observed=y)
    return m
```

Use `{1|3-5|all}` for click-based line highlighting. Each `|` is a click step.

### Math Slide

```md
---
layout: center
color: blue
---

$$\Huge
\underbrace{\text{Pr}(\theta | y)}_{\textcolor{yellow}{\small \text{Posterior}}}
=
\frac{
  \overbrace{\text{Pr}(y | \theta)}^{\textcolor{yellow}{\small \text{Likelihood}}}
  \cdot
  \overbrace{\text{Pr}(\theta)}^{\textcolor{yellow}{\small \text{Prior}}}
}{
  \underbrace{\text{Pr}(y)}_{\small \text{Evidence}}}
$$
```

### Image Grid

```md
---
layout: center
---

<div class="grid grid-cols-2 gap-4">
  <img src="/images/a.png">
  <img src="/images/b.png">
  <img src="/images/c.png">
  <img src="/images/d.png">
</div>
```
