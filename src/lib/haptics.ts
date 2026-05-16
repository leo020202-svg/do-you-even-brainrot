// Cross-platform haptic helper. expo-haptics ships native bindings for iOS +
// Android — on web there's no vibration API parity, so every call is a no-op
// there. Fire-and-forget; we don't await anything and silently swallow errors
// (some Android devices throw if the user has haptics disabled at the OS level).

import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

function safe<T>(fn: () => T): void {
  if (Platform.OS === "web") return;
  try {
    void fn();
  } catch {
    // disabled at OS level / unsupported device — silent
  }
}

/** Light tap when locking in an answer. */
export function tapHaptic(): void {
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/** Success ding when the reveal shows correct. */
export function successHaptic(): void {
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

/** Error rumble when the reveal shows wrong. */
export function wrongHaptic(): void {
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
}

/** Soft warning when the timer ran out. */
export function skipHaptic(): void {
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}

/** Heavier thump for the final-question / game-over moment. */
export function finaleHaptic(): void {
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
}
