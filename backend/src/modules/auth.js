const admin = require('firebase-admin');

// Initialise the Admin SDK once. On Cloud Run this picks up the attached service
// account via ADC; projectId pins token-audience validation to this project.
if (!admin.apps.length) {
  admin.initializeApp({ projectId: process.env.GCP_PROJECT_ID });
}

/**
 * Express middleware: requires a valid Firebase ID token.
 * Accepts both Google sign-in and anonymous (guest) tokens.
 * The dashboard read routes (/assets, /detections) stay public; only the
 * mutating / cost-bearing routes (register, check, verify) are gated.
 */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer (.+)$/i);

  if (!match) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(match[1]);
    req.user = {
      uid: decoded.uid,
      email: decoded.email || null,
      anonymous: decoded.firebase?.sign_in_provider === 'anonymous',
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

module.exports = { requireAuth };
