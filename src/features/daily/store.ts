import { create } from "zustand";
import { storage } from "@/lib/storage";
import { localDateKey } from "@/lib/daily";

const STORAGE_KEY = "brainrot.daily.v1";

export type AnswerOutcome = "correct" | "wrong" | "skipped";

export type DailyResult = {
  dateKey: string;
  score: number;
  total: number;
  pattern: string;
  outcomes: AnswerOutcome[];
  timeMs: number;
  completedAt: string;
};

type Persisted = {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDateKey: string | null;
  results: Record<string, DailyResult>; // keyed by dateKey
};

/**
 * Transient signal — set when the streak ticks UP this completion, cleared
 * by the celebration overlay when it dismisses. Not persisted; lives only
 * in memory because a refresh shouldn't re-trigger the animation.
 */
export type StreakBump = {
  newStreak: number;
  previousStreak: number;
  isMilestone: boolean; // 3 / 7 / 14 / 30 / 50 / 100 / 365
  ts: number; // Date.now() — useful for de-duping fast double-fires
};

const initial: Persisted = {
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDateKey: null,
  results: {},
};

type DailyStore = Persisted & {
  hydrated: boolean;
  /** Transient streak-bump signal — see StreakBump comment. */
  streakBump: StreakBump | null;
  hydrate: () => Promise<void>;
  completeDaily: (r: Omit<DailyResult, "completedAt">) => Promise<void>;
  clearStreakBump: () => void;
  reset: () => Promise<void>;
  hasPlayed: (dateKey: string) => boolean;
};

const MILESTONES = new Set([3, 7, 14, 30, 50, 100, 365, 500, 1000]);

function yesterdayKeyOf(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (!y || !m || !d) return "";
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return localDateKey(dt);
}

export const useDailyStore = create<DailyStore>((set, get) => ({
  ...initial,
  hydrated: false,
  streakBump: null,
  clearStreakBump: () => set({ streakBump: null }),
  hydrate: async () => {
    const raw = await storage.getItem(STORAGE_KEY);
    if (!raw) {
      set({ hydrated: true });
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<Persisted>;
      set({
        currentStreak: parsed.currentStreak ?? 0,
        longestStreak: parsed.longestStreak ?? 0,
        lastCompletedDateKey: parsed.lastCompletedDateKey ?? null,
        results: parsed.results ?? {},
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },
  hasPlayed: (dateKey) => Boolean(get().results[dateKey]),
  completeDaily: async (r) => {
    const completed: DailyResult = { ...r, completedAt: new Date().toISOString() };
    const prev = get();
    const last = prev.lastCompletedDateKey;
    const continued = last === yesterdayKeyOf(r.dateKey);
    const sameDay = last === r.dateKey;
    const newStreak = sameDay ? prev.currentStreak : continued ? prev.currentStreak + 1 : 1;
    const next: Persisted = {
      currentStreak: newStreak,
      longestStreak: Math.max(prev.longestStreak, newStreak),
      lastCompletedDateKey: r.dateKey,
      results: { ...prev.results, [r.dateKey]: completed },
    };
    // Fire a streak-bump signal whenever the streak actually went up.
    // The StreakCelebration overlay listens for this and pops a moment.
    const bumped = !sameDay && newStreak > prev.currentStreak;
    set({
      ...next,
      streakBump: bumped
        ? {
            newStreak,
            previousStreak: prev.currentStreak,
            isMilestone: MILESTONES.has(newStreak),
            ts: Date.now(),
          }
        : null,
    });
    await storage.setItem(STORAGE_KEY, JSON.stringify(next));
  },
  reset: async () => {
    set({ ...initial, hydrated: true });
    await storage.removeItem(STORAGE_KEY);
  },
}));
