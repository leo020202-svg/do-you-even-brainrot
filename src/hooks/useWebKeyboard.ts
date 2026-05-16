import { useEffect } from "react";
import { Platform } from "react-native";

// Lightweight web-only keyboard listener. Native is a no-op so the calling
// code can stay platform-agnostic.
//
// `handler` receives the raw KeyboardEvent so the caller can decide whether
// to call preventDefault(). It returns void; ignored on native.

export function useWebKeyboard(handler: (event: KeyboardEvent) => void): void {
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof window === "undefined") return;
    const onKey = (e: KeyboardEvent) => handler(e);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handler]);
}
