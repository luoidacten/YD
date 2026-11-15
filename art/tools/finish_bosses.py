"""Clean up Gemini bosses/creatures pulled with __ydm (mode sampling): lift the near-black fill inside the
silhouette to a readable tone, fix off colors, then draw a fresh 1px #222222 outline (0x72 style).
Run: python art/tools/finish_bosses.py  -> art/final/monsters/<id>.png
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "art" / "gemini-raw"
OUT = ROOT / "art" / "final" / "monsters"
DARK = {"#140c11", "#1d1218", "#21141b", "#23151d", "#111111", "#222222"}


def h(x):
    x = x.lstrip("#")
    return tuple(int(x[i:i + 2], 16) for i in (0, 2, 4))


JOBS = {
    # id: (raw path, interior dark -> color, extra recolor)
    "necro_lord": ("bosses/v1/necro_lord.png", "#38262d",
                   {"#38262d": "#5f2d56", "#72d6ce": "#97da3f", "#49a790": "#4ba747", "#55a894": "#4ba747",
                    "#f78697": "#97da3f", "#3c9f9c": "#4ba747"}),
    "spider_queen": ("bosses/v1/spider_queen.png", "#2a2a3a", {"#2a2a3a": "#414859", "#414859": "#5956bd"}),
    "frost_witch": ("bosses/v1/frost_witch.png", "#38607c", {}),
    "orc_warlord": ("bosses/v1/orc_warlord.png", "#2b2929", {"#2a2a3a": "#414859", "#38262d": "#62232f"}),
    "death_knight": ("bosses/v2/death_knight.png", "#2a2a3a", {"#2a2a3a": "#414859", "#414859": "#7b8994"}),
    "bone_king": ("bosses/v2/bone_king.png", "#38262d", {"#1f1833": "#38262d", "#2a2a3a": "#5f2d56"}),
    # creatures and pets
    "bone_hound": ("creatures/v1/bone_hound.png", "#aa8d7a", {}),
    "bone_giant": ("creatures/v1/bone_giant.png", "#775c55", {}),
    "wolf_pet": ("creatures/v1/wolf_pet.png", "#414859", {}),
    "hawk": ("creatures/v1/hawk.png", "#62232f", {}),
    "druid_bear": ("creatures/v1/druid_bear.png", "#62232f", {}),
}


def finish(src, fill, extra):
    im = Image.open(src).convert("RGBA")
    im = im.crop(im.getbbox())
    w, hgt = im.size
    out = Image.new("RGBA", (w + 2, hgt + 2), (0, 0, 0, 0))
    out.alpha_composite(im, (1, 1))
    px = out.load()
    W, H = out.size
    solid = lambda x, y: 0 <= x < W and 0 <= y < H and px[x, y][3] > 0  # noqa: E731
    ex = {h(k): h(v) for k, v in extra.items()}
    dark = {h(k) for k in DARK}
    new = out.copy()
    q = new.load()
    for y in range(H):
        for x in range(W):
            p = px[x, y]
            if not p[3]:
                continue
            edge = not all(solid(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            c = p[:3]
            if c in dark:
                c = h("#222222") if edge else h(fill)
            elif c in ex:
                c = ex[c]
            q[x, y] = (*c, 255)
    # fresh outline outside the silhouette
    for y in range(H):
        for x in range(W):
            if not px[x, y][3] and any(solid(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                q[x, y] = (*h("#222222"), 255)
    return new


def main(jobs=JOBS):
    OUT.mkdir(parents=True, exist_ok=True)
    for cid, (src, fill, extra) in jobs.items():
        im = finish(RAW / src, fill, extra)
        im.save(OUT / f"{cid}.png")
        print(cid, im.size)


# hand touch-ups after finishing (applied by main_touchups)
MASKS = {
    # necro_lord: white skull mask with green eyes inside the hood (facing right)
    "necro_lord": (14, 6, [".WWW.", "WWWWS", "WgWgS", "WWWWS", ".WkW."]),
    # bone_king: skull face under the crown, red eyes
    "bone_king": (15, 7, ["WWWWWS", "WrWWrS", "WWWWWS", ".WkWk."]),
}
MCOL = {"W": "#fdf7ed", "S": "#d3bfa9", "g": "#97da3f", "k": "#222222", "r": "#da4e38"}


def touchups():
    for cid, (ox, oy, rows) in MASKS.items():
        p = OUT / f"{cid}.png"
        im = Image.open(p).convert("RGBA")
        px = im.load()
        for y, row in enumerate(rows):
            for x, ch in enumerate(row):
                if ch != ".":
                    px[ox + x, oy + y] = (*h(MCOL[ch]), 255)
        im.save(p)
        print("touchup", cid)


if __name__ == "__main__":
    main()
    touchups()
