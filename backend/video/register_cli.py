"""
Fingerprint a video for ASSET REGISTRATION (protect a whole clip).

Extracts keyframes, hashes each, drops near-identical consecutive frames so the
stored hash set stays compact, and returns a representative thumbnail.

Output (STDOUT, pure JSON):
  { "frameCount": int, "frameHashes": [hex,...], "thumbB64": "<jpeg base64>" }
  or { "error": "..." }
"""
import sys
import io
import json
import base64
import argparse

from sg_video.frames import extract_keyframes
from sg_video.hashing import dhash, hamming_distance


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", required=True)
    ap.add_argument("--every", type=float, default=1.0)        # 1 keyframe/sec
    ap.add_argument("--max-frames", type=int, default=40)
    ap.add_argument("--dedup-bits", type=int, default=4)       # skip frames within N bits of last kept
    args = ap.parse_args()

    try:
        frames = extract_keyframes(args.source, every_seconds=args.every, max_frames=args.max_frames)
        # Blank/solid frames hash to all-0s or all-1s and would false-positive
        # against any dark/blank frame in a suspect video — drop them.
        degenerate = {"0000000000000000", "ffffffffffffffff"}
        kept = []  # list of (hash, PIL.Image)
        for _ts, img in frames:
            h = dhash(img)
            if h in degenerate:
                continue
            if kept and hamming_distance(h, kept[-1][0]) < args.dedup_bits:
                continue
            kept.append((h, img))

        if not kept:
            print(json.dumps({"error": "no frames could be extracted"}))
            sys.exit(1)

        # Cap the kept set so storage/uploads stay bounded (evenly sampled).
        MAX_KEEP = 30
        if len(kept) > MAX_KEEP:
            step = len(kept) / MAX_KEEP
            kept = [kept[int(i * step)] for i in range(MAX_KEEP)]

        # Return each kept keyframe's image (downscaled for storage; the hash was
        # already computed from the full frame) so the matched frame can later be
        # shown and sent to Gemini.
        out_frames = []
        for h, img in kept:
            im = img.convert("RGB")
            im.thumbnail((480, 480))
            b = io.BytesIO()
            im.save(b, "JPEG", quality=82)
            out_frames.append({"hash": h, "b64": base64.b64encode(b.getvalue()).decode("ascii")})

        print(json.dumps({
            "frameCount": len(out_frames),
            "frames": out_frames,
            "thumbIndex": len(out_frames) // 2,
        }))
    except Exception as e:
        print(json.dumps({"error": f"{type(e).__name__}: {e}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
