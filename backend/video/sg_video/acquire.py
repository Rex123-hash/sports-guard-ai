"""
Turn any video source into a local file path:
  - local file path             -> used as-is
  - direct video URL (.mp4 ...) -> downloaded with urllib
  - platform URL (YouTube/IG/X) -> downloaded with yt-dlp (lowest quality)
"""
import os
import sys
import tempfile
import urllib.request

VIDEO_EXTS = (".mp4", ".webm", ".mov", ".mkv", ".avi", ".m4v")
MAX_BYTES = 80 * 1024 * 1024


def acquire(source: str):
    """Return (local_path, how)."""
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
    opts = {
        "format": "worst[ext=mp4]/worst",
        "outtmpl": out_tmpl,
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "max_filesize": MAX_BYTES,
        "logger": _SilentLogger(),
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
        return ydl.prepare_filename(info)


class _SilentLogger:
    # keep yt-dlp chatter off stdout (stdout must stay pure JSON for Node)
    def debug(self, msg): pass
    def info(self, msg): pass
    def warning(self, msg): print(msg, file=sys.stderr)
    def error(self, msg): print(msg, file=sys.stderr)
