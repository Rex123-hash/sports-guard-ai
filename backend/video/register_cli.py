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

        thumb_img = kept[len(kept) // 2][1]  # middle frame is usually representative
        buf = io.BytesIO()
        thumb_img.convert("RGB").save(buf, "JPEG", quality=85)

        print(json.dumps({
            "frameCount": len(kept),
            "frameHashes": [h for h, _ in kept],
            "thumbB64": base64.b64encode(buf.getvalue()).decode("ascii"),
        }))
    except Exception as e:
        print(json.dumps({"error": f"{type(e).__name__}: {e}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
