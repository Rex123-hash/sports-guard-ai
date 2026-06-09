"""
Keyframe extraction by invoking the bundled ffmpeg binary directly.

ffmpeg decodes real-world videos (variable frame rate, phone/screen-capture,
odd codecs) reliably; the fragile part was always the Python-side metadata
PARSING, which we avoid here entirely. We ask ffmpeg to write evenly-spaced
sample frames as JPEGs and load them with Pillow.

Notes:
- We do NOT treat a non-zero ffmpeg exit as fatal: ffmpeg frequently returns a
  non-zero code after still writing perfectly good frames. We use whatever
  frames it produced and only raise if it produced none (surfacing ffmpeg's
  stderr so the failure is diagnosable).
- `-an` drops audio so audio-codec quirks can't break frame extraction.
"""
import os
import glob
import shutil
import tempfile
import subprocess
import imageio_ffmpeg
from PIL import Image


def extract_keyframes(video_path, every_seconds=0.5, max_frames=80):
    """Return [(timestamp_seconds, PIL.Image)] sampled across the video."""
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    fps_sample = max(0.1, 1.0 / every_seconds)  # frames per second to pull
    outdir = tempfile.mkdtemp(prefix="sgframes_")
    try:
        pattern = os.path.join(outdir, "f_%04d.jpg")
        cmd = [
            ffmpeg, "-nostdin", "-loglevel", "error", "-y",
            "-i", video_path,
            "-an",                      # ignore audio
            "-vf", f"fps={fps_sample}",
            "-frames:v", str(max_frames),
            "-q:v", "3",
            pattern,
        ]
        proc = subprocess.run(
            cmd, timeout=150,
            stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
        )

        files = sorted(glob.glob(os.path.join(outdir, "f_*.jpg")))[:max_frames]
        if not files:
            err = (proc.stderr or b"").decode("utf-8", "ignore").strip()
            tail = err[-300:] if err else f"ffmpeg exit {proc.returncode}, no output"
            raise RuntimeError(f"ffmpeg could not extract frames: {tail}")

        frames = []
        for idx, fp in enumerate(files):
            with Image.open(fp) as im:
                frames.append((round(idx * every_seconds, 2), im.convert("RGB").copy()))
        return frames
    finally:
        shutil.rmtree(outdir, ignore_errors=True)
