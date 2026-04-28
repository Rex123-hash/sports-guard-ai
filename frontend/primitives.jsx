// Shared primitives
const { useState, useEffect, useRef } = React;

function Counter({ to, duration = 1100, suffix = '', prefix = '', decimals = 0 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf, start;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(to * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <span>{prefix}{decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString()}{suffix}</span>;
}

function Sparkline({ values = [3,5,4,7,6,9,8,11,10,13,12,15], w = 64, h = 24, color = 'var(--pine)' }) {
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="stat-spark">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function ConfBar({ value }) {
  const color = value >= 85 ? 'var(--coral)' : value >= 70 ? 'var(--butter)' : value >= 30 ? 'var(--ink-mute)' : 'var(--moss)';
  return (
    <div className="conf-row">
      <div className="conf-track">
        <div className="conf-fill" style={{ width: `${value}%`, background: color }}/>
      </div>
      <span className="conf-num">{value}</span>
    </div>
  );
}

// Beautiful gradient placeholder with photographic feel
function Placeholder({ tone = 'pine', label = 'CRICKET', frame = 'F-00:00:00', live = false }) {
  // tones: pine | coral | cream | grid | dots | stripes
  const toneClasses = {
    pine: 'ph ph-pine ph-stripes',
    coral: 'ph ph-coral ph-dots',
    cream: 'ph ph-cream ph-dots',
    grid: 'ph ph-grid',
    dots: 'ph ph-dots',
    stripes: 'ph ph-stripes',
  };
  const cls = toneClasses[tone] || toneClasses.pine;
  return (
    <div className={cls}>
      <span className="ph-corner tl"/><span className="ph-corner tr"/>
      <span className="ph-corner bl"/><span className="ph-corner br"/>
      <span className="ph-cap">{label} · {frame}</span>
      {live && <span className="ph-rec">REC</span>}
    </div>
  );
}

// Confidence dial — beautiful animated SVG
function ConfDial({ value = 0, type = 'piracy', size = 180 }) {
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(value), 100); return () => clearTimeout(t); }, [value]);
  const r = size * 0.4, cx = size/2, cy = size/2;
  const c = 2 * Math.PI * r;
  const off = c - (v / 100) * c;
  const colors = {
    piracy: { ring: 'var(--coral)',  track: 'rgba(255,107,71,0.15)' },
    review: { ring: 'var(--butter)', track: 'rgba(245,201,91,0.2)' },
    clean:  { ring: 'var(--moss)',   track: 'rgba(91,166,119,0.18)' },
  };
  const col = colors[type] || colors.piracy;
  const fontSize = size * 0.28;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={col.track} strokeWidth={size * 0.06}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={col.ring} strokeWidth={size * 0.06}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.2, 0.7, 0.1, 1)' }}/>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
        fontFamily: 'Fraunces, serif', fontVariationSettings: "'opsz' 144, 'SOFT' 50",
        fontSize, lineHeight: 1, fontWeight: 400, letterSpacing: '-0.03em', color: 'currentColor'
      }}>
        {Math.round(v)}<span style={{ fontSize: fontSize * 0.45, opacity: 0.7 }}>%</span>
      </div>
    </div>
  );
}

const Icon = {
  shield: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>,
  upload: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4"/><path d="M6 10l6-6 6 6"/><rect x="3" y="18" width="18" height="3" rx="1"/></svg>,
  link:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 1 0-5.66-5.66l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 1 0 5.66 5.66l1.5-1.5"/></svg>,
  grid:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  scan:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
  arrow:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg>,
  close:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>,
  check:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>,
  bolt:   <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>,
  home:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z"/></svg>,
  fingerprint: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 11a6 6 0 0 1 12 0v3a4 4 0 0 0 .5 2"/><path d="M9 11a3 3 0 0 1 6 0v4a3 3 0 0 0 .5 1.6"/><path d="M12 11v5a2 2 0 0 0 .3 1.1"/><path d="M5 14a8 8 0 0 0 1 4"/><path d="M19 21a10 10 0 0 0 1-7"/></svg>,
};

Object.assign(window, { Counter, Sparkline, ConfBar, Placeholder, ConfDial, Icon });
