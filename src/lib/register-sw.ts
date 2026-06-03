// Service worker registration — web-only, no-op on native.
//
// Called once from app/_layout.tsx after the navigator is ready. We skip
// registration in dev so Metro's HMR isn't fighting the SW for control of
// fetches.

import { Platform } from "react-native";

export function registerServiceWorker(): void {
  if (Platform.OS !== "web") return;
  if (typeof navigator === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  // process.env.NODE_ENV is "development" under expo start, "production"
  // after expo export. Only register in production builds.
  if (
    typeof process !== "undefined" &&
    process.env &&
    process.env.NODE_ENV !== "production"
  ) {
    return;
  }
  // Fire-and-forget — don't block first paint on the SW handshake.
  void navigator.serviceWorker
    .register("/service-worker.js", { scope: "/" })
    .catch(() => {
      // SW registration failed (probably no HTTPS in dev or unsupported
      // browser). Swallow — the app works fine without it.
    });
}
