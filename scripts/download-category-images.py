"""Download public-domain / CC-licensed thumbnails for each question category.

Uses the MediaWiki Commons API to find the top image for a search query, then
downloads a 640px thumbnail to assets/categories/<category>.jpg. We deliberately
stick to Wikimedia Commons because every file there ships with a clear license
(usually CC-BY-SA, CC-BY, or PD). The CC images are credited in
data/category-images-credits.json.

DESIGN_NOTES.md is explicit about copyright: don't lift TikTok screenshots or
character art with murky rights. These generic photos (cappuccino, toilet,
smartphone, etc.) cover the *theme* of each category without touching the
actual Italian brainrot character art, which lives in unclear gray-area
territory.
"""
from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "categories"
CREDITS_PATH = ROOT / "data" / "category-images-credits.json"

USER_AGENT = "DoYouEvenBrainrot/0.1 (https://github.com/leo020202-svg/do-you-even-brainrot; dev)"

# Category → search query on Commons. Tuned to land on cheerful generic photos.
CATEGORY_QUERIES: dict[str, str] = {
    "italian_brainrot": "Cappuccino latte art",
    "skibidi": "Toilet bowl porcelain",
    "gen_alpha_slang": "Smartphone notification icons",
    # face-free alternatives — avoid identifiable people per safety rules.
    "viral_moments": "Smartphone camera macro photography",
    "creators": "Streaming microphone setup",
    "cross_platform": "Smartphone tablet laptop devices",
    "deep_cuts": "VHS cassette tape collection",
    "absurdity": "Rubber duck colorful",
}


def commons_search_image(query: str, width: int = 640) -> dict | None:
    """Return {title,url,descurl,user,license} for the top image result, or None."""
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrnamespace": "6",  # File: namespace
        "gsrsearch": f"filetype:bitmap {query}",
        "gsrlimit": "1",
        "prop": "imageinfo",
        "iiprop": "url|user|extmetadata",
        "iiurlwidth": str(width),
    }
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.load(r)
    pages = data.get("query", {}).get("pages", {})
    if not pages:
        return None
    page = next(iter(pages.values()))
    info_list = page.get("imageinfo") or []
    if not info_list:
        return None
    info = info_list[0]
    ext = info.get("extmetadata", {}) or {}
    return {
        "title": page.get("title", ""),
        "url": info.get("thumburl") or info.get("url"),
        "descurl": info.get("descriptionurl"),
        "user": info.get("user"),
        "license": (ext.get("LicenseShortName") or {}).get("value"),
        "credit": (ext.get("Credit") or {}).get("value"),
        "artist": (ext.get("Artist") or {}).get("value"),
    }


def download(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    dest.write_bytes(data)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    credits: dict[str, dict] = {}
    for category, query in CATEGORY_QUERIES.items():
        try:
            print(f"[{category}] searching: {query!r}")
            hit = commons_search_image(query)
            if not hit or not hit.get("url"):
                print(f"  no result")
                continue
            dest = OUT_DIR / f"{category}.jpg"
            print(f"  downloading {hit['url']}")
            download(hit["url"], dest)
            credits[category] = {
                "title": hit["title"],
                "descurl": hit["descurl"],
                "user": hit.get("user"),
                "license": hit.get("license"),
                "credit_html": hit.get("credit"),
                "artist_html": hit.get("artist"),
                "source": "Wikimedia Commons",
            }
            print(f"  saved {dest.relative_to(ROOT)}  ({dest.stat().st_size} bytes)")
            time.sleep(0.5)  # be polite to the API
        except Exception as e:  # noqa: BLE001 — exploratory script
            print(f"  ERROR: {e}")

    CREDITS_PATH.parent.mkdir(parents=True, exist_ok=True)
    CREDITS_PATH.write_text(json.dumps(credits, indent=2), encoding="utf-8")
    print(f"\nwrote credits to {CREDITS_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
