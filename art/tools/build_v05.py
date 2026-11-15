"""Build the v0.5 art pack: animate the new monsters, add attack animations for every sprite, copy into dist, make showcases.
Run: python art/tools/build_v05.py
"""
import shutil
import sys
from pathlib import Path
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
import animate  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
F = ROOT / "dist" / "assets" / "frames"
YD = F / "yd"
FIN = ROOT / "art" / "final"

# ---- 1. new monsters (v0.5) ----
BIG_NATIVE = {"werewolf", "gnoll", "minotaur", "troll"}           # already cropped to native 32
BIG_FROM_RAW = {"gargoyle": "v3", "treant": "v3"}                  # use the native 32 Gemini version
FLOAT = {"wraith", "harpy", "ghost", "bat", "fire_elemental", "eyeball", "cube_slime"}
NEW_MON = ["werewolf", "harpy", "kobold", "gnoll", "minotaur", "wraith", "lich", "troll",
           "treant", "salamander", "giant_rat", "scorpion", "gargoyle", "cultist", "naga", "living_armor"]

for n, v in BIG_FROM_RAW.items():
    im = Image.open(ROOT / f"art/gemini-raw/monsters/{v}/{n}.png").convert("RGBA")
    im.crop(im.getbbox()).save(FIN / "monsters" / f"{n}.png")

for n in NEW_MON:
    src = FIN / "monsters" / f"{n}.png"
    big = n in BIG_NATIVE or n in BIG_FROM_RAW
    if n in FLOAT:
        animate.char(str(src), str(FIN / "monsters/anim" / n), floating=True)
    else:
        animate.char(str(src), str(FIN / "monsters/anim" / n), legs=4 if big else 3)

(YD / "monsters").mkdir(parents=True, exist_ok=True)
for f in (FIN / "monsters/anim").glob("*_anim_f*.png"):
    shutil.copy(f, YD / "monsters" / f.name)
(YD / "weapons").mkdir(parents=True, exist_ok=True)
for f in (FIN / "weapons").glob("weapon_*.png"):
    shutil.copy(f, YD / "weapons" / f.name)
(YD / "chars").mkdir(parents=True, exist_ok=True)
for f in (FIN / "chars").glob("*_anim_f*.png"):
    shutil.copy(f, YD / "chars" / f.name)

# ---- 2. attack animations for every sprite in the game ----
CAST = {"wizzard_m", "wizzard_f", "necromancer", "orc_shaman", "imp", "angel", "frost_mage", "pyromancer",
        "priestess", "lich", "cultist", "wraith", "fire_elemental", "eyeball", "arcane_archer"}
SHOOT = {"elf_f", "lizard_f", "crossbowman"}
NOLEGS = {"tiny_slug", "muddy", "swampy", "ice_zombie", "slug"} | FLOAT

O72 = ["knight_m", "knight_f", "wizzard_m", "wizzard_f", "elf_m", "elf_f", "dwarf_m", "dwarf_f", "angel",
       "goblin", "skelet", "ogre", "necromancer", "big_demon", "imp", "chort", "wogol", "orc_warrior",
       "orc_shaman", "masked_orc", "lizard_m", "lizard_f", "tiny_zombie", "big_zombie", "pumpkin_dude",
       "tiny_slug", "muddy", "swampy", "ice_zombie"]


def first_frame(stem_dir, name):
    for pat in (f"{name}_idle_anim_f0.png", f"{name}_anim_f0.png"):
        p = stem_dir / pat
        if p.exists():
            return p
    return None


jobs = []
for n in O72:
    p = first_frame(F, n)
    if p:
        jobs.append((n, p))
for d in ("chars", "monsters"):
    for p in sorted((YD / d).glob("*_idle_anim_f0.png")):
        jobs.append((p.name.replace("_idle_anim_f0.png", ""), p))

ATK = YD / "attack"
ATK.mkdir(parents=True, exist_ok=True)
made = []
for name, p in jobs:
    kind = "cast" if name in CAST else "shoot" if name in SHOOT else "melee"
    legs = 0 if name in NOLEGS else 3
    fr = animate.attack(str(p), str(ATK / name), kind, legs)
    made.append((name, kind, fr))
print("attack anims:", len(made))

# ---- 3. showcases ----
S = 3


def sheet(rows, path, gap=3):
    W = max(sum(i.width + gap for i in r) for r in rows) * S + 8 * S
    H = sum(max(i.height for i in r) + gap * 2 for r in rows) * S
    c = Image.new("RGBA", (W, H), (52, 47, 56, 255))
    y = gap * S
    for r in rows:
        h = max(i.height for i in r)
        x = 4 * S
        for i in r:
            c.alpha_composite(i.resize((i.width * S, i.height * S), Image.NEAREST), (x, y + (h - i.height) * S))
            x += (i.width + gap) * S
        y += (h + gap * 2) * S
    c.save(path)


def L(p):
    return Image.open(p).convert("RGBA")


new_classes = ["ninja", "paladin", "priestess", "nun", "berserker", "knight_errant", "arcane_archer", "crossbowman"]
rows = [[L(YD / f"chars/{c}_idle_anim_f0.png") for c in new_classes],
        [L(YD / f"monsters/{m}_idle_anim_f0.png") for m in NEW_MON[:8]],
        [L(YD / f"monsters/{m}_idle_anim_f0.png") for m in NEW_MON[8:]]]
w2 = ["magic_bow", "shield_round", "shield_tower", "halberd", "fire_bomb", "shuriken", "kunai", "pistol", "musket",
      "blunderbuss", "hand_cannon", "greatsword", "rapier", "kama", "chakram", "whip", "holy_tome", "holy_staff",
      "war_fan", "nunchaku", "repeating_crossbow", "holy_mace"]
rows.append([L(YD / f"weapons/weapon_{w}.png") for w in w2])
sheet(rows, ROOT / "art/SHOWCASE-v05.png")

# attack review: 12 samples x 4 frames
pick = ["knight_m", "wizzard_m", "elf_f", "goblin", "big_demon", "ninja", "priestess", "crossbowman",
        "minotaur", "lich", "naga", "wraith"]
by = {n: fr for n, _, fr in made}
sheet([by[n] for n in pick if n in by], ROOT / "art/final/_review_attack.png", gap=2)
print("ok")
