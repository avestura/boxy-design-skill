# Publishing

Everything below assumes the repo is `avestura/boxy-design-skill`.

## 1. Create the repo and push

```bash
git init -b main
git add -A
git commit -m "Boxy v1.0.0 — a sharp-edged design system skill"
gh repo create avestura/boxy-design-skill --public --source=. --push \
  --description "A sharp-edged, zero-radius design system for AI coding agents"
```

## 2. Turn on GitHub Pages

The site is a static `docs/` folder with no build step, so either option works.

**Actions (recommended)** — `.github/workflows/pages.yml` already handles it, and it
fails the deploy if `docs/assets/boxy.css` or `docs/assets/boxy-components.css` has
drifted from the skill copy:

```bash
gh api -X POST repos/avestura/boxy-design-skill/pages \
  -f 'build_type=workflow' 2>/dev/null \
  || gh api -X PUT repos/avestura/boxy-design-skill/pages -f 'build_type=workflow'
```

**Branch serving** — simpler, no Actions minutes:

```bash
gh api -X POST repos/avestura/boxy-design-skill/pages \
  -f 'source[branch]=main' -f 'source[path]=/docs'
```

Live at <https://github.avestura.dev/boxy-design-skill/> within a minute or two.
`docs/.nojekyll` is present so Jekyll does not eat any underscore-prefixed paths.

**On the URL:** this account serves Pages from the custom domain
`github.avestura.dev`, so `avestura.github.io/boxy-design-skill` issues a 301 to it
— and that redirect currently lands on **http**, not https. Every link in this repo
therefore points at `https://github.avestura.dev/...` directly, which matters most
for `install.sh`: piping a plaintext-HTTP response into `sh` is not something to
ship. If you ever tick *Enforce HTTPS* in the Pages settings, both hosts become
safe and either URL will do.

## 3. Publish to npm

The package is `boxy-design` (verified available). The whole repo root is the
package; `files` limits the tarball to `cli/`, `skills/`, `README.md` and `LICENSE`.

```bash
npm login
npm pack --dry-run          # confirm the contents
npm publish --access public
```

Then verify the one-liner end to end:

```bash
cd $(mktemp -d) && npx boxy-design@latest init --ai all
```

If you would rather not publish, the marketplace and `curl` installs work without
npm — only the `npx boxy-design` route depends on it. Drop that row from the README
and the site's install tabs if you skip it.

## 4. Verify the Claude Code plugin install

```
/plugin marketplace add avestura/boxy-design-skill
/plugin install boxy@boxy-design-skill
```

`.claude-plugin/marketplace.json` points the `boxy` plugin at the repo root, and
Claude Code discovers `skills/boxy/SKILL.md` from there. Nothing is published
anywhere for this route — the repo being public is enough.

## 5. Verify the curl install

`install.sh` is served from Pages but pulls the tarball from
`codeload.github.com`, so it only works once the repo is public **and** Pages is
live:

```bash
cd $(mktemp -d)
curl -fsSL https://github.avestura.dev/boxy-design-skill/install.sh | sh
BOXY_REF=v1.0.0 curl -fsSL https://github.avestura.dev/boxy-design-skill/install.sh | sh
```

## Cutting a release

Versions appear in four places and the smoke test asserts three of them agree:

- `package.json`
- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json` (both `metadata.version` and `plugins[0].version`)
- the footer strings in `docs/*.html`

```bash
V=1.1.0
node -e "for (const f of ['package.json','.claude-plugin/plugin.json']) {
  const j = require('./'+f); j.version = process.argv[1];
  require('fs').writeFileSync(f, JSON.stringify(j, null, 2)+'\n');
}" $V
# marketplace.json and the docs footers are edited by hand

node cli/test/smoke.mjs
git commit -am "v$V" && git tag "v$V" && git push --follow-tags
npm publish
gh release create "v$V" --generate-notes
```

## Before every push

```bash
node cli/test/smoke.mjs                        # 25 tests
node skills/boxy/scripts/boxy-check.mjs docs/  # the site must pass clean
cp skills/boxy/assets/boxy.css docs/assets/boxy.css   # if the tokens changed
```

`skills/boxy/` is the single source of truth. `docs/assets/boxy.css` is a copy, and
both CI workflows fail if the two diverge.
