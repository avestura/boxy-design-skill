# Motion and depth

Motion in Boxy is **mechanical**: things switch state, they do not perform. Depth is
**geometric**: a line or a hard offset, never a soft glow.

---

## Duration

| Token | Value | Use |
|---|---|---|
| `--bx-dur-1` | 80ms | Color and border-color on hover, focus, tooltip fade |
| `--bx-dur-2` | 120ms | Default - background, opacity, small translate |
| `--bx-dur-3` | 160ms | Panels, drawers, modals, tab content |
| `--bx-dur-4` | 240ms | Scrim fade only. Nothing may exceed this. |

## Easing

| Token | Value | Use |
|---|---|---|
| `--bx-ease` | `linear` | Default. Color, opacity, anything under 120ms |
| `--bx-ease-sharp` | `cubic-bezier(0.2, 0, 0, 1)` | Entering elements, translate |
| `--bx-ease-step` | `steps(4, end)` | Loaders, tickers, pulses |

`linear` is the house easing. It reads as mechanical because it *is* mechanical - no
acceleration means no sense of weight or squish.

Banned: `ease-in-out` on anything under 200ms (it reads as mush), all overshoot and
spring curves, `cubic-bezier` values with a y outside 0-1.

## Animatable properties

**Allowed:** `opacity`, `background-color`, `border-color`, `color`, `fill`,
`stroke`, `transform: translate()` in whole pixels, `box-shadow` between two hard
offsets, `width`/`height` when a panel genuinely resizes.

**Banned:** `transform: scale()` on hover, `rotate` outside loaders and chevrons,
`filter`, `backdrop-filter`, `blur`, `letter-spacing`, `border-radius` (there is
nothing to animate).

Always name the properties. `transition: all` is a violation - it animates things you
did not intend, including layout.

```css
/* correct */
transition: background-color var(--bx-dur-1) var(--bx-ease),
            border-color var(--bx-dur-1) var(--bx-ease);

/* wrong */
transition: all 0.3s ease-in-out;
```

## Standard choreography

| Interaction | Animation |
|---|---|
| Button hover | `background-color` + `border-color`, 80ms linear |
| Input focus | `border-color` + inset shadow, 80ms linear |
| Row hover | `background-color`, 80ms linear |
| Dropdown / popover open | opacity 0->1, `translateY(-4px)->0`, 120ms sharp |
| Submenu open | opacity 0->1, 80ms linear, no translate |
| Tree group / chevron | chevron `rotate` 90deg, 120ms linear; children appear instantly |
| Streaming caret | opacity 1 <-> 0, 1s `steps(2, jump-none)`, infinite |
| Spinner | 4px square steps round a 16px box, 0.8s `steps(1, end)`, infinite |
| Modal open | scrim opacity 240ms linear; dialog opacity + `translateY(4px)->0`, 160ms sharp |
| Drawer | `translateX(100%)->0`, 160ms sharp |
| Toast enter | opacity + `translateX(8px)->0`, 160ms sharp |
| Toast exit | opacity 1->0, 120ms linear (no translate) |
| Tab switch | content opacity 0->1, 120ms linear. The indicator does not slide |
| Accordion | `grid-template-rows: 0fr -> 1fr`, 160ms sharp |
| Skeleton pulse | opacity 1 <-> 0.6, 1s `steps(4, end)`, infinite |

Exit animations are always shorter than entrances and never translate. Closing should
feel instant.

## Scroll behavior

Scroll-triggered reveals are permitted in `editorial` only, and only as: opacity
0->1 with `translateY(8px)->0`, 160ms sharp, 40ms stagger, triggered once at 20%
visibility. Never on above-the-fold content, never on repeat, never longer than 8px
of travel. Everything must be visible with JavaScript disabled.

No parallax. No scroll-jacking. No pinned horizontal sections.

## Reduced motion

`boxy.css` already neutralizes durations under `prefers-reduced-motion: reduce`. For
JS-driven animation, check explicitly:

```js
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

Under reduced motion, state changes still happen - they just happen immediately.
Never remove the state change itself, and keep color transitions (they are not
motion).

Loaders are the exception. The indeterminate progress bar, the spinner, skeletons
and the active checklist square keep animating under reduced motion, because a
frozen loader looks like a hang and the movement is the only sign that work is
still going. `boxy-components.css` restores their loop inside its own
`prefers-reduced-motion` block. A custom loader needs the same override, and should
stay small, stepped or opacity-only, never a large sweep across the screen.

---

## Depth

There are exactly four ways to express that one thing is above another. In order of
preference:

**1. A line.** `border: 1px solid var(--bx-line)`. Covers cards, panels, sections,
inputs - the large majority of cases.

**2. A surface step.** `--bx-surface-sunken` below, `--bx-surface` at rest,
`--bx-surface-raised` above. In dark mode raised surfaces are *lighter*; the role
tokens handle this.

**3. A hard offset shadow.** For genuinely floating layers only.

| Token | Value | Layer |
|---|---|---|
| `--bx-shadow-1` | `0 1px 0 0 var(--bx-line)` | Sticky header seam |
| `--bx-shadow-2` | `2px 2px 0 0 var(--bx-shadow-color)` | Dropdown, popover, tooltip, toast |
| `--bx-shadow-3` | `4px 4px 0 0 var(--bx-shadow-color)` | Modal, command palette |
| `--bx-shadow-6` | `8px 8px 0 0 var(--bx-shadow-color)` | Editorial feature card hover only |

The offset is always positive on both axes - down and toward the inline end - so the
implied light source is consistent across the whole interface. A floating element
always carries a 1px border in addition to its shadow; the shadow alone does not
define its edge.

**4. A scrim.** `--bx-scrim` over the page for modal layers. Fades over 240ms. Never
blurred.

### The blur rule

```css
/* all violations */
box-shadow: 0 4px 12px rgba(0,0,0,0.1);
box-shadow: 0 0 0 4px rgba(15,98,254,0.2);   /* soft focus glow */
backdrop-filter: blur(12px);
filter: drop-shadow(0 2px 4px #000);
text-shadow: 0 1px 2px rgba(0,0,0,0.2);
```

The third and fourth length values in `box-shadow` (blur and spread) must both be
`0`. A "focus glow" is replaced by the 2px offset outline; a glassmorphic panel is
replaced by a solid surface with a 1px border.

The one exception the system grants: `inset 0 0 0 Npx` rings, where blur is still `0`
and the shadow is being used as a border that does not affect layout.
