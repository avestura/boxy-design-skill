# Tokens

Canonical definitions: `assets/boxy.css`. Tool-agnostic export: `assets/design-tokens.json`.

Two layers. **Primitives** are raw values and are referenced *only* inside the token
file. **Roles** are what component code uses. Writing `var(--bx-n-600)` in a component
is a violation - use `var(--bx-ink-subtle)`.

---

## Space

4px base grid. Nothing outside this scale.

| Token | Value | Typical use |
|---|---|---|
| `--bx-space-px` | 1px | Border-width gaps in collapsed grids |
| `--bx-space-half` | 2px | Icon nudges, tick offsets |
| `--bx-space-1` | 4px | Tightest gap, chip internal |
| `--bx-space-2` | 8px | Icon-to-label, tag padding-x |
| `--bx-space-3` | 12px | Control padding-x (sm), table cell-y |
| `--bx-space-4` | 16px | Control padding-x (md), card padding (compact) |
| `--bx-space-5` | 24px | Card padding, stack gap, gutter |
| `--bx-space-6` | 32px | Card padding (roomy), group separation |
| `--bx-space-7` | 40px | - |
| `--bx-space-8` | 48px | Sub-section spacing |
| `--bx-space-9` | 64px | Section padding (industrial) |
| `--bx-space-10` | 80px | Section padding (blueprint) |
| `--bx-space-11` | 96px | Section padding (default) |
| `--bx-space-12` | 128px | Section padding (editorial, tight) |
| `--bx-space-13` | 160px | Section padding (editorial) |
| `--bx-space-14` | 192px | Hero block |

## Type

| Token | Size / Leading | Use |
|---|---|---|
| `--bx-text-2xs` | 10 / 14 | Micro annotations, dimension labels |
| `--bx-text-xs` | 11 / 16 | Mono labels, eyebrows, table headers |
| `--bx-text-sm` | 12 / 16 | Captions, helper text, dense tables |
| `--bx-text-base` | 14 / 20 | **Default UI text** - controls, tables, nav |
| `--bx-text-md` | 16 / 24 | **Default body copy** - paragraphs, docs |
| `--bx-text-lg` | 18 / 28 | Lead paragraph, large body |
| `--bx-text-xl` | 20 / 28 | h3, card title |
| `--bx-text-2xl` | 24 / 32 | h2 (app), section title |
| `--bx-text-3xl` | 32 / 36 | h2 (marketing), h1 (app) |
| `--bx-text-4xl` | 40 / 44 | h1, blueprint display |
| `--bx-text-5xl` | 54 / 56 | Editorial sub-hero |
| `--bx-text-6xl` | 72 / 72 | Editorial hero |
| `--bx-text-7xl` | 96 / 92 | Statement hero only |

Families: `--bx-font-sans` (Inter), `--bx-font-display` (Inter Tight),
`--bx-font-mono` (JetBrains Mono).

Weights: `400` normal, `500` medium, `600` semibold, `700` bold. No 300.

Tracking: `--bx-track-display` -0.03em, `--bx-track-heading` -0.02em,
`--bx-track-body` 0, `--bx-track-label` 0.08em, `--bx-track-micro` 0.12em.

## Color roles

### Surfaces
| Token | Light | Dark | Use |
|---|---|---|---|
| `--bx-canvas` | `#ffffff` | `#0b0d0f` | Page background |
| `--bx-surface` | `#ffffff` | `#16191c` | Cards, panels, table body |
| `--bx-surface-sunken` | `#f6f7f8` | `#0b0d0f` | Wells, code blocks, table headers |
| `--bx-surface-raised` | `#ffffff` | `#23282d` | Popovers, modals, dropdowns |
| `--bx-surface-hover` | `#f6f7f8` | `#23282d` | Row/item hover |
| `--bx-surface-active` | `#eceef0` | `#343b41` | Pressed, selected |
| `--bx-surface-inverse` | `#23282d` | `#eceef0` | Inverted emphasis blocks |
| `--bx-surface-accent` | `#edf5ff` | `#001141` | Selected row, info callout |

### Ink
| Token | Light | Contrast on canvas | Use |
|---|---|---|---|
| `--bx-ink` | `#23282d` | 14.8:1 | Headings, body, primary |
| `--bx-ink-muted` | `#4a535b` | 7.7:1 | Secondary text, descriptions |
| `--bx-ink-subtle` | `#616b75` | 5.5:1 | Labels, captions, placeholders |
| `--bx-ink-faint` | `#7f8993` | 3.6:1 | **Non-text only** - disabled, icons, dividers |
| `--bx-ink-inverse` | `#ffffff` | - | On inverse/accent surfaces |
| `--bx-ink-accent` | `#0043ce` | 8.6:1 | Links |

`--bx-ink-faint` fails AA for body text by design. It is for disabled states and
decorative glyphs only.

### Lines
| Token | Light | Use |
|---|---|---|
| `--bx-line-subtle` | `#dde1e4` | Internal dividers, table row rules |
| `--bx-line` | `#c7ccd1` | **Default border** - cards, inputs, sections |
| `--bx-line-strong` | `#7f8993` | Hover borders, emphasis frames |
| `--bx-line-heavy` | `#23282d` | Corner ticks, selected frames, print rules |
| `--bx-line-accent` | `#0f62fe` | Active/focused element borders |

### Interaction
`--bx-accent` `#0f62fe` - `--bx-accent-hover` `#0043ce` - `--bx-accent-active`
`#002d9c` - `--bx-accent-soft` `#edf5ff` - `--bx-on-accent` `#ffffff` -
`--bx-focus` `#0f62fe`.

Foreground pairings for filled elements: `--bx-on-accent`, `--bx-on-danger`,
`--bx-on-success` (all white in both themes) and `--bx-on-warning` (near-black,
because the warning yellow needs dark text).

### The inverse scope

`--bx-surface-inverse` has a full set of companions so an inverted block is not a
special case: `--bx-surface-inverse-hover`, `--bx-surface-inverse-active`,
`--bx-line-inverse`, `--bx-line-inverse-strong`, `--bx-ink-inverse`,
`--bx-ink-inverse-muted`, `--bx-ink-accent-inverse` and `--bx-focus-inverse`.

Do not wire them up by hand. Put `.bx-inverse` (or `data-surface="inverse"`) on the
block and `boxy.css` remaps `--bx-surface`, `--bx-ink`, `--bx-ink-muted`,
`--bx-line`, `--bx-focus` and friends inside it, so ordinary components work
unchanged:

```html
<section class="bx-inverse">
  <h2>Start shipping in under five minutes</h2>
  <p style="color: var(--bx-ink-muted)">Free for personal projects.</p>
  <button class="bx-btn bx-btn--contrast">Create account</button>
  <button class="bx-btn">Talk to us</button>
</section>
```

### Semantic
`--bx-danger` `#da1e28` - `--bx-warning` `#f1c21b` - `--bx-success` `#24a148`,
each with a `-soft` background variant and an `--bx-ink-*` text variant. Always pair
a semantic color with an icon or text label; color alone never carries meaning.

## Geometry

`--bx-radius: 0` - `--bx-border: 1px` - `--bx-border-strong: 2px` -
`--bx-focus-width: 2px` - `--bx-focus-offset: 2px`.

## Elevation

Hard offsets only. Any nonzero blur is a violation.

| Token | Value | Use |
|---|---|---|
| `--bx-shadow-0` | `none` | Default for everything |
| `--bx-shadow-1` | `0 1px 0 0 var(--bx-line)` | Sticky header seam |
| `--bx-shadow-2` | `2px 2px 0 0 var(--bx-shadow-color)` | Dropdowns, popovers, tooltips |
| `--bx-shadow-3` | `4px 4px 0 0 var(--bx-shadow-color)` | Modals, command palette |
| `--bx-shadow-6` | `8px 8px 0 0 var(--bx-shadow-color)` | Editorial feature card hover |
| `--bx-ring` | `inset 0 0 0 1px var(--bx-line)` | Border without affecting layout |

## Motion

`--bx-dur-1` 80ms (hover/color) - `--bx-dur-2` 120ms (default) -
`--bx-dur-3` 160ms (panels) - `--bx-dur-4` 240ms (scrim, max allowed).

`--bx-ease` linear - `--bx-ease-sharp` `cubic-bezier(0.2, 0, 0, 1)` -
`--bx-ease-step` `steps(4, end)` (loaders, tickers).

## Controls and density

| Token | Comfortable | Compact |
|---|---|---|
| `--bx-control-sm` | 32px | 24px |
| `--bx-control-md` | 40px | 32px |
| `--bx-control-lg` | 48px | 40px |
| `--bx-pad-x-md` | 16px | 12px |
| `--bx-cell-y` | 12px | 8px |
| `--bx-section-y` | 96px | 64px |

Set `data-density="compact"` on a container for dense tools. Default is comfortable.
On touch, use `lg` controls so targets reach 48px.

## Layout

`--bx-container` 1280px - `--bx-container-wide` 1440px - `--bx-container-prose` 68ch -
`--bx-grid-columns` 12 (16 in industrial) - `--bx-grid-unit` 8px (substrate pitch) -
`--bx-gutter` 24px.

## Extending

To rebrand, override **role** tokens, not primitives, in a scope below `:root`:

```css
[data-theme="light"] {
  --bx-accent: #b5252b;
  --bx-accent-hover: #8e1d22;
  --bx-accent-active: #6b1519;
  --bx-accent-soft: #fdf0f0;
  --bx-ink-accent: #8e1d22;  /* must clear 4.5:1 on canvas */
  --bx-line-accent: #b5252b;
  --bx-focus: #b5252b;
}
```

Verify the new `--bx-ink-accent` against `--bx-canvas` in both themes before shipping.
Do not add new hues; add a second accent only if the product genuinely needs a
data/signal color, and then only for charts and annotations.
