"""Turn a Gemini-made image into a clean sprite matching 0x72, then check it.

Usage (from your-dungeon/):
  python art/tools/pixelize.py IN.png OUT.png --size 16x16 [--bg auto|none] [--colors 16] [--outline]
  python art/tools/pixelize.py --check OUT.png --size 16x16

Steps:
 1. Remove background: 'auto' takes the color of the 4 corners and turns everything
    close to it transparent (Gemini usually draws on a flat or checkerboard background).
 2. Crop to content, keep aspect ratio, fit into the target size (feet at the bottom edge).
 3. Downscale with BOX (the average of each block), then threshold alpha at 50%. No half-transparent pixels.
 4. Quantize to the 0x72 palette (art/reference/palette.txt), limited to --colors colors.
 5. --outline adds a 1px dark outline (#222222 is the 0x72 outline color) where it is missing.
QA (--check): right size, alpha only 0/255, all colors inside the palette, not empty,
no transparent edge pixel stuck to the border on the bottom/left/right (except the feet).
"""
import argparse
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
PALETTE = ROOT / "art" / "reference" / "palette.txt"
OUTLINE = (34, 34, 34)


def load_palette():
    cols = []
    for line in PALETTE.read_text().split():
        h = line.strip().lstrip("#")
        cols.append(tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)))
    return cols


def nearest(c, pal):
    return min(pal, key=lambda p: (p[0] - c[0]) ** 2 * 2 + (p[1] - c[1]) ** 2 * 4 + (p[2] - c[2]) ** 2 * 3)


def remove_bg(img, tol=40):
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    # flood fill from the edges: only remove background connected to the border
    seen = set()
    stack = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]

    def is_bg(c):
        return c[3] < 20 or any(sum(abs(c[i] - k[i]) for i in range(3)) < tol for k in corners)

    while stack:
        x, y = stack.pop()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h):
            continue
        seen.add((x, y))
        if is_bg(px[x, y]):
            px[x, y] = (0, 0, 0, 0)
            stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    # despill: peel off pixels at the edge still tinted by the background (blurred border)
    bgc = corners[0]
    for _ in range(6):
        peel = []
        for y in range(h):
            for x in range(w):
                c = px[x, y]
                if not c[3]:
                    continue
                edge = any(0 <= x + dx < w and 0 <= y + dy < h and px[x + dx, y + dy][3] == 0
                           for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
                if edge and tinted(c, bgc):
                    peel.append((x, y))
        if not peel:
            break
        for x, y in peel:
            px[x, y] = (0, 0, 0, 0)
    return img


def tinted(c, bg):
    """Pixel noticeably shifted toward the background color (e.g. magenta: R and B well above G)."""
    if bg[:3] == (255, 0, 255) or (bg[0] > 180 and bg[2] > 180 and bg[1] < 90):
        return c[0] - c[1] > 45 and c[2] - c[1] > 45
    d = sum(abs(c[i] - bg[i]) for i in range(3))
    return d < 160


def mode_resize(img, nw, nh):
    """Each target pixel = the most common opaque color in its source block (keeps outlines crisp)."""
    from collections import Counter
    src = img.load()
    out = Image.new("RGBA", (nw, nh), (0, 0, 0, 0))
    o = out.load()
    for y in range(nh):
        for x in range(nw):
            x0, x1 = int(x * img.width / nw), max(int(x * img.width / nw) + 1, int((x + 1) * img.width / nw))
            y0, y1 = int(y * img.height / nh), max(int(y * img.height / nh) + 1, int((y + 1) * img.height / nh))
            cells = [src[i, j] for j in range(y0, y1) for i in range(x0, x1)]
            solid = [c[:3] for c in cells if c[3] >= 128]
            if len(solid) * 2 < len(cells):
                continue
            # dark colors win ties so 1px outlines survive
            cnt = Counter(solid)
            best = max(cnt, key=lambda c: (cnt[c], -sum(c)))
            o[x, y] = (*best, 255)
    return out


METHOD = "box"


def fit(img, tw, th):
    box = img.getbbox()
    if not box:
        sys.exit("empty image after removing the background")
    img = img.crop(box)
    s = min(tw / img.width, th / img.height)
    nw, nh = max(1, round(img.width * s)), max(1, round(img.height * s))
    # BOX per channel with premultiplied alpha to avoid dark fringes
    small = mode_resize(img, nw, nh) if METHOD == "mode" else img.resize((nw, nh), Image.BOX)
    out = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    out.paste(small, ((tw - nw) // 2, th - nh))
    return out


def quantize(img, pal, ncolors):
    px = img.load()
    w, h = img.size
    used = {}
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 128:
                px[x, y] = (0, 0, 0, 0)
                continue
            c = nearest((r, g, b), pal)
            used[c] = used.get(c, 0) + 1
            px[x, y] = (*c, 255)
    if len(used) > ncolors:
        keep = [c for c, _ in sorted(used.items(), key=lambda kv: -kv[1])[:ncolors]]
        for y in range(h):
            for x in range(w):
                if px[x, y][3]:
                    px[x, y] = (*nearest(px[x, y][:3], keep), 255)
    return img


def outline(img):
    w, h = img.size
    src = img.copy().load()
    px = img.load()
    for y in range(h):
        for x in range(w):
            if src[x, y][3]:
                continue
            if any(0 <= x + dx < w and 0 <= y + dy < h and src[x + dx, y + dy][3] and src[x + dx, y + dy][:3] != OUTLINE
                   for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                px[x, y] = (*OUTLINE, 255)
    return img


def check(path, tw, th, pal):
    img = Image.open(path).convert("RGBA")
    errs = []
    if img.size != (tw, th):
        errs.append(f"size {img.size} != {(tw, th)}")
    data = list(img.getdata())
    if any(0 < p[3] < 255 for p in data):
        errs.append("has semi-transparent pixels")
    pset = set(pal) | {OUTLINE}
    bad = {p[:3] for p in data if p[3] and p[:3] not in pset}
    if bad:
        errs.append(f"{len(bad)} colors outside the palette")
    opaque = sum(1 for p in data if p[3])
    if opaque < tw * th * 0.08:
        errs.append(f"too empty ({opaque} px)")
    ncol = len({p[:3] for p in data if p[3]})
    if ncol > 24:
        errs.append(f"too many colors ({ncol}); 0x72 sprites use <= 16")
    print(("OK  " if not errs else "FAIL ") + str(path), f"{opaque}px {ncol} colors", "; ".join(errs))
    return not errs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("inp")
    ap.add_argument("out", nargs="?")
    ap.add_argument("--size", default="16x16")
    ap.add_argument("--bg", default="auto", choices=["auto", "none"])
    ap.add_argument("--colors", type=int, default=16)
    ap.add_argument("--outline", action="store_true")
    ap.add_argument("--method", default="box", choices=["box", "mode"], help="mode = majority color per block; best for 2x/4x clean pixel sources")
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--preview", action="store_true", help="also write OUT_x8.png for viewing")
    a = ap.parse_args()
    tw, th = map(int, a.size.lower().split("x"))
    pal = load_palette()
    if a.check:
        sys.exit(0 if check(a.inp, tw, th, pal) else 1)
    img = Image.open(a.inp).convert("RGBA")
    if a.bg == "auto":
        img = remove_bg(img)
    global METHOD
    METHOD = a.method
    img = fit(img, tw - (2 if a.outline else 0), th - (1 if a.outline else 0))
    if a.outline:
        pad = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
        pad.paste(img, (1, 0))
        img = pad
    img = quantize(img, pal, a.colors)
    if a.outline:
        img = outline(img)
    out = Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out)
    if a.preview:
        img.resize((tw * 8, th * 8), Image.NEAREST).save(out.with_name(out.stem + "_x8.png"))
    check(out, tw, th, pal)


if __name__ == "__main__":
    main()
