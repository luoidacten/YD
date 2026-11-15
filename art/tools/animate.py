"""Light animations in the 0x72 style from a single still frame.

Characters (copy the 0x72 knight/goblin pattern):
  idle 4 frames: upper body squashes down 0,1,2,1 px, feet (the bottom LEG rows) stay put.
  run  4 frames: upper body bobs up 1,2,1,0 px; legs alternate (f1 left foot forward and right foot lifted, f3 the reverse).
  python art/tools/animate.py char base.png out_dir/name [--legs 3] [--float]
  --float: floating creatures (ghost, fire elemental): the whole body bobs 0,1,2,1 and the shadow/tail flickers.
  Writes name_idle_anim_f0..3.png, name_run_anim_f0..3.png (same naming as 0x72).

Effects (spells, 4-frame loop):
  python art/tools/animate.py fx base.png out_dir/name --mode pulse|spin|flicker|rise
  pulse: scale 100/90/80/90% around the center (heal, shield)
  spin: rotate 0/90/180/270 (fireball, shuriken, magic orb)
  flicker: swap highlight/shadow colors along the palette ramp + jitter 1px (flame, lightning)
  rise: shift up 0..3 px and fade the bottom edge (poison cloud, smoke)
  Writes name_anim_f0..3.png
"""
import sys
from pathlib import Path
from PIL import Image


def shift_upper(img, legs, dy):
    """Move the part above the legs by dy (positive = down, squash: rows overlapping the legs are covered by the body)."""
    w, h = img.size
    cut = h - legs
    body = img.crop((0, 0, w, cut))
    feet = img.crop((0, cut, w, h))
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.alpha_composite(feet, (0, cut))
    if dy >= 0:
        # squash: drop the top rows of the body by dy, keep the bottom of the body above the feet
        bb = body.getbbox()
        if bb and dy:
            top = bb[1]
            part = body.crop((0, top, w, cut))
            # delete dy rows at the lower torso (just above the legs): the head moves down whole, keeping the face
            mid = cut - 1 - dy
            a = body.crop((0, top, w, mid))
            b = body.crop((0, mid + dy, w, cut))
            out.alpha_composite(b, (0, cut - b.height))
            out.alpha_composite(a, (0, cut - b.height - a.height))
            return out
        out.alpha_composite(body, (0, 0))
    else:
        # bob up: body moves up, the gap above the feet is filled by stretching the bottom row of the body
        out.alpha_composite(body, (0, dy))
        row = body.crop((0, cut - 1, w, cut))
        for k in range(-dy):
            out.alpha_composite(row, (0, cut - 1 - k))
        out.alpha_composite(body, (0, dy))
    return out


def leg_pose(img, legs, phase):
    """phase 0: normal, 1: left foot forward/right foot lifted, 2: normal, 3: reverse."""
    if phase in (0, 2):
        return img
    w, h = img.size
    cut = h - legs
    feet = img.crop((0, cut, w, h))
    bb = feet.getbbox()
    if not bb:
        return img
    midx = (bb[0] + bb[2]) // 2
    left = feet.crop((0, 0, midx, legs))
    right = feet.crop((midx, 0, w, legs))
    out = img.copy()
    out.paste((0, 0, 0, 0), (0, cut, w, h))
    if phase == 1:
        out.alpha_composite(left, (-1, cut))
        out.alpha_composite(right.crop((0, 0, right.width, legs - 1)), (midx, cut))
    else:
        out.alpha_composite(left.crop((0, 0, left.width, legs - 1)), (0, cut))
        out.alpha_composite(right, (midx + 1, cut))
    return out


def char(base, out, legs=3, floating=False):
    img = Image.open(base).convert("RGBA")
    bb = img.getbbox()
    if bb and bb[1] < 2:  # need 2px headroom so the bob up is not clipped
        pad = Image.new("RGBA", (img.width, img.height + 2 - bb[1]), (0, 0, 0, 0))
        pad.alpha_composite(img, (0, 2 - bb[1]))
        img = pad
    out = Path(out)
    out.parent.mkdir(parents=True, exist_ok=True)
    w, h = img.size
    if floating:
        frames = []
        for dy in (0, -1, -2, -1):
            f = Image.new("RGBA", (w, h), (0, 0, 0, 0))
            f.alpha_composite(img, (0, dy))
            frames.append(f)
        idle = run = frames
    else:
        idle = [shift_upper(img, legs, d) for d in (0, 1, 2, 1)]
        run = [leg_pose(shift_upper(img, legs, d), legs, p) for d, p in ((-1, 1), (-2, 2), (-1, 3), (0, 0))]
    for i, f in enumerate(idle):
        f.save(f"{out}_idle_anim_f{i}.png")
    for i, f in enumerate(run):
        f.save(f"{out}_run_anim_f{i}.png")
    strip(idle + run, f"{out}_preview.png")


def ramp_swap(img):
    """Brighten each pixel to the next lighter color it already uses (palette-safe flicker)."""
    cols = sorted({p[:3] for p in img.getdata() if p[3]}, key=sum)
    nxt = {c: cols[min(i + 1, len(cols) - 1)] for i, c in enumerate(cols)}
    out = img.copy()
    out.putdata([(*nxt[p[:3]], p[3]) if p[3] else p for p in img.getdata()])
    return out


def fx(base, out, mode):
    img = Image.open(base).convert("RGBA")
    w, h = img.size
    frames = []
    for i in range(4):
        f = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        if mode == "spin":
            f.alpha_composite(img.rotate(-90 * i, resample=Image.NEAREST))
        elif mode == "pulse":
            s = (1, .9, .8, .9)[i]
            sw, sh = max(1, round(w * s)), max(1, round(h * s))
            f.alpha_composite(img.resize((sw, sh), Image.NEAREST), ((w - sw) // 2, (h - sh) // 2))
        elif mode == "flicker":
            src = ramp_swap(img) if i % 2 else img
            f.alpha_composite(src, ((0, 1, 0, -1)[i], (0, 0, -1, 0)[i]))
        elif mode == "rise":
            f.alpha_composite(img, (0, -i))
            if i:
                f.paste((0, 0, 0, 0), (0, h - i, w, h))
        frames.append(f)
    for i, f in enumerate(frames):
        f.save(f"{out}_anim_f{i}.png")
    strip(frames, f"{out}_preview.png")


def strip(frames, path, scale=6):
    w, h = frames[0].size
    s = Image.new("RGBA", (len(frames) * (w + 2) * scale, h * scale), (64, 58, 66, 255))
    for i, f in enumerate(frames):
        s.alpha_composite(f.resize((w * scale, h * scale), Image.NEAREST), (i * (w + 2) * scale, 0))
    s.save(path)


if __name__ == "__main__":
    kind, base, out = sys.argv[1:4]
    args = sys.argv[4:]
    if kind == "char":
        legs = int(args[args.index("--legs") + 1]) if "--legs" in args else 3
        char(base, out, legs, "--float" in args)
    else:
        fx(base, out, args[args.index("--mode") + 1] if "--mode" in args else "pulse")


# ---------------- attack animation (v0.5) ----------------
SPARK = [(250, 203, 62), (253, 247, 237), (114, 214, 206)]


def _shift(img, dx, dy=0):
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    out.paste(img, (dx, dy), img)
    return out


def _spark(img, size, color):
    """Draw a small sparkle above the head (cast)."""
    out = img.copy()
    bb = img.getbbox()
    if not bb:
        return out
    px = out.load()
    cx = (bb[0] + bb[2]) // 2 + 2
    cy = max(0, bb[1] - 2)
    pts = [(0, 0)] if size == 1 else [(0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)]
    for dx, dy in pts:
        x, y = cx + dx, cy + dy
        if 0 <= x < out.width and 0 <= y < out.height:
            px[x, y] = (*color, 255)
    return out


def attack(base, out, kind="melee", legs=3):
    """4 frames, facing right like 0x72. melee: wind up/lunge; cast: squash then stretch with sparkle; shoot: recoil."""
    img = Image.open(base).convert("RGBA")
    # 2px headroom for the sparkle or the stretch
    bb = img.getbbox()
    if bb and bb[1] < 3:
        pad = Image.new("RGBA", (img.width, img.height + 3 - bb[1]), (0, 0, 0, 0))
        pad.alpha_composite(img, (0, 3 - bb[1]))
        img = pad
    if kind == "melee":
        frames = [_shift(shift_upper(img, legs, 1), -1) if legs else _shift(img, -1),
                  _shift(shift_upper(img, legs, -1), 2) if legs else _shift(img, 2),
                  _shift(img, 1), img]
    elif kind == "cast":
        frames = [shift_upper(img, legs, 1) if legs else img,
                  _spark(shift_upper(img, legs, -1) if legs else img, 1, SPARK[0]),
                  _spark(shift_upper(img, legs, -1) if legs else img, 2, SPARK[1]),
                  img]
    else:  # shoot
        frames = [img, _shift(img, -1), _shift(img, -1), img]
    out = Path(out)
    out.parent.mkdir(parents=True, exist_ok=True)
    for i, f in enumerate(frames):
        f.save(f"{out}_attack_anim_f{i}.png")
    return frames
