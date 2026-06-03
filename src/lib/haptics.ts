// Cross-platform feedback — haptics on native, Web Audio synth sounds on web.
// Every call site fires both; the platform-inappropriate one no-ops silently.
//
// Native: expo-haptics. Sounds are no-op (file-based audio + expo-av wiring
// queued for a later PR).
// Web: no haptic API parity, so sounds are the entire feedback. See
// src/lib/sounds.ts for the synth implementation; user toggle lives in
// the settings store.

import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import {
  correctSound,
  finaleSound,
  skipSound,
  tapSound,
  unlockSound,
  wrongSound,
} from "./sounds";

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
  tapSound();
}

/** Success ding when the reveal shows correct. */
export function successHaptic(): void {
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  correctSound();
}

/** Error rumble when the reveal shows wrong. */
export function wrongHaptic(): void {
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
  wrongSound();
}

/** Soft warning when the timer ran out. */
export function skipHaptic(): void {
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
  skipSound();
}

/** Heavier thump for the final-question / game-over moment. */
export function finaleHaptic(): void {
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
  finaleSound();
}

/** Achievement-unlock chime — paired with the new unlock toast. */
export function unlockHaptic(): void {
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  unlockSound();
}
