"""Build reference sheets for Gemini from the original 0x72 frames.

Usage (run from your-dungeon/):  python art/tools/build_reference.py
Writes:
  art/reference/palette.png        - every opaque color of the pack, 1 swatch each
  art/reference/palette.txt        - same colors as hex (used by pixelize.py)
  art/reference/sheet_heroes.png   - heroes/monsters x8, on a gray background
  art/reference/sheet_weapons.png  - weapons x8
  art/reference/sheet_items.png    - flasks/coin/chest/skull/heart x8
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
FRAMES = ROOT / "dist" / "assets" / "frames"
OUT = ROOT / "art" / "reference"
OUT.mkdir(parents=True, exist_ok=True)
BG = (64, 58, 66, 255)
SCALE = 8


def opaque_colors(img):
    return {p[:3] for p in img.convert("RGBA").getdata() if p[3] > 0}


def sheet(names, path, cols=8):
    imgs = [Image.open(FRAMES / n).convert("RGBA") for n in names if (FRAMES / n).exists()]
    cw = max(i.width for i in imgs) + 4
    ch = max(i.height for i in imgs) + 4
    rows = (len(imgs) + cols - 1) // cols
    canvas = Image.new("RGBA", (cols * cw, rows * ch), BG)
    for k, im in enumerate(imgs):
        x = (k % cols) * cw + (cw - im.width) // 2
        y = (k // cols) * ch + (ch - im.height)  # feet on one baseline
        canvas.alpha_composite(im, (x, y - 2))
    canvas = canvas.resize((canvas.width * SCALE, canvas.height * SCALE), Image.NEAREST)
    canvas.save(path)
    print("wrote", path.relative_to(ROOT), canvas.size)


def main():
    colors = set()
    for f in FRAMES.glob("*.png"):
        colors |= opaque_colors(Image.open(f))
    colors = sorted(colors, key=lambda c: (sum(c), c))
    (OUT / "palette.txt").write_text("\n".join("#%02x%02x%02x" % c for c in colors) + "\n")
    sw = 16
    cols = 16
    pal = Image.new("RGB", (cols * sw, ((len(colors) + cols - 1) // cols) * sw), (0, 0, 0))
    for k, c in enumerate(colors):
        x, y = (k % cols) * sw, (k // cols) * sw
        pal.paste(c, (x, y, x + sw, y + sw))
    pal.save(OUT / "palette.png")
    print("palette colors:", len(colors))

    heroes = ["knight_m", "knight_f", "elf_m", "elf_f", "wizzard_m", "wizzard_f", "dwarf_m", "dwarf_f",
              "goblin", "skelet", "orc_warrior", "orc_shaman", "lizard_m", "imp", "chort", "angel"]
    sheet([f"{h}_idle_anim_f0.png" for h in heroes], OUT / "sheet_heroes.png")
    weapons = sorted(p.name for p in FRAMES.glob("weapon_*.png"))
    sheet(weapons, OUT / "sheet_weapons.png", cols=10)
    items = ["flask_big_red.png", "flask_big_blue.png", "flask_big_green.png", "flask_big_yellow.png",
             "flask_red.png", "coin_anim_f0.png", "skull.png", "ui_heart_full.png", "ui_heart_half.png",
             "chest_full_open_anim_f0.png", "crate.png", "bomb_f0.png"]
    sheet(items, OUT / "sheet_items.png", cols=6)


if __name__ == "__main__":
    main()
