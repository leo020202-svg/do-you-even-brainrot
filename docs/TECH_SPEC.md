# Technical Architecture

The stack is decided. Don't propose alternatives unless you hit a real blocker.

## Stack at a glance

| Layer | Choice | Why |
|-------|--------|-----|
| Mobile | **Expo + React Native + TypeScript** | One codebase iOS/Android, excellent agent ergonomics, mature |
| Styling | **NativeWind v4** | Tailwind classes in RN, fast iteration |
| State | **Zustand** | Tiny, no boilerplate, per-feature stores |
| Navigation | **Expo Router (v3+)** | File-based routing, no react-navigation config hell |
| Backend | **Supabase** (Postgres + Auth + Realtime + Edge Functions + Storage) | Free tier covers MVP, single dashboard, real-time built in |
| Real-time | **Supabase Realtime** (Postgres CDC) for v1, migrate to dedicated Socket.io if scale demands | Free with Supabase, sufficient for low concurrency |
| Build/deploy | **EAS (Expo Application Services)** | Submit to App Store / Play Store from CLI |
| Analytics | **PostHog** (later, not v0) | Self-host or cloud, generous free tier |
| Payments | **RevenueCat** | Cross-platform IAP, handles edge cases App Store/Play differ on |

## Repo layout

```
brainrot-app/
├── app/                       # Expo Router screens
│   ├── (auth)/
│   ├── (tabs)/
│   │   ├── daily.tsx
│   │   ├── party.tsx
│   │   ├── ranked.tsx
│   │   └── profile.tsx
│   └── party/[code].tsx       # Joiner screen
├── src/
│   ├── features/
│   │   ├── daily/             # Daily challenge logic
│   │   ├── party/             # Party mode (host + joiner)
│   │   ├── ranked/            # 1v1 matchmaking
│   │   └── progression/       # XP, levels, cosmetics
│   ├── lib/
│   │   ├── supabase.ts        # Client + types
│   │   ├── realtime.ts        # WebSocket helpers
│   │   └── analytics.ts       # Stub for now
│   ├── theme/                 # Colors, fonts, spacing
│   └── components/            # Shared atoms only (Button, Card, Text)
├── supabase/
│   ├── migrations/            # SQL migrations, ordered
│   ├── functions/             # Edge functions
│   └── seed.sql               # Seed data
├── data/
│   └── questions.json         # Source-of-truth seed
├── scripts/
│   └── seed-questions.ts      # Loads JSON into Supabase
└── eas.json                   # Build config
```

## Data model (Postgres)

Tables to ship in Phase 0, with Phase 1/2 additions noted.

### `users` (managed by Supabase Auth, with extension table)

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_frame text default 'default',
  title text default null,
  xp_total int not null default 0,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_daily_completed date,
  created_at timestamptz not null default now()
);
```

### `questions`

```sql
create table questions (
  id text primary key,                          -- e.g. 'q001'
  category text not null,                       -- 'italian_brainrot' | 'skibidi' | 'gen_alpha_slang' | 'viral_moments' | 'creators' | 'cross_platform' | 'deep_cuts'
  difficulty text not null,                     -- 'easy' | 'medium' | 'hard' | 'expert'
  question text not null,
  options jsonb not null,                       -- [{id:'A',text:'...'},...]
  correct_answer char(1) not null,              -- 'A'|'B'|'C'|'D'
  source text,
  tags text[] default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index on questions (category);
create index on questions (difficulty);
create index on questions (active);
```

### `daily_challenges`

```sql
create table daily_challenges (
  date date primary key,
  question_ids text[] not null,                 -- 5 question IDs
  theme text                                    -- optional flavor name
);
```

### `daily_results`

```sql
create table daily_results (
  user_id uuid references profiles(id) on delete cascade,
  date date references daily_challenges(date) on delete cascade,
  score int not null,
  pattern text not null,                        -- '🟩🟩🟥🟩🟩' for share card
  time_ms int not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, date)
);
```

### Phase 1 — party mode

```sql
create table party_games (
  code char(6) primary key,                     -- shareable PIN
  host_id uuid references profiles(id),
  pack_id text not null,
  status text not null default 'lobby',         -- 'lobby' | 'in_progress' | 'finished'
  current_question_idx int default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null              -- auto-cleanup after 24h
);

create table party_players (
  game_code char(6) references party_games(code) on delete cascade,
  player_id uuid,                               -- can be anon (no profile)
  nickname text not null,
  score int not null default 0,
  joined_at timestamptz not null default now(),
  primary key (game_code, player_id)
);

create table party_answers (
  game_code char(6) references party_games(code) on delete cascade,
  player_id uuid not null,
  question_idx int not null,
  answer char(1) not null,
  time_ms int not null,
  points int not null,
  primary key (game_code, player_id, question_idx)
);
```

### Phase 2 — 1v1 ranked

```sql
create table ranked_matches (
  id uuid primary key default gen_random_uuid(),
  player_a uuid references profiles(id),
  player_b uuid references profiles(id),
  player_b_is_bot boolean not null default false,
  category text not null,
  question_ids text[] not null,
  winner uuid,
  elo_change_a int,
  elo_change_b int,
  finished_at timestamptz
);

create table ranked_ratings (
  user_id uuid primary key references profiles(id) on delete cascade,
  category text not null,
  elo int not null default 1000,
  wins int not null default 0,
  losses int not null default 0,
  draws int not null default 0
);
```

## Real-time design

**Party mode:** Use Supabase Realtime channels per game code. Host publishes question events; players subscribe and submit answers. Game state lives in `party_games` + `party_answers` tables; Realtime broadcasts the changes.

Channel name: `party:{code}`. Events: `question_start`, `answer_submitted`, `question_end`, `game_over`.

**1v1 mode:** Same pattern, per-match channel `match:{id}`. Lower latency required than party mode (~200ms acceptable). If Supabase Realtime proves laggy under load, swap to a dedicated Socket.io server on Fly.io. Don't pre-optimize.

**Disconnect handling:** A player who disconnects mid-game keeps their slot for 30 seconds. After that, party-mode players are removed; 1v1 disconnects forfeit the match. Always test the unhappy path.

## Bot opponents (Phase 2)

For 1v1 when no live opponent matches within 5 seconds, spawn a bot.

Bot behavior:
- Pick from a pool of brainrot-themed names (`TralaleroTralala_2007`, `RizzlerMain`, `MogMaster6_7`, etc. — see `src/features/ranked/bot-names.ts`)
- Per-question response time drawn from a normal distribution scaled to the player's recent average
- Accuracy weighted by player's recent ELO bucket (bots at lower ELO miss more)
- 5% chance of an obviously "bad" answer to feel human

Bots are server-side simulated, not actual client connections.

## Auth flow

Supabase Auth, passwordless only:
- Apple Sign In (required for iOS)
- Google Sign In (required for Android)
- Email magic link (fallback)

No anonymous accounts for ranked. Daily/party allow guest play (anon device ID).

## Build & ship

- Local dev: `npx expo start`, test in Expo Go for iteration, EAS Dev Build for native features
- CI: GitHub Actions runs lint + type-check + tests on every PR
- Releases: EAS Build → TestFlight + Play Internal Testing → store submission
- Versioning: semantic (major.minor.patch). Sentry for crashes from v0.5+.

## Cost ceiling for first 6 months

- Supabase: $0 (free tier) until ~50k MAU, then $25/mo
- EAS: $0 (free tier), $99/yr when you're shipping weekly
- RevenueCat: $0 until $10k MTR
- Domain + Vercel for `playbrainrot.app/join`: ~$20/yr + $0 hosting

Total expected: <$200 over the first 6 months while pre-launch and early-growth. Bigger costs only kick in if you're winning.

## Decisions punted to later

- Push notifications (Phase 1+) — Expo Notifications, not OneSignal
- Image storage for "Brainrot Brand" round images — Supabase Storage, public bucket
- AI image generation for new characters — punt, use a pre-built pool in v1

## Hard rules

- No Firebase. (We don't need it; Supabase covers it.)
- No Next.js for the mobile app. (Expo Router only.)
- No GraphQL. (Postgres REST + RPC via Supabase client is enough.)
- No Redux. (Zustand is plenty.)
- No CSS-in-JS libraries. (NativeWind only.)
- No third-party trivia engine. (Build it.)
