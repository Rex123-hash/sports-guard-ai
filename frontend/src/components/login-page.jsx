import { useState } from 'react';
import { signInWithGoogle, signInAsGuest } from '../services/firebase-auth.js';

function Spinner({ color = '#7B8497', size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" aria-hidden="true">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-4z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.5 26.9 36 24 36c-5.2 0-9.6-3-11.3-7.3l-6.5 5C9.6 39.5 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.8l6.2 5.2C41.4 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-4z" />
    </svg>
  );
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTerms, setShowTerms] = useState(false);

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error('Google sign-in error:', e);
      const msg = e?.code === 'auth/popup-blocked'
        ? 'Popup blocked - please allow popups for this site.'
        : e?.code === 'auth/unauthorized-domain'
          ? 'Domain not authorised in Firebase Console.'
          : e?.code
            ? `Error: ${e.code}`
            : e?.message || 'Sign-in failed. Please try again.';
      setError(msg);
    }
    setLoading(false);
  }

  async function handleGuest() {
    setGuestLoading(true);
    setError(null);
    try {
      await signInAsGuest();
    } catch (e) {
      console.error('Guest sign-in error:', e);
      setError(e?.message || 'Guest sign-in failed. Please try again.');
    }
    setGuestLoading(false);
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '28px 18px',
        fontFamily: 'Inter, sans-serif',
        backgroundColor: '#F5F8F7',
        backgroundImage: "linear-gradient(rgba(255,255,255,0.32), rgba(255,255,255,0.32)), url('/login-reference.jpeg')",
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.28) 52%, rgba(255,255,255,0.44) 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 520,
          background: 'rgba(255,255,255,0.82)',
          borderRadius: 34,
          border: '1px solid rgba(187, 240, 214, 0.88)',
          boxShadow: '0 24px 80px rgba(72, 203, 144, 0.14), 0 0 0 1px rgba(255,255,255,0.72) inset',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 0%, rgba(118, 241, 184, 0.26), rgba(255,255,255,0) 34%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', padding: '34px 42px 28px', textAlign: 'center' }}>
          <div
            style={{
              width: 84,
              height: 84,
              margin: '0 auto 18px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.74)',
              boxShadow: '0 12px 26px rgba(155, 225, 194, 0.16)',
            }}
          >
            <img src="/logo.png" alt="SportsGuard" style={{ width: 60, height: 60, objectFit: 'contain' }} />
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#22A866',
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: 16,
            }}
          >
            AI-POWERED SPORTS MEDIA SECURITY
          </div>

          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 900,
              fontSize: 56,
              lineHeight: 1.04,
              color: '#0B1220',
              margin: '0 0 18px',
              letterSpacing: 0,
            }}
          >
            Welcome to
            <br />
            Sports<span style={{ color: '#16A34A' }}>Guard.</span>
          </h1>

          <p style={{ fontSize: 18, color: '#70798C', margin: '0 0 30px', lineHeight: 1.58 }}>
            Sign in to protect and monitor
            <br />
            your sports media assets.
          </p>

          <button
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              padding: '18px 22px',
              borderRadius: 18,
              border: '1.5px solid rgba(208, 217, 224, 0.95)',
              background: loading ? '#F8FAF9' : '#FFFFFF',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 17,
              fontWeight: 700,
              color: '#0B1220',
              boxShadow: '0 10px 24px rgba(160, 175, 189, 0.14)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (!loading) e.currentTarget.style.background = '#F8FBFA';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = loading ? '#F8FAF9' : '#FFFFFF';
            }}
          >
            {loading ? <Spinner color="#7B8497" size={20} /> : <GoogleMark />}
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '24px 0 14px' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(208, 216, 222, 0.9)' }} />
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid rgba(197, 225, 211, 0.95)', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.85)' }}>
              <svg width="10" height="12" viewBox="0 0 24 28" fill="none">
                <path d="M12 2l8 3.2v8.4C20 20.6 12 25 12 25S4 20.6 4 13.6V5.2L12 2Z" stroke="#B4C3CF" strokeWidth="1.7" />
              </svg>
            </div>
            <div style={{ flex: 1, height: 1, background: 'rgba(208, 216, 222, 0.9)' }} />
          </div>

          <button
            onClick={handleGuest}
            disabled={guestLoading || loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '15px 22px',
              borderRadius: 18,
              border: '1.5px solid rgba(214, 222, 228, 0.95)',
              background: guestLoading ? '#F7F8F9' : 'rgba(250, 251, 251, 0.94)',
              cursor: guestLoading || loading ? 'not-allowed' : 'pointer',
              fontSize: 15,
              fontWeight: 500,
              color: '#5D677A',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (!guestLoading && !loading) e.currentTarget.style.background = '#F2F5F4';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = guestLoading ? '#F7F8F9' : 'rgba(250, 251, 251, 0.94)';
            }}
          >
            {guestLoading ? (
              <Spinner color="#7B8497" size={18} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
            {guestLoading ? 'Entering...' : 'Continue as Guest'}
          </button>

          {error && (
            <p style={{ marginTop: 14, fontSize: 13, color: '#FF4D2E', fontWeight: 600 }}>{error}</p>
          )}

          <div style={{ marginTop: 26, paddingTop: 18, borderTop: '1px solid rgba(226, 232, 237, 0.92)' }}>
            <p style={{ fontSize: 13, color: '#7E889B', lineHeight: 1.72, margin: 0 }}>
              For authorised rights holders only.
              <br />
              By signing in you agree to the{' '}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  color: '#16A34A',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                }}
              >
                terms of use
              </button>
              .
            </p>
          </div>
        </div>
      </div>

      {showTerms && (
        <div
          onClick={() => setShowTerms(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 20,
            background: 'rgba(8, 15, 25, 0.28)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 640,
              background: 'rgba(255,255,255,0.96)',
              borderRadius: 28,
              border: '1px solid rgba(187, 240, 214, 0.88)',
              boxShadow: '0 24px 80px rgba(72, 203, 144, 0.18)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid rgba(226, 232, 237, 0.92)', display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#22A866', fontFamily: 'JetBrains Mono, monospace' }}>
                  Terms Of Use
                </div>
                <h2 style={{ margin: '10px 0 0', fontFamily: 'Outfit, sans-serif', fontSize: 28, lineHeight: 1.12, color: '#0B1220' }}>
                  SportsGuard access conditions
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  border: '1px solid rgba(208, 216, 222, 0.9)',
                  background: '#fff',
                  color: '#6E7688',
                  cursor: 'pointer',
                  fontSize: 20,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '22px 28px 26px', display: 'grid', gap: 18, color: '#5E687C', fontSize: 14, lineHeight: 1.7 }}>
              <div>
                <strong style={{ color: '#0B1220' }}>Authorised access only.</strong> SportsGuard is intended for broadcasters, leagues, rights holders, and approved demo reviewers using the platform for media protection workflows.
              </div>
              <div>
                <strong style={{ color: '#0B1220' }}>Protected content responsibility.</strong> You must only upload assets, screenshots, and reference frames that you own or are permitted to analyse for verification, registration, or enforcement.
              </div>
              <div>
                <strong style={{ color: '#0B1220' }}>Guest mode limitations.</strong> Guest access is provided for evaluation and demo purposes. It may offer a reduced persistence model and should not be treated as a production-grade account.
              </div>
              <div>
                <strong style={{ color: '#0B1220' }}>Evidence workflow.</strong> Reports, confidence scores, and takedown drafts generated inside SportsGuard are decision-support artifacts. Final legal and operational decisions remain with the rights holder or operator.
              </div>
              <div>
                <strong style={{ color: '#0B1220' }}>Acceptable use.</strong> You agree not to misuse the service for unauthorised surveillance, abusive scraping, or submission of malicious, illegal, or deceptive media.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
