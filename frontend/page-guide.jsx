// page-guide.jsx
const { useState: useStateGuide } = React;

function Guide({ onNav }) {
  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <div className="page-head">
        <div>
          <span className="eyebrow fade-up">Help & FAQ</span>
          <h1 className="page-title fade-up delay-1">Platform Guide</h1>
          <div className="page-sub fade-up delay-2">Understand the purpose, use cases, and core features of SportsGuard AI.</div>
        </div>
      </div>
      
      <div className="fade-up delay-3" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        {/* Purpose and Use Cases */}
        <section>
          <h2 style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--coral)' }}>/</span> What is SportsGuard?
          </h2>
          <div className="card card-pad-lg">
            <p style={{ color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.6, margin: '0 0 16px 0' }}>
              SportsGuard is an AI-powered media integrity platform designed to help broadcasters and sports organizations protect their digital assets. It uses advanced perceptual hashing and Google Gemini's visual analysis to detect unauthorized use of your sports media across the internet.
            </p>
            <h4 style={{ fontFamily: 'Outfit', fontSize: 16, margin: '24px 0 8px 0' }}>Primary Use Cases:</h4>
            <ul style={{ color: 'var(--ink-3)', lineHeight: 1.6, paddingLeft: 20, margin: 0 }}>
              <li><strong>Broadcasters</strong> protecting exclusive live event feeds from unauthorized streaming sites.</li>
              <li><strong>Leagues</strong> tracking the illegal distribution of highlight clips on social media platforms.</li>
              <li><strong>Media Rights Holders</strong> generating automated DMCA takedown evidence using our analysis reports.</li>
            </ul>
          </div>
        </section>

        {/* Feature Breakdown */}
        <section>
          <h2 style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--moss)' }}>/</span> Feature Breakdown
          </h2>
          <div className="grid grid-2 gap-3">
            <div className="card card-pad">
              <h3 style={{ fontFamily: 'Outfit', fontSize: 18, margin: '0 0 8px 0' }}>Asset Registration</h3>
              <p style={{ color: 'var(--ink-mute)', fontSize: 14, margin: 0 }}>Upload official frames to generate an invisible, mathematical fingerprint (pHash). This fingerprint survives cropping, color changes, and compression.</p>
            </div>
            <div className="card card-pad">
              <h3 style={{ fontFamily: 'Outfit', fontSize: 18, margin: '0 0 8px 0' }}>URL Scanning</h3>
              <p style={{ color: 'var(--ink-mute)', fontSize: 14, margin: 0 }}>Input any direct image URL. Our system compares it against your entire registered library instantly, scoring the visual similarity.</p>
            </div>
            <div className="card card-pad">
              <h3 style={{ fontFamily: 'Outfit', fontSize: 18, margin: '0 0 8px 0' }}>Gemini Verification</h3>
              <p style={{ color: 'var(--ink-mute)', fontSize: 14, margin: 0 }}>For ambiguous matches, Gemini Vision analyzes the suspect image to read logos, scoreboards, and broadcast overlays to confirm piracy.</p>
            </div>
            <div className="card card-pad">
              <h3 style={{ fontFamily: 'Outfit', fontSize: 18, margin: '0 0 8px 0' }}>Threat Dashboard</h3>
              <p style={{ color: 'var(--ink-mute)', fontSize: 14, margin: 0 }}>A live operations center to monitor scans, review automated verdicts, and track the overall security health of your media library.</p>
            </div>
          </div>
        </section>

        {/* Common Questions */}
        <section>
          <h2 style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--sky)' }}>/</span> Common Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card card-pad-lg">
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontFamily: 'Outfit', fontWeight: 600 }}>How do I start protecting my media?</h3>
              <p style={{ color: 'var(--ink-3)', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px 0' }}>
                Navigate to the <strong>Register Asset</strong> tool. Upload a high-quality frame from your official broadcast. We will instantly analyze it, generate the fingerprint, and store it securely in your Asset Registry.
              </p>
              <button className="btn moss" onClick={() => onNav('register')}>{Icon.upload} Try protecting an asset</button>
            </div>

            <div className="card card-pad-lg">
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontFamily: 'Outfit', fontWeight: 600 }}>I found a suspicious link. What now?</h3>
              <p style={{ color: 'var(--ink-3)', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px 0' }}>
                Copy the <strong>direct image URL</strong> (it must end in .jpg, .png, etc.). Go to the <strong>Scan URL</strong> page, paste the link, and our AI pipeline will immediately cross-reference it against your protected assets.
              </p>
              <button className="btn coral" onClick={() => onNav('check')}>{Icon.bolt} Try scanning a URL</button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

window.Guide = Guide;
