const { getRecentDetections, getStats } = require('../modules/firestore');

/**
 * GET /api/detections?limit=20
 * Returns detections + stats in the exact shape the frontend expects.
 */
module.exports = async function detectionsHandler(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const [detections, stats] = await Promise.all([getRecentDetections(limit), getStats()]);
    return res.json({ detections, stats });
  } catch (err) {
    next(err);
  }
};
