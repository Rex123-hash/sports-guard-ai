const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient();

/**
 * Runs OCR on an image to detect copyright text, watermarks, or ownership markers.
 * @param {Buffer} imageBuffer
 * @returns {Promise<{text: string, hasLicenseText: boolean, annotations: Array}>}
 */
async function detectText(imageBuffer) {
  const [result] = await client.textDetection({ image: { content: imageBuffer } });
  const annotations = result.textAnnotations || [];
  const fullText = annotations.length > 0 ? annotations[0].description || '' : '';

  const licenseKeywords = [
    'copyright', '©', 'all rights reserved', 'licensed', 'getty', 'reuters',
    'ap images', 'afp', 'bcci', 'icc', 'fifa', 'uefa', 'nfl', 'nba', 'mlb',
    'watermark', 'editorial use only', 'do not reproduce',
  ];

  const lowerText = fullText.toLowerCase();
  const hasLicenseText = licenseKeywords.some(kw => lowerText.includes(kw));

  return {
    text: fullText,
    hasLicenseText,
    annotations: annotations.slice(1).map(a => ({
      text: a.description,
      confidence: a.confidence || null,
    })),
  };
}

/**
 * Runs safe search detection — rejects inappropriate content.
 * Returns true if the image is safe to register.
 */
async function isSafe(imageBuffer) {
  const [result] = await client.safeSearchDetection({ image: { content: imageBuffer } });
  const safe = result.safeSearchAnnotation;
  if (!safe) return true;

  const unsafe = ['LIKELY', 'VERY_LIKELY'];
  return !(
    unsafe.includes(safe.adult) ||
    unsafe.includes(safe.violence) ||
    unsafe.includes(safe.racy)
  );
}

/**
 * Detects image labels — used for sport classification validation.
 */
async function detectLabels(imageBuffer) {
  const [result] = await client.labelDetection({ image: { content: imageBuffer } });
  return (result.labelAnnotations || []).map(a => ({
    label: a.description,
    score: Math.round((a.score || 0) * 100),
  }));
}

module.exports = { detectText, isSafe, detectLabels };
