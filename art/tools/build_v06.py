"""Build the v0.6 art pack: floor bosses, skeleton family, pets, 3 adventurer classes.
Needs: kitbash_v06.py and finish_bosses.py already run (art/final/...).
Run: python art/tools/build_v06.py -> dist/assets/frames/yd/{chars,monsters,attack} + art/SHOWCASE-v06.png
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

# single still frame (Gemini) -> idle/run; value = legs rows (0 = floating)
STILLS = {"necro_lord": 0, "spider_queen": 4, "frost_witch": 3, "orc_warlord": 4, "death_knight": 4,
          "bone_king": 4, "bone_hound": 3, "bone_giant": 4, "wolf_pet": 3, "hawk": 0, "druid_bear": 4}
KITBASH_MON = ["skeleton_archer", "skeleton_mage", "skeleton_guard", "skeleton_knight", "ember_skeleton"]
HEROES = ["beastmaster", "druid", "hunter"]
CAST = {"necro_lord", "frost_witch", "skeleton_mage", "druid", "bone_king"}
SHOOT = {"skeleton_archer", "hunter"}

for n, legs in STILLS.items():
    src = FIN / "monsters" / f"{n}.png"
    if not src.exists():
        print("missing", n)
        continue
    animate.char(str(src), str(FIN / "monsters/anim" / n), legs=legs or 3, floating=legs == 0)

(YD / "monsters").mkdir(parents=True, exist_ok=True)
(YD / "chars").mkdir(parents=True, exist_ok=True)
mons = [n for n in STILLS if (FIN / "monsters" / f"{n}.png").exists()] + KITBASH_MON
for n in mons:
    for f in (FIN / "monsters/anim").glob(f"{n}_*anim_f*.png"):
        shutil.copy(f, YD / "monsters" / f.name)
for n in HEROES:
    for f in (FIN / "chars").glob(f"{n}_*anim_f*.png"):
        shutil.copy(f, YD / "chars" / f.name)

ATK = YD / "attack"
made = {}
for n in mons + HEROES:
    d = "chars" if n in HEROES else "monsters"
    p = YD / d / f"{n}_idle_anim_f0.png"
    kind = "cast" if n in CAST else "shoot" if n in SHOOT else "melee"
    legs = 0 if STILLS.get(n, 3) == 0 else 3
    made[n] = animate.attack(str(p), str(ATK / n), kind, legs)
print("v06 attack anims:", len(made))

# showcase: row 1 floor bosses (idle f0 + attack f1), row 2 skeletons, row 3 heroes + pets
S = 3


def L(p):
    return Image.open(p).convert("RGBA")


bosses = ["ogre", "big_demon"] + [b for b in ["necro_lord", "spider_queen", "frost_witch", "orc_warlord",
                                              "death_knight", "bone_king"] if b in made]
row1 = [L(F / f"{b}_idle_anim_f0.png") if b in ("ogre", "big_demon") else L(YD / f"monsters/{b}_idle_anim_f0.png")
        for b in bosses]
row2 = [L(YD / f"monsters/{n}_idle_anim_f0.png") for n in KITBASH_MON + ["bone_hound", "bone_giant"] if n in made]
row3 = [L(YD / f"chars/{n}_idle_anim_f0.png") for n in HEROES] + \
       [L(YD / f"monsters/{n}_idle_anim_f0.png") for n in ["wolf_pet", "hawk", "druid_bear"] if n in made]
row4 = [fr for n in ["necro_lord", "bone_king", "skeleton_archer", "hunter"] if n in made for fr in made[n]]
rows = [row1, row2, row3, row4]
gap = 4
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
c.save(ROOT / "art/SHOWCASE-v06.png")
print("ok")
