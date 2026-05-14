# Do You Even Brainrot?

A trivia game about brainrot memes, Italian brainrot characters, Skibidi lore, Gen Alpha slang, and TikTok culture. Built with one codebase that ships to **iOS, Android, and the web**.

## Status — Phase 0

The single-player **Daily Challenge** is live in code:

- 5 deterministic questions per day, drawn from `data/questions.json` (200 hand-curated questions)
- 30-second timer per question with a speed bonus
- Wordle-style emoji score card (🟩 / 🟥 / ⬜) you can share to Stories
- Local streak tracking (current + longest) that survives refreshes

Party Mode and 1v1 Ranked are spec'd in `docs/` but **not** built yet — see `docs/ROADMAP.md` for the phase gates.

## Running it

```bash
npm install

# Web (Chrome, Safari, Firefox)
npm run web

# iOS simulator (requires Xcode on macOS)
npm run ios

# Android emulator (requires Android Studio)
npm run android
```

Open the URL the CLI prints (web defaults to `http://localhost:8081`).

### One-shot web build

```bash
npm run build:web      # outputs static files to dist/
```

The output is a regular static site — host on Vercel, Netlify, Cloudflare Pages, or `npx serve dist`.

## Stack

| Layer        | Choice                                  |
|--------------|------------------------------------------|
| Framework    | Expo SDK 52 (React Native + RN Web)      |
| Language     | TypeScript (strict)                      |
| Routing      | Expo Router v4 (file-based)              |
| Styling      | NativeWind v4 (Tailwind for RN + web)    |
| State        | Zustand                                  |
| Persistence  | AsyncStorage on native, localStorage on web (same `src/lib/storage.ts` API) |
| Sharing      | Web Share API → Clipboard fallback (`src/lib/share.ts`) |

This matches `docs/TECH_SPEC.md`. Supabase, RevenueCat, EAS, and PostHog are queued for later phases per `docs/ROADMAP.md` — for Phase 0, persistence stays on-device so the daily challenge plays end-to-end without backend setup.

## Layout

```
.
├── app/                       # Expo Router screens (each file = a route)
│   ├── _layout.tsx            # root Stack + hydration
│   ├── index.tsx              # home — "run today's daily"
│   ├── play.tsx               # 5-question flow
│   ├── result.tsx             # score card + share
│   └── profile.tsx            # streak + history
├── src/
│   ├── features/daily/store.ts   # zustand store (streak, history, hydration)
│   ├── lib/
│   │   ├── daily.ts           # deterministic daily picker (Mulberry32)
│   │   ├── questions.ts       # loads + types the seed JSON
│   │   ├── storage.ts         # cross-platform K/V
│   │   └── share.ts           # share-text builder + Web Share / Share fallback
│   ├── components/            # Screen, Button — shared atoms only
│   └── theme/colors.ts        # palette tokens (mirror tailwind.config.js)
├── data/questions.json        # 200 hand-curated questions (sacred — do not auto-generate)
├── docs/                      # PRODUCT_SPEC, TECH_SPEC, ROADMAP, DESIGN_NOTES
└── CLAUDE.md                  # working conventions for Claude Code
```

## How "the daily" works

Each calendar day picks 5 questions deterministically:

1. `dailyIndex(today)` = whole days since 2026-01-01 (local time).
2. That index seeds a Mulberry32 PRNG.
3. The PRNG draws 2 easy + 2 medium + 1 hard from the pool with no repeats.
4. Same input → same output on every device, so two players in the same timezone get the same challenge.

Once you've completed today's, the home screen locks until tomorrow.

## What's next

- Wire `supabase/migrations/` + auth (TECH_SPEC §"Auth flow")
- Push notifications for streak reminders (Phase 3)
- Party Mode lobby (Phase 1) — separate web join page at `playbrainrot.app/join`
- 1v1 Ranked w/ bot fallback (Phase 2)

Don't anticipate later phases while Phase 0 polish work remains — see `CLAUDE.md`.

## License

Private. Pre-launch.
