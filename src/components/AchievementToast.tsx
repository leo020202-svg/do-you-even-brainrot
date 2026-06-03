// Global achievement-unlock toast.
//
// Mounted once at the root layout. Subscribes to the achievements store and
// fires a sticker overlay every time `unlocked` gains a new key. Pairs with
// the unlockHaptic() chime so the unlock has both visual + audio impact.
//
// Animation: spring-in from the top, holds for 2.4s, fades out. Stacks one
// at a time — if multiple unlock during a burst (game-over screen often
// triggers 2-3), we queue them.

import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View, type ViewStyle } from "react-native";
import {
  ACHIEVEMENT_BY_ID,
  TIER_COLOR,
  type AchievementId,
} from "@/features/achievements/definitions";
import { useAchievementsStore } from "@/features/achievements/store";
import { unlockHaptic } from "@/lib/haptics";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function AchievementToast() {
  const unlocked = useAchievementsStore((s) => s.unlocked);
  const [queue, setQueue] = useState<AchievementId[]>([]);
  const seenRef = useRef<Set<AchievementId>>(new Set());

  // Seed the seen set with whatever the store had on first mount so we
  // don't blast 8 toasts at people who already unlocked things.
  useEffect(() => {
    for (const id of Object.keys(unlocked) as AchievementId[]) {
      seenRef.current.add(id);
    }
    // Only on mount — we want this initial seeding to happen once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect new unlocks. Subsequent changes get appended to the queue.
  useEffect(() => {
    const newOnes: AchievementId[] = [];
    for (const id of Object.keys(unlocked) as AchievementId[]) {
      if (!seenRef.current.has(id)) {
        seenRef.current.add(id);
        newOnes.push(id);
      }
    }
    if (newOnes.length > 0) {
      setQueue((q) => [...q, ...newOnes]);
    }
  }, [unlocked]);

  const current = queue[0];
  if (!current) return null;
  return (
    <ToastCard
      id={current}
      onDone={() => setQueue((q) => q.slice(1))}
    />
  );
}

function ToastCard({ id, onDone }: { id: AchievementId; onDone: () => void }) {
  const reducedMotion = useReducedMotion();
  const a = ACHIEVEMENT_BY_ID[id];
  const translateY = useRef(new Animated.Value(reducedMotion ? 0 : -120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    unlockHaptic();
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: reducedMotion ? 1 : 380,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: reducedMotion ? 1 : 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Hold the toast on-screen, then fade + slide out.
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          delay: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: reducedMotion ? 0 : -40,
          duration: 300,
          delay: 2200,
          useNativeDriver: true,
        }),
      ]).start(onDone);
    });
    // We intentionally only run this on mount per toast card.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tierColor = TIER_COLOR[a.tier];
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          opacity,
          transform: [{ translateY }],
        } as ViewStyle,
      ]}
    >
      <View style={styles.shadowSpacer}>
        <View
          style={[
            styles.card,
            {
              borderColor: tierColor,
              shadowColor: tierColor,
            },
          ]}
        >
          <Text style={styles.emoji}>{a.emoji}</Text>
          <View style={styles.textCol}>
            <Text style={styles.label}>ACHIEVEMENT UNLOCKED</Text>
            <Text style={styles.title}>{a.title}</Text>
            <Text style={[styles.tier, { color: tierColor }]}>{a.tier}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    zIndex: 9999,
    alignItems: "center",
    pointerEvents: "none",
  },
  shadowSpacer: { maxWidth: 420, width: "100%" },
  card: {
    backgroundColor: "#1A0F2E",
    borderWidth: 4,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  emoji: { fontSize: 40 },
  textCol: { flex: 1 },
  label: {
    color: "#7A6B99",
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: "JetBrainsMono_400Regular",
  },
  title: {
    color: "#F5F2FF",
    fontSize: 18,
    marginTop: 2,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  tier: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 1,
    fontFamily: "JetBrainsMono_400Regular",
  },
});
