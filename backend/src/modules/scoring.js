/**
 * Single source of truth for the adjudication math used by /check,
 * /check-video, and detection persistence.
 *
 * finalConfidence = 0.4 × dHash similarity + 0.6 × Gemini confidence
 * piracy ≥ 85 · review 70–84 · clean < 70
 *
 * The hash weight is capped below the piracy threshold on purpose: a hash
 * match alone (Gemini unavailable) can never confirm piracy by itself.
 */
const WEIGHT_HASH = 0.4;
const WEIGHT_GEMINI = 0.6;
const PIRACY_THRESHOLD = 85;
const REVIEW_THRESHOLD = 70;

function finalConfidence(phashSim, geminiConfidence) {
  return Math.round(phashSim * WEIGHT_HASH + geminiConfidence * WEIGHT_GEMINI);
}

function classify(confidence) {
  if (confidence >= PIRACY_THRESHOLD) return 'piracy';
  if (confidence >= REVIEW_THRESHOLD) return 'review';
  return 'clean';
}

module.exports = { finalConfidence, classify, PIRACY_THRESHOLD, REVIEW_THRESHOLD };
