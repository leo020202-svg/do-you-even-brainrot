// Achievement-unlock store. Persists to local storage same as the daily +
// settings stores (will sync via Supabase post-PR-8 per
// docs/BLOCKED_PRS.md).
//
// API:
//   useAchievementsStore.unlock(id)  — idempotent; no-op if already unlocked.
//                                       Returns true if this call did the
//                                       unlock, false if it was already done
//                                       (callers use this to drive the toast).
//   useAchievementsStore.isUnlocked(id) — boolean for UI gating.
//   useAchievementsStore.unlockedAt(id) — ISO timestamp or undefined.

import { create } from "zustand";
import { storage } from "@/lib/storage";
import type { AchievementId } from "./definitions";

const STORAGE_KEY = "brainrot.achievements.v1";

type Persisted = {
  unlocked: Partial<Record<AchievementId, string>>; // id → ISO timestamp
  /** Endless-mode high-score so the achievement gate is fast to check. */
  endlessHighScore: number;
  /** Distinct friend-room codes the user has CREATED (not joined). */
  roomsCreated: string[];
};

const initial: Persisted = {
  unlocked: {},
  endlessHighScore: 0,
  roomsCreated: [],
};

type Store = Persisted & {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  unlock: (id: AchievementId) => Promise<boolean>;
  isUnlocked: (id: AchievementId) => boolean;
  unlockedAt: (id: AchievementId) => string | undefined;
  recordEndlessRun: (score: number) => Promise<void>;
  recordRoomCreated: (code: string) => Promise<void>;
  reset: () => Promise<void>;
};

async function save(state: Persisted): Promise<void> {
  await storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const useAchievementsStore = create<Store>((set, get) => ({
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
        unlocked: parsed.unlocked ?? {},
        endlessHighScore: parsed.endlessHighScore ?? 0,
        roomsCreated: parsed.roomsCreated ?? [],
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },
  unlock: async (id) => {
    const s = get();
    if (s.unlocked[id]) return false;
    const next: Persisted = {
      unlocked: { ...s.unlocked, [id]: new Date().toISOString() },
      endlessHighScore: s.endlessHighScore,
      roomsCreated: s.roomsCreated,
    };
    set(next);
    await save(next);
    return true;
  },
  isUnlocked: (id) => Boolean(get().unlocked[id]),
  unlockedAt: (id) => get().unlocked[id],
  recordEndlessRun: async (score) => {
    const s = get();
    if (score <= s.endlessHighScore) return;
    const next: Persisted = {
      unlocked: s.unlocked,
      endlessHighScore: score,
      roomsCreated: s.roomsCreated,
    };
    set(next);
    await save(next);
  },
  recordRoomCreated: async (code) => {
    const s = get();
    if (s.roomsCreated.includes(code)) return;
    const next: Persisted = {
      unlocked: s.unlocked,
      endlessHighScore: s.endlessHighScore,
      roomsCreated: [...s.roomsCreated, code],
    };
    set(next);
    await save(next);
  },
  reset: async () => {
    set({ ...initial, hydrated: true });
    await storage.removeItem(STORAGE_KEY);
  },
}));
