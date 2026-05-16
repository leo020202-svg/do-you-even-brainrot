# Blocked PRs — what we need from you to unblock

Two of the ten PRs in `docs/STRATEGY.md` §10 need accounts / credentials
that only you can create. Everything else is shipped (see commits
`35aee6f` for foundation + landing + SEO + categories + PWA, plus the
earlier strategy + handoff drops). Here's exactly what to provide and
what Claude will do once you do.

---

## PR 8 — Supabase auth + persistent streaks (3–5 days)

Closes the Phase 0 gate from `docs/ROADMAP.md`:
> Streak persists across reinstalls (tied to account).

### What you need to provide

1. **Create a Supabase project** at <https://supabase.com>
   - Free tier is fine for everything up to ~50k MAU
   - Region: pick whatever's closest to your launch audience (us-east-1 is a safe default)
2. **Configure auth providers** in the Supabase dashboard:
   - Apple Sign In (required for iOS App Store submission). Needs an Apple Developer account first ($99/yr).
   - Google Sign In (required for Android Play Store submission). Free.
   - Email magic link (fallback, free, already enabled by default).
3. **Drop the credentials into a `.env` file** at the repo root (NOT committed — `.gitignore` already excludes `.env`):
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
   The `EXPO_PUBLIC_` prefix exposes them to the client bundle — that's
   intentional. The anon key is meant for clients; row-level security
   in Supabase makes it safe.
4. **Apple Sign In setup** (if you want iOS auth working): see Supabase's
   guide — needs an Apple App ID, Sign-In-with-Apple service ID, and a
   key. Roughly 30 minutes of dashboard clicking once you have the
   developer account.

### What Claude will do once unblocked

A single PR (call it `feat/supabase-auth`) lands all of:

1. **Migrations** — runs the schema from `docs/TECH_SPEC.md` §"Data model":
   - `profiles` table (username, avatar_frame, title, xp_total, current_streak, longest_streak, last_daily_completed, created_at)
   - RLS policies: users can only read/write their own row.
2. **`src/lib/supabase.ts`** — typed client + RLS-aware data access helpers.
3. **`src/features/auth/`** — Zustand store for the auth session, with
   subscriber wiring so the daily store + settings store rehydrate when
   the user signs in / out.
4. **`app/(auth)/`** — sign-in screen with Apple / Google / email magic
   link buttons. Skippable (guest play still works), persistent banner
   prompting after the first daily completion.
5. **Migrate the daily store** — currently writes to AsyncStorage; once
   the user is signed in, mirror writes to Supabase and pull on hydrate.
   Conflict resolution: latest `completed_at` wins per `date`.
6. **Settings store same treatment** — practice prefs sync across
   devices once signed in.
7. **Update `docs/HANDOFF.md` + `docs/ROADMAP.md`** to mark the Phase 0
   gate item as closed.

Total scope: ~8 files added, ~3 modified, 1 migration. ~600 lines of
code + ~200 lines of SQL. One session in Dispatch or local Claude Code,
fed the prompt:

> Read docs/STRATEGY.md §10 PR 8 + docs/BLOCKED_PRS.md §"PR 8". The
> Supabase credentials are in .env (EXPO_PUBLIC_SUPABASE_URL + key).
> Wire auth per docs/TECH_SPEC.md §"Auth flow". Don't add anything
> beyond what's in that section.

---

## PR 10 — Native EAS builds for iOS + Android (2 days)

Closes the other Phase 0 gate item:
> App runs on iOS simulator AND Android emulator.

### What you need to provide

1. **Apple Developer account** — $99/year at
   <https://developer.apple.com/programs/enroll/>. Required for any
   App Store submission, TestFlight builds, and Apple Sign In. Even
   for testing on a real iOS device, you need this.
2. **Google Play developer account** — $25 one-time at
   <https://play.google.com/console/signup>. Required for Play Store
   submission and Play Internal Testing distribution.
3. **An Expo / EAS account** — free at <https://expo.dev/signup>. Sign
   in via `eas login` from the repo. EAS Build is free for up to
   ~30 builds/month on the Hobby plan.
4. **App icon + splash source** — a single 1024×1024 PNG. If you don't
   have one, Claude can generate a placeholder from the lime "B"
   wordmark (already in the design system) — say the word.
5. **App Store / Play Store metadata** — name, description, keywords,
   screenshots (5 per platform), privacy policy URL, support URL. None
   of these block the FIRST EAS build (TestFlight Internal Testing
   doesn't require store metadata), but they're needed before public
   launch.

### What Claude will do once unblocked

A single PR (call it `chore/eas-builds`) ships:

1. **`eas.json`** — three build profiles (development, preview,
   production). Versioning via `app.json` `version` + autoincrement
   build numbers.
2. **Bump `app.json`** — bundleIdentifier `app.playbrainrot.brainrot`,
   Android package `app.playbrainrot.brainrot`, real version `0.2.0`,
   correct icon + adaptive icon references, splash config.
3. **Generate app icon + splash from SVG source** — script in
   `scripts/generate-icons.js` that produces all the required sizes
   (1024 source → 180/192/512/192-maskable/512-maskable).
4. **Privacy policy + terms boilerplate** at `app/privacy.tsx`,
   `app/terms.tsx` (Apple / Google both require working URLs for
   submission).
5. **First TestFlight + Play Internal build** — run `eas build -p ios`
   and `eas build -p android`, post the build IDs back so you can
   distribute the dev artifacts to testers.
6. **GitHub Actions workflow** — `.github/workflows/eas-build.yml`
   that triggers an EAS preview build on every PR to `main` for
   manual review before merge. Free under the GitHub free tier.
7. **Update `docs/HANDOFF.md` + `docs/ROADMAP.md`** to mark the Phase 0
   gate item as closed.

Total scope: ~5 files added, ~2 modified. One session, fed the prompt:

> Read docs/STRATEGY.md §10 PR 10 + docs/BLOCKED_PRS.md §"PR 10". I've
> set up Apple Developer ($99/yr) + Google Play ($25 one-time) + an
> Expo account. `eas login` is done. Wire EAS per docs/TECH_SPEC.md
> §"Build & ship". Run a first TestFlight build at the end.

---

## What's NOT blocked (already shipped or shippable now)

These don't need anything from you — they're either done or only
need a deploy target:

- ✅ **PR 1** — Per-route metadata + favicons (foundation commit
  `35aee6f`)
- ✅ **PR 2** — Marketing landing at `/` (foundation commit)
- ✅ **PR 3** — Static SEO assets (robots, sitemap, llms.txt)
- ✅ **PR 4** — 8 category landing pages
- ✅ **PR 6** — Real Google Fonts (Space Grotesk + Inter + JetBrains Mono)
- ✅ **PR 7** — Analytics wrapper (no-op without PostHog key — flip on by
  setting `EXPO_PUBLIC_POSTHOG_KEY`)
- ✅ **PR 9** — PWA manifest

- 🟡 **PR 5** — Dynamic OG image generation. The wiring exists (OG meta
  tags point at `/og/default.png` etc.), but the actual image generation
  endpoint needs Vercel deployment to function. **Unblock by:** deploy
  the static build to Vercel + I'll add a `/api/og` Vercel Function in a
  follow-up.

---

## Recommended order

1. **This week:** Buy `playbrainrot.app` domain. Deploy the current
   static build to Vercel. Submit to Google Search Console.
   *(No code changes needed — `npm run build:web` outputs `dist/` ready
   to host.)*
2. **Next week:** Provision Supabase (PR 8). One coding session lands
   auth + persistent streaks. Phase 0 close-out item 1.
3. **Week 3:** Sign up for Apple Developer + Google Play + Expo, then
   PR 10. Phase 0 close-out item 2 — Phase 0 gate fully passed.
4. **Week 4:** Send link to 20 friends, watch the PostHog dashboard
   (add the key once Supabase auth is in), fix the 3 biggest leaks.
5. **Month 2:** Phase 1 (Supabase Realtime party mode). See
   `docs/ROADMAP.md`.

---

## Quick start: deploy the current build to Vercel today

```bash
# from the repo root, no credentials needed for the deploy itself
npm install -g vercel
vercel login            # sign in via GitHub
npm run build:web       # produces dist/
vercel --prod dist      # deploys the static folder

# Vercel will give you a temporary URL. To attach playbrainrot.app:
# 1. Buy the domain (Namecheap, Cloudflare Registrar, etc.)
# 2. In Vercel dashboard → Project → Settings → Domains → Add
# 3. Update DNS at the registrar to point at Vercel's CNAME
```

That alone closes the "this week's critical path" item from
`docs/STRATEGY.md` §0.
