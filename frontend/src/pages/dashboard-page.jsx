import { useMemo, useState } from 'react';
import { Icon, Counter, Sparkline, Placeholder, ConfBar, matchesQuery } from '../components/primitives.jsx';

export default function Dashboard({ assets, detections, stats, search = '', onOpenDetection, onNav }) {
  const [filter, setFilter] = useState('all');

  const byType = filter === 'all' ? detections : detections.filter(d => d.type === filter);
  const filtered = byType.filter(d => matchesQuery(d, search));
  const detectionsLogged = Math.max(detections.length, stats?.totalDetections || 0);
  const threatsDetected = detections.filter(d => d.type === 'piracy').length;
  const reviewQueue = detections.filter(d => d.type === 'review').length;

  const sourceBreakdown = useMemo(() => {
    const counts = {};
    detections.forEach((d) => {
      try {
        const host = new URL(d.url).hostname.replace(/^www\./, '');
        counts[host] = (counts[host] || 0) + 1;
      } catch {
        counts[d.url] = (counts[d.url] || 0) + 1;
      }
    });

    const max = Math.max(...Object.values(counts), 1);
    return Object.entries(counts)
      .map(([domain, count]) => ({
        domain,
        count,
        width: Math.max(12, Math.round((count / max) * 100)),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [detections]);

  const breakdown = useMemo(() => {
    const counts = {};
    detections.forEach(d => {
      const asset = assets.find(x => x.id === d.assetId);
      if (asset) counts[asset.sport] = (counts[asset.sport] || 0) + 1;
    });
    if (Object.keys(counts).length === 0) return [];
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
          { label: 'Detections Logged', value: detectionsLogged, delta: detectionsLogged > 0 ? 'All time' : 'No detections yet', dir: 'up', spark: detections.length > 0 ? detections.map((_, i) => i + 1) : [0, 0, 0, 0], color: 'var(--sky)' },
          { label: 'Piracy Confirmed', value: threatsDetected, delta: threatsDetected > 0 ? 'Action required' : 'Nothing flagged', dir: 'up', spark: detections.filter(d => d.type === 'piracy').map((_, i) => i + 1).concat(detections.filter(d => d.type === 'piracy').length ? [] : [0, 0, 0, 0]), color: 'var(--coral)' },
          { label: 'Assets Protected', value: Math.max(assets.length, stats?.totalAssets || 0), delta: assets.length > 0 ? 'Fully active' : 'Awaiting registry', dir: 'up', spark: assets.map((_, i) => i + 1).concat(assets.length ? [] : [0, 0, 0, 0]), color: 'var(--moss)' },
          { label: 'In Review Queue', value: reviewQueue, delta: reviewQueue > 0 ? 'Awaiting human check' : 'Queue clear', dir: 'up', spark: detections.filter(d => d.type === 'review').map((_, i) => i + 1).concat(detections.filter(d => d.type === 'review').length ? [] : [0, 0, 0, 0]), color: 'var(--pine)' },
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
                <div className="det-thumb"><Placeholder tone={tone} label={(asset?.sport || d.sport || '').toUpperCase().slice(0, 3)} frame={asset?.frame || d.frame} /></div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13.5 }}>{d.url}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', marginTop: 3 }}>{asset?.title || d.title || '-'} | mod: {d.mod}</div>
                </div>
                <ConfBar value={d.phashSim} />
                <ConfBar value={d.confidence} />
                <span className={`tag ${d.type === 'piracy' ? 'coral' : d.type === 'review' ? 'butter' : 'moss'}`}>{d.geminiVerdict.replace('_', ' ')}</span>
                <span style={{ color: 'var(--ink-mute)', fontSize: 18 }}>&gt;</span>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="mono" style={{ padding: '20px 22px', fontSize: 12, color: 'var(--ink-mute)' }}>
              {search ? `No detections match "${search}".` : 'No detections yet.'}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div className="card fade-up delay-3">
            <div className="card-head"><h3>Threat by sport</h3><span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.12em' }}>ALL TIME</span></div>
            <div className="card-pad">
              {breakdown.length === 0 ? (
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)', padding: '10px 0' }}>
                  No real detection mix yet. Run scans against registered assets to populate this view.
                </div>
              ) : breakdown.map((s, i) => (
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
            {sourceBreakdown.length === 0 ? (
              <div style={{ padding: '18px 22px' }}>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>
                  No real source domains captured yet. Once detections arrive, this list will reflect actual hosts.
                </div>
              </div>
            ) : sourceBreakdown.map(s => (
              <div key={s.domain} style={{ padding: '11px 22px', borderBottom: '1px solid var(--line-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mono" style={{ fontSize: 12 }}>{s.domain}</span>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--coral)', fontWeight: 700 }}>{s.count}</span>
                </div>
                <div className="conf-track" style={{ marginTop: 6 }}>
                  <div className="conf-fill" style={{ width: `${s.width}%`, background: 'var(--coral)' }} />
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
