# Typography

Type carries the hierarchy in Boxy, because color is rationed and decoration is
banned. Get the type right and the rest follows.

## The three families

| Role | Family | Fallback stack |
|---|---|---|
| UI and body | **Inter** | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| Display | **Inter Tight** | `Inter, ui-sans-serif, system-ui, sans-serif` |
| Labels, data, code | **JetBrains Mono** | `"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` |

All three are free and on Google Fonts. Load only the weights you use.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
```

Self-host for production. If Inter Tight is unavailable, use Inter at
`--bx-track-display`; do not substitute a different family.

Substitutions that keep the feel: IBM Plex Sans / Plex Mono (more Carbon), Geist /
Geist Mono (more Vercel), Söhne / Berkeley Mono (paid, best). Never substitute a
geometric humanist like Poppins or Nunito - the round counters fight the square
geometry.

## Scale in practice

### Marketing (`editorial`)
| Element | Token | Weight | Tracking |
|---|---|---|---|
| Hero h1 | `--bx-text-6xl` (72) | 600 | -0.03em |
| Section h2 | `--bx-text-3xl` (32) | 600 | -0.02em |
| Card h3 | `--bx-text-xl` (20) | 600 | -0.02em |
| Lead paragraph | `--bx-text-lg` (18) | 400 | 0 |
| Body | `--bx-text-md` (16) | 400 | 0 |
| Eyebrow | `--bx-text-xs` (11) mono | 500 | 0.08em, uppercase |

### Application (`industrial` / `blueprint`)
| Element | Token | Weight |
|---|---|---|
| Page title | `--bx-text-2xl` (24) | 600 |
| Section title | `--bx-text-md` (16) | 600 |
| Body / controls | `--bx-text-base` (14) | 400 |
| Table cell | `--bx-text-base` (14) | 400 |
| Table header | `--bx-text-xs` (11) mono | 500, uppercase, 0.08em |
| Helper / caption | `--bx-text-sm` (12) | 400 |
| Metric value | `--bx-text-3xl` (32) mono | 500, tabular |

Never skip more than two steps between a heading and its body in the same block -
the jump reads as a mistake rather than a hierarchy.

## The mono label

The single most recognizable Boxy device. Use for eyebrows, table headers, metric
captions, legend keys, form labels in `blueprint`, section numbers, and status text.

```css
.bx-label {
  font-family: var(--bx-font-mono);
  font-size: var(--bx-text-xs);       /* 11px */
  line-height: var(--bx-lh-xs);       /* 16px */
  font-weight: var(--bx-weight-medium);
  letter-spacing: var(--bx-track-label); /* 0.08em */
  text-transform: uppercase;
  color: var(--bx-ink-subtle);
}
```

Rules:
- Never longer than about 32 characters. Labels are tags, not sentences.
- Never uppercase running prose - only labels.
- Pair with a numeric prefix in `blueprint`: `01 / OVERVIEW`, `03 / PRICING`.
- Do not apply `0.08em` tracking to anything above 12px; at larger sizes it reads as
  spacing damage rather than intent.

## Numerals

Every figure in a table, metric tile, price, timestamp, or chart axis:

```css
font-variant-numeric: tabular-nums;
```

For metric values, pair a mono figure with a smaller muted unit:

```html
<span class="bx-mono" style="font-size: var(--bx-text-3xl); font-weight: 500">
  1,284<span style="font-size: var(--bx-text-md); color: var(--bx-ink-subtle)">ms</span>
</span>
```

Use `font-feature-settings: "zero" 1` (slashed zero) in `blueprint` for genuinely
technical data - IDs, hashes, hex. Not for money.

## Measure and rhythm

- Body copy: 60-75 characters. `--bx-container-prose` is 68ch.
- Headings: 16-24 characters per line. Set `max-width` in `ch`, and use
  `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs.
- Paragraph spacing: `--bx-space-4` (16px) at 16px body. Never indent.
- Space above a heading is always larger than space below it - typically 2:1.
  `margin-top: var(--bx-space-8); margin-bottom: var(--bx-space-3)`.

## Links and emphasis

- Body links: `--bx-ink-accent`, no underline at rest, underline on hover,
  `text-underline-offset: 3px`. In long prose, underline at rest instead.
- Strong emphasis: `600` weight in `--bx-ink`. Not color.
- The Boxy alternative to a highlighter: an inverted inline block -
  `background: var(--bx-surface-inverse); color: var(--bx-ink-inverse);
  padding: 0 4px`.
- Inline code: `--bx-font-mono`, `0.9em`, `--bx-surface-sunken` background,
  1px `--bx-line-subtle` border, `2px 4px` padding. Square, obviously.

## Forbidden

- Font weights below 400.
- Letter-spacing on body copy.
- Gradient, outlined, or shadowed text.
- Justified text (`text-align: justify`) - it fights the hairline grid.
- Fake small caps via `font-size` reduction; use the mono label instead.
- More than three type sizes in a single component.
- All-caps sentences or all-caps headings above 12px.
