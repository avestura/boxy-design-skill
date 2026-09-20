#!/usr/bin/env node
/**
 * Smoke tests for the Boxy CLI and linter. No framework, no dependencies.
 *   node cli/test/smoke.mjs
 */

import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CLI = join(ROOT, "cli", "bin", "boxy-design.mjs");
const CHECK = join(ROOT, "skills", "boxy", "scripts", "boxy-check.mjs");

let pass = 0, fail = 0;
const results = [];

function test(name, fn) {
  try { fn(); pass++; results.push(["PASS", name, ""]); }
  catch (e) { fail++; results.push(["FAIL", name, e.message]); }
}

function eq(actual, expected, what) {
  if (actual !== expected) throw new Error(`${what}: expected ${expected}, got ${actual}`);
}
function ok(cond, what) { if (!cond) throw new Error(what); }

const run = (args, opts = {}) =>
  spawnSync(process.execPath, args, { encoding: "utf8", ...opts });

const tmp = mkdtempSync(join(tmpdir(), "boxy-smoke-"));

/* ------------------------------------------------------------------- CLI */

test("cli --version prints a semver", () => {
  const r = run([CLI, "--version"]);
  eq(r.status, 0, "exit code");
  ok(/^\d+\.\d+\.\d+/.test(r.stdout.trim()), `version output: ${r.stdout.trim()}`);
});

test("cli help exits clean", () => {
  eq(run([CLI, "help"]).status, 0, "exit code");
});

test("cli rejects an unknown target", () => {
  const r = run([CLI, "init", "--ai", "notreal", "--dir", tmp]);
  eq(r.status, 1, "exit code");
  ok(/unknown target/.test(r.stderr), "error message");
});

test("init --ai claude writes the skill", () => {
  const dir = join(tmp, "claude-only");
  mkdirSync(dir, { recursive: true });
  eq(run([CLI, "init", "--dir", dir]).status, 0, "exit code");
  for (const f of [
    ".claude/skills/boxy/SKILL.md",
    ".claude/skills/boxy/assets/boxy.css",
    ".claude/skills/boxy/assets/design-tokens.json",
    ".claude/skills/boxy/scripts/boxy-check.mjs",
    ".claude/skills/boxy/references/tokens.md",
    ".claude/skills/boxy/references/anti-patterns.md",
  ]) ok(existsSync(join(dir, f)), `missing ${f}`);
  ok(!existsSync(join(dir, ".boxy")), ".boxy should not exist for claude-only");
});

test("init --ai all writes every target plus the portable copy", () => {
  const dir = join(tmp, "all");
  mkdirSync(dir, { recursive: true });
  eq(run([CLI, "init", "--ai", "all", "--css", "--dir", dir]).status, 0, "exit code");
  for (const f of [
    ".claude/skills/boxy/SKILL.md",
    ".cursor/rules/boxy.mdc",
    ".windsurf/rules/boxy.md",
    "AGENTS.md",
    ".github/copilot-instructions.md",
    ".boxy/SKILL.md",
    ".boxy/references/modes.md",
    "styles/boxy.css",
  ]) ok(existsSync(join(dir, f)), `missing ${f}`);

  const mdc = readFileSync(join(dir, ".cursor/rules/boxy.mdc"), "utf8");
  ok(mdc.startsWith("---"), "cursor rule needs frontmatter");
  ok(/globs:/.test(mdc), "cursor rule needs globs");
  ok(!/^name:/m.test(mdc), "skill frontmatter should be stripped");

  const agents = readFileSync(join(dir, "AGENTS.md"), "utf8");
  ok(agents.includes("<!-- boxy:start -->"), "AGENTS.md needs start marker");
  ok(agents.includes("<!-- boxy:end -->"), "AGENTS.md needs end marker");
  ok(agents.includes("Radius is zero"), "AGENTS.md needs the axioms");
});

test("init is idempotent without --force", () => {
  const dir = join(tmp, "all");
  const before = readFileSync(join(dir, "AGENTS.md"), "utf8");
  const r = run([CLI, "init", "--ai", "all", "--dir", dir]);
  eq(r.status, 0, "exit code");
  ok(/exists, skipped/.test(r.stdout), "should report skips");
  eq(readFileSync(join(dir, "AGENTS.md"), "utf8"), before, "AGENTS.md changed");
});

test("init preserves surrounding content in AGENTS.md", () => {
  const dir = join(tmp, "existing");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "AGENTS.md"), "# House rules\n\nRun the tests.\n", "utf8");
  eq(run([CLI, "init", "--ai", "agents", "--dir", dir]).status, 0, "exit code");
  const out = readFileSync(join(dir, "AGENTS.md"), "utf8");
  ok(out.includes("# House rules"), "original heading lost");
  ok(out.includes("Run the tests."), "original body lost");
  ok(out.includes("<!-- boxy:start -->"), "boxy section not appended");
});

test("css and tokens subcommands emit the assets", () => {
  const dir = join(tmp, "assets");
  mkdirSync(dir, { recursive: true });
  eq(run([CLI, "css", "--out", join(dir, "s")], { cwd: dir }).status, 0, "css exit code");
  eq(run([CLI, "tokens", "--out", join(dir, "t")], { cwd: dir }).status, 0, "tokens exit code");
  ok(existsSync(join(dir, "s", "boxy.css")), "boxy.css missing");
  ok(existsSync(join(dir, "t", "design-tokens.json")), "design-tokens.json missing");
  JSON.parse(readFileSync(join(dir, "t", "design-tokens.json"), "utf8"));
});

/* ---------------------------------------------------------------- linter */

function lint(source, ext = "css", extraArgs = []) {
  const dir = join(tmp, "lint", Math.random().toString(36).slice(2));
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `probe.${ext}`);
  writeFileSync(file, source, "utf8");
  const r = run([CHECK, file, "--json", ...extraArgs]);
  return JSON.parse(r.stdout);
}

const rules = (out) => out.findings.map((f) => f.rule);

test("linter accepts compliant source", () => {
  const out = lint(`.card {
  border-radius: 0;
  border: 1px solid var(--bx-line);
  box-shadow: 2px 2px 0 0 var(--bx-shadow-color);
  padding: 24px;
  gap: 20px;
  font-size: 14px;
  transition: background-color 120ms linear;
}`);
  eq(out.findings.length, 0, `unexpected findings: ${JSON.stringify(rules(out))}`);
});

test("linter catches nonzero radius", () => {
  ok(rules(lint(".a { border-radius: 8px; }")).includes("radius"), "css radius");
  ok(rules(lint("const s = { borderRadius: 6 };", "jsx")).includes("radius"), "unitless js radius");
});

test("linter catches a blurred shadow behind a leading unitless zero", () => {
  const out = lint(".a { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }");
  ok(rules(out).includes("shadow-blur"), `got ${JSON.stringify(rules(out))}`);
});

test("linter allows hard offset shadows", () => {
  eq(lint(".a { box-shadow: 4px 4px 0 0 #0002; }").findings.filter((f) => f.rule === "shadow-blur").length, 0, "false positive");
});

test("linter catches banned utility classes in markup only", () => {
  ok(rules(lint('<div class="rounded shadow-md">x</div>', "html")).includes("radius-class"), "class attr");
  eq(lint("<p>Agents love rounded cards and shadow effects.</p>", "html").findings.length, 0, "prose false positive");
});

test("linter allows rounded-none and shadow-none", () => {
  eq(lint('<div class="rounded-none shadow-none"></div>', "html").findings.length, 0, "false positive");
});

test("linter catches motion violations", () => {
  const r = rules(lint(".a { transition: all 0.3s ease-in-out; }"));
  ok(r.includes("transition-all"), "transition: all");
  ok(r.includes("duration"), "duration");
  ok(r.includes("easing"), "easing");
});

test("linter exempts infinite loop animations from the duration cap", () => {
  const r = rules(lint(".a { animation: pulse 1s steps(4, end) infinite; }"));
  ok(!r.includes("duration"), `unexpected: ${JSON.stringify(r)}`);
});

test("linter treats 4px multiples as on-scale", () => {
  eq(lint(".a { padding: 20px; margin: 36px; gap: 4px; }").findings.length, 0, "false positive");
  ok(rules(lint(".a { padding: 13px; }")).includes("space"), "13px should warn");
});

test("linter ignores HTML numeric entities when hunting hex", () => {
  eq(lint("<p>&#9906; &#215;</p>", "html").findings.length, 0, "entity treated as hex");
  ok(rules(lint("<p style='color:#333333'>x</p>", "html")).includes("raw-hex"), "real hex missed");
});

test("linter honours the suppression comments", () => {
  eq(lint(".a { border-radius: 8px; } /* boxy-ignore */").findings.length, 0, "line ignore");
  eq(lint("/* boxy-ignore-start */\n.a { border-radius: 8px; }\n/* boxy-ignore-end */").findings.length, 0, "block ignore");
  eq(lint("/* boxy-ignore-file */\n.a { border-radius: 8px; }").findings.length, 0, "file ignore");
});

test("linter exit code reflects severity", () => {
  const dir = join(tmp, "exit");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "warn.css"), ".a { padding: 13px; }", "utf8");
  eq(run([CHECK, dir]).status, 0, "warnings alone should pass");
  eq(run([CHECK, dir, "--strict"]).status, 1, "--strict should fail on warnings");
  writeFileSync(join(dir, "err.css"), ".a { border-radius: 8px; }", "utf8");
  eq(run([CHECK, dir]).status, 1, "errors should fail");
});

/* ------------------------------------------------------------- integrity */

test("the shipped stylesheet passes its own linter", () => {
  eq(run([CHECK, join(ROOT, "skills", "boxy", "assets", "boxy.css")]).status, 0, "exit code");
});

test("the showcase site passes its own linter", () => {
  eq(run([CHECK, join(ROOT, "docs")]).status, 0, "exit code");
});

test("docs/assets/boxy.css is in sync with the skill copy", () => {
  eq(
    readFileSync(join(ROOT, "docs", "assets", "boxy.css"), "utf8"),
    readFileSync(join(ROOT, "skills", "boxy", "assets", "boxy.css"), "utf8"),
    "copies differ - run: cp skills/boxy/assets/boxy.css docs/assets/boxy.css"
  );
});

test("every reference named in SKILL.md exists", () => {
  const skill = readFileSync(join(ROOT, "skills", "boxy", "SKILL.md"), "utf8");
  const named = [...skill.matchAll(/`references\/([\w-]+\.md)`/g)].map((m) => m[1]);
  ok(named.length >= 10, `only found ${named.length} references`);
  for (const f of new Set(named)) {
    ok(existsSync(join(ROOT, "skills", "boxy", "references", f)), `missing references/${f}`);
  }
});

test("plugin and package manifests agree on version", () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  const plugin = JSON.parse(readFileSync(join(ROOT, ".claude-plugin", "plugin.json"), "utf8"));
  const market = JSON.parse(readFileSync(join(ROOT, ".claude-plugin", "marketplace.json"), "utf8"));
  eq(plugin.version, pkg.version, "plugin.json version");
  eq(market.plugins[0].version, pkg.version, "marketplace.json version");
  eq(market.plugins[0].name, plugin.name, "plugin name");
});

/* ------------------------------------------------------------------ done */

rmSync(tmp, { recursive: true, force: true });

const red = (s) => `\x1b[31m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

console.log("");
for (const [status, name, msg] of results) {
  const tag = status === "PASS" ? green("pass") : red("fail");
  console.log(`  ${tag}  ${name}${msg ? dim("\n        " + msg) : ""}`);
}
console.log("");
console.log(fail ? red(`[ FAIL ]  ${pass} passed, ${fail} failed`) : green(`[ PASS ]  ${pass} passed`));
process.exit(fail ? 1 : 0);
