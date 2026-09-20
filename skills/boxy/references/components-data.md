# Data and dashboard components

Boxy is at its best here. Dense tabular data is exactly what hairline grids and
tabular numerals are for.

---

## Data table

The centerpiece of `industrial` mode.

### Structure
| Part | Spec |
|---|---|
| Header row | 32px (compact 24px), `--bx-surface-sunken`, `.bx-label` text, 1px `--bx-line` bottom rule, sticky at `z-index: 10` |
| Body row | 40px (compact 32px), `--bx-surface`, 1px `--bx-line-subtle` bottom rule |
| Cell padding | 12px inline, `--bx-cell-y` block |
| Cell text | 14/400 `--bx-ink`; secondary values `--bx-ink-muted` |
| Vertical rules | **None** between columns. Alignment does that job |
| Row hover | `--bx-surface-hover` |
| Row selected | `--bx-surface-accent` + 2px `--bx-accent` inset left border |
| Outer border | 1px `--bx-line` around the whole table |

Numeric columns right-align, including their headers, and use tabular numerals.
Text columns left-align. Never center a data column.

```css
.bx-table { inline-size: 100%; border-collapse: collapse;
            border: var(--bx-border) solid var(--bx-line); }
.bx-table th {
  position: sticky; inset-block-start: 0; z-index: 10;
  height: 32px; padding-inline: var(--bx-space-3);
  background: var(--bx-surface-sunken);
  border-block-end: var(--bx-border) solid var(--bx-line);
  font-family: var(--bx-font-mono); font-size: var(--bx-text-xs);
  font-weight: var(--bx-weight-medium); letter-spacing: var(--bx-track-label);
  text-transform: uppercase; text-align: start; color: var(--bx-ink-subtle);
  white-space: nowrap;
}
.bx-table td {
  height: 40px; padding-inline: var(--bx-space-3);
  border-block-end: var(--bx-border) solid var(--bx-line-subtle);
  font-size: var(--bx-text-base);
}
.bx-table tbody tr:hover { background: var(--bx-surface-hover); }
.bx-table .num { text-align: end; font-variant-numeric: tabular-nums; }
```

### Sorting
Header becomes a full-cell button. The sort glyph is a 8px triangle in
`--bx-ink-faint`, becoming `--bx-accent` when active. The active column header gets
`--bx-ink` text. Set `aria-sort="ascending" | "descending" | "none"` on the `<th>`.

### Selection
40px leading checkbox column, fixed width, 1px right rule separating it from data.
Header checkbox drives select-all and shows indeterminate. When a selection exists,
the toolbar above the table is replaced in place (no layout shift) by an inverted
bar: `--bx-surface-inverse`, 48px, `3 SELECTED` in mono at the start, bulk actions as
inverse ghost buttons at the end.

### Column sizing
Fixed widths for identifier and status columns, `1fr` for the name column, `auto` for
actions. Truncate with an ellipsis and expose the full value via `title`. Never wrap
a data cell to two lines unless the table is explicitly a "comfortable" reading table.

### Row actions
A trailing column, right-aligned, 32px ghost icon buttons revealed on row hover and
always visible on focus-within. Never hide the only path to an action behind hover -
duplicate it in the row's overflow menu.

### Sticky first column
```css
.bx-table .pin { position: sticky; inset-inline-start: 0; background: inherit;
                 border-inline-end: var(--bx-border) solid var(--bx-line); }
```

### Mobile
Below `md`, transform each row into a stacked block: 1px `--bx-line` between records,
`.bx-label` for the field name in a left column of `minmax(96px, 35%)`, value at the
right. Keep the numeric right-alignment.

---

## Stat tile

```html
<div class="bx-collapse" style="grid-template-columns: repeat(4, 1fr)">
  <div style="padding: 20px 24px">
    <p class="bx-label">Monthly revenue</p>
    <p class="bx-mono" style="font-size: var(--bx-text-3xl); font-weight: 500;
                              margin-top: 8px; letter-spacing: -0.02em">
      $48,120
    </p>
    <p style="margin-top: 8px; font-size: var(--bx-text-sm); display: flex;
              align-items: center; gap: 6px">
      <span style="color: var(--bx-ink-success)">&#9650; 12.4%</span>
      <span style="color: var(--bx-ink-subtle)">vs last month</span>
    </p>
  </div>
</div>
```

Rules:
- Label above the value, always. Mono uppercase.
- Value: 32px mono, weight 500, tabular. Units and currency symbols at 16px in
  `--bx-ink-subtle`.
- Delta: semantic ink color plus a triangle glyph plus the comparison period. Color
  alone is never the signal.
- Tiles live in a collapsed grid so they read as one instrument panel.
- Optional inline sparkline: 32px tall, 1px stroke, `--bx-accent`, no fill, no dots,
  aligned to the tile's right edge.

---

## Charts

Full color rules in `color.md`. Geometry rules:

- Square bars, no radius, no rounded caps on lines.
- 1px `--bx-line-subtle` horizontal gridlines only. No vertical gridlines, no chart
  border except the axis line in `--bx-line`.
- Axis labels: mono, 11px, `--bx-ink-subtle`, tabular.
- Line series: 1.5px stroke, no shadow, no gradient fill. Area fill is a flat 12%
  accent or a 45deg hatch.
- Data points: 6px squares, shown only on hover or when there are fewer than 12.
- Tooltip: the standard square tooltip, values in mono tabular, one row per series
  with a 8px square color key.
- Legend: mono uppercase 11px, 8px square keys, placed above the plot, left-aligned.
- Always provide a `<table class="bx-sr">` equivalent of the data for screen readers.

---

## Filter bar

A 48px (40 compact) strip above the table: `--bx-surface`, 1px `--bx-line` bottom
rule, contents in a shared-border group so the controls read as one instrument.

Left: search input (240px, 32px tall, leading 16px magnifier icon).
Middle: filter dropdowns as secondary buttons showing `Status: Active` with the value
in `--bx-ink` and the key in `--bx-ink-subtle`; a filled accent count badge when
multiple values are selected.
Right: density toggle, column picker, export - 32px ghost icon buttons.

Active filters render below as removable square tags, with a `CLEAR ALL` ghost button
in mono at the end.

---

## Empty state

Centered in the content area, max-width 400px, 64px vertical padding.

- A square 48px outlined glyph in `--bx-line-strong` - or, in `blueprint`, a 96px
  hatch-filled square with corner ticks. Never an illustration, never an emoji.
- Title: 16/600.
- Body: 14/400 `--bx-ink-muted`, one or two sentences explaining what belongs here.
- One primary action.
- For a filtered-to-nothing state, the action is `CLEAR FILTERS`, not "create new".

---

## Loading

Boxy does not use spinners with circular arcs where it can avoid them.

- **Skeleton**: the preferred pattern. Solid `--bx-surface-sunken` rectangles at the
  exact dimensions of the content they replace, with a 1px `--bx-line-subtle` border.
  Animate opacity between 1 and 0.6 over 1s `steps(4, end)` - a stepped pulse, not a
  sweeping shimmer gradient.
- **Table loading**: render 5-10 skeleton rows at true row height so the layout does
  not jump.
- **Inline**: a mono ticker cycling `|/-\` on `steps(4, end)`, or a 2px square that
  steps around the perimeter of a 16px box.
- **Progress bar**: 4px tall, square ends, `--bx-surface-sunken` track, `--bx-accent`
  fill, 1px `--bx-line` border. Indeterminate version: a 25%-wide accent block
  translating across the track over 1.2s linear.
- Anything under 300ms shows no loading state at all.

---

## Error state

Same layout as the empty state, with:
- `--bx-danger` 48px square outline glyph.
- Title naming what failed: `Could not load deployments`.
- The technical detail in a mono 12px block on `--bx-surface-sunken` with a 1px
  border, collapsed behind a `DETAILS` disclosure.
- A `RETRY` primary button and, where relevant, a status-page link.

Inline error for a single failed row or widget: 1px `--bx-danger` border and a
`--bx-danger-soft` fill on that element only. Do not replace the whole view.
