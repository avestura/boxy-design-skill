#!/bin/sh
# Boxy — sharp-edged design system. One-command install, no registries.
#
#   curl -fsSL https://github.avestura.dev/boxy-design-skill/install.sh | sh
#   curl -fsSL https://github.avestura.dev/boxy-design-skill/install.sh | sh -s -- --portable
#   curl -fsSL https://github.avestura.dev/boxy-design-skill/install.sh | sh -s -- --dir path/to/skills/boxy
#
# Env: BOXY_REF=v1.0.0 pins a tag or branch (default: main).

set -eu

REPO="avestura/boxy-design-skill"
REF="${BOXY_REF:-main}"
DEST=".claude/skills/boxy"
FORCE=0

while [ $# -gt 0 ]; do
  case "$1" in
    --dir)      DEST="$2"; shift 2 ;;
    --portable) DEST=".boxy"; shift ;;
    --force)    FORCE=1; shift ;;
    --ref)      REF="$2"; shift 2 ;;
    -h|--help)
      sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) printf '\033[31merror\033[0m  unknown option: %s\n' "$1" >&2; exit 1 ;;
  esac
done

printf '\n\033[1m+--------------------------------------+\033[0m\n'
printf '\033[1m|\033[0m  \033[1mBOXY\033[0m  \033[2mradius: 0\033[0m                     \033[1m|\033[0m\n'
printf '\033[1m+--------------------------------------+\033[0m\n\n'

if [ -e "$DEST" ] && [ "$FORCE" -eq 0 ]; then
  printf '\033[33m-\033[0m  %s already exists\n' "$DEST"
  printf '   re-run with --force to overwrite\n\n'
  exit 1
fi

for tool in curl tar; do
  command -v "$tool" >/dev/null 2>&1 || {
    printf '\033[31merror\033[0m  %s is required\n' "$tool" >&2
    exit 1
  }
done

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT INT TERM

printf '\033[2m   fetching %s@%s\033[0m\n' "$REPO" "$REF"
curl -fsSL "https://codeload.github.com/$REPO/tar.gz/$REF" -o "$TMP/boxy.tar.gz" || {
  printf '\033[31merror\033[0m  download failed — check the ref "%s"\n' "$REF" >&2
  exit 1
}

mkdir -p "$TMP/x"
tar -xzf "$TMP/boxy.tar.gz" -C "$TMP/x"

SRC="$(find "$TMP/x" -type d -path '*/skills/boxy' -print -quit)"
[ -n "$SRC" ] || { printf '\033[31merror\033[0m  archive layout unexpected\n' >&2; exit 1; }

rm -rf "$DEST"
mkdir -p "$(dirname "$DEST")"
cp -R "$SRC" "$DEST"

printf '\033[32m+\033[0m  %s\n' "$DEST"
printf '\033[2m   %s files\033[0m\n\n' "$(find "$DEST" -type f | wc -l | tr -d ' ')"

case "$DEST" in
  .claude/skills/*)
    printf '\033[1mNEXT\033[0m\n'
    printf '   Restart Claude Code. The skill triggers on any UI work;\n'
    printf '   \033[34m/boxy\033[0m invokes it explicitly.\n' ;;
  *)
    printf '\033[1mNEXT\033[0m\n'
    printf '   Point your agent at \033[34m%s/SKILL.md\033[0m\n' "$DEST" ;;
esac
printf '   Lint with \033[34mnode %s/scripts/boxy-check.mjs "src/**/*"\033[0m\n' "$DEST"
printf '\n\033[2m   https://github.avestura.dev/boxy-design-skill/\033[0m\n\n'
