# Project context for Claude Code

You are helping build **Do You Even Brainrot?** — a mobile trivia game about brainrot/Gen Alpha culture. This file is loaded on every session. Read it first, then read the docs in this order before doing anything else:

1. `docs/HANDOFF.md` — current shipped state + open gaps + how to resume
2. `docs/PRODUCT_SPEC.md` — what we're building
3. `docs/TECH_SPEC.md` — how we're building it (stack already chosen)
4. `docs/ROADMAP.md` — which phase we're in

## Working conventions

**Always plan before you build.** For any task with more than ~3 files of changes, write the plan first, get it approved, then execute. Use Plan Mode if available.

**Stay inside the chosen stack.** The stack in `TECH_SPEC.md` is decided — don't propose Flutter, Firebase, Next.js, or alternative ORMs unless explicitly asked. If you hit a real limitation, raise it and wait for a decision.

**Phase discipline.** Don't start work on later phases (party mode, 1v1) while Phase 0 (single-player + daily) is incomplete. Phase gates are listed in `docs/ROADMAP.md`.

**One concern per commit.** Small, reviewable diffs. Group infra changes, UI changes, and data-model changes into separate commits.

**TypeScript strict mode.** All new code is TypeScript. `strict: true` in tsconfig. No `any` without a comment explaining why.

**No silent dependencies.** When you add an npm package, mention what it's for in the commit message. Prefer fewer, well-maintained deps.

**Question content is sacred.** The questions in `data/questions.json` are hand-curated and sourced. Don't auto-generate, paraphrase, or "improve" them without explicit permission. Treat them like seed data.

**Real-time logic is risky.** For party mode and 1v1, write integration tests for the WebSocket flows. Race conditions and disconnects are the most common bugs.

**Don't add analytics, telemetry, or tracking** without a request. We'll wire in PostHog or similar deliberately when we're ready.

## Code style

- Folder layout: feature-based, not type-based (`features/party-mode/`, not `components/`, `screens/`, etc.)
- Component naming: PascalCase files, kebab-case folder names
- State: Zustand stores per feature, kept small. No Redux.
- Styling: NativeWind (Tailwind for RN). Theme tokens in `src/theme/`.
- Server functions: colocate with the table they operate on in `supabase/functions/`.

## Communication style

- Be direct. Don't pad responses with "I'll start by..." preambles.
- When in doubt about a product decision, ask one focused question.
- When you find a real blocker, surface it immediately. Don't work around silently.
- After completing a meaningful unit of work, give a one-line summary of what changed and what's next.

## What "done" means for any task

1. Code compiles, types check, lints clean
2. Manually verified on iOS simulator AND Android emulator (or at least one with a note about the other)
3. New behavior has at least one test if it's non-trivial logic
4. Commit message explains *why*, not just *what*
5. README / spec updated if the change affects user-visible behavior

## Anti-patterns to avoid

- Don't reach for class components. Function components + hooks only.
- Don't bring in a state management library to solve a single-component problem.
- Don't write CSS-in-JS — NativeWind only.
- Don't write your own auth. Supabase Auth or bust.
- Don't optimize before measuring. Build it, then profile.

## When you're stuck

Ask. The human running this would rather answer a clarifying question than review a wrong PR.
