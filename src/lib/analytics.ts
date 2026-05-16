// Analytics wrapper. No-op when no key is configured — production builds
// flip on PostHog by setting EXPO_PUBLIC_POSTHOG_KEY in the build env.
//
// Per CLAUDE.md we don't ship analytics without explicit user request. The
// strategy doc (docs/STRATEGY.md §10 PR 7) is that explicit request.
//
// Events to track (defined as a const map so typos fail at compile time):
//   daily_started      — player tapped "RUN IT" on daily
//   daily_completed    — daily flow reached result screen
//   practice_started   — /play?practice=1
//   practice_completed
//   room_created       — friends.tsx generated a code
//   room_joined        — joined via /r/CODE or /friends form
//   sync_room_started  — host tapped "start synced game"
//   share_clicked      — share button on result
//   streak_lost        — player missed a day
//   category_viewed    — /category/[slug]
//   settings_changed   — settings.tsx update

import Constants from "expo-constants";

export type AnalyticsEvent =
  | "daily_started"
  | "daily_completed"
  | "practice_started"
  | "practice_completed"
  | "room_created"
  | "room_joined"
  | "sync_room_started"
  | "share_clicked"
  | "streak_lost"
  | "category_viewed"
  | "settings_changed";

type EventProps = Record<string, string | number | boolean | undefined>;

const POSTHOG_KEY =
  process.env.EXPO_PUBLIC_POSTHOG_KEY ??
  (Constants.expoConfig?.extra?.posthogKey as string | undefined);

let initialized = false;
let posthog: { capture: (event: string, props?: EventProps) => void } | null = null;

async function initPosthog(): Promise<void> {
  if (initialized || !POSTHOG_KEY) return;
  initialized = true;
  // Dynamic import so the SDK isn't bundled when no key is set.
  // Wrapped in try/catch because the SDK may not be installed yet.
  try {
    // @ts-expect-error optional dependency, may not be installed
    const mod = await import("posthog-js");
    const ph = mod.default ?? mod;
    if (typeof ph.init === "function") {
      ph.init(POSTHOG_KEY, {
        api_host: "https://us.i.posthog.com",
        capture_pageview: true,
        autocapture: false,
      });
      posthog = ph;
    }
  } catch {
    // posthog-js not installed — events become no-ops.
  }
}

export function track(event: AnalyticsEvent, props?: EventProps): void {
  if (!POSTHOG_KEY) return; // no-op in dev / unconfigured envs
  if (!initialized) {
    void initPosthog().then(() => posthog?.capture(event, props));
    return;
  }
  posthog?.capture(event, props);
}
