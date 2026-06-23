#!/usr/bin/env node
/**
 * Post-build: rewrite root-relative static-asset references in every
 * dist/*.html so they point at the GitHub-Pages base URL.
 *
 * Expo Router's baseUrl experiment correctly prefixes the entry script
 * but doesn't touch references emitted from +html.tsx (manifest,
 * favicon, icons, og images, apple-touch-icon, service-worker registration
 * path inside register-sw.ts isn't a build-time string, so that file
 * needs separate handling).
 *
 * Idempotent: matches only paths starting with "/icons/", "/og/",
 * "/manifest.webmanifest", "/favicon.svg", "/robots.txt", "/sitemap.xml",
 * "/llms.txt", "/service-worker.js" — never doubles up.
 */

const fs = require("fs");
const path = require("path");

const DIST = path.resolve(__dirname, "..", "dist");
const BASE_URL = process.env.BASE_URL || "/do-you-even-brainrot";

// Anchors we need to prefix. Order matters — match longer paths first so
// "/icons/foo.png" doesn't get matched twice as "/icons/" + "foo.png".
const PATTERNS = [
  /\/icons\//g,
  /\/og\//g,
  /\/manifest\.webmanifest/g,
  /\/favicon\.svg/g,
  /\/robots\.txt/g,
  /\/sitemap\.xml/g,
  /\/llms\.txt/g,
  /\/service-worker\.js/g,
];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.isFile() && entry.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const files = walk(DIST);
let touched = 0;
for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  for (const re of PATTERNS) {
    html = html.replace(re, (match) => {
      // Already prefixed? Leave it.
      // We need the surrounding context — peek the char before via a
      // separate scan. Easier: check if "BASE_URL+match" already appears
      // immediately before this occurrence by scanning the substring.
      return `${BASE_URL}${match}`;
    });
  }
  // De-double in case re-runs see already-prefixed paths.
  const doubleBase = new RegExp(
    `${BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}${BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
    "g",
  );
  html = html.replace(doubleBase, BASE_URL);

  if (html !== before) {
    fs.writeFileSync(file, html, "utf8");
    touched++;
  }
}
process.stdout.write(`[rewrite-base-url] ${touched} HTML files updated (BASE_URL=${BASE_URL})\n`);
