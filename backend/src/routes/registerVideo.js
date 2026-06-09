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
    if (!result.frames || !result.frames.length) {
      return res.status(400).json({ error: 'No usable frames found in the video' });
    }

    // Upload every keyframe so a match can show + adjudicate the exact frame.
    const frames = await Promise.all(result.frames.map(async (f) => {
      const buf = Buffer.from(f.b64, 'base64');
      const { imageUrl } = await uploadImage(buf, 'image/jpeg', 'frames');
      return { hash: f.hash, imageUrl };
    }));
    const thumbIdx = Math.min(result.thumbIndex || 0, frames.length - 1);
    const thumbnail = frames[thumbIdx].imageUrl;
    const frameHashes = frames.map(f => f.hash);

    let description = '';
    try { description = await describeImage(Buffer.from(result.frames[thumbIdx].b64, 'base64')); } catch { /* optional */ }

    const assetId = await saveAsset({
      owner, title, sport, license, notes: notes || '',
      type: 'video',
      phash: frameHashes[0],
      frameHashes,
      frames,
      frameCount: frames.length,
      description, imageUrl: thumbnail,
      frame: 'VIDEO',
    });

    return res.status(201).json({
      assetId, type: 'video', frameCount: frames.length, imageUrl: thumbnail, description,
      asset: {
        id: assetId, owner, title, sport, license, type: 'video',
        phash: frameHashes[0], frameHashes, frames, frameCount: frames.length,
        imageUrl: thumbnail, frame: 'VIDEO', registered: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  } finally {
    if (req.file && req.file.path) fs.unlink(req.file.path, () => {});
  }
};
