// Asset registry, detection log, drawer
function Archive({ assets, onNav }) {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow fade-up">Archive · 05</span>
          <h1 className="page-title fade-up delay-1">Asset <em>registry.</em></h1>
          <div className="page-sub fade-up delay-2">Every frame currently under SportsGuard watch — fingerprinted, filed, and continuously matched against any URL submitted to the system.</div>
        </div>
        <button className="btn primary fade-up delay-2" onClick={() => onNav('register')}>{Icon.upload}Register asset</button>
      </div>
      <div className="card fade-up delay-2">
        <div className="det-row head" style={{ gridTemplateColumns: '60px 1.4fr 0.8fr 1fr 1fr 0.9fr 0.8fr' }}>
          <span></span><span>Title</span><span>Sport</span><span>Owner</span><span>pHash</span><span>License</span><span>Status</span>
        </div>
        {assets.map((a, i) => (
          <div key={a.id} className="det-row" style={{ gridTemplateColumns: '60px 1.4fr 0.8fr 1fr 1fr 0.9fr 0.8fr' }}>
            <div className="det-thumb"><Placeholder tone={['pine','coral','cream','dots','pine'][i % 5]} label={a.sport.toUpperCase().slice(0,3)} frame={a.frame}/></div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 13.5 }}>{a.title}</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', marginTop: 3 }}>filed {new Date(a.registered).toLocaleDateString()}</div>
            </div>
            <span className="mono" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>{a.sport}</span>
            <span style={{ fontSize: 13 }}>{a.owner}</span>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{a.phash}</span>
            <span className="tag">{a.license}</span>
            <span className="tag moss">{Icon.check}LIVE</span>
          </div>
        ))}
      </div>
      <div className="attribution">
        <span>SportsGuard · Registry</span>
        <span>{assets.length} of 2,184 shown · sorted by recency</span>
      </div>
    </div>
  );
}

function DetectionLog({ detections, assets, onOpen }) {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow fade-up">Archive · 06</span>
          <h1 className="page-title fade-up delay-1">Detection <em>log.</em></h1>
          <div className="page-sub fade-up delay-2">Permanent record of every URL the system has adjudicated — searchable, sortable, exportable for takedown filings.</div>
        </div>
      </div>
      <div className="card fade-up delay-2">
        <div className="det-row head">
          <span>Time</span><span></span><span>Source · transformation</span><span>pHash</span><span>Confidence</span><span>Verdict</span><span></span>
        </div>
        {detections.map(d => {
          const asset = assets.find(a => a.id === d.assetId);
          const tone = d.type === 'piracy' ? 'coral' : d.type === 'review' ? 'cream' : 'pine';
          return (
            <div key={d.id} className="det-row" onClick={() => onOpen(d)}>
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
    </div>
  );
}

function Drawer({ detection, assets, onClose }) {
  if (!detection) return null;
  const asset = assets.find(a => a.id === detection.assetId);
  return (
    <>
      <div className="drawer-overlay" onClick={onClose}/>
      <div className="drawer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 26px', borderBottom: '1px solid var(--line)' }}>
          <span className="eyebrow">Detection · {detection.id.slice(0, 8)}</span>
          <button className="btn ghost" onClick={onClose}>{Icon.close}</button>
        </div>
        <div style={{ padding: 26 }}>
          <div className={`tag ${detection.type === 'piracy' ? 'coral' : detection.type === 'review' ? 'butter' : 'moss'}`}>
            {detection.geminiVerdict.replace('_', ' ')}
          </div>
          <div className="serif mt-3" style={{ fontSize: 40, lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 400, fontVariationSettings: "'opsz' 144, 'SOFT' 60" }}>
            {detection.type === 'piracy' && 'Unauthorized copy.'}
            {detection.type === 'review' && 'Inconclusive — needs review.'}
            {detection.type === 'clean' && 'No match.'}
          </div>
          <div className="mono mt-3" style={{ fontSize: 11.5, color: 'var(--ink-mute)', wordBreak: 'break-all' }}>{detection.url}</div>

          <div className="grid grid-2 gap-3 mt-6">
            <div className="frame">
              <div className="frame-img" style={{ aspectRatio: '4/3' }}>
                <Placeholder tone="pine" label={asset?.sport.toUpperCase().slice(0,3)} frame={asset?.frame}/>
                <span className="frame-tag tag solid-moss">REGISTERED</span>
              </div>
              <div className="frame-cap"><span>{asset?.title}</span><span>{asset?.owner}</span></div>
            </div>
            <div className="frame">
              <div className="frame-img" style={{ aspectRatio: '4/3' }}>
                <Placeholder tone="coral" label="SUSPECT" frame="REMOTE"/>
                <span className={`frame-tag tag ${detection.type === 'piracy' ? 'solid-coral' : 'butter'}`}>SUSPECT</span>
              </div>
              <div className="frame-cap"><span>mod: {detection.mod}</span><span>{detection.detected}</span></div>
            </div>
          </div>

          <div className="card mt-6">
            <div className="card-head"><h3>Adjudication</h3></div>
            <div style={{ padding: '4px 22px' }}>
              {[
                ['pHash similarity', `${detection.phashSim}%`],
                ['Visual confidence', `${detection.confidence}%`],
                ['Final score', `${detection.confidence}%`],
                ['Owner', asset?.owner],
                ['License', asset?.license],
                ['Asset hash', asset?.phash],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid var(--line-2)' }}>
                  <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k}</span>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {detection.type === 'piracy' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button className="btn coral lg" style={{ flex: 1 }}>{Icon.bolt}Issue takedown</button>
              <button className="btn lg">Mark reviewed</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

window.Archive = Archive; window.DetectionLog = DetectionLog; window.Drawer = Drawer;
