// Screen-wobble wrapper. Re-shakes every time `trigger` changes value.
// Respects prefers-reduced-motion.

import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Easing } from "react-native";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Props = {
  /** Any value that, when it changes, kicks off a new shake. Use a counter
   *  bumped on wrong answers, or just toggle a boolean. */
  trigger: unknown;
  /** px of horizontal travel at peak. Default 8 — visible but not nauseating. */
  amplitude?: number;
  children: ReactNode;
};

export function Shake({ trigger, amplitude = 8, children }: Props) {
  const reducedMotion = useReducedMotion();
  const x = useRef(new Animated.Value(0)).current;
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    if (reducedMotion) return;
    Animated.sequence([
      Animated.timing(x, { toValue: -amplitude, duration: 50, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.timing(x, { toValue: amplitude, duration: 70, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
      Animated.timing(x, { toValue: -amplitude * 0.6, duration: 70, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
      Animated.timing(x, { toValue: amplitude * 0.4, duration: 60, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
      Animated.timing(x, { toValue: 0, duration: 60, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
    ]).start();
  }, [trigger, amplitude, reducedMotion, x]);

  return <Animated.View style={{ transform: [{ translateX: x }] }}>{children}</Animated.View>;
}
