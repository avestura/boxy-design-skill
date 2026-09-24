#!/usr/bin/env node
/**
 * boxy-check — enforce the Boxy design system.
 *
 *   node boxy-check.mjs                       # scans ./src, or . if absent
 *   node boxy-check.mjs "src/**e/*.css" app/  # paths and/or globs
 *   node boxy-check.mjs --strict              # warnings become errors
 *   node boxy-check.mjs --json                # machine-readable output
 *   node boxy-check.mjs --list-rules
 *
 * Suppress one line with a trailing or preceding `boxy-ignore` comment,
 * a region with `boxy-ignore-start` / `boxy-ignore-end`, or a whole file
 * with `boxy-ignore-file`. Useful when a file documents violations on purpose.
 * Zero dependencies. Node 18+.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep, extname, basename } from "node:path";

const CODE_EXT = new Set([
  ".css", ".scss", ".sass", ".less", ".pcss",
  ".html", ".htm", ".vue", ".svelte", ".astro",
  ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs",
]);

const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", "build", "out", ".next", ".nuxt",
  ".svelte-kit", ".astro", "coverage", "vendor", ".cache", ".output",
]);

/* Files exempt from the raw-hex rule: these are where hex legitimately lives. */
const TOKEN_FILE = /(^|[\\/])(boxy|tokens?|theme|palette|colou?rs?|variables)[.\-\w]*\.(css|scss|less|js|ts|json)$/i;
/* ...but a component layer named after the system (boxy-components.css) is
   component code, and must obey the primitive and raw-hex rules like any other. */
const COMPONENT_FILE = /(^|[\\/])[.\-\w]*components?[.\-\w]*\.(css|scss|less|js|ts)$/i;

/* Axiom 4: everything snaps to 4px. 1px and 2px are hairline/tick exceptions. */
const onScale = (px) => px === 0 || px === 1 || px === 2 || px % 4 === 0;
/* Type scale, in px. */
const FONT_SIZE = new Set([10, 11, 12, 14, 16, 18, 20, 24, 32, 40, 54, 72, 96]);

const RULES = [
  ["radius",        "error", "Nonzero border-radius"],
  ["radius-class",  "error", "Rounded utility class"],
  ["shadow-blur",   "error", "Shadow with a blur or spread radius"],
  ["shadow-class",  "error", "Blurred shadow utility class"],
  ["blur",          "error", "backdrop-filter / filter blur"],
  ["text-shadow",   "error", "text-shadow"],
  ["transition-all","error", "transition: all"],
  ["duration",      "error", "Transition or animation longer than 240ms"],
  ["gradient-text", "error", "Gradient clipped to text"],
  ["easing",        "warn",  "Non-mechanical easing"],
  ["scale",         "warn",  "transform: scale()"],
  ["space",         "warn",  "Spacing off the 4px scale"],
  ["font-size",     "warn",  "Font size off the type scale"],
  ["raw-hex",       "warn",  "Raw hex outside the token file"],
  ["primitive",     "warn",  "Primitive token in component code"],
  ["font-weight",   "warn",  "Font weight below 400"],
];

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const targets = args.filter((a) => !a.startsWith("--"));
const STRICT = flags.has("--strict");
const JSON_OUT = flags.has("--json");

if (flags.has("--list-rules")) {
  for (const [id, sev, desc] of RULES) console.log(`${sev.padEnd(5)} ${id.padEnd(15)} ${desc}`);
  process.exit(0);
}

/* ------------------------------------------------------------------ files */

function globToRegExp(pattern) {
  const p = pattern.replace(/\\/g, "/");
  let out = "";
  for (let i = 0; i < p.length; i++) {
    const c = p[i];
    if (c === "*") {
      if (p[i + 1] === "*") { out += "[^]*"; i++; if (p[i + 1] === "/") i++; }
      else out += "[^/]*";
    } else if (c === "?") out += "[^/]";
    else if (c === "{") out += "(";
    else if (c === "}") out += ")";
    else if (c === ",") out += "|";
    else out += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp("^" + out + "$");
}

function walk(dir, acc) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    if (e.name.startsWith(".") && e.name !== ".") continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(full, acc); }
    else if (CODE_EXT.has(extname(e.name))) acc.push(full);
  }
  return acc;
}

function resolveTargets(list) {
  const files = new Set();
  const inputs = list.length ? list : [existsSync("src") ? "src" : "."];
  for (const t of inputs) {
    if (t.includes("*")) {
      const base = t.split("*")[0].split(/[\\/]/).slice(0, -1).join(sep) || ".";
      const re = globToRegExp(t);
      for (const f of walk(base, [])) {
        const rel = relative(".", f).replace(/\\/g, "/");
        if (re.test(rel) || re.test(f.replace(/\\/g, "/"))) files.add(f);
      }
    } else if (existsSync(t)) {
      if (statSync(t).isDirectory()) walk(t, []).forEach((f) => files.add(f));
      else files.add(t);
    }
  }
  return [...files];
}

/* ------------------------------------------------------------------ rules */

const lengths = (s) => [...s.matchAll(/(-?\d*\.?\d+)(px|rem|em)\b/g)]
  .map((m) => ({ n: parseFloat(m[1]), unit: m[2] }));

const toPx = ({ n, unit }) => (unit === "px" ? n : n * 16);

/* Strip nested function calls, hex colors and keywords so that the remaining
   numbers are positionally meaningful. A bare `0` is a valid CSS length, so
   unitless numbers count too - that is what makes `0 4px 12px` parse as three. */
function stripFns(s) {
  let out = s, prev;
  do { prev = out; out = out.replace(/\b[a-z-]+\([^()]*\)/gi, " "); } while (out !== prev);
  return out;
}

/* Only the parts of a line that can legitimately hold utility classes. */
function classContext(line) {
  let out = "";
  for (const m of line.matchAll(/(?:class|className|class:list)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{"([^"]*)"\})/g)) {
    out += " " + (m[1] ?? m[2] ?? m[3] ?? m[4] ?? "");
  }
  for (const m of line.matchAll(/@apply\s+([^;{}]*)/g)) out += " " + m[1];
  return out;
}

const shadowLengths = (part) =>
  [...stripFns(part)
    .replace(/#[0-9a-fA-F]{3,8}\b/g, " ")
    .replace(/\b(inset|none|currentColor|transparent)\b/gi, " ")
    .matchAll(/(-?\d*\.?\d+)(px|rem|em)?/g)]
    .map((m) => ({ n: parseFloat(m[1]), unit: m[2] || "px" }));

function checkLine(line, file, isTokenFile) {
  const found = [];
  const add = (rule, detail) => found.push({ rule, detail });
  /* strip strings that are obviously URLs/data to cut noise */
  const src = line.replace(/url\([^)]*\)/g, "url()");

  /* --- radius ---------------------------------------------------------- */
  const radius = src.match(/border(?:-[a-z]+)*-radius\s*:\s*([^;}"'`]+)/i)
    || src.match(/borderRadius\s*:\s*["'`]?([^,;}"'`]+)/);
  if (radius) {
    const v = radius[1].trim();
    if (!/^0(\D|$)/.test(v) && !/^(none|initial|inherit|unset|var\(--bx-radius\))/.test(v)) {
      const nums = lengths(v);
      const bare = v.match(/^-?\d*\.?\d+$/);
      if (nums.some((x) => x.n !== 0) || /%/.test(v) || (bare && parseFloat(v) !== 0)) {
        add("radius", `border-radius: ${v}`);
      }
    }
  }
  /* Suffixed utilities are unambiguous anywhere on the line. */
  for (const m of src.matchAll(/\brounded-(?:sm|md|lg|xl|2xl|3xl|full|t|b|l|r|s|e|tl|tr|bl|br|ss|se|es|ee)(?:-(?:sm|md|lg|xl|2xl|3xl|full))?\b/g)) {
    add("radius-class", m[0]);
  }
  if (/\brounded-\[(?!0(?:px|rem)?\])/.test(src)) add("radius-class", "arbitrary rounded-[…]");
  /* Bare `rounded` / `shadow` are English words too, so only trust them inside
     a class attribute or an @apply directive. */
  for (const m of classContext(src).matchAll(/(?:^|\s)(rounded|shadow)(?=\s|$)/g)) {
    add(m[1] === "rounded" ? "radius-class" : "shadow-class", m[1]);
  }

  /* --- shadows --------------------------------------------------------- */
  const shadow = src.match(/(?:^|[\s;{])box-shadow\s*:\s*([^;}]+)/i)
    || src.match(/boxShadow\s*:\s*["'`]([^"'`]+)/);
  if (shadow) {
    for (const part of shadow[1].split(/,(?![^(]*\))/)) {
      if (/var\(--bx-/.test(part) || /\bnone\b/.test(part)) continue;
      const nums = shadowLengths(part);
      if (nums.length >= 3 && toPx(nums[2]) !== 0) add("shadow-blur", `blur ${nums[2].n}${nums[2].unit}`);
      if (nums.length >= 4 && toPx(nums[3]) !== 0 && !/inset/i.test(part)) {
        add("shadow-blur", `spread ${nums[3].n}${nums[3].unit}`);
      }
    }
  }
  for (const m of src.matchAll(/\bshadow-(?:sm|md|lg|xl|2xl|inner)\b/g)) {
    add("shadow-class", m[0]);
  }
  if (/drop-shadow\((?![^)]*\b0\s+0\s+0)/.test(src)) add("shadow-blur", "drop-shadow()");

  /* --- blur ------------------------------------------------------------ */
  if (/backdrop-filter\s*:(?![^;}]*\bnone\b)/i.test(src) || /\bbackdrop-blur\b/.test(src)) {
    add("blur", "backdrop-filter");
  }
  if (/(?:^|[\s;{:])filter\s*:[^;}]*\bblur\(/i.test(src)) add("blur", "filter: blur()");

  /* --- text effects ---------------------------------------------------- */
  if (/text-shadow\s*:(?![^;}]*\bnone\b)/i.test(src)) add("text-shadow", "text-shadow");
  if (/(?:background-clip|-webkit-background-clip)\s*:\s*text/i.test(src) || /\bbg-clip-text\b/.test(src)) {
    add("gradient-text", "background-clip: text");
  }

  /* --- motion ---------------------------------------------------------- */
  if (/transition\s*:\s*all\b/i.test(src) || /\btransition-all\b/.test(src)) {
    add("transition-all", "transition: all");
  }
  for (const m of src.matchAll(/(\d*\.?\d+)\s*(m?s)\b/g)) {
    const ms = m[2] === "s" ? parseFloat(m[1]) * 1000 : parseFloat(m[1]);
    /* A looping loader legitimately runs longer than a state transition. */
    if (ms > 240 && /transition|animation|duration/i.test(src) && !/\binfinite\b/.test(src)) {
      add("duration", `${m[0]} > 240ms`);
    }
  }
  for (const m of src.matchAll(/\b(?:duration|delay)-\[?(\d+)m?s?\]?\b/g)) {
    if (parseInt(m[1], 10) > 240) add("duration", `${m[0]} > 240ms`);
  }
  if (/\b(ease-in-out|ease-in)\b/.test(src) && /transition|animation|timing/i.test(src)) {
    add("easing", "ease-in-out");
  }
  const cb = src.match(/cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/);
  if (cb) {
    const y1 = parseFloat(cb[2]), y2 = parseFloat(cb[4]);
    if (y1 < 0 || y1 > 1 || y2 < 0 || y2 > 1) add("easing", "overshoot curve");
  }
  if (/transform\s*:[^;}"'`]*\bscale\(/i.test(src) && !/scale\(\s*1\s*\)/.test(src)) {
    add("scale", "transform: scale()");
  }

  /* --- scale ----------------------------------------------------------- */
  const spaceProp = src.match(/(?:^|[\s;{])((?:padding|margin|gap|row-gap|column-gap)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?)\s*:\s*([^;}{]+)/i);
  if (spaceProp && !/var\(--bx-/.test(spaceProp[2]) && !/(auto|inherit|initial|unset|calc|%|clamp|min|max)/.test(spaceProp[2])) {
    for (const l of lengths(spaceProp[2])) {
      const px = toPx(l);
      if (!onScale(Math.abs(px))) add("space", `${spaceProp[1]}: ${l.n}${l.unit} (${px}px)`);
    }
  }
  const fs = src.match(/(?:^|[\s;{])font-size\s*:\s*([^;}{]+)/i);
  if (fs && !/var\(--bx-/.test(fs[1]) && !/(inherit|clamp|calc|em\b|%)/.test(fs[1])) {
    for (const l of lengths(fs[1])) {
      if (!FONT_SIZE.has(Math.round(toPx(l)))) add("font-size", `font-size: ${l.n}${l.unit}`);
    }
  }
  const fw = src.match(/font-weight\s*:\s*(\d{3})/i);
  if (fw && parseInt(fw[1], 10) < 400) add("font-weight", `font-weight: ${fw[1]}`);

  /* --- primitive tokens ------------------------------------------------ */
  /* --bx-n-700 and friends are fixed values that do not flip with the theme.
     Using one in component code is how an inverted block ends up dark-on-dark.
     Role tokens (--bx-ink, --bx-line, --bx-surface, ...) are the public API. */
  if (!isTokenFile) {
    for (const m of src.matchAll(/--bx-(?:n|a|r|y|g)-\d{1,4}\b/g)) {
      add("primitive", `${m[0]} - use a role token`);
    }
  }

  /* --- raw hex --------------------------------------------------------- */
  if (!isTokenFile) {
    /* `(?<!&)` keeps HTML numeric entities such as &#9906; out of the results. */
    for (const m of src.matchAll(/(?<!&)#([0-9a-fA-F]{3,8})\b/g)) {
      if (![3, 4, 6, 8].includes(m[1].length)) continue;
      add("raw-hex", `#${m[1]}`);
    }
  }

  return found;
}

/* ------------------------------------------------------------------- run */

const sevOf = Object.fromEntries(RULES.map(([id, sev]) => [id, sev]));
const descOf = Object.fromEntries(RULES.map(([id, , d]) => [id, d]));
const files = resolveTargets(targets);
const findings = [];

for (const file of files) {
  let text;
  try { text = readFileSync(file, "utf8"); } catch { continue; }
  if (basename(file) === "boxy-check.mjs") continue;
  if (/boxy-ignore-file/.test(text)) continue;
  const isTokenFile = TOKEN_FILE.test(file) && !COMPONENT_FILE.test(file);
  const lines = text.split(/\r?\n/);
  let muted = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/boxy-ignore-start/.test(line)) { muted = true; continue; }
    if (/boxy-ignore-end/.test(line)) { muted = false; continue; }
    if (muted) continue;
    if (/boxy-ignore/.test(line) || (i > 0 && /boxy-ignore/.test(lines[i - 1]))) continue;
    for (const f of checkLine(line, file, isTokenFile)) {
      findings.push({
        file: relative(".", file).replace(/\\/g, "/"),
        line: i + 1,
        rule: f.rule,
        severity: sevOf[f.rule],
        message: `${descOf[f.rule]}: ${f.detail}`,
        source: line.trim().slice(0, 120),
      });
    }
  }
}

const errors = findings.filter((f) => f.severity === "error");
const warnings = findings.filter((f) => f.severity === "warn");

if (JSON_OUT) {
  console.log(JSON.stringify({ files: files.length, errors: errors.length, warnings: warnings.length, findings }, null, 2));
} else {
  const bold = (s) => `\x1b[1m${s}\x1b[0m`;
  const red = (s) => `\x1b[31m${s}\x1b[0m`;
  const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
  const dim = (s) => `\x1b[2m${s}\x1b[0m`;

  const byFile = new Map();
  for (const f of findings) {
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file).push(f);
  }
  for (const [file, list] of byFile) {
    console.log("\n" + bold(file));
    for (const f of list.sort((a, b) => a.line - b.line)) {
      const tag = f.severity === "error" ? red("error") : yellow("warn ");
      console.log(`  ${dim(String(f.line).padStart(4))}  ${tag}  ${f.message}  ${dim(f.rule)}`);
    }
  }
  console.log("");
  if (!findings.length) {
    console.log(`\x1b[32m[ PASS ]\x1b[0m  ${files.length} files - no violations`);
  } else {
    console.log(
      `[ ${errors.length ? red("FAIL") : yellow("WARN")} ]  ${files.length} files - ` +
      `${errors.length} error${errors.length === 1 ? "" : "s"}, ` +
      `${warnings.length} warning${warnings.length === 1 ? "" : "s"}`
    );
    console.log(dim("         boxy-check.mjs --list-rules for the full rule set"));
  }
}

process.exit(errors.length || (STRICT && warnings.length) ? 1 : 0);
