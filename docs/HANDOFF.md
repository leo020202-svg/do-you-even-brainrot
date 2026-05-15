# Session handoff — pick up here

Whether you're resuming in Claude Code locally, in Claude Code Dispatch (web /
mobile), or from a fresh terminal, start by reading this file plus the four
files `CLAUDE.md` tells you to load. They're all checked into the repo.

## Where we are

**Phase 0 (single-player daily) is functionally complete** — the playable surface
is on `main` and pushed to GitHub. The phase-gate items from `ROADMAP.md` are
mostly green, with two real gaps (auth, EAS builds — see below).

### Shipped

| Feature                          | Notes                                              |
|----------------------------------|----------------------------------------------------|
| Daily Challenge — 5 questions    | Deterministic per local day, mixed difficulty       |
| 30s per-Q timer + speed bonus    | Skips remainder on answer, no waiting              |
| Wordle-style emoji score card    | Text share via Web Share API → clipboard fallback  |
| Streak tracking (local)          | AsyncStorage on native, localStorage on web        |
| Reveal screen between questions  | Correct answer + decoy count + running leaderboard |
| Fake bot leaderboard             | 4 brainrot-named bots, deterministic per day       |
| Final standings + medals         | Closes the daily with a Kahoot-style ranking       |
| Practice Mode (`/play?practice=1`) | Unlimited replays, no streak side effects        |
| Friend Rooms (`/friends`, `/r/[code]`) | Async no-backend "play with friends" via 6-char codes |
| Category artwork                 | 8 CC-licensed Wikimedia thumbnails on reveal screen|
| Credits screen (`/credits`)      | CC-BY-SA attribution                               |
| Loud "sticker" UI                | Per `docs/DESIGN_NOTES.md` — chunky shadows, tilts, emoji clutter |
| Phone-width content cap          | 480px max on web so desktop renders phone-sized    |

### Stubbed / open

| Gap                              | Notes                                              |
|----------------------------------|----------------------------------------------------|
| Supabase wiring                  | Schema is in `docs/TECH_SPEC.md`; nothing migrated yet |
| Auth (Apple / Google / magic link) | Phase 0 gate explicitly wants this; needs Supabase first |
| EAS builds for iOS / Android     | Only tested on web; native should "just work" but unverified |
| Server-synced streaks            | Currently device-local only                        |
| Image assets for app icon/splash | `app.json` references none — fine for dev, blocker for store submission |

### Not started (deliberately, per phase discipline)

- Phase 1: live Kahoot-style Party Mode (Supabase Realtime channels)
- Phase 2: 1v1 Ranked w/ ELO + bot fallback
- Push notifications
- RevenueCat paywall / pack unlocks
- PostHog / analytics

## Repo layout cheat sheet

```
app/                       # Expo Router screens — each file is a route
├── _layout.tsx            #   root Stack + hydrate the daily store
├── index.tsx              #   home — RUN IT / practice / play with friends
├── play.tsx               #   question + reveal phases (handles ?practice / ?room)
├── result.tsx             #   final verdict + standings + share
├── profile.tsx            #   streak history + credits link
├── credits.tsx            #   Wikimedia image attribution
├── friends.tsx            #   create/join friend rooms
└── r/[code].tsx           #   /r/RIZZ42 shortlink → /play?room=RIZZ42

src/
├── components/            # Sticker, Screen, Button, EmojiSplat
├── features/daily/store.ts# Zustand store (streak, history, hydrate)
├── lib/
│   ├── daily.ts           # picker — daily / practice / room challenges
│   ├── questions.ts       # types + active-only filter on data/questions.json
│   ├── storage.ts         # cross-platform K/V (AsyncStorage / localStorage)
│   ├── share.ts           # Web Share / clipboard fallback
│   ├── bots.ts            # deterministic fake-opponent engine
│   ├── room.ts            # friend-room code gen + seed hash
│   └── category-images.ts # require() table for assets/categories/*
└── theme/colors.ts        # mirror of tailwind.config.js palette

assets/categories/         # 8 CC-licensed JPGs/PNGs, one per category
data/
├── questions.json         # 200 hand-curated questions (SACRED — don't auto-edit)
├── questions.xlsx         # mirror of the above for human review
└── category-images-credits.json # attribution metadata

scripts/
├── export-questions-xlsx.py     # questions.json → .xlsx
└── download-category-images.py  # MediaWiki API → assets/categories/
```

## Local dev — getting unstuck fast

```bash
# Web (default — works on Windows / Mac / Linux)
npm install         # first time only
npm run web         # opens http://localhost:8081

# Native (Mac for iOS, Windows or Mac for Android)
npm run ios
npm run android

# Verify before committing
npx tsc --noEmit                 # strict typecheck must pass
npx expo export --platform web   # static export should succeed (writes ./dist)
```

The dev server hot-reloads on file change. If Metro gets confused after a dep
change, restart it: kill the `npm run web` process and run again.

## Working in Claude Code Dispatch

Dispatch runs Claude in the cloud against a connected GitHub repo. To resume
this project there:

1. **Connect the repo** in Dispatch:
   `leo020202-svg/do-you-even-brainrot` (private — make sure Dispatch has access).
2. **Each Dispatch session is fresh.** Claude re-reads `CLAUDE.md` on session
   start, but it doesn't remember the conversation we had locally. Brief each
   session with a concrete task — not "keep working."
3. **Good first prompts** for the next sessions:
   - *Wire up Supabase auth (Apple / Google / email magic link). Read*
     *`docs/TECH_SPEC.md` §"Auth flow", create the `profiles` migration,*
     *update `src/lib/supabase.ts`, swap the local-only daily store over.*
   - *Add a `eas.json` and `app/(auth)/*` per `docs/TECH_SPEC.md` and run a*
     *test EAS build for iOS + Android. Report blockers.*
   - *Phase 1 kickoff: design the `party_games` / `party_players` /*
     *`party_answers` realtime flow with Supabase channels. Don't code yet;*
     *propose 8–15 ordered tasks per `docs/KICKOFF_PROMPT.md`'s pattern.*
4. **Don't ask Dispatch to "continue everything."** Phase 1 alone is a 6-8
   week effort; break it into the tasks `ROADMAP.md` lists.
5. **The dev server doesn't follow you to Dispatch.** Dispatch runs in a
   sandbox — it can run `npx tsc --noEmit` and `npx expo export --platform web`
   to verify changes, but live preview is local-only. Pull and run `npm run
   web` on your laptop to see the UI.

## Working from CLI on a new machine

```bash
gh repo clone leo020202-svg/do-you-even-brainrot
cd do-you-even-brainrot
npm install
npm run web
```

Then `claude` (Claude Code) in the same folder — it'll read `CLAUDE.md` on
start.

## Things that will trip future sessions up

- **`metro` is pinned to 0.81.0** via `package.json` `resolutions` +
  `overrides`. Don't bump it without verifying Expo SDK 52 still bundles —
  newer Metro versions break `@expo/cli`'s TerminalReporter import.
- **`react-native-reanimated` is pinned to 3.16.7** because Reanimated 4
  needs RN 0.81+ and we're on 0.76. NativeWind's transformer loads
  `react-native-reanimated/plugin` from babel regardless of whether we use
  Reanimated, so the dep has to exist.
- **`babel-preset-expo` has `reanimated: false`** so we never try to load the
  Reanimated plugin chain — keep this if you upgrade NativeWind.
- **Questions are sacred** per `CLAUDE.md` — don't auto-generate or
  paraphrase `data/questions.json`. If you regenerate `data/questions.xlsx`,
  re-run `python scripts/export-questions-xlsx.py`.
- **Phase discipline.** Don't start Phase 1 / Phase 2 work while Phase 0 has
  open items (auth, EAS builds). Surface the gap; let the human decide.

## Recent commits worth knowing about

- `05ed49a` — Friend Rooms (async, no backend)
- `c56667a` — Cap content width to fix desktop overlap
- `3a21017` — Practice Mode (unlimited replays)
- `c76361f` — 8 CC-licensed category images + credits screen
- `596e35f` — Reveal phase + fake bot leaderboard
- `145fc8d` — Sticker / chunky UI pass
- `c6220a1` — Initial Phase 0 scaffold
