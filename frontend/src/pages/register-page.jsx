import { useState } from 'react';
import { Icon, Placeholder } from '../components/primitives.jsx';
import { SG_API } from '../services/api.js';
import { SPORTS, RIGHTS_HOLDERS } from '../data/sample-data.js';

export default function Register({ onRegistered, onNav, assetCount = 0 }) {
  const [step, setStep] = useState('idle');
  const [drag, setDrag] = useState(false);
  const [hash, setHash] = useState('');
  const [progress, setProgress] = useState(0);
  const [meta, setMeta] = useState({
    owner: 'BCCI Media Group',
    title: 'India v Pakistan · Asia Cup Semi',
    sport: 'cricket',
    license: 'broadcast-only',
    notes: 'Mid-pitch celebration · 47th over · MCG broadcast feed',
  });
  const [file, setFile] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);

  function pickFile(f) {
    if (!f) return;
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    setFile(f);
    setImgUrl(URL.createObjectURL(f));
    setStep('metadata');
  }
  function handleDrop(e) {
    e.preventDefault(); setDrag(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) pickFile(e.dataTransfer.files[0]);
  }
  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) pickFile(e.target.files[0]);
  }

  async function commit() {
    if (!file) return;
    setStep('hashing');
    try {
      const result = await SG_API.register(file, meta);
      setHash(result.phash || result.assetId);
      setStep('done');
      onRegistered && onRegistered(result.asset || { ...meta, phash: result.phash || result.assetId });
    } catch (err) {
      console.error(err);
      alert('Registration failed: ' + err.message);
      setStep('metadata');
    }
  }
  function reset() { if (imgUrl) URL.revokeObjectURL(imgUrl); setStep('idle'); setHash(''); setFile(null); setImgUrl(null); setProgress(0); }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow fade-up">Step 02 · Register</span>
          <h1 className="page-title fade-up delay-1">Print a <em>fingerprint.</em></h1>
          <div className="page-sub fade-up delay-2">Upload one frame from your broadcast feed. We compute a perceptual hash that survives cropping, filtering, and recompression — and stake your claim to it permanently.</div>
        </div>
        <div className="mono fade-up delay-2" style={{ fontSize: 11, color: 'var(--ink-mute)', textAlign: 'right', letterSpacing: '0.08em' }}>
          REGISTRY · {assetCount} ASSETS<br/>BUCKET · sportsguard-assets
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div className="fade-up delay-2">
          <div className="eyebrow mb-3">Source frame</div>
          {step === 'idle' && (
            <div className={`dropzone ${drag ? 'active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileUpload').click()}
              style={{ minHeight: 420 }}>
              <input type="file" id="fileUpload" style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
              <div className="upload-glyph">{Icon.upload}</div>
              <div className="serif" style={{ fontSize: 32, lineHeight: 1.1, fontWeight: 400 }}>Drop a frame here</div>
              <div className="mono mt-3" style={{ fontSize: 12, color: 'var(--ink-mute)', letterSpacing: '0.06em' }}>JPG · PNG · WebP · up to 25 MB · or click to browse</div>
              <div className="mt-6" style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                <span className="tag">pHash 64-bit</span>
                <span className="tag">Vision safety</span>
                <span className="tag">Chain of custody</span>
              </div>
            </div>
          )}

          {step !== 'idle' && (
            <div className="frame">
              <div className="frame-img" style={{ aspectRatio: '4/3', position: 'relative' }}>
                {imgUrl
                  ? <img src={imgUrl} alt="frame to register" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Placeholder tone="pine" label="FRAME" frame="—" live={step !== 'done'}/>}
                {step === 'done' && <span className="frame-tag tag solid-moss">{Icon.check} REGISTERED</span>}
                {step === 'uploading' && (
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, background: 'rgba(0,0,0,0.25)', zIndex: 5 }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: 'var(--butter)', transition: 'width 0.1s linear' }}/>
                  </div>
                )}
              </div>
              <div className="frame-cap">
                <span>{file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB` : 'asset.jpg'}</span>
                <span>{step === 'uploading' ? 'UPLOADING' : step === 'hashing' ? 'HASHING…' : 'READY'}</span>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="mt-6 fade-up">
              <div className="eyebrow mb-2">Perceptual fingerprint</div>
              <div className="hash-block">
                <div className="hash-label mb-2">dHash:64 · cropping-resilient</div>
                {hash}
              </div>
              <div className="mono mt-3" style={{ fontSize: 10.5, color: 'var(--ink-mute)' }}>
                stored in protected_assets/{hash.slice(0, 6)}… · indexed for hamming-search
              </div>
            </div>
          )}
        </div>

        <div className="fade-up delay-3">
          <div className="eyebrow mb-3">Provenance</div>
          <div className="card">
            <div className="card-pad-lg" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="grid grid-2 gap-4">
                <div className="field">
                  <label className="field-label">Rights holder</label>
                  <select className="select" value={meta.owner} onChange={e => setMeta({ ...meta, owner: e.target.value })}>
                    {RIGHTS_HOLDERS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Sport</label>
                  <select className="select" value={meta.sport} onChange={e => setMeta({ ...meta, sport: e.target.value })}>
                    {SPORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <label className="field-label">Title · descriptive</label>
                <input className="input" value={meta.title} onChange={e => setMeta({ ...meta, title: e.target.value })}/>
              </div>
              <div className="field">
                <label className="field-label">License</label>
                <select className="select" value={meta.license} onChange={e => setMeta({ ...meta, license: e.target.value })}>
                  <option value="broadcast-only">Broadcast only</option>
                  <option value="press-pool">Press pool</option>
                  <option value="editorial">Editorial</option>
                  <option value="archival">Archival</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">Notes</label>
                <textarea className="input" rows="2" value={meta.notes} onChange={e => setMeta({ ...meta, notes: e.target.value })}/>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--line)', padding: '14px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)' }}>Filed under: {meta.owner.toLowerCase().replace(/\s+/g, '-')}/{meta.sport}/</span>
              {step === 'idle' && <button className="btn" disabled style={{ opacity: 0.5 }}>Awaiting frame</button>}
              {step === 'uploading' && <button className="btn" disabled><span className="pipe-spinner" style={{ borderColor: 'var(--ink-mute)', borderTopColor: 'transparent' }}/>Uploading</button>}
              {step === 'metadata' && <button className="btn coral lg" onClick={commit}>Print fingerprint {Icon.arrow}</button>}
              {step === 'hashing' && <button className="btn" disabled><span className="pipe-spinner"/> Hashing & filing</button>}
              {step === 'done' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn ghost" onClick={reset}>Register another</button>
                  <span className="tag moss">{Icon.check} REGISTERED</span>
                </div>
              )}
            </div>
          </div>

          {step === 'done' && (
            <div className="mt-6 fade-up">
              <div className="card" style={{ background: 'linear-gradient(135deg, var(--moss) 0%, #4A8E63 100%)', color: '#fff', borderColor: '#4A8E63' }}>
                <div className="card-pad-lg" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <div>
                    <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.85)' }}>Asset filed · 0.94s</div>
                    <div className="serif" style={{ fontSize: 26, lineHeight: 1.1, marginTop: 6, fontWeight: 400 }}>Your frame is now under watch.</div>
                    <div className="mono mt-2" style={{ fontSize: 11, opacity: 0.85 }}>Continuously matched against any URL submitted to SportsGuard</div>
                  </div>
                  <button className="btn" style={{ background: '#fff', color: 'var(--moss)', borderColor: '#fff' }} onClick={() => onNav && onNav('check')}>
                    Run check {Icon.arrow}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="attribution">
        <span>SportsGuard · Register</span>
        <span>fingerprint = dHash 64 · Vision safety · Gemini description</span>
      </div>
    </div>
  );
}
