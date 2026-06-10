# YouTube support — how it works & how to enable the deep scan

SportsGuard reads YouTube links in **two tiers**, so a YouTube URL always returns
*something* even though YouTube actively blocks datacenter IPs (Cloud Run).

| Tier | What it does | Needs |
|------|--------------|-------|
| **1. Deep scan** | `yt-dlp` downloads the (lowest-res) video → ffmpeg keyframes → full frame-by-frame match | cookies and/or a PO-token provider (below) |
| **2. Thumbnail fallback** | fetches YouTube's public thumbnails (`i.ytimg.com`) → matches those frames | nothing — works from any IP, always on |

If the deep scan is refused (YouTube bot wall / no PO token), the code **automatically
falls back to tier 2** and the UI shows a "lighter scan" note. No configuration is
required for the fallback — it already works in production today.

## Why the deep scan needs setup

Running from Cloud Run, YouTube sees a **datacenter IP** and responds with
*"Sign in to confirm you're not a bot."* It also now requires a **PO token**
(proof-of-origin) for almost every player client. So two separate things are needed:

1. **PO token** → solved by running the **bgutil PO-token provider** and pointing
   yt-dlp at it.
2. **IP reputation** → solved only by **cookies** from a logged-in (ideally throwaway)
   account, or a residential proxy. A PO token alone does **not** fix the IP wall.

## Environment variables (read by `sg_video/acquire.py`)

| Var | Meaning |
|-----|---------|
| `YTDLP_COOKIES_FILE` | Path to a Netscape-format `cookies.txt` from a logged-in YouTube session. |
| `YTDLP_POT_BASE_URL` | Base URL of a running bgutil PO-token provider, e.g. `http://127.0.0.1:4416`. |

Both are optional. Set neither → fallback only. Set them → deep scan engages.

## Enable the deep scan on Cloud Run

### A. Provide cookies via Secret Manager
1. In a browser logged into a **throwaway** YouTube/Google account, export cookies
   with the "Get cookies.txt LOCALLY" extension → `cookies.txt` (Netscape format).
2. Store it as a secret and mount it:
   ```bash
   gcloud secrets create yt-cookies --data-file=cookies.txt --project sports-guard-ai

   gcloud run services update sportsguard-api \
     --region us-central1 --project sports-guard-ai \
     --update-secrets=/secrets/yt-cookies/cookies.txt=yt-cookies:latest \
     --set-env-vars=YTDLP_COOKIES_FILE=/secrets/yt-cookies/cookies.txt
   ```
   > Cookies expire in days–weeks and the account can be rate-limited/banned. Re-export
   > and `gcloud secrets versions add yt-cookies --data-file=cookies.txt` when it stops working.

### B. Run the bgutil PO-token provider (sidecar)
The provider is a small HTTP server on port `4416`
(<https://github.com/Brainicism/bgutil-ytdlp-pot-provider>). Add it as a Cloud Run
**sidecar container** in the same task so the main container reaches it on
`http://127.0.0.1:4416`, then set:
```bash
gcloud run services update sportsguard-api \
  --region us-central1 --project sports-guard-ai \
  --set-env-vars=YTDLP_POT_BASE_URL=http://127.0.0.1:4416
```
The `bgutil-ytdlp-pot-provider` pip plugin (in `requirements.txt`) is what lets
yt-dlp talk to that server.

## Reliability note (read before a demo)

Even fully configured, the deep scan can break the day of a demo (cookies expire,
IP gets flagged). For a guaranteed live demo, scan a **file upload** or a **direct
`.mp4` link** — paths you fully control — and use YouTube to *show the capability*,
not as the centerpiece.

## Local testing

```bash
cd backend/video
python -m py_compile sg_video/acquire.py detect_cli.py        # syntax
python -c "from sg_video.acquire import youtube_id; print(youtube_id('https://youtu.be/dQw4w9WgXcQ'))"
echo "" | python detect_cli.py --source "https://www.youtube.com/watch?v=dQw4w9WgXcQ"   # full flow (uses live registry)
```
Without yt-dlp/cookies installed locally this exercises the **thumbnail fallback**,
which is exactly what runs when YouTube blocks the full download in production.
