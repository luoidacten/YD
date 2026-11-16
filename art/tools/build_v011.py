"""v0.11 art: zombie family (10 variants + Zombie King boss), Kingdom army (5 units), 20 trap sprites.
Characters are kitbashed from 0x72 frames (recolor + accessories) so they keep the original idle/run animation.
Run: python art/tools/build_v011.py -> dist/assets/frames/yd/{monsters,chars,traps,attack}, art/SHOWCASE-v011.png
"""
import sys
from pathlib import Path
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
import kitbash_chars as K  # noqa: E402
import animate  # noqa: E402

ROOT = K.ROOT
YD = ROOT / "dist/assets/frames/yd"

K.ACC.update({
    "z_helm": [".kkkk.", "k3223k", "kkkkkk"],
    "z_lamp": ["..yy..", ".kkkk.", "k2222k", "kkkkkk"],
    "z_crown": ["k.k.k.k.k", "kykykykyk", "kyyyyyyyk", "kYgYgYgYk", "kkkkkkkkk"],
    "royal_helm": ["..kyk..", ".k333k.", "k3y3y3k", "kkkkkkk"],
    "royal_hat": ["...y...", "..kBk..", ".kBBBk.", "kBByBBk", "kkkkkkk"],
    "royal_hood": [".kkkkk.", "kWWWWWk", "kWy.yWk"],
    "crest": ["..r..", ".kyk.", "k333k", "kkkkk"],
})
K.ACOL.update({"g": "#97da3f", "B": "#38607c", "W": "#fdf7ed"})
K.OVERLAP.update({"z_helm": 3, "z_lamp": 3, "z_crown": 2, "royal_helm": 3, "royal_hat": 2, "royal_hood": 3, "crest": 2})

TZ = {"#d3bfa9": "#aa8d7a", "#3d734f": "#3d734f", "#aa8d7a": "#775c55"}
ZOMBIES = {
    # id: (base, recolor, accessory)
    "zombie_shambler": ("tiny_zombie", {"#d3bfa9": "#97a28a", "#aa8d7a": "#5c7a56"}, None),
    "zombie_runner": ("tiny_zombie", {"#d3bfa9": "#c38d70", "#3d734f": "#da4e38", "#aa8d7a": "#8a503e"}, None),
    "zombie_spitter": ("tiny_zombie", {"#d3bfa9": "#5c7a56", "#3d734f": "#97da3f", "#aa8d7a": "#3e5442"}, None),
    "zombie_armored": ("tiny_zombie", {"#d3bfa9": "#97a28a", "#aa8d7a": "#5c7a56"}, "z_helm"),
    "zombie_miner": ("tiny_zombie", {"#d3bfa9": "#aa8d7a", "#aa8d7a": "#775c55"}, "z_lamp"),
    "zombie_crawler": ("tiny_zombie", {"#d3bfa9": "#7b8994", "#aa8d7a": "#545454", "#3d734f": "#5698cc"}, None),
    "zombie_brute": ("big_zombie", {"#aa8d7a": "#5c7a56", "#775c55": "#3e5442", "#483b3a": "#2b2929"}, None),
    "zombie_bloater": ("big_zombie", {"#aa8d7a": "#97da3f", "#775c55": "#4ba747", "#483b3a": "#3d734f"}, None),
    "zombie_plague": ("big_zombie", {"#aa8d7a": "#9a7bd1", "#775c55": "#5f2d56", "#483b3a": "#38262d"}, None),
    "zombie_knight": ("knight_m", {"#72d6ce": "#5c7a56", "#417089": "#3e5442", "#fdf7ed": "#97a28a",
                                   "#da4e38": "#62232f", "#ee8e2e": "#8a503e"}, None),
    "zombie_king": ("big_zombie", {"#aa8d7a": "#5c7a56", "#775c55": "#62232f", "#483b3a": "#38262d",
                                   "#333333": "#5f2d56"}, "z_crown"),
}
KINGDOM = {
    "royal_guard": ("knight_m", {"#72d6ce": "#5698cc", "#417089": "#38607c", "#da4e38": "#facb3e", "#ee8e2e": "#ee8e2e"}, "crest"),
    "royal_archer": ("elf_m", {"#4ba747": "#38607c", "#3d734f": "#243f4c", "#facb3e": "#facb3e", "#ee8e2e": "#ee8e2e"}, None),
    "royal_mage": ("wizzard_m", {"#5698cc": "#38607c", "#5956bd": "#facb3e", "#fdf7ed": "#fdf7ed"}, None),
    "royal_cleric": ("wizzard_f", {"#5698cc": "#fdf7ed", "#5956bd": "#facb3e"}, None),
    "royal_captain": ("knight_f", {"#72d6ce": "#facb3e", "#417089": "#c56025", "#dc4a7b": "#38607c", "#f78697": "#5698cc"}, "royal_helm"),
}
K.ACOL.setdefault("3", "#b6cbcf")


def kitbash(table, sub):
    out = YD / sub
    out.mkdir(parents=True, exist_ok=True)
    made = {}
    for cid, (base, mapping, acc) in table.items():
        fr = K.frames(base)
        tmp = [K.accessory(K.recolor(im, mapping), acc) if acc else K.recolor(im, mapping) for _, im in fr]
        H = max(t.height for t in tmp)
        res = []
        for (suffix, _), t in zip(fr, tmp):
            if t.height < H:
                pad = Image.new("RGBA", (t.width, H), (0, 0, 0, 0))
                pad.alpha_composite(t, (0, H - t.height))
                t = pad
            t.save(out / f"{cid}_{suffix}.png")
            res.append(t)
        made[cid] = res
        animate.attack(str(out / f"{cid}_idle_anim_f0.png"), str(YD / "attack" / cid),
                       "cast" if cid in ("royal_mage", "royal_cleric", "zombie_spitter") else
                       "shoot" if cid == "royal_archer" else "melee", 3)
    return made


# ---------------- traps (16x16, turrets 16x20) ----------------
PAL = {"k": "#222222", "s": "#3f3f3f", "S": "#545454", "l": "#7b8994", "w": "#b6cbcf", "b": "#8a503e", "B": "#c38d70",
       "r": "#9b1a0a", "R": "#da4e38", "o": "#ee8e2e", "y": "#facb3e", "Y": "#ffcc68", "c": "#38607c", "C": "#5698cc",
       "i": "#cae6f5", "g": "#3d734f", "G": "#97da3f", "p": "#5f2d56", "P": "#9a7bd1", "W": "#fdf7ed", "d": "#2b2929"}
BASE = ["..kkkkkkkkkk..", ".kSSSSSSSSSSk.", "kSllllllllllSk", "kSsssssssssSSk", "kkkkkkkkkkkkkk"]


def turret(head):
    return [r.center(14, ".") for r in head] + BASE


TRAPS = {
    "T01": turret(["...k....", "..kbbkkkk", ".kbBBlllWk", "..kbbkkkk", "...kbk..", "..kbbbk.", "..kbBbk."]),
    "T02": turret(["..kkkkkk..", ".kllllllkkkk", "kllswwlllddk", ".kllllllkkkk", "..kskk..", "..kssk..", ".kssssk."]),
    "T03": turret(["...kkkk..oy", "..kRRRRkoYy", ".kRrrrRRko.", "..kRRRRk...", "...krk....", "..krrrk...", "..kRrRk..."]),
    "T04": turret(["...kkkk..i", "..kCCCCkiW", ".kCccccCki.", "..kCCCCk..", "...kck....", "..kcCck...", "..kCcCk..."]),
    "T05": turret([".y.....y.", "..y.k.y..", "...kYk...", "..kYyYk..", "...kyk...", "..kllk...", ".klwwlk..", ".kllllk.."]),
    "T06": turret(["..kkkkkkkkk", ".kdddddddddk", "kdssssssssddk", ".kdddddddddk", "..kbbbbbk...", ".kbBBBBBbk..", ".kbbbbbbbk.."]),
    "T07": turret(["...kkkk..G", "..kGGGGkGg", ".kGggggGk.", "..kGGGGk..", "...kgk....", "..kggg k..", "..kGgGk..."]),
    "T08": turret(["...kkkk..P", "..kPPPPkPp", ".kPppppPk.", "..kPPPPk..", "...kpk....", "..kpppk...", "..kPpPk..."]),
    "T09": ["......", "..kkkkkk..", ".kllSSllk.", "kSlRRRRlSk", "kSRYyyYRSk", ".kSSSSSSk.", "..kkkkkk.."],
    "T10": ["...kk..kk...", "..kbbkkbbk..", ".kbBbbbbBbk.", ".kbrrrrrrbk.", ".kbBbbbbBbk.", "..kbbkkbbk..", "...kkkkkk..."],
    "T11": ["..kkkkkk..", ".kliiiilk.", "kliCCCCilk", "kliCWWCilk", ".kliiiilk.", "..kkkkkk.."],
    "T12": ["...s.s.s..", "..kkkkkk..", ".kllSSllk.", "kSlggggSlk", "kSgGGGGgSk", ".kSSSSSSk.", "..kkkkkk.."],
    "T13": ["....kkkk....", "..kkwllwkk..", ".kwlkllklwk.", "kwlllkkllllk", "kllkkddkkllk", "kwlllkkllllk",
            ".kwlkllklwk.", "..kkwllwkk..", "....kkkk...."],
    "T14": ["....kk....", "....kk....", "....kk....", "....kk....", "..kkkkkk..", ".kssssssk.", ".ksllllsk.",
            ".kssssssk.", "..kkkkkk.."],
    "T15": ["k.k.k.k.k.k", ".kbkbkbkbk.", "kbkbkbkbkbk", ".kbkbkbkbk.", "kbkbkbkbkbk", ".kbkbkbkbk.", "k.k.k.k.k.k"],
    "T16": ["kkkkkkkkkkkk", "kddddddddddk", "kdlkdlkdlkdk", "kdWkdWkdWkdk", "kdddddddddd k", "kkkkkkkkkkkk"],
    "T17": ["..kkkk..kkkk..", ".kRRRk..kCCCk.", ".kRRk....kCCk.", ".kRRk....kCCk.", ".kRRRkkkkCCCk.", "..kSSSSSSSSk..",
            "...kkkkkkkk..."],
    "T18": ["...kkkkkk...", "..kCcccccCk..", ".kCcpPPpcCk.", ".kcpPWWPpck.", ".kCcpPPpcCk.", "..kCcccccCk..", "...kkkkkk..."],
    "T19": ["...kkkkk...", "..kSllllSk..", "..kSlPlPSk..", "..kSllllSk..", "..kSlPPlSk..", "..kSllllSk..", ".kkkkkkkkk.",
            "kSSSSSSSSSk"],
    "T20": ["....kgk....", "...kGgGk...", "..kgGWGgk..", "...kGgGk...", "....kgk....", "..kkSSSkk..", ".kSSlllSSk.",
            "kkkkkkkkkkk"],
}


def draw(rows):
    w = max(len(r) for r in rows)
    im = Image.new("RGBA", (w, len(rows)), (0, 0, 0, 0))
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch in PAL:
                h = PAL[ch].lstrip("#")
                im.putpixel((x, y), (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255))
    return im


def traps():
    out = YD / "traps"
    out.mkdir(parents=True, exist_ok=True)
    made = {}
    for tid, rows in TRAPS.items():
        im = draw(rows)
        im.save(out / f"trap_{tid}.png")
        made[tid] = im
    return made


def showcase(groups):
    S = 3
    rows = [list(g) for g in groups]
    W = max(sum(i.width + 4 for i in r) for r in rows) * S + 16
    H = sum(max(i.height for i in r) + 8 for r in rows) * S
    c = Image.new("RGBA", (W, H), (52, 47, 56, 255))
    y = 4 * S
    for r in rows:
        h = max(i.height for i in r)
        x = 8
        for i in r:
            c.alpha_composite(i.resize((i.width * S, i.height * S), Image.NEAREST), (x, y + (h - i.height) * S))
            x += (i.width + 4) * S
        y += (h + 8) * S
    c.save(ROOT / "art/SHOWCASE-v011.png")


if __name__ == "__main__":
    (YD / "attack").mkdir(parents=True, exist_ok=True)
    z = kitbash(ZOMBIES, "monsters")
    k = kitbash(KINGDOM, "chars")
    t = traps()
    showcase([[v[0] for v in z.values()], [v[0] for v in k.values()], list(t.values())])
    print("zombies", len(z), "kingdom", len(k), "traps", len(t))
