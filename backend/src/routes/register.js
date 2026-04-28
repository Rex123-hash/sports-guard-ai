const { generateHash } = require('../modules/phash');
const { describeImage } = require('../modules/gemini');
const { isSafe } = require('../modules/vision');
const { uploadImage } = require('../modules/storage');
const { saveAsset } = require('../modules/firestore');

/**
 * POST /api/register
 * Multipart: image (file), owner, title, sport, license, frame (optional timecode)
 */
module.exports = async function registerHandler(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'image file is required' });

    const { owner, title, sport, license, frame } = req.body;
    if (!owner || !title || !sport || !license) {
      return res.status(400).json({ error: 'owner, title, sport, and license are required' });
    }

    const buf  = req.file.buffer;
    const mime = req.file.mimetype;

    const safe = await isSafe(buf);
    if (!safe) return res.status(400).json({ error: 'Image failed content safety check' });

    const [phash, description, { storagePath, imageUrl }] = await Promise.all([
      generateHash(buf),
      describeImage(buf),
      uploadImage(buf, mime, 'originals'),
    ]);

    const assetId = await saveAsset({
      owner, title, sport, license,
      frame: frame || 'F-00:00:00',
      phash, description, imageUrl, storagePath,
    });

    return res.status(201).json({
      assetId, phash, imageUrl, description,
      // Return in frontend-compatible shape
      asset: { id: assetId, owner, title, sport, license, phash, frame: frame || 'F-00:00:00', registered: new Date().toISOString() },
    });
  } catch (err) {
    next(err);
  }
};
