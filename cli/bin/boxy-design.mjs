#!/usr/bin/env node
/**
 * boxy-design — install the Boxy design system into a project.
 *
 *   npx boxy-design init                   # Claude Code (.claude/skills/boxy)
 *   npx boxy-design init --ai all          # every supported agent
 *   npx boxy-design init --ai cursor,agents
 *   npx boxy-design css --out src/styles   # stylesheets + icon sprite
 *   npx boxy-design check "src/**e/*.tsx"  # run the linter
 *
 * Zero dependencies. Node 18+.
 */

import {
  readFileSync, writeFileSync, mkdirSync, readdirSync, statSync,
  existsSync, cpSync,
} from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(HERE, "..", "..");
const SKILL_SRC = join(PKG_ROOT, "skills", "boxy");
const VERSION = JSON.parse(readFileSync(join(PKG_ROOT, "package.json"), "utf8")).version;

const c = {
  b: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  ok: (s) => `\x1b[32m${s}\x1b[0m`,
  warn: (s) => `\x1b[33m${s}\x1b[0m`,
  err: (s) => `\x1b[31m${s}\x1b[0m`,
  acc: (s) => `\x1b[34m${s}\x1b[0m`,
};

const BANNER = `
${c.b("+--------------------------------------+")}
${c.b("|")}  ${c.b("BOXY")}  ${c.dim("radius: 0")}                     ${c.b("|")}
${c.b("+--------------------------------------+")}
`;

/* ------------------------------------------------------------------ args */

const argv = process.argv.slice(2);
const cmd = argv.find((a) => !a.startsWith("-")) || "init";
const flag = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = argv[i + 1];
  return next && !next.startsWith("--") ? next : true;
};
const has = (name) => argv.includes(`--${name}`);

const TARGETS = {
  claude: "Claude Code       .claude/skills/boxy/",
  cursor: "Cursor            .cursor/rules/boxy.mdc",
  windsurf: "Windsurf          .windsurf/rules/boxy.md",
  agents: "AGENTS.md         AGENTS.md",
  copilot: "GitHub Copilot    .github/copilot-instructions.md",
};

function help() {
  console.log(BANNER);
  console.log(`  ${c.b("boxy-design")} ${c.dim(`v${VERSION}`)}  -  a sharp-edged design system for AI agents

  ${c.b("USAGE")}
    npx boxy-design <command> [options]

  ${c.b("COMMANDS")}
    init              Install the skill into this project    ${c.dim("(default)")}
    css               Copy boxy.css, boxy-components.css, boxy-icons.svg
    tokens            Copy design-tokens.json only
    check [paths]     Lint files against the system
    help              Show this

  ${c.b("OPTIONS")}
    --ai <list>       Comma-separated targets, or ${c.b("all")}      ${c.dim("(default: claude)")}
                      ${Object.keys(TARGETS).join(", ")}
    --dir <path>      Project root                          ${c.dim("(default: .)")}
    --out <path>      Output directory for css / tokens
    --css             Also drop the stylesheets and icons into the project
    --core            css: tokens and utilities only (boxy.css)
    --force           Overwrite existing files
    --strict          check: treat warnings as errors

  ${c.b("TARGETS")}
${Object.entries(TARGETS).map(([k, v]) => `    ${c.acc(k.padEnd(10))} ${c.dim(v)}`).join("\n")}

  ${c.b("EXAMPLES")}
    npx boxy-design init
    npx boxy-design init --ai all --css
    npx boxy-design init --ai cursor,agents --dir ./apps/web
    npx boxy-design check "src/**${"/"}*.{css,tsx}" --strict

  ${c.dim("https://github.avestura.dev/boxy-design-skill/")}
`);
}

/* ----------------------------------------------------------------- utils */

const written = [];
const skipped = [];

function write(path, content, force) {
  if (existsSync(path) && !force) { skipped.push(path); return false; }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
  written.push(path);
  return true;
}

function copyDir(src, dest, force) {
  if (existsSync(dest) && !force) { skipped.push(dest); return false; }
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true, force: true });
  written.push(dest + "/");
  return true;
}

function skillBody() {
  const raw = readFileSync(join(SKILL_SRC, "SKILL.md"), "utf8");
  return raw.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
}

function refNote(refDir) {
  return `\n\n---\n\n## Full reference\n\nDetailed specs live in \`${refDir}\`:\n\n` +
    readdirSync(join(SKILL_SRC, "references"))
      .filter((f) => f.endsWith(".md"))
      .map((f) => `- \`${refDir}/references/${f}\``)
      .join("\n") +
    `\n\nThe stylesheets are \`${refDir}/assets/boxy.css\` (tokens, reset, layout) and ` +
    `\`${refDir}/assets/boxy-components.css\` (every component spec, implemented), ` +
    `the icon sprite is \`${refDir}/assets/boxy-icons.svg\`, and the linter is ` +
    `\`node ${refDir}/scripts/boxy-check.mjs\`. Read a reference file before ` +
    `building the thing it covers.\n`;
}

function section(body) {
  return `<!-- boxy:start -->\n# Boxy design system\n\n${body}\n<!-- boxy:end -->\n`;
}

function upsertSection(path, body, force) {
  const block = section(body);
  if (existsSync(path)) {
    const cur = readFileSync(path, "utf8");
    if (/<!-- boxy:start -->[\s\S]*<!-- boxy:end -->/.test(cur)) {
      if (!force) { skipped.push(path); return false; }
      writeFileSync(path, cur.replace(/<!-- boxy:start -->[\s\S]*<!-- boxy:end -->\n?/, block), "utf8");
    } else {
      writeFileSync(path, cur.trimEnd() + "\n\n" + block, "utf8");
    }
    written.push(path + c.dim(" (section)"));
    return true;
  }
  return write(path, block, force);
}

/* ------------------------------------------------------------------ init */

function init() {
  const root = resolve(String(flag("dir", ".")));
  const force = has("force");
  const aiArg = String(flag("ai", "claude"));
  const list = aiArg === "all" ? Object.keys(TARGETS) : aiArg.split(",").map((s) => s.trim());

  const unknown = list.filter((t) => !TARGETS[t]);
  if (unknown.length) {
    console.error(`\n${c.err("error")}  unknown target: ${unknown.join(", ")}`);
    console.error(`        valid: ${Object.keys(TARGETS).join(", ")}, all\n`);
    process.exit(1);
  }
  if (!existsSync(root)) {
    console.error(`\n${c.err("error")}  no such directory: ${root}\n`);
    process.exit(1);
  }

  console.log(BANNER);
  console.log(`  ${c.dim("into")}  ${root}\n`);

  const needsPortable = list.some((t) => t !== "claude");
  const portableDir = join(root, ".boxy");
  if (needsPortable) copyDir(SKILL_SRC, portableDir, force);

  const body = skillBody();

  for (const t of list) {
    if (t === "claude") {
      copyDir(SKILL_SRC, join(root, ".claude", "skills", "boxy"), force);
    } else if (t === "cursor") {
      const mdc = `---\ndescription: Boxy — sharp-edged, zero-radius design system. Apply to any UI, CSS, component or design-token work.\nglobs: ["**/*.{css,scss,html,jsx,tsx,vue,svelte,astro}"]\nalwaysApply: false\n---\n\n${body}${refNote(".boxy")}`;
      write(join(root, ".cursor", "rules", "boxy.mdc"), mdc, force);
    } else if (t === "windsurf") {
      const md = `---\ntrigger: glob\nglobs: **/*.{css,scss,html,jsx,tsx,vue,svelte,astro}\ndescription: Boxy — sharp-edged, zero-radius design system.\n---\n\n${body}${refNote(".boxy")}`;
      write(join(root, ".windsurf", "rules", "boxy.md"), md, force);
    } else if (t === "agents") {
      upsertSection(join(root, "AGENTS.md"), body + refNote(".boxy"), force);
    } else if (t === "copilot") {
      upsertSection(join(root, ".github", "copilot-instructions.md"), body + refNote(".boxy"), force);
    }
  }

  if (has("css")) {
    const out = String(flag("out", join(root, "styles")));
    for (const name of styleAssets()) {
      write(join(resolve(out), name), readFileSync(join(SKILL_SRC, "assets", name), "utf8"), force);
    }
  }

  report(root);

  console.log(`  ${c.b("NEXT")}`);
  if (list.includes("claude")) {
    console.log(`    Restart Claude Code, then ask it to build any UI. The skill triggers`);
    console.log(`    on its own; ${c.acc("/boxy")} invokes it explicitly.`);
  }
  if (needsPortable) {
    console.log(`    Other agents read ${c.acc(".boxy/")} for the full reference set.`);
  }
  console.log(`    Lint with ${c.acc("npx boxy-design check \"src/**/*\"")}`);
  console.log(`\n  ${c.dim("Docs: https://github.avestura.dev/boxy-design-skill/")}\n`);
}

function report(root) {
  for (const p of written) console.log(`  ${c.ok("+")} ${relative(root, p.replace(/\x1b\[[0-9;]*m/g, "")) || p}`);
  for (const p of skipped) {
    console.log(`  ${c.warn("-")} ${relative(root, p)} ${c.dim("exists, skipped")}`);
  }
  if (skipped.length) console.log(`\n  ${c.dim("re-run with --force to overwrite")}`);
  console.log("");
}

/* ------------------------------------------------------------- css/tokens */

/* boxy.css is tokens, reset, utilities and layout primitives. The component
   layer and the icon sprite sit on top of it; --core leaves them out. */
function styleAssets() {
  return has("core") ? ["boxy.css"] : ["boxy.css", "boxy-components.css", "boxy-icons.svg"];
}

function copyAsset(names, defaultDir) {
  const out = resolve(String(flag("out", defaultDir)));
  for (const name of [].concat(names)) {
    write(join(out, name), readFileSync(join(SKILL_SRC, "assets", name), "utf8"), has("force"));
  }
  report(process.cwd());
}

/* ------------------------------------------------------------------ check */

function check() {
  const rest = argv.filter((a, i) => !(i === argv.indexOf(cmd) && a === cmd));
  const r = spawnSync(process.execPath, [join(SKILL_SRC, "scripts", "boxy-check.mjs"), ...rest], {
    stdio: "inherit",
  });
  process.exit(r.status ?? 1);
}

/* ------------------------------------------------------------------- main */

if (has("version") || has("v") || cmd === "version") {
  console.log(VERSION);
} else if (has("help") || has("h") || cmd === "help") {
  help();
} else if (cmd === "init") {
  init();
} else if (cmd === "css") {
  copyAsset(styleAssets(), "styles");
} else if (cmd === "tokens") {
  copyAsset("design-tokens.json", "tokens");
} else if (cmd === "check") {
  check();
} else {
  console.error(`\n${c.err("error")}  unknown command: ${cmd}\n`);
  help();
  process.exit(1);
}
