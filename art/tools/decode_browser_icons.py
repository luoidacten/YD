"""Decode icons pulled from the browser (run-length coded palette-index string) into PNGs.

The in-browser script crops each icon from a Gemini sheet, BOX-averages it to NxN,
maps every pixel to the nearest color in art/reference/palette.txt, then writes
'<count><char>' runs; '.' = transparent, icons separated by '|'.
Usage: python art/tools/decode_browser_icons.py data.txt out_dir name1,name2,... [--size 32|24x52] [--half]
"""
import re
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
CH = "".join(chr(k) for k in range(40, 127) if chr(k) not in "\\." and not chr(k).isdigit())


def main():
    data = Path(sys.argv[1]).read_text().strip()
    out = Path(sys.argv[2])
    names = sys.argv[3].split(",")
    size = sys.argv[sys.argv.index("--size") + 1] if "--size" in sys.argv else "32"
    W, H = (map(int, size.lower().split("x")) if "x" in size.lower() else (int(size), int(size)))
    half = "--half" in sys.argv
    pal = []
    for h in (ROOT / "art/reference/palette.txt").read_text().split():
        h = h.lstrip("#")
        pal.append(tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)))
    out.mkdir(parents=True, exist_ok=True)
    chunks = data.split("|")
    assert len(chunks) == len(names), (len(chunks), len(names))
    for name, chunk in zip(names, chunks):
        px = []
        for count, ch in re.findall(r"(\d*)(\D)", chunk):
            px += [ch] * (int(count) if count else 1)
        if len(px) != W * H:
            print(f"warning: {name} has {len(px)} px, expected {W * H}; padding/truncating at the end")
            px = (px + ['.'] * W * H)[:W * H]
        img = Image.new("RGBA", (W, H))
        img.putdata([(0, 0, 0, 0) if c == "." else (*pal[CH.index(c)], 255) for c in px])
        img.save(out / f"{name}.png")
        img.resize((W * 8, H * 8), Image.NEAREST).save(out / f"{name}_x8.png")
        print("wrote", out / f"{name}.png")
        if half:
            # exact 2x -> 1x by majority color, keep the shared scale between items, crop to content
            sys.path.insert(0, str(Path(__file__).parent))
            import pixelize
            small = pixelize.mode_resize(img, W // 2, H // 2)
            small = pixelize.quantize(small, pal, 14)
            bb = small.getbbox()
            fin = out / "1x"
            fin.mkdir(exist_ok=True)
            small.crop(bb).save(fin / f"{name}.png")


if __name__ == "__main__":
    main()
