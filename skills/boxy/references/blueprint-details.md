# Blueprint details

The engineering-drawing layer. These are **opt-in**: they earn their place on hero
blocks, feature panels, section headers, and empty states. Applying them to every box
turns precision into noise.

Budget: at most **three** of these devices visible in one viewport.

---

## Grid substrate

A faint graph-paper background at the 8px pitch.

```css
.bx-grid-bg {
  background-image:
    linear-gradient(to right, var(--bx-grid-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--bx-grid-line) 1px, transparent 1px);
  background-size: var(--bx-grid-unit) var(--bx-grid-unit);
}
```

- `--bx-grid-line` is 5.5% ink. Going above 8% makes text harder to read.
- 8px pitch for dense technical surfaces, 32px (`.bx-grid-bg--lg`) for hero sections.
- **Element edges must land on the pitch.** A visible grid that content ignores looks
  broken. Check the hero's left edge, the section padding, and the card heights.
- Anchor the grid to the container, not the viewport, so it does not drift on scroll:
  `background-position: 0 0` on the element that owns the rail.
- Fade it out where text is dense:
  `mask-image: linear-gradient(to bottom, #000, transparent)`.
- Dot variant (`.bx-dot-bg`) is quieter and works better behind long copy.

Never put a substrate behind a data table - the row rules and the grid lines fight.

---

## Corner ticks

Crosshair marks at the corners of a block, as on a registration mark or a cut line.

```css
.bx-ticks { position: relative; }
.bx-ticks::before, .bx-ticks::after {
  content: ""; position: absolute; inline-size: 7px; block-size: 7px;
  border: 1px solid var(--bx-line-heavy); pointer-events: none;
}
.bx-ticks::before { inset-block-start: -4px; inset-inline-start: -4px;
                    border-inline-end: 0; border-block-end: 0; }
.bx-ticks::after  { inset-block-end: -4px; inset-inline-end: -4px;
                    border-inline-start: 0; border-block-start: 0; }
```

Two corners (top-start, bottom-end) is the tasteful default. For all four, add a
wrapper with its own pair on the other diagonal.

Use on: the hero block, a highlighted feature panel, an empty state, an image frame.
Do not use on: buttons, inputs, table rows, list items, or every card in a grid.

Variant - a small `+` crosshair at grid intersections:

```css
.bx-cross::before {
  content: "+"; position: absolute; inset-block-start: -8px; inset-inline-start: -5px;
  font-family: var(--bx-font-mono); font-size: 12px; line-height: 1;
  color: var(--bx-line-strong);
}
```

---

## Section numbering

Mono, uppercase, `--bx-ink-subtle`, above the heading.

```html
<p class="bx-label">03 / Architecture</p>
```

Number the whole page consistently (`01`..`06`) rather than numbering some sections
and not others. Zero-pad to two digits. The separator is ` / ` with spaces.

---

## Technical annotations

Mono metadata that makes a page read like a datasheet. Used sparingly, this is the
single cheapest way to get the Zed feel.

- Under a hero: `v2.14.0 - MIT - 38 KB GZIPPED`
- Beside a metric: `p50 - LAST 24H - UTC`
- On an image: `FIG. 02 - REQUEST PATH`
- In a footer: `BUILD 8f3a1c - DEPLOYED 2026-09-20T14:22Z`
- On a code block header: `SRC/MAIN.RS - 42 LINES`

Rules: 10-11px mono, `--bx-track-label`, `--bx-ink-subtle` or `--bx-ink-faint`,
separated by ` - ` or ` / `. Keep them truthful - fake version numbers and invented
latency figures are worse than no annotation. If you do not have real values, use
labels that do not imply data.

---

## Dimension lines

An extended-measurement callout, as on a mechanical drawing. Use once per page at
most - on a hero visual or a spacing-documentation figure.

```html
<div style="position: relative; padding-block-start: 24px">
  <div style="position: absolute; inset-block-start: 8px; inset-inline: 0;
              border-block-start: 1px solid var(--bx-line-strong)"></div>
  <div style="position: absolute; inset-block-start: 4px; inset-inline-start: 0;
              inline-size: 1px; block-size: 9px; background: var(--bx-line-strong)"></div>
  <div style="position: absolute; inset-block-start: 4px; inset-inline-end: 0;
              inline-size: 1px; block-size: 9px; background: var(--bx-line-strong)"></div>
  <span class="bx-label" style="position: absolute; inset-block-start: 0;
        inset-inline-start: 50%; transform: translateX(-50%);
        background: var(--bx-canvas); padding-inline: 8px">1280 PX</span>
</div>
```

Mark it `aria-hidden="true"` - it is decoration.

---

## Hatch fills

Diagonal lines for placeholder, inactive, or disabled regions. The Boxy substitute
for a gray blob.

```css
.bx-hatch {
  background-image: repeating-linear-gradient(
    45deg,
    var(--bx-grid-line) 0 1px,
    transparent 1px 6px
  );
}
```

Use for: image placeholders, unavailable time slots in a scheduler, out-of-range
chart regions, empty-state glyphs, the 5th and 6th categorical chart series.

---

## Rules and separators

- **Full-bleed rule**: spans the viewport, content sits inside. The default section
  divider.
- **Labeled rule**: a 1px line with a mono label sitting in a gap in the middle or at
  the start, using a `--bx-canvas` background on the label to punch the hole. Good
  for `OR` dividers and section starts.
- **Tree guide**: a 1px vertical `--bx-line-subtle` at the indent position of nested
  lists, with 12px horizontal stubs to each item. Makes file trees and nested
  navigation read correctly.
- **Double rule**: 1px line, 3px gap, 1px line. Reserved for the single most
  important division on a page - typically above the footer.

---

## Keyboard keys

```css
.bx-kbd {
  display: inline-flex; align-items: center; justify-content: center;
  min-inline-size: 20px; block-size: 20px; padding-inline: 4px;
  border: 1px solid var(--bx-line);
  border-block-end-width: 2px;              /* the one 2px asymmetry allowed */
  background: var(--bx-surface-sunken);
  font-family: var(--bx-font-mono); font-size: var(--bx-text-2xs);
  color: var(--bx-ink-muted);
}
```

The 2px bottom border is the only permitted asymmetric border in the system, and it
exists because a key genuinely has a front face.

---

## What not to do

- Do not use blueprint blue (`#0033a0` cyanotype) as a page background. The
  aesthetic is precision, not a literal blueprint print.
- Do not add faux "technical" ornament that means nothing - random coordinates,
  fake barcodes, meaningless waveforms.
- Do not put a substrate, ticks, annotations, and a dimension line in the same
  viewport. Three devices maximum.
- Do not let decoration reduce contrast below the thresholds in
  `accessibility.md`.
