// One-off: build a transformed (cropped + brightness/contrast + recompressed) copy
// of the registered cricket frame so the Check page has a guaranteed piracy demo
// that still shows visible transformations. Writes demo-cricket-cropped.jpg locally.
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');

const ORIGINAL = 'https://storage.googleapis.com/sportsguard-assets/originals/008e9516-f0cd-4e94-b12c-d74352572116.jpeg';

(async () => {
  const { data } = await axios.get(ORIGINAL, { responseType: 'arraybuffer' });
  // Color-grade + recompress (no crop). dHash is robust to brightness/colour/
  // compression, so similarity stays high (clear piracy) while Gemini still
  // reports the visible colour-shift / compression transformations.
  const out = await sharp(Buffer.from(data))
    .modulate({ brightness: 1.18, saturation: 1.25, hue: 8 })
    .linear(1.1, -8) // mild contrast bump
    .jpeg({ quality: 58 })
    .toBuffer();

  fs.writeFileSync('demo-cricket-cropped.jpg', out);
  console.log(`wrote demo-cricket-cropped.jpg  ${out.length} bytes`);
})();
