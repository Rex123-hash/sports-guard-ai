"""Keyframe extraction via imageio (bundles its own ffmpeg)."""
import imageio.v2 as imageio
from PIL import Image


def extract_keyframes(video_path, every_seconds=0.5, max_frames=80):
    """Return a list of (timestamp_seconds, PIL.Image) sampled at intervals."""
    reader = imageio.get_reader(video_path)
    meta = reader.get_meta_data()
    fps = meta.get("fps") or 25
    step = max(1, int(round(fps * every_seconds)))
    frames = []
    try:
        for i, frame in enumerate(reader):
            if i % step == 0:
                frames.append((round(i / fps, 2), Image.fromarray(frame)))
                if len(frames) >= max_frames:
                    break
    finally:
        reader.close()
    return frames
