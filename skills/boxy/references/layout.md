# Layout

Boxy layouts are **ruled**, not floated. Every region is bounded by lines; content
hangs off a visible structure rather than drifting in whitespace.

## The rail

Two vertical hairlines at the container edges, running the full height of the page.
This single device is what makes a Boxy page feel constructed.

```css
.page {
  max-width: var(--bx-container);
  margin-inline: auto;
  border-inline: var(--bx-border) solid var(--bx-line-subtle);
}
```

Sections inside the rail get full-bleed horizontal rules that touch both rails:

```css
.page > section + section { border-top: var(--bx-border) solid var(--bx-line); }
```

On viewports narrower than the container the rails sit at the screen edges, which is
fine - they read as a frame.

## Grid

12 columns by default, 16 in `industrial`. Gutters come from `--bx-gutter`.

```css
.bx-grid {
  display: grid;
  grid-template-columns: repeat(var(--bx-grid-columns), minmax(0, 1fr));
  gap: var(--bx-gutter);
}
```

For anything where cells should share borders, use the collapsed grid instead. This
is the workhorse for feature sections, stat rows, pricing tables, and card grids:

```css
.bx-collapse {
  display: grid;
  gap: var(--bx-border);              /* 1px */
  background: var(--bx-line);         /* shows through the gap as the rule */
  border: var(--bx-border) solid var(--bx-line);
}
.bx-collapse > * { background: var(--bx-surface); padding: var(--bx-space-5); }
```

The gap *is* the border. Cells never carry their own borders, so lines are never
doubled and never misalign.

## Section rhythm

| Mode | Between sections | Within a section |
|---|---|---|
| `blueprint` | 80px | 32-48px |
| `industrial` | 64px | 24-32px |
| `editorial` | 128-160px | 48-64px |

Halve the section value below 768px. Never go below 48px between sections.

A section is: full-bleed top rule, then `--bx-section-y` padding, then content.

```html
<section class="bx-section">
  <div class="bx-container">
    <p class="bx-label">02 / Capabilities</p>
    <h2 style="margin-top: 12px; max-width: 24ch">Built for the whole team</h2>
    <div class="bx-collapse" style="grid-template-columns: repeat(3,1fr); margin-top: 48px">
      ...
    </div>
  </div>
</section>
```

## Containers

| Token | Width | Use |
|---|---|---|
| `--bx-container` | 1280px | Default page container |
| `--bx-container-wide` | 1440px | Dashboards, data tables |
| `--bx-container-prose` | 68ch | Running body copy, docs, blog |

Never let a paragraph exceed 68-75 characters. In a wide container, constrain the
text column and let the ruled grid occupy the full width.

## App shell

```
+--------------------------------------------------+
| top bar  48px, 1px bottom rule                    |
+---------+----------------------------------------+
| sidebar | content                                 |
| 256px   |                                         |
| 1px     | padding 24px (comfortable)              |
| right   |         16px (compact)                  |
| rule    |                                         |
+---------+----------------------------------------+
```

- Top bar: 48px tall (56px if it carries a search field), `--bx-surface`,
  `border-bottom: 1px solid var(--bx-line)`. Sticky with `--bx-shadow-1`.
- Sidebar: 256px expanded, 48px icon rail collapsed,
  `border-right: 1px solid var(--bx-line)`. Nav items are 32px (compact) or 40px
  tall, full-bleed to the sidebar edges, with a 2px accent left border when active
  (inset, so it does not shift content).
- Content: `--bx-canvas`, padded by 24px / 16px by density.
- Breakpoint: below 1024px the sidebar becomes an overlay drawer that slides in over
  a scrim in 160ms.

## Responsive

Breakpoints - use these five, no others:

| Name | Min-width |
|---|---|
| `sm` | 480px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1440px |

Rules:
- Collapse a 3- or 4-column collapsed grid to 2 at `md`, 1 at `sm`. Keep the 1px
  gap at every step so the rules stay continuous.
- Display type: 72px -> 54px at `lg`, -> 40px at `md`, -> 32px at `sm`. Use
  `clamp()` from the scale endpoints rather than many breakpoints:
  `font-size: clamp(2rem, 1.2rem + 4vw, 4.5rem)`.
- Section padding halves at `md`.
- Tables: below `md`, switch to a stacked definition-list layout with a 1px rule
  between records. Do not horizontally scroll a table on mobile unless it is
  genuinely a spreadsheet, and if you do, pin the first column with a 1px right rule.
- Controls go to `--bx-control-lg` (48px) on coarse pointers:
  `@media (pointer: coarse)`.

## Alignment discipline

- Text is left-aligned. Center only a hero headline plus its one-line subhead, and
  only in `editorial`.
- Numbers right-align in tables. Their column headers right-align too.
- Optical alignment beats mathematical alignment for icons: nudge by 1px with
  `--bx-space-px` when a glyph looks off.
- If the blueprint substrate is visible, every major edge must land on its 8px pitch.
  Check this by eye at 100% zoom before shipping.

## Z-index scale

Use only these values.

| Layer | z-index |
|---|---|
| Base | `auto` |
| Sticky header / table head | `10` |
| Dropdown, popover, tooltip | `20` |
| Drawer | `30` |
| Modal scrim + dialog | `40` |
| Toast | `50` |
| Command palette | `60` |
