"""Room-master decor (v0.9): throne + aura banners + rug, drawn pixel by pixel in the 0x72 palette.
Run: python art/tools/master_decor.py -> dist/assets/frames/yd/tiles/master/*.png
"""
from pathlib import Path
from PIL import Image
OUT = Path(__file__).resolve().parents[2] / "dist/assets/frames/yd/tiles/master"
def h(x): return tuple(int(x.lstrip('#')[i:i+2], 16) for i in (0, 2, 4)) + (255,)
K = h('#222222')
def draw(rows, pal):
    w, hh = max(map(len, rows)), len(rows)
    im = Image.new('RGBA', (w, hh), (0, 0, 0, 0))
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            if c != '.': im.putpixel((x, y), h(pal[c]) if c in pal else K)
    return im
THRONE = ["...kkkkkkkk...", "..kYyyyyyyYk..", "..kyRRRRRRyk..", "..kyRrrrrRyk..", "..kyRrrrrRyk..",
          "..kyRrrrrRyk..", "..kyRRRRRRyk..", "kkkSSSSSSSSkkk", "kSSsssssssssSk", "kSsRRRRRRRRsSk",
          "kSsRrrrrrrRsSk", "kSsRRRRRRRRsSk", "kSSSSSSSSSSSSk", "kSs.kSSSSk.sSk", "kSs.k....k.sSk", "kkk.k....k.kkk"]
TP = {'Y': '#facb3e', 'y': '#ee8e2e', 'R': '#9b1a0a', 'r': '#da4e38', 'S': '#545454', 's': '#7b8994'}
BANNER = ["kkkkkkkkkk", "kYYYYYYYYk", "kCCCCCCCCk", "kCcccccCCk", "kCcYYYcCCk", "kCcYkYcCCk", "kCcYYYcCCk",
          "kCcccccCCk", "kCCCCCCCCk", "kCCCCCCCCk", "kCcCCCCcCk", "kCCcCCcCCk", "kCCCccCCCk", "kCCCCCCCCk",
          ".kCCCCCCk.", "..kCCCCk..", "...kCCk...", "....kk...."]
COLORS = {'red': ('#9b1a0a', '#da4e38'), 'blue': ('#38607c', '#5698cc'), 'green': ('#3d734f', '#4ba747'),
          'purple': ('#5f2d56', '#9a7bd1')}
RUG = ["kkkkkkkkkkkkkkkk"] + ["kYRRRRRRRRRRRRYk", "kRrrrrrrrrrrrrRk"] * 7 + ["kYRRRRRRRRRRRRYk", "kkkkkkkkkkkkkkkk"]
if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    draw(THRONE, TP).save(OUT / 'master_throne.png')
    for n, (d, l) in COLORS.items():
        draw(BANNER, {'Y': '#facb3e', 'C': d, 'c': l}).save(OUT / f'master_banner_{n}.png')
    draw(RUG, {'Y': '#facb3e', 'R': '#9b1a0a', 'r': '#62232f'}).save(OUT / 'master_rug.png')
    print('ok')
