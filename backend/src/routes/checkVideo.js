const axios = require('axios');
const fs = require('node:fs');
const { getAllAssets, saveDetection } = require('../modules/firestore');
const { runVideoDetection } = require('../modules/videoDetect');
const { analyzeImages } = require('../modules/gemini');
const { assertSafePublicUrl } = require('../modules/urlSafety');
const { finalConfidence, classify } = require('../modules/scoring');

/**
 * POST /api/check-video
 * Accepts EITHER an uploaded video file (multipart field "video") OR { url }
 * (direct video URL, platform URL, or — locally — a file path).
 * Python extracts keyframes + hashes + matches; Node runs Gemini on the best frame.
 */
module.exports = async function checkVideoHandler(req, res, next) {
  try {
    // An uploaded file takes precedence over a URL.
    const source = req.file ? req.file.path : (typeof req.body.url === 'string' ? req.body.url : '');
    const sourceLabel = req.file ? `upload: ${req.file.originalname || 'video'}` : source;
    if (!source) {
      return res.status(400).json({ error: 'Provide a video file (upload) or a url' });
    }

    // SSRF-guard real URLs (uploaded file paths skip this).
    if (/^https?:\/\//i.test(source)) {
      try { await assertSafePublicUrl(source); }
      catch (e) { return res.status(400).json({ error: e.message }); }
    }

    const assets = await getAllAssets();
    const slim = assets.filter(a => a.imageUrl).map(a => ({ id: a.id, title: a.title, imageUrl: a.imageUrl, frameHashes: a.frameHashes || null, frames: a.frames || null }));

    let det;
    try {
      det = await runVideoDetection(source, slim);
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

    // Stage 2: Gemini comparing the SUSPECT frame against the exact registered
    // frame that matched (not the thumbnail) — reuse the proven /check path.
    const registeredFrameUrl = det.matchedFrameUrl || det.imageUrl;
    let gemini = null;
    try {
      const r = await axios.get(registeredFrameUrl, { responseType: 'arraybuffer', timeout: 10000 });
      gemini = await analyzeImages(Buffer.from(r.data), frameBuf);
    } catch (e) {
      console.error('[check-video] Gemini step unavailable:', e.message);
    }

    if (!gemini) {
      // Graceful fallback (e.g. local dev without Vertex access): hash-only.
      const confidence = finalConfidence(det.similarity, 0);
      return res.json({
        ...base, piracyDetected: false, confidence, phashSim: det.similarity,
        geminiVerdict: 'HASH_ONLY', type: 'review', timestampSeconds: det.timestampSeconds,
        matchedAsset: _safe(matchedAsset), matchedFrame, matchedFrameUrl: registeredFrameUrl,
        note: 'Gemini adjudication pending in this environment',
      });
    }

    const confidence = finalConfidence(det.similarity, gemini.confidence);
    const type = classify(confidence);
    const piracyDetected = type === 'piracy';

    let detectionId = null;
    if (piracyDetected || type === 'review') {
      detectionId = await saveDetection({
        assetId: det.assetId, suspiciousUrl: sourceLabel,
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
      timestampSeconds: det.timestampSeconds, matchedFrame, matchedFrameUrl: registeredFrameUrl,
      matchedAsset: _safe(matchedAsset), detectionId,
    });
  } catch (err) {
    next(err);
  } finally {
    // Always remove the uploaded temp file.
    if (req.file && req.file.path) fs.unlink(req.file.path, () => {});
  }
};

function _safe(a) {
  return a ? { id: a.id, owner: a.owner, title: a.title, sport: a.sport, license: a.license, phash: a.phash, imageUrl: a.imageUrl, frame: a.frame } : null;
}
