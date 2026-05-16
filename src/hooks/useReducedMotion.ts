import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform } from "react-native";

// Detect the user's reduced-motion preference. On web, listens to the
// prefers-reduced-motion media query and updates live. On native, returns the
// AccessibilityInfo flag (sticky on iOS — only updates between renders).

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") {
      if (typeof window === "undefined" || !window.matchMedia) return;
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const update = () => setReduced(mq.matches);
      update();
      try {
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
      } catch {
        // Safari < 14 fallback
        mq.addListener(update);
        return () => mq.removeListener(update);
      }
    }

    // Native — AccessibilityInfo is always available; the call is cheap.
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled?.().then((on) => {
      if (!cancelled) setReduced(on);
    });
    const sub = AccessibilityInfo.addEventListener?.(
      "reduceMotionChanged",
      (next: boolean) => {
        if (!cancelled) setReduced(next);
      },
    );
    return () => {
      cancelled = true;
      sub?.remove?.();
    };
  }, []);

  return reduced;
}
