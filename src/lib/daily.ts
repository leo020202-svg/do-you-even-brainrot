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

function pickQuestionsForSeed(seed: number): string[] {
  const rng = mulberry32(seed);
  // Mix difficulties: 2 easy, 2 medium, 1 hard (per spec — mixed cats/difficulty).
  const buckets: Question[][] = [
    questions.filter((q) => q.difficulty === "easy"),
    questions.filter((q) => q.difficulty === "easy"),
    questions.filter((q) => q.difficulty === "medium"),
    questions.filter((q) => q.difficulty === "medium"),
    questions.filter((q) => q.difficulty === "hard"),
  ];
  const picked: Question[] = [];
  const used = new Set<string>();
  for (const bucket of buckets) {
    const pool = shuffle(bucket.length > 0 ? bucket : questions, rng);
    const next = pool.find((q) => !used.has(q.id));
    if (next) {
      used.add(next.id);
      picked.push(next);
    }
  }
  while (picked.length < DAILY_QUESTION_COUNT) {
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
export function getPracticeChallenge(seed: number = Date.now()): DailyChallenge {
  return {
    index: -1,
    dateKey: `practice-${seed}`,
    questionIds: pickQuestionsForSeed(seed),
  };
}
