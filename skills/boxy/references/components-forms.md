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
  Square, obviously.
- Drag-over: `--bx-accent-soft` fill, 2px solid `--bx-accent` border.
- File rows after upload: 48px, 1px rules between them, a 16px file-type glyph, the
  name, a mono size, a 4px progress bar, and a ghost remove button.
- Errors attach to the individual row, not the drop zone.
