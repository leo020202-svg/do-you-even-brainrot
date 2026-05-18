import type { ImageSourcePropType } from "react-native";
import type { Question } from "./questions";

// Per-character images for the Italian brainrot cast. All downloaded from
// Wikimedia Commons under Public Domain — see
// data/character-images-credits.json + scripts/download-character-images.py.
//
// `_all-characters` is the group composite used as a hero on the
// /category/italian-brainrot page and the landing.

const TRALALERO = require("../../assets/characters/tralalero-tralala.jpg");
const TUNG_TUNG_SAHUR = require("../../assets/characters/tung-tung-tung-sahur.jpg");
const BRR_BRR_PATAPIM = require("../../assets/characters/brr-brr-patapim.jpg");
const FRIGO_CAMELO = require("../../assets/characters/frigo-camelo.jpg");
const TRIPPI_TROPPI = require("../../assets/characters/trippi-troppi.jpg");
const ALL_CHARACTERS = require("../../assets/characters/_all-characters.jpg");

/** Public composite of every character. Use as a hero. */
export const ALL_CHARACTERS_IMAGE: ImageSourcePropType = ALL_CHARACTERS;

/** Per-character lookup — slug → image. */
export const CHARACTER_IMAGES: Record<string, ImageSourcePropType> = {
  "tralalero-tralala": TRALALERO,
  "tung-tung-tung-sahur": TUNG_TUNG_SAHUR,
  "brr-brr-patapim": BRR_BRR_PATAPIM,
  "frigo-camelo": FRIGO_CAMELO,
  "trippi-troppi": TRIPPI_TROPPI,
};

/**
 * Match map — full character name → slug. The matcher does a
 * case-insensitive substring scan over the question text + options.
 * Aliases live alongside the canonical name (e.g. "Lirilì Larilà" and
 * "Lirili Larila" both match).
 *
 * Only characters we actually have an image for appear here.
 */
const NAME_TO_SLUG: Array<[string, string]> = [
  ["Tralalero Tralala", "tralalero-tralala"],
  ["Tung Tung Tung Sahur", "tung-tung-tung-sahur"],
  ["Tung Tung Tung", "tung-tung-tung-sahur"],
  ["Brr Brr Patapim", "brr-brr-patapim"],
  ["Frigo Camelo", "frigo-camelo"],
  ["Trippi Troppi", "trippi-troppi"],
];

/**
 * Scan a question's text + options for a known character name. Returns the
 * slug of the first match (canonical name order takes precedence) or null.
 */
export function characterSlugForQuestion(q: Question): string | null {
  const haystack = [q.question, ...q.options.map((o) => o.text)]
    .join(" \n ")
    .toLowerCase();
  for (const [name, slug] of NAME_TO_SLUG) {
    if (haystack.includes(name.toLowerCase())) return slug;
  }
  return null;
}

export function characterImageForQuestion(
  q: Question,
): ImageSourcePropType | undefined {
  const slug = characterSlugForQuestion(q);
  return slug ? CHARACTER_IMAGES[slug] : undefined;
}
