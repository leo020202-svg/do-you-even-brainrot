# Competitor landing audit — party trivia + daily-share games

Patterns extracted from the live landing pages of the products our players
already know: Kahoot, Skribbl, Blooket, Gimkit, Wordle (NYT + clones),
Jackbox, Quizizz. Fed back into `docs/STRATEGY.md` §5 (landing page spec)
and any subsequent landing tweaks.

---

## TL;DR — what to steal, what to skip

**Steal (in order of estimated conversion impact):**

1. **Inline room-code input on the landing** — Kahoot's whole joiner flow at `kahoot.it` is just one box. Skribbl, Gimkit, and Blooket all surface "got a code?" directly on the home page. We make players click through to `/friends` first; one less tap matters.
2. **"No signup / no install" pill in the hero** — Kahoot says "No credit card needed" *inline under the CTA*. Skribbl leads with "free online multiplayer." We bury this in FAQ.
3. **Direct-link bypass for shared rooms** — `kahoot.it/join?pin=XXXXXX` skips the form. We already have `/r/CODE` ✅.
4. **Two-CTA split on the hero** — every single party-game site has a primary "Play" + a secondary "Create / Join" / "Host" button. We have this ✅.
5. **Daily-mode signposting** — Wordle clones lead with "Daily" tab. Our `Daily #N` chip in the hero is good; could be more prominent.
6. **Free upfront, no email gate** — Skribbl explicitly free; Kahoot says "Start for FREE." Our pricing isn't mentioned anywhere on the landing copy.

**Skip:**

- **Corporate trust logos** — Kahoot has HP/Amazon/Meta. Wrong audience. Our trust signal is TikTok creator names + shared score-card screenshots once we have them.
- **Mascot character branding** — Blooket's 3D pig blob, Jackbox's per-game characters. Works for them, would feel forced for brainrot (the *characters* are the content, not a mascot).
- **Login walls for hosts** — Blooket / Kahoot gate host functions. We have no host gating because we have no monetisation yet, and shouldn't add one until Phase 1.
- **Long form intake** — Quizizz / Quizlet ask for email upfront. Anti-pattern for our audience; daily share is the email-capture replacement.

---

## Site-by-site notes

### Kahoot.com (the host-facing flagship)

- Headline: **"Make learning awesome!"**
- Sub: "The ultimate way to engage, learn, and play — loved by billions worldwide."
- Primary CTA: **"Start for FREE"** (with "No credit card needed" microcopy directly under)
- Five-icon nav row labeled with verbs: *Discover · Learn · Present · Make · Join*
- App store badges in the hero
- Trust logos: HP, Amazon, Meta, Salesforce, universities — *"Trusted by leading companies and universities worldwide"*
- Distinct routes for joiners vs hosts: `/play` → `kahoot.it`; "Start for FREE" → `create.kahoot.it`

**Takeaway for us:** the verb-noun nav split (Play / Make / Join) is sharper than our current single-CTA approach. Worth considering for the eventual Phase 1 nav.

### kahoot.it (the joiner page)

- The simplest page on the internet: one giant PIN input and a "Enter" button
- Direct-link bypass: `kahoot.it/join?pin=XXXXXX` skips the form entirely
- Numeric-only PINs, 6–10 digits
- Nickname step after PIN, with random-nickname generator option

**Takeaway for us:** the room-code input should be inline on `/`, not gated behind a click to `/friends`. Our codes are alphanumeric (more entropy, less typo-prone), which is fine — even slightly more brandable.

### Skribbl.io

- Headline: blunt — *"a free online multiplayer drawing and guessing pictionary game"*
- Primary CTA: **"Play!"**
- Secondary: **"Create Private Room"**
- 5 visual tutorial cards above the fold, then settings panel
- No social proof / counters — relies on the immediate-play promise
- "Invite your friends!" with copy-to-clipboard

**Takeaway for us:** the visual step-by-step tutorial is high-value. Our landing has a 3-step text "how it works" — could be screenshot-cards instead.

### Gimkit.com

- Hero CTA: **"Get started for free!"**
- Join page at `/join` is a pure code box → nickname → "Join" button
- Hosting requires teacher account; joining is free

**Takeaway for us:** the "free to play" framing is consistent across all party games. Make it explicit.

### Blooket.com

- Heavy mascot branding (3D pig "Blook" since the Feb–Mar 2025 redesign)
- Login + signup pages redesigned 2024
- Host = login required; join = no login

**Takeaway for us:** mascot-heavy works for K-12 audience. We're 12–25; a mascot would feel patronising. Stick with emoji decorations.

### Wordle (wordlegame.org clone, since the NYT site blocks scraping)

- Two clear top-level routes: **"Daily"** + **"Unlimited"**
- Primary CTA: **"Play"**
- Share emoji grid 🟩🟨⬜ explicitly called out — *"copy and share your results without spoilers"*
- Variant-game cross-promo (Dordle, Quordle, Octordle)
- **No streak counter on the landing** — somewhat surprising

**Takeaway for us:** the Daily/Unlimited split is interesting. Our equivalent is Daily + Practice + Friend Rooms. The unlimited-replay framing might be stronger than "practice."

### Jackbox.com

- (Couldn't scrape — Cloudflare block.) Known patterns from coverage:
  - Trailer/video as the hero visual
  - Heavy use of game-specific characters and humor
  - Party-pack structure — sells bundles, not single games
  - Strong sticky CTA on mobile

**Takeaway for us:** trailer/video hero is heavy-lift but converts in entertainment categories. Consider for Phase 3 polish.

### Quizizz / Quizlet (couldn't scrape directly)

- Both gate first interaction behind signup
- Both have prominent "for teachers / for students" splits

**Takeaway for us:** we deliberately don't gate. Don't add a signup wall on the landing under any circumstance.

---

## What we currently do well (compared to the audit)

- ✅ Two-CTA hero (`play today's daily` + `play with friends`)
- ✅ Visual decorations (emoji splat scattered behind content)
- ✅ Auto-redirect for returning players (`<Redirect href="/home">`)
- ✅ Direct-link bypass for friend rooms (`/r/CODE`)
- ✅ Wordle-style emoji-grid share artifact (in the share text builder)
- ✅ No signup required to play
- ✅ Streak mechanic (Wordle clones don't all surface this!)
- ✅ Synced multiplayer without a backend (none of the others do this)

## What we should fix (prioritised)

| # | Change | Effort | Impact |
|---|--------|--------|--------|
| 1 | Inline room-code input on `/` — "got a code? join here" | S | HIGH |
| 2 | "no signup · no install · free forever" pill in the hero | XS | HIGH |
| 3 | Replace 3-step text "how it works" with screenshot cards | M | MEDIUM |
| 4 | Add a sample question above the fold (tap-to-peek answer) | M | MEDIUM |
| 5 | Daily index more prominent — make `#142` a clickable chip not just a tag | XS | LOW |
| 6 | "today's daily drops at midnight local" countdown | S | LOW (charming) |
| 7 | Add a `/play?practice=unlimited` framing toggle vs. just "practice mode" | XS | LOW |

Items 1 + 2 ship in the same commit as this audit.

---

## Sources

- [Kahoot landing analysis (WebFetch)](https://kahoot.com/)
- [Skribbl.io landing analysis (WebFetch)](https://skribbl.io/)
- [Wordlegame.org analysis (WebFetch)](https://wordlegame.org/)
- [Gimkit hero & join flow](https://www.gimkit.com/)
- [Blooket 2024–2025 redesign notes](https://blooket.fandom.com/wiki/Blooket_Redesign)
- [How to find Kahoot! PIN — Kahoot Help](https://support.kahoot.com/hc/en-us/articles/360000109048-How-to-find-Kahoot-PIN)
- [Jackbox design principles — Built In Chicago](https://www.builtinchicago.org/articles/jackbox-games-design-party-pack)
