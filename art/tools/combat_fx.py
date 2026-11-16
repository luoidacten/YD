"""Combat feel FX (v0.8): hit spark, slash arc, crit burst, heal, death puff, bone chips, telegraph tiles,
damage digits. All 4-frame (telegraph 2-frame) pixel sprites in the 0x72 palette, plus a mockup.
Run: python art/tools/combat_fx.py -> dist/assets/frames/yd/fx/*_anim_f*.png, dist/assets/ui/kit/digits_*.png,
     art/MOCKUP-COMBAT-FX.png
"""
import math
import random
import sys
from pathlib import Path
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
import ui_kit as U  # noqa: E402
from pixelfont import glyph  # noqa: E402

ROOT = U.ROOT
FX = ROOT / "dist/assets/frames/yd/fx"
K, WHITE, GOLD, c, new = U.K, U.WHITE, U.GOLD, U.c, U.new
Y1, Y2 = c("#ffcc68"), c("#facb3e")
R1, R2, R3 = c("#9b1a0a"), c("#da4e38"), c("#f78697")
G1, G2, G3 = c("#3d734f"), c("#4ba747"), c("#97da3f")
S1, S2, S3 = c("#3f3f3f"), c("#7b8994"), c("#b6cbcf")
BONE, BONE2 = c("#fdf7ed"), c("#d3bfa9")


def put(im, x, y, col):
    if 0 <= x < im.width and 0 <= y < im.height:
        im.putpixel((int(x), int(y)), col)


def outline(im):
    base = im.copy()
    for y in range(im.height):
        for x in range(im.width):
            if not base.getpixel((x, y))[3] and any(
                    0 <= x + a < im.width and 0 <= y + b < im.height and base.getpixel((x + a, y + b))[3]
                    for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                im.putpixel((x, y), K)
    return im


def hit_spark():
    fr = []
    for f, r in enumerate((4, 6, 7, 8)):
        im = new(16, 16)
        cx = cy = 8
        for k in range(8):
            a = k * math.pi / 4
            ln = r if k % 2 == 0 else r - 2
            for t in range(max(0, f * 2 - 1), ln):
                put(im, cx + math.cos(a) * t, cy + math.sin(a) * t, WHITE if f < 2 else Y1)
        if f < 2:
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    put(im, cx + dx, cy + dy, WHITE if f == 0 else Y1)
        fr.append(outline(im) if f < 3 else im)
    return fr


def slash():
    fr = []
    for f in range(4):
        im = new(24, 24)
        a0, a1 = -100 + f * 40, -100 + f * 40 + 110
        for a in range(a0, a1, 3):
            t = (a - a0) / max(1, a1 - a0)
            rr = 9
            th = 1 + int(2 * math.sin(t * math.pi))
            for w in range(th):
                x = 12 + math.cos(math.radians(a)) * (rr - w)
                y = 12 + math.sin(math.radians(a)) * (rr - w)
                put(im, x, y, WHITE if w == 0 else S3)
        if f == 3:  # fading: keep only every other pixel
            px = im.load()
            for y in range(24):
                for x in range(24):
                    if (x + y) % 2:
                        px[x, y] = (0, 0, 0, 0)
        fr.append(im)
    return fr


def crit():
    fr = []
    for f, r in enumerate((3, 6, 9, 11)):
        im = new(24, 24)
        for k in range(12):
            a = k * math.pi / 6 + f * 0.2
            ln = r if k % 3 == 0 else r * 2 // 3
            for t in range(max(0, ln - 4), ln):
                put(im, 12 + math.cos(a) * t, 12 + math.sin(a) * t, Y1 if k % 3 == 0 else Y2)
        if f < 2:
            for dx in range(-2, 3):
                for dy in range(-2, 3):
                    if abs(dx) + abs(dy) <= 2:
                        put(im, 12 + dx, 12 + dy, WHITE)
        fr.append(outline(im))
    return fr


PLUS = [".#.", "###", ".#."]


def heal():
    fr = []
    rng = random.Random(4)
    pts = [(rng.randint(1, 12), rng.randint(6, 13)) for _ in range(4)]
    for f in range(4):
        im = new(16, 16)
        for i, (x, y) in enumerate(pts):
            yy = y - f * 2 - i % 2
            if yy < 0:
                continue
            col = G3 if (i + f) % 2 else WHITE
            for dy, r in enumerate(PLUS):
                for dx, ch in enumerate(r):
                    if ch == "#":
                        put(im, x + dx, yy + dy, col)
        fr.append(outline(im))
    return fr


def death_puff():
    fr = []
    rng = random.Random(9)
    blobs = [(rng.randint(-5, 5), rng.randint(-3, 3), rng.randint(2, 4)) for _ in range(7)]
    for f in range(4):
        im = new(20, 20)
        for bx, by, br in blobs:
            r = br + f
            cx, cy = 10 + bx * (1 + f * 0.3), 12 + by - f * 1.5
            for y in range(-r, r + 1):
                for x in range(-r, r + 1):
                    if x * x + y * y <= r * r:
                        shade = S3 if y < -r // 2 else S2 if f < 3 else S1
                        if f == 3 and (x + y) % 2:
                            continue
                        put(im, cx + x, cy + y, shade)
        fr.append(outline(im) if f < 3 else im)
    return fr


def bone_chips():
    fr = []
    rng = random.Random(2)
    chips = [(rng.uniform(-1.6, 1.6), rng.uniform(-2.6, -1.2)) for _ in range(6)]
    for f in range(4):
        im = new(20, 20)
        for i, (vx, vy) in enumerate(chips):
            t = f + 1
            x = 10 + vx * t * 2
            y = 12 + vy * t * 2 + 0.5 * 1.1 * t * t
            put(im, x, y, BONE if i % 2 else BONE2)
            put(im, x + 1, y, BONE2)
        fr.append(outline(im))
    return fr


def telegraph():
    """16x16 danger tile for boss telegraphs (tiled over the area), 2 frames pulse + border tiles."""
    fr = []
    for f in range(2):
        im = new(16, 16)
        for y in range(16):
            for x in range(16):
                if (x + y + f * 4) % 8 < 2:
                    im.putpixel((x, y), c("#da4e38", 150))
                else:
                    im.putpixel((x, y), c("#9b1a0a", 70))
        fr.append(im)
    edge = new(16, 16)
    for x in range(16):
        edge.putpixel((x, 0), c("#facb3e"))
        edge.putpixel((x, 1), c("#9b1a0a"))
    return fr, edge


def digits():
    """Damage digits 0-9 + ! for 4 kinds, 2px dark outline (readable on any floor)."""
    kinds = {"dmg": WHITE, "crit": Y1, "heal": G3, "hurt": R3}
    out = {}
    for k, col in kinds.items():
        chars = "0123456789!+"
        im = new(len(chars) * 8, 12)
        for i, ch in enumerate(chars):
            w, pts = glyph(ch)
            for x, y in pts:
                put(im, i * 8 + 1 + x + (5 - w) // 2, y - 6 + 3, col)
        im = outline(outline(im))
        out[k] = im
    return out


def save(name, frames):
    FX.mkdir(parents=True, exist_ok=True)
    for i, f in enumerate(frames):
        f.save(FX / f"{name}_anim_f{i}.png")


def mockup(sets, tele, edge, dg):
    W, H = 320, 180
    im = new(W, H, c("#100a0e"))
    rng = random.Random(5)
    for y in range(16, H, 16):
        for x in range(0, W, 16):
            im.alpha_composite(U.L(f"floor_{rng.choice([1, 1, 2, 3, 4, 6])}"), (x, y))
    for x in range(0, W, 16):
        im.alpha_composite(U.L("wall_mid"), (x, 0))
    # boss telegraph circle
    cx, cy, r = 228, 108, 34
    for ty in range(cy - r, cy + r, 16):
        for tx in range(cx - r, cx + r, 16):
            t = tele[0].copy()
            px = t.load()
            for y in range(16):
                for x in range(16):
                    if (tx + x - cx) ** 2 + (ty + y - cy) ** 2 > r * r:
                        px[x, y] = (0, 0, 0, 0)
                    elif (tx + x - cx) ** 2 + (ty + y - cy) ** 2 > (r - 2) ** 2:
                        px[x, y] = Y2
            im.alpha_composite(t, (tx, ty))
    yd = ROOT / "dist/assets/frames/yd"
    im.alpha_composite(Image.open(yd / "monsters/bone_king_idle_anim_f0.png").convert("RGBA"), (212, 40))
    im.alpha_composite(Image.open(yd / "attack/knight_m_attack_anim_f1.png").convert("RGBA"), (60, 90))
    im.alpha_composite(Image.open(yd / "monsters/skeleton_guard_idle_anim_f0.png").convert("RGBA"), (84, 102))
    im.alpha_composite(sets["slash"][1], (72, 92))
    im.alpha_composite(sets["hit_spark"][1], (86, 104))
    im.alpha_composite(dg["dmg"].crop((1 * 8, 0, 3 * 8, 12)), (88, 86))     # "12"
    im.alpha_composite(U.L("elf_f_idle_anim_f0"), (128, 120))
    im.alpha_composite(sets["crit"][2], (150, 108))
    im.alpha_composite(dg["crit"].crop((2 * 8, 0, 5 * 8, 12)), (158, 98))
    im.alpha_composite(dg["crit"].crop((10 * 8, 0, 11 * 8, 12)), (182, 98))  # "!"
    im.alpha_composite(U.L("wizzard_f_idle_anim_f0"), (30, 130))
    im.alpha_composite(sets["heal"][2], (30, 132))
    im.alpha_composite(dg["heal"].crop((11 * 8, 0, 12 * 8, 12)), (44, 118))
    im.alpha_composite(dg["heal"].crop((8, 0, 2 * 8, 12)), (51, 118))
    im.alpha_composite(sets["bone_chips"][2], (262, 128))
    im.alpha_composite(sets["death_puff"][1], (282, 128))
    big = im.resize((W * 4, H * 4), Image.NEAREST)
    # frame strip of each effect on the right side legend
    strip = new(W * 4, 4 * 28 + 8, c("#221a1f"))
    x = 8
    for name, frs in sets.items():
        for f in frs:
            s = f.resize((f.width * 3, f.height * 3), Image.NEAREST)
            strip.alpha_composite(s, (x, 8))
            x += s.width + 4
        x += 16
    out = new(W * 4, H * 4 + strip.height)
    out.alpha_composite(big)
    out.alpha_composite(strip, (0, H * 4))
    out.save(ROOT / "art/MOCKUP-COMBAT-FX.png")


def main():
    sets = {"hit_spark": hit_spark(), "slash": slash(), "crit": crit(), "heal": heal(),
            "death_puff": death_puff(), "bone_chips": bone_chips()}
    for n, f in sets.items():
        save(n, f)
    tele, edge = telegraph()
    save("telegraph", tele)
    edge.save(FX / "telegraph_edge.png")
    dg = digits()
    for k, im in dg.items():
        im.save(U.OUT / f"digits_{k}.png")
    mockup(sets, tele, edge, dg)
    print("fx ok")


if __name__ == "__main__":
    main()
