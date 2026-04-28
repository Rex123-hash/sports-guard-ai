import React, { useState } from 'react';
import { signInWithGoogle } from '../services/firebase-auth';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Sign-in failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#F4F5F7', fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '52px 48px',
        boxShadow: '0 8px 40px rgba(11,18,32,0.10), 0 0 0 1px rgba(11,18,32,0.06)',
        maxWidth: 420, width: '100%', textAlign: 'center',
      }}>

        {/* Logo */}
        <div style={{
          width: 64, height: 64, background: '#0B1220', borderRadius: 16,
          display: 'grid', placeItems: 'center', margin: '0 auto 24px',
          boxShadow: '0 4px 16px rgba(11,18,32,0.18)',
        }}>
          <svg width="32" height="32" viewBox="0 0 80 90" fill="none">
            <path d="M40 4L74 18V54C74 72 40 86 40 86C40 86 6 72 6 54V18L40 4Z" fill="white" opacity="0.15"/>
            <path d="M40 4L74 18V54C74 72 40 86 40 86C40 86 6 72 6 54V18L40 4Z" stroke="white" strokeWidth="3"/>
            <path d="M28 44l8 8 16-16" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 28,
          color: '#0B1220', margin: '0 0 8px', letterSpacing: '-0.5px',
        }}>
          Sports<span style={{ color: '#16A34A' }}>Guard.</span>
        </h1>
        <p style={{ fontSize: 14, color: '#7B8497', margin: '0 0 36px', lineHeight: 1.6 }}>
          AI-powered sports media protection.<br/>Sign in to access the platform.
        </p>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 12, padding: '13px 20px', borderRadius: 10,
            border: '1px solid #DEE1E7', background: loading ? '#f5f5f5' : '#fff',
            cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 600,
            color: '#0B1220', transition: 'all 0.2s',
            boxShadow: '0 1px 3px rgba(11,18,32,0.08)',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#F4F5F7'; }}
          onMouseLeave={e => { e.currentTarget.style.background = loading ? '#f5f5f5' : '#fff'; }}
        >
          {loading ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B8497" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
              </path>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-4z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.5 26.9 36 24 36c-5.2 0-9.6-3-11.3-7.3l-6.5 5C9.6 39.5 16.3 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.8l6.2 5.2C41.4 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-4z"/>
            </svg>
          )}
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        {error && (
          <p style={{ marginTop: 16, fontSize: 13, color: '#FF4D2E', fontWeight: 500 }}>
            {error}
          </p>
        )}

        <p style={{ marginTop: 28, fontSize: 11, color: '#7B8497', lineHeight: 1.6 }}>
          By signing in you agree to our terms of use.<br/>
          For authorised rights holders only.
        </p>
      </div>
    </div>
  );
}
