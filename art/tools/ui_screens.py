"""v0.8 UI pieces + screen mockups: floor-boss pick screen, combat FX moment.
Run after ui_kit.py: python art/tools/ui_screens.py
 -> dist/assets/ui/kit/{card_boss,seal,skill_*}.png, art/MOCKUP-BOSS-PICK.png
"""
import json
import sys
from pathlib import Path
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
import ui_kit as U  # noqa: E402
from pixelfont import draw_text, text_size  # noqa: E402

ROOT = U.ROOT
KIT = U.OUT
YDM = ROOT / "dist/assets/frames/yd/monsters"
FR = U.FR
K, ST, GOLD, PARCH, INK, WHITE, FILL, WELL = U.K, U.ST, U.GOLD, U.PARCH, U.INK, U.WHITE, U.FILL, U.WELL
rect, bevel, new, nine, c = U.rect, U.bevel, U.new, U.nine, U.c


def card_boss():
    """Ornate boss card frame 48x48, slice 16: dark stone, double gold trim, corner studs."""
    w = h = 48
    im = new(w, h)
    rect(im, 2, 0, w - 3, h - 1, K)
    rect(im, 0, 2, w - 1, h - 3, K)
    rect(im, 1, 1, w - 2, h - 2, K)
    rect(im, 2, 2, w - 3, h - 3, GOLD[2])
    bevel(im, 2, 2, w - 3, h - 3, GOLD[4], GOLD[0])
    rect(im, 4, 4, w - 5, h - 5, K)
    rect(im, 5, 5, w - 6, h - 6, ST[1])
    bevel(im, 5, 5, w - 6, h - 6, ST[2], ST[0])
    rect(im, 7, 7, w - 8, h - 8, K)
    rect(im, 8, 8, w - 9, h - 9, FILL)
    for x, y in ((1, 1), (w - 8, 1), (1, h - 8), (w - 8, h - 8)):   # corner studs 7x7
        rect(im, x, y, x + 6, y + 6, K)
        rect(im, x + 1, y + 1, x + 5, y + 5, GOLD[3])
        bevel(im, x + 1, y + 1, x + 5, y + 5, GOLD[4], GOLD[1])
        rect(im, x + 3, y + 3, x + 3, y + 3, U.c("#9b1a0a"))
    return im


def seal():
    """Wax seal 12x12 for 'Ấn Tầng' rows."""
    rows = ["...####...", ".########.", "##########", "###.##.###", "####..####",
            "####..####", "###.##.###", "##########", ".########.", "...####..."]
    red = [c("#550f0a"), c("#9b1a0a"), c("#da4e38")]
    im = new(12, 12)
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            im.putpixel((x + 1, y + 1), red[1] if ch == "#" else red[0] if ch == "." and 0 < x < 9 and 0 < y < 9 else (0, 0, 0, 0))
    for x in range(12):
        for y in range(12):
            if im.getpixel((x, y))[3] == 0 and any(0 <= x + a < 12 and 0 <= y + b < 12 and im.getpixel((x + a, y + b))[3]
                                                  for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                im.putpixel((x, y), K)
    im.putpixel((3, 3), red[2])
    im.putpixel((4, 3), red[2])
    return im


SKILL = {  # 8x8 skill-kind glyphs (drawn white, recolored by type)
    "circle": ["..####..", ".#....#.", "#......#", "#..##..#", "#..##..#", "#......#", ".#....#.", "..####.."],
    "line": ["........", "......##", ".....###", "....###.", "...###..", "..###...", ".###....", "##......"],
    "cone": ["#.......", "##......", "#.#.....", "#..#....", "#..#....", "#.#.....", "##......", "#......."],
    "summon": ["..###...", ".#####..", ".#.#.#..", ".#####..", "..#.#...", "........", "#.#.#.#.", ".#.#.#.."],
    "aura": ["#..##..#", ".#....#.", "...##...", "#.####.#", "#.####.#", "...##...", ".#....#.", "#..##..#"],
    "leap": ["......#.", ".....##.", "....#.#.", "...#....", "..#.....", ".#......", "#.......", "########"],
    "beam": ["........", "#.......", "########", "########", "#.......", "........", "........", "........"],
    "taunt": ["...##...", "...##...", "...##...", "...##...", "...##...", "........", "...##...", "...##..."],
    "shield": [".######.", "#......#", "#.####.#", "#.####.#", "#.####.#", ".#.##.#.", "..#..#..", "...##..."],
    "blink": ["#.#.#...", ".#.#....", "#.#.#...", "....####", "...#####", "....####", "........", "........"],
}
SKILL_COL = {"circle": c("#da4e38"), "line": c("#ee8e2e"), "cone": c("#dc4a7b"), "summon": c("#97da3f"),
             "aura": c("#facb3e"), "leap": c("#f78697"), "beam": c("#72d6ce"), "taunt": c("#da4e38"),
             "shield": c("#5698cc"), "blink": c("#5956bd")}


def skill_icon(kind):
    im = new(10, 10)
    rect(im, 0, 0, 9, 9, K)
    rect(im, 1, 1, 8, 8, U.WELL)
    for y, r in enumerate(SKILL[kind]):
        for x, ch in enumerate(r):
            if ch == "#":
                im.putpixel((x + 1, y + 1), SKILL_COL[kind])
    return im


def T(im, x, y, s, col=WHITE, shadow=K, center=False, maxw=None):
    w, _ = text_size(s)
    if maxw and w > maxw:   # never overflow: cut with an ellipsis-like dot run
        while s and text_size(s + "..")[0] > maxw:
            s = s[:-1]
        s += ".."
        w, _ = text_size(s)
    if center:
        x -= w // 2
    draw_text(im, x, y, s, col, shadow=shadow)


BOSSES = [
    ("necro_lord", "KẺ CHIÊU HỒN", "Triệu hồi · giữ xa", 2,
     [("summon", "Triệu Hồi Xương"), ("beam", "Hút Hồn"), ("circle", "Lời Nguyền"), ("aura", "Đại Lễ Chiêu Hồn")],
     ["Xương hồi sinh 1 lần", "Hồn từ hero ×1,5"], "420"),
    ("death_knight", "HẮC KỴ SĨ", "Đấu tay đôi", 1,
     [("cone", "Chém Rune"), ("line", "Xung Kích"), ("shield", "Lá Chắn Tử Thần"), ("leap", "Hành Quyết")],
     ["Quái hút máu 10%"], "460"),
    ("bone_king", "VUA XƯƠNG", "Chỉ huy quân xương", 2,
     [("summon", "Gậy Triệu Tập"), ("aura", "Mệnh Lệnh"), ("summon", "Ngai Xương"), ("circle", "Phán Quyết")],
     ["Thuê xương −25%", "Xương +3 giáp"], "440"),
]


def boss_pick(kit):
    W, H = 640, 360
    # background: the existing HUD mockup, darkened
    bg = Image.open(ROOT / "art/MOCKUP-HUD-v1.png").convert("RGBA").resize((W, H), Image.NEAREST)
    im = bg.copy()
    im.alpha_composite(new(W, H, (10, 6, 9, 200)))
    # title ribbon
    rib = nine(kit["ribbon"], 8, 260, 16)
    im.alpha_composite(rib, ((W - 260) // 2, 10))
    T(im, W // 2, 8, "CHỌN TẦNG CHỦ · TẦNG 1", GOLD[4], center=True)
    T(im, W // 2, 30, "Boss canh giữ tầng và ban Ấn Tầng cho mọi phòng trên tầng này", U.PARCH[2], center=True)
    cw, ch = 176, 254
    gap = 16
    x0 = (W - (3 * cw + 2 * gap)) // 2
    for i, (sid, name, style, nseal, skills, seals, cost) in enumerate(BOSSES):
        x, y = x0 + i * (cw + gap), 52 - (6 if i == 0 else 0)  # first card hovered (lifted)
        im.alpha_composite(nine(kit["card_boss"], 16, cw, ch), (x, y))
        # portrait well with torch-lit floor
        pw, ph = cw - 24, 72
        well = nine(kit["panel_inset"], 4, pw, ph)
        im.alpha_composite(well, (x + 12, y + 12))
        for tx in range(x + 14, x + 12 + pw - 2, 16):
            fl = Image.open(FR / "floor_1.png").convert("RGBA").crop((0, 0, min(16, x + 10 + pw - tx), 14))
            im.alpha_composite(fl, (tx, y + 12 + ph - 16))
        spr = Image.open(YDM / f"{sid}_idle_anim_f0.png").convert("RGBA")
        spr = spr.resize((spr.width * 2 if spr.height <= 34 else spr.width * 3 // 2,
                          spr.height * 2 if spr.height <= 34 else spr.height * 3 // 2), Image.NEAREST)
        sx = x + 12 + (pw - spr.width) // 2
        sy = y + 12 + ph - 3 - spr.height
        clip = spr.crop((0, max(0, (y + 14) - sy), spr.width, spr.height))
        im.alpha_composite(clip, (sx, max(sy, y + 14)))
        # name plate
        plate = nine(kit["ribbon"], 8, cw - 20, 16)
        im.alpha_composite(plate, (x + 10, y + 88))
        T(im, x + cw // 2, y + 86, name, GOLD[4], center=True, maxw=cw - 40)
        T(im, x + cw // 2, y + 104, style, U.PARCH[2], center=True, maxw=cw - 24)
        # skills
        for k, (kind, sname) in enumerate(skills):
            yy = y + 122 + k * 14
            im.alpha_composite(skill_icon(kind), (x + 14, yy + 4))
            T(im, x + 28, yy, sname, WHITE, maxw=cw - 52)
            T(im, x + cw - 30, yy, ("", "", "GĐ2", "GĐ3")[k], ST[3], shadow=None)
        # seals on parchment
        par = nine(kit["panel_parchment"], 8, cw - 20, 14 + 14 * len(seals))
        im.alpha_composite(par, (x + 10, y + 178))
        for k, s in enumerate(seals):
            im.alpha_composite(kit["seal"], (x + 15, y + 184 + k * 14))
            T(im, x + 30, y + 180 + k * 14, s, INK, shadow=None, maxw=cw - 46)
        # cost + choose
        btn = nine(kit["btn_gold_hover" if i == 0 else "btn_gold_normal"], 5, cw - 24, 22)
        im.alpha_composite(btn, (x + 12, y + ch - 30))
        im.alpha_composite(U.L("coin_anim_f0"), (x + 22, y + ch - 27))
        T(im, x + cw // 2 + 6, y + ch - 31, f"CHỌN · {cost}", INK, shadow=GOLD[4], center=True)
    # bottom row: reroll + hint
    rb = nine(kit["btn_normal"], 5, 150, 22)
    im.alpha_composite(rb, ((W - 150) // 2, H - 30))
    T(im, W // 2, H - 31, "ĐỔI BỘ · 50 VÀNG (1 lần)", WHITE, center=True)
    return im


def main():
    kit = {p.stem: Image.open(p).convert("RGBA") for p in KIT.glob("*.png")}
    extra = {"card_boss": (card_boss(), 16), "seal": (seal(), 0)}
    for k in SKILL:
        extra[f"skill_{k}"] = (skill_icon(k), 0)
    meta = json.loads((KIT / "kit.json").read_text())
    for n, (im, sl) in extra.items():
        im.save(KIT / f"{n}.png")
        kit[n] = im
        meta[n] = {"w": im.width, "h": im.height, "slice": sl}
    (KIT / "kit.json").write_text(json.dumps(meta, indent=1))
    boss_pick(kit).resize((1280, 720), Image.NEAREST).save(ROOT / "art/MOCKUP-BOSS-PICK.png")
    print("ok", len(extra))


if __name__ == "__main__":
    main()
