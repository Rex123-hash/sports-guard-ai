const sharp = require('sharp');

/**
 * Generates a difference hash (dHash) for an image buffer.
 * dHash compares adjacent pixel brightness across 9×8 grid → 64-bit fingerprint.
 * Robust to: color filters, brightness/contrast changes, resizing, JPEG recompression.
 *
 * @param {Buffer} imageBuffer - Raw image bytes
 * @returns {Promise<string>} 16-character hex hash (64 bits)
 */
async function generateHash(imageBuffer) {
  // Resize to 9×8 grayscale — 9 wide so we get 8 horizontal differences per row
  const { data } = await sharp(imageBuffer)
    .resize(9, 8, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data);
  let bits = 0n;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const left = pixels[row * 9 + col];
      const right = pixels[row * 9 + col + 1];
      bits = (bits << 1n) | (left > right ? 1n : 0n);
    }
  }

  return bits.toString(16).padStart(16, '0');
}

/**
 * Computes Hamming distance between two 64-bit hex hashes.
 * Lower = more similar. 0 = identical. > 10 = likely different content.
 */
function hammingDistance(hashA, hashB) {
  const a = BigInt('0x' + hashA);
  const b = BigInt('0x' + hashB);
  let xor = a ^ b;
  let dist = 0;
  while (xor > 0n) {
    dist += Number(xor & 1n);
    xor >>= 1n;
  }
  return dist;
}

/**
 * Returns similarity percentage (0–100) between two hashes.
 * >= 80 is considered a candidate match and triggers Gemini analysis.
 */
function similarity(hashA, hashB) {
  const dist = hammingDistance(hashA, hashB);
  return Math.round(((64 - dist) / 64) * 100);
}

module.exports = { generateHash, hammingDistance, similarity };
