# Agent and chat interfaces

Chat UIs for AI agents are where the generic look is strongest: rounded bubbles,
left/right alignment, a gradient avatar, a sparkle icon. Boxy treats a conversation
as what it is for an agent - a **transcript and a log** - and gets its character from
mono metadata, ruled tool calls and a hard block cursor.

---

## Layout

```
| sessions 232px | transcript 1fr (thread max 720px) | plan & context 272px |
|                | top bar: breadcrumb, branch, status |                      |
|                | messages (scroll)                   |                      |
|                | composer (1px top rule)             |                      |
```

- Session list: the tree/sidebar pattern (`components-navigation.md`), grouped by
  mono date headings (`TODAY`, `PREVIOUS 7 DAYS`). A running session shows the
  stepped spinner, finished ones a status square.
- Thread column capped at 720px and left-aligned within its column. A 32px grid
  substrate behind it is allowed in `blueprint`.
- The right panel is optional: the agent's plan, files changed, context usage, cost.

## Messages

**Both roles are left-aligned.** A two-column grid per turn - a 24px square avatar
(user initials; the agent uses the inverse variant, labelled `AI`) and the body.

| Part | Spec |
|---|---|
| Who row | 24px tall, mono label (`JO RIVERA`, `AGENT`) plus time and model in mono |
| User turn | body in a block: `--bx-surface-sunken`, 1px `--bx-line`, 12px/16px padding |
| Agent turn | plain text on the canvas, no container - prose is the product |
| Body text | 14px / 20px `--bx-ink`, paragraphs capped at 68ch |
| Gap between turns | 32px |
| Turn actions | 32px ghost icon buttons below the agent's turn: copy, retry, feedback |

No bubbles, no tails, no right-aligned user column, no alternating tints.

### Streaming

- A solid 8px-wide block caret at the end of the text, the height of a line,
  blinking on `steps(2, jump-none)` over 1s. No smooth fade.
- Append text as it arrives; do not animate each token.
- Keep the scroll pinned to the bottom only if the user was already at the bottom.
- Under reduced motion, render the whole reply at once and drop the blink.
- `aria-live="polite"` on the thread, but announce the finished message, not every
  token (buffer, or set `aria-busy="true"` while streaming).

## Tool calls

A tool call reads like a log line and expands to its detail. Consecutive calls sit in
one bordered group with 1px `--bx-line-subtle` rules between them, and an optional
header strip: `4 TOOL CALLS ... 5.4s`.

```
+-- 4 TOOL CALLS ------------------------------------------ 5.4s --+
| [#] grep       "send(" src/webhooks                    0.2s   v  |
| [#] read_file  src/webhooks/send.ts                    0.1s   v  |
| [#] run        MOCK_COLD=1 npm test -- webhooks        4.8s   ^  |
|   INPUT   { "command": "...", "timeout": 60 }                    |
|   OUTPUT  exit 1                                                  |
|   FAIL  webhooks/send.test.ts ...                                 |
+------------------------------------------------------------------+
```

| Part | Spec |
|---|---|
| Row | `<details>` / `<summary>`, 36px, grid `16px auto 1fr auto 8px`, mono 12px |
| Status | an 8px square: `--bx-success` done, `--bx-danger` failed, hollow `--bx-warning` ring waiting on approval, the 12px stepped spinner while running |
| Name | `--bx-ink`, 500 |
| Arguments | the most identifying argument only, `--bx-ink-subtle`, truncated with an ellipsis |
| Duration | mono 11px tabular, `--bx-ink-subtle` |
| Body | sections labelled with mono labels (`INPUT`, `OUTPUT · EXIT 1`), each a `<pre>` at 11px, separated by 1px `--bx-line-subtle` rules, scrolling horizontally |

- Collapsed by default. Open a failed call automatically, and the one the agent's
  next sentence refers to.
- A file edit shows its diff as a proper diff block (`components-content.md`) in the
  agent's turn, not only inside the tool body.
- Never hide that a tool ran. The user must be able to audit every action.

## Reasoning

A `<details>` whose summary is a mono label - `+ THOUGHT FOR 9S` - collapsed by
default. The body hangs off a 1px `--bx-line` rule, 12px `--bx-ink-muted`. It is the
quietest thing in the thread.

## Approval requests

The one place the agent stops for the human, and the only warning colour on screen.

- A block with a 1px `--bx-warning` border, 3px on the inline start, `--bx-surface`
  body; the footer strip is `--bx-warning-soft`.
- Head: a warning status square plus a plain statement of what it wants to do and
  why it needs permission (`writes to the working tree`).
- Body: the **exact** command or change in a mono block. Never a paraphrase.
- Footer: when it was asked, and the decision as a shared-border group ordered
  `Deny`, `Always allow`, `Allow once` - the most specific, least permanent choice is
  the filled (`--bx-btn--contrast`) one. Do not use the accent primary here: the
  primary action of the page is still the composer's send.
- Once decided, collapse it to one line recording the decision and who made it.

## Citations

A 16px square mono index (`1`) with a 1px `--bx-line-strong` border, set inline at
text-top, linking to its source; hover turns the border accent. List the sources
after the message as a ruled ordered list. Never superscript-only numbers - they are
too small to hit.

## Plan

The agent's task list uses the checklist states in `components-content.md`
(`done`, `active`, `pending`), with a step bar above it (`components-data.md`) and a
mono `3 / 5` count in the panel header.

## Composer

One bordered box: attachments, textarea, toolbar.

| Part | Spec |
|---|---|
| Box | 1px `--bx-line-strong`; focus-within: `--bx-accent` border plus a 1px inset accent ring |
| Attachments | removable square tags above the textarea (a 1px-ruled `x` cell at the end) |
| Textarea | borderless, 14px, 64px min, grows to 240px then scrolls, no resize handle |
| Toolbar | 1px `--bx-line-subtle` top rule: attach (ghost icon), model picker (ghost button opening a radio menu), spacer, a mono key hint (`↵ send · ⇧↵ newline`), and the send button |
| Send | the view's one primary: a 32px square accent icon button. Becomes a `Stop` (secondary, square glyph) while streaming |
| Context meter | optional: a segmented meter (`components-data.md`) showing tokens used against the window, turning warning past 80% |

`Enter` sends, `Shift+Enter` inserts a newline, and `/` opens a command menu anchored
to the composer. The composer is a `<form>`; the textarea has a real (visually
hidden) `<label>`.
