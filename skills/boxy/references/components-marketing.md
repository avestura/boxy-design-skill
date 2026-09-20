# Marketing and landing components

Mostly `editorial` mode. The challenge here is warmth without roundness: the answer
is whitespace, big type, and a single inverted block - never gradients or soft
shadows.

---

## Hero

Two layouts. Pick by whether you have a strong product visual.

**Stacked** (no visual, or visual below): eyebrow, h1 at `--bx-text-6xl` capped at
16ch, lead paragraph at 18px capped at 56ch, action group, then a full-bleed 1px rule
and the product shot below it.

**Split**: 7/5 columns with a 1px vertical rule between them. Copy on the left,
product surface on the right, bleeding off the right edge of the container so the
rail crops it - this reads as deliberate framing rather than a floating screenshot.

```html
<section class="bx-section">
  <div class="bx-container" style="display: grid; grid-template-columns: 7fr 5fr;
              gap: 0; align-items: center">
    <div style="padding-inline-end: 64px">
      <p class="bx-label">Infrastructure</p>
      <h1 style="font-size: clamp(2rem, 1.2rem + 4vw, 4.5rem); line-height: 1;
                 letter-spacing: -0.03em; max-width: 14ch; margin-top: 24px">
        Ship faster on hardware you never think about
      </h1>
      <p style="font-size: var(--bx-text-lg); color: var(--bx-ink-muted);
                max-width: 52ch; margin-top: 24px">
        Deploy to 310 edge locations with a single command.
      </p>
      <div class="bx-btn-group" style="margin-top: 40px">
        <a class="bx-btn bx-btn--primary bx-btn--lg" href="#">Start building</a>
        <a class="bx-btn bx-btn--lg" href="#">Read the docs</a>
      </div>
      <p class="bx-label" style="margin-top: 24px">
        No credit card &middot; 4,000 free builds
      </p>
    </div>
    <div style="border-inline-start: 1px solid var(--bx-line); padding-inline-start: 64px">
      <!-- product surface -->
    </div>
  </div>
</section>
```

Rules:
- Never center-align a split hero's copy.
- Maximum two actions. Primary solid, secondary outline, in a shared-border group.
- The trust line under the actions is a mono label, not body text.
- No background image behind hero text. If you need texture, use the 32px grid
  substrate at 5% and keep the text on a solid block.

---

## Feature grid

The single most important editorial pattern: a collapsed grid so the whole section
reads as one ruled table.

```html
<section class="bx-section">
  <div class="bx-container">
    <p class="bx-label">02 / Platform</p>
    <h2 style="margin-top: 12px; max-width: 20ch">Everything the team needs</h2>
    <div class="bx-collapse" style="grid-template-columns: repeat(3, 1fr); margin-top: 64px">
      <div style="padding: 40px 32px">
        <svg width="20" height="20" stroke="currentColor" fill="none" stroke-width="1.5"
             style="color: var(--bx-ink)" aria-hidden="true"><!-- icon --></svg>
        <h3 style="margin-top: 24px; font-size: var(--bx-text-xl)">Instant rollback</h3>
        <p style="margin-top: 12px; color: var(--bx-ink-muted); font-size: var(--bx-text-base)">
          Every deploy is immutable and addressable. Roll back in under a second.
        </p>
        <a href="#" style="display: inline-block; margin-top: 20px;
                           font-size: var(--bx-text-base); font-weight: 500">
          Learn more &rarr;
        </a>
      </div>
      <!-- 5 more cells -->
    </div>
  </div>
</section>
```

- 3 columns at `lg`, 2 at `md`, 1 at `sm`. Keep the 1px gap at every breakpoint.
- Cell padding 32-40px. All cells equal height - the grid handles it.
- Icons: 20px, 1.5px stroke, `--bx-ink` (not accent). Line icons only, never filled,
  never colored, never emoji.
- Optionally number the cells with a mono `01`-`06` in `--bx-ink-faint` at the top
  right of each cell. Very on-brand for `blueprint`.
- One asymmetric cell (spanning 2 columns, holding a visual) is allowed per grid to
  break the rhythm.

---

## Logo wall

- Mono uppercase label above: `TRUSTED BY TEAMS AT`.
- Logos in a collapsed grid, 6 across at `lg`, 3 at `sm`, each cell 96px tall with
  the logo centered at 24px height.
- Render logos in `--bx-ink-muted` monochrome via `filter: grayscale(1)` plus
  reduced opacity, going full-color on hover only if the brands permit it.
  Monochrome is the more disciplined default.
- Never scroll them in an infinite marquee.

---

## Pricing

A collapsed grid of 3-4 columns - literally a table, which is the honest form.

Per column:
1. Plan name (mono label) and price. Price at `--bx-text-4xl` mono tabular, the
   `/month` in 14px `--bx-ink-subtle`.
2. One-line positioning statement, `--bx-ink-muted`, 40px min-height so the CTAs
   align across columns.
3. A full-width CTA button. Only the recommended plan gets the primary variant.
4. A 1px `--bx-line-subtle` rule, then the feature list: 32px rows, a 16px check
   glyph in `--bx-ink` (not green), 14px text. Absent features get a 16px dash in
   `--bx-ink-faint`, never a red X.

The recommended plan is marked by inverting its header block
(`--bx-surface-inverse`) and adding a mono `RECOMMENDED` label - not by scaling the
card up, not by a colored glow.

For more than four plans or many features, use a real comparison table with a sticky
header row, per `components-data.md`.

---

## CTA band

The one inverted block per page.

```html
<section style="background: var(--bx-surface-inverse); color: var(--bx-ink-inverse);
                border-block: 1px solid var(--bx-line-heavy)">
  <div class="bx-container" style="padding-block: 96px; display: flex;
              justify-content: space-between; align-items: center; gap: 48px">
    <div>
      <h2 style="font-size: var(--bx-text-3xl); max-width: 20ch">
        Start shipping in under five minutes
      </h2>
      <p style="margin-top: 12px; color: var(--bx-n-400); max-width: 48ch">
        Free for personal projects. No credit card required.
      </p>
    </div>
    <div class="bx-btn-group" style="background: var(--bx-n-700); flex-shrink: 0">
      <a class="bx-btn bx-btn--lg" style="background: var(--bx-n-0);
         color: var(--bx-n-900); border: 0" href="#">Create account</a>
      <a class="bx-btn bx-btn--lg" style="background: transparent;
         color: var(--bx-ink-inverse); border: 0" href="#">Talk to us</a>
    </div>
  </div>
</section>
```

Inside an inverted block, re-check contrast: body text should be `--bx-n-400` or
lighter on `--bx-n-900`, and the accent blue is too dark - use white or
`--bx-a-300` for links.

---

## Footer

- Full-bleed 1px `--bx-line` top rule, `--bx-surface-sunken`, 64px block padding.
- A collapsed grid: 4-5 link columns plus a wider brand cell. Column headings are
  mono labels; links are 14px `--bx-ink-muted` in a 28px-tall stack.
- Bottom bar separated by a 1px rule: copyright, legal links, locale and theme
  selectors, and a mono build string (`v2.14.0 - build 8f3a1c`) at the inline end.
  That build string is a small, very on-brand detail.
- Status indicator: an 8px square in `--bx-success` plus `ALL SYSTEMS OPERATIONAL`
  in mono, linking to the status page.

---

## Docs layout

Three columns, separated by 1px rules, no shadows anywhere.

```
| sidebar 256px | content 1fr (prose 68ch) | on-this-page 224px |
```

- Sidebar: per `components-core.md`. Section headings as mono labels on sunken
  strips; the active page gets a 2px accent inset left border.
- Content: `--bx-container-prose`, 16px body, 32px top margin on h2 with a 1px rule
  above it, 24px on h3.
- Code blocks: `--bx-surface-sunken`, 1px `--bx-line`, 16px padding, 13px mono,
  a 32px header strip with the language as a mono label and a copy button at the end.
  Square, no radius, no traffic-light dots.
- Callouts: 1px border with a 3px semantic left border, mono uppercase kind label,
  per `color.md`.
- On-this-page: mono labels, 24px rows, 2px accent left border on the active
  heading, tracked with an intersection observer.
- Search: a 32px input in the header opening the command palette
  (`components-forms.md`).

---

## Changelog

An excellent fit for the aesthetic. A two-column layout: a 160px left column holding
a mono date and version tag, sticky as you scroll the entry; the entry body on the
right. A 1px `--bx-line` rule between entries, full-bleed. Tag each entry with square
`ADDED` / `FIXED` / `BREAKING` labels in their semantic colors.
