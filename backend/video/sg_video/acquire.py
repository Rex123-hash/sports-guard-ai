"""
Turn any video source into frames the detector can scan.

Sources:
  - local file path             -> ffmpeg keyframes
  - direct video URL (.mp4 ...) -> download with urllib, then ffmpeg keyframes
  - Instagram / X / other       -> yt-dlp (lowest quality), then ffmpeg keyframes
  - YouTube                     -> two-tier:
        1) DEEP:    yt-dlp full download (uses cookies + PO-token provider if
                    configured) -> ffmpeg keyframes
        2) FALLBACK: keyless public thumbnails (i.ytimg.com) -> a few frames.
                    Never IP-blocked, so a YouTube link always returns *something*
                    even when datacenter download is refused by YouTube.

YouTube actively blocks datacenter IPs (Cloud Run) with "Sign in to confirm
you're not a bot" and now requires PO tokens for most player clients. The deep
path works when YTDLP_COOKIES_FILE and/or YTDLP_POT_BASE_URL are provided (see
video/YOUTUBE.md); otherwise we degrade to the thumbnail path automatically.
"""
import os
import io
import re
import sys
import hashlib
import tempfile
import urllib.request

VIDEO_EXTS = (".mp4", ".webm", ".mov", ".mkv", ".avi", ".m4v")
MAX_BYTES = 80 * 1024 * 1024

# youtube.com/watch?v=ID · youtu.be/ID · /shorts/ID · /embed/ID · /live/ID
_YT_RE = re.compile(
    r"(?:youtube\.com/(?:watch\?(?:.*&)?v=|shorts/|embed/|live/|v/)|youtu\.be/)"
    r"([A-Za-z0-9_-]{11})"
)


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def youtube_id(url: str):
    """Return the 11-char video id for any YouTube URL form, else None."""
    m = _YT_RE.search(url or "")
    return m.group(1) if m else None


def acquire_frames(source: str, every_seconds: float = 0.5):
    """Return (frames, how) where frames is [(timestamp_seconds, PIL.Image)]."""
    # ffmpeg keyframe extraction is imported lazily and only on the paths that
    # actually decode a video file. The YouTube thumbnail fallback below needs no
    # ffmpeg, so it keeps working even if imageio-ffmpeg is unavailable.
    def _keyframes(path):
        from .frames import extract_keyframes
        return extract_keyframes(path, every_seconds)

    if os.path.exists(source):
        return _keyframes(source), "local file"

    if source.startswith(("http://", "https://")):
        clean = source.split("?")[0].lower()
        if clean.endswith(VIDEO_EXTS) or _looks_like_video(source):
            return _keyframes(_download_direct(source)), "direct video URL"

        vid = youtube_id(source)
        if vid:
            # 1) Deep path: full download (cookies / PO token aware).
            try:
                path = _download_ytdlp(source)
                return _keyframes(path), "youtube · full scan (yt-dlp)"
            except Exception as e:
                log(f"yt-dlp full download failed, falling back to thumbnails: "
                    f"{type(e).__name__}: {e}")
            # 2) Fallback: keyless public thumbnails (no ffmpeg, never IP-blocked).
            frames = _youtube_thumbnail_frames(vid)
            if frames:
                return frames, "youtube · thumbnail fallback (full download blocked)"
            raise RuntimeError(
                "YouTube refused the download and no public thumbnails were available"
            )

        # Other platforms (Instagram / X / …): yt-dlp only.
        return _keyframes(_download_ytdlp(source)), "platform URL (yt-dlp)"

    raise ValueError(f"Unrecognized source: {source}")


# Back-compat shim: some callers may still want a single file path.
def acquire(source: str):
    """Return (local_path, how). Kept for callers that need a video file."""
    if os.path.exists(source):
        return source, "local file"
    if source.startswith(("http://", "https://")):
        clean = source.split("?")[0].lower()
        if clean.endswith(VIDEO_EXTS) or _looks_like_video(source):
            return _download_direct(source), "direct video URL"
        return _download_ytdlp(source), "platform URL (yt-dlp)"
    raise ValueError(f"Unrecognized source: {source}")


def _looks_like_video(url: str) -> bool:
    try:
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=15) as r:
            return (r.headers.get("Content-Type") or "").startswith("video/")
    except Exception:
        return False


def _download_direct(url: str) -> str:
    fd, path = tempfile.mkstemp(suffix=".mp4", prefix="sg_dl_")
    os.close(fd)
    with urllib.request.urlopen(url, timeout=60) as r, open(path, "wb") as f:
        total = 0
        while True:
            chunk = r.read(1 << 16)
            if not chunk:
                break
            total += len(chunk)
            if total > MAX_BYTES:
                raise ValueError("video exceeds size cap")
            f.write(chunk)
    return path


def _download_ytdlp(url: str) -> str:
    import yt_dlp

    out_tmpl = os.path.join(tempfile.gettempdir(), "sg_yt_%(id)s.%(ext)s")
    # Client order: PO-token-free clients first (android_vr, web_embedded), then
    # clients that need a PO token (tv, web) — those only succeed when a provider
    # is configured. yt-dlp tries them in order and uses the first that works.
    youtube_args = {"player_client": ["android_vr", "web_embedded", "tv", "web"]}
    extractor_args = {"youtube": youtube_args}

    # Optional bgutil PO-token provider (see video/YOUTUBE.md). Harmless if unset.
    pot_base = os.environ.get("YTDLP_POT_BASE_URL")
    if pot_base:
        extractor_args["youtubepot-bgutilhttp"] = {"base_url": [pot_base]}

    opts = {
        "format": "worst[ext=mp4]/worst",
        "outtmpl": out_tmpl,
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "max_filesize": MAX_BYTES,
        "logger": _SilentLogger(),
        "extractor_args": extractor_args,
    }

    # Optional cookies (logged-in account) — the only reliable way past YouTube's
    # datacenter-IP bot wall. Provide via Secret Manager mount (see YOUTUBE.md).
    cookies = os.environ.get("YTDLP_COOKIES_FILE")
    if cookies and os.path.exists(cookies):
        opts["cookiefile"] = cookies

    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
        return ydl.prepare_filename(info)


def _youtube_thumbnail_frames(video_id: str):
    """Fetch a few public, keyless YouTube thumbnails as scan frames.

    i.ytimg.com thumbnails are served from a CDN that does NOT bot-block, so this
    works from any IP. `1/2/3.jpg` are storyboard frames sampled from the start /
    middle / end of the video, giving real temporal coverage (not just the poster).
    Returns [(timestamp_seconds, PIL.Image)]; identical placeholders are de-duped.
    """
    from PIL import Image

    names = ["maxresdefault", "sddefault", "hqdefault", "1", "2", "3"]
    frames = []
    seen = set()
    for i, name in enumerate(names):
        url = f"https://i.ytimg.com/vi/{video_id}/{name}.jpg"
        try:
            with urllib.request.urlopen(url, timeout=15) as r:
                data = r.read()
        except Exception:
            continue  # 404 (thumbnail absent) or network blip — skip
        digest = hashlib.md5(data).hexdigest()
        if digest in seen:
            continue  # drop duplicate frames (e.g. repeated gray placeholder)
        seen.add(digest)
        try:
            img = Image.open(io.BytesIO(data)).convert("RGB")
        except Exception:
            continue
        frames.append((float(i), img.copy()))
    return frames


class _SilentLogger:
    # keep yt-dlp chatter off stdout (stdout must stay pure JSON for Node)
    def debug(self, msg): pass
    def info(self, msg): pass
    def warning(self, msg): print(msg, file=sys.stderr)
    def error(self, msg): print(msg, file=sys.stderr)
