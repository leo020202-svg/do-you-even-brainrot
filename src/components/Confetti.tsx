// Cross-platform confetti. No new deps — uses React Native's built-in
// Animated API which RN-Web translates to CSS keyframes for the browser.
//
// Declarative: <Confetti show={boolean} /> spawns a fresh burst every time
// `show` flips from false to true. Internally manages particle lifecycle;
// the parent doesn't need to clean up.
//
// Respects prefers-reduced-motion — renders nothing when set.

import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const COLORS = ["#A8FF3E", "#FF3EA5", "#3EFFE9", "#FF5C3E", "#F5F2FF"] as const;

type Particle = {
  key: string;
  startX: number;        // % across container (0–100)
  hue: string;
  size: number;          // px
  rotateStart: number;   // deg
  rotateEnd: number;
  fallDistance: number;  // px down
  driftX: number;        // px sideways
  delayMs: number;
  durationMs: number;
};

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

function spawn(count: number, seed: number): Particle[] {
  const rng = mulberry(seed);
  return Array.from({ length: count }).map((_, i) => ({
    key: `${seed}-${i}`,
    startX: Math.floor(rng() * 100),
    hue: COLORS[Math.floor(rng() * COLORS.length)] ?? "#A8FF3E",
    size: 8 + Math.floor(rng() * 10),
    rotateStart: Math.floor(rng() * 360),
    rotateEnd: Math.floor(rng() * 720) - 360,
    fallDistance: 400 + Math.floor(rng() * 400),
    driftX: Math.floor(rng() * 200) - 100,
    delayMs: Math.floor(rng() * 200),
    durationMs: 1100 + Math.floor(rng() * 900),
  }));
}

type Props = {
  show: boolean;
  /** Number of particles to spawn. Default 40 is a generous burst. */
  count?: number;
  /** Origin Y as % of parent height (0 = top). Default 0 (falls from top). */
  originY?: number;
};

export function Confetti({ show, count = 40, originY = 0 }: Props) {
  const reducedMotion = useReducedMotion();
  const [burstId, setBurstId] = useState(0);
  const lastShown = useRef(false);

  useEffect(() => {
    if (show && !lastShown.current) setBurstId((n) => n + 1);
    lastShown.current = show;
  }, [show]);

  if (reducedMotion || burstId === 0) return null;

  return <ConfettiBurst burstId={burstId} count={count} originY={originY} />;
}

function ConfettiBurst({
  burstId,
  count,
  originY,
}: {
  burstId: number;
  count: number;
  originY: number;
}) {
  const particles = useMemo<Particle[]>(
    () => spawn(count, burstId * 1009 + 3),
    [count, burstId],
  );
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
      {particles.map((p) => (
        <ParticleView key={p.key} particle={p} originY={originY} />
      ))}
    </View>
  );
}

function ParticleView({ particle: p, originY }: { particle: Particle; originY: number }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: p.durationMs,
      delay: p.delayMs,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      useNativeDriver: true,
    }).start();
  }, [t, p.delayMs, p.durationMs]);

  const translateY = t.interpolate({
    inputRange: [0, 1],
    outputRange: [0, p.fallDistance],
  });
  const translateX = t.interpolate({
    inputRange: [0, 1],
    outputRange: [0, p.driftX],
  });
  const rotate = t.interpolate({
    inputRange: [0, 1],
    outputRange: [`${p.rotateStart}deg`, `${p.rotateStart + p.rotateEnd}deg`],
  });
  const opacity = t.interpolate({
    inputRange: [0, 0.85, 1],
    outputRange: [1, 1, 0],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: `${originY}%`,
        left: `${p.startX}%`,
        width: p.size,
        height: p.size,
        backgroundColor: p.hue,
        borderRadius: p.size * 0.15,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate }],
      }}
    />
  );
}
