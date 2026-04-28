import { useState } from 'react';
import { Counter, Sparkline, Icon } from './primitives.jsx';

export function Sidebar({ page, onNav, totals }) {
  const items = [
    { id: 'landing',   label: 'Home',          sc: 'H', icon: Icon.home },
    { id: 'dashboard', label: 'Metrics',       sc: 'D', icon: Icon.grid },
    { id: 'register',  label: 'Protect Asset', sc: 'P', icon: Icon.upload },
    { id: 'check',     label: 'Scan URL',      sc: 'S', icon: Icon.bolt },
    { id: 'verify',    label: 'Verify Frame',  sc: 'V', icon: Icon.scan },
    { id: 'guide',     label: 'Help & FAQ',    sc: '?', icon: Icon.info },
  ];
  const archive = [
    { id: 'archive',    label: 'All Assets', icon: Icon.grid },
    { id: 'detections', label: 'History',    icon: Icon.shield },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div style={{
          width: 38, height: 38, borderRadius: 10, overflow: 'hidden',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
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

export function Topbar({ now, page, onNav, user, onSignOut }) {
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
  const [showMenu, setShowMenu] = useState(false);

  const isGuest  = user?.isAnonymous;
  const displayName = isGuest ? 'Guest Mode' : (user?.displayName || 'User');
  const secondaryLabel = isGuest ? 'Anonymous session' : (user?.email || '');
  const initials = isGuest
    ? 'G'
    : user
    ? (user.displayName || user.email || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

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

        {/* User avatar + sign-out */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(v => !v)}
            style={{
              width: 34, height: 34, borderRadius: '50%', border: '2px solid var(--border)',
              background: user?.photoURL ? 'transparent' : isGuest ? '#7B8497' : '#16A34A',
              cursor: 'pointer', overflow: 'hidden', padding: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
            title={isGuest ? 'Guest Mode' : (user?.displayName || user?.email || '')}
          >
            {user?.photoURL
              ? <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              : <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'Inter,sans-serif' }}>{initials}</span>
            }
          </button>

          {showMenu && (
            <div
              style={{
                position: 'absolute', top: 40, right: 0, zIndex: 999,
                background: '#fff', borderRadius: 10,
                boxShadow: '0 8px 30px rgba(11,18,32,0.14), 0 0 0 1px rgba(11,18,32,0.07)',
                minWidth: 200, padding: '8px 0',
              }}
              onMouseLeave={() => setShowMenu(false)}
            >
              <div style={{ padding: '8px 14px 10px', borderBottom: '1px solid #ECEEF2' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0B1220', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 11, color: '#7B8497', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                  {secondaryLabel}
                </div>
              </div>
              <button
                onClick={() => { setShowMenu(false); onSignOut && onSignOut(); }}
                style={{
                  width: '100%', padding: '9px 14px', background: 'none', border: 'none',
                  textAlign: 'left', cursor: 'pointer', fontSize: 13, color: '#FF4D2E',
                  fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8,
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FFF5F3'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
