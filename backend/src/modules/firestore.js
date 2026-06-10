const { Firestore, FieldValue } = require('@google-cloud/firestore');
const { classify } = require('./scoring');

const db = new Firestore({ projectId: process.env.GCP_PROJECT_ID });

const ASSETS     = 'protected_assets';
const DETECTIONS = 'piracy_detections';
const STATS      = 'statistics';
const COUNTERS   = 'counters';

// ── Assets ─────────────────────────────────────────────────────────────────

async function saveAsset(data) {
  const ref = db.collection(ASSETS).doc();
  // Store exactly what the frontend expects
  await ref.set({
    id:         ref.id,
    title:      data.title,
    sport:      data.sport,
    owner:      data.owner,
    license:    data.license,
    type:       data.type || 'image',
    phash:      data.phash,
    frameHashes: data.frameHashes || null,   // video assets: one hash per keyframe
    frames:     data.frames || null,         // video assets: [{hash, imageUrl}] per keyframe
    frameCount: data.frameCount || null,
    description: data.description || '',
    notes:      data.notes || '',
    imageUrl:   data.imageUrl,
    storagePath: data.storagePath || null,
    frame:      data.frame || 'F-00:00:00',
    status:     'active',
    registered: new Date().toISOString(),
    createdAt:  FieldValue.serverTimestamp(),
  });
  await _incrStats({ totalAssets: 1 });
  return ref.id;
}

async function getAllAssets() {
  const snap = await db.collection(ASSETS).where('status', '==', 'active').get();
  return snap.docs.map(d => d.data());
}

// ── Detections ──────────────────────────────────────────────────────────────

async function saveDetection(data) {
  const ref = db.collection(DETECTIONS).doc();
  const type = classify(data.finalConfidence);

  const mod = Array.isArray(data.transformations) && data.transformations.length > 0
    ? data.transformations.join(' + ')
    : _verdictToMod(data.geminiVerdict);

  await ref.set({
    id:           ref.id,
    assetId:      data.assetId,
    url:          data.suspiciousUrl,
    confidence:   data.finalConfidence,
    phashSim:     data.phashSimilarity,
    geminiVerdict: data.geminiVerdict,
    type,
    mod,
    owner:        data.owner || '',
    title:        data.title || '',
    sport:        data.sport || '',
    status:       'detected',
    timestamp:    FieldValue.serverTimestamp(),
    detected:     'just now',
  });
  await _incrStats({ totalDetections: 1 });
  return ref.id;
}

async function getRecentDetections(limit = 20) {
  const snap = await db.collection(DETECTIONS)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();

  return snap.docs.map(d => {
    const data = d.data();
    const ts = data.timestamp ? data.timestamp.toDate() : null;
    return {
      ...data,
      id:       data.id || d.id,
      detected: ts ? _timeAgo(ts) : 'just now',
      timestamp: ts ? ts.toISOString() : null,
    };
  });
}

// ── Stats ───────────────────────────────────────────────────────────────────

async function getStats() {
  const doc = await db.collection(STATS).doc(COUNTERS).get();
  return doc.exists ? doc.data() : { totalAssets: 0, totalDetections: 0 };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

async function _incrStats(fields) {
  const updates = { lastUpdated: FieldValue.serverTimestamp() };
  for (const [k, v] of Object.entries(fields)) updates[k] = FieldValue.increment(v);
  await db.collection(STATS).doc(COUNTERS).set(updates, { merge: true });
}

function _timeAgo(date) {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60)  return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function _verdictToMod(verdict) {
  if (verdict === 'EXACT_MATCH')   return 'cropped + filter';
  if (verdict === 'NEAR_DUPLICATE') return 'compressed';
  return '—';
}

module.exports = { saveAsset, getAllAssets, saveDetection, getRecentDetections, getStats };
