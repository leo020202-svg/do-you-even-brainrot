// Per-category SEO metadata. The intro paragraphs are AI-search-citation-
// optimized: lead with a plain-English answer, then specifics, then sources.
// Each is meant to be the canonical "what is X" destination on the web.
//
// `key` matches the category values in data/questions.json.
// `slug` is the URL slug used in /category/[slug].

import type { Category } from "@/lib/questions";

export type CategoryMeta = {
  key: Category;
  slug: string;
  emoji: string;
  name: string;
  /** Short blurb for category chips + meta description (≤160 chars). */
  blurb: string;
  /** Long-form intro paragraph for the landing page + AI-search citation. */
  intro: string;
  /** Curated outbound source links for trust + topical authority. */
  sources: Array<{ label: string; url: string }>;
};

export const CATEGORIES: CategoryMeta[] = [
  {
    key: "italian_brainrot",
    slug: "italian-brainrot",
    emoji: "🍝",
    name: "Italian Brainrot",
    blurb:
      "Tralalero Tralala, Bombardiro Crocodilo, Ballerina Cappuccina — AI-generated Italian TikTok characters with absurd backstories.",
    intro:
      "Italian Brainrot is a 2024–2025 TikTok phenomenon of AI-generated anthropomorphic characters with Italian-sounding names, narrated in mock-Italian by AI voices. Tralalero Tralala (a three-legged shark wearing Nike sneakers), Bombardiro Crocodilo (a crocodile with a bomber plane for a body), and Ballerina Cappuccina (a ballerina with an espresso machine for a head) are the breakout stars. The trend originated in Italian TikTok comments in late 2024 and rapidly globalised. Characters frequently have fake lore, fake biographies, and fake rivalries with each other.",
    sources: [
      { label: "Italian Brainrot Wiki", url: "https://italianbrainrot.fandom.com/" },
      { label: "Know Your Meme — Italian Brainrot", url: "https://knowyourmeme.com/memes/italian-brainrot" },
    ],
  },
  {
    key: "skibidi",
    slug: "skibidi",
    emoji: "🚽",
    name: "Skibidi Lore",
    blurb:
      "The Cameramen vs. Skibidi Toilet universe by DaFuq!?Boom! on YouTube. Heads in toilets, TVs for heads, war.",
    intro:
      "Skibidi Toilet is a YouTube animated series by Alexey Gerasimov (DaFuq!?Boom!) that launched February 2023. Episodes (most under 60 seconds) depict a war between the Skibidi Toilets — disembodied human heads emerging from toilet bowls singing a remix of Biser King's \"Dom Dom Yes Yes\" — and the Cameramen, Speakermen, and TVmen, humanoid figures with electronics for heads. By mid-2024 the series surpassed 65 billion combined views, becoming one of the most-watched things ever made. The franchise has been called \"brainrot\" by its own audience and embraced the label.",
    sources: [
      { label: "DaFuq!?Boom! on YouTube", url: "https://www.youtube.com/@DaFuqBoom" },
      { label: "Know Your Meme — Skibidi Toilet", url: "https://knowyourmeme.com/memes/skibidi-toilet" },
    ],
  },
  {
    key: "gen_alpha_slang",
    slug: "gen-alpha-slang",
    emoji: "💀",
    name: "Gen Alpha Slang",
    blurb:
      "rizz, sigma, ohio, gyatt, fanum tax, mewing, mid, no cap, slay — the 2023–2025 lexicon.",
    intro:
      "Gen Alpha slang refers to the vocabulary popularised by people born roughly 2010–2024, largely on TikTok and Twitch streams. Key terms: \"rizz\" (charisma, especially romantic; named Oxford Word of the Year 2023), \"sigma\" (lone-wolf masculinity ideal), \"ohio\" (anything embarrassing or strange), \"gyatt\" (exclamation about a large rear), \"fanum tax\" (when someone takes your food, after streamer Fanum), \"mewing\" (a jaw-strengthening technique turned into a silent gesture), \"mid\" (mediocre), \"no cap\" (no lie), \"slay\" (do something well). Most terms predate Gen Alpha but were repopularised by them.",
    sources: [
      { label: "Oxford WOTY 2023 (rizz)", url: "https://corp.oup.com/word-of-the-year/" },
      { label: "Know Your Meme — Gen Alpha Slang", url: "https://knowyourmeme.com/categories/gen-alpha" },
    ],
  },
  {
    key: "viral_moments",
    slug: "viral-moments",
    emoji: "📱",
    name: "Viral Moments",
    blurb:
      "Pedro the raccoon, Hawk Tuah, Costco Guys, Moo Deng — the brief obsessions of 2024–2025.",
    intro:
      "Viral Moments captures specific events, clips, or phrases that briefly dominated social platforms in 2024–2025. Examples: Pedro the raccoon (a viral dance to Raffaella Carrà's \"Pedro\"), Hawk Tuah (a 2024 street-interview soundbite turned brand), Costco Guys (father-son duo with the \"boom!\" catchphrase), Moo Deng (a pygmy hippo at the Khao Kheow Open Zoo in Thailand). Each was the entire internet's conversation for roughly two weeks before being supplanted.",
    sources: [
      { label: "Know Your Meme — 2024 Memes", url: "https://knowyourmeme.com/memes/sites/tiktok" },
    ],
  },
  {
    key: "creators",
    slug: "creators",
    emoji: "🎬",
    name: "Creators",
    blurb:
      "The people behind the memes — MrBeast, IShowSpeed, Kai Cenat, Druski, and the rest of the influence stack.",
    intro:
      "The Creators category covers the people generating brainrot-adjacent content: MrBeast (the largest YouTuber by subscriber count), IShowSpeed (high-energy gaming and IRL streams), Kai Cenat (Twitch streamer, founder of Streamer University), Druski (comedic skits, often improvising with celebrities), and similar figures. These creators are both vectors for memes and meme subjects themselves — their catchphrases, mannerisms, and feuds become brainrot fodder within days.",
    sources: [
      { label: "Know Your Meme — Notable People", url: "https://knowyourmeme.com/categories/people" },
    ],
  },
  {
    key: "cross_platform",
    slug: "cross-platform",
    emoji: "🌐",
    name: "Cross-Platform",
    blurb:
      "Memes that crossed from one platform to another — Twitch → YouTube, TikTok → Twitter, Discord → Reddit.",
    intro:
      "Cross-Platform Memes covers content that originated on one platform and then jumped to others, often mutating in the process. The mutation is usually the funny part: a Twitch chat in-joke becoming a TikTok sound, a Discord screenshot becoming a Reddit thread, a YouTube short becoming a Twitter video. Tracking the cross-platform path is a kind of internet-historical sport.",
    sources: [
      { label: "Know Your Meme — Cross-Platform", url: "https://knowyourmeme.com/" },
    ],
  },
  {
    key: "deep_cuts",
    slug: "deep-cuts",
    emoji: "🕳️",
    name: "Deep Cuts",
    blurb:
      "Pre-2023 internet history that informs modern brainrot — Vine, deep-fried memes, ironic shitposting.",
    intro:
      "Deep Cuts are pre-2023 internet artefacts whose DNA shows up in current brainrot. Vine's 6-second compression discipline directly informed TikTok's edit pace. Deep-fried images (over-compressed, over-saturated, max-contrast) trained an entire generation in ironic visual humour. Tumblr's late-2010s absurdist text posts established the rhythm of contemporary brainrot dialogue. Knowing the lineage separates the casual viewer from the lore-pilled.",
    sources: [
      { label: "Know Your Meme — Internet History", url: "https://knowyourmeme.com/categories/sub-cultures" },
    ],
  },
  {
    key: "absurdity",
    slug: "absurdity",
    emoji: "🤡",
    name: "Absurdity",
    blurb:
      "The category for things that are funny because nothing else explains them. The point IS the lack of point.",
    intro:
      "Absurdity is the catch-all for content whose primary characteristic is that it makes no sense and is funny because of that, not in spite of it. Where Italian Brainrot has lore and Skibidi has plot, absurdity has neither — just a vibe. Examples: the \"hello there\" baby image, the dance of the swing dog, anything from /r/surrealmemes circa 2018. The category is where Gen Alpha's anti-narrative humour lives.",
    sources: [
      { label: "Know Your Meme — Surreal Memes", url: "https://knowyourmeme.com/memes/cultures/surreal-memes" },
    ],
  },
];

export function categoryBySlug(slug: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
