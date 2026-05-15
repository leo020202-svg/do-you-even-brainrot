// Deterministic fake-opponent engine for the daily challenge.
//
// Solo daily play feels lonelier than the Kahoot vibe we're shooting for, so
// we fabricate a 4-bot "leaderboard" the player races against. Each bot has a
// fixed skill/speed profile; per-question outcomes are seeded by
// (daily_index, bot_name, question_index) so the same daily produces the same
// shadow leaderboard for everyone in the same timezone.
//
// Phase 2 swaps these for real 1v1 opponents (and proper Bot AI in
// src/features/ranked/) — for now this is pure flavor.

import { questionsById, type Question } from "./questions";

export type Bot = {
  name: string;
  emoji: string;
  /** 0..1 — probability of getting a question of average difficulty right. */
  skill: number;
  /** Lower = faster average answer time (in ms). */
  speedBiasMs: number;
};

// Per TECH_SPEC §"Bot opponents (Phase 2)" — pool of brainrot-themed handles.
const POOL: Bot[] = [
  { name: "TralaleroTralala_2007", emoji: "🦈", skill: 0.74, speedBiasMs: 7500 },
  { name: "RizzlerMain", emoji: "🥶", skill: 0.62, speedBiasMs: 11000 },
  { name: "MogMaster6_7", emoji: "💪", skill: 0.55, speedBiasMs: 9500 },
  { name: "OhioSigma", emoji: "💀", skill: 0.38, speedBiasMs: 14000 },
  { name: "SkibidiCEO", emoji: "🚽", skill: 0.81, speedBiasMs: 6500 },
  { name: "BrrBrrPatapim", emoji: "🌳", skill: 0.69, speedBiasMs: 8500 },
  { name: "HawkTuahFan", emoji: "🦅", skill: 0.45, speedBiasMs: 12000 },
  { name: "LinguiniProvolone", emoji: "🍝", skill: 0.58, speedBiasMs: 10000 },
  { name: "CappuccinoEnjoyer", emoji: "☕", skill: 0.72, speedBiasMs: 8000 },
  { name: "BombardiroIRL", emoji: "✈️", skill: 0.49, speedBiasMs: 13000 },
];

// Cheap string hash → uint32 for seeding. Same input always yields same output.
function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DIFFICULTY_MULT: Record<Question["difficulty"], number> = {
  easy: 1.25,
  medium: 1.0,
  hard: 0.75,
  expert: 0.55,
};

// Pick the 4 bots that "play" today's daily, deterministically from the day.
export function pickDailyBots(dailyIndex: number): Bot[] {
  const rng = mulberry(hashStr(`bots:${dailyIndex}`));
  const indices = new Set<number>();
  while (indices.size < 4) indices.add(Math.floor(rng() * POOL.length));
  return Array.from(indices)
    .map((i) => POOL[i])
    .filter((b): b is Bot => Boolean(b));
}

export type BotRoundResult = {
  bot: Bot;
  correct: boolean;
  pickedAnswer: "A" | "B" | "C" | "D";
  msTaken: number;
  points: number;
};

const ANSWERS: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];

/**
 * Compute a bot's result for a single question.
 * Mirrors the player scoring rules: base 500 + speed bonus up to 1000.
 */
export function botRound(
  bot: Bot,
  question: Question,
  dailyIndex: number,
  questionIdx: number,
): BotRoundResult {
  const rng = mulberry(
    hashStr(`${dailyIndex}:${bot.name}:${question.id}:${questionIdx}`),
  );
  const effectiveSkill = Math.max(0, Math.min(1, bot.skill * DIFFICULTY_MULT[question.difficulty]));
  const gotIt = rng() < effectiveSkill;

  // Time: jittered around the bot's speed bias, clipped to [2s, 28s].
  const jitter = (rng() - 0.5) * 6000;
  const msTaken = Math.max(2000, Math.min(28000, Math.round(bot.speedBiasMs + jitter)));

  let pickedAnswer: "A" | "B" | "C" | "D";
  if (gotIt) {
    pickedAnswer = question.correct_answer;
  } else {
    const wrong = ANSWERS.filter((a) => a !== question.correct_answer);
    const idx = Math.floor(rng() * wrong.length);
    pickedAnswer = wrong[idx] ?? "A";
  }

  let points = 0;
  if (gotIt) {
    const base = 500;
    const speed = Math.max(0, 1000 - Math.floor((msTaken / 30000) * 1000));
    points = base + speed;
  }

  return { bot, correct: gotIt, pickedAnswer, msTaken, points };
}

// Aggregate count of bots that picked each answer letter (for the
// "8 of you really thought X" reveal). Pass undefined for playerPick to
// see only bot picks.
export function answerHistogram(
  bots: Bot[],
  question: Question,
  dailyIndex: number,
  questionIdx: number,
  playerPick?: "A" | "B" | "C" | "D" | null,
): Record<"A" | "B" | "C" | "D", number> {
  const out = { A: 0, B: 0, C: 0, D: 0 };
  for (const b of bots) {
    const r = botRound(b, question, dailyIndex, questionIdx);
    out[r.pickedAnswer] += 1;
  }
  if (playerPick) out[playerPick] += 1;
  return out;
}

/**
 * Walk every question of the daily and total each bot's score.
 * Used by the final result screen to render the closing standings.
 */
export function botFinalScores(
  bots: Bot[],
  questionIds: string[],
  dailyIndex: number,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const b of bots) out[b.name] = 0;
  questionIds.forEach((qid, i) => {
    const q = questionsById[qid];
    if (!q) return;
    for (const b of bots) {
      const r = botRound(b, q, dailyIndex, i);
      out[b.name] = (out[b.name] ?? 0) + r.points;
    }
  });
  return out;
}
