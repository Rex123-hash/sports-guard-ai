const { getAllAssets } = require('../modules/firestore');

/**
 * GET /api/assets
 * Returns the active protected assets registry for the frontend.
 */
module.exports = async function assetsHandler(req, res, next) {
  try {
    const assets = await getAllAssets();
    return res.json({ assets });
  } catch (err) {
    next(err);
  }
};
