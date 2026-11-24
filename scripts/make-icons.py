"""Generate the PWA icons from the app's tile shapes.

Optional: only needed when the icon design changes.
    python -m pip install pillow
    python scripts/make-icons.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ICONS = ROOT / "public" / "icons"

INK = (16, 36, 60)
DEEP = (29, 63, 107)
CREAM = (255, 243, 221)
SKY = (174, 217, 230)
AMBER = (229, 161, 59)
GREEN = (77, 169, 106)

# 0–100 coordinates, matching src/lib/tiles.ts
SHAPES = {
    "shard": [(57, 7), (90, 25), (46, 93), (12, 42)],
    "square": [
        (24, 18), (76, 18), (82, 24), (82, 76),
        (76, 82), (24, 82), (18, 76), (18, 24),
    ],
    "pentagon": [(50, 12), (85, 38), (72, 82), (28, 82), (15, 38)],
    "triangle": [(14, 24), (86, 24), (50, 90)],
}


def tile_layer(shape: str, colour: tuple[int, int, int], size: int, pad: int) -> Image.Image:
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    scale = (size - pad * 2) / 100
    points = [
        (pad + x * scale, pad + y * scale) for x, y in SHAPES[shape]
    ]
    draw.polygon(points, fill=colour + (255,))
    draw.line(points + [points[0]], fill=INK + (255,), width=max(4, size // 42), joint="curve")
    return layer


def draw_icon(canvas: int, motif: float) -> Image.Image:
    image = Image.new("RGBA", (canvas, canvas), DEEP + (255,))
    draw = ImageDraw.Draw(image)

    # A quiet plaster glow behind the shards.
    glow = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    radius = int(canvas * 0.36)
    glow_draw.ellipse(
        (canvas // 2 - radius, canvas // 2 - radius, canvas // 2 + radius, canvas // 2 + radius),
        fill=(255, 246, 228, 22),
    )
    image = Image.alpha_composite(image, glow)
    draw = ImageDraw.Draw(image)

    unit = canvas * motif / 2
    start = (canvas - unit * 2) / 2
    placements = [
        ("shard", SKY, start, start),
        ("square", AMBER, start + unit, start),
        ("triangle", GREEN, start, start + unit),
        ("pentagon", CREAM, start + unit, start + unit),
    ]

    for shape, colour, x, y in placements:
        cell = int(unit)
        pad = max(6, int(cell * 0.07))
        layer = tile_layer(shape, colour, cell, pad)

        shadow = Image.new("RGBA", (cell, cell), (0, 0, 0, 0))
        shadow.paste(layer, (0, 0), layer)
        alpha = shadow.split()[3].point(lambda value: int(value * 0.45))
        shadow.putalpha(alpha)
        shadow = shadow.filter(ImageFilter.GaussianBlur(max(2, cell // 40)))
        image.alpha_composite(shadow, (int(x), int(y) + max(2, cell // 50)))

        image.alpha_composite(layer, (int(x), int(y)))

    return image.convert("RGB")


def save(image: Image.Image, size: int, name: str) -> None:
    resized = image.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(ICONS / name, format="PNG", optimize=True)


def main() -> None:
    ICONS.mkdir(parents=True, exist_ok=True)

    standard = draw_icon(1024, motif=0.62)
    save(standard, 512, "icon-512.png")
    save(standard, 192, "icon-192.png")
    save(standard, 180, "apple-touch-icon.png")

    maskable = draw_icon(1024, motif=0.50)
    save(maskable, 512, "maskable-512.png")

    print("Wrote icons to", ICONS)


if __name__ == "__main__":
    main()
