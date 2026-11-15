"""New characters kitbashed from original 0x72 bodies: recolor + accessories, applied to all 8 idle/run
frames (and hit if present), so they keep the original 0x72 animation.
Run: python art/tools/kitbash_chars.py  -> art/final/chars/<id>_{idle,run}_anim_f0..3.png + _review_chars.png
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "dist" / "assets" / "frames"
OUT = ROOT / "art" / "final" / "chars"


def h(x):
    x = x.lstrip("#")
    return tuple(int(x[i:i + 2], 16) for i in (0, 2, 4))


CHARS = {
    # id: (base, {old: new}, accessory)
    "paladin": ("knight_m", {"#72d6ce": "#facb3e", "#417089": "#c56025", "#da4e38": "#5698cc", "#ee8e2e": "#cae6f5"}, None),
    "dark_knight": ("knight_f", {"#72d6ce": "#5956bd", "#417089": "#5f2d56", "#dc4a7b": "#9b1a0a", "#f78697": "#da4e38",
                                 "#fdf7ed": "#da4e38"}, None),
    "frost_mage": ("wizzard_m", {"#5698cc": "#72d6ce", "#5956bd": "#3c9f9c"}, None),
    "pyromancer": ("wizzard_f", {"#5698cc": "#ee8e2e", "#5956bd": "#da4e38", "#fdf7ed": "#ffcc68"}, None),
    "assassin": ("elf_m", {"#4ba747": "#545454", "#3d734f": "#3f3f3f", "#facb3e": "#fdf7ed", "#ee8e2e": "#b6cbcf",
                           "#5698cc": "#da4e38"}, None),
    "goblin_king": ("goblin", {"#3d734f": "#5c7a56"}, "crown"),
    "skeleton_king": ("skelet", {"#d3bfa9": "#aa8d7a"}, "crown"),
    "berserker": ("dwarf_m", {"#da4e38": "#ee8e2e", "#e46e33": "#c56025", "#7b8994": "#fdf7ed"}, "horns"),
    # v0.5 adventurer classes
    "ninja": ("elf_m", {"#4ba747": "#414859", "#3d734f": "#323e4f", "#facb3e": "#3f3f3f", "#ee8e2e": "#2b2929",
                        "#5698cc": "#da4e38", "#fccba3": "#fccba3"}, "headband"),
    "priestess": ("wizzard_f", {"#5698cc": "#fdf7ed", "#5956bd": "#facb3e", "#fdf7ed": "#ffcc68",
                                "#8a503e": "#c38d70"}, None),
    "nun": ("elf_f", {"#facb3e": "#3f3f3f", "#ee8e2e": "#2b2929", "#4ba747": "#414859", "#3d734f": "#323e4f",
                      "#da4e38": "#fdf7ed"}, "veil"),
    "arcane_archer": ("elf_f", {"#4ba747": "#5956bd", "#3d734f": "#5f2d56", "#facb3e": "#72d6ce", "#ee8e2e": "#3c9f9c",
                                "#da4e38": "#cae6f5"}, None),
    "crossbowman": ("elf_m", {"#4ba747": "#8a503e", "#3d734f": "#775c55", "#facb3e": "#8f4029", "#ee8e2e": "#62232f"},
                    "helm"),
    "knight_errant": ("knight_m", {"#72d6ce": "#b6cbcf", "#417089": "#7b8994", "#da4e38": "#da4e38",
                                   "#ee8e2e": "#9b1a0a"}, None),
}

ACC = {
    # drawn above the head; k = outline, y/Y = gold, w = bone
    "crown": ["k.k.k.k", "kykykyk", "kyyyyyk", "kYrYrYk", "kkkkkkk"],
    "horns": ["k.....k", "wk...kw", "wwk.kww"],
    "halo": [".kkkkk.", "kyyyyyk", "ky...yk", ".kkkkk."],
    "helm": ["..kkkk..", ".k3333k.", "k322223k", "kkkkkkkk"],
    "headband": ["krrrrrrk", "kkkkkkrk", "......kr"],
    "veil": [".kkkkk.", "kwwwwwk"],
}
OVERLAP = {"crown": 1, "horns": 2, "halo": 0, "helm": 3, "headband": 4, "veil": 2}
ACOL = {"k": "#222222", "y": "#facb3e", "Y": "#ee8e2e", "r": "#da4e38", "w": "#fdf7ed", "3": "#b6cbcf", "2": "#7b8994"}


def accessory(img, name):
    rows = ACC[name]
    bb = img.getbbox()
    if not bb:
        return img
    top = bb[1]
    px = img.load()
    xs = [x for x in range(img.width) if px[x, top][3]]
    cx = (min(xs) + max(xs)) // 2
    aw, ah = len(rows[0]), len(rows)
    ox, oy = cx - aw // 2, top - ah + OVERLAP[name]
    need = max(0, -oy)
    if need:  # grow the canvas upward if the accessory does not fit
        big = Image.new("RGBA", (img.width, img.height + need), (0, 0, 0, 0))
        big.alpha_composite(img, (0, need))
        img, oy = big, oy + need
        px = img.load()
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch != "." and 0 <= ox + x < img.width:
                px[ox + x, oy + y] = (*h(ACOL[ch]), 255)
    return img


def recolor(img, mapping):
    m = {h(k): h(v) for k, v in mapping.items()}
    img = img.copy()
    img.putdata([(*m.get(p[:3], p[:3]), p[3]) if p[3] else p for p in img.getdata()])
    return img


def frames(base):
    out = []
    for kind in ("idle", "run"):
        for i in range(4):
            out.append((f"{kind}_anim_f{i}", Image.open(SRC / f"{base}_{kind}_anim_f{i}.png").convert("RGBA")))
    hit = SRC / f"{base}_hit_anim_f0.png"
    if hit.exists():
        out.append(("hit_anim_f0", Image.open(hit).convert("RGBA")))
    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    S = 5
    rows = []
    for cid, (base, mapping, acc) in CHARS.items():
        made = []
        fr = frames(base)
        # one shared extra height for all frames of this character (so the feet stay aligned)
        tmp = [accessory(recolor(im, mapping), acc) if acc else recolor(im, mapping) for _, im in fr]
        H = max(t.height for t in tmp)
        for (suffix, _), t in zip(fr, tmp):
            if t.height < H:
                pad = Image.new("RGBA", (t.width, H), (0, 0, 0, 0))
                pad.alpha_composite(t, (0, H - t.height))
                t = pad
            t.save(OUT / f"{cid}_{suffix}.png")
            made.append(t)
        rows.append((cid, base, made))
    W = max(len(m) for _, _, m in rows) * 20 * S + 20 * S
    Ht = sum((m[0].height + 3) * S for _, _, m in rows)
    sheet = Image.new("RGBA", (W, Ht), (64, 58, 66, 255))
    y = 0
    for cid, base, made in rows:
        orig = Image.open(SRC / f"{base}_idle_anim_f0.png").convert("RGBA")
        sheet.alpha_composite(orig.resize((orig.width * S, orig.height * S), Image.NEAREST),
                              (0, y + (made[0].height - orig.height) * S))
        for i, f in enumerate(made):
            sheet.alpha_composite(f.resize((f.width * S, f.height * S), Image.NEAREST), ((i + 1) * 20 * S, y))
        y += (made[0].height + 3) * S
        print(cid, "from", base, made[0].size, len(made), "frames")
    sheet.save(OUT / "_review_chars.png")


if __name__ == "__main__":
    main()
