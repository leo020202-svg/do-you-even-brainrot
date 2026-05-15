import { questions, type Question } from "./questions";

// Number of questions per daily challenge — matches docs/PRODUCT_SPEC.md.
export const DAILY_QUESTION_COUNT = 5;

// Wordle-style daily index. Day 0 is the day Phase 0 ships; bumping this changes
// what's "today's" challenge for everyone in the same local timezone.
const EPOCH = new Date(2026, 0, 1); // 2026-01-01 local

export function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function dailyIndex(d: Date = new Date()): number {
  const dayMs = 1000 * 60 * 60 * 24;
  const start = new Date(EPOCH.getFullYear(), EPOCH.getMonth(), EPOCH.getDate()).getTime();
  const today = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.max(0, Math.floor((today - start) / dayMs));
}

// Mulberry32 — small deterministic PRNG seeded by the day index. Same input,
// same output across iOS, Android, and web.
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = out[i];
    const b = out[j];
    if (a === undefined || b === undefined) continue;
    out[i] = b;
    out[j] = a;
  }
  return out;
}

export type DailyChallenge = {
  index: number;
  dateKey: string;
  questionIds: string[];
};

type DifficultyLabel = "easy" | "medium" | "hard";

const DEFAULT_DAILY_MIX: DifficultyLabel[] = [
  "easy",
  "easy",
  "medium",
  "medium",
  "hard",
];

function pickQuestionsForSeed(
  seed: number,
  mix: DifficultyLabel[] = DEFAULT_DAILY_MIX,
): string[] {
  const rng = mulberry32(seed);
  const picked: Question[] = [];
  const used = new Set<string>();
  for (const diff of mix) {
    const bucket = questions.filter((q) => q.difficulty === diff);
    const pool = shuffle(bucket.length > 0 ? bucket : questions, rng);
    const next = pool.find((q) => !used.has(q.id));
    if (next) {
      used.add(next.id);
      picked.push(next);
    }
  }
  while (picked.length < mix.length) {
    const pool = shuffle(questions, rng);
    const next = pool.find((q) => !used.has(q.id));
    if (!next) break;
    used.add(next.id);
    picked.push(next);
  }
  return picked.map((q) => q.id);
}

export function getDailyChallenge(d: Date = new Date()): DailyChallenge {
  const idx = dailyIndex(d);
  return {
    index: idx,
    dateKey: localDateKey(d),
    questionIds: pickQuestionsForSeed(idx + 1),
  };
}

/**
 * Practice run: same shape as the daily but seeded by `seed` instead of the
 * day index, so each round picks a fresh set of questions and the result
 * never counts toward the streak.
 *
 * `dateKey` carries the seed (prefixed `practice-`) so the play/reveal/result
 * screens can use it as a stable cache key without colliding with real
 * daily-results storage.
 */
export function getPracticeChallenge(
  seed: number = Date.now(),
  mix?: DifficultyLabel[],
): DailyChallenge {
  return {
    index: -1,
    dateKey: `practice-${seed}`,
    questionIds: pickQuestionsForSeed(seed, mix),
  };
}

/**
 * Friend-room challenge — same 5 questions for everyone who enters the code.
 * The room code is hashed to a seed (see src/lib/room.ts), so the question set
 * is deterministic per code; results don't update the player's streak.
 */
export function getRoomChallenge(code: string, seed: number): DailyChallenge {
  return {
    index: -1,
    dateKey: `room-${code}`,
    questionIds: pickQuestionsForSeed(seed),
  };
}
