# Viral Plan — research-driven roadmap

What I learned reading the 2026 viral-game landscape, distilled into a
ranked roadmap of what to ship. Companion to `docs/STRATEGY.md` (the
big-picture marketing + SEO plan) and `docs/COMPETITOR_LANDING_AUDIT.md`
(landing-page-specific patterns).

---

## Research takeaways

### What made Wordle / Connections viral and sticky

- **Scarcity beats abundance** for the *daily* slot. Josh Wardle has said
  the breakthrough was capping at one puzzle/day. Anticipation = retention.
- **Shareable emoji grid** that's spoiler-free and visually distinctive is
  the marketing channel. Twitter alone did most of Wordle's growth.
- **Zero signup friction.** Cited as the biggest single reason people try
  it. Every Wordle clone keeps this rule.
- **Connections** does the same trick at 3.3 billion plays/year — different
  cognitive task (lateral thinking vs spelling), same daily cadence + share
  artifact.
- **NYT cross-promo** between puzzles is a quiet retention engine — once
  you're on Wordle you discover Connections, Strands, Spelling Bee.

### What's actually working on TikTok in 2026

- **10–30 second rounds.** Short enough to film one perfect run + one
  hilarious failure and move on.
- **Reaction-driven gameplay.** Jump-scare and screamer games dominate
  because *your face becomes the content*. Games that produce strong
  expression on the player are TikTok-native; games that don't aren't.
- **AI-powered unpredictability.** New wave: prompt → bizarre output.
  Story games, image games, character generators.
- **Niche expertise > broad gaming content.** Creators who own one game
  out-grow generalists 3–4×. Implication: we want a *visible top tier*
  of brainrot lore-pilled creators.

### Geoguessr's design pattern

- **Daily mode with leaderboards + streak progression** as the
  retention layer.
- **High-skill mastery visible to spectators** (top players know road
  markings, signage, vegetation). Public mastery = aspirational content.
- **Three use cases stacked:** solo, friends, compete. Each one
  reinforces the others.
- **Paywall complaint:** custom maps + unlimited play paywall *hurts*
  growth. The free product needs to be playable, not crippled.

### Jackbox alternatives Gen Z actually uses (Discord-native)

- **Death by AI** — browser + Discord activity. Free.
- **Gartic Phone** — chaos via mixed skill levels. Drawing telephone game.
- **TextGame.ai** — AI fills empty seats with characters. **This is our
  bot mechanic, validated by a working product.**
- **AirConsole** — phone-as-controller browser console.
- Common thread: **free, browser-based, larger groups, content
  generated fresh every round.**

### Italian Brainrot meta (May 2026)

- **29 canonical characters** in the formal canon, 100+ documented in
  community wikis.
- **New characters appear daily.** The community develops new lore +
  relationships continuously.
- **Compound slang exists:** *"skibidi rizz"* (chaotic flirting),
  *"skibidi Ohio rizz"* (maximum chaotic meme energy). Tier-list videos
  thrive on this.
- **Dictionary-recognised slang as of 2026:** rizz, sigma, skibidi,
  gyatt, situationship, delulu — Cambridge/Oxford have officially added.
- **Existing competition:** BuzzFeed brainrot quizzes, an "Italian
  Brainrot Quiz" iOS app, sporcle quizzes. All are static, single-
  player, no friend mechanic. **Our edge is the multiplayer.**

### Why "share card" works (gap theory of curiosity)

- Emoji-decoded puzzles trigger the closed-gap dopamine hit when the
  answer lands.
- Polls / two-option choice formats on IG Stories / Reels boost reach
  even when one option is obvious.

---

## Where we stand vs the playbook

| Pattern | Have? | Notes |
|---------|-------|-------|
| One-day-scarcity daily | ✅ | Live; just demoted from headline per latest reframe. |
| Share artifact (emoji grid) | ✅ | `🟩🟥⬜` already shipping in share text. |
| Zero signup | ✅ | Hard rule. |
| Multiplayer-first positioning | ✅ | Just shipped. |
| Bots fill empty lobbies | ✅ | `src/lib/bots.ts`, deterministic. |
| Synced multiplayer | ✅ | `src/lib/sync.ts`. |
| Daily + unlimited stacked | ⚠️ | Have both but no third stack. |
| **Endless / survival mode** | ❌ | **Biggest gap** — Geoguessr-style "watch-me-fail" engine. |
| **Achievement / unlock system** | ❌ | Big gap — no progression beyond streak. |
| Reaction-driven moments | ⚠️ | Confetti + shake + verdict copy land but the visual moment isn't peak. |
| Per-character imagery | ✅ | 6 PD-licensed images shipping. |
| Spectator mode | ❌ | Phase 2. |
| User-submitted content | ❌ | Phase 4. |
| Tournaments | ❌ | Phase 4. |
| Push notifications | ❌ | Phase 3. |

---

## Ranked roadmap (ship in this order)

### Tier A — ship NOW (in this session if possible)

| # | Move | Why | Effort |
|---|------|-----|--------|
| 1 | **Endless Mode** — `/endless` or `/play?mode=endless`. Difficulty ramps (easy → medium → hard random). One wrong = game over. Survival count + score persists as a personal high-score. | Single biggest gap. TikTok-native "watch me fail at Q23" content engine. No daily-rollover dependency. Wordle has scarcity, we have endless — both/and beats either/or. | M |
| 2 | **Achievement / badge system** — 8 starter achievements (First Run, Certified Sigma, Cooked, Marathon, Brainrot Veteran, Friend Magnet, Streak Builder, Pack Specialist). Toast notifications on unlock; permanent display on `/profile`. | Geoguessr-style "what next." Drives a second retention loop beyond streak. Each unlock is a screenshot moment. | M |
| 3 | **High-score share artifact for Endless** — a separate text-share template ("I survived 23 questions of pure brainrot · beat me at playbrainrot.app/endless"). | TikTok-content fuel. Endless without share is wasted; share without endless has no score to share. | XS |

### Tier B — ship next session

| # | Move | Why | Effort |
|---|------|-----|--------|
| 4 | **Verdict screen → screenshot mode.** A "snapshot this" button that renders a stylized 1:1 ratio card with score + emoji grid + room code + handle, ready for IG/TikTok. Avoid native screenshot UI friction. | The current verdict is functional but not screenshot-bait. The card should be *the* thing they post. | M |
| 5 | **Daily themes inside Endless / Open** — rotating daily lens like "Italian Brainrot only", "Speed Demon: <5s avg", "Sigma Mode: hard only". Stacks on top of regular rounds, no new flow. | Variety inside the existing mode = lower churn. Doesn't compete with the daily, expands what "today's round" means. | S |
| 6 | **Per-question reactions / emote spam** — after answer reveal, mash a hot/skull/sigma emote that floats up on screen. In synced rooms, broadcasts to other players (Phase 1+ realtime). Solo: just a satisfying tap. | Reaction = the unit of social play. Even alone-with-bots, the act of reacting becomes a screenshot moment. | S |
| 7 | **Add 15–25 new questions** focused on the trending May-2026 characters: Lirilì Larilà, Frigo Camelo, Trippi Troppi, Cappuccino Assassino, and the dictionary-recognised slang (delulu, situationship, gyatt). | Question pool is the core moat. Currently 200; 29 canonical Italian brainrot characters means significant breadth left to cover. | S |
| 8 | **Visible global leaderboard for Endless** (top 100 high-scores). Anonymous; just nickname + score. Needs Supabase. | "Beat the top score" is a stronger hook than "beat a bot." | L (blocked on Supabase, see `docs/BLOCKED_PRS.md`) |

### Tier C — Phase 1+ (queue these)

| # | Move | Why | Effort |
|---|------|-----|--------|
| 9 | **TikTok deep-link sharing** — when score-card share is tapped on mobile, pre-fill the TikTok caption + hashtags. | Friction-removal at the conversion-from-share-to-content step. | M |
| 10 | **Creator partnerships** — 5 brainrot/Italian-brainrot tier-list TikTokers ($50–200 each) seeded with the game. Each gets a custom room code + UTM. | Bypasses paid-acquisition cost. Audience is already in the right context. | n/a (operational) |
| 11 | **Custom packs / UGC** — players submit a category and 5 questions; moderation queue; best ones become "creator packs." | UGC drives both content scale AND retention (creator wants to see their pack played). | XL — Phase 4 in `docs/ROADMAP.md`. |
| 12 | **Live tournaments** — weekly bracket with prizes. Needs realtime + scheduling. | Aspirational top tier (per "niche expertise" finding). Top players visible = aspirational content. | XL — Phase 4. |
| 13 | **Spectator mode for friend rooms** — watch a friend play live, react with emotes. | Spectator = social-presence even when you don't want to play. | L — Phase 1. |
| 14 | **Voice / audio** — mock-Italian narrated questions for synced rooms. Hosts toggle on/off. | Per `docs/PRODUCT_SPEC.md` §"Brainrot-specific twists" — optional voiceover already specced. | L — Phase 1. |

---

## What we will deliberately NOT do

- **Pay-to-win mechanics, loot boxes, energy systems.** Per `docs/PRODUCT_SPEC.md` non-features.
- **Aggressive ads.** Same.
- **Chat between strangers.** Moderation cost too high; emote-only in 1v1.
- **Tutorial-before-first-question.** `docs/DESIGN_NOTES.md` is explicit.
- **Mascot character branding** (a Blooket-style 3D pig). Audience reads it as patronising. The *content* is the character cast.
- **Long form intake / email gates.** Anti-pattern per `docs/COMPETITOR_LANDING_AUDIT.md`.
- **Lift TikTok screenshots / AI character art** outside the safe-licensed pool. Already shipping 6 Public-Domain Wikimedia images; expand only via that channel.

---

## KPI targets (revised)

The original `docs/STRATEGY.md` §12 targets stand. Adding endless-specific:

| Metric | Target | Source signal |
|--------|--------|---------------|
| Endless high-score share rate | 30%+ of completions | "I survived 23..." text shares |
| Endless replay rate | 3+ runs per session | Local PostHog event |
| Achievement unlock rate | 80% of players unlock 3+ in first session | First-session funnel |
| Daily DAU as % of total DAU | Drops to <40% over 30 days | Means open-round is winning — that's the goal |

If we ever see >70% of DAU is the daily, we've over-emphasised it and
should re-reframe again.

---

## Sources

- [Wordle viral growth analysis — MoEngage](https://www.moengage.com/blog/wordle-viral-growth-story/)
- [TikTok gaming trends 2026 — Viryze](https://viryze.com/blog/tiktok-gaming-trends-2026)
- [Geoguessr article — Webiano](https://webiano.digital/geoguessr-is-still-one-of-the-smartest-games-on-the-internet/)
- [Italian brainrot character list (29 canon, 100+ documented) — BrainrotHub](https://brainrothub.com/blog/italian-brainrot-characters-abilities-lore)
- [Jackbox alternatives 2026 — Team Games](https://teamgames.club/alternatives/jackbox)
- [Gen Z slang in dictionaries 2026 — PoliLingua](https://www.polilingua.com/blog/post/gen-z-words-gen-alpha-words.htm)
- [Italian Brainrot — Wikipedia](https://en.wikipedia.org/wiki/Italian_brainrot)
- [Emoji quiz mechanics + gap theory of curiosity — Typito](https://typito.com/blog/emoji-quiz-with-answers-2026/)
