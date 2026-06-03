// Streak-up celebration overlay.
//
// Mounted at the root layout. Listens to useDailyStore.streakBump and pops
// a full-screen-overlay celebration when a daily completion ticks the
// streak up. Milestone streaks (3/7/14/30/50/100/365) get heavier confetti
// + a different headline.
//
// Cleared via store.clearStreakBump() when the animation finishes —
// transient signal, lives only in memory so refreshes don't re-fire it.

import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { Confetti } from "./Confetti";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDailyStore } from "@/features/daily/store";
import { successHaptic } from "@/lib/haptics";

const HOLD_MS = 2400;

export function StreakCelebration() {
  const bump = useDailyStore((s) => s.streakBump);
  const clear = useDailyStore((s) => s.clearStreakBump);

  if (!bump) return null;
  return <Card bump={bump} onDone={clear} />;
}

function Card({
  bump,
  onDone,
}: {
  bump: NonNullable<ReturnType<typeof useDailyStore.getState>["streakBump"]>;
  onDone: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(reducedMotion ? 1 : 0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;
    successHaptic();
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        damping: 8,
        stiffness: 120,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 320,
          delay: HOLD_MS,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: reducedMotion ? 1 : 1.15,
          duration: 320,
          delay: HOLD_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(onDone);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headline = bump.isMilestone
    ? `🔥 ${bump.newStreak}-DAY MILESTONE`
    : `🔥 STREAK UP`;
  const sub = bump.isMilestone
    ? "certified daily-pilled"
    : bump.previousStreak === 0
      ? "first one. don't drop it."
      : `from ${bump.previousStreak} → ${bump.newStreak}`;

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <Confetti show count={bump.isMilestone ? 90 : 50} />
      <Animated.View
        style={[
          styles.card,
          {
            opacity,
            transform: [{ scale }],
          } as ViewStyle,
        ]}
      >
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.number}>{bump.newStreak}</Text>
        <Text style={styles.sub}>{sub}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9998,
    backgroundColor: "rgba(15,10,30,0.6)",
  },
  card: {
    backgroundColor: "#1A0F2E",
    borderColor: "#A8FF3E",
    borderWidth: 4,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 36,
    alignItems: "center",
    shadowColor: "#A8FF3E",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
  headline: {
    color: "#FF3EA5",
    fontSize: 16,
    letterSpacing: 4,
    fontFamily: "JetBrainsMono_400Regular",
  },
  number: {
    color: "#A8FF3E",
    fontSize: 92,
    lineHeight: 100,
    fontFamily: "SpaceGrotesk_700Bold",
    marginTop: 8,
  },
  sub: {
    color: "#F5F2FF",
    fontSize: 14,
    marginTop: 6,
    fontFamily: "Inter_400Regular",
  },
});
