# Kickoff prompt — paste this into Claude Code

Copy everything between the lines below into your first Claude Code message inside this folder.

---

You're going to help me build "Do You Even Brainrot?" — a mobile trivia game about brainrot memes, Italian brainrot characters, Skibidi Toilet lore, Gen Alpha slang, and TikTok culture.

**Before doing anything else, read these files in order:**
1. `CLAUDE.md` (working conventions)
2. `docs/PRODUCT_SPEC.md` (what we're building)
3. `docs/TECH_SPEC.md` (the stack — already decided)
4. `docs/ROADMAP.md` (phased plan — we're starting Phase 0)
5. `docs/DESIGN_NOTES.md` (UI/UX direction and content principles)
6. Skim `data/questions.json` so you know what the seed content looks like (200 questions, structured)

**After reading, do these in order:**

**Step 1 — Confirm your understanding.** In your own words (under 200 words), summarize: what we're building, the stack, what Phase 0 ships, and the phase gate that must pass before Phase 1 starts. If anything is ambiguous, ask one focused clarifying question.

**Step 2 — Propose a Phase 0 plan.** Break Phase 0 into 8–15 ordered, named tasks (e.g. "scaffold Expo project", "set up Supabase project + auth", "write questions table migration", "build daily challenge screen UI", etc.). For each task, list: the goal, the key files it touches, and an estimated complexity (S/M/L). Do NOT write code in this step. Show me the plan first.

**Step 3 — After I approve the plan, scaffold the project.** Start with the first task. Create one commit per task, with a clear message. After each task, stop and let me review before moving on.

**Important constraints:**
- Stay strictly inside the stack in TECH_SPEC.md. No Flutter, no Firebase, no Next.js for the mobile app.
- Don't touch Phase 1 or Phase 2 work yet. Don't pre-build scaffolding for party mode or 1v1.
- Don't auto-generate or paraphrase the questions in `data/questions.json` — that file is sacred.
- TypeScript strict mode. No `any` without a justifying comment.
- One concern per commit.

Ready when you are. Start with Step 1.

---

## Optional: How to actually run Claude Code in this folder

Open your terminal:

```bash
cd /path/to/do-you-even-brainrot
npx @anthropic-ai/claude-code        # first time, downloads & runs
# or, if installed globally:
claude
```

Inside the Claude Code session:

- **Paste the prompt above** as your first message.
- Use `/init` if Claude doesn't seem to be reading `CLAUDE.md` — that forces it.
- Use **Plan Mode** for any task touching more than a few files. Toggle with `/plan` (or hit the shortcut shown in the UI).
- Use `/diff` to review changes before committing.
- Use `/clear` to start a fresh session when context fills up — but make sure `CLAUDE.md` is up to date so the next session has the latest decisions.

## When to step in vs. let Claude run

**Let Claude run autonomously when:**
- Scaffolding boilerplate (folder structure, configs, migrations)
- Writing tests for already-specified logic
- Refactoring with clear goals

**Step in and review carefully when:**
- New dependencies are being added (verify what they do)
- The database schema is changing
- Auth or payment flows are being touched
- Anything mentions "I had to work around" — that's a code smell

## Useful follow-up prompts as you go

After Phase 0 scaffolding is done:

> "Run the app on iOS simulator and screenshot the daily challenge screen. Show me what it looks like."

When you hit a bug:

> "The daily challenge isn't persisting streak across reinstalls. Debug it. Show me your hypothesis before changing code."

When you want to move to Phase 1:

> "Phase 0 gate is passed. Update ROADMAP.md to mark Phase 0 complete. Then read PRODUCT_SPEC.md again for Phase 1 (party mode) and propose a plan for it."

When the question pool needs refreshing:

> "We're three weeks into launch. Pull the top 20 most-missed questions and propose 30 new questions to ship next Monday. Don't write them yet — just propose categories and themes."

## Things to NOT ask Claude Code to do

- Choose between alternative stacks. The decisions are in TECH_SPEC.md. Don't relitigate.
- Sign up for accounts (Supabase, Apple Developer, RevenueCat) — you do that, give Claude the keys via `.env`.
- Submit to the App Store or Play Store. EAS Submit is great but the actual review/listing is on you.
- Make creative decisions about pricing, marketing copy, or partnerships. Those are yours.

Good luck. Ship it.
