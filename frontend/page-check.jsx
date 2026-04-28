// Check URL — hero detection page
const { useState: useStateC, useEffect: useEffectC } = React;

function CheckURL({ assets, onDetection }) {
  const [url, setUrl] = useStateC('https://streamhub.example/embed/u8821');
  const [phase, setPhase] = useStateC('idle'); // idle | running | done
  const [stepStatus, setStepStatus] = useStateC([]);
  const [verdict, setVerdict] = useStateC(null);

  const samples = [
    { url: 'https://streamhub.example/embed/u8821',   label: 'Cricket · cropped' },
    { url: 'https://fancdn.example/clip/lebron-bzz',   label: 'Basketball · logo overlay' },
    { url: 'https://forum.kickoff.example/topic/8821', label: 'Football · compressed' },
    { url: 'https://imgur.example/album/9f3kx',        label: 'Unrelated · clean' },
  ];

  function run(u) {
    const target = u || url;
    setUrl(target);
    setPhase('running'); setVerdict(null);
    const steps = window.SG_DATA.PIPELINE_STEPS;
    setStepStatus(steps.map(() => 'queued'));
    let i = 0;
    const advance = () => {
      if (i >= steps.length) {
        const isClean = target.includes('imgur');
        const conf = isClean ? 22 : (84 + Math.floor(Math.random() * 12));
        const ph = isClean ? 24 : conf - 2 - Math.floor(Math.random() * 4);
        const sport = target.includes('lebron') ? 'basketball' : target.includes('kickoff') ? 'football' : 'cricket';
        const asset = assets.find(a => a.sport === sport) || assets[0];
        const v = {
          confidence: conf, phashSim: ph,
          geminiVerdict: isClean ? 'NO_MATCH' : conf >= 90 ? 'EXACT_MATCH' : 'NEAR_MATCH',
          type: isClean ? 'clean' : conf >= 85 ? 'piracy' : 'review',
          asset, mod: isClean ? '—' : (target.includes('lebron') ? 'logo overlay' : target.includes('kickoff') ? 'compressed' : 'cropped + filter'),
          reasoning: isClean
            ? 'No registered asset matched. Hamming distance > 18; visual analysis returned no scene overlap.'
            : 'Same scene composition. Same player positions and body language. Image was cropped from the right and a saturation filter applied. Broadcast graphics fragment partially obscured but consistent with the protected original.',
          evidence: isClean ? [] : ['identical player positions', 'matching lighting signature', 'broadcast graphics fragment'],
        };
        setVerdict(v); setPhase('done');
        if (!isClean) onDetection && onDetection({ ...v, url: target });
        return;
      }
      setStepStatus(prev => prev.map((s, idx) => idx === i ? 'active' : idx < i ? 'done' : 'queued'));
      const dur = steps[i].dur;
      i++;
      setTimeout(advance, dur);
    };
    advance();
  }

  function reset() { setPhase('idle'); setVerdict(null); setStepStatus([]); }

  const steps = window.SG_DATA.PIPELINE_STEPS;
  const verdictType = verdict?.type === 'piracy' ? 'piracy' : verdict?.type === 'review' ? 'warn' : 'clean';
  const verdictTitle = verdict?.type === 'piracy' ? 'Piracy confirmed' : verdict?.type === 'review' ? 'Inconclusive · queue review' : 'No match · clean';

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

      <div className="card mb-6 fade-up delay-2">
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 8px 8px 22px', gap: 10 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.14em', fontWeight: 600 }}>URL</span>
          <input
            className="input mono"
            value={url}
            onChange={e => setUrl(e.target.value)}
            disabled={phase === 'running'}
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, padding: '12px 8px', outline: 'none', boxShadow: 'none' }}
          />
          {phase === 'idle' && <button className="btn coral lg" onClick={() => run()}>{Icon.bolt}Run check</button>}
          {phase === 'running' && <button className="btn lg" disabled><span className="pipe-spinner"/>Analyzing…</button>}
          {phase === 'done' && <button className="btn lg" onClick={reset}>↻ New check</button>}
        </div>
        <div style={{ borderTop: '1px solid var(--line)', padding: '12px 22px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.14em', fontWeight: 600 }}>TRY</span>
          {samples.map(s => (
            <button key={s.url} className="btn" style={{ padding: '6px 12px', fontSize: 12 }}
              onClick={() => { setUrl(s.url); run(s.url); }}
              disabled={phase === 'running'}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        <div className="fade-up delay-3">
          <div className="eyebrow mb-3">Detection pipeline</div>
          <div className="pipeline">
            {steps.map((s, i) => {
              const status = phase === 'done' ? 'done' : stepStatus[i] || 'queued';
              return (
                <div key={i} className={`pipe-step ${status}`}>
                  <div className="pipe-num">{status === 'done' ? '✓' : String(i+1).padStart(2,'0')}</div>
                  <div>
                    <div className="pipe-name">{s.name}</div>
                    <div className="pipe-desc">{s.desc}</div>
                  </div>
                  <div>{status === 'active' && <span className="pipe-spinner"/>}</div>
                  <div className="pipe-meta">
                    {status === 'done' ? `${(s.dur/1000).toFixed(2)}s · ok` : status === 'active' ? 'running' : 'queued'}
                  </div>
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
              <div className="frame-cap">
                <span>{verdict?.asset?.title?.split(' · ')[0] || 'matched original'}</span>
                <span>1920×1080</span>
              </div>
            </div>
            <div className="frame">
              <div className="frame-img">
                <Placeholder tone={verdict?.type === 'clean' ? 'cream' : 'coral'} label="SUSPECT" frame="REMOTE"/>
                {phase === 'running' && <span className="frame-tag tag butter">ANALYZING</span>}
                {phase === 'done' && verdict?.type === 'piracy' && <span className="frame-tag tag solid-coral">PIRATED</span>}
                {phase === 'done' && verdict?.type === 'review' && <span className="frame-tag tag butter">REVIEW</span>}
                {phase === 'done' && verdict?.type === 'clean' && <span className="frame-tag tag moss">CLEAN</span>}
              </div>
              <div className="frame-cap">
                <span>{verdict?.mod ? `mod: ${verdict.mod}` : 'remote source'}</span>
                <span>{phase === 'done' ? '1280×720' : '?'}</span>
              </div>
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
              <div className="mono mt-3" style={{ fontSize: 10, color: 'var(--ink-mute)', lineHeight: 1.6 }}>
                ≥85% piracy · 70–84% review · &lt;70% clean
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="attribution">
        <span>SportsGuard · Check</span>
        <span>{phase === 'done' ? `analyzed in ${(steps.reduce((a,s)=>a+s.dur,0)/1000).toFixed(2)}s` : 'pipeline ready'}</span>
      </div>
    </div>
  );
}

window.CheckURL = CheckURL;
