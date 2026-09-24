# Forms and flows

Field primitives live in `components-core.md`. This file covers assembly.

---

## Form layout

- **One column.** Two columns only for genuinely paired fields (city/postcode,
  first/last, expiry/CVC), and then in a collapsed grid so they share a rule.
- Field width should hint at expected input: postcode 96px, card expiry 80px, email
  full width. A 600px-wide input for a 4-digit code is a usability bug.
- Vertical gap between fields: `--bx-space-5` (24px), or 16px in compact forms.
- Group related fields under a mono label heading with a 1px `--bx-line` rule
  spanning the form width - a `<fieldset>` with a styled `<legend>`.
- Maximum form width 560px, or 480px for auth. Wider forms in a 1280px container
  look abandoned.

```html
<fieldset style="border: 0; padding: 0; margin: 0">
  <legend class="bx-label" style="inline-size: 100%; padding-block-end: 8px;
          border-block-end: 1px solid var(--bx-line); margin-block-end: 24px">
    Billing address
  </legend>
  <!-- fields -->
</fieldset>
```

## Labels and help text

- Label above the field, always. No floating labels - the animation and the
  mid-border positioning both fight the system.
- Label: 12px `--bx-ink` at 500 in `editorial`/`industrial`; the mono uppercase
  `.bx-label` in `blueprint`.
- Required: a `*` in `--bx-danger` after the label text, plus `required` on the
  input. Better still, mark the *optional* ones and say so once at the top.
- Helper text below at 12px `--bx-ink-subtle`. It is permanent - do not hide it in a
  tooltip.
- 4px between label and field, 4px between field and helper.

## Validation

- Validate on blur, never on every keystroke. Re-validate on input only after a
  field has already failed once.
- Error state: 2px `--bx-danger` border, `aria-invalid="true"`, and the message
  replacing the helper text in `--bx-ink-danger` at 12px with a 12px square warning
  glyph.
- Never rely on the border color alone - the message is mandatory.
- On submit failure, render a summary block above the form: 1px `--bx-danger` border,
  `--bx-danger-soft` fill, a count (`3 fields need attention`), and a list of links
  that move focus to each field. Move focus to this summary.
- Success: a square check in `--bx-ink-success` at the field's inline end. No green
  border, no confetti.

## Multi-step forms

Stepper across the top, in the boxiest possible form - a collapsed grid of equal
cells, one per step.

```
+-------------+-------------+-------------+
| 01 ACCOUNT  | 02 BILLING  | 03 REVIEW   |
+-------------+-------------+-------------+
  done          current       upcoming
```

- Cell: 56px tall, mono label, a 16px square step indicator at the start.
- Done: `--bx-surface-sunken`, a check glyph, `--bx-ink-muted`, clickable to go back.
- Current: `--bx-surface`, 2px `--bx-accent` bottom border, `--bx-ink` at 500.
- Upcoming: `--bx-surface-sunken`, `--bx-ink-faint`, not clickable.
- No connector lines or chevrons between cells - the shared borders are the connector.
- Below `md`, collapse to a single cell reading `STEP 2 OF 3 - BILLING` with a 4px
  progress bar beneath.
- Footer: 1px top rule, `Back` ghost at the start, `Continue` primary at the end,
  and a mono `Step 2 of 3` centered. Never lose entered data on `Back`.

## Settings pages

- Left nav of setting sections (sidebar pattern), content at 720px.
- Each setting is a row in a collapsed grid: label and description on the left
  (`1fr`), control on the right (`auto`), 24px padding, 1px rule between rows.
- Section heading: mono label on a `--bx-surface-sunken` strip with rules above and
  below, spanning the content width.
- Save behavior: pick one and be consistent. Either auto-save with a mono
  `SAVED 12:04:33` timestamp at the section header, or a sticky footer bar
  (`--bx-surface`, 1px top rule, 56px) that appears when the form is dirty with
  `Discard` and `Save changes`.
- Destructive settings go last in a "Danger zone" block: 1px `--bx-danger` border,
  a mono `DANGER ZONE` label on a `--bx-danger-soft` header strip, and danger-variant
  buttons. Require typing the resource name to confirm.

## Auth screens

- 400px-wide card, vertically centered, 1px `--bx-line`, `--bx-surface`, 32px padding.
- Canvas behind it: `--bx-surface-sunken`, plus the 32px grid substrate in
  `blueprint`.
- Wordmark above the card at 24px, or as a 32px square mark.
- Order: title (20/600), optional subtitle, SSO buttons (full-width secondary, in a
  shared-border stack), a `1px rule with a centered mono OR`, then the email/password
  fields, then the full-width primary submit.
- Footer link below the card in 14px, centered - the only centered text in the app.
- Never hide the "forgot password" link. Put it inline with the password label,
  right-aligned.
- Set `autocomplete` correctly (`username`, `current-password`, `new-password`,
  `one-time-code`) - it is a usability feature, not a nicety.
- 2FA code input: six 48px squares in a shared-border group, mono 20px centered, with
  auto-advance and paste-to-fill across all six.

## Command palette

The most Boxy-appropriate component there is.

- Triggered by `Cmd/Ctrl+K`, 640px wide, positioned 96px from the top - not centered.
- `--bx-surface-raised`, 1px `--bx-line-heavy`, `--bx-shadow-3`, over a scrim.
- Input row: 48px, no border, 16px text, a leading 16px glyph, a 1px bottom rule.
- Results: 40px rows, 12px padding-x, an 16px icon, the label, and a mono keyboard
  hint at the inline end. Selected row: `--bx-surface-active` with a 2px `--bx-accent`
  inset left border.
- Group headings: mono labels on 24px `--bx-surface-sunken` strips.
- Footer: 32px, `--bx-surface-sunken`, 1px top rule, mono key hints
  (`&uarr;&darr; navigate` - `&crarr; select` - `esc close`).
- Keyboard: arrows move, `Enter` runs, `Esc` closes, `Tab` does not escape the
  palette. `role="dialog"` with a `role="listbox"` result list and
  `aria-activedescendant`.
- Show recent commands when the query is empty; never show a blank panel.

## Search

- Inline search: 32px input with a leading 16px magnifier in `--bx-ink-subtle` and a
  trailing `Cmd K` mono hint in a 1px-bordered square.
- Debounce 200ms. Show a stepped loading indicator in the trailing slot, not a
  full-panel spinner.
- Results dropdown: `--bx-surface-raised`, 1px border, `--bx-shadow-2`, 40px rows,
  the matched substring wrapped in an inverted inline block rather than a colored
  highlight.
- Empty: `NO RESULTS FOR "query"` in mono, plus a suggestion to broaden.

## Upload

- Drop zone: a 160px block with a 1px **dashed** `--bx-line-strong` border - dashes
  are permitted here and only here, since they read as a placeholder cut line.
  Square, obviously. A compact 80px single-row variant sits above file tables.
- Build it as a `<label>` wrapping a real `<input type="file" multiple>` stretched
  invisibly over the zone: click, keyboard and screen readers work with no script,
  and `:focus-within` draws the focus ring on the zone.
- Content: a 32px upload glyph in `--bx-ink`, `Drop files here` in 500 `--bx-ink`
  with `browse` in `--bx-ink-accent`, and the constraints as a mono label
  (`PNG, PDF, CSV · UP TO 25 MB EACH`). State the limits before the upload, not after.
- Hover: border to `--bx-ink-subtle`, `--bx-surface-hover`.
- Drag-over: `--bx-accent-soft` fill, the border turns solid `--bx-accent` and a 1px
  inset accent ring makes it read as 2px without shifting layout.
- File list directly below, sharing the zone's border (no top border of its own):

| Part | Spec |
|---|---|
| Row | 48px min, grid `32px 1fr auto auto`, 1px `--bx-line-subtle` between rows |
| Type | a 32px bordered sunken square holding the extension in mono 10px uppercase |
| Name | 14px, one line, ellipsis |
| Meta | mono 11px tabular: size, then a 4px progress bar (max 160px) and percent while uploading |
| State | mono label: `UPLOADING`, `DONE` in `--bx-ink-success`, `FAILED` in `--bx-ink-danger` |
| Remove / cancel | 32px ghost icon button, labelled with the file name |

- Errors attach to the individual row: `--bx-danger-soft` fill, danger-bordered type
  square, and the reason in the meta line (`184 MB · exceeds the 25 MB limit`).
  Never reject a whole batch because one file failed.
- A background upload tray (bottom inline-end, 360px, floating surface) lists
  in-flight files while the user keeps working; it can be dismissed once all are done.

## Date picker

Typing is the primary input; the calendar assists. Never try to restyle the native
`<input type="date">` popup - it cannot be styled, and half the browsers ignore you.

- **Field**: a text input in mono tabular figures with the format as placeholder
  (`YYYY-MM-DD`, or the locale's format stated in helper text), joined to a square
  calendar icon button in one shared-border unit. Parse on blur; show the parsed date
  in the helper text when the input is ambiguous.
- **Calendar**: the floating surface (`components-overlays.md`), 12px padding.
  - Header: month and year at 14/600, then prev/next as 32px ghost icon buttons.
  - Grid: 7 columns of 36px square cells as a collapsed grid - 1px gap over
    `--bx-line-subtle`, so the calendar is literally a ruled table.
  - Weekday row: 24px, mono 10px uppercase on `--bx-surface-sunken`. Start the week
    on the locale's first day.
  - Day: mono 12px tabular. Outside-month days `--bx-ink-subtle` on
    `--bx-surface-sunken` (still text - never `--bx-ink-faint`). Today: a 1px inset
    `--bx-line-heavy` ring. Selected: `--bx-accent` fill, `--bx-on-accent` text.
    Disabled: `--bx-ink-faint` on sunken, `not-allowed`.
  - Footer: `Clear` (ghost) and `Today` (secondary).
- **Range**: presets first, as a list of radio menu items in a 168px column beside
  the grid (`Today`, `Last 7 days`, `Last 30 days`, `This month`, `This quarter`,
  separator, `Custom`). Nobody fights a grid for "last 30 days". The first click sets
  the start, the second the end (swapped if earlier); days between take
  `--bx-accent-soft`, both ends the accent fill. An `Apply` primary in the footer
  commits. The trigger shows the range in mono: `Sep 19 – Sep 25, 2026`.
- **Keyboard**: `role="grid"`, roving `tabindex` on the day buttons. Arrows move by
  day and week, `Home` / `End` to week start / end, `PageUp` / `PageDown` by month,
  `Enter` selects, `Esc` closes and returns focus to the field. Each day has a full
  `aria-label` (`Wed Oct 14 2026`); today gets `aria-current="date"`. The month title
  is `aria-live="polite"`.
- An inline (always-visible) calendar uses the same grid without the surface.

## Slider

For approximate values only - volume, sample rate, a rough size. **Always pair it
with a number field** bound to the same value; dragging to exactly 37 is a test of
motor control, not a form.

- Native `<input type="range">` with `appearance: none`.
- Track: 4px, 1px `--bx-line` border, `--bx-surface-sunken`; the filled part is
  `--bx-accent`, drawn as a hard-stop gradient at `var(--val)` (set from script on
  `input`). Style both `::-webkit-slider-runnable-track` and `::-moz-range-track`.
- Thumb: a **16px square**, `--bx-surface` with a 1px `--bx-line-heavy` border.
  Hover: accent border. Active: accent fill. The WebKit thumb needs
  `margin-top: calc(1px - 8px)` to centre on a bordered 4px track.
- Focus: the standard outline on the input, offset 4px.
- Scale: optional mono 10px labels under the ends and quarters; optional 1px x 4px
  ticks per step, inset 8px so they align with the thumb's centre at each end.
- Value: the paired field, or an `<output>` in mono at the label row's inline end.
- Disabled: sunken thumb, `--bx-line` border, `not-allowed`.
- A dual-thumb range slider cannot be built well from one native input. Use two
  number fields, or two overlaid range inputs with the pointer-events trick and
  both labelled - and prefer the fields.

## Number stepper

A shared-border group: `−` button, a 72px centred mono tabular input, `+` button,
each at the control height. Hide the native spinners. Respect `min` / `max` / `step`
and disable the button at a bound. The input stays typeable; the buttons have
`aria-label`s that name the field (`Increase replicas`).

## Segmented control

2-4 short, mutually exclusive options - a mode or a filter, not navigation.

- Native radios inside labels, visually hidden but stretched over each segment - so
  arrow keys, form values and screen-reader semantics come free. A `<fieldset>` with
  a visually hidden `<legend>`.
- Segments share borders (a 1px gap over `--bx-line`), 32px tall, 12px padding-x,
  12px/500 `--bx-ink-muted`.
- Checked: inverted (`--bx-surface-inverse` / `--bx-ink-inverse`). Not accent -
  that is reserved for the one primary action.
- Focus: the outline on the checked segment's visual box, raised above its
  neighbours with `z-index`.
- Icon-only segments need `aria-label` on the input.
- More than four options, or options that navigate to another page: tabs.

## Search field

A 32px input with a leading 16px magnifier (absolutely positioned 12px in,
`--bx-ink-subtle`), padding reserved for it (32px) and for a trailing key hint
(`Ctrl K` in a `.bx-kbd`, 8px in). The glyph and hint are `pointer-events: none`.
In a header it opens the command palette; in a list it filters in place with a
200ms debounce and an `aria-live` result count.

## Combobox (autocomplete)

A text input that filters a list. Use it past about 10 options, or when people know
what they are looking for; a plain select is better for a short, stable list.

- The field is `.bx-input` with a square toggle cell at the inline end (a 1px
  `--bx-line-subtle` rule, the chevron, `tabindex="-1"` - the input is the tab stop).
  The chevron turns 180deg while open.
- The listbox is the floating surface, at least as wide as the field, 264px max
  height, 4px block padding. Open it on typing, `ArrowDown`, or the toggle.
- **Focus stays in the input.** The highlighted option is `aria-activedescendant`;
  the input has `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded` and
  `aria-controls`. Render the listbox as a `popover="manual"` (top layer, but no
  light dismiss that would fight the input) and close it on outside `pointerdown`.
- Option: 32px, 12px padding-x, optional mono meta at the inline end. Highlighted:
  hover fill plus the 2px accent bar. Selected: 500 weight and a drawn check at the
  end. Disabled: `--bx-ink-faint`, not selectable, still visible.
- **The typed match** is wrapped in `<mark>` styled as an inverted inline block. Build
  it with text nodes - option labels are data, never `innerHTML`.
- Group labels are mono 10px strips; hide a label when nothing under it matches.
- No match: `NO RESULTS FOR "query"` in mono, in the list - never an empty surface.
- Re-position after every filter: the list's height changes, and positioning on the
  unfiltered height flips it above the field for no reason.
- Keys: `ArrowDown` / `ArrowUp` move, `Enter` takes, `Esc` closes (a second `Esc`
  may clear), typing filters. Selecting writes the label into the input and closes.

## Multi-select

The combobox, collecting several values as tags inside the field.

- The field is a wrapping box with the input's border, focus ring and hover - never
  a horizontally scrolling strip. Tags are standard square tags (28px) with a
  1px-ruled `x` cell; the inline input takes the remaining width (96px minimum).
- Options show a 16px square check box at the inline start (accent fill with a white
  drawn check when selected); the list stays open while choosing and clears the
  typed text after each pick.
- `Backspace` in the empty input removes the last tag. A ghost `x` at the end clears
  all. The label row states the count in mono (`3 SELECTED`, `aria-live`).
- `aria-multiselectable="true"` on the listbox; each tag's remove button is
  labelled with its value.
- Past about 8 selections, collapse the overflow into a `+5` tag that opens the list.

## Colour picker

For brand and theme settings - not a general paint tool.

- Trigger: a secondary button showing a 16px swatch (1px `--bx-line-strong` inset
  ring, so white and near-canvas colours stay visible) and the hex in mono.
- Popover (272px): a 160px saturation / brightness field (two flat gradients over the
  hue - never blurred), a hue strip (native range, square thumb), a hex input in mono
  uppercase, an eyedropper button only where `EyeDropper` exists, and swatches from
  the system's own ramps (8 across, 2px pressed ring, labelled).
- The field's thumb is a 12px square with a 2px white border and a 1px black outline,
  so it reads on any colour. The field is focusable (`role="slider"` with an
  `aria-valuetext` naming saturation and brightness) and moves with the arrows
  (`Shift` for bigger steps).
- **Show contrast.** A footer row with the ratio against the canvas and a tag -
  `AA TEXT`, `AA LARGE / UI`, `DECORATIVE ONLY` - in the matching semantic. In a
  design system the question is never only "which colour" but "can text sit on it".
- The linter flags raw hex outside the token file: wrap a picker's literal swatch
  values in `boxy-ignore-start` / `boxy-ignore-end`, which is what the comment is for.
