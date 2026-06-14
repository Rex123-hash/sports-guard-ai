import { Icon } from '../components/primitives.jsx';

export default function Landing({ onNav }) {
  return (
    <div style={{ position: 'relative', display: 'block', marginBottom: 0, minHeight: 'calc(100vh - 73px)', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: "url('/landing-reference-bg.jpeg')",
        backgroundPosition: 'center top',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#f7faf8',
        opacity: 0.60,
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.18) 36%, rgba(255,255,255,0.44) 100%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div className="page" style={{ padding: '48px 40px 0', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1, flex: '0 0 auto', minHeight: 'auto' }}>
        <div className="ph-stripes" style={{ position: 'absolute', top: 0, left: '-20%', width: '140%', height: '140%', opacity: 0.05, pointerEvents: 'none', zIndex: -1 }}></div>

        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 48, marginTop: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 100, border: '1px solid rgba(22, 163, 74, 0.2)', color: 'var(--moss)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24, background: 'rgba(22,163,74,0.05)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
            AI-POWERED SPORTS MEDIA SECURITY
          </div>
          <h1 className="page-title" style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, margin: '0 0 16px 0', textTransform: 'none' }}>
            Welcome to<br/>Sports<span style={{ color: 'var(--moss)' }}>Guard.</span>
          </h1>
          <div className="page-sub" style={{ margin: '0 auto', fontSize: 18, maxWidth: 640 }}>
            The fastest way to protect your digital sports media.<br/>Register your official frames and video clips, and let our AI<br/>catch unauthorized copies across images and video in seconds.
          </div>
        </div>

        <div className="fade-up delay-1" style={{ textAlign: 'center', marginBottom: 32, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--moss)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2 }}>
            <path d="M15 14l5-5-5-5"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/>
          </svg>
          <div className="eyebrow" style={{ fontSize: 13, letterSpacing: '0.15em', fontWeight: 700, color: 'var(--moss)' }}>WHAT WOULD YOU LIKE TO DO?</div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          <div className="card fade-up delay-2" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            onClick={() => onNav('register')}>
            <div className="ph-dots" style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, opacity: 0.4, pointerEvents: 'none' }} />
            <div className="card-pad-lg" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
              <div style={{ width: 48, height: 48, background: 'rgba(22, 163, 74, 0.1)', color: 'var(--moss)', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>{Icon.upload}</div>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontFamily: 'Inter Tight', fontWeight: 600 }}>Protect an Asset</h3>
                <p style={{ margin: 0, color: 'var(--ink-mute)', fontSize: 13, lineHeight: 1.5 }}>Upload an official frame to generate a permanent digital fingerprint.</p>
              </div>
              <button className="btn ghost mt-2" style={{ width: '100%', justifyContent: 'center', border: '1px solid var(--line)' }}>Start {Icon.arrow}</button>
            </div>
          </div>

          <div className="card fade-up delay-3" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            onClick={() => onNav('check')}>
            <div className="ph-dots" style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, opacity: 0.4, pointerEvents: 'none' }} />
            <div className="card-pad-lg" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
              <div style={{ width: 48, height: 48, background: 'rgba(255, 77, 46, 0.1)', color: 'var(--coral)', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>{Icon.bolt}</div>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontFamily: 'Inter Tight', fontWeight: 600 }}>Scan a URL</h3>
                <p style={{ margin: 0, color: 'var(--ink-mute)', fontSize: 13, lineHeight: 1.5 }}>Found suspicious content? Paste the image URL to check for piracy.</p>
              </div>
              <button className="btn coral mt-2" style={{ width: '100%', justifyContent: 'center' }}>Scan now {Icon.arrow}</button>
            </div>
          </div>

          <div className="card fade-up delay-4" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            onClick={() => onNav('guide')}>
            <div className="ph-dots" style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, opacity: 0.4, pointerEvents: 'none' }} />
            <div className="card-pad-lg" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
              <div style={{ width: 48, height: 48, background: 'var(--cream-2)', color: 'var(--ink-3)', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>{Icon.link}</div>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontFamily: 'Inter Tight', fontWeight: 600 }}>Help & FAQ</h3>
                <p style={{ margin: 0, color: 'var(--ink-mute)', fontSize: 13, lineHeight: 1.5 }}>New here? Read our beginner-friendly guide to understand how it works.</p>
              </div>
              <button className="btn ghost mt-2" style={{ width: '100%', justifyContent: 'center', border: '1px solid var(--line)' }}>Read Guide {Icon.arrow}</button>
            </div>
          </div>
        </div>

        <div className="fade-up delay-6" style={{ marginTop: 40, marginBottom: 24, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, color: 'var(--moss)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, letterSpacing: '0.15em' }}>PROTECTING THE GAME. PRESERVING THE TRUTH.</div>
        </div>
      </div>
    </div>
  );
}
