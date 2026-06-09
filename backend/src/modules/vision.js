const vision = require('@google-cloud/vision');
const sharp = require('sharp');

const client = new vision.ImageAnnotatorClient();

const LICENSE_KEYWORDS = [
  'copyright', '©', 'all rights reserved', 'licensed', 'getty', 'reuters',
  'ap images', 'afp', 'bcci', 'icc', 'fifa', 'uefa', 'nfl', 'nba', 'mlb',
  'watermark', 'editorial use only', 'do not reproduce',
];

/**
 * Runs OCR on an image to detect copyright text, watermarks, or ownership markers.
 * @param {Buffer} imageBuffer
 * @returns {Promise<{text: string, hasLicenseText: boolean, annotations: Array}>}
 */
async function detectText(imageBuffer) {
  const [result] = await client.textDetection({ image: { content: imageBuffer } });
  const annotations = result.textAnnotations || [];
  const fullText = annotations.length > 0 ? annotations[0].description || '' : '';

  const lowerText = fullText.toLowerCase();
  const hasLicenseText = LICENSE_KEYWORDS.some(kw => lowerText.includes(kw));

  // Image dimensions so we can express each text box as a percentage,
  // letting the frontend overlay real boxes on the displayed image.
  let W = 1, H = 1;
  try {
    const meta = await sharp(imageBuffer).metadata();
    W = meta.width || 1;
    H = meta.height || 1;
  } catch { /* fall back to 1×1 → percentages near 0 */ }

  const positioned = annotations.slice(1).map(a => {
    const verts = (a.boundingPoly && a.boundingPoly.vertices) || [];
    const xs = verts.map(v => v.x || 0);
    const ys = verts.map(v => v.y || 0);
    const minX = xs.length ? Math.min(...xs) : 0;
    const maxX = xs.length ? Math.max(...xs) : 0;
    const minY = ys.length ? Math.min(...ys) : 0;
    const maxY = ys.length ? Math.max(...ys) : 0;
    const text = a.description || '';
    const kind = LICENSE_KEYWORDS.some(kw => text.toLowerCase().includes(kw)) ? 'copyright' : 'text';
    return {
      text,
      kind,
      confidence: a.confidence || null,
      x: +(minX / W * 100).toFixed(1),
      y: +(minY / H * 100).toFixed(1),
      w: +((maxX - minX) / W * 100).toFixed(1),
      h: +((maxY - minY) / H * 100).toFixed(1),
    };
  });

  return { text: fullText, hasLicenseText, annotations: positioned };
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
