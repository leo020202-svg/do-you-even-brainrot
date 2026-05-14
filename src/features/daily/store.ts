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

const initial: Persisted = {
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDateKey: null,
  results: {},
};

type DailyStore = Persisted & {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  completeDaily: (r: Omit<DailyResult, "completedAt">) => Promise<void>;
  reset: () => Promise<void>;
  hasPlayed: (dateKey: string) => boolean;
};

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
    set(next);
    await storage.setItem(STORAGE_KEY, JSON.stringify(next));
  },
  reset: async () => {
    set({ ...initial, hydrated: true });
    await storage.removeItem(STORAGE_KEY);
  },
}));
