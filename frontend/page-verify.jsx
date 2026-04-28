// Verify Ownership
const { useState: useStateV } = React;

function Verify() {
  const [phase, setPhase] = useStateV('idle');
  const [findings, setFindings] = useStateV([]);
  const FINDS = [
    { x: 5,  y: 7,  text: '© BCCI MEDIA · 2026',      conf: 98, kind: 'copyright' },
    { x: 60, y: 11, text: 'STAR SPORTS HD',           conf: 94, kind: 'broadcaster' },
    { x: 4,  y: 84, text: 'FRAME 04:23:11',           conf: 89, kind: 'timecode' },
    { x: 64, y: 86, text: 'M C G',                    conf: 91, kind: 'venue' },
    { x: 28, y: 48, text: 'WATERMARK · SG-A01',       conf: 87, kind: 'watermark' },
  ];
  function run() {
    setPhase('scanning'); setFindings([]);
    FINDS.forEach((f, i) => setTimeout(() => setFindings(prev => [...prev, f]), 600 + i * 420));
    setTimeout(() => setPhase('done'), 600 + FINDS.length * 420 + 400);
  }
  function reset() { setPhase('idle'); setFindings([]); }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow fade-up">Step 04 · Verify</span>
          <h1 className="page-title fade-up delay-1">Read the <em>watermark.</em></h1>
          <div className="page-sub fade-up delay-2">Run an image through OCR and watermark detection. Surfaces copyright marks, broadcaster overlays, embedded SportsGuard tags, and venue text — proof of where a frame originated.</div>
        </div>
        {phase === 'idle' && <button className="btn coral lg" onClick={run}>{Icon.scan} Begin scan</button>}
        {phase === 'scanning' && <button className="btn lg" disabled><span className="pipe-spinner"/> Scanning</button>}
        {phase === 'done' && <button className="btn lg" onClick={reset}>↻ Re-scan</button>}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 22 }}>
        <div className="fade-up delay-2">
          <div className="eyebrow mb-3">Source frame · scanning surface</div>
          <div className="frame">
            <div className="frame-img scan-frame" style={{ aspectRatio: '16/10' }}>
              <Placeholder tone="pine" label="CRICKET" frame="F-04:23:11"/>
              {phase !== 'idle' && <div className="scan-grid" style={{ position: 'absolute', inset: 0 }}/>}
              {phase === 'scanning' && <div className="scan-beam"/>}
              {findings.map((f, i) => (
                <div key={i} className="ocr-finds" style={{ left: `${f.x}%`, top: `${f.y}%`, maxWidth: '36%' }}>
                  {f.text} · {f.conf}%
                </div>
              ))}
              {phase === 'done' && <span className="frame-tag tag solid-moss">{Icon.check} VERIFIED</span>}
            </div>
            <div className="frame-cap">
              <span>frame_a01_mcg.jpg · 4.2 MB · 1920×1200</span>
              <span>{phase === 'done' ? `${findings.length} ARTIFACTS FOUND` : phase === 'scanning' ? 'SCANNING…' : 'READY'}</span>
            </div>
          </div>
        </div>

        <div className="fade-up delay-3">
          <div className="eyebrow mb-3">Detected artifacts</div>
          <div className="card">
            {findings.length === 0 && phase === 'idle' && (
              <div className="card-pad-lg" style={{ textAlign: 'center', minHeight: 220, display: 'grid', placeItems: 'center' }}>
                <div>
                  <div className="serif" style={{ fontSize: 30, color: 'var(--ink-mute)', lineHeight: 1.1, fontWeight: 400 }}>
                    Awaiting scan.
                  </div>
                  <div className="mono mt-3" style={{ fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.1em' }}>
                    OCR · WATERMARK · LOGO MATCH · TIMECODE
                  </div>
                </div>
              </div>
            )}
            {findings.map((f, i) => (
              <div key={i} className="fade-up" style={{ display: 'grid', gridTemplateColumns: '90px 1fr 60px', gap: 14, alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--line-2)' }}>
                <span className={`tag ${f.kind === 'copyright' ? 'moss' : f.kind === 'watermark' ? 'butter' : ''}`} style={{ justifyContent: 'center' }}>{f.kind}</span>
                <div>
                  <div className="mono" style={{ fontSize: 12, fontWeight: 500 }}>{f.text}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', marginTop: 2 }}>x:{f.x}% · y:{f.y}%</div>
                </div>
                <span className="serif" style={{ fontSize: 22, textAlign: 'right', fontVariationSettings: "'opsz' 144" }}>{f.conf}<span style={{ fontSize: 11, color: 'var(--ink-mute)' }}>%</span></span>
              </div>
            ))}
          </div>

          {phase === 'done' && (
            <div className="mt-6 fade-up">
              <div className="card" style={{ background: 'linear-gradient(135deg, var(--pine) 0%, var(--pine-2) 100%)', color: 'var(--cream)', borderColor: 'var(--pine)' }}>
                <div className="card-pad-lg">
                  <div className="eyebrow" style={{ color: 'var(--butter)' }}>Provenance verdict</div>
                  <div className="serif" style={{ fontSize: 32, lineHeight: 1.05, marginTop: 8, fontWeight: 400 }}>
                    Frame matches BCCI broadcast feed.
                  </div>
                  <div className="mono mt-4" style={{ fontSize: 11, color: 'var(--cream-2)', lineHeight: 1.7, opacity: 0.85 }}>
                    Copyright mark · ✓<br/>
                    Broadcaster overlay · ✓<br/>
                    SportsGuard embed · ✓ (SG-A01)<br/>
                    Timecode chain · valid
                  </div>
                  <div style={{ borderTop: '1px solid rgba(245,201,91,0.2)', marginTop: 18, paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--butter)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', opacity: 0.85 }}>
                    <span>5/5 ARTIFACTS</span>
                    <span>OWNER · BCCI MEDIA</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="attribution">
        <span>SportsGuard · Verify</span>
        <span>vision OCR · watermark detect · logo registry</span>
      </div>
    </div>
  );
}

window.Verify = Verify;
