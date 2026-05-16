"""Generate brand assets: favicon SVG + PWA icons + default OG image.

Outputs into public/:
  favicon.svg
  icons/icon-192.png
  icons/icon-512.png
  icons/icon-512-maskable.png         (extra padding for OS-cropped masks)
  icons/apple-touch-icon.png          (180x180 — Safari adds-to-home-screen)
  og/default.png                      (1200x630 — share unfurl preview)

All assets share the palette from docs/DESIGN_NOTES.md:
  bg #0F0A1E (ink), accent #A8FF3E (lime), secondary #FF3EA5 (hot)

Re-run anytime: `python scripts/generate-brand-assets.py`.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
ICONS = PUBLIC / "icons"
OG = PUBLIC / "og"

INK = (15, 10, 30, 255)        # #0F0A1E
LIME = (168, 255, 62, 255)     # #A8FF3E
HOT = (255, 62, 165, 255)      # #FF3EA5
CYAN = (62, 255, 233, 255)     # #3EFFE9
PAPER = (245, 242, 255, 255)   # #F5F2FF

ICONS.mkdir(parents=True, exist_ok=True)
OG.mkdir(parents=True, exist_ok=True)


def find_font(candidates: list[str], size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    """Try a list of font files; fall back to default if none load."""
    for name in candidates:
        try:
            return ImageFont.truetype(name, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def write_favicon_svg() -> None:
    """SVG favicon — modern browsers use this preferentially over PNG."""
    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0F0A1E"/>
  <rect x="6" y="6" width="52" height="52" rx="10" fill="#A8FF3E"/>
  <text x="32" y="44" text-anchor="middle"
        font-family="ui-monospace, monospace"
        font-weight="900"
        font-size="36"
        fill="#0F0A1E">B</text>
</svg>
"""
    (PUBLIC / "favicon.svg").write_text(svg, encoding="utf-8")


def draw_logo_square(size: int, *, padded: bool = False, bold_font_size_ratio: float = 0.62) -> Image.Image:
    """Render the lime-B-on-ink logo at the given size. `padded` adds 14% safe
    margin (for maskable / adaptive-icon variants where the OS may crop)."""
    img = Image.new("RGBA", (size, size), INK)
    draw = ImageDraw.Draw(img)

    inset = int(size * 0.14) if padded else int(size * 0.08)
    inner = (inset, inset, size - inset, size - inset)
    radius = int(size * (0.22 if padded else 0.18))
    draw.rounded_rectangle(inner, radius=radius, fill=LIME)

    # Glyph
    font = find_font(
        [
            "arialbd.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
            "C:/Windows/Fonts/seguibl.ttf",
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        ],
        int(size * bold_font_size_ratio),
    )
    text = "B"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    # Optical centring: textbbox includes leading whitespace; compensate.
    tx = (size - tw) // 2 - bbox[0]
    ty = (size - th) // 2 - bbox[1]
    draw.text((tx, ty), text, fill=INK, font=font)

    return img


def write_icon(size: int, name: str, *, padded: bool = False) -> None:
    img = draw_logo_square(size, padded=padded)
    out = ICONS / name
    img.save(out, "PNG", optimize=True)
    print(f"  wrote {out.relative_to(ROOT)} ({size}x{size})")


def write_og_image() -> None:
    """1200x630 share preview — chunky stacked wordmark + tagline + URL."""
    w, h = 1200, 630
    img = Image.new("RGB", (w, h), (15, 10, 30))
    draw = ImageDraw.Draw(img)

    # Decorative soft glow blobs in the corners.
    blob = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(blob)
    bdraw.ellipse((-200, -200, 500, 500), fill=(*HOT[:3], 70))
    bdraw.ellipse((w - 500, h - 500, w + 200, h + 200), fill=(*CYAN[:3], 60))
    blob = blob.filter(ImageFilter.GaussianBlur(80))
    img.paste(Image.alpha_composite(Image.new("RGBA", (w, h), (15, 10, 30, 255)), blob).convert("RGB"))

    title_font = find_font(
        [
            "arialbd.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
            "C:/Windows/Fonts/seguibl.ttf",
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        ],
        150,
    )
    sub_font = find_font(
        [
            "arial.ttf",
            "C:/Windows/Fonts/arial.ttf",
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        ],
        42,
    )
    foot_font = find_font(
        [
            "consola.ttf",
            "C:/Windows/Fonts/consola.ttf",
            "/System/Library/Fonts/Menlo.ttc",
            "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        ],
        32,
    )

    # Stacked wordmark — DO YOU / EVEN / BRAINROT?
    lines = [("DO YOU", LIME), ("EVEN", CYAN), ("BRAINROT?", HOT)]
    y = 90
    for text, color in lines:
        bbox = draw.textbbox((0, 0), text, font=title_font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        # Slight tilt per line by drawing on a transparent layer then pasting rotated.
        layer = Image.new("RGBA", (tw + 60, th + 60), (0, 0, 0, 0))
        ldraw = ImageDraw.Draw(layer)
        # Shadow
        ldraw.text((36, 22), text, fill=INK, font=title_font)
        # Fill
        ldraw.text((30, 16), text, fill=color, font=title_font)
        # No rotation here — keeps the bake stable on every platform.
        img.paste(layer, (90, y), layer)
        y += th + 12

    # Tagline
    tagline = "the daily brainrot trivia game · how cooked are you?"
    draw.text((90, h - 130), tagline, fill=PAPER, font=sub_font)
    # Footer URL
    draw.text((90, h - 68), "playbrainrot.app", fill=LIME, font=foot_font)

    out = OG / "default.png"
    img.save(out, "PNG", optimize=True)
    print(f"  wrote {out.relative_to(ROOT)} ({w}x{h})")


def main() -> None:
    print("Generating brand assets...")
    write_favicon_svg()
    print(f"  wrote {(PUBLIC / 'favicon.svg').relative_to(ROOT)}")
    write_icon(192, "icon-192.png")
    write_icon(512, "icon-512.png")
    write_icon(512, "icon-512-maskable.png", padded=True)
    write_icon(180, "apple-touch-icon.png")
    write_og_image()
    print("Done.")


if __name__ == "__main__":
    main()
