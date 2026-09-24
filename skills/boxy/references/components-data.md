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
- **Progress bar**: 4px tall (8px for a primary task), square ends,
  `--bx-surface-sunken` track, `--bx-accent` fill, 1px `--bx-line` border. A label
  row above it: the task at 12px on the start, the value in mono tabular `--bx-ink`
  on the end. Past 80% of a limit the fill becomes `--bx-warning`, past 95%
  `--bx-danger`, and a helper line in the semantic ink says so. `role="progressbar"`
  with `aria-valuenow`. Indeterminate version: a 25%-wide accent block translating
  across the track over 1.2s linear.
- **Spinner**: a 16px box with a 1px `--bx-line-strong` inset ring and a 4px accent
  square stepping clockwise round its corners (`steps(1, end)` between four
  keyframes, 0.8s infinite). 12px variant with a 2px square for inline use. No arcs,
  no rotation. In a button, it replaces the icon slot and the button keeps a fixed
  width so the label does not reflow.
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

---

## Meter

A level against a limit - seats, quota, context window - as opposed to progress,
which is a task finishing. Render it as **discrete cells**: a quantity reads as a
count when you can see the units.

- A grid of equal cells with a 2px gap, 12px tall (8px in dense rows).
- Empty cell: `--bx-surface-sunken` with a 1px inset `--bx-line` ring. Filled:
  `--bx-ink` (neutral) or `--bx-accent` when the meter is the view's focus.
  Cells over a threshold take `--bx-warning` / `--bx-danger`.
- 10-20 cells. More than 20 and it is a progress bar.
- Label row above: name on the start, `14 / 20` in mono on the end.
- `role="meter"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`.

## Step bar

One 4px cell per step with 4px gaps: done `--bx-ink`, current `--bx-accent`,
upcoming sunken with a 1px ring. Pair it with a mono `Step 3 of 5`. It is decoration
for the stepper, the agent plan or onboarding - the text carries the meaning, so
mark the bar `aria-hidden`.

## Uptime strip

One square cell per day (90 across), 2px gaps, 28px tall: `--bx-success`,
`--bx-warning` degraded, `--bx-danger` outage, sunken-with-ring for no data. Every
cell has a tooltip (`Sep 3 · Degraded performance`). Under the strip: `90 DAYS AGO`
and `TODAY` as mono labels at the ends and the uptime percentage in mono at the
centre. The strip gets an `aria-label` summarising it (`90 days, 1 outage`).

## Implementing charts

The geometry rules above and the colour rules in `color.md` are the spec. For
hand-built SVG charts:

- **Render at the container's real pixel width**, not a scaled `viewBox`, so axis
  text never stretches. Re-render on `ResizeObserver`.
- **Series colour from role tokens only.** One series: `--bx-accent` (2px stroke,
  square caps, mitred joins, optional flat 12% area). A comparison series (previous
  period, target): `--bx-ink-subtle`, 1.5px, dashed `4 3` - neutral, and the dash
  keeps it distinguishable in greyscale and for colour-vision differences. Bars: all
  `--bx-accent`, or `--bx-line-strong` with the one bar that matters in accent.
- Charts that need three or more categorical series should use the accent ramp from
  `color.md` with direct labels and texture, and validate the palette in both themes
  - most "six-colour" charts should be small multiples instead.
- **Axis max is four nice steps** (1, 2, 2.5, 5 x 10^n per step) so every gridline
  is a round number. Gridlines horizontal only, 1px `--bx-line-subtle`,
  `shape-rendering: crispEdges`; the baseline in `--bx-line`.
- Ticks and labels: mono 10-11px `--bx-ink-subtle`, tabular. Thin x labels to one per
  56px.
- **Direct labels** on bars when there are 12 or fewer; values in mono `--bx-ink`
  just above each bar.
- **Legend** above the plot for two or more series: mono uppercase labels with a
  12px x 2px line key (dashed for the comparison) or an 8px square for bars.
- **Hover**: a 1px `--bx-line-heavy` crosshair snapped to the nearest x, an 8px
  square marker (surface fill, 2px accent stroke) on the series, and the square
  tooltip listing every series at that x - value first in mono, name after, a 12px
  line key per row. Bars highlight the hovered bar (`--bx-accent-hover`) instead of
  a crosshair. The hit area is the whole plot, not the 2px line.
- **Keyboard**: the chart is focusable; `ArrowLeft` / `ArrowRight` step the
  crosshair; blur hides it.
- **Screen readers**: `role="img"` with an `aria-label` naming the chart, plus the
  same data as a table directly after it, wrapped in a `<div class="bx-sr">`. Put
  the class on the wrapper, not the `<table>`: a table ignores the 1px width, and an
  absolutely positioned table escapes its scroll container and widens the page.
- Build tooltip and legend text with `textContent`, never by concatenating
  series names into `innerHTML`.
- A sparkline is a 96x32 polyline, 1.5px accent, `vector-effect: non-scaling-stroke`,
  no axes, no dots, beside the stat tile's value.

---

## Editable data grid

A spreadsheet-like grid for bulk editing. When data is only read, use the data table.

- **Vertical rules are allowed here** - unlike the data table, cell targeting needs
  them. 1px `--bx-line-subtle` around every cell, `--bx-line` under the header.
- 32px rows, 8px padding-x, tabular figures, numbers right-aligned. A 40px sunken
  row-number column in mono; it lights up (`--bx-surface-active`, `--bx-ink`) for the
  row holding focus. Sticky mono header.
- **One active cell**: roving `tabindex`, drawn as a 2px inset accent ring. Arrow keys
  move it; `Tab` leaves the grid (it is one tab stop).
- **Editing**: `Enter`, `F2`, double-click, or typing a character starts it (typing
  replaces the value). A borderless input fills the ringed cell, so nothing moves.
  `Enter` commits and moves down, `Tab` commits and moves right, `Esc` restores.
- **Dirty**: an edited cell gets a 6px accent square in its top-end corner. A bar
  under the grid (sunken, 1px rule) states `3 UNSAVED CHANGES · 1 INVALID` in mono
  (`aria-live`) with `Discard` and `Save changes`; save is disabled while anything
  is invalid.
- **Invalid**: `--bx-danger-soft` fill, a 1px danger ring (2px when focused),
  `aria-invalid="true"`, and the message available as the cell's description. Never
  block the user from leaving an invalid cell.
- Read-only cells: `aria-readonly="true"`, `--bx-ink-subtle`, no edit on keys.
- `role="grid"`; column headers `scope="col"`, row numbers `scope="row"`; the edit
  input is labelled with its column and row.

## Kanban board

- Columns are a horizontally scrolling collapsed grid (`grid-auto-columns:
  minmax(264px, 1fr)`, 1px gap over `--bx-line`) on `--bx-surface-sunken`; the page
  itself never scrolls sideways.
- Column header: 40px on `--bx-surface`, the name as a mono label in `--bx-ink`, a
  mono count or `WIP 4 / 2`, and a ghost add button. Over the WIP limit: the count
  in `--bx-ink-warning` and a 2px `--bx-warning` rule under the header - never a
  red column.
- Card: `--bx-surface`, 1px `--bx-line`, 12px padding, 8px between cards. Title 14/500,
  a meta row in mono 11px: an 8px priority square (danger high, warning medium,
  hollow none), the id, square tags, and a 24px avatar at the end.
- Hover: `--bx-line-strong`. **Dragging**: `--bx-line-heavy` border and
  `--bx-shadow-3` - the one moment a card may float - while its origin shows at 40%
  opacity. The drop slot is a card-height block with a **dashed** accent border on
  `--bx-accent-soft`: a placeholder waiting to be filled, the same reason the upload
  zone is dashed. No tilt, no scale.
- **Keyboard parity is mandatory**: cards are focusable; `Alt+Left/Right` moves
  between columns, `Alt+Up/Down` reorders, and each move is announced through a
  polite live region (`"Retry webhooks" in Review, position 2`). Also offer `Move to`
  in the card's overflow menu.
