#!/usr/bin/env python3
"""
Build web assets for the portfolio.

Reads the original photos, renders, GIFs and videos from
    projects_assets/                         (private, git-ignored)
and writes optimised web versions into
    assets/img/<project>/                    (published)

Images  -> WebP, resized, quality 80
GIFs    -> muted looping MP4 (an order of magnitude smaller than the GIF)
Videos  -> trimmed, optionally sped up, scaled, CRF-encoded, audio stripped
Posters -> a WebP still for every clip, used before playback and for
           visitors who have asked for reduced motion

Re-run after adding new source material:
    python tools/build-assets.py
"""

import os
import shutil
import subprocess
import sys
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "projects_assets")
OUT = os.path.join(ROOT, "assets", "img")

FFMPEG = shutil.which("ffmpeg") or "ffmpeg"


# --------------------------------------------------------------------------
# images
# --------------------------------------------------------------------------
def img(src, dest, width, quality=80, crop=None):
    """Resize to `width` and save as WebP. `crop` is (l, t, r, b) in fractions."""
    s = os.path.join(SRC, src)
    d = os.path.join(OUT, dest)
    if not os.path.exists(s):
        print(f"  !! missing source: {src}")
        return
    os.makedirs(os.path.dirname(d), exist_ok=True)
    im = Image.open(s)
    if getattr(im, "is_animated", False):
        im.seek(0)
    im = im.convert("RGB")
    if crop:
        w, h = im.size
        im = im.crop((int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h)))
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(d, "WEBP", quality=quality, method=6)
    print(f"  {dest:38} {im.size[0]}x{im.size[1]}  {os.path.getsize(d)//1024} KB")


# --------------------------------------------------------------------------
# video / gif
# --------------------------------------------------------------------------
def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("   ffmpeg error:", r.stderr.strip().splitlines()[-1] if r.stderr else "?")
        return False
    return True


def vid(src, dest, width=1100, ss=None, t=None, speed=1.0, crf=32, fps=24, poster_at=0.3):
    """Transcode a video or GIF into a small muted MP4 plus a WebP poster."""
    s = os.path.join(SRC, src)
    d = os.path.join(OUT, dest)
    if not os.path.exists(s):
        print(f"  !! missing source: {src}")
        return
    os.makedirs(os.path.dirname(d), exist_ok=True)

    vf = []
    if speed != 1.0:
        vf.append(f"setpts=PTS/{speed}")
    vf.append(f"scale={width}:-2:flags=lanczos")
    vf.append(f"fps={fps}")
    chain = ",".join(vf)

    cmd = [FFMPEG, "-v", "error", "-y"]
    if ss is not None:
        cmd += ["-ss", str(ss)]
    cmd += ["-i", s]
    if t is not None:
        cmd += ["-t", str(t)]
    cmd += ["-an", "-vf", chain, "-c:v", "libx264", "-profile:v", "main",
            "-pix_fmt", "yuv420p", "-crf", str(crf), "-preset", "slow",
            "-movflags", "+faststart", d]
    if not run(cmd):
        return

    # poster frame
    pos = os.path.splitext(d)[0] + "-poster.webp"
    pcmd = [FFMPEG, "-v", "error", "-y", "-ss", str(poster_at), "-i", d,
            "-frames:v", "1", "-vf", f"scale={width}:-2", "-quality", "78", pos]
    run(pcmd)
    print(f"  {dest:38} {os.path.getsize(d)//1024} KB  (+poster {os.path.getsize(pos)//1024} KB)"
          if os.path.exists(pos) else f"  {dest:38} {os.path.getsize(d)//1024} KB")


def frame(src, dest, at, width=1100):
    """Pull a single still out of a video and save it as WebP."""
    s = os.path.join(SRC, src)
    d = os.path.join(OUT, dest)
    os.makedirs(os.path.dirname(d), exist_ok=True)
    if run([FFMPEG, "-v", "error", "-y", "-ss", str(at), "-i", s, "-frames:v", "1",
            "-vf", f"scale={width}:-2", "-quality", "80", d]):
        print(f"  {dest:38} {os.path.getsize(d)//1024} KB")


# --------------------------------------------------------------------------
def main():
    if not os.path.isdir(SRC):
        sys.exit(f"Source folder not found: {SRC}")

    print("\nAIfred")
    img("aifred/AIfredBestFriend.png", "aifred/hero.webp", 1500)
    img("aifred/hardware-setup.png", "aifred/setup.webp", 1500)
    img("aifred/HardwareSetup.png", "aifred/arm.webp", 820)
    img("aifred/interaction-modes.png", "aifred/modes.webp", 1800, quality=82)
    img("aifred/alfred-sketch.png", "aifred/sketch.webp", 1300)
    img("aifred/draw-input.png", "aifred/draw-in.webp", 640)
    img("aifred/draw-output.png", "aifred/draw-out.webp", 640)
    img("aifred/generate-input.png", "aifred/gen-in.webp", 640)
    img("aifred/generate-output.png", "aifred/gen-out.webp", 640)
    vid("aifred/math_demo.mp4", "aifred/demo-math.mp4", 1040, ss=9, t=26, speed=1.8)
    vid("aifred/draw_demo.mp4", "aifred/demo-draw.mp4", 1040, ss=4, t=44, speed=2.8)
    vid("aifred/generateimage_demo.mp4", "aifred/demo-generate.mp4", 1040, ss=2, t=20, speed=1.6)

    print("\nBotzo")
    img("botzo/BOTZO_BEAUTY.jpeg", "botzo/hero.webp", 1100)
    img("botzo/botzo_new_final_design.png", "botzo/design.webp", 1100)
    img("botzo/botzo_description.png", "botzo/joints.webp", 1100)
    img("botzo/IK_trigonometrics_drawing_side.png", "botzo/ik.webp", 1500)
    img("botzo/legs_view.png", "botzo/legs.webp", 1300)
    img("botzo/basic_circuit_scketch.png", "botzo/circuit.webp", 1200)
    vid("botzo/walking.gif", "botzo/walking.mp4", 300, crf=34, fps=18)   # 240px source: do not upscale
    vid("botzo/isaaclab.gif", "botzo/isaac.mp4", 1200, crf=33)
    vid("botzo/digital_twin_botzo_urdf.gif", "botzo/twin.mp4", 800, crf=31)
    vid("botzo/FULL_LEG.gif", "botzo/leg.mp4", 1000, crf=31)

    print("\nPolyWall")
    img("polywall/system_overview/system_overview.png", "polywall/pipeline.webp", 1800, quality=82)
    img("polywall/result/D1_rviz.png", "polywall/before.webp", 900)
    img("polywall/result/D1_our.png", "polywall/after.webp", 900)
    img("polywall/result/D2_rviz.png", "polywall/d2-before.webp", 760)
    img("polywall/result/D2_our.png", "polywall/d2-after.webp", 760)
    img("polywall/result/D3_our.png", "polywall/d3-after.webp", 760)
    img("polywall/ablation/A_groundtruth.png", "polywall/truth.webp", 760)
    img("sgraphs/runningsgraphs.png", "polywall/sgraphs.webp", 1300)

    print("\nMinotauro")
    img("minotauro/final.jpeg", "minotauro/hero.webp", 1200)
    img("minotauro/flames.jpeg", "minotauro/flames.webp", 800)
    img("minotauro/weight.jpeg", "minotauro/weight.webp", 800)
    img("minotauro/venue.jpeg", "minotauro/team.webp", 1000)
    img("minotauro/build3.jpeg", "minotauro/build.webp", 1000)
    img("minotauro/robots3.jpeg", "minotauro/field.webp", 1000)
    vid("minotauro/royalrumble.mp4", "minotauro/arena.mp4", 800, crf=30)
    vid("minotauro/bigfail.mp4", "minotauro/fail.mp4", 560, crf=30)

    print("\nOther projects")
    img("wallfollowercar/CarStructure.jpg", "other/wallfollower.webp", 800)
    vid("wallfollowercar/demo.mp4", "other/wallfollower.mp4", 560, crf=31)
    img("autobin/CircuitDiagram.png", "other/autobin-circuit.webp", 800)
    vid("autobin/demo.mp4", "other/autobin.mp4", 560, ss=1, t=12, crf=31)
    vid("alllenguage/DemoMain (1).mp4", "other/translator.mp4", 960, ss=20, t=26, speed=1.6, crf=33)
    frame("2048game/Presentation.mp4", "other/2048.webp", 60, 900)

    print("\nPersonal")
    img("me/ski.png", "gallery/ski.webp", 900)
    img("me/ski2.png", "gallery/ski2.webp", 1100)
    img("me/downhill.png", "gallery/downhill.webp", 1100)
    img("me/motocross.png", "gallery/motocross.webp", 1100)
    img("me/wakeboard.png", "gallery/wakeboard.webp", 1100)
    img("cyphylife/labrobots.jpg", "gallery/lab.webp", 1200)

    total = sum(
        os.path.getsize(os.path.join(dp, f))
        for dp, _, fs in os.walk(OUT) for f in fs
    )
    print(f"\nTotal published image/video weight: {total/1024/1024:.1f} MB")


if __name__ == "__main__":
    main()
