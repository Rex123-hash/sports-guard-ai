import { useState } from 'react';
import { Icon, Placeholder, ConfDial, buildEvidenceReport, buildEvidenceReportHtml, buildDmcaNotice, copyTextToClipboard, downloadHtmlFile, downloadTextFile } from '../components/primitives.jsx';
import { SG_API } from '../services/api.js';
import { PIPELINE_STEPS } from '../data/sample-data.js';

export default function CheckURL({ assets, onDetection }) {
  const [url, setUrl] = useState('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800');
  const [phase, setPhase] = useState('idle');
  const [stepStatus, setStepStatus] = useState([]);
  const [verdict, setVerdict] = useState(null);

  const samples = [
    { url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800', label: 'Cricket · cropped' },
    { url: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800', label: 'Basketball · logo overlay' },
    { url: 'https://images.unsplash.com/photo-1518605368461-1e1e38ce8058?w=800', label: 'Football · compressed' },
    { url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800', label: 'Unrelated · clean' },
  ];

  async function run(u) {
    const target = u || url;
    setUrl(target); setPhase('running'); setVerdict(null);
    setStepStatus(PIPELINE_STEPS.map(() => 'queued'));

    let i = 0;
    const interval = setInterval(() => {
      setStepStatus(prev => prev.map((s, idx) => idx === i ? 'active' : idx < i ? 'done' : 'queued'));
      i++;
      if (i >= PIPELINE_STEPS.length) clearInterval(interval);
    }, 600);

    try {
      const result = await SG_API.check(target);
      clearInterval(interval);
      setStepStatus(PIPELINE_STEPS.map(() => 'done'));

      const conf = result.finalConfidence || result.confidence || 0;
      const ph = result.phashSimilarity || result.phashSim || 0;
      const isClean = !result.piracyDetected && conf < 70;

      const v = {
        url: target, confidence: conf, phashSim: ph,
        geminiVerdict: result.geminiAnalysis?.verdict || result.geminiVerdict || (isClean ? 'NO_MATCH' : 'UNKNOWN'),
        type: isClean ? 'clean' : conf >= 85 ? 'piracy' : 'review',
        asset: result.matchedAsset || assets[0],
        mod: result.geminiAnalysis?.reasoning?.substring(0, 20) || result.mod || (isClean ? '—' : 'remote source'),
        reasoning: result.geminiAnalysis?.reasoning || result.reasoning || (isClean ? 'No matching protected content found.' : 'Backend analysis completed.'),
        evidence: result.geminiAnalysis?.evidence || result.evidence || [],
        transformations: result.geminiAnalysis?.transformations || result.transformations || [],
      };

      setVerdict(v); setPhase('done');
      if (!isClean) onDetection && onDetection(v);
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      alert('Check failed: ' + err.message);
      setPhase('idle');
    }
  }

  function reset() { setPhase('idle'); setVerdict(null); setStepStatus([]); }

  const verdictType = verdict?.type === 'piracy' ? 'piracy' : verdict?.type === 'review' ? 'warn' : 'clean';
  const verdictTitle = verdict?.type === 'piracy' ? 'Piracy confirmed' : verdict?.type === 'review' ? 'Inconclusive · queue review' : 'No match · clean';
  const evidenceReport = verdict ? buildEvidenceReport(verdict, verdict.asset) : '';
  const dmcaNotice = verdict ? buildDmcaNotice(verdict, verdict.asset) : '';

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow fade-up">Step 03 · Check</span>
          <h1 className="page-title fade-up delay-1">Pull a <em>thread.</em></h1>
          <div className="page-sub fade-up delay-2">Drop any public URL. We download the asset, fingerprint it, and compare against every registered frame — then a multimodal model adjudicates whether it's a copy.</div>
        </div>
        <div className="mono fade-up delay-2" style={{ fontSize: 11, color: 'var(--ink-mute)', textAlign: 'right', letterSpacing: '0.08em' }}>
          REGISTRY · 2,184<br/>EVAL THRESHOLD · 85%
        </div>
      </div>

      <div className="card mb-6 fade-up delay-2" style={{ border: '2px solid var(--pine)' }}>
        <div style={{ background: 'var(--pine)', color: '#fff', padding: '10px 22px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--butter)' }}>{Icon.info}</span>
          <strong>Important:</strong> You must paste a direct <strong>image URL</strong> (ending in .jpg, .png, etc.), not a general website link.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 12px 12px 22px', gap: 10 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.14em', fontWeight: 600 }}>IMAGE URL</span>
          <input className="input mono" value={url} onChange={e => setUrl(e.target.value)} disabled={phase === 'running'}
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, padding: '12px 8px', outline: 'none', boxShadow: 'none' }}/>
          {phase === 'idle' && <button className="btn coral lg" onClick={() => run()}>{Icon.bolt}Run check</button>}
          {phase === 'running' && <button className="btn lg" disabled><span className="pipe-spinner"/>Analyzing…</button>}
          {phase === 'done' && <button className="btn lg" onClick={reset}>↻ New check</button>}
        </div>
        <div style={{ borderTop: '1px solid var(--line)', padding: '12px 22px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.14em', fontWeight: 600 }}>TRY</span>
          {samples.map(s => (
            <button key={s.url} className="btn" style={{ padding: '6px 12px', fontSize: 12 }}
              onClick={() => { setUrl(s.url); run(s.url); }} disabled={phase === 'running'}>{s.label}</button>
          ))}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        <div className="fade-up delay-3">
          <div className="eyebrow mb-3">Detection pipeline</div>
          <div className="pipeline">
            {PIPELINE_STEPS.map((s, i) => {
              const status = phase === 'done' ? 'done' : stepStatus[i] || 'queued';
              return (
                <div key={i} className={`pipe-step ${status}`}>
                  <div className="pipe-num">{status === 'done' ? '✓' : String(i + 1).padStart(2, '0')}</div>
                  <div><div className="pipe-name">{s.name}</div><div className="pipe-desc">{s.desc}</div></div>
                  <div>{status === 'active' && <span className="pipe-spinner"/>}</div>
                  <div className="pipe-meta">{status === 'done' ? `${(s.dur / 1000).toFixed(2)}s · ok` : status === 'active' ? 'running' : 'queued'}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="fade-up delay-3">
          <div className="eyebrow mb-3">Side by side</div>
          <div className="grid grid-2 gap-3">
            <div className="frame">
              <div className="frame-img">
                <Placeholder tone="pine" label="REGISTERED" frame="ORIGINAL"/>
                <span className="frame-tag tag solid-moss">{Icon.check} REGISTERED</span>
              </div>
              <div className="frame-cap"><span>{verdict?.asset?.title?.split(' · ')[0] || 'matched original'}</span><span>1920×1080</span></div>
            </div>
            <div className="frame">
              <div className="frame-img">
                <Placeholder tone={verdict?.type === 'clean' ? 'cream' : 'coral'} label="SUSPECT" frame="REMOTE"/>
                {phase === 'running' && <span className="frame-tag tag butter">ANALYZING</span>}
                {phase === 'done' && verdict?.type === 'piracy' && <span className="frame-tag tag solid-coral">PIRATED</span>}
                {phase === 'done' && verdict?.type === 'review' && <span className="frame-tag tag butter">REVIEW</span>}
                {phase === 'done' && verdict?.type === 'clean' && <span className="frame-tag tag moss">CLEAN</span>}
              </div>
              <div className="frame-cap"><span>{verdict?.mod ? `mod: ${verdict.mod}` : 'remote source'}</span><span>{phase === 'done' ? '1280×720' : '?'}</span></div>
            </div>
          </div>

          {phase === 'done' && verdict && (
            <div className="mt-6 fade-up">
              <div className={`verdict ${verdictType}`}>
                <ConfDial value={verdict.confidence} type={verdict.type} size={120}/>
                <div>
                  <div className="verdict-title">{verdictTitle}</div>
                  <div className="verdict-headline">
                    {verdict.type === 'piracy' && <>Cropped, filtered — same scene as<br/>{verdict.asset?.title?.split(' · ')[0]}.</>}
                    {verdict.type === 'review' && 'Visual fragments overlap, but signal is partial.'}
                    {verdict.type === 'clean' && 'Nothing in the registry resembles this image.'}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', opacity: 0.9, fontWeight: 600 }}>VERDICT · {verdict.geminiVerdict}</span>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', opacity: 0.85 }}>pHASH · {verdict.phashSim}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {phase === 'done' && verdict && (
        <div className="grid mt-8 fade-up" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 22 }}>
          <div className="card">
            <div className="card-head"><h3>Visual reasoning</h3><span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.1em' }}>multimodal · 0.6 weight</span></div>
            <div className="card-pad-lg">
              <div className="serif" style={{ fontSize: 22, lineHeight: 1.35, color: 'var(--ink-2)', fontVariationSettings: "'opsz' 144, 'SOFT' 60", fontWeight: 400 }}>
                "{verdict.reasoning}"
              </div>
              {verdict.evidence.length > 0 && (
                <div className="mt-6">
                  <div className="eyebrow mb-3">Evidence</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {verdict.evidence.map((e, i) => <span key={i} className="tag">· {e}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h3>Adjudication</h3></div>
            <div className="card-pad-lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line-2)' }}>
                <span className="mono" style={{ fontSize: 11 }}>pHash · 0.4 weight</span>
                <span className="serif" style={{ fontSize: 26, fontVariationSettings: "'opsz' 144" }}>{verdict.phashSim}<span style={{ fontSize: 14, color: 'var(--ink-mute)' }}>%</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line-2)' }}>
                <span className="mono" style={{ fontSize: 11 }}>Visual · 0.6 weight</span>
                <span className="serif" style={{ fontSize: 26, fontVariationSettings: "'opsz' 144" }}>{verdict.confidence}<span style={{ fontSize: 14, color: 'var(--ink-mute)' }}>%</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 4px 0' }}>
                <span className="mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>FINAL</span>
                <span className="serif" style={{ fontSize: 42, fontVariationSettings: "'opsz' 144, 'SOFT' 60", color: verdict.type === 'piracy' ? 'var(--coral)' : verdict.type === 'review' ? '#8B6A14' : 'var(--moss)' }}>{verdict.confidence}<span style={{ fontSize: 18 }}>%</span></span>
              </div>
              <div className="mono mt-3" style={{ fontSize: 10, color: 'var(--ink-mute)', lineHeight: 1.6 }}>≥85% piracy · 70–84% review · &lt;70% clean</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
                <button className="btn" onClick={() => copyTextToClipboard(evidenceReport)}>{Icon.copy}Copy evidence</button>
                <button className="btn primary" onClick={() => downloadHtmlFile(`sportsguard-evidence-${Date.now()}.html`, buildEvidenceReportHtml(verdict, verdict.asset))}>{Icon.doc}Download report</button>
                {verdict.type === 'piracy' && (
                  <button className="btn coral" onClick={() => copyTextToClipboard(dmcaNotice)}>{Icon.bolt}Copy DMCA notice</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 'done' && verdict?.type === 'piracy' && (
        <div className="card mt-6 fade-up">
          <div className="card-head"><h3>DMCA takedown draft</h3></div>
          <div className="card-pad-lg">
            <pre className="hash-block" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{dmcaNotice}</pre>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              <button className="btn coral" onClick={() => copyTextToClipboard(dmcaNotice)}>{Icon.copy}Issue takedown</button>
              <button className="btn" onClick={() => downloadTextFile(`sportsguard-dmca-${Date.now()}.txt`, dmcaNotice)}>{Icon.doc}Download notice</button>
            </div>
          </div>
        </div>
      )}

      <div className="attribution">
        <span>SportsGuard · Check</span>
        <span>{phase === 'done' ? `analyzed in ${(PIPELINE_STEPS.reduce((a, s) => a + s.dur, 0) / 1000).toFixed(2)}s` : 'pipeline ready'}</span>
      </div>
    </div>
  );
}
