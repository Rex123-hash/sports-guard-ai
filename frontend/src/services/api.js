// SportsGuard AI backend API bridge.
import { getIdToken } from './firebase-auth.js';

const DEFAULT_BASE = import.meta.env.DEV
  ? 'http://localhost:8080'
  : 'https://sportsguard-api-712383807173.us-central1.run.app';

const BASE = import.meta.env.VITE_API_BASE || DEFAULT_BASE;

// Attach the current Firebase ID token (Google or guest) so the gated
// write routes accept the request.
async function authHeaders(extra = {}) {
  const token = await getIdToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

export const SG_API = {
  async register(file, meta) {
    const form = new FormData();
    form.append('image', file);
    form.append('owner', meta.owner);
    form.append('title', meta.title);
    form.append('sport', meta.sport);
    form.append('license', meta.license);
    form.append('notes', meta.notes || '');
    const res = await fetch(`${BASE}/api/register`, { method: 'POST', headers: await authHeaders(), body: form });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || 'Register failed');
    }
    return res.json();
  },

  async check(url) {
    const res = await fetch(`${BASE}/api/check`, {
      method: 'POST',
      headers: await authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || 'Check failed');
    }
    return res.json();
  },

  async verify(file) {
    const form = new FormData();
    form.append('image', file);
    const res = await fetch(`${BASE}/api/verify`, { method: 'POST', headers: await authHeaders(), body: form });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || 'Verify failed');
    }
    return res.json();
  },

  async detections(limit = 20) {
    const res = await fetch(`${BASE}/api/detections?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to load detections');
    return res.json();
  },

  async assets() {
    const res = await fetch(`${BASE}/api/assets`);
    if (!res.ok) throw new Error('Failed to load assets');
    return res.json();
  },

  async health() {
    const res = await fetch(`${BASE}/health`);
    return res.json();
  },
};
