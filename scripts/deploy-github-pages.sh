#!/usr/bin/env bash
# Deploy the static export to the gh-pages branch of this repo.
# Pre-req: `gh` authenticated, repo origin set to leo020202-svg/do-you-even-brainrot.
# Usage: bash scripts/deploy-github-pages.sh
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

echo "[deploy] Building production web bundle with /do-you-even-brainrot base URL…"
EXPO_BASE_URL="/do-you-even-brainrot" BASE_URL="/do-you-even-brainrot" npm run build:web

echo "[deploy] Preparing gh-pages branch…"
WORKTREE="$REPO_ROOT/.gh-pages-worktree"
rm -rf "$WORKTREE"

# Initialise gh-pages branch as an orphan if it doesn't exist remotely yet.
if ! git ls-remote --exit-code origin gh-pages > /dev/null 2>&1; then
  echo "[deploy] gh-pages branch doesn't exist yet — bootstrapping orphan branch…"
  git worktree add --orphan -B gh-pages "$WORKTREE"
else
  git fetch origin gh-pages
  git worktree add -B gh-pages "$WORKTREE" origin/gh-pages
fi

echo "[deploy] Copying dist/ → gh-pages worktree…"
# Wipe everything but .git
find "$WORKTREE" -mindepth 1 -maxdepth 1 -not -name ".git" -exec rm -rf {} +
cp -r dist/* "$WORKTREE"/

# GitHub Pages serves a Jekyll site by default; .nojekyll disables that so
# files/dirs starting with _ (e.g. /_expo/static/...) actually serve.
touch "$WORKTREE/.nojekyll"

# Custom 404 → copy index.html so SPA routing falls back cleanly.
if [ -f "$WORKTREE/+not-found.html" ]; then
  cp "$WORKTREE/+not-found.html" "$WORKTREE/404.html"
elif [ -f "$WORKTREE/index.html" ]; then
  cp "$WORKTREE/index.html" "$WORKTREE/404.html"
fi

cd "$WORKTREE"
git add -A
if git diff --cached --quiet; then
  echo "[deploy] No changes to deploy."
else
  git -c user.email=leo020202@gmail.com -c user.name="leo020202-svg" \
    commit -m "Deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  git push origin gh-pages
  echo "[deploy] Pushed to gh-pages."
fi

cd "$REPO_ROOT"
git worktree remove "$WORKTREE" --force

echo "[deploy] Done. Site will be live at:"
echo "         https://leo020202-svg.github.io/do-you-even-brainrot/"
