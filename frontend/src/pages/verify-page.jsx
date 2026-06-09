import { useEffect, useState } from 'react';
import { Icon, Placeholder, downloadTextFile, copyTextToClipboard } from '../components/primitives.jsx';
import { SG_API } from '../services/api.js';

export default function Verify() {
  const [phase, setPhase] = useState('idle');
  const [file, setFile] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [findings, setFindings] = useState([]);
  const [auth, setAuth] = useState(null);            // real Gemini result
  const [extractedText, setExtractedText] = useState('');

  // Clean up the object URL when the component unmounts or the image changes.
  useEffect(() => () => { if (imgUrl) URL.revokeObjectURL(imgUrl); }, [imgUrl]);

  function handleFileChange(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    setFile(f);
    setImgUrl(URL.createObjectURL(f));
    setPhase('idle');
    setFindings([]);
    setAuth(null);
    setExtractedText('');
  }

  async function run() {
    if (!file) { alert('Please upload an image first'); return; }
    setPhase('scanning');
    setFindings([]);
    setAuth(null);

    try {
      const result = await SG_API.verify(file);
      const finds = (result.textAnnotations || [])
        .filter(a => (a.text || '').trim())
        .slice(0, 12)
        .map(a => ({
          text: a.text,
          kind: a.kind || 'text',
          conf: a.confidence ? Math.round(a.confidence * 100) : null,
          x: a.x ?? 0, y: a.y ?? 0, w: a.w ?? 0, h: a.h ?? 0,
        }));
      setFindings(finds);
      setAuth(result.gemini || null);
      setExtractedText(result.extractedText || '');
      setPhase('done');
    } catch (err) {
      console.error(err);
      alert('Verification failed: ' + err.message);
      setPhase('idle');
    }
  }

  function reset() {
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    setPhase('idle');
    setFindings([]);
    setAuth(null);
    setExtractedText('');
    setFile(null);
    setImgUrl(null);
  }

  const score = auth ? auth.authenticity : null;
  const status = auth ? auth.status : 'OCR only';
  const scoreColor = score == null ? 'var(--ink-mute)' : score >= 85 ? 'var(--moss)' : score >= 65 ? '#8B6A14' : 'var(--coral)';

  const report = [
    'SPORTSGUARD VERIFICATION REPORT',
    `Generated: ${new Date().toLocaleString()}`,
    'Engine: Gemini 2.5 Flash (Vertex AI) + Cloud Vision OCR',
    `Source File: ${file?.name || 'uploaded-frame'}`,
    auth ? `Authenticity Score: ${auth.authenticity}%` : 'Authenticity Score: n/a',
    `Status: ${status}`,
    '',
    'AI PROVENANCE ASSESSMENT (Gemini)',
    auth ? auth.reasoning : 'Gemini assessment unavailable; Cloud Vision OCR only.',
    '',
    'PROVENANCE SIGNALS',
    auth && auth.signals.length ? auth.signals.map((s, i) => `${i + 1}. ${s}`).join('\n') : '(none identified)',
    '',
    'EXTRACTED TEXT (Cloud Vision OCR)',
    extractedText || '(no text detected)',
    '',
    'GOOGLE CLOUD TRAIL',
    'Firebase Auth -> Cloud Run -> Cloud Vision OCR -> Gemini 2.5 Flash (Vertex AI)',
  ].join('\n');

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow fade-up">Step 04 | Verify</span>
          <h1 className="page-title fade-up delay-1">Read the <em>watermark.</em></h1>
          <div className="page-sub fade-up delay-2">
            Cloud Vision OCR pulls every overlay and copyright mark off the frame, then Gemini 2.5 Flash
            judges whether it carries the provenance signals of a real licensed broadcast.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {phase !== 'scanning' && (
            <>
              <input type="file" id="verifyUpload" style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
              <button className="btn" onClick={() => document.getElementById('verifyUpload').click()}>{Icon.upload} {file ? 'Change frame' : 'Upload Frame'}</button>
              {phase === 'idle' && <button className="btn coral lg" onClick={run} disabled={!file}>{Icon.scan} Verify Media</button>}
              {phase === 'done' && <button className="btn lg" onClick={reset}>New verification</button>}
            </>
          )}
          {phase === 'scanning' && <button className="btn lg" disabled><span className="pipe-spinner"/> Gemini analysing</button>}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.45fr 1fr', gap: 22 }}>
        <div className="fade-up delay-2">
          <div className="eyebrow mb-3">Source frame | scanning surface</div>
          <div className="frame">
            <div className="scan-frame" style={{ position: 'relative', overflow: 'hidden', background: '#0b1220', display: 'flex' }}>
              {imgUrl
                ? <img src={imgUrl} alt="uploaded frame" style={{ display: 'block', width: '100%', height: 'auto' }} />
                : <div style={{ width: '100%', aspectRatio: '16/10' }}><Placeholder tone="pine" label="UPLOAD A FRAME" frame="—" /></div>}

              {phase !== 'idle' && imgUrl && <div className="scan-grid" style={{ position: 'absolute', inset: 0 }} />}
              {phase === 'scanning' && <div className="scan-beam" />}

              {phase === 'done' && findings.map((f, i) => (
                <div key={i} className="fade-up" style={{
                  position: 'absolute',
                  left: `${f.x}%`, top: `${f.y}%`,
                  width: `${Math.max(f.w, 1.5)}%`, height: `${Math.max(f.h, 1.5)}%`,
                  border: `1.5px solid ${f.kind === 'copyright' ? 'var(--moss)' : 'var(--butter)'}`,
                  borderRadius: 2, boxShadow: '0 0 0 1px rgba(0,0,0,0.25)', pointerEvents: 'none',
                }}>
                  <span style={{
                    position: 'absolute', top: -15, left: -1,
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, lineHeight: '13px',
                    background: f.kind === 'copyright' ? 'var(--moss)' : 'var(--butter)',
                    color: f.kind === 'copyright' ? '#fff' : '#0b1220',
                    padding: '0 4px', borderRadius: 2, whiteSpace: 'nowrap', fontWeight: 600,
                  }}>{f.text}</span>
                </div>
              ))}

              {phase === 'done' && <span className="frame-tag tag solid-moss">{Icon.check} ANALYSED</span>}
            </div>
            <div className="frame-cap">
              <span>{file ? `${file.name} | ${(file.size / 1024 / 1024).toFixed(2)} MB` : 'No file uploaded'}</span>
              <span>{phase === 'done' ? `${findings.length} TEXT REGIONS` : phase === 'scanning' ? 'ANALYSING...' : 'READY'}</span>
            </div>
          </div>

          {phase === 'done' && (
            <div className="card mt-6 fade-up">
              <div className="card-pad-lg" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 18, alignItems: 'center' }}>
                <div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999,
                    border: '1px solid rgba(22,163,74,0.22)', color: 'var(--moss)', fontSize: 11, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(22,163,74,0.06)',
                  }}>
                    {Icon.check}
                    {auth ? 'Analysed by Gemini 2.5 Flash' : 'Cloud Vision OCR'}
                  </div>
                  <div className="serif" style={{ fontSize: 32, lineHeight: 1.08, marginTop: 14, fontWeight: 400 }}>
                    {score == null ? 'OCR complete.' : `${score}% authentic.`}
                  </div>
                  <div style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.65, marginTop: 10 }}>
                    {auth ? auth.reasoning : 'Cloud Vision read the overlay text; the AI provenance assessment was unavailable for this frame.'}
                  </div>
                </div>
                <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16, padding: 18 }}>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.12em' }}>GEMINI VERDICT</div>
                  <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: scoreColor }}>{status}</div>
                  <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--ink-mute)' }}>Model</span><strong>Gemini 2.5 Flash</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--ink-mute)' }}>OCR</span><strong>Cloud Vision</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--ink-mute)' }}>Text regions</span><strong>{findings.length}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="fade-up delay-3">
          <div className="eyebrow mb-3">{phase === 'done' && auth ? 'Provenance signals' : 'Detected text'}</div>
          <div className="card">
            {phase === 'idle' && (
              <div className="card-pad-lg" style={{ textAlign: 'center', minHeight: 220, display: 'grid', placeItems: 'center' }}>
                <div>
                  <div className="serif" style={{ fontSize: 30, color: 'var(--ink-mute)', lineHeight: 1.1, fontWeight: 400 }}>Awaiting scan.</div>
                  <div className="mono mt-3" style={{ fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.1em' }}>OCR | WATERMARK | COPYRIGHT | PROVENANCE</div>
                </div>
              </div>
            )}
            {phase === 'scanning' && (
              <div className="card-pad-lg" style={{ textAlign: 'center', minHeight: 220, display: 'grid', placeItems: 'center' }}>
                <div className="mono" style={{ fontSize: 12, color: 'var(--ink-mute)', letterSpacing: '0.1em' }}><span className="pipe-spinner" style={{ marginRight: 8 }}/>Reading frame & assessing provenance…</div>
              </div>
            )}

            {phase === 'done' && auth && auth.signals.length > 0 && auth.signals.map((s, i) => (
              <div key={`sig-${i}`} className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderBottom: '1px solid var(--line-2)' }}>
                <span style={{ color: scoreColor, flexShrink: 0 }}>{Icon.shield}</span>
                <span style={{ fontSize: 13 }}>{s}</span>
              </div>
            ))}

            {phase === 'done' && findings.length > 0 && (
              <div style={{ padding: '12px 20px', borderTop: auth && auth.signals.length ? '1px solid var(--line)' : 'none' }}>
                <div className="eyebrow mb-3">Extracted text regions ({findings.length})</div>
                {findings.map((f, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '84px 1fr auto', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--line-2)' }}>
                    <span className={`tag ${f.kind === 'copyright' ? 'moss' : 'butter'}`} style={{ justifyContent: 'center' }}>{f.kind}</span>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 500, overflowWrap: 'anywhere' }}>{f.text}</span>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)' }}>x{f.x} y{f.y}</span>
                  </div>
                ))}
              </div>
            )}

            {phase === 'done' && findings.length === 0 && (!auth || auth.signals.length === 0) && (
              <div className="card-pad-lg mono" style={{ fontSize: 12, color: 'var(--ink-mute)' }}>No text or provenance signals detected on this frame.</div>
            )}
          </div>

          {phase === 'done' && (
            <div className="mt-6 fade-up">
              <div className="card" style={{ background: 'linear-gradient(135deg, var(--pine) 0%, var(--pine-2) 100%)', color: 'var(--cream)', borderColor: 'var(--pine)' }}>
                <div className="card-pad-lg">
                  <div className="eyebrow" style={{ color: 'var(--butter)' }}>Gemini verification report</div>
                  <pre className="hash-block" style={{ whiteSpace: 'pre-wrap', margin: '12px 0 0 0', background: 'rgba(255,255,255,0.06)', color: '#fff', borderColor: 'rgba(255,255,255,0.12)' }}>
                    {report}
                  </pre>
                  <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                    <button className="btn" style={{ background: '#fff', color: 'var(--pine)', borderColor: '#fff' }} onClick={() => copyTextToClipboard(report)}>
                      {Icon.copy} Copy report
                    </button>
                    <button className="btn ghost" style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }} onClick={() => downloadTextFile(`sportsguard-verification-${Date.now()}.txt`, report)}>
                      {Icon.doc} Download report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="attribution">
        <span>SportsGuard | Verify</span>
        <span>Cloud Vision OCR · Gemini 2.5 Flash provenance · Vertex AI</span>
      </div>
    </div>
  );
}
