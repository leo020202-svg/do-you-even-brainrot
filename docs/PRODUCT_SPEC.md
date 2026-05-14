# Product Spec — Do You Even Brainrot?

## One-line pitch

A mobile trivia game where players compete on how much brainrot, Italian brainrot, Skibidi lore, Gen Alpha slang, and TikTok culture they actually know. Daily solo challenge, party mode for hangouts, 1v1 ranked mode for daily grinders.

## Target audience

Primary: Gen Z (16–25) and older Gen Alpha (12–15). They live on TikTok. They have $0–$20/month of impulse spend. They share screenshots constantly.
Secondary: Millennials who want to prove they "still get it" + parents/teachers playing along.

## Core game modes

### Mode 1 — Daily Challenge (single-player)

The lightweight, free, viral hook. Shipped first.

- 5 questions per day, mixed categories and difficulty.
- 30 seconds per question, with a speed bonus.
- After completion, a shareable score card auto-generates with the player's score, today's theme, and a styled brainrot emoji grid (Wordle-style):
  - Correct = 🟩, wrong = 🟥, skipped = ⬜
  - Example output: `Brainrot Daily #142 — 8/10\n🟩🟩🟥🟩🟩🟩🟨🟩🟩🟩`
- Streak tracker (consecutive days played). Lose your streak if you miss a day.
- Archive of past dailies is paywalled ($2.99 unlock).

**Acceptance criteria:**
- A new daily ships at midnight local time, deterministic per-user.
- Score card is screenshottable and looks distinctive enough to identify the game from one glance.
- Streak persists across app reinstalls (tied to account).

### Mode 2 — Party Mode (Kahoot-style)

The viral marketing engine. One person owns the app; everyone else joins via web.

**Host flow:**
1. Open app → tap "Party Mode" → pick a question pack (e.g. "Italian Brainrot 101", "Skibidi Lore", "Gen Alpha Slang", "Mixed Chaos").
2. App generates a 6-digit PIN.
3. Host shows PIN on their screen (or casts to TV).
4. Host starts the game when all players have joined.

**Joiner flow:**
1. Go to `playbrainrot.app/join` (or use in-app join if installed).
2. Enter PIN + nickname.
3. Wait in the lobby. See other players' names appear in real-time.
4. When host starts, the question appears with 4 colored buttons (A/B/C/D).
5. Fastest correct answer earns the most points (Kahoot-style curve).
6. After each question, see the leaderboard.

**Game structure:**
- 12 questions per game (~6–7 min).
- Mid-game "breather card" every 4 questions: shows a random brainrot character image + made-up stats. ~3 seconds. Pure vibes.
- After each wrong answer, show the **wrong-answer counts** on screen ("8 of you really thought Sigma Linguini Provolone was real"). This is the joke — surface the absurdity.
- Final round: "Brainrot Brand" — show an AI-generated character image, all players type a name in 20 seconds, everyone votes on funniest. Winner gets bonus points + a screenshot moment.

**Brainrot-specific twists vs. vanilla Kahoot:**
- Wrong-answer count reveals (above)
- Brainrot Brand round (above)
- Optional voice-over: if host enables, a synthetic Italian voice reads questions out loud (mock Italian, like the source memes)
- Themed lobby music (cappuccino-jazz loop, configurable)

**Monetization:** First pack free. Additional packs locked behind $2.99 "All Packs Forever."

### Mode 3 — 1v1 Ranked (QuizUp-style)

The retention engine. Daily reason to come back.

**Flow:**
1. Open app → tap "1v1" → pick category (Italian Brainrot / Skibidi / Slang / Creators / Mixed).
2. Matchmaking finds opponent (real player if available, bot if not — see TECH_SPEC).
3. 7 questions, head-to-head, ~90 seconds total.
4. Both players see each question simultaneously. Live opponent-progress bar at top.
5. Speed + accuracy = points. Wrong answer = no points (no negative).
6. Result screen: win/loss, XP gained/lost, ELO change.

**Progression:**
- ELO-based ranking: Bronze / Silver / Gold / Platinum / Brainrot Legend
- Daily quests: "Win 3 matches in Italian Brainrot category" → bonus XP
- Weekly leaderboards reset Sunday midnight UTC
- Unlockable cosmetics:
  - Avatar frames (e.g., unlock "Cappuccino Assassino" frame at 50 wins)
  - Title cards ("Certified Sigma", "Ohio Veteran")
  - Emote spam buttons usable during matches

**Monetization:**
- Free: 5 ranked matches per day
- $4.99/year "Brainrot Pro": unlimited matches, priority matchmaking, ad-free, all cosmetics
- $0.99 individual cosmetic unlocks

## Account & cross-mode progression

One account, shared across all three modes. Sign-up options: Apple ID, Google, email+OTP. No password (passwordless only).

Shared progression:
- XP from any mode counts toward a global level
- Daily streak counts any mode played that day
- Cosmetics earned in one mode display in others (your 1v1 avatar shows in party mode lobby)

## Content strategy

The 200 seed questions in `data/questions.json` are the launch content. Beyond that:

- **Weekly pack drops:** 20–30 new questions every Monday, tied to whatever's trending that week
- **Themed packs:** holiday packs (Halloween brainrot), creator-specific packs (Costco Guys, Hawk Tuah, Skibidi Universe), regional packs (Italian Brainrot Italians-Only Hardcore)
- **UGC submission** (Phase 4+): users submit questions, moderator queue, best ones ship with attribution

## Non-features (explicitly NOT building)

- ❌ Loot boxes, gacha mechanics, randomized pulls
- ❌ Pay-to-win answer reveals
- ❌ Aggressive interstitial ads
- ❌ Chat between strangers (1v1 is emote-only to avoid moderation hell)
- ❌ Tournament infrastructure in v1
- ❌ Voice chat
- ❌ Story / campaign mode

## Success metrics (north stars)

- Phase 0 success: 5,000 installs in first 60 days, 30% D7 retention
- Phase 1 success: 50,000 installs, 5%+ conversion to $2.99 unlock
- Phase 2 success: 25% of MAU plays 1v1 weekly, 1%+ on annual subscription

## Open product questions (decide before Phase 1)

These are deliberately unresolved. Don't decide them unilaterally — bring to the human:

1. Web-join for party mode: native PWA vs. simple static site with WebSocket join?
2. Does the daily challenge have a leaderboard among friends, or is it pure solo?
3. Bot opponents in 1v1: named individually ("RizzlerMain") or labeled honestly as bots?
4. Should "Brainrot Brand" round require an AI image API call (cost) or pre-generated rotating image pool (cheap)?
