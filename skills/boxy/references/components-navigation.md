# Navigation: breadcrumbs, tab variants, tree navigation, on-this-page

Top nav, sidebar basics and pagination are in `components-core.md`. This file covers
the structures that nest.

One rule runs through all of it: **an active indicator replaces the rule it sits on.**
Draw it with an inset shadow plus a 1px outset that recolours the rule's segment,
never by pulling the element over the rule with a negative margin (the hover fill
would then punch a gap in the line - see `components-core.md`, Tabs).

---

## Breadcrumb

```html
<nav class="bx-breadcrumb" aria-label="Breadcrumb">
  <ol>
    <li><a href="/acme">acme</a></li>
    <li><a href="/acme/production">production</a></li>
    <li><span aria-current="page">edge-router</span></li>
  </ol>
</nav>
```

```css
.bx-breadcrumb ol { display: flex; flex-wrap: wrap; align-items: center; list-style: none; padding: 0;
  font-family: var(--bx-font-mono); font-size: var(--bx-text-sm); color: var(--bx-ink-subtle); }
.bx-breadcrumb li { display: flex; align-items: center; }
.bx-breadcrumb li + li::before { content: "/"; margin-inline: var(--bx-space-2); color: var(--bx-ink-faint); }
.bx-breadcrumb a { color: var(--bx-ink-subtle); }
.bx-breadcrumb a:hover { color: var(--bx-ink); }
.bx-breadcrumb [aria-current="page"] { color: var(--bx-ink); }
```

- Mono 12px, `/` separators drawn in CSS so screen readers do not read them.
- The current page is plain text in `--bx-ink`, never a link to itself.
- **Past four levels, collapse the middle** into a 20px bordered `...` button that
  opens a menu of the hidden levels (`components-overlays.md`). Keep the first level
  and the last two visible.
- In an app, the breadcrumb is often also the path: `org / env / resource`. Lowercase
  identifiers are fine there; they are data.
- Never replace the page title with the breadcrumb. It is wayfinding, not a heading.

---

## Tab variants

The default underline tabs are in `components-core.md`. Two more:

### Contained (file tabs)

For switching views of one object - files, languages, package managers. A sunken
strip with bordered tabs; the selected tab takes the panel's surface and drops its
bottom rule so tab and panel read as one box, and its accent mark moves to the top
edge.

```css
.bx-tabs--contained { background: var(--bx-surface-sunken);
  border: var(--bx-border) solid var(--bx-line); border-block-end: 0; }
.bx-tabs--contained .bx-tab {
  height: 36px;
  border-inline-end: var(--bx-border) solid var(--bx-line);
  box-shadow: inset 0 -1px 0 0 var(--bx-line);         /* the strip's rule, per tab */
  font-family: var(--bx-font-mono); font-size: var(--bx-text-xs);
  letter-spacing: var(--bx-track-label); text-transform: uppercase;
}
.bx-tabs--contained .bx-tab[aria-selected="true"] {
  background: var(--bx-surface);
  box-shadow: inset 0 2px 0 0 var(--bx-accent);         /* rule gone, mark on top */
}
.bx-tabs--contained::after { content: ""; flex: 1; box-shadow: inset 0 -1px 0 0 var(--bx-line); }
```

The strip's bottom rule is drawn per tab (and by the `::after` filler) precisely so
the selected tab can omit it. The panel below carries its own border minus the top.

### Vertical

For settings sections and long, parallel categories. The rule is on the inline end;
the active tab takes `--bx-surface-active` and an accent bar that replaces that rule:
`box-shadow: inset -2px 0 0 0 var(--bx-accent), 1px 0 0 0 var(--bx-accent)`.
Set `aria-orientation="vertical"` on the tablist; `ArrowUp` / `ArrowDown` move.

| Variant | Use |
|---|---|
| Underline | Views of a page section; the default |
| Contained | Views of one object; code in several languages |
| Vertical | 4-10 parallel sections beside their content |
| Segmented (`components-forms.md`) | A filter or mode with 2-4 short options |

Never use tabs to navigate between pages - that is a nav with links and
`aria-current`.

---

## Tree navigation (sidebar with submenus)

Docs sites, file browsers, consoles with sections. Built on `<details>` so it works
without script, keeps its state in the DOM, and the browser's find-in-page opens a
collapsed branch that contains a match.

```html
<nav class="bx-tree" aria-label="Documentation">
  <p class="bx-tree__heading">Guides</p>
  <ul>
    <li><a class="bx-tree__item" href="/intro">Introduction</a></li>
    <li>
      <details open>
        <summary class="bx-tree__item">Networking</summary>
        <ul>
          <li><a class="bx-tree__item" href="/routing" aria-current="page">Routing</a></li>
          <li><a class="bx-tree__item" href="/caching">Caching</a></li>
        </ul>
      </details>
    </li>
  </ul>
</nav>
```

| Part | Spec |
|---|---|
| Section heading | mono 11px uppercase, 28px tall, `--bx-surface-sunken`, 1px `--bx-line-subtle` above and below (none above the first) |
| Item | 32px min height, 12px padding-x, 14px `--bx-ink-muted`, 8px icon gap, full-bleed |
| Hover | `--bx-surface-hover`, `--bx-ink` |
| Group toggle | the `<summary>` styled as an item, with a 6px chevron at the inline end that turns 90deg when open (`rotate`, 120ms) |
| Open group | its summary in `--bx-ink` |
| Nesting | each level indents 16px and hangs off a 1px `--bx-line-subtle` rule on the nested `<ul>` - a literal tree line |
| Active (top level) | `--bx-surface-active`, `--bx-ink`, 500, `inset 2px 0 0 0 var(--bx-accent)` |
| Active (nested) | same fill, but the mark is `-1px 0 0 0 accent, inset 1px 0 0 0 accent`: the outset recolours the tree rule's segment, so the bar replaces the guide instead of sitting beside it |
| Count / badge | mono 11px at the inline end |

```css
.bx-tree ul ul { margin-inline-start: var(--bx-space-4);
  border-inline-start: var(--bx-border) solid var(--bx-line-subtle); }
.bx-tree__item[aria-current="page"] { background: var(--bx-surface-active); color: var(--bx-ink);
  font-weight: var(--bx-weight-medium); box-shadow: inset 2px 0 0 0 var(--bx-accent); }
.bx-tree ul ul .bx-tree__item[aria-current="page"] {
  box-shadow: -1px 0 0 0 var(--bx-accent), inset 1px 0 0 0 var(--bx-accent); }
summary.bx-tree__item { list-style: none; }
summary.bx-tree__item::-webkit-details-marker { display: none; }
```

- Three levels maximum. Deeper structures belong in the page (an index, a search).
- Open the branch containing the current page on load; leave the rest as the user
  left them.
- A group toggle is a toggle, not a link. If the group also has an overview page,
  make that the first child item.
- `aria-current="page"` on the current link - not a class alone.
- Collapsed icon rail (48px): hide labels and nested levels, keep icons and the
  active bar, and put the label in a tooltip.

---

## On-this-page (TOC)

A vertical list hung off a 1px `--bx-line-subtle` rule, 24px rows, 12px text in
`--bx-ink-subtle`; second-level headings indent to 32px. The current heading is
`--bx-ink` with the same replace-the-rule mark as a nested tree item. Track it with an
`IntersectionObserver` (`rootMargin: "-88px 0px -70% 0px"` works for a 56px header)
and set `aria-current="true"`. Sticky at the top of its column; hide below `xl`.
