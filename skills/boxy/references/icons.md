# Icons

Boxy ships its own icon set, `assets/boxy-icons.svg`, drawn to the same rules as the
rest of the system. Use it first. General-purpose libraries draw with round caps,
round joins, rounded rectangles and circle-based status marks - one of those next to
square UI reads like an unloaded font.

## The rules every icon follows

| Rule | Value |
|---|---|
| Grid | 16px viewBox; rendered at 12, 16, 20 or 24px |
| Stroke | 1.5px, `currentColor`, no fill (a few solid glyphs - `more`, `grip` - are 2px squares) |
| Caps / joins | `square` / `miter` |
| Corners | a corner wherever a corner reads; curves only where the object is curved (a paperclip, a refresh arrow) |
| Status marks | polygons, never circles: info and success in a **square**, warning in a **triangle**, error in an **octagon** |
| Colour | inherits ink. Icons at rest are `--bx-ink-subtle` or `--bx-ink`, never accent; a semantic icon takes the semantic `--bx-ink-*` |

## Using the sprite

Inline `boxy-icons.svg` once per page (it is an `<svg>` of `<symbol>`s with zero
size), then reference symbols:

```html
<svg class="bx-icon" aria-hidden="true"><use href="#i-search"/></svg>
<svg class="bx-icon bx-icon--sm" aria-hidden="true"><use href="#i-error"/></svg>
```

```css
.bx-icon { display: inline-block; inline-size: 16px; block-size: 16px; flex-shrink: 0; vertical-align: -3px; }
.bx-icon--sm { inline-size: 12px; block-size: 12px; }
.bx-icon--lg { inline-size: 20px; block-size: 20px; }
.bx-icon--xl { inline-size: 24px; block-size: 24px; }
```

An external reference (`<use href="/boxy-icons.svg#i-search">`) also works when the
page is served over HTTP from the same origin; inline is the robust default. In a
framework, turn each `<symbol>` into a component that renders the same `<svg>`.

Decorative icons get `aria-hidden="true"`. An icon-only button gets its name from
`aria-label` on the button, never from the icon.

**Never use a character as an icon.** `□ × ‹ › … ⚲ ✓` render in whatever font is
available, at whatever weight it has, and a missing glyph becomes a tofu box. The set
has `i-x`, `i-left`, `i-right`, `i-more`, `i-search` and `i-check` for exactly these.

## The set

| Group | Icons |
|---|---|
| Status | `info` `success` `warning` `error` |
| Actions | `copy` `edit` `trash` `share` `download` `upload` `plus` `minus` `x` `check` `refresh` `send` `clip` `link` `search` `filter` `sort` `pin` `star` `eye` `pipette` |
| Navigation | `down` `up` `left` `right` `more` `grip` |
| Objects | `folder` `file` `cal` `archive` `user` `gear` `grid` `list` `columns` `term` `lock` `bolt` `chart` `globe` `book` `branch` `bell` `inbox` `mail` `comment` |

Every id is prefixed `i-`.

## When the set is missing something

Draw it to the rules above and add it to the sprite. If you must use a library,
**Lucide** is the closest match (24px grid, 2px stroke, outline style) once adapted:

```css
.lucide {
  stroke-width: 1.5;          /* at 16px render size, use 2 on its 24 grid */
  stroke-linecap: square;
  stroke-linejoin: miter;
}
```

Presentation attributes lose to CSS, so this squares every stroke. Then avoid the
icons whose shape is itself round - `circle-*`, `*-circle`, `badge`, round
`toggle-*` - and pick the square variant (`square-check`, `square-x`) instead. Do
not mix two libraries on one screen.

Never: emoji as UI icons, filled duotone sets, coloured icons at rest, icon fonts.
