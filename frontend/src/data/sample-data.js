// Form options, pipeline copy, and stack descriptions used across the app.
export const SPORTS = [
  { id: 'cricket', label: 'Cricket' },
  { id: 'football', label: 'Football' },
  { id: 'basketball', label: 'Basketball' },
  { id: 'tennis', label: 'Tennis' },
  { id: 'f1', label: 'Formula 1' },
];

export const RIGHTS_HOLDERS = [
  'BCCI Media Group',
  'Premier Football League',
  'NBA Broadcasting Inc.',
  'ATP Media Services',
  'F1 Rights Holdings',
];

export const PIPELINE_STEPS = [
  { name: 'Fetch source', desc: 'Download asset | resolve redirects | safety scan', dur: 480 },
  { name: 'Extract frame', desc: 'Decode image | normalize colorspace', dur: 360 },
  { name: 'Compute fingerprint', desc: 'dHash | 64-bit | resilient to filter/recompression', dur: 540 },
  { name: 'Search registry', desc: 'Hamming distance across the protected registry', dur: 460 },
  { name: 'Visual analysis', desc: 'Multimodal compare | detect transformations', dur: 980 },
  { name: 'Adjudicate', desc: 'Weighted score | 0.4 pHash + 0.6 visual', dur: 320 },
];

export const CLOUD_STACK = [
  { service: 'Gemini 2.5 Flash · Vertex AI', role: 'Multimodal verdict on image and video-frame matches, plus frame provenance' },
  { service: 'Cloud Vision', role: 'OCR for broadcaster overlays and copyright marks, plus upload safety checks' },
  { service: 'Cloud Run', role: 'Runs the Node API and the embedded Python video pipeline; scales to zero' },
  { service: 'Cloud Firestore', role: 'Protected-asset registry, detection log, and live dashboard metrics' },
  { service: 'Cloud Storage', role: 'Original frames, registered video keyframes, and evidence artifacts' },
  { service: 'Firebase Auth + Hosting', role: 'Google / guest sign-in and global CDN delivery of the app' },
];
