// Sample data
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

export const SAMPLE_ASSETS = [
  { id: 'a01', title: 'India v Australia | T20 Final | MCG', sport: 'cricket', owner: 'BCCI Media Group', license: 'broadcast-only', phash: '8f7e3c2d1a9b5e4f', registered: '2026-04-21T14:22:00Z', frame: 'F-04:23:11' },
  { id: 'a02', title: 'Liverpool v Real Madrid | UCL QF', sport: 'football', owner: 'Premier Football League', license: 'press-pool', phash: 'a3b2d4e5f6071829', registered: '2026-04-22T09:14:00Z', frame: 'F-22:08:04' },
  { id: 'a03', title: 'Lakers v Celtics | Game 7', sport: 'basketball', owner: 'NBA Broadcasting Inc.', license: 'editorial', phash: 'c1c2d4e5f6071829', registered: '2026-04-22T18:31:00Z', frame: 'F-Q4-01:42' },
  { id: 'a04', title: 'Wimbledon Final | Centre Court', sport: 'tennis', owner: 'ATP Media Services', license: 'broadcast-only', phash: 'd9e8f7a6b5c43210', registered: '2026-04-23T11:05:00Z', frame: 'F-SET3-04' },
  { id: 'a05', title: 'Monaco GP | Lap 47 Overtake', sport: 'f1', owner: 'F1 Rights Holdings', license: 'broadcast-only', phash: 'e0d1c2b3a4958678', registered: '2026-04-24T16:48:00Z', frame: 'F-LAP47-T3' },
];

export const SAMPLE_DETECTIONS = [
  { id: 'd01', assetId: 'a01', url: 'streamhub.example/embed/u8821', confidence: 96, phashSim: 94, geminiVerdict: 'EXACT_MATCH', type: 'piracy', detected: '08m ago', mod: 'cropped + filter' },
  { id: 'd02', assetId: 'a03', url: 'fanhub.example/clip/lebron-buzzer-beater', confidence: 91, phashSim: 89, geminiVerdict: 'NEAR_MATCH', type: 'piracy', detected: '14m ago', mod: 'logo overlay' },
  { id: 'd03', assetId: 'a02', url: 'forum.kickoff.example/topic/8821/p/441', confidence: 88, phashSim: 86, geminiVerdict: 'NEAR_MATCH', type: 'piracy', detected: '32m ago', mod: 'compressed' },
  { id: 'd04', assetId: 'a04', url: 'tennishub.example/embed/wimb-final-set3', confidence: 76, phashSim: 78, geminiVerdict: 'INCONCLUSIVE', type: 'review', detected: '01h ago', mod: 'heavy crop' },
  { id: 'd05', assetId: 'a01', url: 'reddit.example/r/cricket/comments/abc123', confidence: 93, phashSim: 91, geminiVerdict: 'EXACT_MATCH', type: 'piracy', detected: '02h ago', mod: 'mirrored' },
  { id: 'd06', assetId: 'a05', url: 'racing.example/blog/monaco-2026-photos', confidence: 71, phashSim: 73, geminiVerdict: 'INCONCLUSIVE', type: 'review', detected: '03h ago', mod: 'color shift' },
];

export const PIPELINE_STEPS = [
  { name: 'Fetch source', desc: 'Download asset | resolve redirects | safety scan', dur: 480 },
  { name: 'Extract frame', desc: 'Decode image | normalize colorspace', dur: 360 },
  { name: 'Compute fingerprint', desc: 'dHash | 64-bit | resilient to filter/recompression', dur: 540 },
  { name: 'Search registry', desc: 'Hamming distance across the protected registry', dur: 460 },
  { name: 'Visual analysis', desc: 'Multimodal compare | detect transformations', dur: 980 },
  { name: 'Adjudicate', desc: 'Weighted score | 0.4 pHash + 0.6 visual', dur: 320 },
];

export const THREAT_MAP_POINTS = [
  { id: 'm01', city: 'Mumbai', region: 'India', left: '69%', top: '46%', severity: 'high', matches: 18, label: 'Mirror stream cluster' },
  { id: 'm02', city: 'London', region: 'United Kingdom', left: '48%', top: '25%', severity: 'medium', matches: 11, label: 'Forum reposts' },
  { id: 'm03', city: 'Madrid', region: 'Spain', left: '45%', top: '31%', severity: 'high', matches: 15, label: 'Clip syndication' },
  { id: 'm04', city: 'Sao Paulo', region: 'Brazil', left: '33%', top: '67%', severity: 'medium', matches: 9, label: 'Highlight relay' },
  { id: 'm05', city: 'New York', region: 'United States', left: '22%', top: '30%', severity: 'low', matches: 6, label: 'Fan upload' },
];

export const CLOUD_STACK = [
  { service: 'Gemini 2.5 Flash · Vertex AI', role: 'Multimodal verdict on image and video-frame matches, plus frame provenance' },
  { service: 'Cloud Vision', role: 'OCR for broadcaster overlays and copyright marks, plus upload safety checks' },
  { service: 'Cloud Run', role: 'Runs the Node API and the embedded Python video pipeline; scales to zero' },
  { service: 'Cloud Firestore', role: 'Protected-asset registry, detection log, and live dashboard metrics' },
  { service: 'Cloud Storage', role: 'Original frames, registered video keyframes, and evidence artifacts' },
  { service: 'Firebase Auth + Hosting', role: 'Google / guest sign-in and global CDN delivery of the app' },
];

export const SG_DATA = {
  SPORTS,
  RIGHTS_HOLDERS,
  SAMPLE_ASSETS,
  SAMPLE_DETECTIONS,
  PIPELINE_STEPS,
  THREAT_MAP_POINTS,
  CLOUD_STACK,
};
