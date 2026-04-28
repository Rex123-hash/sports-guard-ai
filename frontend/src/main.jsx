import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import { SAMPLE_ASSETS } from './data/sample-data.js';
import { SG_API } from './services/api.js';
import { onAuthStateChanged, signOut } from './services/firebase-auth.js';

import { Sidebar, Topbar } from './components/shell.jsx';
import LoginPage from './components/login-page.jsx';

import Landing from './pages/landing-page.jsx';
import Dashboard from './pages/dashboard-page.jsx';
import Guide from './pages/guide-page.jsx';
import Register from './pages/register-page.jsx';
import CheckURL from './pages/check-page.jsx';
import Verify from './pages/verify-page.jsx';
import { Archive, DetectionLog, Drawer } from './pages/archive-page.jsx';

import './styles/global.css';

function App({ user }) {
  const [page, setPage] = useState('landing');
  const [now, setNow] = useState(new Date());
  const [assets, setAssets] = useState(SAMPLE_ASSETS);
  const [detections, setDetections] = useState([]);
  const [drawerDet, setDrawerDet] = useState(null);
  const [stats, setStats] = useState({ detections: 0 });

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    async function fetchDetections() {
      try {
        const data = await SG_API.detections();
        setDetections(data.detections || []);
        if (data.stats) setStats(data.stats);
      } catch (err) {
        console.error('Failed to fetch detections:', err);
      }
    }
    fetchDetections();
    const poll = setInterval(fetchDetections, 10000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const map = { h: 'landing', d: 'dashboard', r: 'register', c: 'check', v: 'verify', g: 'guide' };
      const k = e.key.toLowerCase();
      if (map[k]) setPage(map[k]);
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

  return (
    <div className="app">
      <Sidebar page={page} onNav={setPage} totals={stats}/>
      <main className="main">
        <Topbar now={now} onNav={setPage} page={page} user={user} onSignOut={handleSignOut}/>
        {page === 'landing'    && <Landing onNav={setPage}/>}
        {page === 'dashboard'  && <Dashboard assets={assets} detections={detections} onOpenDetection={setDrawerDet} onNav={setPage}/>}
        {page === 'guide'      && <Guide onNav={setPage}/>}
        {page === 'register'   && <Register onNav={setPage} onRegistered={(a) => setAssets(prev => [{ id: `n-${Date.now()}`, ...a, registered: new Date().toISOString(), frame: 'F-NEW' }, ...prev])}/>}
        {page === 'check'      && <CheckURL assets={assets} onDetection={handleDetection}/>}
        {page === 'verify'     && <Verify/>}
        {page === 'archive'    && <Archive assets={assets} onNav={setPage}/>}
        {page === 'detections' && <DetectionLog detections={detections} assets={assets} onOpen={setDrawerDet}/>}
        <Drawer detection={drawerDet} assets={assets} onClose={() => setDrawerDet(null)}/>
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
