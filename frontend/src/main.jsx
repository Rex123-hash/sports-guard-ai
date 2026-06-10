import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

import { SG_API } from './services/api.js';
import { onAuthStateChanged, signOut } from './services/firebase-auth.js';

import { Sidebar, Topbar } from './components/shell.jsx';
import LoginPage from './components/login-page.jsx';

import Landing from './pages/landing-page.jsx';
import Dashboard from './pages/dashboard-page.jsx';
import Guide from './pages/guide-page.jsx';
import Register from './pages/register-page.jsx';
import CheckURL from './pages/check-page.jsx';
import VideoCheck from './pages/video-check-page.jsx';
import Verify from './pages/verify-page.jsx';
import { Archive, DetectionLog, Drawer } from './pages/archive-page.jsx';

import './styles/global.css';

function App({ user }) {
  const [page, setPage] = useState('landing');
  const [now, setNow] = useState(new Date());
  const [assets, setAssets] = useState([]);
  const [detections, setDetections] = useState([]);
  const [drawerDet, setDrawerDet] = useState(null);
  const [stats, setStats] = useState({ totalAssets: 0, totalDetections: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const reviewedRef = useRef(new Set()); // detection ids marked reviewed this session

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    async function fetchOperations() {
      try {
        const [assetsData, detectionsData] = await Promise.all([
          SG_API.assets(),
          SG_API.detections(),
        ]);

        setAssets(Array.isArray(assetsData.assets) ? assetsData.assets : []);
        setDetections((detectionsData.detections || []).map(d => reviewedRef.current.has(d.id) ? { ...d, reviewed: true } : d));
        if (detectionsData.stats) setStats(detectionsData.stats);
      } catch (err) {
        console.error('Failed to fetch operations data:', err);
      }
    }
    fetchOperations();
    const poll = setInterval(fetchOperations, 10000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    function onKey(e) {
      // Cmd/Ctrl+K focuses the global search from anywhere.
      if ((e.metaKey || e.ctrlKey) && e.code === 'KeyK') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
        return;
      }
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      let nextPage = null;
      switch (e.code) {
        case 'KeyH':
          nextPage = 'landing';
          break;
        case 'KeyD':
          nextPage = 'dashboard';
          break;
        case 'KeyP':
          nextPage = 'register';
          break;
        case 'KeyS':
          nextPage = 'check';
          break;
        case 'KeyC':
          nextPage = 'video';
          break;
        case 'KeyV':
          nextPage = 'verify';
          break;
        case 'Slash':
          if (e.shiftKey) nextPage = 'guide';
          break;
        default:
          break;
      }

      if (nextPage) {
        e.preventDefault();
        setPage(nextPage);
        setSidebarOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function handleDetection(v) {
    const det = {
      id: `chk-${Date.now()}`,
      assetId: v.asset?.id,
      url: v.url,
      confidence: v.confidence,
      phashSim: v.phashSim,
      geminiVerdict: v.geminiVerdict,
      type: v.type,
      detected: 'just now',
      mod: v.mod,
      isNew: true,
    };
    setDetections(prev => [det, ...prev]);
  }

  function handleSignOut() {
    signOut().catch(err => console.error('Sign-out failed:', err));
  }

  function handleSearch(value) {
    setSearch(value);
    // Typing from a non-list page jumps to History so results are visible.
    if (value && (page === 'landing' || page === 'guide')) setPage('detections');
  }

  function handleReview(det) {
    if (det?.id) reviewedRef.current.add(det.id);
    setDetections(prev => prev.map(x => (x.id === det.id ? { ...x, reviewed: true } : x)));
    setDrawerDet(null);
  }

  return (
    <div className="app">
      <Sidebar page={page} onNav={setPage} totals={stats} detections={detections} open={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
      <main className="main">
        <Topbar now={now} onNav={setPage} page={page} user={user} onSignOut={handleSignOut} onMenuToggle={() => setSidebarOpen(v => !v)} search={search} onSearch={handleSearch}/>
        {page === 'landing'    && <Landing onNav={setPage}/>}
        {page === 'dashboard'  && <Dashboard assets={assets} detections={detections} stats={stats} search={search} onOpenDetection={setDrawerDet} onNav={setPage}/>}
        {page === 'guide'      && <Guide onNav={setPage}/>}
        {page === 'register'   && <Register onNav={setPage} assetCount={Math.max(assets.length, stats?.totalAssets || 0)} onRegistered={(asset) => {
          setAssets(prev => {
            const exists = prev.some(existing => existing.id === asset.id);
            setStats(current => ({
              ...current,
              totalAssets: exists ? (current.totalAssets || prev.length) : Math.max((current.totalAssets || 0) + 1, prev.length + 1),
            }));
            return [asset, ...prev.filter(existing => existing.id !== asset.id)];
          });
        }}/>}
        {page === 'check'      && <CheckURL assets={assets} onDetection={handleDetection}/>}
        {page === 'video'      && <VideoCheck assets={assets} onDetection={handleDetection}/>}
        {page === 'verify'     && <Verify/>}
        {page === 'archive'    && <Archive assets={assets} search={search} onNav={setPage}/>}
        {page === 'detections' && <DetectionLog detections={detections} assets={assets} search={search} onOpen={setDrawerDet}/>}
        <Drawer detection={drawerDet} assets={assets} onClose={() => setDrawerDet(null)} onReview={handleReview}/>
      </main>
    </div>
  );
}

function Root() {
  const [user, setUser] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F5F7' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, background: '#0B1220', borderRadius: 12, display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 80 90" fill="none">
              <path d="M40 4L74 18V54C74 72 40 86 40 86C40 86 6 72 6 54V18L40 4Z" stroke="white" strokeWidth="3"/>
              <path d="M28 44l8 8 16-16" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontSize: 13, color: '#7B8497', fontFamily: 'JetBrains Mono,monospace', letterSpacing: '0.1em' }}>LOADING...</div>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage/>;
  return <App user={user}/>;
}

createRoot(document.getElementById('root')).render(<Root/>);
