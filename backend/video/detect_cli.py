"""
Video detection CLI used by the Node backend (embedded Python).

Input:
  --source <video file | direct URL | platform URL>
  registry JSON on STDIN: [{"id","title","imageUrl"}, ...]   (optional)
     if absent, falls back to fetching {SG_API_BASE}/api/assets

Output (STDOUT, pure JSON — nothing else goes to stdout):
  { "matched": bool, "sourceKind": str, "framesScanned": int,
    "assetId","title","similarity","timestampSeconds","frameB64" }   (last 5 only if matched)

This stage does NO Gemini call. Node runs Gemini on the returned frame using its
existing, proven gemini.js. So Python needs no Google credentials at all.
"""
import os
import io
import sys
import json
import base64
import argparse
import urllib.request

from sg_video.hashing import dhash, similarity
from sg_video.acquire import acquire_frames
from PIL import Image

API_BASE = os.environ.get("SG_API_BASE", "https://sportsguard-api-712383807173.us-central1.run.app")
THRESHOLD = int(os.environ.get("SG_PHASH_THRESHOLD", "80"))


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def read_registry_from_stdin():
    if sys.stdin is None or sys.stdin.isatty():
        return None
    data = sys.stdin.read().strip()
    if not data:
        return None
    try:
        return json.loads(data)
    except Exception:
        return None


def fetch_registry_from_api():
    raw = urllib.request.urlopen(f"{API_BASE}/api/assets", timeout=30).read()
    return json.loads(raw).get("assets", [])


def build_registry(assets):
    """Each entry carries candidate frames [{hash, imageUrl}].
    - Video assets: use the stored per-keyframe {hash, imageUrl} (same engine).
    - Image assets: download the original and re-hash in Python (consistent engine)."""
    reg = []
    for a in assets:
        vframes = a.get("frames")
        if vframes:
            reg.append({"id": a.get("id"), "title": a.get("title", "—"),
                        "imageUrl": a.get("imageUrl"),
                        "frames": [{"hash": f.get("hash"), "imageUrl": f.get("imageUrl")}
                                   for f in vframes if f.get("hash")]})
            continue
        url = a.get("imageUrl")
        if not url:
            continue
        try:
            img = Image.open(io.BytesIO(urllib.request.urlopen(url, timeout=30).read()))
            reg.append({"id": a.get("id"), "title": a.get("title", "—"), "imageUrl": url,
                        "frames": [{"hash": dhash(img), "imageUrl": url}]})
        except Exception as e:
            log(f"skip {a.get('title')}: {e}")
    return reg


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True)
    parser.add_argument("--every", type=float, default=0.5)
    parser.add_argument("--threshold", type=int, default=THRESHOLD)
    args = parser.parse_args()

    try:
        assets = read_registry_from_stdin() or fetch_registry_from_api()
        registry = build_registry(assets)
        log(f"registry: {len(registry)} assets")

        frames, how = acquire_frames(args.source, every_seconds=args.every)
        log(f"acquired via {how}: {len(frames)} frames")

        best = None
        for ts, img in frames:
            fh = dhash(img)
            for a in registry:
                for fr in a["frames"]:
                    s = similarity(fh, fr["hash"])
                    if best is None or s > best["sim"]:
                        best = {"sim": s, "ts": ts, "asset": a, "img": img, "matchedFrameUrl": fr["imageUrl"]}

        result = {"matched": False, "sourceKind": how, "framesScanned": len(frames)}
        if best and best["sim"] >= args.threshold:
            buf = io.BytesIO()
            best["img"].convert("RGB").save(buf, format="JPEG", quality=90)
            result.update({
                "matched": True,
                "assetId": best["asset"]["id"],
                "title": best["asset"]["title"],
                "imageUrl": best["asset"]["imageUrl"],
                "matchedFrameUrl": best.get("matchedFrameUrl") or best["asset"]["imageUrl"],
                "similarity": best["sim"],
                "timestampSeconds": best["ts"],
                "frameB64": base64.b64encode(buf.getvalue()).decode("ascii"),
            })
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"matched": False, "error": f"{type(e).__name__}: {e}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
