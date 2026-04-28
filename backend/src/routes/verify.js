const { detectText, detectLabels } = require('../modules/vision');

/**
 * POST /api/verify
 * Multipart form: image (file)
 * Runs OCR to extract copyright/ownership text and detects sport labels.
 */
module.exports = async function verifyHandler(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'image file is required' });

    const imageBuffer = req.file.buffer;

    const [textResult, labels] = await Promise.all([
      detectText(imageBuffer),
      detectLabels(imageBuffer),
    ]);

    return res.json({
      extractedText: textResult.text,
      hasLicenseText: textResult.hasLicenseText,
      textAnnotations: textResult.annotations.slice(0, 10),
      labels: labels.slice(0, 8),
    });
  } catch (err) {
    next(err);
  }
};
