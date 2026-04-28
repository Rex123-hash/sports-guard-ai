// Operations dashboard
const { useState: useStateD, useEffect: useEffectD, useMemo: useMemoD } = React;

function Dashboard({ assets, detections, onOpenDetection, onNav }) {
  const [live, setLive] = useStateD(detections);
  const [filter, setFilter] = useStateD('all');

  useEffectD(() => {
    const seeds = [
      { url: 'streamhub.example/embed/u8821',          mod: 'cropped',       sport: 'cricket' },
      { url: 'fancdn.example/clip/3kx9',               mod: 'logo overlay',  sport: 'football' },
      { url: 'reupload.example/v/zk72',                mod: 'mirrored',      sport: 'basketball' },
      { url: 'forum.example/thread/119/post/4',        mod: 'compressed',    sport: 'tennis' },
    ];
    let i = 0;
    const t = setInterval(() => {
      const s = seeds[i % seeds.length]; i++;
      const asset = assets.find(a => a.sport === s.sport) || assets[0];
      const conf = 78 + Math.floor(Math.random() * 18);
      const det = {
        id: `live-${Date.now()}`, assetId: asset.id, url: s.url,
        confidence: conf, phashSim: conf - 2 - Math.floor(Math.random() * 4),
        geminiVerdict: conf >= 90 ? 'EXACT_MATCH' : conf >= 80 ? 'NEAR_MATCH' : 'INCONCLUSIVE',
        type: conf >= 80 ? 'piracy' : 'review',
        detected: 'just now', mod: s.mod, isNew: true,
      };
      setLive(prev => [det, ...prev].slice(0, 12));
    }, 9000);
    return () => clearInterval(t);
  }, [assets]);

  const filtered = filter === 'all' ? live : live.filter(d => d.type === filter);
  const breakdown = useMemoD(() => {
    const counts = {};
    live.forEach(d => {
      const a = assets.find(x => x.id === d.assetId);
      if (a) counts[a.sport] = (counts[a.sport] || 0) + 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts).map(([k, v]) => ({ sport: k, count: v, pct: Math.round(v * 100 / total) }))
      .sort((a, b) => b.count - a.count);
  }, [live, assets]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow eyebrow-dot fade-up">Live · 24/7 monitoring active</span>
          <h1 className="page-title fade-up delay-1">Operations <em>desk.</em></h1>
          <div className="page-sub fade-up delay-2">A real-time read of every URL flowing through SportsGuard. Pirated copies surface in coral; inconclusive in butter; cleared cleanly in moss.</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }} className="fade-up delay-2">
          <button className="btn" onClick={() => onNav('register')}>{Icon.upload}Register</button>
          <button className="btn primary" onClick={() => onNav('check')}>{Icon.bolt}Run check</button>
        </div>
      </div>

      <div className="hero-grid">
        {[
          { label: 'Assets protected', value: 2184, delta: '+18 today', dir: 'up', spark: [6,9,8,11,10,13,14,16,18,17,19,21], color: 'var(--moss)' },
          { label: 'Detections · 24h', value: 147,  delta: '+12% vs avg', dir: 'up', spark: [3,5,7,6,9,8,11,14,12,16,18,17], color: 'var(--coral)' },
          { label: 'Piracy confirmed', value: 89,   delta: '60% of total', dir: 'up', spark: [2,3,5,4,7,6,9,8,11,10,12,14], color: 'var(--coral)' },
          { label: 'Pending review',   value: 12,   delta: '−3 cleared',  dir: 'down', spark: [14,12,11,9,10,8,7,9,8,7,6,5], color: 'var(--butter)' },
        ].map((s, i) => (
          <div key={s.label} className={`stat fade-up delay-${i+1}`}>
            <div className="stat-label"><span className="dot" style={{ background: s.color }}/>{s.label}</div>
            <div className="stat-value"><Counter to={s.value} duration={1100 + i * 100}/></div>
            <div className="stat-foot">
              <span className={`stat-delta ${s.dir}`}>{s.dir === 'up' ? '↑' : '↓'} {s.delta}</span>
              <Sparkline values={s.spark} color={s.color}/>
            </div>
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 22 }}>
        <div className="card fade-up delay-3">
          <div className="card-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <h3>Live detection feed</h3>
              <span className="live-indicator mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.12em' }}>
                <span className="pulse-dot"/>STREAMING
              </span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { id: 'all',    l: 'All' },
                { id: 'piracy', l: 'Piracy' },
                { id: 'review', l: 'Review' },
              ].map(f => (
                <button key={f.id}
                  className={`btn ${filter === f.id ? 'primary' : 'ghost'}`}
                  style={{ padding: '6px 14px', fontSize: 12 }}
                  onClick={() => setFilter(f.id)}>{f.l}</button>
              ))}
            </div>
          </div>
          <div className="det-row head">
            <span>Time</span><span></span><span>Source · transformation</span><span>pHash</span><span>Confidence</span><span>Verdict</span><span></span>
          </div>
          {filtered.map(d => {
            const asset = assets.find(a => a.id === d.assetId);
            const tone = d.type === 'piracy' ? 'coral' : d.type === 'review' ? 'cream' : 'pine';
            return (
              <div key={d.id} className={`det-row ${d.isNew ? 'new' : ''}`} onClick={() => onOpenDetection(d)}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{d.detected}</span>
                <div className="det-thumb"><Placeholder tone={tone} label={asset?.sport.toUpperCase().slice(0,3)} frame={asset?.frame}/></div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13.5 }}>{d.url}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', marginTop: 3 }}>{asset?.title} · mod: {d.mod}</div>
                </div>
                <ConfBar value={d.phashSim}/>
                <ConfBar value={d.confidence}/>
                <span className={`tag ${d.type === 'piracy' ? 'coral' : d.type === 'review' ? 'butter' : 'moss'}`}>{d.geminiVerdict.replace('_', ' ')}</span>
                <span style={{ color: 'var(--ink-mute)', fontSize: 18 }}>›</span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div className="card fade-up delay-3">
            <div className="card-head"><h3>Threat by sport</h3><span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.12em' }}>30·DAYS</span></div>
            <div className="card-pad">
              {breakdown.map((s, i) => (
                <div key={s.sport} className="sport-bar">
                  <span className="mono" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{s.sport}</span>
                  <div className="sport-bar-track">
                    <div className="sport-bar-fill" style={{ width: `${s.pct}%`, background: i === 0 ? 'var(--coral)' : i === 1 ? 'var(--butter)' : 'var(--pine-3)' }}/>
                  </div>
                  <span className="mono" style={{ fontSize: 11, textAlign: 'right', fontWeight: 600 }}>{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card fade-up delay-4">
            <div className="card-head"><h3>Top offending sources</h3></div>
            {[
              { d: 'streamhub.example',  c: 38, w: 100 },
              { d: 'fancdn.example',     c: 24, w: 63 },
              { d: 'reupload.example',   c: 19, w: 50 },
              { d: 'forum.kickoff.example', c: 12, w: 31 },
              { d: 'imgur.example',      c: 8,  w: 21 },
            ].map(s => (
              <div key={s.d} style={{ padding: '11px 22px', borderBottom: '1px solid var(--line-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mono" style={{ fontSize: 12 }}>{s.d}</span>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--coral)', fontWeight: 700 }}>{s.c}</span>
                </div>
                <div className="conf-track" style={{ marginTop: 6 }}>
                  <div className="conf-fill" style={{ width: `${s.w}%`, background: 'var(--coral)' }}/>
                </div>
              </div>
            ))}
          </div>

          <div className="card fade-up delay-4" style={{ background: 'linear-gradient(135deg, var(--pine) 0%, var(--pine-2) 100%)', color: 'var(--cream)', borderColor: 'var(--pine)' }}>
            <div className="card-pad-lg">
              <div className="eyebrow" style={{ color: 'var(--butter)' }}>Field note</div>
              <div className="serif" style={{ fontSize: 26, lineHeight: 1.15, marginTop: 10, fontStyle: 'italic', fontVariationSettings: "'opsz' 144, 'SOFT' 80" }}>
                "The first ten minutes after a final whistle decide who owns the moment."
              </div>
              <div style={{ marginTop: 14, fontSize: 11, color: 'var(--butter)', opacity: 0.7, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
                — Operator handbook · §3.1
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="attribution">
        <span>SportsGuard · Operations · {new Date().toLocaleDateString()}</span>
        <span>Built on Google Cloud · Gemini · Vision · Firestore · Cloud Run</span>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
