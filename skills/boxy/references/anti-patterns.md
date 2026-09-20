# Anti-patterns

Read this when reviewing or refactoring existing UI. Each entry: what breaks it, why,
and what to do instead.

---

## Geometry

**Any nonzero border radius.**
`border-radius: 6px`, `rounded-lg`, `rounded-full`, `borderRadius: 4`.
Why: this is the one rule the whole system rests on. A single rounded element among
square ones looks like a bug.
Instead: `0`. Everywhere. Including avatars, badges, toggles, and the browser's own
defaults on inputs and buttons (`boxy.css` resets them).

**Doubled borders.**
Two 1px-bordered cards side by side with a gap, producing a 2px seam.
Instead: the collapsed grid - `gap: 1px` over a `--bx-line` background, cells with no
borders of their own.

**Floating cards in whitespace.**
A grid of shadowed cards with 24px gaps and nothing connecting them.
Instead: a collapsed grid, or cards bounded by the section rail.

**Inconsistent border color across one view.**
Mixing `--bx-line`, `--bx-line-subtle`, and an ad-hoc gray.
Instead: `--bx-line` for structure, `--bx-line-subtle` for internal dividers. Two
line weights per view, maximum.

---

## Depth

**Blurred shadows.**
`box-shadow: 0 4px 12px rgba(0,0,0,0.1)`, `0 1px 3px`, Tailwind's `shadow-md`.
Why: soft shadows are the signature of the generic SaaS look this system exists to
avoid.
Instead: a 1px border, or a hard offset (`2px 2px 0 0`).

**Focus glows.**
`box-shadow: 0 0 0 4px rgba(15,98,254,0.2)`.
Instead: `outline: 2px solid var(--bx-focus); outline-offset: 2px`.

**Glassmorphism.**
`backdrop-filter: blur(12px)` with a translucent surface.
Instead: a solid `--bx-surface-raised` with a 1px `--bx-line-heavy` border.

**Neumorphism.**
Dual light/dark inset shadows to fake extrusion. Fails contrast and fights every
other rule here.
Instead: a border and a surface step.

---

## Color

**A decorative accent.**
Accent-colored section backgrounds, accent headings, accent icons at rest, accent
card borders.
Why: it burns the 5% budget and flattens the hierarchy - when everything is
highlighted, nothing is.
Instead: neutrals for everything; accent only for links, focus, the single primary
action, and active state.

**The default violet/indigo SaaS gradient.**
`linear-gradient(135deg, #6366f1, #a855f7)` on a hero or a button.
Instead: a flat fill, or an inverted `--bx-surface-inverse` block.

**Gradient text.**
`background-clip: text` on a headline.
Instead: weight and size. If you need more, invert the block behind it.

**Color as the only signal.**
A red dot with no label, a green row with no icon.
Instead: always pair with a glyph or a word.

**Raw hex in component code.**
`color: #333`, `border: 1px solid #e5e7eb`.
Why: it breaks dark mode silently and cannot be rebranded.
Instead: role tokens. Hex belongs only in the token file.

**Pure black or pure white surfaces in dark mode.**
Instead: `--bx-canvas` `#0b0d0f` and `--bx-ink` `#eceef0`.

---

## Type

**Colored headings.**
Blue or accent h2s.
Instead: `--bx-ink` with size and weight doing the work.

**Font weights under 400.**
`font-weight: 300` beside 1px hairlines looks broken at small sizes.
Instead: 400 minimum; use `--bx-ink-muted` for de-emphasis.

**Letter-spacing on body copy.**
Instead: tracking only on mono labels (0.08em) and display type (-0.02 to -0.03em).

**All-caps sentences.**
Instead: uppercase only for mono labels under 32 characters.

**Centered body text.**
Instead: left-aligned. Center only a hero headline and its one-line subhead.

**Lorem ipsum in a delivered design.**
Instead: realistic content at realistic length, including the long values that break
layouts.

**Measure over 75 characters.**
Instead: `--bx-container-prose` (68ch).

---

## Spacing

**Off-scale values.**
`padding: 13px`, `gap: 0.375rem`, `margin-top: 30px`.
Instead: the 4px scale. If a value feels needed between two steps, the layout is
usually wrong.

**Symmetric heading margins.**
Equal space above and below a heading makes it float between two blocks.
Instead: roughly 2:1, more above than below.

**Inconsistent section rhythm.**
Instead: one `--bx-section-y` value per mode, applied everywhere.

---

## Motion

**`transition: all`.**
Animates layout properties unintentionally and is slow.
Instead: name the properties.

**Durations over 240ms.**
Instead: 80-160ms.

**`ease-in-out` on short transitions.**
Instead: `linear`, or `--bx-ease-sharp` for entrances.

**Scale on hover.**
`transform: scale(1.02)` on a card.
Why: it implies softness and blurs the 1px borders during the transition.
Instead: change `border-color` and `background-color`.

**Bounce, spring, or overshoot easing.**
Instead: mechanical curves only.

**Shimmer-gradient skeletons.**
A sweeping light gradient across a placeholder.
Instead: a stepped opacity pulse on a solid sunken rectangle.

**Parallax and scroll-jacking.**
Instead: nothing, or an 8px fade-up reveal in `editorial` only.

---

## Components

**Pill-shaped anything.** Badges, tags, toggles, avatars, filter chips.
Instead: squares.

**Circular avatars.** Instead: squares. This is usually the hardest one to accept and
the most important for the look.

**Emoji as UI icons.**
Instead: a real icon set at 16/20/24px with a 1.5px stroke - Lucide, Phosphor, or
Carbon Icons all work.

**Icons in two visual styles.** Mixing filled and outlined, or two stroke weights.
Instead: one set, one weight, one size per context.

**Multiple primary buttons in one view.**
Instead: one solid accent action; everything else outline or ghost.

**Floating labels in form fields.**
Instead: a static label above the field.

**Placeholder as label.**
Instead: a real `<label>`.

**Hover-only affordances.**
Row actions that exist only on hover are unreachable by keyboard and touch.
Instead: also show on `:focus-within`, and duplicate in an overflow menu.

**Tooltips carrying essential information.**
Instead: visible helper text.

**Illustrations and 3D renders in empty states.**
Instead: a square outlined glyph, or a hatch-filled square with corner ticks.

**Infinite logo marquees.**
Instead: a static collapsed grid.

---

## Blueprint overuse

**Corner ticks on every card.** Three blueprint devices per viewport, maximum.

**A visible grid nothing aligns to.** Either align real edges to the pitch or remove
the substrate.

**Fake technical annotations.** Invented version numbers, made-up latency figures,
decorative coordinates and barcodes.
Instead: real values, or labels that do not imply data.

**Cyanotype blue page backgrounds.** The aesthetic is precision, not a literal
blueprint print.

---

## Refactor order

When converting an existing UI, work in this order - each step makes the next
more obviously correct:

1. Set every radius to `0`.
2. Replace every blurred shadow with a 1px border.
3. Swap hard-coded colors for role tokens; verify dark mode.
4. Snap all spacing to the 4px scale.
5. Cut accent usage down to interaction only.
6. Convert grids of floating cards into collapsed grids.
7. Apply mono labels to eyebrows, table headers, and captions.
8. Fix motion: named properties, 120ms, linear.
9. Add the rail and full-bleed section rules.
10. Add blueprint details last, and sparingly.

Run `node scripts/boxy-check.mjs` after step 4 and again at the end.
