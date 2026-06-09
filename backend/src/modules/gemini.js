const { GoogleGenAI } = require('@google/genai');

const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.5-flash';

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GCP_PROJECT_ID,
  location: process.env.GCP_REGION || 'us-central1',
});

const ANALYSIS_PROMPT = `You are a forensic sports media piracy detection system. You will receive two images.

Image 1 (ORIGINAL): The officially registered sports media — the rights holder's authentic content.
Image 2 (SUSPECTED): An image found at a submitted URL that may be an unauthorized copy.

Your task: Determine if Image 2 is an unauthorized copy or derivative of Image 1.

Analyze specifically for:
- Same sporting event or moment (same players, same action, same venue/stadium, same scoreboard state)
- Transformations applied to Image 2: cropping, color grading, brightness/contrast adjustment, watermark overlay, mirroring, slight rotation, compression artifacts, filter application
- Whether the underlying content is identical despite transformations

Respond with ONLY valid JSON. No markdown. No explanation outside the JSON. This exact schema:
{
  "verdict": "EXACT_MATCH" | "NEAR_DUPLICATE" | "DIFFERENT_CONTENT",
  "confidence": <integer 0-100>,
  "reasoning": "<single sentence summarizing your determination>",
  "evidence": "<specific visual details that led to this verdict — mention players, jersey colors, stadium features, scoreboard, play action>",
  "transformations": ["<detected transformation 1>", "<detected transformation 2>"]
}

VERDICT GUIDE:
- EXACT_MATCH (confidence 80-100): Same image, identical or near-identical content, possibly recompressed, cropped, or color-filtered
- NEAR_DUPLICATE (confidence 60-80): Same sporting event/moment but clearly re-processed, re-shot from similar angle, or heavily transformed
- DIFFERENT_CONTENT (confidence 0-40): Different event, different players, different venue, or unrelated sports content`;

/**
 * Analyzes two images for visual similarity using Gemini.
 *
 * @param {Buffer} originalBuffer - The registered original image
 * @param {Buffer} suspectedBuffer - The downloaded suspected copy
 * @returns {Promise<{verdict, confidence, reasoning, evidence, transformations}>}
 */
async function analyzeImages(originalBuffer, suspectedBuffer) {
  const originalBase64 = originalBuffer.toString('base64');
  const suspectedBase64 = suspectedBuffer.toString('base64');

  // Detect MIME types via magic bytes
  const originalMime = detectMime(originalBuffer);
  const suspectedMime = detectMime(suspectedBuffer);

  const response = await generateWithFallback({
    model: PRIMARY_MODEL,
    // Gemini 2.5 Flash has "thinking" on by default; those tokens were eating the
    // 512 budget and truncating the JSON mid-string. Disable thinking and give the
    // visible output room so the verdict JSON always completes.
    config: {
      maxOutputTokens: 2048,
      temperature: 0.1,
      topP: 0.9,
      thinkingConfig: { thinkingBudget: 0 },
    },
    contents: [
      {
        role: 'user',
        parts: [
          { text: ANALYSIS_PROMPT },
          { text: 'Image 1 (ORIGINAL):' },
          { inlineData: { mimeType: originalMime, data: originalBase64 } },
          { text: 'Image 2 (SUSPECTED):' },
          { inlineData: { mimeType: suspectedMime, data: suspectedBase64 } },
        ],
      },
    ],
  });

  const text = response.candidates[0].content.parts[0].text.trim();
  return parseGeminiResponse(text);
}

/**
 * Analyzes a single image and returns a content description.
 * Used during asset registration to generate metadata.
 */
async function describeImage(imageBuffer) {
  const base64 = imageBuffer.toString('base64');
  const mime = detectMime(imageBuffer);

  const response = await generateWithFallback({
    model: PRIMARY_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          { text: 'Describe this sports image concisely in 1-2 sentences. Include: the sport, key players or teams if identifiable, the action or moment shown, and the venue. Be factual and specific.' },
          { inlineData: { mimeType: mime, data: base64 } },
        ],
      },
    ],
  });

  return response.candidates[0].content.parts[0].text.trim();
}

const VERIFY_PROMPT = `You are a sports broadcast provenance analyst. You receive one image frame plus any text an OCR engine extracted from it.

Decide whether this looks like an AUTHENTIC, licensed broadcast or press frame, versus an unverified, repurposed, or synthetic image.

Weigh evidence such as:
- Broadcaster overlays, score bugs / scoreboards, channel logos, lower-thirds
- Copyright, watermark, or agency marks (Getty, Reuters, AP, AFP, broadcaster names, the © symbol)
- Editorial / press-pool markings
- Signs of re-capture, screenshots, heavy compression, cropping of overlays, or synthetic generation
- Whether the OCR text contains ownership or licensing cues

Respond with ONLY valid JSON, no markdown, exactly this schema:
{
  "authenticity": <integer 0-100>,
  "status": "Authentic" | "Likely authentic" | "Needs review" | "Unverified",
  "reasoning": "<one or two sentences explaining the call>",
  "signals": ["<short provenance signal>", "<short provenance signal>"]
}

GUIDE:
- 85-100 Authentic: clear broadcaster/agency marks or official overlays
- 65-84 Likely authentic / Needs review: some cues but incomplete or ambiguous
- 0-64 Unverified: no ownership cues, looks generic, repurposed, or synthetic`;

/**
 * Uses Gemini to assess the provenance/authenticity of an uploaded frame,
 * combining the visual content with OCR text. Powers the Verify Frame feature.
 * @param {Buffer} imageBuffer
 * @param {string} ocrText - text extracted by Cloud Vision OCR
 * @returns {Promise<{authenticity:number, status:string, reasoning:string, signals:string[]}>}
 */
async function verifyAuthenticity(imageBuffer, ocrText) {
  const base64 = imageBuffer.toString('base64');
  const mime = detectMime(imageBuffer);

  const response = await generateWithFallback({
    model: PRIMARY_MODEL,
    config: { maxOutputTokens: 1024, temperature: 0.2, topP: 0.9, thinkingConfig: { thinkingBudget: 0 } },
    contents: [
      {
        role: 'user',
        parts: [
          { text: VERIFY_PROMPT },
          { text: 'OCR-extracted text from the image:\n' + (ocrText && ocrText.trim() ? ocrText : '(no text detected)') },
          { inlineData: { mimeType: mime, data: base64 } },
        ],
      },
    ],
  });

  const text = response.candidates[0].content.parts[0].text.trim();
  return parseVerifyResponse(text);
}

function parseVerifyResponse(text) {
  const cleaned = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Gemini returned unparseable verify response: ' + text.slice(0, 200));
    parsed = JSON.parse(match[0]);
  }

  const status = ['Authentic', 'Likely authentic', 'Needs review', 'Unverified'].includes(parsed.status)
    ? parsed.status
    : 'Needs review';

  return {
    authenticity: Math.min(100, Math.max(0, parseInt(parsed.authenticity) || 0)),
    status,
    reasoning: String(parsed.reasoning || ''),
    signals: Array.isArray(parsed.signals) ? parsed.signals.map(String).slice(0, 6) : [],
  };
}

async function generateWithFallback(request) {
  try {
    return await ai.models.generateContent(request);
  } catch (error) {
    const message = String(error?.message || '');
    const shouldFallback =
      request.model !== FALLBACK_MODEL &&
      (message.includes('NOT_FOUND') ||
        message.includes('was not found') ||
        message.includes('Publisher Model') ||
        message.includes('does not have access'));

    if (!shouldFallback) throw error;

    return ai.models.generateContent({
      ...request,
      model: FALLBACK_MODEL,
    });
  }
}

function parseGeminiResponse(text) {
  // Strip markdown code fences if Gemini wraps the JSON anyway
  const cleaned = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Gemini occasionally produces slightly malformed JSON — attempt extraction
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Gemini returned unparseable response: ' + text.slice(0, 200));
    parsed = JSON.parse(match[0]);
  }

  const verdict = ['EXACT_MATCH', 'NEAR_DUPLICATE', 'DIFFERENT_CONTENT'].includes(parsed.verdict)
    ? parsed.verdict
    : 'DIFFERENT_CONTENT';

  return {
    verdict,
    confidence: Math.min(100, Math.max(0, parseInt(parsed.confidence) || 0)),
    reasoning: String(parsed.reasoning || ''),
    evidence: String(parsed.evidence || ''),
    transformations: Array.isArray(parsed.transformations) ? parsed.transformations : [],
  };
}

function detectMime(buffer) {
  // Check magic bytes
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return 'image/jpeg';
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png';
  if (buffer[0] === 0x47 && buffer[1] === 0x49) return 'image/gif';
  if (buffer[0] === 0x52 && buffer[1] === 0x49) return 'image/webp';
  return 'image/jpeg'; // fallback
}

module.exports = { analyzeImages, describeImage, verifyAuthenticity };
