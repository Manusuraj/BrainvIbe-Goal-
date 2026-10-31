import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfigRaw from '../../firebase-applet-config.json';

// Prefer the VITE_FIREBASE_* values from .env (your own Firebase project); fall back to
// firebase-applet-config.json only when they aren't set, so the two projects never get mixed.
const env = (import.meta as any).env || {};
const useEnvConfig = Boolean(env.VITE_FIREBASE_PROJECT_ID);

const firebaseConfig = useEnvConfig
  ? {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    }
  : {
      apiKey: firebaseConfigRaw.apiKey,
      authDomain: firebaseConfigRaw.authDomain,
      projectId: firebaseConfigRaw.projectId,
      storageBucket: firebaseConfigRaw.storageBucket,
      messagingSenderId: firebaseConfigRaw.messagingSenderId,
      appId: firebaseConfigRaw.appId,
    };

// Empty / "(default)" means the project's default Firestore database
const firestoreDatabaseId: string = useEnvConfig
  ? env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || ''
  : firebaseConfigRaw.firestoreDatabaseId;

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with specific database ID if specified
export const db =
  firestoreDatabaseId && firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firestoreDatabaseId)
    : getFirestore(app);

// Test Firestore connection on boot as specified in the Firebase skill
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
    return false;
  }
}

export {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
};

export type { FirebaseUser };
export default app;
