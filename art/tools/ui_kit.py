"""YD UI kit v1: pixel 9-slice frames, buttons, cards, bars and icons in the 0x72 palette, plus a mockup.
All art is drawn at 1x and shown in game at 2x (CSS border-image + image-rendering: pixelated).
Run: python art/tools/ui_kit.py -> dist/assets/ui/kit/*.png, art/UI-KIT-v1.png, art/MOCKUP-HUD-v1.png
"""
import json
import random
import sys
from pathlib import Path
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
from pixelfont import draw_text, text_size, H as FH  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
FR = ROOT / "dist/assets/frames"
OUT = ROOT / "dist/assets/ui/kit"


def c(x, a=255):
    x = x.lstrip("#")
    return (int(x[0:2], 16), int(x[2:4], 16), int(x[4:6], 16), a)


K = c("#140c11")          # outline
ST = [c("#2b2929"), c("#3f3f3f"), c("#545454"), c("#7b8994"), c("#b6cbcf")]   # stone ramp dark->light
FILL = c("#221a1f")       # panel fill (warm near-black)
WELL = c("#170f14")       # inset well
GOLD = [c("#8f4029"), c("#c56025"), c("#ee8e2e"), c("#facb3e"), c("#ffcc68")]
PARCH = [c("#8a503e"), c("#aa8d7a"), c("#d3bfa9"), c("#e2b694")]
INK = c("#38262d")
WHITE = c("#fdf7ed")
CAT = {"room": c("#c56025"), "resident": c("#3d734f"), "trap": c("#9b1a0a"), "barrel": c("#38607c"),
       "elite": c("#5f2d56")}
CATL = {"room": c("#ee8e2e"), "resident": c("#4ba747"), "trap": c("#da4e38"), "barrel": c("#5698cc"),
        "elite": c("#dc4a7b")}


def new(w, h, col=(0, 0, 0, 0)):
    return Image.new("RGBA", (w, h), col)


def rect(im, x0, y0, x1, y1, col):
    px = im.load()
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if 0 <= x < im.width and 0 <= y < im.height:
                px[x, y] = col


def bevel(im, x0, y0, x1, y1, light, dark):
    rect(im, x0, y0, x1, y0, light)
    rect(im, x0, y0, x0, y1, light)
    rect(im, x0, y1, x1, y1, dark)
    rect(im, x1, y0, x1, y1, dark)


def frame(w, h, fill, ramp, rivet=None, double=True):
    """Stone frame: outline, light top-left/dark bottom-right bevel, optional inner line + corner rivets."""
    im = new(w, h)
    rect(im, 1, 0, w - 2, h - 1, K)
    rect(im, 0, 1, w - 1, h - 2, K)          # cut corners (rounded 1px like 0x72 UI)
    rect(im, 1, 1, w - 2, h - 2, ramp[2])
    bevel(im, 1, 1, w - 2, h - 2, ramp[3], ramp[1])
    rect(im, 3, 3, w - 4, h - 4, K)
    rect(im, 4, 4, w - 5, h - 5, fill)
    if double:
        bevel(im, 3, 3, w - 4, h - 4, ramp[0], ramp[1])
    if rivet:
        for x, y in ((1, 1), (w - 3, 1), (1, h - 3), (w - 3, h - 3)):
            rect(im, x, y, x + 1, y + 1, rivet[3])
            im.putpixel((x + 1, y + 1), rivet[1])
    return im


def panel_stone():
    return frame(24, 24, FILL, ST, rivet=GOLD)


def panel_inset():
    im = new(16, 16)
    rect(im, 0, 0, 15, 15, K)
    rect(im, 1, 1, 14, 14, WELL)
    bevel(im, 1, 1, 14, 14, ST[0], ST[2])
    return im


def panel_parchment():
    im = new(24, 24)
    rect(im, 1, 0, 22, 23, K)
    rect(im, 0, 1, 23, 22, K)
    rect(im, 1, 1, 22, 22, PARCH[2])
    bevel(im, 1, 1, 22, 22, PARCH[3], PARCH[1])
    rng = random.Random(7)  # paper speckle
    for _ in range(14):
        im.putpixel((rng.randint(4, 19), rng.randint(4, 19)), PARCH[3])
    for x, y in ((2, 2), (21, 2), (2, 21), (21, 21)):
        im.putpixel((x, y), PARCH[1])
    return im


def button(state, gold=False):
    ramp = ([GOLD[0], GOLD[1], GOLD[2], GOLD[3], GOLD[4]] if gold else ST)
    im = new(16, 16)
    rect(im, 1, 0, 14, 15, K)
    rect(im, 0, 1, 15, 14, K)
    face = {"normal": ramp[2], "hover": ramp[3], "pressed": ramp[1], "disabled": ST[0]}[state]
    rect(im, 1, 1, 14, 14, face)
    if state == "pressed":
        bevel(im, 1, 1, 14, 14, ramp[0], ramp[2])
    elif state == "disabled":
        bevel(im, 1, 1, 14, 14, ST[1], ST[0])
    else:
        bevel(im, 1, 1, 14, 14, ramp[4] if state == "hover" else ramp[3], ramp[1])
        rect(im, 1, 13, 14, 14, ramp[1])  # thick bottom lip (3D key)
        rect(im, 2, 14, 13, 14, ramp[0])
    return im


def tab(on):
    im = new(16, 12)
    rect(im, 1, 0, 14, 11, K)
    rect(im, 0, 1, 15, 11, K)
    rect(im, 1, 1, 14, 11, ST[2] if on else ST[0])
    bevel(im, 1, 1, 14, 11, ST[3] if on else ST[1], ST[1] if on else ST[0])
    if on:
        rect(im, 3, 1, 12, 1, GOLD[3])
    return im


def card(cat):
    """Card 52x58: category stripe on top, art well, name plate at the bottom, cost gem top-left."""
    w, h = 52, 58
    im = frame(w, h, FILL, ST)
    rect(im, 4, 4, w - 5, 6, CAT[cat])
    rect(im, 4, 4, w - 5, 4, CATL[cat])
    rect(im, 8, 9, w - 9, 36, WELL)               # art well
    bevel(im, 8, 9, w - 9, 36, ST[0], ST[2])
    rect(im, 4, 39, w - 5, 53, CAT[cat])          # name plate
    bevel(im, 4, 39, w - 5, 53, CATL[cat], K)
    # cost gem
    gx, gy = 2, 2
    for (x, y) in ((1, 3), (2, 2), (3, 1), (4, 1), (5, 2), (6, 3), (6, 4), (5, 5), (4, 6), (3, 6), (2, 5), (1, 4)):
        im.putpixel((gx + x, gy + y), K)
    rect(im, gx + 2, gy + 3, gx + 5, gy + 4, CATL[cat])
    rect(im, gx + 3, gy + 2, gx + 4, gy + 5, CATL[cat])
    im.putpixel((gx + 3, gy + 2), WHITE)
    return im


def bar(kind):
    """bar_frame 32x8 (slice 3) + fill 1x4 strips."""
    im = new(32, 8)
    rect(im, 1, 0, 30, 7, K)
    rect(im, 0, 1, 31, 6, K)
    rect(im, 1, 1, 30, 6, WELL)
    rect(im, 1, 1, 30, 1, ST[0])
    return im


FILLS = {"hp": [c("#9b1a0a"), c("#da4e38"), c("#f78697")], "mana": [c("#38607c"), c("#5698cc"), c("#72d6ce")],
         "soul": [c("#3d734f"), c("#4ba747"), c("#97da3f")], "xp": [c("#c56025"), c("#facb3e"), c("#ffcc68")]}


def bar_fill(kind):
    im = new(4, 4)
    d, m, l = FILLS[kind]
    rect(im, 0, 0, 3, 0, l)
    rect(im, 0, 1, 3, 2, m)
    rect(im, 0, 3, 3, 3, d)
    return im


def boss_bar():
    w, h = 160, 16
    im = new(w, h)
    rect(im, 10, 3, w - 11, 12, K)
    rect(im, 11, 4, w - 12, 11, WELL)
    bevel(im, 11, 4, w - 12, 11, ST[0], ST[2])
    # gold end caps with skull
    for x0 in (0, w - 14):
        rect(im, x0 + 1, 0, x0 + 12, 15, K)
        rect(im, x0, 1, x0 + 13, 14, K)
        rect(im, x0 + 1, 1, x0 + 12, 14, GOLD[2])
        bevel(im, x0 + 1, 1, x0 + 12, 14, GOLD[4], GOLD[0])
        sk = ["..####..", ".######.", "##..##..", "##..##.#", ".######.", "..#.#.#."]
        for y, r in enumerate(sk):
            for x, ch in enumerate(r):
                if ch == "#":
                    im.putpixel((x0 + 3 + x, 4 + y), WHITE)
                elif ch == "." and 0 < x < 7 and y in (2, 3):
                    im.putpixel((x0 + 3 + x, 4 + y), K)
    return im


def capsule(icon, w=40):
    """Resource capsule w x 16: icon well (14 px) on the left. CSS: border-image slice 4 4 4 15."""
    im = new(w, 16)
    rect(im, 1, 0, w - 2, 15, K)
    rect(im, 0, 1, w - 1, 14, K)
    rect(im, 1, 1, w - 2, 14, FILL)
    bevel(im, 1, 1, w - 2, 14, ST[1], ST[0])
    rect(im, 1, 1, 14, 14, ST[1])
    bevel(im, 1, 1, 14, 14, ST[2], ST[0])
    if icon:
        ic = icon.copy()
        ic.thumbnail((12, 12), Image.NEAREST)
        im.alpha_composite(ic, (2 + (12 - ic.width) // 2, 2 + (12 - ic.height) // 2))
    return im


def ribbon():
    """Title plate 48x16, slice 8: dark red cloth with gold trims and notched ends."""
    w, h = 48, 16
    im = new(w, h)
    red = [c("#550f0a"), c("#9b1a0a"), c("#da4e38")]
    rect(im, 3, 1, w - 4, h - 2, K)
    rect(im, 4, 2, w - 5, h - 3, red[1])
    rect(im, 4, 2, w - 5, 2, GOLD[3])
    rect(im, 4, h - 3, w - 5, h - 3, GOLD[1])
    rect(im, 4, 3, w - 5, 3, red[2])
    for x0, dirn in ((0, 1), (w - 4, -1)):
        for y in range(1, h - 1):
            d = abs(y - h // 2)
            xs = range(x0, x0 + 4) if dirn == 1 else range(x0, x0 + 4)
            for x in xs:
                inside = (x - x0 >= (3 - d // 2)) if dirn == 1 else (x0 + 3 - x >= (3 - d // 2))
                if inside:
                    im.putpixel((x, y), red[0])
    return im


ICONS = {
    "speed1": ["................", "................", "....#...........", "....##..........", "....###.........",
               "....####........", "....#####.......", "....######......", "....#####.......", "....####........",
               "....###.........", "....##..........", "....#...........", "................", "................",
               "................"],
    "speed2": ["................", "................", "..#.....#.......", "..##....##......", "..###...###.....",
               "..####..####....", "..#####.#####...", "..############..", "..#####.#####...", "..####..####....",
               "..###...###.....", "..##....##......", "..#.....#.......", "................", "................",
               "................"],
    "speed4": ["................", "................", "#...#...#...#...", "##..##..##..##..", "###.###.###.###.",
               "################", "###.###.###.###.", "##..##..##..##..", "#...#...#...#...", "................",
               "................", "................", "................", "................", "................",
               "................"],
    "pause": ["................", "................", "....###..###....", "....###..###....", "....###..###....",
              "....###..###....", "....###..###....", "....###..###....", "....###..###....", "....###..###....",
              "....###..###....", "....###..###....", "....###..###....", "................", "................",
              "................"],
    "audio_off": ["................", "................", "......#.........", ".....##.........", "....###...#...#.",
                  "######....#.#...", "######.....#....", "######....#.#...", "....###...#...#.", ".....##.........",
                  "......#.........", "................", "................", "................", "................",
                  "................"],
}


def icon(name, col=GOLD[3]):
    rows = ICONS[name]
    im = new(16, 16)
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch == "#":
                im.putpixel((x, y), col)
    # outline
    base = im.copy()
    for y in range(16):
        for x in range(16):
            if base.getpixel((x, y))[3] == 0 and any(
                    0 <= x + dx < 16 and 0 <= y + dy < 16 and base.getpixel((x + dx, y + dy))[3]
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                im.putpixel((x, y), K)
    # shade bottom pixels of each column
    return im


# ---------------- build ----------------
def build():
    OUT.mkdir(parents=True, exist_ok=True)
    assets = {
        "panel_stone": (panel_stone(), 8), "panel_inset": (panel_inset(), 4), "panel_parchment": (panel_parchment(), 8),
        "tab_on": (tab(True), 4), "tab_off": (tab(False), 4), "bar_frame": (bar("hp"), 3), "boss_bar": (boss_bar(), 14),
        "ribbon": (ribbon(), 8),
    }
    for st in ("normal", "hover", "pressed", "disabled"):
        assets[f"btn_{st}"] = (button(st), 5)
        assets[f"btn_gold_{st}"] = (button(st, gold=True), 5)
    for cat in CAT:
        assets[f"card_{cat}"] = (card(cat), 8)
    for k in FILLS:
        assets[f"fill_{k}"] = (bar_fill(k), 0)
    for n in ICONS:
        assets[f"icon_{n}"] = (icon(n), 0)
    res = {"gold": "coin_anim_f0", "mana": "flask_blue", "souls": "flask_green"}
    for k, f in res.items():
        assets[f"capsule_{k}"] = (capsule(Image.open(FR / f"{f}.png").convert("RGBA")), 0)
    meta = {}
    for name, (im, sl) in assets.items():
        im.save(OUT / f"{name}.png")
        meta[name] = {"w": im.width, "h": im.height, "slice": sl}
    (OUT / "kit.json").write_text(json.dumps(meta, indent=1))
    return {k: v[0] for k, v in assets.items()}


def nine(src, sl, w, h):
    """Stretch a 9-slice image to w x h (1x pixels), tiling edges and middle (CSS border-image: round)."""
    out = new(w, h)
    sw, sh = src.size
    sx, sy = [0, sl, sw - sl, sw], [0, sl, sh - sl, sh]
    dx, dy = [0, sl, w - sl, w], [0, sl, h - sl, h]
    for i in range(3):
        for j in range(3):
            if sx[i + 1] <= sx[i] or sy[j + 1] <= sy[j]:
                continue
            part = src.crop((sx[i], sy[j], sx[i + 1], sy[j + 1]))
            tw, th = dx[i + 1] - dx[i], dy[j + 1] - dy[j]
            if tw <= 0 or th <= 0:
                continue
            tile = new(tw, th)
            for yy in range(0, th, part.height):
                for xx in range(0, tw, part.width):
                    tile.alpha_composite(part, (xx, yy))
            out.alpha_composite(tile, (dx[i], dy[j]))
    return out


def sheet(a):
    S = 4
    names = list(a)
    W = 8
    cell = 56
    rows = (len(names) + W - 1) // W
    im = new(W * cell * S, rows * (cell + 14) * S, c("#2a2a3a"))
    for i, n in enumerate(names):
        x, y = (i % W) * cell * S, (i // W) * (cell + 14) * S
        src = a[n]
        if src.width > cell:
            src = src.crop((0, 0, cell, src.height))
        im.alpha_composite(src.resize((src.width * S, src.height * S), Image.NEAREST), (x + 2 * S, y + 2 * S))
        lab = new(cell * 2, FH)
        draw_text(lab, 0, 0, n[:16], WHITE)
        im.alpha_composite(lab.resize((lab.width * 2, lab.height * 2), Image.NEAREST), (x + 2 * S, y + 60 * S - 8))
    im.save(ROOT / "art/UI-KIT-v1.png")


# ---------------- mockup (1x canvas 640x360, shown at 2x = 1280x720) ----------------
def T(im, x, y, s, col=WHITE, shadow=K, center=False, right=False):
    w, _ = text_size(s)
    if center:
        x -= w // 2
    if right:
        x -= w
    draw_text(im, x, y, s, col, shadow=shadow)


def L(name):
    return Image.open(FR / f"{name}.png").convert("RGBA")


def mockup(a):
    W, Hh = 640, 360
    im = new(W, Hh, c("#100a0e"))
    # --- map (world at 1x tiles 16px) ---
    rng = random.Random(3)
    mx0, my0, mx1, my1 = 56, 30, 508, 294
    room = (120, 70, 440, 262)
    for y in range(room[1], room[3], 16):
        for x in range(room[0], room[2], 16):
            im.alpha_composite(L(f"floor_{rng.choice([1, 1, 1, 2, 3, 4, 5, 6, 7, 8])}"), (x, y))
    for x in range(room[0], room[2], 16):
        im.alpha_composite(L("wall_mid"), (x, room[1] - 16))
        im.alpha_composite(L("wall_top_mid"), (x, room[1] - 32))
    for x in (room[0] + 48, room[2] - 64):
        im.alpha_composite(L("wall_banner_red"), (x, room[1] - 16))
    im.alpha_composite(L("column"), (room[0] + 16, room[1] + 30)) if (FR / "column.png").exists() else None
    for i, (n, x, y) in enumerate([("knight_m_run_anim_f1", 170, 200), ("elf_f_idle_anim_f0", 150, 170),
                                   ("wizzard_m_idle_anim_f2", 140, 214), ("dwarf_m_run_anim_f2", 196, 228)]):
        im.alpha_composite(L(n), (x, y))
    yd = ROOT / "dist/assets/frames/yd/monsters"
    im.alpha_composite(Image.open(yd / "necro_lord_idle_anim_f0.png").convert("RGBA"), (330, 120))
    for x, y in ((300, 190), (360, 200), (318, 226)):
        im.alpha_composite(Image.open(yd / "skeleton_guard_idle_anim_f0.png").convert("RGBA"), (x, y))
    im.alpha_composite(Image.open(yd / "skeleton_archer_idle_anim_f1.png").convert("RGBA"), (390, 160))
    # small hp bars over units
    for x, y, f in ((170, 196, 0.8), (150, 166, 1), (300, 186, 0.5), (360, 196, 0.9)):
        fr = nine(a["bar_frame"], 3, 14, 4)
        im.alpha_composite(fr, (x + 1, y - 4))
        rect(im, x + 2, y - 3, x + 2 + int(11 * f), y - 2, FILLS["hp"][1] if x < 250 else FILLS["soul"][1])
    # vignette edges of the map well
    well = nine(a["panel_inset"], 4, mx1 - mx0, my1 - my0)
    mask = new(mx1 - mx0, my1 - my0)
    mask.alpha_composite(well)
    rect(mask, 4, 4, mask.width - 5, mask.height - 5, (0, 0, 0, 0))
    im.alpha_composite(mask, (mx0, my0))

    # --- top bar ---
    top = nine(a["panel_stone"], 8, W, 30)
    im.alpha_composite(top, (0, 0))
    rib = nine(a["ribbon"], 8, 120, 16)
    im.alpha_composite(rib, (6, 7))
    T(im, 66, 5, "YOUR DUNGEON?", GOLD[4], center=True)
    x = 140
    for k, val in (("gold", "700"), ("mana", "100/100"), ("souls", "45")):
        icon_src = {"gold": "coin_anim_f0", "mana": "flask_blue", "souls": "flask_green"}[k]
        im.alpha_composite(capsule(L(icon_src), 64), (x, 7))
        T(im, x + 18, 4, val)
        x += 70
    T(im, 360, 5, "TĨNH LẶNG TRƯỚC GIÔNG BÃO", PARCH[2])
    # primary button
    gb = nine(a["btn_gold_normal"], 5, 74, 22)
    im.alpha_composite(gb, (560, 4))
    T(im, 597, 4, "MỞ CỔNG", INK, shadow=GOLD[4], center=True)

    # --- left rail (floors as icon tabs) ---
    rail = nine(a["panel_stone"], 8, 52, Hh - 30 - 64)
    im.alpha_composite(rail, (0, 30))
    for i, (lab, on) in enumerate((("T1", True), ("T2", False))):
        b = nine(a["btn_hover" if on else "btn_normal"], 5, 36, 24)
        im.alpha_composite(b, (8, 40 + i * 30))
        T(im, 26, 41 + i * 30, lab, GOLD[4] if on else WHITE, center=True)
    for i, n in enumerate(["chest_full_open_anim_f0", "skull", "crate"]):
        b = nine(a["btn_normal"], 5, 36, 24)
        im.alpha_composite(b, (8, 110 + i * 30))
        im.alpha_composite(L(n), (18, 113 + i * 30))

    # --- right info drawer (parchment) ---
    dr = nine(a["panel_stone"], 8, 130, Hh - 30 - 64)
    im.alpha_composite(dr, (W - 130, 30))
    p = nine(a["panel_parchment"], 8, 114, 120)
    im.alpha_composite(p, (W - 122, 38))
    nec = Image.open(yd / "necro_lord_idle_anim_f0.png").convert("RGBA")
    im.alpha_composite(nec, (W - 116, 44))
    T(im, W - 80, 42, "KẺ CHIÊU HỒN", INK, shadow=None)
    T(im, W - 80, 54, "Tầng chủ · T1", c("#62232f"), shadow=None)
    hp = nine(a["bar_frame"], 3, 70, 8)
    im.alpha_composite(hp, (W - 80, 70))
    rect(im, W - 79, 71, W - 79 + 50, 74, FILLS["hp"][1])
    rect(im, W - 79, 71, W - 79 + 50, 71, FILLS["hp"][2])
    T(im, W - 116, 84, "Ấn: xương hồi sinh", INK, shadow=None)
    T(im, W - 116, 98, "Ấn: hồn ×1,5", INK, shadow=None)
    T(im, W - 116, 116, "4 chiêu · triệu hồi", c("#62232f"), shadow=None)
    # log
    T(im, W - 122, 166, "NHẬT KÝ", GOLD[3])
    for i, s in enumerate(("Kẻ Chiêu Hồn gọi xương!", "Hiệp sĩ chặn đòn.", "Bẫy gai kích hoạt.")):
        T(im, W - 122, 182 + i * 14, s, PARCH[2] if i else WHITE)

    # --- boss bar over the map ---
    bb = nine(a["boss_bar"], 14, 220, 16)
    im.alpha_composite(bb, (172, 36))
    rect(im, 183, 41, 183 + 150, 46, FILLS["soul"][1])
    rect(im, 183, 41, 183 + 150, 41, FILLS["soul"][2])
    T(im, 282, 46, "GIAI ĐOẠN 2", GOLD[4], center=True)

    # --- speed controls (inside the map, bottom right) ---
    for i, n in enumerate(("pause", "speed1", "speed2", "speed4")):
        b = nine(a["btn_pressed" if n == "speed1" else "btn_normal"], 5, 22, 20)
        im.alpha_composite(b, (414 + i * 23, 266))
        im.alpha_composite(a[f"icon_{n}"], (417 + i * 23, 268))

    # --- card hand (bottom) ---
    hand = nine(a["panel_stone"], 8, W, 66)
    im.alpha_composite(hand, (0, Hh - 66))
    for i, (tn, on) in enumerate((("Tất cả", True), ("Phòng", False), ("Cư dân", False), ("Bẫy", False))):
        t = nine(a["tab_on" if on else "tab_off"], 4, 44, 14)
        im.alpha_composite(t, (340 + i * 46, Hh - 60))
        T(im, 362 + i * 46, Hh - 62, tn, GOLD[4] if on else PARCH[1], center=True, shadow=None)
    cards = [("room", "Đại sảnh", "chest_full_open_anim_f0", "5"), ("resident", "Doanh trại", "goblin_idle_anim_f0", "5"),
             ("trap", "Bẫy gai", "floor_spikes_anim_f3", "3"), ("barrel", "Thùng nổ", "crate", "2"),
             ("elite", "Tinh anh", "big_zombie_idle_anim_f0", "8"), ("resident", "Cung xương", None, "4")]
    for i, (cat, name, art, cost) in enumerate(cards):
        x0 = 8 + i * 54
        y0 = Hh - 60 + (0 if i != 1 else -6)   # hovered card lifts
        im.alpha_composite(a[f"card_{cat}"], (x0, y0))
        sp = L(art) if art else Image.open(yd / "skeleton_archer_idle_anim_f0.png").convert("RGBA")
        sp.thumbnail((24, 24), Image.NEAREST)
        im.alpha_composite(sp, (x0 + 26 - sp.width // 2, y0 + 23 - sp.height // 2))
        T(im, x0 + 26, y0 + 35, name, WHITE, center=True)
        T(im, x0 + 9, y0 - 3, cost, WHITE)
    T(im, 340, Hh - 40, "Kéo thẻ vào bản đồ để đặt", PARCH[1], shadow=None)
    T(im, 340, Hh - 26, "SPACE tạm dừng · 1/2/3 camera", PARCH[1], shadow=None)

    big = im.resize((W * 2, Hh * 2), Image.NEAREST)
    big.save(ROOT / "art/MOCKUP-HUD-v1.png")


if __name__ == "__main__":
    A = build()
    sheet(A)
    mockup(A)
    print("kit:", len(A))
