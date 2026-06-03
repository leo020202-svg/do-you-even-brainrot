// Cross-platform sound effects.
//
// Web: Web Audio API synth — generates tones at runtime, zero asset bundle.
//      Each effect is a short oscillator + gain envelope, designed to feel
//      snappy and slightly retro (matches the design language).
// Native: no-op for now. expo-av integration can be added later; the call
//      sites import the same API so wiring becomes a one-file change.
//
// All sounds respect the user's settings.soundsEnabled flag (read fresh
// from the Zustand store each call — no cached subscription).

import { Platform } from "react-native";
import { useSettingsStore } from "@/features/settings/store";

// Single AudioContext, lazily created. Browsers throttle multiple contexts
// and require a user gesture before resume() — we resume on first play.
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (Platform.OS !== "web") return null;
  if (typeof globalThis === "undefined") return null;
  const AC =
    (globalThis as unknown as { AudioContext?: typeof AudioContext }).AudioContext ??
    (globalThis as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  // Browsers suspend the context until a user gesture; resume best-effort.
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}

function shouldPlay(): boolean {
  if (Platform.OS !== "web") return false;
  return useSettingsStore.getState().soundsEnabled !== false;
}

type Tone = {
  /** Frequency in Hz. */
  freq: number;
  /** Start offset within the effect, in seconds. */
  startAt: number;
  /** How long the tone lasts. */
  durationS: number;
  /** Peak gain (0–1). Multiple tones stack additively. */
  gain?: number;
  /** Oscillator waveform. Default sine. Square/triangle feel more retro. */
  type?: OscillatorType;
};

function playSequence(tones: Tone[]): void {
  if (!shouldPlay()) return;
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  // Master gain so individual tone-gains don't clip when stacking.
  const master = c.createGain();
  master.gain.value = 0.35;
  master.connect(c.destination);

  for (const tone of tones) {
    const osc = c.createOscillator();
    const env = c.createGain();
    const peak = tone.gain ?? 0.6;
    const t0 = now + tone.startAt;
    const t1 = t0 + tone.durationS;
    osc.type = tone.type ?? "sine";
    osc.frequency.value = tone.freq;
    // Quick attack, exp release — short and percussive.
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(peak, t0 + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, t1);
    osc.connect(env);
    env.connect(master);
    osc.start(t0);
    osc.stop(t1 + 0.02);
  }
}

// ── Effects ──────────────────────────────────────────────────────────────

/** Short button-tap blip — 200 Hz square, 80 ms. */
export function tapSound(): void {
  playSequence([{ freq: 220, startAt: 0, durationS: 0.06, type: "square", gain: 0.4 }]);
}

/** Happy ascending C–E–G chord arpeggio for correct answers. */
export function correctSound(): void {
  playSequence([
    { freq: 523.25, startAt: 0.0, durationS: 0.12, type: "triangle" }, // C5
    { freq: 659.25, startAt: 0.06, durationS: 0.14, type: "triangle" }, // E5
    { freq: 783.99, startAt: 0.12, durationS: 0.18, type: "triangle" }, // G5
  ]);
}

/** Sad descending two-tone for wrong answers. */
export function wrongSound(): void {
  playSequence([
    { freq: 329.63, startAt: 0.0, durationS: 0.14, type: "sawtooth", gain: 0.45 }, // E4
    { freq: 246.94, startAt: 0.12, durationS: 0.18, type: "sawtooth", gain: 0.5 }, // B3
  ]);
}

/** Neutral skip click — single tick. */
export function skipSound(): void {
  playSequence([{ freq: 400, startAt: 0, durationS: 0.08, type: "square", gain: 0.3 }]);
}

/** Game-over sting — descending C-A-F-C arpeggio. */
export function finaleSound(): void {
  playSequence([
    { freq: 523.25, startAt: 0.0, durationS: 0.1, type: "triangle" }, // C5
    { freq: 440.0, startAt: 0.1, durationS: 0.1, type: "triangle" }, // A4
    { freq: 349.23, startAt: 0.2, durationS: 0.1, type: "triangle" }, // F4
    { freq: 261.63, startAt: 0.3, durationS: 0.22, type: "triangle" }, // C4
  ]);
}

/** Achievement unlock — bright ascending fifth + octave. */
export function unlockSound(): void {
  playSequence([
    { freq: 523.25, startAt: 0.0, durationS: 0.12, type: "sine" }, // C5
    { freq: 783.99, startAt: 0.1, durationS: 0.14, type: "sine" }, // G5
    { freq: 1046.5, startAt: 0.2, durationS: 0.26, type: "sine" }, // C6
  ]);
}

/** Reveal-screen "hold" tick — used by the synced reveal countdown. */
export function tickSound(): void {
  playSequence([{ freq: 880, startAt: 0, durationS: 0.04, type: "sine", gain: 0.25 }]);
}
