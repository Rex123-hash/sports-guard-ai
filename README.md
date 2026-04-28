<div align="center">
  <img src="frontend/public/logo.png" alt="SportsGuard AI Logo" width="92" />
  <h1>SportsGuard AI</h1>
  <p><strong>Digital asset protection for live sports media</strong></p>
  <p><strong>Enterprise-grade media integrity workflow for sports rights holders, broadcasters, and anti-piracy teams</strong></p>

  <a href="https://sports-guard-ai.web.app">
    <img src="https://img.shields.io/badge/Live%20Demo-sports--guard--ai.web.app-16A34A?style=for-the-badge&logo=firebase&logoColor=white" alt="Live Demo" />
  </a>
  <a href="https://sportsguard-api-712383807173.us-central1.run.app/health">
    <img src="https://img.shields.io/badge/Cloud%20Run%20API-Live-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white" alt="Cloud Run API" />
  </a>
  <img src="https://img.shields.io/badge/Google%20Cloud-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white" alt="Google Cloud" />
  <img src="https://img.shields.io/badge/Gemini%201.5%20Flash-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white" alt="Gemini 1.5 Flash" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Firestore-FF6F00?style=for-the-badge&logo=firebase&logoColor=white" alt="Firestore" />
  <img src="https://img.shields.io/badge/Cloud%20Vision-34A853?style=for-the-badge&logo=googlecloud&logoColor=white" alt="Cloud Vision" />
  <img src="https://img.shields.io/badge/Vertex%20AI-1A73E8?style=for-the-badge&logo=googlecloud&logoColor=white" alt="Vertex AI" />
  <img src="https://img.shields.io/badge/Cloud%20Run-Deployed-0F9D58?style=for-the-badge&logo=googlecloud&logoColor=white" alt="Cloud Run Deployed" />
  <img src="https://img.shields.io/badge/Firebase%20Hosting-Live-FF8F00?style=for-the-badge&logo=firebase&logoColor=white" alt="Firebase Hosting" />
  <img src="https://img.shields.io/badge/Google%20Auth-Enabled-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Auth" />
  <img src="https://img.shields.io/badge/Guest%20Mode-Available-475569?style=for-the-badge&logo=ghost&logoColor=white" alt="Guest Mode" />
  <img src="https://img.shields.io/badge/DMCA%20Drafts-Exportable-DC2626?style=for-the-badge&logo=googledocs&logoColor=white" alt="DMCA Drafts" />
  <img src="https://img.shields.io/badge/Solution%20Challenge-2026-111827?style=for-the-badge&logo=google&logoColor=white" alt="Solution Challenge 2026" />
</div>

<br />

## Live Deployment

- Frontend: [https://sports-guard-ai.web.app](https://sports-guard-ai.web.app)
- Backend API health: [https://sportsguard-api-712383807173.us-central1.run.app/health](https://sportsguard-api-712383807173.us-central1.run.app/health)

## Quick Access

- Product link: [sports-guard-ai.web.app](https://sports-guard-ai.web.app)
- API health check: [sportsguard-api-712383807173.us-central1.run.app/health](https://sportsguard-api-712383807173.us-central1.run.app/health)
- Primary workflow: register official frames, scan suspicious URLs, verify authenticity, export evidence

## What SportsGuard AI Does

SportsGuard AI helps broadcasters, leagues, and rights holders protect official sports media from unauthorized reuse. It lets operators register official frames, scan suspicious media URLs, verify image provenance, and generate evidence reports for enforcement.

Core product capabilities:

- Official frame registration with visual fingerprinting
- Suspicious URL scanning against protected assets
- Gemini-assisted similarity and authenticity review
- Downloadable evidence reports and DMCA draft generation
- Google sign-in plus guest access for quick demos

## Product Images

### UI Preview Gallery

This section highlights the current visual direction of SportsGuard AI, including the landing surface, sign-in experience, and branded product art used in the deployed experience.

### Landing Experience

<p align="center">
  <img src="frontend/public/landing-reference-bg.jpeg" alt="SportsGuard landing visual" width="100%" />
</p>

### Login Experience

<p align="center">
  <img src="frontend/public/login-reference.jpeg" alt="SportsGuard login visual" width="100%" />
</p>

### Brand Assets Used In The Product

<p align="center">
  <img src="frontend/public/logo.png" alt="SportsGuard AI logo mark" width="240" />
</p>

### Additional Product Art

<p align="center">
  <img src="frontend/public/player.jpeg" alt="SportsGuard sports player visual" width="48%" />
  <img src="frontend/public/stadium.jpeg" alt="SportsGuard stadium visual" width="48%" />
</p>

## Problem

Live sports piracy spreads fast during the most valuable broadcast window. Rights holders often lose time collecting proof, comparing suspect uploads with official footage, and preparing takedown requests manually.

SportsGuard AI shortens that loop by combining fingerprint-based matching with Google Cloud AI services to help operators identify suspicious content quickly and turn findings into usable enforcement evidence.

## Why This Project Matters

- Live match highlights are reposted within minutes across mirror sites and social channels.
- Manual evidence collection slows down enforcement during the most valuable rights window.
- Rights teams need fast authenticity checks, searchable logs, and exportable reports they can actually use.
- SportsGuard AI turns media protection into a structured workflow instead of a manual fire drill.

## Google Cloud Stack

| Service | Role in SportsGuard |
|---|---|
| Gemini 1.5 Flash on Vertex AI | Similarity and authenticity reasoning |
| Cloud Run | Hosts the backend APIs |
| Cloud Vision API | OCR and ownership-signal extraction |
| Cloud Firestore | Detection history and metadata storage |
| Cloud Storage | Asset and evidence storage |
| Firebase Hosting | Frontend deployment |
| Firebase Auth | Google sign-in and session handling |

## Product Flow

1. A rights holder signs in or enters guest mode.
2. Official sports frames are uploaded and fingerprinted.
3. A suspicious image URL is submitted for checking.
4. The backend computes similarity and collects visual evidence.
5. Gemini and Vision APIs help classify the content.
6. The result is logged and turned into a report or DMCA draft.

## Architecture And Delivery Approach

SportsGuard AI is designed as a lightweight operator-facing web workflow backed by Google Cloud services. The frontend focuses on fast review and clean evidence handling, while the backend handles fingerprinting, OCR, similarity checks, and AI-assisted adjudication.

The overall delivery approach is:

- React frontend for operator actions and evidence presentation
- Express APIs for registration, scan, and verification workflows
- Cloud Run for scalable backend deployment
- Firestore and Storage for persistence and asset support
- Gemini plus Vision APIs for reasoning and visual signal extraction

## Feature Breakdown

### 1. Asset Registration

- Upload official broadcast frames
- Store rights-holder metadata
- Create resilient perceptual fingerprints

### 2. URL Detection

- Submit suspicious image URLs
- Compare against registered media
- Return confidence, verdict, and supporting reasoning

### 3. Verification

- Upload a frame for authenticity review
- Show an AI-backed confidence score
- Export a verification report

### 4. Evidence and Enforcement

- Generate evidence reports
- Export verification certificates
- Produce DMCA-ready drafts

## Submission-Ready Highlights

- Visible Google Cloud deployment with live frontend and Cloud Run backend
- Gemini-backed authenticity and similarity workflows
- Real operator journey from upload to detection to evidence export
- Polished login and landing visuals for demo readiness
- Sports-rights-specific framing instead of a generic media moderation tool

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Hosting | Firebase Hosting |
| API Runtime | Google Cloud Run |
| AI | Gemini 1.5 Flash on Vertex AI |
| OCR / provenance | Google Cloud Vision API |
| Database | Cloud Firestore |
| Auth | Firebase Auth |

## Google Cloud Services Used

| Service | Usage |
|---|---|
| Firebase Hosting | Serves the production frontend |
| Firebase Authentication | Google sign-in and session handling |
| Cloud Run | Hosts the backend APIs in production |
| Cloud Firestore | Stores detection metadata and registry state |
| Cloud Storage | Supports uploaded asset and evidence handling |
| Vertex AI Gemini | Similarity and authenticity reasoning |
| Cloud Vision API | OCR and visual signal extraction |

## User Experience Notes

- Sign in with Google for authorised access
- Continue as Guest for frictionless judging demos
- Register official frames before scanning suspicious media
- Export evidence after analysis for reporting or takedown support

## Local Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm start
```

By default, frontend development talks to `http://localhost:8080` in Vite dev mode unless `VITE_API_BASE` is provided.

## Validation

- `frontend npm test`
- `frontend npm run build`

## Repository Highlights

- Deployed frontend and backend links are documented above
- Product screenshots are embedded directly in this README
- Google Cloud usage is explicitly mapped to app responsibilities
- The project is positioned for Solution Challenge 2026 review and demo flow

## Solution Challenge Fit

SportsGuard AI aligns with the Solution Challenge theme by combining:

- real Google Cloud deployment
- visible Gemini integration
- operator-facing evidence workflows
- practical sports media protection use cases

---

Built by **Team Hackwin** for Solution Challenge 2026.
