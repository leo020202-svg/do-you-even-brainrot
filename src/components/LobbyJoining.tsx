// "Lobby filling…" pre-round overlay.
//
// Sells the multiplayer-first positioning per docs/STRATEGY.md §3 — when
// the bots arrive as named player chips on a brief countdown, the lobby
// reads as a real party room instead of "you vs. a static array of fake
// names." Auto-dismisses after a fixed total duration.
//
// Each bot slides in from the right with a staggered delay, then the
// "you" chip lands. Final "GO" pulse → onDone.

import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import type { Bot } from "@/lib/bots";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const STAGGER_MS = 220;
const ENTRY_DURATION_MS = 360;
const FINALE_DELAY_MS = 600;

type Props = {
  bots: Bot[];
  /** Optional headline override; default reads "FILLING LOBBY…". */
  headline?: string;
  onDone: () => void;
};

export function LobbyJoining({ bots, headline = "FILLING LOBBY…", onDone }: Props) {
  const reducedMotion = useReducedMotion();
  const startedRef = useRef(false);

  // Total time = entry stagger + finale beat. Compute once.
  const totalMs = useRef(
    bots.length * STAGGER_MS + ENTRY_DURATION_MS + FINALE_DELAY_MS,
  ).current;

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const id = setTimeout(onDone, reducedMotion ? 600 : totalMs);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.overlay}>
      <Text style={styles.label}>{headline}</Text>
      <Text style={styles.subLabel}>
        {bots.length} {bots.length === 1 ? "player" : "players"} joining…
      </Text>
      <View style={styles.list}>
        {bots.map((b, i) => (
          <PlayerChip key={b.name} bot={b} index={i} reducedMotion={reducedMotion} />
        ))}
        <PlayerChip
          // The local player chip lands last, accented lime.
          bot={{ name: "you", emoji: "🫵", skill: 1, speedBiasMs: 0 }}
          index={bots.length}
          reducedMotion={reducedMotion}
          highlight
        />
      </View>
    </View>
  );
}

function PlayerChip({
  bot,
  index,
  reducedMotion,
  highlight = false,
}: {
  bot: Bot;
  index: number;
  reducedMotion: boolean;
  highlight?: boolean;
}) {
  const translateX = useRef(new Animated.Value(reducedMotion ? 0 : 60)).current;
  const opacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reducedMotion) return;
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        delay: index * STAGGER_MS,
        duration: ENTRY_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        delay: index * STAGGER_MS,
        duration: ENTRY_DURATION_MS,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, reducedMotion, translateX, opacity]);

  return (
    <Animated.View
      style={[
        styles.chip,
        highlight ? styles.chipHighlight : null,
        {
          opacity,
          transform: [{ translateX }],
        } as ViewStyle,
      ]}
    >
      <Text style={styles.chipEmoji}>{bot.emoji}</Text>
      <Text style={[styles.chipName, highlight ? styles.chipNameHighlight : null]}>
        {bot.name}
      </Text>
      <Text style={styles.chipJoinTag}>{highlight ? "you" : "joined"}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15,10,30,0.96)",
    paddingHorizontal: 24,
    justifyContent: "center",
    zIndex: 100,
  },
  label: {
    color: "#A8FF3E",
    fontSize: 14,
    letterSpacing: 4,
    fontFamily: "JetBrainsMono_400Regular",
    textAlign: "center",
  },
  subLabel: {
    color: "#7A6B99",
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  list: {
    marginTop: 22,
    gap: 10,
  },
  chip: {
    backgroundColor: "#1A0F2E",
    borderColor: "#7A6B99",
    borderWidth: 2,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chipHighlight: {
    borderColor: "#A8FF3E",
    backgroundColor: "#1A0F2E",
    shadowColor: "#A8FF3E",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  chipEmoji: { fontSize: 22 },
  chipName: {
    color: "#F5F2FF",
    fontSize: 16,
    flex: 1,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  chipNameHighlight: { color: "#A8FF3E" },
  chipJoinTag: {
    color: "#7A6B99",
    fontSize: 10,
    letterSpacing: 1.5,
    fontFamily: "JetBrainsMono_400Regular",
  },
});
