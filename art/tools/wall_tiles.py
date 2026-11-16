"""Custom room wall tiles (v0.4): hedge (passable, blocks sight) and low fence (blocks movement, not sight).
Run: python art/tools/wall_tiles.py -> dist/assets/frames/yd/tiles/walls/{hedge,fence}.png"""
from pathlib import Path
from PIL import Image
OUT = Path(__file__).resolve().parents[2] / "dist/assets/frames/yd/tiles/walls"
P = {"k": "#222222", "G": "#3d734f", "g": "#4ba747", "L": "#97da3f", "d": "#243f4c", "b": "#8a503e", "B": "#c38d70", "o": "#62232f"}
HEDGE = ["....kkkkkkkk....", "..kkgLggLgggkk..", ".kgLgggGggLgggk.", "kgggGgLgggGgLggk", "kgLgggGgLgggGggk",
         "kGgggLgggGgLgggk", "kggLgGggLgggGgLk", "kgGggggLgggGgggk", "kgggLgGgggLggGgk", "kGgLgggGgLgggLgk",
         "kggggLgggGgggGgk", "kgLgGgggLgggLggk", ".kGgggLgGgggGgk.", ".kdGGGGGGGGGGGdk", "..kkkkkkkkkkkkk.", "................"]
FENCE = ["................", "................", "................", "..kk......kk....", ".kBBk....kBBk...",
         ".kBbk....kBbk...", "kkkkkkkkkkkkkkkk", "kBBBBBBBBBBBBBBk", "kbbbbbbbbbbbbbbk", "kkkkkkkkkkkkkkkk",
         ".kBbk....kBbk...", ".kBbk....kBbk...", "kkkkkkkkkkkkkkkk", "kBBBBBBBBBBBBBBk", "kobbbbbbbbbbbbok", "kkkkkkkkkkkkkkkk"]
def draw(rows):
    im = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    for y, r in enumerate(rows):
        for x, c in enumerate(r[:16]):
            if c in P:
                h = P[c].lstrip("#"); im.putpixel((x, y), (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255))
    return im
if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    draw(HEDGE).save(OUT / "hedge.png"); draw(FENCE).save(OUT / "fence.png"); print("ok")
