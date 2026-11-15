"""Shrink Gemini art (its pixel grid is ~2x 0x72) to 0x72 scale while keeping shape and color.

Rule for each 2x2 block:
  - fewer than 1 opaque pixel -> transparent
  - has a fill color (not the dark outline) -> take the most common fill color; ties go to the darker shade (keeps shading)
  - only dark outline -> leave transparent; the outline is redrawn afterward
Then crop to content and add a fresh 1 px #222222 outline outside (like 0x72).
Usage: python art/tools/reduce2x.py in.png out.png [--keep-dark]
  --keep-dark: keep blocks that are all dark (for black objects like a bomb or a hole)
"""
import sys
from collections import Counter
from pathlib import Path
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
import pixelize  # noqa: E402

DARK = 110  # r+g+b below this counts as outline


def reduce(img, keep_dark=False):
    w, h = img.size
    src = img.load()
    out = Image.new("RGBA", (w // 2, h // 2), (0, 0, 0, 0))
    o = out.load()
    for y in range(h // 2):
        for x in range(w // 2):
            cells = [src[2 * x + i, 2 * y + j] for j in (0, 1) for i in (0, 1)]
            solid = [c[:3] for c in cells if c[3] >= 128]
            if not solid:
                continue
            fill = [c for c in solid if sum(c) >= DARK]
            if fill:
                cnt = Counter(fill)
                o[x, y] = (*max(cnt, key=lambda c: (cnt[c], -sum(c))), 255)
            elif keep_dark and len(solid) >= 2:
                o[x, y] = (*solid[0], 255)
    bb = out.getbbox()
    out = out.crop(bb)
    pad = Image.new("RGBA", (out.width + 2, out.height + 2), (0, 0, 0, 0))
    pad.alpha_composite(out, (1, 1))
    return pixelize.outline(pad)


if __name__ == "__main__":
    im = Image.open(sys.argv[1]).convert("RGBA")
    res = reduce(im, "--keep-dark" in sys.argv)
    res.save(sys.argv[2])
    print(sys.argv[2], res.size)
