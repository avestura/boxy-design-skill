# Content components: code, lists, accordion, prose, avatars, timeline

The pieces long-form pages and detail views are made of. All of them follow the same
logic as the rest of the system - structure from a 1px line, hierarchy from type,
state from a square.

---

## Inline code

```css
.bx-code, .bx-prose :not(pre) > code {
  padding: var(--bx-space-half) var(--bx-space-1);
  background: var(--bx-surface-sunken);
  border: var(--bx-border) solid var(--bx-line-subtle);
  font-family: var(--bx-font-mono); font-size: 0.875em; color: var(--bx-ink);
  overflow-wrap: anywhere;       /* a long identifier must not push the page wider */
}
```

- Code, identifiers, file names, env vars, CLI flags. Not for emphasis.
- Keys are `.bx-kbd` (`components-core.md`), not inline code.
- A search match or highlight is an inverted inline block
  (`--bx-surface-inverse` / `--bx-ink-inverse`, 4px padding-x), never a yellow wash.

---

## Code block

```
+-- send.ts   typescript -------------------------------+ copy +
|  1 | export async function send(hook, body) {                |
|  2 |   for (let attempt = 0; attempt < 5; attempt++) {       |
| >3 |     const res = await fetch(hook.url, ...);   <- highlight
+-----------------------------------------------------------+
```

| Part | Spec |
|---|---|
| Container | 1px `--bx-line`, `--bx-surface-sunken` |
| Header | 32px, `--bx-surface`, 1px bottom rule; filename (mono label in `--bx-ink`), language (mono label, subtle), then actions |
| Actions | full-height ghost cells separated by 1px rules at the inline end: `COPY`, `OPEN`, `WRAP` in mono 10px uppercase |
| Code | 12px mono, 20px line height, 12px block padding, 16px inline padding, scrolls horizontally, never wraps by default |
| Footer | optional 28px strip: exit code, duration, line count |

**One element per line** (`<span class="ln">` with `display: block`). Line numbers,
highlights and diff marks are then line state, and the copy button copies the text
without numbers because the numbers live in `::before`:

```css
.bx-codeblock pre { counter-reset: ln; }
.bx-codeblock--numbered .ln { counter-increment: ln; }
.bx-codeblock--numbered .ln::before {
  content: counter(ln); display: inline-block; inline-size: 40px;
  margin-inline-end: var(--bx-space-3); padding-inline-end: var(--bx-space-2);
  text-align: end; color: var(--bx-ink-subtle);
  border-inline-end: var(--bx-border) solid var(--bx-line); user-select: none;
}
.bx-codeblock .ln--hl  { background: var(--bx-surface-active); box-shadow: inset 2px 0 0 0 var(--bx-accent); }
.bx-codeblock .ln--add { background: var(--bx-success-soft); color: var(--bx-ink); }
.bx-codeblock .ln--del { background: var(--bx-danger-soft);  color: var(--bx-ink); }
```

Diff blocks put a `+` / `-` in a 16px gutter (`::before`, in the semantic ink) and a
`+12 -3` count in the header. Terminal blocks prefix command lines with a `$ ` in
`::before` and render output lines in `--bx-ink-subtle`.

**Syntax colours stay near-monochrome.** Hierarchy from weight and ink:

| Token | Treatment |
|---|---|
| Keyword | `--bx-ink`, 500 |
| Plain / identifiers | `--bx-ink-muted` |
| Function names | `--bx-ink` |
| String | `--bx-ink-accent` - the one colour |
| Number | `--bx-ink-success` |
| Comment | `--bx-ink-subtle` (not `--bx-ink-faint` - comments are text and need 4.5:1) |
| Error / type names | `--bx-ink-danger`, sparingly |

A code block with a rainbow theme reads as pasted from somewhere else. If a project
already ships a highlighter, map its classes onto these tokens rather than loading
its theme.

Multiple languages or package managers: contained tabs (`components-navigation.md`)
directly above the block, sharing its border.

No traffic-light dots, no rounded window chrome, no drop shadow, no line wrapping by
default.

---

## Lists

| Kind | Marker |
|---|---|
| Unordered | a 6px square in `--bx-ink-subtle`, 24px gutter |
| Nested unordered | a 6px hollow square (1px inset ring) |
| Ordered | zero-padded mono counter (`01`, `02` ...), tabular, 0.8125em, `--bx-ink-subtle`, 40px gutter - so item 10 does not shift the alignment |
| Checklist | a drawn 16px check in `--bx-ink` (not green); absent items get an 8px dash in `--bx-ink-faint` and `--bx-ink-subtle` text |
| Ruled | no markers (or numbers for ordered), 12px block padding, 1px `--bx-line-subtle` between rows, `--bx-line` above and below the list |

```css
.bx-list { list-style: none; padding: 0; display: grid; gap: var(--bx-space-2); }
.bx-list > li { position: relative; padding-inline-start: var(--bx-space-5); }
ul.bx-list > li::before { content: ""; position: absolute; inset-inline-start: var(--bx-space-1);
  inset-block-start: 0.6lh; inline-size: 6px; block-size: 6px; margin-block-start: -3px;
  background: var(--bx-ink-subtle); }
ol.bx-list { counter-reset: bx-ol; }
ol.bx-list > li { counter-increment: bx-ol; padding-inline-start: var(--bx-space-7); }
ol.bx-list > li::before { content: counter(bx-ol, decimal-leading-zero);
  position: absolute; inset-inline-start: 0; font-family: var(--bx-font-mono);
  font-size: 0.8125em; font-variant-numeric: tabular-nums; color: var(--bx-ink-subtle); }
```

Draw checks as an SVG used as a CSS `mask` over `background: var(--bx-ink)`, so the
glyph takes any ink colour and flips with the theme. Never an emoji, never a font
glyph whose weight you cannot control.

**Plan / task states** (agent plans, onboarding checklists) add three states to the
checklist: `pending` - a 12px hollow square in `--bx-line-strong`; `active` - a 12px
accent-ringed square with a 6px accent block stepping round its corners
(`steps(4)`), text in `--bx-ink` 500; `done` - the check in `--bx-ink-subtle` with
the text struck through in `--bx-ink-faint`.

### Description list

Key / value pairs for details panels. Mono uppercase keys in a
`minmax(96px, 35%)` column, values in `--bx-ink`, 8px block padding, 1px
`--bx-line-subtle` under every row and `--bx-line` above the first. A grid on the
`<dl>` itself - never a two-column table for this.

### Blockquote

A 2px `--bx-line-heavy` rule on the inline start, 24px padding, the quote at 18px in
`--bx-ink`, attribution as a mono label below. No giant quotation mark, no italic
serif, no tinted background.

---

## Accordion

Built on `<details>` / `<summary>`: works without script, find-in-page can open it,
and `name="group"` on every item makes it exclusive (one open) natively.

| Part | Spec |
|---|---|
| Container | 1px `--bx-line`, `--bx-surface` |
| Item rule | 1px `--bx-line` between **visible** items only |
| Summary | 48px min, 12px/16px padding, 14-16px at 500 weight, full-width hit area |
| Number (optional) | mono 11px `--bx-ink-subtle` before the label - `01`, `02` |
| Indicator | a 16px square with a 1px `--bx-line-strong` border and a drawn plus (two 1.5px bars); open shows only the horizontal bar. At the inline end |
| Body | 16px padding-x, 24px bottom, 14px `--bx-ink-muted`, 20px line height |
| Hover | `--bx-surface-hover` on the summary |
| Focus | inset outline (`outline-offset: -2px`) so it does not overlap the neighbour |

```css
.bx-accordion > details:not([hidden]) ~ details:not([hidden]) {
  border-block-start: var(--bx-border) solid var(--bx-line); }
.bx-accordion summary { list-style: none; }
.bx-accordion summary::-webkit-details-marker { display: none; }
.bx-accordion summary::after {
  content: ""; margin-inline-start: auto; inline-size: 16px; block-size: 16px;
  border: var(--bx-border) solid var(--bx-line-strong);
  background:
    linear-gradient(var(--bx-ink), var(--bx-ink)) center / 8px 1.5px no-repeat,
    linear-gradient(var(--bx-ink), var(--bx-ink)) center / 1.5px 8px no-repeat;
}
.bx-accordion details[open] > summary::after {
  background: linear-gradient(var(--bx-ink), var(--bx-ink)) center / 8px 1.5px no-repeat; }
```

The sibling selector uses `~` with `:not([hidden])` so an accordion that is filtered
in place (FAQ categories) never shows a doubled rule at the top.

- No chevron-and-plus combinations, no rotating plus. One indicator.
- Content fades in over 120ms. Height animation (`::details-content` +
  `interpolate-size`) is allowed at 160ms sharp where supported; never required.
- Do not hide required information in an accordion - FAQs, advanced options and
  secondary detail only.
- `--flush` variant drops the inline borders when the accordion sits inside a card.

---

## Prose

For blog posts, docs pages and changelogs:

- `max-width: var(--bx-container-prose)` (68ch), 16px / 24px body in `--bx-ink-muted`.
- 16px between blocks. `h2` gets 48px above, a full-width 1px `--bx-line` rule and
  24px of padding above the heading text; `h3` gets 32px above. Headings in `--bx-ink`.
- Links underline at rest in prose (`text-decoration-color: var(--bx-line-strong)`,
  full ink on hover) - at rest-without-underline only works in UI chrome.
- `strong` is 600 in `--bx-ink`. No coloured emphasis.
- Figures: a bordered block; the caption is a mono label, `FIG. 01 - what it shows`.
- Article meta row: avatar, author, date, reading time, separated by `·` in
  `--bx-ink-faint`, between two 1px `--bx-line` rules.

---

## Avatar

**Square.** Like everything else.

| Size | Box | Initials |
|---|---|---|
| sm | 24px | mono 10px |
| md | 32px | mono 11px |
| lg | 40px | mono 12px |
| xl | 64px | mono 18px |

- Initials: mono, 500, uppercase, `--bx-ink-muted` on `--bx-surface-sunken` with a 1px
  `--bx-line` border. Images `object-fit: cover` inside the same box.
- Agents and system actors use the inverse variant; never a gradient, never a
  generated colour per user (it pulls colour into the chrome and fails contrast).
- **Presence**: a 10px square at the bottom-end corner, notched out by a 2px border in
  the surrounding surface colour: `--bx-success` online, `--bx-warning` away,
  `--bx-danger` busy, `--bx-ink-faint` offline. Always also stated in text or
  `aria-label` - the square alone is colour-only.
- **Group**: avatars side by side with a -1px overlap so their borders collapse into
  single rules. Never the stacked-overlapping-circles look. Overflow as an inverse
  `+3` cell at the end.

---

## Timeline / activity feed

A vertical 1px `--bx-line` at 4px from the inline start, an 8px square marker per
event on that line: filled in the semantic colour for state changes, hollow
(`inset 0 0 0 1px var(--bx-line-strong)`) for neutral events. Each entry: a mono
11px tabular timestamp above, a 14px/500 title, optional muted body. 24px between
entries; the line stops at the last marker.

Newest first. Group by day with a mono label when the feed spans days. Use it for
deploy histories, audit logs, incident updates and agent run logs.

---

## Banner

A full-width announcement strip above the header: 40px min, `--bx-surface-sunken`
(or the inverse scope for something that must be seen), 1px bottom rule, 12px text,
a mono label for the kind (`MAINTENANCE`), one link, and a ghost close button. One at
a time. A semantic banner (incident, degraded) uses the callout recipe instead: 1px
semantic border, 3px on the inline start, `-soft` fill.
