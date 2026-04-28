/**
 * Seed script — pre-loads Firestore with the sample data matching the frontend.
 * Run: node seed.js
 */
require('dotenv').config();
const { Firestore, FieldValue } = require('@google-cloud/firestore');

const db = new Firestore({ projectId: process.env.GCP_PROJECT_ID });

const SAMPLE_ASSETS = [
  { id: 'a01', title: 'India v Australia · T20 Final · MCG',  sport: 'cricket',    owner: 'BCCI Media Group',        license: 'broadcast-only', phash: '8f7e3c2d1a9b5e4f', registered: '2026-04-21T14:22:00Z', frame: 'F-04:23:11', imageUrl: '', storagePath: '', description: 'Cricket T20 Final at MCG', status: 'active' },
  { id: 'a02', title: 'Liverpool v Real Madrid · UCL QF',      sport: 'football',   owner: 'Premier Football League', license: 'press-pool',     phash: 'a3b2d4e5f6071829', registered: '2026-04-22T09:14:00Z', frame: 'F-22:08:04', imageUrl: '', storagePath: '', description: 'UCL Quarter Final at Anfield', status: 'active' },
  { id: 'a03', title: 'Lakers v Celtics · Game 7',             sport: 'basketball', owner: 'NBA Broadcasting Inc.',   license: 'editorial',      phash: 'c1c2d4e5f6071829', registered: '2026-04-22T18:31:00Z', frame: 'F-Q4-01:42', imageUrl: '', storagePath: '', description: 'NBA Finals Game 7 buzzer beater', status: 'active' },
  { id: 'a04', title: 'Wimbledon Final · Centre Court',        sport: 'tennis',     owner: 'ATP Media Services',     license: 'broadcast-only', phash: 'd9e8f7a6b5c43210', registered: '2026-04-23T11:05:00Z', frame: 'F-SET3-04',  imageUrl: '', storagePath: '', description: 'Wimbledon Final on Centre Court', status: 'active' },
  { id: 'a05', title: 'Monaco GP · Lap 47 Overtake',           sport: 'f1',         owner: 'F1 Rights Holdings',     license: 'broadcast-only', phash: 'e0d1c2b3a4958678', registered: '2026-04-24T16:48:00Z', frame: 'F-LAP47-T3',  imageUrl: '', storagePath: '', description: 'Monaco Grand Prix lap 47 overtake', status: 'active' },
];

const SAMPLE_DETECTIONS = [
  { id: 'd01', assetId: 'a01', url: 'streamhub.example/embed/u8821',            confidence: 96, phashSim: 94, geminiVerdict: 'EXACT_MATCH',  type: 'piracy', mod: 'cropped + filter', owner: 'BCCI Media Group',        title: 'India v Australia · T20 Final · MCG', sport: 'cricket',    status: 'detected', detected: '08m ago' },
  { id: 'd02', assetId: 'a03', url: 'fanhub.example/clip/lebron-buzzer-beater', confidence: 91, phashSim: 89, geminiVerdict: 'NEAR_MATCH',   type: 'piracy', mod: 'logo overlay',   owner: 'NBA Broadcasting Inc.',   title: 'Lakers v Celtics · Game 7',            sport: 'basketball', status: 'detected', detected: '14m ago' },
  { id: 'd03', assetId: 'a02', url: 'forum.kickoff.example/topic/8821/p/441',   confidence: 88, phashSim: 86, geminiVerdict: 'NEAR_MATCH',   type: 'piracy', mod: 'compressed',     owner: 'Premier Football League', title: 'Liverpool v Real Madrid · UCL QF',     sport: 'football',   status: 'detected', detected: '32m ago' },
  { id: 'd04', assetId: 'a04', url: 'tennishub.example/embed/wimb-final-set3',  confidence: 76, phashSim: 78, geminiVerdict: 'INCONCLUSIVE', type: 'review', mod: 'heavy crop',     owner: 'ATP Media Services',     title: 'Wimbledon Final · Centre Court',       sport: 'tennis',     status: 'detected', detected: '01h ago' },
  { id: 'd05', assetId: 'a01', url: 'reddit.example/r/cricket/comments/abc123', confidence: 93, phashSim: 91, geminiVerdict: 'EXACT_MATCH',  type: 'piracy', mod: 'mirrored',       owner: 'BCCI Media Group',        title: 'India v Australia · T20 Final · MCG', sport: 'cricket',    status: 'detected', detected: '02h ago' },
  { id: 'd06', assetId: 'a05', url: 'racing.example/blog/monaco-2026-photos',   confidence: 71, phashSim: 73, geminiVerdict: 'INCONCLUSIVE', type: 'review', mod: 'color shift',    owner: 'F1 Rights Holdings',      title: 'Monaco GP · Lap 47 Overtake',         sport: 'f1',         status: 'detected', detected: '03h ago' },
];

async function seed() {
  console.log('Seeding Firestore for project:', process.env.GCP_PROJECT_ID);

  const batch1 = db.batch();
  for (const asset of SAMPLE_ASSETS) {
    const ref = db.collection('protected_assets').doc(asset.id);
    batch1.set(ref, { ...asset, createdAt: FieldValue.serverTimestamp() });
  }
  await batch1.commit();
  console.log(`✓ Seeded ${SAMPLE_ASSETS.length} assets`);

  const batch2 = db.batch();
  for (const det of SAMPLE_DETECTIONS) {
    const ref = db.collection('piracy_detections').doc(det.id);
    batch2.set(ref, { ...det, timestamp: FieldValue.serverTimestamp() });
  }
  await batch2.commit();
  console.log(`✓ Seeded ${SAMPLE_DETECTIONS.length} detections`);

  await db.collection('statistics').doc('counters').set({
    totalAssets: SAMPLE_ASSETS.length,
    totalDetections: SAMPLE_DETECTIONS.length,
    lastUpdated: FieldValue.serverTimestamp(),
  });
  console.log('✓ Stats updated');
  console.log('Seed complete.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
