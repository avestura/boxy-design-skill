# Accessibility

Target: **WCAG 2.2 AA**, documented as guidance rather than enforced by the checker.
The token defaults already satisfy most of it - the failures come from overriding
them.

Where Boxy differs from a typical system, it usually helps: hard 2px focus outlines
are more visible than soft glows, 1px borders give controls real perceivable
boundaries, and tabular mono figures are easier to scan.

---

## Contrast

Verified pairs are listed in `color.md`. The short version:

| Content | Minimum | Use |
|---|---|---|
| Body text, labels under 18px | 4.5:1 | `--bx-ink`, `--bx-ink-muted`, `--bx-ink-subtle` |
| Large text (24px+, or 18.66px bold) | 3:1 | Any of the above |
| UI component boundaries conveying state | 3:1 | `--bx-line-strong`, `--bx-line-accent`, semantics |
| Decorative rules, disabled elements | none | `--bx-line`, `--bx-line-subtle`, `--bx-ink-faint` |

Watch out for:
- `--bx-ink-faint` (3.6:1) is **not** for text. It is for disabled controls and
  decorative glyphs.
- `--bx-line` at 1.6:1 is a decorative rule. A border that means something - focus,
  error, selected - must use `--bx-line-strong` or better.
- Inside an inverted block, re-check everything. Use the `.bx-inverse` scope, which
  remaps ink, line and focus to their inverse counterparts; plain `--bx-accent` on a
  dark block is only 2.5:1.
- `--bx-warning` `#f1c21b` as text on white is 1.7:1. Use `--bx-ink-warning`.
- The grid substrate reduces effective contrast slightly. Keep it at or below 8% and
  never put 12px text directly on it.

## Focus

Never remove the outline. `boxy.css` sets:

```css
:focus-visible {
  outline: 2px solid var(--bx-focus);
  outline-offset: 2px;
}
```

- The 2px offset means the ring sits clear of the element's own 1px border, so both
  stay legible.
- On inverse surfaces the `.bx-inverse` scope already sets
  `--bx-focus: var(--bx-focus-inverse)`, so the ring stays visible.
- On an accent-filled button, the ring needs separation from the fill - keep the 2px
  offset and, if the surrounding surface is also accent-colored, add a 1px
  `--bx-canvas` inner ring via `box-shadow`.
- Focus must never be clipped. Containers with `overflow: hidden` that touch focusable
  children need `overflow: visible` or padding equal to the ring plus offset (4px).
- **Focus is never the only indicator of state.** Selected, active, and current are
  separate treatments.

## Targets

WCAG 2.2 sets 24x24 CSS px as the AA minimum (2.5.8) with spacing exceptions; 44x44
is the AAA bar and the better default on touch.

| Context | Control size |
|---|---|
| Desktop, pointer | `--bx-control-sm` 32px, or 24px in compact tables |
| Touch / coarse pointer | `--bx-control-lg` 48px |
| Icon-only button | Square at the control height; expand the hit area with padding, not with a bigger glyph |

```css
@media (pointer: coarse) {
  :root { --bx-control-sm: 40px; --bx-control-md: 48px; --bx-control-lg: 56px; }
}
```

Compact density at 24px is below the AA minimum, so it needs the 2.5.8 spacing
exception - keep at least 24px of clear space around each target, and do not ship
compact as the default on touch.

## Keyboard

Every interactive element must be reachable and operable without a mouse.

| Component | Behavior |
|---|---|
| Tabs | Arrows move, `Home`/`End` jump, `Tab` exits to the panel |
| Modal | Focus trapped, `Esc` closes, focus returns to the trigger, background `inert` |
| Dropdown / listbox | `Enter`/`Space`/`Down` opens, arrows move, `Enter` selects, `Esc` closes, focus returns |
| Command palette | Arrows move, `Enter` runs, `Esc` closes, `Tab` stays inside |
| Data table | `Tab` reaches row actions; row actions revealed on hover must also appear on `:focus-within` |
| Toast with an action | Reachable via `F6` or a landmark; never auto-dismiss it |
| Drawer | Same rules as modal |
| Menu | Arrows move and wrap, `Home`/`End`, type-ahead, `Right` opens a submenu, `Left`/`Esc` closes it, `Tab` closes the menu |
| Context menu | `Shift+F10` and the Menu key open it at the focused row; every item is also reachable from a visible overflow button |
| Popover | Focus moves in on open, `Esc` and outside click close, focus returns to the trigger |
| Tree navigation | Native `<details>`/`<summary>`: `Enter`/`Space` toggles a group; `aria-current="page"` on the current link |
| Accordion | Native `<details>`; focus ring inset so neighbours do not clip it |
| Calendar | `role="grid"`, roving tabindex, arrows by day/week, `PageUp`/`PageDown` by month, `Home`/`End` week bounds |
| Slider | Native range input; arrows step, `PageUp`/`PageDown` jump; always a bound number field beside it |
| Segmented control | Native radios: arrows move and select |
| Chart | Focusable; `Left`/`Right` step the readout; a `.bx-sr` data table follows it |

**Finding "the first focusable element" in script:** use
`a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]),
textarea:not([disabled]), [tabindex]:not([tabindex="-1"])`. Never a bare `[href]` -
an inline SVG icon's `<use href="#i-x">` matches it, usually comes first, and cannot
take focus, so the dialog opens with focus nowhere and the trap leaks.

Provide a skip link as the first focusable element: visually hidden, appearing as a
standard bordered block at the top-left on focus.

DOM order must match visual order. Never reorder with `order` or `grid-row` in a way
that breaks the tab sequence.

## Semantics

- Real elements first: `<button>`, `<a href>`, `<input>`, `<table>`, `<nav>`,
  `<dialog>`. Add ARIA only when the native element cannot do the job.
- A clickable card: put the `<a>` on the title and expand its hit area with a
  pseudo-element covering the card. Do not attach a click handler to a `<div>`.
- Landmarks on every page: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`,
  and `aria-label` on each when there are several of a kind.
- One `<h1>` per page, no skipped heading levels.
- Icon-only buttons need an accessible name (`aria-label`) and their tooltip should
  use `aria-describedby`, not carry the only name.
- `aria-live="polite"` for search results, filter counts, and save confirmations;
  `role="alert"` for errors.
- Decorative marks - corner ticks, dimension lines, grid substrates, hatch fills -
  all get `aria-hidden="true"`.

## Forms

- Every input has a real `<label for>`. Placeholder text is not a label, and a
  placeholder that disappears on input is a failure.
- Group radios and checkboxes in a `<fieldset>` with a `<legend>`.
- Errors: `aria-invalid="true"`, a message linked via `aria-describedby`, and a
  focus-moving summary on submit failure.
- `autocomplete` on every identity, address, and payment field.
- Never restrict paste.

## Motion and preferences

- `prefers-reduced-motion: reduce` is honored globally in `boxy.css`; check it
  explicitly in JavaScript animation.
- `prefers-color-scheme` is honored by default; a manual `data-theme` override always
  wins.
- `prefers-contrast: more` - raise `--bx-line` to `--bx-line-strong` and
  `--bx-ink-subtle` to `--bx-ink-muted`:

```css
@media (prefers-contrast: more) {
  :root { --bx-line: var(--bx-n-500); --bx-ink-subtle: var(--bx-n-700); }
}
```

- Forced-colors / Windows High Contrast: the system leans on borders, so it survives
  well. Add `forced-color-adjust: none` only where you must, and test that focus
  outlines still appear (`outline` is preserved; `box-shadow` is not).

## Checks before shipping

1. Tab through the entire page. Every stop is visible; nothing is trapped.
2. Toggle both themes and re-check text contrast.
3. Zoom to 200% - no horizontal scroll, no clipped content.
4. Run axe or Lighthouse; resolve every violation.
5. Confirm no information is conveyed by color alone.
6. Screen-reader pass on the primary flow with NVDA or VoiceOver.
