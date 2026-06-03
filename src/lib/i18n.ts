// Lightweight i18n.
//
// Brainrot is literally Italian — Tralalero, Bombardiro, Ballerina — so
// shipping in Italian is on-brand AND opens ~60M new players. Designed
// to grow: add a new locale by creating src/lib/i18n/<lang>.ts and
// registering it in LOCALES below.
//
// Strategy: explicit string keys, default English, Italian translation
// for the high-traffic landing + home + CTAs. Per-question localization
// is queued for a later commit — the questions themselves carry Italian-
// origin proper nouns so the meaning carries even in English.

import { useEffect, useState } from "react";
import { Platform } from "react-native";

export type Locale = "en" | "it";

const STORAGE_KEY = "brainrot.locale.v1";

/** All translatable string keys live here. Add a key, then translate it. */
export type TranslationKey =
  | "play_now"
  | "play_with_friends"
  | "endless_mode"
  | "todays_daily"
  | "unlimited_mode"
  | "see_score_card"
  | "back_to_home"
  | "back"
  | "settings"
  | "profile"
  | "glossary"
  | "image_credits"
  | "share"
  | "join"
  | "got_a_code"
  | "no_signup"
  | "no_install"
  | "free_forever"
  | "today"
  | "longest"
  | "streak"
  | "accuracy"
  | "played"
  | "next_drops_in"
  | "running_late_or_not_at_all"
  | "how_it_works"
  | "three_modes"
  | "categories"
  | "faq"
  | "make_questions";

type Bundle = Record<TranslationKey, string>;

const EN: Bundle = {
  play_now: "PLAY NOW",
  play_with_friends: "play with friends",
  endless_mode: "endless mode",
  todays_daily: "today's daily",
  unlimited_mode: "unlimited mode",
  see_score_card: "see your score card",
  back_to_home: "back to home",
  back: "← back",
  settings: "settings",
  profile: "profile",
  glossary: "glossary",
  image_credits: "image credits",
  share: "share",
  join: "join 🚪",
  got_a_code: "got a friend's room code?",
  no_signup: "no signup",
  no_install: "no install",
  free_forever: "free forever",
  today: "today",
  longest: "longest",
  streak: "streak",
  accuracy: "accuracy",
  played: "played",
  next_drops_in: "next daily drops in",
  running_late_or_not_at_all: "don't lose the streak",
  how_it_works: "how it works",
  three_modes: "the modes",
  categories: "categories",
  faq: "faq",
  make_questions: "hand-curated questions",
};

const IT: Bundle = {
  play_now: "GIOCA ORA",
  play_with_friends: "gioca con amici",
  endless_mode: "modalità infinita",
  todays_daily: "sfida di oggi",
  unlimited_mode: "modalità illimitata",
  see_score_card: "vedi il tuo punteggio",
  back_to_home: "torna alla home",
  back: "← indietro",
  settings: "impostazioni",
  profile: "profilo",
  glossary: "glossario",
  image_credits: "crediti immagini",
  share: "condividi",
  join: "entra 🚪",
  got_a_code: "hai il codice di un amico?",
  no_signup: "nessuna registrazione",
  no_install: "nessuna installazione",
  free_forever: "gratis per sempre",
  today: "oggi",
  longest: "record",
  streak: "serie",
  accuracy: "precisione",
  played: "giocate",
  next_drops_in: "la prossima sfida arriva tra",
  running_late_or_not_at_all: "non perdere la serie",
  how_it_works: "come funziona",
  three_modes: "le modalità",
  categories: "categorie",
  faq: "domande frequenti",
  make_questions: "domande curate a mano",
};

const LOCALES: Record<Locale, Bundle> = { en: EN, it: IT };

export const SUPPORTED_LOCALES: { code: Locale; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
];

let currentLocale: Locale = "en";
const subscribers = new Set<(l: Locale) => void>();

function detectInitialLocale(): Locale {
  if (Platform.OS !== "web") return "en";
  if (typeof navigator === "undefined") return "en";
  const lang = (navigator.language || "en").toLowerCase();
  if (lang.startsWith("it")) return "it";
  return "en";
}

/** One-time bootstrap from localStorage (if set) or browser language. */
export function bootstrapLocale(): void {
  if (Platform.OS !== "web") return;
  try {
    const saved = globalThis.localStorage?.getItem(STORAGE_KEY) as Locale | null;
    if (saved && saved in LOCALES) {
      currentLocale = saved;
      return;
    }
  } catch {
    // localStorage unavailable; fall through to language detection.
  }
  currentLocale = detectInitialLocale();
}

export function setLocale(l: Locale): void {
  if (!(l in LOCALES)) return;
  currentLocale = l;
  if (Platform.OS === "web") {
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, l);
    } catch {
      // quota / private mode — silent
    }
  }
  for (const cb of subscribers) cb(l);
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: TranslationKey): string {
  return LOCALES[currentLocale][key] ?? LOCALES.en[key] ?? key;
}

/** Subscribe a component to locale changes — re-renders when it flips. */
export function useLocale(): Locale {
  const [l, setL] = useState<Locale>(currentLocale);
  useEffect(() => {
    const cb = (next: Locale) => setL(next);
    subscribers.add(cb);
    return () => {
      subscribers.delete(cb);
    };
  }, []);
  return l;
}
