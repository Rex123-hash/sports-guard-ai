const { useState: useStateApp, useEffect: useEffectApp } = React;

function App() {
  const [page, setPage] = useStateApp('landing');
  const [now, setNow] = useStateApp(new Date());
  const [assets, setAssets] = useStateApp(window.SG_DATA.SAMPLE_ASSETS);
  const [detections, setDetections] = useStateApp([]);
  const [drawerDet, setDrawerDet] = useStateApp(null);
  const [stats, setStats] = useStateApp({ detections: 0 });

  useEffectApp(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffectApp(() => {
    async function fetchDetections() {
      try {
        const data = await window.SG_API.detections();
        setDetections(data.detections || []);
        if (data.stats) setStats(data.stats);
      } catch (err) {
        console.error("Failed to fetch detections:", err);
      }
    }
    fetchDetections();
    const poll = setInterval(fetchDetections, 10000);
    return () => clearInterval(poll);
  }, []);

  useEffectApp(() => {
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
      assetId: v.asset?.id, url: v.url,
      confidence: v.confidence, phashSim: v.phashSim,
      geminiVerdict: v.geminiVerdict, type: v.type,
      detected: 'just now', mod: v.mod, isNew: true,
    };
    setDetections(prev => [det, ...prev]);
  }

  return (
    <div className="app">
      <Sidebar page={page} onNav={setPage} totals={stats}/>
      <main className="main">
        <Topbar now={now} onNav={setPage} page={page}/>
        {page === 'landing'    && <Landing onNav={setPage} />}
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

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
