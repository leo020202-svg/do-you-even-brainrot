// Rotating daily themes for Endless mode.
//
// docs/VIRAL_PLAN.md Tier B #5: "Daily themes inside Endless — rotating
// daily lens like 'Italian Brainrot only', 'Speed Demon: <5s avg',
// 'Sigma Mode: hard only'. Stacks on top of regular rounds, no new flow."
//
// Theme is picked by the local day-of-week so today's theme is the same
// for everyone in the same timezone but rotates through the cycle over
// 7 days. After the cycle, repeats. New themes can be added without
// touching the picker logic.

import type { Question } from "./questions";

export type EndlessTheme = {
  /** Stable slug for storage / share text. */
  id: string;
  /** Display name shown on the HUD. */
  name: string;
  /** Sub-line shown under the name. */
  tagline: string;
  emoji: string;
  /** Multiplier applied to the per-question timer (1 = normal). */
  timerMultiplier: number;
  /** Score multiplier (1 = normal). Cosmetic, rolls forward into share text. */
  scoreMultiplier: number;
  /** Pure filter — return true if this question fits the theme. */
  filter: (q: Question) => boolean;
};

const everything: EndlessTheme = {
  id: "everything",
  name: "EVERYTHING ALLOWED",
  tagline: "the full question pool, default rules",
  emoji: "🌀",
  timerMultiplier: 1,
  scoreMultiplier: 1,
  filter: () => true,
};

const italianOnly: EndlessTheme = {
  id: "italian-only",
  name: "ITALIAN BRAINROT ONLY",
  tagline: "Tralalero, Bombardiro, Ballerina, all of them",
  emoji: "🍝",
  timerMultiplier: 1,
  scoreMultiplier: 1.2,
  filter: (q) => q.category === "italian_brainrot",
};

const skibidiOnly: EndlessTheme = {
  id: "skibidi-only",
  name: "SKIBIDI MARATHON",
  tagline: "Cameramen, TV-men, the whole toilet lore",
  emoji: "🚽",
  timerMultiplier: 1,
  scoreMultiplier: 1.2,
  filter: (q) => q.category === "skibidi",
};

const slangOnly: EndlessTheme = {
  id: "slang-only",
  name: "GEN ALPHA SLANG SPRINT",
  tagline: "rizz, sigma, ohio, gyatt, fanum tax, mewing",
  emoji: "💀",
  timerMultiplier: 1,
  scoreMultiplier: 1.2,
  filter: (q) => q.category === "gen_alpha_slang",
};

const speedDemon: EndlessTheme = {
  id: "speed-demon",
  name: "SPEED DEMON",
  tagline: "easy questions, 60% timer. answer fast.",
  emoji: "⚡",
  timerMultiplier: 0.6,
  scoreMultiplier: 1.5,
  filter: (q) => q.difficulty === "easy" || q.difficulty === "medium",
};

const sigmaMode: EndlessTheme = {
  id: "sigma-mode",
  name: "SIGMA MODE",
  tagline: "hard only, regular timer. lore-pilled.",
  emoji: "⛓️‍💥",
  timerMultiplier: 1,
  scoreMultiplier: 2,
  filter: (q) => q.difficulty === "hard",
};

const viralOnly: EndlessTheme = {
  id: "viral-only",
  name: "VIRAL MOMENTS",
  tagline: "Pedro the raccoon, Hawk Tuah, the recent ones",
  emoji: "📱",
  timerMultiplier: 1,
  scoreMultiplier: 1.2,
  filter: (q) =>
    q.category === "viral_moments" || q.category === "cross_platform",
};

// Indexed by local day-of-week — same day = same theme worldwide-ish.
// 0 = Sunday, 6 = Saturday.
const ROTATION: EndlessTheme[] = [
  everything, // Sun — easy onramp
  speedDemon, // Mon — get the week moving fast
  italianOnly, // Tue
  skibidiOnly, // Wed
  slangOnly, // Thu
  viralOnly, // Fri
  sigmaMode, // Sat — hard mode for the weekend lore-pilled
];

export function themeForDate(d: Date = new Date()): EndlessTheme {
  const idx = d.getDay();
  return ROTATION[idx] ?? everything;
}

/** All themes — useful for a theme picker UI later. */
export const ALL_THEMES = [
  everything,
  italianOnly,
  skibidiOnly,
  slangOnly,
  viralOnly,
  speedDemon,
  sigmaMode,
];
