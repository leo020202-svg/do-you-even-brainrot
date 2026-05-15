// Friend rooms — async multiplayer without a backend.
//
// A "room" is just a 6-character code. The code is deterministically hashed to
// a seed; src/lib/daily.ts uses that seed to pick the same 5 questions for
// everyone who enters the code. Players run the questions on their own device,
// then share their scorecard back through whatever group chat sent them the
// link.
//
// This is the no-backend stepping stone toward the full Kahoot-style live
// Party Mode in Phase 1 (docs/ROADMAP.md), which needs Supabase Realtime to
// synchronize the lobby and round-by-round leaderboard across devices.

/**
 * Friendly alphabet — uppercase letters + digits, minus the ambiguous ones
 * (I/L/O/0/1). 32 symbols → log2(32^6) ≈ 30 bits of entropy per code, plenty
 * for non-collision in a friend-sized room namespace.
 */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

export function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export function isValidRoomCode(code: string): boolean {
  if (typeof code !== "string") return false;
  const upper = code.toUpperCase();
  if (upper.length !== CODE_LENGTH) return false;
  for (const c of upper) {
    if (!ALPHABET.includes(c)) return false;
  }
  return true;
}

export function normalizeRoomCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LENGTH);
}

/**
 * Hash a code to a 32-bit uint suitable for seeding Mulberry32. Different
 * codes effectively map to different question sets (collisions are
 * astronomically unlikely within the ~1e9-code namespace, and even when they
 * happen, two friends with the same questions is fine).
 */
export function codeToSeed(code: string): number {
  let h = 5381 >>> 0;
  const upper = code.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    h = (Math.imul(h, 33) + upper.charCodeAt(i)) >>> 0;
  }
  // Bias away from 0 so seeds always produce non-degenerate PRNG output.
  return (h || 1) >>> 0;
}

/**
 * Build the public sharable URL for a room code.
 * In dev this points at the current host; in production it'd be
 * https://playbrainrot.app/r/CODE.
 */
export function roomShareUrl(code: string): string {
  if (typeof globalThis === "undefined" || typeof globalThis.location === "undefined") {
    return `https://playbrainrot.app/r/${code}`;
  }
  const loc = globalThis.location;
  return `${loc.origin}/r/${code.toUpperCase()}`;
}
