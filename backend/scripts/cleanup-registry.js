/**
 * One-off registry cleanup before the June 15 submission.
 *
 * - Marks test/duplicate/seeded assets status:'inactive' (REVERSIBLE — no deletes;
 *   getAllAssets() already filters on status=='active', so no code change needed).
 * - Deletes the six fabricated seed detections d01–d06 (.example URLs).
 * - Recomputes statistics/counters from the actual data.
 *
 * Idempotent — safe to run more than once.
 * Run from backend/:  node scripts/cleanup-registry.js
 * Undo an asset:      set status back to 'active' in the Firestore console.
 */
require('dotenv').config();
const { Firestore, FieldValue } = require('@google-cloud/firestore');

const db = new Firestore({ projectId: process.env.GCP_PROJECT_ID });

// Real, distinct assets that stay live (audited 2026-06-10):
//   1NJsVT4ELKeoiLrtW9Wg  cricket frame originals/008e9516… — source of BOTH Check-page demo buttons
//   0eA0d5FurtZ42wwRNqfY  "ipl video" — 30-keyframe video asset
//   9SEFqgCbuqcHq7hd03ez  "IPL"
//   WRSDbBN04pRMYJd5Sjfp  "Messi"
//   7UzNriUgtBmXPFirfit8  "Basketball"
const DEACTIVATE = [
  // seeded fakes (no imageUrl, fabricated hashes)
  'a01', 'a02', 'a03', 'a04', 'a05',
  // duplicate "India v Pakistan · Asia Cup Semi" registrations
  'JmziNnGnW2VwbS0BLGOt',
  's2MpG42rPzAlu73v75LT',
  'aYXeeJINcDDxoN4skZWz',
  'YUWI90fnnB3OunfUOBxL',
  'UJvPA6oWTSJtSAA6qwic',
  'woUXdghHvZpVEYCNeCeL',
  '4roFLatbwC8Ck7URodv2',
  '2QE0v6NKECVe5kZU7028',
  'viouC2fgN8Hg3Xtr800f',
  'MWVDnvL1XzYRFeG9wx0R',
  // duplicate of "IPL"
  'rJmQpxfbUr5ukV7xp64z',
  // single-frame video test iterations, superseded by the 30-frame "ipl video"
  '0mE8WMt3g0GtlsqMDBWU',
  'DsrKLs3DsOaraaom6SBf',
  '6mklXsMqpU0luMYZ5vv0',
];

const DELETE_DETECTIONS = ['d01', 'd02', 'd03', 'd04', 'd05', 'd06'];

async function main() {
  console.log('Cleanup for project:', process.env.GCP_PROJECT_ID);

  // 1. Deactivate junk assets (only if the doc exists).
  let deactivated = 0;
  for (const id of DEACTIVATE) {
    const ref = db.collection('protected_assets').doc(id);
    const snap = await ref.get();
    if (!snap.exists) { console.log(`  skip (missing)        ${id}`); continue; }
    if (snap.data().status === 'inactive') { console.log(`  skip (already done)   ${id}`); continue; }
    await ref.set({ status: 'inactive' }, { merge: true });
    console.log(`  deactivated           ${id}  "${snap.data().title}"`);
    deactivated++;
  }

  // 2. Delete seeded fake detections.
  let deleted = 0;
  for (const id of DELETE_DETECTIONS) {
    const ref = db.collection('piracy_detections').doc(id);
    const snap = await ref.get();
    if (!snap.exists) { console.log(`  skip (missing)        detection ${id}`); continue; }
    await ref.delete();
    console.log(`  deleted detection     ${id}  ${snap.data().url}`);
    deleted++;
  }

  // 3. Recompute counters from actual data so the dashboard matches reality.
  const [activeAssets, detections] = await Promise.all([
    db.collection('protected_assets').where('status', '==', 'active').get(),
    db.collection('piracy_detections').get(),
  ]);
  await db.collection('statistics').doc('counters').set({
    totalAssets: activeAssets.size,
    totalDetections: detections.size,
    lastUpdated: FieldValue.serverTimestamp(),
  });

  console.log('\nSummary');
  console.log(`  assets deactivated : ${deactivated}`);
  console.log(`  detections deleted : ${deleted}`);
  console.log(`  active assets now  : ${activeAssets.size}`);
  activeAssets.docs.forEach(d => console.log(`    - ${d.id}  "${d.data().title}"`));
  console.log(`  detections now     : ${detections.size}`);
  console.log('Done.');
}

main().catch(err => { console.error('Cleanup failed:', err); process.exit(1); });
