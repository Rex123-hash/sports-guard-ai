const { detectText, detectLabels } = require('../modules/vision');
const { verifyAuthenticity } = require('../modules/gemini');

/**
 * POST /api/verify
 * Multipart form: image (file)
 * Cloud Vision OCR extracts copyright/ownership text + sport labels, then
 * Gemini 2.5 Flash judges the frame's provenance/authenticity.
 */
module.exports = async function verifyHandler(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'image file is required' });

    const imageBuffer = req.file.buffer;

    const [textResult, labels] = await Promise.all([
      detectText(imageBuffer),
      detectLabels(imageBuffer),
    ]);

    // Real multimodal provenance assessment. Degrade gracefully to OCR-only
    // if the model call fails, so Verify never hard-fails.
    let gemini = null;
    try {
      gemini = await verifyAuthenticity(imageBuffer, textResult.text);
    } catch (err) {
      console.error('[verify] Gemini authenticity failed:', err.message);
    }

    return res.json({
      extractedText: textResult.text,
      hasLicenseText: textResult.hasLicenseText,
      textAnnotations: textResult.annotations.slice(0, 12),
      labels: labels.slice(0, 8),
      gemini,
    });
  } catch (err) {
    next(err);
  }
};
