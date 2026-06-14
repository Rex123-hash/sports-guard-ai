import { Icon } from '../components/primitives.jsx';
import { CLOUD_STACK } from '../data/sample-data.js';

export default function Guide({ onNav }) {
  return (
    <div className="page" style={{ maxWidth: 980 }}>
      <div className="page-head">
        <div>
          <span className="eyebrow fade-up">Help & FAQ</span>
          <h1 className="page-title fade-up delay-1">Platform Guide</h1>
          <div className="page-sub fade-up delay-2">Understand the product flow, the Google Cloud stack underneath it, and the features that make the Solution Challenge demo feel complete.</div>
        </div>
      </div>

      <div className="fade-up delay-3" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <section>
          <h2 style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--coral)' }}>/</span> What is SportsGuard?
          </h2>
          <div className="card card-pad-lg">
            <p style={{ color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.6, margin: '0 0 16px 0' }}>
              SportsGuard is an AI-powered media integrity platform for broadcasters, leagues, and rights holders. It pairs a fast perceptual-hash fingerprint with Gemini 2.5 Flash on Vertex AI: the hash narrows the registry in milliseconds, then Gemini visually adjudicates the match and explains it in plain language. It protects both still frames and whole video clips, and turns every confirmed detection into a ready-to-file DMCA notice.
            </p>
            <h4 style={{ fontFamily: 'Outfit', fontSize: 16, margin: '24px 0 8px 0' }}>Primary use cases:</h4>
            <ul style={{ color: 'var(--ink-3)', lineHeight: 1.6, paddingLeft: 20, margin: 0 }}>
              <li><strong>Broadcasters</strong> protecting exclusive live event feeds from unauthorized mirrors and reposts.</li>
              <li><strong>Leagues</strong> tracking illegal highlight distribution across public platforms.</li>
              <li><strong>Media rights holders</strong> producing evidence packets and takedown drafts without manual review bottlenecks.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--moss)' }}>/</span> Feature Breakdown
          </h2>
          <div className="grid grid-2 gap-3">
            <div className="card card-pad">
              <h3 style={{ fontFamily: 'Outfit', fontSize: 18, margin: '0 0 8px 0' }}>Asset Registration (image or video)</h3>
              <p style={{ color: 'var(--ink-mute)', fontSize: 14, margin: 0 }}>Protect a single broadcast frame, or a whole clip where every keyframe is fingerprinted. The 64-bit perceptual hash survives compression, resizing, and color shifts.</p>
            </div>
            <div className="card card-pad">
              <h3 style={{ fontFamily: 'Outfit', fontSize: 18, margin: '0 0 8px 0' }}>Image URL Scanning</h3>
              <p style={{ color: 'var(--ink-mute)', fontSize: 14, margin: 0 }}>Paste a suspicious image URL. It is fingerprinted, matched against every protected frame, adjudicated by Gemini, and logged to the dashboard with a confidence score.</p>
            </div>
            <div className="card card-pad">
              <h3 style={{ fontFamily: 'Outfit', fontSize: 18, margin: '0 0 8px 0' }}>Video Scanning</h3>
              <p style={{ color: 'var(--ink-mute)', fontSize: 14, margin: 0 }}>Upload a clip, paste a direct .mp4, or drop an Instagram/X/YouTube link. A Python pipeline samples keyframes, fingerprints each, and Gemini adjudicates any protected frame hidden inside, with the exact timestamp it appears.</p>
            </div>
            <div className="card card-pad">
              <h3 style={{ fontFamily: 'Outfit', fontSize: 18, margin: '0 0 8px 0' }}>Frame Verification</h3>
              <p style={{ color: 'var(--ink-mute)', fontSize: 14, margin: 0 }}>Cloud Vision OCR reads broadcaster overlays and copyright marks, then Gemini 2.5 Flash judges the frame's provenance and authenticity with a downloadable report.</p>
            </div>
            <div className="card card-pad">
              <h3 style={{ fontFamily: 'Outfit', fontSize: 18, margin: '0 0 8px 0' }}>Two-stage detection</h3>
              <p style={{ color: 'var(--ink-mute)', fontSize: 14, margin: 0 }}>A deterministic 64-bit dHash filter (instant, near-free) gates an explainable Gemini visual verdict (smart, court-ready). Final score weights them 0.4 hash + 0.6 Gemini.</p>
            </div>
            <div className="card card-pad">
              <h3 style={{ fontFamily: 'Outfit', fontSize: 18, margin: '0 0 8px 0' }}>Evidence Export</h3>
              <p style={{ color: 'var(--ink-mute)', fontSize: 14, margin: 0 }}>Generate evidence packets, verification certificates, and pre-filled DMCA takedown drafts directly from any detection result.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--sky)' }}>/</span> Google Cloud Chain
          </h2>
          <div className="card card-pad-lg">
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontFamily: 'Outfit', fontWeight: 700 }}>What this explains</h3>
              <p style={{ margin: '8px 0 0 0', color: 'var(--ink-mute)', fontSize: 14, lineHeight: 1.6 }}>
                This section shows exactly how SportsGuard is built on Google Cloud, so judges and new users can understand which services handle authentication, storage, AI analysis, and live detection reporting.
              </p>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              {CLOUD_STACK.map(item => (
                <div key={item.service} style={{ padding: '16px 18px', borderRadius: 16, border: '1px solid var(--line)', background: 'var(--paper)' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>{item.service}</div>
                  <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-mute)' }}>{item.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--butter)' }}>/</span> Quick Actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card card-pad-lg">
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontFamily: 'Outfit', fontWeight: 600 }}>Protect a new asset</h3>
              <p style={{ color: 'var(--ink-3)', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px 0' }}>
                Start by registering a clean broadcast frame. This establishes the fingerprint that every later scan will compare against.
              </p>
              <button className="btn moss" onClick={() => onNav('register')}>{Icon.upload} Register asset</button>
            </div>
            <div className="card card-pad-lg">
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontFamily: 'Outfit', fontWeight: 600 }}>Show the AI in action</h3>
              <p style={{ color: 'var(--ink-3)', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px 0' }}>
                Use the verification screen when recording your demo. It makes Gemini visible with a readable authenticity score and a report that names Vertex AI directly.
              </p>
              <button className="btn coral" onClick={() => onNav('verify')}>{Icon.scan} Open verification</button>
            </div>
            <div className="card card-pad-lg">
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontFamily: 'Outfit', fontWeight: 600 }}>Scan a video for piracy</h3>
              <p style={{ color: 'var(--ink-3)', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px 0' }}>
                Drop a clip or paste a link. SportsGuard scans every keyframe and flags any protected frame hidden inside the video, with the timestamp and a ready DMCA draft.
              </p>
              <button className="btn coral" onClick={() => onNav('video')}>{Icon.scan} Open video scan</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
