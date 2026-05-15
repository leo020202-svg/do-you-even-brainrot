// Wall-clock synchronization for friend rooms.
//
// Real-time multiplayer (Phase 1) needs a backend. Until then we fake the
// "everyone plays simultaneously, everyone sees the reveal together" feel by
// encoding a shared start timestamp in the URL. Every joiner reads the same
// timestamp from `?start=...`, so a pure function over the current wall-clock
// time gives all players the same screen at the same moment (modulo ~clock
// drift, which on a Discord call between friends is sub-second).

export const SYNC_QUESTION_MS = 30_000;
export const SYNC_REVEAL_MS = 8_000;
export const SYNC_SEG_MS = SYNC_QUESTION_MS + SYNC_REVEAL_MS;

export type SyncPhase = "pre-game" | "question" | "reveal" | "done";

export type SyncState = {
  phase: SyncPhase;
  /** 0-based current question index (clamped to [0, count-1] when done). */
  idx: number;
  /** ms until the current phase ends — used for countdown rings. */
  msRemainingInPhase: number;
  /** ms until the game starts (only meaningful when phase==="pre-game"). */
  msUntilStart: number;
  /** total ms remaining in the synced game (for the closing countdown). */
  msUntilGameEnd: number;
};

/**
 * Pure function: given the start timestamp, total question count, and the
 * current wall-clock time, return what phase / question / countdown a player
 * should see. Same inputs → same output everywhere.
 */
export function computeSyncState(
  startTs: number,
  questionCount: number,
  now: number = Date.now(),
): SyncState {
  const totalMs = questionCount * SYNC_SEG_MS;
  const elapsed = now - startTs;

  if (elapsed < 0) {
    return {
      phase: "pre-game",
      idx: 0,
      msRemainingInPhase: -elapsed,
      msUntilStart: -elapsed,
      msUntilGameEnd: totalMs - elapsed,
    };
  }

  if (elapsed >= totalMs) {
    return {
      phase: "done",
      idx: questionCount - 1,
      msRemainingInPhase: 0,
      msUntilStart: 0,
      msUntilGameEnd: 0,
    };
  }

  const idx = Math.min(questionCount - 1, Math.floor(elapsed / SYNC_SEG_MS));
  const inSeg = elapsed % SYNC_SEG_MS;
  if (inSeg < SYNC_QUESTION_MS) {
    return {
      phase: "question",
      idx,
      msRemainingInPhase: SYNC_QUESTION_MS - inSeg,
      msUntilStart: 0,
      msUntilGameEnd: totalMs - elapsed,
    };
  }
  return {
    phase: "reveal",
    idx,
    msRemainingInPhase: SYNC_SEG_MS - inSeg,
    msUntilStart: 0,
    msUntilGameEnd: totalMs - elapsed,
  };
}

/**
 * Score for an answer in sync mode. Speed bonus is calculated against
 * SYNC_QUESTION_MS so it matches the player-paced formula.
 */
export function syncPointsFor(
  correct: boolean,
  msTakenInQuestion: number,
): number {
  if (!correct) return 0;
  const base = 500;
  const speed = Math.max(0, 1000 - Math.floor((msTakenInQuestion / SYNC_QUESTION_MS) * 1000));
  return base + speed;
}
