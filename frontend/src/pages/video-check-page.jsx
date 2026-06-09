import { useState } from 'react';
import { Icon, Placeholder, ConfDial, buildEvidenceReport, buildEvidenceReportHtml, buildDmcaNotice, copyTextToClipboard, downloadHtmlFile, downloadTextFile } from '../components/primitives.jsx';
import { SG_API } from '../services/api.js';

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

function fmtTime(s) {
  if (s == null) return '—';
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

const DEMO_VIDEO_URL = 'https://storage.googleapis.com/sportsguard-assets/suspected/demo-cricket-clip.mp4';

const STEPS = [
  { name: 'Acquire video', desc: 'Download / resolve the source', dur: 900 },
  { name: 'Extract keyframes', desc: 'Sample frames across the clip', dur: 700 },
  { name: 'Fingerprint frames', desc: '64-bit dHash per frame', dur: 600 },
  { name: 'Search registry', desc: 'Hamming match vs protected assets', dur: 500 },
  { name: 'Adjudicate', desc: 'Gemini verdict on the best frame', dur: 1100 },
  { name: 'Verdict', desc: 'Weighted score · log detection', dur: 400 },
];

export default function VideoCheck({ assets, onDetection }) {
  const [url, setUrl] = useState(DEMO_VIDEO_URL);
  const [phase, setPhase] = useState('idle');
  const [stepStatus, setStepStatus] = useState([]);
  const [verdict, setVerdict] = useState(null);

  const samples = [
    { url: DEMO_VIDEO_URL, label: 'Cricket clip · piracy' },
    { url: 'https://download.samplelib.com/mp4/sample-5s.mp4', label: 'Sample mp4 · clean' },
  ];

  async function execute(apiCall, displaySource) {
    setUrl(displaySource); setPhase('running'); setVerdict(null);
    setStepStatus(STEPS.map(() => 'queued'));

    let i = 0;
    const interval = setInterval(() => {
      setStepStatus(prev => prev.map((s, idx) => (idx === i ? 'active' : idx < i ? 'done' : 'queued')));
      i++;
      if (i >= STEPS.length) clearInterval(interval);
    }, 800);

    try {
      const r = await apiCall();
      clearInterval(interval);
      setStepStatus(STEPS.map(() => 'done'));

      const conf = r.confidence || 0;
      const isClean = (!r.matched && r.type === 'clean') || r.geminiVerdict === 'NO_MATCH';
      const v = {
        url: displaySource,
        confidence: conf,
        phashSim: r.phashSim || 0,
        type: r.type || (isClean ? 'clean' : 'review'),
        geminiVerdict: r.geminiVerdict || 'NO_MATCH',
        asset: r.matchedAsset || null,
        matchedFrame: r.matchedFrame || null,
        timestamp: r.timestampSeconds,
        framesScanned: r.framesScanned,
        sourceKind: r.sourceKind,
        reasoning: r.reasoning || (isClean ? 'No registered content was found in this video.' : 'Analysis completed.'),
        evidence: asList(r.evidence),
        transformations: asList(r.transformations),
        mod: r.mod || '—',
      };
      setVerdict(v); setPhase('done');
      if (v.type !== 'clean') onDetection && onDetection(v);
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      const m = err.message || '';
      let friendly = m;
      if (/moov|invalid data|could not extract|extract frames|no frames/i.test(m)) {
        friendly = "This video couldn't be read. It may be incomplete, still downloading, larger than the 80 MB limit, or in an unsupported format. Re-save it as a standard MP4 (H.264) or try a different clip.";
      } else if (/youtube|download|proxy|not available|unavailable|geo|blocked/i.test(m)) {
        friendly = "Couldn't download that video. YouTube is usually blocked from cloud servers (other platforms can occasionally fail too). Easiest fix: upload the file, or use a direct .mp4 link.";
      }
      alert('Video check failed: ' + friendly);
      setPhase('idle');
    }
  }

  function run(u) {
    const target = u || url;
    execute(() => SG_API.checkVideo(target), target);
  }

  function runFile(file) {
    execute(() => SG_API.checkVideoUpload(file), `upload: ${file.name}`);
  }

  function handleFileChange(e) {
    const f = e.target.files && e.target.files[0];
    if (f) runFile(f);
    e.target.value = ''; // allow re-selecting the same file
  }

  function reset() { setPhase('idle'); setVerdict(null); setStepStatus([]); }

  const vType = verdict?.type === 'piracy' ? 'piracy' : verdict?.type === 'review' ? 'warn' : 'clean';
  const vTitle = verdict?.type === 'piracy' ? 'Piracy confirmed in video' : verdict?.type === 'review' ? 'Inconclusive · queue review' : 'No match · clean';
  const evidenceReport = verdict ? buildEvidenceReport(verdict, verdict.asset) : '';
  const dmcaNotice = verdict ? buildDmcaNotice(verdict, verdict.asset) : '';

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow fade-up">Step 03b · Scan Video</span>
          <h1 className="page-title fade-up delay-1">Scan the <em>whole clip.</em></h1>
          <div className="page-sub fade-up delay-2">Paste a video URL (direct .mp4 or a YouTube/Instagram/X link). We pull keyframes, fingerprint each one, and find any registered frame hidden inside the clip, then a multimodal model adjudicates the match.</div>
        </div>
        <div className="mono fade-up delay-2" style={{ fontSize: 11, color: 'var(--ink-mute)', textAlign: 'right', letterSpacing: '0.08em' }}>
          REGISTRY · {assets.length}<br/>EVAL THRESHOLD · 85%
        </div>
      </div>

      <div className="card mb-6 fade-up delay-2" style={{ border: '2px solid var(--pine)' }}>
        <div style={{ background: 'var(--pine)', color: '#fff', padding: '10px 22px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--butter)' }}>{Icon.info}</span>
          <strong>Tip:</strong> uploads, direct <strong>.mp4</strong> links, and most platform links (Instagram, X, …) work. <strong>YouTube</strong> is often blocked from cloud servers — upload the file for those.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 12px 12px 22px', gap: 10 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.14em', fontWeight: 600 }}>VIDEO URL</span>
          <input className="input mono" value={url} onChange={e => setUrl(e.target.value)} disabled={phase === 'running'}
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, padding: '12px 8px', outline: 'none', boxShadow: 'none' }}/>
          {phase === 'idle' && (
            <>
              <input type="file" id="videoUpload" accept="video/*" style={{ display: 'none' }} onChange={handleFileChange}/>
              <button className="btn" onClick={() => document.getElementById('videoUpload').click()}>{Icon.upload}Upload</button>
              <button className="btn coral lg" onClick={() => run()}>{Icon.bolt}Scan video</button>
            </>
          )}
          {phase === 'running' && <button className="btn lg" disabled><span className="pipe-spinner"/>Scanning…</button>}
          {phase === 'done' && <button className="btn lg" onClick={reset}>↻ New scan</button>}
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
            {STEPS.map((s, i) => {
              const status = phase === 'done' ? 'done' : stepStatus[i] || 'queued';
              return (
                <div key={i} className={`pipe-step ${status}`}>
                  <div className="pipe-num">{status === 'done' ? '✓' : String(i + 1).padStart(2, '0')}</div>
                  <div><div className="pipe-name">{s.name}</div><div className="pipe-desc">{s.desc}</div></div>
                  <div>{status === 'active' && <span className="pipe-spinner"/>}</div>
                  <div className="pipe-meta">{status === 'done' ? 'ok' : status === 'active' ? 'running' : 'queued'}</div>
                </div>
              );
            })}
          </div>
          {phase === 'done' && verdict && (
            <div className="mono mt-3" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>
              scanned {verdict.framesScanned ?? '—'} keyframes · source: {verdict.sourceKind || '—'}
            </div>
          )}
        </div>

        <div className="fade-up delay-3">
          <div className="eyebrow mb-3">Registered original vs. matched frame</div>
          <div className="grid grid-2 gap-3">
            <div className="frame">
              <div className="frame-img">
                {verdict?.asset?.imageUrl
                  ? <img src={verdict.asset.imageUrl} alt="registered original" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  : <Placeholder tone="pine" label="REGISTERED" frame="ORIGINAL"/>}
                <span className="frame-tag tag solid-moss">{Icon.check} REGISTERED</span>
              </div>
              <div className="frame-cap"><span>{verdict?.asset?.title?.split(' · ')[0] || 'matched original'}</span><span>{verdict?.asset ? 'protected' : '—'}</span></div>
            </div>
            <div className="frame">
              <div className="frame-img">
                {verdict?.matchedFrame
                  ? <img src={verdict.matchedFrame} alt="matched video frame" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  : <Placeholder tone={verdict?.type === 'clean' ? 'cream' : 'coral'} label="VIDEO FRAME" frame="CLIP"/>}
                {phase === 'running' && <span className="frame-tag tag butter">SCANNING</span>}
                {phase === 'done' && verdict?.type === 'piracy' && <span className="frame-tag tag solid-coral">PIRATED</span>}
                {phase === 'done' && verdict?.type === 'review' && <span className="frame-tag tag butter">REVIEW</span>}
                {phase === 'done' && verdict?.type === 'clean' && <span className="frame-tag tag moss">CLEAN</span>}
              </div>
              <div className="frame-cap"><span>{verdict?.type !== 'clean' && verdict?.timestamp != null ? `found at ${fmtTime(verdict.timestamp)}` : 'video frame'}</span><span>{verdict?.mod && verdict.type !== 'clean' ? `mod: ${verdict.mod}` : '—'}</span></div>
            </div>
          </div>

          {phase === 'done' && verdict && (
            <div className="mt-6 fade-up">
              <div className={`verdict ${vType}`}>
                <ConfDial value={verdict.confidence} type={verdict.type} size={120}/>
                <div>
                  <div className="verdict-title">{vTitle}</div>
                  <div className="verdict-headline">
                    {verdict.type === 'piracy' && <>Found in the clip at {fmtTime(verdict.timestamp)}:<br/>{verdict.asset?.title?.split(' · ')[0]}.</>}
                    {verdict.type === 'review' && 'Partial overlap detected — needs a human check.'}
                    {verdict.type === 'clean' && 'No registered frame appears in this video.'}
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

      {phase === 'done' && verdict && verdict.type !== 'clean' && (
        <div className="grid mt-8 fade-up" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 22 }}>
          <div className="card">
            <div className="card-head"><h3>Visual reasoning</h3><span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.1em' }}>multimodal · 0.6 weight</span></div>
            <div className="card-pad-lg">
              <div className="serif" style={{ fontSize: 22, lineHeight: 1.35, color: 'var(--ink-2)', fontWeight: 400 }}>"{verdict.reasoning}"</div>
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
                <span className="serif" style={{ fontSize: 26 }}>{verdict.phashSim}<span style={{ fontSize: 14, color: 'var(--ink-mute)' }}>%</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 4px 0' }}>
                <span className="mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>FINAL</span>
                <span className="serif" style={{ fontSize: 42, color: verdict.type === 'piracy' ? 'var(--coral)' : '#8B6A14' }}>{verdict.confidence}<span style={{ fontSize: 18 }}>%</span></span>
              </div>
              <div className="mono mt-3" style={{ fontSize: 10, color: 'var(--ink-mute)' }}>found at {fmtTime(verdict.timestamp)} · ≥85% piracy · 70–84 review</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
                <button className="btn" onClick={() => copyTextToClipboard(evidenceReport)}>{Icon.copy}Copy evidence</button>
                <button className="btn primary" onClick={() => downloadHtmlFile(`sportsguard-video-evidence-${Date.now()}.html`, buildEvidenceReportHtml(verdict, verdict.asset))}>{Icon.doc}Download report</button>
                {verdict.type === 'piracy' && (
                  <button className="btn coral" onClick={() => copyTextToClipboard(dmcaNotice)}>{Icon.bolt}Copy DMCA notice</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="attribution">
        <span>SportsGuard · Scan Video</span>
        <span>Python keyframes + dHash · Gemini 2.5 Flash adjudication</span>
      </div>
    </div>
  );
}
