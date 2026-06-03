#!/usr/bin/env node
/**
 * Post-build SEO fix: rewrite the <title> tag in each dist/*.html so every
 * route has a route-specific title instead of the site-wide one from
 * app/+html.tsx.
 *
 * Google's SERP algorithm uses <title> as the primary signal for what a
 * page is about. Identical titles across pages = those pages compete for
 * the same SERP slot and Google picks one arbitrarily. Per-route titles
 * also let each page rank for its own intent (e.g. "italian brainrot
 * quiz" → /category/italian-brainrot).
 *
 * Map keys are dist/-relative file paths. Update this map when adding
 * new routes — keeping it in a single source file means we don't lose
 * track of the title taxonomy.
 *
 * Idempotent: re-runs replace the title in place. Safe to run multiple
 * times after `expo export`.
 */

const fs = require("fs");
const path = require("path");

const SITE = "Do You Even Brainrot?";

// Per-route titles + h1. Title goes in <head>; h1 is injected at the top
// of <body> as visually-hidden screen-reader-only markup so Google's
// algorithm has a clear heading signal for what each page is about.
//
// RN-Web's static SSR strips accessibilityRole / aria-level, so we
// can't get real <h1> tags out of the React tree alone — this post-
// build pass adds them.
const ROUTES = {
  "index.html":            { title: "chaotic brainrot trivia",                     h1: "Do You Even Brainrot? — chaotic brainrot trivia game" },
  "home.html":             { title: "today's daily + open round",                   h1: "Do You Even Brainrot — play now" },
  "about.html":            { title: "About",                                        h1: "About Do You Even Brainrot" },
  "friends.html":          { title: "Play with friends",                            h1: "Play brainrot trivia with friends" },
  "endless.html":          { title: "Endless mode — survive as long as you can",    h1: "Endless brainrot survival quiz" },
  "credits.html":          { title: "Image credits",                                h1: "Image credits" },
  "profile.html":          { title: "Profile",                                      h1: "Your profile + achievements" },
  "settings.html":         { title: "Game settings",                                h1: "Game settings" },
  "play.html":             { title: "Playing",                                      h1: "Brainrot trivia round" },
  "play-synced.html":      { title: "Synced round",                                 h1: "Synced friend-room round" },
  "result.html":           { title: "Your score",                                   h1: "Your brainrot score" },
  "_sitemap.html":         { title: "Sitemap",                                      h1: "Sitemap" },
  "+not-found.html":       { title: "Not found",                                    h1: "Page not found" },
  "category/[slug].html":  { title: "Category quiz",                                h1: "Brainrot category quiz" },
  "r/[code].html":         { title: "Joining a room",                               h1: "Joining a brainrot room" },
};

const DIST = path.resolve(__dirname, "..", "dist");

function render(phrase) {
  // Keep the home page's title brand-first for SERP recognition; other
  // pages lead with the route phrase.
  if (phrase === "chaotic brainrot trivia") return `${SITE} — ${phrase}`;
  return `${phrase} · ${SITE}`;
}

const titleRe = /<title>[\s\S]*?<\/title>/;
const ogTitleRe = /<meta property="og:title" content="[^"]*"\/?>/;
const twTitleRe = /<meta name="twitter:title" content="[^"]*"\/?>/;
const descRe = /<meta name="description" content="[^"]*"\/?>/;

// Visually-hidden but screen-reader / crawler-readable h1 markup.
// Position-absolute + clipped so it never affects visual layout.
const SR_STYLE =
  "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";

// Category slugs that need their own static HTML file. The Expo Router
// static export emits one template at category/[slug].html — we duplicate
// it per known slug so each has its own canonical URL with a unique
// <title> and <h1> in the served HTML (crawlers without JS get the real
// thing).
const CATEGORY_SLUGS = [
  ["italian-brainrot", "Italian Brainrot quiz — Tralalero Tralala + the cast", "Italian Brainrot quiz — characters, lore, and trivia"],
  ["skibidi", "Skibidi Toilet lore quiz", "Skibidi Toilet quiz — Cameramen, TV-men, Speakers, lore"],
  ["gen-alpha-slang", "Gen Alpha Slang quiz — rizz, sigma, gyatt, more", "Gen Alpha slang quiz — rizz / sigma / ohio / gyatt / fanum tax"],
  ["viral-moments", "Viral Moments quiz", "Viral Moments quiz — 2024-2026 TikTok+IG meta"],
  ["creators", "Creators quiz", "Creators quiz — MrBeast, IShowSpeed, Kai Cenat, Druski"],
  ["cross-platform", "Cross-Platform Memes quiz", "Cross-Platform Memes quiz — TikTok-to-Twitter migrations"],
  ["deep-cuts", "Brainrot Deep Cuts quiz", "Deep Cuts quiz — pre-2023 internet history that shaped brainrot"],
  ["absurdity", "Brainrot Absurdity quiz", "Absurdity quiz — memes that make no sense, by design"],
];

let touched = 0;
let missed = [];

for (const [rel, route] of Object.entries(ROUTES)) {
  const fullPath = path.join(DIST, rel);
  if (!fs.existsSync(fullPath)) {
    missed.push(rel);
    continue;
  }
  let html = fs.readFileSync(fullPath, "utf8");
  const titleText = render(route.title);
  const h1Html = `<h1 style="${SR_STYLE}">${route.h1}</h1>`;
  const before = html;
  html = html.replace(titleRe, `<title>${titleText}</title>`);
  html = html.replace(ogTitleRe, `<meta property="og:title" content="${titleText}"/>`);
  html = html.replace(twTitleRe, `<meta name="twitter:title" content="${titleText}"/>`);
  // Inject the h1 right after the opening <body> tag. Idempotent — only
  // inject if a previous run hasn't already added one.
  if (!html.includes(`data-seo="h1"`)) {
    html = html.replace(
      /<body([^>]*)>/,
      `<body$1><h1 data-seo="h1" style="${SR_STYLE}">${route.h1}</h1>`,
    );
  } else {
    // Replace existing seo h1 in case content changed.
    html = html.replace(
      /<h1 data-seo="h1"[^>]*>[\s\S]*?<\/h1>/,
      `<h1 data-seo="h1" style="${SR_STYLE}">${route.h1}</h1>`,
    );
  }
  if (html !== before) {
    fs.writeFileSync(fullPath, html, "utf8");
    touched++;
    process.stdout.write(`[rewrite-title] ${rel.padEnd(36)} → ${titleText} + h1\n`);
  }
}

if (missed.length > 0) {
  process.stderr.write(`[rewrite-title] WARN: missed (file not in dist): ${missed.join(", ")}\n`);
}

// ── Category slug pre-rendering ─────────────────────────────────────────
// Expo Router static export emits one [slug].html template; we copy it
// per known slug so each category gets a real URL the crawler can index.
const slugTemplatePath = path.join(DIST, "category", "[slug].html");
if (fs.existsSync(slugTemplatePath)) {
  const template = fs.readFileSync(slugTemplatePath, "utf8");
  for (const [slug, titlePhrase, h1Phrase] of CATEGORY_SLUGS) {
    const outPath = path.join(DIST, "category", `${slug}.html`);
    let html = template;
    const titleText = render(titlePhrase);
    html = html.replace(titleRe, `<title>${titleText}</title>`);
    html = html.replace(ogTitleRe, `<meta property="og:title" content="${titleText}"/>`);
    html = html.replace(twTitleRe, `<meta name="twitter:title" content="${titleText}"/>`);
    // Replace the existing data-seo h1 with the slug-specific one.
    html = html.replace(
      /<h1 data-seo="h1"[^>]*>[\s\S]*?<\/h1>/,
      `<h1 data-seo="h1" style="${SR_STYLE}">${h1Phrase}</h1>`,
    );
    fs.writeFileSync(outPath, html, "utf8");
    touched++;
    process.stdout.write(`[rewrite-title] category/${slug}.html → ${titleText}\n`);
  }
}

process.stdout.write(`[rewrite-title] done — ${touched} files updated\n`);
