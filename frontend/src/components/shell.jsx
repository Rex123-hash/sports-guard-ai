import { useState } from 'react';
import { Counter, Sparkline, Icon } from './primitives.jsx';

export function Sidebar({ page, onNav, totals, detections = [], open, onClose }) {
  // Real trend data: confidence of the last 12 detections, oldest → newest.
  const sparkValues = detections.slice(0, 12).map(d => d.confidence || 0).reverse();
  const items = [
    { id: 'landing', label: 'Home', sc: 'H', icon: Icon.home },
    { id: 'dashboard', label: 'Metrics', sc: 'D', icon: Icon.grid },
    { id: 'register', label: 'Protect Asset', sc: 'P', icon: Icon.upload },
    { id: 'check', label: 'Scan URL', sc: 'S', icon: Icon.bolt },
    { id: 'video', label: 'Scan Video', sc: 'C', icon: Icon.scan },
    { id: 'verify', label: 'Verify Frame', sc: 'V', icon: Icon.scan },
    { id: 'guide', label: 'Help & FAQ', sc: '?', icon: Icon.info },
  ];
  const archive = [
    { id: 'archive', label: 'All Assets', icon: Icon.grid },
    { id: 'detections', label: 'History', icon: Icon.shield },
  ];

  function handleNav(id) {
    onNav(id);
    onClose && onClose();
  }

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar${open ? ' sidebar--open' : ''}`}>
        <div className="brand">
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              overflow: 'hidden',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <img src="/logo.png" alt="SportsGuard Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <div className="brand-name">SportsGuard</div>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="nav">
          <div className="nav-section">Workspace</div>
          {items.map((it) => (
            <div key={it.id} className={`nav-item ${page === it.id ? 'active' : ''}`} onClick={() => handleNav(it.id)}>
              <span className="nav-icon">{it.icon}</span>
              <span>{it.label}</span>
              <span className="nav-shortcut">{it.sc}</span>
            </div>
          ))}
          <div className="nav-section">Archive</div>
          {archive.map((it) => (
            <div key={it.id} className={`nav-item ${page === it.id ? 'active' : ''}`} onClick={() => handleNav(it.id)}>
              <span className="nav-icon">{it.icon}</span>
              <span>{it.label}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '0 14px' }}>
          <div className="sidebar-card">
            <div className="small">All time</div>
            <div className="big">
              <Counter to={Number(totals?.totalDetections ?? totals?.detections ?? 0)} duration={1400} />
            </div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>detections processed</div>
            {sparkValues.length > 1 && (
              <div style={{ marginTop: 16, marginLeft: -16, marginRight: -16, marginBottom: -16 }}>
                <Sparkline w={200} h={40} color="var(--moss)" values={sparkValues} />
              </div>
            )}
          </div>
        </div>
        <div className="sidebar-foot">
          <span className="live-indicator">
            <span className="pulse-dot" />
            LIVE SYNC · 10s
          </span>
          <span>US-CENTRAL1</span>
        </div>
      </aside>
    </>
  );
}

export function Topbar({ now, page, onNav, user, onSignOut, onMenuToggle, search = '', onSearch = () => {} }) {
  const titles = {
    landing: ['Workspace', 'Home'],
    dashboard: ['Workspace', 'Metrics'],
    register: ['Workspace', 'Protect Asset'],
    check: ['Workspace', 'Scan URL'],
    video: ['Workspace', 'Scan Video'],
    verify: ['Workspace', 'Verify Frame'],
    guide: ['Help', 'FAQ'],
    archive: ['Archive', 'All Assets'],
    detections: ['Archive', 'History'],
  };
  const [sec, name] = titles[page] || ['', ''];
  const [showMenu, setShowMenu] = useState(false);

  const isGuest = user?.isAnonymous;
  const displayName = isGuest ? 'Guest Mode' : user?.displayName || 'User';
  const secondaryLabel = isGuest ? 'Anonymous session' : user?.email || '';
  const initials = isGuest
    ? 'G'
    : user
      ? (user.displayName || user.email || 'U')
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'U';

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="hamburger" onClick={onMenuToggle} aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="crumbs">
          {sec} <span style={{ margin: '0 8px', opacity: 0.4 }}>/</span> <strong>{name}</strong>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="search topbar-search">
          {Icon.search}
          <input
            id="global-search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search assets, hashes, detections..."
          />
          {search ? (
            <button
              className="kbd"
              onClick={() => onSearch('')}
              title="Clear search"
              style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
            >
              ✕
            </button>
          ) : (
            <span className="kbd">⌘K</span>
          )}
        </div>
        <button className="btn primary topbar-newcheck" onClick={() => onNav('check')}>
          {Icon.bolt}New check
        </button>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu((v) => !v)}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: '2px solid var(--border)',
              background: user?.photoURL ? 'transparent' : isGuest ? '#7B8497' : '#16A34A',
              cursor: 'pointer',
              overflow: 'hidden',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            title={isGuest ? 'Guest Mode' : user?.displayName || user?.email || ''}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'Inter,sans-serif' }}>{initials}</span>
            )}
          </button>

          {showMenu && (
            <div
              style={{
                position: 'absolute',
                top: 40,
                right: 0,
                zIndex: 999,
                background: '#fff',
                borderRadius: 10,
                boxShadow: '0 8px 30px rgba(11,18,32,0.14), 0 0 0 1px rgba(11,18,32,0.07)',
                minWidth: 200,
                padding: '8px 0',
              }}
              onMouseLeave={() => setShowMenu(false)}
            >
              <div style={{ padding: '8px 14px 10px', borderBottom: '1px solid #ECEEF2' }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#0B1220',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {displayName}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#7B8497',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginTop: 2,
                  }}
                >
                  {secondaryLabel}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onSignOut && onSignOut();
                }}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: '#FF4D2E',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FFF5F3';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
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
