# Color

The palette is deliberately boring so the structure can be interesting. If a page
looks flat and gray with one blue thing in it, that is correct.

## The 5% rule

Accent (`#0f62fe`) covers under 5% of painted pixels on any given view. In practice:

- One solid accent button per view. Every other action is outline or ghost.
- Links, focus rings, active nav indicator, selected row tint, active tab underline.
- That is the whole list.

Not accent: section backgrounds, card borders at rest, icons at rest, headings,
hero backgrounds, illustration fills, hover states on neutral elements.

## Where color comes from

Work down this list and stop at the first one that works:

1. **A line.** `border: 1px solid var(--bx-line)`.
2. **A surface step.** `--bx-surface-sunken` vs `--bx-surface`.
3. **Ink weight.** `--bx-ink` vs `--bx-ink-muted` vs `--bx-ink-subtle`.
4. **Inversion.** `--bx-surface-inverse` + `--bx-ink-inverse` for a whole block.
5. **Accent.** Only for interaction.

Inversion is the Boxy answer to "this section needs to pop". A solid near-black block
with white text, square, full-bleed, is more striking than any gradient and costs no
color budget.

## Contrast pairs that are known good

Light theme, on `--bx-canvas` (`#ffffff`):

| Foreground | Ratio | Verdict |
|---|---|---|
| `--bx-ink` `#23282d` | 14.8:1 | AAA - body, headings |
| `--bx-ink-muted` `#4a535b` | 7.7:1 | AAA - secondary text |
| `--bx-ink-subtle` `#616b75` | 5.5:1 | AA - labels, captions |
| `--bx-ink-faint` `#7f8993` | 3.6:1 | UI components only, never text |
| `--bx-ink-accent` `#0043ce` | 8.6:1 | AAA - links |
| `--bx-accent` `#0f62fe` | 5.0:1 | AA - large text, UI borders |

| Combination | Ratio |
|---|---|
| `--bx-ink-inverse` on `--bx-accent` | 5.0:1 |
| `--bx-ink-inverse` on `--bx-surface-inverse` | 14.8:1 |
| `--bx-line` on `--bx-canvas` | 1.6:1 (decorative rule - fine) |
| `--bx-line-strong` on `--bx-canvas` | 3.6:1 (meets UI component contrast) |

A border that conveys state (focus, error, selected) must clear 3:1 against its
adjacent surface. `--bx-line` at 1.6:1 does not, which is why state borders use
`--bx-line-accent`, `--bx-danger`, or `--bx-line-heavy`.

## Semantic color

| Role | Base | Soft bg | Text |
|---|---|---|---|
| Danger | `--bx-danger` `#da1e28` | `--bx-danger-soft` | `--bx-ink-danger` `#a2191f` |
| Warning | `--bx-warning` `#f1c21b` | `--bx-warning-soft` | `--bx-ink-warning` `#8e6a00` |
| Success | `--bx-success` `#24a148` | `--bx-success-soft` | `--bx-ink-success` `#198038` |
| Info | `--bx-accent` | `--bx-accent-soft` | `--bx-ink-accent` |

Rules:
- Never use the base semantic color as body text on a light surface - `#f1c21b` on
  white is 1.7:1. Use the `--bx-ink-*` variant for text and reserve the base for
  fills, icons, and the 3px left rule on callouts.
- Color never carries meaning alone. Every status gets an icon or a word. A red
  square with no label fails for colorblind users and for anyone glancing.
- Status indicator shape: an 8px **square**, never a circle. Filled for active,
  1px outline for inactive.

### Callout pattern
```html
<div style="display: flex; gap: 12px; padding: 16px;
            background: var(--bx-danger-soft);
            border: 1px solid var(--bx-danger);
            border-left-width: 3px">
  <svg width="16" height="16" aria-hidden="true">...</svg>
  <div>
    <p style="font-weight: 600; color: var(--bx-ink)">Deployment failed</p>
    <p style="color: var(--bx-ink-muted); font-size: var(--bx-text-base)">
      Build step exited with code 1.
    </p>
  </div>
</div>
```

## Dark theme

Not an inversion - a separate set of role values.

- Canvas `#0b0d0f` is darker than surface `#16191c`. Panels sit *above* the page, so
  they are lighter. This is the opposite of the light theme, where surfaces are white
  and wells are gray. Reach for the role token and it handles itself.
- Lines get lighter, not darker: `--bx-line` is `#343b41` in dark.
- Accent text shifts up the ramp to `--bx-a-300` `#78a9ff` (8.3:1 on canvas). The
  `#0f62fe` fill stays, because white on it is still 5.0:1.
- Never use pure `#000` or pure `#fff` as a large surface in dark mode.
- Semantic soft backgrounds become very dark tints (`#2d0709`, `#302200`,
  `#071f12`), not the light ones.

Test every screen in both themes. The most common dark-mode bug in this system is a
hard-coded `#fff` surviving in a border or an icon fill.

## Charts

Charts are where the neutral discipline pays off - a chart on a gray page with one
accent series reads instantly.

- **One series:** `--bx-accent`.
- **Two series:** `--bx-accent` plus `--bx-ink-muted`.
- **Categorical, 3-6 series:** accent ramp steps that differ in *lightness*, not just
  hue - `#0f62fe`, `#78a9ff`, `#002d9c`, `#a6c8ff`, `#001d6c`, `#d0e2ff`. Add a
  pattern fill (diagonal hatch, dots) for the 5th and 6th so the chart survives
  grayscale printing and colorblind viewing.
- **Sequential:** the accent ramp, `--bx-a-50` to `--bx-a-900`.
- **Diverging:** `--bx-danger` ramp through `--bx-n-100` to the accent ramp.
- Gridlines: `--bx-line-subtle`, 1px, horizontal only. Axis: `--bx-line`.
- Bars are square with no radius and no gap-rounding. Bar gap is 4px or 8px.
- Never a gradient area fill. A flat accent at 12% opacity, or a hatch, or nothing.
- Data labels and axis ticks: mono, `--bx-text-xs`, `--bx-ink-subtle`, tabular.

## Rebranding

Override role tokens only, as shown in `tokens.md`. Before shipping a new accent:

1. `--bx-ink-accent` must clear 4.5:1 on `--bx-canvas` in both themes.
2. `--bx-on-accent` must clear 4.5:1 on `--bx-accent`.
3. `--bx-focus` must clear 3:1 on both `--bx-canvas` and `--bx-surface-inverse`.

If the brand color cannot satisfy these, use a darkened variant for text and the
brand value for fills.
