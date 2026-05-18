// Achievement catalog. Eight starter unlocks across the play surfaces —
// they give players a "what next" loop beyond just streak, per Geoguessr's
// progression model in docs/VIRAL_PLAN.md.
//
// Adding a new achievement: drop a new ACHIEVEMENT_ID, add it to
// ACHIEVEMENTS, and call useAchievementsStore().unlock(ID) from wherever
// the gate fires.

export type AchievementId =
  | "first_run"
  | "certified_sigma"
  | "cooked"
  | "marathon"
  | "brainrot_veteran"
  | "friend_magnet"
  | "streak_builder"
  | "lore_pilled";

export type Achievement = {
  id: AchievementId;
  emoji: string;
  title: string;
  description: string;
  /** Hint for an unmet achievement — what to do to unlock. */
  hint: string;
  /** Visual rarity tier. Drives card border colour on /profile. */
  tier: "common" | "rare" | "epic" | "legendary";
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_run",
    emoji: "🎬",
    title: "First Run",
    description: "Played your first round. welcome to the cooking pot.",
    hint: "play any round to start.",
    tier: "common",
  },
  {
    id: "certified_sigma",
    emoji: "⛓️‍💥",
    title: "Certified Sigma",
    description: "Aced a round. all greens, no decoys.",
    hint: "100% on any round (5/5, 7/7, 10/10).",
    tier: "epic",
  },
  {
    id: "cooked",
    emoji: "💀",
    title: "L + Ratio + Brainrot-less",
    description: "Zero. for. five. take the L proudly.",
    hint: "score 0 correct on any daily.",
    tier: "rare",
  },
  {
    id: "marathon",
    emoji: "🏃",
    title: "Marathon",
    description: "Survived 10+ questions in Endless. iron stomach.",
    hint: "endless mode → 10-question streak.",
    tier: "rare",
  },
  {
    id: "brainrot_veteran",
    emoji: "🧠",
    title: "Brainrot Veteran",
    description: "Played 30 rounds. you're chronically online by definition.",
    hint: "play 30 rounds (any mode counts).",
    tier: "epic",
  },
  {
    id: "friend_magnet",
    emoji: "👯",
    title: "Friend Magnet",
    description: "Created 3 friend rooms. you bring the chaos.",
    hint: "spin up 3 different friend-room codes.",
    tier: "rare",
  },
  {
    id: "streak_builder",
    emoji: "🔥",
    title: "Streak Builder",
    description: "7-day daily streak. duolingo-pilled, ironic.",
    hint: "play the daily 7 days in a row.",
    tier: "legendary",
  },
  {
    id: "lore_pilled",
    emoji: "📜",
    title: "Lore-pilled",
    description: "Read a category page. you came for more than the points.",
    hint: "visit any /category/[slug] page.",
    tier: "common",
  },
];

export const ACHIEVEMENT_BY_ID: Record<AchievementId, Achievement> =
  Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a])) as Record<
    AchievementId,
    Achievement
  >;

export const TIER_COLOR: Record<Achievement["tier"], string> = {
  common: "#7A6B99",
  rare: "#3EFFE9",
  epic: "#FF3EA5",
  legendary: "#A8FF3E",
};
