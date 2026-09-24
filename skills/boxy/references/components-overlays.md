# Overlays: menus, context menus, popovers, drawers

Everything that floats above the page shares one contract. Get the contract right
once and every menu, popover and calendar in the product looks like it came from the
same hand.

---

## The floating surface

| Property | Value |
|---|---|
| Background | `--bx-surface-raised` |
| Border | 1px `--bx-line-heavy` - the edge is the line, not the shadow |
| Shadow | `--bx-shadow-2` (`2px 2px 0 0`), never blurred |
| Radius | 0 |
| z-index | 20 (see the scale in `layout.md`) |
| Offset from trigger | 4px |
| Enter | opacity 0 -> 1 and `translateY(-4px) -> 0`, 120ms `--bx-ease-sharp` |
| Exit | instant, or opacity over 80ms. Never translate on exit |

**Render it with the native `popover` attribute.** It puts the surface in the top
layer (never clipped by an `overflow: hidden` ancestor, never fighting z-index), and
gives Esc and outside-click dismissal plus focus return for free. The trigger is a
real `<button popovertarget="id">`.

```css
.bx-float {
  position: fixed; z-index: 20; margin: 0; padding: 0; inset: auto;
  color: var(--bx-ink);
  background: var(--bx-surface-raised);
  border: var(--bx-border) solid var(--bx-line-heavy);
  box-shadow: var(--bx-shadow-2);
  overflow: visible;                    /* submenus hang outside it */
}
.bx-float:popover-open { animation: bx-drop var(--bx-dur-2) var(--bx-ease-sharp); }
@keyframes bx-drop { from { opacity: 0; transform: translateY(-4px); } }
```

Keep `:popover-open` in its own rule - a browser that does not know the selector
drops the whole rule, including anything grouped with it.

**A floating layer is a raised scope.** In dark mode `--bx-surface-hover` is the same
value as `--bx-surface-raised`, so an ordinary hover fill vanishes on a menu. Remap
inside every floating layer (menus, popovers, dialogs, drawers, toasts):

```css
.bx-float, .bx-dialog, .bx-drawer, .bx-toast {
  --bx-surface: var(--bx-surface-raised);        /* controls blend with the layer */
  --bx-surface-hover: var(--bx-surface-active);  /* hover is one visible step up  */
}
```

**Positioning.** Below the trigger, aligned to its inline start. Flip to the other
side of whichever viewport edge it would cross, and keep 8px from every edge. CSS
anchor positioning does this declaratively where supported; otherwise measure the
trigger's `getBoundingClientRect()` on the popover's `toggle` event (it does not
bubble - listen in the capture phase). When several triggers open one popover (a
row menu shared by every row), remember which trigger was clicked and position
against that one.

---

## Menu

A list of commands. Not a navigation - links between pages belong in a nav.

| Part | Spec |
|---|---|
| Container | `min-width: 216px`, `padding: 4px 0` - set **both** axes: a `<ul>` brings 40px of inline padding, and a nested menu that keeps it looks randomly indented |
| Item | 32px tall, 12px padding-x, 14px `--bx-ink`, 12px icon gap, full-bleed |
| Icon | 16px, 1.5px stroke, `--bx-ink-subtle` at rest, `--bx-ink` when the item is highlighted |
| Shortcut hint | mono 11px `--bx-ink-subtle`, at the inline end, 32px clear of the label |
| Highlight (pointer or keyboard) | the raised scope's hover fill (`--bx-surface-active`), 80ms |
| Keyboard focus | the highlight plus a 2px accent bar on the inline start - the command palette's selected-row mark - instead of an outline, which would poke past the surface edge |
| Pressed | `--bx-surface-active` |
| Head / foot strip | optional: `--bx-surface-sunken`, 12px padding, a 1px `--bx-line-subtle` rule, flush to the surface edge - for an account menu's avatar, name and email, or a key legend |
| Separator | 1px `--bx-line-subtle`, 4px margin above and below. Separate groups, not items |
| Group label | mono 10px uppercase, 24px row, `--bx-ink-subtle` |
| Disabled | `--bx-ink-faint`, no hover fill, still in the tab order only if it explains why (a hint like `locked`) |
| Destructive | `--bx-ink-danger` text and icon, `--bx-danger-soft` highlight, a `--bx-danger` focus bar. Last in the menu, after a separator, with `...` when it opens a confirm |

**Checkable items** (`role="menuitemcheckbox"` / `menuitemradio`) reserve a 16px
glyph slot at the inline start whether checked or not, so labels stay aligned. The
check is a drawn stroke (an SVG mask), the radio mark a 6px square. A checkbox item
toggles without closing the menu; a radio item in a picker closes it and updates the
trigger's label.

```html
<button class="bx-btn" popovertarget="m-actions" aria-haspopup="menu" aria-expanded="false">Actions</button>
<ul class="bx-float bx-menu" id="m-actions" popover role="menu" aria-label="Actions">
  <li role="none"><button class="bx-menu__item" role="menuitem">
    <svg class="bx-menu__icon" aria-hidden="true">...</svg>Duplicate<span class="bx-menu__hint">Ctrl D</span>
  </button></li>
  <li role="separator" class="bx-menu__sep"></li>
  <li role="none"><button class="bx-menu__item bx-menu__item--danger" role="menuitem">Delete...</button></li>
</ul>
```

### Submenu

- Trigger: `aria-haspopup="menu"`, `aria-expanded`, a 6px chevron at the inline end
  drawn from two borders (rotated 45deg - chevrons are the one rotation allowed).
- The child menu is absolutely positioned with `inset-inline-start: 100%` and
  `inset-block-start: calc(-4px - 1px)` - that is, hung **flush** off the parent's
  inline-end rule so the two 1px borders land on the same pixel column and read as
  one line, and its first item aligns with the trigger. Never leave a gap between
  parent and child, and never overlap them.
- Opens on hover and on `ArrowRight` / `Enter`; `ArrowLeft` or `Esc` closes it and
  returns focus to its trigger. Drive hover and keyboard through the same
  `aria-expanded` state (never a CSS `:hover` rule) so the two can never disagree,
  and keep the trigger filled while its child is open.
- **Focus follows the pointer.** Hovering an item focuses it, so there is only ever
  one highlighted item and the keyboard carries on from where the mouse left off.
- **Hover intent.** Open a submenu 80ms after its trigger is hovered; close an open
  one 200ms after the pointer settles on a sibling, and cancel that close if the
  pointer reaches the submenu. Without it, cutting diagonally from the trigger into
  the submenu crosses a sibling and snaps the submenu shut.
- If the child would leave the viewport, flip it to the other side of the parent
  (`inset-inline-end: 100%`) - the borders still coincide.
- Two levels of submenu is the ceiling. A third level means the information
  architecture is wrong - use a dialog or a picker.

### Keyboard

| Key | Action |
|---|---|
| `Enter` / `Space` / `ArrowDown` on trigger | Open, focus first item |
| `ArrowDown` / `ArrowUp` | Next / previous item, wrapping |
| `Home` / `End` | First / last item |
| A printable character | Jump to the next item starting with it |
| `ArrowRight` | Open submenu |
| `ArrowLeft` | Close submenu |
| `Esc` | Close, return focus to the trigger |
| `Tab` | Close and move on - menus are not focus traps |

### Split button

A primary action plus a chevron that opens its variants, as a shared-border
`.bx-btn-group`. Both halves take the same variant; the chevron half is square.

---

## Context menu

The same menu surface, opened at the pointer by `contextmenu`.

- Position the top-left corner at the pointer, then flip against the viewport edges.
- Mark the row it acts on (`aria-selected="true"` or the selected-row treatment) while
  the menu is open, so it is unambiguous what "Delete" will delete.
- **Keyboard parity is mandatory:** `Shift+F10` and the `ContextMenu` key open it at
  the focused element. Rows that have a context menu need `tabindex="0"`.
- **Never the only path.** Every command in a context menu must also be reachable
  from a visible control - usually a trailing `...` overflow button on the row that
  opens the very same menu. Touch users and most keyboard users will never find a
  right-click.
- Only intercept `contextmenu` inside the region that owns it. Hijacking it on text
  or on the whole page breaks copy, spellcheck and the browser's own tools.

---

## Popover

Interactive content anchored to a trigger: a share panel, a filter form, a rich
explanation. If it has no interactive content, it is a tooltip.

| Part | Spec |
|---|---|
| Width | 320px default, never wider than `100vw - 32px` |
| Header | optional, 40px, title 14/600, ghost close button, 1px `--bx-line` rule |
| Body | 16px padding |
| Footer | optional, `--bx-surface-sunken`, 1px `--bx-line-subtle` top rule, right-aligned buttons |

- `role="dialog"` with `aria-labelledby`; move focus into it on open.
- Light dismiss (Esc, outside click) is correct for popovers. If losing its contents
  would lose work, it is a modal.
- No arrow or caret. The 4px offset and the heavy border make the relationship clear.

---

## Drawer

A modal panel from the inline end.

- 400px (`min(400px, 100vw)`), full height, `--bx-surface-raised`, 1px
  `--bx-line-heavy` on the inline-start edge. No shadow - it would point off-screen.
- Header 56px with title and close, body scrolls, footer 1px top rule on
  `--bx-surface-sunken` with the actions in a shared-border group.
- Enter: `translateX(100%) -> 0`, 160ms sharp, over the standard scrim. Exit instantly.
- Same behavioural contract as a modal: focus trapped, `Esc` closes, focus returns,
  background `inert`, `role="dialog"` + `aria-modal="true"`.
- Use it for detail-on-the-side (inspect a row, edit a record) where the list behind
  still gives context. For a decision, use a modal.

---

## Tooltip vs popover vs menu vs drawer

| Content | Use |
|---|---|
| A short label for an icon, no interaction | Tooltip (`components-core.md`) |
| A list of commands | Menu |
| Commands on a specific object, found by right-click | Context menu + a visible overflow menu |
| Form controls or rich content tied to a trigger | Popover |
| A record's details beside the list | Drawer |
| A decision that blocks everything else | Modal |

---

## Notification inbox

A bell in the top bar and a popover listing what needs attention.

- **Bell**: an icon button (`i-bell`). The count is a 16px square badge in the top-end
  corner - `--bx-accent` with `--bx-on-accent` mono 10px figures, `9+` past nine,
  hidden at zero. The button's `aria-label` carries the count
  (`Notifications, 3 unread`).
- **Popover**: 400px, the floating surface. Header: title, unread count as a mono
  label, `Mark all read` ghost. Underline tabs `All` / `Unread` / `Mentions` filter
  in place. A list scrolling at 400px with sticky mono day headings on sunken strips.
  Footer on sunken: `View all` and a settings icon button.
- **Item**: grid `32px 1fr auto` - an avatar or a 32px bordered icon square (semantic
  for alerts), the text at 12px with actors and objects in 600 `--bx-ink`, and a mono
  timestamp. Optional inline actions (`Acknowledge`, `Review`) as small buttons.
- **Unread**: a 6px accent square at the inline start and the text in `--bx-ink`.
  Read items fall back to `--bx-ink-muted`. Never tint the whole row - a list of
  tinted rows is a list of equally loud rows.
- Opening an item marks it read. Items are focusable; `Enter` activates.
- A full inbox page uses the same item anatomy in a two-pane layout (list and
  detail), with the filters as a segmented control.
