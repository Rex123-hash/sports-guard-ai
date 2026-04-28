// Firebase initialisation — exposes window.SG_AUTH
// Firebase client config is intentionally public; security is enforced via Firebase Security Rules.
(function () {
  const firebaseConfig = {
    apiKey:            "AIzaSyCeXbXsUB6hjjO0C9X3VQVGO5oCCzbs0Fc",
    authDomain:        "sports-guard-ai.firebaseapp.com",
    projectId:         "sports-guard-ai",
    storageBucket:     "sports-guard-ai.firebasestorage.app",
    messagingSenderId: "712383807173",
    appId:             "1:712383807173:web:f0dfa99c28427da7be7aac",
    measurementId:     "G-HCB4CZV09Q",
  };

  firebase.initializeApp(firebaseConfig);

  const auth     = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  window.SG_AUTH = {
    signInWithGoogle:   () => auth.signInWithPopup(provider),
    signOut:            () => auth.signOut(),
    onAuthStateChanged: (cb) => auth.onAuthStateChanged(cb),
    currentUser:        () => auth.currentUser,
  };
  console.log('[SG] Firebase Auth ready, window.SG_AUTH set ✓');
})();
