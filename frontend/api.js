// SportsGuard AI — Backend API bridge
// Set window.SG_API_BASE before this script to override (e.g. for local dev)
(function () {
  const BASE = window.SG_API_BASE || 'https://sportsguard-api-712383807173.us-central1.run.app';

  const API = {
    /**
     * POST /api/register
     * @param {File} file - image file
     * @param {{ owner, title, sport, license }} meta
     * @returns {Promise<{ assetId, phash, imageUrl, description }>}
     */
    async register(file, meta) {
      const form = new FormData();
      form.append('image', file);
      form.append('owner', meta.owner);
      form.append('title', meta.title);
      form.append('sport', meta.sport);
      form.append('license', meta.license);
      const res = await fetch(`${BASE}/api/register`, { method: 'POST', body: form });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Register failed'); }
      return res.json();
    },

    /**
     * POST /api/check
     * @param {string} url - suspicious URL to check
     * @returns {Promise<{ piracyDetected, finalConfidence, phashSimilarity, geminiAnalysis, matchedAsset }>}
     */
    async check(url) {
      const res = await fetch(`${BASE}/api/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Check failed'); }
      return res.json();
    },

    /**
     * POST /api/verify
     * @param {File} file - image to scan for watermarks/copyright
     * @returns {Promise<{ extractedText, hasLicenseText, textAnnotations, labels }>}
     */
    async verify(file) {
      const form = new FormData();
      form.append('image', file);
      const res = await fetch(`${BASE}/api/verify`, { method: 'POST', body: form });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Verify failed'); }
      return res.json();
    },

    /**
     * GET /api/detections
     * @returns {Promise<{ detections, stats }>}
     */
    async detections(limit = 20) {
      const res = await fetch(`${BASE}/api/detections?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to load detections');
      return res.json();
    },

    /** Health check */
    async health() {
      const res = await fetch(`${BASE}/health`);
      return res.json();
    },
  };

  window.SG_API = API;
})();
