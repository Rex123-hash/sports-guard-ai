const fs = require('node:fs');
const { runVideoRegister } = require('../modules/videoDetect');
const { uploadImage } = require('../modules/storage');
const { saveAsset } = require('../modules/firestore');
const { describeImage } = require('../modules/gemini');

/**
 * POST /api/register-video
 * Multipart: video (file), owner, title, sport, license, notes
 * Fingerprints every keyframe of the clip and registers it as a video asset.
 */
module.exports = async function registerVideoHandler(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'video file is required' });

    const { owner, title, sport, license, notes } = req.body;
    if (!owner || !title || !sport || !license) {
      return res.status(400).json({ error: 'owner, title, sport, and license are required' });
    }

    let result;
    try {
      result = await runVideoRegister(req.file.path);
    } catch (e) {
      return res.status(400).json({ error: `Video fingerprinting failed: ${e.message}` });
    }
    if (result.error) return res.status(400).json({ error: result.error });
    if (!result.frameHashes || !result.frameHashes.length) {
      return res.status(400).json({ error: 'No usable frames found in the video' });
    }

    const thumbBuf = Buffer.from(result.thumbB64, 'base64');
    const { storagePath, imageUrl } = await uploadImage(thumbBuf, 'image/jpeg', 'originals');

    let description = '';
    try { description = await describeImage(thumbBuf); } catch { /* optional */ }

    const assetId = await saveAsset({
      owner, title, sport, license, notes: notes || '',
      type: 'video',
      phash: result.frameHashes[0],
      frameHashes: result.frameHashes,
      frameCount: result.frameCount,
      description, imageUrl, storagePath,
      frame: 'VIDEO',
    });

    return res.status(201).json({
      assetId, type: 'video', frameCount: result.frameCount, imageUrl, description,
      asset: {
        id: assetId, owner, title, sport, license, type: 'video',
        phash: result.frameHashes[0], frameHashes: result.frameHashes, frameCount: result.frameCount,
        imageUrl, frame: 'VIDEO', registered: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  } finally {
    if (req.file && req.file.path) fs.unlink(req.file.path, () => {});
  }
};
