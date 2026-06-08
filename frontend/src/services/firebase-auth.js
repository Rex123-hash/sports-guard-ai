import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously as fbSignInAnonymously,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const GUEST_SESSION_KEY = 'sportsguard_guest_session';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const subscribers = new Set();
let firebaseObserverReady = false;
let lastFirebaseUser = auth.currentUser;

function hasWindow() {
  return typeof window !== 'undefined';
}

function buildGuestUser() {
  if (!hasWindow()) return null;
  const raw = window.localStorage.getItem(GUEST_SESSION_KEY);
  if (!raw) return null;

  return {
    uid: 'guest-session',
    isAnonymous: true,
    displayName: 'Guest Mode',
    email: '',
  };
}

function clearGuestSession() {
  if (hasWindow()) {
    window.localStorage.removeItem(GUEST_SESSION_KEY);
  }
}

function setGuestSession() {
  if (hasWindow()) {
    window.localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify({ createdAt: Date.now() }));
  }
}

function effectiveUser(firebaseUser) {
  return firebaseUser || buildGuestUser();
}

function notifySubscribers(firebaseUser = lastFirebaseUser) {
  const user = effectiveUser(firebaseUser);
  subscribers.forEach(callback => callback(user));
}

function ensureFirebaseObserver() {
  if (firebaseObserverReady) return;

  firebaseObserverReady = true;
  fbOnAuthStateChanged(auth, firebaseUser => {
    lastFirebaseUser = firebaseUser;
    if (firebaseUser) {
      clearGuestSession();
    }
    notifySubscribers(firebaseUser);
  });
}

export async function signInWithGoogle() {
  clearGuestSession();
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
}

export async function signInAsGuest() {
  try {
    const credential = await fbSignInAnonymously(auth);
    clearGuestSession();
    return credential.user;
  } catch (error) {
    if (error?.code === 'auth/admin-restricted-operation' || error?.code === 'auth/operation-not-allowed') {
      setGuestSession();
      notifySubscribers(null);
      return buildGuestUser();
    }
    throw error;
  }
}

export async function signOut() {
  clearGuestSession();
  if (auth.currentUser) {
    await fbSignOut(auth);
  }
  lastFirebaseUser = null;
  notifySubscribers(null);
}

export async function getIdToken() {
  if (auth.currentUser) {
    try {
      return await auth.currentUser.getIdToken();
    } catch {
      return null;
    }
  }
  return null;
}

export function onAuthStateChanged(callback) {
  ensureFirebaseObserver();
  subscribers.add(callback);
  callback(effectiveUser(lastFirebaseUser));

  return () => {
    subscribers.delete(callback);
  };
}

export { auth };
