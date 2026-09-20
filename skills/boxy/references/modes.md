# Modes

One system, three postures. Set `data-mode` on `<html>` (or on a single section when
a marketing page embeds a product screenshot).

## Choosing

| If the product is... | Mode |
|---|---|
| A developer tool, CLI companion, editor, infra console, API reference | `blueprint` |
| An enterprise app, admin panel, analytics dashboard, internal tool, anything table-heavy | `industrial` |
| A marketing site, landing page, pricing page, docs homepage, changelog | `editorial` |

When a site has both a marketing front and an app, use `editorial` for the marketing
routes and `industrial` (or `blueprint`) for the app shell. Never blend two modes
inside one view.

What differs between modes: section rhythm, display type size, grid column count,
substrate visibility, and card density. What never differs: radius, border widths,
spacing scale, type scale, color roles, motion, focus treatment.

---

## blueprint

**Reference feel:** Zed, a CAD drawing, a datasheet.

```
--bx-section-y: 80px      --bx-display-size: 40px      --bx-grid-show: 1
```

### Recipe
- 8px grid substrate (`.bx-grid-bg`) on the page background at ~5.5% line opacity.
  Every real element edge must land on the 8px pitch.
- Corner ticks (`.bx-ticks`) on hero blocks and feature panels - not on every card.
- Number the sections: `01 / OVERVIEW`, `02 / ARCHITECTURE` in mono uppercase.
- Annotate with mono metadata: version strings, latency figures, dimension callouts,
  `-> ` arrows in running text.
- Dense by default: `data-density="compact"`, `--bx-text-base` for most copy.
- Headings max out at `--bx-text-4xl`. The mode gets its impact from density and
  precision, not from scale.
- Diagonal hatch fills (`repeating-linear-gradient` at 45deg, 1px lines, 6px pitch)
  for placeholder or inactive regions.

### Typical hero
```html
<section class="bx-section bx-grid-bg" data-mode="blueprint">
  <div class="bx-container">
    <p class="bx-label">01 / Runtime</p>
    <h1 style="font-size: var(--bx-text-4xl); max-width: 20ch">
      A editor that keeps up with your hands
    </h1>
    <p style="color: var(--bx-ink-muted); max-width: 56ch">
      120fps rendering, sub-millisecond keystroke latency, collaborative by default.
    </p>
    <dl class="bx-collapse" style="grid-template-columns: repeat(3, 1fr); margin-top: 48px">
      <div style="padding: 24px"><dt class="bx-label">Keystroke p50</dt>
        <dd class="bx-mono" style="font-size: var(--bx-text-3xl)">0.6<span style="font-size:var(--bx-text-md);color:var(--bx-ink-subtle)">ms</span></dd></div>
      <div style="padding: 24px"><dt class="bx-label">Cold start</dt>
        <dd class="bx-mono" style="font-size: var(--bx-text-3xl)">180<span style="font-size:var(--bx-text-md);color:var(--bx-ink-subtle)">ms</span></dd></div>
      <div style="padding: 24px"><dt class="bx-label">Binary size</dt>
        <dd class="bx-mono" style="font-size: var(--bx-text-3xl)">38<span style="font-size:var(--bx-text-md);color:var(--bx-ink-subtle)">MB</span></dd></div>
    </dl>
  </div>
</section>
```

---

## industrial

**Reference feel:** IBM Carbon, an operations console.

```
--bx-grid-columns: 16     --bx-section-y: 64px     --bx-display-size: 32px
--bx-gutter: 16px         --bx-grid-show: 0
```

### Recipe
- 16-column grid, 16px gutters. No substrate - the data is the texture.
- Fields use the bottom-border treatment: sunken surface, 1px bottom border only,
  which thickens to 2px accent on focus. See `components-forms.md`.
- Tables are the centerpiece: sticky mono uppercase headers on
  `--bx-surface-sunken`, 1px row rules in `--bx-line-subtle`, zero vertical rules,
  tabular numerals, right-aligned numeric columns.
- App shell: fixed 48px top bar, 256px left sidebar (collapsible to 48px icon rail),
  both separated by 1px lines.
- `data-density="compact"` for any table with more than ~15 rows visible.
- Status is a 8px square (never a circle) plus a text label.
- Avoid marketing flourishes entirely: no big type, no hero, no gradients.

### Typical shell
```html
<div style="display: grid; grid-template-columns: 256px 1fr; min-height: 100vh"
     data-mode="industrial" data-density="compact">
  <aside style="border-right: 1px solid var(--bx-line); background: var(--bx-surface)">...</aside>
  <main style="background: var(--bx-canvas)">
    <header style="height: 48px; border-bottom: 1px solid var(--bx-line);
                   display: flex; align-items: center; padding: 0 16px">...</header>
    <div style="padding: 24px">...</div>
  </main>
</div>
```

---

## editorial

**Reference feel:** Stripe, but with every corner squared off.

```
--bx-section-y: 160px     --bx-display-size: 72px     --bx-gutter: 32px
--bx-grid-show: 0
```

### Recipe
- Big confident display type: 54-96px, `--bx-track-display`, `600` weight,
  max 16ch per hero line.
- Generous vertical rhythm - 128-160px between sections - with a full-bleed 1px rule
  at each boundary.
- Square cards in a collapsed grid so the whole feature section reads as one ruled
  table rather than a scatter of floating boxes.
- Whitespace is the luxury signal; the 1px lines keep it from feeling loose.
- One inverted block per page (`--bx-surface-inverse`) for the CTA band. This is the
  editorial substitute for a gradient.
- Comfortable density, `--bx-text-md` body, `--bx-container-prose` for running text.
- A single 8px-offset hard shadow on hover for feature cards is permitted here and
  nowhere else.

### Typical hero
```html
<section class="bx-section" data-mode="editorial">
  <div class="bx-container">
    <p class="bx-label">Payments infrastructure</p>
    <h1 style="font-size: var(--bx-text-6xl); line-height: var(--bx-lh-6xl);
               letter-spacing: var(--bx-track-display); max-width: 16ch; margin-top: 24px">
      Financial infrastructure to grow your revenue
    </h1>
    <p style="font-size: var(--bx-text-lg); color: var(--bx-ink-muted);
              max-width: 56ch; margin-top: 24px">
      Millions of companies use our APIs to accept payments, send payouts, and
      manage their businesses online.
    </p>
    <div style="display: flex; gap: 1px; margin-top: 40px; width: fit-content;
                background: var(--bx-line)">
      <a class="bx-btn bx-btn--primary" href="#">Start now</a>
      <a class="bx-btn" href="#">Contact sales</a>
    </div>
  </div>
</section>
```

---

## Switching at runtime

```js
document.documentElement.dataset.mode = "industrial";
```

Because modes only remap a handful of custom properties, switching is instant and
needs no re-render. Persist the choice only if it is a genuine user preference;
mode is normally an authoring decision, not a user-facing one. Theme
(`data-theme`) and density (`data-density`) are the user-facing axes.
