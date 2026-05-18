// Smoothly rolls a displayed number from `from` up to `to` over `durationMs`.
// Used on the result screen so the score climbs visually instead of just
// appearing. Respects reduced-motion (snaps instantly).

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

export function useAnimatedNumber(
  to: number,
  durationMs: number = 800,
  from: number = 0,
): number {
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(from);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setValue(to);
      return;
    }
    startTime.current = null;
    const tick = (now: number) => {
      if (startTime.current === null) startTime.current = now;
      const elapsed = now - startTime.current;
      const t = Math.min(1, elapsed / durationMs);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(from + (to - from) * eased);
      setValue(current);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [to, durationMs, from, reducedMotion]);

  return value;
}
