// Game-settings store.
//
// Settings apply ONLY to practice mode — the daily challenge and friend rooms
// stay canonical (everyone gets the same questions at the same pace,
// regardless of personal prefs). Otherwise sharing a room code would mean
// nothing.

import { create } from "zustand";
import { storage } from "@/lib/storage";

const STORAGE_KEY = "brainrot.settings.v1";

export type DifficultyPreset = "chill" | "mixed" | "spicy";

export type GameSettings = {
  /** 3 / 5 / 7 / 10 — total questions per practice round. */
  questionsPerRound: number;
  /** 15 / 30 / 60 — seconds before a question auto-skips. */
  secondsPerQuestion: number;
  /** Difficulty mix preset, applied to practice mode. */
  difficulty: DifficultyPreset;
};

export const DEFAULTS: GameSettings = {
  questionsPerRound: 5,
  secondsPerQuestion: 30,
  difficulty: "mixed",
};

export const QUESTIONS_OPTIONS = [3, 5, 7, 10] as const;
export const SECONDS_OPTIONS = [15, 30, 60] as const;
export const DIFFICULTY_OPTIONS: readonly DifficultyPreset[] = [
  "chill",
  "mixed",
  "spicy",
];

/** Difficulty buckets per preset — array of difficulty labels of length N. */
export function difficultyMixFor(
  preset: DifficultyPreset,
  count: number,
): Array<"easy" | "medium" | "hard"> {
  switch (preset) {
    case "chill":
      // 80% easy, 20% medium
      return Array.from({ length: count }, (_, i) =>
        i < Math.ceil(count * 0.8) ? "easy" : "medium",
      );
    case "spicy":
      // 20% easy, 30% medium, 50% hard
      return Array.from({ length: count }, (_, i) => {
        if (i < Math.floor(count * 0.2)) return "easy";
        if (i < Math.floor(count * 0.5)) return "medium";
        return "hard";
      });
    case "mixed":
    default:
      // 40% easy, 40% medium, 20% hard — matches the daily's feel
      return Array.from({ length: count }, (_, i) => {
        if (i < Math.floor(count * 0.4)) return "easy";
        if (i < Math.floor(count * 0.8)) return "medium";
        return "hard";
      });
  }
}

type SettingsStore = GameSettings & {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  update: (patch: Partial<GameSettings>) => Promise<void>;
  reset: () => Promise<void>;
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULTS,
  hydrated: false,
  hydrate: async () => {
    const raw = await storage.getItem(STORAGE_KEY);
    if (!raw) {
      set({ hydrated: true });
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<GameSettings>;
      set({
        questionsPerRound:
          QUESTIONS_OPTIONS.find((n) => n === parsed.questionsPerRound) ??
          DEFAULTS.questionsPerRound,
        secondsPerQuestion:
          SECONDS_OPTIONS.find((n) => n === parsed.secondsPerQuestion) ??
          DEFAULTS.secondsPerQuestion,
        difficulty:
          DIFFICULTY_OPTIONS.find((d) => d === parsed.difficulty) ??
          DEFAULTS.difficulty,
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },
  update: async (patch) => {
    const next: GameSettings = {
      questionsPerRound: patch.questionsPerRound ?? get().questionsPerRound,
      secondsPerQuestion: patch.secondsPerQuestion ?? get().secondsPerQuestion,
      difficulty: patch.difficulty ?? get().difficulty,
    };
    set(next);
    await storage.setItem(STORAGE_KEY, JSON.stringify(next));
  },
  reset: async () => {
    set({ ...DEFAULTS });
    await storage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
  },
}));
