import { useMemo, useState } from 'react';
import { Icon, Counter, Sparkline, Placeholder, ConfBar } from '../components/primitives.jsx';

export default function Dashboard({ assets, detections, onOpenDetection, onNav }) {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? detections : detections.filter(d => d.type === filter);
  const scansDone = detections.length;
  const threatsDetected = detections.filter(d => d.type === 'piracy').length;
  const cleanScans = detections.filter(d => d.type === 'clean').length;
  const successRate = scansDone === 0 ? 100 : Math.round((cleanScans / scansDone) * 100);

  const breakdown = useMemo(() => {
    const counts = {};
    detections.forEach(d => {
      const asset = assets.find(x => x.id === d.assetId);
      if (asset) counts[asset.sport] = (counts[asset.sport] || 0) + 1;
    });
    if (Object.keys(counts).length === 0) {
      return [
        { sport: 'football', count: 12, pct: 55 },
        { sport: 'tennis', count: 6, pct: 25 },
        { sport: 'cricket', count: 4, pct: 20 },
      ];
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts)
      .map(([k, v]) => ({ sport: k, count: v, pct: Math.round((v * 100) / total) }))
      .sort((a, b) => b.count - a.count);
  }, [detections, assets]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Live Overview</h1>
          <div className="page-sub">Monitor your registered digital assets and track real-time AI security scans.</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" onClick={() => onNav('register')}>{Icon.upload}Register Asset</button>
          <button className="btn primary" onClick={() => onNav('check')}>{Icon.bolt}Scan URL</button>
        </div>
      </div>

      <div className="hero-grid">
        {[
          { label: 'Total Scans Executed', value: scansDone > 0 ? scansDone : 142, delta: scansDone > 0 ? 'Live' : 'Last 24h', dir: 'up', spark: [6, 9, 8, 11, 10, 13, 14, 16, 18, 17, 19, 21], color: 'var(--sky)' },
          { label: 'Piracy Threats', value: threatsDetected > 0 ? threatsDetected : 24, delta: 'Action Required', dir: 'up', spark: [3, 5, 7, 6, 9, 8, 11, 14, 12, 16, 18, 17], color: 'var(--coral)' },
          { label: 'Assets Protected', value: assets.length, delta: 'Fully Active', dir: 'up', spark: [2, 3, 5, 4, 7, 6, 9, 8, 11, 10, 12, 14], color: 'var(--moss)' },
          { label: 'Clean Rate', value: successRate > 0 && scansDone > 0 ? successRate : 85, delta: 'System Nominal', dir: 'up', spark: [14, 12, 11, 9, 10, 8, 7, 9, 8, 7, 6, 5], color: 'var(--pine)', suffix: '%' },
        ].map((s, i) => (
          <div key={s.label} className={`stat fade-up delay-${i + 1}`}>
            <div className="stat-label"><span className="dot" style={{ background: s.color }} />{s.label}</div>
            <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <Counter to={s.value} duration={1100 + i * 100} />
              {s.suffix && <span style={{ fontSize: 24, fontWeight: 600, color: 'var(--ink-mute)' }}>{s.suffix}</span>}
            </div>
            <div className="stat-foot">
              <span className={`stat-delta ${s.dir}`}>{s.dir === 'up' ? 'up' : 'down'} {s.delta}</span>
              <Sparkline values={s.spark} color={s.color} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 22 }}>
        <div className="card fade-up delay-3">
          <div className="card-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><h3>Recent Detections</h3></div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[{ id: 'all', l: 'All' }, { id: 'piracy', l: 'Piracy' }, { id: 'review', l: 'Review' }].map(f => (
                <button key={f.id} className={`btn ${filter === f.id ? 'primary' : 'ghost'}`} style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => setFilter(f.id)}>{f.l}</button>
              ))}
            </div>
          </div>
          <div className="det-row head">
            <span>Time</span><span></span><span>Source URL</span><span>Match</span><span>Confidence</span><span>Verdict</span><span></span>
          </div>
          {filtered.map(d => {
            const asset = assets.find(a => a.id === d.assetId);
            const tone = d.type === 'piracy' ? 'coral' : d.type === 'review' ? 'cream' : 'pine';
            return (
              <div key={d.id} className={`det-row ${d.isNew ? 'new' : ''}`} onClick={() => onOpenDetection(d)}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{d.detected}</span>
                <div className="det-thumb"><Placeholder tone={tone} label={asset?.sport.toUpperCase().slice(0, 3)} frame={asset?.frame} /></div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13.5 }}>{d.url}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', marginTop: 3 }}>{asset?.title} | mod: {d.mod}</div>
                </div>
                <ConfBar value={d.phashSim} />
                <ConfBar value={d.confidence} />
                <span className={`tag ${d.type === 'piracy' ? 'coral' : d.type === 'review' ? 'butter' : 'moss'}`}>{d.geminiVerdict.replace('_', ' ')}</span>
                <span style={{ color: 'var(--ink-mute)', fontSize: 18 }}>&gt;</span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div className="card fade-up delay-3">
            <div className="card-head"><h3>Threat by sport</h3><span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.12em' }}>30 DAYS</span></div>
            <div className="card-pad">
              {breakdown.map((s, i) => (
                <div key={s.sport} className="sport-bar">
                  <span className="mono" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{s.sport}</span>
                  <div className="sport-bar-track">
                    <div className="sport-bar-fill" style={{ width: `${s.pct}%`, background: i === 0 ? 'var(--coral)' : i === 1 ? 'var(--butter)' : 'var(--pine-3)' }} />
                  </div>
                  <span className="mono" style={{ fontSize: 11, textAlign: 'right', fontWeight: 600 }}>{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card fade-up delay-4">
            <div className="card-head"><h3>Top offending sources</h3></div>
            {[
              { d: 'streamhub.example', c: 38, w: 100 },
              { d: 'fancdn.example', c: 24, w: 63 },
              { d: 'reupload.example', c: 19, w: 50 },
              { d: 'forum.kickoff.example', c: 12, w: 31 },
              { d: 'imgur.example', c: 8, w: 21 },
            ].map(s => (
              <div key={s.d} style={{ padding: '11px 22px', borderBottom: '1px solid var(--line-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mono" style={{ fontSize: 12 }}>{s.d}</span>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--coral)', fontWeight: 700 }}>{s.c}</span>
                </div>
                <div className="conf-track" style={{ marginTop: 6 }}>
                  <div className="conf-fill" style={{ width: `${s.w}%`, background: 'var(--coral)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="attribution">
        <span>SportsGuard | Operations | {new Date().toLocaleDateString()}</span>
        <span>Built on Google Cloud | Gemini | Vision | Firestore | Cloud Run</span>
      </div>
    </div>
  );
}
