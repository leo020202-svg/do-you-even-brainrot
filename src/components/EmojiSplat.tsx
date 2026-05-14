import { useMemo } from "react";
import { Text, View } from "react-native";

// Decorative floating emojis to make every screen feel like a chaotic sticker
// sheet. pointerEvents="none" so they never intercept taps.
type Emoji = { char: string; top: string; left: string; size: number; rotate: number };

const POOL = [
  "🦈",
  "🐊",
  "🍝",
  "🚽",
  "💀",
  "🔥",
  "⛓️",
  "🤡",
  "📱",
  "🎬",
  "🌐",
  "🕳️",
  "✨",
  "🫠",
  "👁️",
  "🍕",
];

// Seedable PRNG so we get a stable but per-instance scatter.
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

type Props = {
  /** How many emojis to scatter. */
  count?: number;
  /** Seed for the scatter — same seed = same layout. */
  seed?: number;
  /** Override the emoji pool (e.g. category-specific). */
  pool?: readonly string[];
};

export function EmojiSplat({ count = 9, seed = 42, pool = POOL }: Props) {
  const items = useMemo<Emoji[]>(() => {
    const rng = mulberry(seed);
    return Array.from({ length: count }).map((_, i) => {
      const charIdx = Math.floor(rng() * pool.length);
      return {
        char: pool[charIdx] ?? "✨",
        top: `${Math.floor(rng() * 90)}%`,
        left: `${Math.floor(rng() * 90)}%`,
        size: 28 + Math.floor(rng() * 36),
        rotate: Math.floor(rng() * 60) - 30,
      } satisfies Emoji;
    });
  }, [count, seed, pool]);

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {items.map((e, i) => (
        <Text
          key={i}
          style={{
            position: "absolute",
            top: e.top as unknown as number,
            left: e.left as unknown as number,
            fontSize: e.size,
            opacity: 0.18,
            transform: [{ rotate: `${e.rotate}deg` }],
          }}
        >
          {e.char}
        </Text>
      ))}
    </View>
  );
}

export const CATEGORY_EMOJI: Record<string, string> = {
  italian_brainrot: "🍝",
  skibidi: "🚽",
  gen_alpha_slang: "💀",
  viral_moments: "📱",
  creators: "🎬",
  cross_platform: "🌐",
  deep_cuts: "🕳️",
  absurdity: "🤡",
};
