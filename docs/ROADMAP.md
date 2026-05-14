# Roadmap

Phased build plan. Each phase has a gate — don't move to the next until the gate passes.

## Phase 0 — Foundation + Daily Challenge

**Goal:** Ship a free single-player daily quiz with shareable score cards. Get the question loop working end-to-end.

**Scope:**
- Expo project scaffolded with the layout in TECH_SPEC.md
- Supabase project + schema migrated (profiles, questions, daily_challenges, daily_results)
- Auth: Apple, Google, email magic link
- Daily challenge screen: 5 questions, 30s each, animated transitions
- Result screen with shareable score card (PNG export via `react-native-view-shot`)
- Streak tracking, displayed on profile
- 200 seed questions loaded from `data/questions.json`
- Daily question rotation logic (deterministic per day)

**Out of scope for Phase 0:**
- Party mode
- 1v1
- Cosmetics / unlocks
- Paywall
- Push notifications

**Phase gate:**
- App runs on iOS simulator AND Android emulator
- A user can sign up, complete a daily, get a shareable score card
- Streak persists across reinstalls (tied to account)
- Daily resets at local midnight, content is identical across users in same timezone
- 5 internal testers complete a full week-long streak run

**Estimated effort:** 4–6 weeks with focused work

## Phase 1 — Party Mode + Paywall

**Goal:** Ship the viral hook. One person owns the app, friends join via web. Convert installs into $2.99 unlocks.

**Scope:**
- Web join page at `playbrainrot.app/join` (Vite + simple WS client, deployed to Vercel)
- Party game state machine on the server (Edge Functions + Realtime channels)
- Host UI: pack selection, lobby, question flow, leaderboard, final screen
- Joiner UI (web): nickname entry, answer buttons, between-question waiting screen
- 6 packs at launch: Italian Brainrot 101, Skibidi Lore, Gen Alpha Slang, Viral Moments, Mixed Chaos, Meme History
- "Wrong answer count" reveal mechanic
- Mid-game breather cards (pre-built image pool, no AI generation yet)
- "Brainrot Brand" final round (text submissions + voting)
- Paywall: first pack free, rest gated by RevenueCat $2.99 unlock
- Shareable end-game results screenshot

**Phase gate:**
- Party game runs end-to-end with 8 players (1 host + 7 web joiners) with no desyncs
- Disconnect handling tested: player drops, game continues
- Paywall purchase + restore flow works on both iOS and Android (sandbox testing)
- 3 internal testers run a party game IRL without confusion

**Estimated effort:** 6–8 weeks

## Phase 2 — 1v1 Ranked Mode

**Goal:** Daily-retention engine. Get users opening the app every day to climb the ladder.

**Scope:**
- Matchmaking service: 5-second timeout, then spawn bot
- Bot opponents (see TECH_SPEC for behavior model)
- 1v1 match flow: category select, 7 questions, live opponent progress bar
- ELO ratings per category
- Daily quests (3 per day, refresh midnight UTC)
- Weekly leaderboards (top 100 per category)
- Cosmetics: avatar frames, titles, emote packs
- $4.99/yr "Brainrot Pro" subscription
- $0.99 cosmetic unlocks via RevenueCat

**Phase gate:**
- 10 concurrent 1v1 matches don't degrade real-time performance
- Bot matches feel indistinguishable from real ones in user testing (blind test 5 people)
- ELO converges to a stable distribution (verified with simulation)
- Daily quest completion ping shows in profile

**Estimated effort:** 8–10 weeks

## Phase 3 — Polish + Marketing Push

**Goal:** Real launch. Hit the install targets in PRODUCT_SPEC.

**Scope:**
- Push notifications (streak reminders, daily quest available)
- Onboarding tutorial
- Tutorial pack (free, teaches the mechanic)
- TikTok integration: deep links from shared score cards
- Hashtag campaign: 30 micro-creators ($50–200 each)
- App Store / Play Store optimization (screenshots, video, copy)
- Crashlytics, analytics dashboards

**Phase gate:**
- App Store + Play Store listings approved
- 5,000 organic installs in first 30 days
- 30% D7 retention

**Estimated effort:** 4–6 weeks

## Phase 4+ — Growth

If Phase 3 hits its gate, growth phase opens up:

- UGC question submission + moderation queue
- Tournaments (weekly bracket, prize unlocks)
- Creator-partnered packs (Costco Guys pack, etc.)
- Localization (Italian, Spanish, Portuguese — biggest brainrot markets)
- Daily-challenge friends leaderboard
- Brainrot Brand AI image generation (real API integration)

Don't plan past Phase 4 until you're there. Things change.

## How to use this file in Claude Code

- Always check which phase we're in before proposing work
- Don't anticipate Phase 1 features while building Phase 0
- If a refactor would help a later phase, note it as a comment but don't do it yet
- Update this file when a phase gate is passed
