"""v0.6 kitbash: skeleton family and 3 new adventurer classes (Titan/Demon bosses keep the original ogre/big_demon).
Reuses recolor/accessory from kitbash_chars.py so every 0x72 frame (idle/run/hit) is kept.
Run: python art/tools/kitbash_v06.py -> art/final/chars|monsters/<id>_* + art/final/_review_v06_kitbash.png
"""
import sys
from pathlib import Path
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
import kitbash_chars as K  # noqa: E402

ROOT = K.ROOT
FIN = ROOT / "art" / "final"

K.ACC.update({
    # skeletons (head is 16 px wide bone skull)
    "hood_g": [".kkkk.", "kGGGGk", "kG..Gk"],
    "hood_p": [".kkkk.", "kPPPPk", "kP..Pk"],
    "spike_helm": ["k..k..k", "kkkkkkk", "k22222k", "kkkkkkk"],
    "horn_helm": ["w.....w", "kw...wk", ".kRRRk.", "kRRRRRk", "kkkkkkk"],
    "flame": ["..o..", ".oOo.", "oOyOo"],
    # heroes
    "wolf_hood": ["k......k", "Bk....kB", "BBkkkkBB", "kBbbbbBk", "kBb..bBk"],
    "antlers": ["b.b.b.b", "kbk.kbk", "..kbk..", "...k..."],
    "leaf_crown": [".G.G.G.", "kGgGgGk", "kkkkkkk"],
    "feather_hat": ["....r", "..kkr", ".kGGk", "kkkkkkk"],
    # bosses
    "boss_crown": ["k.k.k.k.k", "kyky.ykyk", "kyyyyyyyk", "kYrYYYrYk", "kkkkkkkkk"],
    "stone_crest": ["..kkk..", ".k333k.", "k32223k"],
})
K.ACOL.update({"G": "#3d734f", "g": "#4ba747", "P": "#5f2d56", "R": "#9b1a0a", "o": "#da4e38", "O": "#ee8e2e",
               "b": "#8a503e", "B": "#775c55"})
K.OVERLAP.update({"hood_g": 3, "hood_p": 3, "spike_helm": 3, "horn_helm": 3, "flame": 1, "wolf_hood": 4,
                  "antlers": 1, "leaf_crown": 2, "feather_hat": 3, "boss_crown": 2, "stone_crest": 1})

MONSTERS = {
    # id: (base, recolor, accessory)
    "skeleton_archer": ("skelet", {"#d3bfa9": "#aa8d7a"}, "hood_g"),
    "skeleton_mage": ("skelet", {"#fdf7ed": "#cae6f5", "#d3bfa9": "#5698cc"}, "hood_p"),
    "skeleton_guard": ("skelet", {}, "spike_helm"),
    "skeleton_knight": ("skelet", {"#fdf7ed": "#b6cbcf", "#d3bfa9": "#7b8994"}, "horn_helm"),
    "ember_skeleton": ("skelet", {"#fdf7ed": "#ffcc68", "#d3bfa9": "#e46e33"}, "flame"),
}
HEROES = {
    "beastmaster": ("dwarf_m", {"#da4e38": "#8a503e", "#e46e33": "#775c55", "#7b8994": "#d3bfa9"}, "wolf_hood"),
    "druid": ("elf_f", {"#4ba747": "#3d734f", "#3d734f": "#3e5442", "#facb3e": "#8a503e", "#ee8e2e": "#775c55",
                       "#da4e38": "#4ba747"}, "antlers"),
    "hunter": ("elf_m", {"#4ba747": "#5c7a56", "#3d734f": "#3e5442", "#facb3e": "#8a503e", "#ee8e2e": "#775c55",
                         "#5698cc": "#b58057"}, "feather_hat"),
}


def build(table, out_dir):
    out_dir.mkdir(parents=True, exist_ok=True)
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
            t.save(out_dir / f"{cid}_{suffix}.png")
            res.append(t)
        made[cid] = (base, res)
        print(cid, "from", base, res[0].size)
    return made


def main():
    made = build(MONSTERS, FIN / "monsters" / "anim")
    made.update(build(HEROES, FIN / "chars"))
    S = 4
    rows = list(made.items())
    W = 9 * 36 * S
    Ht = sum((m[1][0].height + 4) * S for _, m in rows)
    sheet = Image.new("RGBA", (W, Ht), (64, 58, 66, 255))
    y = 0
    for cid, (base, res) in rows:
        orig = Image.open(K.SRC / f"{base}_idle_anim_f0.png").convert("RGBA")
        sheet.alpha_composite(orig.resize((orig.width * S, orig.height * S), Image.NEAREST),
                              (0, y + (res[0].height - orig.height) * S))
        for i, f in enumerate(res[:8]):
            sheet.alpha_composite(f.resize((f.width * S, f.height * S), Image.NEAREST), ((i + 1) * 36 * S, y))
        y += (res[0].height + 4) * S
    sheet.save(FIN / "_review_v06_kitbash.png")


if __name__ == "__main__":
    main()
