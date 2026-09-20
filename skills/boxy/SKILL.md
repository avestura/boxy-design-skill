---
name: boxy
description: Sharp-edged, zero-radius UI design system for building interfaces with hairline structure, engineering/blueprint detailing, and a disciplined neutral palette - in the spirit of Zed, Stripe, and IBM Carbon. Use this whenever you are building, styling, reviewing, or refactoring any user interface, web page, landing page, dashboard, form, component, design system, or CSS/Tailwind theme, and whenever the user asks for a "boxy", "square", "sharp", "brutalist-lite", "technical", "blueprint", "engineering", "industrial", or "no rounded corners" look. Also use when asked to remove roundness, tighten a design, make something feel less generic-SaaS, or make a UI look precise and professionally engineered.
---

# Boxy

A design system with one non-negotiable rule and six supporting ones. Structure comes
from 1px lines, not from shadows and rounding. The result reads as *engineered* rather
than *decorated*.

## Use this skill when

Building or restyling any UI surface: landing pages, dashboards, admin panels, forms,
docs sites, component libraries, design tokens, marketing sections. If the output has
a visual interface, this skill applies.

## The seven axioms

Violating these is a bug, not a style preference.

1. **Radius is zero.** `border-radius: 0` on everything, without exception. No pills,
   no rounded avatars, no softened badges. The `--bx-radius` token exists only so that
   a value of `0` is explicit and greppable.
2. **Lines carry structure.** A 1px border is the primary way to separate things.
   Reach for a border before reaching for a background change, and for a background
   change before reaching for a shadow.
3. **Never blur a shadow.** Depth is expressed with hard offsets
   (`2px 2px 0 0`) or a 1px line. A blur radius above `0` is forbidden, including
   `backdrop-filter: blur()`.
4. **Everything snaps to 4px.** Spacing, sizing, and line-heights come from the scale.
   No `13px`, no `0.375rem`, no arbitrary values.
5. **Neutrals do the work; accent is rationed.** The accent color appears on under 5%
   of painted pixels - links, focus, one primary action per view. Never a decorative
   accent background.
6. **Hierarchy comes from type and line, not color.** Size, weight, tracking, case,
   and rules. Not colored headings, not gradient text.
7. **Motion is mechanical.** 80-160ms, linear or sharp easing, opacity/color/1px
   translate only. No scale, no bounce, no spring, no easing longer than 240ms.

## Start here, every time

1. **Pick a mode** (below) and set `data-mode` on the root element.
2. **Install the tokens** - copy `assets/boxy.css` into the project and link it, or
   port the `:root` block into the project's existing stylesheet. Never invent token
   values; read them from that file.
3. **Build with role tokens only** (`--bx-ink`, `--bx-line`, `--bx-surface`, ...).
   Primitive tokens (`--bx-n-500`, `--bx-a-500`) belong only inside the token file.
4. **Run the check before you report done**: `node scripts/boxy-check.mjs "src/**/*"`.

## The three modes

One system, three postures. Pick by product type; do not mix within a page.

| Mode | Use for | Feels like | Signature |
|---|---|---|---|
| `blueprint` | Dev tools, infra, technical products, API docs | Zed, a CAD drawing | Grid substrate, corner ticks, mono annotations, numbered sections, dense |
| `industrial` | Enterprise apps, dashboards, admin, internal tools | IBM Carbon | 16-col grid, bottom-border fields, heavy data tables, no substrate |
| `editorial` | Marketing, landing pages, docs, pricing | Stripe, but square | Big display type, 128-160px section rhythm, generous air, square cards |

All three share identical radius, borders, spacing scale, type scale, and motion.
Only section rhythm, display size, grid columns, and substrate visibility differ.
See `references/modes.md` for the full decision guide and per-mode recipes.

## Tokens at a glance

Full listing in `references/tokens.md`. The complete definitions live in
`assets/boxy.css`; a tool-agnostic W3C DTCG export is at `assets/design-tokens.json`.

```
SPACE    4px base    1:4  2:8  3:12  4:16  5:24  6:32  7:40  8:48
                     9:64 10:80 11:96 12:128 13:160 14:192
TYPE     sans Inter  -  display Inter Tight  -  mono JetBrains Mono
         2xs 10  xs 11  sm 12  base 14  md 16  lg 18  xl 20
         2xl 24  3xl 32  4xl 40  5xl 54  6xl 72  7xl 96
INK      --bx-ink 14.8:1  --bx-ink-muted 7.7:1  --bx-ink-subtle 5.5:1
         --bx-ink-faint 3.6:1 (non-text only)
LINE     --bx-line-subtle  --bx-line  --bx-line-strong  --bx-line-heavy
ACCENT   --bx-accent #0f62fe   under 5% of pixels
CONTROL  sm 32  md 40  lg 48     (compact: 24 / 32 / 40)
MOTION   80 / 120 / 160 / 240ms  -  linear or cubic-bezier(0.2,0,0,1)
```

## Composition rules that make it look right

These are what separate a real Boxy interface from "the same UI with the corners
filed off".

- **Collapse borders, never double them.** Adjacent cells share one line. Use the
  `.bx-collapse` grid (a 1px gap over a line-colored background) or negative margins.
  Two 1px borders touching reads as a 2px seam and looks like a mistake.
- **Full-bleed rules.** Section dividers span the entire viewport width, not just the
  content column. The content sits inside; the line runs past it.
- **Hang everything off a rail.** Keep two vertical hairlines at the container edges
  so content is visibly bounded. Content floating in whitespace is the wrong feel.
- **Align to the grid visibly.** If you use the blueprint substrate, real element
  edges must land on its 8px pitch. A visible grid that nothing aligns to is worse
  than no grid.
- **Labels are mono, uppercase, tracked.** Eyebrows, table headers, metric captions,
  legends, form labels in blueprint mode: 11px mono, `0.08em`, uppercase, muted ink.
- **Numbers are tabular.** Every figure in a table, metric, or price uses
  `font-variant-numeric: tabular-nums`.
- **Fill or outline, never float.** A card is a bordered rectangle flush against its
  neighbors or separated by exact scale spacing. It does not hover on a soft shadow.
- **One primary action per view.** Solid accent fill. Everything else is outline or
  ghost.
- **Invert with the scope, not by hand.** Put `.bx-inverse` on the block; it remaps
  the role tokens so ordinary components work inside it. Styling children with
  primitives (`--bx-n-700`) is how an inverted CTA ends up dark-on-dark in one
  theme, and `boxy-check` flags it.

## Anti-patterns

Full list with correct replacements in `references/anti-patterns.md`. The ones that
break the aesthetic instantly:

| Never | Instead |
|---|---|
| `border-radius: 8px`, `rounded-lg` | `0` |
| `box-shadow: 0 4px 12px rgba(0,0,0,.1)` | `1px` border, or `2px 2px 0 0` |
| Glassmorphism, `backdrop-filter: blur()` | Solid surface + 1px line |
| Gradient text, gradient buttons | Flat fill, inverted block for emphasis |
| Default violet/indigo SaaS accent | `--bx-accent` blue, used sparingly |
| Pill badges and tags | Square tags with 1px border |
| Soft drop-shadowed floating cards | Bordered cards in a collapsed grid |
| `transition: all 300ms ease-in-out` | Named properties, 120ms, linear |
| Emoji as UI icons | A real icon set, 16/20/24px, 1.5px stroke |
| Centered everything | Left-aligned text; center only short hero copy |

## References

Load these as needed - do not read them all up front.

| File | Read when |
|---|---|
| `references/tokens.md` | You need exact token names and values |
| `references/modes.md` | Choosing or configuring blueprint/industrial/editorial |
| `references/layout.md` | Page structure, grid, rails, section rhythm, responsive |
| `references/typography.md` | Setting type, scale pairings, label treatment |
| `references/color.md` | Applying color, contrast pairs, semantic usage, charts |
| `references/components-core.md` | Button, input, select, checkbox, toggle, tag, card, tabs, modal, toast, tooltip, nav, sidebar, breadcrumb, pagination |
| `references/components-data.md` | Data tables, stat tiles, charts, empty/loading/error states, filter bars |
| `references/components-marketing.md` | Hero, feature grid, pricing, logo wall, CTA, footer, docs layout |
| `references/components-forms.md` | Multi-step forms, validation, auth screens, settings, command palette |
| `references/motion-depth.md` | Any transition, animation, or elevation decision |
| `references/blueprint-details.md` | Grid substrate, corner ticks, annotations, dimension lines |
| `references/accessibility.md` | Contrast, focus, keyboard, touch targets, semantics |
| `references/anti-patterns.md` | Reviewing or refactoring existing UI |

## Validate before you report done

```bash
node scripts/boxy-check.mjs "src/**/*.{css,scss,html,jsx,tsx,vue,svelte}"
```

Flags nonzero radius, blurred shadows, off-scale spacing, raw hex outside the token
file, banned easing, and `backdrop-filter`. Exits non-zero on violations. Fix
everything it reports, then say what you built and which mode you used.
