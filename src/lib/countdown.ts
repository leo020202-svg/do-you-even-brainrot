import { useEffect, useState } from "react";

// Wall-clock "ms until the next local midnight" — drives the daily-rollover
// countdown on /. Tick cadence is one minute (we only display h+m, so 1s
// updates would just burn battery).

export function msUntilLocalMidnight(now: Date = new Date()): number {
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime() - now.getTime();
}

export function formatHoursMinutes(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h <= 0 && m <= 0) return "any second now";
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/** React hook that re-renders every `tickMs` (default 60 s). */
export function useMidnightCountdown(tickMs: number = 60_000): string {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), tickMs);
    return () => clearInterval(id);
  }, [tickMs]);
  return formatHoursMinutes(msUntilLocalMidnight(now));
}
