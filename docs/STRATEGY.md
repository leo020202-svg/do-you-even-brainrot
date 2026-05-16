# Strategy — SEO, marketing, UX, brand

Single-doc plan covering everything outside of pure feature work: name + brand,
domain, site architecture, SEO, marketing, UX gaps, technical SEO, and a
phased roadmap of what to ship in what order. Pairs with `docs/PRODUCT_SPEC.md`
(what we're building) and `docs/HANDOFF.md` (where we are now).

---

## 0. TL;DR — what to do this week

In priority order, this week's critical path:

1. **Secure the domain.** Buy `playbrainrot.app` (and `.com` defensively).
2. **Build a real landing page at `/`.** The current `/` is the app entry — fine for returning players but a wasted SEO surface for first-time visitors.
3. **Add metadata + OG images** to every route. Today the HTML head is empty — zero share preview, zero crawl signal.
4. **Deploy to Vercel.** Static export already works (`npm run build:web`); a CI deploy plus DNS gets the app live in an afternoon.
5. **Submit to Google Search Console** and add `robots.txt`, `sitemap.xml`, `llms.txt`.

Everything else is downstream of those five.

---

## 1. Current state audit

The app runs at `localhost:8081` on Expo Web + RN. Five working routes:

| Route | Purpose | First-time fit | Returning fit |
|-------|---------|----------------|----------------|
| `/` | App home, daily CTA | ❌ confusing — "DO YOU EVEN BRAINROT?" reads as brand flex, no explanation | ✅ great |
| `/play` | Question + reveal flow | n/a (deep link) | ✅ |
| `/play?room=CODE&start=TS` | Synced friend room | ❌ countdown lands cold if user has no context | ✅ if they're in the Discord call |
| `/r/[code]` | Shortlink → /play | n/a | ✅ |
| `/friends` | Create/join room hub | ❌ secondary, needs the home page to point here | ✅ |
| `/settings` | Practice-mode prefs | secondary | ✅ |
| `/profile` | Streak + history | secondary | ✅ |
| `/credits` | Image attribution | tertiary | tertiary |

**Strengths:** Phase 0 mechanics work end-to-end (daily / practice / async room / synced room / share text / streak / settings). Visual language is loud, distinctive, on-brand. Phone-width capped for desktop. 200 hand-curated questions = serious content moat.

**Gaps that hurt SEO/marketing/conversion:**

- `<title>` is blank, no `<meta description>`, no Open Graph, no Twitter card, no favicon → unshareable, unfindable
- `/` doubles as both landing page and app — first-time visitors don't know what they're looking at
- No domain, no production deploy
- No analytics → no idea what's actually working
- No native app builds → can't satisfy Phase 0 gate ("runs on iOS sim AND Android emulator")
- No persistent auth → streak dies when localStorage clears

---

## 2. Brand & naming

**Keep the full name:** "Do You Even Brainrot?" It's distinctive, search-friendly for the brainrot subculture, and the `?` makes it look like a TikTok title (because it is one). Don't overthink this.

**Handle / URL shortform: `playbrainrot`.** One word, brandable, easy to type, available across platforms as of writing. The full name lives on the homepage and store listings; everywhere else (URLs, social handles, share text) uses `playbrainrot`.

**Tagline (use everywhere — meta tags, app store, hero):**

> The daily brainrot trivia game. How cooked are you?

**Voice rules (already in `docs/DESIGN_NOTES.md`, codifying them for marketing):**
- 20% of strings get the brainrot voice treatment, 80% stay clean
- Lean into the joke without becoming unreadable
- Never infantilize — the audience is 12–25, treat them like adults with taste

**Don't:** rename to anything safer ("Memerati", "Trivium TikTok") — the brainrot-native name is the wedge.

---

## 3. Domain & URL strategy

**Primary:** `playbrainrot.app`
- `.app` forces HTTPS, signals "this is software," brandable, modern
- Already referenced as canonical in `docs/PRODUCT_SPEC.md` and `docs/TECH_SPEC.md`

**Defensive registrations** (grab same day):
- `playbrainrot.com` → 301 → `.app`
- `playbrainrot.io` → 301 → `.app`
- (Optional) `brainrot.fyi`, `brainrot.gg` — premium but on-brand if free

**URL shape after deploy:**

| Path | Purpose | Indexable? |
|------|---------|------------|
| `/` | Marketing landing | ✅ |
| `/play` | Daily challenge entry (gated behind "play today's daily" CTA) | ❌ noindex |
| `/friends` | Friend room create/join | ✅ (thin but useful for "play with friends" SERP intent) |
| `/r/[code]` | Shortlink shares | ❌ noindex |
| `/category/[slug]` | **NEW**: per-category SEO landing pages | ✅ |
| `/about`, `/credits`, `/privacy`, `/terms` | Boilerplate | ✅ |
| `/blog/[slug]` | **NEW** (Phase 1): weekly pack drops + brainrot explainers | ✅ |

---

## 4. Site architecture — the 3 surfaces

The biggest single fix: **split the marketing landing from the app entry.**

```
visitor → playbrainrot.app/
              ↓
        [marketing landing]
              ↓
        ┌─────┴─────┐
        ↓           ↓
    "play daily"   "play with friends"
        ↓               ↓
      /play          /friends
```

**Returning visitors auto-bounce:** store a `seenLanding` flag in localStorage; if set + a streak exists, redirect `/` → `/play` so the home button still works for them. New visitors and clear-cache visitors always see the landing.

**Share targets stay direct-link:** `/r/CODE` and shared score-card links land in the app context (with appropriate OG previews), not on the marketing page.

---

## 5. Landing page spec (`/`)

**Audience:** A 14-year-old whose friend texted them the link. They have 8 seconds to decide whether to tap. They've never heard of the brand.

**Layout** (mobile-first, single column under 480px, two-column for hero on desktop):

### Section 1: Hero (full viewport)
- Big stacked headline (matches current sticker style): `DO YOU / EVEN / BRAINROT?` — keep the chaotic three-color stack
- Sub: `the daily trivia game. 5 questions. 30 seconds each. how cooked are you?`
- Primary CTA: `play today's daily 🔥` → `/play`
- Secondary CTA: `play with friends 👯` → `/friends`
- Below the buttons: `5,000+ daily players · streaks live or die at midnight` (once we have real numbers; until then say `pre-launch · join the first wave`)
- Visual: 3–4 floating brainrot character emoji stickers at low opacity (already implemented via `EmojiSplat`)

### Section 2: How it works (3 columns / mobile rows)
1. **Open it.** No signup. No download. 30 seconds and you're in.
2. **5 questions a day.** Italian brainrot, Skibidi lore, Gen Alpha slang, viral moments.
3. **Don't lose your streak.** Share your score card, drag your friends in, climb.

### Section 3: Three modes
- 🔥 **Daily** — one shot per day, 5 questions, build a streak
- 👯 **Friend rooms** — share a code, everyone gets the same questions
- ⚡ **Live with friends** — synced countdown, shared reveals, Kahoot-style

### Section 4: Social proof
- Embedded score-card images (Wordle-style grids — the share artifact IS the marketing)
- Real screenshots from Discord/iMessage of people sharing scores (once they exist; fake gracefully at first with stylized examples)
- "As seen on [TikTok creator]" if/when partnerships happen

### Section 5: Sample question
- Show one real question with the 4 colored answer options
- "tap to peek" reveals the answer + a fun-fact source
- Gives the visitor instant taste of the content

### Section 6: FAQ (for SEO + AI search citation)
- "Is this free?" Yes, daily challenges are free forever.
- "Do I need to sign up?" No. Just open it.
- "How do I play with friends?" Tap "play with friends," share the code.
- "What's brainrot?" One-paragraph plain-English explainer for the parents stumbling here.
- "How do you pick the questions?" 200 hand-curated by humans, sourced from Know Your Meme + Italian Brainrot wiki + actual TikTok comment-section lore.

### Section 7: Footer
- Links: about, credits, privacy, terms, github
- Tiny version + "made by humans, not AI" line

**Implementation note:** all sticker shadows + tilts + colors already exist as components in `src/components/`. The landing page is mostly a composition exercise — no new design system needed.

---

## 6. Game-entry funnel

### First-time visitor (cold)
`/` (landing) → understands the pitch → taps "play today's daily 🔥" → `/play` → answers 5 questions → result screen → share / "play with friends" CTA → either shares (viral loop) or comes back tomorrow (retention loop)

### Returning visitor (warm)
`/` auto-redirects → `/play` (or stays on home if daily already done) → see streak in nav → tap profile or settings

### Friend-invite recipient (hot)
Clicks `/r/RIZZ42?start=1715690400000` from a Discord message → lands directly in the synced countdown → game starts at T=0 with the rest of the call → result → share + "play again" generates new room → loop

### Friction kills:
- ❌ Forced signup before first play — never
- ❌ Email capture popup — never on first visit, maybe in profile after streak ≥ 3
- ❌ Tutorial — DESIGN_NOTES is explicit: "first-time users should hit a real question within 30 seconds"
- ❌ App-store interstitials nagging native install — only show on profile, never on landing or play

---

## 7. SEO plan

### 7.1 Keyword targets

Primary keywords (rank for these in 90 days):
- `brainrot quiz` — primary
- `brainrot game`
- `italian brainrot quiz`
- `skibidi toilet quiz`
- `gen alpha slang quiz`
- `tiktok trivia game`
- `do you even brainrot` (branded)

Long-tail (rank for these in 30 days, each gets a category page or blog post):
- `tralalero tralala quiz`
- `bombardiro crocodilo lore`
- `what does rizz mean`
- `cappuccino assassino`
- `gen alpha words quiz`
- `tung tung tung sahur meaning`

The brainrot SEO landscape is **wildly under-served** right now — Know Your Meme dominates wiki pages, but there's no canonical *playable* destination. We can own that lane.

### 7.2 Site structure for SEO

Add these new routes — each is a real page with real content, not a thin doorway:

**`/category/[slug]`** — one per category, 8 total:
- `/category/italian-brainrot`
- `/category/skibidi`
- `/category/gen-alpha-slang`
- `/category/viral-moments`
- `/category/creators`
- `/category/cross-platform`
- `/category/deep-cuts`
- `/category/absurdity`

Each contains:
- H1: "Italian Brainrot Quiz — 25 questions about Tralalero Tralala, Bombardiro Crocodilo, and the rest"
- Intro paragraph (150–250 words) explaining the category
- The 25 questions for that category as a scrollable list with answers + source links
- "Play just this category" CTA → `/play?category=italian_brainrot` (requires new param)
- Related categories
- Outbound links to Italian Brainrot wiki, Know Your Meme — these build topical trust

**`/about`** — short, branded, no fluff
**`/blog/[slug]`** — weekly pack drops + lore explainers (Phase 1)

### 7.3 Technical SEO checklist

Add to repo this week:

- [ ] `<title>` + `<meta description>` per route via `expo-router` Head component (or `<Head>` from `expo-router/head`)
- [ ] Open Graph tags: `og:title`, `og:description`, `og:image`, `og:type=website`
- [ ] Twitter card: `twitter:card=summary_large_image`, `twitter:site=@playbrainrot`
- [ ] `public/robots.txt`
  ```
  User-agent: *
  Allow: /
  Disallow: /play
  Disallow: /r/
  Sitemap: https://playbrainrot.app/sitemap.xml
  ```
- [ ] `public/sitemap.xml` — index `/`, `/friends`, `/about`, `/category/*`, `/credits`
- [ ] `public/llms.txt` — per the emerging GEO standard; one paragraph + link list pointing AI crawlers at the canonical pages
- [ ] Canonical link tags (each route → its own canonical URL)
- [ ] Schema.org JSON-LD:
  - On landing: `WebApplication` + `Game`
  - On category pages: `Quiz` with `Question` children, sources cited
  - On about: `Organization`
- [ ] `manifest.webmanifest` for PWA install
- [ ] Real favicons (16, 32, 180, 192, 512) + apple-touch-icon
- [ ] Dynamic OG image generation for `/result?correct=N&pattern=...` so shared score-card links preview as actual score cards in iMessage/Twitter/Discord

### 7.4 GEO / AI-search optimization

ChatGPT, Claude, Perplexity, Bing Copilot all scrape and cite — and they're how Gen Alpha asks "what's the funniest brainrot character." Optimize for citation:

- Every category page has a 1-paragraph **citable answer** at the very top ("Italian brainrot is a 2024–2025 TikTok phenomenon of AI-generated anthropomorphic characters with Italian-named names like Tralalero Tralala (a three-legged shark in Nikes). Originated in Italian TikTok comments…")
- Every fact has a source link inline
- `llms.txt` at root pointing at the category pages as the canonical "explain X" destinations
- Use `<article>` semantic HTML — RN-Web emits `<div>` by default; need to set role/accessibilityRole properly

### 7.5 What NOT to do

- ❌ FAQPage schema — Google restricted rich results to gov/healthcare in Aug 2023 for commercial sites
- ❌ HowTo schema — deprecated Sept 2023
- ❌ Programmatic per-question landing pages (`/q/q001`) — would create 200 thin pages and trigger thin-content penalties. Category pages are the right grain.
- ❌ Keyword-stuffed copy. The audience can smell it from orbit.

---

## 8. Marketing & growth plan

### 8.1 The viral loop

The product IS the marketing engine. Two share artifacts:

1. **Score card text share** (today) — `Brainrot Daily #142 — 4/5 🟩🟩🟥🟩🟩 playbrainrot.app/r/UNMSSA`
2. **Friend room invite** (today) — `🧠 brainrot in 30s — join now / room code: RIZZ42 / playbrainrot.app/r/RIZZ42?start=...`

Both already work end-to-end. What's missing:

- **OG image previews** — when the share-text link is pasted into iMessage / Discord / Twitter, it should render a styled card showing the score grid + room code + a play button. **Build this first** — multiplies every existing share by 10x clickthrough.
- **TikTok deep link** — the score card share button should pre-fill a TikTok DM template (or open the share sheet with a known-good caption). Phase 3 in ROADMAP.

### 8.2 Launch channels (ordered by ROI for this audience)

| Rank | Channel | Tactic |
|------|---------|--------|
| 1 | **TikTok** | Daily score-card screenshots posted from a brand account. Plus 5–10 creator partnerships ($50–200 each) — micro-creators in the brainrot/Italian-brainrot lane have insane engagement and low rates. |
| 2 | **Reddit** | Organic posts in r/Brainrot, r/SkibidiToilet, r/GenAlphaTok, r/ItalianBrainrot. Weekly cadence. Genuine engagement first, link drops second. |
| 3 | **Discord** | Friend rooms ARE the use case. Seed the largest brainrot / TikTok-meta servers — let server owners try the synced mode in their voice channels. |
| 4 | **Twitter/X** | Daily score posts. Reply guy in brainrot threads. Low-effort high-reach. |
| 5 | **Instagram Reels** | Same content as TikTok, cross-posted. Doesn't cost extra. |
| 6 | **Press** | Save for the 5k-MAU mark. Angle: "Gen Z trivia game about brainrot memes goes viral." Pitch to The Verge, Polygon, Kotaku, Dazed. |

### 8.3 Partnership shortlist (creators worth $50–200 each)

Research targets (NOT booked yet — confirm before reaching out):
- Italian-brainrot focused TikTokers (sub-100k follower range, $50–80 a post)
- Skibidi-lore explainer accounts
- "what does X mean" Gen Alpha explainer creators
- Brainrot-tier-list YouTubers (medium-effort sponsored mention)

Avoid: anyone who'd brand this as "for kids." It's not.

### 8.4 Anti-pattern: paid acquisition before product-market fit

Don't spend $ on Meta or TikTok ads until D7 retention ≥ 30% (the Phase 3 gate from ROADMAP). Score cards + organic = the only test of whether the product is sticky. Paid amplifies whatever the product is — sticky or leaky.

---

## 9. UX/UI improvements (prioritized)

The design system (`ui-ux-pro-max` recommendation cross-checked against `docs/DESIGN_NOTES.md`) is already directionally right: retro-futurism / playful / neon-on-dark. The current implementation is broadly aligned. Refinements:

### Tier 1 — affects every visitor

- **Add the marketing landing.** Already in §5.
- **Add real metadata.** No more empty `<title>`.
- **Real favicon + app icon.** 1024×1024 source. Take the lime "DO YOU EVEN BRAINROT?" wordmark and crop the `B` as a glyph in a chunky lime-on-ink square.
- **Onboarding microcopy.** First-time visitor on `/play` (no streak yet) should see a tiny first-time bubble: "30s per question. answer fast for bonus points. don't lose your streak."

### Tier 2 — closes Phase 0 gate

- **Real fonts.** Currently we *reference* Space Grotesk / Inter / JetBrains Mono in `tailwind.config.js` but don't load them — render falls back to system. Add `@expo-google-fonts/space-grotesk` etc., or load CSS-side on web only.
- **Reduced-motion respect.** Wrap the tilt + emoji-splat with `useReducedMotion()` — when set, flatten to zero rotation and zero floating decorations.
- **Keyboard navigation on web.** Tab through answer cards, Enter to lock in, 1–4 keys as A–D shortcuts. Massive desktop accessibility win.
- **Touch targets ≥ 44×44.** Audit the small "← back" / ghost buttons; some are tight on small phones.

### Tier 3 — adds polish, doesn't block

- **Sound effects** with a settings toggle. One snappy "tap" sound, one celebration, one death rattle. Tinypops. Mute by default; opt-in in settings.
- **Confetti on streak milestones** (3, 7, 30, 100 days). Web: `canvas-confetti`. Native: `react-native-confetti-cannon`.
- **Animated number rollups** on score reveal (the score climbs from 0 → final over ~600ms).
- **Skeleton screens** during hydration (the brief "Cooking... 🍳" flicker on every fresh load).

### Tier 4 — character / lore deepening

- **Custom SVG character stickers** for Tralalero Tralala, Bombardiro Crocodilo, Ballerina Cappuccina, Tung Tung Tung Sahur, Brr Brr Patapim. Original geometric art (no copyright issues), use them as decorative emoji-splat replacements on category pages, settings, profile. Discussed earlier in the session.
- **Per-question imagery for the top 50 most-viewed questions** — extends the schema with an optional `image` field. Hand-pick from CC sources. Not all 200 — just the bangers.

---

## 10. Technical implementation — what to add to the repo

These are concrete commits, not phase work. Each should fit into a single PR.

### PR 1 — Metadata + favicons (1 day)
- Add `expo-router/head` `<Head>` component to every route with `<title>`, `<meta>`, `<link rel="canonical">`
- Add `<meta property="og:*">` and `<meta name="twitter:*">` per route
- Drop favicons into `public/` and reference in `app.json` `web.favicon`
- Generate `1024×1024` app icon SVG → PNG at all sizes

### PR 2 — Landing page (1–2 days)
- Move current `app/index.tsx` content to `app/play-now.tsx`
- New `app/index.tsx` = the marketing landing per §5
- LocalStorage check: if `brainrot.daily.v1` is set, auto-redirect `/` → `/play-now` on mount
- Wire all CTAs

### PR 3 — Static SEO assets (half day)
- `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt`
- All hand-written, regenerate sitemap via a script that scans `app/` for route files

### PR 4 — Category landing pages (2 days)
- New route `app/category/[slug].tsx`
- Static data file `src/lib/categories.ts` with intro copy + curated source links per category
- Pull the questions for that category from `data/questions.json`
- Add a `category` query param to `/play` (Phase 1.5)

### PR 5 — OG image generation (1 day)
- Build a `pages/api/og.tsx` (or Vercel `og` endpoint once deployed) that renders dynamic OG images for `/result` shares
- Score card with the emoji pattern + tagline rendered server-side as PNG
- Update the share text builder to point at the dynamic OG URL

### PR 6 — Real fonts (half day)
- `@expo-google-fonts/space-grotesk`, `@expo-google-fonts/inter`, `@expo-google-fonts/jetbrains-mono`
- Load in `_layout.tsx` with `useFonts`
- Web build: emit `<link rel="preconnect">` + `<link rel="preload">` for the three families

### PR 7 — Analytics + Sentry (1 day)
- PostHog SDK (`posthog-js` on web, `posthog-react-native` on native)
- Track: `daily_started`, `daily_completed`, `practice_played`, `room_created`, `room_joined`, `share_clicked`, `streak_lost`
- Sentry for crashes
- Both behind a runtime env flag so dev builds don't send

### PR 8 — Supabase auth + persistent streaks (3–5 days, BIG)
- Per `docs/TECH_SPEC.md` §"Auth flow"
- This closes the Phase 0 gate ("streak persists across reinstalls")
- Don't start until PR 1–7 are merged

### PR 9 — PWA setup (half day)
- `manifest.webmanifest` with name, short_name, theme_color, background_color, icons
- Service worker (Workbox via `next-pwa` equivalent for Expo Router)
- "Add to home screen" prompt after 3rd daily completion (not first)

### PR 10 — Native EAS builds (2 days, BIG)
- `eas.json` per `docs/TECH_SPEC.md` §"Build & ship"
- TestFlight submission for iOS
- Play Internal Testing for Android
- Closes the Phase 0 gate ("runs on iOS sim AND Android emulator")

---

## 11. Phased roadmap

### This week — ship the landing
- PR 1, PR 2, PR 3, PR 6 (metadata, landing, SEO assets, fonts)
- Buy domains, deploy to Vercel
- Submit to Google Search Console

### Next 2 weeks — close Phase 0
- PR 4 (category pages), PR 5 (OG images), PR 7 (analytics)
- Get 20 friends to play
- Watch PostHog, fix the 3 biggest UX leaks

### Month 2 — close Phase 0 gate + soft launch
- PR 8 (Supabase auth), PR 9 (PWA), PR 10 (native builds)
- iOS TestFlight + Android internal testing
- First 5 TikTok creator partnerships
- Reddit organic cadence starts

### Month 3 — Phase 1 (party mode realtime)
- See `docs/ROADMAP.md` §Phase 1
- Supabase Realtime channels for live cross-player leaderboard
- App Store + Play Store public launch
- Press kit + outreach

### Q2 — Phase 2 (1v1 ranked) + scale
- ELO + matchmaking + bots
- Weekly pack drops cadence
- $4.99/yr subscription
- 50k MAU target

### Q3+ — depth
- Localization (Italian, Portuguese, Spanish — biggest brainrot markets)
- UGC question submission + moderation
- Tournaments
- Phase 4 from ROADMAP

---

## 12. KPIs to watch

| Tier | Metric | Target | Why |
|------|--------|--------|-----|
| North star | DAU | 5k by end of month 3 | The single number |
| Acquisition | `/` → `/play` conversion | 40%+ | Are first-timers getting it? |
| Activation | % of new users completing first daily | 60%+ | Is the question loop sticky? |
| Retention | D7 | 30%+ | Phase 3 gate from ROADMAP |
| Virality | Share rate per completed daily | 25%+ | Is the score card doing its job? |
| Virality | Avg friends invited per share | 1.5+ | K-factor input |
| Monetization (Phase 1) | $2.99 unlock conversion | 5%+ | Phase 1 gate from PRODUCT_SPEC |
| Monetization (Phase 2) | $4.99/yr conversion | 1%+ | Phase 2 gate from PRODUCT_SPEC |

PostHog tracks the funnel and retention cohorts. Real numbers replace the "5,000+ daily players" placeholder on the landing the moment we have them.

---

## 13. Risks & guardrails

- **Brainrot is a fad.** It might fade by 2027. Hedge by treating "brainrot" as the wedge, not the moat — the moat is *"fast, free, daily, social trivia about whatever-the-internet-is-obsessed-with-right-now."* In year 2 the question pool drifts into post-brainrot Gen-Alpha culture (whatever that is) and the brand survives.
- **Copyright on character imagery.** `docs/DESIGN_NOTES.md` is explicit. Stick to original SVG art for characters, real photos only when CC-licensed. We've already audited this.
- **AI-generated questions look easy.** They're not. The question pool's value is the curated wit, not the count. Don't pad it.
- **App Store rejection risk.** "Brainrot" + Gen Alpha audience might trigger review concerns. Have the privacy policy + content disclaimers buttoned up before submission.
- **Real-time without a backend is a hack.** The synced-room timestamp trick works for friends on a Discord call. It will break the moment we try to support strangers playing strangers. Phase 1 must wire Supabase Realtime — non-negotiable for any scale.

---

## 14. References

- `CLAUDE.md` — working conventions
- `docs/PRODUCT_SPEC.md` — feature scope
- `docs/TECH_SPEC.md` — stack & architecture
- `docs/ROADMAP.md` — phase gates
- `docs/DESIGN_NOTES.md` — visual + tonal direction
- `docs/HANDOFF.md` — current shipped state
- Italian Brainrot Wiki, Know Your Meme — content sources
- Google: [Search Central docs](https://developers.google.com/search/docs), [Core Web Vitals](https://web.dev/vitals/)
- llms.txt spec: <https://llmstxt.org/>

---

*Built by humans, on a Discord call, with brainrot energy.*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Built by agricidaniel — Join the AI Marketing Hub community
🆓 Free  → https://www.skool.com/ai-marketing-hub
⚡ Pro   → https://www.skool.com/ai-marketing-hub-pro
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
