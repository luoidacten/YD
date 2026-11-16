"""Biome tilesets (v0.8): recolor every 0x72 floor/wall tile per biome (same file names, so the renderer
only swaps the folder), add per-biome floor decals, hand-pixeled props and animated liquid tiles.
Run: python art/tools/biome_tiles.py -> dist/assets/frames/yd/tiles/<biome>/..., art/SHOWCASE-BIOMES.png
"""
import random
import sys
from pathlib import Path
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
import ui_kit as U  # noqa: E402
from pixelfont import draw_text  # noqa: E402

ROOT = U.ROOT
FR = ROOT / "dist/assets/frames"
OUT = ROOT / "dist/assets/frames/yd/tiles"
c = U.c

TILES = [p.stem for p in FR.glob("*.png") if p.stem.startswith(("floor_", "wall_", "column", "doors_"))
         and "fountain" not in p.stem and "goo" not in p.stem and "banner" not in p.stem]
SRC = {"line": "#222222", "base": "#483b3a", "light": "#775c55", "top1": "#aa8d7a", "top2": "#d3bfa9",
       "deep": "#21141b", "deep2": "#23151d"}

BIOMES = {
    # id: (Vietnamese name, recolor, decal palette)
    "forest": ("Rừng Cổ", {"base": "#3e5442", "light": "#5c7a56", "line": "#243f4c", "top1": "#3d734f",
                           "top2": "#4ba747", "deep": "#1d1218", "deep2": "#21141b"},
               [c("#97da3f"), c("#4ba747"), c("#facb3e"), c("#f78697")]),
    "cave": ("Hang Đá", {"base": "#3f3f3f", "light": "#545454", "line": "#1d1218", "top1": "#7b8994",
                         "top2": "#b6cbcf", "deep": "#140c11", "deep2": "#1d1218"},
             [c("#5956bd"), c("#72d6ce"), c("#7b8994")]),
    "ice": ("Hầm Băng", {"base": "#38607c", "light": "#5698cc", "line": "#243f4c", "top1": "#b6cbcf",
                         "top2": "#cae6f5", "deep": "#1f1833", "deep2": "#243f4c"},
            [c("#cae6f5"), c("#fdf7ed"), c("#72d6ce")]),
    "lava": ("Lò Dung Nham", {"base": "#302c2b", "light": "#3b3332", "line": "#140c11", "top1": "#8f4029",
                              "top2": "#c56025", "deep": "#140c11", "deep2": "#550f0a"},
             [c("#da4e38"), c("#ee8e2e"), c("#facb3e")]),
    "swamp": ("Đầm Lầy", {"base": "#3b3332", "light": "#5c7a56", "line": "#21141b", "top1": "#3e5442",
                          "top2": "#5c7a56", "deep": "#1d1218", "deep2": "#21141b"},
              [c("#49a790"), c("#55a894"), c("#3d734f")]),
    "crypt": ("Hầm Mộ", {"base": "#2a2a3a", "light": "#414859", "line": "#140c11", "top1": "#7b8994",
                         "top2": "#b6cbcf", "deep": "#140c11", "deep2": "#1f1833"},
              [c("#fdf7ed"), c("#d3bfa9"), c("#5f2d56")]),
}


def recolor(im, mapping):
    m = {U.c(SRC[k])[:3]: U.c(v)[:3] for k, v in mapping.items()}
    out = im.copy()
    out.putdata([(*m.get(p[:3], p[:3]), p[3]) if p[3] else p for p in im.getdata()])
    return out


def decal(im, biome, seed):
    """Small per-biome details on floor tiles (only on base-colored pixels, never on lines)."""
    rng = random.Random(seed)
    pal = BIOMES[biome][2]
    base = U.c(BIOMES[biome][1]["base"])[:3]
    px = im.load()

    def ok(x, y):
        return 0 <= x < 16 and 0 <= y < 16 and px[x, y][:3] == base

    n = rng.randint(0, 1) if biome == "crypt" else rng.randint(1, 3)
    for _ in range(n):
        x, y = rng.randint(2, 13), rng.randint(2, 13)
        if biome == "forest":       # grass tuft or flower
            if rng.random() < .6:
                for dx, dy in ((0, 0), (1, -1), (2, 0)):
                    if ok(x + dx, y + dy):
                        px[x + dx, y + dy] = pal[1] if dy else pal[0]
            elif ok(x, y):
                px[x, y] = rng.choice(pal[2:])
        elif biome == "cave":       # pebble
            for dx, dy in ((0, 0), (1, 0)):
                if ok(x + dx, y + dy):
                    px[x + dx, y + dy] = pal[2]
        elif biome == "ice":        # frost sparkle
            if ok(x, y):
                px[x, y] = pal[0]
            if rng.random() < .4 and ok(x + 1, y + 1):
                px[x + 1, y + 1] = pal[1]
        elif biome == "lava":       # glowing crack
            for k in range(rng.randint(2, 4)):
                if ok(x + k, y + (k % 2)):
                    px[x + k, y + (k % 2)] = pal[0] if k % 2 else pal[1]
        elif biome == "swamp":      # puddle
            for dx in range(3):
                if ok(x + dx, y):
                    px[x + dx, y] = pal[0]
            if ok(x + 1, y - 1):
                px[x + 1, y - 1] = pal[1]
        elif biome == "crypt":      # bone shard
            if ok(x, y) and ok(x + 1, y):
                px[x, y] = pal[0]
                px[x + 1, y] = pal[1]
    return im


# ---------- props (ASCII, '.'=empty, letters = palette keys) ----------
PROPS = {
    "forest": {
        "tree": (["....GGGG....", "..GGgGGgGG..", ".GgGGGGGGgG.", "GGGgGGgGGGGG", "GgGGGGGGGgGG", ".GGGgGGgGGG.",
                  "..GGGGGGGG..", "....kbbk....", "....kbBk....", "....kbBk....", "...kkbBkk...", "..k.kbbk.k.."],
                 {"G": "#3d734f", "g": "#4ba747", "b": "#8a503e", "B": "#775c55", "k": "#222222"}),
        "bush": (["..gGGg..", ".gGGGGg.", "gGGrGGGg", "GGGGGGrG", ".GGGGGG."],
                 {"G": "#3d734f", "g": "#97da3f", "r": "#da4e38"}),
        "mushroom": ([".rrr.", "rwrrr", "rrrwr", "..w..", "..w.."], {"r": "#da4e38", "w": "#fdf7ed"}),
        "stump": ([".bbbb.", "bBBBBb", "bBbbBb", "bbbbbb", "b.bb.b"], {"b": "#8a503e", "B": "#c38d70"}),
    },
    "cave": {
        "stalagmite": (["...k...", "..kSk..", "..kSk..", ".kSsSk.", ".kSsSk.", "kSSsSSk", "kSSSSSk"],
                       {"S": "#545454", "s": "#7b8994", "k": "#222222"}),
        "crystal": (["..c..c.", ".cCc.Cc", ".cCcCCc", "cCCcCCc", "kkkkkkk"],
                    {"c": "#72d6ce", "C": "#5956bd", "k": "#222222"}),
        "rocks": (["..SS....", ".SsSS.S.", "SSSSSSSs"], {"S": "#545454", "s": "#7b8994"}),
    },
    "ice": {
        "ice_pillar": (["..wcw..", ".wcCcw.", ".wcCcw.", ".wcCcw.", "wccCccw", "wcCCCcw", "kkkkkkk"],
                       {"w": "#fdf7ed", "c": "#cae6f5", "C": "#5698cc", "k": "#222222"}),
        "frozen_skull": ([".cccc.", "cwwwwc", "cw.w.c", "cwwwwc", ".cwwc."], {"c": "#5698cc", "w": "#cae6f5"}),
    },
    "lava": {
        "brazier": (["..oyo..", ".oyYyo.", "..oyo..", "kSSSSSk", ".kSSSk.", "..kSk..", ".kSSSk."],
                    {"o": "#da4e38", "y": "#ee8e2e", "Y": "#facb3e", "S": "#3f3f3f", "k": "#222222"}),
        "obsidian": (["..kk...", ".kSSk..", "kSsSSk.", "kSSSSSk"], {"S": "#2b2929", "s": "#545454", "k": "#140c11"}),
    },
    "swamp": {
        "reeds": (["g...g..", "g.g.g..", "gg.gg.g", ".gggg.g", ".gGggGg", "..GGGG."],
                  {"g": "#5c7a56", "G": "#3e5442"}),
        "lily": ([".GGG..", "GGgGGr", "GgGGG.", ".GGG.."], {"G": "#3d734f", "g": "#97da3f", "r": "#f78697"}),
    },
    "crypt": {
        "tombstone": ([".kkkk.", "kSSSSk", "kSsSSk", "kSSSSk", "kSsSSk", "kSSSSk", "kkkkkk"],
                      {"S": "#7b8994", "s": "#b6cbcf", "k": "#222222"}),
        "bone_pile": (["...w....", ".wWw.w..", "wWwwWWw.", "WwWWwwWw"], {"w": "#fdf7ed", "W": "#d3bfa9"}),
        "coffin": ([".kkkkkkkkkk.", "kbBBBBBBBBbk", "kBbbbYbbbbBk", "kbBBBBBBBBbk", ".kkkkkkkkkk."],
                   {"b": "#62232f", "B": "#8f4029", "Y": "#facb3e", "k": "#222222"}),
    },
}


def prop(rows, pal):
    w, h = max(len(r) for r in rows), len(rows)
    im = Image.new("RGBA", (w + 2, h + 2), (0, 0, 0, 0))
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch != ".":
                im.putpixel((x + 1, y + 1), U.c(pal[ch]))
    # outline in #222 where not already dark
    base = im.copy()
    for y in range(im.height):
        for x in range(im.width):
            if not base.getpixel((x, y))[3] and any(
                    0 <= x + a < im.width and 0 <= y + b < im.height and base.getpixel((x + a, y + b))[3]
                    for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                im.putpixel((x, y), U.c("#222222"))
    return im


def liquid(biome):
    """4-frame animated 16x16 liquid tile: lava (lava), murky water (swamp), deep ice water (ice)."""
    pal = {"lava": ["#9b1a0a", "#da4e38", "#ee8e2e", "#facb3e"], "swamp": ["#243f4c", "#3e5442", "#49a790", "#55a894"],
           "ice": ["#243f4c", "#38607c", "#5698cc", "#cae6f5"]}[biome]
    frames = []
    for f in range(4):
        im = Image.new("RGBA", (16, 16), U.c(pal[0]))
        rng = random.Random(11)
        for k in range(10):
            x, y = rng.randint(0, 15), rng.randint(0, 15)
            xx = (x + f * (1 if k % 2 else 2)) % 16
            col = pal[1 + (k + f) % 3]
            for dx in range(1 + k % 3):
                im.putpixel(((xx + dx) % 16, y), U.c(col))
        frames.append(im)
    return frames


def build():
    out = {}
    for b, (name, mapping, _) in BIOMES.items():
        d = OUT / b
        d.mkdir(parents=True, exist_ok=True)
        for t in TILES:
            im = recolor(Image.open(FR / f"{t}.png").convert("RGBA"), mapping)
            if t.startswith("floor_") and t[6:].isdigit():
                im = decal(im, b, hash((b, t)) & 0xffff)
            im.save(d / f"{t}.png")
        for pn, (rows, pal) in PROPS[b].items():
            prop(rows, pal).save(d / f"prop_{pn}.png")
        if b in ("lava", "swamp", "ice"):
            for i, f in enumerate(liquid(b)):
                f.save(d / f"liquid_anim_f{i}.png")
        out[b] = d
    return out


def room(b):
    """Render a 10x7 sample room in biome b (1x)."""
    d = OUT / b
    W, H = 10, 8
    im = Image.new("RGBA", (W * 16, H * 16), U.c("#100a0e"))
    rng = random.Random(1)
    L = lambda n: Image.open(d / f"{n}.png").convert("RGBA")  # noqa: E731
    for y in range(2, H):
        for x in range(W):
            im.alpha_composite(L(f"floor_{rng.choice([1, 1, 1, 2, 3, 4, 5, 6, 7, 8])}"), (x * 16, y * 16))
    for x in range(W):
        im.alpha_composite(L("wall_top_mid"), (x * 16, 0))
        im.alpha_composite(L("wall_mid"), (x * 16, 16))
    if (d / "liquid_anim_f0.png").exists():
        for x, y in ((6, 5), (7, 5), (7, 6), (6, 6), (8, 6)):
            im.alpha_composite(L("liquid_anim_f1"), (x * 16, y * 16))
    props = list(PROPS[b])
    spots = [(1, 2), (8, 2), (2, 6), (4, 3), (5, 6), (3, 4)]
    for i, (sx, sy) in enumerate(spots):
        p = L(f"prop_{props[i % len(props)]}")
        im.alpha_composite(p, (sx * 16 + (16 - p.width) // 2, sy * 16 + 16 - p.height))
    return im


def showcase():
    rooms = [(b, room(b)) for b in BIOMES]
    S = 2
    cols = 3
    w, h = rooms[0][1].size
    sheet = Image.new("RGBA", (cols * (w + 8) * S, 2 * (h + 18) * S), U.c("#221a1f"))
    for i, (b, im) in enumerate(rooms):
        x, y = (i % cols) * (w + 8) * S, (i // cols) * (h + 18) * S
        lab = Image.new("RGBA", (w, 16), (0, 0, 0, 0))
        draw_text(lab, 0, 0, BIOMES[b][0].upper(), U.GOLD[4], shadow=U.K)
        sheet.alpha_composite(lab.resize((w * S, 16 * S), Image.NEAREST), (x + 4 * S, y))
        sheet.alpha_composite(im.resize((w * S, h * S), Image.NEAREST), (x + 4 * S, y + 16 * S))
    sheet.save(ROOT / "art/SHOWCASE-BIOMES.png")


if __name__ == "__main__":
    build()
    showcase()
    print("tiles per biome:", len(TILES))
