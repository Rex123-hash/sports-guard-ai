// Landing Page - Introductory Screen
function Landing({ onNav }) {
  return (
    <div style={{ position: 'relative', display: 'block' }}>
      
      {/* Background Player (Left) */}
      <div style={{ 
        position: 'absolute',
        left: '8%',
        top: -6,
        bottom: 84,
        width: '39%',
        backgroundImage: "url('/player.jpeg')",
        backgroundPosition: '76% 10%',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        opacity: 0.33,
        pointerEvents: 'none',
        zIndex: 0,
        maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 100%)'
      }} />

      {/* Background Stadium (Right) */}
      <div style={{ 
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '55%',
        backgroundImage: "url('/stadium.jpeg')", backgroundPosition: 'right center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat',
        opacity: 0.65, pointerEvents: 'none', zIndex: 0,
        maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)'
      }} />

      <div className="page" style={{ padding: '48px 40px 8px', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1, flex: '0 0 auto' }}>
        
        {/* Background patterns */}
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
          The fastest way to protect your digital sports media.<br/>Register your official broadcast frames, and let our AI instantly<br/>verify any suspicious URLs to stop piracy in its tracks.
        </div>
      </div>

      <div className="fade-up delay-1" style={{ textAlign: 'center', marginBottom: 32, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--moss)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2 }}>
          <path d="M15 14l5-5-5-5"/>
          <path d="M4 20v-7a4 4 0 0 1 4-4h12"/>
        </svg>
        <div className="eyebrow" style={{ fontSize: 13, letterSpacing: '0.15em', fontWeight: 700, color: 'var(--moss)' }}>WHAT WOULD YOU LIKE TO DO?</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {/* CARD 1 */}
        <div 
          className="card fade-up delay-2" 
          style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative', overflow: 'hidden' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-2)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          onClick={() => onNav('register')}
        >
          <div className="ph-dots" style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, opacity: 0.4, pointerEvents: 'none' }} />
          <div className="card-pad-lg" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 48, height: 48, background: 'rgba(22, 163, 74, 0.1)', color: 'var(--moss)', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
              {Icon.upload}
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontFamily: 'Inter Tight', fontWeight: 600 }}>Protect an Asset</h3>
              <p style={{ margin: 0, color: 'var(--ink-mute)', fontSize: 13, lineHeight: 1.5 }}>
                Upload an official frame to generate a permanent digital fingerprint.
              </p>
            </div>
            <button className="btn ghost mt-2" style={{ width: '100%', justifyContent: 'center', border: '1px solid var(--line)' }}>Start {Icon.arrow}</button>
          </div>
        </div>

        {/* CARD 2 */}
        <div 
          className="card fade-up delay-3" 
          style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative', overflow: 'hidden' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-2)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          onClick={() => onNav('check')}
        >
          <div className="ph-dots" style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, opacity: 0.4, pointerEvents: 'none' }} />
          <div className="card-pad-lg" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 48, height: 48, background: 'rgba(255, 77, 46, 0.1)', color: 'var(--coral)', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
              {Icon.bolt}
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontFamily: 'Inter Tight', fontWeight: 600 }}>Scan a URL</h3>
              <p style={{ margin: 0, color: 'var(--ink-mute)', fontSize: 13, lineHeight: 1.5 }}>
                Found suspicious content? Paste the image URL to check for piracy.
              </p>
            </div>
            <button className="btn coral mt-2" style={{ width: '100%', justifyContent: 'center' }}>Scan now {Icon.arrow}</button>
          </div>
        </div>

        {/* CARD 3 */}
        <div 
          className="card fade-up delay-4" 
          style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative', overflow: 'hidden' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-2)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          onClick={() => onNav('guide')}
        >
          <div className="ph-dots" style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, opacity: 0.4, pointerEvents: 'none' }} />
          <div className="card-pad-lg" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 48, height: 48, background: 'var(--cream-2)', color: 'var(--ink-3)', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
              {Icon.link}
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontFamily: 'Inter Tight', fontWeight: 600 }}>Help & FAQ</h3>
              <p style={{ margin: 0, color: 'var(--ink-mute)', fontSize: 13, lineHeight: 1.5 }}>
                New here? Read our beginner-friendly guide to understand how it works.
              </p>
            </div>
            <button className="btn ghost mt-2" style={{ width: '100%', justifyContent: 'center', border: '1px solid var(--line)' }}>Read Guide {Icon.arrow}</button>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="fade-up delay-5" style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16, padding: '20px 24px', marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 24, boxShadow: 'var(--shadow-1)' }}>
        
        {/* STAT 1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderRight: '1px solid var(--line)', paddingRight: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(22,163,74,0.1)', color: 'var(--moss)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 600 }}>ASSETS PROTECTED</div>
            <div style={{ fontSize: 24, fontFamily: 'Outfit, sans-serif', fontWeight: 800, lineHeight: 1.1, marginTop: 4, color: 'var(--ink)' }}>128</div>
            <div style={{ fontSize: 11, color: 'var(--moss)', fontWeight: 500, marginTop: 4 }}>↑ 18% this week</div>
          </div>
        </div>

        {/* STAT 2 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderRight: '1px solid var(--line)', paddingRight: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,77,46,0.1)', color: 'var(--coral)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 600 }}>SCANS PERFORMED</div>
            <div style={{ fontSize: 24, fontFamily: 'Outfit, sans-serif', fontWeight: 800, lineHeight: 1.1, marginTop: 4, color: 'var(--ink)' }}>532</div>
            <div style={{ fontSize: 11, color: 'var(--moss)', fontWeight: 500, marginTop: 4 }}>↑ 24% this week</div>
          </div>
        </div>

        {/* STAT 3 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderRight: '1px solid var(--line)', paddingRight: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--cream-2)', color: 'var(--ink-3)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 600 }}>THREATS DETECTED</div>
            <div style={{ fontSize: 24, fontFamily: 'Outfit, sans-serif', fontWeight: 800, lineHeight: 1.1, marginTop: 4, color: 'var(--ink)' }}>68</div>
            <div style={{ fontSize: 11, color: 'var(--coral)', fontWeight: 500, marginTop: 4 }}>↓ 10% vs last week</div>
          </div>
        </div>

        {/* STAT 4 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(22,163,74,0.1)', color: 'var(--moss)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 600 }}>ACCURACY RATE</div>
            <div style={{ fontSize: 24, fontFamily: 'Outfit, sans-serif', fontWeight: 800, lineHeight: 1.1, marginTop: 4, color: 'var(--ink)' }}>99.2%</div>
            <div style={{ fontSize: 11, color: 'var(--moss)', fontWeight: 500, marginTop: 4 }}>↑ 2.1% improvement</div>
          </div>
        </div>

      </div>

      {/* BOTTOM TEXT */}
      <div className="fade-up delay-6" style={{ marginTop: 20, marginBottom: 0, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, color: 'var(--moss)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, letterSpacing: '0.15em' }}>PROTECTING THE GAME. PRESERVING THE TRUTH.</div>
      </div>

    </div>
    </div>
  );
}

window.Landing = Landing;
