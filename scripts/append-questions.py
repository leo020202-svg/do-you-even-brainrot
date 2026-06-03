"""Append 25 research-backed questions to data/questions.json.

Each question carries a source URL pointing at the Italian Brainrot Wiki,
Know Your Meme, Wikipedia, or a verified news source. Authored by hand
from the 2026 research that informs docs/VIRAL_PLAN.md — not auto-
generated.

Idempotent: skips any id already present. Safe to re-run.

CLAUDE.md rules honoured:
- Decoys are the joke (each question has at least one funny wrong option).
- Fact-checked from cited sources only.
- Difficulty calibration matches docs/DESIGN_NOTES.md.
- Sources on every expert-tier (and most medium/hard) question.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUESTIONS_PATH = ROOT / "data" / "questions.json"

NEW = [
    # ── Italian Brainrot — expanded canon ────────────────────────────────
    {
        "id": "q201",
        "category": "italian_brainrot",
        "difficulty": "medium",
        "question": "Lirilì Larilà is depicted as what kind of hybrid creature?",
        "options": [
            {"id": "A", "text": "A cactus-elephant with a clock"},
            {"id": "B", "text": "A pineapple-shaped DJ"},
            {"id": "C", "text": "A pizza on roller skates"},
            {"id": "D", "text": "A spaghetti-armed astronaut"},
        ],
        "correct_answer": "A",
        "source": "https://italianbrainrot.fandom.com/wiki/Lirili_Larila",
        "tags": ["character"],
        "active": True,
    },
    {
        "id": "q202",
        "category": "italian_brainrot",
        "difficulty": "medium",
        "question": "Bombombini Gusini is described as the friend of which other Italian brainrot character?",
        "options": [
            {"id": "A", "text": "Tralalero Tralala"},
            {"id": "B", "text": "Bombardiro Crocodilo"},
            {"id": "C", "text": "Ballerina Cappuccina"},
            {"id": "D", "text": "Brr Brr Patapim"},
        ],
        "correct_answer": "B",
        "source": "https://italianbrainrot.fandom.com/wiki/Bombombini_Gusini",
        "tags": ["character", "lore"],
        "active": True,
    },
    {
        "id": "q203",
        "category": "italian_brainrot",
        "difficulty": "medium",
        "question": "Frigo Camelo's head is shaped like what household appliance?",
        "options": [
            {"id": "A", "text": "A microwave"},
            {"id": "B", "text": "A dishwasher"},
            {"id": "C", "text": "A refrigerator"},
            {"id": "D", "text": "A toaster oven"},
        ],
        "correct_answer": "C",
        "source": "https://italianbrainrot.fandom.com/wiki/Frigo_Camelo",
        "tags": ["character"],
        "active": True,
    },
    {
        "id": "q204",
        "category": "italian_brainrot",
        "difficulty": "medium",
        "question": "Trippi Troppi is best described as which hybrid?",
        "options": [
            {"id": "A", "text": "Cat + fish"},
            {"id": "B", "text": "Frog + bicycle"},
            {"id": "C", "text": "Cow + helicopter"},
            {"id": "D", "text": "Lizard + lampshade"},
        ],
        "correct_answer": "A",
        "source": "https://italianbrainrot.fandom.com/wiki/Trippi_Troppi",
        "tags": ["character"],
        "active": True,
    },
    {
        "id": "q205",
        "category": "italian_brainrot",
        "difficulty": "easy",
        "question": "Cappuccino Assassino is themed around which two things?",
        "options": [
            {"id": "A", "text": "Coffee and assassination"},
            {"id": "B", "text": "Pasta and pirates"},
            {"id": "C", "text": "Pizza and ballet"},
            {"id": "D", "text": "Gelato and tax fraud"},
        ],
        "correct_answer": "A",
        "source": "https://italianbrainrot.fandom.com/wiki/Cappuccino_Assassino",
        "tags": ["character"],
        "active": True,
    },
    {
        "id": "q206",
        "category": "italian_brainrot",
        "difficulty": "hard",
        "question": "The Italian Brainrot canon is generally agreed to have started circulating widely on which platform first?",
        "options": [
            {"id": "A", "text": "Instagram Reels"},
            {"id": "B", "text": "TikTok (Italian community)"},
            {"id": "C", "text": "YouTube Shorts"},
            {"id": "D", "text": "Reddit r/italyhumor"},
        ],
        "correct_answer": "B",
        "source": "https://en.wikipedia.org/wiki/Italian_brainrot",
        "tags": ["origin"],
        "active": True,
    },
    {
        "id": "q207",
        "category": "italian_brainrot",
        "difficulty": "hard",
        "question": "How are Italian brainrot character images typically generated?",
        "options": [
            {"id": "A", "text": "Hand-drawn by one Italian artist"},
            {"id": "B", "text": "AI image generators with absurdist prompts"},
            {"id": "C", "text": "Edited photos from old commercials"},
            {"id": "D", "text": "Found footage from 1980s Italian TV"},
        ],
        "correct_answer": "B",
        "source": "https://en.wikipedia.org/wiki/Italian_brainrot",
        "tags": ["origin"],
        "active": True,
    },
    # ── Gen Alpha slang — dictionary additions ──────────────────────────
    {
        "id": "q208",
        "category": "gen_alpha_slang",
        "difficulty": "easy",
        "question": "'Delulu' is short for which word?",
        "options": [
            {"id": "A", "text": "Delusional"},
            {"id": "B", "text": "Deli (the sandwich shop)"},
            {"id": "C", "text": "Delivery"},
            {"id": "D", "text": "Delightful"},
        ],
        "correct_answer": "A",
        "source": "https://dictionary.cambridge.org/dictionary/english/delulu",
        "tags": ["slang"],
        "active": True,
    },
    {
        "id": "q209",
        "category": "gen_alpha_slang",
        "difficulty": "easy",
        "question": "A 'situationship' refers to…",
        "options": [
            {"id": "A", "text": "A boat owned by a stockbroker"},
            {"id": "B", "text": "An ambiguous romantic relationship without a clear label"},
            {"id": "C", "text": "A job interview that goes badly"},
            {"id": "D", "text": "The plot of every reality dating show"},
        ],
        "correct_answer": "B",
        "source": "https://www.oed.com/dictionary/situationship_n",
        "tags": ["slang"],
        "active": True,
    },
    {
        "id": "q210",
        "category": "gen_alpha_slang",
        "difficulty": "medium",
        "question": "The 'Fanum tax' refers to what behaviour, originating from streamer Fanum?",
        "options": [
            {"id": "A", "text": "Charging for stream subscriptions"},
            {"id": "B", "text": "Stealing food from a friend's plate"},
            {"id": "C", "text": "Asking for a percentage of someone's allowance"},
            {"id": "D", "text": "Buying a friend's house"},
        ],
        "correct_answer": "B",
        "source": "https://knowyourmeme.com/memes/fanum-tax",
        "tags": ["slang", "creators"],
        "active": True,
    },
    {
        "id": "q211",
        "category": "gen_alpha_slang",
        "difficulty": "medium",
        "question": "'Mewing' refers to which practice that went viral on TikTok?",
        "options": [
            {"id": "A", "text": "Imitating cat noises in public"},
            {"id": "B", "text": "Pressing the tongue against the roof of the mouth to supposedly reshape the jawline"},
            {"id": "C", "text": "A breathing technique for free divers"},
            {"id": "D", "text": "A facial recognition workaround for old iPhones"},
        ],
        "correct_answer": "B",
        "source": "https://knowyourmeme.com/memes/mewing",
        "tags": ["slang", "wellness"],
        "active": True,
    },
    {
        "id": "q212",
        "category": "gen_alpha_slang",
        "difficulty": "easy",
        "question": "What does 'Ohio' mean in current Gen Alpha slang?",
        "options": [
            {"id": "A", "text": "Cool / aspirational"},
            {"id": "B", "text": "A mid-western US state"},
            {"id": "C", "text": "Something cursed, weird, or bizarre"},
            {"id": "D", "text": "A type of dance move"},
        ],
        "correct_answer": "C",
        "source": "https://knowyourmeme.com/memes/only-in-ohio",
        "tags": ["slang"],
        "active": True,
    },
    {
        "id": "q213",
        "category": "gen_alpha_slang",
        "difficulty": "medium",
        "question": "Which dictionary named 'rizz' as Word of the Year in 2023?",
        "options": [
            {"id": "A", "text": "Cambridge"},
            {"id": "B", "text": "Oxford"},
            {"id": "C", "text": "Merriam-Webster"},
            {"id": "D", "text": "Collins"},
        ],
        "correct_answer": "B",
        "source": "https://languages.oup.com/word-of-the-year/2023/",
        "tags": ["slang", "lore"],
        "active": True,
    },
    {
        "id": "q214",
        "category": "gen_alpha_slang",
        "difficulty": "hard",
        "question": "'Skibidi rizz' is most commonly used to describe…",
        "options": [
            {"id": "A", "text": "Chaotic or absurdist flirting energy"},
            {"id": "B", "text": "A toilet-themed pickup line"},
            {"id": "C", "text": "The original Skibidi Toilet's seduction technique"},
            {"id": "D", "text": "A protein supplement"},
        ],
        "correct_answer": "A",
        "source": "https://www.classpop.com/magazine/gen-alpha-slang",
        "tags": ["slang", "compound"],
        "active": True,
    },
    # ── Skibidi Toilet lore ─────────────────────────────────────────────
    {
        "id": "q215",
        "category": "skibidi",
        "difficulty": "easy",
        "question": "Who created the Skibidi Toilet series?",
        "options": [
            {"id": "A", "text": "Alexey Gerasimov (DaFuq!?Boom!)"},
            {"id": "B", "text": "MrBeast"},
            {"id": "C", "text": "Valve Corporation"},
            {"id": "D", "text": "A team at Pixar"},
        ],
        "correct_answer": "A",
        "source": "https://en.wikipedia.org/wiki/Skibidi_Toilet",
        "tags": ["origin", "creators"],
        "active": True,
    },
    {
        "id": "q216",
        "category": "skibidi",
        "difficulty": "medium",
        "question": "In Skibidi Toilet, the alliance fighting the toilets is known by which name?",
        "options": [
            {"id": "A", "text": "The Plumbers"},
            {"id": "B", "text": "The Cameramen / TV-Men / Speaker-Men"},
            {"id": "C", "text": "The Bathroom Brigade"},
            {"id": "D", "text": "The Pipe Squad"},
        ],
        "correct_answer": "B",
        "source": "https://en.wikipedia.org/wiki/Skibidi_Toilet",
        "tags": ["lore"],
        "active": True,
    },
    {
        "id": "q217",
        "category": "skibidi",
        "difficulty": "hard",
        "question": "Skibidi Toilet was primarily produced using which 3D software?",
        "options": [
            {"id": "A", "text": "Blender + Source Filmmaker"},
            {"id": "B", "text": "Maya + Houdini"},
            {"id": "C", "text": "Cinema 4D only"},
            {"id": "D", "text": "Unreal Engine 5"},
        ],
        "correct_answer": "A",
        "source": "https://en.wikipedia.org/wiki/Skibidi_Toilet",
        "tags": ["production", "lore"],
        "active": True,
    },
    # ── Viral moments 2024–2026 ─────────────────────────────────────────
    {
        "id": "q218",
        "category": "viral_moments",
        "difficulty": "easy",
        "question": "Moo Deng, the viral 2024 baby pygmy hippo, lives at which zoo?",
        "options": [
            {"id": "A", "text": "San Diego Zoo, USA"},
            {"id": "B", "text": "Khao Kheow Open Zoo, Thailand"},
            {"id": "C", "text": "Tokyo Zoological Park"},
            {"id": "D", "text": "Berlin Tierpark"},
        ],
        "correct_answer": "B",
        "source": "https://en.wikipedia.org/wiki/Moo_Deng",
        "tags": ["animal"],
        "active": True,
    },
    {
        "id": "q219",
        "category": "viral_moments",
        "difficulty": "medium",
        "question": "Hailey Welch became internet-famous in 2024 for what phrase, in a street interview?",
        "options": [
            {"id": "A", "text": "Hawk Tuah"},
            {"id": "B", "text": "Bing chilling"},
            {"id": "C", "text": "What the sigma"},
            {"id": "D", "text": "Mid energy"},
        ],
        "correct_answer": "A",
        "source": "https://en.wikipedia.org/wiki/Hailey_Welch",
        "tags": ["interview", "phrase"],
        "active": True,
    },
    {
        "id": "q220",
        "category": "viral_moments",
        "difficulty": "medium",
        "question": "The 'Costco Guys' viral duo rate items using which two words?",
        "options": [
            {"id": "A", "text": "Hit or miss"},
            {"id": "B", "text": "Boom or doom"},
            {"id": "C", "text": "Slay or no"},
            {"id": "D", "text": "Mid or sigma"},
        ],
        "correct_answer": "B",
        "source": "https://knowyourmeme.com/memes/people/costco-guys",
        "tags": ["catchphrase"],
        "active": True,
    },
    {
        "id": "q221",
        "category": "viral_moments",
        "difficulty": "medium",
        "question": "What is the 'Pedro Pedro Pedro' raccoon meme set to?",
        "options": [
            {"id": "A", "text": "An original TikTok-made jingle"},
            {"id": "B", "text": "A song by Raffaella Carrà"},
            {"id": "C", "text": "A clip from a Latin American telenovela"},
            {"id": "D", "text": "A Skibidi Toilet remix"},
        ],
        "correct_answer": "B",
        "source": "https://knowyourmeme.com/memes/pedro-the-raccoon-pedro-pedro-pedro",
        "tags": ["song"],
        "active": True,
    },
    # ── Creators ────────────────────────────────────────────────────────
    {
        "id": "q222",
        "category": "creators",
        "difficulty": "medium",
        "question": "MrBeast's real name is…",
        "options": [
            {"id": "A", "text": "Jimmy Donaldson"},
            {"id": "B", "text": "Tyler Blevins"},
            {"id": "C", "text": "Darren Watkins Jr."},
            {"id": "D", "text": "Steve Jobs"},
        ],
        "correct_answer": "A",
        "source": "https://en.wikipedia.org/wiki/MrBeast",
        "tags": ["creator"],
        "active": True,
    },
    {
        "id": "q223",
        "category": "creators",
        "difficulty": "medium",
        "question": "IShowSpeed's real name is…",
        "options": [
            {"id": "A", "text": "Darren Watkins Jr."},
            {"id": "B", "text": "Jimmy Donaldson"},
            {"id": "C", "text": "Drew Desbordes"},
            {"id": "D", "text": "Kai Carlo Cenat III"},
        ],
        "correct_answer": "A",
        "source": "https://en.wikipedia.org/wiki/IShowSpeed",
        "tags": ["creator"],
        "active": True,
    },
    {
        "id": "q224",
        "category": "creators",
        "difficulty": "hard",
        "question": "Kai Cenat's content collective AMP stands for…",
        "options": [
            {"id": "A", "text": "Any Means Possible"},
            {"id": "B", "text": "Always More People"},
            {"id": "C", "text": "America's Most Popular"},
            {"id": "D", "text": "Audio Mixing Pros"},
        ],
        "correct_answer": "A",
        "source": "https://en.wikipedia.org/wiki/Kai_Cenat",
        "tags": ["creator", "collective"],
        "active": True,
    },
    # ── Cross-platform / deep cuts ──────────────────────────────────────
    {
        "id": "q225",
        "category": "cross_platform",
        "difficulty": "hard",
        "question": "'Brain rot' as a term was named Oxford Word of the Year in 2024 — what does Oxford trace its earliest English use to?",
        "options": [
            {"id": "A", "text": "Henry David Thoreau's 'Walden' (1854)"},
            {"id": "B", "text": "A 1990s anti-TV pamphlet"},
            {"id": "C", "text": "Early-2000s LiveJournal posts"},
            {"id": "D", "text": "A 2010 Cracked.com article"},
        ],
        "correct_answer": "A",
        "source": "https://corp.oup.com/news/brain-rot-named-oxford-word-of-the-year-2024/",
        "tags": ["etymology", "lore"],
        "active": True,
    },
]


def main() -> None:
    with QUESTIONS_PATH.open("r", encoding="utf-8") as f:
        data = json.load(f)
    existing_ids = {q["id"] for q in data}
    added = []
    for q in NEW:
        if q["id"] in existing_ids:
            continue
        data.append(q)
        added.append(q["id"])
    with QUESTIONS_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"added {len(added)} questions: {added}")
    print(f"total now: {len(data)}")


if __name__ == "__main__":
    main()
