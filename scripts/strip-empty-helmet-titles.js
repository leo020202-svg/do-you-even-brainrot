#!/usr/bin/env node
/**
 * Post-build cleanup: strip the empty <title data-rh="true"></title> tags
 * that react-native-helmet-async injects by default. These conflict with the
 * real <title> from app/+html.tsx — and since the empty Helmet placeholder
 * appears first in the rendered HTML, browsers and OG scrapers were picking
 * the empty one over our actual title.
 *
 * Walks dist/ recursively, rewrites each .html file with the empty Helmet
 * title removed. Idempotent.
 */

const fs = require("fs");
const path = require("path");

const DIST = path.resolve(__dirname, "..", "dist");
const EMPTY_TITLE_RE = /<title data-rh="true"><\/title>/g;

if (!fs.existsSync(DIST)) {
  console.warn(`[strip-helmet] ${DIST} does not exist — skipping`);
  process.exit(0);
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith(".html")) processFile(full);
  }
}

function processFile(file) {
  const before = fs.readFileSync(file, "utf8");
  if (!EMPTY_TITLE_RE.test(before)) return;
  const after = before.replace(EMPTY_TITLE_RE, "");
  fs.writeFileSync(file, after, "utf8");
  process.stdout.write(`[strip-helmet] cleaned ${path.relative(DIST, file)}\n`);
}

walk(DIST);
