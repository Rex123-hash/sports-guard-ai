// Sidebar + topbar
function Sidebar({ page, onNav, totals }) {
  const items = [
    { id: 'landing',   label: 'Home',             sc: 'H', icon: Icon.home },
    { id: 'dashboard', label: 'Metrics',          sc: 'D', icon: Icon.grid },
    { id: 'register',  label: 'Protect Asset',    sc: 'P', icon: Icon.upload },
    { id: 'check',     label: 'Scan URL',         sc: 'S', icon: Icon.bolt },
    { id: 'verify',    label: 'Verify Frame',     sc: 'V', icon: Icon.scan },
    { id: 'guide',     label: 'Help & FAQ',       sc: '?', icon: Icon.info || Icon.link },
  ];
  const archive = [
    { id: 'archive',    label: 'All Assets',      icon: Icon.grid },
    { id: 'detections', label: 'History',         icon: Icon.shield },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-glyph" style={{ background: 'transparent' }}>
          <img src="/logo.png" alt="SportsGuard Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div>
          <div className="brand-name">SportsGuard</div>
        </div>
      </div>
      <div className="nav">
        <div className="nav-section">Workspace</div>
        {items.map(it => (
          <div key={it.id} className={`nav-item ${page === it.id ? 'active' : ''}`} onClick={() => onNav(it.id)}>
            <span className="nav-icon">{it.icon}</span>
            <span>{it.label}</span>
            <span className="nav-shortcut">{it.sc}</span>
          </div>
        ))}
        <div className="nav-section">Archive</div>
        {archive.map(it => (
          <div key={it.id} className={`nav-item ${page === it.id ? 'active' : ''}`} onClick={() => onNav(it.id)}>
            <span className="nav-icon">{it.icon}</span>
            <span>{it.label}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '0 14px' }}>
        <div className="sidebar-card">
          <div className="small">Today · live</div>
          <div className="big"><Counter to={totals.detections} duration={1400}/></div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>detections processed</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em', color: 'var(--butter)', opacity: 0.85 }}>
            <span>↑ 12% vs avg</span>
          </div>
          <div style={{ marginTop: 16, marginLeft: -16, marginRight: -16, marginBottom: -16 }}>
            <Sparkline w={200} h={40} color="var(--moss)" values={[3,5,4,7,6,9,8,11,10,14,13,18]} />
          </div>
        </div>
      </div>
      <div className="sidebar-foot">
        <span className="live-indicator"><span className="pulse-dot"/>STREAM LIVE</span>
        <span>EU-W-1</span>
      </div>
    </aside>
  );
}

function Topbar({ now, page, onNav }) {
  const titles = {
    landing:    ['Workspace', 'Home'],
    dashboard:  ['Workspace', 'Metrics'],
    register:   ['Workspace', 'Protect Asset'],
    check:      ['Workspace', 'Scan URL'],
    verify:     ['Workspace', 'Verify Frame'],
    guide:      ['Help',      'FAQ'],
    archive:    ['Archive',   'All Assets'],
    detections: ['Archive',   'History'],
  };
  const [sec, name] = titles[page] || ['', ''];
  return (
    <div className="topbar">
      <div className="crumbs">
        {sec} <span style={{ margin: '0 8px', opacity: 0.4 }}>/</span> <strong>{name}</strong>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="search">
          {Icon.search}
          <input placeholder="Search assets, hashes, detections…"/>
          <span className="kbd">⌘K</span>
        </div>
        <button className="btn primary" onClick={() => onNav('check')}>
          {Icon.bolt}New check
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar });
