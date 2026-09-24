<div align="center">

```
+--------------------------------------+
|  BOXY                     radius: 0  |
+--------------------------------------+
```

**A sharp-edged design system for AI coding agents.**

Hairline structure, engineering detail, a rationed palette —
and a linter that fails the build when something drifts.

[Documentation](https://github.avestura.dev/boxy-design-skill/) ·
[Tokens](https://github.avestura.dev/boxy-design-skill/tokens.html) ·
[Components](https://github.avestura.dev/boxy-design-skill/components.html) ·
[Patterns](https://github.avestura.dev/boxy-design-skill/patterns.html)

</div>

---

Ask an agent for a UI and you get the same page every time: rounded cards, a soft
drop shadow, a violet gradient, a pill badge. Boxy is a design system packaged as a
skill, written as constraints rather than suggestions, with a checker that catches
the drift.

In the spirit of [Zed](https://zed.dev), [Stripe](https://stripe.com) and
[IBM Carbon](https://carbondesignsystem.com).

## Install

**Claude Code** — plugin marketplace, nothing to publish:

```
/plugin marketplace add avestura/boxy-design-skill
/plugin install boxy@boxy-design-skill
```

**npx** — Claude Code, Cursor, Windsurf, AGENTS.md, Copilot:

```bash
npx boxy-design init              # Claude Code
npx boxy-design init --ai all     # every supported agent
```

**curl** — no registries at all:

```bash
curl -fsSL https://github.avestura.dev/boxy-design-skill/install.sh | sh
```

Then just ask for UI. The skill triggers on its own; `/boxy` invokes it explicitly.

## The seven axioms

Violating one is a bug, not a style preference.

1. **Radius is zero.** Everywhere, without exception — avatars, badges and toggles
   included.
2. **Lines carry structure.** A 1px border before a background change; a background
   change before a shadow.
3. **Never blur a shadow.** Depth is a hard offset (`2px 2px 0 0`) or a hairline.
   No `backdrop-filter`.
4. **Everything snaps to 4px.** No `13px`, no `0.375rem`.
5. **Neutrals do the work; accent is rationed.** Under 5% of painted pixels.
6. **Hierarchy is typographic.** Size, weight, tracking, case and rules — not color.
7. **Motion is mechanical.** 80–160ms, linear or sharp, no scale or bounce.

## Three modes

One system, three postures. Identical radius, borders, spacing, type and motion —
only section rhythm, display scale, grid columns and substrate visibility change.

| Mode | For | Signature |
|---|---|---|
| `blueprint` | Dev tools, infra, technical products | Grid substrate, corner ticks, mono annotations, dense |
| `industrial` | Dashboards, admin, internal tools | 16 columns, bottom-border fields, heavy tables |
| `editorial` | Marketing, landing, docs | 72px display type, 160px rhythm, generous air |

```html
<html data-mode="industrial" data-theme="dark" data-density="compact">
```

## What you get

```
.claude/skills/boxy/
  SKILL.md                     the axioms, modes and routing
  references/                  18 docs, loaded on demand
    tokens.md                  every token, every value
    modes.md                   blueprint / industrial / editorial
    layout.md                  rails, grids, shells, breakpoints
    typography.md              scale, labels, numerals, measure
    color.md                   contrast pairs, semantics, charts
    components-core.md         16 components, exact specs
    components-overlays.md     menus, context menus, popovers, drawers
    components-navigation.md   breadcrumbs, tab variants, trees, TOC
    components-content.md      code, lists, accordion, prose, avatars
    components-data.md         tables, tiles, charts, meters, states
    components-marketing.md    hero, pricing, FAQ, blog, footer, docs
    components-forms.md        validation, auth, dates, sliders, upload
    components-ai.md           agent chat, tool calls, approvals
    icons.md                   the icon set and its drawing rules
    motion-depth.md            durations, easing, elevation
    blueprint-details.md       substrate, ticks, annotations
    accessibility.md           contrast, focus, keyboard, targets
    anti-patterns.md           what breaks it, and the fix
  assets/
    boxy.css                   tokens, reset, utilities, layout primitives
    boxy-components.css        every component spec, implemented
    boxy-icons.svg             51 square-capped icons
    design-tokens.json         W3C DTCG export
  scripts/
    boxy-check.mjs             the linter
```

Component specs cover buttons, fields, selection controls, tags, cards, tabs and
their contained and vertical variants, modals, drawers, toasts, tooltips, popovers,
menus with submenus, context menus, split buttons, navigation, breadcrumbs, tree
navigation, accordions, inline code and code blocks, lists, avatars, timelines, data
tables, stat tiles, charts, meters, spinners, empty and error states, filter bars,
date and range pickers, sliders, steppers, segmented controls, file upload, search,
layout primitives, resizable panes, comboboxes, multi-selects, colour pickers,
editable data grids, kanban boards, notification inboxes, heroes, feature grids,
pricing, FAQs, blogs, footers, docs layouts, multi-step forms, validation, auth
screens, settings pages, command palettes and AI agent chat - tool calls,
reasoning, approvals and the composer.

Specs tell an agent how a component behaves; `boxy-components.css` gives it the
finished visuals, with class names that match the specs, so it does not have to
re-derive a menu or a calendar from prose.

## The linter

Guidance an agent can ignore is decoration.

```bash
npx boxy-design check "src/**/*"
node .claude/skills/boxy/scripts/boxy-check.mjs "src/**/*" --strict
```

```
src/components/Card.tsx
     8  error  Nonzero border-radius: border-radius: 8px          radius
     9  error  Shadow with a blur or spread radius: blur 12px     shadow-blur
    14  warn   Spacing off the 4px scale: padding: 13px (13px)    space

[ FAIL ]  46 files - 2 errors, 1 warning
```

Parses CSS, SCSS, HTML, JSX, TSX, Vue, Svelte and Astro. Zero dependencies,
Node 18+, exits non-zero on errors.

| Errors | Warnings |
|---|---|
| Nonzero radius, rounded utility classes | Spacing off the 4px scale |
| Shadow blur or spread, `drop-shadow`, `shadow-md` | Font sizes off the type scale |
| `backdrop-filter`, `filter: blur()`, `text-shadow` | Raw hex outside the token file |
| `transition: all`, durations over 240ms | Font weights below 400 |
| Gradient clipped to text | `ease-in-out`, overshoot curves, `scale()` |

Suppress a line with a `boxy-ignore` comment, a region with
`boxy-ignore-start` / `boxy-ignore-end`, or a file with `boxy-ignore-file`.

## Tokens

Two layers. **Primitives** (`--bx-n-600`, `--bx-a-500`) are raw values referenced
only inside the token file. **Roles** (`--bx-ink-subtle`, `--bx-accent`) are what
component code uses. Full listing in
[the token reference](https://github.avestura.dev/boxy-design-skill/tokens.html).

```css
/* rebrand by overriding roles, never primitives */
[data-theme="light"] {
  --bx-accent: #b5252b;
  --bx-ink-accent: #8e1d22;  /* must clear 4.5:1 on canvas */
  --bx-focus: #b5252b;
}
```

Both themes ship complete, light is the default, `prefers-color-scheme` is honored
and a manual `data-theme` always wins. Two densities: comfortable and compact.

Accessibility targets WCAG 2.2 AA as documented guidance — verified contrast pairs,
a 2px offset focus ring, keyboard paths and semantics specified per component.

## Using it without an agent

The CSS is two normal stylesheets with no build step - tokens and layout first,
components on top:

```html
<link rel="stylesheet" href="boxy.css">
<link rel="stylesheet" href="boxy-components.css">
```

```bash
npx boxy-design css --out src/styles          # both stylesheets + the icon sprite
npx boxy-design css --core --out src/styles   # boxy.css only
npx boxy-design tokens --out src/tokens       # just the DTCG JSON
```

Or from the package: `boxy-design/boxy.css`, `boxy-design/boxy-components.css`,
`boxy-design/boxy-icons.svg`.

## CLI

```
npx boxy-design <command> [options]

  init              Install the skill into this project    (default)
  css               Copy boxy.css, boxy-components.css, boxy-icons.svg
  tokens            Copy design-tokens.json only
  check [paths]     Lint files against the system

  --ai <list>       claude, cursor, windsurf, agents, copilot, or all
  --dir <path>      Project root
  --out <path>      Output directory for css / tokens
  --css             Also drop the stylesheets and icons into the project
  --core            css: boxy.css only
  --force           Overwrite existing files
  --strict          check: treat warnings as errors
```

Non-Claude targets also get the full reference set in `.boxy/`, so every agent
reads the same source of truth.

## Contributing

`skills/boxy/` is the single source of truth. `docs/assets/boxy.css` and
`docs/assets/boxy-components.css` are copies kept in sync by CI — edit the skill
copies, not the site copies. The site inlines `boxy-icons.svg` on every page; the
smoke test fails if a page is missing an icon.

```bash
node skills/boxy/scripts/boxy-check.mjs docs/   # the site must pass clean
node cli/test/smoke.mjs                         # installer + linter tests
```

## Credits

The accent and semantic ramps are adapted from
[IBM Carbon](https://carbondesignsystem.com) (Apache-2.0). The structural ideas come
from [Zed](https://zed.dev) and [Stripe](https://stripe.com). Packaging follows the
pattern set by
[ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill).

Fonts: [Inter](https://rsms.me/inter/) and
[JetBrains Mono](https://www.jetbrains.com/lp/mono/), both SIL Open Font License.

## License

MIT © avestura
