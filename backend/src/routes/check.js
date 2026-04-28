const axios = require('axios');
const { generateHash, similarity } = require('../modules/phash');
const { analyzeImages } = require('../modules/gemini');
const { getAllAssets, saveDetection } = require('../modules/firestore');
const { assertSafePublicUrl } = require('../modules/urlSafety');

const PHASH_THRESHOLD  = 80;
const PIRACY_THRESHOLD = 85;

/**
 * POST /api/check
 * Body: { url: string }
 * Returns shape the frontend expects:
 * { piracyDetected, confidence, phashSim, geminiVerdict, type, mod, matchedAsset, detectionId }
 */
module.exports = async function checkHandler(req, res, next) {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url is required' });
    }

    try {
      await assertSafePublicUrl(url);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    // 1. Download suspected image
    let suspectedBuf;
    try {
      const r = await axios.get(url, {
        responseType: 'arraybuffer', timeout: 10000,
        maxContentLength: 10 * 1024 * 1024,
        headers: { 'User-Agent': 'SportsGuard-AI/1.0' },
      });
      if (!(r.headers['content-type'] || '').startsWith('image/')) {
        return res.status(400).json({ error: 'URL does not point to an image' });
      }
      suspectedBuf = Buffer.from(r.data);
    } catch (err) {
      return res.status(400).json({ error: `Failed to download image: ${err.message}` });
    }

    // 2. Hash it
    const suspectedHash = await generateHash(suspectedBuf);

    // 3. Compare against all registered assets
    const assets = await getAllAssets();
    if (!assets.length) {
      return res.json({ piracyDetected: false, reason: 'No registered assets in database' });
    }

    let bestAsset = null, bestSim = 0;
    for (const a of assets) {
      if (!a.phash) continue;
      const s = similarity(a.phash, suspectedHash);
      if (s > bestSim) { bestSim = s; bestAsset = a; }
    }

    // 4. No match
    if (bestSim < PHASH_THRESHOLD) {
      return res.json({
        piracyDetected: false,
        confidence: 0, phashSim: bestSim,
        geminiVerdict: 'NO_MATCH',
        type: 'clean',
        mod: '—',
      });
    }

    // 5. Fetch original for Gemini
    let originalBuf;
    try {
      const r = await axios.get(bestAsset.imageUrl, { responseType: 'arraybuffer', timeout: 10000 });
      originalBuf = Buffer.from(r.data);
    } catch {
      const confidence = Math.round(bestSim * 0.4);
      const type = confidence >= PIRACY_THRESHOLD ? 'piracy' : confidence >= 70 ? 'review' : 'clean';
      return res.json({ piracyDetected: confidence >= PIRACY_THRESHOLD, confidence, phashSim: bestSim, geminiVerdict: 'HASH_ONLY', type, mod: '—', matchedAsset: _safeAsset(bestAsset) });
    }

    // 6. Gemini analysis
    const gemini = await analyzeImages(originalBuf, suspectedBuf);
    const confidence = Math.round(bestSim * 0.4 + gemini.confidence * 0.6);
    const type = confidence >= PIRACY_THRESHOLD ? 'piracy' : confidence >= 70 ? 'review' : 'clean';
    const mod  = gemini.transformations.length ? gemini.transformations.join(' + ') : _verdictToMod(gemini.verdict);
    const piracyDetected = type === 'piracy';

    // 7. Log confirmed / review detections
    let detectionId = null;
    if (piracyDetected || type === 'review') {
      detectionId = await saveDetection({
        assetId: bestAsset.id, suspiciousUrl: url,
        phashSimilarity: bestSim,
        geminiVerdict: gemini.verdict, geminiConfidence: gemini.confidence,
        finalConfidence: confidence,
        owner: bestAsset.owner, title: bestAsset.title, sport: bestAsset.sport,
        transformations: gemini.transformations,
      });
    }

    return res.json({
      piracyDetected,
      confidence, phashSim: bestSim,
      geminiVerdict: gemini.verdict,
      type, mod,
      reasoning: gemini.reasoning,
      evidence:  gemini.evidence,
      transformations: gemini.transformations,
      matchedAsset: _safeAsset(bestAsset),
      detectionId,
    });
  } catch (err) {
    next(err);
  }
};

function _safeAsset(a) {
  return { id: a.id, owner: a.owner, title: a.title, sport: a.sport, license: a.license, phash: a.phash, imageUrl: a.imageUrl, frame: a.frame };
}

function _verdictToMod(verdict) {
  if (verdict === 'EXACT_MATCH')    return 'cropped + filter';
  if (verdict === 'NEAR_DUPLICATE') return 'compressed';
  return '—';
}
