// Brainrot Glossary — searchable reference of slang, characters, and meme lore.
//
// Renders at /glossary as an SEO-rich content page. Each entry is hand-
// authored from the 2026 research that informs docs/VIRAL_PLAN.md and
// the new questions added in q201-q225. Sources cite Cambridge / Oxford
// dictionaries, Italian Brainrot Wiki, Know Your Meme, Wikipedia.
//
// Adding a term: append to the GLOSSARY array. The /glossary page picks
// up the new entry automatically.

export type GlossaryEntry = {
  term: string;
  /** Slug for direct linking via /glossary#term. */
  slug: string;
  /** Category tag — used as a filter chip on the page. */
  category:
    | "slang"
    | "italian-brainrot"
    | "skibidi"
    | "viral"
    | "creators"
    | "lore";
  /** One-paragraph plain-language definition. */
  definition: string;
  /** Optional example sentence using the term. */
  example?: string;
  /** Authoritative source — Oxford, Cambridge, Wikipedia, KYM, IB Wiki. */
  source?: { label: string; url: string };
};

export const GLOSSARY: readonly GlossaryEntry[] = [
  // ── Slang ────────────────────────────────────────────────────────────
  {
    term: "Rizz",
    slug: "rizz",
    category: "slang",
    definition:
      "Charisma — specifically, the charm or magnetic ability to attract romantic interest. Often used as a verb: 'to rizz someone up.' Originated from streamer Kai Cenat in 2021–22; named Oxford Word of the Year in 2023.",
    example: "He's got mad rizz.",
    source: {
      label: "Oxford Word of the Year 2023",
      url: "https://languages.oup.com/word-of-the-year/2023/",
    },
  },
  {
    term: "Sigma",
    slug: "sigma",
    category: "slang",
    definition:
      "Originally referring to a 'lone wolf' alpha-male archetype, sigma was absorbed by Gen Alpha as an all-purpose positive adjective meaning cool, confident, or stand-out. Often paired ironically — 'what the sigma?' is the new 'what the heck?'",
    example: "He skipped his lecture to play brainrot trivia. Pretty sigma of him.",
  },
  {
    term: "Skibidi",
    slug: "skibidi",
    category: "slang",
    definition:
      "Originally the name of the Skibidi Toilet YouTube series (created by Alexey Gerasimov / DaFuq!?Boom!), now used as a chaotic intensifier or filler. Can mean cool, bad, or anything depending on context.",
    example: "That's a skibidi-tier outfit.",
    source: {
      label: "Skibidi Toilet — Wikipedia",
      url: "https://en.wikipedia.org/wiki/Skibidi_Toilet",
    },
  },
  {
    term: "Ohio",
    slug: "ohio",
    category: "slang",
    definition:
      "Used as a descriptor for something cursed, weird, bizarre, or low-status. Decoupled from the actual US state. 'Only in Ohio' became the canonical caption for absurd content circa 2022.",
    example: "Bro just used a fork in his soup. Ohio energy.",
    source: {
      label: "Only in Ohio — Know Your Meme",
      url: "https://knowyourmeme.com/memes/only-in-ohio",
    },
  },
  {
    term: "Gyatt",
    slug: "gyatt",
    category: "slang",
    definition:
      "An exclamation expressing admiration or surprise — typically directed at someone with an attractively curvaceous figure. Derived from a stretched pronunciation of 'goddamn'.",
  },
  {
    term: "Delulu",
    slug: "delulu",
    category: "slang",
    definition:
      "Short for delusional, used playfully to describe someone holding unrealistic hopes or beliefs (usually romantic). 'Being delulu is the solulu' became a common refrain.",
    example: "She thinks he's gonna text back. Total delulu.",
    source: {
      label: "Delulu — Cambridge Dictionary",
      url: "https://dictionary.cambridge.org/dictionary/english/delulu",
    },
  },
  {
    term: "Situationship",
    slug: "situationship",
    category: "slang",
    definition:
      "An ambiguous romantic relationship without a defined label — not friends, not dating, not in a committed couple. Added to Oxford English Dictionary in 2023.",
    source: {
      label: "Situationship — Oxford English Dictionary",
      url: "https://www.oed.com/dictionary/situationship_n",
    },
  },
  {
    term: "Fanum tax",
    slug: "fanum-tax",
    category: "slang",
    definition:
      "The act of taking a portion of a friend's food without asking — popularised by streamer Fanum, who repeatedly did this to Kai Cenat on stream.",
    source: {
      label: "Fanum Tax — Know Your Meme",
      url: "https://knowyourmeme.com/memes/fanum-tax",
    },
  },
  {
    term: "Mewing",
    slug: "mewing",
    category: "slang",
    definition:
      "The practice of pressing the tongue against the roof of the mouth in an attempt to reshape the jawline. A TikTok-popularised technique with disputed scientific basis; also used jokingly to signal someone is performing it.",
    source: {
      label: "Mewing — Know Your Meme",
      url: "https://knowyourmeme.com/memes/mewing",
    },
  },
  {
    term: "Mid",
    slug: "mid",
    category: "slang",
    definition:
      "Mediocre, unimpressive — used as a dismissive adjective for content, food, fashion, opinions. The harshest possible insult that isn't actually offensive.",
    example: "The new season is mid.",
  },
  {
    term: "No cap",
    slug: "no-cap",
    category: "slang",
    definition:
      "Meaning 'no lie' / 'for real' — 'cap' is slang for a lie. Often used to emphasize truthfulness.",
    example: "That was the best brainrot round of my life, no cap.",
  },
  // ── Italian Brainrot characters ──────────────────────────────────────
  {
    term: "Tralalero Tralala",
    slug: "tralalero-tralala",
    category: "italian-brainrot",
    definition:
      "A three-legged blue shark wearing Nike sneakers. One of the foundational Italian Brainrot characters; the song name comes from an Italian children's nonsense rhyme.",
    source: {
      label: "Italian Brainrot — Wikipedia",
      url: "https://en.wikipedia.org/wiki/Italian_brainrot",
    },
  },
  {
    term: "Bombardiro Crocodilo",
    slug: "bombardiro-crocodilo",
    category: "italian-brainrot",
    definition:
      "A hybrid of a crocodile and a WWII bomber aircraft. Part of the original Italian Brainrot cast that surfaced on Italian TikTok in 2024.",
  },
  {
    term: "Ballerina Cappuccina",
    slug: "ballerina-cappuccina",
    category: "italian-brainrot",
    definition:
      "A ballerina with an espresso machine for a head. Each Italian Brainrot character usually has an associated nonsense narration; Ballerina's is among the most popular for stitches.",
  },
  {
    term: "Tung Tung Tung Sahur",
    slug: "tung-tung-tung-sahur",
    category: "italian-brainrot",
    definition:
      "An anthropomorphic wooden figure with a drum. Despite being grouped with the Italian Brainrot canon, 'Sahur' refers to the Indonesian pre-dawn Ramadan meal — the character originated in Indonesia and was absorbed into the Italian crossover meta.",
  },
  {
    term: "Brr Brr Patapim",
    slug: "brr-brr-patapim",
    category: "italian-brainrot",
    definition:
      "A forest-creature hybrid with the body of an animal and an elongated tree-trunk face. Lore-rich character with extensive fan content.",
  },
  {
    term: "Lirilì Larilà",
    slug: "lirili-larila",
    category: "italian-brainrot",
    definition:
      "An elephant-cactus hybrid with a clock element. Part of the second wave of Italian Brainrot characters that emerged in late 2024.",
    source: {
      label: "Lirilì Larilà — Italian Brainrot Wiki",
      url: "https://italianbrainrot.fandom.com/wiki/Lirili_Larila",
    },
  },
  {
    term: "Frigo Camelo",
    slug: "frigo-camelo",
    category: "italian-brainrot",
    definition:
      "A camel with a household refrigerator for a head. 'Frigo' is Italian for fridge.",
  },
  {
    term: "Trippi Troppi",
    slug: "trippi-troppi",
    category: "italian-brainrot",
    definition:
      "A cat–fish hybrid — cat body with fish features. Part of the expanded canon documented on the Italian Brainrot Wiki.",
  },
  {
    term: "Cappuccino Assassino",
    slug: "cappuccino-assassino",
    category: "italian-brainrot",
    definition:
      "An espresso-themed assassin character. The name is a portmanteau of 'cappuccino' and 'assassino' (Italian for assassin).",
  },
  {
    term: "Bombombini Gusini",
    slug: "bombombini-gusini",
    category: "italian-brainrot",
    definition:
      "A bomber-plane goose character, often depicted as Bombardiro Crocodilo's wingman in fan-extended lore.",
  },
  // ── Skibidi ──────────────────────────────────────────────────────────
  {
    term: "Skibidi Toilet",
    slug: "skibidi-toilet",
    category: "skibidi",
    definition:
      "A YouTube series by Alexey Gerasimov (channel: DaFuq!?Boom!) featuring singing toilet-heads at war with humanoid figures wearing camera, TV, and speaker heads. Premiered February 2023; produced primarily in Blender and Source Filmmaker.",
    source: {
      label: "Skibidi Toilet — Wikipedia",
      url: "https://en.wikipedia.org/wiki/Skibidi_Toilet",
    },
  },
  {
    term: "Cameramen / TV-Men / Speaker-Men",
    slug: "cameramen",
    category: "skibidi",
    definition:
      "The humanoid alliance opposing the Skibidi Toilets. Each faction has a different head type (camera, TV, speaker) with different roles in the lore.",
  },
  // ── Viral moments ────────────────────────────────────────────────────
  {
    term: "Hawk Tuah",
    slug: "hawk-tuah",
    category: "viral",
    definition:
      "Catchphrase popularized by Hailey Welch in a June 2024 Nashville street interview. Welch parlayed the viral moment into a podcast and merchandise.",
    source: {
      label: "Hailey Welch — Wikipedia",
      url: "https://en.wikipedia.org/wiki/Hailey_Welch",
    },
  },
  {
    term: "Moo Deng",
    slug: "moo-deng",
    category: "viral",
    definition:
      "A baby pygmy hippo born in July 2024 at Khao Kheow Open Zoo in Chonburi, Thailand. Became a viral phenomenon for her playful aggression and pink coloring.",
    source: {
      label: "Moo Deng — Wikipedia",
      url: "https://en.wikipedia.org/wiki/Moo_Deng",
    },
  },
  {
    term: "Pedro Pedro Pedro (raccoon)",
    slug: "pedro-raccoon",
    category: "viral",
    definition:
      "A meme animation of a swaying raccoon set to the song 'Pedro' by Italian artist Raffaella Carrà (1980). Became one of the dominant TikTok audios of 2024.",
    source: {
      label: "Pedro the Raccoon — Know Your Meme",
      url: "https://knowyourmeme.com/memes/pedro-the-raccoon-pedro-pedro-pedro",
    },
  },
  {
    term: "Costco Guys",
    slug: "costco-guys",
    category: "viral",
    definition:
      "A father-son TikTok duo (A.J. and Big Justice) who review Costco items using the rating system 'boom or doom.'",
  },
  // ── Creators ─────────────────────────────────────────────────────────
  {
    term: "MrBeast",
    slug: "mrbeast",
    category: "creators",
    definition:
      "Jimmy Donaldson, YouTuber known for high-budget stunts and large cash giveaways. As of 2025, the most-subscribed individual creator on the platform.",
    source: {
      label: "MrBeast — Wikipedia",
      url: "https://en.wikipedia.org/wiki/MrBeast",
    },
  },
  {
    term: "IShowSpeed",
    slug: "ishowspeed",
    category: "creators",
    definition:
      "Darren Watkins Jr., a livestreamer known for his Ronaldo-related content and energetic streams.",
    source: {
      label: "IShowSpeed — Wikipedia",
      url: "https://en.wikipedia.org/wiki/IShowSpeed",
    },
  },
  {
    term: "Kai Cenat",
    slug: "kai-cenat",
    category: "creators",
    definition:
      "Twitch streamer and founder of AMP (Any Means Possible), a creator collective. Frequently credited with originating or popularising several Gen Alpha slang terms including rizz.",
    source: {
      label: "Kai Cenat — Wikipedia",
      url: "https://en.wikipedia.org/wiki/Kai_Cenat",
    },
  },
  // ── Lore ─────────────────────────────────────────────────────────────
  {
    term: "Brain rot",
    slug: "brain-rot",
    category: "lore",
    definition:
      "The supposed deterioration of mental state caused by overconsuming trivial online content. Named Oxford Word of the Year 2024; Oxford traces the earliest recorded English use to Henry David Thoreau's 'Walden' (1854).",
    source: {
      label: "Brain rot — Oxford Word of the Year 2024",
      url: "https://corp.oup.com/news/brain-rot-named-oxford-word-of-the-year-2024/",
    },
  },
];

export type GlossaryCategory = GlossaryEntry["category"];
export const CATEGORY_LABEL: Record<GlossaryCategory, string> = {
  slang: "Gen Alpha Slang",
  "italian-brainrot": "Italian Brainrot",
  skibidi: "Skibidi",
  viral: "Viral Moments",
  creators: "Creators",
  lore: "Lore",
};
export const CATEGORY_EMOJI: Record<GlossaryCategory, string> = {
  slang: "💀",
  "italian-brainrot": "🍝",
  skibidi: "🚽",
  viral: "📱",
  creators: "🎬",
  lore: "📜",
};
