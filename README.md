<div align="center">
  <img src="frontend/public/logo.png" alt="SportsGuard AI" width="96" />

  <h1>SportsGuard AI</h1>

  <p><strong>AI-powered media integrity for live sports broadcasters and rights holders.</strong></p>
  <p><em>Built on Google Cloud · Gemini · Cloud Vision · Cloud Run · Firestore</em></p>

  <p>
    <a href="https://sports-guard-ai.web.app">
      <img src="https://img.shields.io/badge/Live%20Demo-sports--guard--ai.web.app-16A34A?style=for-the-badge&logo=firebase&logoColor=white" alt="Live Demo" />
    </a>
    <a href="https://sportsguard-api-712383807173.us-central1.run.app/health">
      <img src="https://img.shields.io/badge/API-Cloud%20Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white" alt="API" />
    </a>
    <img src="https://img.shields.io/badge/Track-Digital%20Asset%20Protection-111827?style=for-the-badge" alt="Track 1" />
  </p>

  <p>
    <img src="https://img.shields.io/badge/Gemini%202.5%20Flash-8E75B2?style=flat-square&logo=googlebard&logoColor=white" />
    <img src="https://img.shields.io/badge/Vertex%20AI-1A73E8?style=flat-square&logo=googlecloud&logoColor=white" />
    <img src="https://img.shields.io/badge/Cloud%20Vision-34A853?style=flat-square&logo=googlecloud&logoColor=white" />
    <img src="https://img.shields.io/badge/Cloud%20Run-0F9D58?style=flat-square&logo=googlecloud&logoColor=white" />
    <img src="https://img.shields.io/badge/Firestore-FF6F00?style=flat-square&logo=firebase&logoColor=white" />
    <img src="https://img.shields.io/badge/Cloud%20Storage-4285F4?style=flat-square&logo=googlecloud&logoColor=white" />
    <img src="https://img.shields.io/badge/Firebase%20Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black" />
    <img src="https://img.shields.io/badge/React%2018-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" />
    <img src="https://img.shields.io/badge/Python%203-3776AB?style=flat-square&logo=python&logoColor=white" />
    <img src="https://img.shields.io/badge/FFmpeg-007808?style=flat-square&logo=ffmpeg&logoColor=white" />
  </p>

  <p>
    <img src="https://img.shields.io/badge/Lighthouse-94%20Perf%20·%2092%20A11y%20·%2096%20Best%20Practices%20·%20100%20SEO-2ea44f?style=flat-square&logo=lighthouse&logoColor=white" alt="Lighthouse scores" />
  </p>
</div>

---

## The Problem

Live sports piracy is a multi-billion-dollar leak. The most valuable broadcast window is also when pirated clips spread fastest — across mirror sites, social platforms, and reupload forums.

For rights holders the bottleneck is not detection. It is **proof**:

- Manually downloading a suspect clip
- Comparing it frame-by-frame against an original
- Filling out a takedown form before the highlight goes cold

By the time a notice is filed, the pirated copy has already done its damage.

## The Solution

**SportsGuard AI is a Google Cloud–native workflow that takes a suspect image URL, video file, or social-platform link and returns a verdict, an evidence report, and a DMCA draft — in seconds.**

1. Rights holder registers an official broadcast frame — or a **whole video clip** — → SportsGuard computes a 64-bit dHash fingerprint (one per keyframe for clips), runs a Cloud Vision safety check, and stores frame + metadata.
2. Operator submits a suspicious image URL → SSRF guard validates the URL, backend fetches the image, recomputes the dHash.
3. Hamming-distance search across every registered frame finds the best candidate match.
4. If similarity ≥ 80%, **Gemini 2.5 Flash** on Vertex AI performs multimodal visual adjudication comparing original vs suspected image.
5. A weighted score (`0.4 × dHash + 0.6 × Gemini`) classifies the result: **piracy ≥ 85% · review 70–84% · clean < 70%**.
6. One click exports the evidence report or generates a populated DMCA notice.

Videos run through the same two-stage engine: an embedded Python pipeline (ffmpeg + yt-dlp) samples keyframes from an upload, a direct `.mp4` link, or an Instagram/X link, fingerprints each frame, and finds any registered content hidden inside the clip — **with the exact timestamp where it appears** — before Gemini adjudicates the matched frame pair.

---

## Live Demo

| | URL |
|---|---|
| **Frontend** | https://sports-guard-ai.web.app |
| **Backend API Health Check** | https://sportsguard-api-712383807173.us-central1.run.app/health |

Sign in with Google or pick **Continue as Guest** to skip auth and try the full pipeline.

### Try it in 60 seconds

1. **Scan URL** → press **Run check**. A color-graded pirate copy of a registered cricket frame is pre-filled — watch the pipeline fingerprint it and Gemini name the exact transformations (≈96% piracy, EXACT_MATCH).
2. Press **Cricket · exact copy** for a near-100% match, or **Unrelated · clean** to see an honest clean verdict.
3. **Scan Video** → press **Cricket clip · piracy**. The Python pipeline samples keyframes and finds the protected frame *inside* the clip, with its timestamp.
4. Any piracy verdict gives you a one-click **evidence report** and a pre-filled **DMCA takedown draft**.

---

## Product Tour

### Sign-in — Google OAuth + Anonymous Guest Mode

<p align="center">
  <img src="docs/images/login.png?v=2" alt="SportsGuard sign-in screen with Google sign-in and guest mode" width="100%" />
</p>

### Dashboard — Operator Workspace

The Metrics page now reflects live Firestore-backed assets and detections instead of seeded example domains or placeholder counts.

<p align="center">
  <img src="docs/images/dashboard.png?v=2" alt="SportsGuard dashboard with sidebar navigation, action cards, and live stream indicator" width="100%" />
</p>

---

## What's New — June 2026

- 🎬 **Scan Video** — full video piracy detection: file uploads (up to 80 MB), direct `.mp4` links, and platform links (Instagram / X), returning the matched frame's **exact timestamp** inside the clip
- 📼 **Video asset registration** — protect an entire clip: every keyframe fingerprinted, near-duplicates deduped, blank frames dropped, all stored as a searchable hash set
- 🧠 **Verify Frame is now multimodal** — Gemini 2.5 Flash scores a frame's provenance (authenticity score + status + signals) on top of Cloud Vision OCR, with **real text bounding boxes** overlaid on the image
- 👤 **Anonymous guest mode** — reviewers can try the entire pipeline without creating an account
- 📄 **Evidence workflow** — downloadable HTML evidence reports, per-asset verification certificates, and pre-filled DMCA takedown drafts
- 📊 **Honest live dashboard** — every metric, sparkline, and source-domain ranking is derived from real Firestore data; nothing is seeded or simulated
- 🔐 **Hardening** — Firebase ID-token auth on all write routes, SSRF guard on URL fetching, per-IP rate limiting, CORS origin allowlist

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      Operator (Browser)                          │
│   React 18 + Vite ES Modules · Firebase Hosting (CDN)            │
│   Pages: Register · Check · Verify · Archive · Detection Log     │
└──────────────────────┬───────────────────────────────────────────┘
                       │ HTTPS · JSON
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Firebase Auth (OAuth + Anonymous)             │
│   Google Sign-In  ·  Guest mode  ·  ID-token verification        │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                  Backend API · Cloud Run (Node.js)               │
│  /register · /register-video · /check · /check-video · /verify   │
│  /detections · /assets        + embedded Python video pipeline   │
└──┬─────────────┬─────────────┬──────────────┬───────────────┬────┘
   │             │             │              │               │
   ▼             ▼             ▼              ▼               ▼
┌──────┐  ┌────────────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐
│dHash │  │Cloud Vision│  │  Gemini  │  │  Firestore │  │   Cloud  │
│ 64-  │  │safeSearch  │  │   2.5    │  │  detections│  │  Storage │
│ bit  │  │ OCR·labels │  │  Flash   │  │   assets   │  │  frames  │
└──────┘  └────────────┘  └──────────┘  └────────────┘  └──────────┘
                          (Vertex AI)
 /register  /register        /register   /register      /register
            /verify          /check      /check         (read in
                                         /detections     /check)
```

**Detection pipeline inside `/check`:**

```
URL  ──→  SSRF guard  ──→  axios download  ──→  dHash 64-bit  ──→  Hamming search
          (assertSafe                            (9×8 grid)          (Firestore
           PublicUrl)                                                 getAllAssets)
                                                                           │
                                                     < 80%  ───────────────┤
                                                     NO_MATCH              │ ≥ 80%
                                                                           ▼
                                                           Fetch original (Cloud Storage)
                                                                           │
                                                                           ▼
                                                           Gemini 2.5 Flash  ·  Vertex AI
                                                           analyzeImages(original, suspected)
                                                                           │
                                                                           ▼
                                                           Score = 0.4 · dHash + 0.6 · Gemini
                                                                           │
                                              ┌────────────────────────────┤
                                              ▼                            ▼
                                       Firestore log              Evidence report
                                       saveDetection()            + DMCA draft
```

**Video detection inside `/check-video`:**

```
upload / direct .mp4 / Instagram / X link
            │  acquire (yt-dlp · urllib) — embedded Python
            ▼
ffmpeg keyframe sampling  ──→  64-bit dHash per frame  ──→  Hamming search vs
                                                            every registered frame
            │  best frame ≥ 80%                             (image + video assets)
            ▼
Gemini 2.5 Flash adjudicates the exact matched frame pair
            ▼
timestamped verdict · evidence report · DMCA draft
```

---

## Google Cloud Stack

| Service | Role in SportsGuard AI |
|---|---|
| **Gemini 2.5 Flash** *(Vertex AI)* | Multimodal similarity reasoning · image description on register · evidence narration |
| **Cloud Vision API** | Safety check on register (`safeSearch`) · OCR + label detection on verify |
| **Cloud Run** | Stateless Node.js API · auto-scales per request |
| **Cloud Firestore** | Asset registry · detection history · audit trail |
| **Cloud Storage** | Original broadcast frames · evidence artefacts |
| **Firebase Hosting** | React frontend · global CDN delivery |
| **Firebase Auth** | Google OAuth + anonymous guest sessions |

---

## Features

### Asset Registration
Upload an official broadcast frame. Cloud Vision runs a content safety check, then a 64-bit difference hash (dHash) is computed via 9×8 grayscale adjacent-pixel comparison. Gemini 2.5 Flash generates an image description. All three run in parallel before the asset is saved to Firestore + Cloud Storage. The dHash fingerprint survives JPEG recompression, cropping, brightness/contrast shifts, and minor watermark overlays.

### URL Piracy Detection
Paste any public image URL. Backend SSRF-guards the URL (`assertSafePublicUrl`), fetches the image, computes its dHash, runs Hamming-distance search across all registered assets in Firestore, then sends the best match (≥ 80% similarity) to Gemini 2.5 Flash on Vertex AI for multimodal adjudication. Cloud Vision is **not** called in this route.

### Video Piracy Detection — scan a whole clip
Upload a video (up to 80 MB), paste a direct `.mp4` link, or drop an Instagram/X link. An embedded Python pipeline (ffmpeg via imageio-ffmpeg, yt-dlp for platform links) samples keyframes, fingerprints each one with the **same dHash engine** as the image path, and finds any registered frame hidden inside the clip — returning the exact timestamp where it appears. Gemini then adjudicates the matched frame pair against the precise registered keyframe it matched, not just a thumbnail.

### Video Asset Registration — protect a whole clip
Register a full clip as a protected asset. Every keyframe is fingerprinted, near-identical consecutive frames are deduped, and degenerate blank frames are dropped so they can't false-positive. Each kept keyframe is uploaded to Cloud Storage so a future match can display — and Gemini can adjudicate — the exact frame that was stolen, even if only a few seconds were re-used inside someone else's video.

### Frame Verification
Upload a frame to read its watermark and provenance signals. Cloud Vision OCR surfaces broadcaster overlays, timecodes, and copyright marks — rendered as **real bounding boxes** over the frame — then **Gemini 2.5 Flash judges the frame's provenance**: an authenticity score, a status verdict, and the specific signals it weighed (score bugs, agency marks, signs of re-capture), exportable as a verification report.

### Evidence Export & DMCA Drafts
Every detection produces a structured evidence report and, for confirmed piracy, a pre-populated DMCA takedown notice referencing the matched asset, similarity scores, and Gemini reasoning.

### Detection Log
Permanent record of every adjudicated URL — searchable, sortable, and exportable. Live polling keeps the dashboard in sync with new detections.

### Live Metrics
Cards, sport breakdown, and top offending source domains are derived from actual `/api/assets` and `/api/detections` responses instead of seeded demo rows. Even the sidebar trend line plots the confidence scores of the most recent real detections.

### Security & Abuse Protection
Every cost-bearing route requires a verified Firebase ID token (Google or anonymous guest). The URL fetcher is SSRF-guarded: protocol allowlist, DNS resolution, and private/metadata IP ranges blocked (`169.254.169.254`, `10.x`, `192.168.x`, IPv6 equivalents). Uploads pass Cloud Vision SafeSearch before registration. The API is rate-limited per IP, and CORS is locked to the production origins.

---

## Tech Stack

| Layer | Choice |
|---|---|
| **Frontend** | React 18 · Vite ES modules · Firebase Hosting |
| **Backend** | Node.js 20 · Express · Docker · Cloud Run |
| **AI / Vision** | Gemini 2.5 Flash on Vertex AI · Cloud Vision API |
| **Hashing** | 64-bit difference hash (dHash · 9×8 adjacent-pixel grid) — bit-identical implementations in Node (sharp) and Python (Pillow) |
| **Video pipeline** | Python 3 · ffmpeg (imageio-ffmpeg) · yt-dlp · Pillow — embedded in the same Cloud Run container |
| **Persistence** | Cloud Firestore (NoSQL) · Cloud Storage |
| **Auth** | Firebase Auth — Google OAuth + Anonymous guest |
| **CI / Build** | Vite · npm · `gcloud run deploy` |

---

## Local Setup

### Prerequisites
- Node.js 20+
- A Google Cloud project with **Vertex AI**, **Cloud Vision**, **Firestore**, **Cloud Storage**, and **Firebase Auth** enabled
- A Firebase web app config

### Frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Configure `frontend/.env`:
```
VITE_API_BASE=http://localhost:8080
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

### Backend
```bash
cd backend
cp .env.example .env       # fill in GCP project + service-account creds
npm install
npm start                  # http://localhost:8080
```

### Deploy
```bash
# Backend → Cloud Run
gcloud run deploy sportsguard-api --source backend --region us-central1

# Frontend → Firebase Hosting
cd frontend && npm run build && firebase deploy --only hosting
```

---

## Quality

| Check | Result |
|---|---|
| **Lighthouse** (production) | **94** Performance · **92** Accessibility · **96** Best Practices · **100** SEO |
| **Backend tests** | SSRF guard — the most security-critical surface |
| **Frontend tests** | Build/module integrity |
| **Production bundle** | ~107 KB gzipped JS via Vite |

## Testing

Both packages ship with executable test suites — no test framework dependency, just `node`.

### Frontend
```bash
cd frontend && npm test
```
Verifies the Vite migration is intact: `index.html` uses `type="module"` (no leftover `text/babel`), the landing page exposes primary actions, and `src/main.jsx` / `services/api.js` / `components/shell.jsx` keep the migrated module structure.

### Backend
```bash
cd backend && npm test
```
Five **SSRF guard** tests for the URL fetcher — the most security-critical surface, since `/check` downloads arbitrary user-supplied URLs:

| Test | What it verifies |
|---|---|
| Rejects unsupported protocols | Blocks `file://`, `gopher://`, etc. |
| Rejects localhost hostnames | Blocks `http://localhost:*` |
| Rejects cloud metadata targets | Blocks `169.254.169.254` (GCP / AWS metadata) |
| Accepts public IPs | Allows legitimate public targets |
| Classifies private address ranges | Catches `10.x`, `192.168.x`, `::1`, `127.x` |

### Build verification
```bash
cd frontend && npm run build       # Vite production build
```

---

## API Reference

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/register` | Bearer token | Register a broadcast frame · returns `phash`, `assetId` |
| `POST` | `/api/register-video` | Bearer token | Fingerprint every keyframe of a clip and register it as a video asset |
| `POST` | `/api/check` | Bearer token | Scan a suspicious image URL · verdict, scores, reasoning, evidence |
| `POST` | `/api/check-video` | Bearer token | Scan a video (upload or URL) for any registered frame · timestamped match |
| `POST` | `/api/verify` | Bearer token | Cloud Vision OCR + Gemini provenance assessment of a frame |
| `GET`  | `/api/detections` | Public | Detection history + live stats |
| `GET`  | `/api/assets` | Public | Active protected asset registry |
| `GET`  | `/health` | Public | Service health check |

Write routes accept a Firebase ID token from either Google sign-in or an anonymous guest session. Read-only dashboard routes are public. All `/api` routes are rate-limited per IP.

---

## Project Structure

```
sports-guard-ai/
├── backend/
│   ├── src/
│   │   ├── index.js                    # Express bootstrap · auth gating · rate limiting
│   │   ├── routes/                     # /register /register-video /check /check-video /verify /detections /assets
│   │   └── modules/
│   │       ├── phash.js                # 64-bit dHash (9×8 adjacent-pixel diff)
│   │       ├── gemini.js               # Vertex AI · Gemini 2.5 Flash (match verdicts + provenance)
│   │       ├── vision.js               # Cloud Vision OCR + SafeSearch + labels
│   │       ├── videoDetect.js          # bridge to the embedded Python video pipeline
│   │       ├── auth.js                 # Firebase ID-token middleware
│   │       ├── firestore.js            # Asset & detection storage
│   │       ├── storage.js              # Cloud Storage uploads
│   │       └── urlSafety.js            # SSRF + content-type guard
│   ├── video/                          # embedded Python pipeline
│   │   ├── detect_cli.py               # scan a video against the registry
│   │   ├── register_cli.py             # fingerprint a clip for registration
│   │   └── sg_video/                   # hashing (mirrors phash.js) · ffmpeg frames · yt-dlp acquire
│   └── Dockerfile                      # Node 20 + Python venv → one Cloud Run container
└── frontend/
    ├── src/
    │   ├── main.jsx                    # Root + auth gate + keyboard shortcuts
    │   ├── components/                 # Sidebar, Topbar, LoginPage, primitives
    │   ├── pages/                      # Landing, Dashboard, Register, Check, Scan Video, Verify, Archive
    │   └── services/                   # api.js, firebase-auth.js
    └── vite.config.js
```

---

## Solution Challenge 2026 Fit

| Criterion | How SportsGuard AI delivers |
|---|---|
| **Real Google Cloud usage** | Seven Google services in production (Gemini/Vertex AI · Cloud Vision · Cloud Run · Firestore · Cloud Storage · Firebase Auth · Firebase Hosting) · live URLs above |
| **Generative AI integration** | Gemini 2.5 Flash on Vertex AI as the verdict authority — match adjudication, transformation analysis, and frame provenance |
| **Track 1 — Digital Asset Protection** | End-to-end: registration → image + video detection → evidence → DMCA enforcement |
| **Working prototype** | Deployed, browsable, demo-ready right now — guest mode included for reviewers |
| **Practical impact** | Compresses hours of manual proof collection into seconds, for stills *and* video clips |
| **Engineering quality** | Lighthouse 94/92/96/100 · SSRF-guarded fetching · token-gated writes · executable test suites |

---

## Roadmap

- **Vector-indexed hash search** (Hamming → ANN index) so detection stays sub-second past 10k registered assets
- **Clean-scan logging** for a true clean-rate metric and richer analytics
- **Scheduled crawling** of known mirror domains instead of operator-submitted URLs only
- **Audio fingerprinting** for video matches that survive full visual re-shoots
- **Multi-crop hashing** to extend dHash resilience to aggressive crops before the Gemini stage

---

<div align="center">
  <p><strong>Built by Team Hackwin for Solution Challenge 2026.</strong></p>
</div>
