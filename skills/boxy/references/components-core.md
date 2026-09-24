# Core components

Exact specs. Sizes are comfortable density; compact values in parentheses.
All examples use role tokens and assume `boxy.css` is loaded.

---

## Button

| Size | Height | Padding-x | Font |
|---|---|---|---|
| sm | 32px (24) | 12px (8) | 12px / 500 |
| md | 40px (32) | 16px (12) | 14px / 500 |
| lg | 48px (40) | 24px (16) | 14px / 500 |

Icon-only: square at the same height. Icon + label: 8px gap, 16px icon at md.

| Variant | Rest | Hover | Active | Use |
|---|---|---|---|---|
| **primary** | `--bx-accent` fill, `--bx-on-accent` text, no border | `--bx-accent-hover` | `--bx-accent-active` | One per view |
| **secondary** | `--bx-surface`, 1px `--bx-line`, `--bx-ink` | `--bx-surface-hover`, border `--bx-line-strong` | `--bx-surface-active` | Default choice |
| **ghost** | transparent, no border, `--bx-ink-muted` | `--bx-surface-hover`, `--bx-ink` | `--bx-surface-active` | Toolbars, table rows |
| **danger** | `--bx-danger` fill, white text | `--bx-danger-hover` | darker | Destructive confirm |
| **inverse** | `--bx-surface-inverse`, `--bx-ink-inverse` | lighten one step | - | On inverted blocks |

Disabled: `--bx-surface-sunken` background, `--bx-ink-faint` text, 1px
`--bx-line-subtle`, `cursor: not-allowed`. Never reduce opacity - it muddies the
hairlines.

Loading: replace the label with a mono ticker or a 2px square spinner using
`steps(8, end)`; keep the button width fixed so nothing reflows.

```css
.bx-btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: var(--bx-space-2);
  height: var(--bx-control-md);
  padding-inline: var(--bx-pad-x-md);
  border: var(--bx-border) solid var(--bx-line);
  background: var(--bx-surface);
  color: var(--bx-ink);
  font-size: var(--bx-text-base);
  font-weight: var(--bx-weight-medium);
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--bx-dur-1) var(--bx-ease),
              border-color var(--bx-dur-1) var(--bx-ease),
              color var(--bx-dur-1) var(--bx-ease);
}
.bx-btn:hover { background: var(--bx-surface-hover); border-color: var(--bx-line-strong); }
.bx-btn:active { background: var(--bx-surface-active); }

.bx-btn--primary {
  background: var(--bx-accent); border-color: var(--bx-accent);
  color: var(--bx-on-accent);
}
.bx-btn--primary:hover { background: var(--bx-accent-hover); border-color: var(--bx-accent-hover); }

.bx-btn--ghost { background: transparent; border-color: transparent; color: var(--bx-ink-muted); }
.bx-btn--ghost:hover { background: var(--bx-surface-hover); color: var(--bx-ink); border-color: transparent; }

.bx-btn--sm { height: var(--bx-control-sm); padding-inline: var(--bx-pad-x-sm); font-size: var(--bx-text-sm); }
.bx-btn--lg { height: var(--bx-control-lg); padding-inline: var(--bx-pad-x-lg); }

.bx-btn:disabled {
  background: var(--bx-surface-sunken); border-color: var(--bx-line-subtle);
  color: var(--bx-ink-faint); cursor: not-allowed;
}
```

**Button groups** share borders - never place two bordered buttons side by side with
a gap that shows two lines:

```css
.bx-btn-group { display: flex; gap: var(--bx-border); background: var(--bx-line);
                border: var(--bx-border) solid var(--bx-line); width: fit-content; }
.bx-btn-group .bx-btn { border: 0; }
```

---

## Text input

Two treatments. Pick one per product and never mix.

**Boxed** (default, `blueprint` and `editorial`): 1px border all around.
**Underlined** (`industrial`, Carbon-style): sunken fill, bottom border only.

| Size | Height | Padding-x | Font |
|---|---|---|---|
| sm | 32px (24) | 12px | 14px |
| md | 40px (32) | 12px | 14px |
| lg | 48px (40) | 16px | 16px |

States: rest `--bx-line`; hover `--bx-line-strong`; focus 2px `--bx-accent` border
(boxed) or 2px `--bx-accent` bottom border (underlined), plus the standard focus
outline; error 2px `--bx-danger`; disabled sunken + `--bx-ink-faint`.

Focus must not shift layout. Use `box-shadow: inset 0 0 0 2px` rather than changing
`border-width`, or set a transparent 2px border at rest.

```css
.bx-input {
  display: block; inline-size: 100%;
  height: var(--bx-control-md);
  padding-inline: var(--bx-space-3);
  background: var(--bx-surface);
  border: var(--bx-border) solid var(--bx-line);
  color: var(--bx-ink);
  font-size: var(--bx-text-base);
  transition: border-color var(--bx-dur-1) var(--bx-ease),
              box-shadow var(--bx-dur-1) var(--bx-ease);
}
.bx-input::placeholder { color: var(--bx-ink-subtle); }
.bx-input:hover { border-color: var(--bx-line-strong); }
.bx-input:focus {
  outline: none;
  border-color: var(--bx-accent);
  box-shadow: inset 0 0 0 1px var(--bx-accent);
}
.bx-input[aria-invalid="true"] {
  border-color: var(--bx-danger); box-shadow: inset 0 0 0 1px var(--bx-danger);
}

/* industrial underlined variant */
.bx-input--underline {
  background: var(--bx-surface-sunken);
  border: 0; border-bottom: var(--bx-border) solid var(--bx-line-strong);
}
.bx-input--underline:focus { box-shadow: inset 0 -2px 0 0 var(--bx-accent); border-color: transparent; }
```

Field assembly - label above, helper below, error replaces helper:

```html
<div style="display: grid; gap: 4px">
  <label class="bx-label" for="api-key">API key</label>
  <input class="bx-input" id="api-key" aria-describedby="api-key-help">
  <p id="api-key-help" style="font-size: var(--bx-text-sm); color: var(--bx-ink-subtle)">
    Starts with sk_live_.
  </p>
</div>
```

Textarea: same border treatment, `min-height: 96px`, `padding: 12px`,
`resize: vertical`.

---

## Select

Native `<select>` styled to match the input, with a custom chevron. Height and
borders identical to `.bx-input`. Add `appearance: none` and a 16px chevron
positioned 12px from the inline end, `--bx-ink-subtle`.

For a custom listbox: `--bx-surface-raised`, 1px `--bx-line`, `--bx-shadow-2`,
options 32px tall with 12px padding-x, hover `--bx-surface-hover`, selected
`--bx-surface-accent` with a 2px accent left border. No radius, no gap between
options, 1px `--bx-line-subtle` between groups only.

---

## Checkbox and radio

**Both are square.** A radio in Boxy is a square with an inset square, not a circle.
This is the intentional break from convention; keep it.

- Box: 16px, 1px `--bx-line`, `--bx-surface`.
- Checked: `--bx-accent` fill, white 2px checkmark (an SVG path, not a glyph).
- Radio checked: `--bx-accent` 1px border, 8px centered `--bx-accent` square.
- Indeterminate: `--bx-accent` fill with a white 2px horizontal bar.
- Label: 14px, 8px gap, whole row clickable, 32px minimum row height.
- Disabled: `--bx-surface-sunken` fill, `--bx-line-subtle` border.

```css
.bx-check {
  appearance: none; inline-size: 16px; block-size: 16px;
  border: var(--bx-border) solid var(--bx-line);
  background: var(--bx-surface);
  display: grid; place-content: center;
  cursor: pointer;
  transition: background-color var(--bx-dur-1) var(--bx-ease),
              border-color var(--bx-dur-1) var(--bx-ease);
}
.bx-check:checked { background: var(--bx-accent); border-color: var(--bx-accent); }
.bx-check:checked::after {
  content: ""; inline-size: 9px; block-size: 5px;
  border-inline-start: 2px solid var(--bx-on-accent);
  border-block-end: 2px solid var(--bx-on-accent);
  transform: rotate(-45deg) translate(1px, -1px);
}
.bx-check[type="radio"]:checked { background: var(--bx-surface); }
.bx-check[type="radio"]:checked::after {
  content: ""; inline-size: 8px; block-size: 8px;
  background: var(--bx-accent); border: 0; transform: none;
}
```

---

## Toggle

A square track with a square knob - not a pill.

- Track: 40x20px (compact 32x16), 1px `--bx-line`, `--bx-surface-sunken`.
- Knob: 16px (12) square, `--bx-line-strong` fill, 1px inset from the track.
- On: track `--bx-accent` with matching border, knob `--bx-on-accent`, translated to
  the end.
- Transition: `transform` and `background-color`, 120ms linear. Translate by whole
  pixels only.
- Always pair with a visible label. Never use a toggle for an action that needs
  confirmation - that is a button.

---

## Tag / badge

Square, 1px border, mono uppercase. Never a pill.

| Size | Height | Padding-x | Font |
|---|---|---|---|
| sm | 20px | 4px | 10px mono |
| md | 24px | 8px | 11px mono |

Variants: neutral (`--bx-surface-sunken` + `--bx-line`), accent
(`--bx-accent-soft` + `--bx-line-accent` + `--bx-ink-accent`), and the three
semantics using their `-soft` / base / `-ink-` trio. Solid variant for counts:
`--bx-surface-inverse` + `--bx-ink-inverse`.

Removable tag: 16px ghost X button flush to the inline end, separated by a 1px
`--bx-line` rule - the tag reads as two cells.

---

## Card

A card is a bordered rectangle. It does not float.

- 1px `--bx-line`, `--bx-surface`, padding `--bx-space-5` (24px), or 16px compact.
- Header: title 16/600, optional mono label above, 1px `--bx-line-subtle` rule below
  the header block when the card has distinct regions.
- Footer: 1px `--bx-line-subtle` top rule, `--bx-surface-sunken`, 12px padding.
- Hover (interactive cards only): `border-color: var(--bx-line-strong)` and
  `background: var(--bx-surface-hover)`. In `editorial` only, an 8px hard offset
  shadow is also permitted.
- In a grid, cards belong in `.bx-collapse` so they share borders.

```html
<article class="bx-collapse" style="grid-template-columns: repeat(3, 1fr)">
  <div style="padding: 24px">
    <p class="bx-label">Latency</p>
    <h3 style="margin-top: 8px">Edge routing</h3>
    <p style="margin-top: 8px; color: var(--bx-ink-muted); font-size: var(--bx-text-base)">
      Requests terminate at the nearest of 310 locations.
    </p>
  </div>
  <!-- siblings share the 1px rules -->
</article>
```

---

## Tabs

- Height 40px (32 compact), label 14/500, padding-x 16px.
- 1px `--bx-line` bottom rule spanning the full tab strip width.
- Active: a 2px `--bx-accent` bar that *replaces* the rule beneath it, `--bx-ink` label.
- Inactive: `--bx-ink-subtle` label, no indicator.
- Hover: `--bx-surface-hover`, `--bx-ink` label.
- No gap between tabs; they butt against each other.

**Draw the indicator with shadows, not with a negative margin.** The obvious
implementation - a transparent 2px bottom border plus `margin-block-end: -1px` so
the active bar overlaps the strip's rule - breaks on hover: the tab now extends
over that 1px, and its opaque hover background paints across the rule, leaving a
visible gap in the line under whichever tab the pointer is on.

Keep the tab exactly as tall as the strip's content box so its background can never
reach the rule, and draw the active indicator as two shadows - an inset bar plus a
1px outset that recolours the rule segment underneath, so it reads as one
continuous mark instead of 2px of accent stacked on 1px of grey:

```css
.bx-tabs { display: flex; align-items: stretch;
           border-block-end: var(--bx-border) solid var(--bx-line); }
.bx-tab {
  height: var(--bx-control-md);          /* no border, no negative margin */
  background: transparent; border: 0;
  transition: color var(--bx-dur-1) var(--bx-ease),
              background-color var(--bx-dur-1) var(--bx-ease);
}
.bx-tab:hover { background: var(--bx-surface-hover); color: var(--bx-ink); }
.bx-tab[aria-selected="true"] {
  color: var(--bx-ink);
  box-shadow: inset 0 -2px 0 0 var(--bx-accent), 0 1px 0 0 var(--bx-accent);
}
```

The same rule applies anywhere an indicator sits on a container's edge rule - top
nav, sub-nav, filter strips.
- Keyboard: arrow keys move between tabs, `Home`/`End` jump, `Tab` exits to panel.
  Use `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`.

A secondary "segmented" variant for filters: native radios with the checked
segment inverted - full spec in `components-forms.md`. Contained (file) tabs and
vertical tabs are in `components-navigation.md`.

---

## Modal

- Scrim: `--bx-scrim`, fades in over `--bx-dur-4` (240ms).
- Dialog: `--bx-surface-raised`, 1px `--bx-line-heavy`, `--bx-shadow-3`.
  No radius, obviously.
- Widths: sm 400px, md 560px, lg 800px, full `calc(100vw - 96px)`.
- Structure: header (56px, title 16/600, 1px bottom rule, 32px ghost close button at
  the inline end), body (24px padding, scrolls), footer (1px top rule,
  `--bx-surface-sunken`, 16px padding, buttons right-aligned in a shared-border
  group).
- Entry: opacity 0 -> 1 and `translateY(4px) -> 0` over 160ms sharp. No scale.
- Behavior: focus trapped, focus returns to the trigger on close, `Esc` closes,
  scrim click closes unless the form is dirty, `aria-modal="true"`,
  `aria-labelledby` pointing at the title, background `inert`.

---

## Toast

- Bottom-right stack, 16px from the edges, 8px between toasts, max 4 visible.
- 1px `--bx-line-heavy`, `--bx-surface-raised`, `--bx-shadow-2`, width 360px.
- A 3px semantic left border carries the status; an icon repeats it.
- Layout: icon 16px, message 14/400, optional action as a ghost button, 24px close.
- Enters by translating 8px on the x-axis over 160ms sharp. No slide-and-bounce.
- Dismiss after 5s (8s if it has an action); never auto-dismiss an error.
- `role="status"` for info/success, `role="alert"` for error.

---

## Tooltip

- `--bx-surface-inverse`, `--bx-ink-inverse`, 12px text, 6px/8px padding, 1px
  `--bx-line-heavy`, `--bx-shadow-2`.
- **No arrow.** A square tooltip offset 6px from its trigger is cleaner and on-system.
- Delay 300ms in, 0ms out. Fade only, 80ms.
- Never put interactive content in a tooltip - that is a popover.
- Attach with `aria-describedby`; make sure the same information is reachable by
  keyboard and on touch.

---

## Header / top nav

- 56px marketing, 48px app. `--bx-surface`, 1px `--bx-line` bottom rule, sticky with
  `--bx-shadow-1`.
- Wordmark at the inline start, nav items 14/500 `--bx-ink-muted`, 16px gaps,
  `--bx-ink` on hover.
- Active item: a 2px `--bx-accent` bar replacing the header rule beneath it, drawn
  with `box-shadow: inset 0 -2px 0 0 var(--bx-accent), 0 1px 0 0 var(--bx-accent)`.
  Do not overlap the rule with a negative margin - see the note under Tabs for why
  that breaks on hover.
- Actions at the inline end in a shared-border button group.
- Below `md`: collapse to a 40px square menu button opening a full-height drawer with
  32px-tall, full-bleed nav rows separated by 1px rules.

---

## Sidebar

- 256px expanded / 48px icon rail, `--bx-surface`, 1px `--bx-line` right rule.
- Section headings: `.bx-label`, 24px tall, 12px padding-x, `--bx-surface-sunken`
  with 1px rules above and below.
- Items: 32px (compact) or 40px tall, full-bleed, 12px padding-x, 8px icon gap,
  14/400 `--bx-ink-muted`.
- Active: `--bx-surface-active`, `--bx-ink`, 500 weight, 2px `--bx-accent` inset left
  border.
- Nested items indent by 16px with a 1px `--bx-line-subtle` vertical guide at the
  indent position - a literal tree rule. Collapsible groups, three levels and the
  nested active mark: see Tree navigation in `components-navigation.md`.

---

## Breadcrumb

Mono, 12px, `--bx-ink-subtle`, separated by a `/` in `--bx-ink-faint` with 8px
margins. Current page in `--bx-ink`, not a link. Truncate the middle with an ellipsis
button past four levels. `<nav aria-label="Breadcrumb">` wrapping an `<ol>`. Full
spec, including the overflow menu, in `components-navigation.md`.

---

## Pagination

A shared-border button group. 32px square page buttons, mono tabular numerals,
current page inverted (`--bx-surface-inverse`). Prev/next are 32px icon buttons at
the ends of the same group. Alongside it, a mono caption:
`SHOWING 1-25 OF 1,284`. `<nav aria-label="Pagination">`, `aria-current="page"` on
the active button.
