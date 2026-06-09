const axios = require('axios');
const { getAllAssets, saveDetection } = require('../modules/firestore');
const { runVideoDetection } = require('../modules/videoDetect');
const { analyzeImages } = require('../modules/gemini');
const { assertSafePublicUrl } = require('../modules/urlSafety');

const PIRACY_THRESHOLD = 85;

/**
 * POST /api/check-video
 * Body: { url }  (direct video URL, platform URL, or — locally — a file path)
 * Python extracts keyframes + hashes + matches; Node runs Gemini on the best frame.
 */
module.exports = async function checkVideoHandler(req, res, next) {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url is required' });
    }

    // SSRF-guard real URLs (skip for local file paths used in dev testing).
    if (/^https?:\/\//i.test(url)) {
      try { await assertSafePublicUrl(url); }
      catch (e) { return res.status(400).json({ error: e.message }); }
    }

    const assets = await getAllAssets();
    const slim = assets.filter(a => a.imageUrl).map(a => ({ id: a.id, title: a.title, imageUrl: a.imageUrl }));

    let det;
    try {
      det = await runVideoDetection(url, slim);
    } catch (e) {
      return res.status(400).json({ error: `Video detection failed: ${e.message}` });
    }
    if (det.error) return res.status(400).json({ error: det.error });

    const base = { framesScanned: det.framesScanned, sourceKind: det.sourceKind };

    if (!det.matched) {
      return res.json({ ...base, piracyDetected: false, confidence: 0, phashSim: 0, geminiVerdict: 'NO_MATCH', type: 'clean' });
    }

    const matchedAsset = assets.find(a => a.id === det.assetId);
    const frameBuf = Buffer.from(det.frameB64, 'base64');
    const matchedFrame = `data:image/jpeg;base64,${det.frameB64}`; // the actual frame found in the video

    // Stage 2: Gemini on the matched frame (reuse the proven /check path).
    let gemini = null;
    try {
      const r = await axios.get(det.imageUrl, { responseType: 'arraybuffer', timeout: 10000 });
      gemini = await analyzeImages(Buffer.from(r.data), frameBuf);
    } catch (e) {
      console.error('[check-video] Gemini step unavailable:', e.message);
    }

    if (!gemini) {
      // Graceful fallback (e.g. local dev without Vertex access): hash-only.
      const confidence = Math.round(det.similarity * 0.4);
      return res.json({
        ...base, piracyDetected: false, confidence, phashSim: det.similarity,
        geminiVerdict: 'HASH_ONLY', type: 'review', timestampSeconds: det.timestampSeconds,
        matchedAsset: _safe(matchedAsset), matchedFrame, note: 'Gemini adjudication pending in this environment',
      });
    }

    const confidence = Math.round(det.similarity * 0.4 + gemini.confidence * 0.6);
    const type = confidence >= PIRACY_THRESHOLD ? 'piracy' : confidence >= 70 ? 'review' : 'clean';
    const piracyDetected = type === 'piracy';

    let detectionId = null;
    if (piracyDetected || type === 'review') {
      detectionId = await saveDetection({
        assetId: det.assetId, suspiciousUrl: url,
        phashSimilarity: det.similarity,
        geminiVerdict: gemini.verdict, geminiConfidence: gemini.confidence,
        finalConfidence: confidence,
        owner: matchedAsset?.owner, title: matchedAsset?.title, sport: matchedAsset?.sport,
        transformations: gemini.transformations,
      });
    }

    return res.json({
      ...base, piracyDetected, confidence, phashSim: det.similarity,
      geminiVerdict: gemini.verdict, type,
      mod: gemini.transformations.join(' + ') || '—',
      reasoning: gemini.reasoning, evidence: gemini.evidence, transformations: gemini.transformations,
      timestampSeconds: det.timestampSeconds, matchedFrame,
      matchedAsset: _safe(matchedAsset), detectionId,
    });
  } catch (err) {
    next(err);
  }
};

function _safe(a) {
  return a ? { id: a.id, owner: a.owner, title: a.title, sport: a.sport, license: a.license, phash: a.phash, imageUrl: a.imageUrl, frame: a.frame } : null;
}
